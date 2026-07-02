# PR 5 Review - NEXUS, Vanessa, Real Data

Date: 2026-05-29
Reviewer lane: Sir Codex
Source: https://github.com/DJSPEEDYGA/GOAT-Royalty-App./pull/5.patch

## Decision

Do not merge PR 5 as-is.

The useful parts should be extracted into the correct GOAT crew lanes, but the patch includes plaintext authentication phrases and private royalty identity data that should not be treated as public app code.

## Patch Scope Checked

- `docs/NEXUS-AI-Identity.md`
- `docs/NEXUS-HOME-BLUEPRINT.md`
- `docs/NEXUS-CYBERSECURITY-STRATEGY.md`
- `docs/NEXUS-AUTHENTICATION-PROTOCOL.md`
- `src/nexus/index.js`
- `src/nexus/nexus-core.js`
- `src/nexus/nexus-voice.js`
- `src/nexus/nexus-auth.js`
- `src/renderer/components/VoiceAgent.tsx`
- `src/security/nexus-anomaly-detector.js`
- `src/security/nexus-behavioral-analytics.js`
- `src/team/vanessa-profile.js`
- `src/royalty/catalog-loader.js`
- `src/royalty/fingerprint-royalty-tracker.js`
- `src/data/real-data.js`
- `package.json`
- `package-lock.json`
- `todo.md`

## Findings

### P0 - Plaintext authentication phrases are committed

The patch places authentication phrases and code words directly in docs and source code. These cannot be treated as real authentication after being committed to GitHub, email, or local docs.

Fix:

- Remove code-word authentication from source and public docs.
- Move any real secret to a private local secret store or environment variable.
- Rotate any phrase that was ever used as access control.
- Keep only non-secret display phrases in the product UI.

### P1 - Private royalty identity data is mixed into app source

The patch adds real publisher, writer, IPI, MLC, and society/member details in `src/data/real-data.js`.

Fix:

- Keep real royalty records in a private vault lane, not public frontend source.
- Expose only redacted or consent-approved fields to app screens.
- Use a server-side or local-only data boundary before anything becomes production-facing.

### P1 - AI identity copy overclaims real-world agency

The NEXUS identity documents use language implying autonomous personhood and unrestricted control. That is risky for product trust, security review, and user expectations.

Fix:

- Keep NEXUS as a named assistant persona and workflow lane.
- Describe capabilities as routed software actions, not independent authority.
- Keep AGENT-007, Money Penny, Vanessa, Nexus, Lexi, and Codex separate by lane.

### P1 - Client-side voice commands appear too powerful

`VoiceAgent.tsx` includes commands for vault display, royalty actions, mining language, and app control. These need a server or local backend authority check before they can mutate important state.

Fix:

- Treat voice commands as requests.
- Require backend/local authority for royalty, vault, and financial state changes.
- Add explicit disabled/error states when the authority service is unavailable.

### P2 - Royalty and fingerprint tracking are promising but not verified as live

`fingerprint-royalty-tracker.js` includes ACRCloud placeholders and platform payout estimates. That is useful for architecture, but it is not yet confirmed live royalty tracking.

Fix:

- Label payout numbers as estimates.
- Keep API credentials out of source.
- Add a test fixture for fingerprint matching before calling it production-ready.

### P2 - Security analytics are not production security yet

The anomaly and behavioral analytics files look like a local monitoring layer. They should not be marketed as finished security without real telemetry, logging policy, and failure handling.

Fix:

- Label as local/simulated until wired to real events.
- Define what is logged, where it is stored, and who can read it.
- Add tests for suspicious input, failed auth, and missing telemetry.

## Safe Extraction Plan

1. Put NEXUS identity and voice work in `Ms-Nexus`, with product-safe language.
2. Put Vanessa royalty/fingerprint work in `Ms-Vanessa`, with evidence labels and privacy boundaries.
3. Put code review, merge gates, and security blockers in `Sir-Codex`.
4. Keep real royalty identifiers inside private Money Penny or vault data, not public frontend source.
5. Do not merge the PR until secrets are removed and real data is redacted or moved behind a private boundary.

## Approved Local Action

This review file captures the merge gate. Companion notes were added for the Ms Nexus and Ms Vanessa lanes so the useful PR ideas are not lost.
