# GOAT Deb Eden Intake - 2026-06-28

Purpose: classify and preserve the `/Volumes/i2i 1/deb eden` batch as GOAT source-of-truth evidence without running installers or treating outside tools as core dependencies.

## Decision

The Markdown docs are useful GOAT invention-trail records and should be indexed into the app/deck story. The executables, installers, disk flashers, ISOs, DMGs, ZIPs, and endpoint tools are classify-only until the owner explicitly approves a target machine and risk plan.

## Strategy Documents Added

| File | GOAT lane | Why it matters |
| --- | --- | --- |
| `BLOCKBUSTER_VFX_STYLE_BIBLE.md` | GOAT Visual Lab / VFX Style Bible | Defines cinematic style, local preview workflow, face/title/readability QA, and anti-copy rules. |
| `GOAT_ORIGINAL_MODEL_STRATEGY.md` | Original Model Council | Defines router/council model strategy, evaluation-first policy, license ledger, and owner data as source of truth. |
| `GOAT_ORIGINAL_TOOL_APP_STRATEGY.md` | Original Tool Room / Workflow Builder | Defines how GOAT studies tool patterns without copying proprietary code, UI, or branding. |
| `HF_PUBLIC_DATASET_INTAKE_2026-06-02.md` | Dataset License And Consent Gate | Keeps public datasets in reference/evaluation/tagging/ASR/captioning lanes unless rights are clean. |
| `OSCAR_ANY_TO_ANY_MODEL_GUIDE.md` | Any-to-Any Model Router | Routes chat, vision, OCR, search, code, and future music-planner models without blind weight merging. |
| `GOAT_SONG_FORGE_50TB_STUDIO_BLUEPRINT.md` | Song Forge 50TB Studio Vault | Defines manifest-only indexing of the heavy vault, owner catalog source-of-truth, DAW handoff, and royalty fields. |
| `SYNC_TRACKS_AND_NINJA_INTAKE_NOTES.md` | Sync Catalog / Ninja Reference | Records 561 sync/source entries, 1638:45 duration, and useful Electron/NVIDIA packaging references. |
| `FULL_SONGS_CATALOG_NOTES.md` | Owner Song Catalog Memory | Records 163 full-song files, 517:18 duration, and remix exception handling. |

## Audio Assets Observed

| Asset | Observed | GOAT use |
| --- | --- | --- |
| `DJ SPEEDY BEATS AND SOUNDS 22.mp3` | MP3, 320 kbps, 44.1 kHz, 196.1 sec | Song Forge source/reference asset after rights notes. |
| `Walk This Way Walls.wav` | WAV, 16-bit, 48 kHz, 91 sec | Song Forge source/reference asset after rights notes. |
| `Walk Through These Walls.wav` | WAV, 16-bit, 48 kHz, 132.12 sec | Song Forge source/reference asset after rights notes. |
| `walk_this_way.mid` | MIDI format 1, 9 tracks, 23,453 bytes | DAW handoff / arrangement reference after rights review. |

## Installer And Utility Classification

| Tool family | GOAT lane | Status |
| --- | --- | --- |
| NVIDIA SDK Manager, SDK packages, Jetson installer, Ubuntu ISOs | NVIDIA / Jetson / Thor Endpoint Provisioning | Optional lab provisioning candidate; do not install/flash automatically. |
| TurboVNC | Secure Remote GPU Desktop | Optional remote-display candidate; private LAN/VPN/SSH only. |
| imgFlasher, SanDisk app, Promise Utility | Drive Imaging / Storage Lab | High-risk owner-only; these can alter drives. |
| ManageEngine Endpoint Central Evaluation Kit | Device Management Research | High-risk evaluation-only; endpoint control requires a test lab boundary. |
| CandyBar | Legacy Icon / Brand Skin Reference | Reference-only on modern macOS. |
| `A.D-6.0.0.9.exe` | Quarantine / Inspect First | Unknown Windows executable; do not run. |

## Investor Translation

Deb Eden strengthens the originality story:

- GOAT is not cloning cloud generators or app UIs.
- Public models are benchmarks, specialists, or references.
- Owner catalog, rights metadata, workflow manifests, and GOAT app behavior are the original product center.
- Public datasets stay behind license/consent gates.
- Song Forge can scale to the downstairs 50TB vault by indexing manifests instead of copying the vault.
- VFX and visual generation keep a style bible that avoids copied marks, copied costumes, fake watermarks, and unapproved likeness use.

## Next Build Gates

- Add a Tool Room page that reads this intake and shows status by lane.
- Add a Song Forge vault scanner that writes metadata manifests without copying the 50TB source vault.
- Add dataset audit fields: dataset id, modality, license, consent, lane, allowed use, local sample path.
- Add model-router scorecards before any adapter fine-tune.
- Add remote GPU/VNC/Jetson tools only inside a secured lab plan.
