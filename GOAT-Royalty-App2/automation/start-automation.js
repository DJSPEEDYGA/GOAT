// GOAT Royalty App - Master Automation Controller
// Starts all automation systems for Harvey Miller (DJ Speedy)
// Usage: node start-automation.js

require('dotenv').config();

const GOATPerformanceMonitor = require('./daily-monitor');
const GOATRoyaltyCalculator = require('./royalty-calculator');
const GOATSocialMonitor = require('./social-media-monitor');

console.log('');
console.log('============================================================');
console.log('  GOAT ROYALTY APP - AUTOMATION SYSTEM');
console.log('  Harvey Miller (DJ Speedy) - Music Empire Management');
console.log('============================================================');
console.log('');

// Validate environment
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
const optionalEnvVars = ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET', 'EMAIL_USER', 'EMAIL_PASS', 'YOUTUBE_API_KEY', 'TWITTER_BEARER_TOKEN'];

console.log('Environment Check:');
requiredEnvVars.forEach(envVar => {
  const status = process.env[envVar] ? 'CONFIGURED' : 'MISSING (using defaults)';
  console.log(`  ${envVar}: ${status}`);
});
optionalEnvVars.forEach(envVar => {
  const status = process.env[envVar] ? 'CONFIGURED' : 'NOT SET';
  console.log(`  ${envVar}: ${status}`);
});
console.log('');

// Initialize all automation systems
const performanceMonitor = new GOATPerformanceMonitor();
const royaltyCalculator = new GOATRoyaltyCalculator();
const socialMonitor = new GOATSocialMonitor();

// Start all monitors
performanceMonitor.startDailyMonitoring();
royaltyCalculator.startMonthlyCalculation();
socialMonitor.startRealTimeMonitoring();

console.log('');
console.log('============================================================');
console.log('  ALL AUTOMATION SYSTEMS ACTIVE');
console.log('============================================================');
console.log('');
console.log('  Daily Performance Monitor   - Runs at 9:00 AM daily');
console.log('  Monthly Royalty Calculator   - Runs 1st of each month');
console.log('  Social Media Intelligence    - Runs every 30 minutes');
console.log('  Daily Social Summary         - Runs at 8:00 PM daily');
console.log('');
console.log('  Monitoring 346 tracks across all platforms');
console.log('  Viral alerts enabled');
console.log('  Royalty reports auto-generated');
console.log('  Social media trends tracked');
console.log('');
console.log('============================================================');
console.log('');

// Health check every hour
setInterval(() => {
  const now = new Date().toLocaleString();
  const memUsage = process.memoryUsage();
  console.log(`[${now}] GOAT Automation Health Check - Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB | Uptime: ${Math.round(process.uptime() / 60)} minutes`);
}, 3600000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('');
  console.log('Shutting down GOAT Royalty Automation System...');
  console.log('All monitors stopped. Your music empire awaits your return.');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('GOAT Automation received termination signal. Shutting down gracefully...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.log('Automation system recovering...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.log('Automation system continuing...');
});