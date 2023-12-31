/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {},
		fontFamily: {
			sans: ['Karla', 'sans-serif'],
			serif: ['Hedvig Letters Serif', 'serif'],
			mono: ['Fira Code', 'mono']
		}
	},
	plugins: []
};
