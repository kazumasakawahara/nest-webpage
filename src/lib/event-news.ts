// nest News のイベント記事（告知と開催報告）の表示を決める。
// 告知の frontmatter に eventDate（開催日）、報告の frontmatter に reportOf（告知記事の id）を書くと、
// 告知の記事ページの冒頭に「満席」「終了」「開催報告はこちら」のどれを出すかがここで決まる。

const DAY_MS = 24 * 60 * 60 * 1000;
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 開催日（YYYY-MM-DD を UTC の 0 時として読んだもの）の翌日 0 時（日本時間）。これ以降は「終了」 */
export function eventEndsAt(eventDate: Date): Date {
  return new Date(eventDate.getTime() + DAY_MS - JST_OFFSET_MS);
}

export function isEventOver(eventDate: Date, now: Date): boolean {
  return now.getTime() >= eventEndsAt(eventDate).getTime();
}

interface NewsLike {
  id: string;
  data: { reportOf?: string; draft?: boolean; date: Date };
}

/** 告知記事 id に対する開催報告。下書きは除き、複数あれば新しいもの */
export function findReport<T extends NewsLike>(items: T[], announcementId: string): T | undefined {
  return items
    .filter((item) => !item.data.draft && item.data.reportOf === announcementId)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())[0];
}

export type EventNotice = 'report' | 'over' | 'soldOut' | 'none';

/**
 * 告知記事の冒頭に出すお知らせ。報告があれば報告へ案内し、開催日を過ぎていれば終了、
 * その前で満席なら満席。開催日のない記事（これまでの記事）は満席かどうかだけで決まる
 */
export function eventNotice(
  opts: { eventDate?: Date; soldOut: boolean; hasReport: boolean },
  now: Date,
): EventNotice {
  if (opts.hasReport) return 'report';
  if (opts.eventDate && isEventOver(opts.eventDate, now)) return 'over';
  if (opts.soldOut) return 'soldOut';
  return 'none';
}
