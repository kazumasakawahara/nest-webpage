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
    summary: z.string().optional(),
    image: z.string().optional(),
    draft: z.boolean().default(false),
    // 一覧の棚分け用。anshin=あんしん編 / series=相棒編・連載本編 / practice=相棒編・実践編 /
    // aibou=相棒編・読みもの / dougu=特集・道具の入手コーナー。未指定は便利ワザ編
    kind: z.enum(['series', 'practice', 'anshin', 'aibou', 'dougu']).optional(),
  }),
});

export const collections = { news, aiTips };
