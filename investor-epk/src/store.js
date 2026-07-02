'use strict';

const fs = require('fs');
const path = require('path');
const { config } = require('./config');

function ensureDir() {
  if (!fs.existsSync(config.dataDir)) {
    fs.mkdirSync(config.dataDir, { recursive: true });
  }
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJsonAtomic(file, obj) {
  ensureDir();
  const tmp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
  fs.renameSync(tmp, file);
}

// ---- Investors -----------------------------------------------------------

function loadInvestors() {
  const data = readJson(config.paths.investors, { investors: [] });
  return Array.isArray(data.investors) ? data.investors : [];
}

function saveInvestors(list) {
  writeJsonAtomic(config.paths.investors, { investors: list });
}

function findInvestorByEmail(email) {
  if (!email) return null;
  const target = String(email).trim().toLowerCase();
  return loadInvestors().find((u) => u.email.toLowerCase() === target) || null;
}

function upsertInvestor(investor) {
  const list = loadInvestors();
  const idx = list.findIndex((u) => u.email.toLowerCase() === investor.email.toLowerCase());
  if (idx >= 0) list[idx] = { ...list[idx], ...investor };
  else list.push(investor);
  saveInvestors(list);
  return investor;
}

// ---- IP approvals --------------------------------------------------------
// Shape: { "email": { approved: ["1.2.3.4"], pending: [{ ip, ua, ts }] } }

function loadApprovals() {
  return readJson(config.paths.ipApprovals, {});
}

function saveApprovals(obj) {
  writeJsonAtomic(config.paths.ipApprovals, obj);
}

function isIpApproved(email, ip) {
  const all = loadApprovals();
  const rec = all[email.toLowerCase()];
  return !!(rec && Array.isArray(rec.approved) && rec.approved.includes(ip));
}

function addPendingIp(email, ip, ua) {
  const key = email.toLowerCase();
  const all = loadApprovals();
  const rec = all[key] || { approved: [], pending: [] };
  const already = rec.pending.find((p) => p.ip === ip) || rec.approved.includes(ip);
  if (!already) {
    rec.pending.push({ ip, ua: ua || '', ts: new Date().toISOString() });
    all[key] = rec;
    saveApprovals(all);
  }
}

function approveIp(email, ip) {
  const key = email.toLowerCase();
  const all = loadApprovals();
  const rec = all[key] || { approved: [], pending: [] };
  if (!rec.approved.includes(ip)) rec.approved.push(ip);
  rec.pending = (rec.pending || []).filter((p) => p.ip !== ip);
  all[key] = rec;
  saveApprovals(all);
}

function revokeIp(email, ip) {
  const key = email.toLowerCase();
  const all = loadApprovals();
  const rec = all[key];
  if (!rec) return;
  rec.approved = (rec.approved || []).filter((x) => x !== ip);
  rec.pending = (rec.pending || []).filter((p) => p.ip !== ip);
  all[key] = rec;
  saveApprovals(all);
}

function listApprovals() {
  return loadApprovals();
}

module.exports = {
  loadInvestors,
  saveInvestors,
  findInvestorByEmail,
  upsertInvestor,
  isIpApproved,
  addPendingIp,
  approveIp,
  revokeIp,
  listApprovals,
};
