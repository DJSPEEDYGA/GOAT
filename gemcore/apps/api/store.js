'use strict';
// Operational store — SQLite persistence for the GemCore API.
//
// submissions.doc_json is the authoritative document (the app treats a
// submission as one aggregate). The normalized evidence tables from
// database/schema.sql — captures, annotations, measurements, observations,
// qc_reviews, certificates — are write-through projections rebuilt inside
// the same transaction on each save, so the relational contract stays
// real and queryable. Capture image payloads live in capture_blobs and are
// hydrated back into doc.captures[].storedData on read, preserving the
// exact document shape the API always returned from the JSON files.

const fs = require('fs');
const path = require('path');
const { open } = require('./db');

const SCHEMA_FILE = path.resolve(__dirname, '../../database/schema.sql');
const MIGRATIONS_DIR = path.resolve(__dirname, '../../database/migrations');

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

// ── schema bootstrap + versioned migrations ─────────────────────────────
function migrate(db) {
  db.exec(fs.readFileSync(SCHEMA_FILE, 'utf8'));
  const applied = new Set(db.prepare('SELECT version FROM schema_migrations').all().map(r => r.version));
  const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => /^\d+.*\.sql$/.test(f)).sort();
  for (const f of files) {
    const version = parseInt(f, 10);
    if (applied.has(version)) continue;
    db.exec('BEGIN');
    try {
      db.exec(fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8'));
      db.exec('COMMIT');
    } catch (e) { db.exec('ROLLBACK'); throw e; }
  }
}

function openStore(dataDir) {
  fs.mkdirSync(dataDir, { recursive: true });
  const db = open(path.join(dataDir, 'gemcore.db'));
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  migrate(db);

  // ── transaction helper (re-entrant) ─────────────────────────────────
  let txDepth = 0;
  function tx(fn) {
    if (txDepth > 0) return fn();
    db.exec('BEGIN');
    txDepth++;
    try { const v = fn(); db.exec('COMMIT'); return v; }
    catch (e) { db.exec('ROLLBACK'); throw e; }
    finally { txDepth--; }
  }

  // ── submission document + normalized projections ────────────────────
  const insSub = db.prepare(`INSERT INTO submissions (id, created_at, updated_at, status, demo, item_json, doc_json)
    VALUES (?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET updated_at=excluded.updated_at, status=excluded.status,
      demo=excluded.demo, item_json=excluded.item_json, doc_json=excluded.doc_json`);
  const delCaps = db.prepare('DELETE FROM captures WHERE submission_id=?');
  const delBlobs = db.prepare('DELETE FROM capture_blobs WHERE capture_id IN (SELECT id FROM captures WHERE submission_id=?)');
  const delAnns = db.prepare('DELETE FROM annotations WHERE capture_id IN (SELECT id FROM captures WHERE submission_id=?)');
  const delMeas = db.prepare('DELETE FROM measurements WHERE submission_id=?');
  const delObs = db.prepare('DELETE FROM observations WHERE submission_id=?');
  const insCap = db.prepare('INSERT INTO captures (id, submission_id, created_at, side, mode, sha256, hash_only, device_meta_json) VALUES (?,?,?,?,?,?,?,?)');
  const insBlob = db.prepare('INSERT INTO capture_blobs (capture_id, data_b64) VALUES (?,?)');
  const insAnn = db.prepare('INSERT INTO annotations (id, capture_id, type, x, y, w, h, note, created_at) VALUES (?,?,?,?,?,?,?,?,?)');
  const insMeas = db.prepare('INSERT INTO measurements (submission_id, lane, score, detail_json, capture_id, created_at) VALUES (?,?,?,?,?,?)');
  const insObs = db.prepare(`INSERT INTO observations (id, submission_id, capture_id, lane, severity, confidence, source,
      reviewer_disposition, reviewer, note, created_at, reviewed_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  const insQc = db.prepare(`INSERT INTO qc_reviews (submission_id, approved, reviewer, note, created_at)
    SELECT ?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM qc_reviews WHERE submission_id=? AND created_at=?)`);
  const insCert = db.prepare(`INSERT INTO certificates (cert_id, sealed_at, public_grade, internal_index, algorithm_version, qr_payload)
    VALUES (?,?,?,?,?,?) ON CONFLICT(cert_id) DO NOTHING`);
  const selDoc = db.prepare('SELECT doc_json FROM submissions WHERE id=?');
  const selAllDocs = db.prepare('SELECT doc_json FROM submissions ORDER BY rowid DESC');
  const selAllBlobs = db.prepare('SELECT capture_id, data_b64 FROM capture_blobs');
  const selSubBlobs = db.prepare(`SELECT b.capture_id, b.data_b64 FROM capture_blobs b
    JOIN captures c ON c.id = b.capture_id WHERE c.submission_id=?`);

  function putDoc(s) {
    const caps = s.captures || [];
    const capIds = new Set(caps.map(c => c && c.id));
    const blobs = new Map();
    const doc = {
      ...s,
      captures: caps.map(c => {
        if (c && c.storedData) { blobs.set(c.id, c.storedData); const { storedData, ...rest } = c; return rest; }
        return c;
      }),
    };

    insSub.run(s.id, s.createdAt || new Date().toISOString(), s.updatedAt || null,
      s.status || 'intake', s.demo ? 1 : 0, JSON.stringify(s.item || {}), JSON.stringify(doc));

    // rebuild child projections for this submission
    delBlobs.run(s.id); delAnns.run(s.id); delMeas.run(s.id); delObs.run(s.id); delCaps.run(s.id);
    for (const c of caps) {
      if (!c || !c.id) continue;
      insCap.run(c.id, s.id, c.capturedAt || s.createdAt || new Date().toISOString(),
        c.side, c.mode, c.sha256 || '', c.hashOnly ? 1 : 0, JSON.stringify(c.deviceMeta || {}));
      if (blobs.has(c.id)) insBlob.run(c.id, blobs.get(c.id));
    }
    for (const a of s.annotations || []) {
      if (!a || !a.id || !capIds.has(a.evidenceId)) continue;
      insAnn.run(a.id, a.evidenceId, a.type || 'defect', a.x ?? null, a.y ?? null,
        a.w ?? null, a.h ?? null, a.note || '', a.createdAt || new Date().toISOString());
    }
    for (const [lane, m] of Object.entries(s.measurements || {})) {
      if (!m) continue;
      insMeas.run(s.id, lane, typeof m.score === 'number' ? m.score : null,
        JSON.stringify(m.detail || {}), capIds.has(m.captureId) ? m.captureId : null,
        m.updatedAt || new Date().toISOString());
    }
    for (const o of s.observations || []) {
      if (!o || !o.id || !capIds.has(o.evidenceId)) continue;   // schema requires cited evidence
      insObs.run(o.id, s.id, o.evidenceId, o.lane || (o.lanes || [])[0] || null,
        typeof o.severity === 'number' ? o.severity : 0.3, o.confidence ?? null,
        o.source || 'human', o.reviewerDisposition || 'pending', o.reviewer || null,
        o.note || '', o.createdAt || new Date().toISOString(), o.reviewedAt || null);
    }
    if (s.qc && s.qc.at) {
      insQc.run(s.id, s.qc.approved ? 1 : 0, s.qc.reviewer || 'Human QC', s.qc.note || '',
        s.qc.at, s.id, s.qc.at);
    }
    if (s.certificate && s.certificate.ok && s.certificate.certId) {
      insCert.run(s.certificate.certId, s.certificate.sealedAt || new Date().toISOString(),
        s.certificate.publicGrade ?? 0, s.evaluation?.internalConditionIndex ?? 0,
        s.certificate.algorithmVersion || '', s.certificate.qrPayload || '');
    }
  }

  function deleteSub(id) {
    delBlobs.run(id); delAnns.run(id); delMeas.run(id); delObs.run(id); delCaps.run(id);
    db.prepare('DELETE FROM qc_reviews WHERE submission_id=?').run(id);
    db.prepare('DELETE FROM certificates WHERE cert_id=?').run(id);
    db.prepare('UPDATE audit_log SET submission_id=NULL WHERE submission_id=?').run(id);
    db.prepare('DELETE FROM submissions WHERE id=?').run(id);
  }

  function hydrate(doc, blobMap) {
    for (const c of doc.captures || []) {
      if (c && blobMap.has(c.id)) c.storedData = blobMap.get(c.id);
    }
    return doc;
  }

  function get(id) {
    const row = selDoc.get(id);
    if (!row) return null;
    const blobMap = new Map(selSubBlobs.all(id).map(r => [r.capture_id, r.data_b64]));
    return hydrate(JSON.parse(row.doc_json), blobMap);
  }

  function read() {
    const blobMap = new Map(selAllBlobs.all().map(r => [r.capture_id, r.data_b64]));
    return selAllDocs.all().map(r => hydrate(JSON.parse(r.doc_json), blobMap));
  }

  function write(all) {
    return tx(() => {
      const keep = new Set(all.map(s => s.id));
      for (const s of all) putDoc(s);
      for (const r of db.prepare('SELECT id FROM submissions').all()) {
        if (!keep.has(r.id)) deleteSub(r.id);
      }
    });
  }

  function put(s) { return tx(() => { putDoc(s); return s; }); }

  // ── append-only audit trail ─────────────────────────────────────────
  const insAudit = db.prepare('INSERT INTO audit_log (submission_id, action, actor, detail_json, created_at) VALUES (?,?,?,?,?)');
  function appendAudit(rec) {
    insAudit.run(rec.submissionId || null, rec.action, rec.actor || 'system',
      JSON.stringify(rec.detail || {}), rec.at || new Date().toISOString());
  }
  function auditTrail(submissionId, { limit } = {}) {
    if (submissionId) {
      return db.prepare('SELECT * FROM audit_log WHERE submission_id=? ORDER BY seq').all(submissionId)
        .map(mapAudit);
    }
    const sql = `SELECT * FROM audit_log ORDER BY seq DESC${limit ? ' LIMIT ' + Math.min(limit | 0, 5000) : ''}`;
    return db.prepare(sql).all().map(mapAudit);
  }
  const mapAudit = r => ({
    seq: r.seq, submissionId: r.submission_id, action: r.action,
    detail: JSON.parse(r.detail_json || '{}'), at: r.created_at,
  });

  // ── small JSON docs (clients, team roster, set registry, meta) ──────
  const selKv = db.prepare('SELECT doc_json FROM kv_store WHERE key=?');
  const insKv = db.prepare('INSERT INTO kv_store (key, doc_json) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET doc_json=excluded.doc_json');
  const kvGet = (key, fallback) => { const r = selKv.get(key); return r !== undefined ? JSON.parse(r.doc_json) : fallback; };
  const kvSet = (key, doc) => insKv.run(key, JSON.stringify(doc ?? null));

  // ── one-time import of the legacy JSON-file stores ──────────────────
  importLegacy();

  function importLegacy() {
    if (kvGet('meta:imported')) return;
    db.exec('PRAGMA foreign_keys = OFF');   // legacy audit rows may cite gone subs
    try {
      tx(() => {
        const subs = readJson(path.join(dataDir, 'submissions.json'), []);
        // file array is newest-first; insert reversed so rowid order = chronology
        for (const s of [...subs].reverse()) putDoc(s);

        const auditFile = path.join(dataDir, 'audit.jsonl');
        if (fs.existsSync(auditFile)) {
          for (const l of fs.readFileSync(auditFile, 'utf8').split('\n').filter(Boolean)) {
            try { appendAudit(JSON.parse(l)); } catch { /* skip malformed line */ }
          }
        }
        const clients = readJson(path.join(dataDir, 'clients.json'), null);
        if (clients !== null) kvSet('clients', clients);
        const team = readJson(path.join(dataDir, 'team.json'), null);
        if (team !== null) kvSet('team', team);
        const registry = readJson(path.join(dataDir, 'registry.json'), null);
        if (registry !== null) kvSet('registry', registry);
        kvSet('meta:imported', { at: new Date().toISOString() });
      });
    } finally {
      db.exec('PRAGMA foreign_keys = ON');
    }
  }

  return { db, tx, read, write, get, put, appendAudit, auditTrail, kvGet, kvSet };
}

module.exports = openStore;
