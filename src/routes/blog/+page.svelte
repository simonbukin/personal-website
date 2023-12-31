<script>
	import { formatDateString } from '$lib/utils';
	export let data;
</script>

<div class="my-8 flex flex-col gap-4">
	{#each data.posts as post}
		<a href={`/blog/${post.slug}`}>
			<div
				class="flex h-fit w-full flex-row items-center justify-between rounded-md bg-slate-700 px-4 py-2"
			>
				<div class="flex flex-row items-center justify-center gap-3">
					<h1 class="font-mono">{`./${post.slug}.mdx`}</h1>
				</div>
				<p class="text-slate-400">{formatDateString(post.date)}</p>
			</div></a
		>
	{/each}
</div>
