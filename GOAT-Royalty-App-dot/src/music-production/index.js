/**
 * 🐐 GOAT MUSIC PRODUCTION SUITE
 * Unified Entry Point - All Music Production Technologies
 * 
 * Absorbing & Recreating: Avid, Native Instruments Komplete 15, Arturia V Collection 11
 * Original GOAT Technology - Lightweight, Beautiful, Flexible
 */

const GOATInstrumentsCore = require('./goat-instruments-core');
const GOATSampler = require('./goat-sampler');
const GOATEffectsRack = require('./goat-effects-rack');

class GOATMusicProductionSuite {
  constructor() {
    this.instrumentsCore = new GOATInstrumentsCore();
    this.sampler = new GOATSampler();
    this.effectsRack = new GOATEffectsRack();
    
    this.initializeSuite();
  }

  initializeSuite() {
    // Initialize all modules
    this.instrumentsCore.initializeAllInstruments();
    
    // Set up inter-module communication
    this.setupEventConnections();
    
    console.log('🐐 GOAT Music Production Suite Initialized');
    console.log('   - GOAT Instruments Core: Ready');
    console.log('   - GOAT Sampler: Ready');
    console.log('   - GOAT Effects Rack: Ready');
  }

  setupEventConnections() {
    // Connect events between modules
    this.instrumentsCore.on('instrument-loaded', (instance) => {
      this.sampler.emit('goat-instrument-loaded', instance);
    });

    this.sampler.on('instrument-created', (instrument) => {
      this.instrumentsCore.emit('sampler-instrument-created', instrument);
    });

    this.effectsRack.on('rack-created', (rack) => {
      this.instrumentsCore.emit('effects-rack-created', rack);
    });
  }

  // ============================================================
  // 🐹 UNIFIED API
  // ============================================================

  // Instruments
  getInstruments(category = null) {
    return this.instrumentsCore.browseInstruments(category);
  }

  loadInstrument(instrumentId) {
    return this.instrumentsCore.loadInstrument(instrumentId);
  }

  // Sampling
  createSamplerInstrument(name, config) {
    return this.sampler.createInstrument(name, config);
  }

  // Effects
  createEffectsRack(name, config) {
    return this.effectsRack.createRack(name, config);
  }

  // Presets
  loadPreset(presetId) {
    return this.instrumentsCore.loadPreset(presetId);
  }

  // Performance
  getPerformanceMetrics() {
    return this.instrumentsCore.getPerformanceMetrics();
  }

  // ============================================================
  // 🐹 STATS & INFO
  // ============================================================

  getSuiteInfo() {
    return {
      name: 'GOAT Music Production Suite',
      version: '1.0.0',
      modules: {
        instruments: {
          total: this.instrumentsCore.instruments.size,
          categories: Object.keys(this.instrumentsCore.categories).length
        },
        sampler: {
          instruments: this.sampler.instruments.size,
          libraries: this.sampler.libraries.size
        },
        effects: {
          total: this.effectsRack.effects.size,
          categories: ['guitar', 'modulation', 'dynamics', 'equalizer', 'reverb', 'delay', 'saturation', 'filter', 'mastering']
        }
      },
      features: {
        lightweight: true,
        beautifulUI: true,
        flexible: true,
        optimized: true,
        crossPlatform: true
      }
    };
  }
}

module.exports = GOATMusicProductionSuite;