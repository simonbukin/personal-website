<script>
	import Icon from '@iconify/svelte';

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	};
</script>

<div on:click={scrollToTop} on:keydown={scrollToTop} role="button" tabindex="0">
	<h1>back to top</h1>
	<Icon icon="mdi:arrow-up-bold-outline" width="24" height="24" />
</div>

<style>
	div {
		@apply font-serif;
		position: relative;
		left: 0;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: flex-start;
		gap: 0.5rem;
		margin-block: 2rem;
	}
	h1 {
		font-size: 1.5rem;
	}
</style>
