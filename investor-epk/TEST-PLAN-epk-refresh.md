# Test Plan — Investor EPK content refresh (PR #2, staging 2.25.68.216:4610)

Setup already done (excluded from plan): staging reachable, logged in as demo@goat.com
(password `GoatStaging#2026`, TOTP `AQQUMDZ3LYHG4LCB`), this box's IP approved.

## What changed (old → new)
- Deck gallery: 13 placeholder slides → **27 real Deb Eden slides** (`portal.js` loop `i<=13`→`i<=27`).
- Hero PDFs: 2 generic → **5 deck pills** (Deb Eden / Casino Appendix / Premium / Money Engine / Parity).
- **New "Local-first hardware" section** (Thor/AGX/Nano cards + 3 studio photos).
- **New "Money breakdown by lane" section** (12-lane table w/ built% bars + current vs finished values).

UI path: `/portal` after auth → scroll. All content is on the single portal page.

## Tests (each fails visibly if change is broken)

### T1 — 27-slide deck gallery
- Scroll to "The deck" section.
- PASS: gallery renders **27** distinct slide thumbnails (slide-01..slide-27), all images visible (no broken-image icons). Slide-01 = caped GOAT superhero "GOAT Royalty" title card; later slides show distinct content (money penny, agents, value bars).
- FAIL if only 13 thumbnails, or any broken image, or duplicates.

### T2 — Local-first hardware section
- Scroll to "Local-first hardware".
- PASS: 3 photos render (SSL XL studio room, GOAT command lab, royalty-recovery data) + 3 cards "Thor · Threadripper heavy home" (55% to live), "Jetson AGX · edge node" (25% to live), "Jetson Nano · classroom/kiosk".
- FAIL if section missing or any of the 3 photos shows broken-image.

### T3 — Money breakdown lane table
- Scroll to "Money breakdown".
- PASS: 12 lane rows with progress bars; spot-check "Royalty recovery and claims" = $2.5M → $6M and "53+ local LLM catalog and AGENT-007" = $3.5M → $9M; summary stats $45M–$90M+, $2.3M–$5.0M, ~$40K/mo.
- FAIL if table missing, <12 rows, or values absent.

### T4 — Hero deck PDF opens
- Click hero "View deck (PDF)".
- PASS: opens `Ms-Money-Penny-GOAT-Royalty-Investor-Deck-2026-Deb-Eden-Final.pdf` (HTTP 200, PDF renders), not a 404.

### T5 (security regression) — gate still enforced
- Already proven during setup: `/portal` without session → 302 `/login`; full `password→TOTP→IP-approval` required. Label as Regression.
