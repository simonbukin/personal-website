<script>
	import { Project } from '$lib/components';
	import projects from '$lib/projects';
</script>

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
	}
</style>
