/**
 * Loyalty Routes
 *
 * Provides:
 *  GET  /api/loyalty/status       – public status (is system operational?)
 *  POST /api/loyalty/verify       – verify a member key, returns encrypted token
 *  POST /api/loyalty/revoke       – revoke a token (loyalty-token auth required)
 *  POST /api/admin/generate-code  – generate current TOTP (loyalty + MFA required)
 *
 * Sensitive endpoints are protected by:
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

const { LoyaltyGuard } = require('../core/loyalty');
const { generateCurrentTOTP, verifyTOTP } = require('../core/activation');

// ---------------------------------------------------------------------------
// GET /api/loyalty/status
// ---------------------------------------------------------------------------
router.get('/status', (req, res) => {
  const guard = LoyaltyGuard.getInstance();
  res.json({
    success: true,
    operational: guard.isOperational(),
  });
});

// ---------------------------------------------------------------------------
// POST /api/loyalty/verify  – verify member key → issue encrypted token
// Protected by: IP whitelist, intrusion check, rate limit
// ---------------------------------------------------------------------------
router.post(
  '/verify',
  ipWhitelist,
  intrusionCheck,
  sensitiveEndpointLimiter,
  (req, res) => {
    const { memberId, memberKey } = req.body || {};
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      '';

    if (!memberId || !memberKey) {
      return res.status(400).json({
        success: false,
        message: 'memberId and memberKey are required.',
      });
    }

    const guard = LoyaltyGuard.getInstance();

    if (!guard.verifyMember(memberId, memberKey)) {
      recordFailedAttempt(ip);
      logSecure('warn', 'loyalty_verify_failed', { ip, memberId });
      return res.status(401).json({
        success: false,
        message: 'Invalid member credentials.',
      });
    }

    const token = guard.generateToken(memberId);
    logSecure('info', 'loyalty_token_issued', { ip, memberId });

    res.json({ success: true, token });
  }
);

// ---------------------------------------------------------------------------
// POST /api/loyalty/revoke  – revoke a token
// Protected by: IP whitelist, intrusion check, rate limit, loyalty token
// ---------------------------------------------------------------------------
router.post(
  '/revoke',
  ipWhitelist,
  intrusionCheck,
  sensitiveEndpointLimiter,
  requireLoyaltyToken,
  (req, res) => {
    const { token } = req.body || {};
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'token is required.',
      });
    }

    const guard = LoyaltyGuard.getInstance();
    guard.revokeToken(token);
    logSecure('info', 'loyalty_token_revoked', {
      revokedBy: req.loyaltyPayload?.memberId,
    });

    res.json({ success: true, message: 'Token revoked.' });
  }
);

// ---------------------------------------------------------------------------
// POST /api/admin/generate-code  – return current TOTP (admin only)
// Protected by: IP whitelist, intrusion check, rate limit, loyalty token + MFA
// ---------------------------------------------------------------------------
router.post(
  '/admin/generate-code',
  ipWhitelist,
  intrusionCheck,
  sensitiveEndpointLimiter,
  requireLoyaltyToken,
  async (req, res) => {
    const { totpToken } = req.body || {};
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      '';

    if (!totpToken) {
      return res.status(400).json({
        success: false,
        message: 'totpToken is required for admin operations.',
      });
    }

    try {
      if (!(await verifyTOTP(totpToken))) {
        recordFailedAttempt(ip);
        logSecure('warn', 'admin_generate_code_mfa_failed', { ip });
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired MFA token.',
        });
      }
    } catch (err) {
      return res.status(503).json({ success: false, message: err.message });
    }

    try {
      const currentCode = await generateCurrentTOTP();
      logSecure('info', 'admin_code_generated', {
        generatedBy: req.loyaltyPayload?.memberId,
      });
      res.json({ success: true, code: currentCode });
    } catch (err) {
      res.status(503).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
