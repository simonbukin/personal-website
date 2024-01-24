---
date: 2024-01-23
title: 'Local Dev with Next'
slug: 'nextjs-dev-server'
description: 'A quick guide to getting NextJS" dev server up and running'
published: true
---

Vite provides the option to pass in a `--host` property to expose your local development server to your network, allowing for easy on-device testing (at least that's what I use it for). Next provides a similar option with `next build -H <host> -P <port>`, but it's a little less ergonomic, as I ran into frequent "this connection is already in use" errors. However, after some digging, apparently Next already exposes your development server locally, but just doesn't show the IP address after running `next dev`. You can connect to it by default on port 3000 and your local IP address (you can figure this out with `ifconfig` on Windows and `ipconfig` on Mac). Thanks [StackOverflow](https://stackoverflow.com/questions/68254828/running-a-development-server-on-nextjs-on-the-network)!
