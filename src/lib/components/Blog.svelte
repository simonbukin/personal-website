<script lang="ts">
	import type { Post } from '$lib/types';
	import { formatDateString } from '$lib/utils';

	export let limit: number;
	export let posts: Post[];
</script>

<div class="flex flex-col gap-4">
	{#each posts.slice(0, limit || posts.length) as post}
		<a href={`/blog/${post.slug}`}>
			<div
				class="px-4 py-2 bg-slate-700 flex flex-row items-center justify-between rounded-md w-full h-fit"
			>
				<!-- <div class="flex flex-row gap-3 items-center justify-center"> -->
				<h1 class="font-mono">{post.title}</h1>
				<!-- </div> -->
				<p class="w-fit align-right text-slate-400">{formatDateString(post.date)}</p>
			</div></a
		>
	{/each}
</div>
