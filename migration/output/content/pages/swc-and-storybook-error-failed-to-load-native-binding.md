---
title: 'SWC And Storybook: Error: Failed to load native binding'
description: >-
  When switching between my M1 MacBook and Intel X64 MacBook today, I ran into
  an odd error: Solution Deleting my package-lock.json file and node\
date: '2024-10-19T16:33:40.000Z'
lastmod: '2024-10-19T16:39:11.000Z'
url: /swc-and-storybook-error-failed-to-load-native-binding/
draft: false
categories:
  - Documentation
author: Thomas Theunen
---
When switching between my M1 MacBook and Intel X64 MacBook today, I ran into an odd error:

```text
Error: Failed to load native binding
at Object. (/node_modules/@swc/core/binding.js:333:11)
at Module._compile (node:internal/modules/cjs/loader:1469:14)
at Module._extensions..js (node:internal/modules/cjs/loader:1548:10)
at Object.newLoader (/node_modules/esbuild-register/dist/node.js:2262:9)
at extensions..js (/node_modules/esbuild-register/dist/node.js:4833:24)
at Module.load (node:internal/modules/cjs/loader:1288:32)
at Module._load (node:internal/modules/cjs/loader:1104:12)
at Module.require (node:internal/modules/cjs/loader:1311:19)
at require (node:internal/modules/helpers:179:18)
at Object. (/node_modules/@swc/core/index.js:49:17)
```

## Solution

Deleting my **package-lock.json** file and**node\_modules**, and then running 'npm install' again magically fixed the problem!
