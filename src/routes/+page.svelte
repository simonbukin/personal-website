<script lang="ts">
	import HeroText from './HeroText.svelte';
	import { Projects, Blog } from '$lib/components';
	import { title } from '$lib/config';
	import Icon from '@iconify/svelte';

	export let data;
</script>

<svelte:head>
	<title>{ title }</title>
	<meta property="og:type" content="website" />
	<meta property="og:title" content={ title } />
	<meta property="og:description" content="Simon Bukin's personal website." />
</svelte:head>

<div class="my-16">
	<HeroText />
</div>

<div class="mt-8 mb-4 flex flex-row justify-between items-center">
	<h1 class="font-bold text-3xl">projects.</h1>
	<a href="/portfolio/">
		<p class="text-2xl">see all
			<Icon icon="akar-icons:arrow-right" class="inline-block w-6 h-6" />
		</p>
	</a>
</div>
<Projects />
<div class="mt-8 mb-4 flex flex-row justify-between items-center">
	<h1 class="font-bold text-3xl">blog.</h1>
	<a href="/blog/">
		<p class="text-2xl">see all
			<Icon icon="akar-icons:arrow-right" class="inline-block w-6 h-6" />
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
