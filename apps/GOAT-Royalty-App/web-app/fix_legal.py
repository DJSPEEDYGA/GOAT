#!/usr/bin/env python3
"""Fix Legal Eagle launcher to match the exact user spec."""

import os

path = '/Users/be100radio/GOAT-Royalty-App/web-app/legal-eagle-launcher.html'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# === COLOR REPLACEMENTS ===
# Primary accent colors (gold -> blue)
text = text.replace('#f39c12', '#3498db')
text = text.replace('rgba(243, 156, 18, 0.25)', 'rgba(52, 152, 219, 0.25)')
text = text.replace('rgba(243,156,18,0.35)', 'rgba(52,152,219,0.35)')
text = text.replace('rgba(243,156,18,0.25)', 'rgba(52,152,219,0.25)')
text = text.replace('rgba(243,156,18,0.12)', 'rgba(52,152,219,0.12)')
text = text.replace('rgba(243,156,18,0.15)', 'rgba(52,152,219,0.15)')
text = text.replace('rgba(243,156,18,0.2)', 'rgba(52,152,219,0.2)')
text = text.replace('rgba(243,156,18,0.08)', 'rgba(52,152,219,0.08)')
text = text.replace('rgba(243,156,18,0.18)', 'rgba(52,152,219,0.18)')
text = text.replace('rgba(243,156,18,0.22)', 'rgba(52,152,219,0.22)')
text = text.replace('rgba(243,156,18,0.1)', 'rgba(52,152,219,0.1)')
text = text.replace('rgba(243,156,18,0.3)', 'rgba(52,152,219,0.3)')
text = text.replace('rgba(243,156,18,0.4)', 'rgba(52,152,219,0.4)')

# No need to replace GOAT brand golds (#d4a03c, #e5ba7d, #f0c040) — they stay as brand accents.

# CSS variable names
text = text.replace('--legal-glow', '--legal-blue-glow')
text = text.replace('--legal-gold', '--legal-blue')

# === AVATAR REPLACEMENT ===
# Hero emoji
text = text.replace('    <div class="agent-hero-emoji">⚖️</div>', '    <div class="agent-hero-emoji">🦅</div>')
# Sidebar logo icon
text = text.replace('      <div class="logo-icon">⚖️</div>', '      <div class="logo-icon">🦅</div>')
# Chat header avatar
text = text.replace('      <div class="persona-avatar">⚖️</div>', '      <div class="persona-avatar">🦅</div>')
# Quick Switch agent icon
text = text.replace('href="legal-eagle-launcher.html"><span class="agent-icon">⚖️</span>', 'href="legal-eagle-launcher.html"><span class="agent-icon">🦅</span>')

# === TEXT REPLACEMENTS ===
# Sidebar ops title and buttons
old_ops = '''    <div class="agent-section-title">⚖️ Legal Arsenal</div>
    <div class="persona-btns">
      <button class="persona-btn" onclick="quickSend('Review this contract and give a full risk assessment with recommended language changes')">
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
      </button>
    </div>'''
new_ops = '''    <div class="agent-section-title">Legal Suite</div>
    <div class="persona-btns">
      <button class="persona-btn" onclick="quickSend('Review this contract and give a full risk assessment with recommended language changes')">
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
    </div>'''
text = text.replace(old_ops, new_ops)

# Placeholder
text = text.replace('placeholder="Ask Legal Eagle — contracts, copyright, IP, licensing, $3.3B position..."', 'placeholder="Ask Legal Eagle — contracts, IP, lawsuits, terms..."')

# Typing text
text = text.replace('Legal Eagle is reviewing...', 'Legal Eagle is analyzing...')

# Welcome message
old_welcome = '''const WELCOME = `Legal Eagle — THE COUNSELOR online. Ready to protect the empire.

Music law, IP protection, contract strategy, and the $3.3B position are all in scope.

Contract analyzer ready. IP protection layer active. Lawsuit position protected.

What do you need reviewed or drafted?`;'''
new_welcome = '''const WELCOME = `Legal Eagle — THE COUNSELOR online. Analyzing legal frameworks.

Contracts, IP, lawsuits, and terms are all in scope.

Contract analyzer ready. IP protection layer active. Lawsuit position protected.

What do you need reviewed or drafted?`;'''
text = text.replace(old_welcome, new_welcome)

# Sidebar terminal
text = text.replace('Legal Eagle THE COUNSELOR Console v1.0 — guardian online', 'Legal Eagle THE COUNSELOR Console v1.0 — legal analysis online')

# Write back
with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print(f'Fixed {path}')
