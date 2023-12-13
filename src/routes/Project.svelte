<script lang="ts">
	export let imageSrc: string;
	export let companyName: string;
	export let year: number;
</script>

<a href="/portfolio/">
	<div class="p-4 relative dark: bg-gray-700 light:bg-amber-50">
		<img class="w-full object-contain aspect-square" src={imageSrc} alt="name" />
		<h2 class="text-2xl absolute bottom-2 left-4">{companyName}</h2>
		<h2 class="text-2xl absolute bottom-2 right-4">{year}</h2>
	</div>
</a>
