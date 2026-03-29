import { Request, Response, NextFunction } from 'express';

declare module 'express-session' {
  interface SessionData {
    adminId: number;
    adminEmail: string;
  }
}

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.adminId) {
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(401).json({ status: 'error', message: 'غير مصرح لك بالدخول.' });
    }
    return res.redirect('/admin/login');
  }
  next();
};
