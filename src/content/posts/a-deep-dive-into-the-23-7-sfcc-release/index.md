---
title: A deep-dive into the 23.7 Commerce Cloud release
description: >-
  Review the key changes in Salesforce B2C Commerce Cloud 23.7, from platform
  updates to headless improvements worth testing this month.
date: '2023-06-28T07:47:03.000Z'
lastmod: '2026-07-04T14:20:18.000Z'
url: /a-deep-dive-into-the-23-7-sfcc-release/
draft: false
heroImage: person-looking-at-clothing-scaled-e57317ea0f.jpg
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - sfcc
author: Thomas Theunen
takeaways:
  - "Highlights the most relevant 23.7 platform, API, and PWA Kit updates"
  - "Calls out Managed Runtime environment variables and promotion refinements"
  - "Flags new tooling and version upgrades worth testing after the release"
---
It's summertime, which means we get to check out the fresh release of the Salesforce B2C Commerce Cloud. Join me as we delve into all the new features of the [July 2023 (23.7)](https://help.salesforce.com/s/articleView?language=en_US&id=sf.rn_b2c_rn_23_7_release.htm&type=5) release. Are you interested in last month's release notes? Read the [23.6 release overview](/a-look-at-the-salesforce-b2c-commerce-cloud-23-6-release/).

## Environment Variables are now live on Managed Runtime

> Environment variables allow you to add variables into the application process running in an environment, without having to make code changes. Environment variables are stored securely, making them ideal for use cases such as:
>
> - API keys for third-party integrations
> - Feature flags for application logic
> - Configuration that differs between environments

Great news for users of Composable Storefront! You can now use the much-awaited feature of securely managing "secrets" and variables per environment! Currently, the API is the sole choice that is minimally (for now) documented [in the Managed Runtime environment variables guide](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/managed-runtime-administration.html#environment-variables).

## Improve Product Discoverability with the Google Inventory Listings Cartridge

{{< img-caption src="local-inventory-7952c2d4a2.jpeg" alt="Google Local Inventory listing showing nearby shoe availability." caption="Google Inventory Listings surfaces nearby store stock directly in search results." >}}

> The Google Inventory cartridge is a B2C Commerce direct integration cartridge. You can use the cartridge to list your local store products on Google’s free product listings. Shoppers can discover products in stores near them. This increases local store foot traffic

In today's world, it's essential to connect with customers at multiple touchpoints. Among these touchpoints, Google stands out as one of the most significant. By showcasing your products in proximity to Google searches, you can attract both new and loyal customers to your physical stores or online shop. It's a proven strategy that can help your business stand out from the competition. You can download the cartridge to add to your codebase [from the Social Channel Integrations repository](https://github.com/SalesforceCommerceCloud/social_channel_integrations) to get started.

## Business Manager

### Receive Rejected Order Alerts in Business Manager

> B2C Commerce Business Manager now displays an alert notification when orders are rejected by Salesforce Order Management. Users with access to the Business Manager orders module receive the alert and can review and act on rejected orders. The alert is also available in Slack when you connect your Business Manager instance to Slack.

A much-needed update in the platform to be warned that one of the orders was not synchronised with Salesforce Order Management! Now we do not have to manually go to the page to see if an order was sent. But let us hope we don't get any warning at all!

### Configure Up to 10 Categorisation Conditions

{{< img-caption src="categorization-rules-in-23-7-affa83b506.jpg" alt="Categorisation rule editor with support for up to ten conditions." caption="The rule editor now matches the API limit of ten conditions instead of five." >}}

> When configuring a categorisation rule in Business Manager, you can now set up to ten categorisation conditions per categorisation rule set. Previously, Business Manager supported five conditions per rule set while the API supported ten conditions per rule set.

This latest update gives us greater control and precision over the products [automatically assigned](https://help.salesforce.com/s/articleView?id=cc.b2c_dynamic_categories.htm&type=5) to a specific category.

## OCAPI & SCAPI

### Configure Promotion Search Refinement with OCAPI and SCAPI

> You can now refine promotion searches in B2C Commerce OCAPI and SCAPI. Use the promotion search refinement APIs to generate and display results that help shoppers discover products that are on sale or part of a promotion.

The description may be brief, but there's good news - a support-only feature switch previously available for SG/SFRA has been enabled for headless implementations, enabling filtering based on promotions. Here are the steps to get started with this:

1. [Enable and configure it](https://help.salesforce.com/s/articleView?id=cc.b2c_configuring_catalog_level_search_refinement_definitions.htm&language=en_us&release=2.0.1&type=5)
1. [SiteGenesis/SFRA Code Changes](https://help.salesforce.com/s/articleView?id=cc.b2c_promotion_refinement_code_changes.htm&type=5)
1. [New "pmid" refinement for SCAPI](https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-search?meta=productSearch)

## Development

### Get Coupon-Based Promotions with New Script API

> The `PromotionMgr.getActiveCustomerPromotions(boolean ignoreCouponCondition)` script API returns all active promotions including coupon-based promotions when ignoreCouponCondition set to true. You can use the returned promotions to expose promotions on your storefront. For example, display a callout message for coupon-based promotions on product detail or product list pages.

Although it may seem minor, this update is actually quite significant as it grants us greater flexibility in terms of how we present promotions and campaigns to customers!

### Script API Sort Methods Are Stable

> As required by ECMAScript 2019, the B2C Commerce Script API methods Array.sort() and Array.sort(function) are now documented as stable, so equal elements aren’t reordered as a result of the sort.

Not much to say about this, but being closer to the Official JS rules is never a bad thing!

## New Ideas

Just a gentle reminder to [vote](https://ideas.salesforce.com/s/search#t=All&sort=%40sfcreateddate%20descending&f:@sfcategoryfull=[Commerce%7CB2C%20Commerce]) for your favourite new ideas to be added to the Commerce Cloud roadmap!

## PWA Kit v2.7.3

> - Add support for ES module import statements in ssr.js #1284
> - Support Node 18 and NPM 9. #1265

This is a minor release to ensure this version is compatible with the latest Node version (18), as the older versions will be deprecated soon!

{{< img-caption src="node-js-16-deprecation-b8d6f02bec.png" alt="Node.js 16 end-of-life notice moving the deadline to September 11, 2023." caption="PWA Kit added Node 18 support so teams could move off Node 16 before end-of-life." link="node-js-16-deprecation-b8d6f02bec.png" >}}

## PWA Kit v3.0.0

> We’ve added lots of new features to PWA Kit v3, including:
>
> - 🔨 Template extensibility: Greatly reduce your project's code footprint and reduce development toil, cost of ownership, and future upgrade headaches. For more details, see the Template Extensibility guide!
> - 🪝 @salesforce/commerce-sdk-react "hooks" integration: Decouples API calls from a project's implementation, allows API calls to be upgraded as an npm library dependency, and brings along many of the great features (including state management, and others) via TanStack Query. See the Commerce SDK React docs to get started!
> - ⚛️ Major vendor library updates, including support for React 18, Node 16 / 18, Chakra 2, and more.

This is a long-awaited [update](https://github.com/SalesforceCommerceCloud/pwa-kit/releases/tag/v3.0.0), bringing many new treats to development. With the new template extensibility options, we can now start overriding just like in SFRA... or at least something that looks like it. Next to that, many updates to libraries and support for the latest stable Node version. One of the libraries is a favourite of mine: [TanStack Query](https://tanstack.com/query/v3/) (or React Query), which makes state management a breeze with APIs.

## Bugfixes

Currently, many known issues exist in the state "[Solution in Progress](https://help.salesforce.com/s/issues)", so let us patiently wait until they are deployed!

## Updated Cartridges & Tools

Compiling a list of updates has become more challenging since cartridges are no longer sourced from a single location...

### b2c-tools (v0.18.0)

- [https://github.com/SalesforceCommerceCloud/b2c-tools](https://github.com/SalesforceCommerceCloud/b2c-tools)

> b2c-tools is a CLI tool and library for data migrations, import/export, scripting and other tasks with SFCC B2C instances and administrative APIs (SCAPI, ODS, etc). It is intended to be complimentary to other tools such as sfcc-ci for development and CI/CD scenarios.

- All requests now use a (Version identified) b2c-tools user-agent
- JSDoc refactoring and resulting bug cleanup by [@clavery](https://github.com/clavery) in #112
- `checkJs` is on now
- set code version to active code version if not found in env vars by [@sandragolden](https://github.com/sandragolden) in #113
