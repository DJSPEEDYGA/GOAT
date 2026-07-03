(function () {
  "use strict";

  class GoatAudioEngine {
    constructor() {
      this.context = null;
      this.masterGain = null;
      this.started = false;
    }

    async start() {
      if (!this.context) {
        const AudioCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtor) throw new Error("Web Audio is not supported in this browser.");
        this.context = new AudioCtor();
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = 0.85;
        this.masterGain.connect(this.context.destination);
      }
      if (this.context.state === "suspended") await this.context.resume();
      this.started = true;
      return this.context;
    }

    createAnalyser() {
      if (!this.context) return null;
      const analyser = this.context.createAnalyser();
      analyser.fftSize = 2048;
      return analyser;
    }

    async loadFile(file) {
      const context = await this.start();
      const buffer = await file.arrayBuffer();
      return context.decodeAudioData(buffer.slice(0));
    }

    playBuffer(buffer) {
      if (!this.context || !this.masterGain) return null;
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      source.connect(this.masterGain);
      source.start();
      return source;
    }
  }

  window.GoatAudioEngine = window.GoatAudioEngine || GoatAudioEngine;
  window.goatAudioEngine = window.goatAudioEngine || new GoatAudioEngine();
  window.dispatchEvent(new CustomEvent("goat:audio-engine-ready"));
})();
