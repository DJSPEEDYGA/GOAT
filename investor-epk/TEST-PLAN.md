# Test Plan — Gated Investor Living EPK (PR #2)

Target: local server `http://localhost:4600` (deployment to staging/prod is pending SSH; out of scope here).
Partner: `jane@fund.com` / `Test1234!pw`, TOTP secret `AZCSY5YBJIKXMUDJ`. Owner token from `.env`.
Precondition: `data/ip-approvals.json` reset to `{}` so the first login lands in PENDING.

Each step proves a gate that a broken implementation would fail visibly.

## Test 1 — Password gate rejects bad credentials
- Go to `/login`. Enter `jane@fund.com` + wrong password `nope`. Submit.
- PASS: stays on password step, red banner "Invalid email or password.", no TOTP step shown.
- (Broken impl would advance or grant access.)

## Test 2 — Correct password advances to 2FA (does NOT grant access)
- Enter `jane@fund.com` + `Test1234!pw`. Submit.
- PASS: view switches to "Two-factor verification" with a 6-digit code input. No portal yet, URL still `/login`.

## Test 3 — Wrong TOTP code is rejected
- On the 2FA step, type `000000`. Submit.
- PASS: red banner "Invalid code. Try again.", still on 2FA step, not redirected.

## Test 4 — Correct TOTP from new IP is held PENDING (the trace+approve gate)
- Type the current valid TOTP code (generated from the secret). Submit.
- PASS: amber banner stating identity verified but device/IP must be approved by the owner. URL still `/login`; NOT redirected to `/portal`.
- (Broken impl would grant the session here, defeating the approval requirement.)

## Test 5 — Portal is unreachable without a session
- Navigate directly to `/portal`.
- PASS: redirected to `/login` (no tiles, no content rendered).

## Test 6 — Owner console shows the pending request and approves it
- Go to `/admin`. Enter the owner token, unlock.
- PASS: "Pending access requests" lists `jane@fund.com` with the IP and timestamp; audit table shows prior `password ok`, `totp fail`, `ip-approval pending` rows.
- Click "Approve" for that row.
- PASS: row moves out of Pending; "Approved IPs" now lists the IP; audit gains an `approved-by-owner` row.

## Test 7 — After approval, full login reaches the locked-down portal
- Return to `/login`. Enter password, then a fresh valid TOTP code.
- PASS: redirected to `/portal`. Header shows "Jane Investor · jane@fund.com".
- PASS: exactly the configured tiles render (GOAT Royalty App, Anigo Alley, GOAT Casino, Halito Chat, GOAT City RP, Public Tools & LLMs) — and nothing referencing source/admin/vault. Each tile is a launch link to its destination URL.
- Click "Sign out" → returns to `/login`; visiting `/portal` again redirects to `/login`.
