---
title: Salesforce B2C Commerce Cloud November 2022 Updates
description: >-
  A closer look at the November 2022 B2C Commerce Cloud updates, including
  cartridge releases, tooling changes, and SCAPI work.
date: '2022-11-28T18:36:33.000Z'
lastmod: '2022-11-29T10:33:29.000Z'
url: /salesforce-b2c-commerce-cloud-november-2022-updates/
draft: false
heroImage: /media/2022/shopping-cart-in-the-clouds-4e07433888.jpg
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - sfcc
author: Thomas Theunen
---
It is a slow period in B2C Commerce Cloud update land as no significant [releases](/category/release-notes/) happen during the holiday period. But updates still occur in other places!

In this article, I consolidate all the updates I have found across the different areas encompassing Salesforce B2C Commerce Cloud.

## SFRA v6.3.0

A [maintenance release](https://github.com/SalesforceCommerceCloud/storefront-reference-architecture/releases/tag/v6.3.0) has happened with no more than updated dependencies. So nothing too exciting to mention here!

This usually means plugin cartridges (such as wishlist) have received updates, and the SFRA version has been “upped” to match.

In this case, it was a major update to [plugin\_slas](https://github.com/SalesforceCommerceCloud/plugin_slas/releases/tag/v6.3.0).

## PWA Kit v2.3.0

As expected, another big update hit the PWA Kit with quite [an extensive changelog](https://github.com/SalesforceCommerceCloud/pwa-kit/compare/v2.2.0...v2.3.0). The "spotlight" change is the added [React Query](https://tanstack.com/query/v4/docs/overview) support for the server side.

Some other noteworthy changes (besides bugfixes):

- [New Einstein API activities](https://github.com/SalesforceCommerceCloud/pwa-kit/pull/714)
- [Updated the demo ODS instance URL](https://github.com/SalesforceCommerceCloud/pwa-kit/pull/799)
- [Performance improvement on the Managed Runtime](https://github.com/SalesforceCommerceCloud/pwa-kit/pull/720)

An [upgrade guide](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/upgrade-to-v2-3.html) is available if you are already working with the PWA Kit and need to update to this version.

## Bugfixes

Even though there are no "big releases", bugfix releases still happen in this period.

- [basket.reserveInventory on Product Bundle fails with NPE when parent bundle item has null inventory record](https://trailblazer.salesforce.com/issues_view?id=a1p4V00000219j2QAA&title=basket-reserveinventory-on-product-bundle-fails-with-npe-when-parent-bundle-item-has-null-inventory-record)

## Account Manager

The Account Manager got some love again at the end of October (after my [last release notes post](/salesforce-b2c-commerce-cloud-october-updates/)).

- Security Fixes
- Bug Fixes
- Usability Improvements to the API Client List Page

- **[Updated API Client List Page](https://help.salesforce.com/s/articleView?id=sf.b2c_rn_am_api_client_list_page_je.htm&type=5&language=en_US)**

With the addition of two new columns and filters, the Account Manager API Client List page is now easier to use.

## New Ideas

Some new ideas made their way to the IdeaExchange!

- [The addCertificateForZone endpoint needs better error messaging.](https://ideas.salesforce.com/s/idea/a0B8W00000LfJTJUA3)
- [Improved CMS where Content Library can be exported separately from code changes](https://ideas.salesforce.com/s/idea/a0B8W00000LgTXBUA3)
- [Request for implementation of personalization features in PWA Kit](https://ideas.salesforce.com/s/idea/a0B8W00000LfMwKUAV)
- [Salesforce Payments: Paypal : Supports only combined auth and capture](https://ideas.salesforce.com/s/idea/a0B8W00000LgsQDUAZ)

## Updated Cartridges & Tools

### Adyen (v22.2.1)

- [https://github.com/SalesforceCommerceCloud/link\_adyen](https://github.com/SalesforceCommerceCloud/link_adyen)

> Adyen provides a LINK cartridge to integrate with Salesforce Commerce Cloud (SFCC). This cartridge enables a SFCC storefront to use the Adyen payment service. This cartridge supports SFRA version 5.x.x & 6.x.x and SiteGenesis JS-Controllers version 103.1.11 and higher.

### New

- Support for the new India live environment. Use this environment with the corresponding India location-based live endpoint.
- A custom [Business Manager configuration page](https://docs.adyen.com/plugins/salesforce-commerce-cloud/set-up-the-cartridge#set-up-the-business-manager).
- New supported payment method: [UPI](https://docs.adyen.com/payment-methods/upi).

### Improved

- The cartridge now uses [Web Components v5.28.0](https://docs.adyen.com/online-payments/release-notes#releaseNote=2022-10-10-web-componentsdrop-in-5.28.0) and [Checkout API v69](https://docs.adyen.com/online-payments/release-notes?integration_type=api&version=69).
- You can now persist gift card information in the payment form after the shopper has filled in the gift card information.

### Mollie (v22.3.0)

- [https://github.com/SalesforceCommerceCloud/link\_mollie](https://github.com/SalesforceCommerceCloud/link_mollie)

> This is the integration cartridge for Mollie

- Fixed some ApplePaySession errors in non-safari browsers
- Fixed order locking issue. Only update supported hook order status via hook, handle the rest of the statuses on redirect.

### plugin\_slas (v6.3.0)

- [https://github.com/SalesforceCommerceCloud/plugin\_slas](https://github.com/SalesforceCommerceCloud/plugin_slas)

> The plugin\_slas cartridge extends authentication for guest users and registered shoppers using the Shopper Login and API Access Service (SLAS).

- fix cart merge error due to session bridge failing when client IP header name is not set by [@sandragolden](https://github.com/sandragolden) in [#53](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/53)
- issue [#41](https://github.com/SalesforceCommerceCloud/plugin_slas/issues/41) : restore session custom attributes after session bridge by [@sandragolden](https://github.com/sandragolden) in [#54](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/54)
- Add support for ECOM 18.10 by [@vcua-mobify](https://github.com/vcua-mobify) in [#59](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/59)
- Document allow listing POD IP address by [@johnboxall](https://github.com/johnboxall) in [#63](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/63)
- Fix SLAS Logout issue by [@shethj](https://github.com/shethj) in [#64](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/64)
- Run login flows only if request method is 'GET' by [@shethj](https://github.com/shethj) in [#69](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/69)
- Fix refresh\_token value undefined in browser cookies by [@shethj](https://github.com/shethj) in [#70](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/70)
- Fix merge basket call returns 409 Conflict error if guest user has no basket by [@shethj](https://github.com/shethj) in [#66](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/66)
- Release/v6.3.0 by [@shethj](https://github.com/shethj) in [#71](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/71)
- Enforce `prettier` in CI by [@johnboxall](https://github.com/johnboxall) in [#67](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/67)

### b2c-tools (v0.13.3)

- [https://github.com/SalesforceCommerceCloud/b2c-tools](https://github.com/SalesforceCommerceCloud/b2c-tools)

> b2c-tools is a CLI tool and library for data migrations, import/export, scripting and other tasks with SFCC B2C instances. It is intended to be complimentary to other tools such as sfcc-ci for development and CI/CD scenarios.

The changelog is visible [in the b2c-tools v0.13.2 to v0.13.3 comparison](https://github.com/SalesforceCommerceCloud/b2c-tools/compare/v0.13.2...v0.13.3).
