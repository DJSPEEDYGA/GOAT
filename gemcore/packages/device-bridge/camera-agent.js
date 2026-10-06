#!/usr/bin/env node
'use strict';
// GemCore camera agent — runs on the lab machine with the imaging hardware.
// Registers camera roles, polls for 'capture' jobs, snaps a frame via
// ffmpeg/v4l2, hashes it, and posts an evidence record back.
//
//   GEMCORE_API=http://server:4300 GEMCORE_STAFF_KEY=GS-... node camera-agent.js
//
// Roles map to /dev/videoN via CAM_MAP env (JSON), e.g.
//   CAM_MAP='{"overview":"/dev/video0","microscope":"/dev/video2","uv-ir":"/dev/video4","raking":"/dev/video6"}'
//
// Job shape the agent understands:
//   { type:'capture', submissionId:'GC-…', side:'front'|'back'|'edge'|'corner',
//     role:'overview'|'microscope'|'uv-ir'|'raking'|'macro', mode:'daylight'|'uv'|'ir'|'raking' }

const { execFileSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const API = (process.env.GEMCORE_API || 'http://127.0.0.1:4300').replace(/\/$/, '');
const STAFF = process.env.GEMCORE_STAFF_KEY || '';
const ID = process.env.DEVICE_ID || 'lab-cameras';
const POLL_MS = Number(process.env.POLL_MS || 4000);
const RES = process.env.CAM_RES || '1920x1080';

const CAM_MAP = JSON.parse(process.env.CAM_MAP || '{}');
const CAPS = Object.keys(CAM_MAP).map(r => 'capture-' + r);
if (!CAPS.length) CAPS.push('capture');

const headers = { 'Content-Type': 'application/json', 'x-staff-key': STAFF };
const api = (p, m = 'GET', b) =>
  fetch(API + p, { method: m, headers, body: b ? JSON.stringify(b) : undefined }).then(r => r.json());

// roles → valid CAPTURE_MODES (evidence-core rejects anything else)
const ROLE_MODE = {
  overview: 'visible', macro: 'macro', microscope: 'microscope',
  'uv-ir': 'uv', 'macro-telescope': 'macro', raking: 'raking', ir: 'ir',
};

function snap(devPath, outFile) {
  // one frame from v4l2 via ffmpeg; falls back to fswebcam if ffmpeg missing
  try {
    execFileSync('ffmpeg', ['-y', '-f', 'v4l2', '-input_format', 'mjpeg',
      '-video_size', RES, '-i', devPath,
      '-frames:v', '1', '-q:v', '2', outFile], { stdio: 'pipe' });
    return true;
  } catch (_) {
    execFileSync('fswebcam', ['-d', devPath, '-r', RES, '--no-banner', outFile], { stdio: 'pipe' });
    return true;
  }
}

async function execute(job) {
  if (job.type !== 'capture') return { ok: false, note: 'unknown job type ' + job.type };
  const role = job.role || 'overview';
  const dev = CAM_MAP[role] || CAM_MAP.overview || '/dev/video0';
  const tmp = path.join(os.tmpdir(), `gc-${Date.now()}.jpg`);
  snap(dev, tmp);
  const buf = fs.readFileSync(tmp);
  fs.unlinkSync(tmp);
  const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
  const data = 'data:image/jpeg;base64,' + buf.toString('base64');
  const rec = await api(`/api/submissions/${job.submissionId}/captures`, 'POST', {
    data, sha256,
    side: job.side || 'front',
    mode: job.mode || ROLE_MODE[role] || 'visible',
    deviceMeta: { deviceId: ID, role, dev, res: RES, via: 'camera-agent' },
  });
  return { ok: true, captureId: rec.id, sha256: rec.sha256 || sha256 };
}

async function main() {
  const reg = await api('/api/devices/register', 'POST', { id: ID, caps: CAPS });
  console.log(`[cam-agent] ${ID} registered → ${API} caps=${CAPS.join(',')}`);
  setInterval(() => api(`/api/devices/${ID}/heartbeat`, 'POST', { state: { cams: Object.keys(CAM_MAP) } }).catch(() => {}), 20000);
  while (true) {
    try {
      const { job } = await api(`/api/devices/${ID}/poll`);
      if (job) {
        console.log(`[cam-agent] claimed ${job.id} (${job.role || 'overview'})`);
        try {
          const result = await execute(job);
          await api(`/api/jobs/${job.id}/complete`, 'POST', { result });
          console.log(`[cam-agent] ${job.id} →`, result.captureId || result.note || 'done');
        } catch (e) {
          await api(`/api/jobs/${job.id}/complete`, 'POST', { result: { ok: false, error: e.message } });
          console.log(`[cam-agent] ${job.id} failed: ${e.message}`);
        }
      }
    } catch (e) { console.log(`[cam-agent] poll error: ${e.message}`); }
    await new Promise(r => setTimeout(r, POLL_MS));
  }
}

main().catch(e => { console.error('[cam-agent] fatal', e); process.exit(1); });
