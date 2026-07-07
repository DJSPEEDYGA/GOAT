/**
 * Activation Routes
 *
 * Provides:
 *  GET  /api/activation/status   – current activation status
 *  POST /api/activation/activate – activate the system (code + TOTP)
 *  POST /api/activation/deactivate – deactivate (TOTP required)
 *  POST /api/activation/recover  – recover via offline key + TOTP
 *
 * All mutating endpoints are protected by:
 *  - IP whitelisting
 *  - Intrusion-detection lockout
 *  - Strict rate-limiting
 *  - Loyalty-token verification
 */

'use strict';

const router = require('express').Router();

const {
  ipWhitelist,
  intrusionCheck,
  sensitiveEndpointLimiter,
  requireLoyaltyToken,
  recordFailedAttempt,
  logSecure,
} = require('../middleware/loyalty');

const { ActivationManager } = require('../core/activation');

// ---------------------------------------------------------------------------
// GET /api/activation/status  – safe to expose without auth
// ---------------------------------------------------------------------------
router.get('/status', (req, res) => {
  res.json({ success: true, ...ActivationManager.getStatus() });
});

// ---------------------------------------------------------------------------
// POST /api/activation/activate
// ---------------------------------------------------------------------------
router.post(
  '/activate',
  ipWhitelist,
  intrusionCheck,
  sensitiveEndpointLimiter,
  requireLoyaltyToken,
  async (req, res) => {
    const { activationCode, totpToken } = req.body || {};
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      '';

    if (!activationCode || !totpToken) {
      return res.status(400).json({
        success: false,
        message: 'activationCode and totpToken are required.',
      });
    }

    try {
      const result = await ActivationManager.activate({
        activationCode,
        totpToken,
        activatedBy: req.loyaltyPayload?.memberId || 'unknown',
      });

      if (!result.success) {
        recordFailedAttempt(ip);
        logSecure('warn', 'activation_failed', {
          ip,
          reason: result.message,
        });
        return res.status(401).json({ success: false, message: result.message });
      }

      logSecure('info', 'system_activated', {
        ip,
        activatedBy: req.loyaltyPayload?.memberId,
      });
      res.json({ success: true, message: result.message });
    } catch (err) {
      res.status(503).json({ success: false, message: err.message });
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/activation/deactivate
// ---------------------------------------------------------------------------
router.post(
  '/deactivate',
  ipWhitelist,
  intrusionCheck,
  sensitiveEndpointLimiter,
  requireLoyaltyToken,
  async (req, res) => {
    const { totpToken, dormantUntil } = req.body || {};

    if (!totpToken) {
      return res.status(400).json({
        success: false,
        message: 'totpToken is required.',
      });
    }

    try {
      const result = await ActivationManager.deactivate({ totpToken, dormantUntil });

      if (!result.success) {
        const ip =
          req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
          req.socket?.remoteAddress ||
          '';
        recordFailedAttempt(ip);
        return res
          .status(401)
          .json({ success: false, message: result.message });
      }

      logSecure('info', 'system_deactivated', {
        deactivatedBy: req.loyaltyPayload?.memberId,
      });
      res.json({ success: true, message: result.message });
    } catch (err) {
      res.status(503).json({ success: false, message: err.message });
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/activation/recover  – offline key + TOTP recovery
// Only Harvey (or Apex) should hold the offline recovery key
// ---------------------------------------------------------------------------
router.post(
  '/recover',
  ipWhitelist,
  intrusionCheck,
  sensitiveEndpointLimiter,
  async (req, res) => {
    const { offlineKey, totpToken } = req.body || {};
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      '';

    if (!offlineKey || !totpToken) {
      return res.status(400).json({
        success: false,
        message: 'offlineKey and totpToken are required.',
      });
    }

    try {
      const result = await ActivationManager.recover({ offlineKey, totpToken });

      if (!result.success) {
        recordFailedAttempt(ip);
        logSecure('warn', 'recovery_failed', { ip, reason: result.message });
        return res
          .status(401)
          .json({ success: false, message: result.message });
      }

      logSecure('info', 'system_recovered', { ip });
      res.json({ success: true, message: result.message });
    } catch (err) {
      res.status(503).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
