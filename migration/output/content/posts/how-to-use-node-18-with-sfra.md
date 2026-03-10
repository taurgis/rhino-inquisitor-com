---
title: 'SFRA and Node 18: A Match Made in eCommerce Paradise or Hell?'
description: >-
  Upgrade SFRA to Node 18 with fewer surprises by checking version support,
  removing node-sass blockers, and validating your storefront toolchain.
date: '2023-07-10T08:09:37.000Z'
lastmod: '2023-07-10T08:13:58.000Z'
url: /how-to-use-node-18-with-sfra/
draft: false
heroImage: /media/2023/upgrading-f08d3d8bdc.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - sfcc
  - technical
author: Thomas Theunen
---
As [responsible developers](/secure-coding-in-salesforce-b2c-commerce-cloud/), it's important to stay up-to-date with the latest versions of our tools. The README of SFRA, unfortunately, reminds us that it is not always possible by recommending v12.21.0, which was the latest version at the time of launch (2017).

However, Node and SFRA packages have undergone many updates since then, and utilising the latest versions is crucial for security reasons. Let's keep our priorities in check and stay current with the latest updates.

Is it possible to upgrade to the latest Node version? And what steps do we need to undertake? Let's have a look!

SFRA versions prior to 6.2.0 This guide will only work if you are on one of the latest versions of SFRA. Because node-sass was removed in version 6.2.0, upgrading Node versions became a lot "easier".

No need to worry! If you're using an older version, there's a node-sass version available for Node 18. But I will not cover that in this article.

## Activate Node 18 for your SFRA project

![Install Node 18 for SFRA](/media/2023/node18-ac76311848.jpg)

To use this version, it is necessary to install it first. Although I recommend using "[nvm](https://github.com/nvm-sh/nvm)", it may not be the best option for every setup. It is crucial to explore and find the most efficient method for your specific setup to ensure the successful installation of this version.

Messing with node versions can seriously block development if not done right, and we don't want to be stressing out on our day job now do we?

## Install SFRA as usual

Fortunately, we can still perform the usual "npm install" without hassle. Please note that you may receive a warning about the system modifying package-lock.json to ensure compatibility with the current version of Node.

```
npm WARN old lockfile This is a one-time fix-up, please be patient...
npm WARN old lockfile


```

So just as the message asks us, we will be patient.

## SGMF Scripts and SSL

One of the hurdles in using the latest Node version is using a deprecated feature. Once you run any build or upload script, you will run into the following exception:

```

					Error: error:0308010C:digital envelope routines::unsupported


```

Luckily, a quick google search later, we find the solution to this error. Enabling the "OpenSSL Legacy Provider", and depending on your OS of choice a different command has to be used:

```

					# Unix-like (Linux, macOS, etc...)
export NODE_OPTIONS=--openssl-legacy-provider
# Windows
set NODE_OPTIONS=--openssl-legacy-provider
# PowerShell
$env:NODE_OPTIONS = "--openssl-legacy-provider"



```

It is possible to update your package.json, depending on your (and the teams) setup:

```

					  "scripts": {
    "test": "export NODE_OPTIONS=--openssl-legacy-provider && sgmf-scripts --test test/unit/**/*.js",
    "cover": "export NODE_OPTIONS=--openssl-legacy-provider && sgmf-scripts --cover 'test/unit'",
    "test:integration": "export NODE_OPTIONS=--openssl-legacy-provider && sgmf-scripts --integration 'test/integration/**/*.js'",
    "test:acceptance:custom": "npx codeceptjs run --plugins retryFailedStep --profile",
    "test:acceptance:deep": "npx codeceptjs run --plugins retryFailedStep --grep '(?=.*)^(?!.*@mobile)^(?!.*@tablet)^(?!.*@pageDesigner)' --profile",
    "test:acceptance:smoke": "npx codeceptjs run --plugins retryFailedStep --grep @happyPath --profile",
    "test:acceptance:pagedesigner": "npx codeceptjs run --plugins retryFailedStep --grep @pageDesigner --profile",
    "test:acceptance:desktop": "npx codeceptjs run --plugins retryFailedStep --grep '(?=.*)^(?!.*@mobile)^(?!.*@tablet)^(?!.*@pageDesigner)^(?!.*@deepTest)' --profile",
    "test:acceptance:mobile": "npx codeceptjs run --plugins retryFailedStep --profile sauce:phone --grep @mobile",
    "test:acceptance:tablet": "npx codeceptjs run --plugins retryFailedStep --profile sauce:tablet --grep @tablet",
    "test:acceptance:parallel": "npx codeceptjs run-multiple parallel --plugins retryFailedStep --profile",
    "test:acceptance:multibrowsers": "npx codeceptjs run-multiple multibrowsers --plugins retryFailedStep --profile",
    "test:acceptance:report": "./node_modules/.bin/allure serve test/acceptance/report",
    "bdd:snippets": "./node_modules/.bin/codeceptjs bdd:snippets --path",
    "compile:scss": "export NODE_OPTIONS=--openssl-legacy-provider && sgmf-scripts --compile css",
    "compile:js": "export NODE_OPTIONS=--openssl-legacy-provider && sgmf-scripts --compile js",
    "compile:fonts": "node bin/Makefile compileFonts",
    "build": "npm run compile:js && npm run compile:fonts && npm run compile:scss",
    "lint": "npm run lint:css && npm run lint:js",
    "lint:css": "export NODE_OPTIONS=--openssl-legacy-provider && sgmf-scripts --lint css",
    "lint:js": "export NODE_OPTIONS=--openssl-legacy-provider && sgmf-scripts --lint js",
    "init:isml": "./node_modules/.bin/isml-linter --init",
    "lint:isml": "./node_modules/.bin/isml-linter",
    "build:isml": "./node_modules/.bin/isml-linter --build",
    "fix:isml": "./node_modules/.bin/isml-linter --autofix",
    "upload": "export NODE_OPTIONS=--openssl-legacy-provider && sgmf-scripts --upload",
    "uploadCartridge": "export NODE_OPTIONS=--openssl-legacy-provider && sgmf-scripts --uploadCartridge app_storefront_base && sgmf-scripts --uploadCartridge modules && sgmf-scripts --uploadCartridge bm_app_storefront_base",
    "watch": "export NODE_OPTIONS=--openssl-legacy-provider && sgmf-scripts --watch",
    "watch:static": "export NODE_OPTIONS=--openssl-legacy-provider && sgmf-scripts --watch static",
    "release": "node bin/Makefile release --"
  },


```

## Libraries

It seems like we still have a long way to go. The libraries we're using for SFRA are outdated and trying to access Node functions that are no longer available.

Let's get cracking, and give them an update!

```

					npm update


```

```

					npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR!
npm ERR! While resolving: sfra@6.3.0
npm ERR! Found: stylelint@13.13.1
npm ERR! node_modules/stylelint
npm ERR!   dev stylelint@"^13.13.1" from the root project
npm ERR!
npm ERR! Could not resolve dependency:
npm ERR! peer stylelint@"^8.0.0" from stylelint-config-standard@17.0.0



```

![Developer reviewing dependency updates after a failed npm resolution.](/media/2023/upgrading-libraries-developer-d40cf53b81.jpg)

Ok. Probably never 😅

This task will require a significant amount of effort, and the outcome may vary depending on the used cartridges. If you have been working on a project for an extended period, some libraries may have been updated, while others remain unchanged from the beginning.

However, it seems that the essential scripts are functioning correctly:

-   Compiling
-   Linting
-   Uploading

And that is a good place to start! I hope this article proves helpful in updating your SFRA project to Node 18.

_Wishing you the best!_

## Shouldn't Salesforce make it compatible?

While the [Composable Storefront](/sitegenesis-vs-sfra-vs-pwa/) is generating a lot of excitement, SFRA remains a dependable choice for launching websites around the world. To stay current with the latest technology, it would make sense for Salesforce to simplify upgrading to Node 18.

One important question remains: what will happen to third-party cartridges? It will require some investment from numerous third-party suppliers. The real question is, are they willing to make such an investment?
