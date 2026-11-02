// 教えてAIさん一覧ページの「新着」欄と「NEW」バッジを決める。
// 記事は編（棚）ごとに読む順で並ぶため、新しい記事が棚の末尾に埋もれる。
// そこでページ上部に新着を数本並べ、公開から一定期間の記事には NEW を付ける。

const DAY_MS = 24 * 60 * 60 * 1000;
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** NEW を付けておく日数（公開日を1日目として数える） */
export const NEW_DAYS = 14;

/** 新着欄に並べる本数 */
export const LATEST_COUNT = 3;

/**
 * NEW が外れる時刻。公開日（YYYY-MM-DD を UTC の 0 時として読んだもの）から
 * NEW_DAYS 日目の翌日 0 時（日本時間）
 */
export function newUntil(date: Date, days: number = NEW_DAYS): Date {
  return new Date(date.getTime() + days * DAY_MS - JST_OFFSET_MS);
}

export function isNew(date: Date, now: Date, days: number = NEW_DAYS): boolean {
  return now.getTime() < newUntil(date, days).getTime();
}

interface TipLike {
  id: string;
  data: { date: Date; draft?: boolean; kind?: string; series?: string[] };
}

/** 新しい順に count 本。下書きは除く。同じ日付ならファイル名の後ろ（連番の大きい方）を先に */
export function latestTips<T extends TipLike>(items: T[], count: number = LATEST_COUNT): T[] {
  return items
    .filter((item) => !item.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || b.id.localeCompare(a.id))
    .slice(0, count);
}

// 特集の名前（一覧ページの特集ボックスの見出しの頭の部分）
const FEATURE_NAMES: Record<string, string> = {
  dougu: '道具の入手',
  haiyu: 'AIは俳優',
  google: 'Googleの道具箱',
  asobi: '道具箱で、あそぶ',
  genko: '原稿編',
  ronbun: '論文編',
  oshieru: 'AIさんに、教える',
  kiroku: '撮るだけじゃ、もったいない',
  onegai: 'こんな風にお願いするといいよ',
};

/** 新着欄で記事に添える「どの棚の記事か」の札。特集にも並ぶ記事は特集名を添える */
export function shelfLabel(item: TipLike): string {
  const { kind, series } = item.data;
  if (kind === 'dougu' || kind === 'haiyu') return `特集・${FEATURE_NAMES[kind]}`;
  const feature = (series ?? []).find((s) => s in FEATURE_NAMES);
  const shelf =
    kind === 'anshin'
      ? 'あんしん編'
      : kind === 'series' || kind === 'practice' || kind === 'aibou'
        ? '相棒編'
        : '便利ワザ編';
  return feature ? `${shelf}／特集・${FEATURE_NAMES[feature]}` : shelf;
}
