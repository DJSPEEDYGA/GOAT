/**
 * GOAT Generative UI — render agent UI blocks as live cards.
 *
 * Agents can emit JSON blocks like:
 *   {
 *     "type": "ui",
 *     "layout": "card|studio|form|stats",
 *     "title": "Master Mix",
 *     "items": [
 *       { "type": "knob", "id": "gain", "label": "Gain", "value": 60 },
 *       { "type": "fader", "id": "master", "label": "Master", "value": 90 },
 *       { "type": "stat", "label": "Streams", "value": "1.2M" }
 *     ]
 *   }
 *
 * This module turns those blocks into interactive DOM elements and
 * forwards user interactions back through the supplied callback.
 */

(function (global) {
  'use strict';

  const DEFAULT_THEME = {
    bg: 'rgba(13,20,32,0.85)',
    border: 'rgba(212,160,60,0.2)',
    gold: '#d4a03c',
    goldLight: '#f0c040',
    text: '#f0ece4',
    muted: '#8a8070',
    red: '#e74c3c',
    green: '#2ecc71',
    blue: '#3498db',
  };

  function renderCard(block, theme, onAction) {
    const card = document.createElement('div');
    card.className = 'goat-gen-ui-card';
    card.style.cssText = `
      background:${theme.bg}; border:1px solid ${theme.border}; border-radius:16px;
      padding:16px; margin:8px 0; font-family:'Inter',sans-serif; color:${theme.text};
      box-shadow:0 4px 24px rgba(0,0,0,0.35); max-width:420px;
    `;

    if (block.title) {
      const title = document.createElement('div');
      title.textContent = block.title;
      title.style.cssText = `font-size:15px; font-weight:800; color:${theme.goldLight}; margin-bottom:12px; display:flex; align-items:center; gap:8px;`;
      if (block.icon) title.prepend(block.icon);
      card.appendChild(title);
    }

    if (block.subtitle) {
      const sub = document.createElement('div');
      sub.textContent = block.subtitle;
      sub.style.cssText = `font-size:12px; color:${theme.muted}; margin-bottom:14px;`;
      card.appendChild(sub);
    }

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fit, minmax(70px, 1fr)); gap:12px;';

    (block.items || []).forEach(item => {
      grid.appendChild(renderItem(item, theme, onAction, block.title));
    });

    card.appendChild(grid);
    return card;
  }

  function renderItem(item, theme, onAction, context) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex; flex-direction:column; align-items:center; gap:6px; min-width:70px;';

    const label = document.createElement('div');
    label.textContent = item.label || item.id || '';
    label.style.cssText = `font-size:10px; color:${theme.muted}; text-transform:uppercase; letter-spacing:.5px; text-align:center;`;

    const value = document.createElement('div');
    value.style.cssText = `font-size:18px; font-weight:800; color:${theme.goldLight}; font-family:'JetBrains Mono',monospace;`;

    if (item.type === 'stat') {
      value.textContent = item.value ?? '—';
      wrap.appendChild(value);
      wrap.appendChild(label);
    } else if (item.type === 'knob') {
      value.textContent = item.value ?? 0;
      const svg = makeKnobSVG(item.value || 0, theme.gold);
      svg.style.cursor = 'pointer';
      svg.addEventListener('click', () => onAction({ action: 'tap', id: item.id, type: 'knob', value: item.value, context }));
      wrap.appendChild(value);
      wrap.appendChild(svg);
      wrap.appendChild(label);
    } else if (item.type === 'fader') {
      value.textContent = item.value ?? 0;
      const bar = makeFaderBar(item.value || 0, theme.gold);
      wrap.appendChild(value);
      wrap.appendChild(bar);
      wrap.appendChild(label);
    } else if (item.type === 'button') {
      const btn = document.createElement('button');
      btn.textContent = item.label || item.id;
      btn.style.cssText = `
        width:100%; padding:10px; border-radius:10px; border:1px solid ${theme.gold};
        background:transparent; color:${theme.gold}; font-weight:700; cursor:pointer; font-size:12px;
      `;
      btn.addEventListener('click', () => onAction({ action: 'tap', id: item.id, type: 'button', context }));
      wrap.appendChild(btn);
    } else if (item.type === 'badge') {
      const badge = document.createElement('div');
      badge.textContent = item.value ?? item.label;
      badge.style.cssText = `
        padding:4px 10px; border-radius:12px; font-size:11px; font-weight:700;
        background:${item.color ? hexToRgba(item.color, 0.15) : 'rgba(212,160,60,0.15)'};
        color:${item.color || theme.gold}; border:1px solid ${item.color || theme.gold};
      `;
      wrap.appendChild(badge);
      wrap.appendChild(label);
    } else if (item.type === 'toggle') {
      const btn = document.createElement('button');
      const on = !!item.value;
      btn.textContent = on ? 'ON' : 'OFF';
      btn.style.cssText = `
        width:52px; height:28px; border-radius:14px; border:1px solid ${theme.gold};
        background:${on ? theme.gold : 'transparent'}; color:${on ? '#030609' : theme.gold};
        font-weight:700; cursor:pointer; font-size:12px;
      `;
      btn.addEventListener('click', () => onAction({ action: 'toggle', id: item.id, value: !on, context }));
      wrap.appendChild(btn);
      wrap.appendChild(label);
    } else {
      value.textContent = item.value ?? '—';
      wrap.appendChild(value);
      wrap.appendChild(label);
    }
    return wrap;
  }

  function makeKnobSVG(value, color) {
    const size = 50, stroke = 6, r = (size - stroke) / 2, c = 2 * Math.PI * r;
    const dash = (value / 100) * c * 0.75;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.innerHTML = `
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="${stroke}" stroke-dasharray="${c*0.75} ${c}" stroke-dashoffset="${-c*0.25}" transform="rotate(135 ${size/2} ${size/2})"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${dash} ${c}" stroke-dashoffset="${-c*0.25}" transform="rotate(135 ${size/2} ${size/2})"/>
    `;
    return svg;
  }

  function makeFaderBar(value, color) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'width:28px;height:60px;background:rgba(255,255,255,0.06);border-radius:6px;position:relative;overflow:hidden;';
    const fill = document.createElement('div');
    fill.style.cssText = `position:absolute;bottom:0;left:0;right:0;height:${value}%;background:${color};border-radius:6px;`;
    wrap.appendChild(fill);
    return wrap;
  }

  function hexToRgba(hex, alpha) {
    const v = hex.replace('#', '');
    const r = parseInt(v.substring(0, 2), 16);
    const g = parseInt(v.substring(2, 4), 16);
    const b = parseInt(v.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function render(blocks, container, options = {}) {
    const theme = { ...DEFAULT_THEME, ...(options.theme || {}) };
    const onAction = options.onAction || (() => {});
    container.innerHTML = '';
    blocks.forEach(block => {
      if (block.type === 'ui' || block.layout) {
        container.appendChild(renderCard(block, theme, onAction));
      } else if (block.type === 'text') {
        const p = document.createElement('div');
        p.textContent = block.content || block.text || '';
        p.style.cssText = `color:${theme.text}; font-size:14px; line-height:1.5; margin:8px 0;`;
        container.appendChild(p);
      }
    });
  }

  function renderMessage(message, container, options) {
    let blocks = [];
    try {
      const parsed = JSON.parse(message);
      blocks = Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      blocks = [{ type: 'text', content: message }];
    }
    render(blocks, container, options);
  }

  global.GoatGenerativeUI = { render, renderMessage, renderCard };
})(typeof window !== 'undefined' ? window : globalThis);
