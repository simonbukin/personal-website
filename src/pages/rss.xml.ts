import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('writing', ({ data }) =>
    data.type === 'post' && data.published
  );

  return rss({
    title: 'Simon Bukin',
    description: 'Design engineer building quality user experiences.',
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/writing/${post.slug}/`,
    })),
  });
}
