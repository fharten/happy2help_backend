import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../app';
import { User } from '../models/userModel';
import { Ngo } from '../models/ngoModel';
import { JWTService } from './jwtService';

export class AuthService {
  static async getUserRepository(): Promise<Repository<User>> {
    return AppDataSource.getRepository(User);
  }
  static async getNgoRepository(): Promise<Repository<Ngo>> {
    return AppDataSource.getRepository(Ngo);
  }

  // VALIDATION
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): boolean {
    return password.length >= 10;
  }

  // HASHING
  static async hashPassword(password: string, saltRounds?: number): Promise<string> {
    const rounds = saltRounds || parseInt(process.env.SALT_ROUNDS || '10', 10);
    return await bcrypt.hash(password, rounds);
  }

  //REGISTER
  static async registerEntity(
    repositoryGetter: () => Promise<Repository<User | Ngo>>,
    email: string,
    password: string,
    entityType: string
  ): Promise<{
    success: boolean;
    message: string;
    error?: string;
    hashedPassword?: string;
  }> {
    if (!email || !password) {
      return {
        success: false,
        message: 'Required fields missing: email, password',
      };
    }

    if (!this.validateEmail(email)) {
      return {
        success: false,
        message: 'Please provide a valid email address',
      };
    }

    if (!this.validatePassword(password)) {
      return {
        success: false,
        message: 'Password must be at least 10 characters long',
      };
    }

    const repository = await repositoryGetter();
    const existingEntity = await repository.findOne({
      where: { loginEmail: email.toLowerCase() },
    });

    if (existingEntity) {
      return {
        success: false,
        message: `${entityType} with this email already exists`,
      };
    }

    const hashedPassword = await this.hashPassword(password);

    return {
      success: true,
      message: `${entityType} registered successfully`,
      hashedPassword,
    };
  }

  // LOGIN
  static async loginEntity(
    repositoryGetter: () => Promise<Repository<User | Ngo>>,
    email: string,
    password: string,
    entityType: 'user' | 'ngo',
    ipAddress?: string,
    userAgent?: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: any;
    error?: string;
  }> {
    if (!email || !password) {
      return {
        success: false,
        message: 'Required fields missing: email, password',
      };
    }

    if (entityType === 'user') {
      return this.loginUser(email, password, ipAddress, userAgent);
    } else {
      return this.loginNgo(email, password, ipAddress, userAgent);
    }
  }

  private static async loginUser(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: any;
    error?: string;
  }> {
    const repository = await this.getUserRepository();
    const user = await repository.findOne({
      where: { loginEmail: email.toLowerCase() },
      select: [
        'id',
        'loginEmail',
        'password',
        'role',
        'isDisabled',
        'firstName',
        'lastName',
        'image',
        'skills',
      ],
    });

    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }

    const isValidPassword = await user.comparePasswords(password);
    if (!isValidPassword) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }

    if (user.isDisabled) {
      return {
        success: false,
        message: 'Account is disabled',
      };
    }

    const accessToken = JWTService.generateAccessToken({
      id: user.id,
      email: user.loginEmail,
      role: user.role,
      entityType: 'user',
    });

    const refreshToken = await JWTService.generateRefreshToken(
      user.id,
      'user',
      ipAddress,
      userAgent
    );

    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as any).password;

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: '15m',
      },
    };
  }

  private static async loginNgo(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: any;
    error?: string;
  }> {
    const repository = await this.getNgoRepository();
    const ngo = await repository.findOne({
      where: { loginEmail: email.toLowerCase() },
      select: ['id', 'loginEmail', 'password', 'isDisabled', 'name', 'principal', 'image'],
    });

    if (!ngo) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }

    const isValidPassword = await ngo.comparePasswords(password);
    if (!isValidPassword) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }

    if (ngo.isDisabled) {
      return {
        success: false,
        message: 'Account is disabled',
      };
    }

    const accessToken = JWTService.generateAccessToken({
      id: ngo.id,
      email: ngo.loginEmail,
      role: 'ngo',
      entityType: 'ngo',
    });

    const refreshToken = await JWTService.generateRefreshToken(ngo.id, 'ngo', ipAddress, userAgent);

    const ngoWithoutPassword = { ...ngo };
    delete (ngoWithoutPassword as any).password;

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: ngoWithoutPassword,
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: '15m',
      },
    };
  }

  // LOGOUT
  static async logout(refreshToken: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const revoked = await JWTService.revokeRefreshToken(refreshToken, 'User logout');

    return {
      success: revoked,
      message: revoked ? 'Logged out successfully' : 'Invalid or expired refresh token',
    };
  }

  // REFRESH TOKEN
  static async refreshToken(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    const result = await JWTService.refreshAccessToken(refreshToken, ipAddress, userAgent);

    if (!result) {
      return {
        success: false,
        message: 'Invalid or expired refresh token',
      };
    }

    return {
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.newRefreshToken,
        tokenType: 'Bearer',
        expiresIn: '15m',
      },
    };
  }

  // BAN USER (Revoke all tokens)
  static async banUser(
    userId: string,
    entityType: 'user' | 'ngo'
  ): Promise<{
    success: boolean;
    message: string;
    revokedTokens: number;
  }> {
    if (entityType === 'user') {
      const repository = await this.getUserRepository();
      const user = await repository.findOne({ where: { id: userId } });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
          revokedTokens: 0,
        };
      }

      user.isDisabled = true;
      await repository.save(user);

      const revokedCount = await JWTService.revokeAllUserTokens(userId, entityType, 'User banned');

      return {
        success: true,
        message: 'User banned successfully',
        revokedTokens: revokedCount,
      };
    } else {
      const repository = await this.getNgoRepository();
      const ngo = await repository.findOne({ where: { id: userId } });

      if (!ngo) {
        return {
          success: false,
          message: 'NGO not found',
          revokedTokens: 0,
        };
      }

      ngo.isDisabled = true;
      await repository.save(ngo);

      const revokedCount = await JWTService.revokeAllUserTokens(userId, entityType, 'NGO banned');

      return {
        success: true,
        message: 'NGO banned successfully',
        revokedTokens: revokedCount,
      };
    }
  }
}
