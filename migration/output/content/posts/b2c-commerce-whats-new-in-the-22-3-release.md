---
title: 'B2C Commerce: What''s new in the 22.3 release'
description: >-
  In this post, we will be looking at the release notes of Salesforce B2C
  Commerce Cloud for March 2022.
date: '2022-03-08T07:42:23.000Z'
lastmod: '2022-07-23T21:43:46.000Z'
url: /b2c-commerce-whats-new-in-the-22-3-release/
draft: false
heroImage: /media/2022/lightning-man-e1646654739934-c9812efc2b.jpg
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - cloudflare
  - pagedesigner
  - sfcc
author: Thomas Theunen
---
In this post, we will be looking at the release notes of Salesforce B2C Commerce Cloud for March 2022. Let us dig deeper into any new and exciting features added to the platform.

Check out the original release notes [for March 2022](https://help.salesforce.com/s/articleView?id=rn_b2c_rn_22_3_release.htm&type=5&language=en_US).

## Lightning UX

![SLDS showcase with example interface components.](/media/2022/slds-ba5571b0d8.png)

As the prophecies have foretold, it would only be a matter of time before [Lightning Man](https://uk.news.yahoo.com/salesforce-lesser-known-cofounder-got-235259945.html?guccounter=1&guce_referrer=aHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS8&guce_referrer_sig=AQAAAEMzlHPYg71G3BXTV_zJ9VshBEckh_EEHlmqkdH1OxmCNHV9yKdhBatLjGJGpb1G3rjRqzyqZpwlaajHcyv1UhBB9Db0zi7jHduoV27cQlunovcuvalnh1sABTPyFDtMcKR1nMdtJO0kBa_TfOQJXAj1nt1N9sjXs5VJ-ar5A32I) made its way into the global interface of Salesforce B2C Commerce Cloud.

If we look at any of the new features added over the past years, it should come as no surprise:

-   Page Meta Tag Rules
-   Jobs
-   Page Designer
-   Reports & Dashboards
-   Storefront Toolkit
-   ...

 These features already used the [SLDS](https://www.lightningdesignsystem.com/) (Salesforce Lightning Design System). Now slowly, the global items are getting a restyling as well. As this is a cosmetic change, Salesforce added no actual new functionality. From a multi-cloud perspective, having a generic style system across all platforms makes sense to give a "familiar" feel. But I can understand not everyone is a fan of this change. What is your thought about the redesign? Leave a comment!


## Page Shield

As trust is the number one value at Salesforce, security is one of the "shields" that form that trust.

Page Shield is part of the [eCDN](https://www.salesforce.com/products/commerce-cloud/resources/ecdn-for-commerce-cloud-digital-datasheet/), a Salesforce-managed Cloudflare to which we have "minimal" access.

[Page Shield](https://www.cloudflare.com/page-shield/) is one of the Cloudflare features. But since we can not fully control that Cloudflare instance, we depend on the Salesforce team to activate/purchase these features.

Between the 1st of march and the 14th of march, Page Shield will be enabled for all accounts and will start protecting against Magecart type attacks.

### But what is Magecart?

[Magecart](https://www.riskiq.com/what-is-magecart/) is a type of attack that compromises third-party JavaScript dependencies to gain control over the code served to the browser. Taking control of the code allows sensitive data to be stolen (like credit card info).

![A diagram explaining the Magecart attack. It shows a hacker taking over a dependency of a third party script to skim credit card data.](/media/2022/magecart-style-attack-flow-diagram-3x-2d5a5ce4e8.png)

### What does Page Shield do?

In simple terms: it keeps track of all of the JavaScript and its dependencies, monitoring them for changes.

The Salesforce Commerce Cloud security teams constantly monitor and review Page Shield forensic data and immediately act on and notify customers when suspicious activity is discovered.

So good news, no additional action is needed from the partner or customer side! I like those kinds of updates 😁.

## SKU Specific Page Designer Pages

A small but substantial update to page designer [Dynamic Pages](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/page_designer/b2c_develop_dynamic_page.html)!

The Dynamic Page feature allows you to use the Page Designer magic on lister and product detail pages, but only at a category level.

That has changed for Product Detail Pages, and it is now possible at the SKU level!

## Promotion Bonus Products Limit

With this new update, the Business Manager will now show an error if you assign more than 50 bonus products within a single promotion.

Until this update, you could set more than 50 bonus products in the business manager, but the documentation mentioned otherwise.

This inconsistency caused quite a bit of confusion with content managers who configured a promotion, but it was not working the way they were expecting.

![Documentation snippet showing the bonus product limit.](/media/2022/bonus-products-ed6b9e3074.png)

## Other updates

-   [Recursive Infite Copies no Longer Supported](https://help.salesforce.com/s/articleView?id=rn_b2c_web_dav_je.htm&type=5&language=en_US)
-   [Custom Caches return Immutable Objects](https://help.salesforce.com/s/articleView?id=rn_b2c_custom_cache_w10671394_je.htm&type=5&language=en_US)
