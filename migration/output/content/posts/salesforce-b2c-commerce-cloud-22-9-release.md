---
title: Salesforce B2C Commerce Cloud 22.9 release
description: >-
  With Salesforce B2C Commerce Cloud, you get new candy to play with every
  month. What does this month's jar have in store for us?
date: '2022-08-17T18:45:35.000Z'
lastmod: '2022-08-18T08:09:00.000Z'
url: /salesforce-b2c-commerce-cloud-22-9-release/
draft: false
heroImage: /wp-content/uploads/2022/08/copy-paste-page-designer-full.jpg
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - sfcc
  - technical
author: Thomas Theunen
---
We have been getting some lovely new goodies in the past few releases, but this trend is not ending! This time we look at the [September 2022 (22.9) release](https://help.salesforce.com/s/articleView?id=sf.rn_b2c_rn_22_9_release.htm&type=5)!

Are you interested in last month’s release notes? [Click here](https://www.rhino-inquisitor.com/salesforce-b2c-commerce-cloud-22-8/)!

## Platform

### WebDAV upload limit relaxed

![](/media/2022/upload-limit-relaxed-stonks-meme-f8e9bd0b5b.jpg)

A big update that will make many happy! The limitation of 100MB has been relaxed to 500MB for uploading to the WebDAV.

This change will make it a lot easier to integrate with other systems that have to send over large amounts of data. Until now, you had to split it into multiple "chunks" of 100MB.

Some will still wish the limit was higher, but this is still a considerable improvement!

## Business Manager

### Copy & Paste components in Page Designer!

A big update to Page Designer as it will now be possible to copy and paste components (up to 10). Not only will this be possible in the same page, but to other pages - even across browser tabs!

Idea This [feature](https://ideas.salesforce.com/s/idea/a0B8W00000GdYHjUAN/page-designer-add-ability-to-copypaste-components) was initially submitted by [Ryan Rubis](https://www.linkedin.com/in/ryanrubis/). https://youtu.be/jYaOZQcWHLI

### Target components to a specific locale in Page Designer

You could only target components to specific customer groups or campaigns until now. Starting from this release, locales have been added to that list!

https://youtu.be/uK\_TioOU2rQ

### Performance increase to Page Designer

Pages loaded in Page Designer are responsive before all referenced images, external resources, or client-side scripts have completed loading, cutting down on wait time.

I suspect this improvement is only for the performance of the Business Manager as we are (mostly) in control of how the front behaves. But let's find out after this update hits the first sandboxes!

### AfterPay and Venmo added to Salesforce Payments

![](/media/2022/venmo-d5992ec262.jpg)

Let your shoppers pay in interest-free installments with AfterPay. Salesforce Payments offers AfterPay through your Stripe Merchant account. When AfterPay is active on your storefront, the product details page and checkout cart list it as a payment option (Default SFRA & Payments Cartridge).

Venmo has also been added as an express and multi-step payment service for U.S.-based merchants. This integration does require a PayPal integration with Salesforce Payments, and a payment zone configured that conforms with the Venmo criteria.

## OCAPI & SCAPI

### Shopper Context API Enhancements

To personalize Headless applications with Salesforce B2C Commerce Cloud, you will need the [Shopper Context API](https://developer.salesforce.com/docs/commerce/commerce-api/guide/shopper-context-api.html). In this release, a few new options have been made available:

-   Source code support (trigger promotions, payment, and shipping methods)
-   Support for Hybrid Deployments by adding support to the OCAPI for Shopper Context
-   Personalize prices and promotions based on store-specific promotion and pricing rules (imported with [assignments.xml](https://developer.salesforce.com/docs/commerce/commerce-api/guide/shopper-context-api-store-specific.html))

## Development

### Updated Retention Period of Unregistered baskets

> Unregistered baskets are now stored a maximum of 7 days, depending upon preference settings, which mitigates the risk of negative performance and error rates.

This one was already the case before this update, so not sure what has changed in this release. If you know, leave a comment!

## Bugfixes

In August, someone at Salesforce has been cleaning house at the "[Known Issues](https://trailblazer.salesforce.com/issues_index?page=3&tag=Commerce+Cloud+Platform)." Many were updated in the past few weeks with a "Fixed" status, but for past releases (22.4, 22.5, 22.7, and 22.8), I will only mention those here that were fixed in at least 22.8.

-   [AttrubuteValueEditor can shows wrong values for "Enum" types](https://trailblazer.salesforce.com/issues_view?id=a1p4V0000029kX2QAI&title=attrubutevalueeditor-can-shows-wrong-values-for-enum-types)
-   [Currency symbol of Tanzanian Shilling (TZS) prices is null](https://trailblazer.salesforce.com/issues_view?id=a1p4V0000029kd3QAA&title=currency-symbol-of-tanzanian-shilling-tzs-prices-is-null)

## Updated Cartridges & Tools

### b2c-tools (v0.9.2-v0.10.0)

-   [https://github.com/SalesforceCommerceCloud/b2c-tools](https://github.com/SalesforceCommerceCloud/b2c-tools)

> b2c-tools is a CLI tool and library for data migrations, import/export, scripting and other tasks with SFCC B2C instances. It is intended to be complimentary to other tools such as sfcc-ci for development and CI/CD scenarios.

-   Fixes an out of order issue with the previous release when bootstrapping new instances
-   Code coverage for features
-   change in bootstrapping order to ensure that errors during bootstrapping do not leave an inconsistent state
-   Fixes the path for private library export. by [@mihaivilcuosf](https://github.com/mihaivilcuosf) in [#77](https://github.com/SalesforceCommerceCloud/b2c-tools/pull/77)
-   Fixes an out of order issue with features
-   delete cartridges prior to unzip to replace all files by [@sandragolden](https://github.com/sandragolden) in [#78](https://github.com/SalesforceCommerceCloud/b2c-tools/pull/78)
-   adds runAsScript method to execution migration scripts directly by [@clavery](https://github.com/clavery) in [#80](https://github.com/SalesforceCommerceCloud/b2c-tools/pull/80)
    -   see `examples/run-current-file.js`

### link\_beecloud\_recaptcha (v2022.1.0)

-   [https://github.com/SalesforceCommerceCloud/link\_beecloud\_recaptcha](https://github.com/SalesforceCommerceCloud/link_beecloud_recaptcha)

> BeeCloud provides a LINK cartridge to integrate with Salesforce Commerce Cloud (SFCC). This cartridge provides integration with Google reCaptcha for checkout process.

A new addition to public community repositories, always great to see! This one adds a quickstart to add Google reCaptcha to your order process!
