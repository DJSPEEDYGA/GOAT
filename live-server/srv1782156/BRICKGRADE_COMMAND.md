# BrickGrade Exchange — GOAT FORCE ERP integration

This additive module brings the BrickGrade spatial grading command center into
the authenticated GOAT FORCE ERP at `/app` on `srv1782156` (`2.25.68.216`).

## Runtime files

- `code/oscar/assets/hud-enhancements.js` — current live HUD enhancement file,
  preserved with a small authenticated BrickGrade asset loader appended. The
  loader waits for the ERP shell, revalidates the session with `/api/me`, then
  loads the versioned BrickGrade CSS and JavaScript.
- `code/oscar/assets/brickgrade-erp.js` — injects the authenticated navigation
  entry, home tile, grading engine, spatial touch field, evidence passport, and
  indicative valuation lab.
- `code/oscar/assets/brickgrade-erp.css` — isolated `bx-` styles, responsive
  touch targets, 3D scene, and reduced-motion support.

The module is injected inside the existing `#app-view`; it does not create a
public route, change login handling, call a new API, request camera or microphone
access, or transmit collectible data. Draft locking uses the operator's browser
storage only, under a SHA-256-derived scope for the authenticated operator so
shared-browser sessions cannot restore one another's drafts. Static assets
contain no credentials or private records; all
future grading, trading, or registry APIs must still enforce authentication on
the server.

## Safe deployment rule

The repository snapshot is a reference copy of the live server. Before copying
these files to `/opt/goat/oscar/assets/`, compare the deployed
`hud-enhancements.js` with the version in this change. The live base captured on
2026-08-29 was 5,191 bytes with SHA-256
`addbce235356a49e7aed87c033c8483deb73c0c0e6ec56ec3dd6f796bb6d34fc`.
If the deployed file has advanced, preserve it and append only the BrickGrade
loader block. Do not copy the older `chat_server.py` or `FastChatUI.html`
snapshot over the running ERP.

Deploy `brickgrade-erp.css` and `brickgrade-erp.js` first, then deploy the
updated `hud-enhancements.js` last. The loader versions the two new asset URLs;
the existing HUD asset itself may need an nginx/CDN cache purge or one-hour
cache expiry before browsers receive the new loader.

Deploy to `srv1782156` first. Keep `srv1148455` unchanged until the staging/live
box passes login, navigation, touch, keyboard, reduced-motion, and mobile checks.
