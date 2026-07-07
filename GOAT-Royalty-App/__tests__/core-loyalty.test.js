'use strict';

/**
 * Tests for src/core/loyalty.js
 * LoyaltyGuard, encryptData/decryptData, and env-based key validation.
 */

// Set up required env vars BEFORE requiring the module so that LOYALTY_KEYS
// are populated and ENCRYPTION_KEY is present.
const TEST_ENCRYPTION_KEY = 'a'.repeat(64); // 64 hex chars = 32 bytes
process.env.LOYALTY_ENCRYPTION_SECRET = TEST_ENCRYPTION_KEY;
process.env.LOYALTY_KEY_HARVEY = 'harvey-test-key-abc123';
process.env.LOYALTY_KEY_MONEYPENNY = 'moneypenny-test-key-xyz789';

// Reset the singleton before each test so state doesn't bleed across tests.
beforeEach(() => {
  delete require.cache[require.resolve('../src/core/loyalty')];
});

const getLoyalty = () => require('../src/core/loyalty');

describe('encryptData / decryptData', () => {
  test('round-trips a plaintext string', () => {
    const { encryptData, decryptData } = getLoyalty();
    const plaintext = 'hello GOAT world';
    const payload = encryptData(plaintext);
    expect(payload).toHaveProperty('iv');
    expect(payload).toHaveProperty('tag');
    expect(payload).toHaveProperty('ciphertext');
    expect(decryptData(payload)).toBe(plaintext);
  });

  test('produces different ciphertext on each call (unique IV)', () => {
    const { encryptData } = getLoyalty();
    const a = encryptData('same');
    const b = encryptData('same');
    expect(a.iv).not.toBe(b.iv);
    expect(a.ciphertext).not.toBe(b.ciphertext);
  });

  test('throws when LOYALTY_ENCRYPTION_SECRET is missing', () => {
    const savedKey = process.env.LOYALTY_ENCRYPTION_SECRET;
    delete process.env.LOYALTY_ENCRYPTION_SECRET;

    let encryptData;
    jest.isolateModules(() => {
      encryptData = require('../src/core/loyalty').encryptData;
    });

    expect(() => encryptData('test')).toThrow(/LOYALTY_ENCRYPTION_SECRET/);
    process.env.LOYALTY_ENCRYPTION_SECRET = savedKey;
  });
});

describe('LoyaltyGuard', () => {
  test('verifyMember returns true for correct key', () => {
    const { LoyaltyGuard } = getLoyalty();
    const guard = LoyaltyGuard.getInstance();
    expect(guard.verifyMember('harvey', 'harvey-test-key-abc123')).toBe(true);
  });

  test('verifyMember returns false for wrong key', () => {
    const { LoyaltyGuard } = getLoyalty();
    const guard = LoyaltyGuard.getInstance();
    expect(guard.verifyMember('harvey', 'wrong-key')).toBe(false);
  });

  test('verifyMember returns false for unknown memberId', () => {
    const { LoyaltyGuard } = getLoyalty();
    const guard = LoyaltyGuard.getInstance();
    expect(guard.verifyMember('unknown', 'any-key')).toBe(false);
  });

  test('generateToken / verifyToken round-trip', () => {
    const { LoyaltyGuard } = getLoyalty();
    const guard = LoyaltyGuard.getInstance();
    const token = guard.generateToken('harvey');
    expect(typeof token).toBe('string');
    const payload = guard.verifyToken(token);
    expect(payload).not.toBeNull();
    expect(payload.memberId).toBe('harvey');
  });

  test('revokeToken invalidates a previously valid token', () => {
    const { LoyaltyGuard } = getLoyalty();
    const guard = LoyaltyGuard.getInstance();
    const token = guard.generateToken('moneyPenny');
    expect(guard.verifyToken(token)).not.toBeNull();
    guard.revokeToken(token);
    expect(guard.verifyToken(token)).toBeNull();
  });

  test('verifyToken returns null for garbage input', () => {
    const { LoyaltyGuard } = getLoyalty();
    const guard = LoyaltyGuard.getInstance();
    expect(guard.verifyToken('not-a-valid-token')).toBeNull();
  });

  test('isOperational returns true when at least one key is set', () => {
    const { LoyaltyGuard } = getLoyalty();
    const guard = LoyaltyGuard.getInstance();
    expect(guard.isOperational()).toBe(true);
  });
});
