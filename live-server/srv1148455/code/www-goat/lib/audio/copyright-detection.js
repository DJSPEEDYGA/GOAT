(function () {
  "use strict";

  class GoatCopyrightDetection {
    checkFingerprint(fingerprint, catalog) {
      const hash = String(fingerprint?.hash || fingerprint || "");
      const match = (catalog || []).find(item => String(item.hash || "").startsWith(hash.slice(0, 16)));
      return {
        matched: Boolean(match),
        match: match || null,
        confidence: match ? 0.98 : 0,
        status: match ? "potential match" : "no local catalog match",
      };
    }

    rightsNote() {
      return "This demo check is informational. Confirm rights against authoritative metadata before taking action.";
    }
  }

  window.GoatCopyrightDetection = window.GoatCopyrightDetection || GoatCopyrightDetection;
  window.goatCopyrightDetection = window.goatCopyrightDetection || new GoatCopyrightDetection();
  window.dispatchEvent(new CustomEvent("goat:copyright-detection-ready"));
})();
