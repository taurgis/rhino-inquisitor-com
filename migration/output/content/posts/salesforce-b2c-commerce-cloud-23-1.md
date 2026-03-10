---
title: Salesforce B2C Commerce Cloud 23.1
description: >-
  Summer has arrived, and so has the next Salesforce B2C Commerce Cloud release!
  This time we look at the $1! Are you interested in last month’s release n...
lastmod: '2023-03-01T18:52:05.000Z'
url: /salesforce-b2c-commerce-cloud-23-1/
draft: false
heroImage: /media/2022/a-shopping-cart-with-fireworks-d5005827cc.jpg
date: '2022-12-19T08:35:50.000Z'
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - sfcc
author: Thomas Theunen
---
Summer has arrived, and so has the next Salesforce B2C Commerce Cloud release! This time we look at the [January 2023 (23.1) release](https://help.salesforce.com/s/articleView?id=sf.rn_b2c_rn_22_7_release.htm&type=5)!

Are you interested in last month’s release notes? [Click here](https://www.rhino-inquisitor.com/salesforce-b2c-commerce-cloud-22-10/)!

## Migrate Deprecated Custom Jobs to Step-Based Jobs

> Use the new migration tool to convert your deprecated custom jobs to step-based jobs. Previously, migrating deprecated custom jobs required long development times. To activate the migration tool, contact your support engineer.

A tool is now available to migrate your deprecated custom jobs to the step-based system. Since this needs to be [activated by a support agen](https://documentation.b2c.commercecloud.salesforce.com/DOC3/index.jsp?topic=%2Fcom.demandware.dochelp%2Fcontent%2Fb2c_commerce%2Ftopics%2Fjobs%2Fb2c_migrate_legacy_jobs.html&cp=0_6_15_5_4)t, I am unable to test this tool out myself (and I have no projects that need it)

Feel free to poke me on Slack with screenshots and feedback on this new tool!

## Platform

### Use a Unified URL for Your On-Demand Sandboxes

> You can now access your on-demand sandboxes with a unified cluster-agnostic host name, so you no longer have to remember the cluster that your sandbox belongs to. The hostname matches the pattern \-.dx.commercecloud.salesforce.com, for example, zzzz-001.dx.commercecloud.salesforce.com. It also matches the domain name of the B2C centralized admin API server, admin.dx.commercecloud.salesforce.com.

A new set of URLs is introduced to make it easier to access sandboxes and not think about which cluster they are part of. For example:

```

					xxxx-006.sandbox.us03.dx.commercecloud.salesforce.com


```

becomes

```

					xxxx-006.dx.commercecloud.salesforce.com


```

There is already an automatic redirect in place to make this transition easier.

### Data Retention Has New Limits

> To comply with Salesforce Commerce Cloud data management and regulation standards, B2C Commerce is implementing a strict 180 days data retention for code and data replications. Replications after 180 days aren’t visible in the Business Manager replications module.

I don't have much to say about this because it is a cleanup update. Making sure the platform works according to regulations, these updates are good for staying compliant.

One hundred eighty days is more than enough to see what and when replication was done in the job history.

### Orders from Stored Information with Salesforce Payments

> Each time an order is placed, you can reuse the payment details, payer’s stored payment credentials, or off-session tokens from a previous payment.

To create an order from a previous order, use the _[SalesforcePaymentsMgr](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_extensions_payments_SalesforcePaymentsMgr.html).confirmPaymentIntent (order, paymentMethod, statementDescriptor)_ class and method from the B2C Commerce Script API. Data from the previous order is retrieved to create the order. No customer interaction is required.

## Business Manager

### Configure a Max-Age for HSTS

> Add additional security to your B2C Commerce instance with the max-age for HSTS setting. Setting a max-age determines how long the HSTS settings will stay enabled..

A new option for us to configure the max-age ourselves for the [HSTS](https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security) setting. We could already do this in the eCDN, but now we can also do this in instances without it.

![](/media/2022/hsts-812238f9bc.jpg)

HSTS in the eCDN

![](/media/2022/hsts-business-manager-sfcc-95dbd0264e.jpg)

HSTS in the Business Manager

Use with care When enabling HSTS to include subdomains, ensure that all subdomains support HSTS (also internal-only applications)!

## OCAPI & SCAPI

### Property Selector Key Error Identifier

> Beginning with OCAPI Version 23.1 a MalformedSelectorException is thrown if the selector key is incorrect. Previously, the property selection didn't work when the "select= key was incorrectly defined. For example, select%20=(price), resulted in the selector being skipped without any error message, and the normal response was returned.

This a minor update that will make sure that you don't waste hours looking in places nothing is wrong. Making a typo (in a URL) happens far too often, and a clear error message to point you in the right direction is vital.

### Basket Flash Validation Update

> The property selection mechanism now works with all Shop API resources that return a basket or create an order. Previously, validation returned an error in most instances.

With property selection, you can control what fields are returned by the endpoint. This saves resources and bandwidth.

You can find out more about [property selection](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/usage/PropertySelection.html) and [Basket Flash](https://documentation.b2c.commercecloud.salesforce.com/DOC3/topic/com.demandware.dochelp/OCAPI/current/usage/Flash.html) in the Info Center.

### Use Selectors with Expressions

> Selectors with expressions now work correctly when objects contain a property with markup text. Previously, when an object contained a property with markup text, selectors with expressions didn't work correctly.

Also an update to the [Property Selection system](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/usage/PropertySelection.html) to correctly handle markup in the values.

## New Ideas

Some great new ideas were submitted!

-   [Early Hints support for B2C Commerce (Embedded CDN)](https://ideas.salesforce.com/s/idea/a0B8W00000LynV9UAJ)
-   [Visibility to reg price and markdown value in GMV and reports and dashboards](https://ideas.salesforce.com/s/idea/a0B8W00000LxQWAUA3)
-   [Audit History Business Manger](https://ideas.salesforce.com/s/idea/a0B8W00000LwUJJUA3)
-   [Enable Crawler Hints for embedded CDN](https://ideas.salesforce.com/s/idea/a0B8W00000LhrcuUAB)
-   [Adding more decimal digit on the priceBook Table and on Promo price](https://ideas.salesforce.com/s/idea/a0B8W00000LhGYsUAN)
-   [The Price Information Act (2004:347)](https://ideas.salesforce.com/s/idea/a0B8W00000Lh9tbUAB)

## PWA Kit v2.4.0

Another month, another update hits the PWA Kit with quite [an extensive changelog](https://github.com/SalesforceCommerceCloud/pwa-kit/compare/v2.3.0...v2.4.0). The “spotlight” change is that the new commerce-sdk-react library includes ready-made React hooks for fetching data from B2C Commerce.

The full release notes are available [here](https://github.com/SalesforceCommerceCloud/pwa-kit/releases/tag/v2.4.0).

## Bugfixes

In the update downtime for the past two months, some time was spent fixing reported issues!

-   [Stop word doesn't work for 'brand names' when Auto-Correction Search Preference is enabled](https://trailblazer.salesforce.com/issues_view?id=a1p4V000001t2OvQAI&title=stop-word-doesn-t-work-for-brand-names-when-auto-correction-search-preference-is-enabled)
-   [Exporting and re-importing jobs is reseting the Failure Handling](https://trailblazer.salesforce.com/issues_view?id=a1p4V000000rUEEQA2&title=exporting-and-re-importing-jobs-is-reseting-the-failure-handling)
-   [Unable to import Page Designer Page for a certain locale using “ImportPageLocalization” job step](https://trailblazer.salesforce.com/issues_view?id=a1p4V000002veUvQAI&title=page-localization-should-retrieve-localeinfomation-by-id-and-avoid-indirection-via-java-locale)
-   [Bulk product lock gets cleaned up by orphan lock cleanup before expiration time](https://trailblazer.salesforce.com/issues_view?id=a1p4V000002as9uQAA&title=bulk-product-lock-gets-cleaned-up-by-orphan-lock-cleanup-before-expiration-time)

## Updated Cartridges & Tools

### b2c-tools (v0.14.1)

-   [https://github.com/SalesforceCommerceCloud/b2c-tools](https://github.com/SalesforceCommerceCloud/b2c-tools)

> b2c-tools is a CLI tool and library for data migrations, import/export, scripting and other tasks with SFCC B2C instances and administrative APIs (SCAPI, ODS, etc). It is intended to be complimentary to other tools such as sfcc-ci for development and CI/CD scenarios.

-   adding `code watch` subcommand to watch and upload cartridges by [@clavery](https://github.com/clavery) in [#93](https://github.com/SalesforceCommerceCloud/b2c-tools/pull/93)
-   adds finish feature lifecycle method by [@clavery](https://github.com/clavery) in [#91](https://github.com/SalesforceCommerceCloud/b2c-tools/pull/91)
-   adding oauth scopes support to environment for implicit and client\_credentials by [@clavery](https://github.com/clavery) in [#92](https://github.com/SalesforceCommerceCloud/b2c-tools/pull/92)
-   adds custom preference support to instance info by [@clavery](https://github.com/clavery) in [#95](https://github.com/SalesforceCommerceCloud/b2c-tools/pull/95)
-   adds `parseConfig` helper to get configuration in a headless/non-CLI environment (web, testing, other tools, etc)



### sfcc-ci (v2.10.0)

-   [https://github.com/SalesforceCommerceCloud/sfcc-ci](https://github.com/SalesforceCommerceCloud/sfcc-ci)

> The Salesforce Commerce Cloud CLI is a command line interface (CLI) for Salesforce Commerce Cloud. It can be used to facilitate deployment and continuous integration practices using Salesforce B2C Commerce.

-   Various SLAS related adjustments, documentation improvement, added callbackURIs ([#318](https://github.com/SalesforceCommerceCloud/sfcc-ci/pull/318))
-   Add support for limiting and expanding results of org:list ([#286](https://github.com/SalesforceCommerceCloud/sfcc-ci/pull/286))
-   Expose more org level properties through org:list ([#287](https://github.com/SalesforceCommerceCloud/sfcc-ci/pull/287))
-   Remove default roles assigned to newly created users ([#301](https://github.com/SalesforceCommerceCloud/sfcc-ci/pull/301))
-   Add support for Sandbox API gateway ([#322](https://github.com/SalesforceCommerceCloud/sfcc-ci/pull/322))
-   Fix/rewrite staging hostnames ([#324](https://github.com/SalesforceCommerceCloud/sfcc-ci/pull/324))
-   Add support for resetting user ([#330](https://github.com/SalesforceCommerceCloud/sfcc-ci/pull/330))
-   Enhancements for managing uses (last login date, filter users by org) ([#336](https://github.com/SalesforceCommerceCloud/sfcc-ci/pull/336))
-   Various dependency updates ([#281](https://github.com/SalesforceCommerceCloud/sfcc-ci/pull/281), [#284](https://github.com/SalesforceCommerceCloud/sfcc-ci/pull/284), [#293](https://github.com/SalesforceCommerceCloud/sfcc-ci/pull/293), [#298](https://github.com/SalesforceCommerceCloud/sfcc-ci/pull/298), [#311](https://github.com/SalesforceCommerceCloud/sfcc-ci/pull/311), [#325](https://github.com/SalesforceCommerceCloud/sfcc-ci/pull/325), [#326](https://github.com/SalesforceCommerceCloud/sfcc-ci/pull/326), [#328](https://github.com/SalesforceCommerceCloud/sfcc-ci/pull/328))
