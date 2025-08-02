// server.js
// Express backend for QuickDesk

/**
 * Main Express server for QuickDesk Help Desk Solution
 * Handles RESTful API, authentication, and error handling
 */

const express = require('express');
const path = require('path');
const db = require('./database');
const app = express();
const PORT = 3000;

// Constants for ticket status
const STATUS_OPEN = "Open";
const STATUS_IN_PROGRESS = "In Progress";
const STATUS_RESOLVED = "Resolved";
const STATUS_CLOSED = "Closed";

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Middleware: Basic session (in-memory for demo)
let sessions = {};

function createSession(user) {
  const token = Math.random().toString(36).substr(2);
  sessions[token] = { user, created: Date.now() };
  return token;
}

function getSession(req) {
  const token = req.headers['x-auth'] || req.cookies?.token;
  return token && sessions[token] ? sessions[token].user : null;
}

// --- API Routes ---

/**
 * POST /api/register
 * Register a new end-user
 */
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required.' });
  try {
    const user = await db.registerUser(username, password);
    const token = createSession(user);
    res.json({ user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/login
 * Login with username/password
 */
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required.' });
  try {
    const user = await db.loginUser(username, password);
    const token = createSession(user);
    res.json({ user, token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// (More routes will be added in next steps: tickets, comments, admin, etc.)

// --- Serve frontend for SPA ---
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`QuickDesk backend running at http://localhost:${PORT}`);
});
