const db = require('../db');
const { sendDowntimeAlert } = require('../mailer');

/**
 * Pings a specific client's URL and updates database states
 */
async function pingClient(client) {
  const startTime = Date.now();
  let statusCode = null;
  let responseTime = null;
  let success = 0;
  let errorMessage = null;

  try {
    // Set a 10s timeout for the request to avoid hangs
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(client.url, {
      method: 'GET',
      headers: { 'User-Agent': 'BusinessPulse/1.0 (Uptime Monitor)' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    responseTime = Date.now() - startTime;
    statusCode = response.status;

    // Accept standard 2xx/3xx codes as success
    if (response.status >= 200 && response.status < 400) {
      success = 1;
    } else {
      errorMessage = `HTTP Status ${response.status}`;
    }
  } catch (error) {
    responseTime = Date.now() - startTime;
    errorMessage = error.message || 'Unknown network error';
    if (error.name === 'AbortError') {
      errorMessage = 'Request Timeout (10s)';
    }
  }

  // Insert uptime log
  const insertLog = db.prepare(`
    INSERT INTO uptime_logs (client_id, status_code, response_time, success, error_message)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertLog.run(client.id, statusCode, responseTime, success, errorMessage);

  // Update client failure state
  if (success === 1) {
    // Check if client was previously down (failures >= 3)
    const wasDown = client.consecutive_failures >= 3;

    // Reset consecutive failures
    db.prepare(`
      UPDATE clients
      SET consecutive_failures = 0, status = 'up'
      WHERE id = ?
    `).run(client.id);

    // If client was previously down, resolve the downtime incident
    if (wasDown) {
      resolveDowntimeIncident(client.id);
    }
  } else {
    const newFailureCount = (client.consecutive_failures || 0) + 1;
    let newStatus = client.status;

    if (newFailureCount >= 3) {
      newStatus = 'down';
    }

    db.prepare(`
      UPDATE clients
      SET consecutive_failures = ?, status = ?
      WHERE id = ?
    `).run(newFailureCount, newStatus, client.id);

    // If reached exactly 3 failures, trigger alert and start downtime incident
    if (newFailureCount === 3) {
      startDowntimeIncident(client.id);
      try {
        await sendDowntimeAlert(client, errorMessage, newFailureCount);
      } catch (err) {
        console.error(`Failed to send email alert for down client ${client.name}:`, err);
      }
    } else if (newFailureCount > 3) {
      // Already down, keep incident running
      // Optionally could send update emails, but rule says "send an immediate alert email" on consecutive failures (3+)
      // Standard is to alert on state change (reaches 3 failures).
    }
  }

  return { success: success === 1, statusCode, responseTime, errorMessage };
}

/**
 * Starts a downtime incident
 */
function startDowntimeIncident(clientId) {
  try {
    // Check if there's already an active (unresolved) incident to avoid duplicates
    const active = db.prepare('SELECT id FROM downtime_incidents WHERE client_id = ? AND ended_at IS NULL').get(clientId);
    if (!active) {
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO downtime_incidents (client_id, started_at)
        VALUES (?, ?)
      `).run(clientId, now);
      console.log(`Downtime incident started for client ID ${clientId}`);
    }
  } catch (err) {
    console.error(`Failed to start downtime incident for client ID ${clientId}:`, err);
  }
}

/**
 * Resolves any outstanding downtime incident for a client
 */
function resolveDowntimeIncident(clientId) {
  try {
    const active = db.prepare('SELECT id, started_at FROM downtime_incidents WHERE client_id = ? AND ended_at IS NULL').get(clientId);
    if (active) {
      const endedAt = new Date();
      const startedAt = new Date(active.started_at);
      const durationMs = endedAt - startedAt;
      const durationMinutes = Math.max(1, Math.round(durationMs / 60000)); // minimum 1 min

      db.prepare(`
        UPDATE downtime_incidents
        SET ended_at = ?, duration_minutes = ?
        WHERE id = ?
      `).run(endedAt.toISOString(), durationMinutes, active.id);
      console.log(`Downtime incident resolved for client ID ${clientId}. Duration: ${durationMinutes} mins`);
    }
  } catch (err) {
    console.error(`Failed to resolve downtime incident for client ID ${clientId}:`, err);
  }
}

/**
 * Fetch and construct weekly stats for client
 */
function getWeeklyStats(clientId) {
  // Past 7 days range
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString();

  // Uptime Logs over past 7 days
  const logs = db.prepare(`
    SELECT success, timestamp
    FROM uptime_logs
    WHERE client_id = ? AND timestamp >= ?
  `).all(clientId, sevenDaysAgoStr);

  let uptimePercent = 100.00;
  if (logs.length > 0) {
    const successCount = logs.filter(l => l.success === 1).length;
    uptimePercent = (successCount / logs.length) * 100;
  }

  // Downtime incidents in the past 7 days
  const incidents = db.prepare(`
    SELECT started_at, ended_at, duration_minutes
    FROM downtime_incidents
    WHERE client_id = ? AND started_at >= ?
    ORDER BY started_at DESC
  `).all(clientId, sevenDaysAgoStr);

  // Format dates for display
  const formattedIncidents = incidents.map(inc => {
    let dateStr = inc.started_at;
    try {
      dateStr = new Date(inc.started_at).toLocaleString();
    } catch (_) {}
    return {
      started_at: dateStr,
      duration_minutes: inc.duration_minutes,
    };
  });

  // Current google details
  const currentReviews = db.prepare(`
    SELECT rating, review_count, timestamp
    FROM google_reviews_logs
    WHERE client_id = ?
    ORDER BY timestamp DESC
    LIMIT 1
  `).get(clientId);

  // Google details from 7 days ago (approx)
  const previousReviews = db.prepare(`
    SELECT rating, review_count, timestamp
    FROM google_reviews_logs
    WHERE client_id = ? AND timestamp <= ?
    ORDER BY timestamp DESC
    LIMIT 1
  `).get(clientId, sevenDaysAgoStr);

  // Fallback to the earliest review if none is <= 7 days ago specifically, or compare first and last
  let oldestReviews = previousReviews;
  if (!oldestReviews) {
    oldestReviews = db.prepare(`
      SELECT rating, review_count, timestamp
      FROM google_reviews_logs
      WHERE client_id = ?
      ORDER BY timestamp ASC
      LIMIT 1
    `).get(clientId);
  }

  const currentRating = currentReviews ? currentReviews.rating : null;
  const currentReviewCount = currentReviews ? currentReviews.review_count : null;

  let reviewCountChange = 0;
  if (currentReviews && oldestReviews && currentReviews.timestamp !== oldestReviews.timestamp) {
    reviewCountChange = currentReviews.review_count - oldestReviews.review_count;
  }

  return {
    uptimePercent,
    incidents: formattedIncidents,
    currentRating,
    currentReviewCount,
    reviewCountChange,
  };
}

/**
 * Pings all active clients
 */
async function runAllUptimeChecks() {
  console.log('Running scheduled uptime checks for active clients...');
  const activeClients = db.prepare('SELECT * FROM clients WHERE active = 1').all();

  for (const client of activeClients) {
    try {
      await pingClient(client);
    } catch (err) {
      console.error(`Error during ping check for client ${client.name}:`, err);
    }
  }
  console.log('Uptime checks completed.');
}

module.exports = {
  pingClient,
  getWeeklyStats,
  runAllUptimeChecks,
};
