<script>
	import { Project } from '$lib/components';
	import projects from '$lib/projects';
</script>

<div class="flex flex-col gap-4 sm:grid sm:grid-cols-2">
	{#each projects as project}
		<Project {...project} />
	{/each}
</div>
