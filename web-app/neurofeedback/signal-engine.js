/*
 * TAHS Neurofeedback Signal Engine
 * Shared brain-signal source for all neurofeedback games.
 *
 * Modes:
 *  - "sim":    simulated EEG-derived calm/focus scores (random-walk with
 *              trainer dynamics: holding still & steady raises the score,
 *              like a real regulation session)
 *  - "manual": user-controlled slider (demo / instructor mode)
 *  - "lsl":    live device bridge — connects to a WebSocket relay
 *              (ws://localhost:8765) that forwards Lab Streaming Layer
 *              samples from Muse / OpenBCI as JSON {calm: 0-100, focus: 0-100}
 *
 * Games consume a single normalized signal:
 *    engine.on(sample => { sample.calm, sample.focus, sample.spike })
 */
(function (global) {
  'use strict';

  const SAMPLE_HZ = 10;

  class NeuroSignalEngine {
    constructor(opts = {}) {
      this.mode = opts.mode || 'sim';
      this.calm = 50;
      this.focus = 50;
      this.manualValue = 50;
      this.listeners = [];
      this.spikeUntil = 0;
      this.ws = null;
      this._simDrift = 0;
      this._timer = setInterval(() => this._tick(), 1000 / SAMPLE_HZ);
    }

    on(fn) { this.listeners.push(fn); }

    setMode(mode) {
      this.mode = mode;
      if (mode === 'lsl') this._connectLSL();
      else if (this.ws) { this.ws.close(); this.ws = null; }
    }

    setManual(v) { this.manualValue = Math.max(0, Math.min(100, v)); }

    /* Inject an artificial stress spike (used by demo buttons + sim). */
    triggerSpike(ms = 2500) { this.spikeUntil = Date.now() + ms; }

    _connectLSL() {
      try {
        this.ws = new WebSocket('ws://localhost:8765');
        this.ws.onmessage = (ev) => {
          try {
            const d = JSON.parse(ev.data);
            if (typeof d.calm === 'number') this.calm = d.calm;
            if (typeof d.focus === 'number') this.focus = d.focus;
          } catch (_) { /* ignore malformed samples */ }
        };
        this.ws.onerror = () => { this.setMode('sim'); };
      } catch (_) {
        this.setMode('sim');
      }
    }

    _tick() {
      const now = Date.now();
      const spiking = now < this.spikeUntil;

      if (this.mode === 'sim') {
        // Trainer dynamics: gentle upward pull (regulation practice works),
        // random drift, occasional spontaneous stress spikes.
        this._simDrift += (Math.random() - 0.5) * 6;
        this._simDrift *= 0.92;
        const pull = (62 - this.calm) * 0.02;
        this.calm += pull + this._simDrift * 0.25;
        this.focus += (this.calm - this.focus) * 0.08 + (Math.random() - 0.5) * 4;
        if (Math.random() < 0.004) this.triggerSpike();
      } else if (this.mode === 'manual') {
        this.calm += (this.manualValue - this.calm) * 0.15;
        this.focus += (this.manualValue - this.focus) * 0.15;
      }
      // 'lsl' mode: values updated by websocket messages.

      if (spiking) {
        this.calm -= 4.5;
        this.focus -= 4.5;
      }

      this.calm = Math.max(0, Math.min(100, this.calm));
      this.focus = Math.max(0, Math.min(100, this.focus));

      const sample = {
        t: now,
        calm: this.calm,
        focus: this.focus,
        spike: spiking,
      };
      this.listeners.forEach(fn => fn(sample));
    }
  }

  /*
   * Focus-streak scoreboard (shared across games via localStorage).
   * A streak is continuous time holding the trained metric >= STREAK_THRESHOLD
   * without a stress spike. Best streaks per player+game are kept and shown
   * on the hub scoreboard.
   */
  const STREAK_THRESHOLD = 70;
  const BOARD_KEY = 'nf-scoreboard';
  const PLAYER_KEY = 'nf-player';

  function getPlayer() {
    return localStorage.getItem(PLAYER_KEY) || 'Player';
  }

  function loadBoard() {
    try { return JSON.parse(localStorage.getItem(BOARD_KEY)) || []; }
    catch (_) { return []; }
  }

  function recordStreak(game, metric, seconds) {
    if (seconds < 1) return;
    const player = getPlayer();
    const board = loadBoard();
    const i = board.findIndex(e => e.player === player && e.game === game);
    if (i >= 0) {
      if (seconds <= board[i].seconds) return;
      board[i].seconds = seconds;
      board[i].date = Date.now();
    } else {
      board.push({ player, game, metric, seconds, date: Date.now() });
    }
    board.sort((a, b) => b.seconds - a.seconds);
    localStorage.setItem(BOARD_KEY, JSON.stringify(board.slice(0, 50)));
  }

  /*
   * Reward-sound layer (classic neurofeedback audio feedback):
   * a soft harmonic pad sustains while the trained metric holds above
   * threshold, with a gentle bell every couple of seconds — so the brain
   * gets rewarded even with eyes closed. Silence (plus a low thump on a
   * stress spike) signals losing the state.
   */
  function createRewardSound() {
    let ctx = null, pad = null, padGain = null, muted = false, lastBell = 0;
    function ensure() {
      if (ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      padGain = ctx.createGain(); padGain.gain.value = 0; padGain.connect(ctx.destination);
      pad = [220, 277.18, 329.63].map((f, i) => {   // A3 major triad
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const g = ctx.createGain(); g.gain.value = i === 0 ? 0.5 : 0.28;
        o.connect(g); g.connect(padGain); o.start();
        return o;
      });
    }
    document.addEventListener('pointerdown', () => { ensure(); if (ctx && ctx.state === 'suspended') ctx.resume(); }, { capture: true });
    function bell(f) {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.4);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + 1.5);
    }
    return {
      update(v, spike) {
        if (!ctx || muted || ctx.state !== 'running') return;
        const inState = v >= STREAK_THRESHOLD && !spike;
        const target = inState ? 0.02 + ((v - STREAK_THRESHOLD) / (100 - STREAK_THRESHOLD)) * 0.05 : 0;
        padGain.gain.setTargetAtTime(target, ctx.currentTime, 0.4);
        const now = Date.now();
        if (inState && now - lastBell > 2600) { lastBell = now; bell(880 + (v - 70) * 8); }
        if (spike && now - lastBell > 1500) {  // low thump marks the spike
          lastBell = now;
          const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 90;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.15, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
          o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.55);
        }
      },
      setMuted(m) { muted = m; if (muted && padGain && ctx) padGain.gain.setTargetAtTime(0, ctx.currentTime, 0.1); },
      get muted() { return muted; },
    };
  }

  /*
   * Standard control widget every game embeds: mode selector,
   * manual slider, spike button, a live signal bar, and a focus-streak
   * timer (longest continuous hold above threshold feeds the scoreboard).
   * Returns the engine it created.
   */
  function mountSignalPanel(container, opts = {}) {
    const engine = new NeuroSignalEngine(opts);
    const label = opts.metric === 'focus' ? 'FOCUS' : 'CALM';
    container.innerHTML = `
      <div class="nf-panel">
        <div class="nf-row">
          <span class="nf-title">🧠 SIGNAL</span>
          <select class="nf-mode">
            <option value="sim" selected>Simulated EEG</option>
            <option value="manual">Manual (slider)</option>
            <option value="lsl">Live Device (LSL bridge)</option>
          </select>
          <button class="nf-spike" title="Inject a stress spike">⚡ Stress Spike</button>
        </div>
        <div class="nf-row">
          <input class="nf-slider" type="range" min="0" max="100" value="50" disabled>
        </div>
        <div class="nf-row">
          <span class="nf-metric-label">${label}</span>
          <div class="nf-bar"><div class="nf-bar-fill"></div></div>
          <span class="nf-value">50</span>
        </div>
        <div class="nf-row">
          <span class="nf-metric-label">🏆 HOLD</span>
          <span class="nf-streak">0.0s</span>
          <span class="nf-best">best 0.0s</span>
          <button class="nf-player" title="Change player name">👤</button>
          <button class="nf-sound" title="Reward sounds on/off">🔊</button>
        </div>
      </div>`;

    const modeSel = container.querySelector('.nf-mode');
    const slider = container.querySelector('.nf-slider');
    const spikeBtn = container.querySelector('.nf-spike');
    const fill = container.querySelector('.nf-bar-fill');
    const value = container.querySelector('.nf-value');
    const streakEl = container.querySelector('.nf-streak');
    const bestEl = container.querySelector('.nf-best');
    const playerBtn = container.querySelector('.nf-player');
    const soundBtn = container.querySelector('.nf-sound');
    const reward = createRewardSound();
    if (localStorage.getItem('nf-sound') === 'off') { reward.setMuted(true); soundBtn.textContent = '🔇'; }
    soundBtn.addEventListener('click', () => {
      reward.setMuted(!reward.muted);
      soundBtn.textContent = reward.muted ? '🔇' : '🔊';
      localStorage.setItem('nf-sound', reward.muted ? 'off' : 'on');
    });

    modeSel.addEventListener('change', () => {
      engine.setMode(modeSel.value);
      slider.disabled = modeSel.value !== 'manual';
    });
    slider.addEventListener('input', () => engine.setManual(Number(slider.value)));
    spikeBtn.addEventListener('click', () => engine.triggerSpike());
    playerBtn.addEventListener('click', () => {
      const p = (prompt('Player name for the scoreboard:', localStorage.getItem(PLAYER_KEY) || '') || '').trim().slice(0, 20);
      if (p) localStorage.setItem(PLAYER_KEY, p);
    });

    const gameName = opts.game || document.title || 'Game';
    const metricKey = opts.metric === 'focus' ? 'focus' : 'calm';
    let streakStart = 0;
    let bestStreak = 0;

    engine.on((s) => {
      const v = opts.metric === 'focus' ? s.focus : s.calm;
      fill.style.width = v + '%';
      fill.style.background = s.spike ? '#ff4757'
        : v > 66 ? '#2ed573' : v > 33 ? '#ffa502' : '#ff6348';
      value.textContent = Math.round(v);
      reward.update(v, s.spike);

      // streak: continuous hold above threshold, broken by dips or spikes
      if (v >= STREAK_THRESHOLD && !s.spike) {
        if (!streakStart) streakStart = s.t;
        const cur = (s.t - streakStart) / 1000;
        streakEl.textContent = cur.toFixed(1) + 's';
        streakEl.style.color = '#2ed573';
        if (cur > bestStreak) {
          bestStreak = cur;
          bestEl.textContent = 'best ' + bestStreak.toFixed(1) + 's';
          recordStreak(gameName, metricKey, Number(bestStreak.toFixed(1)));
        }
      } else {
        streakStart = 0;
        streakEl.textContent = '0.0s';
        streakEl.style.color = '#9ca3af';
      }
    });

    return engine;
  }

  const NF_CSS = `
    .nf-panel{background:rgba(10,14,25,.88);border:1px solid rgba(255,215,0,.35);
      border-radius:12px;padding:10px 14px;font-family:'Segoe UI',system-ui,sans-serif;
      color:#eee;width:340px;backdrop-filter:blur(6px);}
    .nf-row{display:flex;align-items:center;gap:10px;margin:6px 0;}
    .nf-title{font-weight:900;color:#ffd700;letter-spacing:1px;font-size:12px;}
    .nf-mode{background:#111827;color:#eee;border:1px solid #444;border-radius:6px;padding:4px 6px;font-size:12px;flex:1;}
    .nf-spike{background:#7f1d1d;color:#fff;border:1px solid #b91c1c;border-radius:6px;
      padding:4px 8px;font-size:12px;cursor:pointer;}
    .nf-spike:hover{background:#b91c1c;}
    .nf-slider{width:100%;}
    .nf-metric-label{font-size:11px;font-weight:700;color:#9ca3af;width:44px;}
    .nf-bar{flex:1;height:10px;background:#1f2937;border-radius:5px;overflow:hidden;}
    .nf-bar-fill{height:100%;width:50%;background:#ffa502;transition:width .12s linear;}
    .nf-value{width:28px;text-align:right;font-weight:800;font-size:13px;}
    .nf-streak{font-weight:800;font-size:13px;color:#9ca3af;width:56px;}
    .nf-best{font-size:11px;color:#ffd700;font-weight:700;flex:1;}
    .nf-player{background:#1f2937;color:#eee;border:1px solid #444;border-radius:6px;
      padding:2px 8px;font-size:12px;cursor:pointer;}
    .nf-player:hover{border-color:#ffd700;}
    .nf-sound{background:#1f2937;color:#eee;border:1px solid #444;border-radius:6px;
      padding:2px 8px;font-size:12px;cursor:pointer;}
    .nf-sound:hover{border-color:#ffd700;}
  `;

  function injectStyles() {
    if (document.getElementById('nf-styles')) return;
    const s = document.createElement('style');
    s.id = 'nf-styles';
    s.textContent = NF_CSS;
    document.head.appendChild(s);
  }

  global.Neurofeedback = { NeuroSignalEngine, mountSignalPanel, injectStyles, loadBoard, recordStreak };
})(window);
