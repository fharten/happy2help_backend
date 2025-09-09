import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { AppDataSource } from '../app';
import { RefreshToken } from '../models/tokenModel';
import { RevokedToken } from '../models/revokedTokenModel';
import { KeyManager } from '../utils/keyManager';

interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
  name?: string;
  entityType: 'user' | 'ngo';
  jti: string;
  kid: string;
  iat: number;
  exp: number;
}

export class TokenService {
  private static refreshTokenRepository: Repository<RefreshToken>;
  private static revokedTokenRepository: Repository<RevokedToken>;

  static async initialize() {
    this.refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
    this.revokedTokenRepository = AppDataSource.getRepository(RevokedToken);
  }

  // GENERATE RANDOM STRING
  private static generateSecureToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  // GENERATE JWT ID
  private static generateJTI(): string {
    return crypto.randomUUID();
  }

  // GET CURRENT JWT KEYS (for signing with RS256)
  private static async getJWTKeys() {
    const current = await KeyManager.getCurrentKeyPair();
    const previous = await KeyManager.getPreviousKeyPair();

    if (!current) {
      throw new Error('No JWT signing keys available');
    }

    return { current, previous };
  }

  // CREATE ACCESS TOKEN WITH ENHANCED SECURITY
  static async createAccessToken(
    payload: Omit<TokenPayload, 'jti' | 'kid' | 'iat' | 'exp'>
  ): Promise<string> {
    const jti = this.generateJTI();
    const now = Math.floor(Date.now() / 1000);
    const { current } = await this.getJWTKeys();

    const tokenPayload: TokenPayload = {
      ...payload,
      jti,
      kid: current.keyId,
      iat: now,
      exp: now + 15 * 60, // 15 minutes
    };

    return jwt.sign(tokenPayload, current.privateKey, {
      algorithm: 'RS256',
      issuer: process.env.JWT_ISSUER || 'happy2help',
      audience: process.env.JWT_AUDIENCE || 'happy2help-users',
      keyid: current.keyId,
    });
  }

  // CREATE REFRESH TOKEN
  static async createRefreshToken(
    userId: string,
    entityType: 'user' | 'ngo',
    userAgent?: string,
    ipAddress?: string,
    family?: string
  ): Promise<string> {
    const token = this.generateSecureToken();
    const tokenFamily = family || crypto.randomUUID();

    const refreshToken = this.refreshTokenRepository.create({
      token: await this.hashToken(token),
      userId,
      entityType,
      family: tokenFamily,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      userAgent,
      ipAddress,
    });

    await this.refreshTokenRepository.save(refreshToken);

    return `${token}:${refreshToken.id}`;
  }

  // HASH TOKEN FOR STORAGE
  private static async hashToken(token: string): Promise<string> {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // VERIFY ACCESS TOKEN WITH KEY ROTATION SUPPORT
  static async verifyAccessToken(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.decode(token, { complete: true }) as any;
      if (!decoded || !decoded.header.kid) {
        return null;
      }

      const { current, previous } = await this.getJWTKeys();
      let publicKey: string | null = null;

      // Find the correct public key
      if (current.keyId === decoded.header.kid) {
        publicKey = current.publicKey;
      } else if (previous && previous.keyId === decoded.header.kid) {
        publicKey = previous.publicKey;
      }

      if (!publicKey) {
        return null;
      }

      return jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
        issuer: process.env.JWT_ISSUER || 'happy2help',
        audience: process.env.JWT_AUDIENCE || 'happy2help-users',
      }) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  // CHECK IF TOKEN IS REVOKED
  static async isTokenRevoked(jti: string): Promise<boolean> {
    const revokedToken = await this.revokedTokenRepository.findOne({
      where: { jti },
    });

    return !!revokedToken;
  }

  // VERIFY AND ROTATE REFRESH TOKEN
  static async verifyAndRotateRefreshToken(
    refreshTokenString: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{
    success: boolean;
    accessToken?: string;
    refreshToken?: string;
    userData?: any;
  }> {
    const [token, tokenId] = refreshTokenString.split(':');

    if (!token || !tokenId) {
      return { success: false };
    }

    const hashedToken = await this.hashToken(token);

    const storedToken = await this.refreshTokenRepository.findOne({
      where: { id: tokenId, token: hashedToken },
    });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      // If token is compromised, revoke entire family
      if (storedToken) {
        await this.revokeTokenFamily(storedToken.family, 'Token reuse detected');
      }
      return { success: false };
    }

    // REVOKE CURRENT REFRESH TOKEN
    storedToken.isRevoked = true;
    storedToken.revokedAt = new Date();
    storedToken.revokedReason = 'Token rotated';
    await this.refreshTokenRepository.save(storedToken);

    // Get user data based on entity type
    let userData;
    if (storedToken.entityType === 'user') {
      const userRepository = AppDataSource.getRepository('User');
      userData = await userRepository.findOne({
        where: { id: storedToken.userId },
        select: ['id', 'loginEmail', 'role'],
      });
    } else {
      const ngoRepository = AppDataSource.getRepository('Ngo');
      userData = await ngoRepository.findOne({
        where: { id: storedToken.userId },
        select: ['id', 'loginEmail', 'name'],
      });
    }

    if (!userData) {
      return { success: false };
    }

    // CREATE NEW TOKENS
    const accessTokenPayload =
      storedToken.entityType === 'user'
        ? {
            userId: userData.id,
            email: userData.loginEmail,
            role: userData.role,
            entityType: 'user' as const,
          }
        : {
            userId: userData.id,
            email: userData.loginEmail,
            name: userData.name,
            entityType: 'ngo' as const,
          };

    const newAccessToken = await this.createAccessToken(accessTokenPayload);
    const newRefreshToken = await this.createRefreshToken(
      storedToken.userId,
      storedToken.entityType,
      userAgent,
      ipAddress,
      storedToken.family // Keep same family
    );

    return {
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      userData,
    };
  }

  // RECOKE TOKEN FAMILY (for security breaches)
  static async revokeTokenFamily(family: string, reason: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { family, isRevoked: false },
      {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason,
      }
    );
  }

  // REVOKE ACCESS TOKEN
  static async revokeAccessToken(
    jti: string,
    userId: string,
    entityType: 'user' | 'ngo',
    reason: string
  ): Promise<void> {
    const decoded = jwt.decode(jti) as any;

    const revokedToken = this.revokedTokenRepository.create({
      jti,
      userId,
      entityType,
      expiresAt: new Date(decoded.exp * 1000),
      revokedReason: reason,
    });

    await this.revokedTokenRepository.save(revokedToken);
  }

  // REVOKE ALL USER TOKENS (for ban/logout all)
  static async revokeAllUserTokens(
    userId: string,
    entityType: 'user' | 'ngo',
    reason: string
  ): Promise<void> {
    // Revoke all refresh tokens
    await this.refreshTokenRepository.update(
      { userId, entityType, isRevoked: false },
      {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason,
      }
    );

    // NOTE: Access tokens will expire naturally (15 min)
    // For immediate revocation, we need to maintain an active blacklist
  }

  // CLEAN UP EXPIRED TOKENS (run as scheduled job)
  static async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();

    // REMOVE EXPIRED REFRESH TOKENS
    await this.refreshTokenRepository.delete({
      expiresAt: LessThan(now),
    });

    // REMOVE EXPIRED REVOKE TOKENS
    await this.revokedTokenRepository.delete({
      expiresAt: LessThan(now),
    });
  }

  // GET USER'S ACTIVE SESSIONS
  static async getUserSessions(userId: string, entityType: 'user' | 'ngo') {
    return await this.refreshTokenRepository.find({
      where: {
        userId,
        entityType,
        isRevoked: false,
        expiresAt: MoreThan(new Date()),
      },
      select: ['id', 'createdAt', 'userAgent', 'ipAddress'],
      order: { createdAt: 'DESC' },
    });
  }

  // REVOKE SPECIFIC SESSIONS
  static async revokeSession(userId: string, sessionId: string, reason: string): Promise<boolean> {
    const result = await this.refreshTokenRepository.update(
      { id: sessionId, userId, isRevoked: false },
      {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason,
      }
    );

    return (result.affected ?? 0) > 0;
  }
}
