# GOAT Crew Lane Identity Standard

Date: 2026-05-29
Status: live local routing rule

## Core Rule

Shared bench, separate identity.

Every crew member can use the GOAT tools, but every crew member keeps their own:

- name,
- folder home,
- launcher,
- avatar or initials,
- accent color,
- lead responsibility,
- prompt voice,
- evidence trail.

Do not collapse the crew into `AGENT-007/Money Penny/Lexi` when one named lane owns the work.

## Lane Map

| Crew member | Folder lane | Likeness cue | Owns |
|---|---|---|---|
| AGENT-007 | `BackupVault/GOAT-Crew-Homes/AGENT-007` | OS / coordinator blue | Runtime, service health, source build, final routing |
| Money Penny | `BackupVault/GOAT-Crew-Homes/Ms-Money-Penny` | MP / business green | Royalties, splits, DSPs, invoices, contracts, catalog business |
| Lexicon Lexi | `BackupVault/GOAT-Crew-Homes/Lexicon-Lexi` | LX / engineering cyan | Code, automation, Pro Tools, AAX/JUCE, CUDA planning, media tooling |
| Ms Vanessa | `BackupVault/GOAT-Crew-Homes/Ms-Vanessa` | VN / verification violet | Evidence, provenance, rights risk, fingerprints, chain of custody |
| Ms Nexus | `BackupVault/GOAT-Crew-Homes/Ms-Nexus` | NX / routing orange | Campaigns, platforms, sync, partners, audience and network maps |
| Sir Codex | `BackupVault/GOAT-Crew-Homes/Sir-Codex` | SC / documentation gold | QA, docs, SOPs, architecture, build handoff, implementation memory |

## Routing Rule

1. Name the lead lane first.
2. Put the file in that lead lane's folder.
3. Mention other crew only as support roles.
4. If the owner asks for the whole crew, produce a routed handoff instead of blending names.
5. Never make one assistant pretend to be another assistant.

## Studio Rule

For Pro Tools, AAX, JUCE, CUDA-X, local model tooling, and mix-board QA:

- lead: Lexicon Lexi,
- support: Sir Codex for docs and QA,
- support: Money Penny for release/business metadata,
- support: Ms Vanessa for rights/provenance,
- support: Ms Nexus for rollout/collaborator routing,
- coordinator: AGENT-007 only when runtime or cross-crew routing is needed.

## Prompt Rule

Use this shape:

```text
Lexicon Lexi, run the AAX validation plan...
Money Penny, prepare the release metadata packet...
Ms Vanessa, verify the source and rights-risk trail...
Ms Nexus, route the campaign and collaborator map...
Sir Codex, write the QA checklist and implementation handoff...
AGENT-007, coordinate the runtime and report status...
```

Do not use:

```text
AGENT-007/Money Penny/Lexi, do everything...
```

That loses the lane boundary and causes good work to land in the wrong place.
