# 🎵 GOAT Royalty App - Automation System

## Harvey Miller (DJ Speedy) - Music Empire Automation

Comprehensive automation system for monitoring, analyzing, and optimizing your music catalog of 346+ tracks across all major streaming platforms.

---

## 🚀 Features

### 📊 Daily Performance Monitor (`daily-monitor.js`)
- Monitors all 346 tracks every morning at 9 AM
- Tracks streams across Spotify, Apple Music, YouTube, TikTok, Instagram
- Calculates daily revenue using 2025 industry pay rates
- Detects viral tracks with >50% growth patterns
- Sends instant email alerts for viral opportunities
- Updates Supabase dashboard automatically

### 💰 Royalty Calculator (`royalty-calculator.js`)
- Automated monthly royalty calculations on the 1st of each month
- Multi-platform revenue tracking with accurate per-stream rates:
  - Spotify: $0.00437/stream
  - Apple Music: $0.00783/stream
  - YouTube: $0.00274/view
  - TikTok: $0.00069/play
  - Instagram: $0.00123/reel
  - Tidal: $0.01284/stream
  - Amazon Music: $0.00402/stream
  - Deezer: $0.00394/stream
- Publishing split calculations (writer/publisher)
- Recording split calculations (artist/label)
- Professional text reports with JSON data exports
- Automatic email delivery to your accountant

### 📱 Social Media Intelligence (`social-media-monitor.js`)
- Real-time monitoring every 30 minutes
- Tracks mentions across Twitter, TikTok, Instagram, YouTube
- Sentiment analysis (positive/neutral/negative)
- Viral trend detection with urgency levels
- Collaboration opportunity identification
- Press/media mention alerts
- Daily summary reports at 8 PM
- Engagement scoring and viral potential calculation

---

## 📋 Quick Start

### 1. Install Dependencies
```bash
cd automation
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
nano .env
# Fill in your API keys and credentials
```

### 3. Start Automation
```bash
# Start all systems
npm start

# Or use PM2 for production (recommended)
npm run pm2:start
```

### 4. Run Individual Systems
```bash
npm run monitor    # Daily performance monitor only
npm run royalty    # Royalty calculator only
npm run social     # Social media monitor only
```

---

## 🔧 PM2 Production Setup

For 24/7 operation on your server:

```bash
# Install PM2 globally
npm install -g pm2

# Start automation with PM2
pm2 start start-automation.js --name goat-automation

# Auto-restart on server reboot
pm2 startup
pm2 save

# View logs
pm2 logs goat-automation

# Monitor
pm2 monit
```

---

## 📁 File Structure

```
automation/
├── start-automation.js      # Master controller - starts all systems
├── daily-monitor.js         # Daily performance monitoring
├── royalty-calculator.js    # Monthly royalty calculations
├── social-media-monitor.js  # Social media intelligence
├── package.json             # Dependencies and scripts
├── .env.example             # Environment variables template
├── .env                     # Your actual credentials (git-ignored)
├── README.md                # This file
├── reports/                 # Generated royalty reports
│   ├── royalty-report-YYYY-MM.txt
│   └── royalty-data-YYYY-MM.json
└── logs/                    # Social media monitoring logs
    └── social-log-YYYY-MM-DD.json
```

---

## 📊 Automation Schedule

| System | Schedule | Description |
|--------|----------|-------------|
| Performance Monitor | Daily 9:00 AM | Track streaming analytics |
| Royalty Calculator | Monthly 1st | Calculate and report royalties |
| Social Monitor | Every 30 min | Track social media mentions |
| Social Summary | Daily 8:00 PM | Daily engagement summary |
| Health Check | Every hour | System status logging |

---

## 🔑 Required API Keys

| Service | Required | Get From |
|---------|----------|----------|
| Supabase | Yes | https://supabase.com/dashboard |
| Spotify | Recommended | https://developer.spotify.com/dashboard |
| YouTube | Recommended | https://console.cloud.google.com/apis |
| Twitter/X | Optional | https://developer.twitter.com |
| Gmail | Recommended | https://myaccount.google.com/apppasswords |

---

## 🛡️ Security Notes

- Never commit your `.env` file to Git
- Use Gmail App Passwords, not your actual password
- Rotate API keys periodically
- Keep Supabase service keys private

---

## 📞 Support

Built for the GOAT Royalty App ecosystem.
Artist: Harvey Miller (DJ Speedy)
Repository: https://github.com/DJSPEEDYGA/GOAT-Royalty-App2

---

*Copyright 2025 Harvey Miller (DJ Speedy) - All Rights Reserved*