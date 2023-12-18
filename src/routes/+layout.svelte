<script lang="ts">
	import HoverLink from '$lib/components/HoverLink.svelte';
	import { fly } from 'svelte/transition';
	import { cubicInOut, sineOut } from 'svelte/easing';
	import { socialLinks } from '$lib/socialLinks';
	import '../styles.css';
	import Icon from '@iconify/svelte';

	let innerWidth: number;
	export let data;
</script>

<svelte:window bind:innerWidth />
<body class="dark:bg-gray-800 dark:text-gray-200 font-sans">
	{#key data.pathname}
		<div
			in:fly={{ x: 10, delay: 400, duration: 300, easing: cubicInOut }}
			out:fly={{ x: -10, duration: 300, easing: cubicInOut }}
		>
			<main class="flex flex-col min-h-screen mx-auto py-2 px-4">
				<nav class="center-with-flex h-fit">
					<div class="header center-with-flex gap-4">
						<a class="cursor-pointer no-underline" href="/"
							><h1 class="header-text text-3xl">simon bukin</h1></a
						>
						<a href="/about"
							><svg class="fill-none w-14" viewBox="0 0 57 38">
								<path
									class="stroke-2 stroke-white"
									d="M22.4338 1.94916C22.5821 0.762795 28.4777 1.02453 29.4199 1.02453C30.8261 1.02453 32.209 1.2067 33.5807 1.25569C35.7201 1.3321 37.7237 2.18404 39.7706 2.41147C40.7369 2.51884 41.6712 3.61861 42.3133 4.26073C43.2034 5.15084 44.1934 5.90965 45.0872 6.80346C45.8972 7.61346 46.5449 8.34247 47.1676 9.29481C47.8281 10.3049 48.0218 11.6837 48.7857 12.5824C49.5074 13.4314 49.68 15.0452 49.9929 16.1011C50.349 17.3031 50.635 18.9671 50.635 20.2106C50.635 22.5316 51.281 24.6828 50.224 26.9141C49.1907 29.0956 47.7491 31.5867 45.5495 32.7444C44.3936 33.3528 43.6605 34.3449 42.3647 34.8248C40.7497 35.423 39.246 35.875 37.5618 36.276C33.7373 37.1865 29.7014 36.8539 25.7856 36.8539C21.7519 36.8539 17.2543 36.3386 13.4572 34.9147C10.2624 33.7166 7.3105 31.3917 6.25285 27.9543C5.41314 25.2253 5.33226 22.5188 6.02169 19.7611C7.21304 14.9957 12.1378 11.4044 16.5265 9.8085C17.4563 9.47038 18.7006 9.23704 19.5444 8.76829C20.2658 8.36751 21.7055 7.72808 22.5494 7.72808C24.1834 7.72808 25.8904 6.5723 27.5193 6.5723M20.5846 17.6675C20.8867 17.6675 20.9246 17.6808 21.0469 17.4364M34.4542 15.125H34.9165M16.1924 25.5269C16.1924 27.9664 20.0901 29.2255 21.9714 29.2255C23.0035 29.2255 24.4901 29.4385 25.5543 29.6749C26.7697 29.945 28.3486 29.6878 29.5995 29.6878C30.8369 29.6878 32.2716 29.3041 33.4008 28.9815C34.442 28.684 35.6693 27.9603 36.7654 27.8385C39.4993 27.5347 39.628 24.5848 40.6951 22.9842M6.35268 19.0253C4.71048 19.0253 1 18.8155 1 21.2944C1 21.8044 1.23208 22.1678 1.34909 22.6358C1.45566 23.0621 1.80376 23.2472 2.13453 23.4762C2.52606 23.7473 3.04874 23.7525 3.48887 23.9126C3.80909 24.029 4.18822 24.029 4.53049 24.0289L4.54906 24.0289M50.2215 15.1857C51.5201 15.1857 52.9442 15.1247 54.2069 15.509C54.6532 15.6448 55.0678 15.9929 55.3414 16.3623C55.5998 16.7111 55.9197 16.9901 55.9782 17.458C56.0309 17.8801 55.9896 18.3131 55.8359 18.7057C55.467 19.6486 54.3461 20.1435 53.4764 20.4479C52.8335 20.6729 52.0623 20.6548 51.3851 20.6548"
									stroke-linecap="round"
								/>
							</svg></a
						>
					</div>
					<ul class="right-nav center-with-flex gap-4">
						<HoverLink href="/about" newTab={false}><h2 class="text-2xl">about</h2></HoverLink>
					</ul>
				</nav>

				<div class="grow">
					<slot />
				</div>

				<footer class="text-xl center-with-flex h-fit pb-2 pt-3">
					<p>© {new Date().getFullYear()} simon bukin</p>
					<ul class="center-with-flex gap-6">
						{#each innerWidth < 640 ? socialLinks.slice(0, 4) : socialLinks as socialLink (socialLink.name)}
							<li>
								{#if innerWidth < 640}
									<a target="_blank" href={socialLink.url}
										><Icon class="text-3xl" icon={socialLink.iconName} /></a
									>
								{:else}
									<HoverLink href={socialLink.url} speed={0.1}>{socialLink.name}</HoverLink>
								{/if}
							</li>
						{/each}
					</ul>
				</footer>
			</main>
		</div>
	{/key}
</body>

<style>
	main {
		max-width: 75ch;
	}
	.header-text {
		background: -webkit-linear-gradient(45deg, #dbdbdb, #b950ff);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}
	svg {
		width: 57px;
		aspect-ratio: 1.5;
		transition: rotate 0.5s ease-in-out;
	}

	svg:hover {
		rotate: 360deg;
	}

	@media (max-width: 640px) {
		main {
			max-width: 50ch;
		}
		.right-nav,
		p {
			display: none;
		}
		.header {
			justify-content: space-between;
			width: 100%;
		}
		svg {
			width: 45px;
		}

		footer > ul {
			width: 100%;
		}
	}
</style>
