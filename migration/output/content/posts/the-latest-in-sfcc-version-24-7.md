---
title: 'The Latest in B2C Commerce: Version 24.7 Focuses on Speed and Security'
description: >-
  In some places there is too much rain, in other places it is too hot.The
  weather might not bee consistent, but the release schedule of SFCC sure is!
  Thi...
date: '2024-07-08T07:51:29.000Z'
lastmod: '2024-07-08T07:53:46.000Z'
url: /the-latest-in-sfcc-version-24-7/
draft: false
heroImage: /media/2024/salesforce-b2c-commerce-cloud-24-7-release-notes-7b5bf8e6a0.jpg
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - release notes
  - sfcc
  - technical
author: Thomas Theunen
---
In some places there is too much rain, in other places it is too hot.The weather might not bee consistent, but the release schedule of SFCC sure is! This time we look at the [July 2024 (24.7) release](https://help.salesforce.com/s/articleView?id=sf.b2c_rn_24_7_release.htm&type=5)!

Are you interested in last month’s release notes? [Click here](/what-is-new-in-sfcc-24-6/)!

## Migrate to eCDN WAFv2

> Salesforce B2C Commerce now uses eCDN with WAFv2. WAFv2 brings advanced security features to safeguard all your zones, both existing and new. You can migrate your existing customer zones from WAFv1 to WAFv2 as a self-service option. You can configure eCDN WAFv2 settings directly through the Business Manager UI or CDN Zones API for new zones. In addition, eCDN with WAFv2 integrates ruleset enhancements that improve firewall security and reduce false positives, improving threat detection accuracy and minimizing disruptions to normal operations.

I may be a recording on repeat, but security for any online platform is a must. With the new WAFV2, we get:

-   Automated OWASP ruleset updates (based on the official code repository)
-   eCDN-managed rules managed by the Salesforce Security Team
-   Automated exposed credential checks



How do you migrate? Click the "**Start WAFv2 Migration**" button in the Business Manager eCDN configuration screen, and get going!

## Platform

### Search Response Times Are Quicker

> B2C Commerce has improved the performance of the common category lookup in storefront search and search refinement. Based on internal testing, the search engine calculates search refinements two times faster. With improved search, your users experience faster storefront response times, providing a smoother browsing experience.

I am excited to see that the built-in search engine is receiving a lot of attention this year. It's not only adding new features but also enhancing existing ones!

Improved performance is always a great addition to new releases, especially if we don't have to do anything extra!

### Get Enhanced Security with TLS v1.3

> The B2C Commerce service framework now supports TLS v1.3 for outgoing HTTP calls made from the platform. TLS v1.3 provides enhanced security features that don’t require complex configuration. It offers modern encryption standards that protect against known vulnerabilities and supports secure integration with third-party partners. If you encounter connectivity issues while using TLS v1.3, contact Support for assistance.

And yet another platform update, this time for security, where we do not have to modify anything!

Verify integrations With any update such as this, verify all third-party integrations before this release hits your production instance!

### Implement Enhanced Security Controls in Commerce Cloud

> Commerce Cloud is implementing a new security measure that blocks traffic to staging instances that doesn’t originate from Commerce Cloud eCDN from accessing the hyphenated demandware.net hostname. This change rejects all calls using ‌hyphenated hostnames, such as staging-, to access the Open Commerce API (OCAPI) or Storefront.
>
> The introduction of Origin Shielding for staging impacts Commerce Cloud customers who currently have implementations that involve direct calls to POD IPs.
>
> You can create a proxy zone on Staging instances through the Business Manager and configure a custom hostname with an automatically renewing eCDN Managed certificate for added protection.

Verify integrations With any update such as this, verify all third-party integrations before this release hits your production instance!

**Step 1: Effective Date**
When: The new security measure will be effective from October 7, 2024.

**Step 2: Impact Assessment**
This change will impact customers who directly call POD IPs in their Commerce Cloud implementations.

**Step 3: Preparing for the Change**
How to prepare:

1.  _Evaluate_: Check your current implementations for any calls made to OCAPI or Storefront that use direct POD IPs, dot-form hostnames, or hyphenated hostnames like staging.xxx.demandware.net or staging-xxx.demandware.net.


2.  _Update_: Modify any services or applications to use the vanity hostname instead, ensuring that traffic routes through eCDN.


3.  _Create a Proxy Zone_: Use the Business Manager to set up a proxy zone in the Staging instances. Then, configure a custom hostname with an eCDN-managed certificate that renews automatically for extra security.



**Step 4: Seeking Assistance**
If you need more information or help with this transition, please contact your Customer Service Manager (CSM).

## OCAPI & SCAPI

### Shopper Context now supports Geolocation

Site ID The siteId is required from now on!

With this new release, we have a new addition to the shopper context: [Geolocation](https://developer.salesforce.com/docs/commerce/commerce-api/guide/shopper-context-geolocation.html)! While geolocation is not 100% trustworthy in some use cases (VPN, ...), it is a handy tool to make an educated guess on the physical location of a customer.

### New endpoint: External Sitemap Upload

> This API uploads a custom sitemap and triggers the sitemap generation process.

Previously, integrating third-party sitemaps into Commerce Cloud was possible, though it required manual work, a job, or some custom coding.

With this [new API](https://developer.salesforce.com/docs/commerce/commerce-api/references/seo?meta=uploadCustomSitemapAndTriggerSitemapGeneration), external systems can push a custom XML to Commerce Cloud and start the updating process!

### Collect Request Details

> With B2C Commerce version 24.7, you can generate a JSON document that contains comprehensive information about the request. This JSON document is beneficial for troubleshooting, because it provides detailed information that is not included with standard logging, such as request authorization, hook execution, request query parameters, headers, and body.

Another excellent debugging tool has been added to the list, allowing you to investigate what is happening behind the scenes.

Within these details, there are some interesting metrics:

-   Hook execution time
-   Authentication information
-   Scopes used
-   Request runtime in MS
-   ...



Want to find out more? [Go here](https://developer.salesforce.com/docs/commerce/commerce-api/guide/collect-request-details.html).

### Server-Side Web-Tier Caching

> Server-Side Web-Tier Caching is automatically turned on for all instances that don't use /shopper-product/products and /shopper-search API endpoints on their Production instances.

As with anything happening "automatically", please verify on your production instances everything you have implemented is still working as expected:

[https://developer.salesforce.com/docs/commerce/commerce-api/guide/server-side-web-tier-caching.html](https://developer.salesforce.com/docs/commerce/commerce-api/guide/server-side-web-tier-caching.html)

### SCAPI updates also on the main "release notes"

Finally, the SCAPI release information has also made it to the "main" release notes site! But if I can nitpick a bit, the formatting still requires some work.

[https://help.salesforce.com/s/articleView?id=sf.b2c\_com\_api\_june\_2024.htm&type=5](https://help.salesforce.com/s/articleView?id=sf.b2c_com_api_june_2024.htm&type=5)

## Development

### Import and Export Dynamic Categorization Rules

> n Business Manager, easily import and export dynamic categorization rules, including the excluded product list. The Catalogs Import & Export feature now updates the catalog.xsd schema with detailed information on categorization rules and excluded products within the catalog tag structure. Previously, you couldn’t import and export the dynamic categorization rules.

Before this update, we could not easily back up or import the categorisation rules from an external system, making them more challenging to implement in some cases (or even a blocker).

This update can back up these rules and allow external control. This will be extremely helpful in preserving the hard work of our merchandisers.

### Import External Coupon Redemptions

> You can now update the status of a coupon redeemed outside of B2C Commerce using the new Coupon Redemption API (/organizations/{organizationId}/coupons/actions/redeem). To identify the source of redemption for an external coupon, use a custom reference ID or any custom string. You can also add an optional email address to the redemption for further tracking and communication. To update multiple coupon redemptions at one time, use the new ImportCouponCodeRedemptionsStep job step. This bulk import, which works only in merge mode, streamlines the process of managing multiple redemptions at scale.

This is a big update for any business working in multiple online and offline channels. With this update, we can  [batch import](https://help.salesforce.com/s/articleView?id=cc.b2c_coupons_and_coupon_code_object_import_export.htm&type=5) or have a third-party system call the brand new "[Coupon Redemption API](https://developer.salesforce.com/docs/commerce/commerce-api/references/coupons?meta=redeemCoupon&q=redemption)".

## PWA Kit v3.6.0

-   [https://github.com/SalesforceCommerceCloud/pwa-kit/releases/tag/v3.6.0](https://github.com/SalesforceCommerceCloud/pwa-kit/releases/tag/v3.6.0)

A big release focusing on many different areas important to any project: Support for new APIs, performance, and accessibility!

#### Improvements

-   **Product Tile Revamp**: Displays different pricing for various products on product tiles and PDP, and shows pricing on cart, checkout, and wishlist pages.
-   **Promotional Callouts**: Promotional messages are now visible on product list and detail pages.
-   **Selectable Swatch Groups**: Attributes like color can now be selected via swatch groups.
-   **Badges and Lazy Basket Creation**: New badges are displayed, and baskets are created lazily to improve performance.
-   **Cache Control**: Implements the `stale-while-revalidate` directive for better caching.

#### Accessibility Enhancements

-   Added live region support to components.
-   Replaced `<p>` tags with heading tags on the cart page.
-   Improved alt text for product tile images.
-   Added `aria-hidden` to the search icon and explicit headers to the cart modal.
-   Autocomplete is now available for text input fields, and error messages include an error icon.

#### Performance Improvements

-   Navigation components now load their categories lazy, enhancing performance.

#### Bug Fixes

-   Fixed SEO component to correctly set the keywords meta tag.
-   Resolved issues with the RecommendedProducts component toggling the favourite icon.

## Bugfixes

[Many ticket](https://issues.salesforce.com/#sortCriteria=%40sflast_modified_date_external__c%20descending&f[sfcategoryfull]=Commerce%7CB2C%20Commerce)s were moved to "Solution in development" or "Solution Scheduled".

## Updated Cartridges & Tools

### composable-hybrid-sitegenesis-poc (v2.2.0)

-   [https://github.com/SalesforceCommerceCloud/composable-hybrid-sitegenesis-poc](https://github.com/SalesforceCommerceCloud/composable-hybrid-sitegenesis-poc)

> This repository demonstrates a proof of concept (POC) for implementing SLAS and phased rollouts on SiteGenesis. The examples given use the latest version of SiteGenesis, using JavaScript controllers, but the same approach could be used on pipeline versions of SiteGenesis.

-   upgrade to plugin\_slas 7.3.0 by [@sandragolden](https://github.com/sandragolden) in [#16](https://github.com/SalesforceCommerceCloud/composable-hybrid-sitegenesis-poc/pull/16)
