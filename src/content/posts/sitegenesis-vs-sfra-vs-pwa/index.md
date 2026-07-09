---
title: SiteGenesis vs SFRA vs PWA
description: >-
  Those interested in Salesforce B2C Commerce Cloud will hear the term
  SiteGenesis and SFRA (and PWA). But what is the difference?
date: '2022-07-17T13:42:22.000Z'
lastmod: '2026-07-09T13:26:49.000Z'
url: /sitegenesis-vs-sfra-vs-pwa/
draft: false
heroImage: sfra-vs-sitegenesis-965c09b9a6.jpg
categories:
  - Salesforce Commerce Cloud
tags:
  - headless
  - sfcc
  - sfra
  - sitegenesis
author: Thomas Theunen
video:
  provider: youtube
  id: BTS6OqwMiK4
  title: 'Going headless with Salesforce B2C Commerce Cloud'
takeaways:
  - "Compares SiteGenesis, SFRA, and PWA Kit as the main storefront architecture options in the SFCC ecosystem"
  - "Explains the trade-offs around legacy constraints, third-party support, headless flexibility, and out-of-the-box feature coverage"
  - "Helps teams choose a storefront direction based on modernisation goals, budget, and required integrations"
---
[Salesforce B2C Commerce Cloud](https://www.salesforce.com/products/commerce-cloud/ecommerce/) is a cloud commerce platform: retailers run their storefronts on it across mobile, social, and in-store channels, with personalisation and shopper analytics built in.

But choosing SFCC is only step one. There's a second big decision to make: **on what architecture will you build your channels**? When you're introduced to Salesforce B2C Commerce Cloud, you'll hear terms such as SiteGenesis, SFRA, and (more recently) PWA. But what are the differences? What should you watch out for?

## Timeline

Here's how storefront architecture on Salesforce B2C Commerce Cloud has moved over the years:

{{< img-caption src="sfcc-storefront-timeline.png" alt="SFCC storefront timeline: SiteGenesis 1.0 in 2009, SiteGenesis 2.0 in 2014, MFRA in 2017 rebranded to SFRA in 2018, PWA Kit in 2021, SCAPI Custom APIs in 2024, Hybrid Auth in 2025, and OCAPI deprecation alongside Storefront Next in 2026." caption="Storefront architecture on SFCC didn't stop moving after the PWA Kit — SCAPI, Hybrid Auth, the OCAPI deprecation, and Storefront Next all landed since." >}}

## SiteGenesis

{{< img-caption src="sitegenesis-9a921c285a.jpg" alt="SiteGenesis storefront example representing the legacy architecture." caption="SiteGenesis reflects the older monolithic storefront model many teams still inherit." >}}

Let us start with the oldest (and least exciting option): [SiteGenesis](https://aaia-prd.my.commercecloud.salesforce.com/s/SiteGenesis/homepage?lang=en_US). If anyone still suggests that you start your journey with SiteGenesis, ask them why.

Why would I say this, even though minor updates are still happening to it? Looking at the timeline above, it is clear that newer options are available. And why these options are better suited for new projects should become clear as you continue to read this article.

### It's the old way of doing things (for SFCC)

The biggest reason not to use SiteGenesis, or to migrate away from it, is that it relies on outdated techniques and older frameworks.

An example is the SCSS, which uses "[responsive design](https://en.wikipedia.org/wiki/Responsive_web_design)." Not saying that this is a bad thing, as it was "the" way to do it in 2014. But this was replaced by a mobile-first methodology a few years later (which MFRA is based on, but we'll get to that later!)

Responsive Design still has a place, especially if most of your visitors are on desktop rather than mobile. But for most merchants, mobile visitors outnumber desktop by a wide margin.

### Third-party integrations

Salesforce B2C Commerce Cloud comes with a lot of features out-of-the-box. But it can't do everything, so it depends on third parties to create "cartridges" that extend that base (payment providers, shipping providers, OMS, ERP, ...).

> [!NOTE]
> The above is also true for other platforms besides SFCC.

But since 2020, it is no longer required to build for SiteGenesis; SFRA compatibility is enough. This shows that Salesforce wants to push new (and existing) clients away from using SiteGenesis.

### Pipelines VS Controllers

{{< img-caption src="pipelines-eed67b4c67.png" alt="Pipeline editor used in legacy SiteGenesis development." caption="Pipelines were central to SiteGenesis development before controllers became the norm." >}}

{{< img-caption src="controllers-130298bfb4.png" alt="Controller-based storefront code replacing pipelines in newer architectures." caption="Controller-based development was one of the key shifts that came with newer storefront stacks." >}}

Looking at the timeline, you will see that pipelines have disappeared in MFRA (2017). This is a legacy way of development within Salesforce B2C Commerce Cloud and has been replaced by JavaScript (controller-type) development.

It is time to migrate if you are still using SiteGenesis with pipelines in your project/site since new features will not be available in this framework.

> [!NOTE]
> It's also substantially harder to find developers who know how to work with pipelines, and pipeline-based development isn't supported by the latest development tools.

## M(S)FRA

{{< img-caption src="sfra-vs-sitegenesis-965c09b9a6.jpg" alt="Comparison between SiteGenesis and SFRA storefront stacks." caption="SFRA modernised the storefront layer without fully abandoning the B2C runtime model." >}}

This part of the article will cover both MFRA and [SFRA](https://developer.salesforce.com/docs/commerce/sfra/guide/sfra-overview.html) as they are the same. You can see MFRA as the ALPHA/BETA version of SFRA or simply as a rebranding.

In 2016 Demandware (before [Salesforce acquired Demandware](https://www.salesforce.com/news/press-releases/2016/06/01/salesforce-signs-definitive-agreement-to-acquire-demandware/) in the same year) saw an increased need for high-quality mobile experiences. SiteGenesis was not up for the task, so MFRA was "born." A new modern mobile-first web foundation was created that used technologies such as Bootstrap, HTML5, and CSS3, making it much easier to create mobile experiences.

These technologies also brought better storefront performance and UX along with them.

### Best Practices

Salesforce studied SiteGenesis sites already running in production and used what worked to shape SFRA's page designs and user flows.

### Development & Updates

The base SFRA repository itself is frozen, but new features still ship for the platform — just as separate "cartridges" instead of changes to the base template.

That way, customers and partners only pull in the features they actually need, instead of ripping out unwanted code later.

Salesforce is also actively pushing customers towards SFRA, even though a newer headless architecture exists (PWA Kit). Why, when something newer is on the table? Keep reading.

### Third-party integrations (M(S)FRA)

I will keep this short. Third parties are actively integrating with SFRA and updating their cartridges!

So choosing to go with SFRA now will be a good base for years to come. But be sure to continue reading, as PWA Kit itself may be attractive for your organisation!

## PWA Kit & Managed Runtime

{{< img-caption src="pwa-kit-03394b0f92.png" alt="PWA Kit storefront running in the managed runtime." caption="PWA Kit pushes the storefront into a composable architecture outside the traditional stack." >}}

The [PWA Kit](https://pwa-kit.mobify-storefront.com/) was, for years, the newest addition to the SFCC family — and Salesforce still doesn't market it as an SFRA replacement. You might be wondering why. There's a good reason for that, and it hasn't changed.

### Headless solution

Unlike SiteGenesis and SFRA, the PWA Kit runs on a separate server. It connects to your Salesforce B2C Commerce Cloud environment through the [SCAPI](https://developer.salesforce.com/docs/commerce/commerce-api/guide) (a REST API) — not OCAPI, which is what this article originally said here. Earlier PWA Kit versions leaned on the OCAPI for a few gaps in the hooks system; by now, everything runs through SCAPI. OCAPI itself was [officially deprecated in April 2026](/in-the-ring-ocapi-versus-scapi/), so it is no longer part of this picture at all, headless or otherwise.

The rest of this site now groups PWA Kit and Managed Runtime under one label: the [Composable Storefront](/what-does-the-composable-storefront-mean-for-sfcc-developers/). It isn't a fourth product bolted onto this comparison — it's shorthand for the same stack described in this section. If you're coming from SiteGenesis or SFRA and wondering what skills carry over, [this site has a dedicated walkthrough](/the-move-from-sitegenesis-and-sfra-to-the-composable-storefront-as-a-developer/).

It is an entirely different type of architecture than the "[monolithic](https://en.wikipedia.org/wiki/Monolithic_application#:~:text=In%20software%20engineering%2C%20a%20monolithic,independent%20from%20other%20computing%20applications.)" approach we are used to within SFCC.

But what does "headless" actually mean here? I cover it in this [blog post](https://forward.eu/blog/headless/) and in [this YouTube video](https://www.youtube.com/watch?v=BTS6OqwMiK4&feature=emb_title) on going headless with Salesforce B2C Commerce Cloud.

{{< video-embed id="BTS6OqwMiK4" title="Going headless with Salesforce B2C Commerce Cloud" >}}

There's also a [podcast episode](https://www.youtube.com/watch?v=hIghXeYIsEs&list=PLAQgCOXBCvL360AJzTZKTQe1wqvq4TLkD&index=6) on the "Unofficial Salesforce Commerce Cloud Podcast" about headless and the PWA Kit.

{{< video-embed id="hIghXeYIsEs" title="Unofficial Salesforce Commerce Cloud Podcast: Headless and the PWA Kit" >}}

### Managed Runtime

When talking headless, you need to think about the hosting for your storefront. Salesforce provides hosting for the “body”, but what about the “head”?

No worries on that front! Salesforce provides [Managed Runtime](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/mrt-overview.html), included in the licence.

> Managed Runtime provides the infrastructure to deploy, host, and monitor your PWA Kit storefront.

### React.JS

The PWA Kit also brings a different working language: it's built on [React](https://reactjs.org/), a mainstream library rather than the "niche" flavour SFCC developers are used to.

It will be easier to find and educate developers in this setup.

> [!WARNING]
> Developers will still need to learn the SCAPI endpoints, which have a steady learning curve. OCAPI knowledge has not become useless overnight either. It stays relevant for older SFRA/SiteGenesis integrations still running in maintenance mode, at least until Salesforce switches those off for good.

> [!NOTE]
> The PWA Kit is only responsible for the front end. Back-end integrations — importing products, prices, inventory — still need to be done the "old-fashioned" way.

### Progressive Web Apps

I won't dive deep into what Progressive Web Apps are — there's plenty written about that already, and about how they compare to native apps.

There's a [podcast episode on this topic](https://www.youtube.com/watch?v=eOFC5rLHZZ4&list=PLAQgCOXBCvL360AJzTZKTQe1wqvq4TLkD&index=3) too!

{{< video-embed id="eOFC5rLHZZ4" title="Unofficial Salesforce Commerce Cloud Podcast: Progressive Web Apps" >}}

### Third-party integrations (PWA Kit & Managed Runtime)

That gap has narrowed since this article was first written, but it hasn't closed. A handful of vendors now build packages aimed specifically at the PWA Kit — Adyen's headless integration is one example — and Salesforce keeps filling first-party gaps itself: Hybrid Auth replaced the old Plugin SLAS setup, and native Order Management actions now ship inside the PWA Kit's own default implementation. Still, no official Salesforce source grades how mature this ecosystem actually is, and from what this site has seen, broad, SFRA-style plug-and-play coverage still isn't there. Budget the extra time and vendor conversations an SFRA project rarely needs.

### Missing out-of-the-box features

A few SFRA features still don't have a clean PWA Kit equivalent. Here's where each one actually stands in 2026:

- [A/B Testing](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_ab_testing.htm) — still genuinely missing. The only bridge is a [SCAPI Custom API](https://developer.salesforce.com/docs/commerce/commerce-api/guide/custom-apis.html) you build yourself around the same `ABTestMgr` script API SFRA uses.
- ~~Personalisation~~ (Added in 2023)
- [~~Page Designer~~](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-dev-for-page-designer.html) (Added in 2023)
- [Sitemap](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_sitemap_overview.htm) — not built in, but no longer a dead end: [this site documents a working backend-plus-proxy pattern](/mastering-sitemaps-in-sfcc/) built on the SCAPI `uploadCustomSitemapAndTriggerSitemapGeneration` endpoint.
- [SEO URL Configuration](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_configuring_seo_urls.htm) — SCAPI's `getUrlMapping` endpoint now resolves the same Business Manager URL rules SFRA uses, but you still have to wire it into your own routing. There's no zero-config equivalent yet.
- [Page Meta Tag Rules](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_page_meta_tag_rules.htm&type=5) — [Salesforce's continued SCAPI expansion is making custom endpoints for this increasingly unnecessary](/taming-the-beast-a-developers-deep-dive-into-sfcc-meta-tag-rules/).

That's a shorter, more nuanced list than it was in 2022. Some gaps are closed outright, some have an official pattern to lean on, and A/B testing is still squarely on you to build. Budget accordingly.

## Comparison

One thing to flag before the summary: this article compares SiteGenesis, SFRA, and the PWA Kit specifically. Salesforce's newest recommended headless option, as of 2026, is actually [Storefront Next](https://developer.salesforce.com/docs/commerce/commerce-api/guide/which-product.html) — a different frontend stack (React Router 7, React 19, Vite) sitting on the same SCAPI and Managed Runtime backend described above. It's new enough that this comparison doesn't cover it, but check it before you commit to the PWA Kit on a greenfield project.

The following overview compresses the information above.

{{< img-caption src="sitegenesis-sfra-pwa-comparison-table.png" alt="Comparison table contrasting SiteGenesis, SFRA, and PWA Kit across architecture, APIs, and feature parity, current as of 2026." caption="This final comparison makes the trade-offs between the three storefront approaches easier to judge — and reflects the feature-parity corrections above, not the 2022 original." >}}
