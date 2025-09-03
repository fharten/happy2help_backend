import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
  // CREATE USER LOGIN | POST /api/auth/user/register
  registerUser = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const result = await AuthService.registerEntity(
        () => AuthService.getUserRepository(),
        email,
        password,
        'User'
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Create user with hashed password
      const userRepository = await AuthService.getUserRepository();
      const user = userRepository.create({
        loginEmail: email.toLowerCase(),
        password: result.hashedPassword,
      });

      await userRepository.save(user);

      res.status(201).json({
        success: true,
        message: result.message,
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

  // CREATE NGO LOGIN | POST /api/auth/ngo/register
  registerNgo = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const result = await AuthService.registerEntity(
        () => AuthService.getNgoRepository(),
        email,
        password,
        'Ngo'
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Create NGO with hashed password
      const ngoRepository = await AuthService.getNgoRepository();
      const ngo = ngoRepository.create({
        loginEmail: email.toLowerCase(),
        password: result.hashedPassword,
      });

      await ngoRepository.save(ngo);

      res.status(201).json({
        success: true,
        message: result.message,
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

  // LOGIN USER | POST /api/auth/user/login
  loginUser = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const result = await AuthService.loginUser(
        () => AuthService.getUserRepository(),
        email,
        password,
        'User'
      );

      if (!result.success) {
        return res.status(401).json(result);
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to login user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // LOGIN NGO | POST /api/auth/ngo/login
  loginNgo = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const result = await AuthService.loginUser(
        () => AuthService.getNgoRepository(),
        email,
        password,
        'Ngo'
      );

      if (!result.success) {
        return res.status(401).json(result);
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error('Error logging in ngo:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to login ngo',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
