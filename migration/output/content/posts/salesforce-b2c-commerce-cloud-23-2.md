---
title: Salesforce B2C Commerce Cloud 23.2
description: >-
  Review the Salesforce B2C Commerce Cloud 23.2 release, including Page Designer
  and SCAPI changes developers should notice.
date: '2023-01-18T19:00:06.000Z'
lastmod: '2023-01-20T15:36:31.000Z'
url: /salesforce-b2c-commerce-cloud-23-2/
draft: false
heroImage: /wp-content/uploads/2023/01/artist-painting-on-screen.jpg
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - Business Manager
  - pagedesigner
  - scapi
  - sfcc
  - technical
author: Thomas Theunen
---
February is almost here, and so is the [February 2023](https://help.salesforce.com/s/articleView?id=sf.rn_b2c_rn_23_2_release.htm&type=5) (23.2) release! If you are an avid user of Page Designer, this is the update you have been waiting for - and Salesforce, keep 'em comin'!

_Are you interested in last month’s release notes? [Click here](https://www.rhino-inquisitor.com/salesforce-b2c-commerce-cloud-23-1/)!_

## Page Designer Improvements

### Improved Page Designer Structure and Usability

![](/media/2023/page-designer-structure-oldv2-56ca8ab276.jpeg)

Old Page Designer Structure

![New Page Designer Structure](/media/external/page-designer-structure-new-q0uu07mbk2b779dng608ohzvqnewndt9ajezjc0u0w-f987195ba3.png "page-designer-structure-new")

New Page Designer Structure

> The Page Designer page structure in the canvas editor has been redesigned. The asset hierarchy outlines all the assets on your page. The visual connection between what is selected in the canvas and its location in the page structure is also improved.

The redesign of the Salesforce Page Designer will be a good improvement. The new asset hierarchy and visual connection between what is selected in the canvas and its location in the page structure will make it much easier to navigate and edit pages.

Overall, this will be a great step forward in enhancing the user experience.

### Move Components in Page Designer More Easily

![](/media/2023/page-designer-move-e9d6ec4100.gif)

Old Moving Component

![New Moving Component](/media/external/page-designer-move-new-q0uu0xxsvfb2aqadmf5zcgd32825ysuaruhlziuh34-537198b2f6.png "New Moving Component")

New Moving Component

> Dragging components in Page Designer is now more intuitive. Know exactly where you can place a component. And after you drop a component and refresh the page, the component remains in focus and highlighted until another selection is made in the canvas.
>
> **How**: Improvements to the drag functionality improve the Page Designer workflow.
>
>
> -   Minimal changes in page structure during the drag function. When You initiate the drag process, you don’t lose the orientation to your starting location and desired drop location.
>
>
> -   Clearly identifiable drop zones identify where you can drop a component. After you drop a component and refresh the page, the component remains in focus and highlighted.
>
>
> -   After you drop a component and refresh the page, the component remains in focus and highlighted.

This update will make Page Designer more user-friendly. The ability to place components with minimal changes to the page structure, clear drop zones, and the component remaining in focus after refreshing the page are all features that will enhance the user's experience with the designer.

UX seems to be "the" recurring theme in this release, which I believe is a welcome focus.

### Save and Return to the Same Canvas Location in Page Designer

> When you save a canvas action in Page Designer, you’re now returned to the same canvas location after the page reloads. Previously, you were returned to the top of the canvas.

This feature will likely be met with great relief, particularly for those who have experienced frustration while building large pages with many components.

## Platform

### Guest Basket Lifetime Limit Is Increased

> The lifetime limit for a guest customer basket is now the lesser of 30 days, and the registered customer basket lifetime. Previously, it was the lesser of 7 days and the registered customer basket lifetime. This limit applies to input validation in the BM Basket Preferences UI and Basket Preferences Import. It also affects resolving the guest basket lifetime if it isn’t set, for example, for the baskets cleanup job.

This update increases the lifetime limit from 7 days to 30 days, meaning that guest customers can now have access to their baskets for much longer. This is a huge advantage as it allows anonymous shoppers more time to review their items, make changes, and complete their purchases.

Overall, this update brings many benefits and will significantly enhance the user experience.

### Reports and Dashboards for PWA Kit

https://www.rhino-inquisitor.com/wp-content/uploads/2023/01/RD-overview.mov

Starting now, Commerce Cloud Reports and Dashboards work for the Composable Storefront!

Not all reports work yet Please be aware that a patch is coming in early February to ensure order data makes it to these reports. At the time of writing, 8 out of the 11 dashboards work.

## Business Manager

### Do More When Calculating VAT

> You can now calculate tax and use rounding based on tax groups, which is a legal requirement for Japanese taxation. The calculation method uses a new Tax Rounding Level site preference called Group. The tax groups are exposed via OCAPI and Script API to support customisation.
>
> How: To enable rounding per grouped tax rate, in Business Manager Site Preferences, set the Order Item Price Rounding Policy to GROUP.

As I am not familiar with Japanese tax law, so it is not something I can go into. But for anyone who has a project active in Japan, I am sure it is a needed improvement.

### Fine-Tune Your Site’s Regional Settings

> You now have full control in Business Manager over all parameters used for converting numbers and dates into strings. Use the new Format Symbols tab and regional parameters to add Locale details.
>
> **Where**: In Business Manager, select Administration | Locales | local ID
>
>
> -   The Format Symbols tab is added for Locale details.
> -   The Numeral System settings are removed on the Locale details General Tab.
> -   New Regional setting parameters are added to Export and Import of locales.

A nice improvement for locale management because it gives users complete control over all parameters used for converting numbers and dates into strings with configuration. This is beneficial because it provides more flexibility and precision in formatting numbers and dates according to regional and language-specific standards.

## OCAPI & SCAPI

### Access Page Designer with SCAPI

> You can now use the Shopper Experience SCAPI API to add content created in Page Designer to your B2C Commerce headless implementation. Use the SCAPI Shopper Experience API to look up page information for pages created in Page Designer. The Shopper Experience API responses include:
>
>
> -   The entire component hierarchy of the page at design time.
> -   All merchant data provided at design time.
> -   Server-side scripting data provided at run time.

The new "[Shopper Experience API](https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-experience?meta=Summary)" is a significant improvement for both Headless and Composable Storefront projects. In the past, solutions required complex workarounds to enable personalisation with [session bridging](https://www.rhino-inquisitor.com/what-is-the-ocapi-session-bridge/). But this update eliminates the need for those workarounds.

This change is highly anticipated, and I am sure it will be warmly welcomed by many. It brings more efficiency and ease of use to projects in need of the API.

### Other SCAPI Updates

-   Rate limit increase for `GET /customers/*(Shopper-Customers)`, see [Rate Limits](https://developer.salesforce.com/docs/commerce/commerce-api/guide/throttle-rates.html).
-   Security update for SCAPI platform environment.
-   Maintenance and stability updates for SCAPI platform environment.
-   Update TrustedAgentOnBehalf support for Shopper Token policy.
-   Prepare SCAPI platform for future feature enablement.


### SLAS Updates

#### Support Forgerock IDP

[ForgeRock Identity Platform](https://www.forgerock.com/) is an open-source identity management platform that provides authentication, authorisation, and identity management solutions for organisations. It is also a popular choice among financial institutions, healthcare providers, and government agencies to help them comply with industry regulations and standards.

This is also the system behind [Account Manager](https://account.demandware.com/).

#### Enhanced BOT mitigation strategy within SLAS.

The release log does not provide much more information on what specific actions have been taken to improve security. However, any improvement in security measures is generally welcome in order to better protect against malicious bots.

#### /jwks endpoint now returns 3 key IDs

Verify Impact Check if this change impacts any of your projects that use SLAS!

JWKS (JSON Web Key Set) provides a set of keys that includes the current, past, and future public keys. This set of keys allows clients to check the authenticity of a token, called JWT, SLAS issues that for the shopper.

#### Other SLAS updates

-   Trusted Agent On Behalf (TAOB) now supports Private ClientID flow, and TAOB JWT token expiry changed from 30 to 15 minutes for PCI compliance.
-   Reduced the Passwordless OTP - token length from 20 to 8 characters.
-   Fixed inconsistencies related to failed tokens.
-   Session Bridge: Improved error messaging & guest support.
-   SLAS no longer calls ecom, when a shopper account is locked.
-   User cache refinements & Fixed cache inconsistencies after tenant key rotation.
-   Addressed login ID inconsistencies for passwordless login.
-   Fixed AppleIDP issue related to middle name.
-   Security library updates.

## Development

### Set Up Payments for Immediate or Future Payment Capture

> You can use the SalesforcePaymentRequest script API to set immediate or future payment captures. Use this method to override the site-level payment settings and gain greater flexibility over how payments are captured.

New functions have been exposed on the SalesforcePaymentRequest:

```

					salesforcePaymentRequest.getCardCaptureAutomatic();
salesforcePaymentRequest.setCardCaptureAutomatic(Boolean);


```

### Do More When Calculating VAT

New functions are now exposed to work with the new rounding options per group (see the item about Japanese Taxation):

```

					lineItemCtnr.getTaxTotalsPerTaxRate();
lineItemCtnr.isTaxRoundedAtGroup();
basket.isTaxRoundedAtGroup();
order.isTaxRoundedAtGroup()



```

## PWA Kit v2.5.0

A new preview release of the commerce-sdk-react library is now available on [npm](https://www.npmjs.com/package/commerce-sdk-react-preview) and includes ready-made React hooks for fetching data from B2C Commerce.

The release also includes updates to pwa-kit-create-app, pwa-kit-dev, pwa-kit-react-sdk, pwa-kit-runtime, and template-retail-react-app. Some of the changes include adding instanceType to Einstein activity body, logging cid from res header instead of req in local development, and handling variants with Einstein.

[View the full changelog](https://github.com/SalesforceCommerceCloud/pwa-kit/releases/tag/v2.5.0).

## Bugfixes

The developers of the current release have been unable to catch a bug, much like trying to catch a fly with chopsticks, resulting in no bug fixes included in this version. But we trust they will keep trying to improve the product.

## Updated Cartridges & Tools

### Composable Storefront Toolkit

-   [https://github.com/SalesforceCommerceCloud/composable-storefront-pocs](https://github.com/SalesforceCommerceCloud/composable-storefront-pocs)

> This repo is a composable storefront implementation with various proof of concepts baked in. It otherwise closely tracks pwa-kit.

A new cartridge has appeared, containing some goodies for the Composable Storefront! As all of these are POCs (Proof of Concept), understand that they still need some polishing.

### b2c-tools (v0.15.0)

-   [https://github.com/SalesforceCommerceCloud/b2c-tools](https://github.com/SalesforceCommerceCloud/b2c-tools)

> b2c-tools is a CLI tool and library for data migrations, import/export, scripting and other tasks with SFCC B2C instances and administrative APIs (SCAPI, ODS, etc). It is intended to be complimentary to other tools such as sfcc-ci for development and CI/CD scenarios.

-   adds custom preference support to instance info by [@clavery](https://github.com/clavery) in [#95](https://github.com/SalesforceCommerceCloud/b2c-tools/pull/95)
-   intellij sfcc 2022.3 compatibility by [@clavery](https://github.com/clavery) in [#97](https://github.com/SalesforceCommerceCloud/b2c-tools/pull/97)

### Salesforce B2C Commerce / Customer 360 Platform Integration (v2.0.0)

-   [https://github.com/SalesforceCommerceCloud/b2c-crm-sync](https://github.com/SalesforceCommerceCloud/b2c-crm-sync)

> Salesforce B2C Commerce / CRM Sync is an enablement solution designed by Salesforce Architects to teach Salesforce's B2C Customer Data Strategy for multi-cloud use-cases. The solution demonstrates a contemporary approach to the integration between Salesforce B2C Commerce and the Cloud products running on the Salesforce Customer 360 Platform.

-   Upsert Map instead of List for Account update by [@filipecarvalho15](https://github.com/filipecarvalho15) in [#165](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/pull/165)
-   Bump async from 3.2.0 to 3.2.2 by [@dependabot](https://github.com/dependabot) in [#162](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/pull/162)
-   Bump npm from 7.20.3 to 8.11.0 by [@dependabot](https://github.com/dependabot) in [#172](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/pull/172)
-   Bump moment from 2.29.1 to 2.29.4 by [@dependabot](https://github.com/dependabot) in [#183](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/pull/183)
-   Bump snyk from 1.672.0 to 1.1024.0 by [@dependabot](https://github.com/dependabot) in [#200](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/pull/200)
-   Bump snyk-go-plugin and snyk by [@dependabot](https://github.com/dependabot) in [#201](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/pull/201)
-   Fix unit tests by [@jbachelet](https://github.com/jbachelet) in [#213](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/pull/213)
-   Fix issue with platform event failing due to "System.CalloutException" exception by [@jbachelet](https://github.com/jbachelet) in [#212](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/pull/212)
-   Bump qs from 6.5.2 to 6.5.3 by [@dependabot](https://github.com/dependabot) in [#211](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/pull/211)
