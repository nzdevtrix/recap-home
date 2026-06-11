import { Request, Response, NextFunction } from 'express';
import { verifyToken, getUserFromToken, JwtPayload } from '../utils/auth';
import { UserRole } from '@prisma/client';

// Extract token from request
export function extractToken(req: Request): string | null {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  
  // Check cookies
  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }
  
  // Check body (for some requests)
  if (req.body && req.body.accessToken) {
    return req.body.accessToken;
  }
  
  return null;
}

// Authentication middleware - verifies JWT token
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No authorization token provided'
      });
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid or has expired'
      });
    }
    
    // Attach user to request
    const user = await getUserFromToken(token);
    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'The user associated with this token no longer exists'
      });
    }
    
    if (!user.isActive) {
      return res.status(403).json({
        error: 'Account deactivated',
        message: 'Your account has been deactivated'
      });
    }
    
    // Attach user and payload to request
    (req as any).user = user;
    (req as any).tokenPayload = payload;
    
    next();
  } catch (error: any) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
}

// Role-based authorization middleware
export function authorize(requiredRoles: UserRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // First authenticate
      const token = extractToken(req);
      
      if (!token) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'No authorization token provided'
        });
      }
      
      const payload = verifyToken(token);
      if (!payload) {
        return res.status(401).json({
          error: 'Invalid token',
          message: 'The provided token is invalid or has expired'
        });
      }
      
      const user = await getUserFromToken(token);
      if (!user) {
        return res.status(401).json({
          error: 'User not found',
          message: 'The user associated with this token no longer exists'
        });
      }
      
      if (!user.isActive) {
        return res.status(403).json({
          error: 'Account deactivated',
          message: 'Your account has been deactivated'
        });
      }
      
      // Check if user has required role
      if (!requiredRoles.includes(user.role)) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: `Requires one of the following roles: ${requiredRoles.join(', ')}`,
          requiredRoles,
          userRole: user.role
        });
      }
      
      // Attach user and payload to request
      (req as any).user = user;
      (req as any).tokenPayload = payload;
      
      next();
    } catch (error: any) {
      console.error('Authorization middleware error:', error);
      res.status(500).json({
        error: 'Authorization failed',
        message: error.message
      });
    }
  };
}

// Specific role middleware generators
export const requireAdmin = authorize([
  UserRole.SYSTEM_OPERATOR,
  UserRole.DEVELOPER,
  UserRole.REGIONAL_OPERATOR
]);

export const requireCustomerCare = authorize([
  UserRole.CUSTOMER_CARE,
  UserRole.SYSTEM_OPERATOR,
  UserRole.DEVELOPER
]);

export const requireBusiness = authorize([
  UserRole.BUSINESS,
  UserRole.SYSTEM_OPERATOR,
  UserRole.DEVELOPER
]);

export const requireRider = authorize([
  UserRole.RIDER,
  UserRole.SYSTEM_OPERATOR,
  UserRole.DEVELOPER,
  UserRole.LOCAL_RIDER_MONITOR
]);

export const requirePrivate = authorize([
  UserRole.PRIVATE,
  UserRole.SYSTEM_OPERATOR,
  UserRole.DEVELOPER
]);

export const requireAuthenticated = authorize([
  UserRole.PRIVATE,
  UserRole.RIDER,
  UserRole.BUSINESS,
  UserRole.DEVELOPER,
  UserRole.SYSTEM_OPERATOR,
  UserRole.CUSTOMER_CARE,
  UserRole.REGIONAL_OPERATOR,
  UserRole.LOCAL_RIDER_MONITOR
]);

// Helper to get user from request
export function getCurrentUser(req: Request): any {
  return (req as any).user;
}

export function getTokenPayload(req: Request): JwtPayload | null {
  return (req as any).tokenPayload || null;
}
