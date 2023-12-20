<script lang="ts">
	import { isPageScrollable } from '$lib/utils';
	import { onMount } from 'svelte';

	let scrollable: boolean;

	onMount(() => {
		window.addEventListener('resize', async () => {
			scrollable = await isPageScrollable(100);
		});
	});
</script>

{#if scrollable}
    <slot />
{/if}
