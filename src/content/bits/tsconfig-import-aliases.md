---
date: 2024-01-18
title: 'Import Aliases in Typescript'
slug: 'tsconfig-import-aliases'
description: 'Configuring import aliases in Typescript'
published: true
---

Typescript provides a way of [aliasing your import statements](https://www.typescriptlang.org/tsconfig#paths) so that you don't have to type out a long and error-prone relative path every time you want to import something. You can do it like this, in your `tsconfig.json`:

```json
"compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
```

Note: the `baseUrl` is required, otherwise you may run into `Cannot find module` errors, even if you editor insists it can find the path.
