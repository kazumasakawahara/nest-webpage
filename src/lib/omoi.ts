// 親なき後ページ「私の想い」コーナー：家族から寄せられた想い（編集部が確認して掲載）の表示ロジック。
// 投稿は src/content/post-parent-omoi/ に1件1ファイル。受付は Google フォーム（scripts/create-watashi-no-omoi-form.gs）

export const OMOI_THEME_KEYS = ['nokositai-kotoba', 'kigakari', 'anshin', 'jiyu'] as const;
export type OmoiTheme = (typeof OMOI_THEME_KEYS)[number];

export const OMOI_THEME_LABELS: Record<OmoiTheme, string> = {
  'nokositai-kotoba': '子どもに遺したい言葉',
  kigakari: 'いま一番気がかりなこと',
  anshin: 'こうなっていたら安心できる',
  jiyu: '自由に',
};

export const OMOI_RELATION_KEYS = ['oya', 'kyodai', 'sofubo', 'sonota'] as const;
export type OmoiRelation = (typeof OMOI_RELATION_KEYS)[number];

export const OMOI_RELATION_LABELS: Record<OmoiRelation, string> = {
  oya: '親',
  kyodai: 'きょうだい',
  sofubo: '祖父母',
  sonota: 'その他の家族',
};

// 投稿フォームの公開URL（Apps Script の実行ログの「公開URL」）。空文字の間は「準備中」を表示する
export const OMOI_FORM_URL = '';

// 新しい順。同じ掲載日はファイル名の連番が大きいほうを先に
export function sortOmoi<T extends { id: string; data: { publishedAt: Date } }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime() || b.id.localeCompare(a.id),
  );
}

// 署名行：「きょうだい・40代／ひまわり」
export function omoiByline(m: { relation: OmoiRelation; ageRange?: string; penName: string }): string {
  const who = [OMOI_RELATION_LABELS[m.relation], m.ageRange].filter(Boolean).join('・');
  return `${who}／${m.penName}`;
}

// 抜粋：改行をつめ、max 字（コードポイント単位）を超えたら「…」
export function omoiExcerpt(body: string, max = 120): string {
  const chars = Array.from(body.replace(/\s+/g, ' ').trim());
  return chars.length > max ? chars.slice(0, max).join('') + '…' : chars.join('');
}
