import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../services/jwtService';
import { AppDataSource } from '../app';
import { Project } from '../models/projectModel';
import { Application } from '../models/applicationModel';

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

export const requireOwnerOrRole = (allowedRoles: string[], entityType?: 'user' | 'ngo' | 'project' | 'application') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

    const resourceId = req.params.id;
    
    try {
      // If no entity type specified, assume direct ownership
      if (!entityType) {
        if (req.user.id === resourceId) {
          return next();
        }
        return res.status(403).json({
          success: false,
          message: 'Access denied - must be owner or have required role',
        });
      }

      // Handle different entity ownership scenarios
      switch (entityType) {
        case 'user':
          // Direct user ownership
          if (req.user.id === resourceId && req.user.entityType === 'user') {
            return next();
          }
          break;

        case 'ngo':
          // Direct NGO ownership
          if (req.user.id === resourceId && req.user.entityType === 'ngo') {
            return next();
          }
          break;

        case 'project':
          // Check if user owns the NGO that owns this project
          if (req.user.entityType === 'ngo') {
            const projectRepository = AppDataSource.getRepository(Project);
            const project = await projectRepository.findOne({
              where: { id: resourceId },
              relations: ['ngo']
            });
            
            if (project && project.ngo.id === req.user.id) {
              return next();
            }
          }
          break;

        case 'application':
          // Check if user owns the application OR if NGO owns the project the application is for
          const applicationRepository = AppDataSource.getRepository(Application);
          const application = await applicationRepository.findOne({
            where: { id: resourceId },
            relations: ['user', 'project', 'project.ngo']
          });
          
          if (application) {
            // User owns the application
            if (req.user.entityType === 'user' && application.user.id === req.user.id) {
              return next();
            }
            // NGO owns the project the application is for
            if (req.user.entityType === 'ngo' && application.project.ngo.id === req.user.id) {
              return next();
            }
          }
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid entity type specified',
          });
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied - must be owner or have required role',
      });

    } catch (error) {
      console.error('Error in requireOwnerOrRole middleware:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during authorization',
      });
    }
  };
};

export const requireOwnerByParam = (paramName: string, allowedRoles: string[] = []) => {
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

    // CHECK IF USER ID matches the specified parameter
    const paramValue = req.params[paramName];
    if (req.user.id === paramValue) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied - must be owner or have required role`,
    });
  };
};
