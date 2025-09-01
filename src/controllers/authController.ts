import { Request, Response } from 'express';
import { AppDataSource } from '../app';
import { User } from '../models/userModel';
import { Ngo } from '../models/ngoModel';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';

config();

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);
  private ngoRepository = AppDataSource.getRepository(Ngo);

  // POST /api/auth/user/register
  registerUser = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Required fields missing: email, password',
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Please provide a valid email address',
        });
        return;
      }

      if (password.length < 10) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 10 characters long',
        });
        return;
      }

      const existingUser = await this.userRepository.findOne({
        where: { loginEmail: email.toLowerCase() },
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'User with this email already exists',
        });
        return;
      }

      const saltRounds = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS, 10) : 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = this.userRepository.create({
        loginEmail: email.toLowerCase(),
        password: hashedPassword,
      });

      await this.userRepository.save(user);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // POST /api/auth/ngo/register
  registerNgo = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Required fields missing: email, password',
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Please provide a valid email address',
        });
        return;
      }

      if (password.length < 10) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 10 characters long',
        });
        return;
      }

      const existingNgo = await this.ngoRepository.findOne({
        where: { loginEmail: email.toLowerCase() },
      });

      if (existingNgo) {
        res.status(409).json({
          success: false,
          message: 'Ngo with this email already exists',
        });
        return;
      }

      const saltRounds = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS, 10) : 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const ngo = this.ngoRepository.create({
        loginEmail: email.toLowerCase(),
        password: hashedPassword,
      });

      await this.ngoRepository.save(ngo);

      res.status(201).json({
        success: true,
        message: 'Ngo registered successfully',
        data: ngo,
      });
    } catch (error) {
      console.error('Error creating ngo:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create ngo',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // POST /api/auth/user/login
  loginUser = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Required fields missing: email, password',
        });
        return;
      }

      const existingUser = await this.userRepository.findOne({
        where: { loginEmail: email.toLowerCase() },
      });

      if (!existingUser) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      const isValidPassword = await bcrypt.compare(password, existingUser.password);

      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: existingUser,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // POST /api/auth/ngo/login
  loginNgo = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Required fields missing: email, password',
        });
        return;
      }

      const existingNgo = await this.ngoRepository.findOne({
        where: { loginEmail: email.toLowerCase() },
      });

      if (!existingNgo) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      const isValidPassword = await bcrypt.compare(password, existingNgo.password);

      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: existingNgo,
      });
    } catch (error) {
      console.error('Error creating ngo:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create ngo',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
