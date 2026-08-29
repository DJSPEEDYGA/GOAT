# BrickGrade Exchange — GOAT FORCE ERP integration

This additive module brings the BrickGrade spatial grading command center into
the authenticated GOAT FORCE ERP at `/app` on `srv1782156` (`2.25.68.216`).

## Runtime files

- `code/oscar/assets/hud-enhancements.js` — current live HUD enhancement file,
  preserved with a small authenticated BrickGrade asset loader appended. The
  loader waits for the ERP shell, revalidates the session with `/api/me`, then
  loads the versioned BrickGrade CSS and JavaScript. Verification and asset
  failures use a bounded four-attempt backoff and stop on logout or success.
- `code/oscar/assets/brickgrade-erp.js` — injects the authenticated navigation
  entry, home tile, grading engine, spatial touch field, TCG matrix, evidence
  passport, Grading Masters task force, quality-control gate, ERP work queue,
  owner approval request, and indicative valuation lab.
- `code/oscar/assets/brickgrade-erp.css` — isolated `bx-` styles, responsive
  touch targets, 3D scene, and reduced-motion support.

The module is injected inside the existing `#app-view`; it does not create a
public route, change login handling, request microphone access, or contain
credentials. GOATVERSE Studio can request a video-only camera stream after the
operator checks the rights/subject-consent control and presses `START PRIVATE
CAMERA`; the preview stays in the browser, has no audio, and is stopped on
logout. It does not upload or broadcast that stream. Draft locking uses the operator's browser storage under a
SHA-256-derived scope so shared-browser sessions cannot restore one another's
drafts. Version 2 can call the ERP's existing authenticated `/api/projects`,
`/api/tasks`, `/api/approvals`, and `/api/audit_log` surfaces to create and read
real team work. Only Codex has a confirmed direct AI lane in the live ERP, via
`/api/ai/codex`; all other GOAT agents receive tracked ERP tasks until their
persona endpoints are exposed by the authenticated ERP gateway. `Vault`
priority blocks the Codex briefing lane so sensitive evidence is not routed to
a cloud model by this module.

The workflow is Intake → Primary Grade → Authenticity → Market Review → QC →
Owner Approval → Sealed. An agent cannot self-seal a result. All five evidence
checks and a QC pass are required before BrickGrade can create a pending owner
approval for DJ Speedy / Waka Flocka Flame. The ERP's normal role enforcement
and audit logging remain authoritative.

The TCG matrix includes Pokémon, One Piece Card Game, Magic: The Gathering,
Yu-Gi-Oh!, Disney Lorcana, Dragon Ball Super, Digimon, Flesh and Blood, Weiss
Schwarz, Star Wars Unlimited, Union Arena, sports cards, and an open profile.
Game names identify grading profiles; all rendered HUD/card artwork is original
and does not embed official logos or character art.

## GOATVERSE FORGE

Version 2 also adds the crew's rights-gated original production cockpit: Live
Grade → Card Soul → GOATVERSE Reveal → Owner Live Gate. The customer-facing
system is GOATVERSE FORGE, not a launcher for third-party brands. Its eight
native modules are GOAT Fusion Core, BrickLife Motion, Card Soul Digital Twin,
World Forge 3D, Crew Director, Master Room, CrewCast Live, and Vault Render.
Five crew modes provide Speedy, Waka, Brick Squad, proof-first, and collector
premiere direction. It previews a local picture without uploading it, builds a
portable synthetic-media manifest, and can create a real ERP production task
for Crew Director. It never treats generated frames as grading evidence and
never auto-publishes a stream.

The existing local `goat-intel` production bridge exposes read-only creative
stack discovery plus a local-only `/production/card-reveal` handoff builder.
Fusion Core inventories the local model rack, routes approved models per pass,
and creates separate immutable-evidence, generated-media, and editorial-export
folders. Installed DCC, editing, broadcast, or cloud services are optional
backstage adapters. They are reported generically in the browser and do not
replace GOATVERSE FORGE branding or its portable, standards-based manifests.

The public ERP currently does not expose the local Intel production gateway.
The `SCAN STUDIO ROUTER` control reports that truth and leaves generation on the
task/handoff path. Remote rendering and RTMP broadcast require an authenticated
`/api/intel/production/*` proxy plus the selected backstage adapters; never
expose port 5500, `GOAT_PRODUCTION_TOKEN`, adapter credentials, or a stream key
directly to the browser. The card-reveal job endpoint requires both
a loopback request and a constant-time match on the server-held
`X-GOAT-Production-Token` header; the future ERP proxy must add that header
server-to-server.

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
