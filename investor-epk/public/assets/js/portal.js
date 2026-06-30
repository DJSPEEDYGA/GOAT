'use strict';

async function getJson(url) {
  const res = await fetch(url, { credentials: 'same-origin' });
  if (res.status === 401 || res.status === 403) {
    window.location.href = '/login';
    return null;
  }
  return res.json();
}

function tile(d) {
  const a = document.createElement('a');
  a.className = 'tile';
  a.href = d.url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';

  const bar = document.createElement('div');
  bar.className = 'bar';
  bar.style.background = d.accent;

  const h = document.createElement('h3');
  h.textContent = d.name;

  const p = document.createElement('p');
  p.textContent = d.blurb;

  const go = document.createElement('span');
  go.className = 'go';
  go.textContent = 'Launch →';

  a.append(bar, h, p, go);
  return a;
}

(async function init() {
  const me = await getJson('/api/me');
  if (!me) return;
  document.getElementById('who').textContent = me.name ? `${me.name} · ${me.email}` : me.email;

  const data = await getJson('/api/destinations');
  if (!data) return;
  const grid = document.getElementById('grid');
  (data.destinations || []).forEach((d) => grid.appendChild(tile(d)));

  document.getElementById('logout').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
    window.location.href = '/login';
  });
})();
