/* === GOAT Force Agent Launcher Upgrades ===
   Injects into every agent launcher that does not already have a
   Devin Command Center or a drag-drop file zone.
   No external dependencies. Uses localStorage only.
*/
(function () {
  'use strict';

  const NS = window.AgentUpgrades = {
    files: [],
    init,
    toggleDevin,
    updateModel,
    updateTemperature,
    updateFontSize,
    saveSettings,
    loadSettings,
    resetSettings,
    configureMCP,
    manageSkills,
    exportSessions,
    importSessions,
    clearHistory,
    handleFiles,
    removeFile
  };

  const UP = 'upg-';
  const LS_SETTINGS = 'devin-settings';
  const LS_SESSIONS = 'devin-sessions';

  function init() {
    // Skip if the page already has a Devin Command Center.
    if (document.querySelector('.devin-panel') || document.getElementById('devinPanel')) {
      // Still try to add the drop zone if the page has no file drop UI at all.
      if (!hasAnyDropZone()) injectDropZone();
      return;
    }

    injectDevinPanel();
    injectDropZone();
    loadSettings();
  }

  function hasAnyDropZone() {
    return document.querySelector('.upgrade-drop-zone, .drop-zone, .drop-overlay, .attach-btn') !== null;
  }

  // ---------- Devin Command Center panel ----------
  function injectDevinPanel() {
    if (document.getElementById(UP + 'devinPanel')) return;

    const panel = document.createElement('div');
    panel.className = 'upgrade-devin-panel';
    panel.id = UP + 'devinPanel';
    panel.innerHTML = `
      <div class="upgrade-devin-panel-header" onclick="AgentUpgrades.toggleDevin()">
        <div class="upgrade-devin-logo">🩺</div>
        <div>
          <div class="upgrade-devin-panel-title">Dr. Devin — Command Center</div>
          <div class="upgrade-devin-panel-sub">Agent 007 · WHAT'S UP DOC · Models · Modes · MCP · Skills · Settings · Rules · Sessions</div>
        </div>
        <span class="upgrade-devin-chevron" id="${UP}devinChevron">▼</span>
      </div>
      <div class="upgrade-devin-body" id="${UP}devinBody">
        <div class="upgrade-settings-section">
          <h4>🤖 Model Settings</h4>
          <div class="upgrade-setting-row">
            <label>Active Model</label>
            <select id="${UP}modelSelector" onchange="AgentUpgrades.updateModel()">
              <option value="adaptive">Adaptive (Auto)</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-3-opus">Claude 3 Opus</option>
              <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              <option value="local">Local (Ollama)</option>
            </select>
          </div>
          <div class="upgrade-setting-row">
            <label>Temperature</label>
            <div>
              <input type="range" id="${UP}temperature" min="0" max="2" step="0.1" value="0.7" onchange="AgentUpgrades.updateTemperature()">
              <span id="${UP}tempValue">0.7</span>
            </div>
          </div>
          <div class="upgrade-setting-row">
            <label>Max Tokens</label>
            <input type="number" id="${UP}maxTokens" value="4096" min="100" max="32000">
          </div>
          <div class="upgrade-setting-row">
            <label>System Prompt</label>
            <textarea id="${UP}systemPrompt" rows="3" placeholder="Custom system instructions..."></textarea>
          </div>
        </div>

        <div class="upgrade-settings-section">
          <h4>⚡ Performance</h4>
          <div class="upgrade-setting-row">
            <label>Streaming</label>
            <input type="checkbox" id="${UP}streaming" checked>
          </div>
          <div class="upgrade-setting-row">
            <label>Parallel Agents</label>
            <input type="number" id="${UP}parallelAgents" value="4" min="1" max="10">
          </div>
          <div class="upgrade-setting-row">
            <label>Cache Responses</label>
            <input type="checkbox" id="${UP}cacheResponses" checked>
          </div>
          <div class="upgrade-setting-row">
            <label>Auto-continue</label>
            <input type="checkbox" id="${UP}autoContinue">
          </div>
        </div>

        <div class="upgrade-settings-section">
          <h4>🔐 Security</h4>
          <div class="upgrade-setting-row">
            <label>Safe Mode</label>
            <input type="checkbox" id="${UP}safeMode" checked>
          </div>
          <div class="upgrade-setting-row">
            <label>Code Execution</label>
            <select id="${UP}codeExecution">
              <option value="sandbox">Sandboxed</option>
              <option value="restricted">Restricted</option>
              <option value="full">Full Access</option>
            </select>
          </div>
          <div class="upgrade-setting-row">
            <label>API Key</label>
            <input type="password" id="${UP}apiKey" placeholder="Enter API key...">
          </div>
        </div>

        <div class="upgrade-settings-section">
          <h4>🎨 Interface</h4>
          <div class="upgrade-setting-row">
            <label>Theme</label>
            <select id="${UP}theme">
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div class="upgrade-setting-row">
            <label>Font Size</label>
            <div>
              <input type="range" id="${UP}fontSize" min="12" max="24" value="16" onchange="AgentUpgrades.updateFontSize()">
              <span id="${UP}fontSizeValue">16px</span>
            </div>
          </div>
          <div class="upgrade-setting-row">
            <label>Show Line Numbers</label>
            <input type="checkbox" id="${UP}lineNumbers" checked>
          </div>
          <div class="upgrade-setting-row">
            <label>Syntax Highlighting</label>
            <input type="checkbox" id="${UP}syntaxHighlighting" checked>
          </div>
        </div>

        <div class="upgrade-settings-section">
          <h4>📊 Monitoring</h4>
          <div class="upgrade-setting-row">
            <label>Log Level</label>
            <select id="${UP}logLevel">
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info" selected>Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>
          <div class="upgrade-setting-row">
            <label>Token Counter</label>
            <input type="checkbox" id="${UP}tokenCounter" checked>
          </div>
          <div class="upgrade-setting-row">
            <label>Performance Metrics</label>
            <input type="checkbox" id="${UP}perfMetrics">
          </div>
        </div>

        <div class="upgrade-settings-section">
          <h4>🔌 Integrations</h4>
          <div class="upgrade-setting-row">
            <label>MCP Servers</label>
            <button class="upgrade-btn-secondary" onclick="AgentUpgrades.configureMCP()">Configure</button>
          </div>
          <div class="upgrade-setting-row">
            <label>Custom Skills</label>
            <button class="upgrade-btn-secondary" onclick="AgentUpgrades.manageSkills()">Manage</button>
          </div>
          <div class="upgrade-setting-row">
            <label>Web Search</label>
            <input type="checkbox" id="${UP}webSearch" checked>
          </div>
        </div>

        <div class="upgrade-settings-section">
          <h4>💾 Data</h4>
          <div class="upgrade-setting-row">
            <label>Export Sessions</label>
            <button class="upgrade-btn-secondary" onclick="AgentUpgrades.exportSessions()">Export</button>
          </div>
          <div class="upgrade-setting-row">
            <label>Import Sessions</label>
            <button class="upgrade-btn-secondary" onclick="AgentUpgrades.importSessions()">Import</button>
          </div>
          <div class="upgrade-setting-row">
            <label>Clear History</label>
            <button class="upgrade-btn-secondary" onclick="AgentUpgrades.clearHistory()">Clear</button>
          </div>
        </div>

        <div class="upgrade-settings-actions">
          <button onclick="AgentUpgrades.saveSettings()" class="upgrade-btn-primary">Save Settings</button>
          <button onclick="AgentUpgrades.resetSettings()" class="upgrade-btn-secondary">Reset to Default</button>
        </div>
      </div>
    `;
    document.body.appendChild(panel);
  }

  function toggleDevin() {
    const body = document.getElementById(UP + 'devinBody');
    const chevron = document.getElementById(UP + 'devinChevron');
    if (!body) return;
    body.classList.toggle('open');
    chevron.classList.toggle('open');
  }

  // ---------- Drag & Drop file zone ----------
  function injectDropZone() {
    if (document.getElementById(UP + 'dropZone')) return;
    const inputArea = document.querySelector('.chat-input-area');
    if (!inputArea) return;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="upgrade-drop-zone" id="${UP}dropZone">
        <span class="upgrade-drop-zone-icon">📁</span>
        <span class="upgrade-drop-zone-text">Drag & drop files here or click to upload</span>
        <input type="file" id="${UP}fileInput" multiple style="display: none;">
      </div>
      <div class="upgrade-file-previews" id="${UP}filePreviewArea"></div>
    `;
    inputArea.parentNode.insertBefore(wrapper, inputArea);

    const dropZone = document.getElementById(UP + 'dropZone');
    const fileInput = document.getElementById(UP + 'fileInput');

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      NS.handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', (e) => NS.handleFiles(e.target.files));
  }

  function handleFiles(files) {
    if (!files) return;
    for (const file of files) {
      NS.files.push(file);
      displayFilePreview(file);
    }
  }

  function displayFilePreview(file) {
    const area = document.getElementById(UP + 'filePreviewArea');
    if (!area) return;
    const el = document.createElement('div');
    el.className = 'upgrade-file-preview';
    el.innerHTML = `
      <span>${escapeHtml(file.name)}</span>
      <button class="upgrade-file-preview-remove" onclick="AgentUpgrades.removeFile('${escapeHtml(file.name)}', this)">Remove</button>
    `;
    area.appendChild(el);
  }

  function removeFile(fileName, button) {
    NS.files = NS.files.filter(f => f.name !== fileName);
    if (button && button.parentElement) button.parentElement.remove();
  }

  function escapeHtml(text) {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  // ---------- Settings ----------
  function updateModel() {
    const model = document.getElementById(UP + 'modelSelector').value;
    localStorage.setItem('devin-model', model);
    console.log('Model updated:', model);
  }

  function updateTemperature() {
    const temp = document.getElementById(UP + 'temperature').value;
    const el = document.getElementById(UP + 'tempValue');
    if (el) el.textContent = temp;
    localStorage.setItem('devin-temperature', temp);
  }

  function updateFontSize() {
    const size = document.getElementById(UP + 'fontSize').value;
    const el = document.getElementById(UP + 'fontSizeValue');
    if (el) el.textContent = size + 'px';
    // Only apply to the upgrade panel, not globally, to avoid breaking layouts.
    const panel = document.getElementById(UP + 'devinPanel');
    if (panel) panel.style.fontSize = size + 'px';
    localStorage.setItem('devin-fontSize', size);
  }

  function saveSettings() {
    const settings = {
      model: gv('modelSelector'),
      temperature: gv('temperature'),
      maxTokens: gv('maxTokens'),
      systemPrompt: gv('systemPrompt'),
      streaming: gc('streaming'),
      parallelAgents: gv('parallelAgents'),
      cacheResponses: gc('cacheResponses'),
      autoContinue: gc('autoContinue'),
      safeMode: gc('safeMode'),
      codeExecution: gv('codeExecution'),
      apiKey: gv('apiKey'),
      theme: gv('theme'),
      fontSize: gv('fontSize'),
      lineNumbers: gc('lineNumbers'),
      syntaxHighlighting: gc('syntaxHighlighting'),
      logLevel: gv('logLevel'),
      tokenCounter: gc('tokenCounter'),
      perfMetrics: gc('perfMetrics'),
      webSearch: gc('webSearch')
    };
    localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
    alert('Settings saved successfully!');
  }

  function resetSettings() {
    if (confirm('Reset all settings to default?')) {
      localStorage.removeItem(LS_SETTINGS);
      localStorage.removeItem('devin-model');
      localStorage.removeItem('devin-temperature');
      localStorage.removeItem('devin-fontSize');
      location.reload();
    }
  }

  function loadSettings() {
    const saved = localStorage.getItem(LS_SETTINGS);
    if (!saved) return;
    try {
      const s = JSON.parse(saved);
      sv('modelSelector', s.model || 'adaptive');
      sv('temperature', s.temperature || 0.7);
      sv('maxTokens', s.maxTokens || 4096);
      sv('systemPrompt', s.systemPrompt || '');
      sc('streaming', s.streaming !== false);
      sv('parallelAgents', s.parallelAgents || 4);
      sc('cacheResponses', s.cacheResponses !== false);
      sc('autoContinue', s.autoContinue || false);
      sc('safeMode', s.safeMode !== false);
      sv('codeExecution', s.codeExecution || 'sandbox');
      sv('apiKey', s.apiKey || '');
      sv('theme', s.theme || 'dark');
      sv('fontSize', s.fontSize || 16);
      sc('lineNumbers', s.lineNumbers !== false);
      sc('syntaxHighlighting', s.syntaxHighlighting !== false);
      sv('logLevel', s.logLevel || 'info');
      sc('tokenCounter', s.tokenCounter !== false);
      sc('perfMetrics', s.perfMetrics || false);
      sc('webSearch', s.webSearch !== false);
      updateTemperature();
      updateFontSize();
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  }

  function configureMCP() { alert('MCP Configuration Panel — add your MCP servers here.'); }
  function manageSkills() { alert('Skills Manager — add/remove custom skills.'); }

  function exportSessions() {
    const sessions = localStorage.getItem(LS_SESSIONS) || '[]';
    const blob = new Blob([sessions], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'devin-sessions.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importSessions() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try { JSON.parse(ev.target.result); } catch (err) { alert('Invalid JSON file'); return; }
        localStorage.setItem(LS_SESSIONS, ev.target.result);
        alert('Sessions imported successfully!');
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function clearHistory() {
    if (confirm('Clear all chat history? This cannot be undone.')) {
      localStorage.removeItem(LS_SESSIONS);
      alert('History cleared');
    }
  }

  // Helpers for prefixed IDs
  function gv(id) { const el = document.getElementById(UP + id); return el ? el.value : ''; }
  function gc(id) { const el = document.getElementById(UP + id); return el ? el.checked : false; }
  function sv(id, val) { const el = document.getElementById(UP + id); if (el) el.value = val; }
  function sc(id, checked) { const el = document.getElementById(UP + id); if (el) el.checked = checked; }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
