import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
<<<<<<< HEAD
=======
import { TokenService } from '../services/tokenService';
import { BruteForceProtection } from '../middleware/rateLimiter';
import { AuthenticatedUser, AuthenticatedNgo } from '../types/auth';

interface AuthRequest extends Request {
  user?: AuthenticatedUser;
  ngo?: AuthenticatedNgo;
  entity?: AuthenticatedUser | AuthenticatedNgo;
}
>>>>>>> 5448d90 (Initial commit — cleaned repo)

export class AuthController {
  // CREATE USER LOGIN | POST /api/auth/user/register
  registerUser = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const result = await AuthService.registerEntity(
        () => AuthService.getUserRepository(),
        email,
        password,
<<<<<<< HEAD
        'User'
=======
        'user'
>>>>>>> 5448d90 (Initial commit — cleaned repo)
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

<<<<<<< HEAD
      // Create user with hashed password
=======
>>>>>>> 5448d90 (Initial commit — cleaned repo)
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

<<<<<<< HEAD
      // Validate required fields
=======
>>>>>>> 5448d90 (Initial commit — cleaned repo)
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

<<<<<<< HEAD
      // Create NGO with hashed password
=======
>>>>>>> 5448d90 (Initial commit — cleaned repo)
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

      const result = await AuthService.loginEntity(
        () => AuthService.getUserRepository(),
        email,
        password
      );

      if (!result.success) {
<<<<<<< HEAD
        return res.status(401).json(result);
      }

=======
        BruteForceProtection.recordFailure(req);
        return res.status(401).json(result);
      }

      const userData = {
        userId: result.data.id,
        email: result.data.loginEmail || email.toLowerCase(),
        role: result.data.role || 'user',
        entityType: 'user' as const,
      };

      const accessToken = await TokenService.createAccessToken(userData);
      const refreshToken = await TokenService.createRefreshToken(
        result.data.id,
        'user',
        req.get('User-Agent'),
        req.ip
      );

      BruteForceProtection.recordSuccess(req);

>>>>>>> 5448d90 (Initial commit — cleaned repo)
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
<<<<<<< HEAD
      });
    } catch (error) {
      console.error('Error logging in user:', error);
=======
        accessToken,
        refreshToken,
        user: {
          userId: userData.userId,
          email: userData.email,
          role: userData.role,
          entityType: userData.entityType,
        },
      });
    } catch (error) {
      console.error('Error logging in user:', error);
      BruteForceProtection.recordFailure(req);
>>>>>>> 5448d90 (Initial commit — cleaned repo)
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

      const result = await AuthService.loginEntity(
        () => AuthService.getNgoRepository(),
        email,
        password
      );

      if (!result.success) {
<<<<<<< HEAD
        return res.status(401).json(result);
      }

=======
        BruteForceProtection.recordFailure(req);
        return res.status(401).json(result);
      }

      const ngoData = {
        userId: result.data.id,
        email: result.data.loginEmail || email.toLowerCase(),
        name: result.data.name,
        entityType: 'ngo' as const,
      };

      const accessToken = await TokenService.createAccessToken(ngoData);
      const refreshToken = await TokenService.createRefreshToken(
        result.data.id,
        'ngo',
        req.get('User-Agent'),
        req.ip
      );

      BruteForceProtection.recordSuccess(req);

>>>>>>> 5448d90 (Initial commit — cleaned repo)
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
<<<<<<< HEAD
      });
    } catch (error) {
      console.error('Error logging in ngo:', error);
=======
        accessToken,
        refreshToken,
        ngo: {
          ngoId: result.data.id,
          email: result.data.loginEmail || email.toLowerCase(),
          name: result.data.name,
          principal: result.data.principal,
          entityType: 'ngo' as const,
        },
      });
    } catch (error) {
      console.error('Error logging in ngo:', error);
      BruteForceProtection.recordFailure(req);
>>>>>>> 5448d90 (Initial commit — cleaned repo)
      res.status(500).json({
        success: false,
        message: 'Failed to login ngo',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
<<<<<<< HEAD
=======

  // TOKEN REFRESH | POST /api/auth/refresh
  refreshToken = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
      }

      const result = await TokenService.verifyAndRotateRefreshToken(
        refreshToken,
        req.get('User-Agent'),
        req.ip
      );

      if (!result.success) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.userData,
      });
    } catch (error) {
      console.error('Error refreshing token:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to refresh token',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // LOGOUT (REVOKE CURRENT SESSION) | POST /api/auth/logout
  logout = async (req: AuthRequest, res: Response) => {
    try {
      const { refreshToken } = req.body;
      const entity = req.entity!;

      if (refreshToken) {
        const [token, tokenId] = refreshToken.split(':');
        if (tokenId) {
          const userId = entity.entityType === 'user' ? entity.userId : entity.ngoId;
          await TokenService.revokeSession(
            userId,
            tokenId,
            'User logout'
          );
        }
      }

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Error during logout:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to logout',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // LOGOUT ALL SESSIONS | POST /api/auth/logout-all
  logoutAll = async (req: AuthRequest, res: Response) => {
    try {
      const entity = req.entity!;
      const userId = entity.entityType === 'user' ? entity.userId : entity.ngoId;

      await TokenService.revokeAllUserTokens(
        userId,
        entity.entityType,
        'Logout all sessions'
      );

      res.status(200).json({
        success: true,
        message: 'All sessions logged out successfully',
      });
    } catch (error) {
      console.error('Error during logout all:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to logout all sessions',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // GET USER SESSIONS | GET /api/auth/sessions
  getSessions = async (req: AuthRequest, res: Response) => {
    try {
      const entity = req.entity!;
      const userId = entity.entityType === 'user' ? entity.userId : entity.ngoId;

      const sessions = await TokenService.getUserSessions(userId, entity.entityType);

      res.status(200).json({
        success: true,
        message: 'Sessions retrieved successfully',
        sessions: sessions.map(session => ({
          id: session.id,
          createdAt: session.createdAt,
          userAgent: session.userAgent,
          ipAddress: session.ipAddress,
        })),
      });
    } catch (error) {
      console.error('Error getting sessions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get sessions',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // REVOKE SPECIFIC SESSION | DELETE /api/auth/sessions/:sessionId
  revokeSession = async (req: AuthRequest, res: Response) => {
    try {
      const { sessionId } = req.params;
      const entity = req.entity!;
      const userId = entity.entityType === 'user' ? entity.userId : entity.ngoId;

      const success = await TokenService.revokeSession(
        userId,
        sessionId,
        'Session revoked by user'
      );

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Session not found or already revoked',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Session revoked successfully',
      });
    } catch (error) {
      console.error('Error revoking session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to revoke session',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
>>>>>>> 5448d90 (Initial commit — cleaned repo)
}
