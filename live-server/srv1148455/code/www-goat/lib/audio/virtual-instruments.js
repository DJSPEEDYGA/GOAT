(function () {
  "use strict";

  class GoatVirtualInstruments {
    constructor() {
      this.instruments = ["808", "grand piano", "analog bass", "lead synth", "strings", "drum kit"];
    }

    list() {
      return this.instruments.slice();
    }

    getPatch(name) {
      return {
        name,
        oscillator: name && name.includes("bass") ? "sawtooth" : "sine",
        envelope: { attack: 0.02, decay: 0.15, sustain: 0.75, release: 0.4 },
      };
    }
  }

  window.GoatVirtualInstruments = window.GoatVirtualInstruments || GoatVirtualInstruments;
  window.goatVirtualInstruments = window.goatVirtualInstruments || new GoatVirtualInstruments();
  window.dispatchEvent(new CustomEvent("goat:virtual-instruments-ready"));
})();
