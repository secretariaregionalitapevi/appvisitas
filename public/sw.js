// Atualização do fluxo de lançamentos parciais por categoria.
const CACHE_NAME = 'visitas-v2.0.8';
const RUNTIME_CACHE = 'runtime-cache-v2.0.8';

// Recursos essenciais para o primeiro carregamento (Shell do App)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/manifest.json?v=4',
  '/icon-512.png?v=4',
  '/icons/icon-192.png?v=4',
  '/icons/icon-180.png?v=4',
  '/favicon.png?v=4',
  '/styles/main.css'
];

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  // Paginas devem refletir o deploy atual. O cache e apenas contingencia offline.
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseToCache));
          }
          return networkResponse;
        })
        .catch(async () => (
          (await caches.match(request)) ||
          (await caches.match('/index.html'))
        ))
    );
    return;
  }

  // Recursos estaticos usam cache com atualizacao em segundo plano.
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkUpdate = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.ok) {
          const responseToCache = networkResponse.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseToCache));
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || networkUpdate;
    })
  );
});
