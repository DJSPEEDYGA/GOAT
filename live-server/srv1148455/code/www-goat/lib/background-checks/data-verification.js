(function () {
  "use strict";

  class GoatDataVerification {
    identityScore(record) {
      let score = 0;
      if (record?.firstName) score += 20;
      if (record?.lastName) score += 20;
      if (record?.dob) score += 20;
      if (record?.email) score += 15;
      if (record?.phone) score += 15;
      if (record?.address) score += 10;
      return score;
    }

    normalizePhone(phone) {
      return String(phone || "").replace(/[^\d+]/g, "");
    }
  }

  window.GoatDataVerification = window.GoatDataVerification || GoatDataVerification;
  window.goatDataVerification = window.goatDataVerification || new GoatDataVerification();
  window.dispatchEvent(new CustomEvent("goat:data-verification-ready"));
})();
