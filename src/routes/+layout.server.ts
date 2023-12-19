import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { Post } from '$lib/types';

export const prerender = true;

export const load: LayoutServerLoad = async ({ url, fetch }) => {
	const { pathname } = url;

	try {
		const res = await fetch('/api/posts');
		const posts: Post[] = await res.json();

		return { posts, pathname };
	} catch (e) {
		console.error(e);
		throw error(404, `Could not load blog posts`);
	}
};
