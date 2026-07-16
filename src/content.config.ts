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
    // 一覧のグルーピング用。series=連載本編 / practice=実践編。未指定は単発Tips
    kind: z.enum(['series', 'practice']).optional(),
  }),
});

export const collections = { news, aiTips };
