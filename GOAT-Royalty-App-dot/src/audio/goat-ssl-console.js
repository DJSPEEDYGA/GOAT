/**
 * 🐐 GOAT SSL CONSOLE
 * 124-Channel Digital Mixer - Absorbing SSL, Universal Audio, Waves Technology
 * 
 * Original GOAT Technology - Professional, Powerful, Beautiful
 */

const EventEmitter = require('events');

class GOATSSLConsole extends EventEmitter {
  constructor() {
    super();
    this.channels = new Map();
    this.busses = new Map();
    this.matrix = new Map();
    this.plugins = new Map();
    this.snapshots = new Map();
    this.automation = new Map();
    
    this.initializeCore();
  }

  initializeCore() {
    // SSL Console Configuration
    this.consoleConfig = {
      channels: 124,
      busses: 24,
      matrix: 12,
      groups: 8,
      masters: 2,
      sampleRate: 48000,
      floatingPoint: 32,
      totalRecall: true,
      automation: true
    };

    // Channel Types
    this.channelTypes = {
      INPUT: 'input',
      OUTPUT: 'output',
      BUS: 'bus',
      MATRIX: 'matrix',
      GROUP: 'group',
      MASTER: 'master',
      FX_RETURN: 'fx_return',
      AUX: 'aux'
    };

    // Initialize channels
    this.initializeChannels();
    this.initializeBusses();
    this.initializeSSLPlugins();
    
    this.emit('ssl-console-initialized');
  }

  // ============================================================
  // 🎛️ CHANNEL INITIALIZATION
  // ============================================================

  initializeChannels() {
    for (let i = 1; i <= this.consoleConfig.channels; i++) {
      this.createChannel(i, {
        type: i <= 96 ? this.channelTypes.INPUT : this.channelTypes.AUX,
        name: `Channel ${i}`
      });
    }
  }

  createChannel(number, config = {}) {
    const channel = {
      id: `ch-${number}`,
      number,
      name: config.name || `Channel ${number}`,
      type: config.type || this.channelTypes.INPUT,
      
      // Input
      input: config.input || null,
      inputGain: config.inputGain || 0,
      phase: config.phase || 'normal',
      phantomPower: false,
      hiPassFilter: {
        enabled: false,
        frequency: 80,
        slope: 12 // 6, 12, 18, 24 dB/oct
      },
      
      // SSL E-Channel Strip
      eq: this.createSSL_EQ(),
      dynamics: this.createSSL_Dynamics(),
      gate: this.createSSL_Gate(),
      compressor: this.createSSL_Compressor(),
      
      // Sends
      sends: this.initializeSends(),
      
      // Pan
      pan: config.pan || 0,
      stereoWidth: config.stereoWidth || 100,
      
      // Output Routing
      output: config.output || 'master',
      directOut: config.directOut || null,
      
      // Fader
      fader: config.fader || 0,
      vca: config.vca || null,
      group: config.group || null,
      
      // Mute/Solo
      mute: false,
      solo: false,
      safe: false,
      
      // Automation
      automation: {
        read: false,
        write: false,
        touch: false,
        latch: false
      },
      
      // Meter
      meter: {
        peak: -Infinity,
        rms: -Infinity,
        vU: -Infinity
      },
      
      // Inserts
      inserts: config.inserts || [],
      
      // Color (for UI)
      color: this.getChannelColor(config.type)
    };

    this.channels.set(channel.id, channel);
    return channel;
  }

  createSSL_EQ() {
    return {
      enabled: true,
      type: 'E', // E or G series
      bands: [
        { type: 'low-shelf', frequency: 60, gain: 0, q: 1 },
        { type: 'parametric', frequency: 250, gain: 0, q: 1 },
        { type: 'parametric', frequency: 1000, gain: 0, q: 1 },
        { type: 'hi-shelf', frequency: 8000, gain: 0, q: 1 }
      ]
    };
  }

  createSSL_Dynamics() {
    return {
      enabled: true,
      gate: {
        enabled: false,
        threshold: -60,
        range: -60,
        attack: 0.1,
        hold: 0.5,
        release: 100,
        hysteresis: 2
      },
      compressor: {
        enabled: false,
        threshold: -20,
        ratio: 4,
        attack: 10,
        hold: 0,
        release: 100,
        makeup: 0,
        knee: 2
      },
      expander: {
        enabled: false,
        threshold: -40,
        ratio: 2,
        attack: 10,
        release: 100
      }
    };
  }

  createSSL_Gate() {
    return {
      enabled: false,
      threshold: -60,
      range: -60,
      attack: 0.1,
      hold: 0.5,
      release: 100,
      hysteresis: 2,
      keyListen: false,
      filter: {
        type: 'lowpass',
        frequency: 2000
      }
    };
  }

  createSSL_Compressor() {
    return {
      enabled: false,
      threshold: -20,
      ratio: 4,
      attack: 10,
      hold: 0,
      release: 100,
      makeup: 0,
      knee: 2,
      sidechain: false,
      keyListen: false
    };
  }

  initializeSends() {
    const sends = [];
    for (let i = 1; i <= this.consoleConfig.busses; i++) {
      sends.push({
        busNumber: i,
        preFader: false,
        level: -Infinity,
        pan: 0
      });
    }
    return sends;
  }

  getChannelColor(type) {
    const colors = {
      input: '#4ECDC4',
      output: '#FF6B6B',
      bus: '#45B7D1',
      matrix: '#96CEB4',
      group: '#FFEAA7',
      master: '#DDA0DD',
      fx_return: '#98D8C8',
      aux: '#F7DC6F'
    };
    return colors[type] || '#FFFFFF';
  }

  // ============================================================
  // 🎛️ BUS INITIALIZATION
  // ============================================================

  initializeBusses() {
    for (let i = 1; i <= this.consoleConfig.busses; i++) {
      this.createBus(i);
    }
  }

  createBus(number) {
    const bus = {
      id: `bus-${number}`,
      number,
      name: `Bus ${number}`,
      type: this.channelTypes.BUS,
      
      // SSL E-Channel Strip
      eq: this.createSSL_EQ(),
      dynamics: this.createSSL_Dynamics(),
      
      // Sends
      sends: this.initializeSends(),
      
      // Pan & Fader
      pan: 0,
      fader: 0,
      
      // Mute/Solo
      mute: false,
      solo: false,
      
      // Meter
      meter: {
        peak: -Infinity,
        rms: -Infinity,
        vU: -Infinity
      },
      
      // Inserts
      inserts: []
    };

    this.busses.set(bus.id, bus);
    return bus;
  }

  // ============================================================
  // 🎛️ SSL PLUGIN EMULATION
  // ============================================================

  initializeSSLPlugins() {
    this.sslPlugins = {
      // SSL E-Channel
      eChannel: {
        id: 'ssl-e-channel',
        name: 'GOAT SSL E-Channel',
        type: 'channel-strip',
        description: 'Classic SSL 4000 E-Series Channel Strip',
        features: ['4-band EQ', 'Dynamics', 'Gate', 'Filter']
      },
      
      // SSL G-Channel
      gChannel: {
        id: 'ssl-g-channel',
        name: 'GOAT SSL G-Channel',
        type: 'channel-strip',
        description: 'SSL 4000 G-Series Channel Strip',
        features: ['4-band EQ', 'Dynamics', 'Filter']
      },
      
      // SSL Bus Compressor
      busCompressor: {
        id: 'ssl-bus-compressor',
        name: 'GOAT SSL Bus Compressor',
        type: 'compressor',
        description: 'Legendary SSL 4000 Bus Compressor',
        features: ['Threshold', 'Ratio', 'Attack', 'Release', 'Makeup']
      },
      
      // Vocal Rider
      vocalRider: {
        id: 'vocal-rider',
        name: 'GOAT Vocal Rider',
        type: 'automation',
        description: 'Automatic vocal level riding',
        features: ['Sensitivity', 'Range', 'Speed', 'Target']
      },
      
      // Waves SSL E-Channel
      wavesSSL: {
        id: 'waves-ssl-e-channel',
        name: 'GOAT Waves SSL E-Channel',
        type: 'channel-strip',
        description: 'Waves SSL 4000 E-Channel Emulation',
        features: ['4-band EQ', 'Dynamics', 'Gate', 'Filter', 'Analog']
      },
      
      // Vocalign
      vocalign: {
        id: 'vocalign',
        name: 'GOAT Vocalign',
        type: 'vocal-alignment',
        description: 'Automatic vocal alignment',
        features: ['Alignment', 'Tightness', 'Timing', 'Pitch']
      }
    };
  }

  // ============================================================
  // 🎛️ CHANNEL OPERATIONS
  // ============================================================

  setChannelFader(channelId, level) {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }

    channel.fader = level;
    this.emit('fader-changed', { channelId, level });
    return channel;
  }

  setChannelPan(channelId, pan) {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }

    channel.pan = Math.max(-100, Math.min(100, pan));
    this.emit('pan-changed', { channelId, pan });
    return channel;
  }

  setChannelMute(channelId, mute) {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }

    channel.mute = mute;
    this.emit('mute-changed', { channelId, mute });
    return channel;
  }

  setChannelSolo(channelId, solo) {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }

    // Solo logic - when one channel is soloed, all others are muted
    if (solo) {
      this.channels.forEach(ch => {
        if (ch.id !== channelId) {
          ch.soloSafe = ch.mute;
          ch.mute = true;
        }
      });
    } else {
      this.channels.forEach(ch => {
        if (ch.id !== channelId) {
          ch.mute = ch.soloSafe || false;
          ch.soloSafe = false;
        }
      });
    }

    channel.solo = solo;
    this.emit('solo-changed', { channelId, solo });
    return channel;
  }

  // ============================================================
  // 🎛️ SSL EQ OPERATIONS
  // ============================================================

  setEQBand(channelId, bandIndex, parameter, value) {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }

    if (!channel.eq.bands[bandIndex]) {
      throw new Error('EQ band not found');
    }

    channel.eq.bands[bandIndex][parameter] = value;
    this.emit('eq-changed', { channelId, bandIndex, parameter, value });
    return channel;
  }

  enableEQ(channelId, enabled) {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }

    channel.eq.enabled = enabled;
    this.emit('eq-enabled', { channelId, enabled });
    return channel;
  }

  // ============================================================
  // 🎛️ SSL DYNAMICS OPERATIONS
  // ============================================================

  setCompressor(channelId, parameter, value) {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }

    channel.dynamics.compressor[parameter] = value;
    this.emit('compressor-changed', { channelId, parameter, value });
    return channel;
  }

  enableCompressor(channelId, enabled) {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }

    channel.dynamics.compressor.enabled = enabled;
    this.emit('compressor-enabled', { channelId, enabled });
    return channel;
  }

  setGate(channelId, parameter, value) {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }

    channel.dynamics.gate[parameter] = value;
    this.emit('gate-changed', { channelId, parameter, value });
    return channel;
  }

  enableGate(channelId, enabled) {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error('Channel');
    }

    channel.dynamics.gate.enabled = enabled;
    this.emit('gate-enabled', { channelId, enabled });
    return channel;
  }

  // ============================================================
  // 🎛️ SEND OPERATIONS
  // ============================================================

  setSendLevel(channelId, busNumber, level) {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }

    const send = channel.sends.find(s => s.busNumber === busNumber);
    if (!send) {
      throw new Error('Send not found');
    }

    send.level = level;
    this.emit('send-changed', { channelId, busNumber, level });
    return channel;
  }

  toggleSendPreFader(channelId, busNumber) {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }

    const send = channel.sends.find(s => s.busNumber === busNumber);
    if (!send) {
      throw new Error('Send not found');
    }

    send.preFader = !send.preFader;
    this.emit('send-pre-post-changed', { channelId, busNumber, preFader: send.preFader });
    return channel;
  }

  // ============================================================
  // 🎛️ PLUGIN OPERATIONS
  // ============================================================

  insertPlugin(channelId, pluginId) {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }

    const plugin = this.sslPlugins[pluginId];
    if (!plugin) {
      throw new Error('Plugin not found');
    }

    const insert = {
      id: `insert-${Date.now()}`,
      pluginId,
      name: plugin.name,
      bypassed: false,
      parameters: {},
      position: channel.inserts.length
    };

    channel.inserts.push(insert);
    this.emit('plugin-inserted', { channelId, insert });
    return insert;
  }

  // ============================================================
  // 🎛️ SNAPSHOT & RECALL
  // ============================================================

  createSnapshot(name) {
    const snapshot = {
      id: `snapshot-${Date.now()}`,
      name: name || `Snapshot ${this.snapshots.size + 1}`,
      timestamp: new Date().toISOString(),
      
      channels: Array.from(this.channels.values()).map(ch => ({
        id: ch.id,
        fader: ch.fader,
        pan: ch.pan,
        mute: ch.mute,
        eq: JSON.parse(JSON.stringify(ch.eq)),
        dynamics: JSON.parse(JSON.stringify(ch.dynamics)),
        sends: JSON.parse(JSON.stringify(ch.sends))
      })),
      
      busses: Array.from(this.busses.values()).map(bus => ({
        id: bus.id,
        fader: bus.fader,
        pan: bus.pan,
        mute: bus.mute,
        eq: JSON.parse(JSON.stringify(bus.eq))
      }))
    };

    this.snapshots.set(snapshot.id, snapshot);
    this.emit('snapshot-created', snapshot);
    return snapshot;
  }

  recallSnapshot(snapshotId) {
    const snapshot = this.snapshots.get(snapshotId);
    if (!snapshot) {
      throw new Error('Snapshot not found');
    }

    // Restore channels
    snapshot.channels.forEach(chData => {
      const channel = this.channels.get(chData.id);
      if (channel) {
        channel.fader = chData.fader;
        channel.pan = chData.pan;
        channel.mute = chData.mute;
        channel.eq = JSON.parse(JSON.stringify(chData.eq));
        channel.dynamics = JSON.parse(JSON.stringify(chData.dynamics));
        channel.sends = JSON.parse(JSON.stringify(chData.sends));
      }
    });

    // Restore busses
    snapshot.busses.forEach(busData => {
      const bus = this.busses.get(busData.id);
      if (bus) {
        bus.fader = busData.fader;
        bus.pan = busData.pan;
        bus.mute = busData.mute;
        bus.eq = JSON.parse(JSON.stringify(busData.eq));
      }
    });

    this.emit('snapshot-recalled', snapshot);
    return snapshot;
  }

  // ============================================================
  // 🎛️ MIXER UTILITIES
  // ============================================================

  getConsoleState() {
    return {
      config: this.consoleConfig,
      channels: Array.from(this.channels.values()),
      busses: Array.from(this.busses.values()),
      plugins: Object.values(this.sslPlugins),
      snapshots: Array.from(this.snapshots.values())
    };
  }

  getChannelMeter(channelId) {
    const channel = this.channels.get(channelId);
    if (!channel) {
      return null;
    }

    return {
      channelId,
      peak: channel.meter.peak,
      rms: channel.meter.rms,
      vU: channel.meter.vU,
      reduction: channel.dynamics.compressor.enabled ? 
        Math.max(0, channel.dynamics.compressor.threshold - channel.fader) : 0
    };
  }
}

module.exports = GOATSSLConsole;