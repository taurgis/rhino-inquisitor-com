---
title: A look at the Salesforce B2C Commerce Cloud 24.2 release
description: >-
  Review the Salesforce B2C Commerce Cloud 24.2 release and the platform updates
  worth testing across storefront, API, and operational workflows.
date: '2024-02-05T06:59:49.000Z'
lastmod: '2024-02-06T09:05:09.000Z'
url: /a-look-at-the-salesforce-b2c-commerce-cloud-24-2-release/
draft: false
heroImage: /media/2024/a-question-mark-cloning-machine-12d5adc228.jpg
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - release notes
  - sfcc
  - technical
author: Thomas Theunen
---
It's time to gear up for the February 2024 ([24.2](https://help.salesforce.com/s/articleView?id=sf.rn_b2c_rn_24_2_release.htm&type=5)) release of Salesforce B2C Commerce Cloud! With the arrival of this latest release, let's look at what's new and exciting!

You can always check out [last month's release notes](/sfcc-24-1-release-a-new-year-update/) by clicking here if you missed it.

## Platform

### Partitioned Cookies

On By Default This new feature is automatically enabled with the 24.2 release and may cause unexpected behaviour if you have complex use cases involving cookies.

Please turn it off until you have completed all necessary testing. Affects Hybrid Deployments An extra warning for those using hybrid deployments: it is important to test adequately as this change may disrupt standard customer flows.

[![Feature switch showing Partitioned Cookies enabled by default.](/media/2024/partioned-cookies-in-sfcc-cb426ac0c4.png)](/media/2024/partioned-cookies-in-sfcc-cb426ac0c4.png)

Concerning browser vendors' ongoing deprecation of third-party cookies, a new feature in Salesforce B2C Commerce Cloud affects how cookies are handled: "[Partitioned Cookies](https://developer.mozilla.org/en-US/docs/Web/Privacy/Partitioned_cookies)"

Cookies that are sent by controller code, such as via `response.addHttpCookie` will now have the Partitioned flag set.

Most people won't notice a difference, but this change may have side effects if you have more complex custom cookie logic. However, a feature toggle called Partitioned Cookies defaults to true - you can turn off this new behaviour there, but be sure to read the description carefully, as it is necessary for Page Designer and Toolkit when third-party cookies are disabled in the browser.

### Allow Duplicate Terms in Search Phrases

> B2C Commerce search now accepts long-tail search phrases with duplicate search terms. When an exact match for a given phrase is found, the suggestion processor returns highly relevant search results.
> Previously, duplicate words in long-tail search phrases were autocorrected to slightly different versions. Autocorrecting terms in the search phrase can result in irrelevant search results.

Improvements in the built-in search engine are always welcomed. A reliable search function across all channels enhances user experience and increases conversion rates.

### Get a Higher Level of Time Stamp Accuracy with Inventory

> ProductInventoryRecord.AllocationResetDate now supports a higher level of accuracy in the database. The change is backward-compatible.

When dealing with various sales channels that impact inventory, multiple stock modifications may occur within the exact second.

Previously, we were unable to differentiate at the millisecond level, but that is no longer the case! With the database modification that allows for milliseconds in the timestamp instead of seconds, we can now more effectively handle this particular use case.

#### XML Import example

```text
// example import with seconds
2023-11-22T06:56:01Z
// example import with milliseconds
2023-11-22T06:56:01.567Z
```

#### OCAPI

```text
// Request body example with millis
{ 'allocation': { 'amount': 17, 'reset_date': '2023-11-23T08:39:23.456Z' } }
// Response always with millis
.... 'reset_date': '2023-11-23T08:39:23.456Z'
// Request body example with seconds
{ 'allocation': { 'amount': 17, 'reset_date': '2023-11-23T08:41:23Z' } }
// Response always with millis
.... 'reset_date': '2023-11-23T08:41:23.000Z'
```

## Business Manager

### Specify a Date Format for Locales

> You can now modify the date settings format in Business Manager so that the script API method dw.util.Calendar.getFirstDayOfWeek() returns the first day of the week in the date format used by your site locale. Previously, you couldn’t modify the date format to match the local or regional context.

![Locale date settings before the 24.2 update.](/media/2024/locale-date-settings-before-24-2-1107342948.png)

Before

![Locale date settings after the 24.2 update with start day of week.](/media/2024/locale-date-settings-after-24-2-ed26c6c56a.png)

After

## Development

### Custom SCAPI Endpoints

The promised helper functions have arrived with the new custom endpoints going GA, making creating scripts for your endpoints easier!

- [https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/upcoming/scriptapi/html/index.html?target=class\_dw\_system\_RESTResponseMgr.html](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/upcoming/scriptapi/html/index.html?target=class_dw_system_RESTResponseMgr.html)

## OCAPI & SCAPI

### Custom SCAPI Endpoints (OCAPI & SCAPI)

Although this [option](https://developer.salesforce.com/docs/commerce/commerce-api/guide/custom-apis.html) has existed since September last year, this feature is now officially out of BETA and can be safely used in production environments.

It is important to note that a few things have changed in this release that might break your current customisations, so verify that all endpoints still behave and work the way you intended.

The [documentation](https://developer.salesforce.com/docs/commerce/commerce-api/guide/custom-apis.html) has been updated to include these changes. It's time to read up!

### SLAS Updates

> - Improved error handling for TSOB(Trusted system on Behalf) for "customer not found" user scenarios.
> - Support added for using SAP Customer Data Cloud socialize REST endpoints.
> - IDP configuration now allows the IDP client credentials to be added to the POST body. SLAS now supports OIDC client\_secret\_ basic and client\_secret\_ post for client authentication.
> - Updated the /introspect endpoint to include a “sub” claim in the response.
> - Improved validation in Session Bridge(SESB) flow by checking for the customer\_id and failing the request if the customer is already registered.
> - Includes SLAS Admin UI and API bug fix to address the cache synchronization issue when a client is edited or deleted.

SLAS updates this month include some critical changes. One of the issues that has been bothering me for the past year was the visual cache of the SLAS admin UI, which caused a lot of confusion by displaying outdated information.

However, I'm happy to report that this issue has finally been fixed, dramatically improving UX.

## Account Manager

### 1.32.0 Release

> - Security Fixes
> - Bug Fixes
> - Infrastructure Updates
> - **UUID Tokens Switched to JWT Access Tokens:** As previously announced in June 2023, Account Manager no longer supports the use of UUID token formats. All new API Clients only support the JWT access token format.

After quite a long warning beforehand, the [UUID](/the-deprecation-of-the-uuid-token-for-api-clients/) option is now wholly gone for new API clients!

## SFRA v7.0.0

- [https://github.com/SalesforceCommerceCloud/storefront-reference-architecture/releases/tag/v7.0.0](https://github.com/SalesforceCommerceCloud/storefront-reference-architecture/releases/tag/v7.0.0)

> **BREAKING CHANGE: SFRA v7.0.0 has been updated to support Node 18**
>
> - Setup Github Actions config by @shethj in #1337
> - Allow arbitrary-length TLDs by @wjhsf in #1352
> - Fix broken locale selector on Page Designer pages. by @wjhsf in #1354
> - Fix search with multiple refinements on PLP by @shethj in #1365
> - Bug: avoid XSS attacks in addressBook.js by @mjuszczyk1 in #1366
> - Update: seo friendly urls for search refinements by @sandragolden in #1331
> - Bug: fix transformations not being applied (W-8851964) by @wjhsf in #1183
> - Use standard ignore for generated files by @wjhsf in #1182
> - Bump version to v7.0.0 by @shethj in #1373
> - Add node18 release note by @shethj in #1374

A long-awaited update to SFRA is finally here with the long-promised update to node 18!

> [!NOTE]
> **Effort:** Do not underestimate upgrading your projects, as this update also means that libraries have been upgraded!

[![package.json changes in SFRA 7.0.0](/media/2024/package-json-changes-7-0-0-cecd2c2e2d.png)](/media/2024/package-json-changes-7-0-0-cecd2c2e2d.png)

Many libraries have been updated!

## PWA Kit v3.4.0

> **General**
>
> - Add support for node 20 #1612
> - Fix bug when running in an iframe #1629
> - Generate SSR source map with environment variable #1571
> - Display selected refinements on PLP, even if the selected refinement has no hits #1622
> - Added option to specify isLoginPage function to the withRegistration component. The default behavior is "all pages ending in /login". #1572
> **Accessibility**
> - Add correct keyboard interaction behavior for variation attribute radio buttons #1587
> - Change radio refinements (for example, filtering by Price) from radio inputs to styled buttons #1605
> - Update search refinements ARIA labels to include "add/remove filter" #1607
> - Improve focus behavior on my account pages, address forms, and promo codes #1625
> **Storefront Preview**
> - We've added a new context input field for Customer Group. This is a text input for now but we imagine a dropdown in the future.
> - We know many of you will bring third party CMS's to the mix. We want you to be able to use Storefront Preview with these as well! On that note please check out our new guidance on Preview extensibility. Essentially you can forward context changes onto a third party to set their version of context in the given platform meaning your Previewed storefront can faithfully render all the content relevant to your context settings.

- [https://github.com/SalesforceCommerceCloud/pwa-kit/releases/tag/v3.4.0](https://github.com/SalesforceCommerceCloud/pwa-kit/releases/tag/v3.4.0)

With smaller and larger updates, the 3.4 release is now equipped to support more use cases and stay current with the latest Node versions!

## Bugfixes

Someone decided in January to do some cleanup, making it harder to make an overview, but here is a [link](https://issues.salesforce.com/#sortCriteria=%40sflast_modified_date_external__c%20ascending&f[sfcategoryfull]=Commerce%7CB2C%20Commerce) to make things easier!

## Updated Cartridges & Tools

### composable-storefront-pocs

- [https://github.com/SalesforceCommerceCloud/composable-storefront-pocs](https://github.com/SalesforceCommerceCloud/composable-storefront-pocs)

> This repo is a composable storefront implementation with various proof of concepts baked in. It otherwise closely tracks pwa-kit

A big update to the POC library, such as live editing (custom editors) and Promotional/Sale/list pricing on PLP and PDP.

### plugin\_slas (v7.2.0)

- [https://github.com/SalesforceCommerceCloud/plugin\_slas](https://github.com/SalesforceCommerceCloud/plugin_slas)

> This cartridge extends authentication for guest users and registered shoppers using the Shopper Login and API Access Service (SLAS).

- Node18 upgrade by [@alexvuong](https://github.com/alexvuong) in [#175](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/175)
- Bump version to v7.2.0 by [@shethj](https://github.com/shethj) in [#177](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/177)
