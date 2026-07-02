'use strict';

/*
 * Provision a partner/investor for the gated Living EPK.
 *
 * Usage:
 *   node scripts/add-investor.js --name "Jane Doe" --email jane@fund.com [--password "..."]
 *
 * - If --password is omitted, a strong one is generated and printed ONCE.
 * - A TOTP secret is generated and an enrollment URL + ASCII QR is printed so
 *   the partner can add it to Google Authenticator / Authy / 1Password.
 * - Secrets are written to data/investors.json (gitignored). They are printed
 *   to your terminal only at creation time — capture them now.
 */

require('dotenv').config();
const crypto = require('crypto');
const qrcode = require('qrcode');
const auth = require('../src/auth');
const store = require('../src/store');

function arg(flag, dflt) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
}

function genPassword() {
  // 18 url-safe chars.
  return crypto.randomBytes(14).toString('base64url').slice(0, 18);
}

async function main() {
  const name = arg('--name');
  const email = arg('--email');
  if (!name || !email) {
    console.error('Required: --name "Full Name" --email person@example.com [--password "..."]');
    process.exit(1);
  }

  const existing = store.findInvestorByEmail(email);
  const password = arg('--password', genPassword());
  const passHash = auth.hashPassword(password);
  const totpSecret = auth.newTotpSecret();
  const keyuri = auth.totpKeyUri(email, totpSecret);

  store.upsertInvestor({
    name,
    email,
    passHash,
    totpSecret,
    status: 'active',
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const qr = await qrcode.toString(keyuri, { type: 'terminal', small: true });

  console.log('\n==================== EPK PARTNER PROVISIONED ====================');
  console.log(`Name:      ${name}`);
  console.log(`Email:     ${email}`);
  console.log(`Password:  ${password}   <-- send securely, shown once`);
  console.log(`TOTP key:  ${totpSecret}`);
  console.log('\nScan this QR in an authenticator app (Google Authenticator, Authy, 1Password):\n');
  console.log(qr);
  console.log(`Or paste this otpauth URL:\n${keyuri}`);
  console.log('\nFirst login from a new IP will be held PENDING until you approve it in /admin.');
  console.log('================================================================\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
