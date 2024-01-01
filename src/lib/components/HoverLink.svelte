<script lang="ts">
	import { themeColors } from '$lib/config';
	import { pickRandom } from '$lib/utils';
	export let href: string;
	export let speed: number = 0.1;
	export let newTab: boolean = true;

	let redirect = newTab ? '_blank' : '';

	// I don't know if this is hacky or not, but it feels like it is
	function pickRandomColor(node: HTMLElement) {
		let randomBorderColor = pickRandom(themeColors);
		let borderColor = `border-${randomBorderColor}`;
		node.classList.add(`hover:border-b-4`);
		node.classList.add(borderColor);
		node.style.transition = `border-width ${speed}s ease-in-out`;
	}
</script>

<a {href} target={redirect} aria-label="Link to {href}" use:pickRandomColor>
	<slot />
</a>
