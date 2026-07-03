(function () {
  "use strict";

  class GoatVocalProcessor {
    constructor() {
      this.presets = {
        clean: { compression: 2, warmth: 0.2, air: 0.25 },
        radio: { compression: 5, warmth: 0.45, air: 0.35 },
        lead: { compression: 4, warmth: 0.35, air: 0.55 },
      };
    }

    getPreset(name) {
      return this.presets[name] || this.presets.clean;
    }

    analyzeLevel(samples) {
      if (!samples || !samples.length) return { peak: 0, rms: 0 };
      let peak = 0;
      let sum = 0;
      for (const value of samples) {
        const abs = Math.abs(value);
        peak = Math.max(peak, abs);
        sum += value * value;
      }
      return { peak, rms: Math.sqrt(sum / samples.length) };
    }
  }

  window.GoatVocalProcessor = window.GoatVocalProcessor || GoatVocalProcessor;
  window.goatVocalProcessor = window.goatVocalProcessor || new GoatVocalProcessor();
  window.dispatchEvent(new CustomEvent("goat:vocal-processor-ready"));
})();
