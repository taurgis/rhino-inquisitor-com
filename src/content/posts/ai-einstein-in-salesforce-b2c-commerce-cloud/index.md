---
title: AI (Einstein) in Salesforce B2C Commerce Cloud
description: >-
  Salesforce quietly folded Commerce Cloud Einstein into Agentforce Commerce.
  Here's what changed, what still works exactly as before, and how to use it.
date: '2022-09-26T13:42:24.000Z'
lastmod: '2026-07-11T15:10:00.000Z'
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
  - "Explains how Einstein fits into Salesforce's Agentforce Commerce rebrand without changing the underlying engine"
  - "Covers current Einstein features: recommendations, search, insights, and predictive sort, plus the new Agentforce agents"
  - "Corrects outdated Predictive Sort caching guidance and links privacy, shared-data, and headless API considerations"
---
Search for "Commerce Cloud Einstein" today and you will not land on the page you expect. Salesforce renamed the product around it. The AI engine is still there, still doing the same job it did in 2022, but the marketing has moved on to **Agentforce Commerce**. If you are the one explaining this to a merchandising team, closing that gap between "the feature still works" and "the name changed twice" is your job.

This is the guide for that conversation. You will learn where Einstein lives, what each feature does today, what recently got corrected in Salesforce's own documentation, and where the new generative Agentforce agents fit next to the AI you already have.

## From CQuotient to Agentforce: A Name That Keeps Moving

Einstein was not always called Einstein. Before Salesforce acquired Demandware, the underlying AI product was **CQuotient**, [acquired by Demandware in 2014](https://www.businesswire.com/news/home/20141014005186/en/Demandware-Acquires-CQuotient). Salesforce bought Demandware two years later and rebranded CQuotient as Einstein, but left the old name buried in the tooling. You will still open the [Einstein Configurator](https://configurator.cquotient.com/) at a `cquotient.com` address today.

{{< img-caption src="cquotient-demandware-history-v2-942e794c7b.png" alt="Timeline graphic: Demandware founded in 2004, CQuotient acquired in 2014, Demandware acquired by Salesforce in 2016." caption="Three acquisitions turned CQuotient into today's Einstein engine." >}}

> [!NOTE]
> **This Einstein is not that Einstein.** "Einstein" is also the umbrella name Salesforce uses across Sales Cloud, Service Cloud, and the rest of the [Einstein 1 Platform](https://www.salesforce.com/products/einstein/overview/). The Commerce Cloud version is a separate machine-learning product with its own history. Any resemblance in the name is marketing overlap; the systems underneath don't share infrastructure.

The name has moved again since 2022. Salesforce now markets the AI layer of B2C Commerce Cloud as part of **Agentforce Commerce**, its unified push to bring autonomous AI agents into every part of the commerce stack. The engine underneath is unchanged, and it is what this article is about. Salesforce's own [Ecommerce AI product page](https://www.salesforce.com/products/commerce-cloud/commerce-cloud-einstein/) still describes Einstein Recommendations and the personalisation features you have already been using; it just no longer leads with the word "Einstein."

## Where Einstein Lives

CQuotient started life as an acquired, standalone AI product, and Salesforce never merged it into the core B2C Commerce codebase. That history still shapes how you configure it today. Most of Einstein's day-to-day operation, including the business rules that decide *which* products a recommender returns, happens in the **Einstein Configurator** rather than **Business Manager** (Salesforce's day-to-day admin console for B2C Commerce). Business Manager only gives you the touchpoints that push data in or pull recommendations out:

- [Content slots](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_configuring_slots_for_predictive_recommendations.htm), which is where a merchandiser places a recommendation on a storefront page
- Page Designer components (Business Manager's drag-and-drop page-building tool) that wrap the same recommendation slots
- The [Einstein Status Dashboard](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_monitor_einstein_deployment_status.htm), where you check whether your catalog and order feeds deployed successfully and how Salesforce rates your data quality

If you are a new Site Admin, you reach the Configurator through Business Manager's App Launcher (the menu for opening connected Salesforce tools), then a support ticket to Salesforce to be added as an initial admin on the Configurator side.

## The Shared Data Model

Like any machine-learning product, Einstein is only as good as the data it sees. Catalog, orders, and clickstream behaviour all flow into it, and the more of that data Salesforce has, from your site and optionally from other merchants, the sharper its recommendations get.

That "optionally" matters. Search Dictionaries is the one Einstein feature where you can choose to contribute your data to a **shared pool across the B2C Commerce merchant community**, in exchange for better synonym and suggestion recommendations back. Nothing is shared until you opt in:

1. In Business Manager, open **Administration > Global Preferences > Einstein Search Dictionaries Opt-In**.
2. Select **I accept these terms and conditions**, and save.

Salesforce will not disclose your search dictionary data to other merchants in identifiable form. It only uses the aggregate to improve the shared feature.

One detail worth deciding on deliberately: once you accept the agreement, only Salesforce Support can revoke it. There is no self-service opt-out toggle to flip back.

{{< img-caption src="einstein-cquotient-shared-database-6ab8c2ae5e.jpg" alt="Einstein Search Dictionaries Opt-In consent screen with the terms-of-use checkbox accepted." >}}

## The Black Box You Cannot Open

Einstein is built for merchandisers, not engineers. That is the whole design premise: point-and-click configuration, no code, no visibility into the model itself. It is a genuinely good trade for a merchandising team that wants results without a data science hire.

That trade gets worse the moment something misbehaves and you want to know why. Salesforce controls nearly all of the "how": the training, the weighting, the model internals. You do not get access to any of it unless you work inside Salesforce on this specific product. When a recommendation looks wrong, your available levers are the ones exposed in the Configurator: which recommender to use, how it is weighted, and which attributes feed it. Past that, you are debugging a black box from the outside. Document that boundary for stakeholders up front: when a recommendation looks wrong, the honest answer is often "Salesforce decides this, we don't," not a fresh investigation every time it comes up.

## Respecting the Shopper: Privacy Before Personalisation

Every one of Einstein's features leans on the same raw material: what a shopper does on your site. Categories they browse, products they view, items they add to a basket, orders they complete. That data has to be collected in real time for personalisation to work at all, which means some shoppers will actively want out of it under GDPR, CCPA, or a browser's [Do Not Track](https://allaboutdnt.com/) setting.

Salesforce exposes the default tracking behaviour as a configurable Business Manager preference rather than a hardcoded default:

1. In Business Manager, open **Merchant Tools > *site* > Site Preferences > Privacy Settings**.
2. Choose whether customer tracking is **enabled** or **disabled** by default for new storefront sessions. Either way, custom code can override it per session.
3. Decide whether the shopper's clickstream, the session's log of page requests, should honour the Do Not Track status.

> [!NOTE]
> **Documentation:** The full configuration steps are documented in [Set B2C Commerce Einstein Privacy Preferences](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_einstein_set_privacy_preferences.htm). Einstein is not the only feature that reads this preference, so changing it affects more than just AI-driven personalisation.

## The Core Toolkit: What Einstein Does

Five features cover most of what a B2C Commerce site will use Einstein for. All five still work exactly as they did in 2022; only the marketing around them changed.

### Product Recommendations

Product Recommendations is the feature you have almost certainly seen on someone else's storefront, whether you recognised it or not: a rail of "you might also like" or "customers also bought" tiles, driven by a shopper's purchase history and current session behaviour rather than a merchandiser hand-picking every slot.

{{< img-caption src="sfcc-einstein-product-recommendations-75e024ae7c.jpg" alt="A 'You might also like' product recommendation carousel showing three apparel items on a storefront." caption="The 'You might also like' carousel is Product Recommendations in its simplest form." >}}

One useful variant is **Complete the Set**, which recommends items that pair with a product a shopper is already looking at: the rest of an outfit, or an accessory that matches it. [Trailhead module →](https://trailhead.salesforce.com/content/learn/modules/cc-einstein-product-recommendations)

### Commerce Insights

Commerce Insights lives entirely in Einstein's analytics layer; it doesn't touch the storefront at all. It surfaces which products get bought together in the same basket, built from shopper, product, and order data Einstein has already collected. Think of it as a product-affinity report you did not have to build yourself.

{{< img-caption src="commerce-insights-report-c598e1214b.jpg" alt="Commerce Insights basket-affinity report showing which products are frequently purchased alongside a selected jacket." caption="Selecting a key item surfaces every product bought alongside it, with basket counts and percentages." >}}

[Trailhead module →](https://trailhead.salesforce.com/content/learn/modules/cc-einstein-plan-and-implement/cc-ai-work-better)

### Search Dictionaries

Search Dictionaries looks at your existing synonym and suggestion-phrase configuration, then proposes new synonyms and suggestion phrases based on what shoppers are typing.

{{< img-caption src="einstein-search-dictionaries-suggestion-phrases-467a548c85.jpg" alt="Search Dictionaries list filtered to Suggestion Phrase entries, showing 20 of 22 items." caption="20 of 22 dictionary entries here, all filtered to Suggestion Phrases waiting on review." >}}

The feature only proposes changes. It never applies them on its own. You still accept or reject each recommendation, so the value you get out of it depends on how often someone on your team reviews the queue. [Trailhead module →](https://trailhead.salesforce.com/content/learn/modules/cc-einstein-smarter-search/cc-einstein-search-recommendations)

### Predictive Sort

Predictive Sort re-orders products on category and search results pages based on shopper behaviour, continuously pushing the products a shopper is most likely to want towards the top of the grid, instead of leaving that order fixed by static merchandising rules.

{{< img-caption src="sfcc-category-page-3297251518.jpg" alt="A B2C Commerce category page sorted by 'Best Matches' with colour and price filters in the sidebar." caption="'Best Matches' is the sorting rule Predictive Sort typically plugs into as a weighted attribute." >}}

Two things to get right before you turn this on:

1. **Do not hand Predictive Sort the entire sort order.** Salesforce's own Trailhead example blends it with other attributes instead of sorting purely on the AI's ranking: 25% revenue, 40% text relevance, and 35% Predictive Sort. Treat that as a starting point, not a fixed rule, and confirm it with an A/B test (showing two sorting variants to a split of your traffic and comparing results).
2. **Caching is handled for you, but only for the traffic that uses it.** B2C Commerce automatically disables product-grid caching for any request whose sorting rule includes the Predictive Sort attribute. You do not manually flip a setting to make this happen. That override is scoped narrowly: if you assign Predictive Sort as the default only for one category, or to a 5% A/B test slice, only that category or that 5% of traffic loses caching. Your ISML (Internet Store Markup Language) templates do need an `iscache if` guard (`<iscache if="${!searchModel.isPersonalizedSort()}"/>`) so search requests using Predictive Sort are not accidentally served a stale, cached grid.

> [!WARNING]
> **Correction from earlier guidance:** this article previously said you had to manually disable caching on category and search results pages before using Predictive Sort. That was inaccurate. The platform handles it automatically, and only for affected requests. The `iscache if` template guard above is the part that actually requires your attention.

Watch conversion rate and average order value during the test, not just click-through on the reordered tiles. A ranking that gets more clicks can still cost you revenue if it's surfacing lower-margin items first. [Trailhead module →](https://trailhead.salesforce.com/content/learn/modules/cc-einstein-smarter-search/cc-einstein-predictive-sort)

### Search Recommendations

Search Recommendations works before a shopper finishes typing. As they enter a search term, Einstein looks at the partial phrase alongside signals like device type and location, and tries to auto-complete towards a term with enough supporting data behind it.

{{< img-caption src="sfcc-search-suggestions-d172038c0b.jpg" alt="Search suggestions for the misspelled query 'pnats,' showing a 'Do you mean: pants' correction with matching products and categories." caption="Even the misspelled 'pnats' resolves to a 'Do you mean: pants' correction." >}}

> If a shopper types "swe" and has not already searched for "sweater" or "sweatpants," Einstein first looks for phrases starting with "swe" scoped to that device and location. If there is not enough data at that scope, it widens the search across a larger pool of devices and locations until it finds a confident match. — Trailhead

[Trailhead module →](https://trailhead.salesforce.com/content/learn/modules/cc-einstein-smarter-search/cc-einstein-search-recommendations)

## Agentforce Commerce's Generative Agents

Everything above is the AI you already had. The real change since 2022 sits a level above it: **Agentforce**, Salesforce's push to put autonomous, conversational agents on top of the same commerce data Einstein has been collecting all along. Three agents matter for a B2C storefront:

- **Agentforce Merchant** works with your merchandising team through conversational setup: drafting product descriptions, generating promotions, and surfacing proactive recommendations to boost products that are lagging or clear slow-moving inventory. It reads the same catalog and order data already feeding Einstein.
- **The B2C Shopper Agent** (Salesforce's Help docs now call it "Shopper Agent for B2C Commerce"; it was "Agentforce Personal Shopper" as recently as this article's last edit, so add a fourth name to the list above) acts as a shopping assistant inside chat or messaging channels, using generative AI and natural-language search to help a shopper find products and check out, rather than a scripted chatbot answering a fixed list of questions. [I've gone deep on what it actually costs and takes to set up →](/b2c-shopper-agent-setup-limits-and-cost/)
- **Agentforce Buyer** targets B2B storefronts specifically: reordering with pre-negotiated pricing and handling "where is my order" requests through chat.

Agentforce does not replace Einstein. It works alongside it: Agentforce Merchant reads the same catalog and order data Einstein already uses, but as a conversational agent layered on top, not a competing personalisation engine.

## Beyond the Storefront

Einstein's reach extends past your B2C Commerce site.

### Feeding data from other channels

If you sell through channels outside B2C Commerce Cloud, that order data does not have to stay siloed. You can feed it into Einstein as a [gzipped, tab-separated values (TSV) file](send-ext-order-feeds-to-einstein.pdf), so recommendations account for purchases Einstein would otherwise never see.

### The Einstein Profile Connector

The [Einstein Profile Connector](https://developer.salesforce.com/docs/commerce/einstein-api/guide/einstein-profile-connector-overview.html) is a headless API that lets you attach customer attributes to a shopper's profile that Einstein would not otherwise have: gender, favourite colours, favourite brands. A merchandiser gets a concrete payoff from this: once Einstein knows more about who is shopping, a recommender can favour women's outerwear over a generic bestseller list. For the developer wiring it up, it is a straightforward server-to-server integration: post the attributes once, and every recommendation call after that benefits from them.

### Going headless with the recommendations API

Past the Profile Connector, Einstein exposes [headless APIs](https://developer.salesforce.com/docs/commerce/einstein-api/guide/einstein-recommendations-overview.html) for sending shopper activity and fetching recommendations outside a rendered storefront page. The PWA Kit, Salesforce's React-based storefront reference architecture, already uses these APIs end to end. If you are building anything that is not a traditional server-rendered page, this is the surface you integrate against directly instead of relying on a Business Manager content slot.

For a business stakeholder, the payoff is the same personalisation showing up in places a content slot cannot reach: transactional emails, a mobile app, or a customer service console pulling up recommendations mid-call. The developer's contract barely changes either: the same activity-in, recommendations-out shape as the storefront, just authenticated with a client ID instead of a session cookie.

## Where to Learn More

Salesforce's Trailhead modules, linked throughout this article, are the fastest current path to hands-on practice with each feature. Module titles get relabelled under Agentforce branding from time to time, but the URLs and content have stayed stable.

> [!TIP]
> Salesforce also hosts a standalone [Einstein learning path](https://einstein-b2c-exp-salesforce.herokuapp.com/) covering Einstein across Commerce, Service, and Marketing Cloud. It still loads and still has useful content, but it predates the Agentforce rebrand and has not been visibly updated since. Treat it as a supplementary resource, not the canonical source.

## Your Takeaway

Einstein is still there, doing the same job it did in 2022. Only the name above it changed. The real risk in explaining that to a team is citing a feature name or setting Salesforce has since corrected or renamed, which undercuts your credibility fast. Verify anything you configure against current Salesforce Help and Trailhead content, including the guidance in this article, before trusting a source that predates the current release.
