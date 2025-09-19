import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { AppDataSource } from '../app';
import { RefreshToken } from '../models/refreshTokenModel';
import { Repository, LessThan, MoreThanOrEqual } from 'typeorm';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  entityType: 'user' | 'ngo';
  jti: string;
  iat: number;
  exp: number;
}

export class JWTService {
  private static readonly ACCESS_TOKEN_EXPIRY = '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';
  private static readonly ALGORITHM = 'HS256';

  private static revokedTokens = new Set<string>();

  private static async getRefreshTokenRepository(): Promise<Repository<RefreshToken>> {
    return AppDataSource.getRepository(RefreshToken);
  }

  private static getSecretKey(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      throw new Error('JWT_SECRET must be set and at least 32 characters long');
    }
    return secret;
  }

  private static parseExpiryToMs(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1));

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        throw new Error(`Invalid expiry format: ${expiry}`);
    }
  }

  static generateKeyPair(): { privateKey: string; publicKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    return { privateKey, publicKey };
  }

  static generateAccessToken(payload: {
    id: string;
    email: string;
    role: string;
    entityType: 'user' | 'ngo';
  }): string {
    const jti = uuidv4();

    const tokenPayload: Omit<TokenPayload, 'iat' | 'exp'> = {
      ...payload,
      jti,
    };

    return jwt.sign(tokenPayload, this.getSecretKey(), {
      algorithm: this.ALGORITHM,
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
      issuer: 'happy2help-backend',
      audience: 'happy2help-client',
    });
  }

  static async generateRefreshToken(
    userId: string,
    entityType: 'user' | 'ngo',
    ipAddress?: string,
    userAgent?: string
  ): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const repository = await this.getRefreshTokenRepository();

    const refreshToken = repository.create({
      userId,
      entityType,
      token,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + this.parseExpiryToMs(this.REFRESH_TOKEN_EXPIRY)),
      isRevoked: false,
    });

    await repository.save(refreshToken);
    return token;
  }

  static verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.getSecretKey(), {
        algorithms: [this.ALGORITHM],
        issuer: 'happy2help-backend',
        audience: 'happy2help-client',
      }) as TokenPayload;

      if (this.revokedTokens.has(decoded.jti)) {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }

  static async verifyRefreshToken(token: string): Promise<RefreshToken | null> {
    const repository = await this.getRefreshTokenRepository();

    const refreshToken = await repository.findOne({
      where: { token },
    });

    if (!refreshToken) {
      return null;
    }

    if (!refreshToken.isActive()) {
      return null;
    }

    return refreshToken;
  }

  static async refreshAccessToken(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ accessToken: string; newRefreshToken: string } | null> {
    const tokenData = await this.verifyRefreshToken(refreshToken);

    if (!tokenData) {
      return null;
    }

    await this.revokeRefreshToken(refreshToken, 'Token rotation');

    const newAccessToken = this.generateAccessToken({
      id: tokenData.userId,
      email: '', // Will be filled by the calling service
      role: '', // Will be filled by the calling service
      entityType: tokenData.entityType,
    });

    const newRefreshToken = await this.generateRefreshToken(
      tokenData.userId,
      tokenData.entityType,
      ipAddress,
      userAgent
    );

    return {
      accessToken: newAccessToken,
      newRefreshToken,
    };
  }

  static revokeAccessToken(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as TokenPayload;
      if (decoded?.jti) {
        this.revokedTokens.add(decoded.jti);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  static async revokeRefreshToken(token: string, reason?: string): Promise<boolean> {
    const repository = await this.getRefreshTokenRepository();

    const refreshToken = await repository.findOne({
      where: { token },
    });

    if (!refreshToken) {
      return false;
    }

    refreshToken.isRevoked = true;
    refreshToken.revokedAt = new Date();
    refreshToken.revokedReason = reason || 'Manual revocation';

    await repository.save(refreshToken);
    return true;
  }

  static async revokeAllUserTokens(
    userId: string,
    entityType: 'user' | 'ngo',
    reason?: string
  ): Promise<number> {
    const repository = await this.getRefreshTokenRepository();

    const activeTokens = await repository.find({
      where: {
        userId,
        entityType,
        isRevoked: false,
      },
    });

    let revokedCount = 0;
    for (const token of activeTokens) {
      if (token.isActive()) {
        token.isRevoked = true;
        token.revokedAt = new Date();
        token.revokedReason = reason || 'Bulk revocation';
        await repository.save(token);
        revokedCount++;
      }
    }

    return revokedCount;
  }

  static async cleanupExpiredTokens(): Promise<number> {
    const repository = await this.getRefreshTokenRepository();
    const now = new Date();

    const expiredTokens = await repository.find({
      where: {
        expiresAt: LessThan(now),
      },
    });

    if (expiredTokens.length > 0) {
      await repository.remove(expiredTokens);
    }

    return expiredTokens.length;
  }

  static async getTokenStats(): Promise<{
    activeRefreshTokens: number;
    revokedRefreshTokens: number;
    expiredRefreshTokens: number;
    revokedAccessTokens: number;
  }> {
    const repository = await this.getRefreshTokenRepository();
    const now = new Date();

    const [activeRefresh, revokedRefresh, expiredRefresh] = await Promise.all([
      repository.count({
        where: {
          isRevoked: false,
          expiresAt: MoreThanOrEqual(now),
        },
      }),
      repository.count({
        where: {
          isRevoked: true,
        },
      }),
      repository.count({
        where: {
          expiresAt: LessThan(now),
        },
      }),
    ]);

    return {
      activeRefreshTokens: activeRefresh,
      revokedRefreshTokens: revokedRefresh,
      expiredRefreshTokens: expiredRefresh,
      revokedAccessTokens: this.revokedTokens.size,
    };
  }

  static rotateSecrets(): void {
    const currentTime = Date.now();
    const rotationKey = `rotation_${currentTime}`;

    console.warn(`JWT secret rotation initiated at ${new Date(currentTime).toISOString()}`);
    console.warn('This requires updating environment variables and restarting the application');
    console.warn(`Rotation key: ${rotationKey}`);
  }
}
