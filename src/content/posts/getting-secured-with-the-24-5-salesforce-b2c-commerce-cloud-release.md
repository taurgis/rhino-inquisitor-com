---
title: Getting secured with the 24.5 Salesforce B2C Commerce Cloud release
description: >-
  Again, it is time for the monthly Salesforce B2C Commerce Cloud release! This
  time, we look at the May 2024 (24.5) release!
date: '2024-05-03T11:25:41.000Z'
lastmod: '2024-05-06T07:48:10.000Z'
url: /getting-secured-with-the-24-5-salesforce-b2c-commerce-cloud-release/
draft: false
heroImage: /media/2024/robots-behind-bars-e1714735507313-e727779a98.jpg
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - release notes
  - sfcc
  - technical
author: Thomas Theunen
---
Again, it is time for the monthly Salesforce B2C Commerce Cloud release! This time, we look at the [May 2024 (24.5) release](https://help.salesforce.com/s/articleView?id=sf.rn_b2c_rn_24_5_release.htm&type=5)!

Are you interested in last month’s release notes? [Read the 24.4 release notes](/getting-to-know-the-sfcc-24-4-release/)!

## Platform

### Five Minute Minimum Period Enforced for WAF Log Retrieval

> A minimum period of five minutes is now enforced for retrieving WAF logs. This enhancement prevents setting the end time for log requests within five minutes of the current time.

This update aims to provide more reliable and complete logs—nothing much to say about this.

### Upgrade Your Security Posture with eCDN WAFv2

> B2C Commerce announces the upgraded version of our eCDN, now featuring WAFv2, bringing a host of advanced security features to safeguard your online presence.
>
>
> Here’s what you can expect with eCDN WAFv2:
>
> -   **Open Web Application Security Project (OWASP) Ruleset Integration:** The eCDN OWASP Core Ruleset integrates the latest OWASP ModSecurity Core Rule Set (CRS). Your CDN provider routinely monitors for updates from OWASP based on the latest version available from the official code repository.
> -   **eCDN Managed Rules:** Provide fast and effective protection for all your applications. The rule set is frequently updated to address emerging vulnerabilities and reduce false positives.
> -   **eCDN Exposed Credentials Check:** A managed ruleset of pre-configured rules for well-known CMS applications. The ruleset conducts a check against a public database of stolen credentials.
> -   **Configurability via Business Manager UI and CDN Zones API:** With this update, configuring the eCDN WAFv2 settings is now accessible through the Business Manager UI and for new zones, through the CDN Zones API.
> -   **Reduced False Positive Detections:** The upgraded WAFv2 includes updated managed rulesets that reduce false positives. The rulesets enhance threat detection accuracy while minimizing disruptions to your normal operations.

This is a significant update to the WAF! Increasing security is always on everyone's mind, so getting an upgrade is much needed.

This is one of the parts of Commerce Cloud over which we had little control until last year. With all updates on the SCAPI side (and also UI) related to security and now this upgrade, we are finally getting some control over everything happening in Cloudflare behind the scenes.

## Business Manager

### Refine and Customize Promotions

> The Business Manager Promotion Refinements feature now offers expanded support for custom product attributes. With this update, users can now create refinable promotions that utilize custom localizable product attributes, as well as custom product attributes of type enum-of-string and enum-of-int. This enhancement addresses the previous limitation where Business Manager users could not set up refinable promotions with these specific custom attribute data types or localizable attributes.

This update might seem small to some, but it dramatically impacts the flexibility of an already flexible promotion engine. Using localised attributes means that regional promotions just got a lot easier!

## OCAPI & SCAPI

### Custom Headers

> You can now use the Script API response object to set custom response headers.

Finally, we get access to our custom headers! This is another excellent addition that opens [more flexibility](https://developer.salesforce.com/docs/commerce/commerce-api/guide/extensibility_via_hooks.html?q=c_#custom-headers) for headless projects.

### External Taxation Mode

> With B2C Commerce 24.5, You can use external taxation mode with the Shopper Baskets API when hooks are enabled. For details, see External Taxation Documentation.

It is well known that filling in all the necessary data in the [Tax Tables](https://help.salesforce.com/s/articleView?id=cc.b2c_tax_table_object_import_export.htm&language=en_US&type=5) of Commerce Cloud can be challenging for some regions worldwide. This is where third-party systems come into play to ease the burden of this task.

Now, with [a clear path](https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-baskets?meta=Summary) to follow in Salesforce Commerce Cloud's headless space, integrating these third-party systems has become much easier. However, it's important to protect these endpoints from unauthorised access and potential misuse.

_When following the link, we are greeted with this documentation:_

The B2C Commerce API calculates taxes internally using tax tables. If you want to integrate with a third-party tax provider or calculate taxes on your own, you can use the external taxation feature to add a taxation rate and optional taxation value. When setting a taxation rate, the taxation is calculated for this specific rate. If you pass a value, this value is used as a taxation value, as well, without recalculation. To use this feature, set the `taxMode` parameter externally when creating the basket.

When using external taxation, you must set a tax rate either in one request to the `/baskets/{basketId}/taxes` or with separate requests for each line item, using `/baskets/{basketId}/items/{lineItemId}/taxes`.

If the tax mode of a basket is set to `external`, a tax item is required for all line items, even for zero-tax items, to avoid oversights.

### Deprecation Notification

> The following Shopper Baskets (v1 and v2) endpoints are deprecated and are no longer supported:
>
> -   addPriceBooksToBasket
> -   getPriceBooksForBasket

If you are using any of these APIs, take this into account. However, no documentation on these endpoints yet gives alternatives.

## Development

### Enhance Order Access Security with the Allow List

> Enable the Allow-List feature on the Limit Storefront Order Access setting if you aren’t yet limiting Storefront Order Access at all. This feature enhances security and control over who can access orders and which controllers can access order functions.
>
> **How**: In Business Manager | Orders | Order Preferences. Set the Limit Storefront Order Access dropdown to Allow List. Enter allowed storefront controllers as a comma-separated list. Only the controllers on the allow list can access customer orders.

For projects on SiteGenesis or SFRA, we now have more fine-grained control over Order Access security now.

However, we should always aim to secure everything. But this option provides us with additional choices, which is always beneficial.

## Account Manager

### Upcoming Removal of Deprecated Roles in Account Manager

> Salesforce is removing deprecated roles from Account Manager. To prevent any disruption in your organization's workflow, ensure you aren’t using the deprecated roles. How: Review the list of deprecated roles that are slated for removal. Reassign any users currently using these roles. For assistance with reassigning roles, see Edit a User Account.
>
> The affected roles include:
>
>
> -   SLAS Organization Admin role (Deprecated for API Clients only)
> -   XChange roles
> -   Documentation User, Documentation Linguist, Documentation Reviewer
> -   statuspage.io User
> -   Business Manager Partner
> -   CQuotient Configurator Administrator
> -   Order Management Admin
> -   Order Management User

A bit of cleaning up is happening here! But if you use these roles in an "old" automation routine, you might want to remove them to avoid exceptions.

## PWA Kit v3.5.x

> -   Add Support for SLAS private flow #1722
> -   Fix invalid query params warnings and allow custom query #1655
> -   Fix cannot read properties of undefined (reading 'unshift') #1689
> -   Add Shopper SEO hook #1688
> -   Update useLocalStorage implementation to be more responsive #1703
> -   Storefront Preview: avoid stale cached Commerce API responses, whenever the Shopper Context is set #1701

There is a new [release](https://github.com/SalesforceCommerceCloud/pwa-kit/releases/tag/v3.5.0) of the PWA Kit, with the most significant addition being support for an SLAS private flow. This update should boost performance, as fewer API calls are needed to get the ball rolling!

This also offers an excellent example of how to securely do these kinds of integrations without exposing credentials.

## Updated Cartridges & Tools

### b2c-tools (v0.25.0)

- [https://github.com/SalesforceCommerceCloud/b2c-tools](https://github.com/SalesforceCommerceCloud/b2c-tools)

> b2c-tools is a CLI tool and library for data migrations, import/export, scripting and other tasks with SFCC B2C instances and administrative APIs (SCAPI, ODS, etc). It is intended to be complimentary to other tools such as sfcc-ci for development and CI/CD scenarios.

- Bugfix - corrects path for types in package.json by [@nick11703](https://github.com/nick11703) in [#133](https://github.com/SalesforceCommerceCloud/b2c-tools/pull/133)
- Feature - allow reading certificate from buffer by [@nick11703](https://github.com/nick11703) in [#134](https://github.com/SalesforceCommerceCloud/b2c-tools/pull/134)

### plugin\_slas(v7.3.0)

- [https://github.com/SalesforceCommerceCloud/plugin\_slas](https://github.com/SalesforceCommerceCloud/plugin_slas)

> This cartridge extends authentication for guest users and registered shoppers using the Shopper Login and API Access Service (SLAS).

- Reduce session churn on hybrid sites [#187](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/187)
- Use refresh token expiry from SLAS [#154](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/154)
- Update OCAPI version regex to allow double digit minor numbers [#182](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/182)
- Add support for SLAS private clients [#178](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/178)
