const cron = require('node-cron');
const { runAllUptimeChecks } = require('./services/uptimeMonitor');
const { runDailyReviewsSnapshot } = require('./services/googlePlaces');
const { sendWeeklyDigest } = require('./mailer');
const { getWeeklyStats } = require('./services/uptimeMonitor');
const db = require('./db');

/**
 * Initialize cron jobs
 */
function initScheduler() {
  console.log('Initializing scheduler...');

  // 1. Uptime Monitoring - Run every 10 minutes
  // Pattern: */10 * * * *
  cron.schedule('*/10 * * * *', async () => {
    console.log('[Scheduler] Starting 10-minute uptime ping job');
    try {
      await runAllUptimeChecks();
    } catch (err) {
      console.error('[Scheduler] Error running uptime checks:', err);
    }
  });

  // 2. Google Reviews Tracking - Run daily at midnight (00:00)
  // Pattern: 0 0 * * *
  cron.schedule('0 0 * * *', async () => {
    console.log('[Scheduler] Starting daily Google review snapshot job');
    try {
      await runDailyReviewsSnapshot();
    } catch (err) {
      console.error('[Scheduler] Error running Google reviews snapshot:', err);
    }
  });

  // 3. Weekly Digest - Run every Monday morning at 08:00
  // Pattern: 0 8 * * 1
  cron.schedule('0 8 * * 1', async () => {
    console.log('[Scheduler] Starting weekly digest emails mailing job');
    try {
      const activeClients = db.prepare('SELECT * FROM clients WHERE active = 1').all();
      for (const client of activeClients) {
        try {
          const stats = getWeeklyStats(client.id);
          await sendWeeklyDigest(client, stats);
          console.log(`[Scheduler] Sent weekly digest to ${client.name} (${client.owner_email})`);
        } catch (err) {
          console.error(`[Scheduler] Error sending weekly digest for ${client.name}:`, err);
        }
      }
    } catch (err) {
      console.error('[Scheduler] Error in weekly digest scheduler:', err);
    }
  });

  console.log('Scheduler initialized successfully.');
}

module.exports = {
  initScheduler,
};
