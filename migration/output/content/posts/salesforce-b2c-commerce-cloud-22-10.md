---
title: Salesforce B2C Commerce Cloud 22.10
description: >-
  What a year it has been, and now it is time for the final release of this
  year: the October 2022 (22.10) release!
date: '2022-09-28T13:33:05.000Z'
lastmod: '2022-10-03T11:59:36.000Z'
url: /salesforce-b2c-commerce-cloud-22-10/
draft: false
heroImage: /media/2022/tiktok-1-d92d51296d.jpg
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - sfcc
  - technical
author: Thomas Theunen
---
What a year it has been, and now it is time for the final release of this year: the [October 2022 (22.10) release](https://documentation.b2c.commercecloud.salesforce.com/DOC3/index.jsp?topic=%2Fcom.demandware.dochelp%2FReleaseNotes%2F22_8%2Frn_b2c_rn_22_9_release.html&cp=0_1_2)!

And yes, as it is every year, there will be no releases between November and January to provide stability on the platform during the holiday period.

Are you interested in last month’s release notes? [Read the 22.9 release notes](/salesforce-b2c-commerce-cloud-22-9-release/)!

## Staging eCDN configuration

[![Staging eCDN configuration flow for a hybrid storefront.](/media/2022/ecdn-staging-464848555e.jpg)](/media/2022/ecdn-staging-464848555e.jpg)

A big update for those working with hybrid deployments using the PWA Kit (Composable Storefront). Many issues popped up in the staging environment that had to do with custom certificates and SLAS. With this update, these will hopefully be out of the picture!

There will be **n****o Business Manager interface for this one**, only APIs that you have to call using the SCAPI:

- [Create an eCDN zone](https://developer.salesforce.com/docs/commerce/commerce-api/references/cdn-api-process-apis?meta=createStorefrontZone)
- [Upload a certificate](https://developer.salesforce.com/docs/commerce/commerce-api/references/cdn-api-process-apis?meta=addCertificateForZone)

Business Manager The UI in the Business Manager will not reflect the changes made on staging!

## TikTok for Ads

[![Business Manager view for the TikTok integration cartridge.](/media/2022/tiktok-bm-9172b705bb.jpg)](/media/2022/tiktok-bm-9172b705bb.jpg)

Since the start of this year, there has been a lot of talk about "Social Commerce," which means the integration of Salesforce B2C Commerce Cloud into different social channels such as TikTok.

A positive move that has been made is this is a cartridge that you can install yourself, rather than being a feature switch where you have no control over what happens in the back-end.

This gives developers (and architects) more power over how the integration with these Social Channels is made!

The cartridge can be downloaded [from the Social Channel Integrations repository](https://github.com/SalesforceCommerceCloud/social_channel_integrations)!

## Platform

### Origin Shielding Phase 3

[![Origin shielding rollout note for Demandware.net lockdown.](/media/2022/origin-shielding-phase3-d9fa09fa33.jpg)](/media/2022/origin-shielding-phase3-d9fa09fa33.jpg)

Phase three of Original Shielding will come into effect by locking down Demandware.net for Development and Production instances.

This is probably the deadline for customers requesting a migration extension.

## Business Manager

### Self-provision Order Integration

Before you had to contact support in order to provision an OMS integration, after this release this is something we will have full control over and do ourselves at:

"Administration > Global Preferences > Salesforce Order Management Configuration"

Permissions It might be necessary to give permission to your role in the Business Manager before seeing this new menu item!

## OCAPI & SCAPI

### Disabling of negative allocation amounts in inventory lists

It will no longer be possible to set negative values for the allocation amount in an inventory record using the PUT/PATCH endpoint. Not sure why anyone would want to do this, but at least now you can't.

```text
/inventory_lists/{}/product_inventory_records/{}
//error
status code: 400
"type": "PropertyConstraintViolationException"
"message": "An error occurred while decoding the request. There's a value constraint
violation of property '$.allocation.amount' in document 'product_inventory_record'.”
```

### beforePOST v2 for baskets

To fix some issues in the v1 hook:

- Using an incorrect input type (created basket, which isn’t available before the basket creation instead of the basket request document).
- Using an incorrect execution order (hook was executed after the creation of the basket, which is too late for a before hook to function).

A new hook has been introduced.

[![beforePOST v2 basket hook reference in the API documentation.](/media/2022/new-hook-basket-f116a5da90.jpg)](/media/2022/new-hook-basket-f116a5da90.jpg)

> [!WARNING]
> **Deprecated:** Hook The v1 hook will continue to exist but is discouraged from being used.

### Edge Caching for SCAPI

Edge caching is introduced to increase the performance of the most often called APIs in the SCAPI:

- /product
- /category
- /product\_search

The performance of the SCAPI will improve with this change, as it no longer relies on caching on the client side but on the CDN layer in front of it.

This will increase the response time and allow the Mulesoft layer to scale better since it is no longer responsible for serving 100% of the requests.

> [!NOTE]
> **Documentation:** ~~The documentation for this change is not available yet, so questions like "Can we manipulate the time?" or "Can we clear this cache?" is not something that we can answer yet.~~

**Update**: It is not possible to manipulate the cache time, or clear it. (For now, at least. This might change in the future)

## Development

### Unified Sandbox URL & API Server

Currently, all ODS (On-Demand Sandboxes) operates under a unique URL based on the cluster they are located in (e.g., us01, us02, us03, ...)

A singular URL will be introduced for both the sandbox and the management APIs to make it easier to manage.

**Current ODS URL**:

zzzz-001.sandbox.us01.dx.commercecloud.salesforce.com/on/demandware.store/Sites-Site `<https://admin.us01.dx.commercecloud.salesforce.com/>`

**New Unified ODS URL**:

zzzz-001.dx.commercecloud.salesforce.com/on/demandware.store/Sites-Site `<https://admin.dx.commercecloud.salesforce.com/>`

## SFRA v6.2.0

![Comparison between SiteGenesis and SFRA storefront stacks.](/media/2022/sfra-vs-sitegenesis-965c09b9a6.jpg)

- [https://github.com/SalesforceCommerceCloud/storefront-reference-architecture/releases/tag/v6.2.0](https://github.com/SalesforceCommerceCloud/storefront-reference-architecture/releases/tag/v6.2.0)

A new version of SFRA has popped up after months of silence, though nothing major or "wow" has happened besides maintenance tasks.

### Updates

- Replace node-sass with sass [#1305](https://github.com/SalesforceCommerceCloud/storefront-reference-architecture/pull/1305)
- Add legal notice region that showcases component type inclusions feature [#1311](https://github.com/SalesforceCommerceCloud/storefront-reference-architecture/pull/1311)
- Use latest sgmf-scripts [#1317](https://github.com/SalesforceCommerceCloud/storefront-reference-architecture/pull/1317)

### Chores

- Update dev dependencies [#1318](https://github.com/SalesforceCommerceCloud/storefront-reference-architecture/pull/1318)

## PWA Kit v2.2.0

![PWA Kit release graphic for version 2.2.0.](/media/2022/e0468610-0e86-403f-b486-743a38d4b763-d68cf607f8.png)

- [https://github.com/SalesforceCommerceCloud/pwa-kit/releases/tag/v2.2.0](https://github.com/SalesforceCommerceCloud/pwa-kit/releases/tag/v2.2.0)

Development of the PWA Kit continues steadily, and new releases happen often. In August, a new release occurred with the following changes:

### Template Retail React App

- Update zzrf-001 instance url [#694](https://github.com/SalesforceCommerceCloud/pwa-kit/pull/694)
- Optimize Server-side performance [#667](https://github.com/SalesforceCommerceCloud/pwa-kit/pull/667)
- Remove references to session bridging [#684](https://github.com/SalesforceCommerceCloud/pwa-kit/pull/684)

### pwa-kit-dev

Added option to specify where/from the credentials can be saved/read [#647](https://github.com/SalesforceCommerceCloud/pwa-kit/pull/647)

## Bugfixes

Here is a list of fixes made to the platform in the past month or planned in the 22.10 release!

- [Custom setting for session timeout does not update cached value](https://trailblazer.salesforce.com/issues_view?id=a1p4V000002aVvRQAU&title=custom-setting-for-session-timeout-does-not-update-cached-value)
- [Folder picker fails to load with 'library\_id' undefined error](https://trailblazer.salesforce.com/issues_view?id=a1p4V000000wtu4QAA&title=folder-picker-fails-to-load-with-library_id-undefined-error)

## Updated Cartridges & Tools

### plugin\_slas (v6.2.9)

- [https://github.com/SalesforceCommerceCloud/plugin\_slas](https://github.com/SalesforceCommerceCloud/plugin_slas)

> The SLAS plug-in cartridge replaces the method for authenticating shoppers used by commerce applications based on the Storefront Reference Architecture (SFRA). Instead of using the B2C Commerce script API, the SLAS plug-in cartridge uses the Shopper Login and API Access Service (SLAS) to establish guest user logins and registered user logins.

Some significant code changes have made their way into this cartridge, hopefully fixing some issues people have run into in production environments.

**Updates** Use latest sgmf-scripts [#36](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/36)

### Bugs

- Prevent httpRedirect in SLAS Auth service [#45](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/45)
- Add session guard to preserve sessions after session bridge [#26](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/26)
- Preserve client IP through the session bridge [#32](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/32)
- Restore missing authenticated customer data for other plugins [#38](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/38)

**Chores** Include and run prettier [#46](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/46)

### b2c-tools (v0.11.0)

- [https://github.com/SalesforceCommerceCloud/b2c-tools](https://github.com/SalesforceCommerceCloud/b2c-tools)

> b2c-tools is a CLI tool and library for data migrations, import/export, scripting and other tasks with SFCC B2C instances. It is intended to be complimentary to other tools such as sfcc-ci for development and CI/CD scenarios.

- `export page` now supports a `-r` option to indicate that the page selectors are regular expressions and export all matching pages
- Underlying page designer APIs were refactored and exposed to migration scripts. See [examples/page-designer.js](https://github.com/SalesforceCommerceCloud/b2c-tools/blob/main/examples/page-designer.js) for usage
- page designer refactoring by [@clavery](https://github.com/clavery) in [#84](https://github.com/SalesforceCommerceCloud/b2c-tools/pull/84)
- update clean cartridge logic by [@clavery](https://github.com/clavery) in [#81](https://github.com/SalesforceCommerceCloud/b2c-tools/pull/81)
- bugfix cli to coerce code version to string by [@clavery](https://github.com/clavery) in [#85](https://github.com/SalesforceCommerceCloud/b2c-tools/pull/85)

### plugin\_passwordlesslogin

- [https://github.com/SalesforceCommerceCloud/plugin\_passwordlesslogin](https://github.com/SalesforceCommerceCloud/plugin_passwordlesslogin)

> Passwordless login is a way to verify a user’s identity without using a password. It offers protection against the most prevalent cyberattacks, such as phishing and brute-force password cracking. Passwordless login systems use authentication methods that are more secure than regular passwords, including magic links, one-time codes, registered devices or tokens, and biometrics.

A new cartridge in town uses the SLAS API to allow passwordless login. As it is a new and a community cartridge, test it thoroughly before releasing it to production!

It is great to see more SLAS make their way into SFRA, allowing for more flexible login methods.
