---
date: 2023-12-19
title: '"Scrollability" in Svelte'
slug: 'svelte-scrollable'
description: 'A blog post covering how to conditionally render a "back to top" button on a page based on its height'
published: true
tags: ['svelte', 'sveltekit', 'front-end', 'javascript']
---

I ran into a fun (and incredible satisfying) problem when making this blog that I thought would be worth sharing. I wanted to have a "scroll to top" button at the bottom of most "content" style pages (eg. a blog post or portfolio page), but not on pages that didn't actually have any scrollable content.

Let me illustrate with an example. [Here is a page](/portfolio/gcs-security) that's pretty long, with a lot of content. [And here is a page](/blog) that's pretty short (but hopefully not for long). It looks a little goofy if the latter page has a "scroll to top" button, but there's a good reason to have one on the former page.

So, how do we go about doing this? The simplest way is using methods from the DOM API, specifically on `window` and `document`. Intuitively, we want to check if the height of the `window` is smaller than the height of the page itself. If it is, the page is scrollable, and we can show our button.

Let's take a look at our trusty friend, MDN.

> "The Element.scrollHeight read-only property is a measurement of the height of an element's content, including content not visible on the screen due to overflow." **[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight)**

> "The Window.innerHeight read-only property returns the interior height of the window in pixels, including the height of the horizontal scroll bar, if present." **[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/innerHeight)**

Sounds like what we need.

## First draft

Now that we have the properties we need, let's put it all together:

```javascript
const isPageScrollable = () => {
	const pageHeight = document.body.scrollHeight;
	const windowHeight = window.innerHeight;

	return pageHeight > windowHeight;
};
```

We can use this function in a component in a manner that looks something like the following:

```svelte
<script>
	import { isPageScrollable } from '$lib/utils';
	import { BackToTop } from '$lib/components';

	let scrollable = isPageScrollable();
</script>

{#if scrollable}
	<BackToTop />
{/if}
```

This **looks** correct, but if we try using it we'll run into a problem in our console output:

```shell
ReferenceError: document is not defined
```

This is because the `isScrollable` function is running before the component mounts, and `document` doesn't exist at that point.

## Some fixes

Let's take stock of some of the problems in our implementation and see how to fix them.

- It doesn't work! Currently, without using Svelte's `onMount` function, the scrollability (neat word) calculation doesn't work properly.
- The logic of showing/hiding based on the scrollability of a page is generic enough that I may want to use it somewhere else in the future. This should probably be captured into its own component.
- If the user resizes their browser (just to test if my blog is robust™ and responsive™, of course), they would be shocked to find that the button does not respond accordingly.
- The current implementation doesn't account for any offset at the bottom of the page.

Let's fix these glaring issues by making a generic component that's responsive and flexible.

```svelte
<!-- /src/utils/components/ScrollableWrapper.svelte -->
<script>
	import { isPageScrollable } from '$lib/utils';
	import { onMount } from 'svelte';

	export let offset;
	let scrollable;

	onMount(() => {
		window.addEventListener('resize', async () => {
			scrollable = await isPageScrollable(offset);
		});
	});
</script>

{#if scrollable}
	<slot />
{/if}
```

This is a good chunk of code, so let's break it down:

- We import our `isPageScrollable` function from a generic `utils.ts` file, where it's being stored now that we're organizing our project nicely.
- We import `onMount` from Svelte. This is a lifecycle function that runs when the component is mounted to the DOM, which should help solve our `document` related issues.
- We take in a prop called `offset` to allow any consumers of this component to tweak the scrollability threshold. This is useful if you want to show the button a little earlier than the bottom of the page.
- We create a `scrollable` variable that will be used to determine whether or not to show our button.
- We add an event listener to the `window` object that will run our `isPageScrollable` function whenever the window is resized. This makes it so that even if the user resizes the page, the button will still be shown/hidden accordingly.
- Finally, we wrap the child component that's passed in to `<slot />` with a conditional block to render or not render based on the value of `scrollable`.

Now that we have our component (let's call it `<ScrollableWrapper />`), we can use it in our blog overview page like this:

```svelte
<!-- /src/routes/blog/+layout.svelte -->
<script>
	import { ScrollableWrapper, BackToTop } from '$lib/components';
</script>

<slot />

<ScrollableWrapper offset={100}>
	<BackToTop />
</ScrollableWrapper>
```

Now **this** does work the way we are expecting.

## Quick note

Attaching an event listener to the `window` to track the `scroll` event works, but a more Svelte-y (?) way of doing this is using the `<svelte:window>` element. We can also track the `window` `innerHeight` this way, since binding directly to `innerHeight` is an option in a `<svelte:window>`. Here's how that might look:

```svelte
<script lang="ts">
	import { isPageScrollable } from '$lib/utils';
	import { onMount } from 'svelte';

	let pageHeight: number;
	let innerHeight: number;
	let scrollable: boolean;

	onMount(() => {
		pageHeight = document.body.scrollHeight;
	});

	const onResize = () => {
		pageHeight = document.body.scrollHeight;
	};

	$: scrollable = isPageScrollable(pageHeight, innerHeight, 100);
</script>

<svelte:window bind:innerHeight on:resize={onResize} />

{#if scrollable}
	<slot />
{/if}
```

You might also notice a few other changes here. First, we still use `onMount` to track the initial `scrollHeight` of the body, since otherwise we would run into the `ReferenceError` from earlier. Next, the `scrollable` variable is moved to a reactive assignment, that reruns whenever `pageHeight` or `innerHeight` change, which happens whenever the window is resized.

## More fixes

There are a couple of other things that could be fixed here as well, both for flexibility and performance reasons.

The first is the `resize` event handler. It currently runs every time the window is resized, which is definitely overkill (for reference, I triggered ~100 events by resizing for less than a second). We can fix this by using a `debounce` function that bunches updates together into more manageable chunks. `lodash` includes an implementation of a `debounce` function you can use (but writing one yourself is pretty fun!)

Another, smaller change that could be made is adding an `else` block to the conditional to display a different component if the page is not scrollable. I personally left this out in my implementation, but it can definitely be added if you need that functionality.

I hope you enjoyed this little dive into a component I had fun writing in Svelte. The source is [available here](https://github.com/simonbukin/personal-website). Go nuts.
