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
	<Icon icon="akar-icons:arrow-up" width="24" height="24" />
</div>

<style>
	div {
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
