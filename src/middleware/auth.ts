import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/tokenService';
import { AuthenticatedUser, AuthenticatedNgo, AuthenticatedEntity } from '../types/auth';

interface AuthRequest extends Request {
  user?: AuthenticatedUser;
  ngo?: AuthenticatedNgo;
  entity?: AuthenticatedEntity;
}

// AUTH USERS
export const authenticateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = await TokenService.verifyAccessToken(token);

    if (!decoded) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // CHECK IF TOKEN IS REVOKED
    const isRevoked = await TokenService.isTokenRevoked(decoded.jti);
    if (isRevoked) {
      return res.status(403).json({ error: 'Token has been revoked' });
    }

    if (decoded.entityType !== 'user') {
      return res.status(403).json({ error: 'User or admin authentication required' });
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role || 'user',
      entityType: 'user',
    } as AuthenticatedUser;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// AUTH NGOS
export const authenticateNgo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = await TokenService.verifyAccessToken(token);

    if (!decoded) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // CHECK IF TOKEN IS REVOKED
    const isRevoked = await TokenService.isTokenRevoked(decoded.jti);
    if (isRevoked) {
      return res.status(403).json({ error: 'Token has been revoked' });
    }

    if (decoded.entityType !== 'ngo') {
      return res.status(403).json({ error: 'NGO authentication required' });
    }

    req.ngo = {
      ngoId: decoded.userId, // TokenService uses userId for both entities
      email: decoded.email,
      name: decoded.name || '',
      entityType: 'ngo',
    } as AuthenticatedNgo;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// GENERIC AUTH - ACCEPTS BOTH
export const authenticateAny = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = await TokenService.verifyAccessToken(token);

    if (!decoded) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // CHECK IF TOKEN IS REVOKED
    const isRevoked = await TokenService.isTokenRevoked(decoded.jti);
    if (isRevoked) {
      return res.status(403).json({ error: 'Token has been revoked' });
    }

    if (decoded.entityType === 'user') {
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role || 'user',
        entityType: 'user',
      } as AuthenticatedUser;
      req.entity = req.user;
    } else if (decoded.entityType === 'ngo') {
      req.ngo = {
        ngoId: decoded.userId, // TokenService uses userId for both entities
        email: decoded.email,
        name: decoded.name || '',
        entityType: 'ngo',
      } as AuthenticatedNgo;
      req.entity = req.ngo;
    } else {
      return res.status(403).json({ error: 'Invalid entity type' });
    }

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// REQUIRE ADMIN ACCESS
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

// REQUIRE USER ACCESS
export const requireUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User authentication required' });
  }

  // Both User and Admin roles are allowed
  if (req.user.role !== 'user' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'User access required' });
  }

  next();
};

// REQUIRE NGO ACCESS
export const requireNgo = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.ngo) {
    return res.status(401).json({ error: 'NGO authentication required' });
  }

  next();
};

// REQUIRE ADMIN OR NGO ACCESS
export const requireAdminOrNgo = (req: AuthRequest, res: Response, next: NextFunction) => {
  const hasAdminAccess = req.user && req.user.role === 'admin';
  const hasNgoAccess = req.ngo;

  if (!hasAdminAccess && !hasNgoAccess) {
    return res.status(403).json({ error: 'Admin or NGO access required' });
  }

  next();
};

// REQUIRE ADMIN OR NGO OR EXACT USER ID TO ACCESS
export const requireAdminOrNgoOrOwner = (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (req.user && req.user.role === 'admin') {
    return next();
  }

  if (req.ngo) {
    return next();
  }

  if (req.user && req.user.userId === id) {
    return next();
  }

  return res.status(403).json({
    error: 'Access denied. You can only access your own data unless you are an NGO or Admin',
  });
};

// REQUIRE ADMIN OR EXACT USER ID TO ACCESS
export const requireAdminOrOwner = (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (req.user && req.user.role === 'admin') {
    return next();
  }

  if (req.user && req.user.userId === id) {
    return next();
  }

  return res.status(403).json({
    error: 'Access denied. You can only access/modify your own data unless you are an Admin',
  });
};

// EXACT USER ID TO ACCESS
export const requireOwner = (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!req.user) {
    return res.status(401).json({ error: 'User authentication required' });
  }

  if (req.user.userId !== id) {
    return res.status(403).json({
      error: 'Access denied. You can only access your own data',
    });
  }

  next();
};
