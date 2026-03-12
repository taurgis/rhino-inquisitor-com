---
title: Server-Side Caching for Faster SFCC REST APIs
description: >-
    Caching GET endpoints for the OCAPI in Salesforce B2C Commerce Cloud is
    possible, but where do you start? Let us dig into this together!
date: '2023-04-10T06:46:06.000Z'
lastmod: '2023-04-11T08:01:28.000Z'
url: /caching-rest-apis-in-sfcc/
draft: false
heroImage: /media/2023/caching-87696b30b8.jpg
categories:
    - Salesforce Commerce Cloud
    - Technical
tags:
    - cache
    - ocapi
    - sfcc
    - technical
author: Thomas Theunen
---
The [OCAPI](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/usage/OpenCommerceAPI.html?cp=0_16) has been around for a long time (2016) and allows you to cache responses to increase performance. **By default, GET responses that support caching are cached for 60 seconds**, but can this be improved?

## What can be cached in the OCAPI

Before we start, we must understand that not all API endpoints support caching. But which ones do?

- [Meta API](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/usage/Metadata.html)
- [Categories](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/shop/Resources/Categories.html?cp=0_16_3_1)
- [Content](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/shop/Resources/Content.html?cp=0_16_3_2)
- [ContentSearch](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/shop/Resources/ContentSearch.html?cp=0_16_3_3)
- [CustomObjects](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/shop/Resources/CustomObjects.html?cp=0_16_3_5)
- [Folders](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/shop/Resources/Folders.html?cp=0_16_3_6)
- [Products](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/shop/Resources/Products.html?cp=0_16_3_12)
- [ProductSearch](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/shop/Resources/ProductSearch.html?cp=0_16_3_13)
- [Promotions](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/shop/Resources/Promotions.html?cp=0_16_3_14)
- [SearchSuggestion](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/shop/Resources/SearchSuggestion.html?cp=0_16_3_15)
- [Site](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/shop/Resources/Site.html?cp=0_16_3_17)
- [Stores](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/shop/Resources/Stores.html?cp=0_16_3_18)

This is quite an extensive list and contains all the objects we would expect to support caching! Something to keep in mind Only GET calls can be cached. Something to keep in mind The Data API does not support caching at all.

## Page Cache

An important thing to remember before starting to tinker with the [Shop API](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/usage/ShopAPIResources.html) (part of the OCAPI) caching is to enable the "[Page Cache](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/site_development/b2c_configure_page_cache.html)" for the site you will be working with. If the Page Cache is disabled, you will see this header value on every response:

```text
cache-control: no-cache, no-store, must-revalidate
```

This is easy to fix. But without enabling it, you cannot test your settings on a sandbox where this is usually disabled. Something to keep in mind It is not possible to clear the Page Cache for the OCAPI only, it will take your storefront (SiteGenesis/SFRA) with it. Clearing the page cache can create a heavy load on the application servers. Only clear the page cache manually when necessary, and avoid clearing it during times of high traffic.

## Overriding the OCAPI Cache Time

It is possible to override the default 60 seconds of caching of an resource by adding it to the [OCAPI Settings](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/usage/OCAPISettings.html?cp=0_16_2_24) in the Business Manager. _"Administration" > "Site Development" > "Open Commerce API Settings"_

[![OCAPI caching settings](/media/2023/ocapi-settings-with-cache-f7e7acfcf8.png)](/media/2023/ocapi-settings-with-cache-f7e7acfcf8.png)

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

Adding "cache\_time" to the resource configuration lets you easily control the time responses are cached. You can set a **maximum value of 86.400 seconds** (1 day).

### "Expand" parameter

Lowest Cache Time When using the expand parameter to make a single request with the Open Commerce API, the Cache-Control header is automatically populated with the lowest caching time of the requested resources.

[![OCAPI: Expand Parameter Caching](/media/2023/ocapi-expand-parameter-caching-c91c7001dd.jpg)](/media/2023/ocapi-expand-parameter-caching-c91c7001dd.jpg)

Screenshot of the Infocenter about the "expand" parameter

## Personalized Caching

Personalized caching is enabled by default based on the customer context (JWT). It is possible to disable this for a resource to improve performance.

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

By setting the "personalized\_caching\_ enabled" option to false, personalization will be disabled for that resource. Something to keep in mind You can find information about other options (not related to caching) for resources in the [Infocenter](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/usage/OCAPISettings.html).

## SCAPI (Salesforce Commerce API)

Currently, you can't control the server-side cache times of SCAPI. All known approaches from the OCAPI Shop API (for example, setting cache times in the OCAPI settings) don’t apply to the [Salesforce Commerce API](https://developer.salesforce.com/docs/commerce/commerce-api/guide).

### Custom Caches to the rescue (for hooks)

[Custom caches](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/caches/b2c_custom_caches.html) are user-defined in Salesforce B2C Commerce Cloud, allowing developers to store and retrieve data efficiently. They can be used to cache frequently accessed data, reducing the load on the server and speeding up response times for SCAPI REST APIs where [hooks](/how-to-use-ocapi-scapi-hooks/) have been implemented. Here are some ways custom caches can be used to speed up responses in the SCAPI REST APIs that have customisations:

1. **Reducing database queries:** If an API call requires fetching data from the database, custom caches can help store the data in memory. This way, when subsequent API calls are made, the data can be quickly retrieved from the cache instead of querying the database again.
1. **Complex Calculations:** Sometimes, processing API requests may involve complex calculations or transformations. Custom caches can store the results of these calculations, allowing subsequent requests to retrieve the cached data instead of re-computing the results.
1. **Third-party API responses:** If your SCAPI REST APIs depend on third-party APIs, custom caches can help store the responses from these external APIs, reducing latency and improving performance.

## OCAPI Caching Best Practices

There is a lot of information and best practices available on the [Infocenter](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/usage/BestPractices.html?cp=0_16_2_2).
