# GEMCORE CODEX HANDOFF — SOURCE OF TRUTH

## Exact source location
Repository: DJSPEEDYGA/GOAT
Branch: gemcore-hostinger-prep
Pull request: #17

IMPORTANT: GemCore is a standalone grading product. It is not a GOAT Royalty application module. The repository/branch is currently being used as a shared staging location for the two server-side Codex instances.

## Product target
Build a standalone GemCore Grading application matching the approved cinematic dashboard direction:
- deep navy/black sci-fi interface
- emerald/teal luminous accents
- GemCore shield/gem branding
- central graded collectible in a spatial inspection chamber
- left grading workflow/navigation
- right VisionCore inspection and grade breakdown
- bottom market/population/evidence panels
- responsive desktop/tablet/mobile states
- touch-first controls

The existing web-app/gemcore-grading.html is ONLY an early functional prototype. Do not treat its current visual design as the final target.

## Required standalone application
Create a self-contained GemCore project under:
gemcore/

Recommended structure:
gemcore/
  README.md
  package.json
  .env.example
  Dockerfile
  docker-compose.yml
  apps/web/
  apps/api/
  apps/worker/
  packages/grading-engine/
  packages/evidence-core/
  packages/vision-core/
  packages/shared/
  database/
  docs/
  scripts/

GemCore must be runnable/buildable independently of the GOAT Royalty application.

## Required screens
1. Command / Home dashboard
2. Grading Lab / Quantum Inspection Chamber
3. New Submission / Intake
4. Live Grading
5. Submission tracking
6. Evidence Passport / certificate
7. Vault / collection
8. Population report
9. Market Intelligence
10. Settings / calibration / hardware
11. Human QC review
12. Public certification verification

## Grading Lab interaction target
- central digital slab with touch/drag rotation
- microscope mode
- telescope/macro mode
- 3D/spatial inspection mode
- front/back toggle
- zoom/pan
- defect markers
- evidence-layer opacity
- raw/raking/macro/microscope/UV/IR tabs when evidence exists
- centering/corners/edges/surface/dimensions/authenticity lanes
- scan progress and confidence
- explicit human-QC state
- Seal Grade disabled until QC requirements pass

## Evidence/data behavior
Use docs/GEMCORE-EVIDENCE-ARCHITECTURE.md and src/schemas/gemcore-evidence-passport.schema.json as the current evidence contract.

Original captures are immutable evidence. Visual overlays are separate layers.
Every observation must reference source evidence.
Authentication and condition grading are separate decisions.
Market value must never affect condition grade.
Synthetic/demo grades must be marked as demo.
No certified grade without verified evidence and human QC.

## Backend/API target
Standalone API for:
- auth/users/roles
- submissions
- capture sessions
- evidence uploads and checksums
- observations
- grading analysis jobs
- reviewer/QC actions
- certificates/Evidence Passports
- population statistics
- public certificate verification
- health/readiness

Use persistent authenticated server storage for production; localStorage is prototype-only.

## VisionCore target
Implement interfaces first, then real adapters:
- centering measurement
- corner/edge localization
- surface anomaly detection
- dimensions
- capture quality/calibration
- confidence
- hardware capture adapters
Do not invent analysis results when an adapter/model is unavailable.

## Deployment target
Standalone GemCore service on the owner's Hostinger infrastructure. Do not overwrite the existing ERP/GOAT production service until the exact VPS path, ports, reverse-proxy route, database and secrets are verified. Build staging first.

## Branding/assets
Current approved identity: GemCore Grading / GCG shield with emerald/teal gem, deep navy, silver framing, premium serif wordmark. Preserve this direction. Do not substitute GOAT Royalty branding inside the standalone GemCore product.

## Current files to reuse
- web-app/gemcore-grading.html — interaction prototype only
- web-app/gemcore-evidence-passport.html — prototype
- web-app/js/gemcore-store.js — prototype only
- src/routes/gemcore.js — API sketch only
- src/schemas/gemcore-evidence-passport.schema.json — evidence schema
- docs/GEMCORE-EVIDENCE-ARCHITECTURE.md — architecture requirements
- docs/GEMCORE-HOSTINGER-DEPLOYMENT.md — deployment notes

## Definition of done for pre-active build
- standalone gemcore/ tree exists
- one-command local build
- one-command test
- responsive UI closely matches approved mockup direction
- core screens route correctly
- API boots independently
- persistent database schema/migrations included
- evidence upload/record flow works
- QC gate works
- demo vs certified state cannot be confused
- Docker build succeeds
- deployment instructions work for both Codex servers
- no production secrets committed
