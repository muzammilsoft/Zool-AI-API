"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSource = exports.validateApiKey = void 0;
const db_1 = require("../services/db");
const validateApiKey = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization'];
    if (!apiKey || typeof apiKey !== 'string') {
        return res.status(401).json({ status: 'error', message: 'مفتاح API غير متوفر.' });
    }
    const cleanKey = apiKey.startsWith('Bearer ') ? apiKey.split(' ')[1] : apiKey;
    // 1. Check Absolute Key
    const absoluteKey = process.env.ABSOLUTE_KEY || 'zoolai_sk_ABS0LUTEKEY';
    if (cleanKey === absoluteKey) {
        req.apiKeyData = { id: 0, key: absoluteKey, type: 'premium', status: 'active', is_absolute: true };
        return next();
    }
    // 2. Check Database
    const db = (0, db_1.getDb)();
    const keyData = await db.get('SELECT * FROM api_keys WHERE key = ? AND is_active = 1', cleanKey);
    if (!keyData) {
        return res.status(401).json({ status: 'error', message: 'مفتاح API غير صالح أو غير مفعل.' });
    }
    if (keyData.status === 'restricted') {
        return res.status(403).json({ status: 'error', message: 'هذا المفتاح مقيد حالياً.' });
    }
    req.apiKeyData = { ...keyData, is_absolute: false };
    next();
};
exports.validateApiKey = validateApiKey;
const validateSource = (req, res, next) => {
    const source = req.body.source || req.query.source || req.headers['x-source'];
    const allowedSources = ['zoolai', 'iai'];
    if (!source) {
        return res.status(403).json({ status: 'error', message: 'مصدر الطلب (source) مطلوب.' });
    }
    if (!allowedSources.includes(source)) {
        return res.status(403).json({ status: 'error', message: 'مصدر الطلب غير معتمد.' });
    }
    next();
};
exports.validateSource = validateSource;
