import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { Content } from '$lib/types';

export const prerender = true;

export const load: LayoutServerLoad = async ({ url, fetch }) => {
	const { pathname } = url;

	try {
		const postsRes = await fetch('/api/posts');
		const posts: Content[] = await postsRes.json();
		const bitsRes = await fetch('/api/bits');
		const bits: Content[] = await bitsRes.json();

		return { posts, bits, pathname };
	} catch (e) {
		console.error(e);
		throw error(404, `Could not load blog posts`);
	}
};
