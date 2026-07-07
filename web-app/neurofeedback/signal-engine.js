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
   * Standard control widget every game embeds: mode selector,
   * manual slider, spike button, and a live signal bar.
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
      </div>`;

    const modeSel = container.querySelector('.nf-mode');
    const slider = container.querySelector('.nf-slider');
    const spikeBtn = container.querySelector('.nf-spike');
    const fill = container.querySelector('.nf-bar-fill');
    const value = container.querySelector('.nf-value');

    modeSel.addEventListener('change', () => {
      engine.setMode(modeSel.value);
      slider.disabled = modeSel.value !== 'manual';
    });
    slider.addEventListener('input', () => engine.setManual(Number(slider.value)));
    spikeBtn.addEventListener('click', () => engine.triggerSpike());

    engine.on((s) => {
      const v = opts.metric === 'focus' ? s.focus : s.calm;
      fill.style.width = v + '%';
      fill.style.background = s.spike ? '#ff4757'
        : v > 66 ? '#2ed573' : v > 33 ? '#ffa502' : '#ff6348';
      value.textContent = Math.round(v);
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
  `;

  function injectStyles() {
    if (document.getElementById('nf-styles')) return;
    const s = document.createElement('style');
    s.id = 'nf-styles';
    s.textContent = NF_CSS;
    document.head.appendChild(s);
  }

  global.Neurofeedback = { NeuroSignalEngine, mountSignalPanel, injectStyles };
})(window);
