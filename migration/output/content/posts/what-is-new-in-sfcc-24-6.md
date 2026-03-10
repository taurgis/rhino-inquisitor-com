---
title: What is new in Salesforce Commerce Cloud 24.6?
description: >-
  "$1" is in our rear view mirror, but some new updates to the platform are
  ahead! This time, we look at the $1! Are you interested in last month’s
  releas...
lastmod: '2024-06-03T12:04:39.000Z'
url: /what-is-new-in-sfcc-24-6/
draft: false
heroImage: /media/2024/searching-on-a-highway-89effbcf76.jpg
date: '2024-06-03T12:04:25.000Z'
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - headless
  - ocapi
  - release notes
  - sfcc
  - technical
author: Thomas Theunen
---
"[Connections](https://www.rhino-inquisitor.com/salesforce-connections-2024-and-sfcc/)" is in our rear-view mirror, but some new updates to the platform are ahead! This time, we look at the [June 2024 (24.6) release](https://help.salesforce.com/s/articleView?id=sf.b2c_rn_24_6_release.htm&type=5)!

Are you interested in last month’s release notes? [Click here](https://www.rhino-inquisitor.com/getting-secured-with-the-24-5-salesforce-b2c-commerce-cloud-release/)!

## Commerce Concierge has arrived

> Offer your shoppers bots that provide multichannel conversational product recommendations and add products to the cart with the new Commerce Concierge for B2C Einstein Bot template. Create an enhanced bot from the template and connect your store to a new Einstein bot. You can also use the new Commerce Concierge bot blocks to add functionality.

AI has been the talk of the year at Salesforce and beyond, and finally, the first fruits of these talks have become available to us. Unfortunately, with all these new features also comes a license that needs to be purchased - Commerce Concierge or Shopper Copilot is no different.

Contact your Salesforce account executive to purchase the Einstein Bots and digital Engagement add-on, and to get the set-up started, head over to this [documentation page](https://help.salesforce.com/s/articleView?id=sf.comm_set_up_commerce_concierge_for_a_b2c_store.htm&type=5).

## Platform

### Venezuela VED and VES Currency Codes Are Supported

> Merchants doing business in Venezuela can now use the VED, VES, and VEF currency codes. Previously, only VEF was supported.

Salesforce Commerce Cloud already had quite an extensive list of supported currencies and [localisations](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-localization.html').

It is good to see that Salesforce is still investing in expanding into more regions.

### Get Improved Search Index Performance

> B2C Commerce has updated the search index rebuild process. The update decreases resource usage and improves performance, and an unchanged index is no longer published when no changes are detected. Previously, a redundant product update index task was executed following the index rebuild, and a new search index was published when no documents were altered.

When managing multiple sites within a single environment or dealing with a large product catalog, the search index job can take a considerable amount of time to execute.

Any performance improvement to the search index is highly appreciated!

### Get Better SEO Search Results

> In Business Manager, the Catalog URL rules now use the localizable display value for product attributes with the type Enum of String. The localizable display value improves readability and the SEO value of storefront URLs that use multiple languages. Previously, Product URL attributes used the non-localizable Value.

It's a bit of a confusing title, but the general idea is that your SEO will improve if you wanted to use localised "Enum of String" values in your URL before - but it didn't work the way you expected.

With this new update you can optimise your URL structure for SEO with this new attribute support (if it applies).

PWA Kit By default, the PWA Kit does not use this feature - meaning that this update does not apply to your project unless custom development has happened.

## Business Manager

### Create Active Data Sorting Rules

![](/media/2024/search-query-testing-tool-sfcc-8fb16cf218.jpg)

> The Search Index Query Testing (SIQT) tool now supports sorting rules with active data sorting attributes. Get consistent sorting results in a storefront and when testing an active data sorting rule. Previously, if a sorting rule with active data was used in SIQT, the sorting used text relevance and didn’t consider active data.
>
> **How**: To access the SIQT tool, in Business Manager, select **Merchant Tools | Search | Search Index Query Testing**.

With this new update, we are finally able to correctly test our sorting rules, which makes our lives just a little bit easier when debugging what is going on in the storefront.

## OCAPI & SCAPI

### New preferences API

> The new Preferences API allows you to retrieve Site and Global preferences.

There's been a continuous addition of new APIs to the SCAPI in recent months. This is great news for everyone working on Headless and PWA Kit projects.

Read all about the new [Preferences API here](https://developer.salesforce.com/docs/commerce/commerce-api/references/preferences?meta=Summary).

### Shopper Custom Objects API limit added

> Shopper Custom Object API scopes are now limited to 20 entries. This is now enforced in both SLAS API and SLAS Admin UI.

A "quota limit" has been added to the [Custom Objects API](https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-custom-objects?meta=Summary). Please keep this update in mind if you are close to or past this new platform governance rule.

### Error message clarification

> SLAS IDP integration has enhanced error handling to return more meaningful error messages to the caller. No change in error code information.
>
> The refined error message: “The Account is disabled” is returned for any user account disabled in B2C Commerce. No change in the error code.

A small update to make debugging life just a little better.

### Multiple SLAS sessions for a single USID on a single device

> SLAS now allows shoppers to have multiple clients and authenticate on the same device with a single USID, provided the clients use their respective refresh\_tokens to refresh their sessions.

This might not be the most common use-case, but does open the door for more complex session related use-cases.

### Better SCAPI bundle support

> With B2C Commerce version 24.5, the Shopper Baskets API supports patching variations within product bundles in a single call. This enhancement provides:
>
> -   More efficient and streamlined product bundle management, making it easier to update multiple variations within a bundle without the need for multiple API calls.
> -   Increased productivity for developers managing complex product bundles.

Bundle support in the PWA Kit (and headless in general) was not known to provide the best experience. Over the past two years, updates have been made in multiple locations to improve this experience.

Let's keep em coming!

### Order Search Engine Provides Better Performance

> The search engine that provides results for the order\_search API (OCAPI) has been updated across multiple instances. This update is aimed at enhancing the performance of the search engine. No user impact or behavioral change is expected.

In the last few months, the performance updates have been hitting one after the other, this time for the "Order Search" API.

We'll take any increase in speed for the APIs, especially one that contains essential data and is often used by third-party integrations.

## Development

### Service Framework Is Upgraded

> B2C Commerce is upgrading the supported SFTP algorithms in the service framework.
>
>
> The algorithms now include:
>
> -   Host Key—ssh-ed25519, ecdsa-sha2-nistp256, ecdsa-sha2-nistp384, ecdsa-sha2-nistp521, rsa-sha2-512, rsa-sha2-256, ssh-rsa, ssh-dss
> -   Key Exchange (KEX)—curve25519-sha256, curve25519-sha256@libssh.org, ecdh-sha2-nistp256, ecdh-sha2-nistp384, ecdh-sha2-nistp521, diffie-hellman-group-exchange-sha256, diffie-hellman-group16-sha512, diffie-hellman-group18-sha512, diffie-hellman-group14-sha256, diffie-hellman-group14-sha1, diffie-hellman-group-exchange-sha1, diffie-hellman-group1-sha1
> -   Cipher—aes128-ctr, aes192-ctr, aes256-ctr, aes128-gcm@openssh.com, aes256-gcm@openssh.com, aes128-cbc, 3des-ctr, 3des-cbc, blowfish-cbc, aes192-cbc, aes256-cbc
> -   Message Authentication Code (MAC)—hmac-sha2-256-etm@openssh.com, hmac-sha2-512-etm@openssh.com, hmac-sha1-etm@openssh.com, hmac-sha2-256, hmac-sha2-512, hmac-sha1, hmac-md5, hmac-sha1-96, hmac-md5-96
> -   Public Key Authentication—rsa-sha2-512, rsa-sha2-256, ssh-rsa

It has been a while since any changes were made to the Service Framework. With this update, we now have better support for SFTP algorithms and security options, which is always great to see!

## Updated Cartridges & Tools

### b2c-tools (v0.25.1)

-   [https://github.com/SalesforceCommerceCloud/b2c-tools](https://github.com/SalesforceCommerceCloud/b2c-tools)

> b2c-tools is a CLI tool and library for data migrations, import/export, scripting and other tasks with SFCC B2C instances and administrative APIs (SCAPI, ODS, etc). It is intended to be complimentary to other tools such as sfcc-ci for development and CI/CD scenarios.

-   support specifying features dir for API use by [@clavery](https://github.com/clavery) in [#135](https://github.com/SalesforceCommerceCloud/b2c-tools/pull/135)

### plugin\_passwordlesslogin (v2.0.0)

-   [https://github.com/SalesforceCommerceCloud/plugin\_passwordlesslogin](https://github.com/SalesforceCommerceCloud/plugin_passwordlesslogin)

> Passwordless login is a way to verify a user's identity without using a password. It offers protection against the most prevalent cyberattacks, such as phishing and brute-force password cracking. Passwordless login systems use authentication methods that are more secure than regular passwords, including magic links, one-time codes, registered devices or tokens, and biometrics.

-   brought cartridge up to date so that it works alongside the latest plugin\_slas, v7.3.0
-   updated login forms and email to include the new 8 digit pin code instead of a direct link for login
-   added SCAPI custom API endpoint that handles the auth and email send for composable
