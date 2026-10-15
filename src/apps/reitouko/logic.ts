// れいとうこチェッカー — 純粋ロジック（ブラウザ API に触れない。vitest で検証）。
import type { Backup, Category, Item, LogEntry } from './types';

export const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'meat', label: 'お肉', emoji: '🥩' },
  { id: 'fish', label: 'お魚', emoji: '🐟' },
  { id: 'veg', label: '野菜・くだもの', emoji: '🥦' },
  { id: 'rice', label: 'ごはん・パン・めん', emoji: '🍚' },
  { id: 'dish', label: 'おかず・作りおき', emoji: '🍱' },
  { id: 'other', label: 'そのほか', emoji: '🧊' },
];

export const UNITS = ['こ', '袋', 'パック', '食分', '切れ', '枚', '本'];

/** 冷凍した日から「めやす」までの既定日数（家庭用冷凍はおおむね1か月が目安） */
export const DEFAULT_BESTBY_DAYS = 30;
/** 「そろそろ」と知らせ始める、めやす日までの残り日数 */
export const SOON_DAYS = 7;

export function categoryOf(id: string): { id: Category; label: string; emoji: string } {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}

// ── 日付（端末のローカル日付を YYYY-MM-DD で扱う） ───────────────────────────

const pad2 = (n: number) => String(n).padStart(2, '0');

export function toYmd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function todayStr(now: Date = new Date()): string {
  return toYmd(now);
}

/** YYYY-MM-DD → ローカル 0 時の Date。形式が違えば null */
export function parseYmd(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (d.getFullYear() !== Number(m[1]) || d.getMonth() !== Number(m[2]) - 1 || d.getDate() !== Number(m[3])) return null;
  return d;
}

export function isYmd(s: unknown): s is string {
  return typeof s === 'string' && parseYmd(s) !== null;
}

export function addDays(ymd: string, n: number): string {
  const d = parseYmd(ymd);
  if (!d) return ymd;
  d.setDate(d.getDate() + n);
  return toYmd(d);
}

/** to − from を日数で（夏時間ずれは四捨五入で吸収）。どちらかが不正なら 0 */
export function daysBetween(from: string, to: string): number {
  const a = parseYmd(from);
  const b = parseYmd(to);
  if (!a || !b) return 0;
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/** 10月3日 ／ 年が違えば 2025年10月3日 */
export function formatDateJa(ymd: string, today: string): string {
  const d = parseYmd(ymd);
  if (!d) return ymd;
  const t = parseYmd(today);
  const sameYear = t ? t.getFullYear() === d.getFullYear() : true;
  return `${sameYear ? '' : `${d.getFullYear()}年`}${d.getMonth() + 1}月${d.getDate()}日`;
}

/** 10/3 12:30 */
export function formatStampJa(at: number): string {
  const d = new Date(at);
  return `${d.getMonth() + 1}/${d.getDate()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

// ── 鮮度（めやす日との関係） ────────────────────────────────────────────────

export type FreshLevel = 'ok' | 'soon' | 'over';
export interface Freshness {
  level: FreshLevel;
  /** めやす日までの残り日数（負なら過ぎている） */
  daysLeft: number;
  /** 冷凍してからの日数 */
  frozenDays: number;
  /** 画面に出す短い言葉 */
  label: string;
}

export function freshness(item: Pick<Item, 'frozenOn' | 'bestBy'>, today: string): Freshness {
  const daysLeft = daysBetween(today, item.bestBy);
  const frozenDays = daysBetween(item.frozenOn, today);
  if (daysLeft < 0) return { level: 'over', daysLeft, frozenDays, label: `めやすを ${-daysLeft}日 すぎた` };
  if (daysLeft === 0) return { level: 'soon', daysLeft, frozenDays, label: 'きょうが めやす' };
  if (daysLeft <= SOON_DAYS) return { level: 'soon', daysLeft, frozenDays, label: `あと ${daysLeft}日` };
  return { level: 'ok', daysLeft, frozenDays, label: `あと ${daysLeft}日` };
}

/** 冷凍してからの日数の言い方：0 → きょう、1 → 1日め */
export function frozenDaysLabel(n: number): string {
  return n <= 0 ? 'きょう' : `${n}日め`;
}

export interface Summary {
  /** 在庫の品目数 */
  total: number;
  /** 在庫の合計数量 */
  pieces: number;
  soon: number;
  over: number;
}

export function summarize(items: Item[], today: string): Summary {
  const s: Summary = { total: 0, pieces: 0, soon: 0, over: 0 };
  for (const it of items) {
    if (it.status !== 'in') continue;
    s.total += 1;
    s.pieces += it.qty;
    const f = freshness(it, today).level;
    if (f === 'soon') s.soon += 1;
    if (f === 'over') s.over += 1;
  }
  return s;
}

// ── 並び替え・絞り込み ──────────────────────────────────────────────────────

export type SortMode = 'soon' | 'oldest' | 'newest' | 'name';

export const SORT_LABELS: Record<SortMode, string> = {
  soon: 'めやすが近い順',
  oldest: '冷凍が古い順',
  newest: '冷凍が新しい順',
  name: '名前順',
};

export function sortItems(items: Item[], mode: SortMode): Item[] {
  const arr = items.slice();
  const byName = (a: Item, b: Item) => a.name.localeCompare(b.name, 'ja');
  switch (mode) {
    case 'soon':
      arr.sort((a, b) => a.bestBy.localeCompare(b.bestBy) || a.frozenOn.localeCompare(b.frozenOn) || byName(a, b));
      break;
    case 'oldest':
      arr.sort((a, b) => a.frozenOn.localeCompare(b.frozenOn) || a.createdAt - b.createdAt);
      break;
    case 'newest':
      arr.sort((a, b) => b.frozenOn.localeCompare(a.frozenOn) || b.createdAt - a.createdAt);
      break;
    case 'name':
      arr.sort(byName);
      break;
  }
  return arr;
}

/** 検索語の正規化：前後の空白を落とし、全角英数→半角、カタカナ→ひらがな、小文字化 */
export function normalizeQuery(q: string): string {
  return q
    .trim()
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

export function filterItems(
  items: Item[],
  opts: { category?: Category | 'all'; query?: string; status?: Item['status'] },
): Item[] {
  const q = normalizeQuery(opts.query ?? '');
  const status = opts.status ?? 'in';
  return items.filter((it) => {
    if (it.status !== status) return false;
    if (opts.category && opts.category !== 'all' && it.category !== opts.category) return false;
    if (q && !normalizeQuery(`${it.name} ${it.memo}`).includes(q)) return false;
    return true;
  });
}

// ── 絵文字（名前の部分一致。見つからなければ付けない） ────────────────────

const EMOJI: [string, string][] = [
  ['とり', '🍗'], ['鶏', '🍗'], ['チキン', '🍗'], ['ささみ', '🍗'], ['手羽', '🍗'],
  ['ぶた', '🥓'], ['豚', '🥓'], ['ベーコン', '🥓'], ['ハム', '🥓'], ['ソーセージ', '🌭'], ['ウインナー', '🌭'],
  ['ぎゅう', '🥩'], ['牛', '🥩'], ['ひき肉', '🥩'], ['ミンチ', '🥩'], ['肉', '🥩'],
  ['さけ', '🐟'], ['鮭', '🐟'], ['サーモン', '🐟'], ['さば', '🐟'], ['鯖', '🐟'], ['あじ', '🐟'], ['魚', '🐟'], ['切り身', '🐟'],
  ['えび', '🦐'], ['海老', '🦐'], ['いか', '🦑'], ['たこ', '🐙'], ['しらす', '🐟'], ['ちりめん', '🐟'],
  ['ごはん', '🍚'], ['ご飯', '🍚'], ['米', '🍚'], ['おにぎり', '🍙'], ['パン', '🍞'], ['食パン', '🍞'],
  ['うどん', '🍜'], ['そば', '🍜'], ['ラーメン', '🍜'], ['めん', '🍜'], ['麺', '🍜'], ['パスタ', '🍝'], ['スパゲ', '🍝'],
  ['ぎょうざ', '🥟'], ['餃子', '🥟'], ['しゅうまい', '🥟'], ['シュウマイ', '🥟'], ['肉まん', '🥟'],
  ['カレー', '🍛'], ['シチュー', '🍲'], ['スープ', '🍲'], ['みそ汁', '🍲'], ['汁', '🍲'], ['鍋', '🍲'],
  ['ハンバーグ', '🍔'], ['からあげ', '🍗'], ['唐揚げ', '🍗'], ['コロッケ', '🥔'], ['フライ', '🍤'], ['天ぷら', '🍤'],
  ['ピザ', '🍕'], ['グラタン', '🧀'], ['チーズ', '🧀'], ['バター', '🧈'],
  ['ほうれん', '🥬'], ['小松菜', '🥬'], ['ブロッコリー', '🥦'], ['枝豆', '🫛'], ['えだまめ', '🫛'], ['豆', '🫘'],
  ['コーン', '🌽'], ['とうもろこし', '🌽'], ['にんじん', '🥕'], ['人参', '🥕'], ['たまねぎ', '🧅'], ['玉ねぎ', '🧅'],
  ['きのこ', '🍄'], ['しめじ', '🍄'], ['しいたけ', '🍄'], ['じゃがいも', '🥔'], ['ポテト', '🍟'], ['かぼちゃ', '🎃'],
  ['ねぎ', '🥬'], ['野菜', '🥦'], ['ミックスベジ', '🥕'],
  ['いちご', '🍓'], ['バナナ', '🍌'], ['ブルーベリー', '🫐'], ['ぶどう', '🍇'], ['マンゴー', '🥭'], ['くだもの', '🍎'], ['果物', '🍎'],
  ['アイス', '🍦'], ['ケーキ', '🍰'], ['プリン', '🍮'], ['おやつ', '🍪'], ['たい焼き', '🐟'], ['だんご', '🍡'],
  ['たまご', '🥚'], ['卵', '🥚'], ['とうふ', '🧊'], ['豆腐', '🧊'], ['油あげ', '🟫'], ['納豆', '🫘'],
  ['だし', '🫙'], ['保冷', '🧊'], ['氷', '🧊'],
];

export function guessEmoji(name: string): string {
  const hit = EMOJI.find(([k]) => name.includes(k));
  return hit ? hit[1] : '';
}

/** 先頭が絵文字ならそのまま、そうでなければ辞書で見つかった絵文字を前に付ける */
export function withEmoji(name: string): string {
  const v = name.trim();
  if (!v) return v;
  if (/^\p{Extended_Pictographic}/u.test(v)) return v;
  const e = guessEmoji(v);
  return e ? `${e} ${v}` : v;
}

// ── 入庫・出庫 ───────────────────────────────────────────────────────────────

export interface NewItemInput {
  id: string;
  name: string;
  qty: number;
  unit: string;
  category: Category;
  frozenOn: string;
  bestBy?: string;
  memo?: string;
  photoId?: string | null;
}

export function newItem(input: NewItemInput, now: number): Item {
  const cat = categoryOf(input.category);
  const name = withEmoji(input.name) || `${cat.emoji} ${cat.label}`;
  const qty = Math.max(1, Math.floor(Number(input.qty) || 1));
  const frozenOn = isYmd(input.frozenOn) ? input.frozenOn : todayStr(new Date(now));
  const bestBy = input.bestBy && isYmd(input.bestBy) ? input.bestBy : addDays(frozenOn, DEFAULT_BESTBY_DAYS);
  return {
    id: input.id,
    name,
    qty,
    unit: input.unit || UNITS[0],
    category: cat.id,
    frozenOn,
    bestBy,
    memo: (input.memo ?? '').trim(),
    photoId: input.photoId ?? null,
    status: 'in',
    usedOn: null,
    createdAt: now,
    updatedAt: now,
  };
}

/** n つ出庫。0 になったら「使いきり」へ。元の item は変えない */
export function takeOut(item: Item, n: number, today: string, now: number): Item {
  const take = Math.max(1, Math.floor(n));
  const qty = Math.max(0, item.qty - take);
  if (qty === 0) return { ...item, qty: 0, status: 'used', usedOn: today, updatedAt: now };
  return { ...item, qty, updatedAt: now };
}

/** 使いきりから在庫へもどす（数量は 1 から） */
export function restoreItem(item: Item, now: number): Item {
  return { ...item, status: 'in', qty: Math.max(1, item.qty), usedOn: null, updatedAt: now };
}

export const LOG_LABELS: Record<LogEntry['type'], string> = {
  in: '入庫',
  out: '出庫',
  restore: 'もどす',
  delete: '消去',
};

export function logLine(e: LogEntry): string {
  return `${formatStampJa(e.at)}　${LOG_LABELS[e.type]}　${e.name} ×${e.qty}`;
}

// ── バックアップの検査（読み込み時。壊れたファイルを黙って取り込まない） ──

const CATEGORY_IDS = new Set<string>(CATEGORIES.map((c) => c.id));

export function isValidItem(x: unknown): x is Item {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === 'string' && o.id.length > 0 &&
    typeof o.name === 'string' &&
    typeof o.qty === 'number' && Number.isFinite(o.qty) && o.qty >= 0 &&
    typeof o.unit === 'string' &&
    typeof o.category === 'string' && CATEGORY_IDS.has(o.category) &&
    isYmd(o.frozenOn) && isYmd(o.bestBy) &&
    typeof o.memo === 'string' &&
    (o.photoId === null || typeof o.photoId === 'string') &&
    (o.status === 'in' || o.status === 'used') &&
    (o.usedOn === null || isYmd(o.usedOn)) &&
    typeof o.createdAt === 'number' && typeof o.updatedAt === 'number'
  );
}

export function isValidLog(x: unknown): x is LogEntry {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.type === 'string' && o.type in LOG_LABELS &&
    typeof o.itemId === 'string' &&
    typeof o.name === 'string' &&
    typeof o.qty === 'number' &&
    typeof o.at === 'number'
  );
}

/** 読み込んだ JSON を検査し、通ったものだけを返す。形式が違えば null */
export function parseBackup(raw: unknown): Backup | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (o.app !== 'reitouko' || o.version !== 1) return null;
  if (!Array.isArray(o.items) || !Array.isArray(o.log)) return null;
  const items = o.items.filter(isValidItem);
  const log = o.log.filter(isValidLog);
  const photos: Record<string, string> = {};
  if (o.photos && typeof o.photos === 'object') {
    for (const [k, v] of Object.entries(o.photos as Record<string, unknown>)) {
      if (typeof v === 'string' && v.startsWith('data:image/')) photos[k] = v;
    }
  }
  return { app: 'reitouko', version: 1, exportedAt: typeof o.exportedAt === 'number' ? o.exportedAt : 0, items, log, photos };
}
