<script>
	import Icon from '@iconify/svelte';

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	};
</script>

<div
	class="text-shadow relative left-0 mt-8 flex flex-row items-center justify-start gap-2"
	on:click={scrollToTop}
	on:keydown={scrollToTop}
	role="button"
	tabindex="0"
>
	<h1 class="text-2xl">back to top</h1>
	<Icon icon="akar-icons:arrow-up" width="24" height="24" />
</div>

<style>
	.text-shadow {
		text-shadow: 2px 2px 0px rgb(190, 51, 255);
	}
</style>
