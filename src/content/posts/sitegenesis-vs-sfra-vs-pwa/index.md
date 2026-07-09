---
title: SiteGenesis vs SFRA vs PWA
description: >-
  Those interested in Salesforce B2C Commerce Cloud will hear the term
  SiteGenesis and SFRA (and PWA). But what is the difference?
date: '2022-07-17T13:42:22.000Z'
lastmod: '2026-07-07T18:30:00.000Z'
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
[Salesforce B2C Commerce Cloud](https://www.salesforce.com/products/commerce-cloud/ecommerce/) is a modern Commerce platform that empowers retailers of all sizes and industries to harness the power of the cloud to deliver world-class omnichannel experiences. With Salesforce B2C Commerce Cloud, you can effortlessly offer your customers a seamless and personalised shopping journey across the mobile, social, and in-store channels while gaining valuable insights into who they are and what they want.

But after choosing SFCC to be the platform, a second big decision must be made. **On what architecture will you base your channels**? When introduced to Salesforce B2C Commerce Cloud, you will hear terms such as SiteGenesis, SFRA, and (more recently) PWA. But what are the differences? What should I watch out for?

## Timeline

Before we get started, here is a timeline showing the history of the "development architectures" used on Salesforce B2C Commerce Cloud throughout the years.

{{< img-caption src="sfcc-storefront-timeline.png" alt="SFCC storefront timeline: SiteGenesis 1.0 in 2009, SiteGenesis 2.0 in 2014, MFRA in 2017 rebranded to SFRA in 2018, PWA Kit in 2021, SCAPI Custom APIs in 2024, Hybrid Auth in 2025, and OCAPI deprecation alongside Storefront Next in 2026." caption="Storefront architecture on SFCC didn't stop moving after the PWA Kit — SCAPI, Hybrid Auth, the OCAPI deprecation, and Storefront Next all landed since." >}}

## SiteGenesis

{{< img-caption src="sitegenesis-9a921c285a.jpg" alt="SiteGenesis storefront example representing the legacy architecture." caption="SiteGenesis reflects the older monolithic storefront model many teams still inherit." >}}

Let us start with the oldest (and least exciting option): [SiteGenesis](https://aaia-prd.my.commercecloud.salesforce.com/s/SiteGenesis/homepage?lang=en_US). If anyone still suggests that you start your journey with SiteGenesis, you should ask the question, "why do we need to do that?".

Why would I say this, even though minor updates are still happening to it in 2022? Looking at the timeline above, it is clear that newer options are available. And why these options are better suited for new projects should become clear as you continue to read this article.

### It's the old way of doing things (for SFCC)

The biggest reason not to use SiteGenesis or migrate away from it, is that it uses outdated techniques and relies on older frameworks.

An example is the SCSS, which uses "[responsive design](https://en.wikipedia.org/wiki/Responsive_web_design)." Not saying that this is a bad thing, as it was "the" way to do it in 2014. But this was replaced by a mobile-first methodology a few years later (which MFRA is based on, but we'll get to that later!)

Responsive Design still has a place, especially if most of your visitors are not mobile but on desktop devices. But for most merchants, mobile claims the most significant percentage of visitors.

### Third-party integrations

Salesforce B2C Commerce Cloud comes with a lot of features out-of-the-box. But it can't do everything, so it depends on third parties to create "cartridges" that extend that base (payment providers, shipping providers, OMS, ERP, ...).

**NOTE:** The above statement is also true for other platforms besides SFCC.

But since 2020, it is no longer required to build for SiteGenesis; SFRA compatibility is enough. This shows that Salesforce wants to push new (and existing) clients away from using SiteGenesis.

### Pipelines VS Controllers

{{< img-caption src="pipelines-eed67b4c67.png" alt="Pipeline editor used in legacy SiteGenesis development." caption="Pipelines were central to SiteGenesis development before controllers became the norm." >}}

Pipelines in SiteGenesis

{{< img-caption src="controllers-130298bfb4.png" alt="Controller-based storefront code replacing pipelines in newer architectures." caption="Controller-based development was one of the key shifts that came with newer storefront stacks." >}}

Controllers in SiteGenesis

Looking at the timeline, you will see that pipelines have disappeared in MFRA (2017). This is a legacy way of development within Salesforce B2C Commerce Cloud and has been replaced by JavaScript (controller-type) development.

It is time to migrate if you are still using SiteGenesis with pipelines in your project/site since new features will not be available in this framework.

**Note:** It is also substantially harder to find developers who know how to work with Pipelines. And working with pipelines is not supported by the latest and greatest development tools.

## M(S)FRA

{{< img-caption src="sfra-vs-sitegenesis-965c09b9a6.jpg" alt="Comparison between SiteGenesis and SFRA storefront stacks." caption="SFRA modernised the storefront layer without fully abandoning the B2C runtime model." >}}

This part of the article will cover both MFRA and [SFRA](https://developer.salesforce.com/docs/commerce/sfra/guide/sfra-overview.html) as they are the same. You can see MFRA as the ALPHA/BETA version of SFRA or simply as a rebranding.

In 2016 Demandware (before [Salesforce acquired Demandware](https://www.salesforce.com/news/press-releases/2016/06/01/salesforce-signs-definitive-agreement-to-acquire-demandware/) in the same year) saw an increased need for high-quality mobile experiences. SiteGenesis was not up for the task, so MFRA was "born." A new modern mobile-first web foundation was created that used technologies such as Bootstrap, HTML5, and CSS3, making it much easier to create mobile experiences.

Along with using these technologies, better storefront performance and UX were part of this new architecture.

### Best Practices

Based on research on many of the already live websites on the SiteGenesis platform, best practices were identified to improve user experience and the shopper journey.

Using the gathered data, the pages part of the SFRA were designed together with the user flows.

### Development & Updates

Although development on the central repository has halted, new features added to the platform are still being developed for SFRA. These are created as separate "cartridges" rather than putting them in the base template.

This gives customers and partners the flexibility to only include the features they need rather than having to remove them to clean up the code.

Salesforce is also actively pushing customers towards SFRA, even though a new headless architecture has become available (PWA Kit). The reason for this will become more apparent as you continue reading.

### Third-party integrations (M(S)FRA)

I will keep this short. Third parties are actively integrating with SFRA and updating their cartridges!

So choosing to go with SFRA now will be a good base for years to come. But be sure to continue reading, as the PWA Kit solution may be attractive for your organisation!

## PWA Kit & Managed Runtime

{{< img-caption src="pwa-kit-03394b0f92.png" alt="PWA Kit storefront running in the managed runtime." caption="PWA Kit pushes the storefront into a composable architecture outside the traditional stack." >}}

The [PWA Kit](https://pwa-kit.mobify-storefront.com/) was, for years, the newest addition to the SFCC family — and Salesforce still doesn't market it as an SFRA replacement. You might be wondering why. There's a good reason for that, and it hasn't changed.

### Headless solution

Unlike SiteGenesis and SFRA, the PWA Kit runs on a separate server. It connects to your Salesforce B2C Commerce Cloud environment through the [SCAPI](https://developer.salesforce.com/docs/commerce/commerce-api/guide) (a REST API). That is a correction to make here: earlier versions leaned on the OCAPI for a few gaps in the hooks system, but by now the PWA Kit runs fully on SCAPI. The OCAPI itself was [officially deprecated in April 2026](/in-the-ring-ocapi-versus-scapi/), so it is no longer part of this picture at all, headless or otherwise.

The rest of this site now groups PWA Kit and Managed Runtime under one label: the [Composable Storefront](/what-does-the-composable-storefront-mean-for-sfcc-developers/). It isn't a fourth product bolted onto this comparison — it's shorthand for the same stack described in this section. If you're coming from SiteGenesis or SFRA and wondering what skills carry over, [this site has a dedicated walkthrough](/the-move-from-sitegenesis-and-sfra-to-the-composable-storefront-as-a-developer/).

It is an entirely different type of architecture than the "[monolithic](https://en.wikipedia.org/wiki/Monolithic_application#:~:text=In%20software%20engineering%2C%20a%20monolithic,independent%20from%20other%20computing%20applications.)" approach we are used to within SFCC.

But what does this mean, going Headless? You can find more information about it in this [blog post](https://forward.eu/blog/headless/) or [watch this YouTube video](https://www.youtube.com/watch?v=BTS6OqwMiK4&feature=emb_title) where I explain what it means to go Headless with Salesforce B2C Commerce Cloud.

{{< video-embed id="BTS6OqwMiK4" title="Going headless with Salesforce B2C Commerce Cloud" >}}

A great [podcast episode](https://www.youtube.com/watch?v=hIghXeYIsEs&list=PLAQgCOXBCvL360AJzTZKTQe1wqvq4TLkD&index=6) is also available on the "Unofficial Salesforce Commerce Cloud Podcast" about Headless and the PWA Kit.

{{< video-embed id="hIghXeYIsEs" title="Unofficial Salesforce Commerce Cloud Podcast: Headless and the PWA Kit" >}}

### Managed Runtime

When talking headless, you need to think about the hosting for your storefront. Salesforce provides hosting for the “body”, but what about the “head”?

No worries on that front! Salesforce provides a [Managed Runtime](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/mrt-overview.html) solution that is included in the licence.

> Managed Runtime provides the infrastructure to deploy, host, and monitor your PWA Kit storefront.

### React.JS

Another significant change in working is that the PWA Kit is built upon [React](https://reactjs.org/), a modern library that does not have such a "niche" flavour that SFCC has known up until now.

It will be easier to find and educate developers in this setup.

> [!WARNING]
> Developers will still need to learn the SCAPI endpoints, which have a steady learning curve. OCAPI knowledge has not become useless overnight either. It stays relevant for older SFRA/SiteGenesis integrations still running in maintenance mode, at least until Salesforce switches those off for good.

**Note:** The PWA Kit is only responsible for the front end. The back-end integrations such as importing products, prices, and inventory will still need to be done the "old-fashioned" way.

### Progressive Web Apps

I will not go into much detail on what Progressive Web Apps are. There is a lot of great content available on the web which explains it and how it compares to native applications.

And again, there is a [podcast episode available dedicated to this topic](https://www.youtube.com/watch?v=eOFC5rLHZZ4&list=PLAQgCOXBCvL360AJzTZKTQe1wqvq4TLkD&index=3)!

{{< video-embed id="eOFC5rLHZZ4" title="Unofficial Salesforce Commerce Cloud Podcast: Progressive Web Apps" >}}

### Third-party integrations (PWA Kit & Managed Runtime)

That gap has narrowed since this article was first written, but it hasn't closed. A handful of vendors now build packages aimed specifically at the PWA Kit — Adyen's headless integration is one example — and Salesforce keeps filling first-party gaps itself: Hybrid Auth replaced the old Plugin SLAS setup, and native Order Management actions now ship inside the PWA Kit's own default implementation. Still, no official Salesforce source grades how mature this ecosystem actually is, and from what this site has seen, broad, SFRA-style plug-and-play coverage still isn't there. Budget the extra time and vendor conversations an SFRA project rarely needs.

### Missing out-of-the-box features

A few SFRA features still don't have a clean PWA Kit equivalent, and each one's status is different by now:

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
