<script>
	import HoverLink from '$lib/components/HoverLink.svelte';
	import { formatDateString } from '$lib/utils';
	import Readotron from '@untemps/svelte-readotron';

	export let data;
	const { title, description, date } = data.meta;
</script>

<svelte:head>
	<title>{data.meta.title}</title>
	<meta property="og:type" content="article" />
	<meta property="og:title" content={title} />
	<meta name="description" content={description} />
</svelte:head>

<article class="mt-8">
	<hgroup>
		<h1 class="text-shadow">{title}</h1>
		<h2>
			{formatDateString(date, {
				monthFormat: 'long',
				dayFormat: 'suffix',
				yearFormat: 'full'
			})}
		</h2>
		<Readotron class="border-b-2 border-b-orange-300 text-xl" selector=".prose" />
	</hgroup>
	<div class="prose">
		<svelte:component this={data.content} class="content" />
	</div>
</article>

<style>
	.text-shadow {
		text-shadow:
			2px 2px 0px rgb(255, 146, 51),
			-2px -2px 0px rgb(200, 91, 3);
	}
</style>
