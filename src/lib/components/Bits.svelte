<script lang="ts">
	import type { Content } from '$lib/types';
	import { formatDateString } from '$lib/utils';
	import HeaderBar from './HeaderBar.svelte';

	export let bits: Content[];
	export let limit: number;
</script>

<HeaderBar href="/bits/" headerText="bits." moreText="more bits" />
<ul class="flex flex-col gap-4">
	{#each bits.slice(0, limit || bits.length) as bit (bit.slug)}
		<li>
			<a
				class="flex h-fit w-full flex-row items-center justify-between rounded-md bg-slate-700 px-4 py-2"
				href={`/bits/${bit.slug}`}
			>
				<h1 class="font-mono">{bit.title}</h1>
				<p class="w-fit text-slate-300">{formatDateString(bit.date)}</p>
			</a>
		</li>
	{/each}
</ul>
