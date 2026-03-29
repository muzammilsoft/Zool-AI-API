import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRoutes from './routes/api';
import * as AdminController from './controllers/AdminController';
import { adminAuth } from './middleware/adminAuth';
import { initDb } from './services/db';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'zoolai_secret_key_2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

app.set('view engine', 'ejs');
// For Vercel, views should be referenced relative to the project root
app.set('views', path.join(process.cwd(), 'src/views'));
app.use(express.static(path.join(process.cwd(), 'public')));

// Middleware to ensure DB is initialized before each request
// In a serverless environment, we need to handle this carefully.
let dbInitialized = false;
const ensureDb = async (req: any, res: any, next: any) => {
  if (!dbInitialized) {
    try {
      await initDb();
      await AdminController.initializeAdmin();
      dbInitialized = true;
    } catch (err) {
      console.error('Database initialization error:', err);
      return res.status(500).send('Database Error');
    }
  }
  next();
};

app.get('/', (req, res) => {
  res.render('index', { title: 'Zool-AI API' });
});

app.get('/docs', (req, res) => {
  res.render('docs', { title: 'Documentation - Zool-AI API' });
});

// All API and Admin routes need DB access
app.use('/v1', ensureDb, apiRoutes);

// Public Routes
app.get('/register', AdminController.showRegistrationForm);
app.post('/register', ensureDb, AdminController.registerDeveloper);

// Admin Auth Routes
app.get('/admin/login', AdminController.showLoginForm);
app.post('/admin/login', ensureDb, AdminController.login);
app.get('/admin/logout', AdminController.logout);

// Admin Dashboard Routes
app.get('/admin', adminAuth, ensureDb, AdminController.showAdminDashboard);
app.post('/admin/profile', adminAuth, ensureDb, AdminController.updateAdminProfile);
app.post('/admin/create-key', adminAuth, ensureDb, AdminController.createKey);
app.post('/admin/toggle-key', adminAuth, ensureDb, AdminController.toggleKeyStatus);

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

export default app;
