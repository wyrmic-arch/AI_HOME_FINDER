const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '1025', 10),
  secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
});

const fromEmail = process.env.SMTP_FROM_EMAIL || 'alerts@businesspulse.com';
const fromName = process.env.SMTP_FROM_NAME || 'Business Pulse Alerts';

/**
 * Send an email using standard configured transport
 */
async function sendEmail({ to, subject, html }) {
  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
}

/**
 * Send immediate failure alert to client
 */
async function sendDowntimeAlert(client, lastError, failureCount) {
  const subject = `⚠️ ALERT: Your website ${client.name} is DOWN`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px;">
      <h2 style="color: #e53e3e; border-bottom: 2px solid #e53e3e; padding-bottom: 10px; margin-top: 0;">Website Down Alert</h2>
      <p>Hello <strong>${client.name} team</strong>,</p>
      <p>Our monitoring system has detected that your website is currently offline or unreachable.</p>

      <div style="background-color: #fff5f5; border-left: 4px solid #e53e3e; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px 0;"><strong>Website URL:</strong> <a href="${client.url}" target="_blank" style="color: #3182ce;">${client.url}</a></p>
        <p style="margin: 0 0 8px 0;"><strong>Consecutive Failures:</strong> ${failureCount}</p>
        <p style="margin: 0;"><strong>Error Logged:</strong> ${lastError || 'N/A'}</p>
      </div>

      <p>We will continue to monitor your website and will keep tracking uptime statistics. If your website is expected to be down for maintenance, you can ask us to temporarily pause monitoring, or manage it via your portal.</p>

      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 12px; color: #718096; text-align: center;">Sent automatically by Business Pulse Monitoring Service.</p>
    </div>
  `;
  return sendEmail({ to: client.owner_email, subject, html });
}

/**
 * Send Weekly Digest Email
 */
async function sendWeeklyDigest(client, stats) {
  const subject = `📊 Business Pulse: Weekly Digest for ${client.name}`;

  // Format uptime percent
  const uptimePercent = (stats.uptimePercent !== undefined && stats.uptimePercent !== null)
    ? stats.uptimePercent.toFixed(2)
    : '100.00';

  const hasIncidents = stats.incidents && stats.incidents.length > 0;
  let incidentsHtml = '';

  if (hasIncidents) {
    incidentsHtml = `
      <div style="margin-top: 15px;">
        <table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
          <thead>
            <tr style="background-color: #f7fafc; border-bottom: 1px solid #edf2f7;">
              <th style="text-align: left; padding: 8px; font-size: 13px; color: #4a5568;">Started At</th>
              <th style="text-align: left; padding: 8px; font-size: 13px; color: #4a5568;">Duration</th>
            </tr>
          </thead>
          <tbody>
    `;
    stats.incidents.forEach(inc => {
      const duration = inc.duration_minutes ? `${inc.duration_minutes} min` : 'Ongoing';
      incidentsHtml += `
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 8px; font-size: 13px; color: #4a5568;">${inc.started_at}</td>
          <td style="padding: 8px; font-size: 13px; color: #e53e3e; font-weight: bold;">${duration}</td>
        </tr>
      `;
    });
    incidentsHtml += `
          </tbody>
        </table>
      </div>
    `;
  } else {
    incidentsHtml = `<p style="color: #48bb78; font-weight: bold; margin-top: 10px;">🌟 Zero downtime incidents detected! Excellent stability.</p>`;
  }

  // Google review trend
  let googleReviewsHtml = '';
  if (stats.currentRating !== null && stats.currentRating !== undefined) {
    const changeText = stats.reviewCountChange > 0
      ? `<span style="color: #48bb78; font-weight: bold;">+${stats.reviewCountChange} new reviews this week!</span>`
      : stats.reviewCountChange < 0
        ? `<span style="color: #e53e3e; font-weight: bold;">${stats.reviewCountChange} reviews change</span>`
        : `<span style="color: #718096;">No change in review count</span>`;

    googleReviewsHtml = `
      <div style="background-color: #ebf8ff; border-left: 4px solid #3182ce; padding: 15px; border-radius: 4px; margin-top: 10px;">
        <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>Google Rating:</strong> ${stats.currentRating} / 5 ⭐</p>
        <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>Total Reviews:</strong> ${stats.currentReviewCount}</p>
        <p style="margin: 0; font-size: 14px; color: #4a5568;"><strong>Weekly Trend:</strong> ${changeText}</p>
      </div>
    `;
  } else {
    googleReviewsHtml = `<p style="color: #718096; font-style: italic; margin-top: 10px;">Google review tracking is not active or configured for this business.</p>`;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px;">
      <h2 style="color: #2b6cb0; border-bottom: 2px solid #2b6cb0; padding-bottom: 10px; margin-top: 0;">Weekly Digest — Business Pulse</h2>
      <p>Hello <strong>${client.name} team</strong>,</p>
      <p>Here is your weekly business health and uptime report for the past 7 days.</p>

      <div style="margin: 25px 0;">
        <h3 style="color: #2d3748; margin-bottom: 10px; font-size: 16px; border-bottom: 1px solid #edf2f7; padding-bottom: 5px;">🌐 Website Uptime</h3>
        <div style="background-color: ${uptimePercent >= 99 ? '#f0fff4' : '#fffaf0'}; border-left: 4px solid ${uptimePercent >= 99 ? '#48bb78' : '#dd6b20'}; padding: 15px; border-radius: 4px;">
          <p style="margin: 0; font-size: 18px;"><strong>Uptime Status:</strong> <span style="font-weight: bold; color: ${uptimePercent >= 99 ? '#2f855a' : '#c05621'};">${uptimePercent}%</span></p>
        </div>
        ${incidentsHtml}
      </div>

      <div style="margin: 25px 0;">
        <h3 style="color: #2d3748; margin-bottom: 10px; font-size: 16px; border-bottom: 1px solid #edf2f7; padding-bottom: 5px;">⭐ Google Reviews Status</h3>
        ${googleReviewsHtml}
      </div>

      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 12px; color: #718096; text-align: center;">You are receiving this because you subscribed to Business Pulse monitoring services.<br/>Manage monitoring settings via your developer/web team.</p>
    </div>
  `;

  return sendEmail({ to: client.owner_email, subject, html });
}

module.exports = {
  sendEmail,
  sendDowntimeAlert,
  sendWeeklyDigest,
  transporter,
};
