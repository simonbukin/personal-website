---
type: post
date: 2024-01-21
title: 'Installing HTMX'
slug: 'installing-htmx'
description: 'My preferred HTMX install method'
published: true
---

HTMX can be installed in a variety of ways, but my current favorite is a local install with your package manager of choice, and a direct link to the installed file in the `<head>` of your base layout HTML file. It looks like this:

```shell
$ bun install htmx.org
```

```html
<head>
	...
	<script src="htmx.js"></script>
</head>
```
