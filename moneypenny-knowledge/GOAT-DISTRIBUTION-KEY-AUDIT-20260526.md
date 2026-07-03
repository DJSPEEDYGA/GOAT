# GOAT Distribution Key Audit - 2026-05-26

This audit is intentionally redacted. It records which systems are wired and which secret slots are present without storing or displaying secret values.

## Bottom Line

- The public GitHub PR/comment scan did not reveal actual distribution API key values.
- The GOAT royalty, payment, and distribution code is still present locally.
- The main app env files contain active core server secrets for Mongo/JWT/session/Hostinger/OpenAI.
- The API proxy distribution provider secrets are not fully loaded in `api-server/.env`; only `api-server/.env.example` exists in the inspected API proxy folder.
- The API proxy and browser wrapper were hardened so provider secrets stay server-side.

## Distribution Connectors

Code present:

- Spotify catalog/search and artist analytics proxy.
- TikTok OAuth/user/video routes.
- DistroKid-style release, earnings, stats, and upload proxy routes.
- Apple Music catalog search and artist proxy routes.
- YouTube search, channel, and upload proxy routes.
- Multi-platform `/api/distribute` orchestration route.

Provider secret slots present in `api-server/.env.example`:

- `GOAT_OWNER_API_KEY`
- `TIKTOK_CLIENT_KEY`
- `TIKTOK_CLIENT_SECRET`
- `TIKTOK_ACCESS_TOKEN`
- `TIKTOK_REFRESH_TOKEN`
- `DISTROKID_EMAIL`
- `DISTROKID_BEARER_TOKEN`
- `DISTROKID_API_KEY`
- `DISTROKID_USER_ID`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_ARTIST_ID`
- `APPLE_TEAM_ID`
- `APPLE_KEY_ID`
- `APPLE_PRIVATE_KEY`
- `APPLE_DEVELOPER_TOKEN`
- `YOUTUBE_API_KEY`
- `YOUTUBE_OAUTH_CLIENT_ID`
- `YOUTUBE_OAUTH_CLIENT_SECRET`
- `YOUTUBE_OAUTH_TOKEN`
- `YOUTUBE_CHANNEL_ID`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Security Changes Applied

- Added an owner API gate to the API proxy.
- Accepted owner key headers:
  - `X-GOAT-Owner-Key`
  - `X-API-Key`
  - `Authorization: Bearer <key>`
- Restricted CORS to configured `CORS_ORIGIN`, with localhost/file-origin support for local testing.
- Changed `/api/health` so provider service status is only shown to owner-authorized requests.
- Changed `/api/spotify/token` so it verifies server-side token availability without returning the access token to the browser.
- Removed browser-provided TikTok and YouTube token headers from the server path.
- Added server-only env checks before upstream provider calls.
- Added route compatibility aliases for existing client code:
  - `/api/tiktok/user`
  - `POST /api/tiktok/videos/list`
  - `/api/tiktok/upload`
  - `/api/distrokid/releases/:id`
  - `/api/distrokid/stats`
  - `/api/distrokid/upload`
  - `/api/apple/artists/:storefront/:id`
- Updated the browser integration wrapper to call the secured API proxy instead of sending provider secrets from local browser storage.
- Added a browser owner-key control to `api-vault.html`.
- Removed the third-party `ninja-daytona-script.js` loader from local GOAT HTML pages because any script running on the same origin could read browser storage.
- Updated branding helper scripts so they do not reinsert that third-party script.

## Files Hardened

- `Shared/Goat Royalty App Ultimate/nextjs-commerce-main/api-server/server.js`
- `Shared/Goat Royalty App Ultimate/GOAT_ROYALTY_APP/api-server/server.js`
- `Shared/Goat Royalty App Ultimate/GOAT_ROYALTY_APP/GOAT-Royalty-App/api-server/server.js`
- `Shared/Goat Royalty App Ultimate/GOAT_ROYALTY_APP/apps/GOAT-Royalty-App/api-server/server.js`
- `Shared/Goat Royalty App Ultimate/nextjs-commerce-main/api-server/.env.example`
- `Shared/Goat Royalty App Ultimate/nextjs-commerce-main/api-server/README.md`
- `Shared/Goat Royalty App Ultimate/nextjs-commerce-main/web-app/js/goat-api-integrations.js`
- `Shared/Goat Royalty App Ultimate/nextjs-commerce-main/web-app/api-vault.html`
- `goat-royalty-portable-2.0.0/web-app/js/goat-api-integrations.js`
- `goat-royalty-portable-2.0.0/web-app/api-vault.html`

The matching duplicate GOAT app/package copies were synchronized where present.

## Required Before Live Client Use

1. Create `api-server/.env` from `api-server/.env.example` on the private server.
2. Generate a strong `GOAT_OWNER_API_KEY` and keep it server/private.
3. Load provider keys only into server-side `.env` or a real secret manager.
4. Rotate any provider keys that were ever pasted into chat, browser storage, public repos, email, or screenshots.
5. Confirm the API proxy is not exposed publicly without HTTPS, owner auth, and restricted CORS.
6. Use only official/partner-approved distribution credentials for release delivery.

## Verification Performed

- `node --check` passed for the hardened API proxy.
- `node --check` passed for the browser integration wrapper.
- `python3 -m py_compile` passed for the branding helper scripts.
- Confirmed synchronized API proxy copies share the same SHA-256 hash.
- Confirmed synchronized browser integration wrapper copies share the same SHA-256 hash.
- Confirmed no local GOAT HTML or branding helper script still references `ninja-daytona-script.js`.
- Smoke-tested the API proxy on port `4567` with `GOAT_OWNER_API_KEY=smoke-test-key`:
  - Owner-authorized `/api/health` returned service status.
  - Unauthenticated `/api/spotify/token` returned `401`.
  - Unauthenticated `/api/health` hid provider service status.
