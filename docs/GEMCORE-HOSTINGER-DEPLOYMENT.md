# GemCore / GOAT — Hostinger deployment handoff

This branch prepares the GOAT repository for a controlled GemCore deployment to the Hostinger VPS.

## Deployment target

- Source repository: DJSPEEDYGA/GOAT
- Production host: Hostinger VPS
- Current ERP endpoint supplied by owner: erp.2.25.68.216.nip.io
- Production secrets must not be committed to this repository.

## Security gate before production

The repository currently contains a tracked root .env in Git history/current main. Do not copy it into a deployment workflow or image. Rotate any credentials that have ever been committed, remove the tracked file from the production branch, and store replacement values only in Hostinger/server environment configuration or protected GitHub secrets.

## Morning handoff checklist

1. Sign in to Hostinger from the owner's computer.
2. Confirm this VPS is the machine serving the ERP endpoint.
3. Record the VPS identifier and deployment method (Docker/Compose, Node/PM2, or other) without pasting passwords or private keys into chat.
4. Create/verify protected deployment credentials.
5. Verify the actual production app directory and process/service name.
6. Run a backup/snapshot before the first GemCore deployment.
7. Deploy to a staging path/service first.
8. Run health checks.
9. Promote to production only after the owner verifies the GemCore UI.

## GemCore scope

Planned modules include the touch-first Spatial Command interface, digital slab inspection, Evidence Passport, VisionCore analysis, macro/telescope inspection, digital microscope evidence, multi-light imaging metadata, 4D evidence mapping, human QC gating, and collector/command modes.

AI analysis is assistive. Demo grades must remain visibly marked as illustrative and must never be written as certified production grades.

## Deployment principle

GitHub is the source of truth. Hostinger is the runtime. Production should be reproducible from the repository plus protected server secrets. No credentials belong in source control.
