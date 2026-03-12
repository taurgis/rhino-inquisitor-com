---
title: Digging into the B2C Commerce Cloud 24.3 release
description: >-
  As snowy days slowly turn into sunny ones, the 24.3 release of SFCC has
  arrived! Let us have a look at the March release of 2024.
date: '2024-03-04T09:04:46.000Z'
lastmod: '2024-03-04T09:07:27.000Z'
url: /digging-into-the-b2c-commerce-cloud-24-3-release/
draft: false
heroImage: /wp-content/uploads/2024/03/a-shopping-cart-overfilled-with-products.jpg
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - release notes
  - sfcc
  - technical
author: Thomas Theunen
---
As snowy days slowly turn into sunny ones, the 24.3 release of SFCC has arrived! Let us have a look at the [March release of 2024](https://help.salesforce.com/s/articleView?id=sf.rn_b2c_rn_24_3_release.htm&type=5).

Are you interested in last month’s release notes? [Click here](https://www.rhino-inquisitor.com/a-look-at-the-salesforce-b2c-commerce-cloud-24-2-release/)!

## Platform

## Add More Product Line Items per Basket

![A screenshot of the Business Manager basket preferences is displayed, featuring a new 200 default option for product line items.](/media/2024/basket-product-line-items-in-sfcc-d24a6fcde8.png)

> If your site was limited to 50 line items per basket, the maximum number is increased to 200. This new limit doesn’t affect users who have been granted a lower or higher limit.

Quite a big uplift in the amount of different product line items allowed in a single basket by default. This will be particularly handy in certain industries such as groceries, gifting, and even some small B2B cases.

### Prioritize Resource Bundle Lookup

> You can now change the order of the resource bundle lookup and give priority to the WebDAV resource bundle. The default lookup first checks the resource bundle IDs of the code cartridges assigned to your site and then checks WebDAV. If you have resource bundles with the same ID in the cartridge and WebDAV, the cartridge resource bundle is always selected over the resource bundle in the WebDAV location. You can now use a toggle to switch the order to check WebDAV first.

A new feature toggle is now available under "Feature Switches" in the "Global" section of the Administration panel.

This option will give a bit more flexibility in translation management and open new routes. Does anyone care to revisit ["Resource Manager"](https://github.com/SalesforceCommerceCloud/resource-manager)?

### Scheduled Backups Button Is Disabled

> The Scheduled Backups button is no longer available. Instead, use a custom~~er~~ job to schedule backups of your production and development environments.

The scheduled backup feature has been turned off on all PIG environments except for the staging environment. This feature was initially intended for the staging environment. So, most projects won't be affected by this change.

However, if you use this feature in other environments, you can use a system job step called [SiteExport](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/jobstepapi/html/api/jobstep.SiteExport.html) that you can schedule independently.

## Business Manager

### Display Alert Messages in Business Manager

![A screenshot of the Business Manager showing all different options on where to show certain notifications: Banner, Header, or Homepage](/media/2024/sfcc-alerts-business-manager-5ad8b6e1f2.png)

> Display alerts as a persistent banner on the top of every Business Manager page. Alerts can relate to Business Manager modules and are only visible to users with permissions to access the module. Salesforce might also use the enhanced alerting framework to display critical system messages to Business Manager users.

A new option that is more prominent and cannot be ignored. To enable, go to Administration | Operations | Notification Settings in Business Manager and select the Banner alert type.

## OCAPI & SCAPI

### Prepare for Changes to Sever-Side Web-Tier Caching

> If you provision your SCAPI zone with short code, SCAPI caching is enabled by default after March 12, 2024, and the feature switch SCAPI Server-Side Web-Tier Caching is has no effect. If you enroll in SCAPI before March 12, 2024, you can continue to enable SCAPI caching in Business Manager. To enable caching, in Business Manager, select Administration | Feature Switches, and turn on SCAPI Server-Side Web-Tier Caching.

Performance is always a hot topic for any industry, and having Web-Tier cache active will hopefully have a significant impact on the performance of all headless channels.

The new standard after March 12th Be sure to test all your channels with the feature switch enabled before March 12, when it becomes active!

## SCAPI - Shopper SEO

> -   Updated getUrlMapping's response to include the optional property resourceSubType, which indicates whether the resolved object is a Page Designer content asset or a Content Slot asset. For more information, see the UrlMapping type reference.
> -   Updated getUrlMapping to support URL redirects. For more information, see the URL Resolution guide.
> -   Updated getUrlMapping to support these hooks: dw.shop.seo.url\_mapping.beforeGET and dw.shop.seo.url\_mapping.modifyGETResponse.

Some updates to the [URL mapping endpoint](https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-seo?meta=getUrlMapping), which include support for [URL Redirection from the Business Manager](https://help.salesforce.com/s/articleView?id=cc.b2c_url_redirects.htm&type=5)!

## Shopper Baskets v2

> -   Provides support for temporary baskets. Temporary baskets can perform calculations to generate totals, line items, promotions, and item availability without affecting the shopper’s storefront cart. You can use these calculations for temporary basket checkout.
> -   New Shopper Basket v2 response fields:
>     1.  groupedTaxItems
>     2.  taxRoundedAtGroup
>     3.  temporaryBasket

> [!WARNING]
> **Deprecation:** The dw.ocapi.shop.basket.beforePOST hook is no longer supported in Shopper Baskets V2 and is replaced by the dw.ocapi.shop.basket.beforePOST\_v2 hook.

The new version for Shopper Baskets looks a bit different from v1, so adjust your customisations if you plan to upgrade.

## SCAPI Load Shedding

> -   If the system reaches a load threshold, an HTTP 503 response is returned for a subset of API families.
> -   Covers APIs not covered by rate limits that are considered non-critical, for example: endpoints related to search, products, and authentication. Load shedding is not used for checkout-related endpoints, such as Shopper Baskets and Shopper Orders, to ensure that shoppers can complete an in-progress checkout.
> -   Includes additional HTTP response headers that allow you to understand the current system load: sfdc\_load, which represents a load percentage with higher percentages indicating higher loads, and sfdc\_load\_status, which is a enum WARN|THROTTLE that helps you understand the relative health of the system.

We received a notification regarding removing rate limits for SCAPI endpoints some time ago.

Instead, a new system called Load Shedding has been introduced. This system allows us to monitor the performance of the APIs based on different response headers that have been added. If necessary, we can also introduce our safety features.

While this system gives us more control, it also introduces a new scenario to take into account.

## Custom Request Headers

> Developers can send custom request headers that are passed and made available in server-side custom implementations.

It is now possible to add custom headers to your requests to use in your customisations on the server-side.

**Pattern:** c\_{yourHeader}

## Account Manager

### Security Update for the Audit History Logs

> Starting with the 1.32.2 release, the full name and full email address for active audit history users are masked from administrators. Masking occurs when the active user isn’t part of the organization and they’re active in Audit History for a User, Organization, or API Client sessions. Masking is also used when organization users view their audit history on the start page. The mask improves security compliance.

A minor update for security compliance.

## Bugfixes

Quite the list of bug fixes this time!

-   [SLAS generates Access token successfully for disabled customer](https://issues.salesforce.com/issue/a028c00000yy3tiAAA/slas-generates-access-token-successfully-for-disabled-customer)
-   [SCAPI Merge basket functionality does not carry over the bonus line item to registered shopper basket](https://issues.salesforce.com/issue/a028c00000x9LCOAA2/scapi-merge-basket-functionality-does-not-carry-over-the-bonus-line-item-to-registered-shopper-basket)
-   [Warn messages logged for SCAPI shopper-products](https://issues.salesforce.com/issue/a028c00000yD1VUAA0/warn-messages-logged-for-scapi-shopper-products)
-   [Storefront on behalf of a customer is failing to access from chrome due to google enforcing to block 3rd party cookies](https://issues.salesforce.com/issue/a028c00000yEhQAAA0/storefront-on-behalf-of-a-customer-is-failing-to-access-from-chrome-due-to-google-enforcing-to-block-3rd-party-cookies)
-   [Localization: FirstDayOfWeek - DatePicker uses Language Locale instead of Country Locale](https://issues.salesforce.com/issue/a028c00000xB1ZuAAK/localization-firstdayofweek--datepicker-uses-language-locale-instead-of-country-locale)
-   [SCAPI Error Response is not Correctly JSON Encoded](https://issues.salesforce.com/issue/a028c00000xB0sgAAC/scapi-error-response-is-not-correctly-json-encoded)

## Updated Cartridges & Tools

### plugin\_passwordlesslogin (v1.2.1)

-   [https://github.com/SalesforceCommerceCloud/plugin\_passwordlesslogin](https://github.com/SalesforceCommerceCloud/plugin_passwordlesslogin)

> Passwordless login is a way to verify a user’s identity without using a password. It offers protection against the most prevalent cyberattacks, such as phishing and brute-force password cracking. Passwordless login systems use authentication methods that are more secure than regular passwords, including magic links, one-time codes, registered devices or tokens, and biometrics.

Update feature so that callbacks, redirects, and scopes are not overwritten.

### composable-hybrid-sitegenesis-poc (v2.1.1)

-   [https://github.com/SalesforceCommerceCloud/composable-hybrid-sitegenesis-poc](https://github.com/SalesforceCommerceCloud/composable-hybrid-sitegenesis-poc)

> This repository demonstrates a proof of concept (POC) for implementing SLAS and phased rollouts on SiteGenesis. The examples given use the latest version of SiteGenesis, using JavaScript controllers, but the same approach could be used on pipeline versions of SiteGenesis.

Although we are already at v2.1.1, this repository is new and its first release.

### b2c-tools (v0.20.0)

-   [https://github.com/SalesforceCommerceCloud/b2c-tools](https://github.com/SalesforceCommerceCloud/b2c-tools)

> b2c-tools is a CLI tool and library for data migrations, import/export, scripting and other tasks with SFCC B2C instances and administrative APIs (SCAPI, ODS, etc). It is intended to be complimentary to other tools such as sfcc-ci for development and CI/CD scenarios.

-   bdw.js rename and updates by [@jlbruno](https://github.com/jlbruno) in [#119](https://github.com/SalesforceCommerceCloud/b2c-tools/pull/119)
-   Updating readme instructions for local project install by [@jlbruno](https://github.com/jlbruno) in [#120](https://github.com/SalesforceCommerceCloud/b2c-tools/pull/120)
-   added intellij support for groups by [@sandragolden](https://github.com/sandragolden) in [#121](https://github.com/SalesforceCommerceCloud/b2c-tools/pull/121)
