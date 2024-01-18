import type { Content } from '$lib/types';

export async function GET({ fetch }) {
	const headers = {
		'Cache-Control': `max-age=0, s-max-age=${600}`,
		'Content-Type': 'application/xml'
	};

	const res = await fetch('/api/posts');
	const posts: Content[] = await res.json();

	const body = `<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
      <channel>
        <title>${'Simon Bukin'}</title>
        <link>${'https://www.simonbukin.com'}</link>
        <description>${'A blog dedicated to enjoying the web.'}</description>
        <atom:link href="${'https://www.simonbukin.com'}/rss.xml" rel="self" type="application/rss+xml" />
        ${posts
					.map(
						(post) =>
							`
              <item>
                <guid>${'https://www.simonbukin.com'}/${'posts'}/${post.slug}</guid>
                <title>${post.title}</title>
                <description>${post.description}</description>
                <link>${'https://www.simonbukin.com'}/${'posts'}/${post.slug}</link>
                <pubDate>${new Date(post.date).toUTCString()}</pubDate>
            </item>
          `
					)
					.join('')}
      </channel>
    </rss>`;

	return new Response(body, { status: 200, headers });
}
