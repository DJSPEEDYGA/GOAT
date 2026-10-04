'use strict';
// Evidence Core — immutable original captures + separate annotation layers.
// Rules enforced here: originals are never modified; every observation must
// reference real evidence; integrity is sha256-verifiable.

const crypto = require('crypto');
const { CAPTURE_MODES, CAPTURE_SIDES } = require('../shared');

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Create an immutable evidence record for an original capture.
// data may be a Buffer/base64 string; if only a precomputed hash is supplied,
// the record is marked hashOnly so reviewers know the blob lives elsewhere.
function createEvidenceRecord({ data, hash, side, mode, deviceMeta, capturedAt }) {
  if (!CAPTURE_SIDES.includes(side)) throw new Error(`invalid side: ${side}`);
  if (!CAPTURE_MODES.includes(mode)) throw new Error(`invalid mode: ${mode}`);
  const digest = data ? sha256(data) : hash;
  if (!digest || !/^[0-9a-f]{64}$/.test(digest)) throw new Error('sha256 required');
  return {
    id: 'EV-' + crypto.randomUUID(),
    sha256: digest,
    hashOnly: !data,
    side,
    mode,
    capturedAt: capturedAt || new Date().toISOString(),
    deviceMeta: deviceMeta || {},
    immutable: true,
  };
}

// Annotations live on a separate layer and never touch the original.
function createAnnotation(evidenceId, defect) {
  if (!evidenceId) throw new Error('annotation requires evidenceId');
  return {
    id: 'ANN-' + crypto.randomUUID(),
    evidenceId,
    type: defect.type || 'defect',
    // normalized coordinates on the original capture
    x: defect.x ?? null,
    y: defect.y ?? null,
    w: defect.w ?? null,
    h: defect.h ?? null,
    note: defect.note || '',
    createdAt: new Date().toISOString(),
  };
}

// An observation is only valid if it cites existing evidence.
function validateObservation(obs, evidenceRecords) {
  const ids = new Set(evidenceRecords.map(e => e.id));
  if (!obs.evidenceId) return { ok: false, reason: 'observation must reference evidence' };
  if (!ids.has(obs.evidenceId)) return { ok: false, reason: `unknown evidence ${obs.evidenceId}` };
  return { ok: true };
}

function verifyRecord(record, data) {
  return record.sha256 === sha256(data);
}

module.exports = { sha256, createEvidenceRecord, createAnnotation, validateObservation, verifyRecord };
