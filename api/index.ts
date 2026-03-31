import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRoutes from '../routes/api';
import * as AdminController from '../controllers/AdminController';
import { adminAuth } from '../middleware/adminAuth';
import { initDb } from '../services/db';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && process.env.NODE_ENV === 'production') {
  console.warn('WARNING: SESSION_SECRET is not set. Using a fallback for non-production only.');
}

app.use(session({
  secret: sessionSecret || 'zoolai_dev_secret_123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Vercel is always HTTPS
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

app.set('view engine', 'ejs');

const viewsDir = path.resolve(process.cwd(), 'views');
app.set('views', viewsDir);
app.use(express.static(path.resolve(process.cwd(), 'public')));

let dbInitialized = false;
const ensureDb = async (req: any, res: any, next: any) => {
  try {
    if (!dbInitialized) {
      await initDb();
      await AdminController.initializeAdmin();
      dbInitialized = true;
    }
    next();
  } catch (err: any) {
    console.error('CRITICAL: DB initialization failed:', err);
    next();
  }
};

app.get('/', ensureDb, (req, res) => {
  res.render('index', { title: 'Zool-AI API' });
});

app.get('/docs', ensureDb, (req, res) => {
  res.render('docs', { title: 'Documentation - Zool-AI API' });
});

app.use('/v1', ensureDb, apiRoutes);

// Public Routes
app.get('/register', ensureDb, AdminController.showRegistrationForm);
app.post('/register', ensureDb, AdminController.registerDeveloper);

// Admin Auth Routes
app.get('/admin/login', ensureDb, AdminController.showLoginForm);
app.post('/admin/login', ensureDb, AdminController.login);
app.get('/admin/logout', AdminController.logout);

// Admin Dashboard Routes
app.get('/admin', adminAuth, ensureDb, AdminController.showAdminDashboard);
app.post('/admin/profile', adminAuth, ensureDb, AdminController.updateAdminProfile);
app.post('/admin/create-key', adminAuth, ensureDb, AdminController.createKey);
app.post('/admin/toggle-key', adminAuth, ensureDb, AdminController.toggleKeyStatus);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV });
});

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

export default app;
