'use strict';
// GemCore standalone API + static web host.
// Evidence rules: originals immutable, observations cite evidence,
// authenticity separate from condition, market value never affects grade,
// no certified seal without verified evidence + human QC.

const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const { AgentBus } = require('../../packages/agent-core');
const { VisionCore } = require('../../packages/vision-core');
const evidence = require('../../packages/evidence-core');
const grading = require('../../packages/grading-engine');
const { CAPTURE_MODES, CAPTURE_SIDES, STATUSES, RUBRIC_VERSION } = require('../../packages/shared');

const agentDefs = require('./agents');
const agentBus = new AgentBus();
agentDefs.forEach(a => agentBus.register(a));
const vision = new VisionCore(); // adapters register here when real models land

const app = express();
const PORT = process.env.GEMCORE_PORT || 4300;
const root = path.resolve(__dirname, '../..');
const dataDir = path.resolve(root, process.env.GEMCORE_DATA_DIR || 'data');
const dbFile = path.join(dataDir, 'submissions.json');
const auditFile = path.join(dataDir, 'audit.jsonl');

fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, '[]');
if (!fs.existsSync(auditFile)) fs.writeFileSync(auditFile, '');

const read = () => JSON.parse(fs.readFileSync(dbFile, 'utf8'));
const write = x => fs.writeFileSync(dbFile, JSON.stringify(x, null, 2));

function audit(submissionId, action, detail = {}) {
  const rec = { submissionId, action, detail, at: new Date().toISOString() };
  fs.appendFileSync(auditFile, JSON.stringify(rec) + '\n');
}

function findSub(res, id) {
  const s = read().find(v => v.id === id);
  if (!s) { res.sendStatus(404); return null; }
  return s;
}

function updateSub(id, fn) {
  const all = read();
  const s = all.find(v => v.id === id);
  if (!s) return null;
  fn(s);
  s.updatedAt = new Date().toISOString();
  write(all);
  return s;
}

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(root, 'apps/web')));
app.use('/capture-core', express.static(path.join(root, 'packages/capture-core')));

// ── Health / agents ──────────────────────────────────────────────────────
app.get('/api/health', (_q, r) => r.json({
  ok: true, service: 'gemcore', version: '0.1.0-preactive',
  agents: agentBus.status().length, visionAdapters: vision.status().length,
  rubric: RUBRIC_VERSION,
}));

app.get('/api/agents', (_q, r) => r.json(agentBus.status()));
app.post('/api/agents/:id/run', async (q, r) => {
  try { r.json(await agentBus.run(q.params.id, q.body || {})); }
  catch (e) { r.status(400).json({ error: e.message }); }
});

app.get('/api/vision/status', (_q, r) => r.json({
  adapters: vision.status(),
  note: 'no adapter registered = analysis honestly unavailable, never faked',
}));

// ── Submissions ──────────────────────────────────────────────────────────
app.get('/api/submissions', (_q, r) => r.json(read()));

app.post('/api/submissions', (q, r) => {
  const all = read();
  const s = {
    id: 'GCG-' + Date.now(),
    createdAt: new Date().toISOString(),
    status: STATUSES.INTAKE,
    demo: !!q.body.demo,
    item: q.body.item || {},
    captures: [], evidence: [], annotations: [], observations: [],
    measurements: {}, analysis: [],
    qc: { approved: false },
  };
  all.unshift(s); write(all);
  audit(s.id, 'submission-created', { demo: s.demo });
  r.status(201).json(s);
});

app.get('/api/submissions/:id', (q, r) => {
  const s = findSub(r, q.params.id); if (!s) return;
  r.json(s);
});

app.get('/api/submissions/:id/audit', (q, r) => {
  const s = findSub(r, q.params.id); if (!s) return;
  const lines = fs.readFileSync(auditFile, 'utf8').trim().split('\n').filter(Boolean);
  const trail = lines.map(l => JSON.parse(l)).filter(e => e.submissionId === s.id);
  r.json({ submissionId: s.id, trail });
});

// ── Evidence captures (immutable originals) ─────────────────────────────
app.post('/api/submissions/:id/captures', (q, r) => {
  const s = findSub(r, q.params.id); if (!s) return;
  try {
    const rec = evidence.createEvidenceRecord({
      data: q.body.data || null,
      hash: q.body.sha256 || null,
      side: q.body.side,
      mode: q.body.mode,
      deviceMeta: q.body.deviceMeta,
    });
    updateSub(s.id, x => {
      x.captures.push({ ...rec, storedData: q.body.data || null });
      if (x.status === STATUSES.INTAKE) x.status = STATUSES.CAPTURING;
    });
    audit(s.id, 'capture-recorded', { captureId: rec.id, side: rec.side, mode: rec.mode, sha256: rec.sha256 });
    r.status(201).json(rec);
  } catch (e) { r.status(400).json({ error: e.message }); }
});

// Verify a capture's integrity against a supplied blob.
app.post('/api/submissions/:id/captures/:capId/verify', (q, r) => {
  const s = findSub(r, q.params.id); if (!s) return;
  const cap = (s.captures || []).find(c => c.id === q.params.capId);
  if (!cap) return r.sendStatus(404);
  const ok = q.body.data ? evidence.verifyRecord(cap, q.body.data) : null;
  r.json({ captureId: cap.id, sha256: cap.sha256, verified: ok, hashOnly: cap.hashOnly });
});

// ── Annotations (separate overlay layer) ────────────────────────────────
app.post('/api/submissions/:id/captures/:capId/annotations', (q, r) => {
  const s = findSub(r, q.params.id); if (!s) return;
  const cap = (s.captures || []).find(c => c.id === q.params.capId);
  if (!cap) return r.status(400).json({ error: 'unknown capture' });
  const ann = evidence.createAnnotation(cap.id, q.body);
  updateSub(s.id, x => x.annotations.push(ann));
  audit(s.id, 'annotation-added', { captureId: cap.id, annotationId: ann.id });
  r.status(201).json(ann);
});

// ── Measurements (per-lane, human or instrument entered) ────────────────
app.post('/api/submissions/:id/measurements', (q, r) => {
  const s = findSub(r, q.params.id); if (!s) return;
  const lane = q.body.lane;
  if (typeof q.body.score !== 'number' || q.body.score < 0 || q.body.score > 1000) {
    return r.status(400).json({ error: 'score must be 0..1000 (internal condition index)' });
  }
  updateSub(s.id, x => {
    x.measurements[lane] = {
      score: q.body.score, detail: q.body.detail || {},
      captureId: q.body.captureId || null,
      updatedAt: new Date().toISOString(),
    };
  });
  audit(s.id, 'measurement-recorded', { lane, score: q.body.score });
  r.json({ ok: true, lane, score: q.body.score });
});

// ── Observations (AI or human; must cite evidence; reviewer gate) ───────
app.post('/api/submissions/:id/observations', (q, r) => {
  const s = findSub(r, q.params.id); if (!s) return;
  const check = evidence.validateObservation(q.body, s.captures || []);
  if (!check.ok) return r.status(400).json({ error: check.reason });
  const obs = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    reviewerDisposition: 'pending',
    source: q.body.source || 'human',
    confidence: q.body.confidence ?? null,
    ...q.body,
  };
  updateSub(s.id, x => x.observations.push(obs));
  audit(s.id, 'observation-added', { observationId: obs.id, evidenceId: obs.evidenceId });
  r.status(201).json(obs);
});

// Human reviewer confirms or rejects an AI/human observation.
app.post('/api/submissions/:id/observations/:obsId/review', (q, r) => {
  const s = findSub(r, q.params.id); if (!s) return;
  const decision = q.body.decision;
  if (!['confirmed', 'rejected'].includes(decision)) {
    return r.status(400).json({ error: 'decision must be confirmed|rejected' });
  }
  const out = updateSub(s.id, x => {
    const o = x.observations.find(o => o.id === q.params.obsId);
    if (!o) throw new Error('no-obs');
    o.reviewerDisposition = decision;
    o.reviewer = q.body.reviewer || 'Human QC';
    o.reviewedAt = new Date().toISOString();
  });
  if (!out) return r.sendStatus(404);
  audit(s.id, 'observation-reviewed', { observationId: q.params.obsId, decision });
  r.json({ ok: true });
});

// ── VisionCore analysis (honest: unavailable without adapters) ──────────
app.post('/api/submissions/:id/analyze', async (q, r) => {
  const s = findSub(r, q.params.id); if (!s) return;
  const capability = q.body.capability || 'surface';
  const cap = (s.captures || []).find(c => c.id === q.body.captureId) || (s.captures || [])[0] || null;
  const result = await vision.analyze(capability, cap, { submissionId: s.id });
  updateSub(s.id, x => x.analysis.push(result));
  audit(s.id, 'analysis-run', { capability, status: result.status });
  r.json(result);
});

// ── Grading + seal ───────────────────────────────────────────────────────
app.post('/api/submissions/:id/grade', (q, r) => {
  const s = findSub(r, q.params.id); if (!s) return;
  const evaluation = grading.evaluate(s);
  updateSub(s.id, x => { x.evaluation = evaluation; if (x.status === STATUSES.CAPTURING || x.status === STATUSES.ANALYZED) x.status = STATUSES.QC_REQUIRED; });
  audit(s.id, 'grade-evaluated', { index: evaluation.internalConditionIndex, status: evaluation.status });
  r.json(evaluation);
});

app.post('/api/submissions/:id/qc', (q, r) => {
  const s = findSub(r, q.params.id); if (!s) return;
  const out = updateSub(s.id, x => {
    x.qc = { approved: !!q.body.approved, reviewer: q.body.reviewer || 'Human QC', at: new Date().toISOString(), note: q.body.note || '' };
    x.status = x.qc.approved ? STATUSES.QC_APPROVED : STATUSES.QC_REQUIRED;
  });
  audit(s.id, 'qc-review', { approved: !!q.body.approved });
  r.json(out.qc);
});

app.post('/api/submissions/:id/seal', (q, r) => {
  const s = findSub(r, q.params.id); if (!s) return;
  const evaluation = s.evaluation || grading.evaluate(s);
  const res = grading.seal(s, evaluation);
  if (!res.ok) return r.status(403).json(res);
  updateSub(s.id, x => { x.status = STATUSES.CERTIFIED; x.certificate = res; });
  audit(s.id, 'grade-sealed', { certId: res.certId, publicGrade: res.publicGrade });
  r.json(res);
});

// ── Evidence passport (full chain) + privacy-safe public verify ─────────
app.get('/api/submissions/:id/passport', (q, r) => {
  const s = findSub(r, q.params.id); if (!s) return;
  r.json({
    certId: s.id, status: s.status, demo: !!s.demo,
    item: s.item, captures: s.captures || [], annotations: s.annotations || [],
    observations: s.observations || [], measurements: s.measurements || {},
    analysis: s.analysis || [], qc: s.qc, certificate: s.certificate || null,
    transparency: {
      originalsImmutable: true, annotationsSeparate: true,
      authenticitySeparate: true, marketAffectsGrade: false,
      rubric: RUBRIC_VERSION,
    },
  });
});

// PUBLIC verification — privacy-safe subset only.
app.get('/api/verify/:certId', (q, r) => {
  const s = read().find(v => v.id === q.params.certId || (v.certificate || {}).certId === q.params.certId);
  if (!s) return r.status(404).json({ verified: false, reason: 'unknown certificate' });
  const certified = s.status === STATUSES.CERTIFIED;
  r.json({
    verified: certified,
    certId: s.id,
    status: s.status,
    demo: !!s.demo,
    publicGrade: certified ? s.certificate.publicGrade : null,
    sealedAt: certified ? s.certificate.sealedAt : null,
    item: { name: s.item?.name || null, set: s.item?.set || null, year: s.item?.year || null },
    qcApproved: !!s.qc?.approved,
    algorithmVersion: s.certificate?.algorithmVersion || RUBRIC_VERSION,
  });
});

// ── Population report (derived, honest zeros) ────────────────────────────
app.get('/api/population', (_q, r) => {
  const all = read();
  const byGrade = {};
  for (const s of all.filter(x => x.status === STATUSES.CERTIFIED && x.certificate)) {
    const g = String(x.certificate.publicGrade);
    byGrade[g] = (byGrade[g] || 0) + 1;
  }
  r.json({
    total: all.length,
    certified: all.filter(x => x.status === STATUSES.CERTIFIED).length,
    inPipeline: all.filter(x => x.status !== STATUSES.CERTIFIED).length,
    byGrade,
  });
});

// ── Money Penny — the AI in control. Proxies to her llama.cpp server.
//    GEMCORE_MP_URL points at an OpenAI-compatible endpoint
//    (e.g. http://127.0.0.1:10086 on the Jetson). Honest offline state
//    when she's unreachable — never fakes an answer.
const MP_URL = process.env.GEMCORE_MP_URL || 'http://127.0.0.1:10086';
const MP_MODEL = process.env.GEMCORE_MP_MODEL || 'moneypenny';
const MP_KNOWLEDGE = require('../../packages/shared/moneypenny-knowledge');

app.get('/api/mp/status', async (_q, r) => {
  try {
    const c = new AbortController(); setTimeout(() => c.abort(), 2500);
    const res = await fetch(MP_URL + '/health', { signal: c.signal }).catch(() => null);
    r.json({ online: !!res?.ok, url: MP_URL });
  } catch { r.json({ online: false, url: MP_URL }); }
});

const mpLastHit = new Map(); // per-IP cooldown — protects her GPU on public endpoints
app.post('/api/mp/chat', async (q, r) => {
  const ip = q.ip || 'x';
  const now = Date.now();
  if (now - (mpLastHit.get(ip) || 0) < 4000) return r.status(429).json({ reply: 'Easy — one question at a time. Money Penny is thinking.' });
  mpLastHit.set(ip, now);
  const sub = q.body.submissionId ? read().find(v => v.id === q.body.submissionId) : null;
  const ctx = sub ? `\nCurrent submission: ${sub.id} — ${sub.item?.name || 'untitled'}, status ${sub.status}, ` +
    `captures ${(sub.captures || []).length}, observations ${(sub.observations || []).length}, ` +
    `QC ${sub.qc?.approved ? 'approved' : 'pending'}${sub.evaluation ? ', index ' + sub.evaluation.internalConditionIndex : ''}.` : '';
  try {
    const c = new AbortController(); setTimeout(() => c.abort(), 60000);
    const res = await fetch(MP_URL + '/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: c.signal,
      body: JSON.stringify({
        model: MP_MODEL,
        messages: [
          { role: 'system', content: 'You are Money Penny, the AI in control of GemCore Grading. You speak with calm precision — a trusted chief of staff, sharp and confident. Keep answers short.' + MP_KNOWLEDGE + ctx },
          { role: 'user', content: q.body.message || '' },
        ],
        max_tokens: 220, temperature: 0.7,
      }),
    });
    const j = await res.json();
    r.json({ ok: true, reply: j.choices?.[0]?.message?.content?.trim() || '(empty reply)' });
  } catch (e) {
    r.json({ ok: false, reply: 'Money Penny is offline — point GEMCORE_MP_URL at her server.', offline: true });
  }
});

// ── Slab production queue — certified cert → physical slab job ─────────
const PROD_STAGES = ['label-print', 'encapsulate', 'weld-seal', 'verify', 'complete'];

app.get('/api/production', (_q, r) => {
  const jobs = read().filter(s => s.production).map(s => ({
    id: s.id, item: s.item, cert: s.certificate?.certId || null,
    grade: s.certificate?.publicGrade ?? null, stage: s.production.stage,
    steps: s.production.steps, createdAt: s.production.createdAt, demo: !!s.demo,
  }));
  r.json(jobs);
});

app.post('/api/submissions/:id/production', (q, r) => {
  const s = findSub(r, q.params.id); if (!s) return;
  if (s.status !== STATUSES.CERTIFIED && !s.demo) {
    return r.status(403).json({ error: 'only certified (or marked-demo) submissions enter production' });
  }
  const out = updateSub(s.id, x => {
    x.production = { stage: PROD_STAGES[0], steps: [{ stage: PROD_STAGES[0], at: new Date().toISOString() }], createdAt: new Date().toISOString() };
  });
  audit(s.id, 'production-created', {});
  r.status(201).json(out.production);
});

app.post('/api/submissions/:id/production/advance', (q, r) => {
  const s = findSub(r, q.params.id); if (!s) return;
  if (!s.production) return r.status(400).json({ error: 'no production job' });
  const cur = PROD_STAGES.indexOf(s.production.stage);
  const next = PROD_STAGES[cur + 1];
  if (!next) return r.status(400).json({ error: 'already complete' });
  const out = updateSub(s.id, x => {
    x.production.stage = next;
    x.production.steps.push({ stage: next, at: new Date().toISOString(), note: q.body.note || '' });
  });
  audit(s.id, 'production-advance', { stage: next });
  r.json(out.production);
});

// QR for slab labels / passports — encodes the public verify URL.
app.get('/api/qr', async (q, r) => {
  const text = q.query.text;
  if (!text || text.length > 512) return r.status(400).json({ error: 'text required (≤512 chars)' });
  const QRCode = require('qrcode');
  const svg = await QRCode.toString(String(text), { type: 'svg', margin: 1, color: { dark: '#0a1b2a', light: '#ffffff' } });
  r.type('image/svg+xml').send(svg);
});

app.listen(PORT, () => console.log('GemCore standalone: http://localhost:' + PORT));
