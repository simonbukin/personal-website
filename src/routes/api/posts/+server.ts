import { getPosts } from '$lib/utils';
import { json } from '@sveltejs/kit';

export const GET = async () => {
	const posts = await getPosts({
		type: 'posts',
		sort: true,
		filter: (post) => post.published
	});
	return json(posts);
};
