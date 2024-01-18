import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	try {
		const blogPost = await import(`../../../content/bits/${params.slug}.md`);

		return {
			content: blogPost.default,
			meta: blogPost.metadata
		};
	} catch (e) {
		console.error(e);
		throw error(404, `Could not find ${params.slug}`);
	}
};
