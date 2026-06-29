(function () {
  "use strict";

  class GoatAIAudioEnhancer {
    suggestChain(goal) {
      const text = String(goal || "").toLowerCase();
      if (text.includes("podcast")) return ["noise cleanup", "leveling", "de-esser", "limiter"];
      if (text.includes("master")) return ["eq balance", "multiband compression", "stereo width", "limiter"];
      if (text.includes("vocal")) return ["high-pass", "compression", "de-esser", "presence lift"];
      return ["cleanup", "eq balance", "compression", "limiter"];
    }

    scoreMix({ peak = 0, rms = 0 } = {}) {
      const headroom = Math.max(0, 1 - peak);
      const loudness = Math.min(1, rms * 4);
      return Math.round((headroom * 0.35 + loudness * 0.65) * 100);
    }
  }

  window.GoatAIAudioEnhancer = window.GoatAIAudioEnhancer || GoatAIAudioEnhancer;
  window.goatAIAudioEnhancer = window.goatAIAudioEnhancer || new GoatAIAudioEnhancer();
  window.dispatchEvent(new CustomEvent("goat:ai-audio-enhancer-ready"));
})();
