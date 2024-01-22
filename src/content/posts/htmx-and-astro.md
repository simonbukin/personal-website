---
date: 2024-01-21
title: 'Using HTMX with Astro'
slug: 'htmx-and-astro'
description: 'A guide to using HTMX and Astro together in a productive fashion'
tags: ['astro', 'htmx', 'frontend']
published: true
---

If you've been anywhere near the frontend side of Twitter these days, you have undoubtedly heard of [HTMX](https://htmx.org/). Love it (as you should) or hate it (you do you), it's a powerful new tool that caters to both frontend and backend devs alike. I think it's neat, so I wrote a little guide to setting it up for use with another framework I hold near and dear to my heart: [Astro](https://astro.build/).

## Getting Astro working

The simplest install path for Astro is the following command (I'm using `bun` here, but the analogous commands with `npm`/`pnpm`/`yarn` should work as well)

```shell
$ bun create astro@latest
```

Houston (Astro's cute little mascot) will ask you a few questions, and you'll be off to the races! For references, I generally choose "Include sample files" (to yoink their `Layout.astro`), "Install dependencies", "Strictest" for TypeScript and "Yes" for the git repo.

## HTMX

You have a few options when it comes to installing HTMX for use with Astro.

### CDN

If you're just trying it out, or just want a drop-dead simple install path, go ahead and drop an `unpkg` link into the `<head>` of your `Layout.astro`. It'll look like this:

```html
<head>
	...
	<script src="https://unpkg.com/htmx.org@1.9.9"></script>
</head>
```

Tada! Go ahead and use HTMX to your hearts content on any page that uses `Layout.astro`.

### Direct install

HTMX can also be installed as a direct dependency ([this is my preferred approach at the moment](/bits/installing-htmx)). You can do it like this:

```shell
$ bun install htmx.org
```

Once it's installed, you can reference it in the `<head>` of your base `Layout.astro`, as with the above solution. The only difference is the path, and the fact that you're now no longer relying on a CDN for one of your dependencies!

```html
<head>
	...
	<script src="htmx.js"></script>
</head>
```

### Astro integration

[Steven Yung](https://github.com/xstevenyung) maintains a nifty Astro integration that automatically includes HTMX on all your pages. The instructions are covered [here](https://github.com/xstevenyung/astro-htmx), and mostly involve installing the integration alongside HTMX, and then editing your Astro config:

```javascript
import { defineConfig } from 'astro/config';
import htmx from 'astro-htmx';

export default defineConfig({
  ...
  integrations: [htmx()],
});
```

Both `astro-htmx` and `htmx.org` have to be installed for this to work properly.

## ✨ Tada ✨

You now have a working Astro project with HTMX enabled on every page. Go forth and make something cool!
