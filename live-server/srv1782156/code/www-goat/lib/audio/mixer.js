(function () {
  "use strict";

  class GoatMixer {
    constructor() {
      this.channels = [];
    }

    addChannel(name, options = {}) {
      const channel = {
        id: Date.now() + Math.random(),
        name,
        volume: options.volume ?? 0.8,
        pan: options.pan ?? 0,
        muted: false,
        solo: false,
      };
      this.channels.push(channel);
      return channel;
    }

    setVolume(id, volume) {
      const channel = this.channels.find(item => item.id === id);
      if (channel) channel.volume = Math.max(0, Math.min(1, Number(volume) || 0));
      return channel;
    }
  }

  window.GoatMixer = window.GoatMixer || GoatMixer;
  window.goatMixer = window.goatMixer || new GoatMixer();
  window.dispatchEvent(new CustomEvent("goat:mixer-ready"));
})();
