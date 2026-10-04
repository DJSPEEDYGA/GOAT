'use strict';
// VisionCore — AI inspection interface layer.
// Design rule from the handoff: implement the interface first, then real
// adapters. NEVER invent analysis results when no adapter/model is available.

const crypto = require('crypto');
const { ALGORITHM_VERSION } = require('../shared');

const CAPABILITIES = [
  'centering',      // front/back centering measurement
  'corners',        // individual corner localization
  'edges',          // edge mapping
  'surface',        // surface anomaly / defect detection
  'dimensions',     // physical dimension measurement
  'authenticity',   // alteration / counterfeit support signal
  'calibration',    // capture quality / calibration check
];

class VisionCore {
  constructor() {
    this.adapters = new Map();
  }

  registerAdapter(adapter) {
    if (!adapter?.id || typeof adapter.analyze !== 'function') {
      throw new Error('adapter must have id and analyze(evidence)');
    }
    const caps = adapter.capabilities || [];
    this.adapters.set(adapter.id, { ...adapter, capabilities: caps.filter(c => CAPABILITIES.includes(c)) });
    return adapter;
  }

  adaptersFor(capability) {
    return [...this.adapters.values()].filter(a => a.capabilities.includes(capability));
  }

  status() {
    return [...this.adapters.values()].map(a => ({
      id: a.id, name: a.name || a.id, capabilities: a.capabilities,
    }));
  }

  // Run analysis for a capability against an evidence record.
  // Honest contract: without an adapter this returns unavailable — no fake data.
  async analyze(capability, evidenceRecord, ctx = {}) {
    if (!CAPABILITIES.includes(capability)) {
      return { status: 'error', reason: `unknown capability ${capability}` };
    }
    const adapters = this.adaptersFor(capability);
    if (!adapters.length) {
      return {
        status: 'unavailable',
        reason: 'no calibrated VisionCore adapter registered for ' + capability,
        capability,
        evidenceId: evidenceRecord?.id || null,
        algorithmVersion: ALGORITHM_VERSION,
      };
    }
    const adapter = adapters[0];
    const raw = await adapter.analyze(evidenceRecord, ctx);
    return {
      status: 'ok',
      capability,
      adapter: adapter.id,
      evidenceId: evidenceRecord?.id || null,
      confidence: raw.confidence ?? null,
      result: raw.result ?? null,
      coordinates: raw.coordinates || null,
      algorithmVersion: ALGORITHM_VERSION,
      id: 'ANA-' + crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      // AI output is a suggestion until a human reviewer confirms it.
      reviewerDisposition: 'pending',
    };
  }
}

module.exports = { VisionCore, CAPABILITIES };
