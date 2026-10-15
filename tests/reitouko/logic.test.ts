import { describe, it, expect } from 'vitest';
import {
  CATEGORIES,
  DEFAULT_BESTBY_DAYS,
  addDays,
  daysBetween,
  filterItems,
  formatDateJa,
  freshness,
  frozenDaysLabel,
  guessEmoji,
  isValidItem,
  logLine,
  newItem,
  normalizeQuery,
  parseBackup,
  parseYmd,
  restoreItem,
  sortItems,
  summarize,
  takeOut,
  toYmd,
  withEmoji,
} from '~/apps/reitouko/logic';
import type { Item } from '~/apps/reitouko/types';

const base = (over: Partial<Item> = {}): Item => ({
  id: 'a',
  name: '🍗 とり肉',
  qty: 2,
  unit: 'パック',
  category: 'meat',
  frozenOn: '2026-10-01',
  bestBy: '2026-10-31',
  memo: '',
  photoId: null,
  status: 'in',
  usedOn: null,
  createdAt: 1,
  updatedAt: 1,
  ...over,
});

describe('日付', () => {
  it('parseYmd は実在しない日付を弾く', () => {
    expect(parseYmd('2026-02-30')).toBeNull();
    expect(parseYmd('2026-2-3')).toBeNull();
    expect(parseYmd('2026-10-15')?.getDate()).toBe(15);
  });
  it('addDays は月またぎ・年またぎを正しく数える', () => {
    expect(addDays('2026-10-15', 30)).toBe('2026-11-14');
    expect(addDays('2026-12-25', 10)).toBe('2027-01-04');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
  it('daysBetween は to − from（負もあり得る）', () => {
    expect(daysBetween('2026-10-01', '2026-10-15')).toBe(14);
    expect(daysBetween('2026-10-15', '2026-10-01')).toBe(-14);
    expect(daysBetween('bad', '2026-10-01')).toBe(0);
  });
  it('toYmd は 0 埋め', () => {
    expect(toYmd(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
  it('formatDateJa は同じ年なら年を省く', () => {
    expect(formatDateJa('2026-10-03', '2026-10-15')).toBe('10月3日');
    expect(formatDateJa('2025-12-30', '2026-01-02')).toBe('2025年12月30日');
  });
});

describe('freshness', () => {
  it('めやすまで 8 日以上は ok', () => {
    const f = freshness({ frozenOn: '2026-10-01', bestBy: '2026-10-31' }, '2026-10-15');
    expect(f).toEqual({ level: 'ok', daysLeft: 16, frozenDays: 14, label: 'あと 16日' });
  });
  it('7 日以内は soon、当日は専用の言葉', () => {
    expect(freshness({ frozenOn: '2026-10-01', bestBy: '2026-10-20' }, '2026-10-15').level).toBe('soon');
    expect(freshness({ frozenOn: '2026-10-01', bestBy: '2026-10-15' }, '2026-10-15').label).toBe('きょうが めやす');
  });
  it('過ぎたら over と日数', () => {
    const f = freshness({ frozenOn: '2026-08-01', bestBy: '2026-10-10' }, '2026-10-15');
    expect(f.level).toBe('over');
    expect(f.label).toBe('めやすを 5日 すぎた');
  });
});

describe('frozenDaysLabel', () => {
  it('0 日は「きょう」', () => {
    expect(frozenDaysLabel(0)).toBe('きょう');
    expect(frozenDaysLabel(14)).toBe('14日め');
  });
});

describe('summarize', () => {
  it('在庫だけを数え、そろそろ・めやす超えを分ける', () => {
    const items = [
      base({ id: '1', qty: 2 }),
      base({ id: '2', qty: 3, bestBy: '2026-10-18' }),
      base({ id: '3', qty: 1, bestBy: '2026-10-01' }),
      base({ id: '4', qty: 5, status: 'used' }),
    ];
    expect(summarize(items, '2026-10-15')).toEqual({ total: 3, pieces: 6, soon: 1, over: 1 });
  });
});

describe('sortItems / filterItems', () => {
  const items = [
    base({ id: 'b', name: 'カレー', frozenOn: '2026-10-05', bestBy: '2026-11-04', category: 'dish', createdAt: 2 }),
    base({ id: 'a', name: 'あじ', frozenOn: '2026-09-01', bestBy: '2026-10-01', category: 'fish', createdAt: 1 }),
    base({ id: 'c', name: 'とり肉', frozenOn: '2026-10-05', bestBy: '2026-10-20', category: 'meat', createdAt: 3 }),
    base({ id: 'u', name: 'つかった', status: 'used' }),
  ];
  it('soon はめやす日の早い順', () => {
    expect(sortItems(items.slice(0, 3), 'soon').map((i) => i.id)).toEqual(['a', 'c', 'b']);
  });
  it('oldest / newest は冷凍日、同じ日なら登録順', () => {
    expect(sortItems(items.slice(0, 3), 'oldest').map((i) => i.id)).toEqual(['a', 'b', 'c']);
    expect(sortItems(items.slice(0, 3), 'newest').map((i) => i.id)).toEqual(['c', 'b', 'a']);
  });
  it('name は日本語の並び', () => {
    expect(sortItems(items.slice(0, 3), 'name').map((i) => i.name)).toEqual(['あじ', 'カレー', 'とり肉']);
  });
  it('元の配列は変えない', () => {
    const before = items.map((i) => i.id);
    sortItems(items, 'name');
    expect(items.map((i) => i.id)).toEqual(before);
  });
  it('filter は既定で在庫だけ、しゅるいと検索語で絞れる', () => {
    expect(filterItems(items, {}).map((i) => i.id)).toEqual(['b', 'a', 'c']);
    expect(filterItems(items, { category: 'meat' }).map((i) => i.id)).toEqual(['c']);
    expect(filterItems(items, { query: 'かれー' }).map((i) => i.id)).toEqual(['b']);
    expect(filterItems(items, { status: 'used' }).map((i) => i.id)).toEqual(['u']);
  });
  it('normalizeQuery は全角・カタカナ・大文字をそろえる', () => {
    expect(normalizeQuery(' ＡＢＣ カレー ')).toBe('abc かれー');
  });
});

describe('絵文字', () => {
  it('部分一致で付け、先頭が絵文字なら付けない', () => {
    expect(guessEmoji('とり肉')).toBe('🍗');
    expect(withEmoji('ほうれん草')).toBe('🥬 ほうれん草');
    expect(withEmoji('🍛 カレー')).toBe('🍛 カレー');
    expect(withEmoji('なぞのもの')).toBe('なぞのもの');
    expect(withEmoji('   ')).toBe('');
  });
});

describe('newItem', () => {
  const now = new Date(2026, 9, 15, 12).getTime();
  it('名前が空ならしゅるいの名前、めやすは既定で +30 日', () => {
    const it = newItem({ id: 'x', name: '', qty: 0, unit: '', category: 'fish', frozenOn: '2026-10-15' }, now);
    expect(it.name).toBe('🐟 お魚');
    expect(it.qty).toBe(1);
    expect(it.unit).toBe('こ');
    expect(it.bestBy).toBe(addDays('2026-10-15', DEFAULT_BESTBY_DAYS));
    expect(it.status).toBe('in');
  });
  it('不正な日付は今日に、不正なしゅるいは「そのほか」に', () => {
    const it = newItem({ id: 'x', name: 'x', qty: 2.7, unit: '袋', category: 'nope' as never, frozenOn: 'bad' }, now);
    expect(it.frozenOn).toBe('2026-10-15');
    expect(it.category).toBe('other');
    expect(it.qty).toBe(2);
  });
  it('CATEGORIES の id は重複しない', () => {
    expect(new Set(CATEGORIES.map((c) => c.id)).size).toBe(CATEGORIES.length);
  });
});

describe('takeOut / restoreItem', () => {
  it('1 つ出すと減り、0 で使いきりになる', () => {
    const a = takeOut(base({ qty: 2 }), 1, '2026-10-15', 9);
    expect(a.qty).toBe(1);
    expect(a.status).toBe('in');
    const b = takeOut(a, 1, '2026-10-16', 10);
    expect(b).toMatchObject({ qty: 0, status: 'used', usedOn: '2026-10-16', updatedAt: 10 });
  });
  it('多く出しても 0 で止まる。元は変えない', () => {
    const src = base({ qty: 2 });
    const out = takeOut(src, 5, '2026-10-15', 9);
    expect(out.qty).toBe(0);
    expect(src.qty).toBe(2);
  });
  it('もどすと在庫に（数量は 1 以上）', () => {
    const used = takeOut(base({ qty: 1 }), 1, '2026-10-15', 9);
    expect(restoreItem(used, 11)).toMatchObject({ status: 'in', qty: 1, usedOn: null, updatedAt: 11 });
  });
});

describe('logLine', () => {
  it('日時・種別・名前・数量', () => {
    const at = new Date(2026, 9, 3, 12, 5).getTime();
    expect(logLine({ id: 'l', type: 'out', itemId: 'a', name: 'とり肉', qty: 1, at })).toBe('10/3 12:05　出庫　とり肉 ×1');
  });
});

describe('バックアップの検査', () => {
  it('isValidItem は壊れたレコードを弾く', () => {
    expect(isValidItem(base())).toBe(true);
    expect(isValidItem({ ...base(), qty: 'two' })).toBe(false);
    expect(isValidItem({ ...base(), category: 'drink' })).toBe(false);
    expect(isValidItem({ ...base(), bestBy: '2026-13-01' })).toBe(false);
    expect(isValidItem(null)).toBe(false);
  });
  it('parseBackup は形式が違えば null、通ったものだけ残す', () => {
    expect(parseBackup({ app: 'other', version: 1, items: [], log: [] })).toBeNull();
    expect(parseBackup('x')).toBeNull();
    const b = parseBackup({
      app: 'reitouko',
      version: 1,
      exportedAt: 5,
      items: [base(), { bad: true }],
      log: [{ id: 'l', type: 'in', itemId: 'a', name: 'x', qty: 1, at: 1 }, { nope: 1 }],
      photos: { p1: 'data:image/jpeg;base64,AAA', p2: 'http://evil', p3: 7 },
    });
    expect(b?.items).toHaveLength(1);
    expect(b?.log).toHaveLength(1);
    expect(Object.keys(b?.photos ?? {})).toEqual(['p1']);
    expect(b?.exportedAt).toBe(5);
  });
});
