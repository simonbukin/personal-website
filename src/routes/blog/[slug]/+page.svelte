<script>
	import BackToTop from '$lib/components/BackToTop.svelte';
	import ScrollableWrapper from '$lib/components/ScrollableWrapper.svelte';
	import { formatDateString } from '$lib/utils';

	export let data;
</script>

<svelte:head>
	<title>{data.meta.title}</title>
	<meta property="og:type" content="article" />
	<meta property="og:title" content={data.meta.title} />
	<meta name="description" content={data.meta.description} />
</svelte:head>

<article class="mt-8">
	<hgroup>
		<h1 class="text-shadow">{data.meta.title}</h1>
		<h2>
			{formatDateString(data.meta.date, {
				monthFormat: 'long',
				dayFormat: 'suffix',
				yearFormat: 'full'
			})}
		</h2>
	</hgroup>
	<div class="prose">
		<svelte:component this={data.content} />
	</div>
</article>

<style>
	.text-shadow {
		text-shadow:
			2px 2px 0px rgb(255, 146, 51),
			-2px -2px 0px rgb(200, 91, 3);
	}
</style>
