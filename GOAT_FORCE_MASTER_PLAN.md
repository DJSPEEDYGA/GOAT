# GOAT FORCE MASTER WORK PLAN
## The Empire Build Order — Stay Focused, Ship in Order

> **Rule:** Finish one agent COMPLETELY before moving to the next.
> Each agent needs: Memory wired in → Vault connected → Endpoint live → Launcher tested.

---

## ✅ COMPLETED — FOUNDATION

- [x] 15-agent roster locked (000–014)
- [x] All existing launchers updated with Quick Switch (15 agents)
- [x] RAHO renamed from Wooh Da Kid (Agent 009)
- [x] All agents numbered in hero badges
- [x] NEXUS Protocol v1.0 wired into goat_intel.py
- [x] GOAT Vault created: legal contracts + catalog CSV + vault API endpoints
- [x] 551 Waka ISRCs + 999 BSM works loaded into moneypenny_knowledge.md
- [x] goat-launcher-hub.html: full 15-agent grid live
- [x] 4 new launchers built: Legal Eagle (011), A&R Scout (012), CFO Brain (013), Autopilot (014)
- [x] All changes pushed to GitHub + Hostinger live server

---

## 🔥 ACTIVE SPRINT — AGENT BY AGENT (IN ORDER)

---

### SPRINT 1 — MS. MONEY PENNY (Agent 002) ← NEXT UP
**Goal: Give her a real brain with full memory + vault access**

- [ ] **MP-1** Wire `moneypenny_knowledge.md` (1,185 lines) fully into her system prompt
- [ ] **MP-2** Connect vault endpoints so she can query ISRCs, contracts, BSM catalog live
- [ ] **MP-3** Add persistent memory: she should remember past sessions (localStorage + server-side log)
- [ ] **MP-4** Add "What do I know?" command — she lists everything she has loaded
- [ ] **MP-5** Test: ask her an ISRC, a contract detail, a BSM publishing question — she must answer from data
- [ ] **MP-6** Update `moneypenny.html` launcher: Memory panel in sidebar showing loaded knowledge sources
- [ ] **MP-7** Add vault quick-access buttons: ISRC Lookup / Contract Search / Publishing Query

**Files:**
- `goat-intel-server/goat_intel.py` → `MONEYPENNY_SYSTEM` + `/ai/moneypenny` endpoint
- `goat-intel-server/moneypenny_knowledge.md` → already has ISRCs + BSM data
- `web-app/moneypenny.html` → launcher UI

---

### SPRINT 2 — AGENT-007 / DR. DEVIN (Agent 007)
**Goal: Full strategy brain with Nexus Protocol + GOAT Vault briefings**

- [ ] **007-1** Wire Dr. Devin system prompt with full strategic context
- [ ] **007-2** Connect him to vault: he should be able to pull legal docs + catalog stats
- [ ] **007-3** Add "Morning Briefing" mode — auto-generates daily status from all vault data
- [ ] **007-4** Wire the $3.3B lawsuit position as a core knowledge pillar
- [ ] **007-5** Test: ask for a full empire status briefing — should pull from vault
- [ ] **007-6** Update `dr-devin.html` launcher: Briefing panel + vault access buttons

**Files:**
- `goat-intel-server/goat_intel.py` → `/ai/devin` endpoint + system prompt
- `web-app/dr-devin.html` → launcher UI

---

### SPRINT 3 — SIR CODEX (Agent 006)
**Goal: Full tech brain — code aware, server aware, infra docs loaded**

- [ ] **COD-1** Load infrastructure docs into Codex system prompt (8TB guide, Jetson deploy, local infra)
- [ ] **COD-2** Wire `goat-intel-server/docs/` folder into `/ai/codex` endpoint context
- [ ] **COD-3** Add "System Audit" command — he checks server health + reports issues
- [ ] **COD-4** Add live terminal bridge: Codex can suggest + approve shell commands
- [ ] **COD-5** Test: ask him to audit the goat_intel.py file — he must reference real code
- [ ] **COD-6** Update `sir-codex-launcher.html`: Tech ops panel improvements

**Files:**
- `goat-intel-server/goat_intel.py` → `/ai/codex` endpoint
- `goat-intel-server/docs/infrastructure/` → 8TB, Jetson, local infra
- `web-app/sir-codex-launcher.html` → launcher UI

---

### SPRINT 4 — LEGAL EAGLE (Agent 011)
**Goal: Full contract brain — every Waka contract, trademark, IP position loaded**

- [ ] **LEG-1** Create `/brain/agent/legal` endpoint in goat_intel.py
- [ ] **LEG-2** Load all vault legal docs into Legal Eagle system prompt
- [ ] **LEG-3** Wire $3.3B infringement position as core knowledge
- [ ] **LEG-4** Add contract analysis command — paste a contract, get risk assessment
- [ ] **LEG-5** Add "35-Year Reversion Clock" — shows which catalog works are eligible
- [ ] **LEG-6** Test: ask about the Trey Songz side artist agreement — he must know it
- [ ] **LEG-7** Update `legal-eagle-launcher.html`: Contract upload + vault search panel

**Files:**
- `goat-intel-server/goat_intel.py` → `/brain/agent/legal` endpoint (needs building)
- `goat-intel-server/vault/legal-contracts/` → all Waka contracts

---

### SPRINT 5 — CFO BRAIN (Agent 013)
**Goal: Full royalty math brain — 282 DSPs, revenue splits, $3.3B math**

- [ ] **CFO-1** Create `/brain/agent/cfo` endpoint in goat_intel.py
- [ ] **CFO-2** Load catalog CSV data: 551 ISRCs + 5,695 ASCAP works into CFO context
- [ ] **CFO-3** Build royalty calculator: track × streams × rate = revenue
- [ ] **CFO-4** Add 70/10/20 split calculator (artist/label/publishing)
- [ ] **CFO-5** Wire investor deck data ($28M valuation, $3.3B claim)
- [ ] **CFO-6** Test: ask for a revenue breakdown of Hard In Da Paint — needs real data
- [ ] **CFO-7** Update `cfo-brain-launcher.html`: Revenue calculator panel

**Files:**
- `goat-intel-server/goat_intel.py` → `/brain/agent/cfo` endpoint (needs building)
- `goat-intel-server/vault/catalog-data/` → all CSVs

---

### SPRINT 6 — A&R SCOUT (Agent 012)
**Goal: Live market intelligence — trend scanner, hit detector, Amigo Alley**

- [ ] **AR-1** Create `/brain/agent/a&r` endpoint in goat_intel.py
- [ ] **AR-2** Build Amigo Alley project brief into A&R system prompt
- [ ] **AR-3** Add Spotify trend awareness (teach her current market context)
- [ ] **AR-4** Build hit scorecard framework (tempo, hook density, genre fit)
- [ ] **AR-5** Wire Waka catalog so she knows what's been done vs what's fresh
- [ ] **AR-6** Test: ask her to evaluate Hard Liquor/Backroad Baptism — needs a real scorecard
- [ ] **AR-7** Update `ar-scout-launcher.html`: Trend panel + project tracker

**Files:**
- `goat-intel-server/goat_intel.py` → `/brain/agent/a&r` endpoint (needs building)

---

### SPRINT 7 — AUTOPILOT (Agent 014)
**Goal: Multi-agent orchestrator — can trigger any other agent and chain tasks**

- [ ] **AUTO-1** Create `/brain/agent/autopilot` endpoint in goat_intel.py
- [ ] **AUTO-2** Build agent orchestration: Autopilot can call other agent endpoints
- [ ] **AUTO-3** Add daily briefing routine: pulls from all agents + compiles report
- [ ] **AUTO-4** Add task queue: submit multi-step missions, tracks completion
- [ ] **AUTO-5** Test: "Run a full empire audit" — should query Legal + CFO + A&R + Codex
- [ ] **AUTO-6** Update `autopilot-launcher.html`: Mission queue panel

---

### SPRINT 8 — NEXUS + LEXI + VANESSA + OSCAR (Agents 004, 005, 003, 001)
*(These run on the moneypenny.html multi-agent switcher — wire each persona)*

- [ ] Nexus: Network/distribution knowledge + DSP relationships
- [ ] Lexi: Lyrics engine + song structure templates
- [ ] Vanessa: Marketing voice + campaign templates
- [ ] Oscar: Deal-making + operations knowledge

---

### SPRINT 9 — GONBRAZY + RAHO + HANNAH (Agents 008, 009, 010)
- [ ] GONBRAZY: Studio Boss — beat library, session templates, mix references
- [ ] RAHO: Beat Maestro — Maschine/MPC workflow, sample packs, tempo maps
- [ ] Hannah Miller: Amigo Alley Spanish/English bridge agent

---

### SPRINT 10 — LIVE SERVER POLISH
- [ ] Set up SSH deploy key so `git push` auto-deploys to Hostinger
- [ ] Configure Nginx to serve all 15 launchers
- [ ] Set up goat_intel.py as a persistent PM2 service on server
- [ ] SSL / domain routing
- [ ] Performance: lazy-load agent knowledge, cache vault reads

---

## 📋 ALL ACTIVE PROJECTS — THE EMPIRE

| Project | Status | Next Step |
|---|---|---|
| **GOAT Royalty App** | Active — 15 agents live | Ms. Money Penny memory sprint |
| **Ms. Money Penny** | Agent built, memory partial | Wire vault + persistent memory |
| **GOAT Vault** | Built — contracts + catalog CSV | Wire into all agent prompts |
| **GOAT Intel Server** | Running on localhost:5500 | Add /brain/agent/* endpoints |
| **goat-launcher-hub** | Live — 15 agents in grid | Keep updated as agents go live |
| **Hostinger Live Server** | Deployed — 93.127.214.171 | Set up auto-deploy from git |
| **Amigo Alley** | Project brief exists | A&R Scout sprint |
| **$3.3B Lawsuit Position** | Documented in vault | Wire into Legal Eagle + CFO Brain |
| **Investor Deck** | PPTX in vault | Wire into CFO Brain |
| **Nexus Protocol v1.0** | Live in goat_intel.py | Verify Nexus agent uses it |
| **GOAT NAS / 8TB Drive** | Setup guide in docs | Confirm vault syncs to NAS |
| **Jetson Nano Deploy** | Guide in docs | Codex sprint |

---

## 🧠 HOW TO USE THIS PLAN

Every session:
1. Open this file — check what sprint we're on
2. Work ONLY the current sprint until all checkboxes done
3. Mark each box as complete with `[x]`
4. Then move to the next sprint

**Current sprint: SPRINT 1 — MS. MONEY PENNY**

---

*Last updated: Session 2 — All 4 new launchers shipped, vault built, RAHO renamed, 15-agent roster locked.*
