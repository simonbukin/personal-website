<script lang="ts">
	import HeroText from './HeroText.svelte';
	import Project from './Project.svelte';
	import projects from '$lib/projects';
</script>

<HeroText />
<h1 class="font-bold text-3xl my-4">projects.</h1>
<div class=" grid grid-cols-2 gap-4">
	{#each projects as project}
		<Project {...project} />
	{/each}
</div>
