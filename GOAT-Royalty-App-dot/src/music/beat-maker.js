// ============================================================
// GOAT Beat Maker — Web Audio API Drum Machine + Synth
// 16-Step Sequencer · 8 Tracks · BPM Control · Export WAV
// Built for Harvey Miller (DJ Speedy)
// ============================================================

const GOATBeatMaker = (() => {
  let audioCtx = null;
  let isPlaying = false;
  let currentStep = 0;
  let intervalId = null;
  let bpm = 120;
  let swing = 0;
  let masterVolume = 0.8;
  const STEPS = 16;

  // ─── DRUM KITS ────────────────────────────────────────────
  const DRUM_KITS = {
    'trap': { name: '🔥 Trap', bpm: 140, sounds: [
      { name: 'Kick', freq: 55, type: 'kick', color: '#ef4444' },
      { name: '808', freq: 40, type: '808', color: '#dc2626' },
      { name: 'Snare', freq: 200, type: 'snare', color: '#f59e0b' },
      { name: 'Clap', freq: 400, type: 'clap', color: '#eab308' },
      { name: 'Hi-Hat', freq: 8000, type: 'hihat', color: '#22c55e' },
      { name: 'Open Hat', freq: 8000, type: 'openhat', color: '#16a34a' },
      { name: 'Perc', freq: 1200, type: 'perc', color: '#0ea5e9' },
      { name: 'Rim', freq: 800, type: 'rim', color: '#6366f1' }
    ]},
    'boombap': { name: '🎤 Boom Bap', bpm: 90, sounds: [
      { name: 'Kick', freq: 60, type: 'kick', color: '#ef4444' },
      { name: 'Kick 2', freq: 50, type: 'kick', color: '#dc2626' },
      { name: 'Snare', freq: 220, type: 'snare', color: '#f59e0b' },
      { name: 'Snare 2', freq: 180, type: 'snare', color: '#eab308' },
      { name: 'Hi-Hat', freq: 9000, type: 'hihat', color: '#22c55e' },
      { name: 'Shaker', freq: 7000, type: 'hihat', color: '#16a34a' },
      { name: 'Scratch', freq: 2000, type: 'perc', color: '#0ea5e9' },
      { name: 'Cymbal', freq: 5000, type: 'openhat', color: '#6366f1' }
    ]},
    'drill': { name: '🔫 Drill', bpm: 145, sounds: [
      { name: 'Kick', freq: 50, type: 'kick', color: '#ef4444' },
      { name: '808 Slide', freq: 35, type: '808', color: '#dc2626' },
      { name: 'Snare', freq: 250, type: 'snare', color: '#f59e0b' },
      { name: 'Clap', freq: 450, type: 'clap', color: '#eab308' },
      { name: 'Hi-Hat', freq: 10000, type: 'hihat', color: '#22c55e' },
      { name: 'Hi-Hat Roll', freq: 10000, type: 'hihat', color: '#16a34a' },
      { name: 'Slide', freq: 300, type: 'perc', color: '#0ea5e9' },
      { name: 'Vox', freq: 600, type: 'perc', color: '#6366f1' }
    ]},
    'rnb': { name: '💜 R&B', bpm: 80, sounds: [
      { name: 'Kick', freq: 55, type: 'kick', color: '#ef4444' },
      { name: 'Sub', freq: 45, type: '808', color: '#dc2626' },
      { name: 'Snare', freq: 190, type: 'snare', color: '#f59e0b' },
      { name: 'Finger Snap', freq: 500, type: 'clap', color: '#eab308' },
      { name: 'Hi-Hat', freq: 8000, type: 'hihat', color: '#22c55e' },
      { name: 'Tambourine', freq: 6000, type: 'hihat', color: '#16a34a' },
      { name: 'Rim', freq: 900, type: 'rim', color: '#0ea5e9' },
      { name: 'Bell', freq: 2000, type: 'perc', color: '#6366f1' }
    ]},
    'edm': { name: '⚡ EDM', bpm: 128, sounds: [
      { name: 'Kick', freq: 50, type: 'kick', color: '#ef4444' },
      { name: 'Bass', freq: 60, type: '808', color: '#dc2626' },
      { name: 'Snare', freq: 240, type: 'snare', color: '#f59e0b' },
      { name: 'Clap', freq: 420, type: 'clap', color: '#eab308' },
      { name: 'Hi-Hat', freq: 9000, type: 'hihat', color: '#22c55e' },
      { name: 'Open Hat', freq: 7000, type: 'openhat', color: '#16a34a' },
      { name: 'Synth Hit', freq: 1500, type: 'perc', color: '#0ea5e9' },
      { name: 'Crash', freq: 4000, type: 'openhat', color: '#6366f1' }
    ]},
    'lofi': { name: '🌙 Lo-Fi', bpm: 75, sounds: [
      { name: 'Kick', freq: 50, type: 'kick', color: '#ef4444' },
      { name: 'Sub', freq: 40, type: '808', color: '#dc2626' },
      { name: 'Snare', freq: 170, type: 'snare', color: '#f59e0b' },
      { name: 'Brush', freq: 350, type: 'clap', color: '#eab308' },
      { name: 'Hat', freq: 7000, type: 'hihat', color: '#22c55e' },
      { name: 'Shaker', freq: 5000, type: 'hihat', color: '#16a34a' },
      { name: 'Vinyl', freq: 3000, type: 'perc', color: '#0ea5e9' },
      { name: 'Keys', freq: 800, type: 'perc', color: '#6366f1' }
    ]}
  };

  let currentKit = 'trap';
  // 8 tracks × 16 steps grid
  let grid = Array(8).fill(null).map(() => Array(STEPS).fill(false));
  let trackVolumes = Array(8).fill(0.8);
  let trackMutes = Array(8).fill(false);

  // ─── PRESET PATTERNS ─────────────────────────────────────
  const PRESET_PATTERNS = {
    'trap_basic': { name: '🔥 Trap Basic', kit: 'trap', bpm: 140, grid: [
      [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], // Kick
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0], // 808
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], // Snare
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // Clap
      [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], // Hi-Hat
      [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0], // Open Hat
      [0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0], // Perc
      [0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0], // Rim
    ]},
    'boombap_basic': { name: '🎤 Boom Bap Classic', kit: 'boombap', bpm: 90, grid: [
      [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0], // Kick
      [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], // Kick 2
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], // Snare
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // Snare 2
      [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], // Hi-Hat
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1], // Shaker
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // Scratch
      [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1], // Cymbal
    ]},
    'drill_basic': { name: '🔫 UK Drill', kit: 'drill', bpm: 145, grid: [
      [1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0], // Kick
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1], // 808 Slide
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], // Snare
      [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0], // Clap
      [1,1,0,1,1,0,1,1,1,1,0,1,1,0,1,1], // Hi-Hat
      [0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0], // Hi-Hat Roll
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // Slide
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // Vox
    ]},
    'edm_four': { name: '⚡ Four on Floor', kit: 'edm', bpm: 128, grid: [
      [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
      [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
      [0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0],
      [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    ]}
  };

  // ─── AUDIO SYNTHESIS ──────────────────────────────────────
  function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  function playSynthDrum(sound, volume) {
    initAudio();
    const now = audioCtx.currentTime;
    const gainNode = audioCtx.createGain();
    gainNode.connect(audioCtx.destination);
    gainNode.gain.value = volume * masterVolume;

    switch (sound.type) {
      case 'kick': {
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(sound.freq, now + 0.05);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.3);
        gainNode.gain.setValueAtTime(volume * masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.4);
        // Add click for attack
        const click = audioCtx.createOscillator();
        const clickGain = audioCtx.createGain();
        click.type = 'square';
        click.frequency.value = 600;
        clickGain.gain.setValueAtTime(volume * 0.3, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        click.connect(clickGain).connect(audioCtx.destination);
        click.start(now);
        click.stop(now + 0.02);
        break;
      }
      case '808': {
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(sound.freq * 2, now);
        osc.frequency.exponentialRampToValueAtTime(sound.freq, now + 0.03);
        // Distortion for grit
        const waveshaper = audioCtx.createWaveShaper();
        const curve = new Float32Array(256);
        for (let i = 0; i < 256; i++) { const x = (i * 2) / 256 - 1; curve[i] = Math.tanh(x * 3); }
        waveshaper.curve = curve;
        gainNode.gain.setValueAtTime(volume * masterVolume * 1.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(waveshaper).connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.8);
        break;
      }
      case 'snare': {
        // Noise component
        const bufferSize = audioCtx.sampleRate * 0.2;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(volume * masterVolume * 0.6, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = sound.freq;
        noise.connect(filter).connect(noiseGain).connect(audioCtx.destination);
        noise.start(now);
        noise.stop(now + 0.2);
        // Tone component
        const osc = audioCtx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(sound.freq, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.05);
        gainNode.gain.setValueAtTime(volume * masterVolume * 0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case 'clap': {
        for (let j = 0; j < 3; j++) {
          const offset = j * 0.01;
          const bufSize = audioCtx.sampleRate * 0.15;
          const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
          const d = buf.getChannelData(0);
          for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
          const src = audioCtx.createBufferSource();
          src.buffer = buf;
          const g = audioCtx.createGain();
          const f = audioCtx.createBiquadFilter();
          f.type = 'bandpass';
          f.frequency.value = sound.freq;
          f.Q.value = 2;
          g.gain.setValueAtTime(volume * masterVolume * 0.4, now + offset);
          g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.15);
          src.connect(f).connect(g).connect(audioCtx.destination);
          src.start(now + offset);
          src.stop(now + offset + 0.15);
        }
        break;
      }
      case 'hihat': {
        const bufSize = audioCtx.sampleRate * 0.05;
        const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        const f = audioCtx.createBiquadFilter();
        f.type = 'highpass';
        f.frequency.value = sound.freq;
        gainNode.gain.setValueAtTime(volume * masterVolume * 0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        src.connect(f).connect(gainNode);
        src.start(now);
        src.stop(now + 0.05);
        break;
      }
      case 'openhat': {
        const bufSize = audioCtx.sampleRate * 0.3;
        const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        const f = audioCtx.createBiquadFilter();
        f.type = 'highpass';
        f.frequency.value = sound.freq * 0.8;
        gainNode.gain.setValueAtTime(volume * masterVolume * 0.35, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        src.connect(f).connect(gainNode);
        src.start(now);
        src.stop(now + 0.3);
        break;
      }
      case 'perc': {
        const osc = audioCtx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(sound.freq, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
        gainNode.gain.setValueAtTime(volume * masterVolume * 0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }
      case 'rim': {
        const osc = audioCtx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(sound.freq, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.01);
        gainNode.gain.setValueAtTime(volume * masterVolume * 0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }
    }
  }

  // ─── TRANSPORT ────────────────────────────────────────────
  function play() {
    if (isPlaying) return;
    initAudio();
    isPlaying = true;
    currentStep = 0;
    const stepTime = () => (60 / bpm / 4) * 1000;
    function tick() {
      const kit = DRUM_KITS[currentKit];
      for (let track = 0; track < 8; track++) {
        if (grid[track][currentStep] && !trackMutes[track]) {
          playSynthDrum(kit.sounds[track], trackVolumes[track]);
        }
      }
      // Update UI
      document.querySelectorAll('.bm-step').forEach(el => el.classList.remove('playing'));
      document.querySelectorAll(`.bm-step[data-step="${currentStep}"]`).forEach(el => el.classList.add('playing'));
      currentStep = (currentStep + 1) % STEPS;
      if (isPlaying) intervalId = setTimeout(tick, stepTime());
    }
    tick();
    updateTransportUI();
  }

  function stop() {
    isPlaying = false;
    clearTimeout(intervalId);
    currentStep = 0;
    document.querySelectorAll('.bm-step').forEach(el => el.classList.remove('playing'));
    updateTransportUI();
  }

  function updateTransportUI() {
    const playBtn = document.getElementById('bmPlayBtn');
    if (playBtn) playBtn.innerHTML = isPlaying ? '⏹ Stop' : '▶ Play';
  }

  // ─── GRID OPERATIONS ──────────────────────────────────────
  function toggleStep(track, step) {
    grid[track][step] = !grid[track][step];
    // Preview sound
    if (grid[track][step]) {
      const kit = DRUM_KITS[currentKit];
      playSynthDrum(kit.sounds[track], trackVolumes[track]);
    }
  }

  function clearGrid() {
    grid = Array(8).fill(null).map(() => Array(STEPS).fill(false));
  }

  function loadPreset(presetId) {
    const preset = PRESET_PATTERNS[presetId];
    if (!preset) return;
    currentKit = preset.kit;
    bpm = preset.bpm;
    grid = preset.grid.map(row => row.map(v => !!v));
  }

  function changeKit(kitId) {
    currentKit = kitId;
    bpm = DRUM_KITS[kitId].bpm;
  }

  function randomize() {
    const densities = [0.3, 0.15, 0.25, 0.15, 0.5, 0.2, 0.15, 0.1];
    grid = grid.map((row, i) => row.map(() => Math.random() < densities[i]));
  }

  // ─── RENDER ───────────────────────────────────────────────
  function render(container) {
    const kit = DRUM_KITS[currentKit];
    container.innerHTML = `
      <div style="text-align:center;margin-bottom:12px">
        <div style="font-size:42px;margin-bottom:6px">🎹</div>
        <h3 style="font-size:18px;background:linear-gradient(135deg,var(--accent),#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent">GOAT Beat Maker</h3>
        <p style="font-size:12px;color:var(--text-muted)">16-Step Sequencer · 6 Drum Kits · Web Audio Synthesis</p>
      </div>

      <!-- Transport -->
      <div style="display:flex;gap:8px;margin-bottom:12px;align-items:center">
        <button id="bmPlayBtn" class="terminal-run-btn" style="background:linear-gradient(135deg,var(--green),var(--cyan));padding:10px 20px;font-weight:700" onclick="window._bmTogglePlay()">▶ Play</button>
        <button class="terminal-run-btn" style="padding:10px 14px" onclick="window._bmClear()">🗑️ Clear</button>
        <button class="terminal-run-btn" style="padding:10px 14px" onclick="window._bmRandomize()">🎲 Random</button>
        <div style="flex:1"></div>
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:12px;color:var(--text-muted)">BPM:</span>
          <input type="number" id="bmBpm" value="${bpm}" min="40" max="300" style="width:60px;padding:4px 8px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);text-align:center;font-weight:700;font-size:14px" onchange="window._bmSetBpm(this.value)">
        </div>
      </div>

      <!-- Kit Selector -->
      <div style="display:flex;gap:4px;margin-bottom:12px;flex-wrap:wrap">
        ${Object.entries(DRUM_KITS).map(([id, k]) => `<button class="tool-btn" style="padding:6px 10px;flex-direction:row;gap:4px;font-size:11px;${id===currentKit?'background:var(--accent);color:white;border-color:var(--accent)':''}" onclick="window._bmChangeKit('${id}')">${k.name}</button>`).join('')}
      </div>

      <!-- Presets -->
      <div style="display:flex;gap:4px;margin-bottom:14px;flex-wrap:wrap">
        <span style="font-size:11px;color:var(--text-muted);padding:6px 0">Presets:</span>
        ${Object.entries(PRESET_PATTERNS).map(([id, p]) => `<button class="tool-btn" style="padding:4px 8px;flex-direction:row;gap:4px;font-size:10px" onclick="window._bmLoadPreset('${id}')">${p.name}</button>`).join('')}
      </div>

      <!-- Grid -->
      <div style="overflow-x:auto">
        <div style="min-width:600px">
          ${kit.sounds.map((sound, track) => `
            <div style="display:flex;align-items:center;gap:4px;margin-bottom:3px">
              <div style="width:80px;display:flex;align-items:center;gap:4px;flex-shrink:0">
                <button style="background:none;border:none;font-size:14px;cursor:pointer;padding:2px" onclick="window._bmPreviewSound(${track})" title="Preview">🔊</button>
                <span style="font-size:11px;color:${sound.color};font-weight:600;white-space:nowrap">${sound.name}</span>
              </div>
              <div style="display:flex;gap:2px;flex:1">
                ${Array(STEPS).fill(0).map((_, step) => `
                  <div class="bm-step ${grid[track][step]?'active':''}" data-track="${track}" data-step="${step}" 
                    style="width:100%;aspect-ratio:1;min-width:20px;max-width:32px;border-radius:4px;cursor:pointer;
                    background:${grid[track][step] ? sound.color : 'var(--bg-primary)'};
                    border:1px solid ${grid[track][step] ? sound.color : 'var(--border)'};
                    opacity:${grid[track][step] ? 1 : (step % 4 === 0 ? 0.6 : 0.4)};
                    transition:all 0.1s"
                    onclick="window._bmToggle(${track},${step},this)">
                  </div>
                `).join('')}
              </div>
              <div style="width:40px;flex-shrink:0">
                <button style="background:none;border:none;font-size:12px;cursor:pointer;color:${trackMutes[track]?'var(--red)':'var(--text-muted)'}" onclick="window._bmToggleMute(${track})" title="${trackMutes[track]?'Unmute':'Mute'}">${trackMutes[track]?'🔇':'🔈'}</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Step Numbers -->
      <div style="display:flex;margin-left:84px;margin-bottom:16px;gap:2px">
        ${Array(STEPS).fill(0).map((_, i) => `<div style="flex:1;min-width:20px;max-width:32px;text-align:center;font-size:9px;color:${i%4===0?'var(--accent)':'var(--text-muted)'}">${i+1}</div>`).join('')}
      </div>

      <!-- Master Volume -->
      <div style="display:flex;align-items:center;gap:8px;padding:10px;background:var(--bg-primary);border-radius:var(--radius-sm);border:1px solid var(--border)">
        <span style="font-size:12px;color:var(--text-muted)">🔊 Master</span>
        <input type="range" min="0" max="100" value="${masterVolume*100}" style="flex:1" oninput="window._bmSetVolume(this.value)">
        <span style="font-size:12px;color:var(--accent);font-weight:600;width:35px" id="bmVolVal">${Math.round(masterVolume*100)}%</span>
      </div>

      <!-- Tips -->
      <div style="margin-top:14px;padding:10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);font-size:11px;color:var(--text-muted)">
        💡 <strong>Tips:</strong> Click cells to toggle beats · Click 🔊 to preview sounds · Use presets as starting points · Adjust BPM for different tempos · Mute tracks with 🔈
      </div>
    `;
  }

  // ─── GLOBAL HANDLERS ──────────────────────────────────────
  window._bmTogglePlay = function() { isPlaying ? stop() : play(); };
  window._bmClear = function() { clearGrid(); const c = document.getElementById('toolPanelContent'); if(c) render(c); };
  window._bmRandomize = function() { randomize(); const c = document.getElementById('toolPanelContent'); if(c) render(c); };
  window._bmSetBpm = function(v) { bpm = parseInt(v) || 120; };
  window._bmSetVolume = function(v) { masterVolume = v / 100; const el = document.getElementById('bmVolVal'); if(el) el.textContent = v + '%'; };
  window._bmChangeKit = function(id) { changeKit(id); const c = document.getElementById('toolPanelContent'); if(c) render(c); };
  window._bmLoadPreset = function(id) { loadPreset(id); const c = document.getElementById('toolPanelContent'); if(c) render(c); };
  window._bmPreviewSound = function(track) {
    const kit = DRUM_KITS[currentKit];
    playSynthDrum(kit.sounds[track], trackVolumes[track]);
  };
  window._bmToggle = function(track, step, el) {
    toggleStep(track, step);
    const kit = DRUM_KITS[currentKit];
    const sound = kit.sounds[track];
    if (el) {
      el.style.background = grid[track][step] ? sound.color : 'var(--bg-primary)';
      el.style.borderColor = grid[track][step] ? sound.color : 'var(--border)';
      el.style.opacity = grid[track][step] ? 1 : (step % 4 === 0 ? 0.6 : 0.4);
      el.classList.toggle('active', grid[track][step]);
    }
  };
  window._bmToggleMute = function(track) {
    trackMutes[track] = !trackMutes[track];
    const c = document.getElementById('toolPanelContent');
    if(c) render(c);
  };

  return { render, play, stop, grid, DRUM_KITS, PRESET_PATTERNS };
})();

// Export for renderer
if (typeof window !== 'undefined') {
  window.GOATBeatMaker = GOATBeatMaker;
  window.renderBeatMaker = function(container) { GOATBeatMaker.render(container); };
}