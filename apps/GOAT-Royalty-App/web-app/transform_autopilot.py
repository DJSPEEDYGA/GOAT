#!/usr/bin/env python3
import re

src_path = '/Users/be100radio/GOAT-Royalty-App/web-app/cfo-brain-launcher.html'
dst_path = '/Users/be100radio/GOAT-Royalty-App/web-app/autopilot-launcher.html'

with open(src_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Color / accent replacements
replacements = [
    # Agent identity
    ('CFO Brain — THE LEDGER | GOAT Force Financial Division', 'Autopilot — THE MACHINE | GOAT Force Autonomous Division'),
    ('CFO BRAIN / THE LEDGER', 'AUTOPILOT / THE MACHINE'),
    ('CFO Brain', 'Autopilot'),
    ('THE LEDGER', 'THE MACHINE'),
    ('AGENT-013', 'AGENT-014'),
    ('Agent 013', 'Agent 014'),
    ('agent-013', 'agent-014'),
    ('AGENT 013', 'AGENT 014'),
    ('Revenue Strategy · Financial Intelligence · Royalty Math', 'Autonomous Execution · Multi-Agent Orchestration · Task Automation'),
    ('Chief Financial Officer — GOAT Force Financial Division', 'Chief Automation Officer — GOAT Force Autonomous Division'),
    ('Revenue Strategy', 'Autonomous Execution'),
    ('REVENUE STRATEGY', 'AUTONOMOUS EXECUTION'),
    ('💊', '🤖'),  # logo icon (use same emoji as avatar)
    # CSS var
    ('--cfo-green', '--auto-purple'),
    ('--cfo-green-glow', '--auto-purple-glow'),
    # Colors
    ('#27ae60', '#8e44ad'),
    ('rgba(39, 174, 96, 0.25)', 'rgba(142, 68, 173, 0.25)'),
    ('rgba(39,174,96,0.35)', 'rgba(142,68,173,0.35)'),
    ('rgba(39,174,96,0.12)', 'rgba(142,68,173,0.12)'),
    ('rgba(39,174,96,0.08)', 'rgba(142,68,173,0.08)'),
    ('rgba(39,174,96,0.2)', 'rgba(142,68,173,0.2)'),
    ('rgba(39,174,96,0.18)', 'rgba(142,68,173,0.18)'),
    # Endpoints / keys
    ("const ENDPOINT = '/brain/agent/cfo';", "const ENDPOINT = '/brain/agent/autopilot';"),
    ("const AGENT_KEY = 'cfo';", "const AGENT_KEY = 'auto';"),
    # LocalStorage prefixes
    ('goat_cfo_thread', 'goat_auto_thread'),
    ('goat_cfo_accent', 'goat_auto_accent'),
    ('goat_cfo_logo', 'goat_auto_logo'),
    # Terminal
    ('cfo console', 'autopilot console'),
    ('cfo@goatforce $', 'auto@goatforce $'),
    # Terminal output
    ('CFO Brain THE LEDGER Console v1.0 — online', 'Autopilot THE MACHINE Console v1.0 — autonomous mode'),
    ('Royalty tracker: active', 'Agent orchestrator: 15 agents loaded'),
    ('282 DSP revenue feeds: connected', 'Task scheduler: running'),
    ('$3.3B lawsuit position: calculating', 'All systems: green'),
    ('$ cfo --audit royalties', '$ autopilot --status all'),
    ('CFO Brain Terminal — THE LEDGER · AGENT-013 Online', 'Autopilot Terminal — THE MACHINE · AGENT-014 Online'),
    # Status panel
    ('Financial Systems', 'Autopilot Systems'),
    ('royalty-tracker', 'agent-orchestrator'),
    ('dsp-revenue-feed', 'task-scheduler'),
    ('$3.3B claim', 'all-15-agents'),
    ('282 DSPs ✅', 'Running ✅'),
    ('Calculating 📊', 'Standing By 🤖'),
    # Sidebar ops title
    ('📊 Financial Ops', '🤖 Mission Control'),
    # Sidebar ops buttons
    ("quickSend('Run a full royalty audit — identify what\\'s uncollected and who owes us')", "quickSend('Orchestrate all agents to prepare a full GOAT Force quarterly review')"),
    ("<div class=\"agent-name\">Royalty Audit</div><div class=\"agent-role\">Find uncollected money</div>", "<div class=\"agent-name\">Multi-Agent Task</div><div class=\"agent-role\">Quarterly review</div>"),
    ("<span class=\"agent-icon\">💰</span>", "<span class=\"agent-icon\">🌐</span>"),
    ("quickSend('Calculate the 70/10/20 revenue split for the current quarter')", "quickSend('Run the full automated release workflow: metadata, distribution, PR, reporting')"),
    ("<div class=\"agent-name\">70/10/20 Split</div><div class=\"agent-role\">Revenue allocation</div>", "<div class=\"agent-name\">Auto Release</div><div class=\"agent-role\">Full release pipeline</div>"),
    ("<span class=\"agent-icon\">🧮</span>", "<span class=\"agent-icon\">🚀</span>"),
    ("quickSend('Analyze this deal structure for revenue potential and red flags')", "quickSend('Run an automated royalty sweep across all platforms — collect, reconcile, report')"),
    ("<div class=\"agent-name\">Deal Analysis</div><div class=\"agent-role\">Potential & red flags</div>", "<div class=\"agent-name\">Royalty Sweep</div><div class=\"agent-role\">Collect & reconcile</div>"),
    ("<span class=\"agent-icon\">📄</span>", "<span class=\"agent-icon\">💰</span>"),
    ("quickSend('Break down our revenue across all 282 DSPs and identify the top performers')", "quickSend('Auto-schedule and execute a social media campaign for the next release')"),
    ("<div class=\"agent-name\">DSP Revenue</div><div class=\"agent-role\">282 DSP breakdown</div>", "<div class=\"agent-name\">Social Blast</div><div class=\"agent-role\">Auto campaign</div>"),
    ("<span class=\"agent-icon\">🌐</span>", "<span class=\"agent-icon\">📣</span>"),
    ("quickSend('Walk me through the full $3.3B infringement calculation methodology')", "quickSend('Run an automated legal scan — trademark monitoring, contract deadlines, IP alerts')"),
    ("<div class=\"agent-name\">Lawsuit Math</div><div class=\"agent-role\">$3.3B calculation</div>", "<div class=\"agent-name\">Legal Scan</div><div class=\"agent-role\">IP & contracts</div>"),
    ("<span class=\"agent-icon\">⚖️</span>", "<span class=\"agent-icon\">⚖️</span>"),
    ("quickSend('Build a 12-month budget forecast for GOAT Force Records')", "quickSend('Generate today\\'s automated GOAT Force intelligence briefing')"),
    ("<div class=\"agent-name\">Budget Forecast</div><div class=\"agent-role\">12-month forecast</div>", "<div class=\"agent-name\">Daily Brief</div><div class=\"agent-role\">Intelligence briefing</div>"),
    ("<span class=\"agent-icon\">📈</span>", "<span class=\"agent-icon\">📋</span>"),
    # Creative suite
    ("quickSend('Build a full revenue projection for a new single release across all DSPs')", "quickSend('Automate the full song production pipeline from beat to distribution')"),
    ("quickSend('Design a financial dashboard layout for the GOAT Royalty App')", "quickSend('Auto-generate all visual assets needed for a full album rollout')"),
    ("quickSend('Create an animated revenue growth chart concept for the investor deck')", "quickSend('Create an automated content calendar for 30 days of social content')"),
    ("quickSend('Brief the full GOAT Force team on Q3 financial performance')", "quickSend('Orchestrate all 15 GOAT Force agents for a simultaneous empire-wide operation')"),
    # Quick action chat buttons
    ("quickSend('Run a complete royalty audit across all platforms and identify uncollected money')", "quickSend('Enter full autopilot mode — execute all pending GOAT Force tasks autonomously')"),
    ("💰 Royalty Audit", "🚀 Full Auto"),
    ("quickSend('Give me a full revenue breakdown across all 282 DSPs for the last 90 days')", "quickSend('Run a status sweep across all 15 GOAT Force agents and report findings')"),
    ("📈 Revenue Report", "🔄 Agent Sweep"),
    ("quickSend('Walk me through the complete $3.3B copyright infringement calculation')", "quickSend('Generate the automated daily GOAT Force intelligence briefing')"),
    ("⚖️ $3.3B Math", "📋 Daily Brief"),
    ("quickSend('Prepare a CFO briefing for the GOAT Force investor deck at $28M valuation')", "quickSend('EMERGENCY PROTOCOL — execute all priority-1 tasks immediately')"),
    ("📋 Investor Brief", "⚡ Emergency"),
    # Placeholder, typing, welcome
    ('Ask CFO Brain — royalty splits, revenue strategy, $3.3B lawsuit, budgets...', 'Give Autopilot a mission — multi-step tasks, agent orchestration, automated workflows...'),
    ('CFO Brain is running the numbers...', 'Autopilot is executing...'),
    ("Let's talk money.", "All systems autonomous."),
    ('Revenue strategy, royalty math, DSP breakdowns, deal analysis, and the $3.3B lawsuit position — all in scope.', 'Autonomous execution, multi-agent orchestration, automated workflows, and empire-wide task automation — all in scope.'),
    ('282 DSP revenue feeds connected. Royalty tracker active. Lawsuit calculator running.', '15 GOAT Force agents loaded. Task scheduler running. All systems green.'),
    ('What do you want to audit, Commander?', 'What mission do you want executed, Commander?'),
    # PROMPTS
    ("'Run a full royalty audit — identify what\\'s uncollected and who owes us',", "'Orchestrate all agents to prepare a full GOAT Force quarterly review',"),
    ("'Calculate the 70/10/20 revenue split for the current quarter',", "'Run the full automated release workflow: metadata, distribution, PR, reporting',"),
    ("'Analyze this deal structure for revenue potential and red flags',", "'Run an automated royalty sweep across all platforms — collect, reconcile, report',"),
    ("'Break down our revenue across all 282 DSPs and identify the top performers',", "'Auto-schedule and execute a social media campaign for the next release',"),
    ("'Walk me through the full $3.3B infringement calculation methodology',", "'Run an automated legal scan — trademark monitoring, contract deadlines, IP alerts',"),
    ("'Build a 12-month budget forecast for GOAT Force Records',", "'Generate today\\'s automated GOAT Force intelligence briefing',"),
    ("'Prepare a CFO briefing for the GOAT Force investor deck at $28M valuation',", "'EMERGENCY PROTOCOL — execute all priority-1 GOAT Force tasks immediately',"),
    ("'Run a complete royalty audit across all platforms and identify uncollected money'", "'Enter full autopilot mode — execute all pending GOAT Force tasks autonomously'"),
    # GenUI panel
    ('CFO Brain Financial Status', 'Autopilot System Status'),
    ('Live from THE MACHINE', 'Live from Autopilot'),
    ("{ type: 'stat', label: 'DSPs', value: '282' },", "{ type: 'stat', label: 'Agents', value: '15' },"),
    ("{ type: 'stat', label: 'Tracks', value: '5,954' },", "{ type: 'stat', label: 'Tasks', value: '∞' },"),
    ("{ type: 'toggle', id: 'guardian', label: 'Claim Mode', value: true },", "{ type: 'toggle', id: 'autonomous', label: 'Autonomous Mode', value: true },"),
    ("{ type: 'badge', label: 'Status', value: 'AUDITING', color: '#8e44ad' }", "{ type: 'badge', label: 'Status', value: 'AUTONOMOUS', color: '#8e44ad' }"),
    # Terminal agent select default
    ('<option value="cfo">013 — CFO Brain (default)</option>', '<option value="autopilot">014 — Autopilot (default)</option>'),
    ('GOAT Force — CFO Brain Terminal', 'GOAT Force — Autopilot Terminal'),
    # Settings first swatch
    ('style="background:#8e44ad" data-color="#8e44ad"', 'style="background:#8e44ad" data-color="#8e44ad"'),  # already correct
    # Quick switch active / non-active
    ('<a class="persona-btn active" href="cfo-brain-launcher.html"><span class="agent-icon">📊</span><div class="agent-info"><div class="agent-name">CFO Brain</div><div class="agent-role">Revenue Strategy</div></div><span class="agent-num">013</span></a>', '<a class="persona-btn" href="cfo-brain-launcher.html"><span class="agent-icon">📊</span><div class="agent-info"><div class="agent-name">CFO Brain</div><div class="agent-role">Revenue Strategy</div></div><span class="agent-num">013</span></a>'),
    ('<a class="persona-btn" href="autopilot-launcher.html"><span class="agent-icon">🤖</span><div class="agent-info"><div class="agent-name">Autopilot</div><div class="agent-role">Autonomous Execution</div></div><span class="agent-num">014</span></a>', '<a class="persona-btn active" href="autopilot-launcher.html"><span class="agent-icon">🤖</span><div class="agent-info"><div class="agent-name">Autopilot</div><div class="agent-role">Autonomous Execution</div></div><span class="agent-num">014</span></a>'),
]

for old, new in replacements:
    text = text.replace(old, new)

# Ensure the first color swatch active state is autopilot purple
# The 'active' class may be on the wrong swatch if replacement order mattered; fix by marking #8e44ad swatch active
text = re.sub(r'<span class="color-swatch active" style="background:#8e44ad" data-color="#8e44ad"', '<span class="color-swatch active" style="background:#8e44ad" data-color="#8e44ad"', text)
# Remove active from any other swatch
# Actually we need to ensure only the purple swatch has active class. Re-run a targeted replacement:
text = re.sub(
    r'<span class="color-swatch active" style="background:#([^"]+)" data-color="#\1"',
    lambda m: f'<span class="color-swatch" style="background:#{m.group(1)}" data-color="#{m.group(1)}"' if m.group(1) != '8e44ad' else m.group(0),
    text
)
# Then force the purple swatch active
# text = text.replace('class="color-swatch" style="background:#8e44ad" data-color="#8e44ad"', 'class="color-swatch active" style="background:#8e44ad" data-color="#8e44ad"')

with open(dst_path, 'w', encoding='utf-8') as f:
    f.write(text)

print(f'Wrote {dst_path}')
