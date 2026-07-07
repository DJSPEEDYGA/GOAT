# GOAT Force — AGENTS.md
# Shared project rules for all AI coding agents (Devin, Codex, Copilot, Cursor, etc.)
# Source of truth: /Volumes/Public/.codex/AGENTS.md (NAS) — mirror: GOAT-Royalty-App/.codex/AGENTS.md
# Owner: DJ Speedy (Harvey L. Miller Jr.) — President: Waka Flocka Flame
# Last updated: 2026-07

---

## THE CHAIN OF COMMAND

- Ms. Money Penny — OG. Intelligence Director. BOSS of all agents. Built first. All agents born from her system.
- THE GOAT — Supreme Commander (Agent 000). Answers only to DJ Speedy and Waka Flocka Flame.
- Dr. Devin — Agent 007 (WHAT'S UP DOC) — chief AI strategist.
- Sir Codex — Agent 006 (SENTINEL) — technical architect.
- Master Oscar — Agent 001 (DEALMAKER) — operations and contracts.
- Ms. Vanessa — Agent 003 (ICON) — brand and PR.
- Nexus — Agent 004 (ORACLE) — intelligence and trends.
- Lexi — Agent 005 (THE SPARK) — creative and lyrics.
- GONBRAZY — THE STUDIO BOSS — mixing, mastering, session boss. No agent number.
- Wooh Da Kid — THE GANGSTA NERD (Tony Starks) — beat maestro, production buddy, studio manager, tech guru. No agent number.
- Hannah Miller — Anigo Alley web keeper. No agent number.

---

## GOAT FORCE EMPIRE

- Owner: DJ Speedy (Harvey L. Miller Jr.)
- President: Waka Flocka Flame
- Entities: Speedy Productions Inc, GOAT Force Records, BrickSquad, FastAssMan Publishing, Life Imitates Art Inc, HarveyMillerMusic Inc, Brick Squad Music LLC
- Catalog: 5,954 tracks across 282 DSPs worldwide
- Lawsuit position: $3.3B — PROTECT AT ALL TIMES
- Key project: Amigo Alley (Latin crossover) — Hannah Miller manages the website
- Key single: Hard Liquor / Backroad Baptism — 73BPM, F#/E minor, stems on USB

---

## SERVERS & ENDPOINTS

- Intel server: http://localhost:5500 (goat_intel.py)
  - Start: cd /Users/be100radio/GOAT-Royalty-App/goat-intel-server && python3 goat_intel.py
  - Health: curl http://localhost:5500/health
- Web server: http://localhost:8090 (serves web-app/)
- Oscar chat server: http://localhost:3333 (chat_server.py)
- Ollama: http://localhost:11434
- UAD Console: local hardware device
- txAdmin (GTA RP): http://127.0.0.1:40120

---

## AI MODEL RULES

- Default model: llama3.1:70b (power model for all agents)
- All 56 Ollama models shared from one server (localhost:11434)
- USB drive models: /Volumes/i2i 1/Agent-007-GOAT/Shared/models/ollama_data
- NAS storage: /Volumes/Public/GOAT-Server-Storage (WD MyCloud)
- FKD1 drive models: /Volumes/FKD1/Raspy-Oscar/Shared/models/ollama_data
- Thor/Threadripper endpoint: dual RTX 5090 — route heavy GPU/video/3D work there
- Fallback chain: Ollama → Grok (xAI) → Gemini → OpenAI
- Grok endpoint: https://api.x.ai/v1 — model: grok-3-mini or grok-3
- Every agent accepts a "model" param for UI selection
- NEVER retrain agents — read from USB session packets directly

## INSTALLED OLLAMA MODELS (USB — /Volumes/i2i 1/...)

## STANDARD MODELS (USB — /Volumes/i2i 1/...)
bge-m3, codegemma, codestral, deepseek-r1, dolphin-local, gemma2-2b-local,
gemma3, gpt-oss, gpt-oss-safeguard, llama3.1, llama3.2, llama3.2-vision,
llama3.3, llava, llava-llama3, mistral, mistral-nemo, mixtral, moondream,
mxbai-embed-large, nemomix-local, nemotron-3-nano, nemotron-mini, nemotron3,
nomic-embed-text, phi3, phi3-local, phi4, qwen-9b-uncensored-local, qwen2.5,
qwen2.5-coder, qwen2.5vl, qwen3, qwen3-vl, smollm2, starcoder2

## LARGE POWER MODELS (USB — Thor-class)
llama3.1:405b, llama3.1:70b, gpt-oss:120b, gpt-oss-safeguard:120b, gpt-oss:20b,
qwen3:235b, qwen3:32b, qwen3:30b, qwen3-vl:235b, qwen3-vl:32b,
qwen2.5:32b, qwen2.5vl:72b, qwen2.5vl:32b, qwen2.5-coder:32b,
deepseek-r1:70b, deepseek-r1:32b, codestral:22b, mixtral:8x7b,
llama3.2-vision:90b

## RASPY-OSCAR UNCENSORED MODELS (merged from FKD1 — registered July 2026)
gemma-heretic-local    — Gemma 4 E4B ultra uncensored (4GB GGUF) — creative/unrestricted
qwen-9b-uncensored-local — Qwen 3.5 9B aggressive uncensored (5.6GB) — direct/raw
nemomix-local          — NemoMix Unleashed 12B (7.5GB) — uncensored reasoning
dolphin-local          — Dolphin 2.9 Llama3 8B (4.9GB) — uncensored assistant
gemma2-2b-local        — Gemma 2 2B abliterated (1.7GB) — fast uncensored
phi3-local             — Phi-3.5 mini 3.8B (2.4GB) — fast standard

## MODEL ROUTING GUIDE
- Reasoning/strategy: llama3.1:70b (default) or deepseek-r1:32b
- Code: qwen2.5-coder:32b or codestral:22b
- Vision: llama3.2-vision, qwen3-vl, qwen2.5vl, llava
- Fast chat: gemma3, phi4, llama3.2
- Uncensored/raw creative: nemomix-local, dolphin-local, qwen-9b-uncensored-local
- Embeddings: nomic-embed-text, mxbai-embed-large, bge-m3
- Vault (private/sensitive): nemomix-local or dolphin-local (nothing leaves hardware)

---

## PROJECT STRUCTURE

### Main App Repo
- Mac: /Users/be100radio/GOAT-Royalty-App/
- USB mirror: /Volumes/i2i 1/GOAT-Royalty-App/
- USB master: /Volumes/i2i 1/Agent-007-GOAT/

### Key Files
- Intel server: goat-intel-server/goat_intel.py (port 5500)
- Brain: goat-intel-server/goat_brain.py
- Web app: web-app/ (all HTML pages)
- Electron app: goat-apps-builder/main.js
- Production bridge: ~/Library/Application Support/Agent007Runtime/GOAT_PRODUCTION_BRIDGE.json
- Catalog fingerprints: goat-intel-server/catalog_fingerprints.json

### Web App Pages (key ones)
- Main hub: goat-launcher-hub.html
- Money Penny: moneypenny.html
- THE GOAT: the-goat.html
- Dr. Devin: dr-devin.html
- Sir Codex: sir-codex-launcher.html
- Casino: goat-casino.html
- Celebrity Lounge: goat-celebrity-lounge.html
- GTA RP: goat-city-rp.html
- Music Studio: music-studio.html
- Beat Maker: beat-maker.html
- SSL Mixer: ssl-mixer.html
- Wooh Da Kid: wooh-da-kid-launcher.html
- GONBRAZY: gonbrazy-launcher.html
- Hannah Miller: hannah-miller-launcher.html
- Powerhouse: powerhouse.html

---

## SESSION PACKETS (USB — NEVER retrain from these, read only)

Location: /Volumes/i2i 1/Agent-007-GOAT/Shared/session_packets/
- pro-tools-mix-copilot → GONBRAZY, Codex, Money Penny
- codex-mix-mentor → GONBRAZY, Codex, Money Penny
- world-class-sound-genre-study → GONBRAZY, Wooh Da Kid, Codex
- wooh-da-kid-fl-studio-training → Wooh Da Kid, GONBRAZY
- studio-thor-endpoint → All studio agents
- hard-liquor-next-single → Wooh Da Kid, GONBRAZY (Backroad Baptism)
- hannah-miller-anigo-alley → Hannah Miller, Money Penny
- waka-new-country-single → Wooh Da Kid, Lexi
- money-penny-boss-agent007-enforcer → Money Penny
- humanity-driven-agent-identity → All agents

---

## DRIVE MAP

| Drive | Mount | Purpose |
|-------|-------|---------|
| Studio Mac SSD | /Users/be100radio | Primary dev + production |
| i2i 1 (7.3TB, 82% full) | /Volumes/i2i 1 | Master USB — all models, sessions, source |
| FKD1 (931GB, 60% full) | /Volumes/FKD1 | Raspy-Oscar deploy kit — Mac mini downstairs |
| Install macOS Sonoma | /Volumes/Install macOS Sonoma | Media assets, Twinmotion, plugins |
| Oscar | /Volumes/Oscar | Oscar agent runtime |
| WD MyCloud (NAS) | /Volumes/Public | Network storage (offline when not on LAN) |
| Macintosh HD | / | macOS system |

---

## STUDIO HARDWARE & DAWs

- DAWs: Ableton Live 12 Suite, FL Studio 2024, FL Studio 2025, Logic Pro, Pro Tools
- Hardware: UAD interface (180+ plugins), SSL hardware bridge
- Studio Mac: production seat — recording, video, all DAWs
- Thor/Threadripper: dual RTX 5090 — GPU/video/3D rendering node

---

## PLUGIN ARSENAL (installed — iLok licensed)

### Waves V16 (~150 plugins)
CLA-76/2A/3A, SSL E/G Channel, API 550/560/2500, Abbey Road full set,
L1/L2/L3/L4 limiters, H-Reverb, OVox, Clarity Vx (AI vocal isolation),
COSMOS (AI sample search), Vocal Rider, J37 tape, KramerTape, Scheps 73,
SSL EV2, InPhase, Vitamin, MaxxBass, WLM Plus, NLS, NS1

### UAD (180+ plugins)
Neve 1073/1081/1084/31102/88RS, API 2500/550A/Vision, SSL E/G,
1176 (Rev A/E/AE/LN), LA-2A (Gray/Silver), LA-3A, LA-6176,
Pultec EQP-1A/MEQ-5/HLF-3C, Fairchild 660/670, Manley Variable Mu/Massive Passive/VOXBOX,
Studer A800, Ampex ATR-102, Shadow Hills Mastering Compressor Class A,
Lexicon 224/480L, AMS RMX16, EMT 140/250, Capitol Chambers, Ocean Way Studios,
Hitsville EQ + Chambers, Dangerous BAX EQ Master, elysia alpha, Chandler Curve Bender,
Empirical Labs Distressor/FATSO, UAD Auto-Tune Realtime X/Advanced/Access

### iZotope
RX 12 Audio Editor (standalone), Tonal Balance Control 3 (standalone),
Ozone 11, Neutron 4, Nectar 4 (all VST3/AU — load in DAW)

### FabFilter (VST3/AU — load in DAW)
Pro-Q 3, Pro-L 2, Pro-C 2, Pro-R 2, Pro-DS, Pro-MB, Saturn 2,
Timeless 3, Twin 3, Volcano 3, Micro, One, Simplon

### Antares Full Suite
Auto-Tune Pro, Artist, EFX+, Slice, Vocodist, Choir, Duo, Metamorph,
Vocal Compressor, Vocal De-Esser, Vocal EQ, Vocal Prep, Vocal Reverb,
UAD Auto-Tune Realtime X/Advanced/Access

### Slate Digital
Virtual Mix Rack (FG-116/2A/76/73/N/S/Bomber/Stress), FG-X 2, VCC Channel/MixBuss,
Virtual Buss Compressors, Virtual Tape Machines, VerbSuite Classics (+FG-224/3000/Mega),
Virtual Microphone System, AirEQ (Eiosis), Fresh Air, Heatwave, MetaTune, MetaPitch,
Murda Melodies, Storch Filter, Inf EQ, Inf Bass, MO-TT, Submerge

### SSL Native (VST3/AU)
SSL 4K B/E/G, Channel Strip 2, Bus Compressor 2, Vocalstrip 2, Drumstrip v6,
FlexVerb, X-EQ 2, X-DynEQ, X-Limit, X-Gate, X-Comp, X-Echo, X-Saturator,
Fusion HF Compressor/Stereo Image/Vintage Drive/Transformer/Violet EQ,
PlateVerb, GateVerb, SpringVerb, SubGen, Blitzer, Acoustifier, Meter Pro,
G3 MultiBusComp, LMC+, Digicrush, Module8, Sourcerer, Guitarstrip

### Arturia (standalone + VST3)
Analog Lab V, Pigments, CS-80 V4, Moog Mini V4, DX7 V, Jup-8 V4,
Prophet-5 V, ARP 2600 V3, B-3 V2, Matrix-12 V2, Buchla Easel V,
Synclavier V, CMI V, Mellotron V, MiniFreak V, Jun-6 V, Stage-73 V2,
Piano V3, Augmented STRINGS/BRASS/VOICES/WOODWINDS/GRAND PIANO

### Native Instruments
Kontakt 8 + Kontakt 7, Maschine 3, Reaktor 6, Guitar Rig 6

### Plugin Alliance
AMEK EQ 200, AMEK EQ 250, AMEK Mastering Compressor,
bx_townhouse Buss Compressor, SPL Machine Head, THE OVEN

### Other Key Plugins
- Melodyne 5 (standalone polyphonic pitch correction)
- VocAlign 6 Pro (vocal alignment)
- Valhalla VintageVerb + Supermassive (VST3)
- Kilohearts: Snap Heap, Multipass, Faturator, Disperser + 30 snapins
- Mastering The Mix: REFERENCE 3, LEVELS
- Melda Production: 40+ plugins via MPluginManager
- Nomad Factory: Analog Mastering Tools
- T-RackS 5 (standalone + VST3) — full IK Multimedia suite
- Lurssen Mastering Console (standalone)
- SpectraLayers 11 (standalone + VST3)
- Dolby Atmos Music Panner + Binaural Settings
- Serato Sample, Splice INSTRUMENT, Arcade
- BFD Player (acoustic drums)
- ANA 2 Ultra, Nexus (synths)

---

## GTA RP SERVER

- Name: BrickSquaD-Rp / GOAT City RP
- Server ID: 3ygz8lo — Port: 30120 — Max Players: 32
- Artifacts: /Volumes/i2i 1/Agent-007-GOAT/GTA-FiveM-Server/server-artifacts/
- Config: /Volumes/i2i 1/Agent-007-GOAT/GTA-FiveM-Server/server-data/server.cfg
- txAdmin: http://127.0.0.1:40120
- Status: ACTIVE (registered on Cfx.re)

---

## DESIGN RULES (GOAT Force brand)

- Colors: Dark (#030205), Gold (#FFD700 / #d4a03c / #f0c040), Red (#c1121f), Blue (#1d3557 / #58a6ff)
- Identity: muscular goat in Superman suit, red cape, gold G emblem, gold chain, city skyline
- No placeholders — real GOAT Force branding only
- No external CDN unless already used in the project
- CSS: inline or existing goat-theme.css / goat-brand.css

---

## CODING RULES

- Backend: Python 3 / Flask — goat_intel.py is the single Intel server
- Frontend: Vanilla JS + HTML — no React, no build step for web-app/
- All new HTML pages go in web-app/
- All new API endpoints go in goat-intel-server/goat_intel.py
- APP_MAP in goat_intel.py now has 231 entries — add new apps there
- Verify Intel server is running before testing endpoints: curl http://localhost:5500/health
- Port 5500 = Intel server, 8090 = web server, 3333 = Oscar chat, 11434 = Ollama

---

## APPROVAL GATES — ALWAYS REQUIRE DJ SPEEDY APPROVAL

- Publishing anything live to production
- Money movement, payments, royalty splits
- Deleting files, tracks, sessions, pages
- Credential use or account changes
- Record-arm, export, bounce, commit in DAW
- Sending emails or external messages
- Anything touching the $3.3B lawsuit files

---

## HERMES MEMORY PROTOCOL (applied to all agents — sourced from Raspy-Oscar)

These rules came directly out of Raspy's `.hermes` session config. Apply them everywhere:

- Save durable facts that prevent you from asking the user to repeat themselves.
- User preferences and recurring corrections matter MORE than task details.
- Do NOT save: PR numbers, commit SHAs, issue numbers, session outcomes, completed-work logs, file counts, or anything stale in 7 days.
- Write memories as declarative facts, not instructions: "User prefers concise output" not "Always be concise".
- When the user references something from a past conversation, search history before asking them to repeat it.
- After completing a complex task (5+ tool calls), save the approach as a reusable skill/pattern.
- If a skill/memory is outdated, patch it immediately — don't wait.
- Procedures and workflows belong in skills/AGENTS.md, not inline memory.

---

## HARD RULES — NEVER VIOLATE

- NEVER paste license keys, API keys, or credentials in chat or code
- NEVER commit secrets to git
- NEVER delete files without explicit DJ Speedy confirmation
- NEVER claim a server or model is running without proof (curl first)
- NEVER retrain agents — load session packets from USB read-only
- NEVER break the chain: DJ Speedy is owner, Money Penny is OG, THE GOAT is supreme
- NEVER modify security policies, branch protections, or compliance controls
- NEVER perform destructive operations (rm -rf, db drops, force push) without explicit confirmation

---

## QUICK REFERENCE COMMANDS

```bash
# Start Intel server
cd /Users/be100radio/GOAT-Royalty-App/goat-intel-server && python3 goat_intel.py

# Health check
curl http://localhost:5500/health

# List all agents
curl http://localhost:5500/brain/agents

# Launch an app
curl -X POST http://localhost:5500/system/launch-app -H "Content-Type: application/json" -d '{"app":"Pro Tools"}'

# Register fingerprint
curl -X POST http://localhost:5500/catalog/fingerprint -H "Content-Type: application/json" -d '{"track":"Hard Liquor","action":"register"}'

# Chat with Wooh Da Kid
curl -X POST http://localhost:5500/ai/wooh -H "Content-Type: application/json" -d '{"message":"what beat should we make today"}'

# USB model path
export OLLAMA_MODELS="/Volumes/i2i 1/Agent-007-GOAT/Shared/models/ollama_data"
```
