# GOAT Royalty — Gated Investor Living EPK

A self-contained gate that sits in front of the GOAT ecosystem for investors and
approved partners. It enforces **password + TOTP 2FA + IP tracing + owner
approval** before granting access, then shows a launcher with **only** the
allowed destinations. No source code, admin systems, API vault, or secrets are
reachable through this app.

## What a partner can reach (and nothing else)

After full authentication the portal shows launch tiles for the destinations
configured in `data/destinations.json`:

- GOAT Royalty App
- Anigo Alley
- GOAT Casino
- Halito Chat
- GOAT City RP (GTA 5/6)
- Public Tools & LLMs

Every other route returns `404`/`401`. The HTML for the portal and admin console
is only served to authenticated/owner requests; static assets are limited to
`/assets`.

## Security model

1. **Password** — bcrypt-hashed, never logged.
2. **TOTP 2FA** — `otplib`, enrolled at provisioning via QR code. Required on
   every login; a short-lived challenge cookie bridges step 1 → step 2.
3. **IP tracing + owner approval** — every attempt is appended to
   `data/audit.log` (JSONL: time, IP, user-agent, stage, result). A new IP for a
   partner is held **pending** until the owner approves it in `/admin`
   (`REQUIRE_IP_APPROVAL=true`).
4. **Sessions** — signed JWT in an httpOnly, SameSite=strict cookie; TTL via
   `SESSION_TTL_MINUTES`.
5. **Owner console** — `/admin` is protected by `ADMIN_TOKEN` (constant-time
   compare); shows pending requests, approved IPs, and the full audit trail.
6. **Rate limiting** — login/verify endpoints are rate-limited per IP.

## Quick start (local)

```bash
cd investor-epk
npm install
cp .env.example .env
# Generate secrets:
node -e "console.log('SESSION_SECRET='+require('crypto').randomBytes(48).toString('hex'))"
node -e "console.log('ADMIN_TOKEN='+require('crypto').randomBytes(48).toString('hex'))"
# Paste those into .env, then provision a partner:
npm run add-investor -- --name "Jane Investor" --email jane@fund.com
# (prints a one-time password + a QR code to scan into an authenticator app)
npm start
# open http://localhost:4600
```

First login from a new IP will say "awaiting owner approval". Open `/admin`,
enter the `ADMIN_TOKEN`, and approve the pending IP — then the partner gets in.

## Configure destinations

Copy `data/destinations.example.json` to `data/destinations.json` and edit URLs
to match the target server (staging `2.25.68.216` or prod `72.61.193.184`).
If `destinations.json` is absent the app falls back to the example file.

## Deploy (nginx + systemd)

```bash
# On the server:
sudo mkdir -p /opt/goat-investor-epk
# copy app files (everything except node_modules/.env/data secrets) to /opt/goat-investor-epk
cd /opt/goat-investor-epk
npm ci --omit=dev
cp .env.example .env && edit .env   # strong SESSION_SECRET + ADMIN_TOKEN, COOKIE_SECURE=true

sudo cp deploy/goat-investor-epk.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now goat-investor-epk

sudo cp deploy/nginx-investor-epk.conf /etc/nginx/sites-available/goat-investor-epk
sudo ln -s /etc/nginx/sites-available/goat-investor-epk /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
# then: sudo certbot --nginx -d epk.yourdomain.com
```

## Files

```
server.js                     Express app — routes, gating, rate limits
src/config.js                 Env config + destination loader
src/auth.js                   bcrypt, TOTP (otplib), JWT challenge/session
src/store.js                  investors + IP approvals (atomic JSON)
src/audit.js                  append-only JSONL audit log + tail
scripts/add-investor.js       provision a partner (password + TOTP QR)
public/login.html + js        password -> 2FA flow
public/portal.html + js       launcher tiles (allowed destinations only)
public/admin.html + js        owner console (approvals + audit)
deploy/*.service, *.conf      systemd + nginx
data/*                        runtime data (gitignored secrets)
```
