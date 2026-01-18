---
type: post
date: 2024-02-07
title: 'Local LLM Autocomplete'
slug: 'local-llm-autocomplete'
description: 'A simple guide to getting up and running with Continue'
published: true
---

Tab autocomplete has been a killer feature of GitHub Copilot and similar coding LLMs for a little while now. However, this is no longer the case! The folks over at [Continue](https://continue.dev/) launched an experimental tab autocomplete feature last week, and it's been working great for me so far. The steps to install and use are also drop-dead simple:

- Install the [Continue VSCode extension](https://marketplace.visualstudio.com/items?itemName=Continue.continue).
- Install [Ollama](https://ollama.ai/).
- Install a model with Ollama (`ollama run deepseek-coder:1.3b-base`).
- You're done (though VSCode might need a restart).

Docs for Continue tab autocomplete can be found [here](https://continue.dev/docs/walkthroughs/tab-autocomplete).

You can also install local LLMs for use in Continue's chat using Ollama. I currently use `mistral-7b` on my M1 MacBook Pro and it works like a charm.