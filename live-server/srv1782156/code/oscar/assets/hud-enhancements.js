/* GOAT Force HUD enhancements — mission control sci-fi effects */
(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function create(cls, tag = 'div') {
    const el = document.createElement(tag);
    el.className = cls;
    return el;
  }

  // Boot sequence overlay
  function bootSequence() {
    if (document.querySelector('.login-view')) return; // skip boot on login pages
    const overlay = create('hud-boot-overlay');
    overlay.innerHTML = `
      <div class="hud-boot-title">GOAT FORCE // BOOT</div>
      <div class="hud-boot-line" id="hud-boot-text">Initializing kernel...</div>
      <div class="hud-boot-line" style="margin-top:18px"><span class="hud-boot-cursor"></span></div>
    `;
    document.body.appendChild(overlay);
    const lines = [
      'Initializing kernel...',
      'Loading tactical modules...',
      'Handshaking with AI command...',
      'Acquiring satellite telemetry...',
      'Mission Control online.'
    ];
    const text = $('#hud-boot-text');
    let i = 0;
    const tick = setInterval(() => {
      if (i < lines.length) {
        text.textContent = lines[i];
        i++;
      } else {
        clearInterval(tick);
        setTimeout(() => overlay.classList.add('hidden'), 600);
        setTimeout(() => overlay.remove(), 1600);
      }
    }, 420);
  }

  // Scanlines and vignette
  function addAmbientOverlays() {
    const scan = create('hud-scanlines');
    const vignette = create('hud-vignette');
    document.body.appendChild(scan);
    document.body.appendChild(vignette);
  }

  // Rotating HUD rings around radar
  function addRadarRings() {
    const radarWrap = $('.radar-wrap');
    if (!radarWrap) return;
    const wrap = create('hud-ring-wrap');
    for (let i = 0; i < 3; i++) {
      const ring = create('hud-ring');
      const size = 160 + i * 60;
      ring.style.width = size + 'px';
      ring.style.height = size + 'px';
      wrap.appendChild(ring);
    }
    radarWrap.appendChild(wrap);
  }

  // Data stream panel
  function addDataStream() {
    const stage = $('.center-stage');
    if (!stage) return;
    const panel = create('panel hud-shimmer');
    panel.style.gridColumn = '1 / -1';
    panel.style.position = 'relative';
    panel.innerHTML = '<div class="panel-title">Live Data Stream <span class="id">STREAM-01</span></div><div class="hud-data-stream"><span id="hud-stream-text"></span></div>';
    addCornerBrackets(panel);
    stage.insertBefore(panel, stage.firstChild);
    const stream = $('#hud-stream-text');
    if (stream) {
      const words = ['0x7A3F', 'NEXUS', 'MONOPOLY', 'CASH', 'CRYPTO', 'VIP', 'TACTICAL', 'GOAT', '00:42:19', 'SYS.OK', ' uplink ', ' downlink ', ' encrypted ', ' handshake '];
      function update() {
        const chunks = [];
        for (let i = 0; i < 40; i++) chunks.push(words[Math.floor(Math.random() * words.length)]);
        stream.textContent = chunks.join('   ') + '   ';
      }
      update();
      setInterval(update, 2000);
    }
  }

  // Corner brackets on panels
  function addCornerBrackets(panel) {
    ['tl', 'tr', 'bl', 'br'].forEach(pos => {
      const b = create('hud-corner-bracket ' + pos);
      panel.appendChild(b);
    });
  }

  function bracketAllPanels() {
    $$('.panel, .kpi').forEach(el => addCornerBrackets(el));
  }

  // Holographic shimmer on KPI grid updates
  function shimmerKPIs() {
    $$('.kpi').forEach(kpi => {
      kpi.addEventListener('mouseenter', () => kpi.classList.add('hud-shimmer'));
      kpi.addEventListener('mouseleave', () => kpi.classList.remove('hud-shimmer'));
    });
  }

  // Terminal styling for AI console
  function terminalStyling() {
    const aiBox = $('.ai-box');
    if (aiBox) aiBox.classList.add('hud-terminal');
  }

  // Glowing title
  function glowTitle() {
    const brand = $('.brand');
    if (brand) {
      const h = brand.querySelector('h1') || brand;
      h && h.classList.add('hud-neon-gold');
    }
  }

  // Satellite arcs on tactical map canvas
  function enhanceTacMap() {
    const map = document.getElementById('tacMap');
    if (!map || typeof drawTacMap === 'undefined') return;
    const original = drawTacMap;
    window.drawTacMap = function () {
      original();
      const c = map.getContext('2d');
      const w = map.width, h = map.height, t = Date.now() / 2000;
      c.strokeStyle = 'rgba(0, 234, 255, 0.08)';
      c.lineWidth = 1;
      c.beginPath();
      c.arc(w * 0.32, h * 0.42, 40 + Math.sin(t) * 15, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.arc(w * 0.66, h * 0.58, 30 + Math.cos(t) * 12, 0, Math.PI * 2);
      c.stroke();
      requestAnimationFrame(drawTacMap);
    };
  }

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    bootSequence();
    addAmbientOverlays();
    addRadarRings();
    addDataStream();
    bracketAllPanels();
    shimmerKPIs();
    terminalStyling();
    glowTitle();
    // Wait a moment for original scripts to define drawTacMap
    setTimeout(enhanceTacMap, 1000);
  }

  init();
})();

/* BrickGrade Exchange — server-verified authenticated ERP module loader */
(function loadBrickGradeCommand() {
  'use strict';

  const build = '20260829-3';
  const retryDelays = [750, 1500, 3000, 6000];
  let state = 'idle';
  let observer;
  let retryCount = 0;
  let retryTimer = 0;
  let attemptToken = 0;

  function shellIsAuthenticated() {
    const login = document.getElementById('login-view');
    const app = document.getElementById('app-view');
    return Boolean(
      document.body?.classList.contains('erp-authenticated') &&
      app?.classList.contains('active') &&
      login && getComputedStyle(login).display === 'none'
    );
  }

  async function deriveStorageScope(user) {
    const identity = String(user?.id ?? user?.email ?? '').trim().toLowerCase();
    if (!identity || !window.crypto?.subtle || typeof TextEncoder === 'undefined') return '';
    const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(identity));
    return Array.from(new Uint8Array(digest).slice(0, 12), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  function clearRetry() {
    window.clearTimeout(retryTimer);
    retryTimer = 0;
  }

  function removeAttempt(stylesheet, module) {
    stylesheet?.remove();
    module?.remove();
  }

  function removePendingAssets() {
    document.querySelectorAll('[data-brickgrade-command="styles"], [data-brickgrade-command="module"]').forEach((asset) => asset.remove());
  }

  function scheduleRetry(stylesheet, module) {
    attemptToken += 1;
    removeAttempt(stylesheet, module);
    clearRetry();

    if (!shellIsAuthenticated()) {
      retryCount = 0;
      state = 'idle';
      return;
    }
    if (retryCount >= retryDelays.length) {
      state = 'exhausted';
      return;
    }

    const delay = retryDelays[retryCount];
    retryCount += 1;
    state = 'waiting';
    retryTimer = window.setTimeout(() => {
      retryTimer = 0;
      if (!shellIsAuthenticated()) {
        retryCount = 0;
        state = 'idle';
        return;
      }
      state = 'idle';
      loadBrickGrade();
    }, delay);
  }

  async function loadBrickGrade() {
    if (state !== 'idle' || !shellIsAuthenticated()) return;
    state = 'checking';
    const token = ++attemptToken;

    try {
      const response = await fetch('/api/me', {
        credentials: 'include',
        cache: 'no-store',
        headers: { Accept: 'application/json' }
      });
      if (token !== attemptToken) return;
      const data = await response.json().catch(() => null);
      if (token !== attemptToken) return;

      if (!response.ok || !data?.ok || !shellIsAuthenticated()) {
        scheduleRetry();
        return;
      }

      const storageScope = await deriveStorageScope(data.user).catch(() => '');
      if (token !== attemptToken) return;
      if (!shellIsAuthenticated()) {
        scheduleRetry();
        return;
      }
      window.__brickGradeSessionScope = storageScope;
      if (window.BrickGradeERP?.setSessionScope) {
        window.BrickGradeERP.setSessionScope(storageScope);
        clearRetry();
        retryCount = 0;
        state = 'loaded';
        return;
      }
      state = 'loading';
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = `/assets/brickgrade-erp.css?v=${build}`;
      stylesheet.dataset.brickgradeCommand = 'styles';
      stylesheet.onload = () => {
        if (token !== attemptToken) {
          stylesheet.remove();
          return;
        }
        if (!shellIsAuthenticated()) {
          scheduleRetry(stylesheet);
          return;
        }

        const module = document.createElement('script');
        module.src = `/assets/brickgrade-erp.js?v=${build}`;
        module.async = false;
        module.dataset.brickgradeCommand = 'module';
        module.onload = () => {
          if (token !== attemptToken) {
            removeAttempt(stylesheet, module);
            return;
          }
          clearRetry();
          retryCount = 0;
          state = 'loaded';
        };
        module.onerror = () => {
          if (token === attemptToken) scheduleRetry(stylesheet, module);
          else removeAttempt(stylesheet, module);
        };
        document.head.appendChild(module);
      };
      stylesheet.onerror = () => {
        if (token === attemptToken) scheduleRetry(stylesheet);
        else stylesheet.remove();
      };
      document.head.appendChild(stylesheet);
    } catch {
      if (token === attemptToken) scheduleRetry();
    }
  }

  function reconcile() {
    if (!shellIsAuthenticated()) {
      attemptToken += 1;
      clearRetry();
      retryCount = 0;
      window.__brickGradeSessionScope = '';
      window.BrickGradeERP?.setSessionScope('');
      if (!window.BrickGradeERP) removePendingAssets();
      state = 'idle';
      return;
    }
    loadBrickGrade();
  }

  function start() {
    observer = new MutationObserver(reconcile);
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class', 'style']
    });
    reconcile();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
