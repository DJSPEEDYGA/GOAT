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
    headers: { 'Content-Type': 'application/json' },
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
          <div class="cardface"><img src="assets/card-demo.svg" alt="collectible"><small>${esc(s?.item?.name || 'DEMO COLLECTIBLE')} • DIGITAL INSPECTION TWIN</small></div>
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
          <div class="ahead"><img src="assets/jarvis.svg" alt="JARVIS"><div><b>JARVIS AI</b><br><span class="online">● Online</span></div></div>
          <div class="bubble" id="jarvisMsg">Evidence-first inspection assistant. ${s ? 'Loaded ' + s.id + ' — ready to inspect.' : 'Select a submission to begin.'}</div>
          <div class="btnrow"><button class="primary" id="scan2">Run Deep Scan</button><button id="report">Generate Report</button></div>
        </div>
        <div class="panel"><h3>INSPECTION VIEWS</h3>
          <div class="tabs"><button class="active">Microscope</button><button>Telescope</button><button>3D Model</button></div>
          <div class="micro"><img src="assets/tex-surface.svg" alt="surface detail"><span>SURFACE DETAIL <b>40×</b></span><span class="tag4k">4K</span></div>
          <div class="thumbs">
            <i><img src="assets/tex-corner.svg"><em>Corner</em></i>
            <i><img src="assets/tex-edge.svg"><em>Edge</em></i>
            <i><img src="assets/tex-holo.svg"><em>Holo</em></i>
            <i><img src="assets/tex-relief.svg"><em>Relief</em></i>
            <i><img src="assets/tex-uv.svg"><em>UV</em></i>
            <i><img src="assets/tex-texture.svg"><em>Texture</em></i>
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
      <button>Add to Vault</button><button>Share Results</button>
    </div>
    <pre id="labOut" style="display:none"></pre>

    <div class="intel">
      <div class="panel"><h3>MARKET INTELLIGENCE</h3><strong>$412.50 <small style="color:var(--green);font-size:11px">▲ +12.4%</small></strong>
        <svg class="spark" viewBox="0 0 200 44" style="width:100%;height:40px"><polyline points="0,34 20,30 40,33 60,24 80,28 100,18 120,22 140,12 160,16 180,8 200,10" fill="none" stroke="#25f3e6" stroke-width="2"/><polyline points="0,40 200,40" stroke="#12344a"/></svg>
        <p class="muted" style="font-size:10px">DEMO comparable data — never affects grade.</p></div>
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

  const out = t => { const p = q('#labOut'); p.style.display = 'block'; p.textContent = t; };

  const runScan = async () => {
    if (!s) { q('#jarvisMsg').textContent = 'Pick or create a submission first.'; return; }
    q('#scanner').classList.add('active');
    CHECKS.forEach((c, i) => setTimeout(() => { const t = q('#tick' + i); if (t) t.textContent = '✓'; const k = q('#ck' + i); if (k) k.textContent = 'Scanning…'; }, i * 160));
    const res = await api(`/submissions/${s.id}/analyze`, { b: { capability: 'surface' } });
    const grade = await api(`/submissions/${s.id}/grade`);
    q('#scanner').classList.remove('active');
    CHECKS.forEach((c, i) => { const k = q('#ck' + i); if (k) k.textContent = res.status === 'ok' ? 'Analyzed' : 'Awaiting adapter'; });
    q('#progress').style.width = '100%';
    q('#jarvisMsg').textContent = res.status === 'ok'
      ? 'Scan complete — visuals mapped to evidence.'
      : 'Scan pipeline ready. VisionCore adapter required for analysis — no results invented.';
    if (grade.publicGrade !== null) { q('#score').textContent = grade.publicGrade; q('#g').textContent = grade.publicGrade; }
    q('#state').textContent = (grade.status || 'qc-required').toUpperCase();
    if (grade.status === 'sealable') q('#seal').disabled = false;
    out(JSON.stringify({ vision: res, evaluation: grade }, null, 2));
  };
  q('#scan').onclick = runScan;
  q('#scan2').onclick = runScan;
  q('#retake').onclick = () => { q('#progress').style.width = '0'; q('#state').textContent = 'HUMAN QC REQUIRED'; };
  q('#report').onclick = q('#report2').onclick = () => s ? out(JSON.stringify(s, null, 2)) : q('#jarvisMsg').textContent = 'No submission selected.';
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
      <pre id="out"></pre></div>`);
  document.querySelector('#create').onclick = async () => {
    const s = await api('/submissions', { b: { item: { name: itemName(), set: q('#set').value, year: q('#year').value }, demo: q('#demo').checked } });
    currentSub = s.id; localStorage.setItem('gemcore.sub', s.id);
    q('#out').textContent = 'Created ' + s.id + '\n' + JSON.stringify(s, null, 2);
  };
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
          <span class="chain">→ evidence ${o.evidenceId?.slice(0, 12)}… • src ${o.source} • conf ${o.confidence ?? '—'} • ${o.reviewer || 'awaiting reviewer'}</span></div>`).join('') || '<p class="muted" style="font-size:12px">none</p>'}
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
    document.querySelector('#detail').innerHTML = `<pre>${esc(JSON.stringify(p, null, 2))}</pre>`;
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

const pages = {
  command: () => { V.innerHTML = page('Command Center', 'Collect • Grade • Trade • Preserve • Belong',
    tiles(['Start a Submission', 'Quantum Inspection', 'Evidence Passport', 'Live Grading', 'Human QC', 'Population Report', 'Market Intelligence', 'GemCore Vault'])); },
  grade: lab,
  intake,
  submissions,
  passport,
  verify,
  population,
  vault: () => { V.innerHTML = page('GemCore Vault', 'Your certified and in-review collection', tiles(['Certified', 'In Review', 'Returned Ungraded', 'Regrade Queue'])); },
  market: () => { V.innerHTML = page('Market Intelligence', 'Market value is displayed separately and never changes condition grade', tiles(['Comparable Sales', 'Price History', 'Market Trend', 'Set Analytics'])); },
  live: () => { V.innerHTML = page('Live Grading', 'Capture → VisionCore → Reviewer → Slab QA', tiles(['Capture Feed', 'VisionCore Events', 'Reviewer Queue', 'Slab QA'])); },
  studio: () => { V.innerHTML = page('GOATVERSE Studio', '3D/4D interactive presentation', tiles(['3D Showcase', 'Spatial Reveal', 'AR Preview'])); },
  community: () => { V.innerHTML = page('Community', 'Collectors & chat', tiles(['Collector Lounge', 'Showcase Feed', 'Grading Stories'])); },
  tools: () => { V.innerHTML = page('Tools & Calculators', 'Value, ROI, compare', tiles(['Value Estimator', 'ROI Calculator', 'Compare Tool'])); },
  settings: () => { V.innerHTML = page('Settings & Calibration', 'Hardware, optics, lighting and rubric configuration', tiles(['Digital Microscope', 'Macro / Telescope Camera', 'Raking Light', 'UV / IR', 'Calibration Health', 'Rubric Version'])); },
  qc: () => { V.innerHTML = page('Human QC', 'A certified grade cannot be sealed without verified evidence and reviewer approval', tiles(['Review Queue', 'Evidence Conflicts', 'Authenticity Gate', 'Final Seal'])); },
};

function show(k) {
  const f = pages[k] || pages.command;
  document.querySelectorAll('[data-page]').forEach(b => b.classList.toggle('active', b.dataset.page === k));
  const r = f();
  if (r && r.then) r.catch(e => { V.innerHTML = page('Error', '', `<pre>${esc(e.message)}</pre>`); });
  nav();
}
nav();
show('grade');
