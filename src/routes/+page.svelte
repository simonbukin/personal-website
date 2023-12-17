<script lang="ts">
	import HeroText from './HeroText.svelte';
	import Project from './Project.svelte';
	import projects from '$lib/projects';
</script>

<HeroText />
<h1 class="font-bold text-3xl my-4">projects.</h1>
<div class="projects">
	{#each projects as project}
		<Project {...project} />
	{/each}
</div>

<style>
	.projects {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-gap: 1rem;
	}
	@media (max-width: 640px) {
		.projects {
			display: flex;
			flex-direction: column;
		}
		h1 {
			font-size: 1.5rem;
		}
	}
</style>
