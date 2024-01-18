<script lang="ts">
	import type { Content } from '$lib/types';
	import { formatDateString } from '$lib/utils';
	import Icon from '@iconify/svelte';
	import HeaderBar from './HeaderBar.svelte';

	export let bits: Content[];
</script>

<HeaderBar href="/bits/" headerText="bits." />
<ul class="flex flex-col gap-4">
	{#each bits as bit (bit.slug)}
		<a href={`/bits/${bit.slug}`}>
			<li
				class="flex h-fit w-full flex-row items-center justify-between rounded-md bg-slate-700 px-4 py-2"
			>
				<h1 class="font-mono">{bit.title}</h1>
				<p class="w-fit text-slate-300">{formatDateString(bit.date)}</p>
			</li>
		</a>
	{/each}
</ul>
