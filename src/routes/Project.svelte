<script lang="ts">
	export let imageSrc: string;
	export let name: string;
	export let year: number;
</script>

<div class="project">
	<img src={imageSrc} alt="name" />
	<h2 class="name">{name}</h2>
	<h2 class="year">{year}</h2>
</div>

<style>
	.project {
		width: 30rem;
		aspect-ratio: 1 / 1;
		background-color: var(--light-color);
	}

	img {
		width: 100%;
		aspect-ratio: 1 / 1;
		object-fit: cover;
	}

	h2 {
		position: absolute;
		bottom: 0;
		font-size: 1.5rem;
	}

	.name {
		left: 1rem;
	}

	.year {
		right: 1rem;
	}
</style>
