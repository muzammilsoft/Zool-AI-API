"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const api_1 = __importDefault(require("./routes/api"));
const AdminController = __importStar(require("./controllers/AdminController"));
const adminAuth_1 = require("./middleware/adminAuth");
const db_1 = require("./services/db");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'zoolai_secret_key_2025',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 }
}));
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(process.cwd(), 'src/views'));
app.use(express_1.default.static(path_1.default.join(process.cwd(), 'public')));
// Initialize database then start the server
(0, db_1.initDb)().then(async () => {
    console.log('Database initialized successfully.');
    // Initialize default admin
    await AdminController.initializeAdmin();
    app.get('/', (req, res) => {
        res.render('index', { title: 'Zool-AI API' });
    });
    app.get('/docs', (req, res) => {
        res.render('docs', { title: 'Documentation - Zool-AI API' });
    });
    app.use('/v1', api_1.default);
    // Public Routes
    app.get('/register', AdminController.showRegistrationForm);
    app.post('/register', AdminController.registerDeveloper);
    // Admin Auth Routes
    app.get('/admin/login', AdminController.showLoginForm);
    app.post('/admin/login', AdminController.login);
    app.get('/admin/logout', AdminController.logout);
    // Admin Dashboard Routes
    app.get('/admin', adminAuth_1.adminAuth, AdminController.showAdminDashboard);
    app.post('/admin/profile', adminAuth_1.adminAuth, AdminController.updateAdminProfile);
    app.post('/admin/create-key', adminAuth_1.adminAuth, AdminController.createKey);
    app.post('/admin/toggle-key', adminAuth_1.adminAuth, AdminController.toggleKeyStatus);
    if (process.env.NODE_ENV !== 'test') {
        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });
    }
}).catch(err => {
    console.error('Failed to initialize database:', err);
});
exports.default = app;
