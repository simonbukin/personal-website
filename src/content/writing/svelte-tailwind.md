---
type: post
date: 2023-12-31
title: 'Tailwind Class Sorting in Svelte'
slug: 'svelte-tailwind'
description: 'A blog post covering how to set up automatic class sorting with Tailwind, Prettier, and Svelte'
published: true
tags: ['svelte', 'sveltekit', 'front-end', 'tailwind']
---

I've been using Svelte (and SvelteKit) quite a bit to develop this site. As much as I love the ability to throw some nice, scoped CSS on the page with the `<style>` tag, I can't help but lean more on Tailwind for most of my styling needs. Having a `<style>` tag as an escape hatch for something Tailwind can't do (for example, `text-shadow`) is nice though!

Tailwind is extremely pleasant to use (once you get used to it), but ordering Tailwind class names by hand is not. You can get away with not ordering them for a while, but once you start adding responsive tags and other directives, your markup starts to look like alphabet soup:

```html
<h2 class="absolute left-auto right-4 top-2 text-2xl sm:bottom-2 sm:left-4 sm:top-auto"></h2>
```

(this is an example from this very site)

Debugging CSS issues becomes a slog without some sort of consistency. Enter the Prettier plugin for Tailwind.

## Auto-sorting classnames

This plugin takes care of the heavy lifting of organizing Tailwind classnames for you. Let's revisit the example of messy classnames above, and see how they look after a quick `ctrl + s` (courtesy of VSCode's format on save + default formatter being Prettier):

```html
<h2 class="absolute left-auto right-4 top-2 text-2xl sm:bottom-2 sm:left-4 sm:top-auto"></h2>
```

As you can see, the responsive styling is moved to the end, and the `left` / `right` classes are grouped together nicely.

Now, how can you set this up in your own SvelteKit project? Let's take a look.

## Installation

Let's get started with installing our dependencies with `npm` (or maybe [`bun`](https://www.bun.sh), if you want)

```shell
$ npm i --save-dev prettier prettier-plugin-svelte prettier-plugin-tailwindcss
```

`prettier-plugin-svelte` handles Prettier formatting our `.svelte` files, and works with Svelte syntax flawlessly.

`prettier-plugin-tailwindcss` is a utility from Tailwind that automatically sorts classnames, and works with Prettier.

## Putting it all together

To get both plugins to play together nicely, we have to make some configuration tweaks. First up, Prettier.

Inside of your `.prettierrc` (create one in the root of your project if you don't already have one), add the following line:

```json
"plugins": ["prettier-plugin-svelte", "prettier-plugin-tailwindcss"],
```

`prettier-plugin-tailwindcss` HAS to come last in the `plugins` array, otherwise this will not work properly.

To get Prettier to handle Svelte files, we need one more change in VSCode's `settings.json`:

```json
"prettier.documentSelectors": ["**/*.svelte"]
```

And that's just about it. Write all the messy Tailwind you want, and let Prettier handle the sorting for you!
