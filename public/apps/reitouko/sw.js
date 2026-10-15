/* れいとうこチェッカー Service Worker
 *
 * Strategy (scope: /apps/reitouko/ only — the rest of the site is untouched):
 *  - Precache the app shell (navigation HTML), manifest and icons.
 *  - The page's JS is a hashed /_astro/ bundle whose name changes per build, so
 *    at install time the shell HTML is fetched and parsed for /_astro/ URLs; the
 *    SAME response is cached as the shell, so cached HTML and cached JS always match.
 *  - Navigations: network-first, falling back to the cached shell → full offline.
 *  - /_astro/ assets and anything under /apps/reitouko/: cache-first with runtime fill.
 *  Photos and records live in IndexedDB, not in this cache.
 *  Bump VERSION to invalidate; activate() deletes older caches.
 */
const VERSION = 'v1';
const CACHE = `reitouko-${VERSION}`;
const SHELL_URL = '/apps/reitouko/';

const PRECACHE = [
  '/apps/reitouko/manifest.webmanifest',
  '/apps/reitouko/icons/icon-192.png',
  '/apps/reitouko/icons/icon-512.png',
  '/apps/reitouko/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      const res = await fetch(SHELL_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`shell fetch failed: ${res.status}`);
      const html = await res.clone().text();
      const assets = [...new Set(html.match(/\/_astro\/[A-Za-z0-9._-]+\.(?:js|css)/g) || [])];
      if (assets.length === 0) throw new Error('no /_astro/ assets found in shell HTML');
      await cache.put(SHELL_URL, res);
      await cache.addAll([...PRECACHE, ...assets]);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k.startsWith('reitouko-') && k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    const cache = await caches.open(CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstShell(request) {
  try {
    return await fetch(request);
  } catch (err) {
    const shell = await caches.match(SHELL_URL);
    if (shell) return shell;
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    if (!url.pathname.startsWith('/apps/reitouko')) return;
    event.respondWith(networkFirstShell(request));
    return;
  }

  if (url.pathname.startsWith('/_astro/') || url.pathname.startsWith('/apps/reitouko/')) {
    event.respondWith(cacheFirst(request));
  }
});
