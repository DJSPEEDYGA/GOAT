'use strict';
/* GemCore Grading — UI router. Talks to the standalone API; honest states:
   analysis shows "adapter required" until VisionCore models are attached,
   seal stays disabled until QC + evidence gates pass, demo never certifies. */

const V = document.querySelector('#view');
let rot = 0, tilt = 0, drag = false, lastX = 0, lastY = 0;
let currentSub = localStorage.getItem('gemcore.sub') || null;
let evLayerOn = true;

const api = async (p, opts) => {
  const r = await fetch('/api' + p, opts && {
    method: opts.m || 'POST',
    headers: { 'Content-Type': 'application/json', ...(opts.h || {}) },
    body: opts.b ? JSON.stringify(opts.b) : undefined,
  });
  return r.json();
};

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const nav = () => document.querySelectorAll('[data-page]').forEach(b => b.onclick = () => show(b.dataset.page));

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
          <div class="ahead"><img src="assets/mock-jarvis.png" alt="Money Penny" style="border-radius:10px"><div><b>MONEY PENNY</b><br><span class="online" id="mpStatus">● checking…</span></div></div>
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
        </div><pre id="dout"></pre>
      </div>
    </div>`;
  const q = sel => document.querySelector(sel);
  const dout = x => q('#dout').textContent = typeof x === 'string' ? x : JSON.stringify(x, null, 2);
  q('#eval').onclick = async () => dout(await api(`/submissions/${id}/grade`));
  q('#qcok').onclick = async () => dout(await api(`/submissions/${id}/qc`, { b: { approved: true, reviewer: 'Human QC' } }));
  q('#qcno').onclick = async () => dout(await api(`/submissions/${id}/qc`, { b: { approved: false, reviewer: 'Human QC' } }));
  q('#seal2').onclick = async () => dout(await api(`/submissions/${id}/seal`));
  q('#auditBtn').onclick = async () => dout(await api(`/submissions/${id}/audit`));
  document.querySelectorAll('.obsrow').forEach(o => o.onclick = () => {
    const obs = s.observations.find(x => x.id === o.dataset.obs);
    const cap = (s.captures || []).find(c => c.id === obs.evidenceId);
    dout({ observation: obs, evidence: cap || 'missing', chain: 'grade → defect → capture → confidence → reviewer decision' });
  });
  document.querySelectorAll('[data-okobs]').forEach(b => b.onclick = async e => {
    e.stopPropagation();
    dout(await api(`/submissions/${id}/observations/${b.dataset.okobs}/review`, { b: { decision: 'confirmed', reviewer: 'Human QC' } }));
    detail(id);
  });
  document.querySelectorAll('[data-noobs]').forEach(b => b.onclick = async e => {
    e.stopPropagation();
    dout(await api(`/submissions/${id}/observations/${b.dataset.noobs}/review`, { b: { decision: 'rejected', reviewer: 'Human QC' } }));
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

async function verify() {
  V.innerHTML = page('Verify a Certificate', 'Public verification — privacy-safe',
    `<div class="tile form" style="max-width:460px">
      <label>Certificate ID<input id="cert" placeholder="GCG-…"></label>
      <button class="primary" id="go" style="margin-top:14px">Verify</button><pre id="vout"></pre></div>`);
  document.querySelector('#go').onclick = async () => {
    const r = await api('/verify/' + encodeURIComponent(document.querySelector('#cert').value.trim()));
    document.querySelector('#vout').textContent = JSON.stringify(r, null, 2);
  };
}

async function population() {
  const p = await api('/population');
  V.innerHTML = page('Population Report', 'Population by grade — real certified data only',
    `<div class="grid"><div class="tile"><h3>Total submissions</h3><strong style="font-size:28px;color:var(--teal)">${p.total}</strong></div>
    <div class="tile"><h3>Certified</h3><strong style="font-size:28px;color:var(--green)">${p.certified}</strong></div>
    <div class="tile"><h3>In pipeline</h3><strong style="font-size:28px">${p.inPipeline}</strong></div></div>
    <div class="panel" style="margin-top:14px"><h3>BY GRADE</h3>
    <table><tr><th>Grade</th><th>Count</th></tr>${Object.entries(p.byGrade).map(([g, c]) => `<tr><td>${g}</td><td>${c}</td></tr>`).join('') || '<tr><td colspan=2 class="muted">No certified items yet</td></tr>'}</table></div>`);
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
  <rect x="${m + 20}" y="${m + labelH + 18}" width="${W - 60}" height="${H - labelH - 96}" rx="8" fill="none" stroke="rgba(190,235,255,.3)" stroke-width="1.2"/>
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
        <div style="display:flex;gap:8px;margin-top:14px">
          <button class="primary" id="csSvg">Download SVG</button>
          <button id="csPng">Download PNG</button>
        </div>
        <p class="muted" style="font-size:10px;margin-top:8px">QR encodes the public verify URL — scannable on a printed label. SVG is vector for laser engraving / fabrication.</p>
      </div>
      <div class="panel" style="text-align:center"><h3>PREVIEW — FRONT &amp; BACK</h3><div id="csPrev" style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap"></div></div>
    </div>`);
  const q = sel => document.querySelector(sel);
  const read = () => ({ name: q('#csName').value, set: q('#csSet').value, cert: q('#csCert').value, grade: q('#csGrade').value, style: q('#csStyle').value, orient: q('#csOrient').value, tint: q('#csTint').value, accent: q('#csAccent').value, engrave: q('#csEngrave').value, holo: q('#csHolo').checked, lanes: (window._subLanes || {}) });
  const render = () => q('#csPrev').innerHTML = slabSVG(read()) + slabSVGBack(read());
  ['csName', 'csSet', 'csCert', 'csGrade', 'csStyle', 'csOrient', 'csTint', 'csAccent', 'csEngrave', 'csHolo'].forEach(id => q('#' + id).oninput = render);
  // prefill from selected submission if one exists
  if (currentSub) api('/submissions/' + currentSub).then(s => {
    if (s?.item) { q('#csName').value = s.item.name || ''; q('#csSet').value = (s.item.set || '') + (s.item.year ? ' • ' + s.item.year : ''); }
    q('#csCert').value = s.id;
    if (s.certificate) q('#csGrade').value = s.certificate.publicGrade;
    if (s.evaluation) window._subLanes = s.evaluation.lanes;
    render();
  }).catch(() => {});
  render();
  const dl = (blob, name) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); };
  q('#csSvg').onclick = () => {
    dl(new Blob([slabSVG(read())], { type: 'image/svg+xml' }), 'gemcore-slab-front.svg');
    dl(new Blob([slabSVGBack(read())], { type: 'image/svg+xml' }), 'gemcore-slab-back.svg');
  };
  q('#csPng').onclick = () => {
    const img = new Image();
    img.onload = () => { const c = document.createElement('canvas'); c.width = 600; c.height = 860; c.getContext('2d').drawImage(img, 0, 0, 600, 860); c.toBlob(b => dl(b, 'gemcore-slab.png'), 'image/png'); };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(slabSVG(read()))));
  };
}

/* ── Settings: real hardware roles + calibration + recommended kit ────── */
async function hardwareSettings() {
  const KIT = [
    ['Overview / macro camera', 'Any 1080p+ webcam or phone camera — front/back full-card captures', '$0–60'],
    ['Digital microscope', 'USB/LCD scope 50–500× (Plugable 250×, Celestron MicroDirect, LinkMicro LM210S)', '$50–200'],
    ['Macro / telescope', 'Phone telephoto or DSLR macro for card-surface wide shots', '$0–400'],
    ['UV / IR source', '365nm UV torch + IR-sensitive camera for alterations/print check', '$20–80'],
    ['Raking light', 'Low-angle LED bar for surface scratches', '$15–40'],
    ['Slab welder', '20KHz ultrasonic welder, 2000–3200W benchtop for sealing cases', '$1,000–2,800'],
    ['Label cutter', 'Slab label cutter for paper inserts', '~$300'],
  ];
  V.innerHTML = page('Settings & Calibration', 'Assign real hardware to inspection roles',
    `<div class="detailgrid">
      <div class="panel"><h3>CONNECTED CAMERAS</h3>
        <button class="primary" id="scanDevs">Detect Cameras</button>
        <div id="devList" style="margin-top:10px"></div>
      </div>
      <div class="panel"><h3>ROLE ASSIGNMENT</h3>
        ${['overview', 'macro-telescope', 'microscope', 'uv-ir'].map(r =>
          `<label>${r.toUpperCase()}<select data-role="${r}"><option value="">— auto —</option></select></label>`).join('')}
        <p class="muted" style="font-size:11px;margin-top:10px">Captures record which physical device produced them (deviceMeta on each evidence record).</p>
      </div>
    </div>
    <div class="panel" style="margin-top:14px"><h3>RECOMMENDED KIT</h3>
      <table><tr><th>Role</th><th>Suggested device</th><th>Cost</th></tr>
      ${KIT.map(k => `<tr><td>${k[0]}</td><td class="muted">${k[1]}</td><td>${k[2]}</td></tr>`).join('')}</table>
    </div>`);
  const q = sel => document.querySelector(sel);
  const roles = GemCoreCapture.getRoles();
  q('#scanDevs').onclick = async () => {
    // permission first so labels resolve
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

/* ── Command Center — clickable launchpad ─────────────────────────────── */
function command() {
  const items = [
    ['grade', '⬡', 'Quantum Inspection', 'AI scan chamber + Money Penny'],
    ['intake', '▤', 'Start a Submission', 'Capture & track collectibles'],
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
  V.innerHTML = page('Command Center', 'Collect • Grade • Trade • Preserve • Belong',
    `<div class="grid">${items.map(([k, ic, t, s]) =>
      `<div class="tile" style="cursor:pointer" data-go="${k}"><h3>${ic} ${t}</h3><p class="muted">${s}</p></div>`).join('')}</div>`);
  document.querySelectorAll('[data-go]').forEach(t => t.onclick = () => show(t.dataset.go));
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
    out.textContent = JSON.stringify(await api(`/submissions/${b.dataset.ok}/qc`, { b: { approved: true, reviewer: 'Human QC' } }), null, 2); show('qc');
  });
  document.querySelectorAll('[data-no]').forEach(b => b.onclick = async () => {
    out.textContent = JSON.stringify(await api(`/submissions/${b.dataset.no}/qc`, { b: { approved: false, reviewer: 'Human QC' } }), null, 2); show('qc');
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

const pages = {
  command,
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
  studio: caseStudio,
  community,
  tools,
  settings: hardwareSettings,
  qc,
};

function show(k) {
  const f = pages[k] || pages.command;
  document.querySelectorAll('[data-page]').forEach(b => b.classList.toggle('active', b.dataset.page === k));
  const r = f();
  if (r && r.then) r.catch(e => { V.innerHTML = page('Error', '', `<pre>${esc(e.message)}</pre>`); });
  nav();
}
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
