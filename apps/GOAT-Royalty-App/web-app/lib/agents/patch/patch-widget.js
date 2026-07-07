/**
 * Dr. Devin — Patch Widget
 * Drop this script on any GOAT page to add a floating Patch menu.
 *
 * Usage:
 *   <script src="lib/agents/patch/patch-core.js"></script>
 *   <script src="lib/agents/patch/patch-widget.js" data-agent="moneypenny"></script>
 */

(function () {
  'use strict';

  const AGENT = document.currentScript?.dataset?.agent || 'moneypenny';

  function injectCSS() {
    if (document.getElementById('patch-widget-css')) return;
    const css = document.createElement('style');
    css.id = 'patch-widget-css';
    css.textContent = `
      #patch-widget-btn { position:fixed; bottom:22px; right:22px; width:54px; height:54px; border-radius:50%; background:linear-gradient(135deg,#d4a03c,#f0c040); border:2px solid rgba(255,255,255,0.2); color:#030609; font-size:24px; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:9999; box-shadow:0 4px 24px rgba(212,160,60,0.35); transition:transform .2s; }
      #patch-widget-btn:hover { transform:scale(1.08); }
      #patch-widget-panel { position:fixed; bottom:90px; right:22px; width:360px; max-height:calc(100vh - 120px); background:rgba(13,20,32,0.96); border:1px solid rgba(212,160,60,0.25); border-radius:18px; padding:18px; z-index:9999; color:#f0ece4; font-family:'Inter',sans-serif; box-shadow:0 12px 48px rgba(0,0,0,0.65); display:none; overflow:auto; }
      #patch-widget-panel.open { display:block; }
      #patch-widget-panel h3 { margin:0 0 12px; font-size:16px; color:#f0c040; }
      #patch-widget-panel label { display:block; font-size:11px; color:#8a8070; text-transform:uppercase; margin:10px 0 4px; }
      #patch-widget-panel input, #patch-widget-panel select { width:100%; padding:8px 10px; border-radius:8px; border:1px solid rgba(212,160,60,0.25); background:#050a14; color:#f0ece4; font-size:13px; box-sizing:border-box; }
      #patch-widget-panel .pw-row { display:flex; gap:8px; margin-top:10px; }
      #patch-widget-panel button { flex:1; padding:8px 12px; border-radius:20px; border:1px solid #d4a03c; background:transparent; color:#d4a03c; font-weight:700; cursor:pointer; font-size:12px; }
      #patch-widget-panel button.primary { background:#d4a03c; color:#030609; }
      #patch-widget-panel .pw-log { background:#050a14; border:1px solid rgba(212,160,60,0.12); border-radius:8px; padding:10px; font-family:'JetBrains Mono',monospace; font-size:11px; color:#8a8070; max-height:160px; overflow:auto; white-space:pre-wrap; margin-top:10px; }
      #patch-widget-panel .pw-close { position:absolute; top:10px; right:14px; color:#8a8070; cursor:pointer; font-size:18px; }
      #patch-widget-panel .pw-tabs { display:flex; gap:6px; margin-bottom:12px; }
      #patch-widget-panel .pw-tab { flex:1; padding:6px; border-radius:8px; border:1px solid rgba(212,160,60,0.25); background:transparent; color:#8a8070; font-size:11px; cursor:pointer; }
      #patch-widget-panel .pw-tab.active { background:rgba(212,160,60,0.2); color:#f0c040; }
      #patch-widget-panel .pw-section { display:none; }
      #patch-widget-panel .pw-section.active { display:block; }
      #patch-widget-panel .pw-term-out { background:#050a14; border:1px solid rgba(212,160,60,0.12); border-radius:8px; padding:8px; font-family:'JetBrains Mono',monospace; font-size:10px; color:#8a8070; height:120px; overflow:auto; white-space:pre-wrap; margin-top:8px; }
      #patch-widget-panel .pw-term-in { display:flex; gap:6px; margin-top:6px; }
      #patch-widget-panel .pw-term-in input { flex:1; padding:6px 8px; border-radius:6px; border:1px solid rgba(212,160,60,0.25); background:#050a14; color:#f0ece4; font-size:12px; }
      #patch-widget-panel .pw-term-in button { width:auto; padding:6px 12px; }
    `;
    document.head.appendChild(css);
  }

  function createPanel() {
    if (document.getElementById('patch-widget-panel')) return;
    const panel = document.createElement('div');
    panel.id = 'patch-widget-panel';
    panel.innerHTML = `
      <div class="pw-close" id="patch-widget-close">&times;</div>
      <h3>🩺 Dr. Devin (Patch)</h3>
      <div class="pw-tabs">
        <div class="pw-tab active" data-tab="links">Links</div>
        <div class="pw-tab" data-tab="health">Health</div>
        <div class="pw-tab" data-tab="terminal">Terminal</div>
      </div>
      <div class="pw-section active" id="pw-section-links">
        <label>Agent</label>
        <select id="pw-agent">
          <option value="moneypenny" ${AGENT === 'moneypenny' ? 'selected' : ''}>Ms. Money Penny</option>
          <option value="agent007" ${AGENT === 'agent007' ? 'selected' : ''}>AGENT-007</option>
          <option value="oscar" ${AGENT === 'oscar' ? 'selected' : ''}>OSCAR</option>
          <option value="nexus" ${AGENT === 'nexus' ? 'selected' : ''}>Nexus</option>
          <option value="codex" ${AGENT === 'codex' ? 'selected' : ''}>Codex</option>
        </select>
        <label>Model Directory</label>
        <input type="text" id="pw-model-dir" placeholder="/Volumes/.../models">
        <label>Data Directory</label>
        <input type="text" id="pw-data-dir" placeholder="/Volumes/.../project-root">
        <label>Ollama Host</label>
        <input type="text" id="pw-ollama-host" placeholder="localhost:11434">
        <label>Terminal Server</label>
        <input type="text" id="pw-terminal-host" placeholder="localhost:9999">
        <div class="pw-row">
          <button class="primary" id="pw-save">Save</button>
          <button id="pw-health">Health</button>
        </div>
      </div>
      <div class="pw-section" id="pw-section-health">
        <div class="pw-row">
          <button class="primary" id="pw-health2">Run Check</button>
          <button id="pw-heal">Heal</button>
        </div>
        <div class="pw-log" id="pw-log">Ready.</div>
      </div>
      <div class="pw-section" id="pw-section-terminal">
        <div class="pw-term-out" id="pw-term-out">Start the server: python3 web-app/lib/agents/patch/patch-terminal-server.py --port 9999</div>
        <div class="pw-term-in">
          <input type="text" id="pw-term-in" placeholder="Command..." autocomplete="off">
          <button id="pw-term-run">Run</button>
        </div>
      </div>
      <div style="margin-top:10px;text-align:center;"><a href="dr-devin.html" style="color:#d4a03c;font-size:12px;text-decoration:none;">Open full Patch console →</a></div>
    `;
    document.body.appendChild(panel);

    const btn = document.createElement('div');
    btn.id = 'patch-widget-btn';
    btn.innerHTML = '🩺';
    document.body.appendChild(btn);

    btn.addEventListener('click', () => panel.classList.toggle('open'));
    document.getElementById('patch-widget-close').addEventListener('click', () => panel.classList.remove('open'));

    document.querySelectorAll('#patch-widget-panel .pw-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#patch-widget-panel .pw-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('#patch-widget-panel .pw-section').forEach(s => s.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('pw-section-' + tab.dataset.tab).classList.add('active');
      });
    });

    document.getElementById('pw-agent').addEventListener('change', loadAgent);
    document.getElementById('pw-save').addEventListener('click', saveAgent);
    document.getElementById('pw-health').addEventListener('click', () => { switchTab('health'); runHealth(); });
    document.getElementById('pw-health2').addEventListener('click', runHealth);
    document.getElementById('pw-heal').addEventListener('click', runHeal);
    document.getElementById('pw-term-run').addEventListener('click', runTerm);
    document.getElementById('pw-term-in').addEventListener('keydown', (e) => { if (e.key === 'Enter') runTerm(); });
  }

  function switchTab(name) {
    document.querySelectorAll('#patch-widget-panel .pw-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('#patch-widget-panel .pw-section').forEach(s => s.classList.toggle('active', s.id === 'pw-section-' + name));
  }

  function loadAgent() {
    const id = document.getElementById('pw-agent').value;
    const a = Patch.getAgent(id);
    document.getElementById('pw-model-dir').value = a.defaultModelDir || '';
    document.getElementById('pw-data-dir').value = a.defaultDataDir || '';
    document.getElementById('pw-ollama-host').value = a.ollamaHost || '';
    document.getElementById('pw-terminal-host').value = a.terminalHost || '';
  }

  function saveAgent() {
    const id = document.getElementById('pw-agent').value;
    Patch.setModelDir(id, document.getElementById('pw-model-dir').value.trim());
    Patch.setDataDir(id, document.getElementById('pw-data-dir').value.trim());
    Patch.setOllamaHost(id, document.getElementById('pw-ollama-host').value.trim());
    Patch.setTerminalHost(id, document.getElementById('pw-terminal-host').value.trim());
    log('Links saved for ' + id);
  }

  async function runHealth() {
    const id = document.getElementById('pw-agent').value;
    log('Running health check for ' + id + '...');
    const report = await Patch.healthCheck(id);
    const lines = [
      `${report.agentName}: ${report.healthy ? 'HEALTHY' : 'NEEDS ATTENTION'}`,
      `Models: ${report.modelCatalog.local}/${report.modelCatalog.expected} (missing ${report.modelCatalog.missing})`,
      ...report.checks.map(c => `[${c.ok ? 'OK' : 'FAIL'}] ${c.name} ${c.error || ''}`)
    ];
    log(lines.join('\n'));
  }

  async function runHeal() {
    const id = document.getElementById('pw-agent').value;
    log('Running heal for ' + id + '...');
    const report = await Patch.healthCheck(id);
    const heal = await Patch.selfHeal(report);
    log(heal.fixed ? 'All checks passed.' : 'Issues found:\n' + heal.fixes.map((f, i) => `${i + 1}. ${f.issue}\n   → ${f.suggestion}`).join('\n'));
  }

  async function runTerm() {
    const input = document.getElementById('pw-term-in');
    const cmd = input.value.trim();
    if (!cmd) return;
    input.value = '';
    const out = document.getElementById('pw-term-out');
    out.textContent += '\n$ ' + cmd;
    out.scrollTop = out.scrollHeight;

    const id = document.getElementById('pw-agent').value;
    const host = document.getElementById('pw-terminal-host').value.trim();
    let result = await Patch.terminalExec(cmd, { agentId: id, terminalHost: host });

    if (result.needs_confirm) {
      const ok = confirm(result.classification.reason + '\n\n' + cmd + '\n\nRun this command?');
      if (!ok) {
        out.textContent += '\nCancelled.';
        out.scrollTop = out.scrollHeight;
        return;
      }
      result = await Patch.terminalExec(cmd, { agentId: id, terminalHost: host, confirm: true });
    }

    if (result.ok) {
      if (result.stdout) out.textContent += '\n' + result.stdout;
      if (result.stderr) out.textContent += '\nERR: ' + result.stderr;
    } else {
      out.textContent += '\nBLOCKED: ' + (result.stderr || result.error || 'Command failed');
    }
    out.scrollTop = out.scrollHeight;
  }

  function log(text) {
    document.getElementById('pw-log').textContent = text;
  }

  function init() {
    if (typeof Patch === 'undefined') {
      console.warn('[Patch Widget] Patch core not loaded. Include patch-core.js first.');
      return;
    }
    injectCSS();
    createPanel();
    Patch.init().then(loadAgent);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
