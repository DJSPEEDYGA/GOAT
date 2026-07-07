#!/usr/bin/env python3
"""Generate Legal Eagle and A&R Scout launcher pages from sir-codex-launcher.html."""

import os

SRC = '/Users/be100radio/GOAT-Royalty-App/web-app/sir-codex-launcher.html'
DIR = '/Users/be100radio/GOAT-Royalty-App/web-app'

with open(SRC, 'r', encoding='utf-8') as f:
    src = f.read()

# === LEGAL EAGLE ===
legal = src

# Accent / CSS
legal = legal.replace('--codex-blue: #00d4aa;', '--legal-gold: #f39c12;')
legal = legal.replace('--codex-blue-glow: rgba(0, 212, 170, 0.25);', '--legal-gold-glow: rgba(243, 156, 18, 0.25);')
legal = legal.replace('--devin-blue: #3994BC;', '--devin-blue: #f39c12;')
legal = legal.replace('--codex-blue', '--legal-gold')
legal = legal.replace('--codex-blue-glow', '--legal-gold-glow')

# Hardcoded accent colors
legal = legal.replace('#00d4aa', '#f39c12')
legal = legal.replace('#3994BC', '#f39c12')
legal = legal.replace('rgba(0,212,170,0.35)', 'rgba(243,156,18,0.35)')
legal = legal.replace('rgba(0, 212, 170, 0.25)', 'rgba(243, 156, 18, 0.25)')
legal = legal.replace('rgba(0,212,170,0.25)', 'rgba(243,156,18,0.25)')
legal = legal.replace('rgba(0,212,170,0.12)', 'rgba(243,156,18,0.12)')
legal = legal.replace('rgba(0,212,170,0.15)', 'rgba(243,156,18,0.15)')
legal = legal.replace('rgba(0,212,170,0.2)', 'rgba(243,156,18,0.2)')
legal = legal.replace('rgba(0,212,170,0.08)', 'rgba(243,156,18,0.08)')
legal = legal.replace('rgba(0,212,170,0.18)', 'rgba(243,156,18,0.18)')
legal = legal.replace('rgba(0,212,170,0.22)', 'rgba(243,156,18,0.22)')
legal = legal.replace('rgba(0,212,170,0.1)', 'rgba(243,156,18,0.1)')
legal = legal.replace('rgba(0,212,170,0.3)', 'rgba(243,156,18,0.3)')
legal = legal.replace('rgba(0,212,170,0.4)', 'rgba(243,156,18,0.4)')
legal = legal.replace('rgba(57,148,188,0.12)', 'rgba(243,156,18,0.12)')
legal = legal.replace('rgba(57,148,188,0.2)', 'rgba(243,156,18,0.2)')
legal = legal.replace('rgba(57,148,188,0.15)', 'rgba(243,156,18,0.15)')
legal = legal.replace('rgba(57,148,188,0.3)', 'rgba(243,156,18,0.3)')
legal = legal.replace('rgba(57,148,188,0.25)', 'rgba(243,156,18,0.25)')
legal = legal.replace('rgba(57,148,188,0.4)', 'rgba(243,156,18,0.4)')
legal = legal.replace('rgba(57,148,188,0.1)', 'rgba(243,156,18,0.1)')
legal = legal.replace('rgba(57,148,188,0.08)', 'rgba(243,156,18,0.08)')
legal = legal.replace('rgba(57,148,188,0.18)', 'rgba(243,156,18,0.18)')
legal = legal.replace('rgba(57,148,188,0.22)', 'rgba(243,156,18,0.22)')
legal = legal.replace('#00b896', '#d68910')

# Title / hero
legal = legal.replace('Sir Codex — SENTINEL | GOAT Force Technical Division', 'Legal Eagle — THE COUNSELOR | GOAT Force Legal Division')
legal = legal.replace('🤖', '⚖️', 1)
legal = legal.replace('Sir Codex', 'Legal Eagle', 1)
legal = legal.replace('Chief Technology Officer — GOAT Force Tech Division', 'Music Law · IP Protection · Contract Strategy — GOAT Force Legal Division')
legal = legal.replace('AGENT-006', 'AGENT-011')
legal = legal.replace('CODENAME: SENTINEL', 'CODENAME: THE COUNSELOR')

# Logo
legal = legal.replace('<span class="logo-title">SIR CODEX</span>', '<span class="logo-title">LEGAL EAGLE</span>')
legal = legal.replace('SENTINEL · AGENT 006 · TECH ARCHITECT', 'THE COUNSELOR · AGENT 011 · MUSIC LAW')

# Quick Switch - mark legal active
legal = legal.replace(
    '<a class="persona-btn active" href="sir-codex-launcher.html"><span class="agent-icon">🤖</span><div class="agent-info"><div class="agent-name">Sir Codex</div><div class="agent-role">Tech & Infrastructure</div></div><span class="agent-num">006</span></a>',
    '<a class="persona-btn" href="sir-codex-launcher.html"><span class="agent-icon">🤖</span><div class="agent-info"><div class="agent-name">Sir Codex</div><div class="agent-role">Tech & Infrastructure</div></div><span class="agent-num">006</span></a>'
)
legal = legal.replace(
    '<a class="persona-btn" href="legal-eagle-launcher.html"><span class="agent-icon">⚖️</span><div class="agent-info"><div class="agent-name">Legal Eagle</div><div class="agent-role">Music Law & IP</div></div><span class="agent-num">011</span></a>',
    '<a class="persona-btn active" href="legal-eagle-launcher.html"><span class="agent-icon">⚖️</span><div class="agent-info"><div class="agent-name">Legal Eagle</div><div class="agent-role">Music Law & IP</div></div><span class="agent-num">011</span></a>'
)

# Sidebar ops
legal = legal.replace(
    '<div class="agent-section-title">Technical Ops</div>',
    '<div class="agent-section-title">⚖️ Legal Arsenal</div>'
)

legal = legal.replace(
    '<button class="persona-btn" onclick="quickSend(\'Run a full security audit on the GOAT Royalty App codebase\')">\n        <span class="agent-icon">🔐</span>\n        <div class="agent-info"><div class="agent-name">Security Audit</div><div class="agent-role">Full codebase scan</div></div>\n      </button>\n      <button class="persona-btn" onclick="quickSend(\'Give me an architecture overview of the GOAT Force platform\')">\n        <span class="agent-icon">🏗</span>\n        <div class="agent-info"><div class="agent-name">Architecture</div><div class="agent-role">Platform overview</div></div>\n      </button>\n      <button class="persona-btn" onclick="quickSend(\'Design the REST API structure for the GOAT Force intelligence layer\')">\n        <span class="agent-icon">🔧</span>\n        <div class="agent-info"><div class="agent-name">API Design</div><div class="agent-role">REST structure</div></div>\n      </button>\n      <button class="persona-btn" onclick="quickSend(\'Review the current goat-agent-controls.js for security and quality\')">\n        <span class="agent-icon">🛡</span>\n        <div class="agent-info"><div class="agent-name">Code Review</div><div class="agent-role">Security & quality</div></div>\n      </button>\n      <button class="persona-btn" onclick="quickSend(\'Run a full system health check on all GOAT Force services\')">\n        <span class="agent-icon">📊</span>\n        <div class="agent-info"><div class="agent-name">System Health</div><div class="agent-role">Service diagnostics</div></div>\n      </button>\n      <button class="persona-btn" onclick="quickSend(\'Walk me through the AI model fallback chain: Ollama → Grok → Gemini → OpenAI\')">\n        <span class="agent-icon">🤖</span>\n        <div class="agent-info"><div class="agent-name">AI Pipeline</div><div class="agent-role">Model fallback chain</div></div>\n      </button>',
    '''<button class="persona-btn" onclick="quickSend('Review this contract and give a full risk assessment with recommended language changes')">
        <span class="agent-icon">📄</span>
        <div class="agent-info"><div class="agent-name">Contract Review</div><div class="agent-role">Risk assessment & edits</div></div>
      </button>
      <button class="persona-btn" onclick="quickSend('Walk me through registering new works with ASCAP and BMI')">
        <span class="agent-icon">©️</span>
        <div class="agent-info"><div class="agent-name">PRO Registration</div><div class="agent-role">ASCAP / BMI workflow</div></div>
      </button>
      <button class="persona-btn" onclick="quickSend('Explain the 35-year copyright reversion rule and how it applies to our catalog')">
        <span class="agent-icon">🔄</span>
        <div class="agent-info"><div class="agent-name">35-Year Reversion</div><div class="agent-role">Catalog termination rights</div></div>
      </button>
      <button class="persona-btn" onclick="quickSend('How do I clear a sample from a major label catalog for commercial release?')">
        <span class="agent-icon">🎵</span>
        <div class="agent-info"><div class="agent-name">Sample Clearance</div><div class="agent-role">Major label clearance path</div></div>
      </button>
      <button class="persona-btn" onclick="quickSend('Audit a 360 deal structure and identify where the artist loses money')">
        <span class="agent-icon">🔍</span>
        <div class="agent-info"><div class="agent-name">360 Deal Audit</div><div class="agent-role">Deal structure analysis</div></div>
      </button>
      <button class="persona-btn" onclick="quickSend('Explain work-for-hire vs co-writer agreements for studio sessions')">
        <span class="agent-icon">✍️</span>
        <div class="agent-info"><div class="agent-name">Work For Hire</div><div class="agent-role">Writer classification</div></div>
      </button>'''
)

# Creative Suite
legal = legal.replace(
    '<button class="ops-btn" onclick="quickSend(\'Open Song Forge — build and engineer a new track\')">\n        <span class="ops-icon">🎵</span> Song Forge\n      </button>\n      <button class="ops-btn" onclick="quickSend(\'Open Visual Lab — generate visual assets and UI mockups\')">\n        <span class="ops-icon">🎨</span> Visual Lab\n      </button>\n      <button class="ops-btn" onclick="quickSend(\'Open Animation Studio — create motion graphics and video content\')">\n        <span class="ops-icon">🎬</span> Animation Studio\n      </button>\n      <button class="ops-btn" onclick="quickSend(\'Open Crew Spaces — collaborate with the full GOAT Force tech team\')">\n        <span class="ops-icon">👥</span> Crew Spaces\n      </button>',
    '''<button class="ops-btn" onclick="quickSend('Help structure the publishing splits for a new co-written track')">
        <span class="ops-icon">🎵</span> Song Forge
      </button>
      <button class="ops-btn" onclick="quickSend('Review the IP considerations for using AI-generated artwork on an album cover')">
        <span class="ops-icon">🎨</span> Visual Lab
      </button>
      <button class="ops-btn" onclick="quickSend('What sync licensing terms do I need for a music video?')">
        <span class="ops-icon">🎬</span> Animation Studio
      </button>
      <button class="ops-btn" onclick="quickSend('Draft NDAs and session agreements for the full GOAT Force team')">
        <span class="ops-icon">👥</span> Crew Spaces
      </button>'''
)

# Codex Tools section - replace with nothing (or keep? User didn't specify, but sidebar has Legal Arsenal, Creative Suite, Command Deck, Status, Terminal, Footer. The Codex Tools section is extra. I'll remove it to make room.)
legal = legal.replace(
    '<div class="special-ops">\n      <div class="special-ops-title">⚙️ Codex Tools</div>\n      <button class="ops-btn" onclick="quickSend(\'Run Lifeguard code review on the current page\')">\n        <span class="ops-icon">🛡</span> Lifeguard Review\n      </button>\n      <button class="ops-btn" onclick="quickSend(\'What is the current git status of GOAT-Royalty-App?\')">\n        <span class="ops-icon">🔀</span> Git Status\n      </button>\n      <button class="ops-btn" onclick="quickSend(\'Generate a git commit message for recent changes\')">\n        <span class="ops-icon">✨</span> Commit Message\n      </button>\n      <button class="ops-btn" onclick="quickSend(\'Attach the goat_intel.py server file for review\')">\n        <span class="ops-icon">📎</span> Attach File\n      </button>\n      <button class="ops-btn" onclick="quickSend(\'List all configured MCP servers\')">\n        <span class="ops-icon">🔌</span> MCP Servers\n      </button>\n      <button class="ops-btn" onclick="quickSend(\'Show me all active GOAT Force rules\')">\n        <span class="ops-icon">📋</span> Load Rules\n      </button>\n    </div>',
    ''
)

# Status panel
legal = legal.replace(
    '<div class="status-panel-title">System Packets</div>\n      <div class="status-row"><div class="status-left"><span class="status-dot"></span> goat-intel-server</div><span class="status-role">Online ✅</span></div>\n      <div class="status-row"><div class="status-left"><span class="status-dot"></span> ollama-model-pool</div><span class="status-role">Loaded ✅</span></div>\n      <div class="status-row"><div class="status-left"><span class="status-dot"></span> devin-desktop-bridge</div><span class="status-role">Active ✅</span></div>\n      <div class="status-row"><div class="status-left"><span class="status-dot priority"></span> sentinel-guardian-protocol</div><span class="status-role">Priority ⚡</span></div>',
    '''<div class="status-panel-title">Legal Systems</div>
      <div class="status-row"><div class="status-left"><span class="status-dot"></span> goat-intel-server</div><span class="status-role">Online ✅</span></div>
      <div class="status-row"><div class="status-left"><span class="status-dot"></span> contract-analyzer</div><span class="status-role">Ready ✅</span></div>
      <div class="status-row"><div class="status-left"><span class="status-dot"></span> ip-protection</div><span class="status-role">Active ✅</span></div>
      <div class="status-row"><div class="status-left"><span class="status-dot priority"></span> $3.3B position</div><span class="status-role">Protected ⚖️</span></div>'''
)

# Sidebar terminal
legal = legal.replace(
    '<span>codex console</span>',
    '<span>legal console</span>'
)
legal = legal.replace(
    '<p class="terminal-line sys">Sir Codex SENTINEL Console v3.0 — guardian online</p>\n<p class="terminal-line sys">System health: all green</p>\n<p class="terminal-line">goat-intel-server: listening on :5500</p>\n<p class="terminal-line">Devin Desktop bridge: connected</p>\n<p class="terminal-line cmd">$ codex --status all</p>',
    '''<p class="terminal-line sys">Legal Eagle THE COUNSELOR Console v1.0 — guardian online</p>
<p class="terminal-line sys">IP protection layer: active</p>
<p class="terminal-line">Contract analyzer: ready</p>
<p class="terminal-line">$3.3B lawsuit position: protected</p>
<p class="terminal-line cmd">$ legal --status</p>'''
)

# Chat header
legal = legal.replace(
    '<div class="persona-avatar">🛡</div>\n      <div class="agent-title">\n        <h2>Sir Codex — SENTINEL</h2>\n        <p>Technical Architect · Agent 006 · Code Guardian · GOAT Force</p>\n      </div>\n      <span class="codename-tag">CODENAME: SENTINEL</span>\n      <span class="command-badge">Tech Architect</span>\n      <span class="engine-tag">Agent 006</span>',
    '''<div class="persona-avatar">⚖️</div>
      <div class="agent-title">
        <h2>Legal Eagle — THE COUNSELOR</h2>
        <p>Music Law · IP Protection · Contract Strategy · Agent 011</p>
      </div>
      <span class="codename-tag">CODENAME: THE COUNSELOR</span>
      <span class="command-badge">Legal Counsel</span>
      <span class="engine-tag">Agent 011</span>'''
)

# Approval bar
legal = legal.replace(
    '<!-- Codex: Tool Approval Bar -->',
    '<!-- Legal Eagle: Tool Approval Bar -->'
)

# Typing
legal = legal.replace(
    '<span style="font-size:12px;color:#666;margin-left:6px;" id="typingText">Sir Codex is analyzing...</span>',
    '<span style="font-size:12px;color:#666;margin-left:6px;" id="typingText">Legal Eagle is reviewing...</span>'
)

# Placeholder
legal = legal.replace(
    'placeholder="Ask Sir Codex — architecture, security, code review, system health..."',
    'placeholder="Ask Legal Eagle — contracts, copyright, IP, licensing, $3.3B position..."'
)

# Chat quick actions
legal = legal.replace(
    '<button class="chat-action-btn" onclick="quickSend(\'Run a complete security and code quality audit on the GOAT Royalty App\')">🛡 Code Audit</button>\n        <button class="chat-action-btn" onclick="quickSend(\'What is the current git branch and status?\')">🔀 Git Status</button>\n        <button class="chat-action-btn" onclick="quickSend(\'Run a full health check on all GOAT Force services and APIs\')">📊 Health Check</button>\n        <button class="chat-action-btn" onclick="quickSend(\'Show me the full AI model fallback chain and which models are currently online\')">🤖 AI Pipeline</button>',
    '''<button class="chat-action-btn" onclick="quickSend('Review a music contract and flag every red flag and risky clause')">🔍 Contract Review</button>
        <button class="chat-action-btn" onclick="quickSend('Run a full copyright analysis on our catalog position')">©️ Copyright</button>
        <button class="chat-action-btn" onclick="quickSend('Give me a full briefing on the $3.3B infringement position')">⚖️ $3.3B Brief</button>
        <button class="chat-action-btn" onclick="quickSend('Draft sync licensing terms for a major film placement')">📝 Draft Terms</button>'''
)

# JS constants
legal = legal.replace(
    "const ENDPOINT = '/ai/codex';",
    "const ENDPOINT = '/brain/agent/legal';"
)

# JS prompts
legal = legal.replace(
    "const PROMPTS = [\n  'Run a full security audit on the GOAT Royalty App codebase',\n  'Give me an architecture overview of the GOAT Force platform',\n  'Design the REST API structure for the GOAT Force intelligence layer',\n  'Review the current goat-agent-controls.js for security and quality',\n  'Run a full system health check on all GOAT Force services',\n  'Walk me through the AI model fallback chain: Ollama → Grok → Gemini → OpenAI',\n  'What is the current git status of GOAT-Royalty-App?',\n  'List all configured MCP servers'\n];",
    "const PROMPTS = [\n  'Review this contract and give a full risk assessment with recommended language changes',\n  'Walk me through registering new works with ASCAP and BMI',\n  'Explain the 35-year copyright reversion rule and how it applies to our catalog',\n  'How do I clear a sample from a major label catalog for commercial release?',\n  'Audit a 360 deal structure and identify where the artist loses money',\n  'Explain work-for-hire vs co-writer agreements for studio sessions'\n];"
)

# Welcome
legal = legal.replace(
    "const WELCOME = `Sir Codex — SENTINEL online. Agent 006 reporting.\n\nTechnical architecture, security review, code quality, system health — all in scope.\n\nSession packets loaded: devin-desktop-bridge, ollama-model-pool, sentinel-guardian-protocol.\n\nIntel server listening on localhost:5500. All 29 Devin Desktop endpoints active.\n\nWhat do you need built or secured?`;",
    "const WELCOME = `Legal Eagle — THE COUNSELOR online. Ready to protect the empire.\n\nMusic law, IP protection, contract strategy, and the $3.3B position are all in scope.\n\nContract analyzer ready. IP protection layer active. Lawsuit position protected.\n\nWhat do you need reviewed or drafted?`;"
)

# JS addMessage name
legal = legal.replace(
    "const name = role === 'user' ? 'You' : 'Sir Codex' + (meta ? ` · ${meta}` : '');",
    "const name = role === 'user' ? 'You' : 'Legal Eagle' + (meta ? ` · ${meta}` : '');"
)

# JS meta in welcome
legal = legal.replace(
    "<div class=\"msg-meta\">Sir Codex · SENTINEL · Agent 006 · Just now</div>",
    "<div class=\"msg-meta\">Legal Eagle · THE COUNSELOR · Agent 011 · Just now</div>"
)

# JS localStorage prefixes
legal = legal.replace("localStorage.getItem('goat_codex_thread')", "localStorage.getItem('goat_legal_thread')")
legal = legal.replace("localStorage.setItem('goat_codex_thread', clean)", "localStorage.setItem('goat_legal_thread', clean)")
legal = legal.replace("localStorage.getItem('goat_codex_accent')", "localStorage.getItem('goat_legal_accent')")
legal = legal.replace("localStorage.setItem('goat_codex_accent', color)", "localStorage.setItem('goat_legal_accent', color)")
legal = legal.replace("localStorage.getItem('goat_codex_logo')", "localStorage.getItem('goat_legal_logo')")
legal = legal.replace("localStorage.setItem('goat_codex_logo', url)", "localStorage.setItem('goat_legal_logo', url)")

# JS setAccent CSS variable
legal = legal.replace(
    "document.documentElement.style.setProperty('--codex-blue', color);",
    "document.documentElement.style.setProperty('--legal-gold', color);"
)

# checkServerStatus -> checkKeys
legal = legal.replace("function checkServerStatus()", "function checkKeys()")
legal = legal.replace("checkServerStatus();", "checkKeys();")
legal = legal.replace("checkServerStatus();", "checkKeys();")  # second occurrence in saveKeys

# Key modal links
legal = legal.replace(
    'style="color:#f39c12;">aistudio.google.com',
    'style="color:#f39c12;">aistudio.google.com'
)

# Terminal panel
legal = legal.replace(
    '<span style="margin-left:6px;font-size:11px;color:#666;">GOAT Force — Sir Codex Terminal</span>',
    '<span style="margin-left:6px;font-size:11px;color:#666;">GOAT Force — Legal Eagle Terminal</span>'
)
legal = legal.replace(
    '<p class="terminal-line sys">Sir Codex Terminal — SENTINEL · AGENT-006 Online</p>\n          <p class="terminal-line sys">Commands classified by safety: readonly · dangerous (confirm) · forbidden (blocked)</p>\n          <p class="terminal-line sys">Terminal host: localhost:9999 — Run goat-intel-server terminal proxy to execute live commands.</p>\n          <p class="terminal-line sys">─────────────────────────────────────────────────────</p>',
    '''<p class="terminal-line sys">Legal Eagle Terminal — THE COUNSELOR · AGENT-011 Online</p>
          <p class="terminal-line sys">Commands classified by safety: readonly · dangerous (confirm) · forbidden (blocked)</p>
          <p class="terminal-line sys">Terminal host: localhost:9999 — Run goat-intel-server terminal proxy to execute live commands.</p>
          <p class="terminal-line sys">─────────────────────────────────────────────────────</p>'''
)
legal = legal.replace(
    '<span class="terminal-prompt-panel">codex@sentinel $</span>',
    '<span class="terminal-prompt-panel">legal@goatforce $</span>'
)
legal = legal.replace(
    '<option value="codex">006 — Sir Codex (default)</option>',
    '<option value="legal">011 — Legal Eagle (default)</option>'
)

# GenUI panel
legal = legal.replace(
    '<h2>✨ Generative UI</h2>\n    <div class="deck-section">\n      <h4>SENTINEL System Status Card</h4>',
    '<h2>✨ Generative UI</h2>\n    <div class="deck-section">\n      <h4>THE COUNSELOR Legal Status Card</h4>'
)
legal = legal.replace(
    "{ type: 'ui', layout: 'card', title: 'SENTINEL System Status', subtitle: 'Live from Sir Codex',",
    "{ type: 'ui', layout: 'card', title: 'THE COUNSELOR Legal Status', subtitle: 'Live from Legal Eagle',"
)
legal = legal.replace(
    "{ type: 'stat', label: 'Services', value: '4' },\n        { type: 'stat', label: 'Endpoints', value: '29' },\n        { type: 'knob', id: 'priority', label: 'Priority', value: 85 },\n        { type: 'button', id: 'audit', label: 'Run Audit' },\n        { type: 'toggle', id: 'guardian', label: 'Guardian Mode', value: true },\n        { type: 'badge', label: 'Status', value: 'SECURED', color: '#f39c12' }",
    "{ type: 'stat', label: 'Contracts', value: 'Ready' },\n        { type: 'stat', label: 'IP Layer', value: 'Active' },\n        { type: 'knob', id: 'priority', label: 'Priority', value: 95 },\n        { type: 'button', id: 'audit', label: 'Review Contract' },\n        { type: 'toggle', id: 'guardian', label: 'IP Protection', value: true },\n        { type: 'badge', label: 'Status', value: 'PROTECTED', color: '#f39c12' }"
)

# Settings panel default active
legal = legal.replace(
    '<span class="color-swatch active" style="background:#f39c12" data-color="#f39c12" onclick="setAccent(this.dataset.color)"></span>',
    '<span class="color-swatch active" style="background:#f39c12" data-color="#f39c12" onclick="setAccent(this.dataset.color)"></span>'
)

# Touch Studio title
legal = legal.replace(
    '<h2>🎚️ Touch Studio</h2>',
    '<h2>🎚️ Touch Studio</h2>'
)

# Write legal file
legal_path = os.path.join(DIR, 'legal-eagle-launcher.html')
with open(legal_path, 'w', encoding='utf-8') as f:
    f.write(legal)

print(f'Wrote {legal_path} ({len(legal)} chars)')

# === A&R SCOUT ===
ar = src

# Accent / CSS
ar = ar.replace('--codex-blue: #00d4aa;', '--ar-red: #e74c3c;')
ar = ar.replace('--codex-blue-glow: rgba(0, 212, 170, 0.25);', '--ar-red-glow: rgba(231, 76, 60, 0.25);')
ar = ar.replace('--devin-blue: #3994BC;', '--devin-blue: #e74c3c;')
ar = ar.replace('--codex-blue', '--ar-red')
ar = ar.replace('--codex-blue-glow', '--ar-red-glow')

# Hardcoded accent colors
ar = ar.replace('#00d4aa', '#e74c3c')
ar = ar.replace('#3994BC', '#e74c3c')
ar = ar.replace('rgba(0,212,170,0.35)', 'rgba(231,76,60,0.35)')
ar = ar.replace('rgba(0, 212, 170, 0.25)', 'rgba(231, 76, 60, 0.25)')
ar = ar.replace('rgba(0,212,170,0.25)', 'rgba(231,76,60,0.25)')
ar = ar.replace('rgba(0,212,170,0.12)', 'rgba(231,76,60,0.12)')
ar = ar.replace('rgba(0,212,170,0.15)', 'rgba(231,76,60,0.15)')
ar = ar.replace('rgba(0,212,170,0.2)', 'rgba(231,76,60,0.2)')
ar = ar.replace('rgba(0,212,170,0.08)', 'rgba(231,76,60,0.08)')
ar = ar.replace('rgba(0,212,170,0.18)', 'rgba(231,76,60,0.18)')
ar = ar.replace('rgba(0,212,170,0.22)', 'rgba(231,76,60,0.22)')
ar = ar.replace('rgba(0,212,170,0.1)', 'rgba(231,76,60,0.1)')
ar = ar.replace('rgba(0,212,170,0.3)', 'rgba(231,76,60,0.3)')
ar = ar.replace('rgba(0,212,170,0.4)', 'rgba(231,76,60,0.4)')
ar = ar.replace('rgba(57,148,188,0.12)', 'rgba(231,76,60,0.12)')
ar = ar.replace('rgba(57,148,188,0.2)', 'rgba(231,76,60,0.2)')
ar = ar.replace('rgba(57,148,188,0.15)', 'rgba(231,76,60,0.15)')
ar = ar.replace('rgba(57,148,188,0.3)', 'rgba(231,76,60,0.3)')
ar = ar.replace('rgba(57,148,188,0.25)', 'rgba(231,76,60,0.25)')
ar = ar.replace('rgba(57,148,188,0.4)', 'rgba(231,76,60,0.4)')
ar = ar.replace('rgba(57,148,188,0.1)', 'rgba(231,76,60,0.1)')
ar = ar.replace('rgba(57,148,188,0.08)', 'rgba(231,76,60,0.08)')
ar = ar.replace('rgba(57,148,188,0.18)', 'rgba(231,76,60,0.18)')
ar = ar.replace('rgba(57,148,188,0.22)', 'rgba(231,76,60,0.22)')
ar = ar.replace('#00b896', '#c0392b')

# Title / hero
ar = ar.replace('Sir Codex — SENTINEL | GOAT Force Technical Division', 'A&R Scout — THE EYE | GOAT Force Talent Intelligence')
ar = ar.replace('🤖', '🎯', 1)
ar = ar.replace('Sir Codex', 'A&R Scout', 1)
ar = ar.replace('Chief Technology Officer — GOAT Force Tech Division', 'Talent Intelligence · Market Signals · Hit Detection — GOAT Force A&R Division')
ar = ar.replace('AGENT-006', 'AGENT-012')
ar = ar.replace('CODENAME: SENTINEL', 'CODENAME: THE EYE')

# Logo
ar = ar.replace('<span class="logo-title">SIR CODEX</span>', '<span class="logo-title">A&R SCOUT</span>')
ar = ar.replace('SENTINEL · AGENT 006 · TECH ARCHITECT', 'THE EYE · AGENT 012 · TALENT INTELLIGENCE')

# Quick Switch - mark AR active
ar = ar.replace(
    '<a class="persona-btn active" href="sir-codex-launcher.html"><span class="agent-icon">🤖</span><div class="agent-info"><div class="agent-name">Sir Codex</div><div class="agent-role">Tech & Infrastructure</div></div><span class="agent-num">006</span></a>',
    '<a class="persona-btn" href="sir-codex-launcher.html"><span class="agent-icon">🤖</span><div class="agent-info"><div class="agent-name">Sir Codex</div><div class="agent-role">Tech & Infrastructure</div></div><span class="agent-num">006</span></a>'
)
ar = ar.replace(
    '<a class="persona-btn" href="ar-scout-launcher.html"><span class="agent-icon">🎯</span><div class="agent-info"><div class="agent-name">A&R Scout</div><div class="agent-role">Talent Intelligence</div></div><span class="agent-num">012</span></a>',
    '<a class="persona-btn active" href="ar-scout-launcher.html"><span class="agent-icon">🎯</span><div class="agent-info"><div class="agent-name">A&R Scout</div><div class="agent-role">Talent Intelligence</div></div><span class="agent-num">012</span></a>'
)

# Sidebar ops
ar = ar.replace(
    '<div class="agent-section-title">Technical Ops</div>',
    '<div class="agent-section-title">🎯 Scout Ops</div>'
)

ar = ar.replace(
    '<button class="persona-btn" onclick="quickSend(\'Run a full security audit on the GOAT Royalty App codebase\')">\n        <span class="agent-icon">🔐</span>\n        <div class="agent-info"><div class="agent-name">Security Audit</div><div class="agent-role">Full codebase scan</div></div>\n      </button>\n      <button class="persona-btn" onclick="quickSend(\'Give me an architecture overview of the GOAT Force platform\')">\n        <span class="agent-icon">🏗</span>\n        <div class="agent-info"><div class="agent-name">Architecture</div><div class="agent-role">Platform overview</div></div>\n      </button>\n      <button class="persona-btn" onclick="quickSend(\'Design the REST API structure for the GOAT Force intelligence layer\')">\n        <span class="agent-icon">🔧</span>\n        <div class="agent-info"><div class="agent-name">API Design</div><div class="agent-role">REST structure</div></div>\n      </button>\n      <button class="persona-btn" onclick="quickSend(\'Review the current goat-agent-controls.js for security and quality\')">\n        <span class="agent-icon">🛡</span>\n        <div class="agent-info"><div class="agent-name">Code Review</div><div class="agent-role">Security & quality</div></div>\n      </button>\n      <button class="persona-btn" onclick="quickSend(\'Run a full system health check on all GOAT Force services\')">\n        <span class="agent-icon">📊</span>\n        <div class="agent-info"><div class="agent-name">System Health</div><div class="agent-role">Service diagnostics</div></div>\n      </button>\n      <button class="persona-btn" onclick="quickSend(\'Walk me through the AI model fallback chain: Ollama → Grok → Gemini → OpenAI\')">\n        <span class="agent-icon">🤖</span>\n        <div class="agent-info"><div class="agent-name">AI Pipeline</div><div class="agent-role">Model fallback chain</div></div>\n      </button>',
    '''<button class="persona-btn" onclick="quickSend('Scan current Spotify editorial playlist trends and identify openings for GOAT Force')">
        <span class="agent-icon">🎧</span>
        <div class="agent-info"><div class="agent-name">Spotify Scan</div><div class="agent-role">Editorial playlist signals</div></div>
      </button>
      <button class="persona-btn" onclick="quickSend('What sounds and formats are trending on TikTok that we should be targeting?')">
        <span class="agent-icon">📱</span>
        <div class="agent-info"><div class="agent-name">TikTok Signal</div><div class="agent-role">Viral sound formats</div></div>
      </button>
      <button class="persona-btn" onclick="quickSend('Analyze the current trajectory of Waka Flocka Flame\\'s catalog performance')">
        <span class="agent-icon">📈</span>
        <div class="agent-info"><div class="agent-name">Artist Trajectory</div><div class="agent-role">Waka catalog analysis</div></div>
      </button>
      <button class="persona-btn" onclick="quickSend('Identify the best genre crossover opportunities for the GOAT Force catalog right now')">
        <span class="agent-icon">🌉</span>
        <div class="agent-info"><div class="agent-name">Genre Crossover</div><div class="agent-role">Crossover opportunities</div></div>
      </button>
      <button class="persona-btn" onclick="quickSend('Find the best sync licensing opportunities for our catalog tracks')">
        <span class="agent-icon">🎬</span>
        <div class="agent-info"><div class="agent-name">Sync Ops</div><div class="agent-role">Licensing targets</div></div>
      </button>
      <button class="persona-btn" onclick="quickSend('Give me a hit scorecard framework for evaluating new track submissions')">
        <span class="agent-icon">🏆</span>
        <div class="agent-info"><div class="agent-name">Hit Scorecard</div><div class="agent-role">Submission framework</div></div>
      </button>'''
)

# Creative Suite
ar = ar.replace(
    '<button class="ops-btn" onclick="quickSend(\'Open Song Forge — build and engineer a new track\')">\n        <span class="ops-icon">🎵</span> Song Forge\n      </button>\n      <button class="ops-btn" onclick="quickSend(\'Open Visual Lab — generate visual assets and UI mockups\')">\n        <span class="ops-icon">🎨</span> Visual Lab\n      </button>\n      <button class="ops-btn" onclick="quickSend(\'Open Animation Studio — create motion graphics and video content\')">\n        <span class="ops-icon">🎬</span> Animation Studio\n      </button>\n      <button class="ops-btn" onclick="quickSend(\'Open Crew Spaces — collaborate with the full GOAT Force tech team\')">\n        <span class="ops-icon">👥</span> Crew Spaces\n      </button>',
    '''<button class="ops-btn" onclick="quickSend('Analyze this track concept for commercial hit potential — what needs to change?')">
        <span class="ops-icon">🎵</span> Song Forge
      </button>
      <button class="ops-btn" onclick="quickSend('What visual aesthetic is performing best for Latin trap and crossover artists right now?')">
        <span class="ops-icon">🎨</span> Visual Lab
      </button>
      <button class="ops-btn" onclick="quickSend('What video content formats are driving the most Spotify streams in 2025?')">
        <span class="ops-icon">🎬</span> Animation Studio
      </button>
      <button class="ops-btn" onclick="quickSend('Brief the full team on current A&R priorities and market opportunities')">
        <span class="ops-icon">👥</span> Crew Spaces
      </button>'''
)

# Codex Tools section
ar = ar.replace(
    '<div class="special-ops">\n      <div class="special-ops-title">⚙️ Codex Tools</div>\n      <button class="ops-btn" onclick="quickSend(\'Run Lifeguard code review on the current page\')">\n        <span class="ops-icon">🛡</span> Lifeguard Review\n      </button>\n      <button class="ops-btn" onclick="quickSend(\'What is the current git status of GOAT-Royalty-App?\')">\n        <span class="ops-icon">🔀</span> Git Status\n      </button>\n      <button class="ops-btn" onclick="quickSend(\'Generate a git commit message for recent changes\')">\n        <span class="ops-icon">✨</span> Commit Message\n      </button>\n      <button class="ops-btn" onclick="quickSend(\'Attach the goat_intel.py server file for review\')">\n        <span class="ops-icon">📎</span> Attach File\n      </button>\n      <button class="ops-btn" onclick="quickSend(\'List all configured MCP servers\')">\n        <span class="ops-icon">🔌</span> MCP Servers\n      </button>\n      <button class="ops-btn" onclick="quickSend(\'Show me all active GOAT Force rules\')">\n        <span class="ops-icon">📋</span> Load Rules\n      </button>\n    </div>',
    ''
)

# Status panel
ar = ar.replace(
    '<div class="status-panel-title">System Packets</div>\n      <div class="status-row"><div class="status-left"><span class="status-dot"></span> goat-intel-server</div><span class="status-role">Online ✅</span></div>\n      <div class="status-row"><div class="status-left"><span class="status-dot"></span> ollama-model-pool</div><span class="status-role">Loaded ✅</span></div>\n      <div class="status-row"><div class="status-left"><span class="status-dot"></span> devin-desktop-bridge</div><span class="status-role">Active ✅</span></div>\n      <div class="status-row"><div class="status-left"><span class="status-dot priority"></span> sentinel-guardian-protocol</div><span class="status-role">Priority ⚡</span></div>',
    '''<div class="status-panel-title">Market Intelligence</div>
      <div class="status-row"><div class="status-left"><span class="status-dot"></span> goat-intel-server</div><span class="status-role">Online ✅</span></div>
      <div class="status-row"><div class="status-left"><span class="status-dot"></span> spotify-signal</div><span class="status-role">Scanning ✅</span></div>
      <div class="status-row"><div class="status-left"><span class="status-dot"></span> tiktok-monitor</div><span class="status-role">Active ✅</span></div>
      <div class="status-row"><div class="status-left"><span class="status-dot priority"></span> amigo-alley</div><span class="status-role">In Progress 🎯</span></div>'''
)

# Sidebar terminal
ar = ar.replace(
    '<span>codex console</span>',
    '<span>ar console</span>'
)
ar = ar.replace(
    '<p class="terminal-line sys">Sir Codex SENTINEL Console v3.0 — guardian online</p>\n<p class="terminal-line sys">System health: all green</p>\n<p class="terminal-line">goat-intel-server: listening on :5500</p>\n<p class="terminal-line">Devin Desktop bridge: connected</p>\n<p class="terminal-line cmd">$ codex --status all</p>',
    '''<p class="terminal-line sys">A&R Scout THE EYE Console v1.0 — scanning</p>
<p class="terminal-line sys">Spotify trend monitor: active</p>
<p class="terminal-line">TikTok signal tracker: active</p>
<p class="terminal-line">Amigo Alley project: in progress</p>
<p class="terminal-line cmd">$ ar --scan trends</p>'''
)

# Chat header
ar = ar.replace(
    '<div class="persona-avatar">🛡</div>\n      <div class="agent-title">\n        <h2>Sir Codex — SENTINEL</h2>\n        <p>Technical Architect · Agent 006 · Code Guardian · GOAT Force</p>\n      </div>\n      <span class="codename-tag">CODENAME: SENTINEL</span>\n      <span class="command-badge">Tech Architect</span>\n      <span class="engine-tag">Agent 006</span>',
    '''<div class="persona-avatar">🎯</div>
      <div class="agent-title">
        <h2>A&R Scout — THE EYE</h2>
        <p>Talent Intelligence · Market Signals · Hit Detection · Agent 012</p>
      </div>
      <span class="codename-tag">CODENAME: THE EYE</span>
      <span class="command-badge">A&R Scout</span>
      <span class="engine-tag">Agent 012</span>'''
)

# Approval bar
ar = ar.replace(
    '<!-- Codex: Tool Approval Bar -->',
    '<!-- A&R Scout: Tool Approval Bar -->'
)

# Typing
ar = ar.replace(
    '<span style="font-size:12px;color:#666;margin-left:6px;" id="typingText">Sir Codex is analyzing...</span>',
    '<span style="font-size:12px;color:#666;margin-left:6px;" id="typingText">A&R Scout is scanning...</span>'
)

# Placeholder
ar = ar.replace(
    'placeholder="Ask Sir Codex — architecture, security, code review, system health..."',
    'placeholder="Ask A&R Scout — trends, hit potential, Amigo Alley, Waka crossover..."'
)

# Chat quick actions
ar = ar.replace(
    '<button class="chat-action-btn" onclick="quickSend(\'Run a complete security and code quality audit on the GOAT Royalty App\')">🛡 Code Audit</button>\n        <button class="chat-action-btn" onclick="quickSend(\'What is the current git branch and status?\')">🔀 Git Status</button>\n        <button class="chat-action-btn" onclick="quickSend(\'Run a full health check on all GOAT Force services and APIs\')">📊 Health Check</button>\n        <button class="chat-action-btn" onclick="quickSend(\'Show me the full AI model fallback chain and which models are currently online\')">🤖 AI Pipeline</button>',
    '''<button class="chat-action-btn" onclick="quickSend('Give me a full trend analysis for what\\'s hitting right now on TikTok and Spotify')">📈 Trend Scan</button>
        <button class="chat-action-btn" onclick="quickSend('Analyze the hit potential of Hard Liquor / Backroad Baptism')">🎵 Hit Check</button>
        <button class="chat-action-btn" onclick="quickSend('Give me a full A&R strategy for the Amigo Alley Latin crossover project')">🌎 Amigo A&R</button>
        <button class="chat-action-btn" onclick="quickSend('Analyze the country-trap crossover opportunity for Waka Flocka Flame')">🤠 Waka Country</button>'''
)

# JS constants
ar = ar.replace(
    "const ENDPOINT = '/ai/codex';",
    "const ENDPOINT = '/brain/agent/a&r';"
)

# JS prompts
ar = ar.replace(
    "const PROMPTS = [\n  'Run a full security audit on the GOAT Royalty App codebase',\n  'Give me an architecture overview of the GOAT Force platform',\n  'Design the REST API structure for the GOAT Force intelligence layer',\n  'Review the current goat-agent-controls.js for security and quality',\n  'Run a full system health check on all GOAT Force services',\n  'Walk me through the AI model fallback chain: Ollama → Grok → Gemini → OpenAI',\n  'What is the current git status of GOAT-Royalty-App?',\n  'List all configured MCP servers'\n];",
    "const PROMPTS = [\n  'Scan current Spotify editorial playlist trends and identify openings for GOAT Force',\n  'What sounds and formats are trending on TikTok that we should be targeting?',\n  'Analyze the current trajectory of Waka Flocka Flame\\'s catalog performance',\n  'Identify the best genre crossover opportunities for the GOAT Force catalog right now',\n  'Find the best sync licensing opportunities for our catalog tracks',\n  'Give me a hit scorecard framework for evaluating new track submissions'\n];"
)

# Welcome
ar = ar.replace(
    "const WELCOME = `Sir Codex — SENTINEL online. Agent 006 reporting.\n\nTechnical architecture, security review, code quality, system health — all in scope.\n\nSession packets loaded: devin-desktop-bridge, ollama-model-pool, sentinel-guardian-protocol.\n\nIntel server listening on localhost:5500. All 29 Devin Desktop endpoints active.\n\nWhat do you need built or secured?`;",
    "const WELCOME = `A&R Scout — THE EYE online. Scanning the market.\n\nTalent intelligence, market signals, hit detection, and the Amigo Alley crossover are all in scope.\n\nSpotify trend monitor active. TikTok signal tracker active. Amigo Alley project in progress.\n\nWhat do you want me to scan or evaluate?`;"
)

# JS addMessage name
ar = ar.replace(
    "const name = role === 'user' ? 'You' : 'Sir Codex' + (meta ? ` · ${meta}` : '');",
    "const name = role === 'user' ? 'You' : 'A&R Scout' + (meta ? ` · ${meta}` : '');"
)

# JS meta in welcome
ar = ar.replace(
    "<div class=\"msg-meta\">Sir Codex · SENTINEL · Agent 006 · Just now</div>",
    "<div class=\"msg-meta\">A&R Scout · THE EYE · Agent 012 · Just now</div>"
)

# JS localStorage prefixes
ar = ar.replace("localStorage.getItem('goat_codex_thread')", "localStorage.getItem('goat_ar_thread')")
ar = ar.replace("localStorage.setItem('goat_codex_thread', clean)", "localStorage.setItem('goat_ar_thread', clean)")
ar = ar.replace("localStorage.getItem('goat_codex_accent')", "localStorage.getItem('goat_ar_accent')")
ar = ar.replace("localStorage.setItem('goat_codex_accent', color)", "localStorage.setItem('goat_ar_accent', color)")
ar = ar.replace("localStorage.getItem('goat_codex_logo')", "localStorage.getItem('goat_ar_logo')")
ar = ar.replace("localStorage.setItem('goat_codex_logo', url)", "localStorage.setItem('goat_ar_logo', url)")

# JS setAccent CSS variable
ar = ar.replace(
    "document.documentElement.style.setProperty('--codex-blue', color);",
    "document.documentElement.style.setProperty('--ar-red', color);"
)

# checkServerStatus -> checkKeys
ar = ar.replace("function checkServerStatus()", "function checkKeys()")
ar = ar.replace("checkServerStatus();", "checkKeys();")

# Terminal panel
ar = ar.replace(
    '<span style="margin-left:6px;font-size:11px;color:#666;">GOAT Force — Sir Codex Terminal</span>',
    '<span style="margin-left:6px;font-size:11px;color:#666;">GOAT Force — A&R Scout Terminal</span>'
)
ar = ar.replace(
    '<p class="terminal-line sys">Sir Codex Terminal — SENTINEL · AGENT-006 Online</p>\n          <p class="terminal-line sys">Commands classified by safety: readonly · dangerous (confirm) · forbidden (blocked)</p>\n          <p class="terminal-line sys">Terminal host: localhost:9999 — Run goat-intel-server terminal proxy to execute live commands.</p>\n          <p class="terminal-line sys">─────────────────────────────────────────────────────</p>',
    '''<p class="terminal-line sys">A&R Scout Terminal — THE EYE · AGENT-012 Online</p>
          <p class="terminal-line sys">Commands classified by safety: readonly · dangerous (confirm) · forbidden (blocked)</p>
          <p class="terminal-line sys">Terminal host: localhost:9999 — Run goat-intel-server terminal proxy to execute live commands.</p>
          <p class="terminal-line sys">─────────────────────────────────────────────────────</p>'''
)
ar = ar.replace(
    '<span class="terminal-prompt-panel">codex@sentinel $</span>',
    '<span class="terminal-prompt-panel">ar@goatforce $</span>'
)
ar = ar.replace(
    '<option value="codex">006 — Sir Codex (default)</option>',
    '<option value="ar">012 — A&R Scout (default)</option>'
)

# GenUI panel
ar = ar.replace(
    '<h4>SENTINEL System Status Card</h4>',
    '<h4>THE EYE Market Status Card</h4>'
)
ar = ar.replace(
    "{ type: 'ui', layout: 'card', title: 'SENTINEL System Status', subtitle: 'Live from Sir Codex',",
    "{ type: 'ui', layout: 'card', title: 'THE EYE Market Status', subtitle: 'Live from A&R Scout',"
)
ar = ar.replace(
    "{ type: 'stat', label: 'Services', value: '4' },\n        { type: 'stat', label: 'Endpoints', value: '29' },\n        { type: 'knob', id: 'priority', label: 'Priority', value: 85 },\n        { type: 'button', id: 'audit', label: 'Run Audit' },\n        { type: 'toggle', id: 'guardian', label: 'Guardian Mode', value: true },\n        { type: 'badge', label: 'Status', value: 'SECURED', color: '#e74c3c' }",
    "{ type: 'stat', label: 'Spotify', value: 'Scanning' },\n        { type: 'stat', label: 'TikTok', value: 'Active' },\n        { type: 'knob', id: 'priority', label: 'Priority', value: 90 },\n        { type: 'button', id: 'scan', label: 'Run Scan' },\n        { type: 'toggle', id: 'tracker', label: 'Signal Tracker', value: true },\n        { type: 'badge', label: 'Status', value: 'SCANNING', color: '#e74c3c' }"
)

# Settings panel default active
ar = ar.replace(
    '<span class="color-swatch active" style="background:#e74c3c" data-color="#e74c3c" onclick="setAccent(this.dataset.color)"></span>',
    '<span class="color-swatch active" style="background:#e74c3c" data-color="#e74c3c" onclick="setAccent(this.dataset.color)"></span>'
)

# Write AR file
ar_path = os.path.join(DIR, 'ar-scout-launcher.html')
with open(ar_path, 'w', encoding='utf-8') as f:
    f.write(ar)

print(f'Wrote {ar_path} ({len(ar)} chars)')
