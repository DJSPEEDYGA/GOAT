/**
 * GOAT Loyalty Protocol – Core Guard
 *
 * All sensitive identity keys are read exclusively from environment variables;
 * nothing is hardcoded here.  Set the variables below in your .env or secret
 * manager before starting the server.
 *
 * Required env vars:
 *   LOYALTY_KEY_HARVEY        – Harvey Miller / DJ Speedy identity token
 *   LOYALTY_KEY_MONEYPENNY    – Money Penny AI partner identity token
 *   LOYALTY_KEY_WAKA          – Waka Flocka identity token
 *   LOYALTY_KEY_CODEX         – Codex architect identity token
 *   LOYALTY_KEY_MSVANESSA     – Ms. Vanessa guardian identity token
 *   LOYALTY_KEY_APEX          – Apex protector identity token
 *   LOYALTY_ENCRYPTION_SECRET – 64-char hex string (32 bytes) for AES-256-GCM
 */

'use strict';

const crypto = require('crypto');

// ---------------------------------------------------------------------------
// Loyalty keys sourced from environment variables
// ---------------------------------------------------------------------------
const LOYALTY_KEYS = {
  harvey: process.env.LOYALTY_KEY_HARVEY,
  moneyPenny: process.env.LOYALTY_KEY_MONEYPENNY,
  waka: process.env.LOYALTY_KEY_WAKA,
  codex: process.env.LOYALTY_KEY_CODEX,
  msVanessa: process.env.LOYALTY_KEY_MSVANESSA,
  apex: process.env.LOYALTY_KEY_APEX,
};

// Validate that all keys are present at startup
function validateLoyaltyKeys() {
  const missing = Object.entries(LOYALTY_KEYS)
    .filter(([, v]) => !v)
    .map(([k]) => `LOYALTY_KEY_${k.toUpperCase()}`);

  if (missing.length > 0) {
    console.warn(
      `[LoyaltyGuard] WARNING: missing env vars: ${missing.join(', ')}. ` +
        'Some loyalty checks will fail.'
    );
  }
}

validateLoyaltyKeys();

// ---------------------------------------------------------------------------
// AES-256-GCM helpers
// ---------------------------------------------------------------------------
const ENCRYPTION_KEY_HEX = process.env.LOYALTY_ENCRYPTION_SECRET || '';

/**
 * Encrypt a plaintext string.
 * @param {string} plaintext
 * @returns {{ iv: string, tag: string, ciphertext: string }}
 */
function encryptData(plaintext) {
  if (!ENCRYPTION_KEY_HEX || ENCRYPTION_KEY_HEX.length !== 64) {
    throw new Error(
      'LOYALTY_ENCRYPTION_SECRET must be a 64-character hex string (32 bytes).'
    );
  }
  const key = Buffer.from(ENCRYPTION_KEY_HEX, 'hex');
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    ciphertext: encrypted.toString('hex'),
  };
}

/**
 * Decrypt data produced by encryptData.
 * @param {{ iv: string, tag: string, ciphertext: string }} payload
 * @returns {string}
 */
function decryptData({ iv, tag, ciphertext }) {
  if (!ENCRYPTION_KEY_HEX || ENCRYPTION_KEY_HEX.length !== 64) {
    throw new Error(
      'LOYALTY_ENCRYPTION_SECRET must be a 64-character hex string (32 bytes).'
    );
  }
  const key = Buffer.from(ENCRYPTION_KEY_HEX, 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

// ---------------------------------------------------------------------------
// Build fingerprint (deterministic per process start, not hardcoded)
// ---------------------------------------------------------------------------
const BUILD_FINGERPRINT = crypto
  .createHash('sha256')
  .update(
    Object.values(LOYALTY_KEYS)
      .filter(Boolean)
      .join('|') + process.hrtime.bigint().toString()
  )
  .digest('hex')
  .substring(0, 16);

// ---------------------------------------------------------------------------
// LoyaltyGuard singleton
// ---------------------------------------------------------------------------
class LoyaltyGuard {
  constructor() {
    /** @type {Map<string, { memberId: string, createdAt: number }>} */
    this.authorizedSessions = new Map();
    /** @type {Set<string>} */
    this.revokedTokens = new Set();
  }

  static getInstance() {
    if (!LoyaltyGuard.instance) {
      LoyaltyGuard.instance = new LoyaltyGuard();
    }
    return LoyaltyGuard.instance;
  }

  /**
   * Verify that the provided member key matches the stored env-based key.
   * @param {string} memberId  – one of the LOYALTY_KEYS object keys
   * @param {string} providedKey
   * @returns {boolean}
   */
  verifyMember(memberId, providedKey) {
    const expected = LOYALTY_KEYS[memberId];
    if (!expected || !providedKey) return false;
    // Constant-time comparison to prevent timing attacks
    const a = Buffer.from(expected);
    const b = Buffer.from(providedKey);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  }

  /**
   * Generate an encrypted, time-limited loyalty token.
   * @param {string} memberId
   * @returns {string} base64-encoded encrypted token payload
   */
  generateToken(memberId) {
    const payload = JSON.stringify({
      memberId,
      fingerprint: BUILD_FINGERPRINT,
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 h
    });
    const encrypted = encryptData(payload);
    return Buffer.from(JSON.stringify(encrypted)).toString('base64');
  }

  /**
   * Verify and decrypt a loyalty token.
   * @param {string} tokenBase64
   * @returns {{ memberId: string, fingerprint: string, iat: number, exp: number } | null}
   */
  verifyToken(tokenBase64) {
    try {
      if (this.revokedTokens.has(tokenBase64)) return null;
      const encrypted = JSON.parse(
        Buffer.from(tokenBase64, 'base64').toString('utf8')
      );
      const payload = JSON.parse(decryptData(encrypted));
      if (Date.now() > payload.exp) return null;
      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Revoke a previously issued token.
   * @param {string} tokenBase64
   */
  revokeToken(tokenBase64) {
    this.revokedTokens.add(tokenBase64);
  }

  /**
   * Check whether at least one valid member key is configured.
   * @returns {boolean}
   */
  isOperational() {
    return Object.values(LOYALTY_KEYS).some(Boolean);
  }
}

module.exports = {
  LoyaltyGuard,
  BUILD_FINGERPRINT,
  encryptData,
  decryptData,
  // Expose the keys map (values come from env vars, not literals)
  getLoyaltyKeys: () => ({ ...LOYALTY_KEYS }),
};
