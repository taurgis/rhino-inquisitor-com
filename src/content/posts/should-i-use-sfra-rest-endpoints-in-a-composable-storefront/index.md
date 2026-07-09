---
title: Use SFRA REST Endpoints in a Composable Storefront?
description: >-
  Custom SCAPI endpoints beat SFRA controllers for REST APIs in a composable
  storefront, with full HTTP method support and native SLAS authentication.
date: '2024-10-21T09:36:19.000Z'
lastmod: '2026-07-09T09:33:51.000Z'
url: /should-i-use-sfra-rest-endpoints-in-a-composable-storefront/
draft: false
heroImage: a-modern-building-connected-to-old-architecture-b9920e4c92.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - composable storefront
  - sfcc
  - sfra
  - technical
author: Thomas Theunen
takeaways:
  - "Argues that SFRA controllers should not be used as custom REST endpoints in modern composable storefront projects"
  - "Explains why custom SCAPI endpoints are the better native option for authentication, caching, request-method support, and architecture clarity"
  - "Highlights the operational downsides of controller-based APIs, including session creation, session bridging, and added system load"
---
When working with Salesforce B2C Commerce Cloud in a hybrid approach (using SFRA with a Composable Storefront project), you naturally end up with some pages as SFRA Controllers and other parts of the project built on the Composable Storefront.

In that regard, you end up using [SFRA](/sitegenesis-vs-sfra-vs-pwa/) Controllers, and it all works with the Composable Storefront through the magic of [SLAS](/how-to-set-up-slas-for-the-composable-storefront/)! But is the same true for using controllers to create REST endpoints?

## There is a better native solution

Let's get straight to the answer without beating around the bush: The answer to the question in this blog post is "NO."

While controllers were the only option in the past, we now have a more flexible solution: [Custom SCAPI endpoints](https://developer.salesforce.com/docs/commerce/commerce-api/guide/custom-apis.html) that support all request methods (GET, POST, PUT, DELETE). This flexibility allows you to adapt to different request types.

Besides all request methods, we get:

- [Same authentication methodology](https://developer.salesforce.com/docs/commerce/commerce-api/guide/custom-api-authentication.html) (SLAS JWT)
- [Personalisation & caching](https://developer.salesforce.com/docs/commerce/commerce-api/guide/custom-api-caching.html)

So, if you have some controllers or [custom OCAPI endpoints](/creating-custom-ocapi-endpoints/) left over on a project built before this, it might be a good time to add a ticket to your backlog to upgrade them.

Are you still interested in the reason for this? If so, keep on reading!

## Reasons not to do it

### Supported methods

Out of the box, the only two methods you can support with SFRA are [GET](https://github.com/SalesforceCommerceCloud/storefront-reference-architecture/blob/1cb2b329fa281333403bb2681b939e727aee809a/cartridges/modules/server/server.js#L115) and [POST](https://github.com/SalesforceCommerceCloud/storefront-reference-architecture/blob/1cb2b329fa281333403bb2681b939e727aee809a/cartridges/modules/server/server.js#L126). This is quite the limiting factor when working in a headless and composable fashion, where you make every endpoint a POST.

There is a way around this limitation that I experimented with before custom SCAPI endpoints were a thing in my "[Headless Reference Architecture](https://github.com/taurgis/headless-reference-architecture) (Deprecated)", a branch off SFRA specifically made for Composable Storefront projects needing to create custom controller endpoints.

### Personalisation and session bridging

When creating endpoints that require personalisation, the controller approach ties you to a session cookie. For years, getting a shopper's SLAS JWT into that session meant installing the `plugin_slas` cartridge, which added three to five extra remote API calls on every login and its own quirks around redirects and URL refreshes while it transferred the token.

That cartridge is no longer the answer. Since B2C Commerce release 25.3, native [Hybrid Authentication](/slas-in-sfra-or-sitegenesis/) keeps the `dwsid` cookie and the SLAS JWT in sync on the platform side, with none of the cartridge's extra calls or maintenance overhead.

Hybrid Auth removes the cartridge's cost, but not the design it was built to patch: a personalised controller endpoint is still a session-bound request. That is fine for a regular user loading a page in the browser, but for an integration that just wants a JSON response, carrying a session cookie is a hurdle you shouldn't have to clear.

#### Adding complexity to your API architecture

Debugging that mix is its own tax: a broken response can mean an invalid session, a JWT that failed to sync, or the controller logic itself, and you have to rule each one out before you find the actual bug.

### Session creation

One of the benefits of choosing Salesforce is that we don't have to worry about server and hardware-related issues, as scaling happens automatically. However, this doesn't mean we should introduce unnecessary load onto the system just because we can.

A downside of calling a "controller API" is that it behaves like an SFRA request. If the request does not attach a session cookie, the system will recognise that it needs to start a new one.

If we poorly implement a custom endpoint that is called on every page load to retrieve "mundane information," we will create thousands of sessions for no reason. These unnecessary sessions also need to be cleaned from the database, creating additional system load that could be better utilised.

{{< img-caption src="calculator-and-excel-e1728648264417-2b10df8062.jpeg" alt="A person using a calculator for Excel has built-in functions to do calculations for you. It represents inefficient work and creates a significant workload for no reason." >}}

## Conclusion?

The answer was "NO" from the outset: don't build custom REST endpoints as SFRA controllers. Custom SCAPI endpoints give you every HTTP method, native SLAS authentication, and none of the session baggage described above.
