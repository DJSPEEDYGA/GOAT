/**
 * GOAT Bridge — resolve Intel (5500) and AGENT007 (3333) bases.
 * AGENT007 + MONEY PENNY = personal originals.
 * THEIR AI TOOL KIT = THE GOAT ROYALTY APP. Licence to Build or Destroy.
 */
(function (global) {
  'use strict';

  async function probe(base, path, ms) {
    if (!base) return null;
    const url = base.replace(/\/$/, '') + path;
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(ms || 2800) });
      if (!r.ok) return null;
      return await r.json().catch(function () { return { ok: true }; });
    } catch (e) {
      return null;
    }
  }

  function candidateBases() {
    const host = location.hostname;
    const port = location.port || (location.protocol === 'https:' ? '443' : '80');
    const onVps = host === '72.61.193.184';
    const onStore8080 = port === '8080';
    const localHost = host === '127.0.0.1' || host === 'localhost';

    const list = [];
    if (onVps) {
      list.push({ intel: '/api/intel', agent007: '/api/agent007', tag: 'vps' });
    }
    if (onStore8080 && localHost) {
      list.push(
        { intel: 'http://127.0.0.1:5500', agent007: 'http://127.0.0.1:3333', tag: 'studio-direct' },
        { intel: '/api/intel', agent007: '/api/agent007', tag: 'store-proxy' }
      );
    }
    if (onStore8080 && !localHost) {
      list.push({ intel: '/api/intel', agent007: '/api/agent007', tag: 'remote-store' });
    }
    list.push(
      { intel: 'http://127.0.0.1:5500', agent007: 'http://127.0.0.1:3333', tag: 'studio' },
      { intel: 'http://localhost:5500', agent007: 'http://localhost:3333', tag: 'localhost' }
    );
    const seen = new Set();
    return list.filter(function (c) {
      const k = c.intel + '|' + c.agent007;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  async function resolve() {
    const bases = candidateBases();
    let intel = bases[0].intel;
    let agent007 = bases[0].agent007;
    let intelHealth = null;
    let agent007Parity = null;

    for (let i = 0; i < bases.length; i++) {
      const h = await probe(bases[i].intel, '/health');
      if (h && h.ok !== false) {
        intel = bases[i].intel;
        intelHealth = h;
        break;
      }
    }

    const agent007Candidates = [];
    bases.forEach(function (b) {
      if (agent007Candidates.indexOf(b.agent007) === -1) agent007Candidates.push(b.agent007);
    });
    if (agent007Candidates.indexOf('http://127.0.0.1:3333') === -1) agent007Candidates.push('http://127.0.0.1:3333');

    for (let j = 0; j < agent007Candidates.length; j++) {
      const p = await probe(agent007Candidates[j], '/api/agent007/codex-parity/status');
      if (p && p.ok) {
        agent007 = agent007Candidates[j];
        agent007Parity = p;
        break;
      }
      const stats = await probe(agent007Candidates[j], '/api/stats');
      if (stats) {
        agent007 = agent007Candidates[j];
        break;
      }
    }

    return {
      intel: intel,
      agent007: agent007,
      intelHealth: intelHealth,
      agent007Parity: agent007Parity,
      storeOrigin: location.origin
    };
  }

  global.GoatBridge = { resolve: resolve, probe: probe, candidateBases: candidateBases };
})(typeof window !== 'undefined' ? window : global);