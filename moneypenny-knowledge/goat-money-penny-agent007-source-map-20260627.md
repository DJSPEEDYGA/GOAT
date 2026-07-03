# GOAT Source Of Truth - Money Penny / AGENT-007

Checked locally: 2026-06-27 EDT

## Plain-English Answer

There are separate lanes, and they should not be treated as equal masters.

1. Master/original local build:
   `/Volumes/i2i 1/Agent-007-GOAT`

2. Master GOAT app web build inside it:
   `/Volumes/i2i 1/Agent-007-GOAT/goat-royalty-portable-2.0.0/web-app`

3. Server deploy/reference lane:
   Ubuntu server route previously confirmed at `2.25.68.216`.

4. Raspy/reference lane:
   Raspy casino/live casino work is useful reference material. Missing useful pieces should be merged into the i2i master build. Raspy should not overwrite the i2i master blindly.

5. Legacy/secondary lane:
   `72.61.193.184:8080` has been treated as legacy/secondary until it is reconnected and re-verified.

## Current Server Verification State

This Mac/Codex session could not reach the public server endpoints during this check:

- `http://2.25.68.216/` failed to connect from this Mac.
- `http://casino.2.25.68.216.nip.io/` could not resolve from this Mac.
- `http://72.61.193.184:8080/` failed to connect from this Mac.

That does not prove the server is down. It means this Mac currently cannot verify it from here.

Last saved server evidence in this project says these were previously live in this same work session:

- GOAT Royalty home: 200 OK.
- Halito Chat: 200 OK.
- Master Oscar ops brain: 200 OK at `/api/oscar/`.
- Speedy Studio: 200 OK.
- Raspy / GOAT Casino lane: 200 OK, title `Ultimate Bourre Casino`.
- Anigo Alley: reached after age-gate redirect.

Reference report:
`Reports/server-checks/live-server-and-raspy-link-summary-20260626.md`

## Command Hierarchy

Owner:
DJ Speedy / Harvey Miller

LLM boss:
Ms Money Penny

AGENT-007:
Enforcer, weapons/tools holder, local controls, deploy/security runner, model/runtime inspector, studio/video action lane.

Master Oscar:
Separate original Oscar / upgraded ops brain. Oscar is not AGENT-007, and AGENT-007 is not Oscar.

## Money Penny Code Found Locally

Primary Money Penny app/component source:

- `GOAT-Royalty-App2-GOAT-APP/components/MoneypennyAI.js`

Primary Money Penny source docs/code notes:

- `GOAT-Royalty-App2-GOAT-APP/MS.MONEYPENNY NEW API.txt`
- `GOAT-Royalty-App2-GOAT-APP/MS.MONEYPENNY NEW ADMIN.txt`
- `GOAT-Royalty-App2-GOAT-APP/4 MONEY PENNY.txt`
- `GOAT-Royalty-App2-GOAT-APP/Moneypenny_ AI Powerhouse of GOAT Royalty.pdf`
- `GOAT-Royalty-App2-GOAT-APP/Moneypenny, Codex & The GOAT Royalty Force.pdf`

## Private Vault/Admin References Added

Private map:

`Reports/private-vault-map/private-vault-reference-map-20260627.md`

Owner-attached files recorded there:

- AGENT-007 vault protocol for DJ Speedy / Raspy / Waka.
- GOAT vault protocol Waka final copy.
- Money Penny admin key second-account file.

Handling rule:
These are private references only. Do not print, publish, expose in public HTML, put in investor decks, store in browser localStorage, or add to server deploy packages without fresh owner approval. The admin-key file is secret-like.

GOAT app Money Penny pages:

- `goat-royalty-portable-2.0.0/web-app/money-penny-launcher.html`
- `goat-royalty-portable-2.0.0/web-app/money-penny-codex.html`
- `goat-royalty-portable-2.0.0/web-app/moneypenny.html`
- `goat-royalty-portable-2.0.0/web-app/agents-brain.html`

## What Was Updated In This Pass

- `config/agent-identity-map.json`
  - Added source-of-truth lanes.
  - Set Ms Money Penny as LLM boss.
  - Set AGENT-007 as enforcer/tools holder.

- `goat-royalty-portable-2.0.0/web-app/data/crew-lane-identity-standard.json`
  - Added command hierarchy.
  - Made Money Penny the command-room lead.
  - Kept agent identities separate.

- `goat-royalty-portable-2.0.0/web-app/data/goat-crew-home-manifest.json`
  - Added source-of-truth rules.
  - Clarified all agents/tools are shared through the GOAT app bench.
  - Clarified role labels are lead assignments, not capability limits.

- `goat-royalty-portable-2.0.0/web-app/data/goat-local-model-pack.json`
  - Clarified Money Penny boss layer and AGENT-007 tool/enforcer layer.
  - Kept local model pack access shared across the crew.

- `goat-royalty-portable-2.0.0/web-app/index.html`
  - Updated visible home-page language.

- `goat-royalty-portable-2.0.0/web-app/agents-brain.html`
  - Added Ms Money Penny and AGENT-007 as first-class top command agents.
  - Removed hard-coded 11-agent status where it mattered.

## Answer: Are All LLMs And Agents Accessible From GOAT Royalty App?

Design-wise: yes.

The GOAT app manifest now states one crew, separate named launchers, shared GOAT bench. That means agents can route through the same tools and local/server model stores from the GOAT Royalty app.

Runtime-wise: verify on each machine.

Model dropdowns depend on the local Ollama/model store, the chosen drive path, and whether that machine has pulled the selected models. The app can expose the lanes; the runtime still needs the models present or a reachable endpoint.

## Bring Up Money Penny

Use:

`/Volumes/i2i 1/Agent-007-GOAT/BRING UP MS MONEY PENNY.command`

That opens the Money Penny launcher, Agents Brain, and her local source/code packet.
