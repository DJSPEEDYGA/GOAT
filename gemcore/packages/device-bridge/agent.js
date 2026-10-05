#!/usr/bin/env node
'use strict';
// GemCore device agent — runs on the lab machine next to the hardware.
// Registers itself, heartbeats, long-polls for jobs, executes, reports.
//
//   GEMCORE_API=http://server:4300 DEVICE_ID=welder-01 node agent.js
//
// Real hardware: put your serial/GPIO/HTTP driver call in execute().

const API = (process.env.GEMCORE_API || 'http://127.0.0.1:4300').replace(/\/$/, '');
const ID = process.env.DEVICE_ID || 'welder-01';
const CAPS = (process.env.DEVICE_CAPS || 'weld-slab,label-print').split(',');
const STAFF = process.env.GEMCORE_STAFF_KEY || '';
const POLL_MS = 5000;

const headers = { 'Content-Type': 'application/json', 'x-staff-key': STAFF };
const api = (p, m = 'GET', b) =>
  fetch(API + p, { method: m, headers, body: b ? JSON.stringify(b) : undefined }).then(r => r.json());

async function execute(job) {
  // ── REAL HARDWARE HOOK ────────────────────────────────────────────────
  // Replace with your driver. Examples:
  //   serial:  require('serialport') → send G-code / weld pulse
  //   gpio:    /sys/class/gpio or libgpiod on the Jetson
  //   printer: CUPS → `lp -d label-printer label.png`
  console.log(`[agent] executing ${job.type} for ${job.submissionId || job.certId}`);
  if (job.type === 'weld-slab') {
    // TODO: pulse ultrasonic welder via GPIO/serial — stub logs only
    return { welded: false, note: 'stub — wire the welder driver here' };
  }
  if (job.type === 'label-print') {
    return { printed: false, note: 'stub — wire CUPS/lp call here' };
  }
  return { ok: false, note: 'unknown job type' };
}

async function main() {
  const reg = await api('/api/devices/register', 'POST', { id: ID, caps: CAPS });
  console.log(`[agent] ${ID} registered (${CAPS}) → ${API}`);
  setInterval(() => api(`/api/devices/${ID}/heartbeat`, 'POST', { state: { temp: 'nominal' } }).catch(() => {}), 20000);
  while (true) {
    try {
      const { job } = await api(`/api/devices/${ID}/poll`);
      if (job) {
        console.log(`[agent] claimed ${job.id}`);
        const result = await execute(job);
        await api(`/api/jobs/${job.id}/complete`, 'POST', { result });
        console.log(`[agent] ${job.id} done:`, result);
      }
    } catch (e) { console.log(`[agent] poll error: ${e.message}`); }
    await new Promise(r => setTimeout(r, POLL_MS));
  }
}

main().catch(e => { console.error('[agent] fatal', e); process.exit(1); });
