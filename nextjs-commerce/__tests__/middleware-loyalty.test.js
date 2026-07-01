'use strict';

/**
 * Tests for src/middleware/loyalty.js
 * Intrusion detection, IP whitelist, and rate-limiter configuration.
 */

process.env.LOYALTY_ENCRYPTION_SECRET = 'b'.repeat(64);
process.env.LOYALTY_KEY_HARVEY = 'harvey-test-key-abc123';

beforeEach(() => {
  // Reset module cache so intrusionStore starts fresh
  jest.resetModules();
});

describe('recordFailedAttempt / isLockedOut', () => {
  test('not locked out before reaching threshold', () => {
    process.env.LOCKOUT_THRESHOLD = '5';
    const { recordFailedAttempt, isLockedOut } = require('../src/middleware/loyalty');
    const ip = '10.0.0.1';
    for (let i = 0; i < 4; i++) {
      recordFailedAttempt(ip);
    }
    expect(isLockedOut(ip)).toBe(false);
  });

  test('locks out after reaching threshold', () => {
    process.env.LOCKOUT_THRESHOLD = '3';
    const { recordFailedAttempt, isLockedOut } = require('../src/middleware/loyalty');
    const ip = '10.0.0.2';
    for (let i = 0; i < 3; i++) {
      recordFailedAttempt(ip);
    }
    expect(isLockedOut(ip)).toBe(true);
  });

  test('different IPs are tracked independently', () => {
    process.env.LOCKOUT_THRESHOLD = '2';
    const { recordFailedAttempt, isLockedOut } = require('../src/middleware/loyalty');
    const ip1 = '192.168.1.1';
    const ip2 = '192.168.1.2';
    recordFailedAttempt(ip1);
    recordFailedAttempt(ip1);
    expect(isLockedOut(ip1)).toBe(true);
    expect(isLockedOut(ip2)).toBe(false);
  });
});

describe('ipWhitelist middleware', () => {
  test('passes all requests when WHITELISTED_IPS is empty', () => {
    delete process.env.WHITELISTED_IPS;
    const { ipWhitelist } = require('../src/middleware/loyalty');
    const next = jest.fn();
    const req = { headers: {}, socket: { remoteAddress: '1.2.3.4' }, path: '/test' };
    const res = {};
    ipWhitelist(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('blocks requests from non-whitelisted IPs', () => {
    process.env.WHITELISTED_IPS = '127.0.0.1,10.0.0.1';
    const { ipWhitelist } = require('../src/middleware/loyalty');
    const next = jest.fn();
    const req = {
      headers: {},
      socket: { remoteAddress: '1.2.3.4' },
      path: '/api/loyalty/verify',
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    ipWhitelist(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('allows requests from whitelisted IPs', () => {
    process.env.WHITELISTED_IPS = '127.0.0.1';
    const { ipWhitelist } = require('../src/middleware/loyalty');
    const next = jest.fn();
    const req = {
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
      path: '/api/loyalty/verify',
    };
    const res = {};
    ipWhitelist(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
