/**
 * GOAT Activation System – Core
 *
 * Handles system activation, TOTP-based MFA verification, and offline
 * recovery.  All secrets are read from environment variables.
 *
 * Required env vars:
 *   ACTIVATION_HASH            – SHA-256 hex hash of the master activation code
 *   TOTP_SECRET                – Base32-encoded TOTP secret (RFC 6238)
 *   RECOVERY_OFFLINE_KEY       – Offline recovery key (hashed at verification)
 *   LOYALTY_ENCRYPTION_SECRET  – Shared with loyalty.js for AES-256-GCM
 */

'use strict';

const crypto = require('crypto');
const { generate: totpGenerate, verify: totpVerify } = require('otplib');
const { encryptData, decryptData } = require('./loyalty');

// ---------------------------------------------------------------------------
// Activation state (in-memory; replace with DB persistence in production)
// ---------------------------------------------------------------------------
let activationState = {
  activated: false,
  activatedAt: null,
  activatedBy: null,
  dormantUntil: null,
};

// ---------------------------------------------------------------------------
// TOTP helpers
// ---------------------------------------------------------------------------

/**
 * Verify a TOTP token against the configured secret.
 * @param {string} token  – 6-digit OTP provided by the user
 * @returns {Promise<boolean>}
 */
async function verifyTOTP(token) {
  const secret = process.env.TOTP_SECRET;
  if (!secret) {
    throw new Error('TOTP_SECRET environment variable is not set.');
  }
  const result = await totpVerify({ token, secret, window: 1 });
  return result.valid === true;
}

/**
 * Generate the current TOTP token (useful for testing / admin tooling).
 * NEVER expose this via a public API endpoint.
 * @returns {Promise<string>}
 */
async function generateCurrentTOTP() {
  const secret = process.env.TOTP_SECRET;
  if (!secret) {
    throw new Error('TOTP_SECRET environment variable is not set.');
  }
  return totpGenerate({ secret });
}

// ---------------------------------------------------------------------------
// Activation hash helpers
// ---------------------------------------------------------------------------

/**
 * Hash an activation code with SHA-256.
 * @param {string} code
 * @returns {string} hex digest
 */
function hashActivationCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

/**
 * Verify an activation code against ACTIVATION_HASH env var.
 * @param {string} code
 * @returns {boolean}
 */
function verifyActivationCode(code) {
  const expectedHash = process.env.ACTIVATION_HASH;
  if (!expectedHash) {
    throw new Error('ACTIVATION_HASH environment variable is not set.');
  }
  const providedHash = hashActivationCode(code);
  // Constant-time comparison
  const a = Buffer.from(expectedHash.padEnd(64, '0'));
  const b = Buffer.from(providedHash.padEnd(64, '0'));
  return crypto.timingSafeEqual(a, b);
}

// ---------------------------------------------------------------------------
// Recovery helpers
// ---------------------------------------------------------------------------

/**
 * Verify an offline recovery key against RECOVERY_OFFLINE_KEY env var.
 * The env var should store the SHA-256 hash of the actual offline key.
 * @param {string} providedKey
 * @returns {boolean}
 */
function verifyRecoveryKey(providedKey) {
  const storedHash = process.env.RECOVERY_OFFLINE_KEY;
  if (!storedHash) {
    throw new Error('RECOVERY_OFFLINE_KEY environment variable is not set.');
  }
  const providedHash = hashActivationCode(providedKey);
  const a = Buffer.from(storedHash.padEnd(64, '0'));
  const b = Buffer.from(providedHash.padEnd(64, '0'));
  return crypto.timingSafeEqual(a, b);
}

// ---------------------------------------------------------------------------
// Activation manager
// ---------------------------------------------------------------------------
class ActivationManager {
  /**
   * Attempt to activate the system.
   * Requires: valid activation code AND valid TOTP token.
   * @param {{ activationCode: string, totpToken: string, activatedBy: string }} params
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  static async activate({ activationCode, totpToken, activatedBy }) {
    if (activationState.activated) {
      return { success: false, message: 'System is already activated.' };
    }

    if (!verifyActivationCode(activationCode)) {
      return { success: false, message: 'Invalid activation code.' };
    }

    if (!(await verifyTOTP(totpToken))) {
      return { success: false, message: 'Invalid or expired TOTP token.' };
    }

    activationState = {
      activated: true,
      activatedAt: new Date().toISOString(),
      activatedBy: activatedBy || 'unknown',
      dormantUntil: null,
    };

    return { success: true, message: 'System activated successfully.' };
  }

  /**
   * Deactivate (put into dormant mode) the system.
   * Requires a valid TOTP token.
   * @param {{ totpToken: string, dormantUntil?: string }} params
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  static async deactivate({ totpToken, dormantUntil }) {
    if (!(await verifyTOTP(totpToken))) {
      return { success: false, message: 'Invalid or expired TOTP token.' };
    }

    activationState = {
      ...activationState,
      activated: false,
      dormantUntil: dormantUntil || null,
    };

    return { success: true, message: 'System deactivated.' };
  }

  /**
   * Recover access using an offline key + TOTP.
   * Resets activation state so a fresh activation can be performed.
   * @param {{ offlineKey: string, totpToken: string }} params
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  static async recover({ offlineKey, totpToken }) {
    if (!verifyRecoveryKey(offlineKey)) {
      return { success: false, message: 'Invalid offline recovery key.' };
    }

    if (!(await verifyTOTP(totpToken))) {
      return { success: false, message: 'Invalid or expired TOTP token.' };
    }

    activationState = {
      activated: false,
      activatedAt: null,
      activatedBy: null,
      dormantUntil: null,
    };

    return {
      success: true,
      message: 'Recovery successful. System reset to deactivated state.',
    };
  }

  /**
   * Return the current activation status (safe to expose to callers).
   * @returns {{ activated: boolean, activatedAt: string|null, dormantUntil: string|null }}
   */
  static getStatus() {
    return {
      activated: activationState.activated,
      activatedAt: activationState.activatedAt,
      dormantUntil: activationState.dormantUntil,
    };
  }

  /**
   * Encrypt a sensitive runtime value for secure storage/transit.
   * @param {string} value
   * @returns {string} base64-encoded encrypted payload
   */
  static encryptRuntimeValue(value) {
    const encrypted = encryptData(value);
    return Buffer.from(JSON.stringify(encrypted)).toString('base64');
  }

  /**
   * Decrypt a value produced by encryptRuntimeValue.
   * @param {string} base64Payload
   * @returns {string}
   */
  static decryptRuntimeValue(base64Payload) {
    const encrypted = JSON.parse(
      Buffer.from(base64Payload, 'base64').toString('utf8')
    );
    return decryptData(encrypted);
  }
}

module.exports = {
  ActivationManager,
  verifyTOTP,
  generateCurrentTOTP,
  verifyActivationCode,
  verifyRecoveryKey,
  hashActivationCode,
};
