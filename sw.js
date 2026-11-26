const CACHE = 'fw-kasse-v16';
const FALLBACK = './index.html';
const ASSETS = [
  './',
  './index.html',
  './fw_rechenhilfe.html',
  './admin.html',
  './admin.js',
  './store.js',
  './style.css',
  './articles.js',
  './shared.js',
  './manifest.webmanifest',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.filter(n => n !== CACHE).map(n => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;
      return fetch(req)
        .then(response => {
          if (response && response.ok) {
            const clone = response.clone();
            event.waitUntil(
              caches.open(CACHE).then(cache => cache.put(req, clone))
            );
          }
          return response;
        })
        .catch(() =>
          req.mode === 'navigate'
            ? caches.match(FALLBACK)
            : Response.error()
        );
    })
  );
});