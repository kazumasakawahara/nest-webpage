// Local-only photo storage. Photos live ONLY in IndexedDB on the device — no
// upload, no server, no analytics (design spec §5, a hard rule). Nothing here
// touches indexedDB / document at module load, so importing the module under
// vitest (node) or during SSR/build is safe; the browser APIs are only reached
// when a function is actually called.

const DB_NAME = 'tsutaeru';
const STORE = 'photos';
const MAX_LONG_SIDE = 800;

/**
 * Pure: fit (w, h) so the long side is at most `max`, preserving aspect ratio.
 * Never upscales — an image already within `max` is returned unchanged.
 * Fractional results are rounded to whole pixels.
 */
export function fitSize(w: number, h: number, max: number): { w: number; h: number } {
  const long = Math.max(w, h);
  if (long <= max) return { w, h };
  const scale = max / long;
  return { w: Math.round(w * scale), h: Math.round(h * scale) };
}

// ── IndexedDB helpers (browser-only) ─────────────────────────────────────────

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const req = run(tx.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
      }),
  );
}

// Object URLs are cached so repeated card renders reuse one URL per photo
// instead of leaking a new one each time. deletePhoto revokes + drops the entry.
const urlCache = new Map<string, string>();

/** Store a blob under a fresh id (crypto.randomUUID) and return that id. */
export async function savePhoto(blob: Blob): Promise<string> {
  const id = crypto.randomUUID();
  await withStore('readwrite', (store) => store.put(blob, id));
  return id;
}

/** Object URL for a stored photo, or null when the id is missing. Cached. */
export async function getPhotoURL(id: string): Promise<string | null> {
  const cached = urlCache.get(id);
  if (cached) return cached;
  const blob = await withStore<Blob | undefined>('readonly', (store) => store.get(id));
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urlCache.set(id, url);
  return url;
}

/** Delete a stored photo and revoke/drop any cached object URL. */
export async function deletePhoto(id: string): Promise<void> {
  const url = urlCache.get(id);
  if (url) {
    URL.revokeObjectURL(url);
    urlCache.delete(id);
  }
  await withStore('readwrite', (store) => store.delete(id));
}

// ── Resize (browser-only) ────────────────────────────────────────────────────

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image load failed'));
    };
    img.src = url;
  });
}

/**
 * Decode `file`, draw it onto a canvas whose long side is at most `max` (never
 * upscaling), and export a JPEG blob. Rejects on unsupported files or canvas
 * failure so callers can surface a visible error instead of storing garbage.
 */
export async function resizeToBlob(file: Blob, max: number = MAX_LONG_SIDE): Promise<Blob> {
  const img = await loadImage(file);
  const { w, h } = fitSize(img.width, img.height, max);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d context unavailable');
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('canvas export failed'))),
      'image/jpeg',
      0.8,
    );
  });
}
