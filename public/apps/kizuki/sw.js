/* 支援者の気づきノート Service Worker
 *
 * Strategy (scope: /apps/kizuki/ only — the rest of the site is untouched):
 *  - Precache the app shell (navigation HTML), manifest and icons.
 *  - Navigations: network-first, falling back to the cached shell → full offline.
 *  - Same-origin GETs under /_astro/ (hashed JS/CSS, filenames change per build):
 *    cache-first, populated at install by parsing the shell HTML.
 *  Bump VERSION to invalidate; activate() deletes older caches.
 */
const VERSION = 'v1';
const CACHE = `kizuki-${VERSION}`;
const SHELL_URL = '/apps/kizuki/';

const PRECACHE = [
  '/apps/kizuki/manifest.webmanifest',
  '/apps/kizuki/icons/icon-192.png',
  '/apps/kizuki/icons/icon-512.png',
  '/apps/kizuki/icons/apple-touch-icon.png',
];

// The hashed JS/CSS bundle names change per build and are unknown here, so we
// discover them at install time by parsing the shell HTML for /_astro/ URLs.
// The SAME response is both cached as the shell and parsed for its assets, so
// the cached HTML can never reference bundles other than the ones we cache.
// If no bundle is found the install throws (and retries on a later visit) —
// caching HTML without its JS would mean a white page offline.
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
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
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

  // Navigations → network-first, fall back to the cached shell (offline).
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstShell(request));
    return;
  }

  // Hashed JS/CSS under /_astro/, and any same-origin asset inside our scope →
  // cache-first with runtime fill.
  if (url.origin === self.location.origin &&
      (url.pathname.startsWith('/_astro/') || url.pathname.startsWith('/apps/kizuki/'))) {
    event.respondWith(cacheFirst(request));
  }
});
