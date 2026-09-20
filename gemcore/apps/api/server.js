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
  const { contact = {}, item = {}, notes = '' } = q.body || {};
  if (!contact.email || !item.name) return r.status(400).json({ error: 'email + item name required' });
  const sub = {
    id: 'GC-' + crypto.randomBytes(5).toString('hex').toUpperCase(),
    item: { name: item.name, set: item.set || '', year: item.year || '' },
    demo: false, external: true,
    status: 'review-request',
    intake: { name: contact.name || '', email: contact.email, notes },
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
