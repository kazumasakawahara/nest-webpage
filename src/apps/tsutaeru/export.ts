import type { HistoryEntry } from './types';

const pad = (n: number): string => String(n).padStart(2, '0');

function ymd(d: Date): string {
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
}

/**
 * `2026/07/16 14:03 きもち → おこってる → とても`（mark があれば行頭に `[め] `）。
 * 日時のあとにテーマ名 → 選ばれたカード列（設計スペック§4）。テーマ名がないと
 * 「はい」のような pick 単体では支援記録として意味が取れないため必須。
 * picks が空の場合は `日時 テーマ名` のみ（末尾の矢印・空白なし）。
 */
export function formatEntry(e: HistoryEntry): string {
  const d = new Date(e.at);
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const line = [e.themeTitle, ...e.picks.map((p) => p.label)].join(' → ');
  const body = `${ymd(d)} ${time} ${line}`;
  return e.mark ? `[${e.mark}] ${body}` : body;
}

/**
 * 日付見出し（`■ 2026/07/16`）ごとにグループ化して連結する。
 * グループは日付の新しい順、グループ内は入力順（listHistory が新しい順で渡す前提）。
 * グループ間は空行 1 行。空リストは `きろくは まだありません`。
 */
export function formatEntries(list: HistoryEntry[]): string {
  if (list.length === 0) return 'きろくは まだありません';

  const groups: { date: string; lines: string[] }[] = [];
  for (const e of list) {
    const date = ymd(new Date(e.at));
    let group = groups[groups.length - 1];
    if (!group || group.date !== date) {
      group = { date, lines: [] };
      groups.push(group);
    }
    group.lines.push(formatEntry(e));
  }

  return groups
    .map((g) => [`■ ${g.date}`, ...g.lines].join('\n'))
    .join('\n\n');
}
