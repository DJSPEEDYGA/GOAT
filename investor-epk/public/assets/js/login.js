'use strict';

const $ = (id) => document.getElementById(id);
const msg = $('msg');

function show(kind, text) {
  msg.className = 'msg show ' + kind;
  msg.textContent = text;
}
function hide() {
  msg.className = 'msg';
}

async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
    credentials: 'same-origin',
  });
  let data = {};
  try { data = await res.json(); } catch { /* ignore */ }
  return { ok: res.ok, status: res.status, data };
}

$('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  hide();
  const btn = $('login-btn');
  btn.disabled = true;
  const { ok, data } = await post('/api/login', {
    email: $('email').value.trim(),
    password: $('password').value,
  });
  btn.disabled = false;

  if (ok && data.status === 'totp_required') {
    $('step-password').style.display = 'none';
    $('step-totp').style.display = 'block';
    $('code').focus();
    return;
  }
  if (data.status === 'totp_not_enrolled') {
    show('warn', data.message || '2FA is not set up. Contact the owner.');
    return;
  }
  if (data.status === 'rate_limited') {
    show('err', data.message || 'Too many attempts. Try again later.');
    return;
  }
  show('err', 'Invalid email or password.');
});

$('totp-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  hide();
  const btn = $('totp-btn');
  btn.disabled = true;
  const { ok, data } = await post('/api/verify-2fa', { code: $('code').value.trim() });
  btn.disabled = false;

  if (ok && data.status === 'ok') {
    window.location.href = data.redirect || '/portal';
    return;
  }
  if (data.status === 'pending_approval') {
    show('warn', data.message || 'Verified — awaiting owner approval for this device/IP.');
    return;
  }
  if (data.status === 'challenge_expired') {
    show('err', 'Session timed out. Please sign in again.');
    setTimeout(() => window.location.reload(), 1600);
    return;
  }
  show('err', 'Invalid code. Try again.');
});

$('back-btn').addEventListener('click', () => {
  hide();
  $('step-totp').style.display = 'none';
  $('step-password').style.display = 'block';
});
