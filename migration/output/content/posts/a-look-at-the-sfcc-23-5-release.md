---
title: A look at the Salesforce B2C Commerce Cloud 23.5 release
description: >-
  Another month, another release! This time we look at the! Are you interested
  in last month’s release notes?!
date: '2023-04-20T05:52:49.000Z'
lastmod: '2023-04-23T15:28:04.000Z'
url: /a-look-at-the-sfcc-23-5-release/
draft: false
heroImage: >-
  /media/2023/a-shopping-mall-being-refurbished-with-workers-scaled-6d93cd6e04.jpeg
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - security
  - sfcc
  - technical
author: Thomas Theunen
---
Another month, another release! This time we look at the [May 2023 (23.5) release](https://help.salesforce.com/s/articleView?id=sf.rn_b2c_rn_22_7_release.htm&type=5)!

Are you interested in last month’s release notes? [Read the 23.4 release notes](/everything-new-in-sfcc-23-4/)!

## Platform

### Auto Renew CDN Certificates

> Starting May 19, 2023, if you can self-manage your custom SSL certificates, you have the option to configure Cloudflare provisioned SSL certificates for automatic renewal. Auto renewing a certificate saves time and keeps you from missing deadlines. It also improves managing eCDN on staging instances. You can configure auto renewing certificates for development, staging, and production instances. Auto renewal is available only for Cloudflare certificates and only with the CDN-API.

If you use Cloudflare provisioned SSL certificates, this update is a big ease-of-life improvement!

> [!WARNING]
> **Limitations:** You can renew up to 10 auto-renewing certificates. Signature Customers can renew up to 50 auto-renewing certificates.

### Log Users Views of Personal Identification Information

> Configure Business Manager to make security log entries when a user views a shopper’s personal identification information (PII) in the Order module. When a user clicks a button, tab or field that displays a shopper’s PII, the security log updates with details about when, who, and what is viewed. For example, When the user views an order, the security log is updated with a timestamp, the user, and the order number viewed.

Protecting your customer data is vital in eCommerce (and any industry). With this new option, you can have greater visibility into who looks at personal data and do audits on these logs.

Customer Support It is not possible to activate this feature manually, a ticket with Support has to be logged to activate it.

### Code Profiler Wait Times Removed from CSV Report

> Code profiler wait times, which include Wait Time Own and Wait Time Total, are no longer measured. These values have been removed from the B2C Commerce CSV report. The CSV report remains backward compatible.

Some metrics are disappearing from the [code profiler](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/site_performance/b2c_using_code_profiler.html), a tool available in the Business Manager to check the performance of your custom code:

-   total\_wait\_time
-   total\_wait\_time\_avg
-   own\_wait\_time
-   own\_wait\_time\_avg



CSV Export The CSV report generated from system job sfcc-export-code-profiler-reports and the CSV report accessible from the Code Profiler Business Manager module maintain these columns, filled with zeros as data.

### Export Attributes of Type Number as Decimal Representation

> To support commerce business use cases, custom attributes of type Number are now exported as their decimal representation (xsd:decimal) instead of as a String representation (xsd:string). If you want to continue using the xsd:string representation, you can change the default in Business Manager to the legacy xsd:string formatting.

A relatively "small" change in this release is: Now the [XML](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/xsd/Schemas.html) files will represent the type they are exported as - ensuring no possible misinterpretation moving from String to Number.

## Business Manager

### Manage Orders Rejected by Salesforce Order Management

> You can now exclude, cancel, and resubmit orders rejected by Salesforce Order Management in the Business Manager Orders page.

[![Salesforce Order Management 23.5 Release](/media/2023/salesfore-order-management-manage-rejected-orders-87ae4bdc6c.png)](/media/2023/salesfore-order-management-manage-rejected-orders-87ae4bdc6c.png)

The screenshot displays three options for managing excluded orders in Salesforce Order Management.

Firstly, you can resubmit an unintentionally excluded order with one click by selecting option "1".

Option "2" enables the manual exclusion of orders with a failed status from being resubmitted to Salesforce Order Management, providing greater control over the order fulfilment process.

Lastly, option "3" allows for the cancellation of excluded orders, moving the ordered product back to inventory and making it available for other reservations.

These options finally provide flexibility and more control over orders synced with Order Management, a welcome change!

### Improve Search Results with Autocorrection

> Enable search to process configured synonyms when autocorrecting or autocompleting a user’s search phrase. If the original phrase matches the synonym entries, search includes the synonyms. When search autocorrects a phrase, it considers both the original phrase and the autocorrected version. Previously, if a phrase was autocorrected or autocompleted, synonym group matching on the initial search phrase wasn’t considered.

It's fantastic to hear that search is finally receiving much-needed attention in this release! This feature will undoubtedly enhance the search experience for users, allowing them to discover what they're looking for more quickly and easily.

## OCAPI & SCAPI

### Shopper Baskets and Trusted-Agent-On-Behalf-only endpoints

New endpoints are now supported:

-   PUT /baskets/{basketId}/agent
-   PUT /baskets/{basketId}/storefront
-   POST baskets/{basketId}/price-adjustments
-   DELETE baskets/{basketId}/price-adjustments/{priceAdjustmentId}
-   PATCH baskets/{basketId}/price-adjustments/{priceAdjustmentId}

### New Channel Types supported for Baskets & Orders

[![Channel-type list showing the new basket and order channels added in the 23.5 release.](/media/2023/scapi-channel-types-2023-2795e88145.jpg)](/media/2023/scapi-channel-types-2023-2795e88145.jpg)

The list of channels before the update

The following new channel types are supported by Baskets and Orders apps: TikTok, SnapChat, Google, WhatsApp, and YouTube.

### SLAS Updates

[SLAS](/how-to-set-up-slas-for-the-composable-storefront/) received quite a bit of love in the past month:

-   SLAS service supports SMS notifications for passwordless login.
-   BOT Mitigation improvements: Reduced the time window from 2 seconds to 1 second for the same user login that returns Error 409.
-   Fixed the issue around deletion of a user with different loginID and IDP, when the tenant and customerID remains the same.
-   SLAS Tenant creation improvements to include region validation.
-   SLAS Service Introducing Rate Limit of 25 TPM per tenant for JWKs and well-known endpoints.
-   SLAS service redirect to customer’s registered callback URL on IDP errors and return Error 412 for refresh token calls.
-   Security library updates.

## New Ideas

It has been a great month of ideas with some noteworthy suggestions from the community!

-   [Add trend chart for Views & Clicks to Commerce Einstein Report](https://ideas.salesforce.com/s/idea/a0B8W00000NwwPuUAJ/add-trend-chart-for-views-clicks-to-commerce-einstein-report)
-   [Page Designer: Ability to target content display to multiple customer groups](https://ideas.salesforce.com/s/idea/a0B8W00000O20kSUAR/page-designer-ability-to-target-content-display-to-multiple-customer-groups)
-   [Checkout Address Updates](https://ideas.salesforce.com/s/idea/a0B8W00000O5s9lUAB/checkout-address-updates)
-   [Product Readiness for B2C Commerce](https://ideas.salesforce.com/s/idea/a0B8W00000O6UiMUAV/product-readiness-for-b2c-commerce)
-   [API First B2C Commerce](https://ideas.salesforce.com/s/idea/a0B8W00000O6VItUAN/api-first-b2c-commerce)
-   [Trial sandboxes for B2C Commerce](https://ideas.salesforce.com/s/idea/a0B8W00000O6WeCUAV/trial-sandboxes-for-b2c-commerce)
-   [Add the ability to track and view product set performance](https://ideas.salesforce.com/s/idea/a0B8W00000O7VCVUA3/add-the-ability-to-track-and-view-product-set-performance)
-   [Voice To Text Search](https://ideas.salesforce.com/s/idea/a0B8W00000O7ouVUAR/voice-to-text-search)
-   [Toolkit for the compassable storefront](https://ideas.salesforce.com/s/idea/a0B8W00000NuNGUUA3/toolkit-for-the-compassable-storefront)

## Updated Cartridges & Tools

### Composable Local Hybrid Dev Server

-   [https://github.com/SalesforceCommerceCloud/composable-hybrid-dev-server](https://github.com/SalesforceCommerceCloud/composable-hybrid-dev-server)

> This repo contains sample Node.js app that can be used to develop and test hybrid deployment shopper flows across PWA Kit and SFRA/SiteGenesis.

It is no secret that hybrid deployment projects will be happening more and more. Having these supporting projects to make development easier are a welcome addition!

### plugin\_slas (v6.4.2)

-   [https://github.com/SalesforceCommerceCloud/plugin\_slas](https://github.com/SalesforceCommerceCloud/plugin_slas)

> The plugin\_slas cartridge extends authentication for guest users and registered shoppers using the Shopper Login and API Access Service (SLAS).

-   Add changes to support SiteGenesis [#103](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/103)
-   Exclude page designer controllers from triggering SLAS login flows [#104](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/104)
-   Fix bug in logic to determine origin of request to SLAS [#104](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/104)
-   Fix bug in uploadCartridge npm script [#104](https://github.com/SalesforceCommerceCloud/plugin_slas/pull/104)

### b2c-japan-package (v1.7.0)

-   [https://github.com/SalesforceCommerceCloud/b2c-japan-package](https://github.com/SalesforceCommerceCloud/b2c-japan-package)

> This is a demo repository of commonly used business solutions in Japan.This cartridge enhances the SFRA(app\_storefront\_base).

-   Release plugin\_groputax\_ex
-   Release plugin\_groputax\_ex\_sg

 I am assuming it is supposed to say "grouptax". A feature which has been added in a [recent update](/salesforce-b2c-commerce-cloud-23-2/).

### Salesforce B2C Commerce / Customer 360 Platform Integration (v3.0.0)

-   [https://github.com/SalesforceCommerceCloud/b2c-crm-sync](https://github.com/SalesforceCommerceCloud/b2c-crm-sync)

> Salesforce B2C Commerce / CRM Sync is an enablement solution designed by Salesforce Architects to teach Salesforce's B2C Customer Data Strategy for multi-cloud use-cases. The solution demonstrates a contemporary approach to the integration between Salesforce B2C Commerce and the Cloud products running on the Salesforce Customer 360 Platform.

Modify the Account Manager Auth Token token type from UUID to JWT by [@jbachelet](https://github.com/jbachelet) in [#199](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/pull/199)

This a significant update, as [UUID tokens are being deprecated and will stop working shortly](/the-deprecation-of-the-uuid-token-for-api-clients/)!
