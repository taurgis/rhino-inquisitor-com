---
title: Transforming the Future with the 23.9 Release and Custom SCAPI Endpoints
description: >-
  We are getting closer to the holiday period, and also one of the last releases
  of the year! This time we look at the September 2023 (23.9) release!
date: '2023-08-28T07:35:34.000Z'
lastmod: '2023-08-28T07:35:45.000Z'
url: /a-look-at-the-23-9-commerce-cloud-release/
draft: false
heroImage: /media/2023/japan-shopping-street-23-9-bd4ea7a693.jpeg
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags: []
author: Thomas Theunen
---
We are getting closer to the holiday period, and also one of the last releases of the year! This time we look at the [September 2023 (23.9) release](https://help.salesforce.com/s/articleView?id=sf.rn_b2c_rn_23_9_release.htm&type=5)! Are you interested in last month’s release notes? [Read the 23.8 release notes](/what-is-new-in-the-23-8-commerce-cloud-release/)!

## Custom SCAPI endpoints in 23.9

This update is truly a game-changer for Commerce Cloud customers! With the introduction of custom endpoints, we can fully customise Headless use cases, allowing for even more flexibility and control. AND without [using a workaround](/creating-custom-ocapi-endpoints/)! Previously, [hooks](/how-to-use-ocapi-scapi-hooks/) were the only way (through tweaking existing endpoints). But now, the possibilities are endless! And the best part? An open beta is available before the update freeze, so we can start exploring and testing this new feature immediately.

### Development

![Custom endpoint file structure with mapping, script, and schema artifacts.](/media/2023/sfcc-custom-endpoints-138d76b101.png)

The development of custom endpoints will look a lot similar to how we build hooks:

- A mapping file (like hooks.json)
- A script file (Development is similar to controllers and hooks)
- A service schema file (The contract)

Another big thing to mention is that, if you look carefully at the screenshot, you can easily version your services for backwards compatibility!

### Roadmap (Forward Looking Statement)

V1 BETA - September 2023 (23.9) The ability to create custom **GET** endpoints is released together with the documentation. V1 GA - January 2024 (24.1) The feature is officially released and recommended by Salesforce to be used in Production use cases (long story short, wait untill the holiday period is over before releasing your production use cases). V2 GA - March 2024 (24.3) or a later release Support is added for PUT, PATCH, POST and DELETE functions to support any headless use case. Besides supporting more methods, some other features will be added:

- Caching
- Script API helper functions
- Code generation for artefacts
- AM OAuth
- [TSOB](https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-login?meta=getTrustedSystemAccessToken) & [TAOB](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas-trusted-agent.html)

### Paving the way for a Headless future

From a Headless perspective, Salesforce Commerce Cloud had much to catch up on compared to other platforms (which shall not be named 😎). But this area is rapidly evolving, and it was a necessary one. As customers interact with many different channels than just the storefront, other channels need to have a way of interacting with the platform - and usually that is through an API! Giving developers and customers the freedom to customise is powerful. It also simplifies third-party integrations with Composable Storefront, and I expect more movement to happen in that area after this release! As a bystander, it is noticeable that all "the rest" is not getting much attention, looking at the release notes of the past two months. But, understandably, decisions of priority have to be made.

## Platform

### Improve Product Search Result in Japanese

> You can now enable a new language analyzer for Japanese locales in B2C Commerce. The new analyzer supports advanced methods for search query tokenization. This enhancement provides more relevant search results for product searches in the Japanese language. It also reduces the merchandising effort to optimize storefront search for Japanese locales. For example, setting up additional synonyms and search dictionary entries. **How:** To enable the new analyzer, in Business Manager, select site | Merchant Tools | Search | Search Indexes | Language Options. Select Japanese-Improved as the language analyzer for Japanese locales. An index rebuild is NOT required after this update. To change the analyzer setting requires the permission to update a Business Manager Search Indexes module

![Language Options menu showing the Japanese Improved analyzer.](/media/2023/sfcc-japanese-improved-search-fb4e7c018a.png)

A new and exciting addition for Japanese customers. It is important to find the right product to ensure good conversion rates and improve customer experience.

## Business Manager

### Improve Code Profiler Tracking

> The Code Profiler Script API calls (shown as SCRIPT\_API) are no longer measured when using Production Mode. This change improves code profiler tracking without causing performance issues.

![Code Profiler output from before the 23.9 Production Mode change.](/media/2023/sfcc-script-profile-productionmode-before-23-9-35fed622ef.png)

Having "Production Mode" with less impact on performance will positively affect the TTFB (Time To First Byte), though it is not stated anywhere how much this will affect the storefront percentage-wise. You can still access this information in other modes within 23.9, which are more useful for performance debugging.

## OCAPI & SCAPI

### Custom Shopper Login IDPs (SLAS)

> - Default IDP configuration allows for SSO/OIDC configuration with other IDPs outside the list of SLAS supported IDPs. Configuration can be performed via the Admin API or Admin UI. For more information, see Configure a Default IDP.
> - Preferred IDP configuration cleanup and functionality added to Admin UI.

This a massive update to IDP support in SLAS and a very welcome one. Before, we were limited to integrating with IDPs [officially supported](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas-identity-providers.html) by SLAS, [but now it is possible to bring your own](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas-default-idp.html)!

### Shopper Login (SLAS)

> - Addressed a limitation in plugin\_slas integration with SLAS around Merge Cart for Guest to Registered flow.
> - For the getSessionBridgeAccessToken endpoint, the returned TokenResponse now correctly includes the enc\_user\_ id attribute.
> - As part of our efforts to scale the SLAS service for temporary holiday volume, registered shopper refresh tokens (new and existing) are valid for only 45 days beginning the week of August 7. This applies to shopping apps integrated with SLAS, and to shoppers who have not returned to the shopping app at least one time in the last 45 days. This temporary state ends on September 15. After September 15, registered shopper login tokens resume their full 90-day standard duration. Ideally, customers should be Shopper Guest sessions, and B2C Commerce basket retention is not affected in any way.

The **SLAS sessions will be limited to 45 days until September 15th**, which was also mentioned in last month's release notes - and a very important one to take note of.

## PWA Kit Nightly Builds

If you want to know what is cooking, check out the nightly builds that are now available! [https://github.com/salesforceCommerceCloud/pwa-kit#%EF%B8%8F-nightly-builds](https://github.com/salesforceCommerceCloud/pwa-kit#%EF%B8%8F-nightly-builds)

## Updated Cartridges & Tools

### b2c-crm-sync (v3.0.3)

- [https://github.com/SalesforceCommerceCloud/b2c-crm-sync](https://github.com/SalesforceCommerceCloud/b2c-crm-sync)

> Salesforce B2C Commerce / CRM Sync is an enablement solution designed by Salesforce Architects to teach Salesforce's B2C Customer Data Strategy for multi-cloud use-cases. The solution demonstrates a contemporary approach to the integration between Salesforce B2C Commerce and the Cloud products running on the Salesforce Customer 360 Platform.

- Rename lib/\_common/request/\_ createOCAPIAUthRequestDef.js by [@jbachelet](https://github.com/jbachelet) in [#235](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/pull/235)
- Fix/173 by [@jbachelet](https://github.com/jbachelet) in [#237](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/pull/237)
- Change b2ccrm\_syncResponseText from set-of-string to JSON to reduce the performance impact on high-scale brands by [@jbachelet](https://github.com/jbachelet) in [#251](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/pull/251)
- Bump word-wrap from 1.2.3 to 1.2.4 by [@dependabot](https://github.com/dependabot) in [#250](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/pull/250)

### sfra-webpack-builder (v3.4.5)

- [https://github.com/SalesforceCommerceCloud/sfra-webpack-builder](https://github.com/SalesforceCommerceCloud/sfra-webpack-builder)

> Webpack can be cumbersome to setup, especially in multicartridge projects for SFRA. This plugin let you bundle all your js, scss and jsx files out of the box.

- configure release it bumber ([becbeab](https://github.com/SalesforceCommerceCloud/sfra-webpack-builder/commit/becbeabc3c1757daf6b4b11b7e2964874cbe389b))
- chore: init release it ([7816af8](https://github.com/SalesforceCommerceCloud/sfra-webpack-builder/commit/7816af8aca32340aa6e769d37373525a108acb45))
- Fix: Deprecate node-sass in favor of sass (dart) Upgrade dependencies Fixes [#96](https://github.com/SalesforceCommerceCloud/sfra-webpack-builder/issues/96) ([58de1a0](https://github.com/SalesforceCommerceCloud/sfra-webpack-builder/commit/58de1a08b600c260cea6f186c4f35d5c5f714c18))
- Merge pull request [#95](https://github.com/SalesforceCommerceCloud/sfra-webpack-builder/pull/95) from SalesforceCommerceCloud/main ([9c4a8f5](https://github.com/SalesforceCommerceCloud/sfra-webpack-builder/commit/9c4a8f5ad2e0e7257a771deef65904c83c5c915e))
