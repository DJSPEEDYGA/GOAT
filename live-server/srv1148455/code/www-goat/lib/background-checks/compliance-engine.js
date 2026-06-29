(function () {
  "use strict";

  class GoatComplianceEngine {
    checklist() {
      return [
        "Confirm written consent.",
        "Use only permitted-purpose checks.",
        "Keep sensitive identifiers private.",
        "Review adverse-action rules before decisions.",
      ];
    }

    evaluate(record) {
      const issues = [];
      if (!record?.consent) issues.push("Missing documented consent.");
      if (!record?.purpose) issues.push("Missing permitted purpose.");
      return { ok: issues.length === 0, issues };
    }
  }

  window.GoatComplianceEngine = window.GoatComplianceEngine || GoatComplianceEngine;
  window.goatComplianceEngine = window.goatComplianceEngine || new GoatComplianceEngine();
  window.dispatchEvent(new CustomEvent("goat:compliance-ready"));
})();
