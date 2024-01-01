<script lang="ts">
	import { debounce, isPageScrollable } from '$lib/utils';
	import { onMount } from 'svelte';

	let pageHeight: number;
	let innerHeight: number;
	let scrollable: boolean;

	onMount(() => {
		pageHeight = document.body.scrollHeight;
	});

	const onResize = () => {
		pageHeight = document.body.scrollHeight;
	};

	const debouncedOnResize = debounce(onResize, 100);

	$: scrollable = isPageScrollable(pageHeight, innerHeight, 100);
</script>

<svelte:window bind:innerHeight on:resize={debouncedOnResize} />

{#if scrollable}
	<slot />
{/if}
