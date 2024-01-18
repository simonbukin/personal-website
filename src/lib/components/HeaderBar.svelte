<script lang="ts">
	import Icon from '@iconify/svelte';

	export let headerText: string;
	export let moreText = 'more';
	export let href: string;
</script>

<div class="mb-4 mt-8 flex flex-row items-center justify-between">
	<h1 class="text-3xl font-bold">{headerText}</h1>
	<a {href}>
		<p class="text-2xl">
			{moreText}
			<Icon icon="akar-icons:arrow-right" class="inline-block h-6 w-6" />
		</p>
	</a>
</div>

<style>
	@media (max-width: 640px) {
		h1 {
			font-size: 1.5rem;
		}
	}
</style>
