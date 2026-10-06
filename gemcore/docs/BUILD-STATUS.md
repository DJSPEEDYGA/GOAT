# GemCore Build Status

## Implemented source
- standalone web/API service
- mockup-aligned interactive grading workspace
- Collector/Command modes and touch slab
- spatial camera/CardLock foundation
- capture adapter foundation
- Evidence Passport schema/API
- agent bus and built-in workflow agents
- evidence integrity helpers
- versioned grading-engine foundation with low-category/major-defect guardrails
- VisionCore adapter contract that refuses synthetic measurements
- relational production schema, wired live — submissions/audit/registry/team/
  clients persist to data/gemcore.db (SQLite, WAL); normalized evidence tables
  are write-through projections of the authoritative document; legacy JSON
  stores auto-import on first boot
- Docker/Compose and smoke/engine verification scripts

## Requires real external inputs before production certification
- trained/validated computer-vision models
- exact camera/microscope/light hardware adapters and calibration
- production identity/auth provider
- production SQL database/object storage configuration
- licensed/authorized market and population data sources
- slab printer/label/QR hardware if used
- validation dataset, repeatability studies and grading-rubric governance

These dependencies cannot be truthfully simulated. The app must display unavailable/adapter-required until configured.
