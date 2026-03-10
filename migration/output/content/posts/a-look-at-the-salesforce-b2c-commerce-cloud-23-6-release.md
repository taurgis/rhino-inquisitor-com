---
title: A look at the Salesforce B2C Commerce Cloud 23.6 release
description: >-
  The weather (at least here) is giving us more sunshine, so let us shine a
  light on the next Salesforce B2C Commerce Cloud release! This time we look
  at...
lastmod: '2023-05-24T08:16:17.000Z'
url: /a-look-at-the-salesforce-b2c-commerce-cloud-23-6-release/
draft: false
heroImage: /media/2023/a-neon-shopping-cart-scaled-863c5d17ed.jpg
date: '2023-05-25T06:26:10.000Z'
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - sfcc
author: Thomas Theunen
---
The weather (at least here) is giving us more sunshine, so let us shine a light on the next Salesforce B2C Commerce Cloud release! This time we look at the [June 2023 (23.6) release](https://help.salesforce.com/s/articleView?id=sf.rn_b2c_rn_23_6_release.htm&type=5)!

Are you interested in last month’s release notes? [Click here](https://www.rhino-inquisitor.com/a-look-at-the-sfcc-23-5-release/)!

## Enhance Storefront Search Scale and Performance

> Enhance the scale and performance of storefront search for keyword search and product browsing with the new B2C Commerce search settings option. Improve page load times for large product catalogs when processing search results that exceed a configurable threshold. Shoppers get quicker results when performing a keyword search, refinement calculation, product grouping, sorting, and category browsing. For example, if your storefront doesn’t use search refinement counts in the refinement bar, a setting is available to improve refinement calculation and search and category page load times.
>
> **How**: To activate the new search settings, contact Salesforce Customer Support or work with your Technical Account Manager and Customer Success Group representatives. Salesforce recommends that you test the new functionality on a development or dedicated test instance before enabling them on a staging or production environment.

If you have been in the eco-system for a while, you may have noticed that the built-in search engine did not get much love (visibly) in the past few years. Looking at the past two months, that appears to have changed!

Your site's performance is a very important aspect, and seeing that more options to fine-tune search to our specific needs is excellent!

But what does Salesforce mean by "large product catalogs"? Well, that means more than 1 million products in your catalog. But there are still a few questions that I have that are open on this topic:

-   Does this impact OCAPI/SCAPI performance as well?
-   If you have less products, is it still a feature you would want to activate? Are there benefits?
-   What options are there?

I hope more information will pop up in the documentation soon, as this is a welcome improvement!

## Platform

### Validate Hostnames for Certificates

> B2C Commerce now validates the hostname in the HTTPS certificate for outgoing connections. Validating the hostname eliminates the chance that a connection is made to the wrong host. To identify failed verifications, search the logs with the keyword phrase: Host name verification failed. This validation can be disabled on specific requests using the new setHostNameVerification method on the HTTPClient script API.

**Time to re-evaluate all your third-party integrations**! An extra validation step has made its way to the HTTPClient. Luckily you have a "quick fix" available: [disabling it through code](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_net_HTTPClient.html#dw_net_HTTPClient_setHostNameVerification_Boolean_DetailAnchor).

## OCAPI & SCAPI

### Shopper Login (SLAS)

> -   Updated the getTrustedAgentAccessToken endpoint to make the agent\_id parameter optional.
> -   Updated the SLAS Admin UI with specific error messaging for issues with logging into Account Manager.
> -   Private clients now support grant\_type=authorization\_code in addition to grant\_type=authorization\_code\_pkce.
> -   Removals of customer records in B2C Commerce are now synchronized with SLAS. If a customer record is deleted in B2C Commerce, this change is recognized by SLAS.
> -   Infrastructure and scale improvements to handle higher transaction volume for the upcoming holiday season.
> -   NEW SLAS-Marketing Cloud SMS for Passwordless login is ready! See Passwordless Login with SMS to get started.
> -   Improved exception handling for invalid passwords. Returns 400 with clear messaging.
> -   The /userinfo endpoint now handles extended UT\_08 character set.
> -   The /userinfo endpoint now allows trusted system on behalf (TSOB) access tokens.
> -   Security library updates.
> -   Deprecated the CredQuality API.
> -   Improved Guest Shopper validation to allow B2C Commerce IDP origin for session bridge.
> -   Session Bridge: fixed 500 server error on incorrect hint. SLAS Admin UI: Fixed issues related to Tenant ID format check at browser level.

No month goes by without new additions to the SLAS service. As the Composable Storefront (and hybrid deployments) get more traction, this service needs to get some "love" and provide the flexibility brands need.

A significant change here is that there is now an automatic synchronisation of deleted customers to SLAS, which required [manual API calls](https://developer.salesforce.com/docs/commerce/commerce-api/references/slas-admin?meta=deleteShopper) before.

And another is the [Marketing Cloud integration for passwordless login via SMS](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas-passwordless-sms.html)! If you are a multi-cloud customer, this is one to look at (if you have use cases where this makes sense, such as in-store kiosks where someone doesn't just want to enter their password in public)!

### Set Up Custom Firewall Rules with the CDN-API

> To enable better rule enforcement, the B2C Commerce CDN-API now supports custom firewall rules. The API also provides custom firewall controls to target traffic from a specific path or user agent. Custom firewall rules is a superset of existing firewall rules, it will replace the existing firewall rules for IP, ASN, Geo, the existing firewall rules will be deprecated by February 1, 2024. All firewall rules will be deprecated by February 1, 2024.

Have you been desperate for more control of the eCDN firewall? It seems Salesforce has some good news for you!

With this new feature, you can block or challenge traffic [based on dynamic rules you control](https://developer.salesforce.com/docs/commerce/commerce-api/guide/cdn-zones-custom-rules.html)!

Cloudflare Documentation Be sure to check out the [official Cloudflare documentation](https://developers.cloudflare.com/ruleset-engine/rules-language/fields/)!

### Set Up CDN Logpush

> You can use the CDN-API to store firewall events and CDN logpush for HTTP requests in your S3 bucket for immediate log visibility. The API supports visibility of HTTP requests and firewall events in the CDN logs. The logs are also available for eCDN implementations.

Getting access to all of the eCDN logs has been a "drag". Doing it manually via the Business Manager or API was quite the time-sink to set up.

With [this new system](https://developer.salesforce.com/docs/commerce/commerce-api/guide/cdn-zones-logpush.html), it is possible to push batches of up to 100.000 records to an Amazon S3.

## New Ideas

Some great new ideas popped up on the ideaexchange, [be sure to give it a gander and vote](https://ideas.salesforce.com/s/search#t=All&sort=%40sfcreateddate%20descending&f:@sfcategoryfull=[Commerce%7CB2C%20Commerce])!

## PWA Kit v2.7.1

A ["smaller" release](https://github.com/SalesforceCommerceCloud/pwa-kit/releases/tag/v2.7.1) made its way to the Composable Storefront the past month with some nice new updates:

Several changes and improvements have been made in the latest release notes. Here's a summary of the most significant updates:

1.  **Phased launch with optional session bridge call**: An optional session bridge call has been added to the login process, allowing for a smoother phased launch of new features.
2.  **Product-list refinements**: Enhancements have been made to product-list handling, including support for multiple types, improved isChecked functionality, and better management of query parameters.
3.  **Fixes for multi-value query parameters and basket issues**: This release addresses issues with multi-value query parameters being lost and makes the mergeBasket conditional more robust, resolving basket problems when a new account is created.
4.  **Security package updates and bug fixes**: Several security package updates have been implemented, along with various bug fixes to improve overall system stability.
5.  **Mobile-friendly phone number input**: The phone number field type has been changed to bring up a numeric keyboard on mobile devices, making it more user-friendly.
6.  **Address listing improvements**: Preferred addresses are now listed first, streamlining the user experience when selecting shipping or billing addresses.
7.  **Modal handling and cart functionality**: The update prevents modals from opening when adding an item to the cart fails, ensuring a smoother shopping experience.
8.  **Performance improvements and fixes**: Various performance enhancements have been made, including webpack build improvements, fixing Page Designer ImageWithText Link component issues, and addressing a local dev memory leak issue in the retail react app.
9.  **File handling and static file serving**: Fixes have been implemented for file collisions between client-side and server-side JavaScript files and improvements to static file serving.

## Updated Cartridges & Tools

### Sandbox Launchd (v1.0.0)

-   [https://github.com/sfccdevops/sandbox-launchd](https://github.com/sfccdevops/sandbox-launchd)

> Automatically Start & Stop your Sandbox when your macOS device Boots, Shuts Down, Wakes & Sleeps.

Another new project by Peter Schmalfeldt to make us even more lazy by booting and shutting down our sandboxes automatically!

### b2c-tools (v0.17.0)

-   [https://github.com/SalesforceCommerceCloud/b2c-tools](https://github.com/SalesforceCommerceCloud/b2c-tools)

> b2c-tools is a CLI tool and library for data migrations, import/export, scripting and other tasks with SFCC B2C instances and administrative APIs (SCAPI, ODS, etc). It is intended to be complimentary to other tools such as sfcc-ci for development and CI/CD scenarios.

-   support local/offline page designer page export in cli
-   migration script standard input support / logging levels



### plugin\_slas (v7.0.0)

-   [https://github.com/SalesforceCommerceCloud/plugin\_slas](https://github.com/SalesforceCommerceCloud/plugin_slas)

> This cartridge extends authentication for guest users and registered shoppers using the Shopper Login and API Access Service (SLAS).

A significant update has happened to SLAS, with too many changes to note down! If you use this plugin or plan to implement it, [look at this release](https://github.com/SalesforceCommerceCloud/plugin_slas/releases/tag/7.0.0)!

### SFRA Webpack builder (v3.4.1)

-   [https://github.com/SalesforceCommerceCloud/sfra-webpack-builder](https://github.com/SalesforceCommerceCloud/sfra-webpack-builder)

> Webpack can be cumbersome to setup, especially in multicartridge projects for SFRA. This plugin let you bundle all your js, scss and jsx files out of the box.

A bugfix release, so nothing to note here.
