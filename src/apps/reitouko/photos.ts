// 冷凍庫チェッカー — 写真の縮小と、表示用 URL の管理（ブラウザ専用）。
// 写真は端末の IndexedDB にだけ置く。アップロードも解析もしない。
import { deletePhotoBlob, getPhoto, putPhoto } from './db';

/** 冷凍庫の中身が分かれば十分なので、長辺 640px・JPEG 品質 0.8 に落とす */
export const MAX_LONG_SIDE = 640;

/** 純粋：長辺が max を超えないよう縮める（拡大はしない。端数は四捨五入） */
export function fitSize(w: number, h: number, max: number): { w: number; h: number } {
  const long = Math.max(w, h);
  if (long <= max) return { w, h };
  const scale = max / long;
  return { w: Math.round(w * scale), h: Math.round(h * scale) };
}

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image load failed')); };
    img.src = url;
  });
}

/** 画像ファイルを読み、縮小した JPEG Blob を返す。読めないファイルは reject */
export async function resizeToBlob(file: Blob, max: number = MAX_LONG_SIDE): Promise<Blob> {
  const img = await loadImage(file);
  const { w, h } = fitSize(img.naturalWidth || img.width, img.naturalHeight || img.height, max);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d context unavailable');
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('canvas export failed'))), 'image/jpeg', 0.8);
  });
}

// 表示用 object URL は写真ごとに 1 つだけ作って使い回す（描画のたびに増やさない）
const urlCache = new Map<string, string>();

export async function savePhoto(blob: Blob): Promise<string> {
  const id = crypto.randomUUID();
  await putPhoto(id, blob);
  return id;
}

export async function getPhotoURL(id: string): Promise<string | null> {
  const cached = urlCache.get(id);
  if (cached) return cached;
  const blob = await getPhoto(id);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urlCache.set(id, url);
  return url;
}

export function peekPhotoURL(id: string): string | null {
  return urlCache.get(id) ?? null;
}

export async function deletePhoto(id: string): Promise<void> {
  const url = urlCache.get(id);
  if (url) { URL.revokeObjectURL(url); urlCache.delete(id); }
  await deletePhotoBlob(id);
}

// ── バックアップ用（Blob ⇄ data: URL） ──
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

export async function dataURLToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}
