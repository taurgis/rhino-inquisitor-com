---
title: Server-Side Caching for Faster SFCC REST APIs
description: >-
    Caching GET endpoints for the OCAPI in Salesforce B2C Commerce Cloud is
    possible, but where do you start? Let us dig into this together!
date: '2023-04-10T06:46:06.000Z'
lastmod: '2026-07-04T14:20:18.000Z'
url: /caching-rest-apis-in-sfcc/
draft: false
heroImage: caching-87696b30b8.jpg
categories:
    - Salesforce Commerce Cloud
    - Technical
tags:
    - cache
    - ocapi
    - sfcc
    - technical
author: Thomas Theunen
takeaways:
    - "Explains which OCAPI Shop API resources support server-side caching and which do not"
    - "Shows how page cache and OCAPI settings control cache duration and personalisation"
    - "Clarifies why SCAPI cache control is more limited and where custom caches help instead"
---
Server-side caching keeps GET requests to your Salesforce B2C Commerce REST APIs fast without hammering the application server on every call. For years, the [OCAPI](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-commerce-ocapi/get-started-with-ocapi.html) handled this through settings in the Business Manager, but the OCAPI was deprecated platform-wide in April 2026.

> [!NOTE]
> Updated July 2026: This article originally covered only OCAPI cache configuration. The OCAPI is now deprecated, so the guidance below starts with how caching works for Custom SCAPI endpoints today; the original OCAPI walkthrough is preserved further down [for the archives](#for-the-archives-ocapi-cache-configuration).

## Caching Custom SCAPI Endpoints

Custom SCAPI endpoints — the officially supported way to add your own routes to the Salesforce Commerce API — can cache their responses, but the mechanism looks nothing like the OCAPI settings further down this article. Instead of a JSON `cache_time` value, you call two Script API methods directly inside the endpoint's implementation script, as described in [Salesforce's Custom API caching guide](https://developer.salesforce.com/docs/commerce/commerce-api/guide/custom-api-caching.html).

Page Cache still has to be enabled for the site first, exactly like it did for OCAPI. With that in place, here's a Custom Product API endpoint that caches its response for 60 seconds:

```javascript
var RESTResponseMgr = require("dw/system/RESTResponseMgr");

exports.getCustomProduct = function () {
  var customProduct = // ... some lookup of custom product data ...

  // set cache time to 60 seconds
  response.setExpires(Date.now() + 60000);

  RESTResponseMgr.createSuccess(customProduct).render();
};

exports.getCustomProduct.public = true;
```

`response.setExpires(milliseconds)` takes an absolute timestamp, not a duration — that's why it's `Date.now() + 60000` and not just `60000`. Get that backwards and the cache time ends up wildly wrong, since a bare millisecond count reads as a moment already in the past.

If a resource's cache validity depends on something other than time — a promotion, for instance — mark it with `setVaryBy()` instead:

```javascript
var RESTResponseMgr = require("dw/system/RESTResponseMgr");

exports.getCustomProduct = function () {
  var customProduct = // ... some lookup of custom product data ...

  // set caching based on promotion
  response.setVaryBy("price_promotion");

  RESTResponseMgr.createSuccess(customProduct).render();
};

exports.getCustomProduct.public = true;
```

`setVaryBy()` marks the response as personalised, so the cache doesn't serve one shopper's promotion-adjusted price to another. Use it carefully: flag a response as personalised when it isn't, and you lose most of the cache-hit benefit you were chasing in the first place.

One scoping detail worth being explicit about: this is for **Custom APIs**, the endpoints you write yourself. The standard Shopper APIs (Products, Search, Categories, and the rest) don't expose an equivalent cache-time control the way the old OCAPI Shop API did.

### Custom Caches to the rescue (for hooks)

[Custom caches](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-custom-caches.html) are user-defined in Salesforce B2C Commerce Cloud, allowing developers to store and retrieve data efficiently. They can be used to cache frequently accessed data, reducing the load on the server and speeding up response times for SCAPI REST APIs where [hooks](/how-to-use-ocapi-scapi-hooks/) have been implemented. Here are some ways custom caches can be used to speed up responses in the SCAPI REST APIs that have customisations:

1. **Reducing database queries:** If an API call requires fetching data from the database, custom caches can help store the data in memory. This way, when subsequent API calls are made, the data can be quickly retrieved from the cache instead of querying the database again.
1. **Complex Calculations:** Sometimes, processing API requests may involve complex calculations or transformations. Custom caches can store the results of these calculations, allowing subsequent requests to retrieve the cached data instead of re-computing the results.
1. **Third-party API responses:** If your SCAPI REST APIs depend on third-party APIs, custom caches can help store the responses from these external APIs, reducing latency and improving performance.

## For the Archives: OCAPI Cache Configuration

What follows is the original OCAPI caching walkthrough as it ran when this article was first published in April 2023, preserved for the archives. Read it as a period piece: the `"_v": "22.6"` schema version in both JSON examples below was current at the time of writing (OCAPI versioning stopped at 24.5 before the platform-wide deprecation), and the configuration it describes no longer applies to new development.

### What can be cached in the OCAPI

Before we start, we must understand that not all API endpoints support caching. But which ones do?

- [Meta API](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-commerce-ocapi/metadata.html)
- [Categories](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-shop-categories?meta=Summary)
- [Content](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-shop-content?meta=Summary)
- [ContentSearch](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-shop-content-search?meta=Summary)
- [CustomObjects](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-shop-custom-objects?meta=Summary)
- [Folders](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-shop-folders?meta=Summary)
- [Products](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-shop-products?meta=Summary)
- [ProductSearch](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-shop-product-search?meta=Summary)
- [Promotions](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-shop-promotions?meta=Summary)
- [SearchSuggestion](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-shop-search-suggestion?meta=Summary)
- [Site](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-shop-site?meta=Summary)
- [Stores](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-shop-stores?meta=Summary)

This is quite an extensive list and contains all the objects we would expect to support caching!

> [!NOTE]
> All twelve links above still resolve as of July 2026, now labeled "(deprecated)" in their page titles rather than removed. Salesforce hasn't pulled the OCAPI reference docs, just relabeled them.

> [!NOTE]
> Only GET calls can be cached.

> [!NOTE]
> The Data API does not support caching at all.

### Page Cache

An important thing to remember before starting to tinker with the [Shop API](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-commerce-ocapi/get-started-with-ocapi.html) (part of the OCAPI) caching is to enable the "[Page Cache](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-content-cache.html)" for the site you will be working with. If the Page Cache is disabled, you will see this header value on every response:

```text
cache-control: no-cache, no-store, must-revalidate
```

This is easy to fix. But without enabling it, you cannot test your settings on a sandbox where this is usually disabled.

> [!WARNING]
> It is not possible to clear the Page Cache for the OCAPI only, it will take your storefront (SiteGenesis/SFRA) with it. Clearing the page cache can create a heavy load on the application servers. Only clear the page cache manually when necessary, and avoid clearing it during times of high traffic.

### Overriding the OCAPI Cache Time

It is possible to override the default 60 seconds of caching of a resource by adding it to the [OCAPI Settings](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-commerce-ocapi/ocapisettings.html) in the Business Manager. _"Administration" > "Site Development" > "Open Commerce API Settings"_

{{< img-caption src="ocapi-settings-with-cache-f7e7acfcf8.png" alt="OCAPI caching settings" caption="OCAPI resource cache_time settings" link="ocapi-settings-with-cache-f7e7acfcf8.png" >}}

```json
{
    "_v": "22.6",
    "clients": [
        {
            "client_id": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "allowed_origins": [],
            "resources": [
                {
                    "resource_id": "/categories/*",
                    "methods": [
                        "get"
                    ],
                    "read_attributes": "(**)",
                    "cache_time": 900
                },
                {
                    "resource_id": "/customers/auth",
                    "methods": [
                        "post"
                    ],
                    "read_attributes": "(**)",
                    "write_attributes": "(**)"
                },
                {
                    "resource_id": "/product_search",
                    "methods": [
                        "get"
                    ],
                    "read_attributes": "(**)",
                    "write_attributes": "(**)",
                    "cache_time": 86400
                }
            ]
        }
    ]
}
```

Adding "cache_time" to the resource configuration lets you easily control the time responses are cached. You can set a **maximum value of 86,400 seconds** (1 day).

#### "Expand" parameter

**Lowest cache time wins.** When you use the expand parameter to make a single request with the Open Commerce API, the Cache-Control header is automatically populated with the lowest caching time of the requested resources.

{{< img-caption src="ocapi-expand-parameter-caching-c91c7001dd.jpg" alt="OCAPI: Expand Parameter Caching" caption="Expand parameter cache-time rule" link="ocapi-expand-parameter-caching-c91c7001dd.jpg" >}}

### Personalised Caching

Personalised caching is enabled by default based on the customer context (JWT). It is possible to disable this for a resource to improve performance.

```json
{
    "_v": "22.6",
    "clients": [
        {
            "client_id": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "allowed_origins": [],
            "resources": [
                {
                    "resource_id": "/product_search",
                    "methods": [
                        "get"
                    ],
                    "read_attributes": "(**)",
                    "write_attributes": "(**)",
                    "cache_time": 86400,
                    "personalized_caching_enabled": false
                }
            ]
        }
    ]
}
```

By setting the "personalized_caching_enabled" option to false, personalisation will be disabled for that resource.

> [!NOTE]
> You can find information about other options (not related to caching) for resources on [Salesforce Developers](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-commerce-ocapi/ocapisettings.html).

### OCAPI Caching Best Practices

There is a lot of information and best practices available on [Salesforce Developers](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-commerce-ocapi/bestpractices.html), including a dedicated OCAPI Cache Management section covering `cache_time` and `personalized_caching_enabled` in more depth.
