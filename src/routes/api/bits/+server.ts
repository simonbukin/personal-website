import { getBits } from '$lib/utils';
import { json } from '@sveltejs/kit';

export const GET = async () => {
	const bits = await getBits({
		type: 'posts',
		sort: true,
		filter: (post) => post.published
	});
	return json(bits);
};
