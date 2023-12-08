<script lang="ts">
	import HeroText from './HeroText.svelte';
	import Project from './Project.svelte';
	import projects from '$lib/projects';
</script>

<HeroText />

<h1>projects.</h1>
<div class="projects">
	{#each projects as project}
		<Project {...project} />
	{/each}
</div>

<style>
	.projects {
		display: flex;
		flex-direction: row;
	}
</style>
