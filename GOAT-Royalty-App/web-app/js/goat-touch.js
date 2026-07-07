/* 🐐 GOAT TOUCH — Shared touch interaction library
   Handles: haptics, multi-touch, fader dragging, XY pads, jog wheels, pad velocity,
   audio context, API routing, and offline-first state.
*/

(function(global){
  'use strict';

  // ============== API DETECTION ==============
  const API_HOSTS = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    window.location.origin.replace(':8090', ':5500'),
  ];

  let API_URL = localStorage.getItem('goat.apiUrl') || API_HOSTS[0];

  async function detectApi() {
    for (const host of API_HOSTS) {
      try {
        const r = await fetch(host + '/health', { signal: AbortSignal.timeout(1500) });
        if (r.ok) {
          API_URL = host;
          localStorage.setItem('goat.apiUrl', host);
          return host;
        }
      } catch(e) { /* next */ }
    }
    return null;
  }

  // ============== HAPTIC FEEDBACK ==============
  function haptic(kind = 'light') {
    // iOS Safari supports navigator.vibrate on Android only, but we layer it.
    if (!navigator.vibrate) return;
    const patterns = {
      light:  [8],
      medium: [15],
      heavy:  [30],
      double: [8, 40, 8],
      success:[8, 30, 12],
      error:  [30, 50, 30, 50, 30],
    };
    try { navigator.vibrate(patterns[kind] || patterns.light); } catch(e){}
  }

  // ============== AUDIO CONTEXT SINGLETON ==============
  let audioCtx = null;
  function getAudio() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch(e) { console.warn('AudioContext unavailable', e); return null; }
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  // ============== SIMPLE SYNTH / SAMPLE PLAYER ==============
  function playTone(freq, dur = 0.25, type = 'sine', gainLevel = 0.3) {
    const ac = getAudio(); if (!ac) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, ac.currentTime);
    g.gain.linearRampToValueAtTime(gainLevel, ac.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    o.connect(g); g.connect(ac.destination);
    o.start(); o.stop(ac.currentTime + dur);
  }

  function playDrum(kind = 'kick', velocity = 1.0) {
    const ac = getAudio(); if (!ac) return;
    const t = ac.currentTime;
    const g = ac.createGain();
    g.gain.value = velocity * 0.5;
    g.connect(ac.destination);

    if (kind === 'kick') {
      const o = ac.createOscillator();
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
      g.gain.setValueAtTime(velocity, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      o.connect(g); o.start(t); o.stop(t + 0.45);
    } else if (kind === 'snare') {
      const buf = ac.createBuffer(1, ac.sampleRate * 0.2, ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/d.length, 2);
      const n = ac.createBufferSource(); n.buffer = buf;
      const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2000;
      n.connect(bp); bp.connect(g); n.start(t);
    } else if (kind === 'hat') {
      const buf = ac.createBuffer(1, ac.sampleRate * 0.05, ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1);
      const n = ac.createBufferSource(); n.buffer = buf;
      const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000;
      n.connect(hp); hp.connect(g); n.start(t);
    } else if (kind === 'clap') {
      for (let i = 0; i < 3; i++) {
        const buf = ac.createBuffer(1, ac.sampleRate * 0.05, ac.sampleRate);
        const d = buf.getChannelData(0);
        for (let j = 0; j < d.length; j++) d[j] = (Math.random()*2-1) * Math.pow(1 - j/d.length, 3);
        const n = ac.createBufferSource(); n.buffer = buf;
        const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500;
        n.connect(bp); bp.connect(g); n.start(t + i * 0.015);
      }
    } else if (kind === '808') {
      const o = ac.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(55, t);
      o.frequency.exponentialRampToValueAtTime(30, t + 0.8);
      g.gain.setValueAtTime(velocity, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      o.connect(g); o.start(t); o.stop(t + 1.3);
    } else {
      // generic tonal
      playTone(220 + Math.random()*440, 0.15, 'triangle', velocity * 0.3);
    }
  }

  // ============== FADER DRAG HANDLER ==============
  function bindFader(trackEl, { min = 0, max = 100, value = 50, onChange, unit = '', fmt } = {}) {
    const fill  = trackEl.querySelector('.fader-fill');
    const thumb = trackEl.querySelector('.fader-thumb');
    const strip = trackEl.closest('.fader-strip');
    const valueEl = strip ? strip.querySelector('.fader-value') : null;

    function setValue(v, silent = false) {
      v = Math.max(min, Math.min(max, v));
      const pct = ((v - min) / (max - min)) * 100;
      if (fill)  fill.style.height = pct + '%';
      if (thumb) thumb.style.bottom = pct + '%';
      if (valueEl) valueEl.textContent = fmt ? fmt(v) : (v.toFixed(1) + unit);
      value = v;
      if (!silent && onChange) onChange(v);
    }

    function handle(e) {
      const touch = e.touches ? e.touches[0] : e;
      const rect  = trackEl.getBoundingClientRect();
      const rel   = (rect.bottom - touch.clientY) / rect.height;
      const v     = min + Math.max(0, Math.min(1, rel)) * (max - min);
      setValue(v);
      haptic('light');
    }

    trackEl.addEventListener('touchstart', e => { e.preventDefault(); handle(e); haptic('medium'); }, {passive:false});
    trackEl.addEventListener('touchmove',  e => { e.preventDefault(); handle(e); }, {passive:false});
    trackEl.addEventListener('mousedown', e => {
      handle(e);
      const mv = ev => handle(ev);
      const up = () => { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); };
      document.addEventListener('mousemove', mv);
      document.addEventListener('mouseup', up);
    });

    setValue(value, true);
    return { setValue, getValue: () => value };
  }

  // ============== XY PAD ==============
  function bindXYPad(padEl, { onChange } = {}) {
    const dot = padEl.querySelector('.xy-dot');
    function handle(e) {
      const touch = e.touches ? e.touches[0] : e;
      const rect  = padEl.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (touch.clientY - rect.top)  / rect.height));
      if (dot) { dot.style.left = (x * 100) + '%'; dot.style.top = (y * 100) + '%'; }
      if (onChange) onChange(x, 1 - y); // invert Y so up = high
    }
    padEl.addEventListener('touchstart', e => { e.preventDefault(); handle(e); haptic('light'); }, {passive:false});
    padEl.addEventListener('touchmove',  e => { e.preventDefault(); handle(e); }, {passive:false});
    padEl.addEventListener('mousedown',  e => {
      handle(e);
      const mv = ev => handle(ev);
      const up = () => { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); };
      document.addEventListener('mousemove', mv);
      document.addEventListener('mouseup', up);
    });
  }

  // ============== JOG WHEEL ==============
  function bindJogWheel(wheelEl, { onRotate } = {}) {
    const marker = wheelEl.querySelector('.jog-marker');
    let angle = 0;
    let lastAngle = null;

    function getAngle(e) {
      const touch = e.touches ? e.touches[0] : e;
      const rect = wheelEl.getBoundingClientRect();
      const cx = rect.left + rect.width/2;
      const cy = rect.top + rect.height/2;
      return Math.atan2(touch.clientY - cy, touch.clientX - cx) * 180 / Math.PI;
    }
    function handle(e) {
      const a = getAngle(e);
      if (lastAngle !== null) {
        let delta = a - lastAngle;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        angle += delta;
        if (marker) marker.style.transform = `translateX(-50%) rotate(${angle}deg)`;
        if (onRotate) onRotate(delta, angle);
      }
      lastAngle = a;
    }
    wheelEl.addEventListener('touchstart', e => { e.preventDefault(); lastAngle = getAngle(e); haptic('light'); }, {passive:false});
    wheelEl.addEventListener('touchmove',  e => { e.preventDefault(); handle(e); }, {passive:false});
    wheelEl.addEventListener('touchend',   e => { lastAngle = null; });
    wheelEl.addEventListener('mousedown',  e => {
      lastAngle = getAngle(e);
      const mv = ev => handle(ev);
      const up = () => { lastAngle = null; document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); };
      document.addEventListener('mousemove', mv);
      document.addEventListener('mouseup', up);
    });
  }

  // ============== VELOCITY-SENSITIVE PAD ==============
  function bindPad(padEl, { onHit, sound } = {}) {
    function trigger(velocity) {
      padEl.classList.add('hit');
      setTimeout(() => padEl.classList.remove('hit'), 150);
      haptic(velocity > 0.7 ? 'heavy' : 'medium');
      if (sound) playDrum(sound, velocity);
      if (onHit) onHit(velocity);
    }
    padEl.addEventListener('touchstart', e => {
      e.preventDefault();
      const t = e.touches[0];
      // velocity from touch force if available
      const v = t.force > 0 ? Math.max(0.3, Math.min(1.0, t.force)) : 0.9;
      trigger(v);
    }, {passive:false});
    padEl.addEventListener('mousedown', () => trigger(0.8));
  }

  // ============== AI BRAIN CALL ==============
  async function brainChat(message, agent = 'moneypenny') {
    try {
      const r = await fetch(API_URL + '/brain/chat', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ message, agent })
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } catch(e) {
      return { ok:false, error: e.message, reply: `⚠️ Offline: couldn't reach Brain at ${API_URL}. ${e.message}` };
    }
  }

  async function brainStatus() {
    try {
      const r = await fetch(API_URL + '/brain/status', { signal: AbortSignal.timeout(3000) });
      return await r.json();
    } catch(e) { return { ok:false, error: e.message }; }
  }

  async function runAutopilot(goal, maxSteps = 5) {
    try {
      const r = await fetch(API_URL + '/autopilot/run', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ goal, max_steps: maxSteps })
      });
      return await r.json();
    } catch(e) { return { ok:false, error: e.message }; }
  }

  // ============== VOICE (SpeechRecognition + SpeechSynthesis) ==============
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognizer = null;

  function listen({ onStart, onResult, onEnd, onError } = {}) {
    if (!SpeechRec) { if (onError) onError(new Error('Voice input not supported on this device/browser')); return null; }
    recognizer = new SpeechRec();
    recognizer.lang = 'en-US';
    recognizer.interimResults = false;
    recognizer.maxAlternatives = 1;
    recognizer.onstart  = () => onStart && onStart();
    recognizer.onresult = e => { const text = e.results[0][0].transcript; onResult && onResult(text); };
    recognizer.onend    = () => onEnd && onEnd();
    recognizer.onerror  = e => onError && onError(e);
    try { recognizer.start(); } catch(e) { if (onError) onError(e); }
    return recognizer;
  }
  function stopListen(){ if (recognizer) { try{ recognizer.stop(); }catch(e){} recognizer = null; } }
  function speak(text, { rate=1.0, pitch=1.0, voice } = {}) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate; u.pitch = pitch;
    if (voice) u.voice = voice;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  // ============== FULLSCREEN ==============
  function toggleFullscreen() {
    const el = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    }
  }

  // ============== AUTO-INIT BY DATA ATTRIBUTES ==============
  function autoInit() {
    // Prevent double-tap zoom on iOS
    let lastTouch = 0;
    document.addEventListener('touchend', e => {
      const now = Date.now();
      if (now - lastTouch <= 300) e.preventDefault();
      lastTouch = now;
    }, {passive:false});

    // Unlock audio on first interaction
    const unlock = () => { getAudio(); document.removeEventListener('touchstart', unlock); document.removeEventListener('click', unlock); };
    document.addEventListener('touchstart', unlock, { once:true });
    document.addEventListener('click', unlock, { once:true });

    // Register SW if available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(()=>{});
    }

    // Detect API
    detectApi();
  }

  // ============== EXPORT ==============
  global.GoatTouch = {
    get API_URL(){ return API_URL; },
    set API_URL(v){ API_URL = v; localStorage.setItem('goat.apiUrl', v); },
    detectApi,
    haptic,
    getAudio,
    playTone,
    playDrum,
    bindFader,
    bindXYPad,
    bindJogWheel,
    bindPad,
    brainChat,
    brainStatus,
    runAutopilot,
    listen,
    stopListen,
    speak,
    toggleFullscreen,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
})(window);