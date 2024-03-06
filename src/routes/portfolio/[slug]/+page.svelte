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
		<h2 class="mt-6">{formatDateString(data.meta.date)}</h2>
		<h3 class="mt-6 prose-invert prose-lg prose-lg prose"><strong>Company:</strong> {data.meta.company}</h3>	
		<h3 class="prose-invert prose-lg prose-lg prose"><strong>Role:</strong> {data.meta.role}</h3>	
		<h3 class="prose-invert prose-lg prose-lg prose"><strong>Timeline:</strong> {data.meta.timeline}</h3>	
		<h3 class="mb-6 prose-invert prose-lg prose-lg prose"><strong>Launching {data.meta.launch}</strong></h3>	
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
