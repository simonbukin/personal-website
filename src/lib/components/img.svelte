<script lang="ts">
	export let src: string;
	export let alt: string;
</script>

<img {src} {alt} loading="lazy" />

<style>
	img {
		background-color: white;
		border-radius: 0.25rem;
	}
</style>