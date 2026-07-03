// SuperNinja AI - Axiom AI UI Panel
// Visual no-code bot builder interface

function renderAxiomPanel(container) {
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%;gap:12px">
      
      <!-- Header Tabs -->
      <div style="display:flex;gap:4px;border-bottom:1px solid var(--border);padding-bottom:8px">
        <button class="axiom-tab active" onclick="axiomSwitchTab('bots', this)">🤖 My Bots</button>
        <button class="axiom-tab" onclick="axiomSwitchTab('templates', this)">📋 Templates</button>
        <button class="axiom-tab" onclick="axiomSwitchTab('builder', this)">🔧 Builder</button>
        <button class="axiom-tab" onclick="axiomSwitchTab('runs', this)">📊 Run History</button>
      </div>

      <!-- Tab Content -->
      <div id="axiomTabContent" style="flex:1;overflow-y:auto">
        <!-- Default: My Bots -->
      </div>

      <!-- Status Bar -->
      <div id="axiomStatus" style="padding:8px 12px;background:var(--bg-primary);border-radius:var(--radius-sm);font-size:11px;color:var(--text-muted);display:flex;align-items:center;gap:8px">
        <span id="axiomStatusDot" style="width:8px;height:8px;border-radius:50%;background:var(--green)"></span>
        <span id="axiomStatusText">Ready - No bots running</span>
      </div>
    </div>

    <style>
      .axiom-tab {
        background: var(--bg-tertiary);
        border: 1px solid var(--border);
        color: var(--text-secondary);
        padding: 6px 12px;
        border-radius: var(--radius-xs);
        cursor: pointer;
        font-size: 12px;
        transition: var(--transition);
      }
      .axiom-tab:hover { background: var(--bg-hover); color: var(--text-primary); }
      .axiom-tab.active { background: var(--accent); color: white; border-color: var(--accent); }
      
      .axiom-card {
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: 14px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: var(--transition);
      }
      .axiom-card:hover { border-color: var(--accent); transform: translateY(-1px); }
      
      .axiom-step {
        background: var(--bg-tertiary);
        border: 1px solid var(--border);
        border-left: 3px solid var(--accent);
        border-radius: var(--radius-xs);
        padding: 10px 12px;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        cursor: grab;
        transition: var(--transition);
      }
      .axiom-step:hover { background: var(--bg-hover); }
      .axiom-step .step-icon { font-size: 18px; flex-shrink: 0; }
      .axiom-step .step-info { flex: 1; min-width: 0; }
      .axiom-step .step-name { font-weight: 600; color: var(--text-primary); }
      .axiom-step .step-detail { font-size: 11px; color: var(--text-muted); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .axiom-step .step-actions { display: flex; gap: 4px; }
      .axiom-step .step-actions button { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 14px; padding: 2px 4px; border-radius: 4px; }
      .axiom-step .step-actions button:hover { background: var(--bg-active); color: var(--text-primary); }
      
      .axiom-category { margin-bottom: 16px; }
      .axiom-category h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); margin-bottom: 8px; }
      
      .axiom-step-picker {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 6px;
      }
      .axiom-step-picker button {
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: var(--radius-xs);
        padding: 8px;
        cursor: pointer;
        text-align: left;
        font-size: 12px;
        color: var(--text-primary);
        transition: var(--transition);
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .axiom-step-picker button:hover { border-color: var(--accent); background: var(--bg-hover); }
      
      .axiom-run-btn {
        background: linear-gradient(135deg, var(--green), #059669);
        border: none;
        color: white;
        padding: 10px 20px;
        border-radius: var(--radius-sm);
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        width: 100%;
        transition: var(--transition);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .axiom-run-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px var(--green-glow); }
      
      .axiom-input {
        background: var(--bg-primary);
        border: 1px solid var(--border);
        color: var(--text-primary);
        padding: 8px 10px;
        border-radius: var(--radius-xs);
        font-size: 13px;
        width: 100%;
        outline: none;
      }
      .axiom-input:focus { border-color: var(--accent); }
      
      .axiom-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 10px;
        font-weight: 600;
      }
      .axiom-badge.success { background: rgba(16,185,129,0.15); color: var(--green); }
      .axiom-badge.error { background: rgba(239,68,68,0.15); color: var(--red); }
      .axiom-badge.running { background: rgba(124,58,237,0.15); color: var(--accent); }
      .axiom-badge.ai { background: rgba(6,182,212,0.15); color: var(--cyan); }
    </style>
  `;

  axiomSwitchTab('bots', container.querySelector('.axiom-tab'));
}

function axiomSwitchTab(tab, btn) {
  // Update active tab
  document.querySelectorAll('.axiom-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const content = document.getElementById('axiomTabContent');

  switch (tab) {
    case 'bots':
      renderAxiomBots(content);
      break;
    case 'templates':
      renderAxiomTemplates(content);
      break;
    case 'builder':
      renderAxiomBuilder(content);
      break;
    case 'runs':
      renderAxiomRuns(content);
      break;
  }
}

function renderAxiomBots(container) {
  const bots = window._axiomBots || [];
  
  container.innerHTML = `
    <button onclick="axiomCreateBot()" style="width:100%;padding:10px;background:linear-gradient(135deg,var(--accent),#6d28d9);color:white;border:none;border-radius:var(--radius-sm);font-weight:600;cursor:pointer;margin-bottom:12px;font-size:13px">
      + Create New Bot
    </button>
    
    ${bots.length === 0 ? `
      <div style="text-align:center;padding:40px 20px;color:var(--text-muted)">
        <div style="font-size:48px;margin-bottom:12px">🤖</div>
        <h3 style="margin-bottom:8px;color:var(--text-secondary)">No Bots Yet</h3>
        <p style="font-size:13px">Create a new bot or start from a template to automate your browser tasks.</p>
      </div>
    ` : bots.map(bot => `
      <div class="axiom-card" onclick="axiomEditBot('${bot.id}')">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
          <div>
            <div style="font-weight:600;font-size:14px">${bot.name}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${bot.description || 'No description'}</div>
          </div>
          <span class="axiom-badge ${bot.stats?.lastRun ? 'success' : ''}">${bot.steps?.length || 0} steps</span>
        </div>
        <div style="display:flex;gap:12px;font-size:11px;color:var(--text-muted)">
          <span>Runs: ${bot.stats?.totalRuns || 0}</span>
          <span>Success: ${bot.stats?.successfulRuns || 0}</span>
          <span>Last: ${bot.stats?.lastRun ? new Date(bot.stats.lastRun).toLocaleDateString() : 'Never'}</span>
        </div>
        <div style="display:flex;gap:6px;margin-top:10px">
          <button class="axiom-run-btn" onclick="event.stopPropagation();axiomRunBot('${bot.id}')" style="flex:1;padding:8px;font-size:12px">
            ▶ Run
          </button>
          <button onclick="event.stopPropagation();axiomDuplicateBot('${bot.id}')" style="background:var(--bg-tertiary);border:1px solid var(--border);color:var(--text-secondary);padding:8px 12px;border-radius:var(--radius-sm);cursor:pointer;font-size:12px">📋</button>
          <button onclick="event.stopPropagation();axiomDeleteBot('${bot.id}')" style="background:var(--bg-tertiary);border:1px solid var(--border);color:var(--red);padding:8px 12px;border-radius:var(--radius-sm);cursor:pointer;font-size:12px">🗑</button>
        </div>
      </div>
    `).join('')}
  `;
}

function renderAxiomTemplates(container) {
  const templates = [
    { id: 'template_spotify_scraper', name: 'Spotify Playlist Scraper', icon: '🎵', category: 'Music', desc: 'Scrape tracks from Spotify playlists' },
    { id: 'template_youtube_analytics', name: 'YouTube Channel Analytics', icon: '📺', category: 'Music', desc: 'Scrape video data from YouTube channels' },
    { id: 'template_social_engagement', name: 'Social Media Auto-Engagement', icon: '📱', category: 'Social', desc: 'Auto-like and engage with posts' },
    { id: 'template_royalty_checker', name: 'Royalty Platform Checker', icon: '💰', category: 'Music', desc: 'Check earnings across platforms' },
    { id: 'template_web_scraper', name: 'General Web Scraper', icon: '🕷️', category: 'Data', desc: 'Scrape data from any website' },
    { id: 'template_form_filler', name: 'Auto Form Filler', icon: '📝', category: 'Productivity', desc: 'Auto-fill web forms' },
    { id: 'template_price_monitor', name: 'Price Monitor', icon: '💲', category: 'E-Commerce', desc: 'Track product prices' },
    { id: 'template_ai_research', name: 'AI Research Bot', icon: '🤖', category: 'AI', desc: 'AI-powered web research' }
  ];

  const categories = [...new Set(templates.map(t => t.category))];

  container.innerHTML = categories.map(cat => `
    <div class="axiom-category">
      <h4>${cat}</h4>
      ${templates.filter(t => t.category === cat).map(t => `
        <div class="axiom-card" onclick="axiomUseTemplate('${t.id}')">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:28px">${t.icon}</span>
            <div>
              <div style="font-weight:600;font-size:13px">${t.name}</div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${t.desc}</div>
            </div>
          </div>
          <button onclick="event.stopPropagation();axiomUseTemplate('${t.id}')" style="margin-top:10px;width:100%;padding:8px;background:var(--accent);color:white;border:none;border-radius:var(--radius-xs);cursor:pointer;font-size:12px;font-weight:600">
            Use Template
          </button>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function renderAxiomBuilder(container) {
  const stepTypes = {
    'Navigation': [
      { type: 'navigate', icon: '🌐', name: 'Go to URL' },
      { type: 'goBack', icon: '⬅️', name: 'Go Back' },
      { type: 'newTab', icon: '📑', name: 'New Tab' }
    ],
    'Interaction': [
      { type: 'click', icon: '👆', name: 'Click' },
      { type: 'type', icon: '⌨️', name: 'Type Text' },
      { type: 'pressKey', icon: '🔤', name: 'Press Key' },
      { type: 'selectDropdown', icon: '📋', name: 'Select Dropdown' },
      { type: 'scroll', icon: '📜', name: 'Scroll' },
      { type: 'hover', icon: '🎯', name: 'Hover' },
      { type: 'uploadFile', icon: '📤', name: 'Upload File' }
    ],
    'Data Extraction': [
      { type: 'scrapeText', icon: '📝', name: 'Scrape Text' },
      { type: 'scrapeAttribute', icon: '🏷️', name: 'Scrape Attribute' },
      { type: 'scrapeTable', icon: '📊', name: 'Scrape Table' },
      { type: 'screenshot', icon: '📸', name: 'Screenshot' },
      { type: 'scrapeHTML', icon: '🔧', name: 'Scrape HTML' }
    ],
    'Logic & Control': [
      { type: 'wait', icon: '⏱️', name: 'Wait' },
      { type: 'waitForElement', icon: '👁️', name: 'Wait for Element' },
      { type: 'loop', icon: '🔁', name: 'Loop' },
      { type: 'ifCondition', icon: '🔀', name: 'If Condition' }
    ],
    'Data Export': [
      { type: 'exportCSV', icon: '📄', name: 'Export CSV' },
      { type: 'exportJSON', icon: '📋', name: 'Export JSON' },
      { type: 'setVariable', icon: '📦', name: 'Set Variable' }
    ],
    'AI-Powered ⚡': [
      { type: 'aiExtract', icon: '🤖', name: 'AI Extract' },
      { type: 'aiDecision', icon: '🧠', name: 'AI Decision' },
      { type: 'aiSummarize', icon: '📝', name: 'AI Summarize' },
      { type: 'aiClassify', icon: '🏷️', name: 'AI Classify' },
      { type: 'aiGenerateResponse', icon: '💬', name: 'AI Generate' }
    ],
    'Advanced': [
      { type: 'executeJS', icon: '⚡', name: 'Run JavaScript' },
      { type: 'httpRequest', icon: '🌐', name: 'HTTP Request' },
      { type: 'webhook', icon: '🔗', name: 'Webhook' },
      { type: 'notification', icon: '🔔', name: 'Notification' }
    ]
  };

  container.innerHTML = `
    <div style="margin-bottom:12px">
      <input type="text" class="axiom-input" id="axiomBotName" placeholder="Bot name..." value="New Bot" style="margin-bottom:6px">
      <input type="text" class="axiom-input" id="axiomBotDesc" placeholder="Description (optional)...">
    </div>

    <div id="axiomStepsList" style="margin-bottom:16px;min-height:60px;border:1px dashed var(--border);border-radius:var(--radius-sm);padding:8px">
      <p style="text-align:center;color:var(--text-muted);font-size:12px;padding:16px">Add steps from below to build your bot</p>
    </div>

    <h4 style="font-size:12px;color:var(--text-muted);margin-bottom:8px">ADD STEPS</h4>
    
    ${Object.keys(stepTypes).map(category => `
      <div class="axiom-category">
        <h4>${category}</h4>
        <div class="axiom-step-picker">
          ${stepTypes[category].map(step => `
            <button onclick="axiomAddStepToBuilder('${step.type}', '${step.icon}', '${step.name}')">
              <span>${step.icon}</span> ${step.name}
            </button>
          `).join('')}
        </div>
      </div>
    `).join('')}

    <div style="margin-top:16px;display:flex;gap:8px">
      <button class="axiom-run-btn" onclick="axiomSaveAndRunBot()">
        ▶ Save & Run Bot
      </button>
    </div>
  `;
}

function renderAxiomRuns(container) {
  container.innerHTML = `
    <div style="text-align:center;padding:40px 20px;color:var(--text-muted)">
      <div style="font-size:48px;margin-bottom:12px">📊</div>
      <h3 style="margin-bottom:8px;color:var(--text-secondary)">Run History</h3>
      <p style="font-size:13px">Bot run logs will appear here after you run your first bot.</p>
    </div>
  `;
}

// Builder helper functions
let builderSteps = [];

function axiomAddStepToBuilder(type, icon, name) {
  const stepId = 'bstep_' + Date.now();
  builderSteps.push({ id: stepId, type, icon, name, params: {} });
  
  const list = document.getElementById('axiomStepsList');
  if (builderSteps.length === 1) list.innerHTML = '';
  
  list.innerHTML += `
    <div class="axiom-step" id="${stepId}">
      <span class="step-icon">${icon}</span>
      <div class="step-info">
        <div class="step-name">${name}</div>
        <div class="step-detail">Click to configure parameters</div>
      </div>
      <div class="step-actions">
        <button onclick="axiomMoveStep('${stepId}', -1)" title="Move up">↑</button>
        <button onclick="axiomMoveStep('${stepId}', 1)" title="Move down">↓</button>
        <button onclick="axiomRemoveStep('${stepId}')" title="Remove" style="color:var(--red)">×</button>
      </div>
    </div>
  `;
}

function axiomRemoveStep(stepId) {
  builderSteps = builderSteps.filter(s => s.id !== stepId);
  const el = document.getElementById(stepId);
  if (el) el.remove();
  if (builderSteps.length === 0) {
    document.getElementById('axiomStepsList').innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:12px;padding:16px">Add steps from below to build your bot</p>';
  }
}

function axiomMoveStep(stepId, direction) {
  const idx = builderSteps.findIndex(s => s.id === stepId);
  if (idx < 0) return;
  const newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= builderSteps.length) return;
  [builderSteps[idx], builderSteps[newIdx]] = [builderSteps[newIdx], builderSteps[idx]];
  // Re-render steps
  const list = document.getElementById('axiomStepsList');
  list.innerHTML = builderSteps.map(s => `
    <div class="axiom-step" id="${s.id}">
      <span class="step-icon">${s.icon}</span>
      <div class="step-info">
        <div class="step-name">${s.name}</div>
        <div class="step-detail">Click to configure</div>
      </div>
      <div class="step-actions">
        <button onclick="axiomMoveStep('${s.id}', -1)">↑</button>
        <button onclick="axiomMoveStep('${s.id}', 1)">↓</button>
        <button onclick="axiomRemoveStep('${s.id}')" style="color:var(--red)">×</button>
      </div>
    </div>
  `).join('');
}

// Bot management functions
window._axiomBots = [];

function axiomCreateBot() {
  const name = prompt('Bot name:');
  if (!name) return;
  const bot = { id: 'bot_' + Date.now(), name, description: '', steps: [], stats: { totalRuns: 0, successfulRuns: 0, failedRuns: 0, lastRun: null } };
  window._axiomBots.push(bot);
  axiomSwitchTab('bots');
}

function axiomDeleteBot(botId) {
  if (!confirm('Delete this bot?')) return;
  window._axiomBots = window._axiomBots.filter(b => b.id !== botId);
  axiomSwitchTab('bots');
}

function axiomDuplicateBot(botId) {
  const bot = window._axiomBots.find(b => b.id === botId);
  if (!bot) return;
  const copy = JSON.parse(JSON.stringify(bot));
  copy.id = 'bot_' + Date.now();
  copy.name += ' (Copy)';
  window._axiomBots.push(copy);
  axiomSwitchTab('bots');
}

function axiomEditBot(botId) {
  axiomSwitchTab('builder');
}

function axiomRunBot(botId) {
  const status = document.getElementById('axiomStatusText');
  const dot = document.getElementById('axiomStatusDot');
  if (status) status.textContent = 'Running bot...';
  if (dot) dot.style.background = 'var(--accent)';
  
  // Simulate bot run
  setTimeout(() => {
    const bot = window._axiomBots.find(b => b.id === botId);
    if (bot) {
      bot.stats.totalRuns++;
      bot.stats.successfulRuns++;
      bot.stats.lastRun = new Date().toISOString();
    }
    if (status) status.textContent = 'Bot completed successfully';
    if (dot) dot.style.background = 'var(--green)';
    axiomSwitchTab('bots');
  }, 3000);
}

function axiomUseTemplate(templateId) {
  const templates = {
    'template_spotify_scraper': { name: 'Spotify Playlist Scraper', steps: 5 },
    'template_youtube_analytics': { name: 'YouTube Channel Analytics', steps: 7 },
    'template_social_engagement': { name: 'Social Media Auto-Engagement', steps: 4 },
    'template_royalty_checker': { name: 'Royalty Platform Checker', steps: 5 },
    'template_web_scraper': { name: 'General Web Scraper', steps: 6 },
    'template_form_filler': { name: 'Auto Form Filler', steps: 7 },
    'template_price_monitor': { name: 'Price Monitor', steps: 5 },
    'template_ai_research': { name: 'AI Research Bot', steps: 5 }
  };
  
  const template = templates[templateId];
  if (!template) return;
  
  const bot = {
    id: 'bot_' + Date.now(),
    name: template.name,
    description: 'Created from template',
    steps: Array(template.steps).fill(null).map((_, i) => ({ id: 'step_' + i, type: 'navigate', order: i + 1 })),
    stats: { totalRuns: 0, successfulRuns: 0, failedRuns: 0, lastRun: null }
  };
  
  window._axiomBots.push(bot);
  axiomSwitchTab('bots');
}

function axiomSaveAndRunBot() {
  const name = document.getElementById('axiomBotName')?.value || 'New Bot';
  const desc = document.getElementById('axiomBotDesc')?.value || '';
  
  if (builderSteps.length === 0) {
    alert('Add at least one step to your bot');
    return;
  }
  
  const bot = {
    id: 'bot_' + Date.now(),
    name,
    description: desc,
    steps: builderSteps.map((s, i) => ({ ...s, order: i + 1 })),
    stats: { totalRuns: 0, successfulRuns: 0, failedRuns: 0, lastRun: null }
  };
  
  window._axiomBots.push(bot);
  builderSteps = [];
  axiomRunBot(bot.id);
}

// Export for use in main app
if (typeof module !== 'undefined') {
  module.exports = { renderAxiomPanel };
}

// Window exports for Electron renderer onclick handlers
window.renderAxiomPanel = renderAxiomPanel;
window.axiomSwitchTab = axiomSwitchTab;
window.axiomCreateBot = axiomCreateBot;
window.axiomEditBot = axiomEditBot;
window.axiomDeleteBot = axiomDeleteBot;
window.axiomDuplicateBot = axiomDuplicateBot;
window.axiomRunBot = axiomRunBot;
window.axiomUseTemplate = axiomUseTemplate;
window.axiomAddStepToBuilder = axiomAddStepToBuilder;
window.axiomRemoveStep = axiomRemoveStep;
window.axiomMoveStep = axiomMoveStep;
window.axiomSaveAndRunBot = axiomSaveAndRunBot;