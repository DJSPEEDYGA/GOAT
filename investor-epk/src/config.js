'use strict';

const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');

function bool(v, dflt) {
  if (v === undefined || v === null || v === '') return dflt;
  return String(v).toLowerCase() === 'true' || v === '1';
}

function int(v, dflt) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : dflt;
}

const config = {
  root: ROOT,
  dataDir: DATA_DIR,
  port: int(process.env.PORT, 4600),
  sessionSecret: process.env.SESSION_SECRET || '',
  adminToken: process.env.ADMIN_TOKEN || '',
  sessionTtlMinutes: int(process.env.SESSION_TTL_MINUTES, 120),
  cookieSecure: bool(process.env.COOKIE_SECURE, false),
  trustProxyHops: int(process.env.TRUST_PROXY_HOPS, 1),
  requireIpApproval: bool(process.env.REQUIRE_IP_APPROVAL, true),
  issuer: 'goat-investor-epk',
  // TOTP / brand label shown in authenticator apps.
  totpIssuer: 'GOAT Royalty EPK',
  paths: {
    investors: path.join(DATA_DIR, 'investors.json'),
    audit: path.join(DATA_DIR, 'audit.log'),
    ipApprovals: path.join(DATA_DIR, 'ip-approvals.json'),
    destinations: path.join(DATA_DIR, 'destinations.json'),
    destinationsExample: path.join(DATA_DIR, 'destinations.example.json'),
  },
};

function assertSecrets() {
  const problems = [];
  if (!config.sessionSecret || config.sessionSecret.length < 16) {
    problems.push('SESSION_SECRET is missing or too short (set a long random value).');
  }
  if (!config.adminToken || config.adminToken.length < 16) {
    problems.push('ADMIN_TOKEN is missing or too short (set a long random value).');
  }
  return problems;
}

function loadDestinations() {
  let file = config.paths.destinations;
  if (!fs.existsSync(file)) file = config.paths.destinationsExample;
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(raw.destinations) ? raw.destinations : [];
  } catch {
    return [];
  }
}

module.exports = { config, assertSecrets, loadDestinations };
