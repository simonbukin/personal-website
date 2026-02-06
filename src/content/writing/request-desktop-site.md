---
type: post
date: 2024-01-19
title: 'What does Request Desktop Site do?'
slug: 'request-desktop-site'
description: 'How the "request desktop site" button on your phone works.'
published: true
---

On both iOS and Android devices, you can press the "request desktop site" button and (usually) get a grossly disproportionate version of the site you're looking at. But how does this actually work? Is it something to do with media queries?

## Absolutely Not

In reality, all that happens is the User Agent string that is sent to the server changes. Let me illustrate with a little diagram. Let's look at what happens when I request a website from my Macbook:

![Sending a request from my Macbook](/request-desktop-site-2.svg)

You can see me (professionally drawn) sending a request to the server. My User Agent string identifies me to the server, and I get a desktop site back.

Now, something very similar happens when I navigate to the same site using a mobile device, such as an iPhone:

![Sending a request from my iPhone](/request-desktop-site-1.svg)

All that has changed between these examples is the UA string sent from my device to the server. In the Macbook example, it may look like this:

```shell
'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
```

And on my iPhone, like this:

```shell
'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
```

So, in effect, all that is really happening is the server differentiating the page to send back based on User Agent.

Thanks for joining me on this little dive. And thanks to [Stack Overflow](https://stackoverflow.com/questions/12838559/what-does-desktop-view-view-desktop-site-actually-do) for teaching me something new!
