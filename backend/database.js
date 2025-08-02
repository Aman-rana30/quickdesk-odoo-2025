// database.js
// SQLite database logic for QuickDesk

/**
 * Handles SQLite connection, schema, and queries for QuickDesk
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');
const DB_FILE = path.join(__dirname, '../data/sqlite.db');

const STATUS_OPEN = "Open";
const STATUS_IN_PROGRESS = "In Progress";
const STATUS_RESOLVED = "Resolved";
const STATUS_CLOSED = "Closed";

const db = new sqlite3.Database(DB_FILE);

// --- Schema & Initial Data ---
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(ticket_id) REFERENCES tickets(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // Pre-populate users if not present
  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (row.count === 0) {
      const hash = md5('password123');
      db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['user1', hash, 'end-user']);
      db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['agent1', hash, 'support']);
      db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin1', hash, 'admin']);
    }
  });
  // Pre-populate categories
  db.get('SELECT COUNT(*) as count FROM categories', (err, row) => {
    if (row.count === 0) {
      db.run('INSERT INTO categories (name) VALUES (?), (?), (?)', ['IT', 'HR', 'Facilities']);
    }
  });
  // Pre-populate sample ticket
  db.get('SELECT COUNT(*) as count FROM tickets', (err, row) => {
    if (row.count === 0) {
      db.get('SELECT id FROM users WHERE username = ?', ['user1'], (err, userRow) => {
        if (userRow) {
          db.run('INSERT INTO tickets (user_id, subject, description, category, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [userRow.id, 'Printer Issue', 'The office printer is not working.', 'IT', STATUS_OPEN, new Date().toISOString()]);
        }
      });
    }
  });
});

/**
 * Hash a string using MD5 (no external libs)
 * @param {string} str
 * @returns {string}
 */
function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

/**
 * Register a new end-user
 * @param {string} username
 * @param {string} password
 * @returns {Promise<object>}
 */
function registerUser(username, password) {
  return new Promise((resolve, reject) => {
    if (!username || !password) return reject(new Error('Username and password required.'));
    const hash = md5(password);
    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, 'end-user'], function(err) {
      if (err) return reject(new Error('Username already exists.'));
      resolve({ id: this.lastID, username, role: 'end-user' });
    });
  });
}

/**
 * Login user
 * @param {string} username
 * @param {string} password
 * @returns {Promise<object>}
 */
function loginUser(username, password) {
  return new Promise((resolve, reject) => {
    const hash = md5(password);
    db.get('SELECT id, username, role FROM users WHERE username = ? AND password = ?', [username, hash], (err, row) => {
      if (err || !row) return reject(new Error('Invalid credentials.'));
      resolve(row);
    });
  });
}

module.exports = {
  registerUser,
  loginUser,
  db
};
