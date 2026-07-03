(function () {
  "use strict";

  class MsVanessaAI {
    answer(query) {
      const text = String(query || "").toLowerCase();
      if (text.includes("consent")) return "Always document written consent before running a background check.";
      if (text.includes("risk")) return "Review identity match confidence, criminal record flags, financial signals, and adverse-action requirements.";
      return "I can help organize verification steps, compliance notes, and a plain-language risk summary.";
    }

    summarize(result) {
      return {
        status: result?.status || "Review",
        notes: result?.notes || "Verify identity, consent, and report scope before decisioning.",
      };
    }
  }

  window.MsVanessaAI = window.MsVanessaAI || MsVanessaAI;
  window.msVanessaAI = window.msVanessaAI || new MsVanessaAI();
  window.dispatchEvent(new CustomEvent("goat:ms-vanessa-ready"));
})();
