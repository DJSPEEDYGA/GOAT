'use strict';
// GemCore smoke test — file presence + full API flow:
// intake → capture → observation → review → QC → grade → seal → verify.

const fs = require('fs');
const assert = require('assert');
const path = require('path');
const { spawn } = require('child_process');

const paths = ['apps/api/server.js', 'apps/web/index.html', 'apps/web/app.js', 'apps/web/styles.css',
  'packages/agent-core/index.js', 'packages/vision-core/index.js', 'packages/grading-engine/index.js',
  'packages/evidence-core/index.js', 'packages/shared/index.js', 'database/schema.sql'];
for (const p of paths) assert(fs.existsSync(p), 'Missing ' + p);

// packages unit checks (no server needed)
const { VisionCore } = require('../packages/vision-core');
const evidence = require('../packages/evidence-core');
const grading = require('../packages/grading-engine');

(async () => {
  const vc = new VisionCore();
  const r = await vc.analyze('surface', null);
  assert.equal(r.status, 'unavailable'); // honest: no adapter, no fake result

  const rec = evidence.createEvidenceRecord({ data: Buffer.from('frame'), side: 'front', mode: 'visible' });
  assert(/^[0-9a-f]{64}$/.test(rec.sha256));
  assert.equal(evidence.verifyRecord(rec, Buffer.from('frame')), true);
  assert.equal(evidence.verifyRecord(rec, Buffer.from('tampered')), false);
  assert.equal(evidence.validateObservation({ evidenceId: rec.id }, [rec]).ok, true);
  assert.equal(evidence.validateObservation({}, [rec]).ok, false);

  // seal gate: unapproved QC blocks certification
  const blocked = grading.evaluate({ captures: [{}], observations: [], measurements: { centering: { score: 980 } }, qc: { approved: false } });
  assert.equal(blocked.status, 'blocked');
  const ok = grading.evaluate({ captures: [{}], observations: [], measurements: { centering: { score: 980 }, surface: { score: 950 } }, qc: { approved: true } });
  assert.equal(ok.status, 'sealable');
  const demo = grading.evaluate({ demo: true, captures: [{}], measurements: { centering: { score: 1000 } }, qc: { approved: true } });
  assert.equal(demo.status, 'demo'); // demo can never certify

  // server flow
  const PORT = 4399;
  const srv = spawn(process.execPath, ['apps/api/server.js'], {
    env: { ...process.env, GEMCORE_PORT: String(PORT), GEMCORE_DATA_DIR: path.join(__dirname, '.tmp') },
    stdio: 'ignore',
  });
  await new Promise(res => setTimeout(res, 1200));
  const j = async (p, m, b) => (await fetch('http://127.0.0.1:' + PORT + p,
    { method: m || 'GET', headers: { 'Content-Type': 'application/json' }, body: b ? JSON.stringify(b) : undefined })).json();

  try {
    const h = await j('/api/health');
    assert.equal(h.ok, true);

    const s = await j('/api/submissions', 'POST', { item: { name: 'Test Card' } });
    assert(/^GCG-/.test(s.id));

    const cap = await j(`/api/submissions/${s.id}/captures`, 'POST',
      { data: 'fake-image-bytes', side: 'front', mode: 'visible' });
    assert(cap.sha256);

    // observation without evidence must be refused
    const bad = await j(`/api/submissions/${s.id}/observations`, 'POST', { note: 'scratch' });
    assert(bad.error);

    const obs = await j(`/api/submissions/${s.id}/observations`, 'POST',
      { evidenceId: cap.id, note: 'edge wear', lane: 'edges', severity: 0.2 });
    assert(obs.id);

    await j(`/api/submissions/${s.id}/observations/${obs.id}/review`, 'POST', { decision: 'confirmed' });
    await j(`/api/submissions/${s.id}/measurements`, 'POST', { lane: 'centering', score: 920 });
    await j(`/api/submissions/${s.id}/qc`, 'POST', { approved: true });

    const ev = await j(`/api/submissions/${s.id}/grade`, 'POST', {});
    assert.equal(ev.status, 'sealable');

    const seal = await j(`/api/submissions/${s.id}/seal`, 'POST', {});
    assert.equal(seal.ok, true);
    assert(seal.certId);

    const v = await j('/api/verify/' + s.id);
    assert.equal(v.verified, true);
    assert.equal(v.publicGrade, seal.publicGrade);
    assert.equal(v.demo, false);

    const aud = await j(`/api/submissions/${s.id}/audit`);
    assert(aud.trail.length >= 6);
  } finally {
    srv.kill();
    fs.rmSync(path.join(__dirname, '.tmp'), { recursive: true, force: true });
  }
  console.log('GemCore smoke test OK');
})().catch(e => { console.error(e); process.exit(1); });
