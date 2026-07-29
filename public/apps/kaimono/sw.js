/* かいものチェッカー Service Worker
 *
 * Strategy (scope: /apps/kaimono/ only — the rest of the site is untouched):
 *  - Precache the app shell (navigation HTML), manifest and icons.
 *  - Navigations: network-first, falling back to the cached shell → full offline.
 *  - App is fully inline (no hashed assets), so the shell is all we need.
 *  Bump VERSION to invalidate; activate() deletes older caches.
 */
const VERSION = 'v1';
const CACHE = `kaimono-${VERSION}`;
const SHELL_URL = '/apps/kaimono/';

const PRECACHE = [
  SHELL_URL,
  '/apps/kaimono/manifest.webmanifest',
  '/apps/kaimono/icons/icon-192.png',
  '/apps/kaimono/icons/icon-512.png',
  '/apps/kaimono/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k.startsWith('kaimono-') && k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== location.origin) return;
  if (!url.pathname.startsWith('/apps/kaimono')) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(SHELL_URL, copy));
          return res;
        })
        .catch(() => caches.match(SHELL_URL))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((hit) => hit || fetch(event.request))
  );
});
