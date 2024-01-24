<script>
	import { formatDateString } from '$lib/utils';

	export let data;
</script>

<svelte:head>
	<title>All Bits</title>
	<meta property="og:type" content="article" />
	<meta property="og:title" content={'All Bits'} />
	<meta name="description" content={'All Bits of content on this site'} />
</svelte:head>

<h1 class="text-3xl font-bold">bits.</h1>
<ul class="my-8 flex flex-col gap-4">
	{#each data.bits as bit (bit.slug)}
		<li
			class="flex h-fit w-full flex-row items-center justify-between rounded-md bg-slate-700 px-4 py-2"
		>
			<a href="/bits/{bit.slug}" class="flex flex-col items-center gap-4">
				<div class="flex flex-row items-center justify-center gap-3">
					<h1 class="font-mono">{`./${bit.slug}.mdx`}</h1>
				</div>
				<p class="text-slate-300">{formatDateString(bit.date)}</p>
			</a>
		</li>
	{/each}
</ul>
