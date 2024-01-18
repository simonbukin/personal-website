import { getBits } from '$lib/utils';
import { json } from '@sveltejs/kit';

export const GET = async () => {
	const bits = await getBits();
	return json(bits);
};
