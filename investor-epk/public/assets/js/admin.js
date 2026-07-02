'use strict';

const $ = (id) => document.getElementById(id);
let TOKEN = '';

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

async function api(url, opts) {
  const res = await fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', 'x-admin-token': TOKEN, ...(opts && opts.headers) },
    credentials: 'same-origin',
  });
  if (res.status === 401) {
    lock();
    $('gmsg').className = 'msg show err';
    $('gmsg').textContent = 'Invalid or expired owner token.';
    throw new Error('unauthorized');
  }
  return res.json();
}

function resultTag(result) {
  const r = String(result || '');
  let cls = 'muted';
  if (r === 'ok' || r === 'granted' || r.includes('approved')) cls = 'ok';
  else if (r === 'fail' || r === 'denied' || r.includes('revoked')) cls = 'fail';
  else if (r === 'pending') cls = 'pending';
  return `<span class="tag ${cls}">${esc(r)}</span>`;
}

async function loadPending() {
  const data = await api('/api/admin/approvals');
  const all = data.approvals || {};
  const rows = [];
  Object.keys(all).forEach((email) => {
    (all[email].pending || []).forEach((p) => {
      rows.push(`<tr>
        <td>${esc(email)}</td>
        <td class="mono">${esc(p.ip)}</td>
        <td class="mono">${esc(p.ts)}</td>
        <td>${esc((p.ua || '').slice(0, 60))}</td>
        <td><button class="mini approve" data-email="${esc(email)}" data-ip="${esc(p.ip)}">Approve</button></td>
      </tr>`);
    });
  });
  $('pending').innerHTML = rows.length
    ? `<table><tr><th>Partner</th><th>IP</th><th>Requested</th><th>Device</th><th></th></tr>${rows.join('')}</table>`
    : '<p class="sub">No pending requests.</p>';
}

async function loadApproved() {
  const data = await api('/api/admin/approvals');
  const all = data.approvals || {};
  const rows = [];
  Object.keys(all).forEach((email) => {
    (all[email].approved || []).forEach((ip) => {
      rows.push(`<tr>
        <td>${esc(email)}</td>
        <td class="mono">${esc(ip)}</td>
        <td><button class="mini revoke" data-email="${esc(email)}" data-ip="${esc(ip)}">Revoke</button></td>
      </tr>`);
    });
  });
  $('approved').innerHTML = rows.length
    ? `<table><tr><th>Partner</th><th>IP</th><th></th></tr>${rows.join('')}</table>`
    : '<p class="sub">No approved IPs yet.</p>';
}

async function loadAudit() {
  const data = await api('/api/admin/audit?limit=200');
  const rows = (data.entries || []).map((e) => `<tr>
    <td class="mono">${esc(e.ts)}</td>
    <td>${esc(e.email)}</td>
    <td class="mono">${esc(e.ip)}</td>
    <td>${esc(e.stage)}</td>
    <td>${resultTag(e.result)}</td>
  </tr>`);
  $('audit').innerHTML = rows.length
    ? `<table><tr><th>Time</th><th>Partner</th><th>IP</th><th>Stage</th><th>Result</th></tr>${rows.join('')}</table>`
    : '<p class="sub">No activity logged yet.</p>';
}

async function refreshAll() {
  await Promise.all([loadPending(), loadApproved(), loadAudit()]);
}

document.addEventListener('click', async (e) => {
  const t = e.target;
  if (t.classList && t.classList.contains('approve')) {
    await api('/api/admin/approve-ip', { method: 'POST', body: JSON.stringify({ email: t.dataset.email, ip: t.dataset.ip }) });
    await refreshAll();
  }
  if (t.classList && t.classList.contains('revoke')) {
    await api('/api/admin/revoke-ip', { method: 'POST', body: JSON.stringify({ email: t.dataset.email, ip: t.dataset.ip }) });
    await refreshAll();
  }
});

function unlock() {
  $('gate').style.display = 'none';
  $('console').style.display = 'block';
  $('refresh').style.display = '';
  $('lock').style.display = '';
}

function lock() {
  TOKEN = '';
  $('gate').style.display = 'block';
  $('console').style.display = 'none';
  $('refresh').style.display = 'none';
  $('lock').style.display = 'none';
}

$('enter').addEventListener('click', async () => {
  TOKEN = $('token').value.trim();
  $('token').value = '';
  if (!TOKEN) return;
  try {
    await refreshAll();
    $('gmsg').className = 'msg';
    unlock();
  } catch { /* api() already surfaced the error */ }
});

$('refresh').addEventListener('click', refreshAll);
$('lock').addEventListener('click', lock);
