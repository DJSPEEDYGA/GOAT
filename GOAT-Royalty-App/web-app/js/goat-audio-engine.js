/* ============================================================
   GOAT Audio Engine — Shared audio infrastructure
   Used by SSL Mixer, Beat Maker, Studio, and plugin pages
   ============================================================ */
(function(global) {
'use strict';

// ---- Singleton AudioContext across all pages ----
let _ac = null;
function ac() {
  if (!_ac) {
    _ac = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (_ac.state === 'suspended') _ac.resume();
  return _ac;
}

// ---- Master recorder (records the master bus) ----
class MasterRecorder {
  constructor() {
    this.recording = false;
    this.chunks = [];
    this.mediaRecorder = null;
    this.destNode = null;
    this.startTime = 0;
  }
  connect(masterNode) {
    this.destNode = ac().createMediaStreamDestination();
    masterNode.connect(this.destNode);
    return this.destNode;
  }
  start() {
    if (this.recording || !this.destNode) return false;
    this.chunks = [];
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
    try {
      this.mediaRecorder = new MediaRecorder(this.destNode.stream, mimeType ? { mimeType } : {});
    } catch (e) {
      console.error('MediaRecorder failed:', e);
      return false;
    }
    this.mediaRecorder.ondataavailable = (e) => { if (e.data.size) this.chunks.push(e.data); };
    this.mediaRecorder.start(100);
    this.recording = true;
    this.startTime = Date.now();
    return true;
  }
  stop() {
    return new Promise((resolve) => {
      if (!this.recording || !this.mediaRecorder) return resolve(null);
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.mediaRecorder.mimeType || 'audio/webm' });
        this.recording = false;
        resolve(blob);
      };
      this.mediaRecorder.stop();
    });
  }
  async stopAndDownload(filename = 'goat-master-mix.webm') {
    const blob = await this.stop();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return blob;
  }
  getElapsedSec() {
    return this.recording ? (Date.now() - this.startTime) / 1000 : 0;
  }
}

// ---- Offline render to WAV ----
async function renderToWav(audioContext, durationSec, setupFn) {
  const sampleRate = audioContext.sampleRate;
  const length = Math.ceil(sampleRate * durationSec);
  const offline = new OfflineAudioContext(2, length, sampleRate);
  await setupFn(offline);
  const rendered = await offline.startRendering();
  return audioBufferToWav(rendered);
}

// ---- AudioBuffer → WAV (16-bit PCM) ----
function audioBufferToWav(buffer) {
  const numCh = buffer.numberOfChannels;
  const length = buffer.length * numCh * 2 + 44;
  const arr = new ArrayBuffer(length);
  const view = new DataView(arr);
  const chans = [];
  let offset = 0;

  const writeStr = (s) => { for (let i = 0; i < s.length; i++) view.setUint8(offset++, s.charCodeAt(i)); };
  const writeU32 = (v) => { view.setUint32(offset, v, true); offset += 4; };
  const writeU16 = (v) => { view.setUint16(offset, v, true); offset += 2; };

  writeStr('RIFF'); writeU32(length - 8); writeStr('WAVE');
  writeStr('fmt '); writeU32(16); writeU16(1); writeU16(numCh);
  writeU32(buffer.sampleRate); writeU32(buffer.sampleRate * numCh * 2);
  writeU16(numCh * 2); writeU16(16);
  writeStr('data'); writeU32(length - offset - 4);

  for (let i = 0; i < numCh; i++) chans.push(buffer.getChannelData(i));
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numCh; c++) {
      let s = Math.max(-1, Math.min(1, chans[c][i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }
  }
  return new Blob([arr], { type: 'audio/wav' });
}

// ---- Microphone / line-in source ----
async function getMicStream(constraints = { audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
  } catch (e) {
    console.error('Mic access failed:', e);
    throw e;
  }
}

// ---- File → AudioBuffer ----
async function loadAudioFile(file) {
  const ab = await file.arrayBuffer();
  return await ac().decodeAudioData(ab);
}
async function loadAudioUrl(url) {
  const resp = await fetch(url);
  const ab = await resp.arrayBuffer();
  return await ac().decodeAudioData(ab);
}

// ---- Channel audio source — handles mic / file / buffer / sequencer output ----
class ChannelSource {
  constructor(audioCtx, destinationNode) {
    this.ac = audioCtx;
    this.dest = destinationNode;
    this.buffer = null;           // AudioBuffer for file playback
    this.sourceNode = null;       // current playing source
    this.micStream = null;
    this.micSource = null;
    this.gainNode = audioCtx.createGain();
    this.gainNode.connect(destinationNode);
    this.type = 'none';           // 'none' | 'file' | 'mic' | 'external'
    this.loop = false;
    this.playing = false;
    this.fileName = '';
  }
  setFile(audioBuffer, name = '') {
    this.stop();
    this.buffer = audioBuffer;
    this.type = 'file';
    this.fileName = name;
  }
  async connectMic(constraints) {
    this.stop();
    this.micStream = await getMicStream(constraints);
    this.micSource = this.ac.createMediaStreamSource(this.micStream);
    this.micSource.connect(this.gainNode);
    this.type = 'mic';
    this.playing = true;
  }
  disconnectMic() {
    if (this.micSource) { this.micSource.disconnect(); this.micSource = null; }
    if (this.micStream) { this.micStream.getTracks().forEach(t => t.stop()); this.micStream = null; }
    this.type = 'none'; this.playing = false;
  }
  play(when = 0, offset = 0) {
    if (this.type !== 'file' || !this.buffer) return;
    this.stopSource();
    this.sourceNode = this.ac.createBufferSource();
    this.sourceNode.buffer = this.buffer;
    this.sourceNode.loop = this.loop;
    this.sourceNode.connect(this.gainNode);
    this.sourceNode.start(when, offset);
    this.sourceNode.onended = () => {
      if (!this.loop) { this.playing = false; this.sourceNode = null; }
    };
    this.playing = true;
  }
  stopSource() {
    if (this.sourceNode) {
      try { this.sourceNode.stop(); } catch (e) {}
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
  }
  stop() {
    this.stopSource();
    this.disconnectMic();
    this.playing = false;
  }
  setLoop(b) {
    this.loop = b;
    if (this.sourceNode) this.sourceNode.loop = b;
  }
  getType() { return this.type; }
  getName() { return this.fileName || this.type; }
}

// ---- Metronome / clock (for sync between pages) ----
class Metronome {
  constructor() {
    this.bpm = 90;
    this.running = false;
    this.position = 0;    // beats
    this._startAt = 0;
  }
  start() {
    this.running = true;
    this._startAt = ac().currentTime - (this.position * 60 / this.bpm);
  }
  stop() { this.running = false; this.position = this.getPosition(); }
  setBpm(b) {
    const cur = this.getPosition();
    this.bpm = b;
    if (this.running) this._startAt = ac().currentTime - (cur * 60 / this.bpm);
  }
  getPosition() {
    if (!this.running) return this.position;
    return (ac().currentTime - this._startAt) * this.bpm / 60;
  }
}

// ---- Cross-page live audio bridge (BroadcastChannel + MediaStream) ----
// The beat maker can publish its master output as a MediaStream.
// The SSL mixer can subscribe and route it into any channel input.
class AudioBridge {
  constructor() {
    this.bc = ('BroadcastChannel' in window) ? new BroadcastChannel('goat-audio-bridge') : null;
    this.publishers = {}; // id -> MediaStreamDestination
    this.subscribers = {};
    this.listeners = [];
    if (this.bc) {
      this.bc.onmessage = (e) => this.listeners.forEach(fn => fn(e.data));
    }
  }
  // Publisher side — creates a destination node, returns it for wiring
  publish(id, sourceNode) {
    const dest = ac().createMediaStreamDestination();
    sourceNode.connect(dest);
    this.publishers[id] = dest;
    if (this.bc) this.bc.postMessage({ kind: 'publish', id, at: Date.now() });
    return dest;
  }
  // Subscriber side — returns a Web Audio node carrying the stream
  subscribe(id) {
    // Same-tab: use direct node reference if publisher is on window
    if (window.__goatPublishers && window.__goatPublishers[id]) {
      const srcNode = window.__goatPublishers[id].sourceNode;
      if (srcNode) return { type: 'direct', node: srcNode };
    }
    return { type: 'none' };
  }
  announce(id, sourceNode) {
    window.__goatPublishers = window.__goatPublishers || {};
    window.__goatPublishers[id] = { sourceNode, time: Date.now() };
    if (this.bc) this.bc.postMessage({ kind: 'announce', id });
  }
  onMessage(fn) { this.listeners.push(fn); }
  listPublishers() {
    return Object.keys(window.__goatPublishers || {});
  }
}

const audioBridge = new AudioBridge();

// ---- Export public API ----
global.GoatAudio = {
  ac,
  MasterRecorder,
  ChannelSource,
  Metronome,
  AudioBridge,
  bridge: audioBridge,
  getMicStream,
  loadAudioFile,
  loadAudioUrl,
  renderToWav,
  audioBufferToWav,
};

})(typeof window !== 'undefined' ? window : globalThis);