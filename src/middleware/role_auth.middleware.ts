import { Request, Response, NextFunction } from 'express';

export const requireRole = (role: 'viewer' | 'creator' | 'admin' | Array<'viewer' | 'creator' | 'admin'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const allowedRoles = Array.isArray(role) ? role : [role];

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        message: 'Forbidden: insufficient permissions',
      });
    }

    next();
  };
};

export const requireAdmin = requireRole('admin');
