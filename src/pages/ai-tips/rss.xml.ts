import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { site } from '../../lib/site';

export async function GET(context: APIContext) {
  const all = await getCollection('aiTips', ({ data }) => !data.draft);
  const byDateDesc = (a: (typeof all)[number], b: (typeof all)[number]) =>
    b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id);

  return rss({
    title: `教えてAIさん | ${site.name}`,
    description:
      '福祉の現場で役立つ、PC・AIの便利な使い方を「AIに聞いてみた」かたちでご紹介します。',
    site: context.site ?? site.legacyUrl,
    items: all.sort(byDateDesc).map((post) => ({
      title: post.data.title,
      description: post.data.summary,
      pubDate: post.data.date,
      link: `/ai-tips/${post.id}/`,
    })),
    customData: '<language>ja</language>',
  });
}
