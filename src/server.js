const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const db = require('./db');
const { initScheduler } = require('./cron');
const { pingClient, getWeeklyStats } = require('./services/uptimeMonitor');
const { snapshotClientGoogleReviews } = require('./services/googlePlaces');
const { sendWeeklyDigest } = require('./mailer');

const app = express();
const port = process.env.PORT || 3000;

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'pulse_fallback_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Static files (Plain HTML/CSS/JS dashboard)
app.use(express.static(path.join(__dirname, 'public')));

// Authentication Middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

// Auth API Endpoints
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

  if (password === adminPassword) {
    req.session.isAuthenticated = true;
    return res.json({ success: true });
  } else {
    return res.status(401).json({ error: 'Invalid password' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    return res.json({ success: true });
  });
});

app.get('/api/auth/status', (req, res) => {
  return res.json({ isAuthenticated: !!(req.session && req.session.isAuthenticated) });
});


// Client Management Endpoints (CRUD)

// LIST ALL CLIENTS WITH STATS
app.get('/api/clients', requireAuth, (req, res) => {
  try {
    const clients = db.prepare(`
      SELECT * FROM clients
      ORDER BY id DESC
    `).all();

    // Map clients with extra data from logs
    const results = clients.map(client => {
      // Get last ping status from logs
      const lastPing = db.prepare(`
        SELECT success, status_code, timestamp
        FROM uptime_logs
        WHERE client_id = ?
        ORDER BY timestamp DESC
        LIMIT 1
      `).get(client.id);

      // Get current rating details
      const ratingInfo = db.prepare(`
        SELECT rating, review_count
        FROM google_reviews_logs
        WHERE client_id = ?
        ORDER BY timestamp DESC
        LIMIT 1
      `).get(client.id);

      return {
        ...client,
        last_ping_success: lastPing ? lastPing.success : null,
        last_ping_status_code: lastPing ? lastPing.status_code : null,
        last_ping_time: lastPing ? lastPing.timestamp : null,
        rating: ratingInfo ? ratingInfo.rating : null,
        review_count: ratingInfo ? ratingInfo.review_count : null,
      };
    });

    return res.json(results);
  } catch (err) {
    console.error('Failed to retrieve clients:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// ADD NEW CLIENT
app.post('/api/clients', requireAuth, async (req, res) => {
  const { name, url, google_place_id, owner_email, active } = req.body;

  if (!name || !url || !owner_email) {
    return res.status(400).json({ error: 'Business Name, URL, and Owner Email are required.' });
  }

  try {
    const isActive = active === undefined ? 1 : (active ? 1 : 0);
    const insert = db.prepare(`
      INSERT INTO clients (name, url, google_place_id, owner_email, active, status)
      VALUES (?, ?, ?, ?, ?, 'unknown')
    `);
    const info = insert.run(name, url, google_place_id || '', owner_email, isActive);

    // Retrieve the created client
    const newClient = db.prepare('SELECT * FROM clients WHERE id = ?').get(info.lastInsertRowid);

    // Run an initial ping immediately if active
    if (newClient.active === 1) {
      await pingClient(newClient);
      if (newClient.google_place_id) {
        await snapshotClientGoogleReviews(newClient);
      }
    }

    return res.status(201).json(newClient);
  } catch (err) {
    console.error('Failed to create client:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// UPDATE EXISTING CLIENT
app.put('/api/clients/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name, url, google_place_id, owner_email, active } = req.body;

  if (!name || !url || !owner_email) {
    return res.status(400).json({ error: 'Business Name, URL, and Owner Email are required.' });
  }

  try {
    const isActive = active ? 1 : 0;

    // Check if client exists
    const existing = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    // If client goes from inactive -> active, reset failure count and do a fresh check
    const resetFailures = (!existing.active && isActive) ? 1 : 0;

    db.prepare(`
      UPDATE clients
      SET name = ?, url = ?, google_place_id = ?, owner_email = ?, active = ?,
          consecutive_failures = CASE WHEN ? = 1 THEN 0 ELSE consecutive_failures END,
          status = CASE WHEN ? = 1 THEN 'unknown' ELSE status END
      WHERE id = ?
    `).run(name, url, google_place_id || '', owner_email, isActive, resetFailures, resetFailures, id);

    const updatedClient = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);

    // Perform immediate ping on reactivation
    if (resetFailures === 1) {
      await pingClient(updatedClient);
      if (updatedClient.google_place_id) {
        await snapshotClientGoogleReviews(updatedClient);
      }
    }

    return res.json(updatedClient);
  } catch (err) {
    console.error('Failed to update client:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// DELETE CLIENT
app.delete('/api/clients/:id', requireAuth, (req, res) => {
  const { id } = req.params;

  try {
    const existing = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    db.prepare('DELETE FROM clients WHERE id = ?').run(id);
    return res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete client:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});


// Manual Testing & Direct Triggers

// TRIGGER WEEKLY DIGEST EMAIL FOR A CLIENT
app.post('/api/clients/:id/digest', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    // Trigger instant check/snapshot first to ensure fresh data
    await pingClient(client);
    if (client.google_place_id) {
      await snapshotClientGoogleReviews(client);
    }

    const stats = getWeeklyStats(client.id);
    await sendWeeklyDigest(client, stats);

    return res.json({ success: true, message: `Digest sent to ${client.owner_email}` });
  } catch (err) {
    console.error('Failed to send manual digest:', err);
    return res.status(500).json({ error: `Failed to send email digest: ${err.message}` });
  }
});

// TRIGGER IMMEDIATE UPTIME CHECK FOR A CLIENT
app.post('/api/clients/:id/ping', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    const result = await pingClient(client);
    const updatedClient = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);

    return res.json({ success: true, pingResult: result, client: updatedClient });
  } catch (err) {
    console.error('Failed to trigger ping:', err);
    return res.status(500).json({ error: `Ping error: ${err.message}` });
  }
});

// Serve Dashboard index.html directly for all fallback routes or base route
app.get('*', (req, res, next) => {
  // If requesting api, do not serve html
  if (req.url.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize Cron Jobs and start server
let server;
if (process.env.NODE_ENV !== 'test') {
  initScheduler();
  server = app.listen(port, () => {
    console.log(`Business Pulse server running on port ${port}`);
  });
} else {
  // In test mode, we listen on a random port or let the test start the server
  server = app.listen(0, () => {
    console.log(`Business Pulse test server running on port ${server.address().port}`);
  });
}

module.exports = { app, server };
