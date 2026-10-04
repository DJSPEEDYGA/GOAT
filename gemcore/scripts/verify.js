'use strict';
// GemCore engine verification — exercises the real package APIs end-to-end:
// immutable evidence → observation gating → VisionCore honesty →
// lane scoring → QC-gated sealing. Run: node scripts/verify.js

const assert = require('assert');
const { VisionCore } = require('../packages/vision-core');
const evidence = require('../packages/evidence-core');
const grading = require('../packages/grading-engine');
const { LANES, CAPTURE_SIDES, CAPTURE_MODES } = require('../packages/shared');
const { SpatialSession } = require('../packages/spatial-core');

async function main() {
  // ── evidence-core ──────────────────────────────────────────────
  const rec = evidence.createEvidenceRecord({
    data: Buffer.from('gemcore-verify-capture'),
    side: 'front',
    mode: 'visible',
  });
  assert.match(rec.id, /^EV-/, 'evidence id');
  assert.strictEqual(rec.immutable, true);
  assert.ok(evidence.verifyRecord(rec, Buffer.from('gemcore-verify-capture')), 'sha256 verify');
  assert.ok(!evidence.verifyRecord(rec, Buffer.from('tampered')), 'sha256 rejects tampering');
  assert.strictEqual(evidence.validateObservation({ evidenceId: rec.id }, [rec]).ok, true);
  assert.strictEqual(evidence.validateObservation({ evidenceId: 'EV-nope' }, [rec]).ok, false,
    'observation must cite real evidence');
  assert.throws(() => evidence.createEvidenceRecord({ hash: 'zz', side: 'front', mode: 'visible' }),
    /sha256 required/);
  assert.throws(() => evidence.createEvidenceRecord({ data: Buffer.from('x'), side: 'side', mode: 'visible' }),
    /invalid side/);

  // ── vision-core: honest unavailability without an adapter ─────
  const vision = new VisionCore();
  const unavail = await vision.analyze('centering', rec);
  assert.strictEqual(unavail.status, 'unavailable', 'no adapter → unavailable, never faked');
  vision.registerAdapter({
    id: 'verify-stub', capabilities: ['centering'],
    analyze: async () => ({ confidence: 0.9, result: { left: 49.9, right: 50.1 } }),
  });
  const ok = await vision.analyze('centering', rec);
  assert.strictEqual(ok.status, 'ok');
  assert.strictEqual(ok.reviewerDisposition, 'pending', 'AI output needs human review');
  assert.strictEqual((await vision.analyze('surface', rec)).status, 'unavailable');

  // ── grading-engine: blocked states ────────────────────────────
  const blank = { id: 'GC-T0', demo: false };
  assert.strictEqual(grading.evaluate(blank).status, 'blocked', 'no evidence → blocked');

  const pending = {
    id: 'GC-T1', demo: false, captures: [rec], observations: [{ lane: 'surface', severity: 0.2, reviewerDisposition: 'pending' }],
    measurements: { surface: { score: 900 } }, qc: { approved: true },
  };
  const pe = grading.evaluate(pending);
  assert.strictEqual(pe.status, 'blocked');
  assert.ok(pe.blockers.some(b => /awaiting reviewer/.test(b)));
  assert.strictEqual(grading.seal(pending, pe).ok, false, 'seal forbidden while blocked');

  const demo = { id: 'GC-T2', demo: true, captures: [rec], measurements: { surface: { score: 900 } }, qc: { approved: true } };
  assert.strictEqual(grading.evaluate(demo).status, 'demo', 'demo can never certify');

  // ── grading-engine: full seal path ────────────────────────────
  const full = {
    id: 'GC-T3', demo: false, captures: [rec], observations: [],
    measurements: Object.fromEntries(LANES.map(l => [l, { score: 980 }])),
    qc: { approved: true, reviewer: 'verify' },
  };
  const ev = grading.evaluate(full);
  assert.strictEqual(ev.status, 'sealable', JSON.stringify(ev.blockers));
  assert.strictEqual(ev.publicGrade, 10);
  assert.ok(ev.marketValueExcluded && ev.authenticitySeparate, 'integrity flags');

  // weak lane pulls the index down (Beckett-style weighting)
  const weak = { ...full, measurements: { ...full.measurements, corners: { score: 500 } } };
  assert.ok(grading.evaluate(weak).internalConditionIndex < ev.internalConditionIndex);

  const sealed = grading.seal(full, ev);
  assert.ok(sealed.ok && sealed.certId === 'GC-T3', 'seal issues cert');

  // ── spatial-core: CardLock gates observations ─────────────────
  const sess = new SpatialSession();
  assert.throws(() => sess.addObservation({ type: 'defect' }), /CardLock required/);
  sess.setAnchors([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]);
  assert.throws(() => sess.setAnchors([{ x: 0, y: 0 }]), /four corners/);
  assert.strictEqual(sess.addObservation({ type: 'defect' }).reviewerDisposition, 'pending');

  console.log('GemCore engine verification OK —', CAPTURE_SIDES.length, 'sides,',
    CAPTURE_MODES.length, 'modes,', LANES.length, 'lanes, grade', sealed.publicGrade);
}

main().catch(e => { console.error('verification FAILED:', e.message); process.exit(1); });
