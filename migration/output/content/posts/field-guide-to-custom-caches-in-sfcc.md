---
title: 'Field Guide to Custom Caches: Wielding a Double-Edged Sword'
description: >-
  You think you know caching. You’ve enabled page caching, fiddled with content
  slot TTLs, and called it a day. And your Salesforce B2C Commerce Cloud sit...
lastmod: '2025-07-28T07:37:24.000Z'
url: /field-guide-to-custom-caches-in-sfcc/
draft: false
heroImage: /media/2025/custom-caches-in-sfcc-scaled-c245e83c7a.jpeg
date: '2025-07-28T07:32:55.000Z'
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - performance
  - sfcc
  - technical
author: Thomas Theunen
---
You think you know caching. You've enabled page caching, fiddled with content slot TTLs, and called it a day. And your Salesforce B2C Commerce Cloud site is still slower than a snail in molasses. Why? Because you're ignoring the most potent weapon in your performance arsenal: the **Custom Cache**.

[Custom Caches](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-custom-caches.html) are a double-edged sword, though. Wielded with discipline, precision, and a deep understanding of their limitations, they are one of the most potent performance-tuning instruments in your arsenal. Wielded carelessly, they will cut you, your application, and your customer's experience to ribbons. The problem is that the platform's API for `[dw.system.CacheMgr](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/index.html?target=class_dw_system_CacheMgr.html)` is deceptively simple, masking a minefield of architectural traps for the unwary developer.



This is not a beginner's tutorial. This is a field guide for the professional SFCC developer who needs to move beyond basic usage and master this powerful, perilous feature. We're going to charge headfirst into the complexity, expose the sharp edges, and arm you with the patterns and discipline required to use Custom Caches safely, effectively, and with confidence.

## The Lay of the Land: Choosing Your Data Store

Before you even think about writing `CacheMgr.getCache()`, you need to understand its purpose. Using the wrong tool for the job is the first step toward disaster.

In SFCC, you have several options for storing temporary data, and choosing the correct [one](https://developer.salesforce.com/docs/commerce/commerce-solutions/guide/caching-strategies-sk.html) is a foundational architectural decision.

### Custom Cache vs. Page Cache: A Quick Primer

Developers new to the platform frequently conflate Custom Caches and the Page Cache. They are fundamentally different beasts operating at different layers of the architecture. Mistaking one for the other is like using a hammer to turn a screw.

-   **Page Cache** is for caching **rendered output**. It operates at the **web server tier** and stores full HTTP responses—typically HTML fragments generated from ISML templates. You control it with the `[`<iscache>`](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-content-cache.html)` tag or the [`response.setExpires()`](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_system_Response.html#dw_system_Response_setExpires_Number_DetailAnchor) script API method. When a request hits a URL whose response is in the Page Cache, the [web server](/the-salesforce-b2c-commerce-cloud-environment/) serves it directly, never even bothering the application server. It is incredibly fast and is the primary defence against high traffic for storefront pages.


-   **Custom Cache** is for caching **application data**. It operates at the **application server tier** and stores JavaScript objects and primitives inside a script or controller's execution context. You control it exclusively through the `dw.system.CacheMgr` script API. It's designed to avoid recalculating expensive data or re-fetching it from an external source during the execution of a controller that will ultimately produce a response.


The distinction is critical: **Cache the final, cooked meal with Page Cache, cache the raw ingredients with Custom Cache.** To avoid re-rendering a product tile's HTML, use Page Cache with a remote include. If you need to avoid re-fetching the product's third-party ratings data _before_ you render the tile, use a Custom Cache.

Service Caching When discussing caching third-party services with custom caches, remember there's another option I mentioned in a previous article: [using the ServiceRegistry for caching](/third-party-api-caching-in-commerce-cloud/).

To keep this article straightforward, we'll concentrate on caching third-party calls with custom caches. The choice of the best approach for your use case depends on the information you've collected.

## The Developer's Dilemma: request vs. session vs. CacheMgr

Within the application tier, you have three primary ways to store temporary, non-persistent data during script execution. Their scopes and lifetimes are vastly different, and choosing the wrong one can lead to performance degradation, security vulnerabilities, or bizarre bugs.

-   `request.custom`: This [object](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_system_Request.html#dw_system_Request_getCustom_DetailAnchor) lives for the duration of a **single HTTP request**. It is the most ephemeral of the scopes. Its primary purpose is to pass data between middleware steps in an SFRA controller chain or from a controller to the rendering template _within the same server call_. It's a scratchpad for the current transaction and nothing more.
-   `session.custom` / `session.privacy`: These [objects](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_system_Session.html#dw_system_Session_getPrivacy_DetailAnchor) live for the duration of a **user's session**. The platform defines this with a 30-minute soft timeout (which logs the user out and clears privacy data) and a six-hour hard timeout (after which the session ID is invalid). This scope is user-specific and sticky to a single application server. The critical difference is that writing to `session.custom` can trigger a re-evaluation of the user's dynamic customer groups, while `session.privacy` does not. Data in `session.privacy` is also automatically cleared on logout.
-   `dw.system.CacheMgr`: [This](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_system_CacheMgr.html) is an **application-wide, server-specific cache**. The data is shared by _all users and all sessions_ that happen to land on the same application server. Its lifetime is determined either by a configured time-to-live (TTL) or until a major invalidation event occurs, such as a code activation or data replication.

## The Forge: Mechanics of a Custom Cache

Once you've determined that a Custom Cache is the right tool, implementation requires a precise, methodical approach. There is no room for improvisation. Follow these steps as a mandatory checklist.

### The Blueprint: Defining Caches in caches.json

![Image Alt Text: A friendly cartoon character in a flat vector style, building a data cache from a blueprint, with vibrant data lines flowing into the structure.](/media/2025/salesforce-commerce-cloud-blueprinting-caches-c155ca3f8c.jpeg)

Your cache's life begins with a simple declaration. This is done in a JSON file, conventionally named `caches.json`, which must reside within your cartridge.

1. **Create `caches.json`:** Inside your cartridge, create the file. For example: `int_mycartridge/caches.json`.

2. **Define Your Caches:** The file contains a single JSON object with a `caches` key, which is an array of cache definitions. Each definition requires an `id` and can optionally include an `expireAfterSeconds` property.

```

					{
  "caches": [
    {
      "id": "UnlimitedTestCache"
    },
    {
      "id": "TestCacheWithExpiration",
      "expireAfterSeconds": 10
    }
  ]
}


```

The `id` must be **globally unique** across every single cartridge in your site's cartridge path. A duplicate ID will cause the cache to silently fail to initialize, with the only evidence being an error in the logs. The `expireAfterSeconds` sets a TTL for entries in that cache. If omitted, entries have no time-based expiration and persist until the next global cache clear event.

3**. Register in `package.json`:** The platform needs to know where to find your definition file. Reference it in your cartridge's `package.json` using the `caches` key. The path is relative to the `package.json` file itself.



```

					{
    "caches": "./caches.json"
}


```

4. **Enable in Business Manager:** Finally, you must globally enable the custom cache feature. Navigate to **Administration > Operations > Custom Caches** and check the "Enable Caching" box.  Disabling this will clear all custom caches on the instance. This page will also become your primary tool for monitoring cache health.

[![A screenshot of the "Administration > Operations > Custom Caches" screen in the business manager.](/media/2025/ods-custom-caches-business-manager-c30167212b.png)](/media/2025/ods-custom-caches-business-manager-c30167212b.png)

A screenshot of the "Administration > Operations > Custom Caches" screen in the business manager.

### The Core API Arsenal: CacheMgr and Cache

The script API for interacting with your defined caches is straightforward, revolving around two classes: `dw.system.CacheMgr` and `dw.system.Cache`.

-   `CacheMgr.getCache(cacheID)`: [This](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_system_CacheMgr.html#dw_system_CacheMgr_getCache_String_DetailAnchor) is your entry point. It retrieves the cache object that you defined in `caches.json`.

-   `cache.put(key, value)`: Directly [places](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_system_Cache.html#dw_system_Cache_put_String_Object_DetailAnchor) an object into the cache under a specific key, overwriting any existing entry.

-   `cache.get(key)`: Directly [retrieves](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_system_Cache.html#dw_system_Cache_get_String_DetailAnchor) an object from the cache for a given key. It returns `undefined` if the key is not found.

-   `cache.invalidate(key)`: Manually [removes](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_system_Cache.html#dw_system_Cache_invalidate_String_DetailAnchor) a single entry from the cache.



While these methods are simple, using them directly is a beginner's trap. A typical but flawed pattern is

`if (!cache.get(key)) { cache.put(key, loadData()); }`.

This code is not atomic. On a busy server, two concurrent requests could both evaluate the `if` condition as true, both execute the expensive `loadData()` function, and one will wastefully overwrite the other's result. This is inefficient and can lead to race conditions.

### The "Get-or-Load" Pattern: The Only Way to Populate Your Cache

There is a [better way](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_system_Cache.html#dw_system_Cache_get_String_Function_DetailAnchor). It is the (in my opinion) **only** acceptable way to read from and write to a custom cache: the `cache.get(key, loader)` method.

This method combines the get and put operations into a single, atomic action on the application server. It attempts to retrieve the value for a key. If it's a miss, it executes the `loader` callback function, places the function's return value into the cache, and then returns it. If the `loader` function returns `undefined` (not `null), t`he failure is not cached. This keeps your logic clean and concise. (And hopefully, behind that black box, the concurrency conundrum has been taken care of 😇)

Here is the implementation for fetching data from a third-party API:

```

					var CacheMgr = require('dw/system/CacheMgr');
var MyHTTPService = require('~/cartridge/scripts/services/myHTTPService');
var Site = require('dw/system/Site');
/**
 * Retrieves data for a given API endpoint, utilizing a custom cache.
 * @param {string} apiEndpoint - The specific API endpoint to call.
 * @returns {Object|null} - A plain JavaScript object with the API data, or null on failure.
 */
function getApiData(apiEndpoint) {
    // Retrieve the cache defined in caches.json
    var apiCache = CacheMgr.getCache('ExternalRatingsAPI');
    // Construct a robust, unique cache key
    var cacheKey = Site.current.ID + '_api_data_' + apiEndpoint;
    // Use the get-or-load pattern.
    var result = apiCache.get(cacheKey, function() {
        // This loader function only executes on a cache miss for this specific key.
        var service = MyHTTPService.getService();
        var serviceResult = service.call({ endpoint: apiEndpoint });
        // Check for a successful result before caching
        if (serviceResult.ok && serviceResult.object) {
            // IMPORTANT: Return a simple JS object, not the full service result.
            // This prevents caching large, complex API objects.
            try {
                return JSON.parse(serviceResult.object.text);
            } catch (e) {
                // Failed to parse, don't cache the error.
                return undefined;
            }
        }
        // Returning undefined prevents caching a failure.
        return undefined;
    });
    return result;
}


```

## The Art of the Key: Your Cache's True Identity

Developers often obsess over the value being cached, but this is a strategic error. The value is just data; the **key is the entire strategy**. A poorly designed key will lead to cache collisions (serving wrong data), or cache misses (negating any performance benefit).

An anti-pattern, such as adding a dynamic and irrelevant product position parameter to a product tile's cache key, can lead to a near-zero hit rate, rendering the cache completely useless.

### The Anatomy of a Perfect Key

A robust cache key is not just a string; it's a self-documenting, collision-proof identifier. Every key you create should be:

1.  **Unique:** It must uniquely identify a single piece of cacheable data.

2.  **Predictable:** You must be able to deterministically reconstruct the exact same key whenever you need to access the data.

3.  **Scoped:** It must contain all the context necessary to distinguish it from similar data for other sites, locales, or conditions.


A highly effective pattern is to build keys from concatenated, delimited parts: `PURPOSE::SCOPE::IDENTIFIER::CONTEXT`.

-   **Bad Key:** `'12345'` (What is it? A product? A category? For which site?)

-   **Good Key:** `'product_tile_data::RefArch_US::12345_blue::en_US'`


This structure prevents a product cache from colliding with a content cache, ensures data for the US site doesn't leak into the EU site, and makes debugging from logs infinitely easier because the key itself tells you exactly what it's for. Always include `Site.current.ID` and the current locale for any site- or language-specific data.

### The Complexity of Excess

While it might seem clever to make your cache key highly specific and unique, this can backfire by reducing the chances of cache hits.

_**Striking the right balance is key.** (pun intended)_

I've also seen situations where the effort spent retrieving extensive data from the database to craft the key ends up cancelling out the performance benefits of custom caching.
After all, if generating the key takes longer than the cache saves, it's time to rethink the approach.

## The Serialization Conundrum: Caching API Objects vs. POJOs

**You must not cache raw SFCC API objects.** Never put a `dw.catalog.Product`, `dw.order.Order`, or `dw.catalog.ProductInventoryList` object directly into the cache.

While the [documentation](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-custom-caches.html) ambiguously states that "tree-like object structures" can be stored, this is a siren song leading to disaster. These API objects are heavyweight, carry live database connections, are not truly serializable, and can easily blow past the 128KB per-entry size limit, causing silent write failures that are only visible in the logs.

The only performant and safe approach is to map the data you need from the heavy API object into a lightweight **Plain Old JavaScript Object (**[POJO](https://en.wikipedia.org/wiki/Plain_old_Java_object)**)** or Data Transfer Object ([DTO](https://en.wikipedia.org/wiki/Data_transfer_object)) before caching it.

### Anti-Pattern: Caching the Full API Object

```

					// DO NOT DO THIS
var ProductMgr = require('dw/catalog/ProductMgr');
var productCache = CacheMgr.getCache('ProductData');
productCache.get('some-product-id', function () {
    var product = ProductMgr.getProduct('some-product-id');
    return product; // Caching the entire, heavy dw.catalog.Product object
});


```

### Correct Pattern: Caching a Lightweight POJO

```

					// THIS IS THE CORRECT WAY
var ProductMgr = require('dw/catalog/ProductMgr');
var productCache = CacheMgr.getCache('ProductData');
productCache.get('some-product-id', function () {
    var product = ProductMgr.getProduct('some-product-id');
    if (!product) {
        // We store null in the cache
        return null;
    }
    // Create a lightweight POJO with only the data you need
    var productPOJO = {
        id: product.ID,
        name: product.name,
        shortDescription: product.shortDescription? product.shortDescription.markup : '',
        price: product.priceModel.price.value
    };
    return productPOJO; // Cache the small, clean object
});


```

This approach creates smaller, faster, and safer cache entries. It decouples your cached data from the live object model and respects the platform's limitations.

The [release notes](https://help.salesforce.com/s/articleView?id=sf.rn_b2c_custom_cache_w10671394_je.htm&language=en_US&type=5) even mention that custom caches are intended to return _immutable objects_, reinforcing that you should be working with copies of data, not live API instances.

## In the Trenches: Real-World Battle Plans

With the theory and mechanics established, let's apply them to the most common scenarios where custom caches provide the biggest performance wins.

### Use Case 1: Taming External API Latency

This is the poster child for custom caches. Your site needs to display real-time shipping estimates, user-generated reviews, or social media feeds from a third-party service. Making a live HTTP call on every page load is a recipe for a slow, unreliable site. By wrapping the service call in the "get-or-load" pattern, you can cache the response for a few minutes, drastically reducing latency and insulating your site from temporary blips in the third-party service's availability.

_Remember, there's_ [another option](/third-party-api-caching-in-commerce-cloud/) _I mentioned in a previous article: using the ServiceRegistry for caching._

### Use Case 2: Caching Expensive Computations

Some business logic is just plain expensive. The classic example is determining if a main product should display an "On Sale" banner by iterating through all of its variation products to check their promotion status. On a product grid page with 24 products, each with 10 variants, this could mean hundreds of object inspections just to render the page. This is a perfect candidate for a custom cache.

Calculate the result once, store the simple boolean result in a cache with a key like`'main_promo_status::' + mainPid`, and set a reasonable TTL (e.g., 15 minutes) to align with promotion update frequencies.

Key! Depending on your configuration, consider including the site ID or locale in your key!

### Use Case 3: "Configuration as Code"

Instead of fetching site-level configurations or feature switches directly from the database through Site Preferences or Custom Objects, you can load these configurations into a custom cache helper function that loads this data into a long-lived custom cache on the first request; subsequent requests will retrieve the configuration directly from memory.

This approach significantly reduces the load on the database while providing lightning-fast access to configuration data.

## The Minefield: Warnings, Anti-Patterns, and How to Survive

Now for the most crucial section of this guide. Understanding these pitfalls is what separates a developer who uses caches effectively from one who creates production incidents.

### The Great Myth: Cross-Server Invalidation

Let this be stated as clearly as possible: **There is no reliable, built-in mechanism to invalidate a single custom cache key across all application servers in a production environment.**

The `cache.invalidate(key)` method is a _trap_. It is functionally useless for ensuring data consistency on a multi-server POD. It only clears the key on the _single application server that happens to execute the code_. The other 2, 5, or 10 servers in the instance will continue to happily serve the stale data until their TTL expires or a global event occurs.

The only ways to reliably clear a custom cache across an entire instance are these "sledgehammer" approaches :



-   **Data Replication:** A full or partial data replication will clear all custom caches.

-   **Code Activation:** Activating a new code version clears all custom caches.

-   **Manual Invalidation:** A Business Manager user navigating to **Administration > Operations > Custom Caches** and clicking the "Clear" button for a specific cache (for each app server).


This limitation has profound architectural implications. It means you **must design your caching strategy around time-based expiration (`expireAfterSeconds`)**. You have to accept and plan for a window of potential data staleness. Do not attempt to build a complex, event-driven invalidation system (e.g., trying to have a job invalidate a key). It is doomed to fail in a multi-server environment.

### Caching User-Specific Data

A cardinal sin. Never put Personally Identifiable Information (PII) or any user-specific data in a global custom cache. It is a massive security vulnerability and functionally incorrect, as the data will be shared across all users on that server.

Use `session.privacy` for user-specific data.

### The Rogue's Gallery: Other Common Pitfalls

-   **Ignoring the 20MB Total Limit:** This is a hard limit for _all_ custom caches on a single application server. One misbehaving cache that stores massive objects can pollute the entire 20MB space, causing the eviction of other, well-behaved caches.

-   **Ignoring the 128KB Entry Limit:** Trying to `put` an object larger than 128KB will result in a "write failure" that is only visible in the Business Manager cache statistics and custom logs. It does not throw an exception, so your code will appear to work while the cache remains empty.

-   **Assuming Cache is Persistent:** It is transient, in-memory storage. It is not a database. A server restart, code deployment, or random eviction can wipe your data at any time. Your code must _always_ be able to function correctly on a cache miss.



## The Watchtower: Monitoring Your Cache's Health

You cannot manage what you do not measure. A "set it and forget it" approach to caching is irresponsible. You must actively monitor the health and performance of your caches.

### Reading the Tea Leaves: The Business Manager Custom Caches Page

Your primary dashboard is located at **Administration > Operations > Custom Caches**. This page lists all registered caches and provides statistics for the last 15 minutes on the current application server. The key metrics to watch are:

-   **Hits / Total:** This is your hit ratio. For a frequently accessed cache, this number should be very high (ideally 95%+). A low hit ratio means your cache is ineffective. This could be due to poorly designed keys, a TTL that is too short, or constant cache clearing.

-   **Write Failures:** This number must be **zero**. A non-zero value is a critical alert. It almost certainly means you are violating the 128KB per-entry size limit, likely by trying to cache a full API object instead of a POJO.

-   **Clear Button:** The manual override. Use it when you need to force a refresh of a specific cache's data across all application servers.


### A Debugging Workflow: From Dashboard to Code

When you identify a performance problem, follow this systematic process to diagnose cache-related issues :

1.  **Observe (Production):** Start in **Reports & Dashboards > Technical**. Sort by "Percentage of Processing Time" or "Average Response Time" to find your slowest controllers and remote includes. These are your top suspects. Note their cache hit ratios in the report. A low hit ratio on a slow controller is a huge red flag.

2.  **Hypothesize (Business Manager):** Go to the **Custom Caches** page. Does the slow controller use a custom cache? Is that cache showing a low hit rate or, worse, write failures? This helps correlate the storefront performance issue with a specific cache's health.

3.  **Reproduce & Pinpoint (Development):** Switch to a development instance. Use the **Pipeline Profiler** to get a high-level timing breakdown of the suspect controller. This tool confirms which parts of the request are slow, but it does not show cached requests. To dig deeper into the code itself, use the

4.  **Code Profiler**. Run the uncached controller and look for the specific script lines or API calls that consume the most execution time. This will tell you exactly what expensive operation needs to be wrapped in a cache call.


## Wielding the Cache with Confidence

Custom Caches are not inherently good or bad. They are powerful. And like any powerful tool, they demand respect, understanding, and discipline. The path to mastery is not through memorising API calls, but through internalising a set of non-negotiable principles.

1.  **Cache Data, Not HTML:** Use Custom Cache for application data, Page Cache for rendered output.

2.  **Choose the Right Scope:** Understand the difference between `request`, `session`, and `cache`. Misuse is costly.

3.  **The Key is the Strategy:** Be deliberate and systematic in how you name things. A good key is self-documenting and collision-proof.

4.  **Embrace "Get-or-Load":** The `cache.get(key, loader)` pattern is the only safe and atomic way to populate a cache. Use it. Always.

5.  **Cache POJOs, Not API Objects:** Map heavy API objects to lightweight POJOs before caching to save memory and avoid errors.

6.  **Accept the Invalidation Myth:** Granular, cross-server invalidation is not a feature. Design around TTL and embrace a small window of potential staleness.

7.  **Monitor Relentlessly:** Use the Business Manager dashboards and profilers to keep a constant watch on your cache's health.


By adhering to these rules, you transform the custom cache from a source of unpredictable bugs into a reliable, high-performance asset.
