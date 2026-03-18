import { Request, Response, NextFunction } from 'express';
import db from '../services/db';

export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization'];

  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(401).json({ status: 'error', message: 'مفتاح API غير متوفر.' });
  }

  const cleanKey = apiKey.startsWith('Bearer ') ? apiKey.split(' ')[1] : apiKey;

  // 1. Check Absolute Key
  const absoluteKey = process.env.ABSOLUTE_KEY || 'zoolai_sk_ABS0LUTEKEY';
  if (cleanKey === absoluteKey) {
    (req as any).apiKeyData = { id: 0, key: absoluteKey, type: 'premium', status: 'active', is_absolute: true };
    return next();
  }

  // 2. Check Database
  const keyData = db.prepare('SELECT * FROM api_keys WHERE key = ? AND is_active = 1').get(cleanKey) as any;

  if (!keyData) {
    return res.status(401).json({ status: 'error', message: 'مفتاح API غير صالح أو غير مفعل.' });
  }

  if (keyData.status === 'restricted') {
    return res.status(403).json({ status: 'error', message: 'هذا المفتاح مقيد حالياً.' });
  }

  (req as any).apiKeyData = { ...keyData, is_absolute: false };
  next();
};

export const validateSource = (req: Request, res: Response, next: NextFunction) => {
  const source = req.body.source || req.query.source;
  const allowedSources = ['zoolai', 'iai'];

  if (!source || !allowedSources.includes(source as string)) {
    // Only enforce if requested? User said "I will name them later",
    // but specified zoolai and iai now.
    // return res.status(403).json({ status: 'error', message: 'مصدر الطلب غير معتمد.' });
  }
  next();
};
