// 冷凍庫チェッカー — IndexedDB（端末内のみ。サーバー送信なし）。
// モジュール読み込み時にはブラウザ API に触れない（SSR／vitest で import しても安全）。
import type { Item, LogEntry } from './types';

const DB_NAME = 'reitouko';
const DB_VERSION = 1;
export const STORE_ITEMS = 'items';
export const STORE_LOG = 'log';
export const STORE_PHOTOS = 'photos';
/** きろくに残す件数の上限（古いものから消す） */
export const LOG_LIMIT = 200;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_ITEMS)) db.createObjectStore(STORE_ITEMS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_LOG)) db.createObjectStore(STORE_LOG, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_PHOTOS)) db.createObjectStore(STORE_PHOTOS);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function withStore<T>(
  name: string,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(name, mode);
        const req = run(tx.objectStore(name));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
        tx.onerror = () => reject(tx.error);
      }),
  );
}

// ── items ──
export const getAllItems = () => withStore<Item[]>(STORE_ITEMS, 'readonly', (s) => s.getAll());
export const putItem = (item: Item) => withStore(STORE_ITEMS, 'readwrite', (s) => s.put(item));
export const deleteItem = (id: string) => withStore(STORE_ITEMS, 'readwrite', (s) => s.delete(id));

// ── log ──
export const getAllLog = () => withStore<LogEntry[]>(STORE_LOG, 'readonly', (s) => s.getAll());
export const putLog = (e: LogEntry) => withStore(STORE_LOG, 'readwrite', (s) => s.put(e));
export const deleteLog = (id: string) => withStore(STORE_LOG, 'readwrite', (s) => s.delete(id));

/** 上限を超えた古い記録を消す。消した件数を返す */
export async function trimLog(limit: number = LOG_LIMIT): Promise<number> {
  const all = (await getAllLog()).sort((a, b) => b.at - a.at);
  const extra = all.slice(limit);
  for (const e of extra) await deleteLog(e.id);
  return extra.length;
}

// ── photos（Blob をそのまま保存） ──
export const putPhoto = (id: string, blob: Blob) => withStore(STORE_PHOTOS, 'readwrite', (s) => s.put(blob, id));
export const getPhoto = (id: string) => withStore<Blob | undefined>(STORE_PHOTOS, 'readonly', (s) => s.get(id));
export const deletePhotoBlob = (id: string) => withStore(STORE_PHOTOS, 'readwrite', (s) => s.delete(id));
export const getAllPhotoKeys = () => withStore<IDBValidKey[]>(STORE_PHOTOS, 'readonly', (s) => s.getAllKeys());

/** ぜんぶ消す（読み込みで置き換えるとき・初期化） */
export async function clearAll(): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_ITEMS, STORE_LOG, STORE_PHOTOS], 'readwrite');
    tx.objectStore(STORE_ITEMS).clear();
    tx.objectStore(STORE_LOG).clear();
    tx.objectStore(STORE_PHOTOS).clear();
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => reject(tx.error);
  });
}
