'use strict';

const fs = require('fs');
const { config } = require('./config');

function ensureDir() {
  if (!fs.existsSync(config.dataDir)) fs.mkdirSync(config.dataDir, { recursive: true });
}

// Append-only JSONL audit log. Records who tried to access, from which IP,
// with what result. Never logs passwords or TOTP codes.
function log(event) {
  ensureDir();
  const entry = {
    ts: new Date().toISOString(),
    ip: event.ip || '',
    ua: event.ua || '',
    email: event.email || '',
    stage: event.stage || '',
    result: event.result || '',
    detail: event.detail || '',
  };
  try {
    fs.appendFileSync(config.paths.audit, `${JSON.stringify(entry)}\n`);
  } catch {
    /* audit must never crash the request path */
  }
  return entry;
}

function tail(limit = 200) {
  try {
    const raw = fs.readFileSync(config.paths.audit, 'utf8');
    const lines = raw.split('\n').filter(Boolean);
    return lines
      .slice(-limit)
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .reverse();
  } catch {
    return [];
  }
}

module.exports = { log, tail };
