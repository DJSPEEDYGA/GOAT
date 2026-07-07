/* ============================================================
   GOAT FORCE — Universal Agent Controls Panel v2.0
   Injects Devin/Codex/Agent007 Desktop controls into ALL pages.

   Devin Desktop features included:
   ✅ Model selector (grouped: Ollama / xAI / DeepSeek)
   ✅ Skill / Capability mode selector
   ✅ Temperature slider
   ✅ Voice controls (Loop/Wake/Read/Stop/Mute/Speed/Style/Voice)
   ✅ System Prompt & Project Memory editor
   ✅ Bridge panel (Tool/Computer/Producer toggles)
   ✅ Crew / Expert profiles panel
   ✅ Quick-launch bar
   ✅ DeepSeek / xAI Grok API key management
   ✅ Hardware stats (CPU / RAM)
   ✅ Server health status bar (Intel / Agent007 / Ollama / Grok)
   NEW — Devin Desktop parity:
   ✅ Workflows — create, list, run, delete (.devin/workflows/)
   ✅ Rules — create, edit, delete (.devin/rules/)
   ✅ MCP Server Manager — add/toggle/remove/ping MCP servers
   ✅ Lifeguard — AI code safety review on any open chat message
   ✅ Agent Selector — switch active GOAT Force agent mid-chat
   ✅ Devin Browser — fetch URL or search web from any page
   ✅ Revert to Step — snapshot / revert file changes
   ✅ Commit Message Generator — AI git commit messages
   ✅ File / Context Attach — attach any file to the current chat
   ✅ Git Status panel — branch, staged files, recent log
   Sourced from: /Volumes/Devin/Devin.app + FastChatUI.html
   ============================================================ */
(function (G) {
  'use strict';

  // ── Config ──────────────────────────────────────────────────
  const INTEL = 'http://localhost:5500';
  const AGENT007 = 'http://127.0.0.1:3333';
  const OLLAMA = 'http://localhost:11435';
  const LS = localStorage;

  const SKILLS = [
    ['chat','Chat'],['voice','Voice'],['code','Code'],['research','Research'],
    ['accord','Accord'],['lexi','Lexi'],['vision','Vision'],['voiceRights','Voice+Rights'],
    ['clips','Clips'],['camera','Camera'],['aitools','AI Tools'],['production','Production'],
    ['audioEngineer','Audio Engineer'],['catalogScanner','Catalog Scanner'],
    ['instrumentLab','Instrument Lab'],['assetStyle','Asset Style'],
    ['iconArt','Icon Art'],['careerCopilot','Career Co-Pilot'],
    ['business','Business'],['crew','Crew'],['driveVault','Drive Vault'],['studio','Studio']
  ];

  const EXPERTS = [
    ['agent007','Agent007'],['investigator','Investigator'],['engineer','Engineer'],
    ['strategist','Strategist'],['writer','Writer'],['privacy','Privacy Review'],
    ['codex_guardian','Codex Guardian']
  ];

  const SPEECH_STYLES = [
    ['smooth-louisiana','Smooth Louisiana'],['louisiana-aave','Louisiana + AAVE'],
    ['aave','AAVE'],['natural','Natural'],['measured','Measured']
  ];

  const QUICK_BAR = [
    {label:'007 Wake', gold:true,  msg:'Agent007, are you home?'},
    {label:'Gray Wake',             msg:'Graham, are you there?'},
    {label:'Crew Stack',            msg:'crew stack'},
    {label:'Penny',                 msg:'Money Penny, are you there?'},
    {label:'Music',                 msg:'open music player'},
    {label:'GPU Farm',              msg:'wire gpu farm'},
    {label:'Perimeter',             msg:'arm perimeter'},
    {label:'Wire Tools',            msg:'wire tools'},
    {label:'Mktg 101',              msg:'marketing 101'},
    {label:'Marketing',             msg:'marketing crew'},
    {label:'Eden Prompts',          msg:'VIDEO EDEN — show prompt pack'},
    {label:'Eden Still',            msg:"GENERATE IMAGE — EDEN AWAKENS temple keyframe cinematic 9:16"},
    {label:'Codex Power', gold:true, fn:'enableCodexParity'},
  ];

  const VOICES_DEFAULT = ['waka_flocka_flame','raspy','ic_lf_1','nationality_6',
    'Alex','Daniel','Aaron','Tom','Fred','Rocko','Eddy','Reed','Ralph','Albert'];

  // ── State ────────────────────────────────────────────────────
  let state = {
    model: LS.getItem('gac.model') || '',
    skill: LS.getItem('gac.skill') || 'chat',
    temp: parseFloat(LS.getItem('gac.temp') || '0.7'),
    expert: LS.getItem('gac.expert') || 'agent007',
    council: LS.getItem('gac.council') === 'true',
    toolMode: LS.getItem('gac.toolMode') === 'true',
    computerControl: LS.getItem('gac.computerControl') === 'true',
    producerMode: LS.getItem('gac.producerMode') === 'true',
    voiceLoop: false,
    voiceWake: false,
    autoSpeak: false,
    speechStyle: LS.getItem('gac.speechStyle') || 'smooth-louisiana',
    speechVoice: LS.getItem('gac.speechVoice') || 'waka_flocka_flame',
    speechSpeed: parseFloat(LS.getItem('gac.speechSpeed') || '1.0'),
    sysPrompt: LS.getItem('gac.sysPrompt') || '',
    memory: LS.getItem('gac.memory') || '',
    models: [],
    intelOnline: false,
    agent007Online: false,
  };

  // ── Inject CSS ───────────────────────────────────────────────
  function injectCSS() {
    if (document.getElementById('gac-style')) return;
    const s = document.createElement('style');
    s.id = 'gac-style';
    s.textContent = `
:root {
  --gac-bg: #0a0808;
  --gac-bg2: #100d0d;
  --gac-border: rgba(255,215,0,0.18);
  --gac-gold: #FFD700;
  --gac-gold2: #f0c040;
  --gac-gold3: #c89b3c;
  --gac-green: #2ecc71;
  --gac-red: #e74c3c;
  --gac-blue: #3498db;
  --gac-text: #f5e6c8;
  --gac-dim: #888;
  --gac-radius: 8px;
  --gac-font: 'JetBrains Mono', monospace;
}

/* Floating toggle button */
#gac-toggle {
  position: fixed;
  bottom: 20px; right: 20px;
  z-index: 99998;
  width: 52px; height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--gac-gold), var(--gac-gold3));
  border: 2px solid rgba(255,215,0,0.5);
  box-shadow: 0 4px 20px rgba(255,215,0,0.35), 0 0 0 0 rgba(255,215,0,0.4);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
  transition: transform 0.2s;
  animation: gac-pulse-ring 3s ease-in-out infinite;
}
#gac-toggle:hover { transform: scale(1.12); }
@keyframes gac-pulse-ring {
  0%,100% { box-shadow: 0 4px 20px rgba(255,215,0,0.35), 0 0 0 0 rgba(255,215,0,0.25); }
  50%      { box-shadow: 0 4px 20px rgba(255,215,0,0.5), 0 0 0 10px rgba(255,215,0,0); }
}

/* Main drawer */
#gac-drawer {
  position: fixed;
  bottom: 82px; right: 20px;
  z-index: 99997;
  width: 420px; max-width: calc(100vw - 32px);
  max-height: calc(100vh - 120px);
  background: var(--gac-bg);
  border: 1px solid var(--gac-border);
  border-radius: 18px;
  overflow: hidden;
  display: none;
  flex-direction: column;
  box-shadow: 0 0 60px rgba(255,215,0,0.12), 0 20px 60px rgba(0,0,0,0.7);
  font-family: var(--gac-font);
  font-size: 12px;
  color: var(--gac-text);
}
#gac-drawer.open { display: flex; }

/* Header */
#gac-header {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px;
  background: rgba(255,215,0,0.06);
  border-bottom: 1px solid var(--gac-border);
  flex-shrink: 0;
}
#gac-header .gac-title { flex: 1; font-size: 13px; font-weight: 900; color: var(--gac-gold); }
#gac-header .gac-sub { font-size: 10px; color: var(--gac-dim); }
#gac-close {
  background: none; border: none; color: var(--gac-dim);
  cursor: pointer; font-size: 18px; padding: 0 4px;
}
#gac-close:hover { color: #fff; }

/* Quick-launch bar */
#gac-quickbar {
  display: flex; gap: 5px; flex-wrap: wrap;
  padding: 10px 12px;
  border-bottom: 1px solid var(--gac-border);
  flex-shrink: 0;
}
.gac-qbtn {
  padding: 5px 10px; border-radius: 7px; font-size: 10px; font-weight: 700;
  cursor: pointer; font-family: var(--gac-font); transition: all 0.15s;
  border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #ccc;
}
.gac-qbtn:hover { border-color: rgba(255,215,0,0.4); color: var(--gac-gold); background: rgba(255,215,0,0.07); }
.gac-qbtn.gold { background: linear-gradient(135deg, var(--gac-gold), var(--gac-gold3)); color: #000; border-color: transparent; font-weight: 900; }
.gac-qbtn.gold:hover { filter: brightness(1.1); }

/* Scrollable body */
#gac-body {
  flex: 1; overflow-y: auto; padding: 12px;
  display: flex; flex-direction: column; gap: 10px;
}
#gac-body::-webkit-scrollbar { width: 4px; }
#gac-body::-webkit-scrollbar-thumb { background: rgba(255,215,0,0.2); border-radius: 4px; }

/* Section */
.gac-section {
  background: var(--gac-bg2);
  border: 1px solid var(--gac-border);
  border-radius: var(--gac-radius);
  overflow: hidden;
}
.gac-section-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 12px;
  background: rgba(255,215,0,0.05);
  border-bottom: 1px solid var(--gac-border));
  cursor: pointer; user-select: none;
  font-size: 11px; font-weight: 800; color: var(--gac-gold);
  text-transform: uppercase; letter-spacing: 1px;
}
.gac-section-head:hover { background: rgba(255,215,0,0.08); }
.gac-section-head .gac-arrow { transition: transform 0.2s; }
.gac-section-body { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.gac-section.collapsed .gac-section-body { display: none; }
.gac-section.collapsed .gac-arrow { transform: rotate(-90deg); }

/* Row */
.gac-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.gac-label { font-size: 10px; color: var(--gac-dim); text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; min-width: 52px; }

/* Inputs */
.gac-select, .gac-input {
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--gac-text);
  font-size: 11px; font-family: var(--gac-font);
  padding: 5px 8px; border-radius: 6px;
  outline: none;
}
.gac-select:focus, .gac-input:focus { border-color: var(--gac-gold); }
.gac-input[type=number] { width: 56px; text-align: center; }
.gac-input[type=password] { flex: 1; }
.gac-ta {
  width: 100%; background: rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--gac-text); font-family: var(--gac-font); font-size: 11px;
  padding: 8px; border-radius: 6px; resize: vertical; min-height: 60px;
  outline: none;
}
.gac-ta:focus { border-color: var(--gac-gold); }

/* Buttons */
.gac-btn {
  padding: 5px 11px; border-radius: 6px; font-size: 10px; font-weight: 700;
  cursor: pointer; font-family: var(--gac-font); transition: all 0.15s;
  border: 1px solid rgba(255,215,0,0.25); background: rgba(255,215,0,0.07); color: var(--gac-gold);
  white-space: nowrap;
}
.gac-btn:hover { background: rgba(255,215,0,0.16); }
.gac-btn.primary { background: linear-gradient(135deg, var(--gac-gold), var(--gac-gold3)); color: #000; border-color: transparent; }
.gac-btn.primary:hover { filter: brightness(1.1); }
.gac-btn.danger { border-color: rgba(231,76,60,0.3); background: rgba(231,76,60,0.07); color: var(--gac-red); }
.gac-btn.danger:hover { background: rgba(231,76,60,0.16); }
.gac-btn.green { border-color: rgba(46,204,113,0.3); background: rgba(46,204,113,0.07); color: var(--gac-green); }

/* Toggle */
.gac-toggle-row { display: flex; align-items: center; gap: 8px; }
.gac-toggle-row label { display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 11px; color: #ccc; }
.gac-toggle-row input[type=checkbox] { accent-color: var(--gac-gold); width: 14px; height: 14px; }

/* Range */
.gac-range-row { display: flex; align-items: center; gap: 8px; flex: 1; }
.gac-range { flex: 1; accent-color: var(--gac-gold); }
.gac-range-val { font-size: 11px; color: var(--gac-gold); min-width: 28px; text-align: right; }

/* Health chips */
.gac-health { display: flex; gap: 5px; flex-wrap: wrap; }
.gac-chip {
  padding: 3px 8px; border-radius: 10px; font-size: 10px; font-weight: 700;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #666;
  transition: all 0.3s;
}
.gac-chip.ok  { background: rgba(46,204,113,0.1); border-color: rgba(46,204,113,0.3); color: var(--gac-green); }
.gac-chip.warn { background: rgba(241,196,15,0.1); border-color: rgba(241,196,15,0.3); color: #f1c40f; }
.gac-chip.off  { background: rgba(231,76,60,0.1); border-color: rgba(231,76,60,0.3); color: var(--gac-red); }

/* Voice buttons */
.gac-vbtn {
  padding: 5px 10px; border-radius: 6px; font-size: 10px; font-weight: 700;
  cursor: pointer; font-family: var(--gac-font); transition: all 0.15s;
  border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); color: #aaa;
}
.gac-vbtn:hover { border-color: rgba(255,215,0,0.4); color: var(--gac-gold); }
.gac-vbtn.active { border-color: var(--gac-green); color: var(--gac-green); background: rgba(46,204,113,0.08); }
.gac-vbtn.warn { border-color: var(--gac-red); color: var(--gac-red); }

/* Status line */
.gac-status { font-size: 10px; color: var(--gac-dim); margin-top: 2px; }
.gac-status.ok { color: var(--gac-green); }
.gac-status.err { color: var(--gac-red); }

/* Status bar at bottom of header */
#gac-statusbar {
  display: flex; gap: 10px; padding: 6px 16px;
  background: rgba(0,0,0,0.5);
  border-bottom: 1px solid var(--gac-border);
  flex-shrink: 0;
}
.gac-sbdot {
  display: flex; align-items: center; gap: 5px;
  font-size: 10px; color: var(--gac-dim);
}
.gac-sbdot::before {
  content: ''; width: 6px; height: 6px; border-radius: 50%;
  background: #444; display: inline-block;
  transition: all 0.3s;
}
.gac-sbdot.on::before { background: var(--gac-green); box-shadow: 0 0 6px var(--gac-green); }
.gac-sbdot.off::before { background: var(--gac-red); }

/* Top model bar injected into pages */
#gac-topbar {
  position: sticky; top: 0; z-index: 9000;
  display: flex; align-items: center; gap: 8px;
  padding: 0 16px; height: 40px; min-height: 40px;
  background: rgba(5,4,2,0.97);
  border-bottom: 1px solid var(--gac-border);
  backdrop-filter: blur(12px);
  font-family: var(--gac-font); font-size: 11px;
  flex-shrink: 0;
}
#gac-topbar .gac-brand {
  font-weight: 900; color: var(--gac-gold); white-space: nowrap; font-size: 12px;
  display: flex; align-items: center; gap: 6px;
}
.gac-divider { width: 1px; height: 18px; background: rgba(255,215,0,0.15); flex-shrink: 0; }
.gac-tlabel { font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
#gac-hw {
  margin-left: auto; display: flex; align-items: center; gap: 10px; flex-shrink: 0;
}
.gac-hw-stat { display: flex; align-items: center; gap: 5px; font-size: 10px; color: #666; }
.gac-hw-track { width: 36px; height: 3px; background: rgba(255,255,255,0.07); border-radius: 2px; overflow: hidden; }
.gac-hw-bar { height: 100%; background: var(--gac-gold); border-radius: 2px; width: 0%; transition: width 0.5s; }
.gac-hw-pct { font-size: 10px; min-width: 28px; }

/* Agent selector cards */
.gac-agent-card {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
  cursor: pointer; transition: all 0.15s; font-family: var(--gac-font);
  text-align: left;
}
.gac-agent-card:hover { border-color: rgba(255,215,0,0.4); background: rgba(255,215,0,0.07); }
.gac-agent-card.active { border-color: var(--gac-gold); background: rgba(255,215,0,0.1); }

/* Workflow / Rule list items */
.gac-list-item {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 8px; border-radius: 6px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  font-size: 11px; color: #ccc;
}
.gac-list-item:hover { border-color: rgba(255,215,0,0.25); }
.gac-list-item .gac-item-name { flex: 1; }
.gac-list-item .gac-item-scope {
  font-size: 9px; padding: 2px 5px; border-radius: 4px;
  background: rgba(255,215,0,0.08); color: var(--gac-gold); font-weight: 700;
}
.gac-list-item .gac-item-scope.global { background: rgba(52,152,219,0.1); color: #3498db; }

/* MCP server list */
.gac-mcp-item {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 8px; border-radius: 6px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  font-size: 11px;
}
.gac-mcp-item .mcp-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.gac-mcp-item .mcp-dot.on { background: var(--gac-green); box-shadow: 0 0 6px var(--gac-green); }
.gac-mcp-item .mcp-dot.off { background: #555; }
.gac-mcp-item .mcp-info { flex: 1; }
.gac-mcp-item .mcp-name { font-weight: 700; color: #fff; }
.gac-mcp-item .mcp-url { font-size: 9px; color: #555; }

/* Lifeguard findings */
.gac-lg-finding {
  padding: 6px 8px; border-radius: 6px; font-size: 11px; margin-bottom: 4px;
  border-left: 3px solid #555;
}
.gac-lg-finding.error { border-left-color: var(--gac-red); background: rgba(231,76,60,0.07); }
.gac-lg-finding.warning { border-left-color: #f59e0b; background: rgba(245,158,11,0.07); }
.gac-lg-finding.info { border-left-color: var(--gac-blue); background: rgba(52,152,219,0.07); }
.gac-lg-score {
  display: flex; align-items: center; gap: 8px;
  padding: 8px; background: rgba(255,215,0,0.06);
  border-radius: 6px; margin-bottom: 8px;
  font-size: 12px; font-weight: 700; color: var(--gac-gold);
}

/* Snapshot list */
.gac-snap-item {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 8px; border-radius: 6px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  font-size: 10px; color: #aaa;
}
.gac-snap-item .snap-label { flex: 1; font-weight: 700; color: #fff; }
.gac-snap-item .snap-file { color: #555; font-size: 9px; }
    `;
    document.head.appendChild(s);
  }

  // ── Build HTML ───────────────────────────────────────────────
  function buildHTML() {
    // Top bar
    const topbar = document.createElement('div');
    topbar.id = 'gac-topbar';
    topbar.innerHTML = `
      <div class="gac-brand">🐐 GOAT</div>
      <div class="gac-divider"></div>
      <span class="gac-tlabel">Model</span>
      <select id="gac-model-select" class="gac-select" style="max-width:170px;" onchange="GAC.setModel(this.value)">
        <option>Loading…</option>
      </select>
      <div class="gac-divider"></div>
      <span class="gac-tlabel">Skill</span>
      <select id="gac-skill-select" class="gac-select" onchange="GAC.setSkill(this.value)">
        ${SKILLS.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}
      </select>
      <div class="gac-divider"></div>
      <span class="gac-tlabel">Temp</span>
      <input type="number" id="gac-temp" class="gac-input" value="${state.temp}" min="0" max="2" step="0.1"
        onchange="GAC.setTemp(this.value)">
      <div class="gac-divider"></div>
      <button class="gac-btn" onclick="GAC.toggleSys()" title="System Prompt &amp; Memory">⚙ System</button>
      <button class="gac-btn" onclick="GAC.toggleBridge()" title="Tool Mode / Bridge">⌘ Bridge</button>
      <button class="gac-btn" onclick="GAC.toggleCrew()" title="Crew / Expert Mode">Crew</button>
      <div class="gac-divider"></div>
      <button class="gac-btn" onclick="GAC.toggleSection('workflows')" title="Workflows">⚡ Flows</button>
      <button class="gac-btn" onclick="GAC.toggleSection('rules')" title="Rules">📋 Rules</button>
      <button class="gac-btn" onclick="GAC.toggleSection('mcp')" title="MCP Servers">🔌 MCP</button>
      <button class="gac-btn" onclick="GAC.toggleSection('browser')" title="Devin Browser">🌐 Browse</button>
      <button class="gac-btn" onclick="GAC.toggleSection('lifeguard')" title="Lifeguard Code Review">🛡 Guard</button>
      <button class="gac-btn" onclick="GAC.toggleSection('git')" title="Git Tools">🔀 Git</button>
      <button class="gac-btn" onclick="GAC.openAgentSelector()" title="Switch Agent">🤖 Agent</button>
      <div id="gac-hw">
        <div class="gac-hw-stat">
          <span style="color:#555;font-size:10px;">CPU</span>
          <div class="gac-hw-track"><div class="gac-hw-bar" id="gac-cpu-bar"></div></div>
          <span class="gac-hw-pct" id="gac-cpu-pct">--%</span>
        </div>
        <div class="gac-hw-stat">
          <span style="color:#555;font-size:10px;">RAM</span>
          <div class="gac-hw-track"><div class="gac-hw-bar" id="gac-ram-bar"></div></div>
          <span class="gac-hw-pct" id="gac-ram-pct">--%</span>
        </div>
      </div>
    `;

    // Floating toggle button
    const toggle = document.createElement('button');
    toggle.id = 'gac-toggle';
    toggle.innerHTML = '🐐';
    toggle.title = 'GOAT Force Controls';
    toggle.onclick = () => {
      document.getElementById('gac-drawer').classList.toggle('open');
    };

    // Main drawer
    const drawer = document.createElement('div');
    drawer.id = 'gac-drawer';
    drawer.innerHTML = `
      <div id="gac-header">
        <div>
          <div class="gac-title">GOAT FORCE CONTROLS</div>
          <div class="gac-sub">Devin · Codex · Agent007 · All Apps</div>
        </div>
        <button id="gac-close" onclick="document.getElementById('gac-drawer').classList.remove('open')">✕</button>
      </div>
      <div id="gac-statusbar">
        <div class="gac-sbdot" id="gac-sb-intel">Intel Server</div>
        <div class="gac-sbdot" id="gac-sb-a007">Agent007</div>
        <div class="gac-sbdot" id="gac-sb-ollama">Ollama</div>
        <div class="gac-sbdot" id="gac-sb-grok">Grok/xAI</div>
      </div>
      <div id="gac-quickbar">
        ${QUICK_BAR.map(q=>`<button class="gac-qbtn${q.gold?' gold':''}"
          onclick="GAC.quick('${q.fn||''}','${(q.msg||'').replace(/'/g,"\\'")}')">${q.label}</button>`).join('')}
      </div>
      <div id="gac-body">

        <!-- VOICE CONTROLS -->
        <div class="gac-section" id="gac-sec-voice">
          <div class="gac-section-head" onclick="GAC.toggleSection('voice')">
            🎙 Voice Controls <span class="gac-arrow">▾</span>
          </div>
          <div class="gac-section-body">
            <div class="gac-row">
              <button id="gac-vbtn-loop"  class="gac-vbtn" onclick="GAC.toggleVoiceLoop()">Voice</button>
              <button id="gac-vbtn-wake"  class="gac-vbtn" onclick="GAC.toggleWake()">Wake</button>
              <button id="gac-vbtn-read"  class="gac-vbtn" onclick="GAC.toggleAutoSpeak()">Read</button>
              <button id="gac-vbtn-stop"  class="gac-vbtn warn" onclick="GAC.stopLoop()">Stop Loop</button>
              <button id="gac-vbtn-mute"  class="gac-vbtn" onclick="GAC.stopSpeaking()">Mute</button>
            </div>
            <div class="gac-row">
              <span class="gac-label">Style</span>
              <select id="gac-speech-style" class="gac-select" onchange="GAC.setSpeechStyle(this.value)">
                ${SPEECH_STYLES.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}
              </select>
            </div>
            <div class="gac-row">
              <span class="gac-label">Voice</span>
              <select id="gac-speech-voice" class="gac-select" onchange="GAC.setSpeechVoice(this.value)">
                ${VOICES_DEFAULT.map(v=>`<option value="${v}">${v}</option>`).join('')}
              </select>
            </div>
            <div class="gac-row">
              <span class="gac-label">Speed</span>
              <div class="gac-range-row">
                <input type="range" id="gac-speech-speed" class="gac-range" min="50" max="200" step="5" value="100"
                  oninput="document.getElementById('gac-speed-val').textContent=(this.value/100).toFixed(1)+'×'"
                  onchange="GAC.setSpeechSpeed(this.value)">
                <span class="gac-range-val" id="gac-speed-val">1.0×</span>
              </div>
            </div>
            <div class="gac-status" id="gac-voice-status">Voice ready</div>
          </div>
        </div>

        <!-- SYSTEM PROMPT -->
        <div class="gac-section collapsed" id="gac-sec-sys">
          <div class="gac-section-head" onclick="GAC.toggleSection('sys')">
            ⚙ System Prompt &amp; Memory <span class="gac-arrow">▾</span>
          </div>
          <div class="gac-section-body">
            <textarea id="gac-sys-ta" class="gac-ta" placeholder="System prompt — applies to this session…"></textarea>
            <div class="gac-row">
              <button class="gac-btn primary" onclick="GAC.saveGlobal()">Set Global</button>
              <button class="gac-btn danger" onclick="GAC.clearGlobal()">Clear Global</button>
              <span class="gac-status" id="gac-global-status"></span>
            </div>
            <textarea id="gac-mem-ta" class="gac-ta" placeholder="Project memory — persists across sessions…"></textarea>
            <div class="gac-row">
              <button class="gac-btn primary" onclick="GAC.saveMemory()">Save Memory</button>
              <button class="gac-btn danger" onclick="GAC.clearMemory()">Clear Memory</button>
              <span class="gac-status" id="gac-mem-status"></span>
            </div>
            <div style="border-top:1px solid var(--gac-border);padding-top:8px;margin-top:4px;">
              <div class="gac-label" style="margin-bottom:6px;">DeepSeek API</div>
              <div class="gac-row">
                <input type="password" id="gac-deepseek-key" class="gac-input" placeholder="sk-…" style="flex:1;">
                <button class="gac-btn" onclick="GAC.saveDeepseek()">Save</button>
                <button class="gac-btn danger" onclick="GAC.clearDeepseek()">Clear</button>
              </div>
              <div class="gac-status" id="gac-deepseek-status">Checking…</div>
              <div class="gac-label" style="margin-top:8px;margin-bottom:4px;">xAI Grok</div>
              <div class="gac-status" id="gac-xai-status">Checking Grok…</div>
              <div style="font-size:10px;color:#555;margin-top:2px;">Pick <code style="color:var(--gac-gold);">xai-api/grok-3-mini-fast</code> in Model when green.</div>
            </div>
          </div>
        </div>

        <!-- BRIDGE (TOOL MODE) -->
        <div class="gac-section collapsed" id="gac-sec-bridge">
          <div class="gac-section-head" onclick="GAC.toggleSection('bridge')">
            ⌘ Bridge — Tool Mode &amp; Controls <span class="gac-arrow">▾</span>
          </div>
          <div class="gac-section-body">
            <div class="gac-toggle-row">
              <label>
                <input type="checkbox" id="gac-tool-toggle" onchange="GAC.setToolMode(this.checked)">
                Tool Mode
              </label>
              <label>
                <input type="checkbox" id="gac-computer-toggle" onchange="GAC.setComputerControl(this.checked)">
                Computer Control
              </label>
              <label>
                <input type="checkbox" id="gac-producer-toggle" onchange="GAC.setProducerMode(this.checked)">
                Producer Mode
              </label>
            </div>
            <div class="gac-row">
              <button class="gac-btn primary" onclick="GAC.unlockOwner()">Owner Approval</button>
              <button class="gac-btn danger" onclick="GAC.lockOwner()">Lock</button>
              <span class="gac-status" id="gac-owner-status">Checking…</span>
            </div>
            <div class="gac-row">
              <button class="gac-btn" onclick="GAC.attachWorkspace()">Attach Workspace</button>
              <button class="gac-btn danger" onclick="GAC.clearWorkspace()">Clear</button>
            </div>
            <div class="gac-status" id="gac-bridge-status">Bridge ready</div>
            <div class="gac-row" style="margin-top:4px;">
              <button class="gac-btn" onclick="GAC.diagnoseTools()">Diagnose Tools</button>
              <button class="gac-btn" onclick="GAC.runCodexParity()" title="Enable Tool Mode + Computer Control + Producer">Codex Power</button>
            </div>
          </div>
        </div>

        <!-- CREW / EXPERT -->
        <div class="gac-section collapsed" id="gac-sec-crew">
          <div class="gac-section-head" onclick="GAC.toggleSection('crew')">
            👥 Crew — Expert &amp; Agent Profiles <span class="gac-arrow">▾</span>
          </div>
          <div class="gac-section-body">
            <div class="gac-row">
              <span class="gac-label">Expert</span>
              <select id="gac-expert-select" class="gac-select" onchange="GAC.setExpert(this.value)">
                ${EXPERTS.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}
              </select>
              <label style="display:flex;align-items:center;gap:5px;font-size:11px;color:#aaa;cursor:pointer;">
                <input type="checkbox" id="gac-council-toggle" onchange="GAC.setCouncil(this.checked)" style="accent-color:var(--gac-gold);">
                Council
              </label>
            </div>
            <div class="gac-health" id="gac-health-chips">
              <span class="gac-chip" id="gac-chip-model">Models</span>
              <span class="gac-chip" id="gac-chip-vision">Vision</span>
              <span class="gac-chip" id="gac-chip-tools">Tools</span>
              <span class="gac-chip" id="gac-chip-draw">Draw</span>
              <span class="gac-chip" id="gac-chip-voice">Voice</span>
              <span class="gac-chip" id="gac-chip-grok">Grok</span>
            </div>
            <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:4px;">
              <button class="gac-btn green" onclick="GAC.loadProfile('moneypenny')">💼 Money Penny</button>
              <button class="gac-btn" onclick="GAC.loadProfile('lexi')">⚡ Lexi</button>
              <button class="gac-btn" onclick="GAC.loadProfile('vanessa')">👑 Vanessa</button>
              <button class="gac-btn" onclick="GAC.loadProfile('nexus')">🔗 Nexus</button>
              <button class="gac-btn" onclick="GAC.loadProfile('codex')">🛡 Sir Codex</button>
              <button class="gac-btn" onclick="GAC.loadProfile('gonbrazy')">🎚 GONBRAZY</button>
              <button class="gac-btn" onclick="GAC.loadProfile('wooh')">🎹 Wooh Da Kid</button>
              <button class="gac-btn" onclick="GAC.loadProfile('driveVault')">💾 Drive Vault</button>
              <button class="gac-btn" onclick="GAC.loadProfile('agent007Protocol')">🔐 007 Protocol</button>
            </div>
            <div class="gac-status" id="gac-crew-status">Crew ready</div>
          </div>
        </div>

        <!-- QUICK LINKS -->
        <div class="gac-section collapsed" id="gac-sec-links">
          <div class="gac-section-head" onclick="GAC.toggleSection('links')">
            🏰 Empire — Quick Links <span class="gac-arrow">▾</span>
          </div>
          <div class="gac-section-body">
            <div style="display:flex;gap:5px;flex-wrap:wrap;">
              <a class="gac-btn" href="index.html">🏠 Home</a>
              <a class="gac-btn" href="moneypenny.html">💼 Money Penny</a>
              <a class="gac-btn" href="dr-devin.html">🩺 Dr. Devin</a>
              <a class="gac-btn" href="goat-launcher-hub.html">⚡ Hub</a>
              <a class="gac-btn" href="music-studio.html">🎵 Studio</a>
              <a class="gac-btn" href="goat-casino.html">🎰 Casino</a>
              <a class="gac-btn" href="goat-city-rp.html">🏙 GTA RP</a>
              <a class="gac-btn" href="beat-maker.html">🥁 Beats</a>
              <a class="gac-btn" href="goat-celebrity-lounge.html">🥂 Lounge</a>
              <a class="gac-btn" href="touch-hub.html">👆 Touch Hub</a>
              <a class="gac-btn" href="ai-dashboard.html">📊 AI Dashboard</a>
              <a class="gac-btn primary" href="goat-launcher-hub.html">🐐 Command Hub</a>
            </div>
          </div>
        </div>

        <!-- ══════════════════════════════════════════════════
             DEVIN DESKTOP — NEW FEATURES
             ══════════════════════════════════════════════════ -->

        <!-- WORKFLOWS (Devin Desktop feature) -->
        <div class="gac-section collapsed" id="gac-sec-workflows">
          <div class="gac-section-head" onclick="GAC.toggleSection('workflows')">
            ⚡ Workflows <span style="font-size:9px;color:#555;font-weight:500;margin-left:4px;">Devin Desktop</span> <span class="gac-arrow">▾</span>
          </div>
          <div class="gac-section-body">
            <div class="gac-row">
              <input type="text" id="gac-wf-name" class="gac-input" placeholder="workflow-name" style="flex:1;">
              <select id="gac-wf-scope" class="gac-select">
                <option value="workspace">Workspace</option>
                <option value="global">Global</option>
              </select>
              <button class="gac-btn primary" onclick="GAC.createWorkflow()">+ New</button>
            </div>
            <div class="gac-row">
              <button class="gac-btn" onclick="GAC.loadWorkflows()">↻ Refresh</button>
              <span class="gac-status" id="gac-wf-status">Click Refresh to load workflows</span>
            </div>
            <div id="gac-wf-list" style="display:flex;flex-direction:column;gap:4px;margin-top:4px;"></div>
          </div>
        </div>

        <!-- RULES (Devin Desktop feature) -->
        <div class="gac-section collapsed" id="gac-sec-rules">
          <div class="gac-section-head" onclick="GAC.toggleSection('rules')">
            📋 Rules <span style="font-size:9px;color:#555;font-weight:500;margin-left:4px;">Devin Desktop</span> <span class="gac-arrow">▾</span>
          </div>
          <div class="gac-section-body">
            <div class="gac-row">
              <input type="text" id="gac-rule-name" class="gac-input" placeholder="rule-name" style="flex:1;">
              <select id="gac-rule-scope" class="gac-select">
                <option value="workspace">Workspace</option>
                <option value="global">Global</option>
              </select>
              <button class="gac-btn primary" onclick="GAC.createRule()">+ New</button>
            </div>
            <div class="gac-row">
              <button class="gac-btn" onclick="GAC.loadRules()">↻ Refresh</button>
              <span class="gac-status" id="gac-rule-status">Click Refresh to load rules</span>
            </div>
            <div id="gac-rule-list" style="display:flex;flex-direction:column;gap:4px;margin-top:4px;"></div>
            <div id="gac-rule-editor" style="display:none;margin-top:8px;">
              <div style="font-size:10px;color:var(--gac-gold);margin-bottom:4px;" id="gac-rule-editor-label">Editing rule…</div>
              <textarea id="gac-rule-ta" class="gac-ta" style="min-height:100px;"></textarea>
              <div class="gac-row" style="margin-top:6px;">
                <button class="gac-btn primary" onclick="GAC.saveRule()">Save Rule</button>
                <button class="gac-btn danger" onclick="GAC.closeRuleEditor()">Cancel</button>
                <span class="gac-status" id="gac-rule-save-status"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- MCP SERVER MANAGER (Devin Desktop feature) -->
        <div class="gac-section collapsed" id="gac-sec-mcp">
          <div class="gac-section-head" onclick="GAC.toggleSection('mcp')">
            🔌 MCP Servers <span style="font-size:9px;color:#555;font-weight:500;margin-left:4px;">Devin Desktop</span> <span class="gac-arrow">▾</span>
          </div>
          <div class="gac-section-body">
            <div class="gac-row">
              <input type="text" id="gac-mcp-name" class="gac-input" placeholder="server-name" style="flex:1;">
              <input type="text" id="gac-mcp-url" class="gac-input" placeholder="http://localhost:3001" style="flex:2;">
            </div>
            <div class="gac-row">
              <input type="text" id="gac-mcp-desc" class="gac-input" placeholder="Description (optional)" style="flex:1;">
              <button class="gac-btn primary" onclick="GAC.addMcpServer()">+ Add</button>
              <button class="gac-btn" onclick="GAC.loadMcpServers()">↻</button>
            </div>
            <div id="gac-mcp-list" style="display:flex;flex-direction:column;gap:4px;margin-top:4px;"></div>
            <div class="gac-status" id="gac-mcp-status">Click ↻ to load MCP servers</div>
          </div>
        </div>

        <!-- LIFEGUARD (Devin Desktop beta feature) -->
        <div class="gac-section collapsed" id="gac-sec-lifeguard">
          <div class="gac-section-head" onclick="GAC.toggleSection('lifeguard')">
            🛡 Lifeguard <span style="font-size:9px;color:#e74c3c;font-weight:700;margin-left:4px;">BETA</span> <span class="gac-arrow">▾</span>
          </div>
          <div class="gac-section-body">
            <div style="font-size:11px;color:#888;margin-bottom:8px;">AI code safety &amp; quality review — paste code or enter a file path.</div>
            <div class="gac-row">
              <input type="text" id="gac-lg-path" class="gac-input" placeholder="/path/to/file.js  (or leave blank to paste)" style="flex:1;">
              <select id="gac-lg-lang" class="gac-select">
                <option value="">Auto-detect</option>
                <option value="Python">Python</option>
                <option value="JavaScript">JavaScript</option>
                <option value="HTML">HTML</option>
                <option value="CSS">CSS</option>
                <option value="Bash">Bash</option>
              </select>
            </div>
            <textarea id="gac-lg-code" class="gac-ta" placeholder="Paste code here… or enter a file path above" style="min-height:80px;font-size:11px;"></textarea>
            <div class="gac-row">
              <button class="gac-btn primary" onclick="GAC.runLifeguard()">🛡 Review</button>
              <button class="gac-btn" onclick="GAC.reviewCurrentChat()">Review Chat Code</button>
              <span class="gac-status" id="gac-lg-status">Ready</span>
            </div>
            <div id="gac-lg-results" style="display:none;margin-top:8px;"></div>
          </div>
        </div>

        <!-- AGENT SELECTOR (Devin Desktop feature) -->
        <div class="gac-section collapsed" id="gac-sec-agentsel">
          <div class="gac-section-head" onclick="GAC.toggleSection('agentsel')">
            🤖 Switch Agent <span style="font-size:9px;color:#555;font-weight:500;margin-left:4px;">Devin Desktop</span> <span class="gac-arrow">▾</span>
          </div>
          <div class="gac-section-body">
            <div style="font-size:11px;color:#888;margin-bottom:8px;">Switch the active GOAT Force agent for this session.</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;" id="gac-agent-grid">
              ${[
                ['moneypenny','💼','Money Penny','OG Boss · Agent000-B'],
                ['dr-devin','🩺','Dr. Devin','Agent 007 · AI Strategist'],
                ['codex','🛡','Sir Codex','Agent 006 · Tech Architect'],
                ['oscar','🤝','Master Oscar','Agent 001 · Dealmaker'],
                ['vanessa','👑','Ms. Vanessa','Agent 003 · Brand & PR'],
                ['nexus','🔗','Ms. Nexus','Agent 004 · Intelligence'],
                ['lexi','⚡','Lexi','Agent 005 · Creative'],
                ['gonbrazy','🎚','GONBRAZY','Studio Boss'],
                ['woohdakid','🎹','Wooh Da Kid','Tony Starks · Beat Maestro'],
                ['hannah','🌟','Hannah Miller','Amigo Alley Keeper'],
              ].map(([id,ic,n,r])=>`
                <button class="gac-agent-card" onclick="GAC.switchAgent('${id}','${n}')">
                  <span style="font-size:18px;">${ic}</span>
                  <div>
                    <div style="font-size:11px;font-weight:700;color:#fff;">${n}</div>
                    <div style="font-size:9px;color:#666;">${r}</div>
                  </div>
                </button>`).join('')}
            </div>
            <div class="gac-status" id="gac-agent-status">Current agent: this page's agent</div>
          </div>
        </div>

        <!-- DEVIN BROWSER (Devin Desktop feature) -->
        <div class="gac-section collapsed" id="gac-sec-browser">
          <div class="gac-section-head" onclick="GAC.toggleSection('browser')">
            🌐 Devin Browser <span style="font-size:9px;color:#555;font-weight:500;margin-left:4px;">Devin Desktop</span> <span class="gac-arrow">▾</span>
          </div>
          <div class="gac-section-body">
            <div class="gac-row">
              <input type="text" id="gac-br-url" class="gac-input" placeholder="https://example.com  or search query" style="flex:1;">
              <button class="gac-btn primary" onclick="GAC.browserFetch()">Fetch</button>
              <button class="gac-btn" onclick="GAC.browserSearch()">Search</button>
            </div>
            <div class="gac-row">
              <span class="gac-label">Extract</span>
              <select id="gac-br-extract" class="gac-select">
                <option value="text">Text</option>
                <option value="links">Links</option>
                <option value="all">All</option>
              </select>
              <button class="gac-btn" onclick="GAC.browserSendToChat()">→ Chat</button>
            </div>
            <div class="gac-status" id="gac-br-status">Enter URL or search query</div>
            <div id="gac-br-result" style="display:none;margin-top:8px;background:rgba(0,0,0,0.4);border:1px solid rgba(255,215,0,0.1);border-radius:6px;padding:8px;font-size:10px;color:#ccc;max-height:160px;overflow-y:auto;white-space:pre-wrap;word-break:break-word;"></div>
          </div>
        </div>

        <!-- REVERT TO STEP (Devin Desktop feature) -->
        <div class="gac-section collapsed" id="gac-sec-revert">
          <div class="gac-section-head" onclick="GAC.toggleSection('revert')">
            ↩ Revert to Step <span style="font-size:9px;color:#555;font-weight:500;margin-left:4px;">Devin Desktop</span> <span class="gac-arrow">▾</span>
          </div>
          <div class="gac-section-body">
            <div class="gac-row">
              <input type="text" id="gac-rv-path" class="gac-input" placeholder="File path to snapshot/revert" style="flex:1;">
              <button class="gac-btn primary" onclick="GAC.takeSnapshot()">📸 Snapshot</button>
            </div>
            <div class="gac-row">
              <button class="gac-btn" onclick="GAC.loadSnapshots()">↻ Load Snapshots</button>
              <span class="gac-status" id="gac-rv-status">Snapshots protect files before edits</span>
            </div>
            <div id="gac-rv-list" style="display:flex;flex-direction:column;gap:4px;margin-top:4px;"></div>
          </div>
        </div>

        <!-- GIT TOOLS (Devin Desktop feature) -->
        <div class="gac-section collapsed" id="gac-sec-git">
          <div class="gac-section-head" onclick="GAC.toggleSection('git')">
            🔀 Git Tools <span style="font-size:9px;color:#555;font-weight:500;margin-left:4px;">Devin Desktop</span> <span class="gac-arrow">▾</span>
          </div>
          <div class="gac-section-body">
            <div class="gac-row">
              <button class="gac-btn primary" onclick="GAC.generateCommitMsg()">✨ Generate Commit Message</button>
              <button class="gac-btn" onclick="GAC.gitStatus()">Git Status</button>
            </div>
            <div id="gac-git-status-out" style="display:none;margin-top:8px;background:rgba(0,0,0,0.4);border:1px solid rgba(255,215,0,0.1);border-radius:6px;padding:8px;font-size:10px;color:#c8f7a0;white-space:pre-wrap;max-height:120px;overflow-y:auto;font-family:var(--gac-font);"></div>
            <div id="gac-commit-out" style="display:none;margin-top:8px;">
              <div style="font-size:10px;color:var(--gac-gold);margin-bottom:4px;">✨ Generated commit message:</div>
              <textarea id="gac-commit-msg" class="gac-ta" style="min-height:60px;"></textarea>
              <div class="gac-row" style="margin-top:6px;">
                <button class="gac-btn primary" onclick="GAC.copyCommitMsg()">Copy</button>
                <button class="gac-btn" onclick="GAC.sendCommitToChat()">→ Chat</button>
                <span class="gac-status" id="gac-commit-status"></span>
              </div>
            </div>
            <div class="gac-status" id="gac-git-status">Ready</div>
          </div>
        </div>

        <!-- FILE ATTACH / CONTEXT (Devin Desktop feature) -->
        <div class="gac-section collapsed" id="gac-sec-attach">
          <div class="gac-section-head" onclick="GAC.toggleSection('attach')">
            📎 Attach File to Chat <span style="font-size:9px;color:#555;font-weight:500;margin-left:4px;">Devin Desktop</span> <span class="gac-arrow">▾</span>
          </div>
          <div class="gac-section-body">
            <div style="font-size:11px;color:#888;margin-bottom:8px;">Attach a file's content into the current chat as context.</div>
            <div class="gac-row">
              <input type="text" id="gac-att-path" class="gac-input" placeholder="/absolute/path/to/file.js" style="flex:1;">
              <button class="gac-btn primary" onclick="GAC.attachFile()">Attach</button>
            </div>
            <div style="font-size:10px;color:#555;margin:4px 0 8px;">— or upload —</div>
            <input type="file" id="gac-att-upload" style="font-size:11px;color:#aaa;margin-bottom:8px;" onchange="GAC.uploadFile(this)">
            <div class="gac-row">
              <button class="gac-btn" onclick="GAC.attachCurrentPage()">Attach This Page</button>
              <button class="gac-btn" onclick="GAC.attachDirectory()">List Directory</button>
            </div>
            <div class="gac-status" id="gac-att-status">No file attached</div>
            <div id="gac-att-preview" style="display:none;margin-top:8px;background:rgba(0,0,0,0.4);border:1px solid rgba(255,215,0,0.1);border-radius:6px;padding:8px;font-size:10px;color:#ccc;max-height:120px;overflow-y:auto;white-space:pre-wrap;font-family:var(--gac-font);"></div>
          </div>
        </div>

      </div>
    `;

    return { topbar, toggle, drawer };
  }

  // ── Inject into DOM ──────────────────────────────────────────
  function inject() {
    injectCSS();
    const { topbar, toggle, drawer } = buildHTML();

    // Insert topbar at top of body (after nav if present, else first)
    const nav = document.querySelector('.goat-nav, nav');
    if (nav) {
      nav.parentNode.insertBefore(topbar, nav.nextSibling);
    } else {
      document.body.insertBefore(topbar, document.body.firstChild);
    }

    document.body.appendChild(toggle);
    document.body.appendChild(drawer);

    // Restore state into UI
    const ms = document.getElementById('gac-skill-select');
    if (ms) ms.value = state.skill;
    const es = document.getElementById('gac-expert-select');
    if (es) es.value = state.expert;
    const ct = document.getElementById('gac-council-toggle');
    if (ct) ct.checked = state.council;
    const tt = document.getElementById('gac-tool-toggle');
    if (tt) tt.checked = state.toolMode;
    const cct = document.getElementById('gac-computer-toggle');
    if (cct) cct.checked = state.computerControl;
    const pt = document.getElementById('gac-producer-toggle');
    if (pt) pt.checked = state.producerMode;
    const sst = document.getElementById('gac-speech-style');
    if (sst) sst.value = state.speechStyle;
    const svt = document.getElementById('gac-speech-voice');
    if (svt) svt.value = state.speechVoice;
    const sspd = document.getElementById('gac-speech-speed');
    if (sspd) {
      sspd.value = state.speechSpeed * 100;
      const v = document.getElementById('gac-speed-val');
      if (v) v.textContent = state.speechSpeed.toFixed(1) + '×';
    }
    const sta = document.getElementById('gac-sys-ta');
    if (sta) sta.value = state.sysPrompt;
    const mta = document.getElementById('gac-mem-ta');
    if (mta) mta.value = state.memory;
  }

  // ── Public API (window.GAC) ──────────────────────────────────
  const GAC = {

    // Model
    setModel(v) {
      state.model = v; LS.setItem('gac.model', v);
    },

    // Skill
    setSkill(v) {
      state.skill = v; LS.setItem('gac.skill', v);
    },

    // Temp
    setTemp(v) {
      state.temp = parseFloat(v) || 0.7;
      LS.setItem('gac.temp', state.temp);
    },

    // Expert
    setExpert(v) {
      state.expert = v; LS.setItem('gac.expert', v);
    },

    // Council
    setCouncil(v) {
      state.council = v; LS.setItem('gac.council', v);
    },

    // Tool toggles
    setToolMode(v) {
      state.toolMode = v; LS.setItem('gac.toolMode', v);
      GAC._patchSettings({ toolModeEnabled: v });
    },
    setComputerControl(v) {
      state.computerControl = v; LS.setItem('gac.computerControl', v);
      GAC._patchSettings({ computerControlEnabled: v });
    },
    setProducerMode(v) {
      state.producerMode = v; LS.setItem('gac.producerMode', v);
      GAC._patchSettings({ producerModeEnabled: v });
    },

    runCodexParity() {
      state.toolMode = true; state.computerControl = true; state.producerMode = true;
      LS.setItem('gac.toolMode','true'); LS.setItem('gac.computerControl','true'); LS.setItem('gac.producerMode','true');
      const tt = document.getElementById('gac-tool-toggle');
      const cct = document.getElementById('gac-computer-toggle');
      const pt = document.getElementById('gac-producer-toggle');
      if (tt) tt.checked = true;
      if (cct) cct.checked = true;
      if (pt) pt.checked = true;
      GAC._patchSettings({ toolModeEnabled:true, computerControlEnabled:true, producerModeEnabled:true });
      GAC._statusMsg('gac-bridge-status', '⚡ Codex Power activated', 'ok');
    },

    // Speech
    setSpeechStyle(v) {
      state.speechStyle = v; LS.setItem('gac.speechStyle', v);
      GAC._patchSettings({ speechStyle: v });
    },
    setSpeechVoice(v) {
      state.speechVoice = v; LS.setItem('gac.speechVoice', v);
      GAC._patchSettings({ speechVoiceName: v });
    },
    setSpeechSpeed(v) {
      const spd = parseFloat(v) / 100;
      state.speechSpeed = spd; LS.setItem('gac.speechSpeed', spd);
      GAC._patchSettings({ speechSpeed: spd });
    },

    // Voice toggles
    toggleVoiceLoop() {
      state.voiceLoop = !state.voiceLoop;
      const b = document.getElementById('gac-vbtn-loop');
      if (b) b.classList.toggle('active', state.voiceLoop);
      GAC._statusMsg('gac-voice-status', state.voiceLoop ? '🎙 Voice loop ON' : 'Voice loop off');
    },
    toggleWake() {
      state.voiceWake = !state.voiceWake;
      const b = document.getElementById('gac-vbtn-wake');
      if (b) b.classList.toggle('active', state.voiceWake);
      GAC._statusMsg('gac-voice-status', state.voiceWake ? '👂 Wake word active' : 'Wake word off');
    },
    toggleAutoSpeak() {
      state.autoSpeak = !state.autoSpeak;
      const b = document.getElementById('gac-vbtn-read');
      if (b) b.classList.toggle('active', state.autoSpeak);
      GAC._patchSettings({ voiceAutoSpeak: state.autoSpeak });
      GAC._statusMsg('gac-voice-status', state.autoSpeak ? '🔊 Auto-read ON' : 'Auto-read off');
    },
    stopLoop() {
      state.voiceLoop = false; state.voiceWake = false; state.autoSpeak = false;
      ['gac-vbtn-loop','gac-vbtn-wake','gac-vbtn-read'].forEach(id => {
        const b = document.getElementById(id);
        if (b) b.classList.remove('active');
      });
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      GAC._patchSettings({ voiceAutoSpeak:false, voiceLoopEnabled:false, voiceWakeEnabled:false });
      // Also call Agent007 stop-loop endpoint
      fetch(AGENT007 + '/api/agent007/stop-loop', { method:'POST' }).catch(()=>{});
      GAC._statusMsg('gac-voice-status', '🔇 Loop stopped', 'err');
    },
    stopSpeaking() {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      GAC._statusMsg('gac-voice-status', '🔇 Muted');
    },

    // System prompt
    async saveGlobal() {
      const v = document.getElementById('gac-sys-ta')?.value.trim() || '';
      state.sysPrompt = v; LS.setItem('gac.sysPrompt', v);
      await GAC._patchSettings({ globalSystemPrompt: v });
      GAC._statusMsg('gac-global-status', v ? '✓ Saved globally' : '✓ Cleared', 'ok');
    },
    async clearGlobal() {
      state.sysPrompt = ''; LS.setItem('gac.sysPrompt', '');
      const ta = document.getElementById('gac-sys-ta'); if (ta) ta.value = '';
      await GAC._patchSettings({ globalSystemPrompt: '' });
      GAC._statusMsg('gac-global-status', '✓ Cleared', 'ok');
    },
    async saveMemory() {
      const v = document.getElementById('gac-mem-ta')?.value.trim() || '';
      state.memory = v; LS.setItem('gac.memory', v);
      await GAC._patchSettings({ projectMemory: v });
      GAC._statusMsg('gac-mem-status', v ? '✓ Memory saved' : '✓ Cleared', 'ok');
    },
    async clearMemory() {
      state.memory = ''; LS.setItem('gac.memory', '');
      const ta = document.getElementById('gac-mem-ta'); if (ta) ta.value = '';
      await GAC._patchSettings({ projectMemory: '' });
      GAC._statusMsg('gac-mem-status', '✓ Cleared', 'ok');
    },

    // DeepSeek
    async saveDeepseek() {
      const v = document.getElementById('gac-deepseek-key')?.value.trim();
      if (!v) { alert('Paste your DeepSeek API key first.'); return; }
      await GAC._patchSettings({ deepseekApiKey: v });
      const inp = document.getElementById('gac-deepseek-key'); if (inp) inp.value = '';
      GAC._statusMsg('gac-deepseek-status', '✓ Saved — pick deepseek-api/* in Model', 'ok');
    },
    async clearDeepseek() {
      if (!confirm('Remove saved DeepSeek API key?')) return;
      await GAC._patchSettings({ deepseekApiKey: '', clearDeepseekApiKey: true });
      GAC._statusMsg('gac-deepseek-status', 'Key removed', 'err');
    },

    // Owner approval
    async unlockOwner() {
      const pin = prompt('Enter Owner Approval PIN (DJ Speedy):');
      if (!pin) return;
      try {
        const r = await fetch(AGENT007 + '/api/owner-approval/unlock', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ pin })
        });
        const d = r.ok ? await r.json() : {};
        GAC._statusMsg('gac-owner-status', d.ok ? '✅ Owner approved' : '❌ Wrong PIN', d.ok ? 'ok' : 'err');
      } catch {
        GAC._statusMsg('gac-owner-status', 'Agent007 offline', 'err');
      }
    },
    async lockOwner() {
      await fetch(AGENT007 + '/api/owner-approval/lock', { method:'POST' }).catch(()=>{});
      GAC._statusMsg('gac-owner-status', '🔒 Locked', '');
    },

    // Workspace bridge
    async attachWorkspace() {
      GAC._statusMsg('gac-bridge-status', 'Attaching workspace snapshot…');
      try {
        const r = await fetch(AGENT007 + '/api/workspace/snapshot');
        if (r.ok) GAC._statusMsg('gac-bridge-status', '✓ Workspace attached', 'ok');
        else GAC._statusMsg('gac-bridge-status', 'Snapshot not available', 'err');
      } catch {
        GAC._statusMsg('gac-bridge-status', 'Agent007 offline — workspace unavailable', 'err');
      }
    },
    clearWorkspace() {
      GAC._statusMsg('gac-bridge-status', 'Workspace cleared');
    },

    async diagnoseTools() {
      GAC._statusMsg('gac-bridge-status', 'Running tool diagnostics…');
      try {
        const r = await fetch(AGENT007 + '/api/tools/diagnose');
        const d = r.ok ? await r.json() : {};
        GAC._statusMsg('gac-bridge-status', d.summary || '✓ Diagnose complete', 'ok');
      } catch {
        GAC._statusMsg('gac-bridge-status', 'Diagnose failed — Agent007 offline', 'err');
      }
    },

    // Crew profiles
    async loadProfile(name) {
      const MAP = {
        moneypenny: '/api/crew/money-penny/profile',
        lexi: '/api/crew/lexi/profile',
        vanessa: '/api/crew/vanessa/profile',
        nexus: '/api/crew/nexus/profile',
        codex: '/api/crew/codex/profile',
        gonbrazy: '/api/crew/gonbrazy/profile',
        wooh: '/api/crew/wooh-da-kid/profile',
        driveVault: '/api/vault/profile',
        agent007Protocol: '/api/vault/agent007-protocol',
      };
      const ep = MAP[name];
      if (!ep) return;
      GAC._statusMsg('gac-crew-status', `Loading ${name}…`);
      try {
        const r = await fetch(AGENT007 + ep);
        const d = r.ok ? await r.json() : {};
        if (d.profile || d.ok) {
          GAC._statusMsg('gac-crew-status', `✓ ${name} profile loaded into memory`, 'ok');
        } else {
          // Fallback: ask Intel server
          const r2 = await fetch(INTEL + `/ai/moneypenny`, {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({message:`Load ${name} profile into memory`})
          });
          GAC._statusMsg('gac-crew-status', `✓ ${name} loaded via Intel`, 'ok');
        }
      } catch {
        GAC._statusMsg('gac-crew-status', `${name} — server offline`, 'err');
      }
    },

    // Quick bar action
    quick(fn, msg) {
      if (fn === 'enableCodexParity') { GAC.runCodexParity(); return; }
      // Try to hook into any open chat on the page
      const chatInput = document.getElementById('chatInput') ||
                        document.getElementById('msg-input') ||
                        document.querySelector('textarea[placeholder*="Ask"]');
      if (chatInput && msg) {
        chatInput.value = msg;
        chatInput.dispatchEvent(new Event('input', {bubbles:true}));
        // Try to submit
        const sendBtn = document.getElementById('sendBtn') ||
                        document.getElementById('send-btn') ||
                        document.querySelector('button[onclick*="sendMessage"]');
        if (sendBtn) { sendBtn.click(); return; }
        chatInput.dispatchEvent(new KeyboardEvent('keydown', {key:'Enter', bubbles:true}));
        return;
      }
      // No chat on page — open Money Penny with the message
      if (msg) window.open('moneypenny.html?msg=' + encodeURIComponent(msg), '_blank');
    },

    // Section toggle
    toggleSection(id) {
      document.getElementById('gac-sec-' + id)?.classList.toggle('collapsed');
    },
    toggleSys()    { GAC.toggleSection('sys'); },
    toggleBridge() { GAC.toggleSection('bridge'); },
    toggleCrew()   { GAC.toggleSection('crew'); },

    // ── Health check & status polling ──────────────────────────
    async checkStatus() {
      // Intel server
      try {
        const r = await fetch(INTEL + '/health', { signal: AbortSignal.timeout(3000) });
        const d = r.ok ? await r.json() : {};
        state.intelOnline = true;
        GAC._setDot('gac-sb-intel', true);
        // xAI Grok
        const grokOk = d.grok && d.grok.includes('✅');
        GAC._setDot('gac-sb-grok', grokOk);
        document.getElementById('gac-xai-status').textContent =
          grokOk ? '✅ Grok/xAI online — pick xai-api/grok-3-mini-fast' : 'Grok key not set — add via goat_intel.py';
        document.getElementById('gac-xai-status').className = 'gac-status ' + (grokOk ? 'ok' : '');
        // Gemini/OpenAI chips
        GAC._chipState('gac-chip-grok', grokOk ? 'ok' : 'off');
      } catch {
        state.intelOnline = false;
        GAC._setDot('gac-sb-intel', false);
        GAC._chipState('gac-chip-grok', 'warn');
      }

      // Agent007
      try {
        const r2 = await fetch(AGENT007 + '/api/settings', { signal: AbortSignal.timeout(3000) });
        state.agent007Online = r2.ok;
        GAC._setDot('gac-sb-a007', r2.ok);
        if (r2.ok) {
          const s = await r2.json();
          GAC._chipState('gac-chip-tools', s.toolModeEnabled ? 'ok' : 'off');
          GAC._chipState('gac-chip-voice', 'ok');
          // Sync toggles to server state
          const tt = document.getElementById('gac-tool-toggle');
          const ct = document.getElementById('gac-computer-toggle');
          const pt = document.getElementById('gac-producer-toggle');
          if (tt) tt.checked = Boolean(s.toolModeEnabled);
          if (ct) ct.checked = Boolean(s.computerControlEnabled);
          if (pt) pt.checked = Boolean(s.producerModeEnabled);
          // DeepSeek status
          const dsel = document.getElementById('gac-deepseek-status');
          if (dsel) {
            dsel.textContent = s.deepseekConfigured
              ? '✅ Connected — ' + (s.deepseekApiKeyMasked || 'key saved')
              : 'Paste your DeepSeek developer key and Save';
            dsel.className = 'gac-status ' + (s.deepseekConfigured ? 'ok' : '');
          }
        }
      } catch {
        GAC._setDot('gac-sb-a007', false);
        GAC._chipState('gac-chip-tools', 'off');
      }

      // Ollama
      try {
        const r3 = await fetch(OLLAMA + '/api/tags', { signal: AbortSignal.timeout(3000) });
        const d3 = r3.ok ? await r3.json() : {};
        GAC._setDot('gac-sb-ollama', r3.ok);
        const models = (d3.models || []).map(m => m.name).filter(Boolean);
        state.models = models;
        GAC._chipState('gac-chip-model', models.length > 0 ? 'ok' : 'warn');
        const visionModels = models.filter(m => /moondream|llava|vision/i.test(m));
        GAC._chipState('gac-chip-vision', visionModels.length > 0 ? 'ok' : 'warn');
        GAC._chipState('gac-chip-draw', 'ok');
        // Populate model dropdown
        const sel = document.getElementById('gac-model-select');
        if (sel && models.length) {
          const extra = ['xai-api/grok-3-mini-fast','xai-api/grok-3','deepseek-api/deepseek-chat','deepseek-api/deepseek-reasoner'];
          const all = [...extra, ...models];
          sel.innerHTML = all.map(m => `<option value="${m}"${m===state.model?' selected':''}>${m}</option>`).join('');
          // Also populate topbar model select
          const tsel = document.getElementById('gac-model-select');
          if (tsel && tsel !== sel) tsel.innerHTML = sel.innerHTML;
        }
      } catch {
        GAC._setDot('gac-sb-ollama', false);
        GAC._chipState('gac-chip-model', 'off');
      }
    },

    // Hardware stats (poll Agent007 /api/hw or estimate)
    async pollHW() {
      try {
        const r = await fetch(AGENT007 + '/api/hw', { signal: AbortSignal.timeout(2000) });
        if (r.ok) {
          const d = await r.json();
          GAC._setBar('gac-cpu-bar', 'gac-cpu-pct', d.cpu || 0);
          GAC._setBar('gac-ram-bar', 'gac-ram-pct', d.ram || 0);
        }
      } catch {
        // silent — hw bar stays at --
      }
    },

    // ── Helpers ─────────────────────────────────────────────────
    _patchSettings(payload) {
      return fetch(AGENT007 + '/api/settings', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      }).catch(()=>{
        // Fallback: also try Intel server
        return fetch(INTEL + '/settings', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify(payload)
        }).catch(()=>{});
      });
    },

    _statusMsg(id, msg, cls='') {
      const el = document.getElementById(id);
      if (!el) return;
      el.textContent = msg;
      el.className = 'gac-status ' + cls;
      if (cls === 'ok' || cls === 'err') {
        setTimeout(() => { if (el.textContent === msg) { el.textContent = ''; el.className = 'gac-status'; } }, 3500);
      }
    },

    _setDot(id, on) {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.toggle('on', on);
      el.classList.toggle('off', !on);
    },

    _chipState(id, state) {
      const el = document.getElementById(id);
      if (!el) return;
      el.className = 'gac-chip ' + state;
    },

    _setBar(barId, pctId, pct) {
      const bar = document.getElementById(barId);
      const label = document.getElementById(pctId);
      if (bar) bar.style.width = Math.min(100, pct) + '%';
      if (label) label.textContent = Math.round(pct) + '%';
    },

    // ══════════════════════════════════════════════════════════
    //  DEVIN DESKTOP — NEW FEATURES
    // ══════════════════════════════════════════════════════════

    // ── WORKFLOWS ────────────────────────────────────────────
    async loadWorkflows() {
      GAC._statusMsg('gac-wf-status', 'Loading…');
      try {
        const r = await fetch(INTEL + '/workflows/list', { signal: AbortSignal.timeout(5000) });
        const d = await r.json();
        const list = document.getElementById('gac-wf-list');
        if (!list) return;
        if (!d.workflows || !d.workflows.length) {
          list.innerHTML = '<div style="font-size:11px;color:#555;padding:4px;">No workflows yet — create one above.</div>';
          GAC._statusMsg('gac-wf-status', 'No workflows found');
          return;
        }
        list.innerHTML = d.workflows.map(w => `
          <div class="gac-list-item">
            <span class="gac-item-name">⚡ ${w.name}</span>
            <span class="gac-item-scope ${w.scope}">${w.scope}</span>
            <button class="gac-btn" style="padding:2px 7px;font-size:9px;" onclick="GAC.runWorkflow('${w.id}','${w.scope}')">Run</button>
            <button class="gac-btn danger" style="padding:2px 7px;font-size:9px;" onclick="GAC.deleteWorkflow('${encodeURIComponent(w.path)}')">✕</button>
          </div>`).join('');
        GAC._statusMsg('gac-wf-status', `${d.workflows.length} workflow(s) loaded`, 'ok');
      } catch(e) {
        GAC._statusMsg('gac-wf-status', 'Intel server offline', 'err');
      }
    },

    async createWorkflow() {
      const name = document.getElementById('gac-wf-name')?.value.trim();
      const scope = document.getElementById('gac-wf-scope')?.value || 'workspace';
      if (!name) { GAC._statusMsg('gac-wf-status', 'Enter a workflow name', 'err'); return; }
      GAC._statusMsg('gac-wf-status', 'Creating…');
      try {
        const r = await fetch(INTEL + '/workflows/create', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ name, scope })
        });
        const d = await r.json();
        if (d.ok) {
          document.getElementById('gac-wf-name').value = '';
          GAC._statusMsg('gac-wf-status', `✓ Created: ${name}`, 'ok');
          GAC.loadWorkflows();
        } else {
          GAC._statusMsg('gac-wf-status', d.error || 'Create failed', 'err');
        }
      } catch(e) {
        GAC._statusMsg('gac-wf-status', 'Intel server offline', 'err');
      }
    },

    async runWorkflow(id, scope) {
      GAC._statusMsg('gac-wf-status', `Running ${id}…`);
      const chatInput = document.getElementById('chatInput') || document.querySelector('textarea[placeholder*="Ask"]');
      try {
        const r = await fetch(INTEL + '/workflows/run', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ id, agent: 'moneypenny', message: 'Execute this workflow.' })
        });
        const d = await r.json();
        if (d.reply && chatInput) {
          chatInput.value = `[Workflow: ${id}] ${d.reply}`;
        }
        GAC._statusMsg('gac-wf-status', `✓ Workflow ran: ${id}`, 'ok');
      } catch(e) {
        GAC._statusMsg('gac-wf-status', 'Run failed — Intel offline', 'err');
      }
    },

    async deleteWorkflow(encodedPath) {
      if (!confirm('Delete this workflow?')) return;
      const path = decodeURIComponent(encodedPath);
      try {
        const r = await fetch(INTEL + '/workflows/delete', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ path })
        });
        const d = await r.json();
        if (d.ok) GAC.loadWorkflows();
        else GAC._statusMsg('gac-wf-status', d.error || 'Delete failed', 'err');
      } catch(e) {
        GAC._statusMsg('gac-wf-status', 'Intel offline', 'err');
      }
    },

    // ── RULES ──────────────────────────────────────────────────
    _ruleEditPath: null,

    async loadRules() {
      GAC._statusMsg('gac-rule-status', 'Loading…');
      try {
        const r = await fetch(INTEL + '/rules/list', { signal: AbortSignal.timeout(5000) });
        const d = await r.json();
        const list = document.getElementById('gac-rule-list');
        if (!list) return;
        if (!d.rules || !d.rules.length) {
          list.innerHTML = '<div style="font-size:11px;color:#555;padding:4px;">No rules yet — create one above.</div>';
          GAC._statusMsg('gac-rule-status', 'No rules found');
          return;
        }
        list.innerHTML = d.rules.map(rule => `
          <div class="gac-list-item">
            <span class="gac-item-name">📋 ${rule.name}</span>
            <span class="gac-item-scope ${rule.scope}">${rule.scope}</span>
            <button class="gac-btn" style="padding:2px 7px;font-size:9px;" onclick="GAC.editRule('${encodeURIComponent(rule.path)}','${encodeURIComponent(rule.content)}','${rule.name}')">Edit</button>
            <button class="gac-btn danger" style="padding:2px 7px;font-size:9px;" onclick="GAC.deleteRule('${encodeURIComponent(rule.path)}')">✕</button>
          </div>`).join('');
        GAC._statusMsg('gac-rule-status', `${d.rules.length} rule(s) loaded`, 'ok');
      } catch(e) {
        GAC._statusMsg('gac-rule-status', 'Intel server offline', 'err');
      }
    },

    async createRule() {
      const name = document.getElementById('gac-rule-name')?.value.trim();
      const scope = document.getElementById('gac-rule-scope')?.value || 'workspace';
      if (!name) { GAC._statusMsg('gac-rule-status', 'Enter a rule name', 'err'); return; }
      try {
        const r = await fetch(INTEL + '/rules/create', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ name, scope })
        });
        const d = await r.json();
        if (d.ok) {
          document.getElementById('gac-rule-name').value = '';
          GAC.editRule(encodeURIComponent(d.path), '', name);
          GAC.loadRules();
        } else {
          GAC._statusMsg('gac-rule-status', d.error || 'Create failed', 'err');
        }
      } catch(e) {
        GAC._statusMsg('gac-rule-status', 'Intel offline', 'err');
      }
    },

    editRule(encodedPath, encodedContent, name) {
      GAC._ruleEditPath = decodeURIComponent(encodedPath);
      const ed = document.getElementById('gac-rule-editor');
      const ta = document.getElementById('gac-rule-ta');
      const lbl = document.getElementById('gac-rule-editor-label');
      if (ed) ed.style.display = 'block';
      if (ta) ta.value = decodeURIComponent(encodedContent);
      if (lbl) lbl.textContent = `Editing: ${name}`;
    },

    async saveRule() {
      if (!GAC._ruleEditPath) return;
      const content = document.getElementById('gac-rule-ta')?.value || '';
      try {
        const r = await fetch(INTEL + '/rules/save', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ path: GAC._ruleEditPath, content })
        });
        const d = await r.json();
        if (d.ok) {
          GAC._statusMsg('gac-rule-save-status', '✓ Saved', 'ok');
          GAC.closeRuleEditor();
          GAC.loadRules();
        } else {
          GAC._statusMsg('gac-rule-save-status', d.error || 'Save failed', 'err');
        }
      } catch(e) {
        GAC._statusMsg('gac-rule-save-status', 'Intel offline', 'err');
      }
    },

    closeRuleEditor() {
      GAC._ruleEditPath = null;
      const ed = document.getElementById('gac-rule-editor');
      if (ed) ed.style.display = 'none';
    },

    async deleteRule(encodedPath) {
      if (!confirm('Delete this rule?')) return;
      try {
        const r = await fetch(INTEL + '/rules/delete', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ path: decodeURIComponent(encodedPath) })
        });
        const d = await r.json();
        if (d.ok) GAC.loadRules();
        else GAC._statusMsg('gac-rule-status', d.error || 'Delete failed', 'err');
      } catch(e) {
        GAC._statusMsg('gac-rule-status', 'Intel offline', 'err');
      }
    },

    // ── MCP SERVER MANAGER ────────────────────────────────────
    async loadMcpServers() {
      GAC._statusMsg('gac-mcp-status', 'Loading…');
      try {
        const r = await fetch(INTEL + '/mcp/list', { signal: AbortSignal.timeout(5000) });
        const d = await r.json();
        const list = document.getElementById('gac-mcp-list');
        if (!list) return;
        if (!d.servers || !d.servers.length) {
          list.innerHTML = '<div style="font-size:11px;color:#555;padding:4px;">No MCP servers configured.</div>';
          GAC._statusMsg('gac-mcp-status', 'No servers found');
          return;
        }
        list.innerHTML = d.servers.map(s => `
          <div class="gac-mcp-item">
            <div class="mcp-dot ${s.enabled ? 'on' : 'off'}"></div>
            <div class="mcp-info">
              <div class="mcp-name">${s.name}</div>
              <div class="mcp-url">${s.url}</div>
            </div>
            <button class="gac-btn" style="padding:2px 7px;font-size:9px;" onclick="GAC.pingMcpServer('${s.url}','${s.name}')">Ping</button>
            <button class="gac-btn ${s.enabled ? 'danger' : 'green'}" style="padding:2px 7px;font-size:9px;"
              onclick="GAC.toggleMcpServer('${s.name}',${!s.enabled})">${s.enabled ? 'Disable' : 'Enable'}</button>
            <button class="gac-btn danger" style="padding:2px 7px;font-size:9px;" onclick="GAC.removeMcpServer('${s.name}')">✕</button>
          </div>`).join('');
        GAC._statusMsg('gac-mcp-status', `${d.servers.length} server(s) loaded`, 'ok');
      } catch(e) {
        GAC._statusMsg('gac-mcp-status', 'Intel offline', 'err');
      }
    },

    async addMcpServer() {
      const name = document.getElementById('gac-mcp-name')?.value.trim();
      const url = document.getElementById('gac-mcp-url')?.value.trim();
      const description = document.getElementById('gac-mcp-desc')?.value.trim();
      if (!name || !url) { GAC._statusMsg('gac-mcp-status', 'Name and URL required', 'err'); return; }
      try {
        const r = await fetch(INTEL + '/mcp/add', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ name, url, description })
        });
        const d = await r.json();
        if (d.ok) {
          ['gac-mcp-name','gac-mcp-url','gac-mcp-desc'].forEach(id => {
            const el = document.getElementById(id); if (el) el.value = '';
          });
          GAC._statusMsg('gac-mcp-status', `✓ Added: ${name}`, 'ok');
          GAC.loadMcpServers();
        } else {
          GAC._statusMsg('gac-mcp-status', d.error || 'Add failed', 'err');
        }
      } catch(e) {
        GAC._statusMsg('gac-mcp-status', 'Intel offline', 'err');
      }
    },

    async toggleMcpServer(name, enabled) {
      try {
        await fetch(INTEL + '/mcp/toggle', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ name, enabled })
        });
        GAC.loadMcpServers();
      } catch(e) {
        GAC._statusMsg('gac-mcp-status', 'Intel offline', 'err');
      }
    },

    async removeMcpServer(name) {
      if (!confirm(`Remove MCP server "${name}"?`)) return;
      try {
        const r = await fetch(INTEL + '/mcp/remove', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ name })
        });
        const d = await r.json();
        if (d.ok) GAC.loadMcpServers();
      } catch(e) {
        GAC._statusMsg('gac-mcp-status', 'Intel offline', 'err');
      }
    },

    async pingMcpServer(url, name) {
      GAC._statusMsg('gac-mcp-status', `Pinging ${name}…`);
      try {
        const r = await fetch(INTEL + '/mcp/ping', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ url })
        });
        const d = await r.json();
        GAC._statusMsg('gac-mcp-status',
          d.reachable ? `✅ ${name} online (${d.status})` : `❌ ${name} unreachable: ${d.error}`,
          d.reachable ? 'ok' : 'err');
      } catch(e) {
        GAC._statusMsg('gac-mcp-status', 'Intel offline', 'err');
      }
    },

    // ── LIFEGUARD ─────────────────────────────────────────────
    async runLifeguard() {
      const code = document.getElementById('gac-lg-code')?.value.trim();
      const filePath = document.getElementById('gac-lg-path')?.value.trim();
      const language = document.getElementById('gac-lg-lang')?.value || '';
      if (!code && !filePath) { GAC._statusMsg('gac-lg-status', 'Paste code or enter a file path', 'err'); return; }
      GAC._statusMsg('gac-lg-status', '🛡 Reviewing…');
      const results = document.getElementById('gac-lg-results');
      if (results) { results.style.display = 'none'; results.innerHTML = ''; }
      try {
        const r = await fetch(INTEL + '/lifeguard/check', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ code, file_path: filePath, language }),
          signal: AbortSignal.timeout(45000)
        });
        const d = await r.json();
        if (d.ok) GAC._renderLifeguardResults(d);
        else GAC._statusMsg('gac-lg-status', d.error || 'Review failed', 'err');
      } catch(e) {
        if (e.name === 'TimeoutError') {
          GAC._statusMsg('gac-lg-status', 'Review timed out — try smaller code', 'err');
        } else {
          GAC._statusMsg('gac-lg-status', 'Intel server offline', 'err');
        }
      }
    },

    reviewCurrentChat() {
      // Grab any code blocks from the last chat messages visible on page
      const msgs = document.querySelectorAll('.msg-bubble code, .msg-bubble pre');
      let code = '';
      msgs.forEach(el => { code += el.textContent + '\n'; });
      if (!code.trim()) {
        // fallback — grab all chat text
        const allBubbles = document.querySelectorAll('.msg.assistant .msg-bubble');
        if (allBubbles.length) code = allBubbles[allBubbles.length - 1].innerText;
      }
      if (!code.trim()) { GAC._statusMsg('gac-lg-status', 'No code found in current chat', 'err'); return; }
      const ta = document.getElementById('gac-lg-code');
      if (ta) ta.value = code.trim().substring(0, 4000);
      GAC.runLifeguard();
    },

    _renderLifeguardResults(d) {
      const results = document.getElementById('gac-lg-results');
      if (!results) return;
      results.style.display = 'block';
      const scoreColor = d.score >= 80 ? '#2ecc71' : d.score >= 50 ? '#f59e0b' : '#e74c3c';
      const safeIcon = d.safe ? '✅' : '⚠️';
      let html = `<div class="gac-lg-score">
        ${safeIcon} Score: <span style="color:${scoreColor}">${d.score}/100</span>
        <span style="font-size:10px;color:#888;font-weight:400;">${d.summary}</span>
      </div>`;
      if (d.findings && d.findings.length) {
        html += d.findings.map(f => `
          <div class="gac-lg-finding ${f.severity}">
            <strong style="color:${f.severity === 'error' ? '#e74c3c' : f.severity === 'warning' ? '#f59e0b' : '#3498db'};">
              ${f.severity.toUpperCase()}${f.line ? ` (line ${f.line})` : ''}
            </strong> — ${f.rule}<br>
            <span style="color:#ccc;">${f.message}</span><br>
            <span style="color:#888;font-size:10px;">💡 ${f.suggestion}</span>
          </div>`).join('');
      } else {
        html += '<div style="font-size:11px;color:var(--gac-green);padding:6px;">✅ No issues found!</div>';
      }
      results.innerHTML = html;
      GAC._statusMsg('gac-lg-status',
        `Review complete — ${(d.findings || []).length} finding(s)`,
        d.safe ? 'ok' : 'err');
    },

    // ── AGENT SELECTOR ────────────────────────────────────────
    openAgentSelector() {
      GAC.toggleSection('agentsel');
    },

    switchAgent(agentId, agentName) {
      // Highlight selected card
      document.querySelectorAll('.gac-agent-card').forEach(el => el.classList.remove('active'));
      event?.target?.closest('.gac-agent-card')?.classList.add('active');

      // Store selected agent
      state.activeAgent = agentId;
      LS.setItem('gac.activeAgent', agentId);
      GAC._statusMsg('gac-agent-status', `Switched to: ${agentName}`, 'ok');

      // If there's a page-level chat and this is a different page, offer to navigate
      const agentPageMap = {
        'moneypenny': 'moneypenny.html',
        'dr-devin': 'dr-devin.html',
        'codex': 'sir-codex-launcher.html',
        'gonbrazy': 'gonbrazy-launcher.html',
        'woohdakid': 'wooh-da-kid-launcher.html',
        'hannah': 'hannah-miller-launcher.html',
      };
      const page = agentPageMap[agentId];
      if (page && !window.location.pathname.includes(page)) {
        const go = confirm(`Navigate to ${agentName}'s page (${page})?`);
        if (go) window.location.href = page;
      }
    },

    // ── DEVIN BROWSER ─────────────────────────────────────────
    async browserFetch() {
      const input = document.getElementById('gac-br-url')?.value.trim();
      const extract = document.getElementById('gac-br-extract')?.value || 'text';
      if (!input) { GAC._statusMsg('gac-br-status', 'Enter a URL', 'err'); return; }
      if (!input.startsWith('http')) {
        // Treat as search
        return GAC.browserSearch();
      }
      GAC._statusMsg('gac-br-status', 'Fetching…');
      const resultEl = document.getElementById('gac-br-result');
      if (resultEl) { resultEl.style.display = 'none'; resultEl.textContent = ''; }
      try {
        const r = await fetch(INTEL + '/browser/fetch', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ url: input, extract }),
          signal: AbortSignal.timeout(20000)
        });
        const d = await r.json();
        if (d.ok) {
          const content = extract === 'links'
            ? (d.links || []).join('\n')
            : (d.text || d.title || 'No text extracted');
          if (resultEl) { resultEl.style.display = 'block'; resultEl.textContent = content; }
          GAC._statusMsg('gac-br-status', `✓ ${d.title || input} (${d.char_count || 0} chars)`, 'ok');
          state._browserResult = content;
        } else {
          GAC._statusMsg('gac-br-status', d.error || 'Fetch failed', 'err');
        }
      } catch(e) {
        if (e.name === 'TimeoutError') {
          GAC._statusMsg('gac-br-status', 'Fetch timed out', 'err');
        } else {
          GAC._statusMsg('gac-br-status', 'Intel offline or blocked', 'err');
        }
      }
    },

    async browserSearch() {
      const query = document.getElementById('gac-br-url')?.value.trim();
      if (!query) { GAC._statusMsg('gac-br-status', 'Enter a search query', 'err'); return; }
      GAC._statusMsg('gac-br-status', 'Searching…');
      const resultEl = document.getElementById('gac-br-result');
      if (resultEl) { resultEl.style.display = 'none'; }
      try {
        const r = await fetch(INTEL + '/browser/search', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ query, limit: 6 }),
          signal: AbortSignal.timeout(15000)
        });
        const d = await r.json();
        if (d.ok && d.results) {
          const content = d.results.map((r, i) => `${i+1}. ${r.title}\n   ${r.url}`).join('\n\n');
          if (resultEl) { resultEl.style.display = 'block'; resultEl.textContent = content; }
          GAC._statusMsg('gac-br-status', `✓ ${d.results.length} result(s)`, 'ok');
          state._browserResult = content;
        } else {
          GAC._statusMsg('gac-br-status', 'Search failed or no results', 'err');
        }
      } catch(e) {
        GAC._statusMsg('gac-br-status', 'Intel offline', 'err');
      }
    },

    browserSendToChat() {
      if (!state._browserResult) { GAC._statusMsg('gac-br-status', 'Fetch something first', 'err'); return; }
      const chatInput = document.getElementById('chatInput') || document.querySelector('textarea[placeholder*="Ask"]');
      if (chatInput) {
        chatInput.value = `[Web Context]\n${state._browserResult.substring(0, 2000)}`;
        chatInput.dispatchEvent(new Event('input', {bubbles:true}));
        chatInput.focus();
        GAC._statusMsg('gac-br-status', '✓ Sent to chat', 'ok');
      } else {
        window.open('moneypenny.html?msg=' + encodeURIComponent('[Web]\n' + state._browserResult.substring(0, 500)), '_blank');
      }
    },

    // ── REVERT TO STEP ────────────────────────────────────────
    async takeSnapshot() {
      const filePath = document.getElementById('gac-rv-path')?.value.trim();
      if (!filePath) { GAC._statusMsg('gac-rv-status', 'Enter a file path to snapshot', 'err'); return; }
      GAC._statusMsg('gac-rv-status', 'Taking snapshot…');
      try {
        const r = await fetch(INTEL + '/revert/snapshot', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ file_path: filePath, step_label: 'manual-snapshot', agent_id: 'ui' })
        });
        const d = await r.json();
        if (d.ok) {
          GAC._statusMsg('gac-rv-status', `✓ Snapshot ${d.snapshot_id} saved`, 'ok');
          GAC.loadSnapshots();
        } else {
          GAC._statusMsg('gac-rv-status', d.error || 'Snapshot failed', 'err');
        }
      } catch(e) {
        GAC._statusMsg('gac-rv-status', 'Intel offline', 'err');
      }
    },

    async loadSnapshots() {
      const filePath = document.getElementById('gac-rv-path')?.value.trim() || '';
      try {
        const url = INTEL + '/revert/list' + (filePath ? '?file_path=' + encodeURIComponent(filePath) : '');
        const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
        const d = await r.json();
        const list = document.getElementById('gac-rv-list');
        if (!list) return;
        if (!d.snapshots || !d.snapshots.length) {
          list.innerHTML = '<div style="font-size:11px;color:#555;padding:4px;">No snapshots yet.</div>';
          return;
        }
        list.innerHTML = d.snapshots.slice(0, 10).map(s => {
          const dt = new Date(s.timestamp * 1000).toLocaleTimeString();
          const fname = s.file_path ? s.file_path.split('/').pop() : 'unknown';
          return `<div class="gac-snap-item">
            <span class="snap-label">${s.step_label || 'snapshot'}</span>
            <span class="snap-file">${fname} · ${dt}</span>
            <button class="gac-btn" style="padding:2px 7px;font-size:9px;" onclick="GAC.previewRevert('${s.id}')">Preview</button>
            <button class="gac-btn danger" style="padding:2px 7px;font-size:9px;" onclick="GAC.executeRevert('${s.id}')">Revert</button>
          </div>`;
        }).join('');
        GAC._statusMsg('gac-rv-status', `${d.snapshots.length} snapshot(s)`, 'ok');
      } catch(e) {
        GAC._statusMsg('gac-rv-status', 'Intel offline', 'err');
      }
    },

    async previewRevert(snapId) {
      try {
        const r = await fetch(INTEL + '/revert/preview', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ snapshot_id: snapId })
        });
        const d = await r.json();
        if (d.ok) {
          const msg = d.diff
            ? `Revert preview (snapshot ${snapId}):\n\n${d.diff.substring(0, 800)}`
            : `Snapshot "${d.snapshot?.step_label}" — no diff (file unchanged or identical)`;
          alert(msg);
        }
      } catch(e) {
        GAC._statusMsg('gac-rv-status', 'Preview failed', 'err');
      }
    },

    async executeRevert(snapId) {
      if (!confirm(`Revert file to snapshot ${snapId}? This REPLACES the current file content.`)) return;
      GAC._statusMsg('gac-rv-status', 'Reverting…');
      try {
        const r = await fetch(INTEL + '/revert/execute', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ snapshot_id: snapId, confirm: true })
        });
        const d = await r.json();
        if (d.ok) {
          GAC._statusMsg('gac-rv-status', `✓ Reverted: ${d.reverted}`, 'ok');
        } else {
          GAC._statusMsg('gac-rv-status', d.error || 'Revert failed', 'err');
        }
      } catch(e) {
        GAC._statusMsg('gac-rv-status', 'Intel offline', 'err');
      }
    },

    // ── GIT TOOLS ─────────────────────────────────────────────
    async generateCommitMsg() {
      GAC._statusMsg('gac-git-status', '✨ Generating commit message…');
      const outEl = document.getElementById('gac-commit-out');
      if (outEl) outEl.style.display = 'none';
      try {
        const r = await fetch(INTEL + '/git/commit-message', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ repo_path: '/Users/be100radio/GOAT-Royalty-App' }),
          signal: AbortSignal.timeout(30000)
        });
        const d = await r.json();
        if (d.ok && d.message) {
          const ta = document.getElementById('gac-commit-msg');
          if (ta) ta.value = d.message;
          if (outEl) outEl.style.display = 'block';
          GAC._statusMsg('gac-git-status', '✓ Commit message ready', 'ok');
        } else {
          GAC._statusMsg('gac-git-status', d.error || 'No staged changes found', 'err');
        }
      } catch(e) {
        GAC._statusMsg('gac-git-status', 'Intel offline', 'err');
      }
    },

    async gitStatus() {
      const outEl = document.getElementById('gac-git-status-out');
      if (outEl) { outEl.style.display = 'none'; outEl.textContent = ''; }
      GAC._statusMsg('gac-git-status', 'Getting git status…');
      try {
        const r = await fetch(INTEL + '/git/status', { signal: AbortSignal.timeout(10000) });
        const d = await r.json();
        if (d.ok) {
          const text = `Branch: ${d.branch}\n\nStaged:\n${d.staged_files.join('\n') || '(none)'}\n\nStatus:\n${d.status || '(clean)'}`;
          if (outEl) { outEl.style.display = 'block'; outEl.textContent = text; }
          GAC._statusMsg('gac-git-status', `Branch: ${d.branch}`, 'ok');
        } else {
          GAC._statusMsg('gac-git-status', d.error || 'Git error', 'err');
        }
      } catch(e) {
        GAC._statusMsg('gac-git-status', 'Intel offline', 'err');
      }
    },

    copyCommitMsg() {
      const msg = document.getElementById('gac-commit-msg')?.value;
      if (!msg) return;
      navigator.clipboard.writeText(msg).then(() => {
        GAC._statusMsg('gac-commit-status', '✓ Copied to clipboard', 'ok');
      }).catch(() => {
        GAC._statusMsg('gac-commit-status', 'Copy failed — select manually', 'err');
      });
    },

    sendCommitToChat() {
      const msg = document.getElementById('gac-commit-msg')?.value;
      if (!msg) return;
      const chatInput = document.getElementById('chatInput') || document.querySelector('textarea[placeholder*="Ask"]');
      if (chatInput) {
        chatInput.value = `git commit -m "${msg}"`;
        chatInput.dispatchEvent(new Event('input', {bubbles:true}));
        chatInput.focus();
      }
      GAC._statusMsg('gac-commit-status', '→ Sent to chat', 'ok');
    },

    // ── FILE ATTACH / CONTEXT ─────────────────────────────────
    async attachFile() {
      const filePath = document.getElementById('gac-att-path')?.value.trim();
      if (!filePath) { GAC._statusMsg('gac-att-status', 'Enter a file path', 'err'); return; }
      GAC._statusMsg('gac-att-status', 'Reading file…');
      try {
        const r = await fetch(INTEL + '/context/file', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ file_path: filePath }),
          signal: AbortSignal.timeout(10000)
        });
        const d = await r.json();
        if (d.ok) {
          GAC._injectFileContext(d);
        } else {
          GAC._statusMsg('gac-att-status', d.error || 'File read failed', 'err');
        }
      } catch(e) {
        GAC._statusMsg('gac-att-status', 'Intel offline', 'err');
      }
    },

    uploadFile(input) {
      const file = input.files[0];
      if (!file) return;
      GAC._statusMsg('gac-att-status', `Reading ${file.name}…`);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const ext = file.name.split('.').pop().toLowerCase();
        const langMap = {py:'python',js:'javascript',ts:'typescript',html:'html',css:'css',json:'json',md:'markdown',sh:'bash'};
        const language = langMap[ext] || 'text';
        const lines = content.split('\n').length;
        GAC._injectFileContext({ filename: file.name, language, content, lines, truncated: false, formatted: `\`\`\`${language}\n${content}\n\`\`\`` });
      };
      reader.onerror = () => GAC._statusMsg('gac-att-status', 'File read failed', 'err');
      reader.readAsText(file.slice(0, 131072));
    },

    _injectFileContext(d) {
      const preview = document.getElementById('gac-att-preview');
      if (preview) {
        preview.style.display = 'block';
        preview.textContent = `${d.filename} (${d.lines} lines)${d.truncated ? ' [truncated]' : ''}\n\n${d.content.substring(0, 500)}…`;
      }
      // Save for later injection into chat
      state._attachedFile = d;
      GAC._statusMsg('gac-att-status', `✓ ${d.filename} attached (${d.lines} lines)${d.truncated ? ' — truncated' : ''}`, 'ok');
    },

    attachCurrentPage() {
      const html = document.documentElement.outerHTML;
      const filename = window.location.pathname.split('/').pop() || 'page.html';
      GAC._injectFileContext({
        filename,
        language: 'html',
        content: html.substring(0, 10000),
        lines: html.split('\n').length,
        truncated: html.length > 10000,
        formatted: `\`\`\`html\n${html.substring(0, 10000)}\n\`\`\``
      });
    },

    async attachDirectory() {
      const path = document.getElementById('gac-att-path')?.value.trim() || '/Users/be100radio/GOAT-Royalty-App';
      GAC._statusMsg('gac-att-status', 'Listing directory…');
      try {
        const r = await fetch(INTEL + '/context/directory', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ path, depth: 2 })
        });
        const d = await r.json();
        if (d.ok) {
          const preview = document.getElementById('gac-att-preview');
          if (preview) { preview.style.display = 'block'; preview.textContent = d.tree; }
          state._attachedFile = { filename: 'directory-tree', language: 'text', content: d.tree, lines: d.tree.split('\n').length };
          GAC._statusMsg('gac-att-status', `✓ Directory tree attached`, 'ok');
        } else {
          GAC._statusMsg('gac-att-status', d.error || 'List failed', 'err');
        }
      } catch(e) {
        GAC._statusMsg('gac-att-status', 'Intel offline', 'err');
      }
    },

    // Called by send button on any page to inject attached file into message
    getAttachedContext() {
      if (!state._attachedFile) return null;
      return `\n\n[Attached: ${state._attachedFile.filename}]\n${state._attachedFile.formatted || state._attachedFile.content}`;
    },

  };

  // ── Init ─────────────────────────────────────────────────────
  function init() {
    inject();
    window.GAC = GAC;
    // Initial status check
    GAC.checkStatus();
    // Poll status every 30s, HW every 5s
    setInterval(() => GAC.checkStatus(), 30000);
    setInterval(() => GAC.pollHW(), 5000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window);
