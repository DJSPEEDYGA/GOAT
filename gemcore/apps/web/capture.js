'use strict';
/* GemCore capture — real camera evidence intake.
   Photos are POSTed to the API which records sha256 + mode/side.
   Originals are immutable; nothing here modifies them. */
(() => {
  let dev = null, stream = null, side = 'front', mode = 'visible';
  const q = s => document.querySelector(s);
  const api = (p, b) => fetch('/api' + p, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(b || {}),
  }).then(r => r.json());

  async function open(subId) {
    try {
      dev = new GemCoreCapture.CaptureDevice({ role: 'inspection' });
      stream = await dev.open({ video: { width: { ideal: 3840 }, height: { ideal: 2160 }, facingMode: { ideal: 'environment' } }, audio: false });
      q('#cam').srcObject = stream;
      q('#captureStatus').textContent = 'CAMERA ONLINE';
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
      data, side, mode, deviceMeta: { ua: navigator.userAgent.slice(0, 60) },
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
      </div>
      <div class="muted" style="font-size:11px">Side: <b id="side">FRONT</b> • Light: <b id="mode">VISIBLE</b> • <span id="captureStatus">OFFLINE</span></div>
      <div style="display:flex;gap:10px;margin-top:10px">
        <video id="cam" autoplay playsinline muted style="width:48%;border-radius:8px;border:1px solid var(--line);background:#000"></video>
        <img id="lastCapture" style="width:48%;border-radius:8px;border:1px solid var(--line);object-fit:contain;background:#000">
      </div>
      <canvas id="frame" style="display:none"></canvas>
      <div class="muted" id="captureMeta" style="font-size:11px;margin-top:6px"></div>
      <pre id="caps" style="display:none"></pre>
      <p id="captureError" style="color:var(--danger);font-size:11px"></p>
    </div>`;

  document.addEventListener('click', e => {
    const subId = localStorage.getItem('gemcore.sub');
    if (e.target.id === 'openCamera') open(subId);
    if (e.target.id === 'snap') snap(subId);
    if (e.target.dataset.side) { side = e.target.dataset.side; q('#side').textContent = side.toUpperCase(); }
    if (e.target.dataset.mode) { mode = e.target.dataset.mode; q('#mode').textContent = mode.toUpperCase(); }
  });
  window.addEventListener('beforeunload', () => dev?.stop());
})();
