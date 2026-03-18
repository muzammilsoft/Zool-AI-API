import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRoutes from './routes/api';
import * as AdminController from './controllers/AdminController';
import { adminAuth } from './middleware/adminAuth';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'src/views'));
app.use(express.static(path.join(process.cwd(), 'public')));

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

// Admin Routes
app.get('/admin', adminAuth, AdminController.showAdminDashboard);
app.post('/admin/create-key', adminAuth, AdminController.createKey);
app.post('/admin/toggle-key', adminAuth, AdminController.toggleKeyStatus);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

export default app;
