# Oscar Project Record And Final Deployment Blueprint

Version: 2026-05-25

## Purpose

This record captures Oscar's implemented capabilities, the master transfer
package already prepared, the reported final hardware estate, the source-code
delivery requirement, and the roadmap to a one-click final Oscar system.

## Executive Status

- Original Oscar is running locally from `/Volumes/FKD1/USB-Uncensored-LLM-main`.
- A Thor-oriented transfer master was built at
  `/Volumes/1TB JUMP/Oscar-Thor-Master-USB-v1`.
- The Thor master is 52 GB and preserves Oscar's live UI, settings, chat
  history, drafts, active model store, and rebuildable GGUF model files.
- The master carries seven active model manifests, including
  `moondream:1.8b` for image understanding.
- The current UI provides text chat, USB-saved project memory, browser voice
  input/output, selectable speech delivery style, skill routing, Crew
  perspectives, council review, Tool Mode, image intake, and PDF text intake.
- Graphic generation, 3D creation, large-file media intake, transcription,
  music/video production tools, and distributed orchestration are roadmap
  capabilities, not finished claims.

## Completed Work

| Date | Work Completed | Verified Outcome |
| --- | --- | --- |
| 2026-05-22 to 2026-05-23 | Persistent memory, identity guidance, and Tool Mode foundations | Oscar settings and tool-oriented workflow stored with the USB app |
| 2026-05-23 | Mac launcher and portable-client packaging work | Current launcher guidance and portable behavior recorded |
| 2026-05-25 | Voice conversation upgrade | Browser dictation, read-aloud, wake listening, saved voice and delivery profile |
| 2026-05-25 | Skill/model routing upgrade | Chat, Voice, Code, Research, and Vision modes routed to available local models |
| 2026-05-25 | Vision model addition | `moondream:1.8b` installed and listed in active model manifests |
| 2026-05-25 | Live toolbox feature merge | Crew perspectives, optional Council review, and truthful readiness display |
| 2026-05-25 | Mobile usability repair | Conversation and Crew panel remain within phone viewport |
| 2026-05-25 | NVIDIA Thor master transfer build | 52 GB master package copied to `1TB JUMP`; critical files and model manifests checked |

## Current Capability Truth Table

| Capability | Current State | Evidence | Expansion Needed |
| --- | --- | --- | --- |
| Chat and saved memory | Working | `Shared/FastChatUI.html`, `Shared/chat_server.py`, `Shared/chat_data/settings.json` | Searchable server memory and retrieval layer |
| Voice conversation | Working through browser/system voice | `Shared/FastChatUI.html`, `Shared/oscar_drafts/VOICE_ENGINE_UPGRADE.md` | Dedicated licensed/consented neural Oscar voice |
| Image understanding | Working, performance host-dependent | `moondream:1.8b` in active manifests | Faster/better visual models on GPU hosts |
| PDF intake | Working with extracted-text snippet | UI currently sends up to roughly 12,000 extracted PDF characters per question | Document vault, indexing, citations, large-document retrieval |
| Code/research roles | Working as prompts and local tool workflow | Skill selector, Crew panel, Tool Mode | Larger coding models, expanded audited tool adapters |
| Image/graphic generation | Not installed | No generation engine in current Oscar | CUDA image pipeline and gallery/export workflow |
| 3D art/rendering | Not installed | No Blender/Three.js production bridge yet | Blender job bridge and interactive preview workflow |
| Audio/music file intake | Not installed | File input accepts images and PDF only | WAV/MP3/M4A/FLAC upload, transcription, music library |
| Video intake | Not installed | File input accepts images and PDF only | MOV/MP4 upload, FFmpeg analysis, frames, captions |
| Autonomous production work | Partially designed, constrained | Tool Mode requires approved local action | Audited queues, checkpoints, permission gates, recoverable jobs |

## Reported Final Hardware Estate

| Node | Hardware Or Storage Reported | Intended Oscar Role | Verification Status |
| --- | --- | --- | --- |
| Oscar final PC home | 42-core AMD Threadripper; 256 GB RAM; 2 x NVIDIA RTX 5090 Founders Edition; 100 TB internal storage on 10-SSD PCIe card; 100 TB Thunderbolt external cloud rack | Primary Oscar final home for local LLMs, image generation, Blender/3D, audio/video pipelines, Windows creative software, CUDA/WSL AI tools, model storage, and Media Vault work | Owner-confirmed target; validate CUDA drivers, storage mount paths, filesystem permissions, and recovery plan during final deployment |
| NVIDIA Jetson AGX Thor | Purchased for Oscar; NVIDIA official developer kit specification states T5000, 128 GB LPDDR5X, and NVMe support | Always-on local AI/service node and larger unified-memory inference target | Thor master prepared; configure after device arrives and JetPack is installed |
| Mac Studio | Requested as `Mac M5 128 G Mac Studio` | macOS creative/client workstation and one-click Oscar target | Exact purchasable model/chip/RAM must be confirmed; current Apple Mac Studio specifications page does not verify an M5 configuration |
| NVIDIA Jetson secondary device | Requested as `NVIDIA Jetson Nano 64 G and 2 TB storage` | Smaller edge/satellite Oscar node | Exact SKU must be confirmed; NVIDIA lists Nano-family memory separately from 64 GB AGX-class modules |
| Server vault | 100 TB storage reported | Permanent Media Vault, projects, raw assets, generated content, backups, reference and index stores | Owner-reported; confirm filesystem, RAID/backups, network, permissions |

## Recommended Multi-Node Architecture

| Layer | Primary Node | Function |
| --- | --- | --- |
| Oscar control and orchestration | Thor | Always-on chat/service hub, scheduling, indexes, permissions, model routing |
| Creative generation and heavy processing | Oscar final PC home | Artwork, audio/video processing, 3D rendering, local CUDA workflows, large local model serving, and image/video generation |
| macOS creator access | Mac Studio | User-facing creative workstation, media review, macOS launch experience |
| Edge or satellite workflows | Exact Jetson model to be confirmed | Remote/portable local services after hardware capability is verified |
| Durable storage | Final PC internal 100 TB plus 100 TB Thunderbolt external cloud rack | Originals, masters, assets, training/reference library, model store, indexes, generated media, backups |
| Fast active storage | Internal SSDs and node NVMe | Models, caches, current renders, indexes, current working projects |
| Recovery and transfer | Oscar master USB | Source package, launch/install scripts, selected model seed, recovery workflow |

## Current Source-Code Inventory

The final Oscar delivery must include editable source code, not only packaged
applications or binaries. The master USB already includes the following core
source and launcher paths:

| Source Component | Live Source Location | Purpose |
| --- | --- | --- |
| Web interface | `Shared/FastChatUI.html` | Chat UI, voice controls, skill routing, Crew panel, attachments |
| Local server | `Shared/chat_server.py` | USB persistence, API proxy, stats, workspace/tool behavior |
| Live settings and memory | `Shared/chat_data/settings.json` | Oscar prompt, memory, saved capability and voice choices |
| Chat history | `Shared/chat_data/chats.json` | Saved Oscar conversation data |
| Mac launchers | `Launch Oscar.command`, `Mac/Launch Oscar.command`, `Mac/start.command` | Current macOS launch path |
| Windows scripts | `Windows/install.bat`, `Windows/install-core.ps1`, `Windows/start-fast-chat.bat` | Existing Windows portable baseline |
| Generic Linux scripts | `Linux/install.sh`, `Linux/start.sh` | Existing Linux baseline; not the Thor launcher |
| Thor deployment scripts | `Thor/install-oscar-thor.sh`, `Thor/start-oscar-thor.sh`, `Thor/verify-oscar-thor.sh`, `Thor/build-master-on-mac.sh` | ARM64/JetPack-aware transfer and launch path |
| Capability/design notes | `Shared/oscar_drafts/*.md`, `Thor/*.md` | Approved work record and future capability blueprint |

## Final One-Click Delivery Requirement

The final Oscar package is not complete until each confirmed platform has a
single obvious launcher, source code, an install/check path, and repeatable
acceptance tests.

| Platform | Required One-Click Result | Current Position |
| --- | --- | --- |
| Oscar final PC home | Launch Oscar creative node and connect vault/services with GPU diagnostics | Existing Windows baseline; final CUDA/WSL creative-node launcher to build around the Threadripper / dual RTX 5090 FE target |
| Mac Studio | Launch Oscar client or native service with Apple Silicon-compatible runtime | Existing Mac launcher baseline; rebuild/test after exact Mac hardware is confirmed |
| Jetson AGX Thor | Install native ARM64 runtime once; then launch Oscar service and verification from one obvious entry point | Thor transfer scripts already prepared |
| Secondary NVIDIA Jetson device | Launch properly scaled satellite mode | Wait for exact NVIDIA SKU confirmation |
| Server vault | Mount and validate media/storage/index paths without exposing private data | Media Vault service and permissions plan to build |

Every final one-click package must include:

- Source files and a source manifest.
- Installer or prerequisite check.
- Launcher.
- Settings/memory migration.
- Model/runtime placement plan.
- Media Vault connection configuration.
- GPU and storage diagnostics.
- Logs and recovery instructions.
- Acceptance tests for chat, voice, file intake, tools, generation services,
  model routing, storage access, backup, and privacy boundaries.

## Media, Art, Music, And 3D Roadmap

| Phase | Capability | Needed Runtime Or Tool Class | Target Node |
| --- | --- | --- | --- |
| 1 | Media Vault and indexing | Server-backed uploads, metadata DB, retrieval/index pipeline | Thor plus 100 TB server |
| 2 | Audio/video intake | Resumable upload, FFmpeg, transcription, waveform/frame extraction | Windows node plus vault |
| 3 | Graphics studio | CUDA image generation, reference assets, editing/upscale/export workflow | Oscar final PC home |
| 4 | Music/entertainment workspace | Catalog memory, lyrics/metadata, stems, notes, release assets, rights tracking | Windows node plus vault |
| 5 | 3D studio | Blender controlled job runner, previews, rendering and export | Windows node |
| 6 | Larger model routing | Benchmarked reasoning, coding, vision and multimodal engines | Thor and Windows node |
| 7 | Audited automation | Owner-approved tasks, backups, checkpoints, logs and review gates | Thor orchestration layer |

## Can Oscar Create Records Like This?

Today Oscar's interface has chat, memory and constrained tools; it does not
yet independently expose a report/PDF/XLSX generation tool. On the final
system, yes: Oscar can create structured reports, PDF exports, spreadsheets,
inventories, schedules and project packages once document-generation and
spreadsheet-export adapters are connected through audited Tool Mode. The same
rule applies as with graphics or 3D: the ability must be implemented and
verified rather than merely described in his prompt.

## Source References

| Source | Use |
| --- | --- |
| `https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-thor/` | Official Jetson Thor specifications and developer-kit memory/storage facts |
| `https://docs.nvidia.com/jetson/agx-thor-devkit/user-guide/latest/index.html` | Official Thor setup/documentation path |
| `https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin` | Official Jetson Orin/Nano family differentiation for SKU confirmation |
| `https://www.apple.com/mac-studio/specs/` | Official current Mac Studio specifications reference; use before final Mac launcher |
| `https://docs.ollama.com/faq` | Model loading and multiple-GPU behavior reference |
| `https://docs.nvidia.com/cuda/wsl-user-guide/` | Windows 11 WSL/CUDA workflow reference |
| `/Volumes/FKD1/USB-Uncensored-LLM-main/Shared/FastChatUI.html` | Live Oscar feature implementation |
| `/Volumes/FKD1/USB-Uncensored-LLM-main/Shared/chat_server.py` | Live Oscar server implementation |
| `/Volumes/FKD1/USB-Uncensored-LLM-main/Thor/README-THOR-TRANSFER.md` | Thor migration record |
| `/Volumes/1TB JUMP/Oscar-Thor-Master-USB-v1` | Completed Thor master transfer artifact |
