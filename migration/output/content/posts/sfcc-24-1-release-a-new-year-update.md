---
title: 'Commerce Cloud 24.1 Release: A New Year Update'
description: >-
  A new year means release notes for the back end have started again! This time,
  we look at the! Are you interested in last year's release notes?!
date: '2024-01-08T09:10:13.000Z'
lastmod: '2024-01-10T08:49:57.000Z'
url: /sfcc-24-1-release-a-new-year-update/
draft: false
heroImage: /media/2024/shopping-carts-to-the-shredder-735353fe04.jpg
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - release notes
  - sfcc
author: Thomas Theunen
---
A new year means release notes for the back end have started again! This time, we look at the [January 2024 (24.1) release](https://help.salesforce.com/s/articleView?id=sf.rn_b2c_rn_24_1_release.htm&type=5)!

Are you interested in last year's release notes? [Read the 23.10 release notes](/salesforce-b2c-commerce-cloud-23-10-release-a-comprehensive-overview/)!

## Platform

### DKIM Support for Emails

![Email Settings screen in Business Manager with the new DKIM option.](/media/2024/dkim-in-commerce-cloud-0dbe52d4a2.png)

Are you tired of missing out on important emails because they end up in your SPAM folder? We have great news for you! Commerce Cloud now comes with [DKIM](https://en.wikipedia.org/wiki/DomainKeys_Identified_Mail) support, designed to significantly reduce the chances of your emails being marked as SPAM.

PIG Only This option does not seem to be available on sandboxes.

### Improved log handling for Einstein Search Dictionaries and Einstein Predictive Sort

> The error handling for Einstein Search Dictionaries and Einstein Predictive Sort log files no longer creates log errors when an updated dataset isn’t available.

**How:** If you use Einstein Search Dictionaries or Einstein Predictive Sort, verify the Region setting in your staging instance. In **Business Manager** | **Administration** | **Operations** | **Einstein Status Dashboard** | **site**, set the Region to one of the following:

-   Americas
-   APAC
-   EU

## OCAPI & SCAPI

### Enable Temporary Baskets for Immediate Order Requests in OCAPI

![A person's hand touches a mobile phone, depicting multiple carts on top of it, representing the new Headless options for "temporary baskets."](/media/2024/carts-on-a-mobile-phone-022785d77e.jpg)

> OCAPI 23.4 includes support for temporary baskets. Temporary baskets allow for immediate order requests in B2C Commerce. For example, a shopper uses a Buy Now option to purchase an item. The temporary basket, which has a limited lifetime of 15 minutes, is populated with all the data required to ready the basket for checkout without affecting the regular shopper basket.
>
> **How:** Pass a query parameter temporaryBasket into POST baskets to create a temporary basket. With OCAPI 23.4 the basket document attribute isTemporary indicates a basket is temporary.

The recent introduction of temporary basket access in Headless setups is a significant breakthrough! This new feature unlocks a world of possibilities for mobile applications and the PWA Kit.

Have you ever received a request to allow only one product type in a single basket without allowing any combinations? Such requests were puzzling before [this feature was added](https://help.salesforce.com/s/articleView?id=sf.rn_b2c_rn_enable_temporaty_basket.htm&type=5). Where do you store the current basket? What if the product goes out of stock in the meantime?

Some things that you need to remember about these temporary baskets:

-   Basket lifetime is limited compared to shopper baskets. A temporary lifetime of 15 minutes is used for basket retention.
-   Limit is separate from shopper and agent basket limits. The shopper can have up to 4 temporary baskets.
-   Available to all shoppers, including guests. (unlike agent baskets)

SCAPI It is unclear if this change translates to the SCAPI endpoint ([https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=createBasket](https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=createBasket)). Currently, the new query parameter is not mentioned in the documentation. However, it is expected that development on the SCAPI will resume in January, and hopefully, this feature will be on the roadmap.

## PWA Kit v3.3.0

-   [https://github.com/SalesforceCommerceCloud/pwa-kit/releases/tag/v3.3.0](https://github.com/SalesforceCommerceCloud/pwa-kit/releases/tag/v3.3.0)

Some love again for the PWA Kit, wit the release of v3.3. The main changes are:

-   Adding StorefrontPreview component ‘onContextChange’ property to prepare for future Storefront Preview release
-   Updating engine compatibility to include npm 10
-   Replacing max-age with s-maxage to only cache shared caches
-   Improving pwa-kit-dev start command to accept CLI arguments for babel-node
-   Adding source-map-loader plugin to webpack configuration
-   Creating a flag to allow toggling behavior that treats + character between words as space in search query
-   Implementing gift option for basket
-   Updating extract-default-messages script to support multiple locales
-   Adding support for localization in icon component
-   Making various accessibility improvements and bug fixes

## Bugfixes

-   [Issue with High Scale Price Books feature and OCAPI Search Endpoint](https://issues.salesforce.com/issue/a028c00000suSwsAAE/issue-with-high-scale-price-books-feature-and-ocapi-search-endpoint)

Only one fix was made in the current release. However, [many items](https://issues.salesforce.com/#sortCriteria=%40sflast_modified_date_external__c%20descending&f[sfcategoryfull]=Commerce%7CB2C%20Commerce) are marked as "Solution Scheduled" and "Solution Deploying", which will hopefully be covered in next month's release blog post!

## Updated Cartridges & Tools

### sgmf-scripts (3.x in the works)

-   [https://github.com/SalesforceCommerceCloud/sgmf-scripts/commits/master/](https://github.com/SalesforceCommerceCloud/sgmf-scripts/commits/master/)

> This repository contains a collection of scrips that are useful for creating Storefront Reference Architecture overlay cartridges. All of the scripts are executable through CLI.

I've noticed that someone is currently working on developing version 3.x of this library. This is an exciting update that many people have been eagerly waiting for. It will be interesting to see what changes and enhancements are made in this new version.
