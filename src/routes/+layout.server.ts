import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { Post } from '$lib/types';
import { getMarkdownPosts } from '$lib/utils';

export const prerender = true;

export const load: LayoutServerLoad = async ({ url }) => {
	const { pathname } = url;

	try {
		const posts: Post[] = await getMarkdownPosts();
		return { posts, pathname };
	} catch (e) {
		console.error(e);
		throw error(404, `Could not load blog posts`);
	}
};
