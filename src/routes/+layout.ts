import type { LayoutServerLoad } from './$types';

export const prerender = true;

export const load: LayoutServerLoad = async ({ url }) => {
	const { pathname } = url;

	return {
		pathname
	};
};
