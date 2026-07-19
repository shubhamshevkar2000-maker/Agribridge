import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.toLowerCase().startsWith('bearer')) {
    try {
      const parts = req.headers.authorization.split(/\s+/);
      token = parts[1];
      
      if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
      
      req.user = {
        id: decoded.id,
        role: decoded.role
      };
      
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this route' });
    }
    next();
  };
};
