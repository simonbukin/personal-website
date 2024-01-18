<script>
	import { formatDateString } from '$lib/utils';
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
	</hgroup>
	<div class="blog-post">
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
