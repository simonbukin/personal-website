<script>
	import Icon from '@iconify/svelte';
</script>

<div class="flex flex-col items-center justify-center">
	<Icon
		class="relative mx-auto text-[20rem] hue-rotate-[45deg] filter hover:animate-spin"
		icon="twemoji:teapot"
	/>
	<a
		target="_blank"
		href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/418"
		aria-label="A link to the MDN documentation for the 418 HTTP status code"
		><h1 class="pointer-events-auto font-mono text-6xl leading-tight">HTTP 418</h1></a
	>
	<h2 class="font-mono text-4xl">I'm a teapot</h2>
</div>
