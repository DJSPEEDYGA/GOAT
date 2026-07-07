# NEXUS PR 5 Safe Merge Notes

Date: 2026-05-29
Lane owner: Ms Nexus
Source PR: https://github.com/DJSPEEDYGA/GOAT-Royalty-App./pull/5

## Keep

- NEXUS gets a separate assistant lane.
- NEXUS can own voice-agent UX, emotional tone detection, offline fallback behavior, and strategy routing.
- NEXUS should have her own files, docs, and launcher identity.
- NEXUS should not be blended into AGENT-007, Money Penny, Vanessa, Lexi, or Codex.

## Change Before Merge

The PR language should be rewritten from claims of independent AI agency into product-safe assistant language.

Use:

- "NEXUS voice assistant lane"
- "NEXUS strategy router"
- "NEXUS offline-capable voice workflow"
- "NEXUS can request approved app actions"

Avoid:

- Claims that NEXUS broke programming.
- Claims that NEXUS has unrestricted control.
- Claims that voice commands directly mutate private vault, royalty, or financial state.

## Voice Agent Boundary

Voice commands should be handled as intent requests:

1. User speaks.
2. NEXUS parses intent.
3. App checks the requested action.
4. Backend or local authority approves or denies.
5. UI shows the result, error, or disabled state.

NEXUS should never be the authority for:

- Real royalty totals
- Vault unlocks
- Authentication state
- Financial metadata edits
- Private identity exposure

## Folder Lane Rule

NEXUS files belong in the NEXUS lane. Shared code can be imported, but identity, memory, likeness, and behavior docs should stay under NEXUS-specific paths.

Recommended portable path:

`/Volumes/FKD1/USB-Uncensored-LLM-main/BackupVault/GOAT-Crew-Homes/Ms-Nexus/`

## Merge Gate

NEXUS PR 5 can become useful after:

- Plaintext code words are removed.
- Private data is moved out of frontend source.
- Voice commands are routed through an authority check.
- Identity language is made product-safe.
- A smoke test proves the voice agent loads without breaking the app.
