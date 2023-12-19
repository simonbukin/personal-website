import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { Post } from '$lib/types';

export const prerender = true;

export const load: LayoutServerLoad = async ({ url }) => {
	const { pathname } = url;

	try {
		const paths = import.meta.glob('/src/posts/*.md', { eager: true });
		const posts: Post[] = [];
		for (const path in paths) {
			const post = await import(path);
			posts.push(post.metadata);
		}

		const sortedPosts = posts.sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
		);
		return { posts: sortedPosts, pathname };
	} catch (e) {
		console.error(e);
		throw error(404, `Could not load blog posts`);
	}
};
