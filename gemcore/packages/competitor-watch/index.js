'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const FEED_URL = 'https://raw.githubusercontent.com/DJSPEEDYGA/GOAT/gemcore-competitor-feed/gemcore/config/competitor-feed.json';
const COMPANIES = ['PSA', 'TAG', 'Beckett', 'CGC'];
const DOMAINS = { PSA: 'psacard.com', TAG: 'taggrading.com', Beckett: 'beckett.com', CGC: 'cgccards.com' };
const SOURCES = {
  PSA: 'https://www.psacard.com/articles', TAG: 'https://taggrading.com/pages/news',
  Beckett: 'https://www.beckett.com/grading', CGC: 'https://www.cgccards.com/news/',
};
const CATEGORIES = ['grading-technology', 'authentication', 'inspection', 'evidence-report', 'pricing'];
const MAX_BYTES = 1024 * 1024;
const MAX_ENTRIES = 500;
const REFRESH_MS = 15 * 60 * 1000;

function fail(message) { throw new Error(message); }
function text(value, name, max = 3000, optional = false) {
  if (optional && (value === undefined || value === null || value === '')) return '';
  if (typeof value !== 'string' || !value.trim() || value.length > max) fail(`Invalid ${name}`);
  return value.trim();
}
function choice(value, values, name) {
  if (!values.includes(value)) fail(`Invalid ${name}`);
  return value;
}
function instant(value, name, nullable = false) {
  if (nullable && value === null) return null;
  if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(value)) fail(`Invalid ${name}`);
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value.slice(0, 10)) fail(`Invalid ${name}`);
  return parsed.toISOString();
}
function day(value, name) {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\d$/.test(value)) fail(`Invalid ${name}`);
  if (new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value) fail(`Invalid ${name}`);
  return value;
}
function officialUrl(value, company, name = 'source URL') {
  text(value, name, 2048);
  let url;
  try { url = new URL(value); } catch { fail(`Invalid ${name}`); }
  const domain = DOMAINS[company];
  if (url.protocol !== 'https:' || url.username || url.password || url.port ||
      !(url.hostname === domain || url.hostname.endsWith('.' + domain))) fail(`Non-official ${company} ${name}`);
  url.hash = '';
  for (const key of [...url.searchParams.keys()]) if (/^utm_|^(fbclid|gclid)$/i.test(key)) url.searchParams.delete(key);
  url.searchParams.sort();
  return url.href;
}

function emptyFeed() {
  return {
    schemaVersion: 1,
    monitoring: {
      status: 'awaiting-first-check', lastCheckedAt: null,
      message: 'No official-source check has been published yet.',
      checks: COMPANIES.map(company => ({ company, status: 'not-checked', checkedAt: null, url: SOURCES[company], detail: '' })),
    },
    entries: [],
    baselines: [],
  };
}

function validateEntry(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Invalid entry');
  const company = choice(input.company, COMPANIES, 'company');
  let stableId;
  if (input.id !== undefined) {
    stableId = text(input.id, 'entry.id', 96);
    if (!new RegExp('^' + company.toLowerCase() + '-[a-z0-9][a-z0-9_-]*$').test(stableId)) fail('Invalid entry.id company prefix or format');
  }
  const source = input.source || {};
  const url = officialUrl(source.url, company);
  const title = text(input.title, 'title', 240);
  const announcementDate = day(input.announcementDate, 'announcementDate');
  const firstObservedAt = instant(input.firstObservedAt, 'firstObservedAt');
  const dateNote = text(input.dateNote, 'dateNote', 1000, !!announcementDate);
  if (announcementDate && announcementDate > firstObservedAt.slice(0, 10)) fail('Announcement date is after first observation');
  const comparisons = input.comparisons;
  if (!Array.isArray(comparisons) || comparisons.length !== COMPANIES.length ||
      new Set(comparisons.map(x => x?.company)).size !== COMPANIES.length) fail('Comparisons must cover all four companies');
  const opportunities = input.opportunities;
  if (!Array.isArray(opportunities) || !opportunities.length || opportunities.length > 10) fail('One to ten opportunities required');
  const key = [company, url, announcementDate || firstObservedAt.slice(0, 10), title.toLowerCase()].join('\n');
  const result = {
    id: stableId || company.toLowerCase() + '-' + crypto.createHash('sha256').update(key).digest('hex').slice(0, 20),
    company, title, category: choice(input.category, CATEGORIES, 'category'), announcementDate,
    effectiveDate: day(input.effectiveDate, 'effectiveDate'), firstObservedAt, dateNote,
    source: { url, title: text(source.title, 'source.title', 240) },
    summary: text(input.summary, 'summary'),
    significance: choice(input.significance, ['high', 'medium'], 'significance'),
    whyMeaningful: text(input.whyMeaningful, 'whyMeaningful'),
    comparisons: comparisons.map(item => {
      const name = choice(item.company, COMPANIES, 'comparison.company');
      const status = choice(item.status, ['documented', 'not-verified'], 'comparison.status');
      if (status === 'documented' && !item.sourceUrl) fail('Documented comparisons require an official source');
      return { company: name, status, summary: text(item.summary, 'comparison.summary'),
        sourceUrl: item.sourceUrl ? officialUrl(item.sourceUrl, name, 'comparison source') : null };
    }),
    opportunities: opportunities.map(item => {
      const value = { priority: choice(item.priority, [1, 2, 3], 'opportunity.priority'),
        action: text(item.action, 'opportunity.action', 500), rationale: text(item.rationale, 'opportunity.rationale'),
        nextStep: text(item.nextStep, 'opportunity.nextStep') };
      for (const field of ['impact', 'effort', 'dependencies', 'validation']) {
        if (item[field]) value[field] = text(item[field], 'opportunity.' + field, 2000);
      }
      return value;
    }).sort((a, b) => a.priority - b.priority),
    pricing: null,
  };
  if (source.claimType) result.source.claimType = choice(source.claimType, ['company-announcement', 'verified-page-change'], 'source.claimType');
  if (input.pricing !== null && input.pricing !== undefined) {
    if (result.category !== 'pricing') fail('Pricing details require pricing category');
    const price = input.pricing;
    result.pricing = {};
    for (const field of ['currency', 'region', 'tier', 'before', 'after', 'conditions']) result.pricing[field] = text(price[field], 'pricing.' + field, 2000);
  }
  return result;
}

function validateFeed(input) {
  if (!input || input.schemaVersion !== 1) fail('schemaVersion must be 1');
  if (!Array.isArray(input.entries) || input.entries.length > MAX_ENTRIES) fail('Invalid entries or too many entries');
  const monitor = input.monitoring || {};
  const status = choice(monitor.status, ['awaiting-first-check', 'ok', 'partial', 'error'], 'monitoring.status');
  const lastCheckedAt = instant(monitor.lastCheckedAt, 'monitoring.lastCheckedAt', true);
  if (status === 'awaiting-first-check' ? lastCheckedAt !== null : lastCheckedAt === null) fail('Monitoring status and date disagree');
  if (!Array.isArray(monitor.checks) || monitor.checks.length !== 4 || new Set(monitor.checks.map(x => x?.company)).size !== 4) fail('Checks must cover all four companies');
  const checks = monitor.checks.map(item => {
    const company = choice(item.company, COMPANIES, 'check.company');
    const checkStatus = choice(item.status, ['ok', 'error', 'not-checked'], 'check.status');
    const checkedAt = instant(item.checkedAt, 'check.checkedAt', true);
    if (checkStatus === 'not-checked' ? checkedAt !== null : checkedAt === null) fail('Check status and date disagree');
    if (checkedAt && (!lastCheckedAt || checkedAt > lastCheckedAt)) fail('Check is newer than monitor date');
    return { company, status: checkStatus, checkedAt, url: officialUrl(item.url, company, 'check URL'), detail: text(item.detail, 'check.detail', 2000, true) };
  });
  if (status === 'ok' && checks.some(item => item.status !== 'ok')) fail('Successful monitor requires four successful checks');
  if (status === 'awaiting-first-check' && (input.entries.length || checks.some(item => item.status !== 'not-checked'))) fail('Awaiting check must be empty');
  const baselineInput = input.baselines || [];
  if (!Array.isArray(baselineInput) || baselineInput.length > 40) fail('Invalid baselines');
  const baselines = baselineInput.map(item => {
    const company = choice(item.company, COMPANIES, 'baseline.company');
    const observedAt = instant(item.observedAt, 'baseline.observedAt');
    if (!lastCheckedAt || observedAt > lastCheckedAt) fail('Baseline is newer than monitor date');
    if (!Array.isArray(item.facts) || !item.facts.length || item.facts.length > 20) fail('Invalid baseline facts');
    return { company, sourceUrl: officialUrl(item.sourceUrl, company, 'baseline URL'), observedAt,
      facts: item.facts.map(fact => ({ key: text(fact.key, 'baseline fact key', 100), value: text(fact.value, 'baseline fact value', 1000) })) };
  });
  const entries = new Map();
  for (const item of input.entries.map(validateEntry)) {
    if (lastCheckedAt && item.firstObservedAt > lastCheckedAt) fail('Entry observation is newer than monitor date');
    const prior = entries.get(item.id);
    if (prior && prior.firstObservedAt < item.firstObservedAt) item.firstObservedAt = prior.firstObservedAt;
    entries.set(item.id, item);
  }
  return { schemaVersion: 1, monitoring: { status, lastCheckedAt, message: text(monitor.message, 'monitoring.message', 2000, true), checks },
    entries: [...entries.values()].sort((a, b) => b.firstObservedAt.localeCompare(a.firstObservedAt)), baselines };
}

function secureEqual(candidate, expected) {
  if (!expected || typeof candidate !== 'string') return false;
  const left = Buffer.from(candidate), right = Buffer.from(expected);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

class CompetitorWatch {
  constructor(dataDir, options = {}) {
    this.file = path.join(dataDir, 'competitor-watch.json');
    this.fetch = options.fetch || global.fetch;
    this.now = options.now || (() => Date.now());
    this.feedUrl = options.feedUrl === undefined ? (process.env.GEMCORE_WATCH_FEED_URL || FEED_URL) : options.feedUrl;
    this.feed = emptyFeed();
    this.inFlight = null;
    this.lastAttemptMs = null;
    this.delivery = { status: 'not-configured', feedUrl: null, lastAttemptAt: null, lastSuccessAt: null, error: null };
    fs.mkdirSync(dataDir, { recursive: true });
    if (fs.existsSync(this.file)) {
      try { this.feed = validateFeed(JSON.parse(fs.readFileSync(this.file, 'utf8'))); }
      catch { this.delivery = { ...this.delivery, status: 'error', error: 'Saved feed is invalid; waiting for a validated replacement.' }; }
    }
    if (this.feedUrl !== 'off' && this.feedUrl !== FEED_URL) {
      this.delivery.status = 'error';
      this.delivery.error = 'Feed URL is not the approved GemCore source.';
    }
    if (this.feedUrl === FEED_URL) this.delivery.feedUrl = FEED_URL;
  }

  import(input) {
    const incoming = validateFeed(input);
    const currentTime = this.feed.monitoring.lastCheckedAt;
    if (currentTime && (!incoming.monitoring.lastCheckedAt || incoming.monitoring.lastCheckedAt < currentTime)) {
      fail('Feed is older than the saved official-source check');
    }
    const entries = new Map(this.feed.entries.map(item => [item.id, item]));
    for (const item of incoming.entries) {
      const prior = entries.get(item.id);
      if (prior && prior.firstObservedAt < item.firstObservedAt) item.firstObservedAt = prior.firstObservedAt;
      entries.set(item.id, item);
    }
    incoming.entries = [...entries.values()].sort((a, b) => b.firstObservedAt.localeCompare(a.firstObservedAt)).slice(0, MAX_ENTRIES);
    const baselines = new Map(this.feed.baselines.map(item => [item.company + '\n' + item.sourceUrl, item]));
    for (const item of incoming.baselines) {
      const key = item.company + '\n' + item.sourceUrl;
      if (!baselines.has(key) || baselines.get(key).observedAt <= item.observedAt) baselines.set(key, item);
    }
    incoming.baselines = [...baselines.values()].sort((a, b) => b.observedAt.localeCompare(a.observedAt)).slice(0, 40);
    const serialized = JSON.stringify(incoming, null, 2);
    if (Buffer.byteLength(serialized) > MAX_BYTES) fail('Feed exceeds 1 MiB');
    const temporary = this.file + '.' + crypto.randomBytes(6).toString('hex') + '.tmp';
    try { fs.writeFileSync(temporary, serialized, { flag: 'wx', mode: 0o600 }); fs.renameSync(temporary, this.file); }
    catch (error) { try { fs.unlinkSync(temporary); } catch {} throw error; }
    this.feed = incoming;
    return this.snapshot();
  }

  snapshot() {
    return { ...this.feed, delivery: { ...this.delivery } };
  }

  async refresh() {
    if (this.feedUrl !== FEED_URL) return this.snapshot();
    if (this.inFlight) return this.inFlight;
    const now = this.now();
    if (this.lastAttemptMs !== null && now - this.lastAttemptMs < REFRESH_MS) return this.snapshot();
    this.lastAttemptMs = now;
    this.delivery.lastAttemptAt = new Date(now).toISOString();
    this.inFlight = (async () => {
      try {
        const response = await this.fetch(FEED_URL, {
          headers: { accept: 'application/json' }, redirect: 'error', signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) fail(`Feed request failed (HTTP ${response.status})`);
        if (Number(response.headers.get('content-length')) > MAX_BYTES) fail('Feed exceeds 1 MiB');
        const reader = response.body?.getReader();
        if (!reader) fail('Feed response has no body');
        const chunks = [];
        let size = 0;
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > MAX_BYTES) { await reader.cancel(); fail('Feed exceeds 1 MiB'); }
            chunks.push(Buffer.from(value));
          }
        } finally { reader.releaseLock(); }
        this.import(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        this.delivery.status = 'ok';
        this.delivery.lastSuccessAt = new Date(this.now()).toISOString();
        this.delivery.error = null;
      } catch (error) {
        this.delivery.status = 'error';
        // Errors are intentionally generic: response bodies and credentials are never reflected.
        this.delivery.error = 'Feed refresh failed; the last validated announcements are retained. ' +
          (/^Feed |^Invalid |^Non-official |^Comparisons |^Checks |^Monitoring |^Successful |^Awaiting |^Check |^Entry |^One to |^Documented |^Announcement /.test(error.message) ? error.message : 'Source unavailable or invalid JSON.');
      }
      return this.snapshot();
    })();
    try { return await this.inFlight; } finally { this.inFlight = null; }
  }
}

module.exports = { CompetitorWatch, validateFeed, emptyFeed, officialUrl, secureEqual, FEED_URL, COMPANIES, MAX_BYTES, REFRESH_MS };
