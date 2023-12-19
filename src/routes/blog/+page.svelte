<script>
	import { formatDateString } from '$lib/utils';
	export let data;
</script>

<div class="flex flex-col gap-4 my-8">
	{#each data.posts as post}
		<a href={`/blog/${post.slug}`}>
			<div
				class="px-4 py-2 bg-slate-700 flex flex-row items-center justify-between rounded-md w-full h-fit"
			>
				<div class="flex flex-row gap-3 items-center justify-center">
					<h1 class="font-mono">{`./${post.slug}.mdx`}</h1>
				</div>
				<p class="text-slate-400">{formatDateString(post.date)}</p>
			</div></a
		>
	{/each}
</div>

<style>
</style>
