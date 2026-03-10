---
title: Where can you "hook" into an SFRA request or controller?
description: >-
  Have you ever wondered how Salesforce Commerce Cloud, especially $1
  (Storefront Reference Architecture), handles the rendering of pages based on
  control...
date: '2024-10-07T07:17:57.000Z'
lastmod: '2024-10-07T07:35:26.000Z'
url: /where-to-hook-into-an-sfra-controller/
draft: false
heroImage: /media/2024/a-road-taking-odd-paths-a9419c4f36.jpeg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - sfcc
  - sfra
  - technical
author: Thomas Theunen
---
Have you ever wondered how Salesforce Commerce Cloud, especially [SFRA](/sitegenesis-vs-sfra-vs-pwa/) (Storefront Reference Architecture), handles the rendering of pages based on controllers and routes?

It's like embarking from point A to point B, with controlled detours and sudden stops. This blog will explore how SFRA allows us to navigate these situations and the various options available at different locations.

Let's dive in!

## Global Hooks

Before we discuss the SFRA specifics, let's start with some [global options](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/index.html?target=class_dw_system_RequestHooks.html) that allow us to execute code for any request (SFRA or not).

For the technical details, please read [this blog post by Johnny Tordgeman.](https://medium.com/perimeterx/11-days-of-salesforce-storefront-reference-architecture-sfra-day-8-a-tale-of-two-events-fce297029857)

### onRequest

The onRequest hook in SFCC allows you to intercept and modify an incoming HTTP request before the system processes it.

This hook is commonly used for [session validation](https://github.com/SalesforceCommerceCloud/composable-hybrid-sitegenesis-poc/blob/0ceeef56aeab190a24378a0d7cae487477c18a16/cartridges/int_slas/cartridge/scripts/hooks/request/onRequest.js#L39), [request validation](https://github.com/SalesforceCommerceCloud/sfcc-hooks-collection/blob/b7f8d7c02b92cb1f449cb246073832626f227388/commerce-cloud-code/plugin_hooktacular/cartridge/scripts/hooks/onRequest.js#L13), or custom logging tasks.

Cached URLs This hook is executed for all requests, even if the Web Adapter (page cache) caches them. Dangerous Whilst this hook provides a lot of flexibility, it also hooks into _every_ request. So, any exception or delay introduced by your custom code will be reflected on all pages and requests.

### onSession

The onSession hook is a server-side hook executed at the beginning of each new session. This hook allows you to perform custom logic or set session attributes before the session is initialised.

It can be used to customise the session behaviour (like [plugin\_slas](https://github.com/SalesforceCommerceCloud/plugin_slas/blob/main/cartridges/plugin_slas/cartridge/scripts/hooks/request/onSession.js)), such as setting default values, checking for certain conditions, or performing any necessary setup before the session is fully established.

Dangerous Like the onRequest hook, any delay or exception introduced here can be devastating.

## SFRA Routes?

[![A screenshot of the Home.js controller file of the standard SFRA. It contains two routes: Show and ErrorNotFound.](/media/2024/home-controller-routes-in-sfra-ca8b9d167a.jpg)](/media/2024/home-controller-routes-in-sfra-ca8b9d167a.jpg)

The "home.js" controller file of SFRA

Before we get started, we need to ensure we are on the same page on what a "[route](https://github.com/SalesforceCommerceCloud/storefront-reference-architecture/blob/1cb2b329fa281333403bb2681b939e727aee809a/cartridges/modules/server/route.js)" is.

In the context of SFRA (Storefront Reference Architecture) of SFCC (Salesforce Commerce Cloud), a controller route is a mapping between a URL and a specific controller function.
When a user navigates to a specific URL within the SFRA storefront, the controller function, a key element of the SFRA architecture, handles the request and generates the appropriate response (usually ISML or JSON).

The standard available options, and the most common ones, are:

-   GET
-   POST

These will serve as the 'base route', the starting point of our project. But remember, this is just the beginning. We have the power to extend and customize this base route of SFRA, as we'll discover in the options outlined in this blog post.

## SFRA Server functions to extend and replace

Cartridge Path In this example, we are assuming that there is only one extra cartridge in the cartridge path. This simplifies the explanation, as adding more than one cartridge to the path with an expanding function would make it more difficult to understand.

[![](/media/2024/home-show-sfra-controller-be0043f3bf.jpg)](/media/2024/home-show-sfra-controller-be0043f3bf.jpg)

The standard Home-Show controller logic visualised

```

					Cartridge path: plugin_custom:app_storefront_base


```

### server.prepend()

The \`server.prepend\` function adds a middleware function to the beginning of the route stack. This allows you to execute code before the base (app\_storefront\_base) processing begins.

Here's a simple example of how you can use \`server.prepend\` with the homepage function:

```

					server.prepend('Show', function (req, res, next) {
 // Your code here will be executed before the app_storefront_base
 next();
});


```

[![SFRA prepending of Home-Show](/media/2024/sfra-prepend-home-show-de79cdab82.jpg)](/media/2024/sfra-prepend-home-show-de79cdab82.jpg)

Visualising what "prepending" does in a single route (Home-Show)

Fun Fact Prepending was one of the first [pull requests](https://github.com/SalesforceCommerceCloud/storefront-reference-architecture/commit/3f471420e847ffeaf8fea9955a2f1481169a0e86) I had made to SFRA.

### server.append()

The \`server.append\` function adds a middleware function to the end of the route stack. This allows you to execute code after the base (app\_storefront\_base) processing finishes.

Here's a simple example of how you can use \`server.append\` with the homepage function:

```

					server.append('Show', function (req, res, next) {
 // Your code here will be executed after the show function in app_storefront_base
 next();
});


```

[![SFRA appending of Home-Show](/media/2024/sfra-append-home-show-f8e98c7dcd.jpg)](/media/2024/sfra-append-home-show-f8e98c7dcd.jpg)

Visualising what "appending" does in a single route (Home-Show)

### server.replace()

The \`server.replace\` function replaces the entire route stack up until that point. This allows you to replace code in the base (app\_storefront\_base) fully.

Here's a simple example of how you can use \`server.replace\` with the homepage function:

```

					server.replace('Show', function (req, res, next) {
    var Site = require('dw/system/Site');
    var PageMgr = require('dw/experience/PageMgr');
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    pageMetaHelper.setPageMetaTags(req.pageMetaData, Site.current);
    var page = PageMgr.getPage('homepage');
    if (page && page.isVisible()) {
        res.page('homepage');
    } else {
        res.render('home/homePage');
    }
    next();
});


```

[![SFRA replacing of Home-Show](/media/2024/sfra-replace-home-show-d90b35f072.jpg)](/media/2024/sfra-replace-home-show-d90b35f072.jpg)

Visualising what "replacing" does in a single route (Home-Show)

## SFRA Route Hooks

The options explained above already give you quite a bit of flexibility. But what if I told you there is even more to come? The route itself also exposes a few "events" in which we can hook into:

-   **route:Start:** Executes at the start of the route, before any middleware defined using "server.\*"
-   **route:BeforeComplete:** Executes after all route middleware is finished but before the "route:Complete" event.
-   **route:Complete:** The final event, after everything else.
-   **route:Step:** Executed between each route middleware.
-   **route:Redirect:** Executed when a "res.redirect()" is executed.

```

					server.replace('Show', function (req, res, next) {
     this.on('route:BeforeComplete', function (req, res) {
        var viewData = res.getViewData();
       // Your custom logic, executed at the end of the route
    });
    next();
});


```

## Bringing it all together

[![](/media/2024/sfra-home-route-with-all-extension-points-2-7e4462fe3e.jpg)](/media/2024/sfra-home-route-with-all-extension-points-2-7e4462fe3e.jpg)

Bringing all of the options together!

## Multiple Cartridges

The cartridge path influences the order in which SFRA middlewares are executed.

Cartridges higher up in the path are given precedence over those lower down. This means that the middleware in cartridges at the beginning of the path will be executed before those in cartridges further down the path.

New to the concept of "cartridge path"? Have a look at [this trail](https://trailhead.salesforce.com/content/learn/modules/b2c-cartridges/b2c-cartridges-explore)!

Try to experiment When working across multiple cartridges, make use of your debugger (e.g. Prophet) to check in what order your code is executed on the server side to understand the order of execution fully. Don't go overboard Remember that the complexity of adjusting a route is not something to brush over, especially if people often change on the project. Keep your code well structured and the order of execution of every middleware documented.
