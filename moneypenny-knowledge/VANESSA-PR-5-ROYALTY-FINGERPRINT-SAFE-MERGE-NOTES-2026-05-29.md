# Vanessa PR 5 Royalty And Fingerprint Safe Merge Notes

Date: 2026-05-29
Lane owner: Ms Vanessa
Source PR: https://github.com/DJSPEEDYGA/GOAT-Royalty-App./pull/5

## Keep

- Ms Vanessa owns royalty tracking, catalog review, fingerprint planning, and revenue intelligence.
- The PR idea of a Vanessa royalty tracking system is valuable.
- Catalog loading and fingerprint matching should become a real private workflow, not demo-only data.

## Protect

Do not place private royalty identifiers directly in public frontend code.

Protected data includes:

- Publisher names and IDs
- Writer legal names
- IPI numbers
- MLC numbers
- Society/member IDs
- Split sheets
- Contracts
- Unreleased catalog metadata
- Private DSP or royalty portal data

## Evidence Labels

Vanessa should label every royalty number by evidence class:

- Confirmed statement
- Imported catalog metadata
- Fingerprint match
- DSP estimate
- MLC estimate
- Manual note
- Unverified placeholder

No screen should call an estimate a confirmed royalty.

## Fingerprint Tracking Boundary

The fingerprint module is not live until:

- API keys are stored outside source code.
- Matching works against a local test fixture.
- Match confidence is shown.
- False positives are handled.
- The user can review before any royalty or catalog data is changed.

## Safe Product Shape

Ms Vanessa should provide:

- Catalog search
- Split-sheet review
- Royalty evidence timeline
- Fingerprint queue
- Match confidence review
- Exportable private reports

Ms Vanessa should not provide:

- Public display of private financial identifiers
- Fake live royalty claims
- Client-only mutation of official royalty records
- Unlabeled payout estimates

## Merge Gate

PR 5 Vanessa work can be extracted after:

- Real private data is moved to a vault or local private data source.
- Placeholder API credentials are removed.
- Payout estimates are explicitly labeled.
- Tests verify catalog loading and fingerprint matching with safe fixture data.
