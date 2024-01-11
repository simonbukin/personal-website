<script>
	import { formatDateString } from '$lib/utils';

	export let data;
</script>

<svelte:head>
	<title>{data.meta.title}</title>
	<meta property="og:type" content="article" />
	<meta property="og:title" content={data.meta.title} />
</svelte:head>

<article class="mt-8">
	<hgroup>
		<h1 class="text-shadow">{data.meta.title}</h1>
		<h2>{formatDateString(data.meta.date)}</h2>
	</hgroup>
	<div class="prose-invert prose-slate prose prose-lg">
		<svelte:component this={data.content} />
	</div>
</article>

<style>
	.text-shadow {
		text-shadow:
			2px 2px 0px rgb(190, 51, 255),
			-2px -2px 0px rgb(200, 51, 190);
	}
</style>
