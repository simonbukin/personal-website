<script lang="ts">
	export let href: string;
	export let speed: number = 0.1;
	export let newTab: boolean = true;

	let randomBorderColor = Math.random() > 0.5 ? 'purple' : 'green';
	$: borderColor = `border-${randomBorderColor}-500`;
	$: redirect = newTab ? '_blank' : '';
</script>

<a
	{href}
	target={redirect}
	class="hover:border-b-4 {borderColor}"
	style="transition: border-width {speed}s ease-in-out"
>
	<slot />
</a>

<style>
</style>
