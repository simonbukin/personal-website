---
type: post
date: 2025-02-05
title: 'Home Server Footguns'
slug: 'homeserver-footguns'
description: 'A non-exhaustive guide to everything I''ve done wrong with my home server.'
tags: ['home-server']
published: true
---

This post is a frequently updated list of things I've done wrong, blown up, or generally mismanaged while running my home server. Here be dragons (and mistakes) 🐉

- Running self-hosted AdGuard DNS in sequential mode with a DNS provider that times out frequently, meaning that DNS resolution would timeout frequently, meaning my apps would stop loading at intermittent intervals... frequently
- Pointing all my internal network traffic at the wifi IP address of my home server + NAS, and then connecting that home server to a network switch over ethernet and then disabling WiFi... I wonder why everything is down?
- Leaving my home server (a Thinkpad laptop) on and running 24/7 with a battery connected. Figured that one out pretty quick. No spicy pillow for me!
- Connecting my NAS to my server over NFS with `soft`, and then wondering why some apps would just lose data sometimes.
- Storing all `docker-compose.yaml`s, `sqlite` database, and general container resources on an NFS share instead of on device, and then wondering why simple apps would take ages to do anything.
- Running a Claude Code instance on the server, finishing a task, disconnecting from the server, reconnecting to the server, running a Claude Code instance on the server... `pkill` was necessary here.
- Adding a performance-monitoring Prometheus + Grafana + CAdvisor + Blackbox HTTP stack for monitoring my dual core home server... directly on said home server... causing performance issues
- Mounting the wrong volume on the wrong path in Docker. This has happened hundreds of times, possibly thousands.
