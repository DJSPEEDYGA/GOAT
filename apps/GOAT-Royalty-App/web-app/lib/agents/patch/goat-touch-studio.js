/**
 * GOAT Touch Studio — reusable touch controls for any GOAT launcher.
 *
 * Provides: knobs, faders, XY pad, drum pads, toggles.
 * All controls are touch/mouse draggable and emit normalized values.
 *
 * Usage:
 *   const studio = GoatTouchStudio.create(document.getElementById('studio'), {
 *     onChange: (id, value) => console.log(id, value)
 *   });
 *   studio.addKnob('gain', { label: 'Gain', value: 60, min: 0, max: 100 });
 *   studio.addFader('master', { label: 'Master', value: 90 });
 *   studio.addXYPad('filter', { label: 'Filter / Reso' });
 *   studio.addPads('drums', { labels: ['Kick','Snare','Hat','Clap'] });
 */

(function (global) {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function toPercent(v, min, max) { return ((v - min) / (max - min)) * 100; }
  function fromPercent(p, min, max) { return min + (p / 100) * (max - min); }

  class TouchStudio {
    constructor(container, options = {}) {
      this.container = container;
      this.options = options;
      this.controls = {};
      this.onChange = options.onChange || (() => {});
      this.onTap = options.onTap || (() => {});
      this.theme = options.theme || {};
      this.render();
    }

    render() {
      this.el = document.createElement('div');
      this.el.className = 'goat-touch-studio';
      this.el.style.cssText = `
        display:grid; grid-template-columns:repeat(auto-fit, minmax(90px, 1fr)); gap:14px;
        padding:16px; background:rgba(5,10,20,0.95); border:1px solid rgba(212,160,60,0.2);
        border-radius:18px; user-select:none; touch-action:none;
      `;
      this.container.appendChild(this.el);
    }

    _wrap() {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex; flex-direction:column; align-items:center; gap:8px; min-width:80px;';
      return wrap;
    }

    _label(text) {
      const label = document.createElement('div');
      label.textContent = text;
      label.style.cssText = 'font-size:11px; color:#8a8070; text-transform:uppercase; letter-spacing:.5px; text-align:center;';
      return label;
    }

    _value() {
      const val = document.createElement('div');
      val.style.cssText = 'font-size:12px; color:#f0c040; font-family:"JetBrains Mono",monospace; min-height:16px;';
      return val;
    }

    addKnob(id, opts = {}) {
      const labelText = opts.label || id;
      const min = opts.min ?? 0;
      const max = opts.max ?? 100;
      let value = clamp(opts.value ?? 50, min, max);
      const size = opts.size || 70;
      const stroke = 8;
      const radius = (size - stroke) / 2;
      const circumference = 2 * Math.PI * radius;
      const startOffset = circumference * 0.25;

      const wrap = this._wrap();
      const svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('width', size);
      svg.setAttribute('height', size);
      svg.style.cursor = 'ns-resize';

      const track = document.createElementNS(SVG_NS, 'circle');
      track.setAttribute('cx', size / 2);
      track.setAttribute('cy', size / 2);
      track.setAttribute('r', radius);
      track.setAttribute('fill', 'none');
      track.setAttribute('stroke', 'rgba(255,255,255,0.08)');
      track.setAttribute('stroke-width', stroke);
      track.setAttribute('stroke-dasharray', `${circumference * 0.75} ${circumference}`);
      track.setAttribute('stroke-dashoffset', -startOffset);
      track.setAttribute('transform', `rotate(135 ${size / 2} ${size / 2})`);

      const arc = document.createElementNS(SVG_NS, 'circle');
      arc.setAttribute('cx', size / 2);
      arc.setAttribute('cy', size / 2);
      arc.setAttribute('r', radius);
      arc.setAttribute('fill', 'none');
      arc.setAttribute('stroke', '#d4a03c');
      arc.setAttribute('stroke-width', stroke);
      arc.setAttribute('stroke-linecap', 'round');
      arc.setAttribute('stroke-dasharray', `${circumference * 0.75} ${circumference}`);
      arc.setAttribute('stroke-dashoffset', -startOffset);
      arc.setAttribute('transform', `rotate(135 ${size / 2} ${size / 2})`);

      const dot = document.createElementNS(SVG_NS, 'circle');
      dot.setAttribute('r', 4);
      dot.setAttribute('fill', '#f0c040');

      svg.appendChild(track);
      svg.appendChild(arc);
      svg.appendChild(dot);

      const valueEl = this._value();
      const labelEl = this._label(labelText);
      wrap.appendChild(valueEl);
      wrap.appendChild(svg);
      wrap.appendChild(labelEl);
      this.el.appendChild(wrap);

      const update = (newVal) => {
        value = clamp(newVal, min, max);
        const pct = toPercent(value, min, max);
        const dash = (pct / 100) * circumference * 0.75;
        arc.setAttribute('stroke-dasharray', `${dash} ${circumference}`);
        const angle = 135 + (pct / 100) * 270;
        const rad = (angle * Math.PI) / 180;
        dot.setAttribute('cx', size / 2 + radius * Math.cos(rad));
        dot.setAttribute('cy', size / 2 + radius * Math.sin(rad));
        valueEl.textContent = Math.round(value);
        this.onChange(id, value, 'knob');
      };

      let startY, startVal;
      const begin = (y) => { startY = y; startVal = value; };
      const move = (y) => {
        const delta = (startY - y) / 2;
        const pct = toPercent(startVal, min, max) + delta;
        update(fromPercent(pct, min, max));
      };

      svg.addEventListener('mousedown', (e) => { begin(e.clientY); e.preventDefault(); });
      svg.addEventListener('touchstart', (e) => { begin(e.touches[0].clientY); e.preventDefault(); }, { passive: false });
      window.addEventListener('mousemove', (e) => { if (e.buttons === 1) move(e.clientY); });
      window.addEventListener('touchmove', (e) => { if (e.touches.length) move(e.touches[0].clientY); }, { passive: false });

      update(value);
      this.controls[id] = { get: () => value, set: update, type: 'knob' };
      return this.controls[id];
    }

    addFader(id, opts = {}) {
      const labelText = opts.label || id;
      const min = opts.min ?? 0;
      const max = opts.max ?? 100;
      let value = clamp(opts.value ?? 70, min, max);
      const width = 44;
      const height = 110;

      const wrap = this._wrap();
      const track = document.createElement('div');
      track.style.cssText = `width:${width}px;height:${height}px;background:rgba(255,255,255,0.06);border-radius:8px;position:relative;overflow:hidden;cursor:ns-resize;`;
      const cap = document.createElement('div');
      cap.style.cssText = `position:absolute;left:2px;right:2px;height:22px;background:linear-gradient(135deg,#d4a03c,#f0c040);border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.5);`;
      track.appendChild(cap);

      const valueEl = this._value();
      const labelEl = this._label(labelText);
      wrap.appendChild(valueEl);
      wrap.appendChild(track);
      wrap.appendChild(labelEl);
      this.el.appendChild(wrap);

      const update = (newVal) => {
        value = clamp(newVal, min, max);
        const pct = toPercent(value, min, max);
        cap.style.bottom = `${pct}%`;
        valueEl.textContent = Math.round(value);
        this.onChange(id, value, 'fader');
      };

      let startY, startVal;
      const begin = (y) => { startY = y; startVal = value; };
      const move = (y) => {
        const delta = ((startY - y) / height) * 100;
        update(fromPercent(toPercent(startVal, min, max) + delta, min, max));
      };

      track.addEventListener('mousedown', (e) => { begin(e.clientY); e.preventDefault(); });
      track.addEventListener('touchstart', (e) => { begin(e.touches[0].clientY); e.preventDefault(); }, { passive: false });
      window.addEventListener('mousemove', (e) => { if (e.buttons === 1) move(e.clientY); });
      window.addEventListener('touchmove', (e) => { if (e.touches.length) move(e.touches[0].clientY); }, { passive: false });

      update(value);
      this.controls[id] = { get: () => value, set: update, type: 'fader' };
      return this.controls[id];
    }

    addXYPad(id, opts = {}) {
      const labelText = opts.label || id;
      const size = opts.size || 140;
      let x = clamp(opts.x ?? 50, 0, 100);
      let y = clamp(opts.y ?? 50, 0, 100);

      const wrap = this._wrap();
      wrap.style.gridColumn = 'span 2';
      const pad = document.createElement('div');
      pad.style.cssText = `width:${size}px;height:${size}px;background:rgba(255,255,255,0.05);border:1px solid rgba(212,160,60,0.25);border-radius:12px;position:relative;cursor:crosshair;`;
      const puck = document.createElement('div');
      puck.style.cssText = 'position:absolute;width:16px;height:16px;background:#f0c040;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 12px rgba(240,192,64,0.5);';
      pad.appendChild(puck);

      const valueEl = this._value();
      const labelEl = this._label(labelText);
      wrap.appendChild(valueEl);
      wrap.appendChild(pad);
      wrap.appendChild(labelEl);
      this.el.appendChild(wrap);

      const update = (nx, ny) => {
        x = clamp(nx, 0, 100);
        y = clamp(ny, 0, 100);
        puck.style.left = `${x}%`;
        puck.style.top = `${100 - y}%`;
        valueEl.textContent = `X:${Math.round(x)} Y:${Math.round(y)}`;
        this.onChange(id, { x, y }, 'xy');
      };

      let dragging = false;
      const move = (clientX, clientY) => {
        const rect = pad.getBoundingClientRect();
        const nx = ((clientX - rect.left) / rect.width) * 100;
        const ny = 100 - ((clientY - rect.top) / rect.height) * 100;
        update(nx, ny);
      };

      pad.addEventListener('mousedown', (e) => { dragging = true; move(e.clientX, e.clientY); e.preventDefault(); });
      pad.addEventListener('touchstart', (e) => { dragging = true; move(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); }, { passive: false });
      window.addEventListener('mousemove', (e) => { if (dragging) move(e.clientX, e.clientY); });
      window.addEventListener('touchmove', (e) => { if (dragging && e.touches.length) move(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
      window.addEventListener('mouseup', () => dragging = false);
      window.addEventListener('touchend', () => dragging = false);

      update(x, y);
      this.controls[id] = { get: () => ({ x, y }), set: update, type: 'xy' };
      return this.controls[id];
    }

    addPads(id, opts = {}) {
      const labels = opts.labels || ['1', '2', '3', '4'];
      const cols = opts.cols || 4;
      const labelText = opts.label || id;

      const wrap = this._wrap();
      wrap.style.gridColumn = 'span 2';
      const grid = document.createElement('div');
      grid.style.cssText = `display:grid;grid-template-columns:repeat(${cols}, 1fr);gap:8px;width:100%;`;
      labels.forEach((text, i) => {
        const pad = document.createElement('button');
        pad.textContent = text;
        pad.style.cssText = 'aspect-ratio:1;padding:8px;border:1px solid rgba(212,160,60,0.3);border-radius:10px;background:rgba(212,160,60,0.08);color:#f0ece4;font-size:11px;font-weight:700;cursor:pointer;transition:all .1s;';
        pad.addEventListener('mousedown', () => {
          pad.style.background = '#f0c040';
          pad.style.color = '#030609';
          this.onTap(id, { index: i, label: text });
          setTimeout(() => {
            pad.style.background = 'rgba(212,160,60,0.08)';
            pad.style.color = '#f0ece4';
          }, 120);
        });
        grid.appendChild(pad);
      });

      const labelEl = this._label(labelText);
      wrap.appendChild(grid);
      wrap.appendChild(labelEl);
      this.el.appendChild(wrap);
      this.controls[id] = { type: 'pads' };
      return this.controls[id];
    }

    addToggle(id, opts = {}) {
      const labelText = opts.label || id;
      let value = !!opts.value;
      const wrap = this._wrap();
      const btn = document.createElement('button');
      btn.style.cssText = `width:52px;height:28px;border-radius:14px;border:1px solid rgba(212,160,60,0.4);background:${value ? '#d4a03c' : 'rgba(255,255,255,0.08)'};color:${value ? '#030609' : '#8a8070'};font-weight:700;cursor:pointer;transition:all .2s;`;
      btn.textContent = value ? 'ON' : 'OFF';
      const labelEl = this._label(labelText);
      wrap.appendChild(btn);
      wrap.appendChild(labelEl);
      this.el.appendChild(wrap);

      const update = (newVal) => {
        value = !!newVal;
        btn.style.background = value ? '#d4a03c' : 'rgba(255,255,255,0.08)';
        btn.style.color = value ? '#030609' : '#8a8070';
        btn.textContent = value ? 'ON' : 'OFF';
        this.onChange(id, value, 'toggle');
      };
      btn.addEventListener('click', () => update(!value));
      this.controls[id] = { get: () => value, set: update, type: 'toggle' };
      return this.controls[id];
    }
  }

  const GoatTouchStudio = {
    create(container, options) {
      return new TouchStudio(container, options);
    }
  };

  global.GoatTouchStudio = GoatTouchStudio;
})(typeof window !== 'undefined' ? window : globalThis);
