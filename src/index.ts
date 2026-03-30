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

// For Vercel, the views directory is bundled with the source.
// Using process.cwd() ensures it points to the project root where views/ is located.
// On Vercel, everything is flattened.
const viewsDir = process.env.VERCEL
  ? path.join(process.cwd(), 'src', 'views')
  : path.join(__dirname, 'views');

app.set('views', viewsDir);
app.use(express.static(path.join(process.cwd(), 'public')));

let dbInitialized = false;
const ensureDb = async (req: any, res: any, next: any) => {
  if (!dbInitialized) {
    try {
      await initDb();
      await AdminController.initializeAdmin();
      dbInitialized = true;
    } catch (err) {
      console.error('Database initialization error:', err);
    }
  }
  next();
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

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

export default app;
