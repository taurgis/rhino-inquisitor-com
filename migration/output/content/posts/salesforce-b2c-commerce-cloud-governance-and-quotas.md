---
title: Salesforce B2C Commerce Cloud Governance and Quotas
description: >-
  One of the things that developers (not all) love about a SaaS platform is that
  all of the server management and setup is taken out of their hands by the
date: '2023-08-21T06:58:00.000Z'
lastmod: '2024-01-08T18:17:38.000Z'
url: /salesforce-b2c-commerce-cloud-governance-and-quotas/
draft: false
heroImage: /media/2022/quota-limits-27eb2c93aa.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - quota
  - sfcc
  - technical
author: Thomas Theunen
---
One of the things that developers (not all) love about a SaaS platform is that all of the server management and setup is taken out of their hands by the vendor - in our case, this is Salesforce.

The downside to this setup is that we have less control over this setup - and the other way around, Salesforce can not control what custom code we throw at the platform... or can they?

By introducing a system called "Quotas", there is a way!

But what is this? Are they documented? Can we work around them? Let us have a look and answer these questions!

## Similar to the core platform

Those who have joined from the force.com platform can compare these so-called "Quotas" to the "[Salesforce Governor Limits](https://developer.salesforce.com/docs/atlas.en-us.salesforce_app_limits_cheatsheet.meta/salesforce_app_limits_cheatsheet/salesforce_app_limits_platform_apexgov.htm)."

You will run into this system with many SaaS solutions, but each one will have a different term or name for them.

## What are they?

You can view them as restrictions on data volume and API usage set by the platform. They come in many forms and are placed on [different levels within the Salesforce B2C Commerce Cloud's stack](/the-salesforce-b2c-commerce-cloud-environment/).

A basic example of a limit would be the maximum time a single request is allowed to take or how many elements you can put in an [Array](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/index.html?target=class_TopLevel_Array.html).

## Where are they documented?

Luckily a large percentage of these limits are documented and categorised per type:

-   [Object Quotas](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/quota/html/Object_Quotas.html) (Data Volume)
-   [API Quotas](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/quota/html/API_Quotas.html) (Code)

More platform governance is in place, but some are not documented. Over the years, I have encountered several of these undocumented quotas. But don't fret - I'm sharing them later in this article!

## What does "enforced" mean?

![Quota Status screen showing an enforced quota in Business Manager.](/media/2022/sfcc-enforced-quota-a495bb4270.jpg)

Quota Status in Business Manager

Enforced quotas will throw an unrecoverable exception if you hit them.

_Translation: **Someone sees an error page**!_

So if you hit an enforced quota on production, this needs to be resolved as soon as possible!

But even if the quota is not enforced, you must investigate the code causing you to hit this limit. People might be experiencing lousy performance because of it and possibly abandoning their purchase (worst case).

### There is another

Besides this screen, you will also find [logs](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-log-files-overview.html?q=log) on the WebDAV. And these can contain messages along these lines:

```
Quota api.queryObjects@JOB (internal, limit 0): limit exceeded 5 time(s)
```

Notice the word "**internal".** These are unenforced quotas that Salesforce uses for statistical purposes (maybe it will become a quota in the future). So you can ignore them!

## But why?

![Illustration reacting to the frustration of hitting a platform quota.](/media/2022/but-why-91f791a77c.jpg)

Those who have run into these "limits" have probably already asked themselves this question. Why is this quota here? Why wasn't it just one higher? Why do I have to work three days longer on this ticket because I ran into it?

Well, there are a few good reasons for these to exist.

### Keep the platform efficient and stable

The imposed "quotas" keep us, the user, from overloading the platform. These limitations concern:

-   Memory Usage (Don't fill up the memory with too much data that the system needs to clean later)
-   Resource Consumption (Keep the CPU free to make sure people can buy without delay)
-   Business Object limits (Only store within SFCC what needs to be stored)

If you dig deeper into these Quotas, you will find that they are pretty forgiving, and some will require a large enterprise customer to reach. And even then, there are solutions available!

### It keeps us from taking the easy way out

Talking from experience, sometimes, as a developer, you want to take the easy route to save time. But in many cases, some decisions will work for low volumes of data but fail once you hit production-level amounts of transactions.

These quota limits will inform you of this oversight (if you hit them).

A good example would be the external API limit, which used to be at 8 - and is now 16. Is it a good idea to do 16 or more external API calls in a single request?

If you need to do this many requests in the front end, consider revisiting the architecture.

### It compels us to consider performance and security

Even though this will not solve all performance issues, some imposed quotas prevent you from doing insecure operations or writing code that will negatively impact performance. Examples of these are:

-   **api.dw.catalog.ProductInventoryRecord.update():** No front-end request can manipulate the inventory records, meaning that someone with bad intentions will never have a route to abuse.

-   **api.jsArraySize:** We can only store 20.000 items in a single array. This will keep us from filling up the memory and wasting resources filling up this array and reading from it in large volumes.

-   **api.dw.catalog.PriceBookMgr.assignPriceBookToSite(PriceBook,String):** This API is used only for management purposes and has no business in the storefront. This will force developers to find an alternative ([and better)](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_catalog_PriceBookMgr.html?resultof=%22%70%72%69%63%65%62%6f%6f%6b%6d%67%72%22%20#dw_catalog_PriceBookMgr_setApplicablePriceBooks_PriceBook_DetailAnchor) way to build the appropriate behaviour.


Let me be clear: You can still easily write insecure and inadequate performant code without hitting any of the quotas. **_Always keep security and performance in mind when writing custom features!_**

## Monitoring

Salesforce will not monitor your quota limitations but has provided enough tools to take care of it yourself.

The Business Manager has a monitoring page, which will give you the total overview and allow you to subscribe to warnings.

"Administration > Operations > Quota Status"

[![Quota alert subscription settings in Business Manager.](/media/2022/sfcc-quota-alerts-7f9e795d58.jpg)](/media/2022/sfcc-quota-alerts-7f9e795d58.jpg)

Subscribe. It is highly recommended to subscribe with multiple people to these alerts. Remember to do this in various environments, not just Production!

## I hit a quota, and can't work around it

Don't panic! You can always ask for support to temporarily (or permanently) relax a quota. But you better be fully prepared to defend your case and give a good reason why you deserve to have this relaxation.

And if there is a long-term solution, plan it as soon as possible!

## Other documented and "Undocumented" quotas

### Response Size Limit

Although you can build some pretty large pages, there is a limit: of 10MB, to be exact. It is not easy to run into, but if you work with files like PDF - you probably already know this one...

If you look well in the documentation, you will find the information on [this page](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-dev-best-practices.html) under "Template Support"!

This page has some other platform limitations documented too:

-   Emails are limited to 3MB
-   Video files are limited to 20MB
-   The default Script Timeout is 30 seconds

But again, you need to look around to find this information as it is [scattered](/where-is-the-new-sfcc-documentation/) all over.

### Rate limit on Storefront Requests

Suppose you have a script that causes many requests. For example, each product tile does an asynchronous call - you will start receiving errors from the system that you send too many requests.

This is the error "**[429: Too Many Requests](https://support.cloudflare.com/hc/en-us/articles/115003014512-4xx-Client-Error#)."**

### Request Timeout

I already mentioned this one above, but the default timeout of a request is 30 seconds.

If you have written an infinite loop in the storefront, no worries! Salesforce will cut off the request after the script timeout.

### Shared Disk Space on ODS

ODS disk space is also a [documented](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-developer-sandboxes.html) quota. But an important one to keep in mind!

-   **M**: 10 GB
-   **L**: 20 GB
-   **XL**: 50 GB

In a lot of cases, this is enough. But you could get in trouble if you work with many images on your Sandboxes.

### Garbage Collection

![Duke mascot illustration used to introduce garbage collection.](/media/2022/duke-cleaning-up-garbage-7e114dc018.jpg)

An important thing to keep in mind is that Salesforce B2C Commerce Cloud runs on Java. And an essential part of Java is its [garbage collection](https://www.oracle.com/webfolder/technetwork/tutorials/obe/java/gc01/index.html) process.

I have seen Garbage Collection having to do so much work that it brought down the storefront to a crawl, with CPU usage being maxed out for hours on end.

To keep the "garbage" as empty as possible, there are a few things you can do a few things. (The best practices below are not just for garbage collection, they will also improve performance in general).

#### Do not access objects unnecessarily

Accessing or fetching objects and not doing anything will cause extra cleanup! Below is an example of things to keep in mind.

```
/**
 * An example of a function that does many things you should not do...
 */
function doUnnecessaryCalls() {
    var ProductMgr = require('dw/catalog/ProductMgr');
    // Do we really need all products?
    var allMyProducts = ProductMgr.queryAllSiteProducts();
    /**
     * We are going to be accessing all of the products in the catalog, which is a lot of data
     * that garbage collection is going to have to clean up!
     */
    while (allMyProducts.hasNext()) {
        // Do not fetch the object again, you already had it in the SeekableIterator
        var product = ProductMgr.getProduct(allMyProducts.next().ID);
        // It would have been better to use the Search Index (if the attribute is indexed)
        if (product.custom.myAttr === true) {
            // Do something
        }
    }
    allMyProducts.close();
}
```

#### Good Cache Hit Ratio

Improve cache hit ratio on lister and product detail pages (including content) to reduce server requests and cleanup.

#### Location of your requires

Do 'requires' inside the functions that use them, rather than declaring them globally - unless each function uses them.

When a file is parsed/accessed, it will execute all of the global requires, which will also execute their global requires. This will continue until we reach the end of the chain.

The shorter the chain, the better the performance and the less garbage collection.

```
/**
 * Logs forbidden access requests to Sentry. If a user is logged in, the customer number is logged.
 */
server.prepend('Forbidden', function (req, res, next) {
    if (req.currentCustomer.profile) {
        // Only do the require when necessary
        var Sentry = require('*/cartridge/scripts/Sentry');
        var message = 'Forbidden access for customer ' + req.currentCustomer.profile.customerNo;
        Sentry.captureException(new Error(message));
    }
    next();
});
```

### Maximum Images Per Folder

[Rsync](https://en.wikipedia.org/wiki/Rsync) is used behind the scenes for file replication from Staging to Development or Production, and that information can help you find best practices around image management.

One of them is limiting the number of files in a single folder. From a support ticket, I have received the limitation of around 100.000 files max in a folder.

...but it makes sense to stay well below this amount.

### Static / Dynamic Mappings

Static and dynamic mappings are managed in the business manager in a single multiline text field. The maximum data you can submit is around 2MB before it throws an exception of too much data being submitted.

This is [documented](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_static_mappings.htm) here, and the workaround is to use the Site Import functionality.

### Parallel OCAPI Requests

![Slack note documenting the per-session OCAPI parallel-request limit.](/media/2023/img-0054-72b5b079a0.jpeg)

Although there is no rate limit in place on the OCAPI, there is a limit on how many parallel requests one can make.
