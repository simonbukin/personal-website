<script>
	import '../styles.css';
</script>

<main class="container">
	<nav>
		<p>Simon Bukin</p>
		<ul class="right-nav">
			<li><a href="/about">About</a></li>
		</ul>
	</nav>

	<slot />

	<footer>
		<p>© 2023 simon bukin</p>
		<ul class="right-nav">
			<li><a href="/">last.fm</a></li>
			<li><a href="/">spotify</a></li>
			<li><a href="/">hardcover</a></li>
			<li><a href="/">linkedin</a></li>
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

	li {
		list-style: none;
	}

	a {
		text-decoration: none;
		color: black;
	}

	.right-nav {
		display: flex;
		align-items: center;
		gap: 1rem;
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
		min-width: 50rem;
		min-height: 100vh;
		margin-left: auto;
		margin-right: auto;
	}
</style>
