<script lang="ts">
	import type { Content } from '$lib/types';
	import { formatDateString } from '$lib/utils';
	import HeaderBar from './HeaderBar.svelte';

	export let limit: number;
	export let posts: Content[];
</script>

<HeaderBar href="/blog/" headerText="blog." moreText="more posts" />
<ul class="flex flex-col gap-4">
	{#each posts.slice(0, limit || posts.length) as post}
		<li>
			<a
				class="flex h-fit w-full flex-row items-center justify-between rounded-md bg-slate-700 px-4 py-2"
				href={`/blog/${post.slug}`}
			>
				<h1 class="font-mono">{post.title}</h1>
				<p class="w-fit text-slate-300">{formatDateString(post.date)}</p>
			</a>
		</li>
	{/each}
</ul>
