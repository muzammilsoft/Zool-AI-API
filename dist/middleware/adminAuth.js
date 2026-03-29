"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = void 0;
const adminAuth = (req, res, next) => {
    if (!req.session.adminId) {
        if (req.xhr || req.headers.accept?.includes('json')) {
            return res.status(401).json({ status: 'error', message: 'غير مصرح لك بالدخول.' });
        }
        return res.redirect('/admin/login');
    }
    next();
};
exports.adminAuth = adminAuth;
