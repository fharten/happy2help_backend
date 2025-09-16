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

      // CREATE USER
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
      const { name, email, password, principal } = req.body;

      // VALIDATE FIELDS
      if (!principal) {
        return res.status(400).json({
          success: false,
          message: 'Principal name is required',
        });
      }

      const result = await AuthService.registerEntity(
        () => AuthService.getNgoRepository(),
        email,
        password,
        'Ngo'
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      // CREATE NGO
      const ngoRepository = await AuthService.getNgoRepository();
      const ngo = ngoRepository.create({
        name: name,
        principal: principal,
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
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('User-Agent');

      const result = await AuthService.loginEntity(
        () => AuthService.getUserRepository(),
        email,
        password,
        'user',
        ipAddress,
        userAgent
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
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('User-Agent');

      const result = await AuthService.loginEntity(
        () => AuthService.getNgoRepository(),
        email,
        password,
        'ngo',
        ipAddress,
        userAgent
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

  // LOGOUT | POST /api/auth/logout
  logout = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
      }

      const result = await AuthService.logout(refreshToken);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error during logout:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to logout',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // REFRESH TOKEN | POST /api/auth/refresh
  refreshToken = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
      }

      const result = await AuthService.refreshToken(refreshToken, ipAddress, userAgent);

      if (!result.success) {
        return res.status(401).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error refreshing token:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to refresh token',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // BAN USER | POST /api/auth/ban
  banUser = async (req: Request, res: Response) => {
    try {
      const { userId, entityType } = req.body;

      if (!userId || !entityType) {
        return res.status(400).json({
          success: false,
          message: 'UserId and entityType are required',
        });
      }

      if (!['user', 'ngo'].includes(entityType)) {
        return res.status(400).json({
          success: false,
          message: 'EntityType must be either user or ngo',
        });
      }

      const result = await AuthService.banUser(userId, entityType);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error banning user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to ban user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
