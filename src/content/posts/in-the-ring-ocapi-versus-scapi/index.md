---
title: 'In the ring: OCAPI versus SCAPI'
description: >-
  Salesforce has officially deprecated the OCAPI and keeps shipping new SCAPI
  endpoints. Time for a 2026 rematch, round by round.
date: '2024-03-18T08:49:51.000Z'
lastmod: '2026-07-07T09:30:00.000Z'
url: /in-the-ring-ocapi-versus-scapi/
draft: false
heroImage: rest-apis-fighting-in-a-boxing-ring-60c6242717.jpg
categories:
  - Architecture
  - Salesforce Commerce Cloud
tags:
  - headless
  - sfcc
  - technical
author: Thomas Theunen
takeaways:
  - "Revisits the 2024 scorecard now that Salesforce has officially deprecated the OCAPI as of April 2026"
  - "Covers the wave of Admin and Shopper SCAPI endpoints that closed most of the OCAPI coverage gap"
  - "Explains what maintenance-only mode means and which migration steps to start planning now"
---
When this article first appeared in early 2024, the SCAPI was collecting new APIs every release while the OCAPI release notes stayed suspiciously quiet. The question back then was whether the OCAPI was outdated or secretly deprecated. My conclusion: not yet, and since the SCAPI itself leaned on the OCAPI behind the scenes, not any time soon.

Salesforce has since settled the argument. In April 2026, the OCAPI was officially deprecated. Its documentation now carries a "(deprecated)" label on every page, and new platform features land exclusively in the SCAPI.

That calls for a rematch. Same fighters, same ring, a very different scorecard.

So, let's get rumbling!

## OCAPI versus SCAPI

Salesforce B2C Commerce Cloud has a long-standing history with its OCAPI, which offers a broad range of APIs for various purposes. One typical integration that highlights the functionality of these APIs is [Newstore](https://www.newstore.com). This mobile application solution uses customisation hooks in the provided cartridge to integrate with the APIs.

The SCAPI, or Salesforce Commerce API, is a relatively "new" set of APIs introduced on [July 22, 2020](https://help.salesforce.com/s/articleView?id=sf.sf_com_api_W7858177_ga_release.htm&language=nl_NL&type=5). It offers a different way of interacting with SFCC (Salesforce Commerce Cloud) from third-party systems and headless front-ends than the way we had been doing with the OCAPI (Open Commerce API) before.

For years, the OCAPI's strongest counterpunch was coverage: plenty of Data API functionality simply had no SCAPI equivalent. That gap has been closing release after release, and by mid-2026, not much of it is left. Salesforce itself now lists only system information (think low-level server status) and a handful of complex Data API tasks as things the OCAPI still handles best.

A shrinking lead is still a lead. Point to the OCAPI — likely its last.

**OCAPI:** 1 **SCAPI:** 0

## New APIs

This is where the fight turned one-sided. The SCAPI had already introduced [new APIs](/category/release-notes/) that the OCAPI never got, such as SEO and eCDN configuration. But the past few release cycles went straight for the OCAPI's home turf: the Data API.

Since late 2025, Salesforce has shipped Admin APIs for jobs, code versions, users and roles, sites, site preferences, custom objects, and system object definitions. That is the administrative core that used to be the main reason to keep an OCAPI client around. The shopper side moved just as fast: dedicated endpoints for product images, prices, and promotions, content retrieval in the Shopper Experience API, order cancellation and returns through the Order Management integration, and a Shopper Agents API that initialises Agentforce sessions.

The pace itself has an explanation. In May 2026, Salesforce's engineering chief shared [how the company rebuilt its development workflow around Anthropic's Claude Code](https://www.salesforce.com/news/stories/how-engineering-became-agentic/): one product team migrated 33 API endpoints to a new cloud-native architecture in 13 days, against an estimate of 231 person-days. Whatever your opinion on AI-assisted development, that kind of throughput is visible in the SCAPI release notes — and it makes the promise to close the remaining OCAPI gaps a lot more believable.

The same approach is available to the rest of us. In April 2026, Salesforce released its open-source [B2C Developer Tooling](https://developer.salesforce.com/blogs/2026/04/introducing-the-b2c-commerce-cli-and-on-demand-sandbox-cloning): a new CLI, an MCP server, and a set of agent skills that let coding agents such as Claude Code work against your instances — deploying cartridges, managing jobs, spinning up sandboxes. The toolkit is built SCAPI-first and falls back to the OCAPI only where a gap remains, so every task you route through it is already on the right side of this fight.

And when an endpoint you need doesn't exist, you can [build a custom SCAPI endpoint](/a-look-at-the-23-9-commerce-cloud-release/) instead of reaching for [custom OCAPI workarounds](/creating-custom-ocapi-endpoints/).

None of this will ever appear in the OCAPI. Since the deprecation, it receives security patches only.

**OCAPI:** 1 **SCAPI:** 1

## SLAS

[SLAS](/how-to-set-up-slas-for-the-composable-storefront/), or Shopper Login and API Access Service, is a Salesforce Commerce Cloud (SFCC) feature allowing third-party systems or headless front-ends to authenticate shoppers and make API calls.

It's an authentication orchestration service that can handle various scenarios without requiring the creation of custom code for each one separately. (Some tweaking of parameters and configuration is still required, but that's not the focus of this article.):

- **B2C Authentication:** Normal login with Salesforce B2C Commerce Cloud
- **Social Login** (Third-party login): Login with platforms such as Google and Facebook
- **Passwordless Login:** Login via e-mail or SMS
- **Trusted Agent:** Have a third-party person or system login on behalf of a customer

Although it is possible to use this service in conjunction with OCAPI, it is more part of the SCAPI offering, so let us give a point to SCAPI in this case.

**OCAPI:** 1 **SCAPI:** 2

## PWA Kit

Have you heard about the PWA Kit or [Composable Storefront](/the-move-from-sitegenesis-and-sfra-to-the-composable-storefront-as-a-developer/)? You may have, as it's the latest addition to the front-end options besides SiteGenesis and SFRA.

The Composable Storefront is a Headless storefront that connects to the back-end SFCC systems through the SCAPI. Although it used to be connected to the OCAPI due to some limitations with the [hooks](/how-to-use-ocapi-scapi-hooks/) system, the latest version is now fully connected to the SCAPI.

It's no secret that the Composable Storefront is the primary driver for these innovations.

Another point to SCAPI!

**OCAPI:** 1 **SCAPI:** 3

Oh my ... things aren't looking proper for the OCAPI.

## Infrastructure

{{< img-caption
  src="composable-storefront-architecture-54fe68c81a.jpg"
  alt="The Composable Storefront architecture"
>}}

The architectural setups of the OCAPI and SCAPI options are entirely different.

The OCAPI runs on the back end, the exact location as the Business Manager, [SFRA/SG](/sitegenesis-vs-sfra-vs-pwa/) storefront, and your custom code.

On the other hand, the SCAPI used to run through a MuleSoft instance managed by Salesforce. In the current architecture, CloudFlare workers have taken over that role.

Although the SCAPI has an extra layer in between, it gives Salesforce the flexibility to make their architecture more flexible (and composable) by allowing them to have one point of entry while being able to upgrade, fix, or replace parts without anyone noticing. By replacing MuleSoft with CloudFlare, the amount of network delay introduced should be minimal.

The OCAPI wins for its simplicity, but the SCAPI wins for its future-proof architecture. Nevertheless, this future-proof architecture can only work if it has been set up correctly, and we don't have any view into that black box.

So, for me, both of them get a point here!

**OCAPI:** 2 **SCAPI:** 4

## Rate Limits

APIs can be enjoyable to work with, but they are also vulnerable to DDoS attacks and poor design, leading to excessive API calls and a heavy server load. Yet, the OCAPI is designed to be safe and user-friendly, and CloudFlare and Salesforce-managed firewalls protect it to ensure server safety and limit the number of requests.

Although the rate-limiter is a straightforward "pass" or "block" method, it is essential to consider its impact and be prepared for the worst.

Contract Info: On a side note, all OCAPI calls are counted as "Storefront Requests", which are part of the contract.

The SCAPI has implemented a new "Load Shedding" system to replace rate limits. This system provides a comprehensive view of what is happening behind the scenes.

Not all SCAPI endpoints are on this new system yet; some are still protected by fixed rate limits.

**OCAPI:** 2 **SCAPI:** 5

## The Knockout: An Official Deprecation

For two years, this fight had a clear leader but no ending. The April 2026 deprecation notice is the referee stepping in.

Deprecated does not mean dead. Salesforce keeps the OCAPI running in maintenance mode, with security updates for two more years — so until around April 2028 — and no new features. New implementations must use the SCAPI, and existing OCAPI integrations are expected to have a migration plan.

Two years sounds generous until you hold it against an enterprise roadmap. An integration audit, a busy release calendar, a peak-season code freeze, and suddenly those two years are one. If the OCAPI is in your stack, this is the quarter to act:

- **Audit your OCAPI usage.** Include third-party cartridges: integrations like the Newstore example above talk to the OCAPI on your behalf, so their migration timelines become your migration timelines.
- **Map every endpoint to its SCAPI equivalent.** The Shop API has had equivalents for years; the recent Admin APIs now cover most of the Data API.
- **Port your hooks along with your calls.** Cartridges customise OCAPI behaviour through [hooks](/how-to-use-ocapi-scapi-hooks/), and the SCAPI hook system uses different scripts and signatures. An endpoint mapping that ignores hook logic covers only half the migration.
- **Move authentication to [SLAS](/how-to-set-up-slas-for-the-composable-storefront/)** and review your [API client setup](/the-deprecation-of-the-uuid-token-for-api-clients/).
- **Check your session bridge.** Hybrid storefronts that pass shoppers between a headless front-end and SFRA often rely on the [OCAPI session bridge](/what-is-the-ocapi-session-bridge/), which is deprecated along with the rest of the API. The SLAS session bridge is the supported replacement, and since release 25.3, [native Hybrid Auth](/slas-in-sfra-or-sitegenesis/) has taken over from the `plugin_slas` cartridge.
- **Watch the gaps.** System information and a few complex Data API tasks still require the OCAPI. Salesforce has committed to SCAPI alternatives for those as well, so keep an eye on the release notes before building anything new against them.

Point to the SCAPI, and the referee starts counting.

**OCAPI:** 2 **SCAPI:** 6

## Conclusion

The original version of this article ended with a reassurance: many SCAPI calls were proxies for OCAPI calls, so as long as the SCAPI depended on the OCAPI, it wasn't going anywhere. That reassurance now has an expiry date printed on it.

Nothing breaks tomorrow. Your OCAPI integrations keep working through the maintenance window, and the security patches keep coming. But "deprecated" changes the default for every architectural decision from here on: new integrations go to the SCAPI, and every existing OCAPI dependency is now technical debt with a countdown attached.

The judges' decision is in. The SCAPI wins — not on points, but because its opponent's corner threw in the towel.
