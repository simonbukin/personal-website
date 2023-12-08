<script lang="ts">
	export let href: string;
	export let speed: number = 0.1;
</script>

<a {href} style="transition: box-shadow {speed}s ease-in-out;"> <slot /> </a>

<style>
	a {
		text-decoration: none;
		color: var(--text-color);
	}

	a:hover {
		box-shadow: 0 3px 0 0 var(--text-color);
	}
</style>
