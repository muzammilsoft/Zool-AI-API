import { Request, Response } from 'express';
import db from '../services/db';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export const showRegistrationForm = (req: Request, res: Response) => {
  res.render('register', { title: 'Register - Zool-AI API' });
};

export const registerDeveloper = async (req: Request, res: Response) => {
  const { first_name, last_name, email, company, reason } = req.body;

  if (!first_name || !last_name || !email || !reason) {
    return res.status(400).render('register', { error: 'يرجى ملء جميع الحقول المطلوبة.', title: 'Register - Zool-AI API' });
  }

  // Save to DB
  db.prepare('INSERT INTO developer_requests (first_name, last_name, email, company, reason) VALUES (?, ?, ?, ?, ?)')
    .run(first_name, last_name, email, company || '', reason);

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
export const showAdminDashboard = (req: Request, res: Response) => {
  const keys = db.prepare('SELECT * FROM api_keys').all();
  const requests = db.prepare('SELECT * FROM developer_requests ORDER BY created_at DESC').all();
  res.render('admin/dashboard', { keys, requests, title: 'Admin Dashboard' });
};

export const createKey = (req: Request, res: Response) => {
  const { first_name, last_name, email, type, limit_chat, limit_image, limit_audio, limit_video } = req.body;
  const key = `zoolai_sk_${crypto.randomBytes(16).toString('hex')}`;

  db.prepare('INSERT INTO api_keys (key, first_name, last_name, email, type, limit_chat, limit_image, limit_audio, limit_video) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(key, first_name, last_name, email, type || 'standard', limit_chat || 1000, limit_image || 100, limit_audio || 100, limit_video || 10);

  res.redirect('/admin');
};

export const toggleKeyStatus = (req: Request, res: Response) => {
  const { id, status } = req.body;
  db.prepare('UPDATE api_keys SET status = ?, is_active = ? WHERE id = ?')
    .run(status, status === 'active' ? 1 : 0, id);
  res.redirect('/admin');
};
