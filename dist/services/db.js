"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = exports.initDb = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const path_1 = __importDefault(require("path"));
// On Vercel, the only writable directory is /tmp
const isVercel = process.env.VERCEL || process.env.NOW_BUILDER;
const dbPath = isVercel
    ? path_1.default.join('/tmp', 'database.sqlite')
    : path_1.default.resolve(process.cwd(), 'database.sqlite');
let db;
const initDb = async () => {
    db = await (0, sqlite_1.open)({
        filename: dbPath,
        driver: sqlite3_1.default.Database
    });
    // Initialize Tables
    await db.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      first_name TEXT,
      last_name TEXT,
      email TEXT,
      company TEXT,
      reason TEXT,
      type TEXT DEFAULT 'standard', -- standard, premium
      status TEXT DEFAULT 'active', -- active, inactive, restricted
      limit_chat INTEGER DEFAULT 1000,
      limit_image INTEGER DEFAULT 100,
      limit_audio INTEGER DEFAULT 100,
      limit_video INTEGER DEFAULT 10,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS usage_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key_id INTEGER,
      endpoint TEXT,
      status_code INTEGER,
      tokens_used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (key_id) REFERENCES api_keys(id)
    );

    CREATE TABLE IF NOT EXISTS developer_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT,
      last_name TEXT,
      email TEXT,
      company TEXT,
      reason TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      failed_attempts INTEGER DEFAULT 0,
      locked_until DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
    return db;
};
exports.initDb = initDb;
// Exporting a proxy to the database so we can use it directly elsewhere
// after initialization.
const getDb = () => {
    if (!db) {
        throw new Error('Database not initialized. Call initDb() first.');
    }
    return db;
};
exports.getDb = getDb;
exports.default = { initDb: exports.initDb, getDb: exports.getDb };
