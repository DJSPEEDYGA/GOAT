(function () {
  "use strict";

  class GoatFingerprintingEngine {
    async hashBlob(blob) {
      const buffer = await blob.arrayBuffer();
      const digest = await crypto.subtle.digest("SHA-256", buffer);
      return [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, "0")).join("");
    }

    async createFingerprint(blob) {
      const hash = await this.hashBlob(blob);
      return {
        hash,
        shortHash: hash.slice(0, 16).toUpperCase(),
        size: blob.size,
        type: blob.type || "audio/unknown",
        createdAt: new Date().toISOString(),
      };
    }
  }

  window.GoatFingerprintingEngine = window.GoatFingerprintingEngine || GoatFingerprintingEngine;
  window.goatFingerprintingEngine = window.goatFingerprintingEngine || new GoatFingerprintingEngine();
  window.dispatchEvent(new CustomEvent("goat:fingerprinting-ready"));
})();
