# 🔍 GOAT Royalty App — Full Project Discovery Report

**Generated:** Full project scan complete  
**Scope:** Every file, folder, and module in `/workspace`  
**Headline Finding:** ~**37,000+ lines of code are built but NOT wired into the live web app**

---

## 🚨 THE BIG PICTURE

You have **THREE separate codebases** in this project:

| Layer | What it is | Status |
|---|---|---|
| **`web-app/*.html`** (17 pages) | The LIVE pages users actually see | ✅ Deployed |
| **`web-app/lib/*`** (58 files, 18,541 lines) | Advanced JS modules built for the live app | ❌ **0 pages reference them** |
| **`src/*` + `super-llm/*` + `client/*`** (48 files, ~19,000 lines) | Node.js backend + Next.js client + 215-LLM router | ❌ **Not deployed anywhere** |

**Zero of the 17 live HTML pages reference any module in `web-app/lib/`.** That means everything in that folder — voice, avatar, Unreal Engine, RAG, mining, DSP, agents — is dead weight on the server.

---

## 📊 CATEGORY 1 — CODE EXISTS, NOT WIRED IN

### 🎤 Voice / Avatar / Unreal Engine (THE BIG ONE YOU ASKED ABOUT)

| File | Lines | What it does | Live? |
|---|---|---|---|
| `web-app/lib/voice/voice-manager.js` | ~600 | Whisper STT + multi-provider TTS + VAD + wake word "hey goat" + 4 voice profiles | ❌ |
| `web-app/lib/avatar/avatar-manager.js` | ~500 | Three.js 3D avatars, lip sync, 5 character models (.glb) | ❌ |
| `web-app/lib/avatar/unreal-engine-integration.js` | ~800 | **MetaHuman Creator + Convai AI + Pixel Streaming + Live Link Face** | ❌ |
| `src/services/ai/speechToTextService.js` | ~300 | Server-side Whisper/Google STT | ❌ |
| `src/services/ai/textToSpeechService.js` | ~300 | Server-side ElevenLabs/Azure TTS | ❌ |
| `src/services/ai/advancedConversationService.js` | ~400 | Multi-turn convo w/ memory | ❌ |
| `web-app/unreal-copilot.html` | — | Page exists | ⚠️ Orphaned page |

**Only voice-to-voice (Web Speech API) is live** — inside `goat-royalty/index.html`, the version I added this session. Everything else is unused.

---

### 🤖 AI Agents (11 specialized agents — ALL DORMANT)

Located in `src/agents/`:
- `AutonomousAgent.js`
- `businessStrategyAgent.js`
- `creativeContentAgent.js`
- `fashionBusinessAgent.js`
- `fashionDesignerAgent.js`
- `legalComplianceAgent.js`
- `musicIndustryAgent.js`
- `personalStylistAgent.js`
- `researcherAgent.js`
- `techDevelopmentAgent.js`
- `writerAgent.js`
- + `agentFactory.js`, `baseAgent.js`

**5,905 lines of AI agents. None are exposed through any HTML page or API endpoint on the live servers.**

---

### 🧠 Super-LLM System (215 LLM Router — MISSING)

`super-llm/` folder — completely standalone:
- `core/SuperLLM.js` + `core/SuperLLMIntegration.js`
- `integrations/EnhancedAutonomousAgent.js`
- `integrations/GOATIntegration.js` ← intended to wire into GOAT app
- `integrations/chatServiceIntegration.js`
- Has its own installers: `install-super-llm.sh`, `.ps1`, `.nsi`, DMG builder
- 3,293 lines total

**This is a full 215-LLM intelligent router with fallbacks. Not installed on either server.**

---

### 🎨 Fashion + 🛡️ Cybersecurity + 🎮 Other Services

| Module | Location | Status |
|---|---|---|
| Fashion Design Assistant | `src/services/fashion/designAssistantService.js` | ❌ Not exposed |
| Virtual Try-On | `src/services/fashion/virtualTryOnService.js` | ❌ Not exposed |
| Penetration Testing | `src/services/cybersecurity/penetrationTestingService.js` | ❌ Not exposed |
| Google Drive Pipeline | `src/services/googleDriveService.js` + `scripts/google-drive-pipeline.js` | ❌ Not exposed |
| Hostinger deploy | `src/services/hostingerService.js` | ❌ Not exposed |
| RAG over catalog | `src/services/ragSystem.js` + `web-app/lib/rag/*` | ❌ Not exposed |
| Omni-LLM | `src/services/omni-llm.js` | ❌ Not exposed |
| AI Assistant Hub | `src/services/aiAssistantHub.js` | ❌ Not exposed |

---

### 💰 web-app/lib/ Unused Modules

| Folder | Purpose | Lines |
|---|---|---|
| `lib/mining/` | Crypto mining module | ~350 |
| `lib/wallet-tracker/` | Wallet tracker | ~200 |
| `lib/dsp/` | DSP distribution (Spotify/Apple) | ~400 |
| `lib/messaging/` | Decentralized messaging | ~250 |
| `lib/gpu/` | GPU optimizer | ~300 |
| `lib/video/` | Video editor | ~500 |
| `lib/lightning/` | Lightning network payments | ~300 |
| `lib/shopify/` | Full Shopify integration (queries, mutations, fragments) | GraphQL files |
| `lib/nvidia/` | NVIDIA NIM client | ~400 |
| `lib/huggingface/` | HuggingFace client | ~350 |
| `lib/swap/` | Token swap | ~200 |
| `lib/sync/` | Sync service | ~250 |
| `lib/deployment/` | Self-deploy | ~300 |
| `lib/network/` | Network manager | ~200 |
| `lib/payments/` | Payments | ~400 |
| `lib/monitoring/` | Monitoring/telemetry | ~250 |
| `lib/royalty/` | **Royalty calc engine** | ~500 |
| `lib/catalog/` | Catalog manager | ~400 |

---

### ⚛️ Client (Next.js React App — SEPARATE UI)

`client/src/` — a **completely separate** Next.js application (2,518 lines):
- `app/page.tsx` — main dashboard
- `app/agent/page.tsx` — agent UI
- `app/layout.tsx`, `globals.css`
- `components/AIChat.tsx` — React AI chat
- `components/VideoGallery.tsx` — video gallery for the 15 branding MP4s
- `components/dashboard/*`, `charts/*`, `layout/*`
- `components/integrations/IntegrationsHub.tsx`
- `components/integrations/TikTokIntegration.tsx`
- `services/tiktok.ts`

**This is a whole second UI. The Next.js build chunks (`web-app/_next/static/chunks/*.js`) are present in the live site, so parts may load — but the source isn't wired to the static HTML pages.**

---

### 🖥️ Desktop / Electron App

- `app/main/index.js`
- `app/main/builtin-tools.js`
- `app/main/self-building.js`
- `app/main/self-healing.js`
- `web-app/lib/desktop/*`

**Electron desktop app is scaffolded but not built.**

---

## 🎥 CATEGORY 2 — ASSETS NOT SHOWN

### 15 Branding MP4 Videos (249 MB)

`public/videos/branding/` — all "flying goat" branded content:
- `main-goat-video-2.mp4` (37MB)
- `main-goat-video-3.mp4` (31MB)
- `main-goat-video-4.mp4` (37MB)
- `main-goat-video-marvel-cap1.mp4`
- 11x `animate-flying-goat-*.mp4`
- `index.json` (manifest)

**Not displayed on ANY live page.** `VideoGallery.tsx` was built to show them but isn't live.

---

### 14 Catalog Data Files

| File | Purpose |
|---|---|
| `ASCAP 1.xlsx` (432 KB) | ASCAP works |
| `Catalog Metadata_BSM Publishing.xlsx` (68 KB) | BSM catalog |
| `Music Reports publishing_catalog_WAKA.xlsx` | Waka publishing |
| `Speedy Splits - 051619.xlsx` | Speedy splits |
| `WAKA - MERGED SONG CATALOG - ASCAP_SX.xlsx` | Waka merged |
| `Waka ASCAP 6023.xlsx` | Waka ASCAP |
| `Waka Flocka ISRC's.xlsx` | Waka ISRCs |
| `associated_1000071571_Artist_Catalog_2022-01-17.xlsx` | Artist catalog |
| `iSRC Codes - QZ-9EM-17.xlsx` | ISRC codes |
| `Cleaned_FastAssMan_MLC_Data.csv` (92 KB) | MLC data |
| `FASTASSMAN_MASTER_TEMPLATE.csv` | Template |
| `FASTASSMAN_MUSIC_CATALOG.csv` | Full catalog |
| `WorksCatalog2 HARVEY L MILLER WRITERS.csv` | Writer works |
| `WorksCatalogFASTASSMAN PUBLISHING INC ASCAP.csv` | Publishing works |

**Goat-royalty catalog.json uses ~2,980 processed entries, but the raw XLSX/CSV sources aren't offered as downloads and aren't queryable via RAG.**

---

### 9 PDFs (GOAT Lore + AI Textbooks)

- `Moneypenny, Codex & The GOAT Royalty Force.pdf` (the lore bible)
- `GOAT ROYALTY FORCE_ EPISODE SCENARIOS & STORYLINES.pdf`
- `GOAT%20Force%20Gemini-Royalty%20App-%20Concept%20&%20Features.pdf`
- `Infrastructure_as_Code_-_Kief_Morris.pdf`
- `LLMOps_-_Abi_Aryan.pdf`
- `Large_Language_Models_Projects.pdf`
- `Learning_LangChain_-_Mayo_Oshin.pdf`
- `WorksCatalog FASTASSMAN PUBLISHING INC ASCAP.pdf`

**GOAT lore PDFs should feed the AI characters' personalities via RAG. Currently not used.**

---

## 📄 CATEGORY 3 — ORPHANED LIVE PAGES

These HTML pages **exist in web-app/** but may not be linked from nav:

- `web-app/unreal-copilot.html` ← Unreal Engine integration page
- `web-app/ai-dashboard.html` ← AI dashboard
- `web-app/api-download.html` ← API download
- `web-app/movie-studio.html` ← Movie studio
- `web-app/music-studio.html` ← Music studio
- `web-app/screenwriting.html` ← Screenwriting
- `web-app/tools.html` ← Tools
- `web-app/roadmap.html` ← Roadmap
- `web-app/about.html`
- `web-app/resources.html`
- `web-app/catalog.html`
- `web-app/usb-ai.html`

**Need to audit the nav/sidebar on index.html to make sure all 17 pages are reachable.**

---

## 📦 CATEGORY 4 — USB/PORTABLE PACKAGES

Three full portable distributions exist:

- `GOAT-Royalty-USB/` — Linux/Mac/Windows/Shared
- `GOAT-Royalty-v3.0-Complete/` — Linux/Mac/Windows/Shared
- `USB-Uncensored-LLM-main/` — Linux/Mac/Windows/Shared

**Not advertised on the site's downloads page.**

---

## 🧭 ROADMAP — WHAT TO WIRE IN NEXT

Here's my proposed priority order. **You tell me which to tackle first.**

### 🔴 PRIORITY 1 — High Visibility, Low Effort
1. **Voice/Avatar page**: Make `unreal-copilot.html` actually load `lib/avatar/*` + `lib/voice/*` so there's a live demo.
2. **Video Gallery page**: Add a `videos.html` page that loads all 15 branding MP4s from `public/videos/branding/`.
3. **GOAT Lore RAG**: Parse the lore PDFs and feed them into chat so Moneypenny/Codex/GOAT talk in character.
4. **Nav audit**: Ensure all 17 HTML pages are linked from sidebar/footer.

### 🟡 PRIORITY 2 — Core Platform Expansion
5. **Flask backend for Node services**: Wrap `src/agents/*` + `src/services/*` in Flask/Express endpoints so HTML pages can call them.
6. **Super-LLM router**: Install `super-llm/` as the brain behind all chat endpoints.
7. **11 Agents UI**: One "Agents" page that lets you chat with any of the 11 specialists.
8. **RAG over catalog**: Load all 14 XLSX/CSV files into the RAG system.

### 🟢 PRIORITY 3 — Monetization Features
9. **Shopify storefront**: Wire `lib/shopify/*` into a `/shop` page.
10. **DSP distribution**: Expose `lib/dsp/*` as a dashboard.
11. **Royalty calc engine**: Wire `lib/royalty/*` with real catalog data.
12. **Mining / Wallet tracker**: Dashboard for `lib/mining/*` + `lib/wallet-tracker/*`.

### 🔵 PRIORITY 4 — Advanced
13. **Unreal Engine/MetaHuman**: Set up Pixel Streaming on Server 1.
14. **Full-body animation**: Three.js avatar on homepage.
15. **Desktop Electron build**: Package `app/main/*` as installer.
16. **TikTok integration**: Live from `client/src/services/tiktok.ts`.

---

## 💡 MY RECOMMENDATION

Start with **Priority 1 items** because:
- They show off what you already built
- They're fast (hours, not days)
- They make the site feel alive

**First move I suggest**: I'll create a real `unreal-copilot.html` + `videos.html` that actually loads the avatar, voice, and 15 MP4 videos. Then redeploy Server 2 with the updated pages.

**Just say the word** and I'll start wiring them in.