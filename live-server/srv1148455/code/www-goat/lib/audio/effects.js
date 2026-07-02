(function () {
  "use strict";

  class GoatEffectsRack {
    constructor() {
      this.effects = [];
    }

    add(type, settings = {}) {
      const effect = { id: Date.now() + Math.random(), type, enabled: true, settings };
      this.effects.push(effect);
      return effect;
    }

    toggle(id) {
      const effect = this.effects.find(item => item.id === id);
      if (effect) effect.enabled = !effect.enabled;
      return effect;
    }

    presets() {
      return ["radio vocal", "club master", "clean podcast", "wide synth bus"];
    }
  }

  window.GoatEffectsRack = window.GoatEffectsRack || GoatEffectsRack;
  window.goatEffectsRack = window.goatEffectsRack || new GoatEffectsRack();
  window.dispatchEvent(new CustomEvent("goat:effects-ready"));
})();
