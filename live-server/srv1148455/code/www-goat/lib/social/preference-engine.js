(function () {
  "use strict";

  class GoatPreferenceEngine {
    constructor() {
      this.preferences = JSON.parse(localStorage.getItem("goatDatingPreferences") || "{}");
    }

    save(next) {
      this.preferences = { ...this.preferences, ...next };
      localStorage.setItem("goatDatingPreferences", JSON.stringify(this.preferences));
      return this.preferences;
    }

    get() {
      return { ...this.preferences };
    }

    filter(candidates) {
      const city = String(this.preferences.city || "").toLowerCase();
      return (candidates || []).filter(candidate => {
        if (!city) return true;
        return String(candidate.location || "").toLowerCase().includes(city);
      });
    }
  }

  window.GoatPreferenceEngine = window.GoatPreferenceEngine || GoatPreferenceEngine;
  window.goatPreferenceEngine = window.goatPreferenceEngine || new GoatPreferenceEngine();
  window.dispatchEvent(new CustomEvent("goat:preferences-ready"));
})();
