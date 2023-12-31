<script lang="ts">
	export let imageSrc: string;
	export let companyName: string;
	export let year: number;
	export let slug: string;
</script>

<a href={`/portfolio/${slug}`}>
	<div class="dark: light:bg-amber-50 relative rounded-md bg-slate-700 p-4">
		<img
			class="aspect-square h-1/4 w-1/4 object-contain sm:h-full sm:w-full"
			src={imageSrc}
			alt="name"
		/>
		<h2 class="absolute left-auto right-4 top-2 text-2xl sm:bottom-2 sm:left-4 sm:top-auto">
			{companyName}
		</h2>
		<h2 class="absolute bottom-2 right-4 text-2xl">{year}</h2>
	</div>
</a>
