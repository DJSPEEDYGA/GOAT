#!/usr/bin/env python3
"""Patch remaining Sir Codex references in generated agent launchers."""

import os

DIR = '/Users/be100radio/GOAT-Royalty-App/web-app'

# === LEGAL EAGLE PATCHES ===
legal_path = os.path.join(DIR, 'legal-eagle-launcher.html')
with open(legal_path, 'r', encoding='utf-8') as f:
    text = f.read()

# CSS comment
text = text.replace('/* === GOAT FORCE AGENT THEME — SIR CODEX / SENTINEL === */', '/* === GOAT FORCE AGENT THEME — LEGAL EAGLE / THE COUNSELOR === */')

# Sidebar logo icon
logo_old = '''<div class="ai-logo">
      <div class="logo-icon">🛡</div>
      <div class="logo-text">
        <span class="logo-title">LEGAL EAGLE</span>
        <span class="logo-sub">THE COUNSELOR · AGENT 011 · MUSIC LAW</span>
      </div>
    </div>'''
logo_new = '''<div class="ai-logo">
      <div class="logo-icon">⚖️</div>
      <div class="logo-text">
        <span class="logo-title">LEGAL EAGLE</span>
        <span class="logo-sub">THE COUNSELOR · AGENT 011 · MUSIC LAW</span>
      </div>
    </div>'''
text = text.replace(logo_old, logo_new)

# Chat header
header_old = '''<div class="chat-header">
      <div class="persona-avatar">🛡</div>
      <div class="agent-title">
        <h2>Sir Codex — SENTINEL</h2>
        <p>Technical Architect · Agent 006 · Code Guardian · GOAT Force</p>
      </div>
      <span class="codename-tag">CODENAME: THE COUNSELOR</span>
      <span class="command-badge">Tech Architect</span>
      <span class="engine-tag">Agent 006</span>'''
header_new = '''<div class="chat-header">
      <div class="persona-avatar">⚖️</div>
      <div class="agent-title">
        <h2>Legal Eagle — THE COUNSELOR</h2>
        <p>Music Law · IP Protection · Contract Strategy · Agent 011 · GOAT Force</p>
      </div>
      <span class="codename-tag">CODENAME: THE COUNSELOR</span>
      <span class="command-badge">Legal Counsel</span>
      <span class="engine-tag">Agent 011</span>'''
text = text.replace(header_old, header_new)

# GenUI panel title
# Fix both HTML h4 and JSON title/subtitle
h4_old = '''<h2>✨ Generative UI</h2>
    <div class="deck-section">
      <h4>SENTINEL Status Card</h4>'''
h4_new = '''<h2>✨ Generative UI</h2>
    <div class="deck-section">
      <h4>THE COUNSELOR Legal Status Card</h4>'''
text = text.replace(h4_old, h4_new)

json_old = "type: 'ui', layout: 'card', title: 'SENTINEL System Status', subtitle: 'Live from Sir Codex',"
json_new = "type: 'ui', layout: 'card', title: 'THE COUNSELOR Legal Status', subtitle: 'Live from Legal Eagle',"
text = text.replace(json_old, json_new)

# GenUI card stats
stats_old = "{ type: 'stat', label: 'Services', value: '4' },\n        { type: 'stat', label: 'Endpoints', value: '29' },\n        { type: 'knob', id: 'priority', label: 'Priority', value: 85 },\n        { type: 'button', id: 'audit', label: 'Run Audit' },\n        { type: 'toggle', id: 'guardian', label: 'Guardian Mode', value: true },\n        { type: 'badge', label: 'Status', value: 'SECURED', color: '#f39c12' }"
stats_new = "{ type: 'stat', label: 'Contracts', value: 'Ready' },\n        { type: 'stat', label: 'IP Layer', value: 'Active' },\n        { type: 'knob', id: 'priority', label: 'Priority', value: 95 },\n        { type: 'button', id: 'audit', label: 'Review Contract' },\n        { type: 'toggle', id: 'guardian', label: 'IP Protection', value: true },\n        { type: 'badge', label: 'Status', value: 'PROTECTED', color: '#f39c12' }"
text = text.replace(stats_old, stats_new)

# Terminal panel title
term_old = '<span style="margin-left:6px;font-size:11px;color:#666;">GOAT Force — Sir Codex Terminal</span>'
term_new = '<span style="margin-left:6px;font-size:11px;color:#666;">GOAT Force — Legal Eagle Terminal</span>'
text = text.replace(term_old, term_new)

term_old2 = '''<p class="terminal-line sys">Sir Codex Terminal — SENTINEL · AGENT-006 Online</p>'''
term_new2 = '''<p class="terminal-line sys">Legal Eagle Terminal — THE COUNSELOR · AGENT-011 Online</p>'''
text = text.replace(term_old2, term_new2)
term_old2b = '''<p class="terminal-line sys">Sir Codex Terminal — SENTINEL · AGENT-011 Online</p>'''
term_new2b = '''<p class="terminal-line sys">Legal Eagle Terminal — THE COUNSELOR · AGENT-011 Online</p>'''
text = text.replace(term_old2b, term_new2b)

term_old3 = '<option value="codex">006 — Sir Codex (default)</option>'
term_new3 = '<option value="legal">011 — Legal Eagle (default)</option>'
text = text.replace(term_old3, term_new3)

# Update JS comments and patch-widget data-agent
# Split single-line search to avoid any newline mismatch
for old, new in [
    ('// ── Codex: Token counter ──────────────────────────────────', '// ── Legal Eagle: Token counter ──────────────────────────────────'),
    ('// ── Codex: Thread naming ──────────────────────────────────', '// ── Legal Eagle: Thread naming ──────────────────────────────────'),
    ('// ── Codex: Tool Approval bar ──────────────────────────────', '// ── Legal Eagle: Tool Approval bar ──────────────────────────────'),
    ('// ── Codex: Plan preview strip ────────────────────────────', '// ── Legal Eagle: Plan preview strip ────────────────────────────'),
    ("data-agent=\"codex\"", "data-agent=\"moneypenny\""),
]:
    text = text.replace(old, new)

with open(legal_path, 'w', encoding='utf-8') as f:
    f.write(text)

print(f'Patched {legal_path}')

# === A&R SCOUT PATCHES ===
ar_path = os.path.join(DIR, 'ar-scout-launcher.html')
with open(ar_path, 'r', encoding='utf-8') as f:
    text = f.read()

# CSS comment
text = text.replace('/* === GOAT FORCE AGENT THEME — SIR CODEX / SENTINEL === */', '/* === GOAT FORCE AGENT THEME — A&R SCOUT / THE EYE === */')

# Sidebar logo icon
logo_old = '''<div class="ai-logo">
      <div class="logo-icon">🛡</div>
      <div class="logo-text">
        <span class="logo-title">A&R SCOUT</span>
        <span class="logo-sub">THE EYE · AGENT 012 · TALENT INTELLIGENCE</span>
      </div>
    </div>'''
logo_new = '''<div class="ai-logo">
      <div class="logo-icon">🎯</div>
      <div class="logo-text">
        <span class="logo-title">A&R SCOUT</span>
        <span class="logo-sub">THE EYE · AGENT 012 · TALENT INTELLIGENCE</span>
      </div>
    </div>'''
text = text.replace(logo_old, logo_new)

# Chat header
header_old = '''<div class="chat-header">
      <div class="persona-avatar">🛡</div>
      <div class="agent-title">
        <h2>Sir Codex — SENTINEL</h2>
        <p>Technical Architect · Agent 006 · Code Guardian · GOAT Force</p>
      </div>
      <span class="codename-tag">CODENAME: THE EYE</span>
      <span class="command-badge">Tech Architect</span>
      <span class="engine-tag">Agent 006</span>'''
header_new = '''<div class="chat-header">
      <div class="persona-avatar">🎯</div>
      <div class="agent-title">
        <h2>A&R Scout — THE EYE</h2>
        <p>Talent Intelligence · Market Signals · Hit Detection · Agent 012 · GOAT Force</p>
      </div>
      <span class="codename-tag">CODENAME: THE EYE</span>
      <span class="command-badge">A&R Scout</span>
      <span class="engine-tag">Agent 012</span>'''
text = text.replace(header_old, header_new)

# GenUI panel title
h4_old = '''<h2>✨ Generative UI</h2>
    <div class="deck-section">
      <h4>SENTINEL Status Card</h4>'''
h4_new = '''<h2>✨ Generative UI</h2>
    <div class="deck-section">
      <h4>THE EYE Market Status Card</h4>'''
text = text.replace(h4_old, h4_new)

json_old = "type: 'ui', layout: 'card', title: 'SENTINEL System Status', subtitle: 'Live from Sir Codex',"
json_new = "type: 'ui', layout: 'card', title: 'THE EYE Market Status', subtitle: 'Live from A&R Scout',"
text = text.replace(json_old, json_new)

# GenUI card stats
stats_old = "{ type: 'stat', label: 'Services', value: '4' },\n        { type: 'stat', label: 'Endpoints', value: '29' },\n        { type: 'knob', id: 'priority', label: 'Priority', value: 85 },\n        { type: 'button', id: 'audit', label: 'Run Audit' },\n        { type: 'toggle', id: 'guardian', label: 'Guardian Mode', value: true },\n        { type: 'badge', label: 'Status', value: 'SECURED', color: '#e74c3c' }"
stats_new = "{ type: 'stat', label: 'Spotify', value: 'Scanning' },\n        { type: 'stat', label: 'TikTok', value: 'Active' },\n        { type: 'knob', id: 'priority', label: 'Priority', value: 90 },\n        { type: 'button', id: 'scan', label: 'Run Scan' },\n        { type: 'toggle', id: 'tracker', label: 'Signal Tracker', value: true },\n        { type: 'badge', label: 'Status', value: 'SCANNING', color: '#e74c3c' }"
text = text.replace(stats_old, stats_new)

# Terminal panel title
term_old = '<span style="margin-left:6px;font-size:11px;color:#666;">GOAT Force — Sir Codex Terminal</span>'
term_new = '<span style="margin-left:6px;font-size:11px;color:#666;">GOAT Force — A&R Scout Terminal</span>'
text = text.replace(term_old, term_new)

term_old2 = '''<p class="terminal-line sys">Sir Codex Terminal — SENTINEL · AGENT-006 Online</p>'''
term_new2 = '''<p class="terminal-line sys">A&R Scout Terminal — THE EYE · AGENT-012 Online</p>'''
text = text.replace(term_old2, term_new2)
term_old2b = '''<p class="terminal-line sys">Sir Codex Terminal — SENTINEL · AGENT-012 Online</p>'''
term_new2b = '''<p class="terminal-line sys">A&R Scout Terminal — THE EYE · AGENT-012 Online</p>'''
text = text.replace(term_old2b, term_new2b)

term_old3 = '<option value="codex">006 — Sir Codex (default)</option>'
term_new3 = '<option value="ar">012 — A&R Scout (default)</option>'
text = text.replace(term_old3, term_new3)

# Update JS comments and patch-widget data-agent
for old, new in [
    ('// ── Codex: Token counter ──────────────────────────────────', '// ── A&R Scout: Token counter ──────────────────────────────────'),
    ('// ── Codex: Thread naming ──────────────────────────────────', '// ── A&R Scout: Thread naming ──────────────────────────────────'),
    ('// ── Codex: Tool Approval bar ──────────────────────────────', '// ── A&R Scout: Tool Approval bar ──────────────────────────────'),
    ('// ── Codex: Plan preview strip ────────────────────────────', '// ── A&R Scout: Plan preview strip ────────────────────────────'),
    ("data-agent=\"codex\"", "data-agent=\"moneypenny\""),
]:
    text = text.replace(old, new)

with open(ar_path, 'w', encoding='utf-8') as f:
    f.write(text)

print(f'Patched {ar_path}')
