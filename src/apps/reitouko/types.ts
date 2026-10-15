// 冷凍庫チェッカー — 型定義。
// データはすべて端末内（IndexedDB）に置き、サーバーには送らない（姉妹アプリと同じ約束）。

export type Category = 'meat' | 'fish' | 'veg' | 'rice' | 'dish' | 'other';
export type Status = 'in' | 'used';

export interface Item {
  id: string;
  name: string;
  qty: number;
  unit: string;
  category: Category;
  /** 冷凍した日（YYYY-MM-DD、端末のローカル日付） */
  frozenOn: string;
  /** 食べきりの「めやす」日（YYYY-MM-DD） */
  bestBy: string;
  memo: string;
  /** photos ストアのキー。写真なしなら null */
  photoId: string | null;
  status: Status;
  /** 使いきった日（status が used のとき） */
  usedOn: string | null;
  createdAt: number;
  updatedAt: number;
}

export type LogType = 'in' | 'out' | 'restore' | 'delete';

export interface LogEntry {
  id: string;
  type: LogType;
  itemId: string;
  name: string;
  qty: number;
  at: number;
}

/** バックアップ（書き出し／読み込み）のファイル形式 */
export interface Backup {
  app: 'reitouko';
  version: 1;
  exportedAt: number;
  items: Item[];
  log: LogEntry[];
  /** photoId → data: URL（JPEG） */
  photos: Record<string, string>;
}
