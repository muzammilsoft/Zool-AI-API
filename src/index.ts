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
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 }
}));
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'src/views'));
app.use(express.static(path.join(process.cwd(), 'public')));

// Initialize database then start the server
initDb().then(async () => {
  console.log('Database initialized successfully.');

  // Initialize default admin
  await AdminController.initializeAdmin();

  app.get('/', (req, res) => {
    res.render('index', { title: 'Zool-AI API' });
  });

  app.get('/docs', (req, res) => {
    res.render('docs', { title: 'Documentation - Zool-AI API' });
  });

  app.use('/v1', apiRoutes);

  // Public Routes
  app.get('/register', AdminController.showRegistrationForm);
  app.post('/register', AdminController.registerDeveloper);

  // Admin Auth Routes
  app.get('/admin/login', AdminController.showLoginForm);
  app.post('/admin/login', AdminController.login);
  app.get('/admin/logout', AdminController.logout);

  // Admin Dashboard Routes
  app.get('/admin', adminAuth, AdminController.showAdminDashboard);
  app.post('/admin/profile', adminAuth, AdminController.updateAdminProfile);
  app.post('/admin/create-key', adminAuth, AdminController.createKey);
  app.post('/admin/toggle-key', adminAuth, AdminController.toggleKeyStatus);

  if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  }
}).catch(err => {
  console.error('Failed to initialize database:', err);
});

export default app;
