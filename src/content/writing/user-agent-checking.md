---
type: bit
date: 2024-01-19
title: 'Checking your User Agent'
slug: 'user-agent-checking'
description: 'A quick guide to checking your user agent string.'
published: true
---

Checking your User Agent string from your browser is quite simple:

```javascript
navigator.userAgent;
// returns UA string, eg 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
```

You can actually notice your User Agent string change by querying `navigator.userAgent` after enabling responsive mode in your browser. For me, toggling on the responsive toolbar in Arc switched my user agent to the following:

```shell
'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
```
