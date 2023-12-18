<script lang="ts">
	import HeroText from './HeroText.svelte';
	import Projects from '$lib/components/Projects.svelte';
</script>

<HeroText />
<h1 class="font-bold text-3xl my-4">projects.</h1>
<Projects />

<style>
	@media (max-width: 640px) {
		h1 {
			font-size: 1.5rem;
		}
	}
</style>
