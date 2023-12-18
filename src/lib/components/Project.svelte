<script lang="ts">
	export let imageSrc: string;
	export let companyName: string;
	export let year: number;
	export let slug: string;
</script>

<a href={`/portfolio/${slug}`}>
	<div class="p-4 relative dark: bg-gray-700 light:bg-amber-50">
		<img class="w-full object-contain aspect-square" src={imageSrc} alt="name" />
		<h2 class="company text-2xl absolute">{companyName}</h2>
		<h2 class="year text-2xl absolute">{year}</h2>
	</div>
</a>

<style>
	.company,
	.year {
		bottom: 0.5rem;
	}
	.company {
		left: 1rem;
	}
	.year {
		right: 1rem;
	}
	@media (max-width: 640px) {
		.company {
			top: 0.5rem;
			right: 1rem;
			left: auto;
		}
		img {
			height: 25%;
			width: 25%;
		}
	}
</style>
