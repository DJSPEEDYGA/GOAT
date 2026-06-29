(function () {
  "use strict";

  class GoatDatingAI {
    opener(profile) {
      const interest = profile?.interests?.[0] || "creative work";
      return `Hey ${profile?.name || "there"}, I noticed your love for ${interest}. What got you into it?`;
    }

    safetySummary(profile) {
      return {
        verified: Boolean(profile?.verified),
        recommendation: profile?.verified ? "Profile has a verified badge." : "Ask for verification before meeting.",
      };
    }
  }

  window.GoatDatingAI = window.GoatDatingAI || GoatDatingAI;
  window.goatDatingAI = window.goatDatingAI || new GoatDatingAI();
  window.dispatchEvent(new CustomEvent("goat:dating-ai-ready"));
})();
