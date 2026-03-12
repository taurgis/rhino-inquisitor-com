---
title: 'Salesforce B2C Commerce: The 22.6 Release'
description: >-
  Are you interested in what is new in each Salesforce B2C Commerce Cloud
  release? Then this is the article for you! Let us look at 22.6
date: '2022-05-16T13:52:22.000Z'
lastmod: '2022-07-23T21:54:27.000Z'
url: /salesforce-b2c-commerce-the-22-6-release/
draft: false
heroImage: /media/2022/22-6-release-einstein-dashboards-722f4cbace.png
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - sfcc
  - technical
author: Thomas Theunen
---
Again, here we are with the latest [release notes](/category/release-notes/) of Salesforce B2C Commerce Cloud; time flies by fast, doesn't it? Let us go over the [June 2022 (22.6) release](https://help.salesforce.com/s/articleView?id=sf.rn_b2c_rn_22_6_release.htm&type=5)!

## Einstein Dashboards

In this release, Einstein is getting a bit of love with better insights into the performance of your recommenders!

### Drill down to a single recommender

[![Einstein dashboard view for drilling into a single recommender.](/media/2022/22-6-release-einstein-dashboards-722f4cbace.png)](/media/2022/22-6-release-einstein-dashboards-722f4cbace.png)

It will now be possible to drill down to a single recommender in the dashboards to see how they perform over a selected period of time.

This will give merchants a better understanding of performance trends.

These metrics include:

- Click-through Rate (CTR)
- Add to Cart
- Cart Conversion Rate
- Attributed Revenue.

### View top purchased and top viewed products

[![Einstein dashboard showing product-level recommendation statistics.](/media/2022/einstein-dashoards-addtocarts-sfcc-9c9a2f3595.png)](/media/2022/einstein-dashoards-addtocarts-sfcc-9c9a2f3595.png)

With this addition to these dashboards, you will be able to see more information about the performance of a recommender.

Reports now show how specific products perform, by being recommended in a particular recommender.

## PWA Kit v1.5.2

[A minor release](https://github.com/SalesforceCommerceCloud/pwa-kit/releases/tag/v1.5.2) has been made for the PWA Kit, containing a few bugfixes:

- Fix invalid refresh token by [@kevinxh](https://github.com/kevinxh) in [#527](https://github.com/SalesforceCommerceCloud/pwa-kit/pull/527)
- Webpack config: no longer assumes that `config` dir exists by [@vmarta](https://github.com/vmarta) in [#522](https://github.com/SalesforceCommerceCloud/pwa-kit/pull/522)
- Fix minor typos in readme and jsdoc by [@alexvuong](https://github.com/alexvuong) in [#531](https://github.com/SalesforceCommerceCloud/pwa-kit/pull/531)

## OCAPI

### Access Key Management

[![User Data OCAPI endpoints for access key management.](/media/2022/access-key-management-ocapi-726096138d.png)](/media/2022/access-key-management-ocapi-726096138d.png)

New endpoints have been made available to manage access keys from an external application. Although this addition is mainly for in-store agents, according to the documentation, the addition will sound like music to the ears of people in charge of DevOps and CI solutions.

To access these APIs, ensure the user has the "[Manage\_Users\_Access\_Key](https://documentation.b2c.commercecloud.salesforce.com/DOC3/topic/com.demandware.dochelp/ReleaseNotes/22_6/OCAPI_acess_keys_data_API_mc.html)" permission.

## Business Manager

### EPS added to Salesforce Payments

[![EPS payment method logo for Austrian bank transfers.](/media/2022/eps-logo-austria-8764a70156.png)](/media/2022/eps-logo-austria-8764a70156.png)

EPS is an Austria-based payment method supported by all Austrian banks. You can add the EPS option to your storefront in Business Manager Payment Settings.

### Avoid Chargebacks with Salesforce Payments

Use a site-specific descriptor to help shoppers identify the source of an account charge on their credit card statements to reduce payment disputes and chargeback requests. You set the customer statement descriptor in [Business Manager Payment Settings](https://documentation.b2c.commercecloud.salesforce.com/DOC3/topic/com.demandware.dochelp/content/b2c_commerce/topics/salesforce_payments/b2c_payment_statement_descriptor.html?resultof=%22%64%65%73%63%72%69%70%74%6f%72%22%20). The setting overrides the value specified in your Stripe merchant account.

## Development

### Log Center

[![Log Center filter for storefront implementation errors.](/media/2022/troubleshoot-storefront-errors-logcenter-66dfbbe9b6.png)](/media/2022/troubleshoot-storefront-errors-logcenter-66dfbbe9b6.png)

Filter and find storefront implementation errors, such as broken includes, significant header errors, and large request errors with a new filter option below the "Service Type."

**How:** To find storefront implementation errors with Log Center, set the Service Type filter to "jwa" (see screenshot above).

### Bugfixes

#### Unnecessary Product Update Index Task is performed after the Full Index Rebuild

An unnecessary Product Update Index Task was performed after the Full Index Rebuild, which publishes a new index even if 0 documents have changed. This happened only if Incremental Index was enabled, even if NO product change had been performed after the Full Index Rebuild. Now, after a full search index update in done and no documents have changed, the platform is not doing an Incremental Index afterward.

#### Rule Based Product Categorization - UI Changes to Include SiteContext when Saving/Fetching Rules

When creating/editing a ruleset, a dropdown is now provided (similar to the Locale dropdown). The dropdown will be auto-selected to "default" and include all valid active Sites for that instance. When the merchandiser saves the ruleset, the API to PUT/POST rules will consist of a new field to persist the SiteContext selected.

#### Dynamic Categorization - Value selection for String attributes with the "is one of" selector isn't working

- [Issue](https://trailblazer.salesforce.com/issues_view?id=a1p4V0000012YmiQAE&title=dynamic-categorization-value-selection-for-string-attributes-with-the-is-one-of-selector-isn-t-working)

> Value selection for String attributes with the "is one of" selector isn't working. When the "is one of" selector is chosen, the user should be able to select multiple values. For String attributes, this isn't possible because you only get a normal input field for entering the value, with no possibility of adding various values. Expected Products should be shown in the preview tab based on the categorization rule. Actual Products are not categorized when multiple comma-separated values are used.

Although the status has recently changed to "fixed," no version/release was linked. So it might be in the next or this release.
