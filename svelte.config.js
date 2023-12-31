import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';
import { join } from 'path';
import { mdsvex, escapeSvelte } from 'mdsvex';
import shiki from 'shiki';

const catpuccino = await shiki.loadTheme(join(process.cwd(), './custom-themes/mocha.json'));

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	extensions: ['.md'],
	layout: {
		_: './src/mdsvex.svelte'
	},
	highlight: {
		highlighter: async (code, lang = 'text') => {
			const highlighter = await shiki.getHighlighter({ theme: catpuccino });
			const html = escapeSvelte(highlighter.codeToHtml(code, { lang }));
			return `{@html \`${html}\` }`;
		}
	}
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [vitePreprocess({ postcss: true }), mdsvex(mdsvexOptions)],

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		prerender: {
			crawl: true,
			entries: [
				'*',
				'/blog/beep-boop',
				'/blog/logging-spotify',
				'/blog/python-tips',
				'/blog/python-virtual-environments',
				'/portfolio/gcs-security',
				'/portfolio/sagemaker-onboarding'
			]
		}
	}
};

export default config;
