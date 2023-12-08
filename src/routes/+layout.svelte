<script>
	import HoverLink from '$lib/components/HoverLink.svelte';
	import { socialLinks } from '$lib/socialLinks';
	import '../styles.css';
</script>

<main class="container">
	<nav>
		<div class="left-nav">
			<a href="/"><p class="header-text">simon bukin</p></a>
			<img src="/me.svg" alt="personal logo" />
		</div>
		<ul class="right-nav">
			<HoverLink href="/about">about</HoverLink>
		</ul>
	</nav>

	<slot />

	<footer>
		<p>© 2023 simon bukin</p>
		<ul class="right-nav">
			{#each socialLinks as socialLink}
				<HoverLink href={socialLink.url}>{socialLink.name}</HoverLink>
			{/each}
		</ul>
	</footer>
</main>

<style>
	nav,
	footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	nav,
	footer {
		font-size: 1.5rem;
		height: 4rem;
	}

	.left-nav {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		font-size: 1.5rem;
	}

	.right-nav {
		display: flex;
		align-items: center;
		gap: 2rem;
	}

	img {
		width: 3.5rem;
		aspect-ratio: 1 / 1;
	}

	img:hover {
		transform: rotate(360deg);
		transition: transform 1s ease-in-out;
	}

	.header-text {
		cursor: pointer;
	}
	a {
		text-decoration: none;
		color: var(--text-color);
	}

	footer {
		position: absolute;
		display: flex;
		bottom: 0;
		width: 100%;
		height: 4rem;
	}

	.container {
		max-width: 80rem;
		min-height: 100vh;
		margin-left: auto;
		margin-right: auto;
	}
</style>
