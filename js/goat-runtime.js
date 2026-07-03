(function(global) {
  'use strict';

  const runtime = global.GOATRuntime || {};
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(global.location.hostname);
  const apiBase = runtime.apiBase || (isLocal ? global.location.origin : '');

  async function request(path, options) {
    const url = path.startsWith('http') ? path : apiBase + path;
    const headers = Object.assign(
      { 'Content-Type': 'application/json' },
      options && options.headers ? options.headers : {}
    );
    const response = await fetch(url, Object.assign({}, options, { headers }));
    const type = response.headers.get('content-type') || '';
    const body = type.includes('application/json') ? await response.json() : await response.text();
    if (!response.ok) {
      const message = body && body.error ? body.error : 'HTTP ' + response.status;
      throw new Error(message);
    }
    return body;
  }

  async function status() {
    try {
      if (!apiBase) return { ok: false, offline: true, message: 'Static browser mode' };
      return await request('/api/settings');
    } catch (error) {
      return { ok: false, offline: true, message: error.message };
    }
  }

  function save(key, value) {
    localStorage.setItem('goat.' + key, JSON.stringify(value));
    return value;
  }

  function load(key, fallback) {
    const raw = localStorage.getItem('goat.' + key);
    if (!raw) return fallback;
    try { return JSON.parse(raw); } catch (_) { return fallback; }
  }

  global.GOATRuntime = Object.assign(runtime, {
    apiBase,
    request,
    status,
    save,
    load,
    isLocal
  });
  global.goatRuntime = global.GOATRuntime;
  document.dispatchEvent(new CustomEvent('goat-runtime-ready', { detail: global.GOATRuntime }));
})(window);
