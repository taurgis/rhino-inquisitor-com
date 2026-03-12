---
title: Everything new in Salesforce B2C Commerce Cloud 23.4
description: >-
  Catch up on the Salesforce B2C Commerce Cloud 23.4 release and the platform
  changes that matter most for developers this month.
date: '2023-03-15T19:32:56.000Z'
lastmod: '2023-03-15T19:51:03.000Z'
url: /everything-new-in-sfcc-23-4/
draft: false
heroImage: >-
  /wp-content/uploads/2023/03/Vintage_Style_Photography_A_3D_bar_chart_showing_the_progress_of_a_project_against_it.jpeg
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - sfcc
  - technical
author: Thomas Theunen
---
As the clock ticks on a new month has arrived, and with that the next [Salesforce B2C Commerce Cloud](https://www.rhino-inquisitor.com/the-salesforce-b2c-commerce-cloud-environment/) release! This time we look at the [April 2023 (23.4) release](https://help.salesforce.com/s/articleView?id=sf.rn_b2c_rn_23_4_release.htm&language=en_US&type=5)!

Are you interested in last month’s release notes? [Read the 23.3 release notes](https://www.rhino-inquisitor.com/salesforce-b2c-commerce-cloud-23-3-release/)!

## Platform

### Extend Payment Processing with Salesforce Payment APIs

> Use the new Salesforce Payment APIs to connect with third-party order management systems or platform-specific custom features. The APIs support capture, cancel, refund, and updates. For example, you can directly cancel or refund a payment in an order failure event by cleaning up payment authorizations. The APIs are available as Script APIs.

Salesforce Payments continues to gain love from Salesforce with every new release. The [previous release](https://www.rhino-inquisitor.com/salesforce-b2c-commerce-cloud-23-3-release/) included the addition of four temporary baskets, and this release introduced support for numerous new customer flows.

Here is a list of all of the new APIs made available:

- **SalesforcePaymentIntent**
  - getClientSecret()
  - isCancelable()
  - isRefundable()

- **SalesforcePaymentsMgr**
  - cancelPaymentIntent(SalesforcePaymentIntent, Object)
  - capturePaymentIntent(SalesforcePaymentIntent, Money)
  - createPaymentIntent(Basket, Shipment, String, Money, Boolean, Object)
  - refundPaymentIntent(SalesforcePaymentIntent, Money, Object)
  - updatePaymentIntent(SalesforcePaymentIntent, Shipment, Money, String, Object)

### Grouped Taxation Applied to Import and Export Orders

![SFCC 23.4 Release: Taxation Groups](/media/2023/sfcc-taxation-groups-5ebd5c5015.png)

> B2C Commerce now recognizes imported and exported orders created with group taxation and uses the group taxation method to calculate tax for those orders.

Import and export support has been incorporated, building on another feature [released in February](https://www.rhino-inquisitor.com/salesforce-b2c-commerce-cloud-23-2/) to offer greater control over taxation in Japan.

## Business Manager

### Track Page Designer Rendering Performance

> When editing in Page Designer, the page, region, and component rendering performance is now logged in your browser’s developer console. You can use the log to identify bottlenecks and optimise the rendering speed.

Page Designer's performance has been criticised for some time, particularly when utilising multiple component types on a single page. Salesforce has been [working diligently](https://www.rhino-inquisitor.com/salesforce-b2c-commerce-cloud-23-2/) to enhance the user experience in Business Manager, and with this release, developers are also receiving some attention. Performance metrics will now be logged in the developer console, offering insight into areas where improvements can be made on things developers can control.

## OCAPI & SCAPI

### Configure Origin Rules with CDN Zone APIs

> Configure Phased headless rollouts of SFRA to PWA implementations with the new CDN Zone APIs. You can now migrate specific pages to a PWA origin without completely switching from SFRA to PWA. You can also create and update origin rules to direct traffic to a PWA origin.

Good news for live and in-development projects who have chosen to go the "hybrid deployment" route. Untill now we had to create support tickets to manage the rules of which pages (URLs) were rendered by what system.

From this release on, we can manage all of this with a new set of APIs:

- [getMrtRules](https://developer.salesforce.com/docs/commerce/commerce-api/references/cdn-api-process-apis?meta=getMrtRules"getMrtRules-HTML(NewWindow)")
- [createMrtRules](https://developer.salesforce.com/docs/commerce/commerce-api/references/cdn-api-process-apis?meta=createMrtRules"createMrtRules-HTML(NewWindow)")
- [updateMrtRule](https://developer.salesforce.com/docs/commerce/commerce-api/references/cdn-api-process-apis?meta=updateMrtRule"updateMrtRule-HTML(NewWindow)")
- [updateMrtHostname](https://developer.salesforce.com/docs/commerce/commerce-api/references/cdn-api-process-apis?meta=updateMrtHostname"updateMrtHostname-HTML(NewWindow)")
- [deleteMrtRuleset](https://developer.salesforce.com/docs/commerce/commerce-api/references/cdn-api-process-apis?meta=deleteMrtRuleset"deleteMrtRuleset-HTML(NewWindow)")
- [deleteMrtRule](https://developer.salesforce.com/docs/commerce/commerce-api/references/cdn-api-process-apis?meta=deleteMrtRule"deleteMrtRule-HTML(NewWindow)")

### SLAS Database Update (03/07/2023)

> We are upgrading our Postgres database to the latest version, due to a mandate from AWS. This maintenance will be performed during off hours for your region when there is little to no traffic. The upgrade is expected to take up to ~9 minutes, and you may experience slowness but not downtime during this period.

Whether you know this or not, SLAS runs as a separate service next to the SFCC Platform. This has many advantages, including a different maintenance window and fewer dependencies on the core platform.

In this case, the database has been updated from 14.1 to 14.6, as mandated by AWS.

## New Ideas

I had another look at the IdeaExchange and found some interesting new submissions:

- [Bulk or Auto Run/Refresh Dynamic Categorization Rules](https://ideas.salesforce.com/s/idea/a0B8W00000NXb63UAD)
- [User Search, Auditing, and Improved Filtering in SFCC Account Manager](https://ideas.salesforce.com/s/idea/a0B8W00000NY1OZUA1/user-search-auditing-and-improved-filtering-in-sfcc-account-manager)
- [OMS integration status](https://ideas.salesforce.com/s/idea/a0B8W00000NLdunUAD/oms-integration-status)

## PWA Kit v2.7.0

The [latest updates](https://github.com/SalesforceCommerceCloud/pwa-kit/releases/tag/v2.7.0) bring some previously announced changes to the PWA Kit, such as [Page Designer](https://github.com/SalesforceCommerceCloud/pwa-kit/blob/develop/packages/template-retail-react-app/app/page-designer/README.md#sample-usage) and support for Product Sets.

Here are some recordings by Salesforce made available explaining these new features:

<https://www.rhino-inquisitor.com/wp-content/uploads/2023/03/pwa-kit-page-designer.mp4https://www.rhino-inquisitor.com/wp-content/uploads/2023/03/product-sets-244-mid-release-demo.mp4>

But the most significant change that marks the start of the upgrade required in the future version 3.0 is the update from Node 14 to Node 16.

Managed Runtime In light of the Node community end-of-life, Node 14 will be deprecated on Managed Runtime by April 30, 2023. To ensure seamless continuity of service, users are encouraged to upgrade to Node 16 and v2.7.+ of the PWA Kit ahead of the deprecation date. Start planning the upgrade to get the latest features and ensure optimal performance.

## Bugfixes

Having searched the "Known Issues" section, I found it difficult to determine if any of the issues listed had been resolved due to the new layout and frequent updates to older topics.

## Updated Cartridges & Tools

### b2c-tools (v0.16.0)

- [https://github.com/SalesforceCommerceCloud/b2c-tools](https://github.com/SalesforceCommerceCloud/b2c-tools)

> b2c-tools is a CLI tool and library for data migrations, import/export, scripting and other tasks with SFCC B2C instances and administrative APIs (SCAPI, ODS, etc). It is intended to be complimentary to other tools such as sfcc-ci for development and CI/CD scenarios.

- support feature dependencies by [@clavery](https://github.com/clavery) in [#102](https://github.com/SalesforceCommerceCloud/b2c-tools/pull/102)
  - this is a BREAKING change from 0.15.4 in the feature script callbacks for those who use the second argument (you know who you are).

### Passwordless Login(v1.1.1)

- [https://github.com/SalesforceCommerceCloud/plugin\_passwordlesslogin](https://github.com/SalesforceCommerceCloud/plugin_passwordlesslogin)

> Passwordless login is a way to verify a user’s identity without using a password. It offers protection against the most prevalent cyberattacks, such as phishing and brute-force password cracking. Passwordless login systems use authentication methods that are more secure than regular passwords, including magic links, one-time codes, registered devices or tokens, and biometrics.

- [#9](https://github.com/SalesforceCommerceCloud/plugin_passwordlesslogin/issues/9) fix isStorefrontSession by [@sandragolden](https://github.com/sandragolden) in [#10](https://github.com/SalesforceCommerceCloud/plugin_passwordlesslogin/pull/10)
  - ref same issue in `plugin_slas`: [SalesforceCommerceCloud/plugin\_slas#91](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/91)
