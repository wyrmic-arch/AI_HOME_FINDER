const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const db = require('./src/db');

// Mock Node's mailer to prevent actual SMTP connection errors during testing
const mailer = require('./src/mailer');
mailer.transporter.sendMail = async (options) => {
  console.log('[Mock Transporter] sendMail called for:', options.to);
  return { messageId: 'mock-id-123' };
};

// Ensure DB is clean before starting
db.prepare('DELETE FROM clients').run();

const { app } = require('./src/server');

test('Business Pulse API & Logic Suite', async (t) => {
  let agent;
  let clientId;

  // Mock global fetch
  const originalFetch = globalThis.fetch;
  let mockFetchTarget = { status: 200, ok: true };

  globalThis.fetch = async (url, options) => {
    // If it's a google API call
    if (url.includes('maps.googleapis.com')) {
      return {
        ok: true,
        json: async () => ({
          status: 'OK',
          result: { rating: 4.8, user_ratings_total: 42 }
        })
      };
    }
    // Otherwise it's our ping checks
    return {
      status: mockFetchTarget.status,
      ok: mockFetchTarget.ok,
      json: async () => ({})
    };
  };

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  await t.test('Authentication checks', async () => {
    // Attempt unauthorized access
    const unauthRes = await request(app).get('/api/clients');
    assert.strictEqual(unauthRes.status, 401);

    // Login with wrong password
    const badLogin = await request(app)
      .post('/api/auth/login')
      .send({ password: 'wrongpassword' });
    assert.strictEqual(badLogin.status, 401);

    // Login with correct password
    const goodLogin = await request(app)
      .post('/api/auth/login')
      .send({ password: 'admin' });
    assert.strictEqual(goodLogin.status, 200);
    assert.strictEqual(goodLogin.body.success, true);

    // Store cookie/session for authenticated agent requests
    const cookie = goodLogin.headers['set-cookie'];
    agent = request.agent(app);
    agent.set('Cookie', cookie);
  });

  await t.test('Client CRUD management', async () => {
    // 1. Create client
    const newClientData = {
      name: 'Test Business',
      url: 'https://httpbin.org/status/200',
      google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83A16A',
      owner_email: 'testowner@gmail.com',
      active: true
    };

    mockFetchTarget = { status: 200, ok: true };

    const createRes = await agent
      .post('/api/clients')
      .send(newClientData);

    assert.strictEqual(createRes.status, 201);
    assert.strictEqual(createRes.body.name, 'Test Business');
    clientId = createRes.body.id;

    // 2. Fetch clients list
    const listRes = await agent.get('/api/clients');
    assert.strictEqual(listRes.status, 200);
    assert.ok(listRes.body.length >= 1);
    const storedClient = listRes.body.find(c => c.id === clientId);
    assert.ok(storedClient);
    assert.strictEqual(storedClient.name, 'Test Business');

    // 3. Update client
    const updateRes = await agent
      .put(`/api/clients/${clientId}`)
      .send({
        ...newClientData,
        name: 'Updated Test Business',
        active: false
      });
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.body.name, 'Updated Test Business');
    assert.strictEqual(updateRes.body.active, 0);
  });

  await t.test('Uptime Monitoring logic', async () => {
    const { pingClient, getWeeklyStats } = require('./src/services/uptimeMonitor');

    // Activate client first
    db.prepare('UPDATE clients SET active = 1, consecutive_failures = 0 WHERE id = ?').run(clientId);
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);

    // Test a successful ping
    mockFetchTarget = { status: 200, ok: true };
    const res = await pingClient(client);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.statusCode, 200);

    // Check uptime log is stored
    const log = db.prepare('SELECT * FROM uptime_logs WHERE client_id = ? ORDER BY id DESC LIMIT 1').get(clientId);
    assert.ok(log);
    assert.strictEqual(log.success, 1);
    assert.strictEqual(log.status_code, 200);

    // Verify stats calculation
    const stats = getWeeklyStats(clientId);
    assert.ok(stats.uptimePercent);
    assert.strictEqual(stats.uptimePercent, 100.00);
  });

  await t.test('Uptime Monitoring failure logic (Consecutive Failures & Incident Trigger)', async () => {
    const { pingClient } = require('./src/services/uptimeMonitor');

    // Reset client state
    db.prepare("UPDATE clients SET consecutive_failures = 0, status = 'up' WHERE id = ?").run(clientId);
    let client = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);

    // Set mock fetch target to fail
    mockFetchTarget = { status: 500, ok: false };

    // Ping 1 (Failure 1)
    let res1 = await pingClient(client);
    client = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
    assert.strictEqual(res1.success, false);
    assert.strictEqual(client.consecutive_failures, 1);
    assert.strictEqual(client.status, 'up'); // remains up until 3 consecutive failures

    // Ping 2 (Failure 2)
    let res2 = await pingClient(client);
    client = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
    assert.strictEqual(res2.success, false);
    assert.strictEqual(client.consecutive_failures, 2);
    assert.strictEqual(client.status, 'up');

    // Ping 3 (Failure 3) -> should trigger state transition to 'down' and start incident
    let res3 = await pingClient(client);
    client = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
    assert.strictEqual(res3.success, false);
    assert.strictEqual(client.consecutive_failures, 3);
    assert.strictEqual(client.status, 'down');

    // Check incident has started
    const incident = db.prepare('SELECT * FROM downtime_incidents WHERE client_id = ? AND ended_at IS NULL').get(clientId);
    assert.ok(incident);

    // Test Resolution -> Make site healthy and ping
    mockFetchTarget = { status: 200, ok: true };
    client = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);

    const resResolve = await pingClient(client);
    client = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
    assert.strictEqual(resResolve.success, true);
    assert.strictEqual(client.consecutive_failures, 0);
    assert.strictEqual(client.status, 'up');

    // Check incident is resolved
    const resolvedIncident = db.prepare('SELECT * FROM downtime_incidents WHERE client_id = ? AND id = ?').get(clientId, incident.id);
    assert.ok(resolvedIncident.ended_at);
    assert.ok(resolvedIncident.duration_minutes >= 1);
  });

  await t.test('Client Deletion cleanup cascade', async () => {
    // Delete the client
    const deleteRes = await agent.delete(`/api/clients/${clientId}`);
    assert.strictEqual(deleteRes.status, 200);

    // Check cascading deletes on uptime_logs and downtime_incidents
    const logCount = db.prepare('SELECT COUNT(*) as count FROM uptime_logs WHERE client_id = ?').get(clientId).count;
    const incidentCount = db.prepare('SELECT COUNT(*) as count FROM downtime_incidents WHERE client_id = ?').get(clientId).count;

    assert.strictEqual(logCount, 0);
    assert.strictEqual(incidentCount, 0);
  });

  // Teardown HTTP Server
  await new Promise((resolve) => {
    const { server } = require('./src/server');
    server.close(() => {
      resolve();
    });
  });
});
