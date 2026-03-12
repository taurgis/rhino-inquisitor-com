---
title: Use SFRA REST Endpoints in a Composable Storefront?
description: >-
  When working with Salesforce B2C Commerce Cloud in a hybrid approach (using
  SFRA with a Composable Storefront project), you naturally end up with some
date: '2024-10-21T09:36:19.000Z'
lastmod: '2024-10-21T09:36:27.000Z'
url: /should-i-use-sfra-rest-endpoints-in-a-composable-storefront/
draft: false
heroImage: >-
  /wp-content/uploads/2024/10/a-modern-building-connected-to-old-architecture.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - composable storefront
  - sfcc
  - sfra
  - technical
author: Thomas Theunen
---
When working with Salesforce B2C Commerce Cloud in a hybrid approach (using SFRA with a Composable Storefront project), you naturally end up with some pages as SFRA Controllers and other parts of the project built on the Composable Storefront.

In that regard, you end up using [SFRA](https://www.rhino-inquisitor.com/sitegenesis-vs-sfra-vs-pwa/) Controllers, and it all works with the Composable Storefront through the magic of [SLAS](https://www.rhino-inquisitor.com/how-to-set-up-slas-for-the-composable-storefront/)! But is the same true for using controllers to create REST endpoints?

## There is a better native solution

Let's get straight to the answer without beating around the bush: The answer to the question in this blog post is "NO."

While controllers were the only option in the past, we now have a more flexible solution: [Custom SCAPI endpoints](https://developer.salesforce.com/docs/commerce/commerce-api/guide/custom-apis.html) that support all request methods (GET, POST, PUT, DELETE). This flexibility allows you to adapt to different request types.

Besides all request methods, we get:

-   [Same authentication methodology](https://developer.salesforce.com/docs/commerce/commerce-api/guide/custom-api-authentication.html) (SLAS JWT)
-   [Personalisation & caching](https://developer.salesforce.com/docs/commerce/commerce-api/guide/custom-api-caching.html)

So, if you have some controllers or [custom OCAPI endpoints](https://www.rhino-inquisitor.com/creating-custom-ocapi-endpoints/) left over on a project built before this, it might be a good time to add a ticket to your backlog to upgrade them.

Are you still interested in the reason for this? If so, keep on reading!

## Reasons not to do it

### Supported methods

Out of the box, the only two methods you can support with SFRA are [GET](https://github.com/SalesforceCommerceCloud/storefront-reference-architecture/blob/1cb2b329fa281333403bb2681b939e727aee809a/cartridges/modules/server/server.js#L115) and [POST](https://github.com/SalesforceCommerceCloud/storefront-reference-architecture/blob/1cb2b329fa281333403bb2681b939e727aee809a/cartridges/modules/server/server.js#L126). This is quite the limiting factor when working in a headless and composable fashion, where you make every endpoint a POST.

There is a way around this limitation that I experimented with before custom SCAPI endpoints were a thing in my "[Headless Reference Architecture](https://github.com/taurgis/headless-reference-architecture) (Deprecated)", a branch off of SFRA specifically made for Composable Storefront projects needing to create custom controller endpoints.

### Personalisation and session bridging

When creating endpoints that require personalisation, you need to use "plugin\_slas" to transfer your JWT to a session cookie. However, in specific scenarios, redirects and URL refreshes are some of the "actions" that occur.

While this is fine for a regular user loading a page in the browser, for integrations, it can be a significant hurdle to overcome.

It can also introduce extra API calls and delays in getting responses.

#### Adding complexity to your API architecture

Employing session transformation and SLAS this way increases architectural complexity, complicating debugging efforts unnecessarily.

### Session creation

One of the benefits of choosing Salesforce is that we don't have to worry about server and hardware-related issues, as scaling happens automatically. However, this doesn't mean we should introduce unnecessary load onto the system just because we can.

A downside of calling a "controller API" is that it behaves like an SFRA request. If the request does not attach a session cookie, the system will recognise that it needs to start a new one.

If we poorly implement a custom endpoint that is called on every page load to retrieve "mundane information," we will create thousands of sessions for no reason. These unnecessary sessions also need to be cleaned from the database, creating additional system load that could be better utilised.

![A person using a calculator for Excel has built-in functions to do calculations for you. It represents inefficient work and creates a significant workload for no reason.](/media/2024/calculator-and-excel-e1728648264417-2b10df8062.jpeg)

Why create a big workload when it is not needed?

## Conclusion?

The conclusion was already shared at the [start of the article](#conclusion)!
