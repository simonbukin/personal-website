<script>
	import { formatDateString } from '$lib/utils';
	export let data;

	const { title, description, date, excalidraw_url } = data.meta;
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
	</hgroup>
	<div class="blog-post">
		<svelte:component this={data.content} class="content" />
	</div>
	{#if excalidraw_url}
		<section class="mb-2 flex flex-row gap-2 text-xl text-fuchsia-300">
			<div>
				If you prefer a visual, here's a <a target="_blank" href={excalidraw_url}
					>link to a diagram</a
				>
			</div>
		</section>
	{/if}
</article>

<style>
	.text-shadow {
		text-shadow:
			2px 2px 0px rgb(255, 146, 51),
			-2px -2px 0px rgb(200, 91, 3);
	}
</style>
