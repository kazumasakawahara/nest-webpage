import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().optional(),
    tag: z.enum(['お知らせ', 'イベント', '事業所', 'メディア']).default('お知らせ'),
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const aiTips = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/ai-tips' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    // 公開後に中身を手直ししたとき（AIの画面が変わった等）。記事ページの日付の横に「◯◯ 更新」と出る
    updated: z.coerce.date().optional(),
    summary: z.string().optional(),
    image: z.string().optional(),
    draft: z.boolean().default(false),
    // 記事ページの見出しだけ、行ごとに折り返しを固定したいとき（一覧や <title> は title をそのまま使う）。
    // 1要素＝1行。行の中を「|」で区切ると文節になり、狭い画面ではその境目でしか折れない。
    titleLines: z.array(z.string()).optional(),
    // 一覧の棚分け用。anshin=あんしん編 / series=相棒編・連載本編 / practice=相棒編・実践編 /
    // aibou=相棒編・読みもの / dougu=特集・道具の入手コーナー / haiyu=特集・AIは俳優。未指定は便利ワザ編
    kind: z.enum(['series', 'practice', 'anshin', 'aibou', 'dougu', 'haiyu']).optional(),
    // 棚（kind）とは別の「特集への併載」。記事は元の棚に残したまま、特集ブロックにも並ぶ。
    // 特集専属の記事は kind に特集名を持ち、series は不要（kind===特集名 も特集ブロックに入る）
    // oshieru=特集・AIさんに、教える（好きな分野から入る。読者が先生、AIが新人）
    // kiroku=特集・撮るだけじゃ、もったいない（なんでも箱 raw に放り込み、AIが仕分けて糸を張る）
    // onegai=特集・こんな風にお願いするといいよ（うまくいった頼み方を一つずつ。常設型で「全N回」と数えない）
    series: z.array(z.enum(['dougu', 'haiyu', 'google', 'asobi', 'genko', 'ronbun', 'oshieru', 'kiroku', 'onegai'])).optional(),
  }),
});

// トピック：法律・制度の改正を解説する常設コーナー（/topics/）
const topics = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/topics' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// 意思決定支援ページの「寄稿」：外部・内部の執筆者による読みもの（/sudachi/decision-support/<slug>/）
const decisionSupport = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/decision-support' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().optional(),
    author: z.string(),
    // 肩書き・所属（署名行で author の前に表示）
    authorTitle: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// 親なき後ページの「寄稿」：外部・内部の執筆者による読みもの（/post-parent/column/<slug>/）
const postParentColumn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/post-parent' }),
  schema: z.object({
    title: z.string(),
    // 副題（記事ページの題の下に「― 副題 ―」として表示）
    subtitle: z.string().optional(),
    // 題の折り返しを固定したいとき。1要素＝1行、行の中を「|」で区切ると文節になり、狭い画面ではその境目でしか折れない
    titleLines: z.array(z.string()).optional(),
    date: z.coerce.date(),
    summary: z.string().optional(),
    author: z.string(),
    // 肩書き・所属（署名行で author の前に表示）
    authorTitle: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { news, aiTips, topics, decisionSupport, postParentColumn };
