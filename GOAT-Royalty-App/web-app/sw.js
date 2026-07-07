// 🐐 GOAT Royalty App — Service Worker (offline support)
const CACHE = 'goat-v3';
const CORE = [
  '/',
  '/powerhouse.html',
  '/agents-brain.html',
  '/autopilot.html',
  '/settings.html',
  '/network.html',
  '/moneypenny.html',
  '/intel.html',
  '/fan-db.html',
  '/spotify-dashboard.html',
  '/spotify-setup.html',
  '/download.html',
  '/manifest.json',
  '/lib/supabase-client.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Never cache API calls (always live)
  const url = new URL(e.request.url);
  if (url.port === '5500' || url.pathname.startsWith('/brain/') || url.pathname.startsWith('/autopilot/') || url.pathname.startsWith('/keys/')) {
    return;  // Let it pass through to network
  }
  // Cache-first for everything else
  e.respondWith(
    caches.match(e.request).then(res =>
      res || fetch(e.request).then(r => {
        if (r.ok && e.request.method === 'GET') {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return r;
      }).catch(() => caches.match('/powerhouse.html'))
    )
  );
});