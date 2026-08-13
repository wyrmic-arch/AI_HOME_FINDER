# Business Pulse — Multi-Tenant Monitoring Service

Business Pulse is a lightweight, high-performance, and resource-efficient multi-tenant monitoring service designed specifically for web developers and agencies to sell as a high-value R150 - R300/month add-on to small business clients.

It features standard website uptime monitoring, daily Google rating tracking, customizable down alerts, weekly automated digests, and a streamlined single-page administrator portal.

---

## Tech Stack

- **Backend:** Node.js + Express
- **Storage:** SQLite (via standard `better-sqlite3` native drivers)
- **Scheduling:** `node-cron`
- **Email Dispatch:** `nodemailer` with rich HTML templates
- **Admin Dashboard:** Tailwind CSS (via CDN) + Plain HTML/Vanilla JS (No heavyweight frameworks or compiled SPA bundles needed)

---

## Core Features

1. **Client Management:** Fully interactive administration panel to add, edit, toggle, or delete monitored clients. Each client configuration consists of:
   - Business Name
   - Website URL
   - Google Place ID (Optional — for reviews tracking)
   - Owner's Email Address
   - Active/Paused Toggle
2. **Uptime Monitoring:** Pings every active website client every 10 minutes. If a client website fails consecutively 3 or more times, its status is flagged as `"down"`, a downtime incident is opened in the database, and a professional immediate notification email is dispatched to the business owner.
3. **Google Review Tracking:** Once daily, queries Google Places Details API (if a Place ID is set) to obtain the business's latest rating and review counts. Daily snapshots are recorded so that growth trends can be observed over time.
4. **Weekly Digest Email:** Automatically schedules and delivers a beautifully-structured email summary to every business owner every Monday morning at 08:00. This summary reports:
   - Overall uptime percentage for the past 7 days.
   - Chronological downtime incidents (including exact duration details).
   - Current Google rating & total review count.
   - Growth of new reviews versus the previous week.
5. **Interactive Controls:** Includes physical trigger buttons directly in the admin dashboard to manually execute site pings or send immediate digest emails on-demand for convenient configuration testing.

---

## Environment Variables Configuration

Duplicate the `.env.example` file to `.env` in the root directory:

```bash
cp .env.example .env
```

Define the configuration variables inside `.env`:

```ini
# Server configuration
PORT=3000
SESSION_SECRET=some_extremely_unpredictable_secret_key_string
ADMIN_PASSWORD=your_secure_admin_portal_password

# Database configuration (Relative or absolute path)
DB_PATH=data/pulse.db

# Google Place Details API Key
GOOGLE_API_KEY=your_google_maps_api_key_credentials

# SMTP Mailer Settings
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_mailbox_username
SMTP_PASS=your_smtp_mailbox_password
SMTP_FROM_EMAIL=alerts@youragency.com
SMTP_FROM_NAME="Business Pulse Alerts"
```

---

## How to Deploy to a Production VPS

Business Pulse runs comfortably on low-cost single-core, 1GB RAM instances (e.g. Vultr, DigitalOcean, or Oracle Cloud free tier).

### Option A: Using PM2 (Recommended)

1. **Install PM2 globally:**
   ```bash
   sudo npm install -g pm2
   ```

2. **Start the application with PM2:**
   ```bash
   pm2 start src/server.js --name "business-pulse"
   ```

3. **Configure PM2 to start automatically on system boot:**
   ```bash
   pm2 startup
   pm2 save
   ```

### Option B: Using Systemd Service

1. Create a systemd unit configuration file:
   ```bash
   sudo nano /etc/systemd/system/business-pulse.service
   ```

2. Insert the following unit configuration (adjusting paths and user names accordingly):
   ```ini
   [Unit]
   Description=Business Pulse Monitoring Service
   After=network.target

   [Service]
   Type=simple
   User=ubuntu
   WorkingDirectory=/var/www/business-pulse
   ExecStart=/usr/bin/node src/server.js
   Restart=on-failure
   Environment=NODE_ENV=production

   [Install]
   WantedBy=multi-user.target
   ```

3. Enable and start the service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable business-pulse
   sudo systemctl start business-pulse
   ```

---

## Development & Test Commands

- **Install Dependencies:**
  ```bash
  npm install
  ```

- **Run in Development (Watch mode):**
  ```bash
  npm run dev
  ```

- **Run Test Suite:**
  ```bash
  npm test
  ```

- **Production Run:**
  ```bash
  npm start
  ```

---

## How to Add or Manage a Client

1. Navigate to your deployed instance URL (e.g. `http://your-vps-ip:3000`) and enter your configured `ADMIN_PASSWORD`.
2. Click the **"Add Client"** button in the top right.
3. Fill out the **Business Name**, **Owner Email**, **Website URL**, and **Google Place ID** (if Google reviews tracking is desired).
4. Click **"Save Client"**.
5. Once added, an immediate on-demand test ping and Google review snapshot will run.
6. Click the **"Ping Site Now"** icon on the client row to immediately test website reachability and check response latency.
7. Click the **"Send Weekly Digest Email"** icon to send an immediate mock weekly report to the client's email inbox to test your SMTP delivery.
