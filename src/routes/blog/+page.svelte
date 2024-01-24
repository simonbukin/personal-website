<script>
	import { formatDateString } from '$lib/utils';
	import Icon from '@iconify/svelte';
	export let data;
</script>

<svelte:head>
	<title>All Posts</title>
	<meta property="og:type" content="article" />
	<meta property="og:title" content={'All Posts'} />
	<meta name="description" content={'All Posts on this site'} />
</svelte:head>

<h1 class="text-3xl font-bold">blog posts.</h1>
<ul class="mb-8 mt-4 flex flex-col gap-4">
	{#each data.posts as post}
		<a href={`/blog/${post.slug}`}>
			<li
				class="flex h-fit w-full flex-row items-center justify-between rounded-md bg-slate-700 px-4 py-2"
			>
				<div class="flex flex-row items-center justify-center gap-3">
					<h1 class="font-mono">{`./${post.slug}.mdx`}</h1>
				</div>
				<p class="text-slate-300">{formatDateString(post.date)}</p>
			</li>
		</a>
	{/each}
	<a href="/rss.xml">
		<li class="text-shadow relative left-0 mt-4 flex flex-row items-center justify-start gap-2">
			<h1 class="text-2xl">Subscribe to RSS</h1>
			<Icon icon="akar-icons:rss" width="24" height="24" />
		</li>
	</a>
</ul>

<style>
	.text-shadow {
		text-shadow:
			2px 2px 0px rgb(190, 51, 255),
			-2px -2px 0px rgb(200, 51, 190);
	}
</style>
