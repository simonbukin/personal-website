<script lang="ts">
	import HeroText from './HeroText.svelte';
	import { Projects, Blog } from '$lib/components';
	import { title } from '$lib/config';
	import Bits from '$lib/components/Bits.svelte';
	import HeaderBar from '$lib/components/HeaderBar.svelte';

	export let data;
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content="Simon Bukin's personal website." />
</svelte:head>

<div class="my-16">
	<HeroText />
</div>

<HeaderBar href="/portfolio/" headerText="projects." moreText="more projects" />
<Projects />

<Blog limit={3} posts={data.posts} />

<Bits limit={3} bits={data.bits} />
