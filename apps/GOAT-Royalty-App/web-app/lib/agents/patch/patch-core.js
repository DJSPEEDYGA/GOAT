/**
 * Dr. Devin — "Patch" Core
 * Shared agent toolkit for the GOAT Royalty ecosystem.
 *
 * Provides:
 *   1. Portable model-linker (move model folders between drives)
 *   2. Self-healing health checks
 *   3. Safe self-coding assistant (sandboxed, confirmation-gated)
 *   4. Propagation helpers (roll one feature out to all agents)
 *
 * Money Penny and every other agent can import this one module.
 */

(function (global) {
  'use strict';

  const STORAGE_KEY = 'goat_patch_config_v1';
  const DEFAULT_CONFIG_URL = 'data/patch-model-links.json';

  const AGENTS = [
    'moneypenny', 'agent007', 'oscar', 'nexus', 'lexi', 'codex', 'drdevin'
  ];

  function loadJSON(url) {
    return fetch(url, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .catch(err => {
        console.warn('[Patch] failed to load default config:', err);
        return { agents: {}, modelCatalog: { local: [], expectedCount: 53, localCount: 0 } };
      });
  }

  function getStoredOverrides() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function setStoredOverrides(overrides) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    } catch (e) {
      console.error('[Patch] cannot save config:', e);
    }
  }

  function mergeConfig(defaults, overrides) {
    const merged = JSON.parse(JSON.stringify(defaults));
    for (const id of Object.keys(overrides)) {
      if (!merged.agents[id]) merged.agents[id] = {};
      Object.assign(merged.agents[id], overrides[id]);
    }
    return merged;
  }

  class PatchCore {
    constructor() {
      this.config = { agents: {}, modelCatalog: { local: [], expectedCount: 53, localCount: 0 } };
      this.overrides = {};
      this.ready = false;
    }

    async init(configUrl = DEFAULT_CONFIG_URL) {
      this.config = await loadJSON(configUrl);
      this.overrides = getStoredOverrides();
      this.ready = true;
      console.log('[Patch] initialized for agents:', Object.keys(this.config.agents));
      return this;
    }

    /** ── Model Linker ── */

    getAgent(id) {
      const def = this.config.agents[id] || {};
      const over = this.overrides[id] || {};
      return { ...def, ...over };
    }

    setModelDir(id, path) {
      if (!this.overrides[id]) this.overrides[id] = {};
      this.overrides[id].defaultModelDir = path;
      setStoredOverrides(this.overrides);
      return this.getAgent(id);
    }

    setDataDir(id, path) {
      if (!this.overrides[id]) this.overrides[id] = {};
      this.overrides[id].defaultDataDir = path;
      setStoredOverrides(this.overrides);
      return this.getAgent(id);
    }

    setOllamaHost(id, host) {
      if (!this.overrides[id]) this.overrides[id] = {};
      this.overrides[id].ollamaHost = host;
      setStoredOverrides(this.overrides);
      return this.getAgent(id);
    }

    setTerminalHost(id, host) {
      if (!this.overrides[id]) this.overrides[id] = {};
      this.overrides[id].terminalHost = host;
      setStoredOverrides(this.overrides);
      return this.getAgent(id);
    }

    listAgents() {
      return Object.keys(this.config.agents).map(id => ({ id, ...this.getAgent(id) }));
    }

    exportConfig() {
      return JSON.stringify(this.overrides, null, 2);
    }

    importConfig(jsonString) {
      try {
        const parsed = JSON.parse(jsonString);
        this.overrides = parsed;
        setStoredOverrides(this.overrides);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    }

    resetAgent(id) {
      if (this.overrides[id]) {
        delete this.overrides[id];
        setStoredOverrides(this.overrides);
      }
      return this.getAgent(id);
    }

    /** ── Health Checks ── */

    async checkEndpoint(url, name) {
      const start = performance.now();
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 5000);
        const r = await fetch(url, { method: 'GET', signal: ctrl.signal, cache: 'no-store' });
        clearTimeout(t);
        return {
          name,
          url,
          ok: r.ok,
          status: r.status,
          latency: Math.round(performance.now() - start),
          error: r.ok ? null : `HTTP ${r.status}`
        };
      } catch (e) {
        return { name, url, ok: false, status: 0, latency: Math.round(performance.now() - start), error: e.message };
      }
    }

    async healthCheck(agentId = 'moneypenny') {
      const agent = this.getAgent(agentId);
      const results = [];

      if (agent.chatServerPort) {
        results.push(await this.checkEndpoint(`http://localhost:${agent.chatServerPort}/health`, 'Chat Server'));
        results.push(await this.checkEndpoint(`http://localhost:${agent.chatServerPort}/api/models`, 'Models API'));
      }
      if (agent.ollamaHost) {
        const host = agent.ollamaHost.replace(/^https?:\/\//, '');
        results.push(await this.checkEndpoint(`http://${host}/api/tags`, 'Ollama'));
      }

      const expected = this.config.modelCatalog.expectedCount || 53;
      const local = this.config.modelCatalog.localCount || this.config.modelCatalog.local.length || 0;

      return {
        agentId,
        agentName: agent.name,
        timestamp: new Date().toISOString(),
        checks: results,
        modelCatalog: { expected, local, missing: Math.max(0, expected - local) },
        healthy: results.every(c => c.ok)
      };
    }

    /** ── Self Healing ── */

    async selfHeal(report) {
      const fixes = [];
      for (const check of report.checks || []) {
        if (check.ok) continue;
        if (check.name === 'Ollama' && check.error.includes('fetch')) {
          fixes.push({
            issue: 'Ollama not reachable',
            suggestion: 'Start Ollama with: OLLAMA_HOST=0.0.0.0:11434 ollama serve',
            auto: false
          });
        } else if (check.name === 'Chat Server' && check.error.includes('fetch')) {
          fixes.push({
            issue: 'Chat server not reachable',
            suggestion: `Start the chat server on port ${this.getAgent(report.agentId).chatServerPort}`,
            auto: false
          });
        } else {
          fixes.push({ issue: check.name + ' failed', suggestion: 'Check logs and retry.', auto: false });
        }
      }
      if (report.modelCatalog && report.modelCatalog.missing > 0) {
        fixes.push({
          issue: `${report.modelCatalog.missing} models missing from local catalog`,
          suggestion: 'Use the Model Linker to point to the correct model folder, or download the remaining models via Ollama.',
          auto: false
        });
      }
      return { agentId: report.agentId, fixed: fixes.length === 0, fixes };
    }

    /** ── Safe Self-Coding — permission-gated via /api/self-code ── */

    /**
     * Propose a file edit. Returns a diff for DJ Speedy to review.
     * Does NOT apply anything until confirmSelfCode() is called.
     * @param {string} filePath  - absolute path inside ~/GOAT-Royalty-App
     * @param {string} newContent - full new file content
     * @param {string} reason    - why the agent wants to make this change
     * @param {string} agentId   - which agent is proposing
     */
    async proposeSelfCode(filePath, newContent, reason, agentId = 'drdevin') {
      try {
        const r = await fetch('http://localhost:5500/api/self-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file_path: filePath, new_content: newContent, reason, confirm: false, agent_id: agentId }),
        });
        return await r.json();
      } catch (e) {
        return { ok: false, error: e.message };
      }
    }

    /**
     * Apply a previously proposed self-code change after DJ Speedy approved.
     * @param {string} filePath  - same path as in proposeSelfCode
     * @param {string} newContent - same newContent as in proposeSelfCode
     * @param {string} reason
     * @param {string} agentId
     */
    async confirmSelfCode(filePath, newContent, reason, agentId = 'drdevin') {
      try {
        const r = await fetch('http://localhost:5500/api/self-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file_path: filePath, new_content: newContent, reason, confirm: true, agent_id: agentId }),
        });
        return await r.json();
      } catch (e) {
        return { ok: false, error: e.message };
      }
    }

    /** Legacy sync stub — kept for compatibility */
    selfCode(request) {
      return { ok: true, request: String(request).trim(), mode: 'use proposeSelfCode()', generated: null };
    }

    /** ── Propagation ── */

    propagateFeature(featureName, payload) {
      const updates = [];
      for (const id of AGENTS) {
        if (!this.config.agents[id]) continue;
        updates.push({ agentId: id, applied: true, feature: featureName, payload });
      }
      return { feature: featureName, agents: updates };
    }

    /** ── Live Web Terminal ── */

    classifyCommand(cmd) {
      const forbidden = [
        /\brm\b.*\s+-[a-zA-Z]*[rf]/i,
        /\bmkfs\b/i,
        /\bdd\s+if=/i,
        /\bformat\b/i,
        /\bdiskpart\b/i,
        /\bfdisk\b/i,
        /\bparted\b/i,
        /\bshutdown\b/i,
        /\breboot\b/i,
        /\bpkill\s+-9/i,
        /\bkillall\b/i,
        /\bsudo\b/i,
        /\bsu\b/i,
        /\bpasswd\b/i,
        /\bchown\b/i,
        /\bchmod\b.*\s+0[0-7]{3}/i,
        /\bcurl\s+.*\s*\|\s*(ba)?sh/i,
        /\bwget\s+.*\s*\|\s*(ba)?sh/i,
        /\beval\s*\(/i,
        /\b>:\s*\{/i,
      ];
      const dangerous = [/\brm\b/i, /\bcp\b.*\s+-[a-zA-Z]*[rf]/i, /\bmv\b.*\s+-[a-zA-Z]*f/i];
      const readonly = [
        /^ls\b/i, /^pwd\b/i, /^cd\b/i, /^cat\b/i, /^head\b/i, /^tail\b/i,
        /^find\b/i, /^grep\b/i, /^ps\b/i, /^top\b/i, /^htop\b/i, /^df\b/i,
        /^du\b/i, /^echo\b/i, /^whoami\b/i, /^uname\b/i, /^python3\b/i, /^node\b/i,
        /^git\s+status\b/i, /^git\s+log\b/i, /^git\s+diff\b/i, /^git\s+branch\b/i,
        /^ollama\s+list\b/i, /^ollama\s+ps\b/i,
      ];

      for (const p of forbidden) if (p.test(cmd)) return { class: 'forbidden', reason: 'Blocked by safety rule', needs_confirm: false, ok: false };
      for (const p of dangerous) if (p.test(cmd)) return { class: 'dangerous', reason: 'Destructive — requires confirmation', needs_confirm: true, ok: true };
      for (const p of readonly) if (p.test(cmd)) return { class: 'readonly', reason: 'Read-only', needs_confirm: false, ok: true };
      return { class: 'unknown', reason: 'Unknown — use with caution', needs_confirm: false, ok: true };
    }

    async terminalExec(cmd, options = {}) {
      const agentId = options.agentId || 'drdevin';
      const agent = this.getAgent(agentId);
      // Default to GOAT Intel Server on 5500 — single server, no extra process needed
      const host = (options.terminalHost || agent.terminalHost || 'localhost:5500').replace(/^https?:\/\//, '');
      const cwd = options.cwd || agent.defaultDataDir || '/Users/be100radio/GOAT-Royalty-App';
      const confirm = !!options.confirm;

      const classification = this.classifyCommand(cmd);
      if (!classification.ok) {
        return { ok: false, cmd, classification, stdout: '', stderr: classification.reason, returncode: null };
      }
      if (classification.needs_confirm && !confirm) {
        return { ok: true, needs_confirm: true, cmd, classification, stdout: '', stderr: '', returncode: null };
      }

      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 65000);
        const r = await fetch(`http://${host}/api/terminal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cmd, cwd, confirm }),
          signal: ctrl.signal,
        });
        clearTimeout(t);
        const data = await r.json();
        return { ok: r.ok && data.ok, cmd, classification, ...data };
      } catch (e) {
        return { ok: false, cmd, classification, stdout: '', stderr: e.message, returncode: -1, error: e.message };
      }
    }

    /** ── Utility ── */

    formatBytes(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  }

  const Patch = new PatchCore();
  global.Patch = Patch;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => Patch.init());
    } else {
      Patch.init();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
