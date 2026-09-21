'use strict';
// Device bridge — hardware registers itself and polls for jobs.
// A device agent (running on the lab machine/Jetson) long-polls for work,
// executes locally (welder, printer, robot), reports back. No inbound
// connectivity needed on the device — it dials out.
const fs = require('fs'), path = require('path');

class DeviceBridge {
  constructor(dataDir) {
    this.file = path.join(dataDir, 'devices.json');
    this.jobsFile = path.join(dataDir, 'device-jobs.json');
    if (!fs.existsSync(this.file)) fs.writeFileSync(this.file, '{}');
    if (!fs.existsSync(this.jobsFile)) fs.writeFileSync(this.jobsFile, '[]');
  }
  devices() { return JSON.parse(fs.readFileSync(this.file, 'utf8')); }
  writeDevices(d) { fs.writeFileSync(this.file, JSON.stringify(d, null, 2)); }
  jobs() { return JSON.parse(fs.readFileSync(this.jobsFile, 'utf8')); }
  writeJobs(j) { fs.writeFileSync(this.jobsFile, JSON.stringify(j, null, 2)); }

  register(id, caps) {
    const d = this.devices();
    d[id] = { id, caps, registeredAt: d[id]?.registeredAt || new Date().toISOString(), lastSeen: new Date().toISOString() };
    this.writeDevices(d); return d[id];
  }
  heartbeat(id, state = {}) {
    const d = this.devices();
    if (!d[id]) return null;
    d[id].lastSeen = new Date().toISOString(); d[id].state = state;
    this.writeDevices(d); return d[id];
  }
  enqueue(deviceId, job) {
    const j = this.jobs();
    const rec = { id: 'J-' + Date.now(), deviceId, ...job, status: 'queued', queuedAt: new Date().toISOString() };
    j.push(rec); this.writeJobs(j); return rec;
  }
  poll(deviceId) {
    const j = this.jobs();
    const job = j.find(x => x.deviceId === deviceId && x.status === 'queued');
    if (job) { job.status = 'claimed'; job.claimedAt = new Date().toISOString(); this.writeJobs(j); }
    return job || null;
  }
  complete(jobId, result) {
    const j = this.jobs();
    const job = j.find(x => x.id === jobId);
    if (job) { job.status = 'done'; job.result = result; job.doneAt = new Date().toISOString(); this.writeJobs(j); }
    return job;
  }
  status() {
    const d = Object.values(this.devices());
    const now = Date.now();
    return d.map(x => ({ ...x, online: (now - new Date(x.lastSeen)) < 60000 }));
  }
}

module.exports = { DeviceBridge };
