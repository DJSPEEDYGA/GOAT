# GemCore Grading — Standalone Pre-Active Build

Standalone GemCore application. Independent of the GOAT Royalty runtime.

## Run
```bash
cd gemcore
npm install
npm test      # smoke test: package units + full intake→seal→verify API flow
npm start     # http://localhost:4300
```

## Docker
```bash
docker compose up --build
```

## Layout
```
apps/web/          cinematic dashboard UI (matches approved mockup direction)
apps/api/          standalone Express API (server.js) + agent registry
packages/
  shared/          lanes, capture modes, status/rubric constants
  evidence-core/   immutable captures (sha256), annotations, observation gate
  vision-core/     VisionCore adapter interface — honest 'unavailable' until
                   a real calibrated adapter registers; never fakes results
  grading-engine/  lane scoring, Beckett-style weak-lane weighting, public
                   1–10 grade + internal 0–1000 index, QC-gated sealing
  agent-core/      agent bus
  capture-core/    browser camera capture device
database/          SQLite schema.sql + migrations + scripts/migrate.sh
tests/smoke.js     end-to-end flow test
```

## API surface
- `GET  /api/health`, `GET /api/agents`, `POST /api/agents/:id/run`
- `GET  /api/vision/status` — registered VisionCore adapters
- `GET|POST /api/submissions`, `GET /api/submissions/:id`
- `POST /api/submissions/:id/captures` — sha256-verified immutable evidence
- `POST /api/submissions/:id/captures/:capId/verify|annotations`
- `POST /api/submissions/:id/measurements` — per-lane 0–1000 scores
- `POST /api/submissions/:id/observations` — must cite real evidence
- `POST /api/submissions/:id/observations/:obsId/review` — confirm/reject
- `POST /api/submissions/:id/analyze` — VisionCore (honest without adapter)
- `POST /api/submissions/:id/grade` — lanes + index + public grade + blockers
- `POST /api/submissions/:id/qc` — human QC decision
- `POST /api/submissions/:id/seal` — certification; forbidden without QC+evidence
- `GET  /api/submissions/:id/passport` — full evidence passport
- `GET  /api/submissions/:id/audit` — append-only audit trail
- `GET  /api/verify/:certId` — public, privacy-safe cert verification
- `GET  /api/population` — real certified population data

## Integrity rules (enforced in code)
- Original captures immutable; annotations live on a separate layer.
- Every observation must reference existing evidence (else 400).
- Authenticity is graded separately from condition.
- Market value structurally cannot enter the grade.
- `demo: true` submissions can never seal/certify.
- Seal requires: evidence present, zero pending observations, QC approved,
  measurement data in at least one lane.

## Deployment
Deployed as a systemd service behind nginx on the staging hosts:
`/opt/gemcore` → `gemcore.service` (node apps/api/server.js, :4300) →
nginx `gemcore.<host>.nip.io` proxy.
