import { Request, Response, NextFunction } from 'express';

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const adminPassword = process.env.ADMIN_PASSWORD || 'zoolai_admin_2025';

  // Basic Auth or custom header for simplicity as requested
  const authHeader = req.headers['authorization'];
  if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
    // If it's a browser request, check for session or cookies (let's use a simple query param for now)
    if (req.query.pw === adminPassword) {
      return next();
    }
    return res.status(401).send('غير مصرح لك بالدخول.');
  }
  next();
};
