import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../app';
import { User } from '../models/userModel';
import { Ngo } from '../models/ngoModel';

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
    password: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: any;
<<<<<<< HEAD
=======
    role?: string;
>>>>>>> 5448d90 (Initial commit — cleaned repo)
    error?: string;
  }> {
    if (!email || !password) {
      return {
        success: false,
        message: 'Required fields missing: email, password',
      };
    }

    const repository = await repositoryGetter();
<<<<<<< HEAD
    const existingEntity = await repository.findOne({
      where: { loginEmail: email.toLowerCase() },
      select: ['id', 'loginEmail', 'password'],
    });
=======
    let existingEntity: User | Ngo | null = null;

    if (repository.target === User) {
      existingEntity = await (repository as Repository<User>).findOne({
        where: { loginEmail: email.toLowerCase() },
        select: ['id', 'loginEmail', 'password', 'role'],
      });
    } else {
      existingEntity = await (repository as Repository<Ngo>).findOne({
        where: { loginEmail: email.toLowerCase() },
        select: ['id', 'loginEmail', 'password'],
      });
    }
>>>>>>> 5448d90 (Initial commit — cleaned repo)

    if (!existingEntity) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }

    const isValidPassword = await existingEntity.comparePasswords(password);

    if (!isValidPassword) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }

    return {
      success: true,
      message: 'Login successful',
      data: existingEntity,
    };
  }
}
<<<<<<< HEAD
=======

export const jwtSecretCheck = {
  jwtSecret: (() => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return secret;
  })(),
};
>>>>>>> 5448d90 (Initial commit — cleaned repo)
