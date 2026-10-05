'use strict';
/* GemCore capture-core — browser capture devices.
   Enumerates real connected cameras, assigns them inspection roles
   (overview / macro-telescope / microscope / uv-ir), and captures
   frames tagged with the producing device. */

class CaptureDevice {
  constructor(meta) { this.meta = meta || {}; this.stream = null; }
  async open(constraints = { video: true, audio: false }) {
    if (!navigator?.mediaDevices?.getUserMedia) throw new Error('Camera API unavailable');
    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    return this.stream;
  }
  stop() { this.stream?.getTracks().forEach(t => t.stop()); this.stream = null; }
  capabilities() { const t = this.stream?.getVideoTracks?.()[0]; return t?.getCapabilities?.() || {}; }
  async apply(settings) {
    const t = this.stream?.getVideoTracks?.()[0];
    if (!t) throw new Error('No active camera');
    await t.applyConstraints({ advanced: [settings] });
    return t.getSettings();
  }
}

/* List real connected video devices. Labels require permission first —
   call open() once or this returns deviceIds with generic labels. */
async function enumerateCameras() {
  if (!navigator?.mediaDevices?.enumerateDevices) return [];
  const devs = await navigator.mediaDevices.enumerateDevices();
  return devs.filter(d => d.kind === 'videoinput')
    .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Camera ${i + 1}` }));
}

/* Role registry — persisted client-side, maps physical device → inspection role */
const ROLES = ['overview', 'macro-telescope', 'microscope', 'uv-ir'];
const ROLE_KEY = 'gemcore.deviceRoles';
const getRoles = () => { try { return JSON.parse(localStorage.getItem(ROLE_KEY) || '{}'); } catch { return {}; } };
const setRole = (role, deviceId) => { const r = getRoles(); r[role] = deviceId || null; localStorage.setItem(ROLE_KEY, JSON.stringify(r)); };
const deviceForRole = role => getRoles()[role] || null;

/* Open the device assigned to a role (falls back to any camera). */
async function openForRole(role, extra = {}) {
  const dev = new CaptureDevice({ role });
  const deviceId = deviceForRole(role);
  const video = { width: { ideal: 3840 }, height: { ideal: 2160 }, ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: 'environment' } }) };
  return { dev, stream: await dev.open({ video: { ...video, ...extra }, audio: false }) };
}

window.GemCoreCapture = { CaptureDevice, enumerateCameras, ROLES, getRoles, setRole, deviceForRole, openForRole };
