'use strict';
/* GemCore Grading — UI router. Talks to the standalone API; honest states:
   analysis shows "adapter required" until VisionCore models are attached,
   seal stays disabled until QC + evidence gates pass, demo never certifies. */

const V = document.querySelector('#view');
let rot = 0, tilt = 0, drag = false, lastX = 0, lastY = 0;
let currentSub = localStorage.getItem('gemcore.sub') || null;
let evLayerOn = true;

const api = async (p, opts) => {
  const r = await fetch('/api' + p, {
    method: opts?.m || (opts?.b ? 'POST' : 'GET'),
    headers: {
      'Content-Type': 'application/json',
      'x-staff-key': localStorage.getItem('gemcore.staff') || '',
      ...(opts?.h || {}),
    },
    body: opts?.b ? JSON.stringify(opts.b) : undefined,
  });
  return r.json();
};

const isStaff = () => !!localStorage.getItem('gemcore.staff') || localStorage.getItem('gemcore.staffless') === '1';
const whoAmI = () => localStorage.getItem('gemcore.me') || 'staff';
const INTERNAL = ['grade','intake','submissions','passport','population','production','vault','market','live','studio','photolab','tools','settings','qc','requests','command'];

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const nav = () => {
  document.querySelectorAll('[data-page]').forEach(b => b.onclick = () => show(b.dataset.page));
  const g = document.querySelector('#btnGuide'), f = document.querySelector('#btnFull');
  if (g) g.onclick = () => show('process');
  if (f) f.onclick = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
};

const page = (t, s, b) => `<div class="page"><div class="eyebrow">GEMCORE • PRE-ACTIVE</div><h1>${t}</h1><p class="muted">${s}</p>${b}</div>`;
const tiles = a => `<div class="grid">${a.map(x => `<div class="tile"><h3>${x}</h3><p class="muted">GemCore module</p></div>`).join('')}</div>`;

const CHECKS = ['Surface Scan', 'Edge Analysis', 'Corner Check', 'Centering', 'Print Quality', 'UV / IR Analysis', 'Authenticity Check'];

async function subs() { return api('/submissions').catch(() => []); }

function subPicker(list) {
  return `<select id="subpick" style="max-width:280px">
    <option value="">— select submission —</option>
    ${list.map(s => `<option value="${s.id}" ${s.id === currentSub ? 'selected' : ''}>${s.id} • ${esc(s.item?.name || 'untitled')} • ${s.status}</option>`).join('')}
  </select>`;
}

/* ── Grading Lab (mockup centerpiece) ─────────────────────────────────── */
async function lab() {
  const list = await subs();
  const s = list.find(x => x.id === currentSub);
  const ev = s?.evaluation;
  const laneName = { centering: 'Centering', corners: 'Corners', edges: 'Edges', surface: 'Surface', dimensions: 'Dimensions', authenticity: 'Authenticity' };
  const lanes = ev ? Object.keys(laneName).map(l =>
    `<div class="metric"><span>${laneName[l]}</span><b>${ev.lanes[l] === null ? '—' : (ev.lanes[l] / 100).toFixed(1)}</b></div>`).join('')
    : ['Centering', 'Corners', 'Edges', 'Surface', 'Print Quality'].map(x => `<div class="metric"><span>${x}</span><b>—</b></div>`).join('');

  const capCount = s ? (s.captures || []).length : 0;
  const obs = s ? (s.observations || []) : [];
  const markers = (s?.annotations || []).slice(0, 8).map(a =>
    `<i data-obs="${a.id}" title="${esc(a.note || a.type)}" style="left:${(a.x ?? .4) * 100}%;top:${(a.y ?? .4) * 100}%"></i>`).join('')
    || '<i style="left:35%;top:31%"></i><i style="right:34%;top:46%"></i><i style="left:42%;bottom:29%"></i>';

  V.innerHTML = `
  <div class="page">
    <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
      <div><div class="eyebrow">GEMCORE • PRE-ACTIVE</div><h1>Grading Lab</h1></div>
      <div style="margin-left:auto">${subPicker(list)}</div>
    </div>
    <div class="labgrid">
      <div class="panel scanpanel">
        <h3>AI SCAN ${s ? 'IN PROGRESS' : 'IDLE'}</h3>
        ${CHECKS.map((c, i) => `<div class="scanrow"><span class="tick" id="tick${i}">${ev ? '✓' : '◌'}</span><span>${c}<small id="ck${i}">${ev ? 'Complete' : 'Pending'}</small></span></div>`).join('')}
        <div class="analysisdone">${ev ? 'ANALYSIS COMPLETE' : 'AWAITING SCAN'}</div>
        <div class="progress"><i id="progress" style="width:${ev ? '100' : '0'}%"></i></div>
        <p class="quote">“EVERY DETAIL MATTERS”</p>
      </div>

      <div class="chamber" id="chamber">
        <div class="scanner" id="scanner"></div>
        <div class="halo h1"></div><div class="halo h2"></div>
        <div class="evidenceLayer" id="evidenceLayer">${markers}</div>
        <div class="slab" id="slab">
          <div class="label"><span>GEMCORE ${s?.demo ? '<small>DEMO</small>' : ''}<br><small>${esc(s?.item?.name || 'INSPECTION')}</small></span><b id="g">${ev?.publicGrade ?? '—'}</b></div>
          <div class="barcode">▌▎▌▌▎▌▎▎▌ &nbsp; ${s ? s.id : 'GC--------'}</div>
          <div class="cardface"><img src="assets/mock-card.png" alt="collectible"><small>${esc(s?.item?.name || 'DEMO COLLECTIBLE')} • DIGITAL INSPECTION TWIN</small></div>
        </div>
        <div class="baseglow"></div><div class="basemark">◆ GEMCORE GRADING</div>
        <div class="controls">
          <button id="rotl">↶ Rotate</button>
          <button id="rotr">View 3D ↷</button>
          <button id="layers">Evidence Layers: ${evLayerOn ? 'ON' : 'OFF'}</button>
          <button class="primary" id="scan">Run Deep Scan</button>
        </div>
      </div>

      <div class="rightstack">
        <div class="panel assistant">
          <div class="ahead"><img src="assets/moneypenny.svg" alt="Money Penny" style="border-radius:10px;width:44px;height:44px"><div><b>MONEY PENNY</b><br><span class="online" id="mpStatus">● checking…</span></div></div>
          <div class="bubble" id="jarvisMsg">Money Penny runs this lab. ${s ? 'Loaded ' + s.id + ' — ask me anything about it.' : 'Select a submission and I\'ll brief you.'}</div>
          <div class="btnrow"><button class="primary" id="scan2">Run Deep Scan</button><button id="report">Generate Report</button></div>
          <div style="display:flex;gap:6px;margin-top:8px">
            <input id="mpInput" placeholder="Ask Money Penny…" style="margin:0;font-size:12px">
            <button class="primary" id="mpSend" style="padding:6px 14px">▸</button>
          </div>
        </div>
        <div class="panel"><h3>INSPECTION VIEWS</h3>
          <div class="tabs"><button class="active" data-view="microscope">Microscope</button><button data-view="telescope">Telescope</button><button data-view="3d">3D Model</button></div>
          <div class="micro"><canvas id="viewer" style="width:100%;height:100%"></canvas><span id="viewLabel">SURFACE DETAIL <b id="zoomLabel">40×</b></span><span class="tag4k">4K</span></div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:6px">
            <span class="muted" style="font-size:10px">ZOOM</span>
            <input type="range" id="zoom" min="1" max="20" step="0.5" value="4" style="flex:1;margin:0">
          </div>
          <div class="thumbs">
            <i data-thumb="mock-t1"><img src="assets/mock-t1.png"><em>Corner</em></i>
            <i data-thumb="mock-t2"><img src="assets/mock-t2.png"><em>Edge</em></i>
            <i data-thumb="mock-t3"><img src="assets/mock-t3.png"><em>Holo</em></i>
            <i data-thumb="mock-t4"><img src="assets/mock-t4.png"><em>Relief</em></i>
            <i data-thumb="mock-t5"><img src="assets/mock-t5.png"><em>UV</em></i>
            <i data-thumb="mock-t6"><img src="assets/mock-t6.png"><em>Texture</em></i>
          </div>
        </div>
        <div class="panel"><h3>GRADE BREAKDOWN</h3>
          ${lanes}
          <div class="final">FINAL GRADE<div class="score" id="score">${ev?.publicGrade ?? '—'}</div>
          <small id="state">${s?.status === 'certified' ? 'CERTIFIED' : ev ? ev.status.toUpperCase() : 'HUMAN QC REQUIRED'}</small>
          <div class="conf">${ev ? 'Internal index: ' + ev.internalConditionIndex + ' / 1000 • Rubric ' + ev.algorithmVersion : 'Confidence requires evidence + QC'}</div></div>
        </div>
      </div>
    </div>

    <div class="actionbar">
      <button id="retake">Retake Scan</button>
      <button id="v3d">View 3D Model</button>
      <button class="seal" id="seal" ${ev?.status === 'sealable' ? '' : 'disabled'}>✓ Seal Grade</button>
      <button id="report2">Generate Report</button>
      <button id="addvault">Add to Vault</button><button id="share">Share Results</button>
      <button id="toprod" ${s?.status === 'certified' ? '' : 'disabled title="certify first"'}>▧ Send to Production</button>
    </div>
    <pre id="labOut" style="display:none"></pre>

    <div class="intel">
      <div class="panel"><h3>MARKET INTELLIGENCE</h3><strong id="mktPrice">$412.50 <small style="color:var(--green);font-size:11px">▲ +12.4%</small></strong>
        <svg class="spark" viewBox="0 0 200 44" style="width:100%;height:40px"><polyline id="spark" points="0,34 20,30 40,33 60,24 80,28 100,18 120,22 140,12 160,16 180,8 200,10" fill="none" stroke="#25f3e6" stroke-width="2"/><polyline points="0,40 200,40" stroke="#12344a"/></svg>
        <div class="tabs" style="margin-top:6px">${['7D','30D','90D','1Y','ALL'].map((t,i)=>`<button data-tf="${i}" class="${i===0?'active':''}">${t}</button>`).join('')}</div>
        <p class="muted" style="font-size:10px">DEMO comparable data — never affects grade.</p>
        <button class="primary" id="comparables" style="margin-top:8px;font-size:11px;width:100%">View Market Comparables</button></div>
      <div class="panel"><h3>POPULATION REPORT</h3><div class="donut" id="pop">POP</div><p class="muted" style="font-size:10px" id="popLine">Loading…</p></div>
      <div class="panel"><h3>ESTIMATED VALUE</h3><strong>$410 – $460</strong><p class="muted" style="font-size:12px">Market trend <b style="color:var(--green)">Bullish ↗</b><br><span style="font-size:10px">DEMO — never affects grade.</span></p></div>
      <div class="panel"><h3>EVIDENCE PASSPORT</h3><p style="font-size:12px;line-height:1.7">
        ${capCount ? '✓' : '○'} Full scan images (${capCount})<br>
        ${obs.length ? '✓' : '○'} AI analysis report (${obs.length} obs)<br>
        ${s?.qc?.approved ? '✓' : '○'} Grading certificate<br>
        ○ Blockchain registered<br>○ Ownership history</p>
        <button class="primary" id="viewPassport" style="margin-top:8px;font-size:11px">View Full Passport</button></div>
    </div>
  </div>`;
  bindLab(s, ev);
}

function bindLab(s, ev) {
  const q = sel => document.querySelector(sel);
  const slab = q('#slab'), chamber = q('#chamber');
  const draw = () => slab.style.transform = `perspective(900px) rotateY(${rot}deg) rotateX(${tilt}deg)`;
  chamber.onpointerdown = e => { drag = true; lastX = e.clientX; lastY = e.clientY; chamber.setPointerCapture?.(e.pointerId); };
  chamber.onpointermove = e => { if (!drag) return; rot += (e.clientX - lastX) * .35; tilt = Math.max(-18, Math.min(18, tilt - (e.clientY - lastY) * .2)); lastX = e.clientX; lastY = e.clientY; draw(); };
  chamber.onpointerup = chamber.onpointercancel = () => drag = false;
  q('#rotl').onclick = () => { rot -= 18; draw(); };
  q('#rotr').onclick = q('#v3d').onclick = () => { rot += 18; draw(); };
  q('#layers').onclick = e => { evLayerOn = !evLayerOn; q('#evidenceLayer').style.opacity = evLayerOn ? 1 : 0; e.target.textContent = 'Evidence Layers: ' + (evLayerOn ? 'ON' : 'OFF'); };
  q('#subpick').onchange = e => { currentSub = e.target.value || null; localStorage.setItem('gemcore.sub', currentSub || ''); show('grade'); };
  q('#viewPassport').onclick = () => show('passport');
  api('/population').then(p => {
    q('#pop').textContent = p.certified;
    q('#popLine').textContent = `${p.certified} certified • ${p.inPipeline} in pipeline`;
  }).catch(() => {});

  // Money Penny — real LLM chat
  api('/mp/status').then(st => {
    q('#mpStatus').textContent = st.online ? '● Online' : '● Offline';
    q('#mpStatus').style.color = st.online ? 'var(--green)' : 'var(--danger)';
  }).catch(() => { q('#mpStatus').textContent = '● Offline'; q('#mpStatus').style.color = 'var(--danger)'; });
  const askMp = async () => {
    const msg = q('#mpInput').value.trim(); if (!msg) return;
    q('#mpInput').value = ''; q('#jarvisMsg').textContent = 'Money Penny is thinking…';
    const res = await api('/mp/chat', { b: { message: msg, submissionId: s?.id }, h: { 'x-mp-key': localStorage.getItem('gemcore.mpkey') || '' } });
    if (res.locked) {
      const key = prompt(res.reply + '\nEnter key:');
      if (key) { localStorage.setItem('gemcore.mpkey', key); q('#mpInput').value = msg; return askMp(); }
      q('#jarvisMsg').textContent = res.reply; return;
    }
    let reply = res.reply || '';
    // she can drive the lab — parse [[ACTION:...]] tokens
    const actions = [...reply.matchAll(/\[\[ACTION:(\w+)(?::(\w+))?\]\]/g)];
    reply = reply.replace(/\[\[ACTION:[^\]]*\]\]/g, '').trim();
    q('#jarvisMsg').textContent = reply || 'Done.';
    for (const [, act, arg] of actions) {
      if (act === 'scan') runScan();
      else if (act === 'report') q('#report').click();
      else if (act === 'seal') q('#seal').click();
      else if (act === 'page' && arg) show(arg);
    }
  };
  q('#mpSend').onclick = askMp;
  q('#mpInput').onkeydown = e => { if (e.key === 'Enter') askMp(); };

  const out = t => { const p = q('#labOut'); p.style.display = 'block'; p.textContent = t; };

  const runScan = async () => {
    if (!s) { q('#jarvisMsg').textContent = 'Pick or create a submission first.'; return; }
    q('#scanner').classList.add('active');
    CHECKS.forEach((c, i) => setTimeout(() => { const t = q('#tick' + i); if (t) t.textContent = '✓'; const k = q('#ck' + i); if (k) k.textContent = 'Scanning…'; }, i * 160));

    // REAL analysis: run local CV over the newest stored capture.
    const cap = (s.captures || []).filter(c => c.storedData).pop();
    if (!cap) {
      q('#scanner').classList.remove('active');
      q('#jarvisMsg').textContent = 'No evidence yet — capture the item first (camera on intake page). No results invented.';
      return;
    }
    const res = await window.VisionLocal.analyze(cap.storedData);
    if (!res.ok) {
      q('#scanner').classList.remove('active');
      q('#jarvisMsg').textContent = 'Analysis: ' + res.reason;
      return;
    }
    // post real per-lane measurements + defect observations tied to the capture
    for (const [lane, score] of Object.entries(res.lanes)) {
      await api(`/submissions/${s.id}/measurements`, { b: { lane, score, captureId: cap.id, detail: { source: 'visioncore-local-cv' } } });
    }
    for (const d of res.defects.slice(0, 12)) {
      await api(`/submissions/${s.id}/observations`, { b: { evidenceId: cap.id, lane: 'surface', note: 'surface anomaly', severity: +d.severity.toFixed(2), confidence: res.confidence / 100, source: 'visioncore-local-cv', x: d.x, y: d.y } });
    }
    const grade = await api(`/submissions/${s.id}/grade`);
    q('#scanner').classList.remove('active');
    CHECKS.forEach((c, i) => { const k = q('#ck' + i); if (k) k.textContent = 'Analyzed'; });
    q('#progress').style.width = '100%';
    q('#jarvisMsg').textContent = `Real CV analysis complete — confidence ${res.confidence}%. ${res.defects.length} anomaly cell(s) found on ${cap.id.slice(0, 8)}… Reviewer confirmation required.`;
    if (grade.publicGrade !== null) { q('#score').textContent = grade.publicGrade; q('#g').textContent = grade.publicGrade; }
    q('#state').textContent = (grade.status || 'qc-required').toUpperCase();
    if (grade.status === 'sealable') q('#seal').disabled = false;
    out(JSON.stringify({ vision: res, evaluation: grade }, null, 2));
  };
  q('#scan').onclick = runScan;
  q('#scan2').onclick = runScan;
  q('#retake').onclick = () => { q('#progress').style.width = '0'; q('#state').textContent = 'HUMAN QC REQUIRED'; q('#jarvisMsg').textContent = 'Reset — re-capture or rescan when ready.'; runScan(); };
  q('#report').onclick = q('#report2').onclick = async () => {
    if (!s) { q('#jarvisMsg').textContent = 'No submission selected.'; return; }
    out(JSON.stringify(await api(`/submissions/${s.id}/passport`), null, 2));
  };
  q('#addvault').onclick = async () => {
    if (!s) { q('#jarvisMsg').textContent = 'Select a submission first.'; return; }
    const res = await api(`/submissions/${s.id}/vault`, { b: { vaulted: !s.vaulted } });
    q('#jarvisMsg').textContent = res.vaulted ? s.id + ' added to your Vault.' : s.id + ' removed from Vault.';
  };
  q('#share').onclick = () => {
    if (!s) { q('#jarvisMsg').textContent = 'Select a submission first.'; return; }
    const link = location.origin + '/#verify-' + s.id;
    (navigator.clipboard?.writeText(link) || Promise.reject()).then(
      () => q('#jarvisMsg').textContent = 'Verify link copied: ' + link,
      () => q('#jarvisMsg').textContent = 'Verify link: ' + link);
  };

  // ── real microscope/telescope viewer: pixel zoom on actual captures ──
  const viewer = q('#viewer');
  const vctx = viewer.getContext('2d');
  let srcImg = new Image(), zoom = 4, panX = .5, panY = .5, vmode = 'microscope';
  srcImg.src = (s?.captures || []).find(c => c.storedData)?.storedData || 'assets/mock-card.png';
  const fitViewer = () => { const r = viewer.parentElement.getBoundingClientRect(); viewer.width = r.width; viewer.height = r.height; };

  function drawView() {
    fitViewer();
    const iw = srcImg.width || 300, ih = srcImg.height || 200;
    if (vmode === 'telescope') {
      // full frame + defect markers at real coords
      const sc = Math.min(viewer.width / iw, viewer.height / ih);
      const dw = iw * sc, dh = ih * sc, ox = (viewer.width - dw) / 2, oy = (viewer.height - dh) / 2;
      vctx.fillStyle = '#050508'; vctx.fillRect(0, 0, viewer.width, viewer.height);
      vctx.drawImage(srcImg, ox, oy, dw, dh);
      (s?.annotations || []).forEach(a => {
        vctx.beginPath(); vctx.arc(ox + a.x * dw, oy + a.y * dh, 8, 0, 7);
        vctx.strokeStyle = '#25f3e6'; vctx.lineWidth = 1.5; vctx.stroke();
      });
      return;
    }
    // microscope: crop-zoom around pan point
    const zw = iw / zoom, zh = ih / zoom;
    const sx = Math.max(0, Math.min(iw - zw, panX * iw - zw / 2));
    const sy = Math.max(0, Math.min(ih - zh, panY * ih - zh / 2));
    vctx.imageSmoothingEnabled = zoom < 8;
    vctx.drawImage(srcImg, sx, sy, zw, zh, 0, 0, viewer.width, viewer.height);
  }
  srcImg.onload = drawView;

  let vp = false;
  viewer.onpointerdown = e => { vp = true; viewer.setPointerCapture(e.pointerId); };
  viewer.onpointermove = e => { if (!vp) return; const r = viewer.getBoundingClientRect(); panX = Math.max(0, Math.min(1, panX - e.movementX / r.width / zoom * 2)); panY = Math.max(0, Math.min(1, panY - e.movementY / r.height / zoom * 2)); drawView(); };
  viewer.onpointerup = () => vp = false;
  q('#zoom').oninput = e => { zoom = +e.target.value; q('#zoomLabel').textContent = Math.round(zoom * 10) + '×'; drawView(); };

  document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => {
    document.querySelectorAll('[data-view]').forEach(x => x.classList.toggle('active', x === b));
    vmode = b.dataset.view;
    q('#viewLabel').innerHTML = { microscope: 'SURFACE DETAIL <b id="zoomLabel">' + Math.round(zoom * 10) + '×</b>', telescope: 'MACRO / TELESCOPE <b>overview + markers</b>', '3d': '3D MODEL <b>rotatable</b>' }[vmode];
    if (vmode === '3d') { srcImg.src = 'assets/mock-card.png'; srcImg.onload = drawView; }
    drawView();
  });
  document.querySelectorAll('[data-thumb]').forEach(t => t.onclick = () => {
    srcImg = new Image(); srcImg.onload = () => { vmode = 'microscope'; drawView(); };
    srcImg.src = 'assets/' + t.dataset.thumb + '.png';
    q('#viewLabel').innerHTML = t.querySelector('em').textContent.toUpperCase() + ' <b>view</b>';
  });

  // market timeframe tabs switch demo sparkline
  const sparks = [
    '0,34 20,30 40,33 60,24 80,28 100,18 120,22 140,12 160,16 180,8 200,10',
    '0,38 25,34 50,30 75,32 100,25 125,20 150,16 175,12 200,9',
    '0,40 30,36 60,30 90,26 120,28 150,18 180,14 200,6',
    '0,40 40,35 80,32 120,20 160,14 200,4',
    '0,42 50,38 100,30 150,18 200,2'];
  const prices = ['$412.50', '$398.20', '$371.00', '$344.60', '$289.00'];
  document.querySelectorAll('[data-tf]').forEach(b => b.onclick = () => {
    document.querySelectorAll('[data-tf]').forEach(x => x.classList.toggle('active', x === b));
    q('#spark').setAttribute('points', sparks[+b.dataset.tf]);
    q('#mktPrice').innerHTML = prices[+b.dataset.tf] + ' <small style="color:var(--green);font-size:11px">▲ demo</small>';
  });
  q('#comparables').onclick = () => show('market');
  q('#toprod').onclick = async () => {
    const res = await api(`/submissions/${s.id}/production`);
    q('#jarvisMsg').textContent = res.stage ? s.id + ' entered production — stage: ' + res.stage : (res.error || 'Cannot enter production');
    out(JSON.stringify(res, null, 2));
  };
  q('#seal').onclick = async () => {
    if (!s) return;
    const res = await api(`/submissions/${s.id}/seal`);
    if (res.ok) { q('#jarvisMsg').textContent = 'Certified. Cert ' + res.certId + ' sealed at grade ' + res.publicGrade + '.'; q('#state').textContent = 'CERTIFIED'; }
    else q('#jarvisMsg').textContent = 'Seal refused: ' + res.reason;
    out(JSON.stringify(res, null, 2));
  };

  // defect markers → evidence chain
  document.querySelectorAll('#evidenceLayer i[data-obs]').forEach(m => m.onclick = () => {
    const a = (s.annotations || []).find(x => x.id === m.dataset.obs);
    if (a) out('ANNOTATION ' + a.id + '\nEvidence: ' + a.evidenceId + '\n' + (a.note || a.type) + '\n(coords ' + a.x + ',' + a.y + ')');
  });
}

/* ── Other pages ──────────────────────────────────────────────────────── */
async function intake() {
  V.innerHTML = page('Submit a Collectible', 'Create and track a new grading intake',
    `<div class="tile form" style="max-width:460px">
      <label>Collectible name<input id="item" placeholder="e.g. Charizard 1st Edition"></label>
      <label>Set / series<input id="set" placeholder="e.g. Pokémon Base Set"></label>
      <label>Year<input id="year" placeholder="1999"></label>
      <label><input type="checkbox" id="demo" style="width:auto"> Mark as demo (can never certify)</label>
      <button class="primary" id="create" style="margin-top:14px">Create Submission</button>
      <pre id="out"></pre></div>
    <div id="capHost"></div>`);
  document.querySelector('#create').onclick = async () => {
    const s = await api('/submissions', { b: { item: { name: itemName(), set: q('#set').value, year: q('#year').value }, demo: q('#demo').checked } });
    currentSub = s.id; localStorage.setItem('gemcore.sub', s.id);
    q('#out').textContent = 'Created ' + s.id;
    q('#capHost').innerHTML = window.GemCapturePanel(s.id);
  };
  if (currentSub) document.querySelector('#capHost').innerHTML = window.GemCapturePanel(currentSub);
  const q = sel => document.querySelector(sel);
  const itemName = () => q('#item').value;
}

async function submissions() {
  const list = await subs();
  V.innerHTML = page('My Submissions', 'Track & manage grading pipeline',
    `<div class="grid">${list.length ? list.map(s =>
      `<div class="tile" style="cursor:pointer" data-open="${s.id}">
        <b>${s.id}</b> ${s.demo ? '<span class="badge warn">DEMO</span>' : ''}
        <p>${esc(s.item?.name || 'untitled')}</p>
        <p class="muted">${s.status} • ${(s.captures || []).length} captures • ${(s.observations || []).length} observations • QC ${s.qc?.approved ? '✓' : '✗'}</p>
      </div>`).join('') : '<div class="tile">No submissions yet — submit one first.</div>'}</div>
    <div id="detail"></div>`);
  document.querySelectorAll('[data-open]').forEach(t => t.onclick = () => detail(t.dataset.open));
}

async function detail(id) {
  const s = await api('/submissions/' + id);
  const e = s.evaluation;
  document.querySelector('#detail').innerHTML = `
    <div class="detailgrid">
      <div class="panel"><h3>${s.id} — EVIDENCE CHAIN</h3>
        <p class="muted" style="font-size:12px">${esc(s.item?.name)} • status ${s.status}</p>
        <table><tr><th>Capture</th><th>Side</th><th>Mode</th><th>SHA-256</th></tr>
        ${(s.captures || []).map(c => `<tr><td>${c.id.slice(0, 12)}…</td><td>${c.side}</td><td>${c.mode}</td><td title="${c.sha256}">${c.sha256.slice(0, 10)}…</td></tr>`).join('') || '<tr><td colspan=4 class="muted">none</td></tr>'}</table>
        <h3 style="margin-top:14px">OBSERVATIONS — click for evidence chain</h3>
        ${(s.observations || []).map(o => `<div class="obsrow" data-obs="${o.id}">${esc(o.note || o.type || 'observation')}
          <span class="pill ${o.reviewerDisposition}">${o.reviewerDisposition}</span>
          <span class="chain">→ evidence ${o.evidenceId?.slice(0, 12)}… • src ${o.source} • conf ${o.confidence ?? '—'} • ${o.reviewer || 'awaiting reviewer'}</span>
          ${o.reviewerDisposition === 'pending' ? `<span class="obsbtns"><button class="primary" data-okobs="${o.id}" style="padding:2px 8px;font-size:10px">✓</button><button data-noobs="${o.id}" style="padding:2px 8px;font-size:10px">✗</button></span>` : ''}</div>`).join('') || '<p class="muted" style="font-size:12px">none</p>'}
      </div>
      <div class="panel"><h3>GRADING</h3>
        ${e ? `<div class="metric"><span>Internal index</span><b>${e.internalConditionIndex ?? '—'}/1000</b></div>
        <div class="metric"><span>Public grade</span><b>${e.publicGrade ?? '—'}</b></div>
        <div class="metric"><span>Status</span><b>${e.status}</b></div>
        ${e.blockers.map(b => `<p class="muted" style="font-size:11px">⛔ ${esc(b)}</p>`).join('')}` : '<p class="muted">Not evaluated yet.</p>'}
        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
          <button class="primary" id="eval">Evaluate</button>
          <button id="qcok">QC Approve</button><button id="qcno">QC Reject</button>
          <button class="seal" id="seal2">Seal</button>
          <button id="auditBtn">Audit Trail</button>
        </div>
        <label style="margin-top:12px">HANDLER<select id="assignPick"><option value="">— unassigned —</option></select></label>
        <pre id="dout"></pre>
      </div>
    </div>`;
  const q = sel => document.querySelector(sel);
  const dout = x => q('#dout').textContent = typeof x === 'string' ? x : JSON.stringify(x, null, 2);
  api('/team').then(team => {
    if (!Array.isArray(team)) return;
    q('#assignPick').innerHTML = '<option value="">— unassigned —</option>' +
      team.map(m => `<option value="${m.id}" ${s.assignedTo === m.id ? 'selected' : ''}>${esc(m.name)} — ${esc(m.role)}</option>`).join('');
    q('#assignPick').onchange = async e => {
      await api(`/submissions/${id}/assign`, { b: { memberId: e.target.value || null } });
      dout('Handler assigned → ' + (e.target.selectedOptions[0].text));
    };
  });
  q('#eval').onclick = async () => dout(await api(`/submissions/${id}/grade`));
  q('#qcok').onclick = async () => dout(await api(`/submissions/${id}/qc`, { b: { approved: true, reviewer: whoAmI() } }));
  q('#qcno').onclick = async () => dout(await api(`/submissions/${id}/qc`, { b: { approved: false, reviewer: whoAmI() } }));
  q('#seal2').onclick = async () => dout(await api(`/submissions/${id}/seal`));
  q('#auditBtn').onclick = async () => dout(await api(`/submissions/${id}/audit`));
  document.querySelectorAll('.obsrow').forEach(o => o.onclick = () => {
    const obs = s.observations.find(x => x.id === o.dataset.obs);
    const cap = (s.captures || []).find(c => c.id === obs.evidenceId);
    dout({ observation: obs, evidence: cap || 'missing', chain: 'grade → defect → capture → confidence → reviewer decision' });
  });
  document.querySelectorAll('[data-okobs]').forEach(b => b.onclick = async e => {
    e.stopPropagation();
    dout(await api(`/submissions/${id}/observations/${b.dataset.okobs}/review`, { b: { decision: 'confirmed', reviewer: whoAmI() } }));
    detail(id);
  });
  document.querySelectorAll('[data-noobs]').forEach(b => b.onclick = async e => {
    e.stopPropagation();
    dout(await api(`/submissions/${id}/observations/${b.dataset.noobs}/review`, { b: { decision: 'rejected', reviewer: whoAmI() } }));
    detail(id);
  });
}

async function passport() {
  const list = await subs();
  V.innerHTML = page('Evidence Passport', 'Proof in every detail — full transparency',
    `<div class="grid">${list.length ? list.map(s =>
      `<div class="tile" style="cursor:pointer" data-open="${s.id}"><b>${s.id}</b> ${s.demo ? '<span class="badge warn">DEMO</span>' : ''}
      <p>${esc(s.item?.name || 'untitled')}</p>
      <p class="muted">${s.status} • QC ${s.qc?.approved ? 'Approved' : 'Required'}</p></div>`).join('')
      : '<div class="tile">No submissions yet.</div>'}</div><div id="detail"></div>`);
  document.querySelectorAll('[data-open]').forEach(t => t.onclick = async () => {
    const p = await api(`/submissions/${t.dataset.open}/passport`);
    const link = location.origin + '/#verify-' + t.dataset.open;
    document.querySelector('#detail').innerHTML = `
      <div class="panel" style="margin-top:14px"><h3>${esc(p.submissionId || t.dataset.open)} — PASSPORT</h3>
        <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start">
          <img src="/api/qr?text=${encodeURIComponent(link)}" width="96" height="96" style="border-radius:8px;background:#fff;padding:4px">
          <div style="flex:1;min-width:220px">
            <p style="font-size:13px">${esc(p.item?.name || '')} — ${p.status}</p>
            <p class="muted" style="font-size:11px">${(p.captures || []).length} evidence items • ${(p.observations || []).length} observations • QC ${p.qc?.approved ? 'approved' : 'pending'}</p>
            <button class="primary" id="pCopy" style="margin-top:8px;font-size:11px">Copy verify link</button>
          </div>
        </div>
        <pre style="margin-top:10px;max-height:280px;overflow:auto">${esc(JSON.stringify(p, null, 2))}</pre>
      </div>`;
    document.querySelector('#pCopy').onclick = () =>
      navigator.clipboard?.writeText(link).then(() => document.querySelector('#pCopy').textContent = 'Copied ✓');
  });
}

/* ── Public cert report — DIG-killer: defect map, lanes, rank, chron ──── */
async function verify() {
  V.innerHTML = page('Certificate Report', 'Full transparency — defect map, sub-scores, rank & chronology. Free. Always.',
    `<div class="tile form" style="max-width:460px">
      <label>Certificate ID<input id="cert" placeholder="GC-…"></label>
      <button class="primary" id="go" style="margin-top:14px">Open Report</button></div>
    <div id="vout"></div>`);
  const q = sel => document.querySelector(sel);
  q('#go').onclick = async () => {
    const id = q('#cert').value.trim();
    const r = await api('/verify/' + encodeURIComponent(id));
    if (!r.verified) { q('#vout').innerHTML = `<div class="panel" style="margin-top:14px"><p style="color:var(--danger)">✗ ${esc(r.reason || 'not certified')}</p></div>`; return; }
    const laneName = { centering: 'Centering', corners: 'Corners', edges: 'Edges', surface: 'Surface', dimensions: 'Dimensions', authenticity: 'Authenticity' };
    q('#vout').innerHTML = `
      <div class="panel" style="margin-top:14px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
          <div><h3 style="margin:0">${esc(r.item?.name || 'Collectible')}</h3>
            <p class="muted" style="font-size:11px">${esc(r.item?.set || '')} ${r.item?.year ? '• ' + r.item.year : ''} • cert ${esc(r.certId)} • sealed ${new Date(r.sealedAt).toLocaleDateString()}</p></div>
          <div style="text-align:right"><div style="font-size:42px;font-weight:800;color:var(--teal);line-height:1">${r.publicGrade}</div>
            <small class="muted">index ${r.internalIndex ?? '—'}/1000</small></div>
        </div>
        ${r.demo ? '<p class="badge warn" style="margin-top:8px">DEMO — not a certified grade</p>' : ''}
        <div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:10px">
          ${r.chronology ? `<span class="badge">CHRON #${r.chronology}</span>` : ''}
          ${r.rankOfSameItem ? `<span class="badge">RANK #${r.rankOfSameItem} of ${r.sameItemPopulation} same-item</span>` : ''}
          <span class="badge">${r.evidenceCount} sealed evidence</span>
          <span class="badge">rubric ${esc(r.algorithmVersion)}</span>
        </div>
      </div>
      <div class="detailgrid" style="margin-top:14px">
        <div class="panel"><h3>DEFECT MAP</h3>
          <div style="position:relative;max-width:340px;margin:0 auto">
            <img src="/api/verify/${encodeURIComponent(r.certId)}/image" style="width:100%;border-radius:8px;border:1px solid var(--line)" onerror="this.parentElement.innerHTML='<p class=muted>no public image</p>'">
            <div id="dmap" style="position:absolute;inset:0"></div>
          </div>
          <p class="muted" style="font-size:10px;margin-top:6px">${r.defects.length} defect pin(s) — real coordinates from the grading record</p></div>
        <div class="panel"><h3>SUB-SCORES</h3>
          ${Object.keys(laneName).map(l => r.lanes && r.lanes[l] != null ? `
            <div class="metric"><span>${laneName[l]}</span>
            <span style="display:flex;align-items:center;gap:8px"><span style="display:inline-block;width:80px;height:6px;background:var(--line);border-radius:3px"><i style="display:block;height:100%;width:${r.lanes[l] / 10}%;background:var(--teal);border-radius:3px"></i></span><b>${(r.lanes[l] / 100).toFixed(1)}</b></span></div>` : '').join('')}
          <div class="scanrow" style="margin-top:10px"><span class="tick">✓</span><span>Human QC approved • authenticity &amp; condition graded separately</span></div>
        </div>
      </div>
      <div class="panel" style="margin-top:14px">
        <div class="ahead"><img src="assets/moneypenny.svg" style="width:36px;height:36px;border-radius:8px"><div><b>ASK MONEY PENNY</b><br><span class="muted" style="font-size:10px">she graded this — ask her why</span></div></div>
        <div class="bubble" id="mpExplain">Scan me with a question — "why a ${r.publicGrade}?" or "what defects were found?"</div>
        <div style="display:flex;gap:6px;margin-top:8px">
          <input id="mpEQ" placeholder="Ask about this cert…" style="margin:0;font-size:12px">
          <button class="primary" id="mpEGo" style="padding:6px 14px">▸</button>
        </div>
      </div>`;
    const askExplain = async () => {
      const question = q('#mpEQ').value.trim() || 'Explain this grade to me';
      q('#mpEQ').value = ''; q('#mpExplain').textContent = 'Money Penny is thinking…';
      const res = await fetch('/api/mp/explain/' + encodeURIComponent(r.certId), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question }),
      }).then(x => x.json());
      q('#mpExplain').textContent = res.reply || '…';
    };
    q('#mpEGo').onclick = askExplain;
    q('#mpEQ').onkeydown = e => { if (e.key === 'Enter') askExplain(); };
    // draw defect pins over the image
    const map = q('#dmap');
    r.defects.forEach(d => {
      const pin = document.createElement('i');
      pin.style.cssText = `position:absolute;left:${d.x * 100}%;top:${d.y * 100}%;width:14px;height:14px;margin:-7px;border:2px solid ${d.severity > .6 ? 'var(--danger)' : 'var(--teal)'};border-radius:50%;opacity:.85`;
      pin.title = `${d.lane} defect (sev ${d.severity})`;
      map.appendChild(pin);
    });
  };
}

async function population() {
  const p = await api('/population');
  V.innerHTML = page('Population Report', 'Population by grade — real certified data only',
    `<div class="grid"><div class="tile"><h3>Total submissions</h3><strong style="font-size:28px;color:var(--teal)">${p.total}</strong></div>
    <div class="tile"><h3>Certified</h3><strong style="font-size:28px;color:var(--green)">${p.certified}</strong></div>
    <div class="tile"><h3>In pipeline</h3><strong style="font-size:28px">${p.inPipeline}</strong></div></div>
    <div class="panel" style="margin-top:14px"><h3>BY GRADE</h3>
    <table><tr><th>Grade</th><th>Count</th></tr>${Object.entries(p.byGrade).map(([g, c]) => `<tr><td>${g}</td><td>${c}</td></tr>`).join('') || '<tr><td colspan=2 class="muted">No certified items yet</td></tr>'}</table></div>
    <div class="panel" style="margin-top:14px"><h3>LEADERBOARD — ranked by internal index</h3>
    <table><tr><th>#</th><th>Cert</th><th>Item</th><th>Grade</th><th>Index</th><th>Chron</th></tr>
    ${(p.leaderboard || []).map((s, i) => `<tr><td>${i + 1}</td><td>${esc(s.certId)}</td><td>${esc(s.item || '')}</td><td>${s.grade}</td><td>${s.index ?? '—'}</td><td>#${s.chronology}</td></tr>`).join('') || '<tr><td colspan=6 class="muted">No certified items yet</td></tr>'}</table></div>`);
}

/* ── Case Studio — physical slab/case designer with engraving ─────────── */
const LABEL_STYLES = {
  gemcore: { band: '#f4f7f8', head: '#12344a', accent: '#0ea898', name: 'GemCore (emerald)' },
  psa:     { band: '#c8323c', head: '#fff',    accent: '#c8323c', name: 'Classic red (PSA-style)' },
  bgs:     { band: '#1a1a1a', head: '#d9b96a', accent: '#d9b96a', name: 'Gold subgrades (BGS-style)' },
  cgc:     { band: '#e8f2f8', head: '#0d4d8a', accent: '#0d4d8a', name: 'Ultra-clear blue (CGC-style)' },
  tag:     { band: '#0c1a26', head: '#25f3e6', accent: '#25f3e6', name: 'Minimal dark + QR (TAG-style)' },
  ars:     { band: '#f4f7f8', head: '#12344a', accent: '#7fa8b8', name: 'Art-first (grade on back)' },
};
const SIZES = { std: [80, 130], thick: [80, 130], mini: [60, 100] };

function slabSVG(d) {
  const L = LABEL_STYLES[d.style] || LABEL_STYLES.gemcore;
  const horiz = d.orient === 'horizontal';
  const W = horiz ? 430 : 300, H = horiz ? 300 : 430;
  const tint = { clear: 'rgba(190,230,245,.12)', smoke: 'rgba(60,80,95,.35)', black: 'rgba(8,14,20,.9)' }[d.tint] || 'rgba(190,230,245,.12)';
  const acc = d.accent || L.accent;
  const labelH = 74, m = 10;
  const artFirst = d.style === 'ars';
  const qr = d.cert ? `<image href="/api/qr?text=${encodeURIComponent(location.origin + '/#verify-' + d.cert)}" x="${horiz ? W - 88 : 34}" y="${horiz ? 26 : 26}" width="${d.style === 'tag' ? 52 : 40}" height="${d.style === 'tag' ? 52 : 40}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="case" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="rgba(210,240,255,.28)"/><stop offset=".5" stop-color="${tint}"/><stop offset="1" stop-color="rgba(90,140,160,.18)"/>
    </linearGradient>
    <filter id="etch"><feOffset dx="0" dy="1"/><feGaussianBlur stdDeviation=".4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect x="${m}" y="${m}" width="${W - 20}" height="${H - 20}" rx="16" fill="url(#case)" stroke="rgba(190,235,255,.5)" stroke-width="2"/>
  <rect x="${m + 8}" y="${m + 8}" width="${W - 36}" height="${H - 36}" rx="11" fill="none" stroke="${acc}" stroke-width="1" stroke-dasharray="4 3" opacity=".5"/>
  <!-- label band -->
  <rect x="${m + 12}" y="${m + 12}" width="${W - 44}" height="${labelH}" rx="9" fill="${L.band}" stroke="rgba(0,0,0,.2)"/>
  <rect x="${m + 12}" y="${m + 12}" width="6" height="${labelH}" rx="3" fill="${acc}"/>
  <text x="${m + 30}" y="${m + 34}" font-family="Georgia,serif" font-size="13" font-weight="bold" fill="${L.head}">◆ GEMCORE GRADING</text>
  <text x="${m + 30}" y="${m + 52}" font-size="10.5" fill="${L.head}" opacity=".85">${esc(d.name) || 'COLLECTIBLE'}</text>
  <text x="${m + 30}" y="${m + 67}" font-size="9" fill="${L.head}" opacity=".6">${esc(d.set) || ''} ${esc(d.year) || ''}</text>
  ${artFirst ? `<text x="${m + 30}" y="${m + 80}" font-size="8" fill="${L.head}" opacity=".5">GRADE ON REVERSE</text>` : `<text x="${W - m - 22}" y="${m + 62}" text-anchor="end" font-size="34" font-weight="800" fill="${acc}">${esc(d.grade) || '—'}</text>`}
  <text x="${W / 2}" y="${m + 82}" text-anchor="middle" font-family="monospace" font-size="8" fill="${L.head}" opacity=".7">${esc(d.cert) || 'GC000000000'}</text>
  ${qr}
  <!-- card window -->
  <clipPath id="cwin"><rect x="${m + 20}" y="${m + labelH + 18}" width="${W - 60}" height="${H - labelH - 96}" rx="8"/></clipPath>
  <rect x="${m + 20}" y="${m + labelH + 18}" width="${W - 60}" height="${H - labelH - 96}" rx="8" fill="none" stroke="rgba(190,235,255,.3)" stroke-width="1.2"/>
  ${d.cardImg ? `<image href="${d.cardImg}" x="${m + 20}" y="${m + labelH + 18}" width="${W - 60}" height="${H - labelH - 96}" preserveAspectRatio="xMidYMid slice" clip-path="url(#cwin)"/>` : ''}
  ${d.holo ? `<rect x="${m + 24}" y="${H - m - 60}" width="90" height="14" rx="4" fill="url(#case)" stroke="${acc}" stroke-width=".7" opacity=".85"/><text x="${m + 69}" y="${H - m - 50}" text-anchor="middle" font-size="7" fill="${acc}">HOLO SEAL</text>` : ''}
  <!-- engraving -->
  <text x="${W / 2}" y="${H - m - 22}" text-anchor="middle" font-family="Georgia,serif" font-size="12" letter-spacing="2" fill="rgba(255,255,255,.55)" filter="url(#etch)">${esc(d.engrave) || ''}</text>
  <text x="${W / 2}" y="${H - m - 22.7}" text-anchor="middle" font-family="Georgia,serif" font-size="12" letter-spacing="2" fill="rgba(0,0,0,.5)">${esc(d.engrave) || ''}</text>
  <!-- weld dots + dimension -->
  <g fill="rgba(190,235,255,.4)">${[m + 16, W / 2 - 40, W / 2 + 40, W - m - 16].map(x => `<circle cx="${x}" cy="${H - m - 6}" r="1.6"/>`).join('')}</g>
  <g stroke="${acc}" stroke-width=".7" opacity=".6"><path d="M${m} ${H - 4}h${W - 20}"/></g>
</svg>`;
}

/* Back label — subgrades, QR verify, authenticity note (BGS/TAG-style) */
function slabSVGBack(d) {
  const L = LABEL_STYLES[d.style] || LABEL_STYLES.gemcore;
  const horiz = d.orient === 'horizontal';
  const W = horiz ? 430 : 300, H = horiz ? 300 : 430;
  const m = 10, labelH = 150;
  const acc = d.accent || L.accent;
  const subs = ['Centering', 'Corners', 'Edges', 'Surface'];
  const qru = d.cert ? `<image href="/api/qr?text=${encodeURIComponent(location.origin + '/#verify-' + d.cert)}" x="${W - 96}" y="${m + 26}" width="62" height="62"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><linearGradient id="bcase" x1="0" y1="0" x2="1" y2="1">
    <stop stop-color="rgba(210,240,255,.22)"/><stop offset="1" stop-color="rgba(60,90,105,.2)"/></linearGradient>
    <filter id="etch"><feOffset dx="0" dy="1"/><feGaussianBlur stdDeviation=".4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <rect x="${m}" y="${m}" width="${W - 20}" height="${H - 20}" rx="16" fill="url(#bcase)" stroke="rgba(190,235,255,.4)" stroke-width="2"/>
  <rect x="${m + 12}" y="${m + 12}" width="${W - 44}" height="${labelH}" rx="9" fill="${L.band}" stroke="rgba(0,0,0,.2)"/>
  <rect x="${m + 12}" y="${m + 12}" width="6" height="${labelH}" rx="3" fill="${acc}"/>
  <text x="${m + 30}" y="${m + 32}" font-family="Georgia,serif" font-size="11" font-weight="bold" fill="${L.head}">GEMCORE CONDITION REPORT</text>
  ${subs.map((n, i) => `<text x="${m + 30}" y="${m + 50 + i * 24}" font-size="9" fill="${L.head}" opacity=".8">${n}</text>
  <rect x="${m + 100}" y="${m + 42 + i * 24}" width="${W - 220}" height="8" rx="4" fill="rgba(0,0,0,.15)"/>
  <rect x="${m + 100}" y="${m + 42 + i * 24}" width="${(W - 220) * ((d.lanes?.[n.toLowerCase()] ?? 900) / 1000)}" height="8" rx="4" fill="${acc}"/>
  <text x="${W - 100}" y="${m + 50 + i * 24}" font-size="9" font-weight="bold" fill="${L.head}">${((d.lanes?.[n.toLowerCase()] ?? 900) / 100).toFixed(1)}</text>`).join('')}
  ${qru}
  <text x="${W - 65}" y="${m + 100}" text-anchor="middle" font-size="6.5" fill="${L.head}" opacity=".7">SCAN TO VERIFY</text>
  <text x="${m + 30}" y="${m + labelH - 8}" font-family="monospace" font-size="8" fill="${L.head}" opacity=".7">${esc(d.cert) || 'GC000000000'} • rubric ${esc(d.rubric || 'gemcore-rubric-0.1.0')}</text>
  <rect x="${m + 20}" y="${m + labelH + 20}" width="${W - 60}" height="${H - labelH - 120}" rx="8" fill="none" stroke="rgba(190,235,255,.3)" stroke-width="1.2"/>
  <text x="${W / 2}" y="${H - 60}" text-anchor="middle" font-size="8" fill="${acc}" letter-spacing="2">AUTHENTICITY &amp; CONDITION GRADED SEPARATELY</text>
  <text x="${W / 2}" y="${H - 44}" text-anchor="middle" font-family="Georgia,serif" font-size="11" letter-spacing="2" fill="rgba(255,255,255,.55)" filter="url(#etch)">${esc(d.engrave) || ''}</text>
  ${d.demo ? `<text x="${W / 2}" y="${H - 28}" text-anchor="middle" font-size="9" fill="#d9b96a" letter-spacing="2">DEMO — NOT A CERTIFIED GRADE</text>` : ''}
</svg>`;
}

function caseStudio() {
  V.innerHTML = page('Case Studio', 'Design the physical slab — label, tint, hologram, engraving, QR verify',
    `<div class="detailgrid">
      <div class="panel"><h3>SLAB DESIGN</h3>
        <label>Item name<input id="csName" placeholder="Charizard (1st Edition)"></label>
        <label>Set / year<input id="csSet" placeholder="Pokémon Base Set • 1999"></label>
        <label>Certificate ID<input id="csCert" placeholder="GC000123456 (enables QR)"></label>
        <label>Grade<input id="csGrade" placeholder="10" style="width:80px"></label>
        <label>Label style<select id="csStyle">${Object.entries(LABEL_STYLES).map(([k, v]) => `<option value="${k}">${v.name}</option>`).join('')}</select></label>
        <label>Orientation<select id="csOrient"><option>vertical</option><option>horizontal</option></select></label>
        <label>Case tint<select id="csTint"><option>clear</option><option>smoke</option><option>black</option></select></label>
        <label>Accent color (color-match)<input type="color" id="csAccent" value="#0ea898" style="height:36px;padding:2px"></label>
        <label>Plastic engraving text<input id="csEngrave" placeholder="GEMCORE CERTIFIED"></label>
        <label><input type="checkbox" id="csHolo" checked style="width:auto"> Hologram strip</label>
        <label>Card photo<input type="file" id="csImg" accept="image/*" style="font-size:11px"></label>
        <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
          <button class="primary" id="csSvg">Download SVG (front+back)</button>
          <button id="csPng">Download PNG (front+back)</button>
          <button id="csGlb">⬡ GLB (Unreal/Blender)</button>
          <button id="csUsdz">◈ USDZ (iOS AR)</button>
        </div>
        <h3 style="margin-top:16px">BRING TO LIFE — ANIMATED CARD</h3>
        <canvas id="animCv" width="480" height="640" style="width:100%;max-width:340px;border-radius:12px;border:1px solid var(--line);touch-action:none"></canvas>
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
          <select id="animMode" style="width:auto"><option value="parallax">Parallax tilt</option><option value="holo">Holo sweep</option><option value="spin">Reveal spin</option></select>
          <button class="primary" id="animRec" style="font-size:11px">● Record WebM (4s)</button>
          <span id="animMsg" class="muted" style="font-size:11px"></span>
        </div>
        <p class="muted" style="font-size:10px;margin-top:6px">GLB drops straight into Unreal Engine (glTF importer) or Blender. USDZ = iPhone AR Quick Look — scan cert QR → slab floats in the room. WebM = the "card comes alive" clip for socials/passport.</p>
        <h3 style="margin-top:16px">GEMCORE IMAGINE — LOCAL ENGINE <span class="muted" style="font-size:9px">(no API, runs on the Jetson)</span></h3>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <select id="imMode" style="width:auto"><option value="depth">Depth parallax (2.5D)</option><option value="diffuse">Diffusion video (SVD)</option></select>
          <button class="primary" id="imGo" style="font-size:11px">◉ Animate Card</button>
          <span id="imStatus" class="muted" style="font-size:11px"></span>
        </div>
        <video id="imVid" controls loop style="width:100%;max-width:340px;border-radius:12px;margin-top:8px;display:none"></video>
        <p class="muted" style="font-size:10px;margin-top:4px">Depth parallax: real 2.5D float + holo sweep, rendered locally. Diffusion: img2video on the Orin when SVD/LTX models are installed — auto-falls back to depth mode.</p>
        <p class="muted" style="font-size:10px;margin-top:8px">QR encodes the public verify URL — scannable on a printed label. SVG is vector for laser engraving / fabrication.</p>
      </div>
      <div class="panel" style="text-align:center"><h3>PREVIEW — FRONT &amp; BACK</h3><div id="csPrev" style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap"></div></div>
    </div>`);
  const q = sel => document.querySelector(sel);
  const read = () => ({ name: q('#csName').value, set: q('#csSet').value, cert: q('#csCert').value, grade: q('#csGrade').value, style: q('#csStyle').value, orient: q('#csOrient').value, tint: q('#csTint').value, accent: q('#csAccent').value, engrave: q('#csEngrave').value, holo: q('#csHolo').checked, lanes: (window._subLanes || {}), cardImg: window._csImg || '' });
  const render = () => q('#csPrev').innerHTML = slabSVG(read()) + slabSVGBack(read());
  q('#csImg').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const fr = new FileReader(); fr.onload = () => { window._csImg = fr.result; render(); }; fr.readAsDataURL(f);
  };
  ['csName', 'csSet', 'csCert', 'csGrade', 'csStyle', 'csOrient', 'csTint', 'csAccent', 'csEngrave', 'csHolo'].forEach(id => q('#' + id).oninput = render);
  // prefill from selected submission if one exists
  if (currentSub) api('/submissions/' + currentSub).then(s => {
    if (s?.item) { q('#csName').value = s.item.name || ''; q('#csSet').value = (s.item.set || '') + (s.item.year ? ' • ' + s.item.year : ''); }
    q('#csCert').value = s.id;
    if (s.certificate) q('#csGrade').value = s.certificate.publicGrade;
    if (s.evaluation) window._subLanes = s.evaluation.lanes;
    const capImg = (s.captures || []).find(c => c.storedData && c.side === 'front') || (s.captures || []).find(c => c.storedData);
    if (capImg) window._csImg = capImg.storedData;
    render();
  }).catch(() => {});
  render();
  const dl = (blob, name) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); };
  q('#csSvg').onclick = () => {
    dl(new Blob([slabSVG(read())], { type: 'image/svg+xml' }), 'gemcore-slab-front.svg');
    dl(new Blob([slabSVGBack(read())], { type: 'image/svg+xml' }), 'gemcore-slab-back.svg');
  };
  q('#csPng').onclick = () => {
    const horiz = read().orient === 'horizontal';
    const [cw, ch] = horiz ? [860, 600] : [600, 860];
    [['front', slabSVG(read())], ['back', slabSVGBack(read())]].forEach(([side, svg]) => {
      const img = new Image();
      img.onload = () => { const c = document.createElement('canvas'); c.width = cw; c.height = ch; c.getContext('2d').drawImage(img, 0, 0, cw, ch); c.toBlob(b => dl(b, `gemcore-slab-${side}.png`), 'image/png'); };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    });
  };
  // ── 3D/AR exports ──
  q('#csGlb').onclick = () => {
    if (!currentSub) return alert('Select a submission with a front capture first');
    location.href = `/api/submissions/${currentSub}/export.glb`;
  };
  q('#csUsdz').onclick = () => {
    if (!currentSub) return alert('Select a submission with a front capture first');
    location.href = `/api/submissions/${currentSub}/export.usdz`;
  };
  // ── Bring to Life animator — canvas + MediaRecorder WebM ──
  const cv = q('#animCv'), ctx = cv.getContext('2d');
  const cimg = new Image();
  let animRAF;
  const drawAnim = t => {
    const mode = q('#animMode').value, T = (t / 1000) % 4;
    ctx.fillStyle = '#02070c'; ctx.fillRect(0, 0, 480, 640);
    ctx.save();
    ctx.translate(240, 320);
    if (cimg.src) {
      if (mode === 'spin') { const s = Math.cos(T * Math.PI / 2); ctx.scale(Math.abs(s) || .02, 1); }
      else if (mode === 'parallax') { ctx.rotate(Math.sin(T * Math.PI / 2) * .06); ctx.transform(1, Math.sin(T * 1.57) * .03, Math.cos(T * 1.57) * .05, 1, 0, 0); }
      ctx.drawImage(cimg, -190, -280, 380, 560);
      if (mode === 'holo' || mode === 'parallax') {
        const g = ctx.createLinearGradient(-240, 0, 240, 0);
        const p = (Math.sin(T * Math.PI) + 1) / 2;
        g.addColorStop(Math.max(0, p - .18), 'rgba(255,255,255,0)');
        g.addColorStop(p, 'rgba(150,240,255,.28)');
        g.addColorStop(Math.min(1, p + .18), 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.fillRect(-190, -280, 380, 560);
      }
    } else { ctx.fillStyle = '#25f3e6'; ctx.font = '14px Orbitron'; ctx.textAlign = 'center'; ctx.fillText('Upload a card photo above', 0, 0); }
    ctx.restore();
    ctx.fillStyle = 'rgba(37,243,230,.7)'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
    ctx.fillText('◈ GEMCORE ANIMATE — ' + mode.toUpperCase(), 240, 628);
    animRAF = requestAnimationFrame(drawAnim);
  };
  animRAF = requestAnimationFrame(drawAnim);
  q('#csImg').addEventListener('change', () => { if (window._csImg) cimg.src = window._csImg; });
  if (window._csImg) cimg.src = window._csImg;
  q('#animRec').onclick = () => {
    const stream = cv.captureStream(30);
    const rec = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = []; rec.ondataavailable = e => chunks.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      dl(blob, `gemcore-animate-${currentSub || 'card'}.webm`);
      q('#animMsg').textContent = 'saved ✓';
    };
    rec.start(); q('#animMsg').textContent = 'recording…';
    setTimeout(() => rec.stop(), 4000);
  };
  // ── GemCore Imagine — Jetson engine ──
  q('#imGo').onclick = async () => {
    if (!currentSub) return alert('Select a submission first');
    const mode = q('#imMode').value;
    q('#imStatus').textContent = 'queueing…';
    const res = await api(`/submissions/${currentSub}/animate`, { b: { mode } });
    if (!res.job) { q('#imStatus').textContent = res.error || 'engine offline'; return; }
    const jid = res.job;
    q('#imStatus').textContent = 'rendering on the Jetson…';
    const poll = setInterval(async () => {
      const st = await api('/animate/' + jid);
      if (st.state === 'done' || st.state === 'fallback' && st.file) {
        clearInterval(poll);
        const v = q('#imVid');
        v.src = `/api/animate/${jid}/file`; v.style.display = 'block'; v.play();
        q('#imStatus').textContent = `${st.frames || ''} frames ✓ — real MP4`;
      } else if (st.state === 'error' || st.state === 'offline') {
        clearInterval(poll); q('#imStatus').textContent = st.error || 'engine offline — start imagine_server.py';
      }
    }, 3000);
  };
}

/* ── Settings: AI config, interface, data, diagnostics, hardware ──────── */
async function settings() {
  const health = await api('/health').catch(() => ({}));
  const mpst = await api('/mp/status').catch(() => ({ online: false }));
  const accent = localStorage.getItem('gemcore.accent') || '#25f3e6';
  const mpKey = localStorage.getItem('gemcore.mpkey') || '';
  V.innerHTML = page('Settings', 'Configure the lab — AI, interface, hardware, data',
    `<div class="detailgrid">
      <div class="panel"><h3>MONEY PENNY</h3>
        <div class="scanrow"><span class="tick" style="color:${mpst.online ? 'var(--green)' : 'var(--danger)'}">●</span>
          <span>Model endpoint <small>${mpst.online ? 'online — ' + esc(mpst.url || '') : 'offline'}</small></span></div>
        <label style="margin-top:10px">Chat unlock key (public servers)<input id="sMpKey" placeholder="MP-…" value="${esc(mpKey)}" type="password"></label>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="primary" id="sKeySave" style="font-size:11px">Save key</button>
          <button id="sKeyClear" style="font-size:11px">Clear</button>
        </div>
      </div>
      <div class="panel"><h3>INTERFACE</h3>
        <label>Accent color<input type="color" id="sAccent" value="${accent}" style="height:36px;padding:2px"></label>
        <label>Default page<select id="sHome">
          ${['grade','command','submissions','vault','studio'].map(k => `<option value="${k}" ${localStorage.getItem('gemcore.home') === k ? 'selected' : ''}>${k}</option>`).join('')}
        </select></label>
        <button class="primary" id="sUiSave" style="margin-top:8px;font-size:11px">Apply</button>
      </div>
    </div>
    <div class="detailgrid" style="margin-top:14px">
      <div class="panel"><h3>DATA & STATE</h3>
        <p class="muted" style="font-size:11px">Selected submission: ${esc(currentSub || 'none')}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button id="sClearSub" style="font-size:11px">Deselect submission</button>
          <button id="sClearCams" style="font-size:11px">Reset camera roles</button>
          <button id="sWipe" style="font-size:11px;border-color:var(--danger);color:var(--danger)">Wipe local state</button>
        </div>
      </div>
      <div class="panel"><h3>DIAGNOSTICS</h3>
        <div class="scanrow"><span class="tick">●</span><span>API <small>${esc(health.version || '?')} • rubric ${esc(health.rubric || '?')} • ${health.visionAdapters ?? '?'} vision adapters</small></span></div>
        <div class="scanrow"><span class="tick">●</span><span>Money Penny <small>${mpst.online ? 'reachable via tunnel' : 'offline'}</small></span></div>
        <div class="scanrow"><span class="tick">●</span><span>Storage <small>JSON ledger (SQLite migration pending)</small></span></div>
      </div>
    </div>
    <div class="panel" style="margin-top:14px"><h3>TEAM — HANDLERS &amp; SIGNATURES</h3>
      <div id="teamList"></div>
      <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
        <input id="tmName" placeholder="Handler name" style="width:150px;margin:0">
        <input id="tmRole" placeholder="role (grader, intake…)" style="width:170px;margin:0">
      </div>
      <p class="muted" style="font-size:10px;margin-top:8px">Sign with finger/stylus — stamps QC decisions, seals, and the audit trail:</p>
      <canvas id="sigPad" width="340" height="90" style="width:100%;border:1px solid var(--line);border-radius:8px;background:#030b12;touch-action:none"></canvas>
      <div style="display:flex;gap:8px;margin-top:6px">
        <button class="primary" id="tmAdd" style="font-size:11px">Add Handler</button>
        <button id="sigClear" style="font-size:11px">Clear Signature</button>
      </div>
      <label style="margin-top:12px">WORKING AS<select id="mePick"><option value="staff">staff (unassigned)</option></select></label>
      <p class="muted" style="font-size:10px">Every QC call, seal, and review stamps this name — pick yourself before touching cards.</p>
    </div>
    <div class="panel" style="margin-top:14px"><h3>CONNECTED CAMERAS</h3>
      <button class="primary" id="scanDevs">Detect Cameras</button>
      <div id="devList" style="margin-top:10px"></div>
      <h3 style="margin-top:14px">ROLE ASSIGNMENT</h3>
      ${['overview', 'macro-telescope', 'microscope', 'uv-ir'].map(r =>
        `<label>${r.toUpperCase()}<select data-role="${r}"><option value="">— auto —</option></select></label>`).join('')}
    </div>
    <div class="panel" style="margin-top:14px"><h3>RECOMMENDED KIT</h3>
      <table><tr><th>Role</th><th>Suggested device</th><th>Cost</th></tr>
      ${KIT.map(k => `<tr><td>${k[0]}</td><td class="muted">${k[1]}</td><td>${k[2]}</td></tr>`).join('')}</table>
    </div>`);
  const q = sel => document.querySelector(sel);
  q('#sKeySave').onclick = () => { localStorage.setItem('gemcore.mpkey', q('#sMpKey').value.trim()); q('#sKeySave').textContent = 'Saved ✓'; };
  q('#sKeyClear').onclick = () => { localStorage.removeItem('gemcore.mpkey'); q('#sMpKey').value = ''; q('#sKeyClear').textContent = 'Cleared'; };
  q('#sUiSave').onclick = () => {
    const a = q('#sAccent').value;
    localStorage.setItem('gemcore.accent', a); localStorage.setItem('gemcore.home', q('#sHome').value);
    applyAccent(); q('#sUiSave').textContent = 'Applied ✓';
  };
  q('#sClearSub').onclick = () => { currentSub = null; localStorage.removeItem('gemcore.sub'); show('settings'); };
  q('#sClearCams').onclick = () => { localStorage.removeItem('gemcore.capture.roles'); show('settings'); };
  q('#sWipe').onclick = () => { if (confirm('Clear all local GemCore state (selections, keys, camera roles)?')) { ['gemcore.sub','gemcore.mpkey','gemcore.accent','gemcore.home','gemcore.capture.roles'].forEach(k => localStorage.removeItem(k)); location.reload(); } };
  // ── team roster + signature pad ──
  const sigCtx = q('#sigPad').getContext('2d');
  sigCtx.strokeStyle = '#d9b96a'; sigCtx.lineWidth = 2; sigCtx.lineCap = 'round';
  let signing = false;
  const sigPos = e => { const r = q('#sigPad').getBoundingClientRect(); return [ (e.clientX - r.left) * (340 / r.width), (e.clientY - r.top) * (90 / r.height) ]; };
  q('#sigPad').onpointerdown = e => { signing = true; sigCtx.beginPath(); sigCtx.moveTo(...sigPos(e)); };
  q('#sigPad').onpointermove = e => { if (signing) { sigCtx.lineTo(...sigPos(e)); sigCtx.stroke(); } };
  ['pointerup', 'pointerleave'].forEach(ev => q('#sigPad')['on' + ev] = () => signing = false);
  q('#sigClear').onclick = () => sigCtx.clearRect(0, 0, 340, 90);

  const team = await api('/team').catch(() => []);
  const renderTeam = () => {
    q('#teamList').innerHTML = (Array.isArray(team) ? team : []).map(m => `
      <div class="scanrow"><span class="tick">✍</span><span><b>${esc(m.name)}</b> <small>${esc(m.role)} • ${m.id}</small>
        ${m.signature ? `<img src="${m.signature}" style="height:22px;vertical-align:middle;margin-left:8px">` : ''}</span>
        <span style="margin-left:auto"><button data-rt="${m.id}" style="font-size:10px;padding:4px 8px">remove</button></span></div>`).join('') || '<p class="muted" style="font-size:12px">No handlers yet.</p>';
    document.querySelectorAll('[data-rt]').forEach(b => b.onclick = async () => {
      await fetch('/api/team/' + b.dataset.rt, { method: 'DELETE', headers: { 'x-staff-key': localStorage.getItem('gemcore.staff') || '' } });
      const i = team.findIndex(m => m.id === b.dataset.rt); if (i > -1) team.splice(i, 1); renderTeam();
    });
    const cur = localStorage.getItem('gemcore.me') || 'staff';
    q('#mePick').innerHTML = '<option value="staff">staff (unassigned)</option>' +
      (Array.isArray(team) ? team : []).map(m => `<option value="${esc(m.name)}" ${cur === m.name ? 'selected' : ''}>${esc(m.name)} — ${esc(m.role)}</option>`).join('');
  };
  renderTeam();
  q('#mePick').onchange = e => localStorage.setItem('gemcore.me', e.target.value);
  q('#tmAdd').onclick = async () => {
    const name = q('#tmName').value.trim(); if (!name) return;
    const m = await fetch('/api/team', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-key': localStorage.getItem('gemcore.staff') || '' },
      body: JSON.stringify({ name, role: q('#tmRole').value.trim(), signature: q('#sigPad').toDataURL() }) }).then(r => r.json());
    if (m.id) { team.push(m); renderTeam(); q('#tmName').value = q('#tmRole').value = ''; sigCtx.clearRect(0, 0, 340, 90); }
  };
  // cameras
  const roles = GemCoreCapture.getRoles();
  q('#scanDevs').onclick = async () => {
    try { const s = await navigator.mediaDevices.getUserMedia({ video: true }); s.getTracks().forEach(t => t.stop()); } catch {}
    const cams = await GemCoreCapture.enumerateCameras();
    q('#devList').innerHTML = cams.length
      ? cams.map(c => `<div class="scanrow"><span class="tick">●</span><span>${esc(c.label)}<small>${c.deviceId.slice(0, 12)}…</small></span></div>`).join('')
      : '<p class="muted">No cameras detected.</p>';
    document.querySelectorAll('[data-role]').forEach(sel => {
      const r = sel.dataset.role;
      sel.innerHTML = '<option value="">— auto —</option>' +
        cams.map(c => `<option value="${c.deviceId}" ${roles[r] === c.deviceId ? 'selected' : ''}>${esc(c.label)}</option>`).join('');
      sel.onchange = () => GemCoreCapture.setRole(r, sel.value || null);
    });
  };
}

function applyAccent() {
  const a = localStorage.getItem('gemcore.accent');
  if (a) { document.documentElement.style.setProperty('--teal', a); document.documentElement.style.setProperty('--teal2', a); }
}

/* ── Settings: real hardware roles + calibration + recommended kit ────── */
const KIT = [
  ['Overview camera', 'Any 1080p+ webcam or phone camera — parallel to card, matte black backdrop, twin 45° diffused lights', '$0–60'],
  ['CCD flatbed scanner', 'Epson Perfection V600 — CCD deep-focus reads cards THROUGH slabs (CIS scanners blur at 4–5mm standoff). Hobby gold standard.', '~$250'],
  ['Digital microscope', 'LinkMicro LM210S or TOMLOV DM9 (10" screen, 4K) — pro graders work at 10–30×; over-zoom reveals non-grading flaws', '$80–200'],
  ['UV / IR spectral', '365nm UV torch + IR camera — catches re-inking, erased marks, bleached stock. Enterprise tier: Foster+Freeman VSC8000/HS', '$20–80'],
  ['Raking light', 'Low-angle LED bar — exposes hairline surface scratches naked eye misses', '$15–40'],
  ['Slab welder', '20KHz ultrasonic welder, 2000–3200W benchtop for sealing cases', '$1,000–2,800'],
  ['Label printer/cutter', 'Slab label cutter + printer for paper inserts (UV-cure engraving later)', '~$300'],
  ['Cinema capture (pro tier)', 'Global shutter + RAW codec (BRAW/REDCODE) — no jello on pans, 15–17 stops DR preserves shadow+foil detail. Blackmagic Pyxis 6K / URSA class for lab masters', '$2.5k–30k'],
];

/* ── Slab Production — certified cert → physical slab pipeline ────────── */
async function production() {
  const jobs = await api('/production');
  const STAGES = ['label-print', 'encapsulate', 'weld-seal', 'verify', 'complete'];
  V.innerHTML = page('Slab Production', 'Certified → label print → encapsulate → ultrasonic weld → verify → complete',
    jobs.length ? jobs.map(j => `
      <div class="panel" style="margin-top:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
          <b>${j.id}</b> ${j.demo ? '<span class="badge warn">DEMO</span>' : ''}
          <span class="muted" style="font-size:12px">${esc(j.item?.name || '')} • grade ${j.grade ?? '—'}</span>
          <button class="primary" data-adv="${j.id}" ${j.stage === 'complete' ? 'disabled' : ''}>Advance →</button>
        </div>
        <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">
          ${STAGES.map(st => `<span class="badge" style="${st === j.stage ? 'border-color:var(--green);color:var(--green)' : STAGES.indexOf(st) < STAGES.indexOf(j.stage) ? 'opacity:.5' : 'opacity:.3'}">${st}</span>`).join('')}
        </div>
      </div>`).join('')
    : '<div class="panel" style="margin-top:12px"><p class="muted">No production jobs. Certify a submission in the Grading Lab, then Send to Production.</p></div>');
  document.querySelectorAll('[data-adv]').forEach(b => b.onclick = async () => {
    await api(`/submissions/${b.dataset.adv}/production/advance`);
    show('production');
  });
}

/* ── Command Center — pace stats, priority queue, agent bench, funnel ─── */
async function command() {
  const [list, agents, auditFeed] = await Promise.all([
    subs(), api('/agents').catch(() => []), api('/audit').catch(() => []),
  ]);
  const today = new Date().toDateString();
  const certToday = list.filter(s => s.certificate && new Date(s.certificate.sealedAt).toDateString() === today).length;
  const recvToday = list.filter(s => new Date(s.createdAt).toDateString() === today).length;
  const humanReview = list.filter(s => s.status === 'qc' || s.status === 'analyzing').length;
  const turns = list.filter(s => s.certificate?.sealedAt).map(s => (new Date(s.certificate.sealedAt) - new Date(s.createdAt)) / 864e5).sort((a, b) => a - b);
  const medianTurn = turns.length ? turns[turns.length >> 1].toFixed(1) : '—';
  const funnel = [['RECEIVED', 'intake'], ['IMAGING', 'capturing'], ['AGENT REVIEW', 'analyzing'], ['HUMAN REVIEW', 'qc'], ['ENCAPSULATION', 'production'], ['CERTIFIED', 'certified']];
  const queue = list.filter(s => ['qc', 'analyzing', 'review-request'].includes(s.status)).slice(0, 8);

  const items = [
    ['grade', '⬡', 'Quantum Inspection', 'AI scan chamber + Money Penny'],
    ['intake', '▤', 'Start a Submission', 'Capture & track collectibles'],
    ['photolab', '▣', 'Photo Lab', 'Inspect evidence, pin defects'],
    ['passport', '◇', 'Evidence Passport', 'Full transparency records'],
    ['live', '◉', 'Live Grading Feed', 'Every lab event in real time'],
    ['qc', '✓', 'Human QC Queue', 'Review & approve grades'],
    ['population', '◫', 'Population Report', 'Real certified census'],
    ['studio', '✦', 'GOATVERSE Studio', 'Design the physical slab'],
    ['production', '▧', 'Slab Production', 'Label → weld → ship'],
    ['vault', '▤', 'GemCore Vault', 'Your collection'],
    ['market', '↗', 'Market Intelligence', 'Comparables & trends'],
    ['verify', '✓', 'Verify a Cert', 'Public verification'],
    ['community', '◔', 'Community & RP', 'GOAT Force ATL'],
  ];
  V.innerHTML = '<div id="cmdZone"></div><div id="cmdTiles">' +
    `<div class="grid">${items.map(([k, ic, t, s]) =>
      `<div class="tile" style="cursor:pointer" data-go="${k}"><h3>${ic} ${t}</h3><p class="muted">${s}</p></div>`).join('')}</div></div>`;
  document.querySelectorAll('[data-go]').forEach(t => t.onclick = () => show(t.dataset.go));
  commandDash(); // paints the live dashboard into #cmdZone
}

/* ── Command dashboard — pace, queue, agent bench, funnel (brickgrade-parity) ── */
async function commandDash() {
  const [list, agents, auditFeed] = await Promise.all([
    subs(), api('/agents').catch(() => []), api('/audit').catch(() => []),
  ]);
  const today = new Date().toDateString();
  const certToday = list.filter(s => s.certificate && new Date(s.certificate.sealedAt).toDateString() === today).length;
  const recvToday = list.filter(s => new Date(s.createdAt).toDateString() === today).length;
  const humanReview = list.filter(s => ['qc', 'analyzing'].includes(s.status)).length;
  const turns = list.filter(s => s.certificate?.sealedAt).map(s => (new Date(s.certificate.sealedAt) - new Date(s.createdAt)) / 864e5).sort((a, b) => a - b);
  const medianTurn = turns.length ? turns[turns.length >> 1].toFixed(1) : '—';
  const funnel = [['RECEIVED', 'intake'], ['IMAGING', 'capturing'], ['AGENT REVIEW', 'analyzing'], ['HUMAN REVIEW', 'qc'], ['ENCAPSULATION', 'production'], ['CERTIFIED', 'certified']];
  const queue = list.filter(s => ['qc', 'analyzing', 'review-request'].includes(s.status)).slice(0, 8);
  const agentDefs = [['IN', 'Intake Agent', 'custody + intake checks'], ['ID', 'Identity Agent', 'set/year/variant match'], ['AU', 'Authentication', 'alteration + counterfeit flags'], ['CV', 'Condition Vision', 'centering/corners/edges/surface'], ['QA', 'Quality Gate', 'evidence agreement + policy']];
  const zone = document.querySelector('#cmdZone') || V;
  zone.innerHTML = page('Command Center', `${list.length} in system • ${humanReview} need human judgment`,
    `<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">
      <div class="tile"><h3>Received today</h3><strong style="font-size:24px;color:var(--teal)">${recvToday}</strong></div>
      <div class="tile"><h3>Human review</h3><strong style="font-size:24px;color:var(--gold)">${humanReview}</strong></div>
      <div class="tile"><h3>Certified today</h3><strong style="font-size:24px;color:var(--green)">${certToday}</strong></div>
      <div class="tile"><h3>Median turnaround</h3><strong style="font-size:24px;color:var(--teal)">${medianTurn}${medianTurn !== '—' ? 'd' : ''}</strong></div>
      <div class="tile"><h3>Registry</h3><strong style="font-size:13px;color:var(--green)">${auditFeed.length} events sealed</strong></div>
    </div>
    <div class="panel" style="margin-top:14px"><h3>PRIORITY QUEUE — NEEDS A DECISION</h3>
      ${queue.length ? queue.map(s => `<div class="scanrow" data-open="submissions" style="cursor:pointer">
        <span class="tick">${s.status === 'qc' ? '!' : '◌'}</span>
        <span><b>${esc(s.item?.name || 'Item')}</b> <small>${s.id} • ${s.status}${s.evaluation ? ' • ' + (s.evaluation.internalConditionIndex / 100).toFixed(1) + ' proj.' : ''}</small></span>
        <span style="margin-left:auto" class="badge warn">${s.status}</span></div>`).join('')
        : '<p class="muted" style="font-size:12px">Queue clear — nothing waiting on human judgment.</p>'}
    </div>
    <div class="detailgrid">
      <div class="panel" style="margin-top:14px"><h3>AGENT BENCH — FIVE CHECKS, ONE AUDIT TRAIL</h3>
        ${agentDefs.map(([ab, n, d]) => `<div class="scanrow"><span class="tick">●</span><span><b>${ab} · ${n}</b><small>${d}</small></span><span class="badge" style="margin-left:auto">live</span></div>`).join('')}
        <p class="muted" style="font-size:10px;margin-top:8px">${Array.isArray(agents) ? agents.length : 8} agents registered on the bus • Money Penny supervises</p>
      </div>
      <div class="panel" style="margin-top:14px"><h3>LAB PIPELINE</h3>
        ${funnel.map(([n, st]) => { const c = list.filter(s => s.status === st).length;
          return `<div class="scanrow"><span class="tick">▣</span><span><b>${n}</b></span><span style="margin-left:auto"><b style="color:var(--teal)">${c}</b></span></div>`; }).join('')}
      </div>
    </div>`);
  zone.querySelectorAll('[data-open]').forEach(t => t.onclick = () => show(t.dataset.open));
}

/* ── Vault — vaulted + certified collection ───────────────────────────── */
async function vault() {
  const list = await subs();
  const vaulted = list.filter(s => s.vaulted);
  const certified = list.filter(s => s.status === 'certified');
  const inReview = list.filter(s => !s.vaulted && s.status !== 'certified' && s.status !== 'returned');
  const tile = s => `<div class="tile" style="cursor:pointer" data-open="${s.id}">
    <b>${s.id}</b> ${s.demo ? '<span class="badge warn">DEMO</span>' : ''}
    <p>${esc(s.item?.name || 'untitled')}</p>
    <p class="muted">${s.status}${s.certificate ? ' • grade ' + s.certificate.publicGrade : ''}</p></div>`;
  V.innerHTML = page('GemCore Vault', 'Your collection — vaulted, certified, in review',
    `<h3 style="margin-top:14px">VAULTED</h3><div class="grid">${vaulted.map(tile).join('') || '<div class="tile"><p class="muted">Empty — use Add to Vault on any submission.</p></div>'}</div>
    <h3 style="margin-top:14px">CERTIFIED</h3><div class="grid">${certified.map(tile).join('') || '<div class="tile"><p class="muted">No certified items yet.</p></div>'}</div>
    <h3 style="margin-top:14px">IN REVIEW</h3><div class="grid">${inReview.map(tile).join('') || '<div class="tile"><p class="muted">Nothing in pipeline.</p></div>'}</div>
    <div id="detail"></div>`);
  document.querySelectorAll('[data-open]').forEach(t => t.onclick = async () => {
    currentSub = t.dataset.open; localStorage.setItem('gemcore.sub', currentSub);
    const p = await api(`/submissions/${t.dataset.open}/passport`);
    document.querySelector('#detail').innerHTML = `<pre>${esc(JSON.stringify(p, null, 2))}</pre>`;
  });
}

/* ── Market — population-derived stats + clearly-demo comparables ─────── */
async function market() {
  const p = await api('/population');
  const list = await subs();
  const certs = list.filter(s => s.status === 'certified');
  V.innerHTML = page('Market Intelligence', 'Market value is displayed separately and never changes condition grade',
    `<div class="grid">
      <div class="tile"><h3>Certified population</h3><strong style="font-size:26px;color:var(--green)">${p.certified}</strong><p class="muted">real data</p></div>
      <div class="tile"><h3>In pipeline</h3><strong style="font-size:26px;color:var(--teal)">${p.inPipeline}</strong><p class="muted">real data</p></div>
      <div class="tile"><h3>Top grade seen</h3><strong style="font-size:26px">${Object.keys(p.byGrade).sort((a,b)=>b-a)[0] || '—'}</strong><p class="muted">real data</p></div>
    </div>
    <div class="panel" style="margin-top:14px"><h3>CERTIFIED MARKET (real)</h3>
      ${certs.map(s => `<div class="scanrow"><span class="tick">✓</span><span>${esc(s.item?.name)} <small>grade ${s.certificate.publicGrade} • cert ${s.certificate.certId}</small></span></div>`).join('') || '<p class="muted">No certified items yet.</p>'}
    </div>
    <div class="panel" style="margin-top:14px"><h3>COMPARABLE SALES — DEMO DATA</h3>
      <p class="muted" style="font-size:11px">Illustrative only — a real market feed is not wired. NEVER affects grading.</p>
      <div id="cmpHost"></div></div>`);
  const demos = [
    ['Charizard 1st Ed — PSA 10', '$412.50', '+12.4%'],
    ['BGS 9.5 same card', '$389.00', '+8.1%'],
    ['CGC 9.5 same card', '$371.25', '+6.7%'],
    ['Raw NM comp', '$96.00', '-2.0%'],
  ];
  document.querySelector('#cmpHost').innerHTML = demos.map(d =>
    `<div class="scanrow"><span class="tick">↗</span><span>${d[0]}<small>${d[2]}</small></span><b style="margin-left:auto">${d[1]}</b></div>`).join('');
}

/* ── Live feed — real audit events, auto-refresh ──────────────────────── */
async function live() {
  const events = await api('/audit?limit=60').catch(() => []);
  V.innerHTML = page('Live Grading', 'Every lab event — real audit trail, auto-refreshing',
    `<div class="panel"><h3>EVENT FEED <button id="refLive" style="margin-left:10px;font-size:11px;padding:4px 10px">↻ refresh</button></h3>
      <div id="feed">${events.length ? events.map(e =>
        `<div class="scanrow"><span class="tick">◆</span><span><b>${esc(e.action)}</b> <small>${e.submissionId?.slice(0, 14)}… • ${new Date(e.at).toLocaleTimeString()}</small></span></div>`).join('')
        : '<p class="muted">No events yet — run a scan or create a submission.</p>'}</div></div>`);
  document.querySelector('#refLive').onclick = () => show('live');
  clearInterval(window._liveTimer);
  window._liveTimer = setInterval(() => { if (document.querySelector('#feed')) show('live'); else clearInterval(window._liveTimer); }, 15000);
}

/* ── QC queue — real pending reviews + approvals ──────────────────────── */
async function qc() {
  const list = await subs();
  const needsQc = list.filter(s => s.evaluation && !s.qc?.approved && s.status !== 'certified');
  const pendingObs = list.filter(s => (s.observations || []).some(o => o.reviewerDisposition === 'pending'));
  V.innerHTML = page('Human QC', 'A certified grade cannot be sealed without verified evidence and reviewer approval',
    `<div class="panel" style="margin-top:12px"><h3>REVIEW QUEUE (${needsQc.length})</h3>
      ${needsQc.map(s => `<div class="scanrow"><span class="tick">◌</span><span>${s.id} — ${esc(s.item?.name)} <small>index ${s.evaluation.internalConditionIndex}/1000 • obs ${(s.observations||[]).length}</small></span>
        <span style="margin-left:auto;display:flex;gap:6px"><button class="primary" data-ok="${s.id}" style="padding:4px 10px;font-size:11px">Approve</button><button data-no="${s.id}" style="padding:4px 10px;font-size:11px">Reject</button></span></div>`).join('')
        || '<p class="muted">Queue empty.</p>'}
    </div>
    <div class="panel" style="margin-top:14px"><h3>PENDING OBSERVATIONS (${pendingObs.length})</h3>
      ${pendingObs.map(s => `<div class="scanrow"><span class="tick">!</span><span>${s.id} <small>${(s.observations||[]).filter(o=>o.reviewerDisposition==='pending').length} unreviewed</small></span></div>`).join('')
        || '<p class="muted">All observations reviewed.</p>'}</div>
    <pre id="qcout"></pre>`);
  const out = document.querySelector('#qcout');
  document.querySelectorAll('[data-ok]').forEach(b => b.onclick = async () => {
    out.textContent = JSON.stringify(await api(`/submissions/${b.dataset.ok}/qc`, { b: { approved: true, reviewer: whoAmI() } }), null, 2); show('qc');
  });
  document.querySelectorAll('[data-no]').forEach(b => b.onclick = async () => {
    out.textContent = JSON.stringify(await api(`/submissions/${b.dataset.no}/qc`, { b: { approved: false, reviewer: whoAmI() } }), null, 2); show('qc');
  });
}

/* ── Tools — working calculators ──────────────────────────────────────── */
async function tools() {
  const list = await subs();
  const evald = list.filter(s => s.evaluation);
  V.innerHTML = page('Tools & Calculators', 'Real math — value is demo-marked and never affects grade',
    `<div class="detailgrid">
      <div class="panel"><h3>GRADE → DEMO VALUE</h3>
        <label>Grade (1–10)<input type="number" id="tGrade" step="0.5" min="1" max="10" value="9"></label>
        <label>Raw item value $<input type="number" id="tRaw" value="50"></label>
        <button class="primary" id="tCalc" style="margin-top:10px">Estimate</button>
        <pre id="tOut"></pre></div>
      <div class="panel"><h3>ROI CALCULATOR</h3>
        <label>Cost (item + fees) $<input type="number" id="tCost" value="80"></label>
        <label>Expected sale $<input type="number" id="tSale" value="400"></label>
        <button class="primary" id="tRoi" style="margin-top:10px">Compute ROI</button>
        <pre id="tRoiOut"></pre></div>
    </div>
    <div class="panel" style="margin-top:14px"><h3>COMPARE SUBMISSIONS</h3>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <select id="tA">${evald.map(s => `<option value="${s.id}">${s.id} — ${esc(s.item?.name)}</option>`).join('')}</select>
        <select id="tB">${evald.map(s => `<option value="${s.id}">${s.id} — ${esc(s.item?.name)}</option>`).join('')}</select>
        <button class="primary" id="tCmp">Compare</button>
      </div><pre id="tCmpOut"></pre></div>`);
  const q = sel => document.querySelector(sel);
  q('#tCalc').onclick = () => {
    const g = +q('#tGrade').value, raw = +q('#tRaw').value;
    const mult = Math.pow(g / 5, 2.2); // demo curve — higher grades multiply value
    q('#tOut').textContent = `Grade ${g} demo estimate: $${(raw * mult).toFixed(2)}\n(DEMO curve — real comps feed not wired. Never affects grade.)`;
  };
  q('#tRoi').onclick = () => {
    const c = +q('#tCost').value, s = +q('#tSale').value;
    const roi = c ? ((s - c) / c * 100) : 0;
    q('#tRoiOut').textContent = `Profit: $${(s - c).toFixed(2)}\nROI: ${roi.toFixed(1)}%`;
  };
  q('#tCmp').onclick = () => {
    const a = evald.find(x => x.id === q('#tA').value), b = evald.find(x => x.id === q('#tB').value);
    if (!a || !b) return;
    const rows = Object.keys(a.evaluation.lanes).map(l =>
      `  ${l.padEnd(14)} ${String(a.evaluation.lanes[l] ?? '—').padStart(4)}  vs  ${b.evaluation.lanes[l] ?? '—'}`).join('\n');
    q('#tCmpOut').textContent = `${a.id} vs ${b.id}\n${rows}\nIndex: ${a.evaluation.internalConditionIndex} vs ${b.evaluation.internalConditionIndex}`;
  };
}

/* ── Photo Lab — evidence viewer + defect pinning + adjustments ───────── */
async function photoLab() {
  const list = await subs();
  const s = list.find(x => x.id === currentSub) || list[0];
  const caps = s ? (s.captures || []).filter(c => c.storedData) : [];
  V.innerHTML = page('Photo Lab', 'Inspect evidence, pin defects, adjust — everything writes to the chain',
    `${subPicker(list)}
    <div class="detailgrid" style="margin-top:12px">
      <div class="panel"><h3>EVIDENCE ${caps.length ? `(${caps.length} stored)` : ''}</h3>
        ${caps.map(c => `<div class="scanrow" data-cap="${c.id}" style="cursor:pointer"><span class="tick">▣</span><span>${c.id.slice(0, 10)}… <small>${c.side}/${c.mode} • sha ${c.sha256.slice(0, 8)}…</small></span></div>`).join('') || '<p class="muted">No stored captures — use intake camera or upload.</p>'}
      </div>
      <div class="panel"><h3>INSPECTOR <span class="muted" style="font-size:10px">— click image to pin a defect</span></h3>
        <div style="position:relative"><canvas id="phView" style="width:100%;border-radius:8px;border:1px solid var(--line);cursor:crosshair"></canvas></div>
        <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap" id="phFilters">
          ${['visible', 'R', 'G', 'B', 'xray', 'edge', 'heat', 'relief'].map(f =>
            `<button data-phf="${f}" class="${f === 'visible' ? 'primary' : ''}" style="font-size:10px;padding:5px 10px">${f.toUpperCase()}</button>`).join('')}
        </div>
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;align-items:center">
          <label style="margin:0;font-size:11px">Brightness <input type="range" id="phBright" min="50" max="200" value="100" style="width:90px"></label>
          <label style="margin:0;font-size:11px">Contrast <input type="range" id="phCon" min="50" max="200" value="100" style="width:90px"></label>
          <select id="phLane">${['surface','edges','corners','centering','authenticity'].map(l => `<option>${l}</option>`).join('')}</select>
        </div>
        <p class="muted" id="phFNote" style="font-size:10px;margin-top:4px"></p>
        <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;align-items:center">
          <button id="phFp" style="font-size:10px;padding:5px 10px">⬡ Fingerprint Card</button>
          <label style="margin:0"><input type="file" id="phRescan" accept="image/*" style="display:none"><span class="uploadbtn" style="font-size:10px;padding:5px 10px">↺ Re-scan Compare</span></label>
          <span id="phFpOut" class="muted" style="font-size:10px"></span>
        </div>
        <div id="phPins"></div>
      </div>
    </div>`);
  const q = sel => document.querySelector(sel);
  q('#subpick').onchange = e => { currentSub = e.target.value; localStorage.setItem('gemcore.sub', currentSub); photoLab(); };
  const cv = q('#phView'), ctx = cv.getContext('2d');
  const img = new Image();
  let cap = null;
  let phFilter = 'visible';
  const PH_NOTES = {
    visible: '', R: 'R channel — red-layer print dots; ink alterations show here first',
    G: 'G channel — cleanest signal for surface scratches',
    B: 'B channel — bleaching/whitening pops against stock',
    xray: 'X-RAY VIEW — inverted luminance + hard contrast: exposes inserts, double-stock, density changes',
    edge: 'EDGE MAP — luminance deltas: cut quality, re-trimming, surface texture breaks',
    heat: 'FALSE-COLOR luminance — pressure/damage zones read as hot/cold fields',
    relief: 'SURFACE RELIEF — photometric delta between captures: embosses scratches, dents, print topography',
  };
  const draw = () => {
    if (!cap) return;
    cv.width = img.width; cv.height = img.height;
    ctx.filter = `brightness(${+q('#phBright').value / 100}) contrast(${+q('#phCon').value / 100})`;
    ctx.drawImage(img, 0, 0);
    if (phFilter !== 'visible') {
      const d = ctx.getImageData(0, 0, cv.width, cv.height), p = d.data;
      if (phFilter === 'R' || phFilter === 'G' || phFilter === 'B') {
        const ch = { R: 0, G: 1, B: 2 }[phFilter];
        for (let i = 0; i < p.length; i += 4) p[i] = p[i + 1] = p[i + 2] = p[i + ch];
      } else if (phFilter === 'xray') {
        for (let i = 0; i < p.length; i += 4) {
          let l = 255 - (p[i] * .3 + p[i + 1] * .59 + p[i + 2] * .11);
          l = l < 110 ? 0 : l > 200 ? 255 : ((l - 110) / 90) * 255;
          p[i] = p[i + 1] = p[i + 2] = l;
        }
      } else if (phFilter === 'edge') {
        const w = cv.width, lum = new Float32Array(p.length / 4);
        for (let i = 0, j = 0; i < p.length; i += 4, j++) lum[j] = p[i] * .3 + p[i + 1] * .59 + p[i + 2] * .11;
        for (let j = w; j < lum.length - w; j++) {
          const e = Math.abs(lum[j] - lum[j - 1]) + Math.abs(lum[j] - lum[j - w]);
          const v = Math.min(255, e * 3); const i = j * 4;
          p[i] = p[i + 1] = p[i + 2] = v;
        }
      } else if (phFilter === 'relief') {
        // photometric delta vs a paired capture — embosses surface topography
        const pair = caps.find(c => c.id !== cap.id && c.side === cap.side) || caps.find(c => c.id !== cap.id);
        if (pair && window._reliefLum) {
          const lum2 = window._reliefLum, w = cv.width;
          for (let i = 0, j = 0; i < p.length; i += 4, j++) {
            const l = p[i] * .3 + p[i + 1] * .59 + p[i + 2] * .11;
            const dlt = Math.min(255, Math.max(0, 128 + (l - lum2[j]) * 4));
            p[i] = p[i + 1] = p[i + 2] = dlt;
          }
        }
      } else if (phFilter === 'heat') {
        for (let i = 0; i < p.length; i += 4) {
          const l = (p[i] * .3 + p[i + 1] * .59 + p[i + 2] * .11) / 255;
          p[i] = Math.min(255, l * 510); p[i + 1] = l > .25 && l < .75 ? 255 * (1 - Math.abs(l - .5) * 2) : 0; p[i + 2] = Math.min(255, (1 - l) * 510);
        }
      }
      ctx.putImageData(d, 0, 0);
    }
    // defect pins at real coords
    (s?.observations || []).filter(o => o.evidenceId === cap.id && o.x != null).forEach(o => {
      ctx.filter = 'none';
      ctx.beginPath(); ctx.arc(o.x * cv.width, o.y * cv.height, 9, 0, 7);
      ctx.strokeStyle = '#25f3e6'; ctx.lineWidth = 2; ctx.stroke();
    });
  };
  const loadCap = c => { cap = c; img.onload = draw; img.src = c.storedData; drawPins(); };
  const drawPins = () => {
    q('#phPins').innerHTML = (s?.observations || []).filter(o => o.evidenceId === cap?.id).map(o =>
      `<div class="scanrow"><span class="tick">${o.reviewerDisposition === 'confirmed' ? '✓' : o.reviewerDisposition === 'rejected' ? '✗' : '◌'}</span><span>${esc(o.note || o.type)} <small>@ ${(o.x * 100).toFixed(0)}%,${(o.y * 100).toFixed(0)}% • ${o.reviewerDisposition}</small></span></div>`).join('') || '<p class="muted" style="font-size:11px;margin-top:8px">No pins on this evidence yet.</p>';
  };
  document.querySelectorAll('[data-cap]').forEach(el => el.onclick = () => loadCap(caps.find(c => c.id === el.dataset.cap)));
  if (caps.length) loadCap(caps[caps.length - 1]);
  q('#phBright').oninput = q('#phCon').oninput = draw;
  document.querySelectorAll('[data-phf]').forEach(b => b.onclick = () => {
    phFilter = b.dataset.phf; q('#phFNote').textContent = PH_NOTES[phFilter] || '';
    document.querySelectorAll('[data-phf]').forEach(x => x.classList.toggle('primary', x === b));
    if (phFilter === 'relief' && cap) {
      const pair = caps.find(c => c.id !== cap.id && c.side === cap.side) || caps.find(c => c.id !== cap.id);
      if (!pair) { q('#phFNote').textContent = 'RELIEF needs a second capture (raking pair works best)'; return; }
      const img2 = new Image();
      img2.onload = () => {
        const c2 = document.createElement('canvas'); c2.width = cv.width; c2.height = cv.height;
        c2.getContext('2d').drawImage(img2, 0, 0, cv.width, cv.height);
        const d2 = c2.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
        window._reliefLum = new Float32Array(d2.length / 4);
        for (let i = 0, j = 0; i < d2.length; i += 4, j++) window._reliefLum[j] = d2[i] * .3 + d2[i + 1] * .59 + d2[i + 2] * .11;
        draw();
      };
      img2.src = pair.storedData;
      return;
    }
    draw();
  });
  // 64-bit perceptual fingerprint — seals the physical card to the cert
  const fpHash = imgEl => {
    const c = document.createElement('canvas'); c.width = 8; c.height = 8;
    c.getContext('2d').drawImage(imgEl, 0, 0, 8, 8);
    const d = c.getContext('2d').getImageData(0, 0, 8, 8).data;
    const lum = []; for (let i = 0; i < 256; i += 4) lum.push(d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11);
    const mean = lum.reduce((a, b) => a + b) / 64;
    let bits = 0n; lum.forEach(l => { bits = (bits << 1n) | (l > mean ? 1n : 0n); });
    return bits.toString(16).padStart(16, '0');
  };
  q('#phFp').onclick = async () => {
    if (!cap || !s) return;
    const hash = fpHash(img);
    const res = await api(`/submissions/${s.id}/fingerprint`, { b: { hash } });
    q('#phFpOut').textContent = res.ok ? `fingerprint sealed: ${hash}` : (res.error || 'failed');
  };
  q('#phRescan').onchange = async e => {
    const f = e.target.files[0]; if (!f || !s) return;
    const data = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(f); });
    const im2 = new Image();
    im2.onload = async () => {
      const res = await fetch(`/api/verify/${s.id}/fp/${fpHash(im2)}`).then(r => r.json());
      q('#phFpOut').textContent = res.verdict ? `re-scan: ${res.verdict} (distance ${res.distance}/64)` : (res.error || 'no fingerprint on file — fingerprint the card first');
    };
    im2.src = data;
    e.target.value = '';
  };
  cv.onclick = async e => {
    if (!cap || !s) return;
    const rect = cv.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width, y = (e.clientY - rect.top) / rect.height;
    const note = prompt('Defect note (e.g. "corner whiten", "surface scratch"):', 'surface anomaly');
    if (note === null) return;
    await api(`/submissions/${s.id}/observations`, { b: { evidenceId: cap.id, lane: q('#phLane').value, note, severity: 0.5, confidence: 0.9, source: 'human-photo-lab', x, y } });
    const fresh = await api('/submissions/' + s.id); Object.assign(s, fresh); draw(); drawPins();
  };
}

/* ── Community ────────────────────────────────────────────────────────── */
async function community() {
  const certs = (await subs()).filter(s => s.status === 'certified');
  V.innerHTML = page('Community', 'Collectors, chat & GOAT Force ATL',
    `<div class="grid">
      <div class="tile"><h3>◆ GOAT Force ATL — BrickSquaD-RP</h3><p class="muted">Our FiveM roleplay city — Money Penny is in-game too (/mp)</p>
        <a href="https://cfx.re/join/3ygz8lo" target="_blank" class="primary" style="display:inline-block;margin-top:8px;padding:8px 16px;border-radius:8px;text-decoration:none">Join Server</a>
        <a href="https://txadmin.2.25.68.216.nip.io/" target="_blank" class="muted" style="display:inline-block;margin:8px 0 0 10px;font-size:11px">txAdmin →</a></div>
      <div class="tile"><h3>◆ Talk to Money Penny</h3><p class="muted">She runs the lab — and she's in the RP server</p>
        <button class="primary" id="goMp" style="margin-top:8px;padding:8px 16px">Open Lab Chat</button></div>
      <div class="tile"><h3>Showcase</h3><p class="muted">${certs.length} certified item(s) in the registry</p>
        ${certs.map(s => `<p style="font-size:12px">${esc(s.item?.name)} — grade ${s.certificate.publicGrade}</p>`).join('') || '<p class="muted" style="font-size:11px">Certify an item to showcase it.</p>'}</div>
    </div>`);
  document.querySelector('#goMp').onclick = () => show('grade');
}

/* ── Grading scale — public rubric, the standard is higher ────────────── */
function gradingScale() {
  const SCALE = [
    [10, 'GEM MINT', 'Virtually perfect. 950+ index. All lanes ≥ 920.', '#3ef08c'],
    [9.5, 'PRISTINE', 'Exceptional. 920+ index. Microscopic flaws only.', '#3ef08c'],
    [9, 'MINT', 'Near perfect. 870+ index. Minor print-line tolerable.', '#25f3e6'],
    [8.5, 'NM-MINT+', 'Very minor wear on 1 lane.', '#25f3e6'],
    [8, 'NM-MINT', 'Light wear, no structural flaws.', '#25f3e6'],
    [7, 'NEAR MINT', 'Visible corner/edge wear, clean surface.', '#d9b96a'],
    [6, 'EX-NM', 'Moderate wear, possible surface marks.', '#d9b96a'],
    [5, 'EXCELLENT', 'Noticeable wear, mild creasing possible.', '#d9b96a'],
    [4, 'VG-EX', 'Visible handling, edge whitening.', '#ff9d5d'],
    [3, 'VERY GOOD', 'Rounded corners, surface wear.', '#ff9d5d'],
    [2, 'GOOD', 'Heavy wear, creases, whitening.', '#ff5d73'],
    [1, 'POOR', 'Severe damage. Certified for authenticity only.', '#ff5d73'],
  ];
  V.innerHTML = page('The GemCore Scale', 'A 1000-point internal index translated to 1–10 — every point traceable to evidence',
    `<div class="panel"><h3>HOW THE MATH WORKS</h3>
      <p style="font-size:13px;line-height:1.8">Every lane is scored <b>0–1000</b> from sealed evidence — not opinion.
      <b>Final index = 60% weakest lane + 40% mean</b> — one bad corner can't hide behind three good ones.
      Authenticity is a separate gate: <b>a fake never gets a grade.</b> Rubric <b>gemcore-rubric-0.1.0</b>.</p></div>
    <div class="panel" style="margin-top:14px"><h3>THE SCALE</h3>
      ${SCALE.map(([g, n, d, c]) => `<div class="scanrow"><span class="tick" style="color:${c}">◆</span>
        <span><b>${g} — ${n}</b><small>${d}</small></span></div>`).join('')}</div>
    <div class="panel" style="margin-top:14px"><h3>THE LANES</h3>
      ${[['Centering', 'border ratios measured in pixels, both sides'],
        ['Corners', 'whitening/fuzz detection per corner, both sides'],
        ['Edges', 'edge integrity — chipping, rough cuts, whitening'],
        ['Surface', 'defect cell analysis — scratches, print lines, stains'],
        ['Dimensions', 'physical measurements vs spec tolerance'],
        ['Authenticity', 'print pattern + stock + UV/IR — gate, not a score']].map(([n, d]) =>
        `<div class="scanrow"><span class="tick">▣</span><span><b>${n}</b><small>${d}</small></span></div>`).join('')}</div>`);
}

/* ── Process — step-by-step visual pipeline for clients ───────────────── */
function process() {
  const steps = [
    ['◉', 'REQUEST', 'You submit your item for review. We screen it — worth grading or not, honestly.', 'public'],
    ['▤', 'INTAKE', 'Accepted → quote + private login. Item logged, intake photos sealed.', 'staff'],
    ['▣', 'CAPTURE', 'Visible + raking + macro + UV/IR imaging. Every frame sha256-sealed, immutable.', 'evidence'],
    ['⬡', 'VISIONCORE', 'Money Penny\'s CV engine measures centering, corners, edges, surface — real pixels, real coordinates.', 'ai'],
    ['✓', 'HUMAN QC', 'A reviewer confirms every observation and the final call. AI proposes — humans certify.', 'human'],
    ['◆', 'SEAL', 'Cert issued: 1000-pt index → 1–10 grade, QR + chronology + rank recorded.', 'cert'],
    ['▧', 'SLAB', 'Label print → encapsulate → ultrasonic weld → verify → ship. Tracked in production.', 'production'],
  ];
  V.innerHTML = page('How We Grade', 'Every step, every technology — nothing hidden',
    `<div class="panel" style="margin-top:12px">
      ${steps.map(([ic, t, d], i) => `
        <div style="display:flex;gap:14px;padding:12px 0;border-bottom:1px solid var(--line)">
          <div style="font-size:22px;color:var(--teal);min-width:36px;text-align:center">${ic}</div>
          <div><b>STEP ${i + 1} — ${t}</b><p class="muted" style="font-size:12px;margin:4px 0 0">${d}</p></div>
        </div>`).join('')}
    </div>
    <div class="panel" style="margin-top:14px"><h3>WHAT NOBODY ELSE DOES</h3>
      <p style="font-size:13px;line-height:1.8">An AI you can actually talk to — Money Penny runs this lab and answers questions about YOUR cert.
      Every defect pinned to pixel coordinates on sealed evidence. Every reviewer decision logged.
      Rank + chronology free on every certificate. The slab QR opens the whole record.</p></div>`);
}

/* ── Value estimator — market + scarcity, transparent formula ─────────── */
async function valueEstimator() {
  const pop = await api('/population').catch(() => ({ byGrade: {}, leaderboard: [] }));
  const items = [...new Set((pop.leaderboard || []).map(l => l.item).filter(Boolean))];
  V.innerHTML = page('Value Estimator', 'Transparent math — market price × grade curve × scarcity. Never affects grading.',
    `<div class="detailgrid">
      <div class="panel"><h3>ESTIMATE</h3>
        <label>Current raw market value $<input type="number" id="vRaw" value="50" min="0"></label>
        <label>Expected GemCore grade<input type="number" id="vGrade" step="0.5" min="1" max="10" value="9"></label>
        <label>Same-item certified population<input type="number" id="vPop" value="${items.length ? '1' : '0'}" min="0"></label>
        <label>Market trend<select id="vTrend"><option value="1.1">Bullish ↗</option><option value="1" selected>Flat →</option><option value="0.9">Bearish ↘</option></select></label>
        <button class="primary" id="vGo" style="margin-top:10px">Estimate Value</button><pre id="vOut"></pre></div>
      <div class="panel"><h3>THE FORMULA (public)</h3>
        <p style="font-size:12px;line-height:1.9">value = raw × gradeCurve × scarcity × trend<br><br>
        gradeCurve = (grade/5)^2.2 — exponential; a 10 is worth far more than 2× a 9<br>
        scarcity = 1 + 0.15 × (1 / (1+pop)) — fewer graded = more valuable<br>
        trend = market direction multiplier<br><br>
        <span class="muted" style="font-size:10px">Estimate only — real comps feed not wired. Value NEVER changes the grade.</span></p></div>
    </div>`);
  const q = sel => document.querySelector(sel);
  q('#vGo').onclick = () => {
    const raw = +q('#vRaw').value, g = Math.min(10, Math.max(1, +q('#vGrade').value));
    const pop = +q('#vPop').value, trend = +q('#vTrend').value;
    const curve = Math.pow(g / 5, 2.2), scarcity = 1 + 0.15 / (1 + pop);
    const v = raw * curve * scarcity * trend;
    q('#vOut').textContent = `Estimated graded value: $${v.toFixed(2)}\n(${raw} × ${curve.toFixed(2)} curve × ${scarcity.toFixed(3)} scarcity × ${trend} trend)`;
  };
}

/* ── Public landing — submit for review, client login, verify ─────────── */
function publicPage() {
  V.innerHTML = `<div class="page">
    <img src="assets/banner-gcg.svg" style="width:100%;max-width:760px;border-radius:14px;display:block;margin:0 auto 16px" alt="GCG — GemCore Grading">
    <div class="eyebrow">GEMCORE GRADING • BY GOAT</div>
    <h1>The Standard Is Higher</h1>
    <p class="muted">Evidence-first collectible grading. Submit your item for review — if we take the job, you get a private login to watch it move through the lab.</p>
    <div class="detailgrid" style="margin-top:14px">
      <div class="panel"><h3>SUBMIT FOR REVIEW</h3>
        <label>Your name<input id="pubName" placeholder="Collector name"></label>
        <label>Email<input id="pubEmail" type="email" placeholder="you@email.com"></label>
        <label>Item<input id="pubItem" placeholder="e.g. Charizard 1st Edition"></label>
        <label>Set / year<input id="pubSet" placeholder="Pokémon Base Set • 1999"></label>
        <label>Notes<textarea id="pubNotes" rows="2" placeholder="condition notes, provenance…"></textarea></label>
        <button class="primary" id="pubGo" style="margin-top:10px">Request Review</button>
        <pre id="pubOut"></pre>
      </div>
      <div class="panel"><h3>CLIENT LOGIN</h3>
        <p class="muted" style="font-size:11px">Have a job with us? Log in to track it.</p>
        <label>Job ID<input id="clJob" placeholder="GC-XXXXXXXXXX"></label>
        <label>Password<input id="clPass" type="password" placeholder="issued when we accept your job"></label>
        <button class="primary" id="clGo" style="margin-top:10px">View My Job</button>
        <pre id="clOut"></pre>
        <h3 style="margin-top:16px">VERIFY A CERTIFICATE</h3>
        <div style="display:flex;gap:8px"><input id="pubCert" placeholder="GCG-…"><button id="pubVerify" style="font-size:11px">Verify</button></div>
        <pre id="pvOut"></pre>
      </div>
    </div>
    <div class="grid" style="margin-top:14px">
      <div class="tile" style="cursor:pointer" data-go="scale"><h3>◆ The GemCore Scale</h3><p class="muted">1000-pt index → 1–10, public rubric</p></div>
      <div class="tile" style="cursor:pointer" data-go="process"><h3>⬡ How We Grade</h3><p class="muted">Every step, every technology</p></div>
      <div class="tile" style="cursor:pointer" data-go="value"><h3>↗ Value Estimator</h3><p class="muted">Market × grade × scarcity — transparent</p></div>
    </div>
    <p class="muted" style="font-size:10px;margin-top:16px">Staff? <a href="#" id="staffIn" style="color:var(--teal)">Enter staff key →</a></p>
  </div>`;
  const q = sel => document.querySelector(sel);
  q('#pubGo').onclick = async () => {
    const res = await fetch('/api/public/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contact: { name: q('#pubName').value, email: q('#pubEmail').value }, item: { name: q('#pubItem').value, set: q('#pubSet').value }, notes: q('#pubNotes').value }) }).then(r => r.json());
    q('#pubOut').textContent = res.trackingId ? 'Received. Tracking ID: ' + res.trackingId + '\nWe review every request — if we take it, you get a quote + login.' : 'Error: ' + res.error;
  };
  q('#clGo').onclick = async () => {
    const res = await fetch('/api/public/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId: q('#clJob').value, password: q('#clPass').value }) }).then(r => r.json());
    if (res.token) { localStorage.setItem('gemcore.client', res.token); show('portal'); }
    else q('#clOut').textContent = res.error || 'login failed';
  };
  q('#pubVerify').onclick = async () => {
    const res = await fetch('/api/verify/' + encodeURIComponent(q('#pubCert').value.trim())).then(r => r.json());
    q('#pvOut').textContent = JSON.stringify(res, null, 2);
  };
  q('#staffIn').onclick = e => {
    e.preventDefault();
    const k = prompt('Staff key:');
    if (k) { localStorage.setItem('gemcore.staff', k.trim()); localStorage.removeItem('gemcore.staffless'); show('command'); }
  };
  document.querySelectorAll('[data-go]').forEach(t => t.onclick = () => show(t.dataset.go));
}

/* ── Client portal — their job ONLY ───────────────────────────────────── */
async function portal() {
  const tok = localStorage.getItem('gemcore.client');
  if (!tok) return show('public');
  const j = await fetch('/api/public/job', { headers: { authorization: 'Bearer ' + tok } }).then(r => r.json());
  if (j.error) { localStorage.removeItem('gemcore.client'); return show('public'); }
  const steps = ['review-request', 'intake', 'capturing', 'analyzing', 'qc', 'certified', 'production'];
  const idx = steps.indexOf(j.status);
  V.innerHTML = `<div class="page">
    <div class="eyebrow">GEMCORE • CLIENT PORTAL</div><h1>${esc(j.item?.name || 'Your Job')}</h1>
    <p class="muted">Job ${esc(j.jobId)}${j.item?.set ? ' • ' + esc(j.item.set) : ''}${j.item?.year ? ' • ' + esc(j.item.year) : ''}</p>
    <div class="panel" style="margin-top:14px"><h3>STATUS</h3>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin:10px 0">
        ${steps.map((s, i) => `<span class="badge" style="${i === idx ? 'border-color:var(--green);color:var(--green)' : i < idx ? 'opacity:.6' : 'opacity:.3'}">${s}</span>`).join('')}
      </div>
      ${j.price ? `<p style="font-size:13px">Quoted price: <b>$${j.price}</b></p>` : ''}
      ${j.stage ? `<p style="font-size:13px">Production stage: <b>${j.stage}</b></p>` : ''}
      ${j.grade ? `<p style="font-size:20px;color:var(--teal)">Certified grade: <b>${j.grade}</b> <small class="muted">${esc(j.certId || '')}</small></p>` : ''}
      <p class="muted" style="font-size:11px">${j.captureCount} evidence item(s) on file • updated ${new Date(j.updated).toLocaleString()}</p>
      <button id="clOut2" style="margin-top:8px;font-size:11px">Log out</button>
    </div></div>`;
  document.querySelector('#clOut2').onclick = () => { localStorage.removeItem('gemcore.client'); show('public'); };
}

/* ── Staff: client request queue ──────────────────────────────────────── */
async function requests() {
  const list = await fetch('/api/staff/requests', { headers: { 'x-staff-key': localStorage.getItem('gemcore.staff') || '' } }).then(r => r.json()).catch(() => []);
  V.innerHTML = page('Client Requests', 'Screen submissions — accept with a quote, decline, generate client logins',
    Array.isArray(list) && list.length ? list.map(s => `
      <div class="panel" style="margin-top:12px">
        <b>${s.id}</b> <span class="badge ${s.review?.status === 'accepted' ? '' : 'warn'}">${s.review?.status || 'pending'}</span>
        <p style="font-size:13px;margin:8px 0">${esc(s.item?.name)} ${s.item?.set ? '— ' + esc(s.item.set) : ''}</p>
        <p class="muted" style="font-size:11px">${esc(s.contact?.name || '')} • ${esc(s.contact?.email || '')} • ${new Date(s.createdAt).toLocaleDateString()}</p>
        ${s.review?.status === 'pending' ? `
          <div style="display:flex;gap:8px;align-items:center;margin-top:8px">
            <input id="p-${s.id}" type="number" placeholder="price $" style="width:110px;margin:0">
            <button class="primary" data-acc="${s.id}" style="font-size:11px">Accept + generate login</button>
            <button data-dec="${s.id}" style="font-size:11px">Decline</button>
          </div>` : s.review?.price ? `<p class="muted" style="font-size:11px">Quoted $${s.review.price}</p>` : ''}
      </div>`).join('') : '<div class="panel" style="margin-top:12px"><p class="muted">No external requests.</p></div>');
  const hdrs = { 'Content-Type': 'application/json', 'x-staff-key': localStorage.getItem('gemcore.staff') || '' };
  document.querySelectorAll('[data-acc]').forEach(b => b.onclick = async () => {
    const price = +document.querySelector('#p-' + b.dataset.acc).value || null;
    const res = await fetch('/api/staff/decide', { method: 'POST', headers: hdrs, body: JSON.stringify({ submissionId: b.dataset.acc, accept: true, price }) }).then(r => r.json());
    alert(res.clientPassword ? `Accepted. Client login — Job ID: ${b.dataset.acc}  Password: ${res.clientPassword}\nSend these to the client.` : 'Accepted.');
    show('requests');
  });
  document.querySelectorAll('[data-dec]').forEach(b => b.onclick = async () => {
    await fetch('/api/staff/decide', { method: 'POST', headers: hdrs, body: JSON.stringify({ submissionId: b.dataset.dec, accept: false }) });
    show('requests');
  });
}

const pages = {
  command,
  public: publicPage,
  portal,
  requests,
  scale: gradingScale,
  process,
  value: valueEstimator,
  grade: lab,
  intake,
  submissions,
  passport,
  verify,
  population,
  production,
  vault,
  market,
  live,
  photolab: photoLab,
  studio: caseStudio,
  community,
  tools,
  settings,
  qc,
};

function show(k) {
  // internal pages require staff key; public gets landing/portal/verify only
  if (INTERNAL.includes(k) && !isStaff()) k = 'public';
  const f = pages[k] || pages.command;
  document.querySelectorAll('[data-page]').forEach(b => {
    b.classList.toggle('active', b.dataset.page === k);
    if (INTERNAL.includes(b.dataset.page)) b.style.display = isStaff() ? '' : 'none';
  });
  const r = f();
  if (r && r.then) r.catch(e => { V.innerHTML = page('Error', '', `<pre>${esc(e.message)}</pre>`); });
  nav();
}
applyAccent();
// local/open servers have no staff key → don't lock yourself out
api('/health').then(h => {
  if (h && h.staffRequired === false) localStorage.setItem('gemcore.staffless', '1');
  else if (h && h.staffRequired === true) localStorage.removeItem('gemcore.staffless');
  nav();
});
nav();
// deep links: /#verify-GCG-xxx opens the public cert page prefilled
if (location.hash.startsWith('#verify-')) {
  const cert = decodeURIComponent(location.hash.slice(8));
  const f = pages.verify; V.innerHTML = ''; f();
  document.querySelector('#cert').value = cert;
  document.querySelector('#go').click();
} else {
  show('grade');
}
