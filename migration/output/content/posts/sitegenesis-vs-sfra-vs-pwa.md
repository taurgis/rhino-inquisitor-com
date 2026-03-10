---
title: SiteGenesis vs SFRA vs PWA
description: >-
  $1 is a modern Commerce platform that empowers retailers of all sizes and
  industries to harness the power of the cloud to deliver world class
  omnichanne...
date: '2022-07-17T13:42:22.000Z'
lastmod: '2023-03-30T07:02:37.000Z'
url: /sitegenesis-vs-sfra-vs-pwa/
draft: false
heroImage: /media/2022/sfra-vs-sitegenesis-965c09b9a6.jpg
categories:
  - Salesforce Commerce Cloud
tags:
  - headless
  - sfcc
  - sfra
  - sitegenesis
author: Thomas Theunen
---
[Salesforce B2C Commerce Cloud](https://www.salesforce.com/products/commerce-cloud/ecommerce/) is a modern Commerce platform that empowers retailers of all sizes and industries to harness the power of the cloud to deliver world-class omnichannel experiences. With Salesforce B2C Commerce Cloud, you can effortlessly offer your customers a seamless and personalized shopping journey across the mobile, social, and in-store channels while gaining valuable insights into who they are and what they want.

But after choosing SFCC to be the platform, a second big decision must be made. **On what architecture will you base your channels**? When introduced to Salesforce B2C Commerce Cloud, you will hear terms such as SiteGenesis, SFRA, and (more recently) PWA. But what are the differences? What should I watch out for?

## Timeline

Before we get started, here is a timeline showing the history of the "development architectures" used on Salesforce B2C Commerce Cloud throughout the years.

[![SFCC History: 2009 - SiteGenesis 1.0, with version 2.0 being released in 2014. The next release was in 2017 with MFRA, being rebranded to SFRA in 2018. The latest release was the PWA Kit in 2021.](/media/2022/sfcc-history-86f56e594a.png)](/media/2022/sfcc-history-86f56e594a.png)

## SiteGenesis

[![](/media/2022/sitegenesis-9a921c285a.jpg)](/media/2022/sitegenesis-9a921c285a.jpg)

Let us start with the oldest (and least exciting option): [SiteGenesis](https://production-sitegenesis-dw.demandware.net/on/demandware.store/Sites-SiteGenesis-Site). If anyone still suggests that you start your journey with SiteGenesis, you should ask the question, "why do we need to do that?".

Why would I say this, even though minor updates are still happening to it in 2022? Looking at the timeline above, it is clear that newer options are available. And why these options are better suited for new projects should become clear as you continue to read this article.

### It's the old way of doing things (for SFCC)

The biggest reason not to use SiteGenesis or migrate away from it, is that it uses outdated techniques and relies on older frameworks.

An example is the SCSS, which uses "[responsive design](https://en.wikipedia.org/wiki/Responsive_web_design)." Not saying that this is a bad thing, as it was "the" way to do it in 2014. But this was replaced by a mobile-first methodology a few years later (which MFRA is based on, but we'll get to that later!)

Responsive Design still has a place, especially if most of your visitors are not mobile but on desktop devices. But for most merchants, mobile claims the most significant percentage of visitors.

### Third-party integrations

Salesforce B2C Commerce Cloud comes with a lot of features out-of-the-box. But it can't do everything, so it depends on third parties to create "cartridges" that extend that base (payment providers, shipping providers, OMS, ERP, ...).

_**NOTE:** The above statement is also true for other platforms besides SFCC._

But since 2020, it is no longer required to build for SiteGenesis; SFRA compatibility is enough. This shows that Salesforce wants to push new (and existing) clients away from using SiteGenesis.

### Pipelines VS Controllers

[![](/media/2022/pipelines-eed67b4c67.png)](/media/2022/pipelines-eed67b4c67.png)

Pipelines in SiteGenesis

[![](/media/2022/controllers-130298bfb4.png)](/media/2022/controllers-130298bfb4.png)

Controllers in SiteGenesis

Looking at the timeline, you will see that pipelines have disappeared in MFRA (2017). This is a legacy way of development within Salesforce B2C Commerce Cloud and has been replaced by JavaScript (controller-type) development.

It is time to migrate if you are still using SiteGenesis with pipelines in your project/site since new features will not be available in this framework.

_**Note:** It is also substantially harder to find developers who know how to work with Pipelines. And working with pipelines is not supported by the latest and greatest development tools._

## M(S)FRA

[![](/media/2022/sfra-vs-sitegenesis-965c09b9a6.jpg)](/media/2022/sfra-vs-sitegenesis-965c09b9a6.jpg)

This part of the article will cover both MFRA and [SFRA](https://production-sitegenesis-dw.demandware.net/s/RefArch/home?lang=en_US) as they are the same. You can see MFRA as the ALPHA/BETA version of SFRA or simply as a rebranding.

In 2016 Demandware (before [Salesforce acquired Demandware](https://www.salesforce.com/news/press-releases/2016/06/01/salesforce-signs-definitive-agreement-to-acquire-demandware/) in the same year) saw an increased need for high-quality mobile experiences. SiteGenesis was not up for the task, so MFRA was "born." A new modern mobile-first web foundation was created that used technologies such as Bootstrap, HTML5, and CSS3, making it much easier to create mobile experiences.

Along with using these technologies, better storefront performance and UX were part of this new architecture.

### Best Practices

Based on research on many of the already live websites on the SiteGenesis platform, best practices were identified to improve user experience and the shopper journey.

Using the gathered data, the pages part of the SFRA were designed together with the user flows.

### Development & Updates

Although development on the central repository has halted, new features added to the platform are still being developed for SFRA. These are created as separate "cartridges" rather than putting them in the base template.

This gives customers and partners the flexibility to only include the features they need rather than having to remove them to clean up the code.

Salesforce is also actively pushing customers towards SFRA, even though a new headless architecture has become available (PWA Kit). The reason for this will become more apparent as you continue reading.

### Third-party integrations

I will keep this short. Third parties are actively integrating with SFRA and updating their cartridges!

So choosing to go with SFRA now will be a good base for years to come. But be sure to continue reading, as the PWA Kit solution may be attractive for your organization!

## PWA Kit & Managed Runtime

[![](/media/2022/pwa-kit-03394b0f92.png)](/media/2022/pwa-kit-03394b0f92.png)

The [PWA Kit](https://pwa-kit.mobify-storefront.com/) is the most recent addition to the SFCC family. And it is important to note that this solution is not marketed at the moment to replace SFRA. You might be wondering why, and there is a good reason for that.

### Headless solution

Unlike SiteGenesis and SFRA, the PWA Kit runs on a separate server. It connects with the [SCAPI](https://developer.salesforce.com/docs/commerce/commerce-api/guide) and [OCAPI](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/usage/OpenCommerceAPI.html?cp=0_16) (REST APIs) of the Salesforce B2C Commerce Cloud environments.

It is an entirely different type of architecture than the "[monolithic](https://en.wikipedia.org/wiki/Monolithic_application#:~:text=In%20software%20engineering%2C%20a%20monolithic,independent%20from%20other%20computing%20applications.)" approach we are used to within SFCC.

But what does this mean, going Headless? You can find more information about it in this [blog post](https://forward.eu/blog/headless/) or look at the following YouTube video where I explain what it means to go Headless with Salesforce B2C Commerce Cloud.

https://www.youtube.com/watch?v=BTS6OqwMiK4&feature=emb\_title

A great podcast is also available on the "Unofficial Salesforce Commerce Cloud Podcast" about Headless and the PWA Kit.

https://www.youtube.com/watch?v=hIghXeYIsEs&list=PLAQgCOXBCvL360AJzTZKTQe1wqvq4TLkD&index=6

### Managed Runtime

When talking headless, you need to think about the hosting for your storefront. Salesforce provides hosting for the “body”, but what about the “head”?

No worries on that front! Salesforce provides a [Managed Runtime](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/mrt-overview.html) solution that is included in the license.

> Managed Runtime provides the infrastructure to deploy, host, and monitor your PWA Kit storefront.

### React.JS

Another significant change in working is that the PWA Kit is built upon [React](https://reactjs.org/), a modern library that does not have such a "niche" flavor that SFCC has known up until now.

It will be easier to find and educate developers in this setup.

Important to note that developers will still need to learn about the SCAPI and OCAPI endpoints, which have a steady learning curve.

_**Note:** The PWA Kit is only responsible for the front end. The back-end integrations such as importing products, prices, and inventory will still need to be done the "old-fashioned" way._

### Progressive Web Apps

I will not go into much detail on what Progressive Web Apps are. There is a lot of great content available on the web which explains it and how it compares to native applications.

And again, there is a podcast episode available dedicated to this topic!

https://www.youtube.com/watch?v=eOFC5rLHZZ4&list=PLAQgCOXBCvL360AJzTZKTQe1wqvq4TLkD&index=3

### Third-party integrations

As this solution is pretty new, few third-party solutions are plug-and-play like SFRA. A more considerable investment in budget/time is required for now.

Looking at the past few weeks/months, there is a [good amount of interest](https://marketplace.magnolia-cms.com/detail/salesforce-commerce-cloud.html) in building integrations. Like SFRA in 2017, time is required to make a fair amount of third-party prebuilt solutions.

### Missing out-of-the-box features

I may sound like a broken record, but a few features built into SFRA are not in the PWA Kit since the solution is new. A few examples are:

-   [A/B Testing](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/ab_testing/b2c_ab_testing.html)
-   ~~Personalization~~ (Added in 2023)
-   [~~Page Designer~~](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/page_designer/b2c_dev_for_page_designer.html) ( Added in 2023)
-   [Sitemap](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/search_engine_optimization/b2c_sitemap_overview.html)
-   [SEO URL Configuration](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/search_engine_optimization/b2c_configuring_seo_urls.html)
-   [Page Meta Tag Rules](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/categories/b2c_page_meta_tag_rules.htm)


All of these "missing items" can be resolved with custom development. So be prepared to spend more time and budget to build these features if needed. And many of these are on the roadmap of Salesforce, so if you wait a bit longer (or adapt your implementation timeline/order of implementation), the above list will be much smaller.

## Comparison

The following overview compresses the information above.

[![](/media/2022/comparison-sitegenesis-sfra-pwa-5593ba325c.png)](/media/2022/comparison-sitegenesis-sfra-pwa-5593ba325c.png)
