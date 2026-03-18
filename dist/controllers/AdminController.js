"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleKeyStatus = exports.createKey = exports.showAdminDashboard = exports.registerDeveloper = exports.showRegistrationForm = void 0;
const db_1 = __importDefault(require("../services/db"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const crypto_1 = __importDefault(require("crypto"));
const showRegistrationForm = (req, res) => {
    res.render('register', { title: 'Register - Zool-AI API' });
};
exports.showRegistrationForm = showRegistrationForm;
const registerDeveloper = async (req, res) => {
    const { first_name, last_name, email, company, reason } = req.body;
    if (!first_name || !last_name || !email || !reason) {
        return res.status(400).render('register', { error: 'يرجى ملء جميع الحقول المطلوبة.', title: 'Register - Zool-AI API' });
    }
    // Save to DB
    db_1.default.prepare('INSERT INTO developer_requests (first_name, last_name, email, company, reason) VALUES (?, ?, ?, ?, ?)')
        .run(first_name, last_name, email, company || '', reason);
    // Send Email (Using Nodemailer)
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST || 'smtp.protonmail.ch',
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: 'zoolai_api@proton.me',
        subject: 'New Zool-AI API Key Request',
        text: `New Request From: ${first_name} ${last_name}\nEmail: ${email}\nCompany: ${company}\nReason: ${reason}`
    };
    try {
        await transporter.sendMail(mailOptions);
    }
    catch (err) {
        console.error('Email failed:', err);
    }
    res.render('thank-you', { title: 'Thank You' });
};
exports.registerDeveloper = registerDeveloper;
// Admin Logic
const showAdminDashboard = (req, res) => {
    const keys = db_1.default.prepare('SELECT * FROM api_keys').all();
    const requests = db_1.default.prepare('SELECT * FROM developer_requests ORDER BY created_at DESC').all();
    res.render('admin/dashboard', { keys, requests, title: 'Admin Dashboard' });
};
exports.showAdminDashboard = showAdminDashboard;
const createKey = (req, res) => {
    const { first_name, last_name, email, type, limit_chat, limit_image, limit_audio, limit_video } = req.body;
    const key = `zoolai_sk_${crypto_1.default.randomBytes(16).toString('hex')}`;
    db_1.default.prepare('INSERT INTO api_keys (key, first_name, last_name, email, type, limit_chat, limit_image, limit_audio, limit_video) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(key, first_name, last_name, email, type || 'standard', limit_chat || 1000, limit_image || 100, limit_audio || 100, limit_video || 10);
    res.redirect('/admin');
};
exports.createKey = createKey;
const toggleKeyStatus = (req, res) => {
    const { id, status } = req.body;
    db_1.default.prepare('UPDATE api_keys SET status = ?, is_active = ? WHERE id = ?')
        .run(status, status === 'active' ? 1 : 0, id);
    res.redirect('/admin');
};
exports.toggleKeyStatus = toggleKeyStatus;
