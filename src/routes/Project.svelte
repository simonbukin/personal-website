<script lang="ts">
	export let imageSrc: string;
	export let companyName: string;
	export let year: number;
</script>

<a href="/portfolio/">
	<div class="project">
		<img src={imageSrc} alt="name" />
		<h2 class="name">{companyName}</h2>
		<h2 class="year">{year}</h2>
	</div>
</a>

<style>
	.project {
		width: 30rem;
		aspect-ratio: 1 / 1;
		background-color: var(--light-color);
	}

	img {
		width: 100%;
		aspect-ratio: 1 / 1;
		object-fit: contain;
	}

	h2 {
		position: absolute;
		bottom: -0.25rem;
		font-size: 2.25rem;
	}

	a {
		text-decoration: none;
		color: var(--text-color);
		transition: transform 0.25s ease-in-out;
	}

	a:hover {
		transform: scale(1.05);
	}

	.name {
		left: 2rem;
	}

	.year {
		right: 2rem;
		color: var(--text-color);
	}
</style>
