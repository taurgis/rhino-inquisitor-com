---
title: How to load client-side JavaScript and CSS in SFRA
description: >-
  Since you are here, I bet you've been banging your head against your keyboard
  trying to figure out how to load some sweet client-side javascript in
date: '2024-02-19T08:28:48.000Z'
lastmod: '2024-02-19T08:31:26.000Z'
url: /how-to-load-client-side-javascript-and-css-in-sfra/
draft: false
heroImage: /media/2023/client-side-js-e2475a2ea2.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - sfcc
  - sfra
  - technical
author: Thomas Theunen
---
Since you are here, I bet you've been banging your head against your keyboard trying to figure out how to load some sweet client-side javascript in Salesforce Commerce Cloud's [SFRA](/sitegenesis-vs-sfra-vs-pwa/) (Storefront Reference Architecture). Well, fear not, because I'm here to help (hopefully)!

First, let's ensure we're on the same page. SFRA uses ISML ([Internet Store Markup Language](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-working-with-templates.html)) for its templates and layouts, which means that to load in some javascript, we'll need to use certain ISML tags and SFRA "features" to include it in our templates.

## SFRA provides a helper

The Storefront Reference Architecture provides many features and "helpers" to make developers' lives easier. One of those features is the "[assets.js](https://github.com/SalesforceCommerceCloud/storefront-reference-architecture/blob/master/cartridges/app_storefront_base/cartridge/scripts/assets.js)" file to load client-side JavaScript and CSS in a structured way.

```


    var assets = require('*/cartridge/scripts/assets.js');
    assets.addCss('/css/account/my-file.css');
    assets.addJs('/js/my-file.js');



```

### What is it?

In short: It is a "singleton" type class with two arrays that stores all CSS and JavaScript files that need to be loaded for the current page.

### When does it load the files?

#### CSS

The "[htmlHead.isml](https://github.com/SalesforceCommerceCloud/storefront-reference-architecture/blob/50ee82face6e0a000f649a51f162e8a3f171531c/cartridges/app_storefront_base/cartridge/templates/default/common/htmlHead.isml)" template is loaded within the pages of your project. And within that template, you'll find the following code:

This code is responsible for loading all the fancy styles that are present in that array we talked about earlier.

```


    integrity="${style.integrity}" crossorigin="anonymous" />



```

#### JavaScript

Like styles, you can also load JavaScript files into your SFRA project using ISML. The main difference is that you'll be using the [scripts.isml](https://github.com/SalesforceCommerceCloud/storefront-reference-architecture/blob/master/cartridges/app_storefront_base/cartridge/templates/default/common/scripts.isml) template instead of htmlHead.isml. And if you want to see the big picture, you can check out the "[page.isml](https://github.com/SalesforceCommerceCloud/storefront-reference-architecture/blob/master/cartridges/app_storefront_base/cartridge/templates/default/common/layout/page.isml#L32)" file, which is the highest-level ISML file used in SFRA.

## It doesn't work! Why????

### Remote Includes

If you're using a [remote include](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/ops_troubleshooting/b2c_understanding_remote_includes.html) to render your component and loading the CSS and JS within that component with "assets.js", you might have noticed that it doesn't work. Here's why:

When you make a remote include, it's essentially a separate internal request. And here's the thing about "assets.js" - it works in a singleton way - but only on the request level, meaning that variables are only stored per request and not for all requests.

So when you add JS and CSS within the remote include, the main request doesn't know about it because it's being stored in a separate store. As a result, the added JS and CSS are not rendered on the page.

Make sense?

[![A visual representation of the Home-Show controller for explaining the scoping of assets.js](/media/2024/javascript-and-css-scoping-in-sfra-2-5444adf22e.png)](/media/2024/javascript-and-css-scoping-in-sfra-2-5444adf22e.png)

### Caching

This might seem like a no-brainer, but it's worth mentioning: remember to clear your cache or disable it entirely if necessary (in your development environment).

Trust me; it can save you a lot of headaches.

### A controller without "page.isml"

If you need to render a small component or a unique page type that isn't like the central styling of SFRA, you might need to take matters into your own hands (re-create it or use a different system).

Without the ISML templates we mentioned earlier, there's no way for the CSS and JS files to be rendered in HTML. Keep that in mind.

As a reference, here is how a controller template in SFRA is usually "decorated", which includes our "assets.js" templates:

## Conclusion

Getting your JavaScript and CSS to appear in the HTML code is not a difficult task. However, a few crucial elements are required to make it happen in a structured way, which SFRA (Storefront Reference Architecture) provides. You should utilise the tools provided to you, as they can make your life just a tiny bit easier.
