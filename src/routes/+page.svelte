<script lang="ts">
	import HeroText from './HeroText.svelte';
	import { Projects, Blog } from '$lib/components';
	import { title } from '$lib/config';
	import Icon from '@iconify/svelte';

	export let data;
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content="Simon Bukin's personal website." />
</svelte:head>

<div class="my-16">
	<HeroText />
</div>

<div class="mb-4 mt-8 flex flex-row items-center justify-between">
	<h1 class="text-3xl font-bold">projects.</h1>
	<a href="/portfolio/">
		<p class="text-2xl">
			see all
			<Icon icon="akar-icons:arrow-right" class="inline-block h-6 w-6" />
		</p>
	</a>
</div>
<Projects />
<div class="mb-4 mt-8 flex flex-row items-center justify-between">
	<h1 class="text-3xl font-bold">blog.</h1>
	<a href="/blog/">
		<p class="text-2xl">
			see all
			<Icon icon="akar-icons:arrow-right" class="inline-block h-6 w-6" />
		</p>
	</a>
</div>

<Blog limit={3} posts={data.posts} />

<style>
	@media (max-width: 640px) {
		h1 {
			font-size: 1.5rem;
		}
	}
</style>
