'use strict';
/* GemCore capture — real camera evidence intake.
   Photos are POSTed to the API which records sha256 + mode/side.
   Originals are immutable; nothing here modifies them. */
(() => {
  let dev = null, stream = null, side = 'front', mode = 'visible';
  const q = s => document.querySelector(s);
  const api = (p, b) => fetch('/api' + p, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-key': localStorage.getItem('gemcore.staff') || '' },
    body: JSON.stringify(b || {}),
  }).then(r => r.json());

  const MODE_ROLE = { visible: 'overview', raking: 'overview', macro: 'macro-telescope', microscope: 'microscope', uv: 'uv-ir', ir: 'uv-ir' };

  async function open(subId) {
    try {
      const { dev: d, stream: s } = await GemCoreCapture.openForRole(MODE_ROLE[mode] || 'overview');
      dev = d; stream = s;
      q('#cam').srcObject = stream;
      const track = stream.getVideoTracks()[0];
      q('#captureStatus').textContent = 'CAMERA ONLINE: ' + (track.label || 'camera');
      renderCaps();
    } catch (e) {
      q('#captureStatus').textContent = 'CAMERA PERMISSION / DEVICE REQUIRED';
      if (q('#captureError')) q('#captureError').textContent = e.message;
    }
  }

  function renderCaps() {
    const c = dev.capabilities();
    const el = q('#caps');
    if (el) el.textContent = Object.keys(c).length
      ? JSON.stringify(c, null, 2)
      : 'Browser/device does not expose manual optical controls.';
  }

  async function snap(subId) {
    if (!stream || !subId) return;
    const v = q('#cam'), c = q('#frame');
    c.width = v.videoWidth || 1280; c.height = v.videoHeight || 720;
    c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
    const data = c.toDataURL('image/jpeg', .92);
    // real evidence: server computes sha256 of this payload
    const rec = await api(`/submissions/${subId}/captures`, {
      data, side, mode,
      deviceMeta: {
        role: MODE_ROLE[mode] || 'overview',
        device: stream.getVideoTracks()[0]?.label || 'unknown',
        resolution: c.width + 'x' + c.height,
      },
    });
    if (rec.id) {
      q('#lastCapture').src = data;
      q('#captureMeta').textContent = `${rec.id} • ${side} • ${mode} • sha256 ${rec.sha256.slice(0, 12)}…`;
      q('#captureStatus').textContent = 'EVIDENCE SEALED';
      document.dispatchEvent(new CustomEvent('gemcore:capture', { detail: rec }));
    } else {
      q('#captureStatus').textContent = 'CAPTURE REJECTED: ' + (rec.error || 'unknown');
    }
  }

  // Reusable capture panel HTML
  window.GemCapturePanel = subId => `
    <div class="panel" style="margin-top:12px"><h3>EVIDENCE CAPTURE — REAL CAMERA</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
        <button id="openCamera">Open Camera</button>
        <button data-side="front">Front</button><button data-side="back">Back</button>
        <button data-mode="visible">Visible</button><button data-mode="raking">Raking</button>
        <button data-mode="macro">Macro</button><button data-mode="microscope">Microscope</button>
        <button data-mode="uv">UV</button><button data-mode="ir">IR</button>
        <button class="primary" id="snap">Capture Evidence</button>
        <label style="display:inline-block"><input type="file" id="uploadEv" accept="image/*" multiple style="display:none"><span class="uploadbtn">⇪ Upload Image(s)</span></label>
      </div>
      <div class="muted" style="font-size:11px">Side: <b id="side">FRONT</b> • Light: <b id="mode">VISIBLE</b> • <span id="captureStatus">OFFLINE</span></div>
      <div class="muted" style="font-size:10px;margin-top:4px">PRO TIP — camera parallel to card (no tilt = clean centering), twin 45° lights (no hotspots on foils), matte black backdrop for edge detection.</div>
      <div style="display:flex;gap:10px;margin-top:10px">
        <video id="cam" autoplay playsinline muted style="width:48%;border-radius:8px;border:1px solid var(--line);background:#000"></video>
        <img id="lastCapture" style="width:48%;border-radius:8px;border:1px solid var(--line);object-fit:contain;background:#000">
      </div>
      <canvas id="frame" style="display:none"></canvas>
      <div class="muted" id="captureMeta" style="font-size:11px;margin-top:6px"></div>
      <pre id="caps" style="display:none"></pre>
      <p id="captureError" style="color:var(--danger);font-size:11px"></p>
      <div style="border-top:1px solid var(--line);margin-top:10px;padding-top:10px">
        <b style="font-size:11px;letter-spacing:1px">LAB RIG — REMOTE CAMERA</b>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:6px">
          <span id="rigStatus" class="muted" style="font-size:11px">checking…</span>
          <select id="rigRole" style="width:auto;margin:0">
            <option value="overview">overview</option><option value="macro">macro</option>
            <option value="microscope">microscope</option><option value="uv-ir">uv-ir</option>
            <option value="raking">raking</option>
          </select>
          <button id="rigSnap" style="font-size:11px">Queue Remote Capture</button>
          <span id="rigOut" class="muted" style="font-size:11px"></span>
        </div>
      </div>
    </div>`;

  // lab rig status + remote snap
  async function rigRefresh() {
    const devs = await fetch('/api/devices', { headers: { 'x-staff-key': localStorage.getItem('gemcore.staff') || '' } }).then(r => r.json()).catch(() => []);
    const rig = Array.isArray(devs) ? devs.find(d => d.id === 'lab-cameras') : null;
    const el = q('#rigStatus');
    if (el) el.innerHTML = rig ? (rig.online ? `<span style="color:var(--green)">● ${rig.id} online (${(rig.state?.cams || rig.caps || []).join(',')})</span>` : `<span style="color:var(--danger)">● ${rig.id} offline</span>`) : 'no rig registered';
  }
  rigRefresh(); setInterval(rigRefresh, 15000);

  document.addEventListener('click', async e => {
    if (e.target.id !== 'rigSnap') return;
    const subId = localStorage.getItem('gemcore.sub');
    const out = q('#rigOut');
    if (!subId) { out.textContent = 'select a submission first'; return; }
    out.textContent = 'queuing…';
    const job = await api(`/submissions/${subId}/capture-job`, { side, role: q('#rigRole').value });
    if (!job.id) { out.textContent = job.error || 'failed'; return; }
    out.textContent = 'snapping on rig…';
    const t = setInterval(async () => {
      const j = await fetch('/api/jobs/' + job.id, { headers: { 'x-staff-key': localStorage.getItem('gemcore.staff') || '' } }).then(r => r.json()).catch(() => null);
      if (!j || j.status !== 'done') return;
      clearInterval(t);
      const res = j.result || {};
      out.textContent = res.captureId ? `sealed ${res.captureId}` : 'failed: ' + (res.error || res.note || '?');
      if (res.captureId) document.dispatchEvent(new CustomEvent('gemcore:capture', { detail: { id: res.captureId } }));
    }, 1500);
    setTimeout(() => { clearInterval(t); if (!out.textContent.startsWith('sealed')) out.textContent = 'timed out waiting for rig'; }, 30000);
  });

  document.addEventListener('click', e => {
    const subId = localStorage.getItem('gemcore.sub');
    if (e.target.id === 'openCamera') open(subId);
    if (e.target.id === 'snap') snap(subId);
    if (e.target.dataset.side) { side = e.target.dataset.side; q('#side').textContent = side.toUpperCase(); }
    if (e.target.dataset.mode) { mode = e.target.dataset.mode; q('#mode').textContent = mode.toUpperCase(); }
  });
  document.addEventListener('change', async e => {
    if (e.target.id !== 'uploadEv') return;
    const subId = localStorage.getItem('gemcore.sub');
    if (!subId) { q('#captureStatus').textContent = 'SELECT A SUBMISSION FIRST'; return; }
    for (const f of e.target.files) {
      const data = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(f); });
      const buf = await crypto.subtle.digest('SHA-256', await f.arrayBuffer());
      const sha = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
      const rec = await fetch('/api/submissions/' + subId + '/captures', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-key': localStorage.getItem('gemcore.staff') || '' },
        body: JSON.stringify({ data, sha256: sha, side, mode, deviceMeta: { source: 'file-upload', name: f.name, bytes: f.size } }),
      }).then(r => r.json());
      q('#captureStatus').textContent = rec.id ? 'UPLOADED — sha ' + sha.slice(0, 10) + '…' : 'REJECTED: ' + (rec.error || '?');
      if (rec.id) q('#lastCapture').src = data;
    }
    e.target.value = '';
  });
  window.addEventListener('beforeunload', () => dev?.stop());
})();
