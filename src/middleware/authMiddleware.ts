import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../services/jwtService';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    entityType: 'user' | 'ngo';
    jti: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
    });
  }

  const decoded = JWTService.verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token',
    });
  }

  req.user = decoded;
  next();
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};

export const requireEntityType = (allowedTypes: Array<'user' | 'ngo'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowedTypes.includes(req.user.entityType)) {
      return res.status(403).json({
        success: false,
        message: `Access denied for ${req.user.entityType}s`,
      });
    }

    next();
  };
};

export const requireOwnerOrRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // CHECK IF USER IS ADMIN
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    // CHECK IF USER IS OWNER (their ID matches the route parameter)
    const resourceId = req.params.id;
    if (req.user.id === resourceId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied - must be owner or have required role',
    });
  };
};
