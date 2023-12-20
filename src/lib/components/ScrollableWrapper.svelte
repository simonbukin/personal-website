<script lang="ts">
	import { isPageScrollable } from '$lib/utils';
	import { onMount, tick } from 'svelte';

	// let scrollable: boolean = false;
	// let pageHeight: number = 0;
	// let windowHeight: number = 0;
	// let test: number = 0;

	// onMount(async () => {
	// 	pageHeight = document.body.scrollHeight;
	// 	windowHeight = window.innerHeight;
	// });

	// $: console.log('test: ', test)
	// $: scrollable = isPageScrollable(pageHeight, windowHeight, 100);
	// $: console.log(pageHeight, windowHeight, scrollable);
</script>


<slot />


