---
title: The Salesforce B2C Commerce Cloud 23.3 release explained
description: >-
  Another month, another release from Salesforce B2C Commerce Cloud! Read the
  full article on Rhino Inquisitor for implementation details.
date: '2023-02-15T14:19:00.000Z'
lastmod: '2023-02-15T14:19:11.000Z'
url: /salesforce-b2c-commerce-cloud-23-3-release/
draft: false
heroImage: /media/2023/shopping-cart-in-sand-7c8677e7ff.jpg
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - sfcc
  - technical
author: Thomas Theunen
---
Another month, another release from Salesforce B2C Commerce Cloud! In this blog post, we'll dive into all the changes and improvements coming to the platform in the [23.3 release](https://help.salesforce.com/s/articleView?id=sf.rn_b2c_rn_23_3_release.htm&type=5). In recent months, we've seen a strong focus on updates to the headless APIs and Page Designer, and we'll examine if this trend continues in this latest release. Are there new and exciting developments on the horizon for the platform? Let's find out! Are you interested in last month’s release notes? [Read the 23.2 release notes](/salesforce-b2c-commerce-cloud-23-2/)!

## Trial sandboxes???

![AppExchange partner program artwork used for the trial sandbox announcement.](/media/2023/salesforce-appexchange-654f2875a8.png)

> B2C Commerce independent software vendor (ISV) partners can now get a trial sandbox environment within minutes of joining the AppExchange Partner program. ISV partner prospects can opt in for a 90-day trial sandbox when they register on the Partner Recruitment page. After their information is submitted, a trial sandbox is automatically provisioned, and the ISV partner receives an email with their sandbox credentials.

Getting a sandbox environment for testing and development [has challenged potential partners and customers for quite a long time](/how-to-get-a-salesforce-b2c-commerce-cloud-sandbox/). But this process has become much easier with the latest 23.3 release of Salesforce B2C Commerce Cloud, at least for ISVs. _A little glimmer of light at the end of the tunnel!_ When ISV partners sign up for the AppExchange Partner program, they can opt for a 90-day trial sandbox. Once they register, a sandbox environment will automatically be set up for them, and they will receive an email with the details. This is excellent news for ISV partners (and the third-party ecosystem) who want to test and develop their solutions on the platform. With a 90-day trial, they can get a lot of work done immediately after signing up!

## Platform

### Successful Jobs Are No Longer Logged

> To increase the efficiency of log volume, successful job steps for custom and global jobs with dedicated log files are no longer logged in the global job log file, Splunk, or Log Center. You can still review successful job steps in the dedicated log file.

There is a [limit](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/site_development/b2c_understanding_log_files.html) to how many logs can be written and sent to the Log Center; in most cases, you aren't looking for success messages. Though successes should be celebrated 😊, there is no need for them to clog up the general logs and nibble at our quotas.

### Buy Now Items Get Their Own Cart

> Shoppers can now use Buy Now express checkout without losing the contents of an existing shopping cart. Buy Now express checkout puts items for purchase in a separate cart. To use this feature, upgrade the Payments plug-in (plugin\_commercepayments) to the latest version.

Losing your basket halfway through your shopping experience is never a fun thing. For any projects making use of [Commerce Payments](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/salesforce_payments/b2c_salesforce_payments.html), this update is a welcome improvement. The plugin\_commercepayments repository can be found in the [plugin_commercepayments repository](https://github.com/SalesforceCommerceCloud/plugin_commercepayments). Access to the repository If you don’t have a GitHub account, see [Salesforce Commerce Cloud GitHub Repositories and Access](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/site_development/b2c_github_repo_access.html#github_repo).

## Business Manager

### Guest Basket Lifetime Limit Is Increased

> The lifetime limit for a guest customer basket is now the lesser of 30 days and the registered customer basket lifetime. Previously, it was the lesser of 7 days and the registered customer basket lifetime. This limit applies to input validation in the BM Basket Preferences UI and Basket Preferences Import. It also affects resolving the guest basket lifetime if it isn’t set, for example, for the basket cleanup job.

This update was moved from the [23.2](/salesforce-b2c-commerce-cloud-23-2/) release to this one, as I covered it in last month's release post.

## OCAPI & SCAPI

### Enable the Shopper Context API in Business Manager

> The Shopper Context feature toggle is now exposed in Business Manager. Use the toggle for each B2C Commerce instance you want to use the API.

Before this 23.3 release, customer support had to be contacted to enable the Shopper Context API.  The Shopper Context API ([part of SCAPI](https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-context?meta=Summary)) allows you to set context information in your headless implementations. It can be linked to customer groups (segmentation) to activate experiences associated with them, such as promotions.

### SLAS Admin UI Update

![SLAS Admin UI updated in the 23.3 release.](/media/2023/slas-admin-ui-1dc5370339.jpg)

The [SLAS admin UI](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas.html) has gotten a bit of love this month, and reported bugs have been worked on a resolved! _I cannot comment on which ones were addressed, but we reported a fair few ones that got resolved in this update!_

## Account Manager

A new release for [Account Manager](https://account.demandware.com/) has happened, containing the following updates

### New Multi-Factor Authentication Error Message

> During multi-factor authentication (MFA), when a user tries to Log in with an insecure Device, Account Manager displays the following prescriptive error message: Your log in request can't be completed. Set PIN, pattern or passcode to secure your mobile device and try again.

#### Use the Last Log In Date to Track User Activity

> The Account Manager User Detail page now displays the user's last log in date. Admins can use this date to track user activity and identify inactive users

#### Prevent Org Invitations to Deleted Users

> You can no longer add deleted users to an organization. Attempts to add a deleted user returns the following error message: Only enabled users can be invited into an organization.

#### New Account Manager Password Requirements

IMPORTANT! Account Manager is announcing an upcoming change to password requirements for stronger passwords and better security. These changes are not part of the current release and are being announced in advance, so users are aware of them. The new requirements are as follows:

-   Passwords should be at least 12 characters long.
-   You can not reuse any of the previous four passwords.
-   Must include a minimum of three of the four components - numbers, symbols, lower-case letters, and upper-case letters.
-   Should not include parts of the name, username, or UUID.

**These new requirements do not impact existing and unexpired passwords** and will only be enforced when a password is reset or changed.

## PWA Kit v2.6.0

A new PWA Kit release happens every few weeks, so this month is no different. In this release, the biggest modification is a performance boost to the "[Mega Menu](https://github.com/SalesforceCommerceCloud/pwa-kit/blob/develop/packages/template-retail-react-app/app/components/drawer-menu/index.jsx)" by lazy loading menu items below a configured 'depth'. Want to see what else this new version has in store? Have a look at the [PWA Kit v2.6.0 release notes](https://github.com/SalesforceCommerceCloud/pwa-kit/releases/tag/v2.6.0).

## Bugfixes

In this and previous releases, the following bugs have been marked as fixed:

-   [Release 23.2 throwing error " Initialization of bean failed; nested exception is java.lang.NullPointerException" on SIG](https://trailblazer.salesforce.com/issues_view?id=a1p4V000002MoxfQAC&title=release-23-2-throwing-error-initialization-of-bean-failed-nested-exception-is-java-lang-nullpointerexception-on-sig)
-   [Delta exports running for a long time](https://trailblazer.salesforce.com/issues_view?id=a1p4V000002wFDBQA2&title=delta-exports-running-for-a-long-time)
-   [Storefront Toolkit: Popovers should become scrollable when reaching screen-height](https://trailblazer.salesforce.com/issues_view?id=a1p3A000001H7STQA0&title=storefront-toolkit-popovers-should-become-scrollable-when-reaching-screen-height)
-   [SFTK: Background color bleeds through to storefront](https://trailblazer.salesforce.com/issues_view?id=a1p4V00000040GaQAI&title=sftk-background-color-bleeds-through-to-storefront)

## Updated Cartridges & Tools

### eu-price-indication (v0.0.1)

-   [https://github.com/SalesforceCommerceCloud/eu-price-indication](https://github.com/SalesforceCommerceCloud/eu-price-indication)

> This repository provides a set of tools with which merchants may build ecommerce storefront compliant with eu directive 2019/2161 (referred as omnibus directive)

Some [known faces](https://github.com/SalesforceCommerceCloud/eu-price-indication/graphs/contributors) provided a new cartridge to assist with the new EU directive.

### plugin\_slas (v6.4.0 - v6.4.1)

-   [https://github.com/SalesforceCommerceCloud/plugin\_slas](https://github.com/SalesforceCommerceCloud/plugin_slas)

> The plugin\_slas cartridge extends authentication for guest users and registered shoppers using the Shopper Login and API Access Service (SLAS).

-   Fix a bug where geolocation information is incorrect for newly logged in users [#82](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/82)
-   Add feature toggle for SLAS session-bridge/token endpoint [#80](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/80)
-   Add small delay in between e2e tests to avoid SLAS rate limit errors [#79](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/79)
-   Add a changelog file [#78](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/78)
-   Add support for SLAS session-bridge/token endpoint for new guest users [#76](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/76)
-   Add multi-site support [#75](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/75)
-   Setup this repository for Github actions [#74](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/74)
-   Set feature toggle for SLAS session-bridge/token endpoint to be enabled by default

### plugin\_datalayer (v1.0.0)

-   [https://github.com/SalesforceCommerceCloud/plugin\_datalayer](https://github.com/SalesforceCommerceCloud/plugin_datalayer)

> Concept to add data tracking into SFRA. This plugin provides an implementation blueprint on website data tracking (server side data and client events) and creates a sfra datalayer which could be used when connecting to other tracking providers like GTM and Tealium.

Another new cartridge is available for SFRA to provide a basis for GTM and Tealium tracking. Always nice to get to see different approaches to these kinds of use cases that every project runs in too.

### composable-storefront-pocs

-   [https://github.com/SalesforceCommerceCloud/composable-storefront-pocs](https://github.com/SalesforceCommerceCloud/composable-storefront-pocs)

> This repo is a composable storefront implementation with various proof of concepts baked in. It otherwise closely tracks pwa-kit

The month of February keeps giving new (public) repositories. And this time, one for the PWA Kit, showing off some great POCs (Proof of Concept) for Page Designer, Guest Order Lookup and more!

### Resource Manager for Salesforce Commerce Cloud (v1.1.3)

-   [https://github.com/SalesforceCommerceCloud/resource-manager](https://github.com/SalesforceCommerceCloud/resource-manager)

> This cartridge contains a Business Manager module that allows editing and publishing of resource bundles.

-   Fix user interface locale by going back to the previous locale by [@guillaumebrunier](https://github.com/guillaumebrunier) in [#16](https://github.com/SalesforceCommerceCloud/resource-manager/pull/16)

### sfcc-ci (v2.11.0)

-   [https://github.com/SalesforceCommerceCloud/sfcc-ci](https://github.com/SalesforceCommerceCloud/sfcc-ci)

> The Salesforce Commerce Cloud CLI is a command line interface (CLI) for Salesforce Commerce Cloud. It can be used to facilitate deployment and continuous integration practices using Salesforce B2C Commerce.

-   Retrieval of organization and user level audit logs ([#341](https://github.com/SalesforceCommerceCloud/sfcc-ci/pull/341))
-   Management for API clients (incl. retrieving details, creation, updating, deletion and rotation of credentials) ([#350](https://github.com/SalesforceCommerceCloud/sfcc-ci/pull/350), [#351](https://github.com/SalesforceCommerceCloud/sfcc-ci/pull/351))
-   Migrate build process from CircleCI to Github Actions ([#347](https://github.com/SalesforceCommerceCloud/sfcc-ci/pull/347), [#348](https://github.com/SalesforceCommerceCloud/sfcc-ci/pull/348))
-   Minor readme updates ([#345](https://github.com/SalesforceCommerceCloud/sfcc-ci/pull/345))
-   Various dependency updates

### Passwordless Login (v1.1.0)

-   [https://github.com/SalesforceCommerceCloud/plugin\_passwordlesslogin](https://github.com/SalesforceCommerceCloud/plugin_passwordlesslogin)

> Passwordless login is a way to verify a user’s identity without using a password. It offers protection against the most prevalent cyberattacks, such as phishing and brute-force password cracking. Passwordless login systems use authentication methods that are more secure than regular passwords, including magic links, one-time codes, registered devices or tokens, and biometrics.

-   improve debug logging by [@clavery](https://github.com/clavery) in [#8](https://github.com/SalesforceCommerceCloud/plugin_passwordlesslogin/pull/8)
-   replace jsonBasket with SCAPI merge basket by [@sandragolden](https://github.com/sandragolden) in [#7](https://github.com/SalesforceCommerceCloud/plugin_passwordlesslogin/pull/7)
    -   replaced the use of the JSON basket in a profile custom attribute with SCAPI [mergeBasket](https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=mergeBasket)
    -   updated README to list out all the API calls required, indicating differences if you are using `plugin_slas` with a **_public_** SLAS client or using `plugin_passwordless` on its own without plugin\_slas, using a **_private_** SLAS client
