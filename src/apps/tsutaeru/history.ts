import type { HistoryEntry } from './types';

export type Period = 'today' | '7days' | 'all';

const pad = (n: number): string => String(n).padStart(2, '0');

/**
 * 画面表示用の 1 行（`7/16 14:03 きもち → おこってる → とても`）。
 * 日付は年なし・ゼロ埋めなし、時刻はゼロ埋め。書き出しテキスト（export.ts）とは別で、
 * こちらは支援者ゾーンのりれき一覧の 1 行に使う。
 * 日時のあとにテーマ名 → 選ばれたカード列（設計スペック§4、export.ts と同形）。
 * picks が空の場合は `日時 テーマ名` のみ（末尾の矢印・空白なし）。
 */
export function formatRow(e: HistoryEntry): string {
  const d = new Date(e.at);
  const date = `${d.getMonth() + 1}/${d.getDate()}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const line = [e.themeTitle, ...e.picks.map((p) => p.label)].join(' → ');
  return `${date} ${time} ${line}`;
}

/**
 * 期間で絞り込む純関数。`now` は呼び出し側が注入する（テスト決定性のため、
 * ここに Date.now() を埋めない）。
 * - today : now と同じ暦日
 * - 7days : now の当日を含む直近 7 暦日（当日＋前 6 日）の 0 時以降
 * - all   : 全件（同じ配列参照を返す）
 */
export function filterByPeriod(
  entries: HistoryEntry[],
  period: Period,
  now: Date,
): HistoryEntry[] {
  if (period === 'all') return entries;
  if (period === 'today') {
    return entries.filter((e) => sameDay(new Date(e.at), now));
  }
  // '7days'
  const threshold = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 6,
  ).getTime();
  return entries.filter((e) => new Date(e.at).getTime() >= threshold);
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
