(function () {
  "use strict";

  class GoatMatchingAlgorithm {
    score(profile, candidate) {
      const a = new Set((profile?.interests || []).map(x => String(x).toLowerCase()));
      const b = new Set((candidate?.interests || []).map(x => String(x).toLowerCase()));
      const shared = [...a].filter(x => b.has(x)).length;
      const total = new Set([...a, ...b]).size || 1;
      const base = shared / total;
      const verifiedBoost = candidate?.verified ? 0.08 : 0;
      return Math.round(Math.min(1, base + verifiedBoost) * 100);
    }

    rank(profile, candidates) {
      return [...(candidates || [])]
        .map(candidate => ({ ...candidate, compatibility: this.score(profile, candidate) }))
        .sort((a, b) => b.compatibility - a.compatibility);
    }
  }

  window.GoatMatchingAlgorithm = window.GoatMatchingAlgorithm || GoatMatchingAlgorithm;
  window.goatMatchingAlgorithm = window.goatMatchingAlgorithm || new GoatMatchingAlgorithm();
  window.dispatchEvent(new CustomEvent("goat:matching-ready"));
})();
