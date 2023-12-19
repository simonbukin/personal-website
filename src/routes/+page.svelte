<script lang="ts">
	import HeroText from './HeroText.svelte';
	import Projects from '$lib/components/Projects.svelte';
	import Blog from '$lib/components/Blog.svelte';

	export let data;
</script>

<div class="my-16">
	<HeroText />
</div>
<h1 class="font-bold text-3xl my-4">projects.</h1>
<Projects />
<h1 class="font-bold text-3xl mt-8 mb-4">blog.</h1>
<Blog limit={3} posts={data.posts} />

<style>
	@media (max-width: 640px) {
		h1 {
			font-size: 1.5rem;
		}
	}
</style>
