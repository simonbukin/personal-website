<script lang="ts">
	import { themeColors } from '$lib/config';
	import { pickRandom } from '$lib/utils';
	export let href: string;
	export let speed: number = 0.1;
	export let newTab: boolean = true;

	let randomBorderColor = pickRandom(themeColors);
	let borderColor = `border-${randomBorderColor}`;
	let redirect = newTab ? '_blank' : '';
</script>

<a
	{href}
	target={redirect}
	class="hover:border-b-4 {borderColor}"
	style="transition: border-width {speed}s ease-in-out"
>
	<slot />
</a>

<style>
</style>
