import { Request, Response } from 'express';
import { getDb } from '../services/db';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

// Initialize default admin
export const initializeAdmin = async () => {
  const db = getDb();
  const adminEmail = process.env.ADMIN_EMAIL || 'kgsoft@zoolai.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'kgsoft@zoolai';

  const existing = await db.get('SELECT id FROM admins WHERE email = ?', adminEmail);
  if (!existing) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await db.run('INSERT INTO admins (email, password) VALUES (?, ?)', adminEmail, hashedPassword);
  }
};

export const showRegistrationForm = (req: Request, res: Response) => {
  res.render('register', { title: 'Register - Zool-AI API' });
};

export const registerDeveloper = async (req: Request, res: Response) => {
  const db = getDb();
  const { first_name, last_name, email, company, reason } = req.body;

  if (!first_name || !last_name || !email || !reason) {
    return res.status(400).render('register', { error: 'يرجى ملء جميع الحقول المطلوبة.', title: 'Register - Zool-AI API' });
  }

  // Save to DB
  await db.run('INSERT INTO developer_requests (first_name, last_name, email, company, reason) VALUES (?, ?, ?, ?, ?)',
    first_name, last_name, email, company || '', reason);

  // Send Email (Using Nodemailer)
  const transporter = nodemailer.createTransport({
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
  } catch (err) {
    console.error('Email failed:', err);
  }

  res.render('thank-you', { title: 'Thank You' });
};

// Admin Logic
export const showLoginForm = (req: Request, res: Response) => {
  if (req.session.adminId) return res.redirect('/admin');
  res.render('admin/login', { title: 'Login - Zool-AI Admin', error: null });
};

export const login = async (req: Request, res: Response) => {
  const db = getDb();
  const { email, password } = req.body;
  const admin = await db.get('SELECT * FROM admins WHERE email = ?', email);

  if (!admin) {
    return res.render('admin/login', { title: 'Login', error: 'بيانات الدخول غير صحيحة.' });
  }

  // Check lockout
  if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
    const minutesLeft = Math.ceil((new Date(admin.locked_until).getTime() - new Date().getTime()) / 60000);
    return res.render('admin/login', { title: 'Login', error: `الحساب مقفل. حاول مرة أخرى بعد ${minutesLeft} دقيقة.` });
  }

  const match = await bcrypt.compare(password, admin.password);
  if (match) {
    // Reset failed attempts
    await db.run('UPDATE admins SET failed_attempts = 0, locked_until = NULL WHERE id = ?', admin.id);
    req.session.adminId = admin.id;
    req.session.adminEmail = admin.email;
    return res.redirect('/admin');
  } else {
    // Increment failed attempts
    const newAttempts = (admin.failed_attempts || 0) + 1;
    let lockedUntil = null;
    if (newAttempts >= 5) {
      lockedUntil = new Date(Date.now() + 15 * 60000).toISOString();
    }
    await db.run('UPDATE admins SET failed_attempts = ?, locked_until = ? WHERE id = ?',
      newAttempts, lockedUntil, admin.id);

    return res.render('admin/login', {
      title: 'Login',
      error: lockedUntil ? 'تم تجاوز محاولات الدخول. تم قفل الحساب لمدة 15 دقيقة.' : 'بيانات الدخول غير صحيحة.'
    });
  }
};

export const logout = (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
};

export const showAdminDashboard = async (req: Request, res: Response) => {
  const db = getDb();
  const keys = await db.all('SELECT * FROM api_keys');
  const requests = await db.all('SELECT * FROM developer_requests ORDER BY created_at DESC');
  const admin = await db.get('SELECT email FROM admins WHERE id = ?', req.session.adminId);
  res.render('admin/dashboard', { keys, requests, title: 'Admin Dashboard', adminEmail: admin.email });
};

export const updateAdminProfile = async (req: Request, res: Response) => {
  const db = getDb();
  const { email, password } = req.body;
  const adminId = req.session.adminId;

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run('UPDATE admins SET email = ?, password = ? WHERE id = ?',
      email, hashedPassword, adminId);
  } else {
    await db.run('UPDATE admins SET email = ? WHERE id = ?',
      email, adminId);
  }

  req.session.adminEmail = email;
  res.redirect('/admin');
};

export const createKey = async (req: Request, res: Response) => {
  const db = getDb();
  const { first_name, last_name, email, type, limit_chat, limit_image, limit_audio, limit_video } = req.body;
  const key = `zoolai_sk_${crypto.randomBytes(16).toString('hex')}`;

  await db.run('INSERT INTO api_keys (key, first_name, last_name, email, type, limit_chat, limit_image, limit_audio, limit_video) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    key, first_name, last_name, email, type || 'standard', limit_chat || 1000, limit_image || 100, limit_audio || 100, limit_video || 10);

  res.redirect('/admin');
};

export const toggleKeyStatus = async (req: Request, res: Response) => {
  const db = getDb();
  const { id, status } = req.body;
  await db.run('UPDATE api_keys SET status = ?, is_active = ? WHERE id = ?',
    status, status === 'active' ? 1 : 0, id);
  res.redirect('/admin');
};
