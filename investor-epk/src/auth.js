'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticator } = require('otplib');
const { config } = require('./config');

// Allow 1 step (±30s) of clock drift for TOTP.
authenticator.options = { window: 1 };

function verifyPassword(plain, hash) {
  if (!plain || !hash) return false;
  try {
    return bcrypt.compareSync(plain, hash);
  } catch {
    return false;
  }
}

function hashPassword(plain) {
  return bcrypt.hashSync(plain, 12);
}

function verifyTotp(code, secret) {
  if (!code || !secret) return false;
  try {
    return authenticator.verify({ token: String(code).trim(), secret });
  } catch {
    return false;
  }
}

function newTotpSecret() {
  return authenticator.generateSecret();
}

function totpKeyUri(email, secret) {
  return authenticator.keyuri(email, config.totpIssuer, secret);
}

// "challenge" token: password verified, awaiting 2FA. Short-lived.
function signChallenge(email) {
  return jwt.sign({ email, stage: 'challenge' }, config.sessionSecret, {
    issuer: config.issuer,
    expiresIn: '5m',
  });
}

// "session" token: fully authenticated (password + TOTP + IP approved).
function signSession(email) {
  return jwt.sign({ email, stage: 'session' }, config.sessionSecret, {
    issuer: config.issuer,
    expiresIn: `${config.sessionTtlMinutes}m`,
  });
}

function verifyToken(token, expectedStage) {
  try {
    const payload = jwt.verify(token, config.sessionSecret, { issuer: config.issuer });
    if (expectedStage && payload.stage !== expectedStage) return null;
    return payload;
  } catch {
    return null;
  }
}

module.exports = {
  verifyPassword,
  hashPassword,
  verifyTotp,
  newTotpSecret,
  totpKeyUri,
  signChallenge,
  signSession,
  verifyToken,
};
