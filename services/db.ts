import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

// On Vercel, the only writable directory is /tmp
const isVercel = !!(process.env.VERCEL || process.env.NOW_BUILDER);
const dbPath = isVercel
  ? path.join('/tmp', 'database.sqlite')
  : path.resolve(process.cwd(), 'database.sqlite');

let db: Database;

export const initDb = async () => {
  if (db) return db;

  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
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
  } catch (err: any) {
    console.error(`ERROR: Database connection to ${dbPath} failed:`, err);
    throw err;
  }
};

export const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
};

export default { initDb, getDb };
