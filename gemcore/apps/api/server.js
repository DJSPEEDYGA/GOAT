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
const vision = new VisionCore();
vision.registerAdapter(require('../../packages/vision-core/adapters').measuredCV);

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

// ── Staff gate + client portal ──────────────────────────────────────────
const STAFF_KEY = process.env.GEMCORE_STAFF_KEY || '';
const clientsFile = path.join(dataDir, 'clients.json');
if (!fs.existsSync(clientsFile)) fs.writeFileSync(clientsFile, '[]');
const readClients = () => JSON.parse(fs.readFileSync(clientsFile, 'utf8'));
const writeClients = x => fs.writeFileSync(clientsFile, JSON.stringify(x, null, 2));
const teamFile = path.join(dataDir, 'team.json');
if (!fs.existsSync(teamFile)) fs.writeFileSync(teamFile, '[]');
const readTeam = () => JSON.parse(fs.readFileSync(teamFile, 'utf8'));
const writeTeam = x => fs.writeFileSync(teamFile, JSON.stringify(x, null, 2));
const sessions = new Map(); // token → {clientId, exp}

// service tiers — quoted per card at intake, honest turnaround promises
const SERVICE_TIERS = {
  bulk:    { price: 12, tat: '30 business days', blurb: 'Dealer/box submissions' },
  value:   { price: 20, tat: '15 business days', blurb: 'Budget cards, no rush' },
  regular: { price: 35, tat: '7 business days',  blurb: 'Standard service' },
  express: { price: 75, tat: '2 business days',  blurb: 'Front of the queue' },
};

const isStaff = q => !STAFF_KEY || q.get('x-staff-key') === STAFF_KEY;
const sha256 = s => crypto.createHash('sha256').update(s).digest('hex');

// staff-gate middleware for internal surfaces (public + verify + mp stay open)
app.use((q, r, next) => {
  const pub = q.path.startsWith('/api/public') || q.path.startsWith('/api/verify') ||
    q.path === '/api/qr' || q.path === '/api/health' || q.path.startsWith('/api/mp') || !q.path.startsWith('/api');
  if (pub || isStaff(q)) return next();
  r.status(403).json({ error: 'staff only' });
});

function audit(submissionId, action, detail = {}) {
  const rec = { submissionId, action, detail, at: new Date().toISOString() };
  fs.appendFileSync(auditFile, JSON.stringify(rec) + '\n');
  // webhook notify — fire-and-forget, never blocks the audit write
  if (submissionId) {
    const s = read().find(x => x.id === submissionId);
    if (s?.notifyUrl) fetch(s.notifyUrl, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(rec), signal: AbortSignal.timeout(4000),
    }).catch(() => {});
  }
}

// turnaround-time timeline — rebuilt from the append-only audit trail
function timelineFor(s) {
  const STEPS = [
    ['submission-created', 'created'], ['staff-decision', 'staff decision'],
    ['capture-recorded', 'first evidence'], ['analysis-run', 'first analysis'],
    ['observation-reviewed', 'first review'], ['qc-review', 'QC decision'],
    ['grade-evaluated', 'last evaluation'], ['grade-sealed', 'sealed'],
    ['production-queued', 'production'], ['production-stage', 'stage change'],
  ];
  const trail = fs.readFileSync(auditFile, 'utf8').trim().split('\n').filter(Boolean)
    .map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(e => e && e.submissionId === s.id);
  return STEPS.map(([act, label]) => {
    const evs = trail.filter(t => t.action === act);
    return evs.length ? { step: label, at: evs[evs.length - 1].at } : null;
  }).filter(Boolean);
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
  rubric: RUBRIC_VERSION, staffRequired: !!STAFF_KEY,
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
    serviceTier: SERVICE_TIERS[q.body.serviceTier] ? q.body.serviceTier : 'regular',
    dealer: q.body.dealer || null,
    crossover: q.body.crossover || null,
    notifyUrl: /^https?:\/\//.test(q.body.notifyUrl || '') ? q.body.notifyUrl : null,
    captures: [], evidence: [], annotations: [], observations: [],
    measurements: {}, analysis: [],
    qc: { approved: false },
  };
  all.unshift(s); write(all);
  audit(s.id, 'submission-created', { demo: s.demo, tier: s.serviceTier });
  r.status(201).json(s);
});

// dealer bulk intake — up to 200 cards in one batch, one service tier
app.post('/api/submissions/bulk', (q, r) => {
  const items = q.body.items;
  if (!Array.isArray(items) || !items.length) return r.status(400).json({ error: 'items[] required' });
  if (items.length > 200) return r.status(400).json({ error: 'max 200 per batch' });
  const tier = SERVICE_TIERS[q.body.serviceTier] ? q.body.serviceTier : 'bulk';
  const all = read(); const ids = [];
  for (const [i, it] of items.entries()) {
    const s = {
      id: 'GCG-' + Date.now() + '-' + (i + 1),
      createdAt: new Date().toISOString(),
      status: STATUSES.INTAKE, demo: !!it.demo,
      item: { name: it.name || '', set: it.set || '', year: it.year || '' },
      serviceTier: tier, dealer: q.body.dealer || null, crossover: it.crossover || null,
      captures: [], evidence: [], annotations: [], observations: [],
      measurements: {}, analysis: [], qc: { approved: false },
    };
    all.unshift(s); ids.push(s.id);
    audit(s.id, 'submission-created', { bulk: true, tier, dealer: s.dealer });
  }
  write(all);
  r.status(201).json({ created: ids.length, ids, tier, quoted: SERVICE_TIERS[tier].price * ids.length });
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
  // auto-queue the Money Penny presenter video — fire and forget
  const cap = (s.captures || []).find(c => c.storedData && c.side === 'front') || (s.captures || []).find(c => c.storedData);
  if (cap?.storedData) {
    const _b64 = (cap.storedData || '').split(',')[1] || (cap.storedData || '');
    const blob = new Blob([Buffer.from(_b64, 'base64')], { type: 'image/png' });
    const fd = new FormData(); fd.append('file', blob, 'card.png');
    fd.append('meta', JSON.stringify({ name: s.item?.name, grade: res.publicGrade, certId: res.certId }));
    fetch(`${IMAGINE_URL}/animate?mode=presenter`, { method: 'POST', body: fd })
      .then(x => x.json()).then(j => { if (j.job) updateSub(s.id, v => { v.animJob = j.job; }); }).catch(() => {});
  }
  r.json(res);
});

// Public cert video — Money Penny presents the grade (polled by report page)
app.get('/api/verify/:certId/video', async (q, r) => {
  const s = read().find(v => (v.certificate || {}).certId === q.params.certId || v.id === q.params.certId);
  if (!s || !s.certificate) return r.status(404).json({ error: 'not certified' });
  if (!s.animJob) {
    // queue it on demand — public, first requester triggers render
    const cap = (s.captures || []).find(c => c.storedData && c.side === 'front') || (s.captures || []).find(c => c.storedData);
    if (!cap?.storedData) return r.status(404).json({ error: 'no evidence to render' });
    try {
      const _b64 = (cap.storedData || '').split(',')[1] || (cap.storedData || '');
    const blob = new Blob([Buffer.from(_b64, 'base64')], { type: 'image/png' });
      const fd = new FormData(); fd.append('file', blob, 'card.png');
      fd.append('meta', JSON.stringify({ name: s.item?.name, grade: s.certificate.publicGrade, certId: s.certificate.certId }));
      const j = await (await fetch(`${IMAGINE_URL}/animate?mode=presenter`, { method: 'POST', body: fd })).json();
      if (j.job) updateSub(s.id, v => { v.animJob = j.job; });
      return r.json({ state: 'rendering' });
    } catch { return r.status(503).json({ state: 'offline' }); }
  }
  try {
    const st = await (await fetch(`${IMAGINE_URL}/animate/${s.animJob}`)).json();
    r.json({ state: st.state === 'done' ? 'ready' : (st.state || 'rendering') });
  } catch { r.status(503).json({ state: 'offline' }); }
});
app.get('/api/verify/:certId/video/file', async (q, r) => {
  const s = read().find(v => (v.certificate || {}).certId === q.params.certId || v.id === q.params.certId);
  if (!s?.animJob) return r.sendStatus(404);
  try {
    const res = await fetch(`${IMAGINE_URL}/animate/${s.animJob}/file`);
    if (!res.ok) return r.sendStatus(404);
    r.set('Content-Type', res.headers.get('content-type') || 'video/mp4')
     .send(Buffer.from(await res.arrayBuffer()));
  } catch { r.sendStatus(503); }
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
  const all = read();
  const s = all.find(v => v.id === q.params.certId || (v.certificate || {}).certId === q.params.certId);
  if (!s) return r.status(404).json({ verified: false, reason: 'unknown certificate' });
  const certified = s.status === STATUSES.CERTIFIED;
  // CHRON + RANK — TAG's paid add-ons, ours are free
  const certs = all.filter(x => x.status === STATUSES.CERTIFIED && x.certificate)
    .sort((a, b) => new Date(a.certificate.sealedAt) - new Date(b.certificate.sealedAt));
  const chron = certs.findIndex(x => x.id === s.id) + 1 || null;
  const sameItem = certs.filter(x => x.item?.name === s.item?.name)
    .sort((a, b) => b.certificate.publicGrade - a.certificate.publicGrade);
  const rank = sameItem.findIndex(x => x.id === s.id) + 1 || null;
  r.json({
    verified: certified,
    certId: s.id,
    status: s.status,
    demo: !!s.demo,
    publicGrade: certified ? s.certificate.publicGrade : null,
    internalIndex: certified ? s.evaluation?.internalConditionIndex ?? null : null,
    sealedAt: certified ? s.certificate.sealedAt : null,
    item: { name: s.item?.name || null, set: s.item?.set || null, year: s.item?.year || null },
    qcApproved: !!s.qc?.approved,
    algorithmVersion: s.certificate?.algorithmVersion || RUBRIC_VERSION,
    chronology: chron, rankOfSameItem: rank, sameItemPopulation: sameItem.length,
    lanes: certified ? s.evaluation?.lanes || null : null,
    // accountability — who graded and QC'd it, plus what machine measured
    team: certified ? {
      qcReviewer: s.qc?.reviewer || null, qcAt: s.qc?.at || null,
      reviewers: [...new Set((s.observations || []).map(o => o.reviewer).filter(Boolean))],
      measuredBy: [...new Set((s.analysis || []).map(a => a.adapter).filter(Boolean))],
    } : null,
    // crossover — if this card came in already slabbed elsewhere
    crossover: s.crossover || null,
    // evidence index — per-capture public images via /api/verify/:id/evidence/:capId
    evidence: certified ? (s.captures || []).map(c => ({
      id: c.id, side: c.side, mode: c.mode, sha256: c.sha256, hasImage: !!c.storedData,
    })) : [],
    // DIG-style defect map — coords + lane + severity (no internal notes)
    defects: certified ? (s.observations || [])
      .filter(o => o.x != null && o.reviewerDisposition !== 'rejected')
      .map(o => ({ x: o.x, y: o.y, lane: o.lane, severity: o.severity, source: o.source })) : [],
    evidenceCount: (s.captures || []).length,
    hasImage: (s.captures || []).some(c => c.storedData),
  });
});

// public card image for certified items — the DIG report's defect canvas
app.get('/api/verify/:certId/image', (q, r) => {
  const s = read().find(v => v.id === q.params.certId || (v.certificate || {}).certId === q.params.certId);
  if (!s || s.status !== STATUSES.CERTIFIED) return r.sendStatus(404);
  const cap = (s.captures || []).find(c => c.storedData && c.side === 'front') || (s.captures || []).find(c => c.storedData);
  if (!cap) return r.sendStatus(404);
  const m = cap.storedData.match(/^data:(image\/[\w+]+);base64,(.+)$/);
  if (!m) return r.sendStatus(404);
  r.type(m[1]).send(Buffer.from(m[2], 'base64'));
});

// public per-capture evidence image — sealed originals, any light mode
app.get('/api/verify/:certId/evidence/:capId', (q, r) => {
  const s = read().find(v => v.id === q.params.certId || (v.certificate || {}).certId === q.params.certId);
  if (!s || s.status !== STATUSES.CERTIFIED) return r.sendStatus(404);
  const cap = (s.captures || []).find(c => c.id === q.params.capId && c.storedData);
  if (!cap) return r.sendStatus(404);
  const m = cap.storedData.match(/^data:(image\/[\w+]+);base64,(.+)$/);
  if (!m) return r.sendStatus(404);
  r.type(m[1]).send(Buffer.from(m[2], 'base64'));
});

// ── COMMUNITY: public pop report, registry, showcase, prescreen ─────────
// public population — the PSA-style trust artifact, but every cert links to evidence
app.get('/api/public/population', (_q, r) => {
  const all = read();
  const certs = all.filter(x => x.status === STATUSES.CERTIFIED && x.certificate);
  const byGrade = {}, byItem = {};
  for (const s of certs) {
    const g = String(s.certificate.publicGrade);
    byGrade[g] = (byGrade[g] || 0) + 1;
    const n = s.item?.name || 'Unnamed';
    const it = byItem[n] = byItem[n] || { item: n, set: s.item?.set || '', year: s.item?.year || null, total: 0, byGrade: {} };
    it.total++; it.byGrade[g] = (it.byGrade[g] || 0) + 1;
  }
  r.json({
    certified: certs.length,
    inPipeline: all.filter(x => x.status !== STATUSES.CERTIFIED).length,
    byGrade,
    items: Object.values(byItem).sort((a, b) => b.total - a.total),
    leaderboard: certs.map(s => ({
      certId: s.certificate.certId || s.id, item: s.item?.name,
      grade: s.certificate.publicGrade, index: s.evaluation?.internalConditionIndex ?? null,
    })).sort((a, b) => (b.index ?? 0) - (a.index ?? 0)).slice(0, 25),
  });
});

// set registry — collectors register sealed certs into named sets
const registryFile = path.join(dataDir, 'registry.json');
if (!fs.existsSync(registryFile)) fs.writeFileSync(registryFile, '{"sets":[],"entries":[]}');
const readReg = () => JSON.parse(fs.readFileSync(registryFile, 'utf8'));
const writeReg = x => fs.writeFileSync(registryFile, JSON.stringify(x, null, 2));

app.get('/api/public/registry', (_q, r) => {
  const reg = readReg(), all = read();
  const certIds = new Set(all.filter(s => s.status === STATUSES.CERTIFIED).map(s => s.id));
  const entries = reg.entries.filter(e => certIds.has(e.certId));
  const board = {};
  for (const e of entries) {
    const s = all.find(x => x.id === e.certId);
    const b = board[e.collector] = board[e.collector] || { collector: e.collector, certs: new Set(), idxSum: 0, idxN: 0 };
    if (b.certs.has(e.certId)) continue;
    b.certs.add(e.certId);
    if (s?.evaluation?.internalConditionIndex != null) { b.idxSum += s.evaluation.internalConditionIndex; b.idxN++; }
  }
  r.json({
    sets: reg.sets,
    entries: entries.slice(-100).reverse(),
    leaderboard: Object.values(board).map(b => ({
      collector: b.collector, certs: b.certs.size,
      avgIndex: b.idxN ? Math.round(b.idxSum / b.idxN) : null,
    })).sort((a, b) => b.certs - a.certs || (b.avgIndex ?? 0) - (a.avgIndex ?? 0)),
  });
});

app.post('/api/public/registry', (q, r) => {
  const { certId, collector, set } = q.body || {};
  if (!certId || !collector) return r.status(400).json({ error: 'certId + collector required' });
  const s = read().find(x => x.id === certId || x.certificate?.certId === certId);
  if (!s || s.status !== STATUSES.CERTIFIED) return r.status(400).json({ error: 'certId must be a sealed GemCore cert' });
  const reg = readReg();
  if (reg.entries.some(e => e.certId === s.id && e.collector === collector && (e.set || null) === (set || null)))
    return r.status(400).json({ error: 'already registered' });
  const rec = {
    certId: s.id, collector: String(collector).slice(0, 60), set: set || null,
    item: s.item?.name || null, grade: s.certificate.publicGrade, at: new Date().toISOString(),
  };
  reg.entries.push(rec); writeReg(reg);
  r.status(201).json(rec);
});

// staff defines registry sets (name + optional checklist of item names)
app.post('/api/registry/sets', (q, r) => {
  const { name, checklist } = q.body || {};
  if (!name) return r.status(400).json({ error: 'name required' });
  const reg = readReg();
  if (reg.sets.some(s => s.name === name)) return r.status(400).json({ error: 'set exists' });
  const rec = { id: 'SET-' + Date.now(), name, checklist: checklist || [], createdAt: new Date().toISOString() };
  reg.sets.push(rec); writeReg(reg); r.status(201).json(rec);
});

// shareable collection showcase — a collector's registered certs, public
app.get('/api/public/collection/:name', (q, r) => {
  const name = String(q.params.name || '').toLowerCase();
  const reg = readReg(), all = read();
  const mine = reg.entries.filter(e => e.collector.toLowerCase() === name);
  const items = mine.map(e => {
    const s = all.find(x => x.id === e.certId && x.status === STATUSES.CERTIFIED);
    return s ? {
      certId: s.id, item: s.item, grade: s.certificate.publicGrade,
      index: s.evaluation?.internalConditionIndex ?? null,
      sealedAt: s.certificate.sealedAt, set: e.set || null,
    } : null;
  }).filter(Boolean);
  r.json({ collector: q.params.name, items });
});

// pre-grade AI screener — free look before you pay. Real pixel analysis →
// estimated lanes → estimated index/grade → ROI vs tier fee. Rate-limited.
const prescreenLast = new Map();
app.post('/api/public/prescreen', async (q, r) => {
  const last = prescreenLast.get(q.ip) || 0;
  if (Date.now() - last < 5000) return r.status(429).json({ error: 'one screen every few seconds' });
  prescreenLast.set(q.ip, Date.now());
  const data = q.body?.data;
  if (!data || typeof data !== 'string' || data.length > 8e6) {
    return r.status(400).json({ error: 'image data-url required (PNG)' });
  }
  const rec = { id: 'PRESCAN', storedData: data, side: 'front', mode: 'visible' };
  const res = await vision.analyze('centering', rec);
  if (res.status !== 'ok') return r.json({ status: res.status, reason: res.reason || 'analysis unavailable — submit for a real look' });
  const m = res.result || {};
  const lanes = {
    centering: m.centering?.score ?? null, corners: m.corners?.score ?? null,
    edges: m.edges?.score ?? null, surface: m.surface?.score ?? null,
  };
  const idx = grading.combineLanes(lanes);
  const estGrade = grading.indexToPublicGrade(idx);
  const tier = SERVICE_TIERS[q.body.serviceTier] ? q.body.serviceTier : 'regular';
  const fee = SERVICE_TIERS[tier].price;
  const est = q.body.item ? market.estimate(q.body.item, estGrade ?? 5) : { status: 'no-data' };
  const roi = est.status === 'ok' && est.estimate != null ? +(est.estimate - fee).toFixed(2) : null;
  const verdict = idx === null ? 'inconclusive'
    : estGrade >= 9 ? 'strong-grade-candidate'
    : estGrade >= 7 ? 'worth-grading' : 'grade-may-not-pay';
  r.json({
    status: 'ok', lanes, estimatedIndex: idx, estimatedGrade: estGrade,
    verdict, tier, fee, estimatedValue: est, roi,
    honest: 'AI pre-screen only — sealed evidence + human QC decide the real grade',
  });
});

// fingerprint lookup — "has this card been seen before?" hamming ≤ 12 ≈ same card
app.post('/api/public/fp-check', (q, r) => {
  const hash = String(q.body?.hash || '');
  if (!/^[0-9a-f]{16}$/.test(hash)) return r.status(400).json({ error: 'hash = 16 hex chars' });
  const b = BigInt('0x' + hash);
  const matches = [];
  for (const s of read()) {
    if (!s.fingerprint) continue;
    let x = BigInt('0x' + s.fingerprint) ^ b, d = 0;
    while (x) { d += Number(x & 1n); x >>= 1n; }
    if (d <= 12) matches.push({
      certId: s.certificate?.certId || s.id, item: s.item?.name || null,
      status: s.status, distance: d,
    });
  }
  matches.sort((a, b2) => a.distance - b2.distance);
  r.json({ seen: matches.length > 0, matches });
});

// public service tiers — posted pricing, posted TAT
app.get('/api/public/service-tiers', (_q, r) => r.json(SERVICE_TIERS));

// ── Population report (derived, honest zeros) ────────────────────────────
app.get('/api/population', (_q, r) => {
  const all = read();
  const certs = all.filter(x => x.status === STATUSES.CERTIFIED && x.certificate)
    .sort((a, b) => new Date(a.certificate.sealedAt) - new Date(b.certificate.sealedAt));
  const byGrade = {};
  for (const s of certs) {
    const g = String(s.certificate.publicGrade);
    byGrade[g] = (byGrade[g] || 0) + 1;
  }
  r.json({
    total: all.length,
    certified: certs.length,
    inPipeline: all.filter(x => x.status !== STATUSES.CERTIFIED).length,
    byGrade,
    leaderboard: certs.map((s, i) => ({
      certId: s.certificate.certId || s.id, item: s.item?.name, grade: s.certificate.publicGrade,
      index: s.evaluation?.internalConditionIndex ?? null, chronology: i + 1,
    })).sort((a, b) => (b.index ?? 0) - (a.index ?? 0)),
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

// ── Money Penny's tool layer — real data access, allowlisted.
//    She emits [[TOOL:name]] mid-reply; we run it and let her finish
//    with the result. GOAT bridge = GEMCORE_GOAT_API when reachable.
const GOAT_API = process.env.GEMCORE_GOAT_API || '';
const MP_TOOLS = {
  population: async () => {
    const all = read();
    const byGrade = {};
    for (const s of all.filter(x => x.status === STATUSES.CERTIFIED && x.certificate)) byGrade[s.certificate.publicGrade] = (byGrade[s.certificate.publicGrade] || 0) + 1;
    return { total: all.length, certified: Object.keys(byGrade).length ? byGrade : {}, inPipeline: all.filter(x => x.status !== STATUSES.CERTIFIED).length };
  },
  submissions: async () => read().slice(0, 10).map(s => ({ id: s.id, item: s.item?.name, status: s.status, captures: (s.captures || []).length, demo: !!s.demo })),
  production: async () => read().filter(s => s.production).map(s => ({ id: s.id, stage: s.production.stage })),
  goat_status: async () => {
    if (!GOAT_API) return { reachable: false, note: 'GOAT Royalty endpoint not configured — set GEMCORE_GOAT_API' };
    try { const c = new AbortController(); setTimeout(() => c.abort(), 4000); const res = await fetch(GOAT_API + '/api/health', { signal: c.signal }); return { reachable: res.ok, status: res.status }; }
    catch { return { reachable: false, note: 'GOAT Royalty API unreachable at ' + GOAT_API }; }
  },
};

async function mpCall(messages, maxTokens = 240) {
  const c = new AbortController(); setTimeout(() => c.abort(), 90000);
  const res = await fetch(MP_URL + '/v1/chat/completions', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: c.signal,
    body: JSON.stringify({ model: MP_MODEL, messages, max_tokens: maxTokens, temperature: 0.7 }),
  });
  const j = await res.json();
  return j.choices?.[0]?.message?.content?.trim() || '';
}

const MP_KEY = process.env.GEMCORE_MP_KEY || ''; // when set, public chat needs the key
const mpAuthed = q => !MP_KEY || ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(q.ip) || q.get('x-mp-key') === MP_KEY;
const mpLastHit = new Map(); // per-IP cooldown — protects her GPU on public endpoints
app.post('/api/mp/chat', async (q, r) => {
  if (!mpAuthed(q)) {
    return r.status(403).json({ locked: true, reply: 'Money Penny is keyed — unlock to talk to her.' });
  }
  const ip = q.ip || 'x';
  const now = Date.now();
  if (now - (mpLastHit.get(ip) || 0) < 4000) return r.status(429).json({ reply: 'Easy — one question at a time. Money Penny is thinking.' });
  mpLastHit.set(ip, now);
  const sub = q.body.submissionId ? read().find(v => v.id === q.body.submissionId) : null;
  const ctx = sub ? `\nCurrent submission: ${sub.id} — ${sub.item?.name || 'untitled'}, status ${sub.status}, ` +
    `captures ${(sub.captures || []).length}, observations ${(sub.observations || []).length}, ` +
    `QC ${sub.qc?.approved ? 'approved' : 'pending'}${sub.evaluation ? ', index ' + sub.evaluation.internalConditionIndex : ''}.` : '';
  const toolDoc = `\nTOOLS (emit [[TOOL:name]] alone on a line to call, then answer with the result): ${Object.keys(MP_TOOLS).join(', ')}`;
  try {
    const messages = [
      { role: 'system', content: 'You are Money Penny, the AI in control of GemCore Grading. You speak with calm precision — a trusted chief of staff, sharp and confident. Keep answers short.' + MP_KNOWLEDGE + toolDoc + ctx },
      { role: 'user', content: q.body.message || '' },
    ];
    let reply = await mpCall(messages);
    const calls = [...reply.matchAll(/\[\[TOOL:(\w+)\]\]/g)];
    for (const [, tool] of calls) {
      const fn = MP_TOOLS[tool];
      const result = fn ? await fn() : { error: 'unknown tool' };
      messages.push({ role: 'assistant', content: reply }, { role: 'user', content: `TOOL RESULT ${tool}: ${JSON.stringify(result).slice(0, 1200)}` });
      reply = await mpCall(messages); // she finishes with the real data
    }
    r.json({ ok: true, reply });
  } catch (e) {
    r.json({ ok: false, reply: 'Money Penny is offline — point GEMCORE_MP_URL at her server.', offline: true });
  }
});

// ── MP deploy bridge — she authors FiveM resources for BrickSquaD-RP.
//    Localhost-only (called by the game server on this box).
const FIVEM_RESOURCES = process.env.GEMCORE_FIVEM_RESOURCES || '/root/brick-squad-gaming/resources';

app.post('/api/mp/deploy', async (q, r) => {
  if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(q.ip)) {
    return r.status(403).json({ error: 'local only' });
  }
  const name = String(q.body.name || '').replace(/[^a-z0-9_-]/gi, '').toLowerCase().slice(0, 40);
  const brief = String(q.body.brief || '').slice(0, 500);
  if (!name) return r.status(400).json({ error: 'resource name required' });
  try {
    const code = await mpCall([
      { role: 'system', content: 'You are Money Penny, expert FiveM/QBCore developer. Output ONLY resource files in this exact format — no prose:\n=== fxmanifest.lua ===\n<content>\n=== server.lua ===\n<content>\n=== client.lua ===\n<content>\nRules: fx_version "cerulean", game "gta5", lua54 "yes". QBCore via exports["qb-core"]:GetCoreObject() when needed. Keep it small and working.' },
      { role: 'user', content: `Build resource "${name}": ${brief}` },
    ], 900);
    const dir = path.join(FIVEM_RESOURCES, name);
    const files = [...code.matchAll(/===\s*([\w.-]+)\s*===\n([\s\S]*?)(?====|\s*$)/g)];
    if (!files.length) return r.status(502).json({ error: 'no files authored' });
    fs.mkdirSync(dir, { recursive: true });
    const written = [];
    for (const [, fn, content] of files) {
      if (!/^[\w.-]+$/.test(fn) || fn.includes('..')) continue;
      fs.writeFileSync(path.join(dir, fn.trim()), content.trim() + '\n');
      written.push(fn.trim());
    }
    r.json({ ok: true, resource: name, files: written });
  } catch (e) {
    r.status(500).json({ error: 'deploy failed: ' + e.message });
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

// global audit feed — every event across submissions (Live Grading page)
app.get('/api/audit', (q, r) => {
  const limit = Math.min(+q.query.limit || 60, 500);
  try {
    const lines = fs.readFileSync(auditFile, 'utf8').trim().split('\n').filter(Boolean);
    r.json(lines.slice(-limit).reverse().map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean));
  } catch { r.json([]); }
});

// vault flag — user's personal collection shelf
app.post('/api/submissions/:id/vault', (q, r) => {
  const s = findSub(r, q.params.id); if (!s) return;
  const out = updateSub(s.id, x => { x.vaulted = q.body.vaulted !== false; });
  audit(s.id, 'vault', { vaulted: out.vaulted });
  r.json({ ok: true, vaulted: out.vaulted });
});

// ── PUBLIC: submit a card for review (no account needed) ────────────────
app.post('/api/public/request', (q, r) => {
  const { contact = {}, item = {}, notes = '', crossover = null, serviceTier = null } = q.body || {};
  if (!contact.email || !item.name) return r.status(400).json({ error: 'email + item name required' });
  const sub = {
    id: 'GC-' + crypto.randomBytes(5).toString('hex').toUpperCase(),
    item: { name: item.name, set: item.set || '', year: item.year || '' },
    demo: false, external: true,
    status: 'review-request',
    serviceTier: SERVICE_TIERS[serviceTier] ? serviceTier : 'regular',
    crossover: crossover && crossover.company ? {
      company: String(crossover.company).slice(0, 40),
      certNo: String(crossover.certNo || '').slice(0, 40),
      grade: crossover.grade ?? null,
    } : null,
    // optional intake photo from kiosk/portal (bounded — evidence comes later)
    intake: { name: contact.name || '', email: contact.email, notes,
      photo: /^data:image\//.test(q.body.photo || '') ? String(q.body.photo).slice(0, 3e6) : null },
    review: { status: 'pending', price: null },
    captures: [], evidence: [], annotations: [], observations: [],
    createdAt: new Date().toISOString(),
  };
  const all = read(); all.push(sub); write(all);
  audit(sub.id, 'public-request', { email: contact.email });
  r.status(201).json({ trackingId: sub.id });
});

// client login → session token (job-id + password the staff issued)
app.post('/api/public/login', (q, r) => {
  const { jobId, password } = q.body || {};
  const c = readClients().find(x => x.submissionId === (jobId || '').toUpperCase().trim());
  if (!c || !c.passHash || sha256(password || '') !== c.passHash)
    return r.status(401).json({ error: 'invalid credentials' });
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, { clientId: c.id, exp: Date.now() + 86400e3 });
  r.json({ token, jobId: c.submissionId });
});

// client job view — their job ONLY, sanitized fields
app.get('/api/public/job', (q, r) => {
  const sess = sessions.get(q.get('authorization')?.replace('Bearer ', ''));
  if (!sess || sess.exp < Date.now()) return r.status(401).json({ error: 'login required' });
  const c = readClients().find(x => x.id === sess.clientId);
  const s = read().find(x => x.id === c?.submissionId);
  if (!s) return r.sendStatus(404);
  r.json({
    jobId: s.id, item: s.item, status: s.status,
    price: s.review?.price, stage: s.production?.stage || null,
    grade: s.certificate?.publicGrade ?? null,
    certId: s.certificate?.certId ?? null,
    captureCount: (s.captures || []).length,
    updated: s.certificate?.sealedAt || s.createdAt,
    serviceTier: s.serviceTier || 'regular',
    promisedTat: SERVICE_TIERS[s.serviceTier]?.tat || null,
    timeline: timelineFor(s), // turnaround tracking — real audit events only
  });
});

// ── STAFF: request queue + decisions (gate enforced by middleware) ──────
app.get('/api/staff/requests', (q, r) => {
  r.json(read().filter(s => s.external).map(s => ({
    id: s.id, item: s.item, contact: s.intake, review: s.review,
    status: s.status, createdAt: s.createdAt,
  })));
});

app.post('/api/staff/decide', (q, r) => {
  const { submissionId, accept, price, reviewer } = q.body || {};
  const s = findSub(r, submissionId); if (!s) return;
  const out = updateSub(s.id, x => {
    x.review = { status: accept ? 'accepted' : 'declined', price: accept ? +price || null : null, reviewer: reviewer || 'staff', decidedAt: new Date().toISOString() };
    if (accept) x.status = 'intake';
  });
  let password = null;
  if (accept) {
    password = 'GC' + crypto.randomBytes(4).toString('hex');
    const clients = readClients();
    const existing = clients.find(c => c.submissionId === s.id);
    if (existing) existing.passHash = sha256(password);
    else clients.push({ id: crypto.randomBytes(6).toString('hex'), submissionId: s.id, login: s.intake?.email || s.id, passHash: sha256(password), createdAt: new Date().toISOString() });
    writeClients(clients);
  }
  audit(s.id, 'staff-decision', { accept, price: out.review.price });
  r.json({ ok: true, review: out.review, clientPassword: password });
});

// public cert explainer — Money Penny explains a certified grade to anyone.
// Fixed prompt, only public fields, rate-limited — the thing TAG can't do.
const explainLast = new Map();
app.post('/api/mp/explain/:certId', async (q, r) => {
  const ip = q.ip || 'x';
  const now = Date.now();
  if (now - (explainLast.get(ip) || 0) < 8000) return r.status(429).json({ reply: 'Easy — she\'s thinking. One at a time.' });
  explainLast.set(ip, now);
  const s = read().find(v => v.id === q.params.certId || (v.certificate || {}).certId === q.params.certId);
  if (!s || s.status !== STATUSES.CERTIFIED) return r.status(404).json({ reply: 'I have no record of that certificate.' });
  const pub = {
    item: s.item, grade: s.certificate.publicGrade, index: s.evaluation?.internalConditionIndex,
    lanes: s.evaluation?.lanes, defectCount: (s.observations || []).filter(o => o.reviewerDisposition !== 'rejected').length,
    rubric: s.certificate.algorithmVersion || RUBRIC_VERSION,
  };
  const q2 = String(q.body?.question || 'Explain this grade to me').slice(0, 300);
  try {
    const reply = await mpCall([
      { role: 'system', content: 'You are Money Penny, the AI in control of GemCore Grading. You speak with calm precision — a trusted chief of staff, sharp and confident. Keep answers short.' + MP_KNOWLEDGE + '\n\nPUBLIC CERT REPORT — explain this certified grade honestly and warmly in 2-3 sentences. Never reveal internal chain details. Data: ' + JSON.stringify(pub) },
      { role: 'user', content: q2 },
    ], 160);
    r.json({ reply });
  } catch { r.status(503).json({ reply: 'Money Penny is offline right now — try again shortly.' }); }
});

// ── Animator: 3D/AR exports — GLB (Unreal/Blender) + USDZ (iOS AR) ─────
const animator = require('../../packages/animator-core');
app.get('/api/submissions/:id/export.glb', (q, r) => {
  const s = findSub(r, q.params.id); if (!s) return;
  const cap = (s.captures || []).find(c => c.storedData && c.side === 'front') || (s.captures || []).find(c => c.storedData);
  const glb = animator.buildGLB(cap?.storedData || null, { name: `${s.id} ${s.item?.name || ''}` });
  audit(s.id, 'export-glb', {});
  r.set('Content-Type', 'model/gltf-binary').set('Content-Disposition', `attachment; filename="${s.id}.glb"`).send(glb);
});
app.get('/api/submissions/:id/export.usdz', (q, r) => {
  const s = findSub(r, q.params.id); if (!s) return;
  const cap = (s.captures || []).find(c => c.storedData && c.side === 'front') || (s.captures || []).find(c => c.storedData);
  const usdz = animator.buildUSDZ(cap?.storedData || null, { name: s.id });
  audit(s.id, 'export-usdz', {});
  r.set('Content-Type', 'model/vnd.usdz+zip').set('Content-Disposition', `attachment; filename="${s.id}.usdz"`).send(usdz);
});

// ── GemCore Imagine — local animation engine (Jetson) ───────────────────
const IMAGINE_URL = process.env.GEMCORE_IMAGINE_URL || 'http://127.0.0.1:10090';
app.post('/api/submissions/:id/animate', async (q, r) => {
  const s = findSub(r, q.params.id); if (!s) return;
  const cap = (s.captures || []).find(c => c.storedData && c.side === 'front') || (s.captures || []).find(c => c.storedData);
  if (!cap?.storedData) return r.status(400).json({ error: 'no stored capture to animate' });
  try {
    const _b64 = (cap.storedData || '').split(',')[1] || (cap.storedData || '');
    const blob = new Blob([Buffer.from(_b64, 'base64')], { type: 'image/png' });
    const fd = new FormData(); fd.append('file', blob, 'card.png');
    fd.append('meta', JSON.stringify({ name: s.item?.name, grade: s.certificate?.publicGrade, certId: s.certificate?.certId || s.id }));
    const res = await fetch(`${IMAGINE_URL}/animate?mode=${encodeURIComponent(q.body.mode || 'depth')}`, { method: 'POST', body: fd });
    const j = await res.json();
    if (j.job) { updateSub(s.id, x => { x.animJob = j.job; }); audit(s.id, 'animate-queued', { job: j.job, mode: q.body.mode }); }
    r.json(j);
  } catch { r.status(503).json({ error: 'imagine engine offline — start imagine_server.py on the Jetson' }); }
});
app.get('/api/animate/:jid', async (q, r) => {
  try { r.json(await (await fetch(`${IMAGINE_URL}/animate/${q.params.jid}`)).json()); }
  catch { r.status(503).json({ state: 'offline' }); }
});
app.get('/api/animate/:jid/file', async (q, r) => {
  try {
    const res = await fetch(`${IMAGINE_URL}/animate/${q.params.jid}/file`);
    r.set('Content-Type', res.headers.get('content-type') || 'video/mp4')
     .send(Buffer.from(await res.arrayBuffer()));
  } catch { r.sendStatus(503); }
});

// ── Market comps + device bridge ────────────────────────────────────────
const { MarketCore } = require('../../packages/market-core');
const { DeviceBridge } = require('../../packages/device-bridge');
const market = new MarketCore(dataDir);
const devices = new DeviceBridge(dataDir);

app.post('/api/comps', (q, r) => {
  const { item, grade, price, source } = q.body || {};
  if (!item || !price) return r.status(400).json({ error: 'item + price required' });
  const rec = market.addComp({ item, grade, price: +price, source: source || 'staff' });
  audit(null, 'comp-added', { item, price });
  r.status(201).json(rec);
});
app.get('/api/comps', (q, r) => r.json(market.read().slice(-200)));
app.get('/api/market/estimate', async (q, r) => {
  const name = q.query.item || '', grade = +q.query.grade || 5, pop = +q.query.population || 0;
  const local = market.estimate(name, grade, pop);
  const ebay = await market.ebaySold(name);
  r.json({ local, ebay });
});

// device bridge — welder/printer/agents register + poll
app.post('/api/devices/register', (q, r) => r.json(devices.register(q.body.id, q.body.caps || [])));
app.post('/api/devices/:id/heartbeat', (q, r) => { const d = devices.heartbeat(q.params.id, q.body.state || {}); d ? r.json(d) : r.sendStatus(404); });
app.get('/api/devices', (q, r) => r.json(devices.status()));
app.get('/api/devices/:id/poll', (q, r) => r.json({ job: devices.poll(q.params.id) }));
app.post('/api/jobs/:jid/complete', (q, r) => { const j = devices.complete(q.params.jid, q.body.result || {}); j ? r.json(j) : r.sendStatus(404); });
app.post('/api/submissions/:id/produce', (q, r) => {
  const s = findSub(r, q.params.id); if (!s) return;
  const job = devices.enqueue(q.body.deviceId || 'welder-01', { type: q.body.type || 'weld-slab', submissionId: s.id, certId: s.certificate?.certId });
  audit(s.id, 'production-queued', { job: job.id, device: job.deviceId });
  r.status(201).json(job);
});

// card fingerprint — perceptual hash seals the physical card to the cert
app.post('/api/submissions/:id/fingerprint', (q, r) => {
  const s = findSub(r, q.params.id); if (!s) return;
  const hash = String(q.body.hash || '');
  if (!/^[0-9a-f]{16}$/.test(hash)) return r.status(400).json({ error: 'hash = 16 hex chars' });
  updateSub(s.id, x => { x.fingerprint = hash; });
  audit(s.id, 'fingerprinted', { hash });
  r.json({ ok: true, fingerprint: hash });
});
app.get('/api/verify/:certId/fp/:hash', (q, r) => {
  const s = read().find(v => v.id === q.params.certId || (v.certificate || {}).certId === q.params.certId);
  if (!s || !s.fingerprint) return r.status(404).json({ error: 'no fingerprint on file' });
  // hamming distance between 64-bit hashes
  const a = BigInt('0x' + s.fingerprint), b = BigInt('0x' + q.params.hash);
  let x = a ^ b, d = 0; while (x) { d += Number(x & 1n); x >>= 1n; }
  r.json({ match: d <= 12, distance: d, fingerprint: s.fingerprint, verdict: d <= 12 ? 'SAME CARD' : d <= 20 ? 'uncertain — recapture' : 'MISMATCH' });
});

// ── STAFF: team roster + assignments ────────────────────────────────────
app.get('/api/team', (q, r) => r.json(readTeam()));
app.post('/api/team', (q, r) => {
  const { name, role, signature } = q.body || {};
  if (!name) return r.status(400).json({ error: 'name required' });
  const team = readTeam();
  const member = { id: 'T-' + crypto.randomBytes(3).toString('hex'), name, role: role || 'grader',
    signature: String(signature || '').slice(0, 200000), addedAt: new Date().toISOString() };
  team.push(member); writeTeam(team);
  audit(null, 'team-added', { member: member.id });
  r.status(201).json(member);
});
app.patch('/api/team/:id', (q, r) => {
  const team = readTeam();
  const m = team.find(x => x.id === q.params.id);
  if (!m) return r.sendStatus(404);
  if (q.body.signature !== undefined) m.signature = String(q.body.signature).slice(0, 200000);
  if (q.body.name) m.name = q.body.name;
  if (q.body.role) m.role = q.body.role;
  writeTeam(team);
  r.json(m);
});
app.delete('/api/team/:id', (q, r) => {
  writeTeam(readTeam().filter(m => m.id !== q.params.id));
  audit(null, 'team-removed', { member: q.params.id });
  r.json({ ok: true });
});
app.post('/api/submissions/:id/assign', (q, r) => {
  const s = findSub(r, q.params.id); if (!s) return;
  const member = readTeam().find(m => m.id === q.body.memberId);
  const out = updateSub(s.id, x => { x.assignedTo = member ? member.id : null; });
  audit(s.id, 'assigned', { memberId: out.assignedTo });
  r.json({ ok: true, assignedTo: out.assignedTo });
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
