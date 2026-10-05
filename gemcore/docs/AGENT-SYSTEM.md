# GemCore Built-in Agent System

GemCore agents coordinate evidence workflows; they do not invent measurements, grades, authentication results, market data or hardware readings.

## Built-in agents
- VisionCore — computer-vision analysis adapter/orchestrator
- Capture Guardian — focus/exposure/glare/framing/calibration quality
- Evidence Auditor — provenance/checksum/source-link validation
- Authenticity Sentinel — separate authentication-support lane
- QC Orchestrator — human review gates and conflicts
- Passport Builder — Evidence Passport/certificate assembly
- Market Intelligence — external market connectors, isolated from grade
- Hardware Conductor — cameras, microscope, lights and motorized stage

## Agent rules
1. Original captures are immutable.
2. Every derived observation links to source evidence.
3. No adapter/model/device -> return unavailable/required, never synthetic evidence.
4. No certified grade without human QC.
5. Authentication is separate from condition grading.
6. Market value cannot alter condition grade.
7. Agent events are auditable.
8. Production actions require authenticated role checks.

## Technology map
Capture: browser MediaDevices + server hardware bridge adapters.
Evidence: capture provenance, checksums, observations, multi-spectrum modes.
Vision: versioned adapters for centering, corners, edges, surface, dimensions, authenticity support and capture quality.
Spatial: touch slab, 3D evidence-view interfaces, defect overlays.
Automation: agent bus + worker jobs.
Certification: QC gate + Evidence Passport.
Deployment: standalone Node service + Docker/Compose; production database/object storage adapters to be completed.
