'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const { spawn } = require('node:child_process');
const { test } = require('node:test');
const { CompetitorWatch, validateFeed, emptyFeed, officialUrl, FEED_URL, MAX_BYTES, REFRESH_MS } = require('../packages/competitor-watch');

const NOW = '2026-10-28T12:00:00.000Z';
const SOURCES = { PSA: 'https://www.psacard.com/articles', TAG: 'https://taggrading.com/pages/news', Beckett: 'https://www.beckett.com/grading', CGC: 'https://www.cgccards.com/news/' };
function feed() {
  const result = emptyFeed();
  result.monitoring.status = 'ok';
  result.monitoring.lastCheckedAt = NOW;
  result.monitoring.message = 'Fixture: successful checks';
  result.monitoring.checks.forEach(item => { item.status = 'ok'; item.checkedAt = NOW; });
  result.entries = [{
    company: 'TAG', title: 'Fixture report update', category: 'evidence-report', announcementDate: '2026-10-28',
    effectiveDate: '2026-11-01', firstObservedAt: NOW, dateNote: '',
    source: { url: SOURCES.TAG, title: 'Fixture official report', claimType: 'company-announcement' },
    summary: 'Test fixture; never published.', significance: 'medium', whyMeaningful: 'Fixture evidence change',
    comparisons: Object.entries(SOURCES).map(([company, sourceUrl]) => ({ company, status: 'documented', sourceUrl, summary: 'Fixture comparison' })),
    opportunities: [{ priority: 1, action: 'Validate a report workflow', rationale: 'Fixture rationale', nextStep: 'Run a controlled evaluation', impact: 'Report clarity', effort: 'Small', dependencies: 'Test data', validation: 'Compare exported evidence' }],
    pricing: null,
  }];
  result.baselines = [{ company: 'TAG', sourceUrl: SOURCES.TAG, observedAt: NOW, facts: [{ key: 'fixture', value: 'Test baseline' }] }];
  return result;
}
function temp(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gemcore-watch-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test('validates official evidence, comparison completeness and date semantics', () => {
  assert.deepEqual(validateFeed(emptyFeed()), emptyFeed());
  const result = validateFeed(feed());
  assert.match(result.entries[0].id, /^tag-[a-f0-9]{20}$/);
  assert.equal(result.entries[0].effectiveDate, '2026-11-01');
  assert.equal(result.entries[0].opportunities[0].validation, 'Compare exported evidence');
  assert.equal(officialUrl('https://help.taggrading.com/en/example?utm_source=x#heading', 'TAG'), 'https://help.taggrading.com/en/example');
  for (const bad of ['http://taggrading.com/', 'https://taggrading.com.evil.test/', 'https://evil.test/', 'https://user:pass@taggrading.com/', 'https://taggrading.com:8443/']) assert.throws(() => officialUrl(bad, 'TAG'));
  const missingComparison = feed(); missingComparison.entries[0].comparisons.pop();
  assert.throws(() => validateFeed(missingComparison), /four companies/);
  const unsupportedComparison = feed(); unsupportedComparison.entries[0].comparisons[0].sourceUrl = null;
  assert.throws(() => validateFeed(unsupportedComparison), /official source/);
  const unknownDate = feed(); unknownDate.entries[0].announcementDate = null;
  assert.throws(() => validateFeed(unknownDate), /dateNote/);
  unknownDate.entries[0].dateNote = 'Publication date unavailable; observation is not a launch date.';
  assert.equal(validateFeed(unknownDate).entries[0].announcementDate, null);
  const invalidDay = feed(); invalidDay.entries[0].announcementDate = '2026-02-30';
  assert.throws(() => validateFeed(invalidDay), /announcementDate/);
  const unchecked = feed(); unchecked.monitoring.checks[1].status = 'not-checked'; unchecked.monitoring.checks[1].checkedAt = null;
  assert.throws(() => validateFeed(unchecked), /four successful/);
  const poisonedBaseline = feed(); poisonedBaseline.baselines[0].sourceUrl = 'https://example.com/';
  assert.throws(() => validateFeed(poisonedBaseline), /Non-official/);
});

test('deduplicates, persists, retains entries and rejects stale snapshots', t => {
  const dir = temp(t);
  const watch = new CompetitorWatch(dir, { feedUrl: 'off' });
  const input = feed(); input.entries.push(structuredClone(input.entries[0]));
  watch.import(input);
  assert.equal(watch.snapshot().entries.length, 1);
  const next = emptyFeed(); next.monitoring = structuredClone(input.monitoring); next.monitoring.lastCheckedAt = '2026-10-29T12:00:00.000Z';
  watch.import(next);
  assert.equal(watch.snapshot().entries.length, 1);
  assert.equal(watch.snapshot().baselines.length, 1);
  assert.throws(() => watch.import(feed()), /older/);
  const reopened = new CompetitorWatch(dir, { feedUrl: 'off' });
  assert.equal(reopened.snapshot().entries[0].firstObservedAt, NOW);
  assert.equal(reopened.snapshot().monitoring.lastCheckedAt, next.monitoring.lastCheckedAt);
  const invalid = feed(); invalid.entries[0].source.url = 'https://attacker.example/';
  const before = fs.readFileSync(watch.file, 'utf8');
  assert.throws(() => watch.import(invalid));
  assert.equal(fs.readFileSync(watch.file, 'utf8'), before);
});

test('stable IDs update corrected announcements without duplicates or company collisions', t => {
  const dir = temp(t);
  const watch = new CompetitorWatch(dir, { feedUrl: 'off' });
  const initial = feed();
  initial.entries[0].id = 'tag-report-update-2026';
  initial.entries[0].announcementDate = null;
  initial.entries[0].dateNote = 'Publication date not yet verified.';
  watch.import(initial);
  const corrected = feed();
  corrected.monitoring.lastCheckedAt = '2026-10-29T12:00:00.000Z';
  corrected.monitoring.checks.forEach(item => { item.checkedAt = corrected.monitoring.lastCheckedAt; });
  corrected.entries[0].id = initial.entries[0].id;
  corrected.entries[0].title = 'Corrected fixture report title';
  corrected.entries[0].announcementDate = '2026-10-27';
  corrected.entries[0].firstObservedAt = corrected.monitoring.lastCheckedAt;
  watch.import(corrected);
  const result = watch.snapshot();
  assert.equal(result.entries.length, 1);
  assert.equal(result.entries[0].id, initial.entries[0].id);
  assert.equal(result.entries[0].title, corrected.entries[0].title);
  assert.equal(result.entries[0].announcementDate, '2026-10-27');
  assert.equal(result.entries[0].firstObservedAt, NOW);
  assert.equal(new CompetitorWatch(dir, { feedUrl: 'off' }).snapshot().entries.length, 1);
  const collision = feed();
  collision.entries[0].id = 'psa-report-update-2026';
  assert.throws(() => validateFeed(collision), /company prefix/);
  assert.throws(() => watch.import(collision), /company prefix/);
  for (const id of ['tag-../file', 'tag-<script>', 'tag-', 'tag-' + 'x'.repeat(93)]) {
    const invalid = feed(); invalid.entries[0].id = id;
    assert.throws(() => validateFeed(invalid), /entry.id/);
  }
});

test('refreshes only approved URL, limits fetches and retains data after failures', async t => {
  const dir = temp(t);
  let now = Date.parse(NOW), calls = 0, response = feed();
  const watch = new CompetitorWatch(dir, { now: () => now, fetch: async (url, options) => {
    calls++; assert.equal(url, FEED_URL); assert.equal(options.redirect, 'error');
    if (response instanceof Error) throw response;
    return new Response(JSON.stringify(response), { headers: { 'content-type': 'application/json' } });
  } });
  const first = await watch.refresh();
  assert.equal(first.delivery.status, 'ok'); assert.equal(calls, 1);
  await watch.refresh(); assert.equal(calls, 1);
  now += REFRESH_MS; response = new Error('contains sensitive upstream details');
  const failed = await watch.refresh();
  assert.equal(failed.delivery.status, 'error'); assert.equal(failed.entries.length, 1);
  assert.ok(!failed.delivery.error.includes('sensitive'));
  now += REFRESH_MS; response = emptyFeed();
  const stale = await watch.refresh();
  assert.match(stale.delivery.error, /older/); assert.equal(stale.entries.length, 1);
  let fetched = false;
  const blocked = new CompetitorWatch(temp(t), { feedUrl: 'https://127.0.0.1/private', fetch: async () => { fetched = true; } });
  assert.equal((await blocked.refresh()).delivery.status, 'error'); assert.equal(fetched, false);
});

test('rejects oversized network body before JSON import', async t => {
  const watch = new CompetitorWatch(temp(t), { fetch: async () => new Response('x'.repeat(MAX_BYTES + 1)) });
  const state = await watch.refresh();
  assert.equal(state.delivery.status, 'error'); assert.match(state.delivery.error, /1 MiB/); assert.equal(state.entries.length, 0);
});

async function startServer(t, overrides) {
  const port = await new Promise(resolve => { const socket = net.createServer(); socket.listen(0, '127.0.0.1', () => { const port = socket.address().port; socket.close(() => resolve(port)); }); });
  const processHandle = spawn(process.execPath, ['apps/api/server.js'], {
    cwd: path.resolve(__dirname, '..'), stdio: 'ignore',
    env: { ...process.env, GEMCORE_PORT: String(port), GEMCORE_DATA_DIR: temp(t), GEMCORE_STAFF_KEY: 'test-staff', GEMCORE_WATCH_FEED_URL: 'off', GEMCORE_WATCH_INGEST_KEY: '', ...overrides },
  });
  t.after(() => { processHandle.kill(); });
  const base = 'http://127.0.0.1:' + port;
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(base + '/api/health')).ok) return base; } catch {}
    await new Promise(resolve => setTimeout(resolve, 30));
  }
  throw new Error('Test server did not start');
}

test('API guards reads and requires separate configured credential for imports', async t => {
  const base = await startServer(t, { GEMCORE_WATCH_INGEST_KEY: 'test-ingest' });
  assert.equal((await fetch(base + '/api/competitor-watch')).status, 403);
  assert.equal((await fetch(base + '/API/COMPETITOR-WATCH/')).status, 403);
  const headers = { 'content-type': 'application/json', 'x-staff-key': 'test-staff' };
  const initial = await fetch(base + '/api/competitor-watch', { headers }).then(r => r.json());
  assert.equal(initial.monitoring.status, 'awaiting-first-check');
  assert.equal((await fetch(base + '/api/competitor-watch/import', { method: 'POST', headers, body: JSON.stringify(feed()) })).status, 403);
  const importHeaders = { 'content-type': 'application/json', 'x-watch-ingest-key': 'test-ingest' };
  assert.equal((await fetch(base + '/api/competitor-watch/import', { method: 'POST', headers: importHeaders, body: JSON.stringify(feed()) })).status, 200);
  const saved = await fetch(base + '/api/competitor-watch', { headers }).then(r => r.json());
  assert.equal(saved.entries.length, 1);
  const invalid = feed(); invalid.entries[0].source.url = 'https://example.com/';
  assert.equal((await fetch(base + '/api/competitor-watch/import', { method: 'POST', headers: importHeaders, body: JSON.stringify(invalid) })).status, 400);
  const open = await startServer(t, { GEMCORE_STAFF_KEY: '', GEMCORE_WATCH_INGEST_KEY: 'test-ingest' });
  for (const host of [base, open]) {
    for (const route of ['/api/competitor-watch/import/', '/API/COMPETITOR-WATCH/IMPORT']) {
      for (const key of ['', 'wrong-key']) {
        assert.equal((await fetch(host + route, { method: 'POST', headers: { ...headers, 'x-watch-ingest-key': key }, body: JSON.stringify(feed()) })).status, 403);
      }
      assert.equal((await fetch(host + route, { method: 'POST', headers: importHeaders, body: JSON.stringify(feed()) })).status, 200);
    }
  }
  const unconfigured = await startServer(t, { GEMCORE_STAFF_KEY: '' });
  for (const route of ['/api/competitor-watch/import', '/api/competitor-watch/import/', '/API/COMPETITOR-WATCH/IMPORT']) {
    assert.equal((await fetch(unconfigured + route, { method: 'POST', headers: importHeaders, body: JSON.stringify(feed()) })).status, 503);
  }
});
