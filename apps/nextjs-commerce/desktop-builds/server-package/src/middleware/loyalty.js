/**
 * Loyalty Middleware
 *
 * Provides:
 *  - IP whitelisting (WHITELISTED_IPS env var, comma-separated)
 *  - Strict rate-limiting for sensitive endpoints
 *  - Intrusion detection with auto-lockdown after repeated failures
 *  - Structured logging via Winston
 */

'use strict';

const rateLimit = require('express-rate-limit');
const winston = require('winston');
const { encryptData } = require('../core/loyalty');

// ---------------------------------------------------------------------------
// Structured logger (Winston)
// ---------------------------------------------------------------------------
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      silent: process.env.NODE_ENV === 'test',
    }),
    // File transport – add more transports (e.g., HTTP, S3) as needed
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5 * 1024 * 1024, // 5 MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 10,
    }),
  ],
});

/**
 * Write a sensitive log entry as an encrypted JSON blob so that PII/secrets
 * do not appear in plain-text log files.
 * Falls back to plain structured logging when LOYALTY_ENCRYPTION_SECRET is
 * not configured (e.g. during local development without full env setup).
 *
 * @param {'info'|'warn'|'error'} level
 * @param {string} event
 * @param {object} meta
 */
function logSecure(level, event, meta = {}) {
  try {
    const plaintext = JSON.stringify({ event, ...meta });
    const encrypted = encryptData(plaintext);
    logger[level]({ encryptedPayload: encrypted });
  } catch {
    // Encryption key not available – log in plain structured form
    logger[level]({ event, ...meta });
  }
}

// ---------------------------------------------------------------------------
// Intrusion detection store
// ---------------------------------------------------------------------------
/** @type {Map<string, { count: number, lockedUntil: number | null }>} */
const intrusionStore = new Map();

const LOCKOUT_THRESHOLD = parseInt(process.env.LOCKOUT_THRESHOLD || '10', 10);
const LOCKOUT_DURATION_MS = parseInt(
  process.env.LOCKOUT_DURATION_MS || String(15 * 60 * 1000), // 15 min default
  10
);

/**
 * Record a failed attempt for an IP address.
 * Returns true if the IP should now be locked out.
 * @param {string} ip
 * @returns {boolean}
 */
function recordFailedAttempt(ip) {
  const entry = intrusionStore.get(ip) || { count: 0, lockedUntil: null };
  entry.count += 1;

  if (entry.count >= LOCKOUT_THRESHOLD) {
    entry.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    logSecure('warn', 'intrusion_lockdown', { ip, attempts: entry.count });
  }

  intrusionStore.set(ip, entry);
  return entry.lockedUntil !== null && Date.now() < entry.lockedUntil;
}

/**
 * Check whether an IP is currently locked out.
 * Automatically clears expired lockouts.
 * @param {string} ip
 * @returns {boolean}
 */
function isLockedOut(ip) {
  const entry = intrusionStore.get(ip);
  if (!entry || entry.lockedUntil === null) return false;
  if (Date.now() > entry.lockedUntil) {
    // Lock has expired – clear the record
    intrusionStore.delete(ip);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// IP Whitelisting middleware
// ---------------------------------------------------------------------------

/**
 * Parse the WHITELISTED_IPS environment variable into a Set.
 * @returns {Set<string>}
 */
function getWhitelistedIPs() {
  const raw = process.env.WHITELISTED_IPS || '';
  return new Set(
    raw
      .split(',')
      .map((ip) => ip.trim())
      .filter(Boolean)
  );
}

/**
 * Middleware: only allow requests from whitelisted IPs.
 * When WHITELISTED_IPS is empty/unset, the middleware passes all requests
 * (so the app still works in dev without that variable set).
 */
function ipWhitelist(req, res, next) {
  const whitelist = getWhitelistedIPs();
  if (whitelist.size === 0) return next(); // no restriction configured

  const clientIP =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    '';

  if (!whitelist.has(clientIP)) {
    logSecure('warn', 'ip_whitelist_denied', { ip: clientIP, path: req.path });
    recordFailedAttempt(clientIP);
    return res.status(403).json({
      success: false,
      message: 'Access denied: IP not whitelisted.',
    });
  }

  next();
}

// ---------------------------------------------------------------------------
// Intrusion-detection middleware
// ---------------------------------------------------------------------------

/**
 * Middleware: block IPs that have been locked out by intrusion detection.
 */
function intrusionCheck(req, res, next) {
  const clientIP =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    '';

  if (isLockedOut(clientIP)) {
    logSecure('warn', 'intrusion_blocked', { ip: clientIP, path: req.path });
    return res.status(429).json({
      success: false,
      message:
        'Access temporarily locked due to repeated unauthorized attempts.',
    });
  }

  next();
}

// ---------------------------------------------------------------------------
// Strict rate limiter for sensitive endpoints
// ---------------------------------------------------------------------------
const sensitiveEndpointLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.SENSITIVE_RATE_LIMIT || '20', 10),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const clientIP =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      '';
    recordFailedAttempt(clientIP);
    logSecure('warn', 'rate_limit_exceeded', { ip: clientIP, path: req.path });
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
    });
  },
});

// ---------------------------------------------------------------------------
// Loyalty token verification middleware
// ---------------------------------------------------------------------------
const { LoyaltyGuard } = require('../core/loyalty');

/**
 * Middleware: verify a loyalty token passed in the Authorization header.
 * Header format: `Loyalty <base64-token>`
 */
function requireLoyaltyToken(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Loyalty ')) {
    recordFailedAttempt(
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.socket?.remoteAddress ||
        ''
    );
    return res.status(401).json({
      success: false,
      message: 'Loyalty token required.',
    });
  }

  const token = header.slice('Loyalty '.length);
  const guard = LoyaltyGuard.getInstance();
  const payload = guard.verifyToken(token);

  if (!payload) {
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      '';
    recordFailedAttempt(ip);
    logSecure('warn', 'invalid_loyalty_token', { ip, path: req.path });
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired loyalty token.',
    });
  }

  req.loyaltyPayload = payload;
  next();
}

module.exports = {
  logger,
  logSecure,
  ipWhitelist,
  intrusionCheck,
  sensitiveEndpointLimiter,
  requireLoyaltyToken,
  recordFailedAttempt,
  isLockedOut,
};
