---
title: AI (Einstein) in Salesforce B2C Commerce Cloud
description: >-
  Salesforce B2C Commerce Cloud has an AI that can power different areas of the
  site. But what is it, why use it, and what can it do for me?
date: '2022-09-26T13:42:24.000Z'
lastmod: '2026-07-04T10:39:24.000Z'
url: /ai-einstein-in-salesforce-b2c-commerce-cloud/
draft: false
heroImage: artificial-intelligence-fc68314ce7.jpg
categories:
  - Salesforce Commerce Cloud
tags:
  - ai
  - einstein
  - headless
  - sfcc
author: Thomas Theunen
takeaways:
  - "Explains what Einstein is in SFCC and how it differs from other Salesforce AI products"
  - "Covers core Einstein capabilities like recommendations, search, insights, and predictive sort"
  - "Highlights privacy, shared-data, and headless API considerations before adoption"
---
When you are first introduced to Salesforce B2C Commerce Cloud, one of the selling features that will increase conversion and customer satisfaction is [Einstein](https://www.salesforce.com/products/commerce-cloud/commerce-cloud-einstein/).

Einstein is the "built-in" AI engine that powers product recommendations and other tools to guide a potential buyer. But what are these features, and will they increase my AOV (Average Order Value) by 26% as advertised?

## History

Even though the product is called Einstein right now, it wasn't always the case. Before Salesforce acquired Demandware, it was called CQuotient ([which was acquired by Demandware in 2014](https://www.businesswire.com/news/home/20141014005186/en/Demandware-Acquires-CQuotient)).

You will still notice the reference in the URL when accessing the [Administrative Portal](https://configurator.cquotient.com).

{{< img-caption src="cquotient-demandware-history-v2-942e794c7b.png" alt="Legacy CQuotient administration screen before the Einstein rebrand." caption="The old CQuotient branding shows how deeply Einstein is rooted in earlier tooling." >}}

This history lesson also clarifies that this "Einstein" is unrelated to all of the other "Einstein" products [in the Salesforce lineup](https://www.salesforce.com/products/einstein/overview/). Though probably some connections are made behind the scenes, this is - like with different features - a black box.

## Separate Product

As CQuotient was an acquired AI product, it has a separate management console which I mentioned in the previous section.

There are some screens inside the Business Manager, but they mainly push or pull data out of CQuotient:

- [Slot Configuration](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_configuring_slots_for_predictive_recommendations.htm)
- Page Designer components
- [Einstein Status Dashboard](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_configure_einstein_deployment.htm) (Configuration & Monitoring)

## Shared Data Model

For an AI (Artificial Intelligence) to work, it needs to be fed with **quality** data. And the more data, the better it can give the correct responses to given questions.

For this sharing of data, consent needs to be given in the Business Manager at:

Administration _>_ Global Preferences _>_ Einstein Search Dictionaries Opt-In

{{< img-caption src="einstein-cquotient-shared-database-6ab8c2ae5e.jpg" alt="Einstein Search Dictionaries Opt-In setting used to enable shared-data consent." caption="Shared data only works when the opt-in setting is enabled for Einstein features." >}}

## Black Box

Before we continue with this story about Einstein, one thing to understand is that the general idea is to give merchandisers easy access to AI with point-and-click tools without having to worry about any of the technicalities behind it.

This is great on one side. But on the other, it means that Salesforce controls 90% of how the AI does its thing.

And we do not get any insights into how it does it unless you work at Salesforce on this particular product.

## Privacy for the consumer

For the AI (Einstein) to learn, I already mention it needs to collect quality data. And that data is extracted from the visitors of the SFCC sites:

- Categories navigated to
- Products viewed
- Products added to the basket
- Products ordered
- ...

And for this to work, the consumer needs to be tracked. Some visitors will want to block these behaviors by looking at GDPR, CCPA, and [Do Not Track](https://allaboutdnt.com/) options.

> [!NOTE]
> **Documentation:** The necessary tools to comply with this are documented in the [Infocenter](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_einstein_set_privacy_preferences.htm).

## Features

### Product Recommendations

- [Trailhead Module](https://trailhead.salesforce.com/content/learn/modules/cc-einstein-product-recommendations)

{{< img-caption src="sfcc-einstein-product-recommendations-75e024ae7c.jpg" alt="Einstein product recommendations rendered in a storefront experience." caption="Product recommendations are the most visible Einstein feature for storefront merchandising." >}}

SFCC: Einstein Product Recommendations in the PWA Kit

Product recommendations are among the more prominent features available in the Einstein lineup. This feature aims to promote relevant products to an individual shopper based on their purchasing history and current behavior on the site.

#### Complete the Set

One possible product recommendation type is "Complete the Set," which recommends products to the shoppers to complete an outfit or to buy accessories that match that specific product.

### Commerce Insights

- [Trailhead Module](https://trailhead.salesforce.com/content/learn/modules/cc-einstein-plan-and-implement/cc-ai-work-better)

{{< img-caption src="commerce-insights-report-c598e1214b.jpg" alt="Commerce Insights report showing shopper and basket trend data." caption="Commerce Insights turns Einstein data into trend reporting teams can actually act on." >}}

Einstein: Commerce Insights Report

This feature in the Einstein dashboard allows you to view statistical data about products often bought together in the same basket based on the shopper, product, and order data.

So, in short: "An analytics tool to view shopper behavior on a product-by-product basis."

### Search Dictionaries

- [Trailhead Module](https://trailhead.salesforce.com/content/learn/modules/cc-einstein-smarter-search/cc-einstein-search-recommendations)

{{< img-caption src="einstein-search-dictionaries-suggestion-phrases-467a548c85.jpg" alt="Einstein search dictionaries suggesting phrases and synonym refinements." caption="Search Dictionaries let merchandisers shape synonyms and suggestions instead of leaving them fully automatic." >}}

Not a lot to tell about this feature. It looks at your current configuration like synonyms and suggestion phrases... and suggests configuration items that could improve search results for the shoppers.

The important thing about this feature is that it only makes suggestions. You still need to accept or reject the recommendations. So to make optimal use of this feature, you should check it often and review the proposals.

### Predictive Sort

- [Trailhead Module](https://trailhead.salesforce.com/content/learn/modules/cc-einstein-smarter-search/cc-einstein-predictive-sort)

{{< img-caption src="sfcc-category-page-3297251518.jpg" alt="Category page showing products reordered by predictive sort." caption="Predictive Sort changes category ranking based on shopper behavior, not static merchandising alone." >}}

Salesforce B2C Commerce Cloud Category Page

The predictive sort option allows Einstein to optimize the "browsing" experience on the category and search pages.

By looking at shopper behavior, it will continuously re-order the products in the lister pages so that the products they are most interested in are moved to the top of the results.

There are some things to keep in mind when using this feature:

1. Do not rely entirely on Einstein's Predictive Sort. Add other attributes into the mix. An example on the Trailhead module is like this: 25% revenue, 40% text relevance, and 35% "Predictive Sort"

1. Caching must be disabled on the Categories and Search Results pages (Search-Show for the developers amongst the readers, the tiles can still be cached). So expect a performance hit on these pages.

A/B Testing When working with a feature that allows fine-grained configuration like this, it is a good idea to experiment with the sorting weight percentages.

And do not forget to A/B test the comparison of Predictive Sort against your regular sorting rules to verify that it is making the difference you were expecting and not lowering the conversion rate.

### Search Recommendations

- [Trailhead Module](https://trailhead.salesforce.com/content/learn/modules/cc-einstein-smarter-search/cc-einstein-search-recommendations)

{{< img-caption src="sfcc-search-suggestions-d172038c0b.jpg" alt="Search box suggestions generated by Einstein as the shopper types." caption="Search Recommendations start influencing discovery before a shopper even submits a query." >}}

Einstein: Search Suggestions

Do you ever feel like search suggestions didn't understand the message you were trying to convey? Einstein is here to help shoppers find the correct products by already aiding at the start of the search.

It will analyze your entered search term, look at information like current location and device type, and try to auto-complete the search term for you.

> For example, if the shopper types “swe” and they haven’t already searched for sweater or sweat pants, Einstein looks for phrases that start with swe for the device and location. If there’s enough data at that level, Einstein returns a phrase. If there isn’t enough data, Einstein searches across a larger data pool and devices until it finds a result.
> Trailhead

## Other features

### Feed Einstein data from other channels

If you have other channels besides Salesforce B2C Commerce Cloud that can be used to place orders, this data can be fed into Einstein in the form of a [gzipped TSV file](send-ext-order-feeds-to-einstein.pdf).

### Einstein Profile Connector

[Using a Headless API](https://developer.salesforce.com/docs/commerce/einstein-api/guide/einstein-profile-connector-overview.html), it is possible to feed additional information about customers to Einstein, such as:

- Gender
- Favorite colors
- Favorite brands

And use this information to give more fine-grained recommendations to the shoppers.

### Headless API

[Einstein has headless APIs](https://developer.salesforce.com/docs/commerce/einstein-api/guide/einstein-recommendations-overview.html) (besides the one already mentioned above) to send shopper activity and fetch recommendations. An excellent example of a use case is the PWA Kit, which already fully uses these APIs.

Other use-cases for these APIs could be:

- Recommendations in newsletters or other types of mailings (transactional)
- Mobile Application
- Customer Service

## Learn more

Want to learn more about Einstein? Salesforce has provided a learning path dedicated to Einstein. And it is [publicly available](https://einstein-b2c-exp-salesforce.herokuapp.com/)!
