import type { HistoryEntry } from './types';

const pad = (n: number): string => String(n).padStart(2, '0');

function ymd(d: Date): string {
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
}

/** `2026/07/16 14:03 きもち → おこってる → とても`（mark があれば行頭に `[め] `）。 */
export function formatEntry(e: HistoryEntry): string {
  const d = new Date(e.at);
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const picks = e.picks.map((p) => p.label).join(' → ');
  const body = `${ymd(d)} ${time} ${picks}`;
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
