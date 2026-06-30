'use strict';

require('dotenv').config();

const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const { config, assertSecrets, loadDestinations } = require('./src/config');
const store = require('./src/store');
const audit = require('./src/audit');
const auth = require('./src/auth');

const problems = assertSecrets();
if (problems.length) {
  /* eslint-disable no-console */
  console.error('[goat-investor-epk] refusing to start — configuration problems:');
  problems.forEach((p) => console.error('  - ' + p));
  console.error('Copy .env.example to .env and set strong SESSION_SECRET and ADMIN_TOKEN.');
  process.exit(1);
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', config.trustProxyHops);
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());

const PUBLIC_DIR = path.join(__dirname, 'public');
const EPK_DIR = path.join(PUBLIC_DIR, 'epk');
const SESSION_COOKIE = 'goat_epk_session';
const CHALLENGE_COOKIE = 'goat_epk_challenge';

function cookieOpts(maxAgeMs) {
  return {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'strict',
    maxAge: maxAgeMs,
    path: '/',
  };
}

function clientIp(req) {
  return req.ip || (req.socket && req.socket.remoteAddress) || '';
}

function clientUa(req) {
  return (req.headers['user-agent'] || '').slice(0, 300);
}

// ---- Rate limiters -------------------------------------------------------

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'rate_limited', message: 'Too many attempts. Try again later.' },
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// ---- Auth middleware -----------------------------------------------------

function requireSession(req, res, next) {
  const token = req.cookies[SESSION_COOKIE];
  const payload = token && auth.verifyToken(token, 'session');
  if (!payload) {
    return res.status(401).json({ status: 'unauthenticated' });
  }
  const investor = store.findInvestorByEmail(payload.email);
  if (!investor || investor.status === 'disabled') {
    return res.status(403).json({ status: 'disabled' });
  }
  req.investor = investor;
  next();
}

// Page/asset-friendly gate: redirect browsers to /login instead of a JSON 401
// so the multi-page Living EPK (HTML, media, data, JS) stays fully gated.
function requireSessionRedirect(req, res, next) {
  const token = req.cookies[SESSION_COOKIE];
  const payload = token && auth.verifyToken(token, 'session');
  if (!payload) {
    return res.redirect('/login');
  }
  const investor = store.findInvestorByEmail(payload.email);
  if (!investor || investor.status === 'disabled') {
    return res.redirect('/login');
  }
  req.investor = investor;
  next();
}

function timingSafeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || '';
  if (!token || !timingSafeEqual(token, config.adminToken)) {
    audit.log({ ip: clientIp(req), ua: clientUa(req), stage: 'admin', result: 'denied' });
    return res.status(401).json({ status: 'admin_unauthorized' });
  }
  next();
}

// ---- Page routes (gated) -------------------------------------------------

app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'login.html'));
});

app.get('/portal', (req, res) => res.redirect('/epk/goat-investor-living-epk.html'));

// Harvey's full multi-page Living EPK (HTML pages + media + data + JS) served
// only to authenticated investors. Relative links inside the pages resolve
// under /epk/ so the original design is preserved unchanged.
app.use('/epk', requireSessionRedirect, express.static(EPK_DIR, {
  extensions: ['html'],
  setHeaders(res) {
    res.setHeader('Cache-Control', 'private, max-age=0, no-store');
  },
}));

// A few surfaces linked from the EPK are not yet in the bundle. Route those
// page requests back to the main Living EPK so a click never dead-ends.
app.get(/^\/epk\/[^?]*\.html$/, requireSessionRedirect, (req, res) =>
  res.redirect('/epk/goat-investor-living-epk.html'));

app.get('/admin', (req, res) => {
  // The page is a shell that prompts for the owner token; all data endpoints
  // are protected server-side by requireAdmin.
  res.sendFile(path.join(PUBLIC_DIR, 'admin.html'));
});

// Only static assets are served openly — never the gated HTML or any source.
app.use('/assets', express.static(path.join(PUBLIC_DIR, 'assets'), { maxAge: '1h' }));

// ---- Auth API ------------------------------------------------------------

app.post('/api/login', loginLimiter, (req, res) => {
  const ip = clientIp(req);
  const ua = clientUa(req);
  const { email, password } = req.body || {};
  const investor = store.findInvestorByEmail(email);

  if (!investor || investor.status === 'disabled' || !auth.verifyPassword(password, investor.passHash)) {
    audit.log({ ip, ua, email: email || '', stage: 'password', result: 'fail' });
    // Generic message — do not reveal which factor failed.
    return res.status(401).json({ status: 'invalid_credentials' });
  }

  audit.log({ ip, ua, email: investor.email, stage: 'password', result: 'ok' });

  if (!investor.totpSecret) {
    audit.log({ ip, ua, email: investor.email, stage: 'totp', result: 'not_enrolled' });
    return res.status(409).json({ status: 'totp_not_enrolled', message: '2FA is not set up for this account. Contact the owner.' });
  }

  const challenge = auth.signChallenge(investor.email);
  res.cookie(CHALLENGE_COOKIE, challenge, cookieOpts(5 * 60 * 1000));
  return res.json({ status: 'totp_required' });
});

app.post('/api/verify-2fa', loginLimiter, (req, res) => {
  const ip = clientIp(req);
  const ua = clientUa(req);
  const { code } = req.body || {};
  const challenge = req.cookies[CHALLENGE_COOKIE];
  const payload = challenge && auth.verifyToken(challenge, 'challenge');

  if (!payload) {
    return res.status(401).json({ status: 'challenge_expired' });
  }
  const investor = store.findInvestorByEmail(payload.email);
  if (!investor || investor.status === 'disabled') {
    return res.status(403).json({ status: 'disabled' });
  }

  if (!auth.verifyTotp(code, investor.totpSecret)) {
    audit.log({ ip, ua, email: investor.email, stage: 'totp', result: 'fail' });
    return res.status(401).json({ status: 'invalid_code' });
  }

  // Password + TOTP both passed. Now the IP/approval gate.
  if (config.requireIpApproval && !store.isIpApproved(investor.email, ip)) {
    store.addPendingIp(investor.email, ip, ua);
    audit.log({ ip, ua, email: investor.email, stage: 'ip-approval', result: 'pending' });
    res.clearCookie(CHALLENGE_COOKIE, { path: '/' });
    return res.status(403).json({
      status: 'pending_approval',
      message: 'Your identity is verified, but this IP/device must be approved by the owner before access is granted.',
    });
  }

  const session = auth.signSession(investor.email);
  res.cookie(SESSION_COOKIE, session, cookieOpts(config.sessionTtlMinutes * 60 * 1000));
  res.clearCookie(CHALLENGE_COOKIE, { path: '/' });
  audit.log({ ip, ua, email: investor.email, stage: 'session', result: 'granted' });
  return res.json({ status: 'ok', redirect: '/portal' });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.clearCookie(CHALLENGE_COOKIE, { path: '/' });
  res.json({ status: 'ok' });
});

app.get('/api/me', requireSession, (req, res) => {
  res.json({ status: 'ok', name: req.investor.name, email: req.investor.email });
});

app.get('/api/destinations', requireSession, (req, res) => {
  const dests = loadDestinations().map((d) => ({
    id: d.id,
    name: d.name,
    blurb: d.blurb,
    url: d.url,
    accent: d.accent || '#f2b84b',
  }));
  res.json({ status: 'ok', destinations: dests });
});

// ---- Admin / owner approval API -----------------------------------------

app.get('/api/admin/audit', adminLimiter, requireAdmin, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 200, 1000);
  res.json({ status: 'ok', entries: audit.tail(limit) });
});

app.get('/api/admin/approvals', adminLimiter, requireAdmin, (req, res) => {
  res.json({ status: 'ok', approvals: store.listApprovals() });
});

app.get('/api/admin/investors', adminLimiter, requireAdmin, (req, res) => {
  const list = store.loadInvestors().map((u) => ({
    name: u.name,
    email: u.email,
    status: u.status,
    totpEnrolled: !!u.totpSecret,
    createdAt: u.createdAt || null,
  }));
  res.json({ status: 'ok', investors: list });
});

app.post('/api/admin/approve-ip', adminLimiter, requireAdmin, (req, res) => {
  const { email, ip } = req.body || {};
  if (!email || !ip) return res.status(400).json({ status: 'bad_request' });
  store.approveIp(email, ip);
  audit.log({ ip, email, stage: 'ip-approval', result: 'approved-by-owner' });
  res.json({ status: 'ok' });
});

app.post('/api/admin/revoke-ip', adminLimiter, requireAdmin, (req, res) => {
  const { email, ip } = req.body || {};
  if (!email || !ip) return res.status(400).json({ status: 'bad_request' });
  store.revokeIp(email, ip);
  audit.log({ ip, email, stage: 'ip-approval', result: 'revoked-by-owner' });
  res.json({ status: 'ok' });
});

// ---- Health + fallthrough ------------------------------------------------

app.get('/healthz', (req, res) => res.json({ status: 'ok' }));

app.use((req, res) => res.status(404).json({ status: 'not_found' }));

if (require.main === module) {
  app.listen(config.port, () => {
    /* eslint-disable no-console */
    console.log(`[goat-investor-epk] gate listening on :${config.port}`);
    console.log(`[goat-investor-epk] IP approval gate: ${config.requireIpApproval ? 'ON' : 'OFF'}`);
  });
}

module.exports = app;
