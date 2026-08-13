const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbPath = process.env.DB_PATH || 'data/pulse.db';
const dbDir = path.dirname(dbPath);

// Ensure db directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables if they do not exist
const schema = `
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    google_place_id TEXT,
    owner_email TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    consecutive_failures INTEGER DEFAULT 0,
    status TEXT DEFAULT 'unknown',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS uptime_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status_code INTEGER,
    response_time INTEGER,
    success INTEGER NOT NULL,
    error_message TEXT,
    FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS downtime_incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    started_at DATETIME NOT NULL,
    ended_at DATETIME,
    duration_minutes INTEGER,
    FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS google_reviews_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    rating REAL,
    review_count INTEGER,
    FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE
  );
`;

db.exec(schema);

module.exports = db;
