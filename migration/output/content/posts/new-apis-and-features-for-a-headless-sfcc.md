---
title: New APIs and Features for a Headless B2C Commerce Cloud
description: >-
  The holiday period was quiet for a long time regarding $1. This was because
  the monolithic system required the deployment of all components, which
  carri...
date: '2023-11-13T09:54:35.000Z'
lastmod: '2023-11-15T12:18:11.000Z'
url: /new-apis-and-features-for-a-headless-sfcc/
draft: false
heroImage: /media/2023/robot-operating-on-its-own-head-797d8fde74.jpg
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - headless
  - sfcc
author: Thomas Theunen
---
The holiday period was quiet for a long time regarding [Salesforce B2C Commerce Cloud releases](/category/release-notes/). This was because the monolithic system required the deployment of all components, which carried the risk of bugs.

However, more options are now available with multiple "layers" in the Headless architecture. Each layer can have its release schedule, and some layers are more modular than others, allowing for finer-grained releases that will not impact the rest (at least in theory).

Major new releases are happening for the first time during the holiday season. And it's pretty exciting!

## Managed Runtime

### Storefront Preview

https://www.rhino-inquisitor.com/wp-content/uploads/2023/11/storefront-preview-demo.mp4

The "Shop the Future" feature seems to have been on the Wishlist since the release of the PWA Kit. This feature was highly sought-after by merchandisers as it allowed them to set up promotions and content in advance and see how they would appear on the site.

However, it can be challenging to implement this feature without the right APIs in a Headless or Composable Commerce setup. Fortunately, this challenge can be overcome with the "[Shop the Future](https://developer.salesforce.com/docs/commerce/commerce-api/guide/shopper-context-api-future.html)" and "[Shopper Context](https://developer.salesforce.com/docs/commerce/commerce-api/guide/shopper-context-api-personalized.html)" options provided by the SCAPI.

This is a big win for any project already on or going to the Composable Storefront!

[Here is a guide to get you started on setting it up](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/storefront-preview.html).

### Changes for the future

https://www.rhino-inquisitor.com/wp-content/uploads/2023/11/runtime-admin-changes.mov

Headless and Composable architectures bring great flexibility for the future but pose particular challenges in monitoring and analytics. One of the significant challenges is consolidating data from multiple entities.

Salesforce has now made it mandatory to specify the back-end you connect from your storefront. This will eliminate guesswork and ensure correct logging is sent to the [Log Center](https://help.salesforce.com/s/articleView?id=cc.b2c_log_center.htm&language=en_US&type=5) linked to the respective environment.

Automatically forwarding logs to the Log Center offers multiple benefits to Salesforce support and users of the Composable Storefront. With this feature, logs for HTTP requests made on production-marked environments are automatically sent, enabling them to anticipate better and troubleshoot any issues that may arise.

## PWA Kit v3.2.1

With the changes happening in the managed runtime, two new releases have happened in the past month of the PWA Kit:

-   [3.2.0](https://github.com/SalesforceCommerceCloud/pwa-kit/releases/tag/v3.2.0)
-   [3.2.1](https://github.com/SalesforceCommerceCloud/pwa-kit/releases/tag/v3.2.1)

Besides the Storefront Preview feature, there are changes to how "[Content-Security-Policy](/secure-coding-in-salesforce-b2c-commerce-cloud/)" is managed in this release. Be sure to review the changes as they are significant.

## OCAPI & SCAPI

### Shopper SEO - Headless URL Resolution

There is a new API in town. SiteGenesis and SFRA have had the ability forever to resolve any type of URL that you configured in the Business manager, and automatically redirect the user to the right place!

But for the PWA Kit or Headless projects, that piece of magic was always missing - until now!

Meet the new [URL Resolution API](https://developer.salesforce.com/docs/commerce/commerce-api/guide/url-resolution.html)!

Performance I suggest following the best practices mentioned in the documentation and using your routing system as the primary option. This API should only be used as a backup. Keep in mind that making an API call involves network hops that can potentially slow down your application.

_I believe that in the future, we will witness endpoints to address some of the gaps that exist compared to SFRA. I have also learned that an upcoming feature will enable direct resolution to the SCAPI payload rather than just the relative ObjectID._

### Stores

![A drawing of retail stores connected by lines; in this case, the lines are Ethernet cables referencing the REST APIs to fetch the store data in Headless applications.](/media/2023/connected-stores-22cea94a19.jpg)

If you remember, the SCAPI release included a "Shopper Stores" group that allowed developers to build their own Store Locator in Headless scenarios.

Unfortunately, this feature was short-lived and disappeared soon after. However, with the Stores API now back in action, developers can again use the "Shopper Stores" group to create custom store locators that meet their specific needs.

This significant development will be welcomed by those eagerly waiting for [this functionality](https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-stores?meta=Summary) to return. I only question how quickly this will make it into the PWA Kit priority-wise. Maybe this could become one of the more extensive community contributions. Who knows?

### More on the horizon?

I received some exciting news about new APIs that Salesforce is currently developing. A custom object API and site preferences API are in active development and are expected to be released in the next cycle.

What APIs would you like to see? Maybe it is ... (_slowly walks over to the next section_)

## Time for Feedback

Have you ever felt helpless when you couldn't provide feedback on a product? Worry no more!

Salesforce is looking for your valuable feedback on their Composable Storefront. They want to hear your honest opinion - the good, the bad, and everything in between. Your feedback will help them improve their product and make it even better.

What are you waiting for? [Share your thoughts and help Salesforce build a product that meets your needs!](https://docs.google.com/forms/d/e/1FAIpQLSdLgfMBo9UnjF84h9sj5UxWm9em1nL0ApTRpRgiDXWWBJKpDQ/viewform)
