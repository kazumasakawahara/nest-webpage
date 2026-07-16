/* つたえるカード Service Worker
 *
 * Strategy (scope: /apps/tsutaeru/ only — the rest of the site is untouched):
 *  - Precache the app shell (navigation HTML), manifest, icons and all art SVGs.
 *  - Navigations: network-first, falling back to the cached shell → full offline.
 *  - Same-origin GETs under /_astro/ (hashed JS/CSS, filenames change per build):
 *    cache-first, populated at runtime (cannot be precached by name).
 *  - Other same-origin GETs inside scope: cache-first with runtime fill.
 *  Bump VERSION to invalidate; activate() deletes older caches.
 */
const VERSION = 'v1';
const CACHE = `tsutaeru-${VERSION}`;
const SHELL_URL = '/apps/tsutaeru/';

const PRECACHE = [
  '/apps/tsutaeru/manifest.webmanifest',
  '/apps/tsutaeru/icons/icon-192.png',
  '/apps/tsutaeru/icons/icon-512.png',
  '/apps/tsutaeru/icons/apple-touch-icon.png',
  '/apps/tsutaeru/art/dsl-aji.svg',
  '/apps/tsutaeru/art/dsl-hajimete.svg',
  '/apps/tsutaeru/art/dsl-junban-chigau.svg',
  '/apps/tsutaeru/art/dsl-mae-iya.svg',
  '/apps/tsutaeru/art/dsl-nioi.svg',
  '/apps/tsutaeru/art/dsl-oto.svg',
  '/apps/tsutaeru/art/emo-kanashii.svg',
  '/apps/tsutaeru/art/emo-kowai.svg',
  '/apps/tsutaeru/art/emo-okotteru.svg',
  '/apps/tsutaeru/art/emo-sukoshi.svg',
  '/apps/tsutaeru/art/emo-tanoshii.svg',
  '/apps/tsutaeru/art/emo-totemo.svg',
  '/apps/tsutaeru/art/emo-tsukareta.svg',
  '/apps/tsutaeru/art/emo-ureshii.svg',
  '/apps/tsutaeru/art/esc-none.svg',
  '/apps/tsutaeru/art/esc-unknown.svg',
  '/apps/tsutaeru/art/gen-denwa.svg',
  '/apps/tsutaeru/art/gen-e.svg',
  '/apps/tsutaeru/art/gen-fuku.svg',
  '/apps/tsutaeru/art/gen-hon.svg',
  '/apps/tsutaeru/art/gen-kuruma.svg',
  '/apps/tsutaeru/art/gen-ofuro.svg',
  '/apps/tsutaeru/art/gen-ongaku.svg',
  '/apps/tsutaeru/art/gen-soto.svg',
  '/apps/tsutaeru/art/gen-terebi.svg',
  '/apps/tsutaeru/art/gen-undou.svg',
  '/apps/tsutaeru/art/icon-body.svg',
  '/apps/tsutaeru/art/icon-custom.svg',
  '/apps/tsutaeru/art/icon-dislike.svg',
  '/apps/tsutaeru/art/icon-emotion.svg',
  '/apps/tsutaeru/art/icon-request.svg',
  '/apps/tsutaeru/art/icon-review.svg',
  '/apps/tsutaeru/art/icon-trouble.svg',
  '/apps/tsutaeru/art/icon-yesno.svg',
  '/apps/tsutaeru/art/loc-ashi.svg',
  '/apps/tsutaeru/art/loc-atama.svg',
  '/apps/tsutaeru/art/loc-ha.svg',
  '/apps/tsutaeru/art/loc-mune.svg',
  '/apps/tsutaeru/art/loc-nodo.svg',
  '/apps/tsutaeru/art/loc-onaka.svg',
  '/apps/tsutaeru/art/loc-ude.svg',
  '/apps/tsutaeru/art/pain-chikuchiku.svg',
  '/apps/tsutaeru/art/pain-doon-omoi.svg',
  '/apps/tsutaeru/art/pain-gangan.svg',
  '/apps/tsutaeru/art/pain-hirihiri.svg',
  '/apps/tsutaeru/art/pain-kirikiri.svg',
  '/apps/tsutaeru/art/pain-mukamuka.svg',
  '/apps/tsutaeru/art/pain-umaku-ienai.svg',
  '/apps/tsutaeru/art/pain-zukizuki.svg',
  '/apps/tsutaeru/art/req-omizu.svg',
  '/apps/tsutaeru/art/req-shizuka.svg',
  '/apps/tsutaeru/art/req-tetsudatte.svg',
  '/apps/tsutaeru/art/req-toire.svg',
  '/apps/tsutaeru/art/req-yametai.svg',
  '/apps/tsutaeru/art/req-yasumitai.svg',
  '/apps/tsutaeru/art/rev-atama-itai.svg',
  '/apps/tsutaeru/art/rev-futsuu.svg',
  '/apps/tsutaeru/art/rev-gohan.svg',
  '/apps/tsutaeru/art/rev-hito.svg',
  '/apps/tsutaeru/art/rev-iyadatta.svg',
  '/apps/tsutaeru/art/rev-karada.svg',
  '/apps/tsutaeru/art/rev-mukamuka.svg',
  '/apps/tsutaeru/art/rev-nemurenakatta.svg',
  '/apps/tsutaeru/art/rev-odekake.svg',
  '/apps/tsutaeru/art/rev-onaka-itai.svg',
  '/apps/tsutaeru/art/rev-oyatsu.svg',
  '/apps/tsutaeru/art/rev-shigoto.svg',
  '/apps/tsutaeru/art/rev-tanoshikatta.svg',
  '/apps/tsutaeru/art/rev-tsukareteiru.svg',
  '/apps/tsutaeru/art/since-kinou.svg',
  '/apps/tsutaeru/art/since-kyou.svg',
  '/apps/tsutaeru/art/since-sukoshi-mae.svg',
  '/apps/tsutaeru/art/since-zutto-mae.svg',
  '/apps/tsutaeru/art/trb-atsui-samui.svg',
  '/apps/tsutaeru/art/trb-hito-ooi.svg',
  '/apps/tsutaeru/art/trb-mabushii.svg',
  '/apps/tsutaeru/art/trb-matsu-iya.svg',
  '/apps/tsutaeru/art/trb-nemui.svg',
  '/apps/tsutaeru/art/trb-onaka-suita.svg',
  '/apps/tsutaeru/art/trb-urusai.svg',
  '/apps/tsutaeru/art/trb-yaru-koto-wakaranai.svg',
  '/apps/tsutaeru/art/yn-docchimo-iya.svg',
  '/apps/tsutaeru/art/yn-hai.svg',
  '/apps/tsutaeru/art/yn-iie.svg',
  '/apps/tsutaeru/art/yn-wakaranai.svg',
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
      (url.pathname.startsWith('/_astro/') || url.pathname.startsWith('/apps/tsutaeru/'))) {
    event.respondWith(cacheFirst(request));
  }
});
