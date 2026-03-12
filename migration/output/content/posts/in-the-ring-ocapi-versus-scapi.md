---
title: 'In the ring: OCAPI versus SCAPI'
description: >-
  As we move into 2024, the SCAPI has received much attention and has been
  updated with new APIs, updates, and performance improvements.
date: '2024-03-18T08:49:51.000Z'
lastmod: '2024-03-19T15:11:36.000Z'
url: /in-the-ring-ocapi-versus-scapi/
draft: false
heroImage: /media/2024/rest-apis-fighting-in-a-boxing-ring-60c6242717.jpg
categories:
  - Architecture
  - Salesforce Commerce Cloud
tags:
  - headless
  - sfcc
  - technical
author: Thomas Theunen
---
As we move into 2024, the SCAPI has received much attention and has been updated with new APIs, updates, and performance improvements. On the other hand, the OCAPI rarely gets any new features in its release notes, leading some to believe it is outdated or deprecated.

In this article, I will explore this topic in detail to determine whether or not these claims are accurate.

So, let's get rumbling!

## OCAPI versus SCAPI

Salesforce B2C Commerce Cloud has a long-standing history with its OCAPI, which offers a broad range of APIs for various purposes. One typical integration that highlights the functionality of these APIs is [Newstore](https://www.newstore.com). This mobile application solution uses customisation hooks in the provided cartridge to integrate with the APIs.

The SCAPI, or Storefront Commerce API, is a relatively "new" set of APIs introduced on [July 22, 2020](https://help.salesforce.com/s/articleView?id=sf.sf_com_api_W7858177_ga_release.htm&language=nl_NL&type=5). It offers a different way of interacting with SFCC (Salesforce Commerce Cloud) from third-party systems and headless front-ends than the way we had been doing with the OCAPI (Open Commerce API) before.

However, there is one drawback to the SCAPI: not all APIs that exist in the OCAPI are available in the SCAPI, at least not yet.

Let's keep score, shall we?

**OCAPI:** 1
**SCAPI:** 0

## New APIs

In recent years, the SCAPI has introduced several [new APIs](/category/release-notes/) that the OCAPI does not have. These new APIs have been implemented to address OCAPI gaps or expose new functionality, such as those related to SEO and CDN, allowing for more robust and comprehensive functionality.

SCAPI now offers a wide range of APIs for developers to use, allowing them to build customised solutions for their clients. As these new APIs have been developed explicitly for SCAPI, it is unlikely that the OCAPI will ever have access to them.

In the future, it is clear that any significant new APIs will only be added to the SCAPI, which aligns with the platform's strategy.

**OCAPI:** 1
**SCAPI:** 1

## SLAS

[SLAS](/how-to-set-up-slas-for-the-composable-storefront/), or Shopper Login and API Access Service, is a Salesforce Commerce Cloud (SFCC) feature allowing third-party systems or headless front-ends to authenticate shoppers and make API calls.

It's an authentication orchestration service that can handle various scenarios without requiring the creation of custom code for each one separately. (Some tweaking of parameters and configuration is still required, but that's not the focus of this article.):

- **B2C Authentication:** Normal login with Salesforce B2C Commerce Cloud
- **Social Login** (Third-party login): Login with platforms such as Google and Facebook
- **Passwordless** **Login:** Login via e-mail or SMS
- **Trusted Agent:** Have a third-party person or system login on behalf of a customer

Although it is possible to use this service in conjunction with OCAPI, it is more part of the SCAPI offering, so let us give a point to SCAPI in this case.

**OCAPI:** 1
**SCAPI:** 2

## PWA Kit

Have you heard about the PWA Kit or [Composable Storefront](/the-move-from-sitegenesis-and-sfra-to-the-composable-storefront-as-a-developer/)? You may have, as it's the latest addition to the front-end options besides SiteGenesis and SFRA.

The Composable Storefront is a Headless storefront that connects to the back-end SFCC systems through the SCAPI. Although it used to be connected to the OCAPI due to some limitations with the [hooks](/how-to-use-ocapi-scapi-hooks/) system, the latest version is now fully connected to the SCAPI.

It's no secret that the Composable Storefront is the primary driver for these innovations.

Another point to SCAPI!

**OCAPI:** 1
**SCAPI:** 3

Oh my ... things aren't looking proper for the OCAPI.

## Infrastructure

[![The Composable Storefront architecture](/media/2023/composable-storefront-architecture-54fe68c81a.jpg)](/media/2023/composable-storefront-architecture-54fe68c81a.jpg)

The architectural setups of the OCAPI and SCAPI options are entirely different.

The OCAPI runs on the back end, the exact location as the Business Manager, [SFRA/SG](/sitegenesis-vs-sfra-vs-pwa/) storefront, and your custom code.

~~On the other hand, the SCAPI is a MuleSoft instance managed by Salesforce (no, you can't access this - but I know you want to).
~~_In the current architecture, CloudFlare workers have taken over the role that was previously played by MuleSoft._

Although the SCAPI has an extra layer in between, it gives Salesforce the flexibility to make their architecture more flexible (and composable) by allowing them to have one point of entry while being able to upgrade, fix, or replace parts without anyone noticing.
~~However, this setup has some downsides, such as more network hops between the systems, resulting in [network](https://medium.com/salesforce-architects/a-day-in-the-life-of-a-composable-storefront-request-f2b39b957a39) delays that need to be considered.~~ _By replacing MuleSoft with CloudFlare, the amount of network delays introduced should be minimal!_

The OCAPI wins for its simplicity, but the SCAPI wins for its future-proof architecture. Nevertheless, this future-proof architecture can only work if it has been set up correctly, and we don't have any view into that black box.

So, for me, both of them get a point here!

**OCAPI:** 2
**SCAPI:** 4

## Rate Limits

APIs can be enjoyable to work with, but they are also vulnerable to DDoS attacks and poor design, leading to excessive API calls and a heavy server load. Yet, the OCAPI is designed to be safe and user-friendly, and CloudFlare and Salesforce-managed firewalls protect it to ensure server safety and limit the number of requests.

Although the rate-limiter is a straightforward "pass" or "block" method, it is essential to consider its impact and be prepared for the worst.

Contract Info: On a side note, all OCAPI calls are counted as "Storefront Requests", which are part of the contract.

The SCAPI has implemented a new "Load Shedding" system to replace rate limits. This system provides a comprehensive view of what is happening behind the scenes.

> [!NOTE]
> **Not all APIs are the same:** Not all SCAPI endpoints work with this new system, but some are still protected with set rate limits.

**OCAPI:** 2
**SCAPI:** 5

## Conclusion

The SCAPI outperforms the OCAPI in multiple ways, which is why the former was implemented. However, if you are still extensively using the OCAPI, there is no need to worry because you are not alone - even the SCAPI uses it behind the scenes.

Many SCAPI API calls are just a proxy for OCAPI calls. Consequently, as long as the SCAPI depends on the OCAPI, it is not going anywhere.
