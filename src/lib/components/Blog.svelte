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
				class="flex h-fit w-full flex-row items-center justify-between rounded-md bg-slate-700 px-4 py-2"
			>
				<h1 class="font-mono">{post.title}</h1>
				<p class="align-right w-fit text-slate-300">{formatDateString(post.date)}</p>
			</div></a
		>
	{/each}
</div>
