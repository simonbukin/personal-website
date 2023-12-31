<script>
import { formatDateString } from '$lib/utils';

	export let data;
</script>

<svelte:head>
	<title>{data.meta.title}</title>
	<meta property="og:type" content="article" />
	<meta property="og:title" content={data.meta.title} />
</svelte:head>

<article>
	<hgroup>
		<h1>{data.meta.title}</h1>
		<h2>{formatDateString(data.meta.date, { monthFormat: 'long', dayFormat: 'suffix', yearFormat: 'full'})}</h2>
	</hgroup>
	<div class="prose">
		<svelte:component this={data.content} />
	</div>
</article>

<style>
	article {
		margin-top: 4rem;
	}
</style>
