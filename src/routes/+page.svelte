<script lang="ts">
	import HeroText from './HeroText.svelte';
	import Project from './Project.svelte';
	import projects from '$lib/projects';
</script>

<div class="content">
	<HeroText />
	<h1 class="projects-header">projects.</h1>
	<div class="projects">
		{#each projects as project}
			<Project {...project} />
		{/each}
	</div>
</div>

<style>
	.projects {
		display: flex;
		flex-direction: row;
		gap: 1rem;
		flex-grow: 2;
	}

	h1 {
		font-size: 2rem;
		font-weight: bold;
	}

	.content {
		display: flex;
		flex-direction: column;
		margin-top: 5rem;
	}
</style>
