import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	try {
		const blogPost = await import(`../../../posts/${params.slug}.md`);

		console.log(blogPost.metadata.description);

		return {
			content: blogPost.default,
			meta: blogPost.metadata
		};
	} catch (e) {
		console.error(e);
		throw error(404, `Could not find ${params.slug}`);
	}
};
