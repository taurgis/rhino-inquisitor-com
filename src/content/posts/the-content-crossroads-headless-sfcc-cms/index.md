---
title: 'The Content Crossroads: Choosing a CMS for Headless SFCC'
description: >-
  Compares Business Manager, Salesforce CMS, a headless CMS, and SFCC-as-BFF
  for headless-storefront content, and when each pattern earns its cost.
date: '2026-07-13T15:00:00.000Z'
lastmod: '2026-07-13T15:00:00.000Z'
url: /the-content-crossroads-headless-sfcc-cms/
draft: true
heroImage: content-crossroads-hero.png
heroImageAlt: >-
  A cartoon developer standing at a crossroads with four signposted paths
  leading to buildings labeled Business Manager, Salesforce CMS, Headless
  CMS, and BFF.
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - cms
  - headless
  - composable storefront
  - sfcc
  - pwa kit
author: Thomas Theunen
takeaways:
  - "Maps four content-integration patterns for headless SFCC against real trade-offs: Business Manager/Page Designer, Salesforce CMS, a dedicated headless CMS, and SFCC-as-BFF"
  - "Warns where direct-frontend and batch-sync approaches break down under localisation, personalisation, and preview requirements"
  - "Clarifies that SLAS Trusted Agent (TAOB) and Session Bridge solve call-centre account access, not content delivery, despite the two topics getting conflated"
---
Someone in `#headless` posted a one-line ask last month: "anyone got a clean way to call the Contentful API from PWA Kit?" Four people answered with four different architectures before anyone asked why Contentful was already the assumption. Nobody had decided that Business Manager's content slots weren't enough, or that Salesforce's own CMS wasn't on the table, or that a nightly sync job wouldn't do the job just as well. The team skipped the decision and went straight to building it.

That's not a knock on the person who asked. It's the default failure mode for this question. "How do we handle content in our headless storefront" sounds like an implementation detail, so it gets answered like one, fast, by whoever's already comfortable with a particular CMS. This one carries a multi-year blast radius, though, and it deserves the five minutes of "wait, which pattern are we even choosing" that it usually skips.

## Why This Keeps Coming Up

Two questions actually decide this, and most threads never ask either one out loud.

Who authors the content, and how often? A marketer publishing a flash-sale banner three times a week needs a different tool than a developer who touches the homepage twice a year. Business Manager's Page Designer is fine for the second case and a bottleneck for the first, because every change routes through whoever has cartridge access.

How many channels does the content need to reach? If it's the B2C storefront and nothing else, keeping content close to the storefront is a reasonable default. If the same banner also needs to show up in a mobile app, an Experience Cloud portal, or a B2B storefront, content locked inside one platform's content slots means rebuilding it by hand everywhere else it's needed.

Everything below is a way of answering those two questions differently.

## Pattern 1: Business Manager (Page Designer and Content Slots)

This is the pattern nobody chose on purpose. It ships with every B2C Commerce instance by default, so it's usually already running before "headless content strategy" becomes a phrase anyone says in a meeting.

It's a fine default when a single team owns both the storefront and the content, and content changes are infrequent enough that going through Business Manager isn't a bottleneck. The failure mode shows up the moment content needs a second home. Salesforce's own [training material on this](https://trailhead.salesforce.com/content/learn/modules/b2c-page-designer-cms/b2c-explore-cms-page-designer) walks through a merchandiser who authors a blog post inside Business Manager, only to find it's "locked to that front-end and can't be shared across other channels." Every other channel means reproducing the same content by hand, and that cost compounds with every new channel the business adds.

## Pattern 2: Salesforce CMS + Page Designer

This is the pattern most `#headless` threads skip past entirely, usually because it doesn't come up until someone's already deep into evaluating Contentful and Contentstack. [Salesforce CMS](https://trailhead.salesforce.com/content/learn/modules/b2c-page-designer-cms/b2c-explore-cms-page-designer) is Salesforce's own headless content service, built on the core platform and connected to Page Designer through a dedicated connector. A merchandiser creates and manages content types in Salesforce CMS; a developer builds a Page Designer component type against that content; the same merchandiser then picks which piece of Salesforce CMS content fills that component on a page.

The win over raw Business Manager content is real: content lives in one place and can be reused across B2C Commerce, Experience Cloud, and other Salesforce-connected channels, instead of being retyped per channel. The catch is that "native" doesn't mean "free." It's a separate product with its own licensing and setup, and its reach stops at the edge of the Salesforce ecosystem — if a channel isn't built on Salesforce, Salesforce CMS doesn't get you there any more directly than Business Manager content did.

## Pattern 3: A Dedicated Headless CMS, Called Directly From the Frontend

This is the pattern the opening Slack thread defaulted to: PWA Kit (or Storefront Next, or a mobile app) calls Contentful's or Contentstack's API straight from the client, alongside the SCAPI calls it's already making. Both vendors ship pre-built [Composable Storefront integrations](https://appexchange.salesforce.com/appxListingDetail?listingId=a0N4V00000HDdn4UAD), so this isn't a from-scratch build.

This is the strongest option when marketers genuinely need to self-serve across many channels and the CMS vendor's authoring tools are better than anything Salesforce ships. It's also the pattern that quietly doubles your problems instead of solving them. The frontend now holds two separate auth boundaries, one for SCAPI and one for the CMS, and if the CMS content needs to be personalised against shopper data, that data has to be threaded into a system that has no native concept of an SFCC customer or basket. Preview also gets solved twice: SFCC has its own staging/preview conventions, and the CMS has its own, and nothing keeps the two in sync automatically. None of that is a reason to avoid a dedicated CMS. Budget for the integration work up front instead, so it doesn't turn up mid-sprint.

## Pattern 4: SFCC as a BFF, Calling the CMS Server-Side

Instead of the frontend talking to both SCAPI and the CMS, the storefront's backend-for-frontend layer becomes the only thing that talks to the CMS. It fetches content server-side, merges it with whatever commerce data the page needs, and hands the frontend one response. Salesforce uses this exact term, "BFF," in its own [session bridging guidance](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas-session-bridge-overview.html) for the headless aggregation layer sitting in front of SCAPI, so this isn't third-party jargon grafted onto the platform. It's the same layer PWA Kit and Storefront Next already use for commerce data, just extended to cover content too.

Consolidating like this buys one auth boundary, one caching layer, and one place to reconcile CMS content with shopper context before anything reaches the browser. What it costs is ownership: the BFF now holds aggregation logic that neither the commerce team nor the content team fully owns alone, and it becomes a dependency both sides have to touch whenever either side ships a change. Server-side aggregation also adds a hop, and a CMS API that's slow to respond is now on the storefront's critical rendering path, not off to the side where a slow blog widget would only be a cosmetic problem.

{{< img-caption src="bff-vs-direct-frontend.png" alt="Split cartoon: a browser character reaching directly into a CMS building beside an SFCC building, versus the browser handing a parcel to a small BFF robot standing between the SFCC and CMS buildings." caption="Direct-from-frontend keeps the CMS decoupled from SFCC; routing through the BFF gives up that separation in exchange for one auth boundary instead of two." >}}

## Batch Sync: Push CMS Content Into SFCC Content Assets

The oldest pattern of the four, and still a legitimate one: a scheduled job pulls content from the CMS and writes it into SFCC as content assets or Page Designer components, instead of SFCC or the frontend calling the CMS live. Operationally, this is the simplest option on the list. There's no runtime dependency on an external API, no new auth boundary at request time, and if the CMS goes down, the storefront doesn't notice until the next sync.

The trade-off is staleness. A content editor's change doesn't reach shoppers until the next job run, which is a bad fit for anything time-sensitive; nobody wants to explain to merchandising why the flash-sale banner is still showing yesterday's price because the sync job runs on the hour. It's a strong fit for structured, slow-changing content: product story pages, legal copy, evergreen editorial. It's the wrong choice for anything that needs to go live the moment someone clicks publish.

## Hybrid: Different Content, Different Pattern

Most real projects don't pick one pattern for the whole site. They pick per content type. Legal and boilerplate pages stay in Business Manager because they change rarely and don't need omnichannel reach. Editorial and marketing content moves to Salesforce CMS or a dedicated headless CMS because that's where the authoring velocity and multi-channel reuse actually matter. A batch sync handles the slow-moving middle ground. That's not indecision. It's matching each content type to the pattern that fits its actual authoring cadence and reach, instead of forcing one architecture to serve every kind of content equally badly.

## A Decision Heuristic

None of the four patterns above is wrong in isolation. Wrong is picking one before checking it against what the content and the team actually need.

| If this is true | Lean towards |
| --- | --- |
| Low content-change frequency, single storefront, dev-owned content | Business Manager (Page Designer) |
| Marketer-authored, needs reach across other Salesforce channels | Salesforce CMS |
| Marketer-authored, needs reach beyond Salesforce, budget for a CMS contract | Dedicated headless CMS, direct frontend calls |
| Same as above, plus personalisation against shopper data or a single auth boundary matters | Dedicated headless CMS, called from an SFCC BFF |
| Structured, slow-changing content; no runtime dependency wanted | Batch sync into SFCC content assets |

## The Call-Centre Mix-Up: TAOB Is Not a Content Pattern

The same `#headless` and `#b2c-general` threads that raise the CMS question tend to raise a second one right after it: how does a call-centre agent "become" a shopper in a headless setup? That's a real and useful question. It just isn't a content question, and answering it with a CMS pattern is where the confusion starts.

What actually handles it is [SLAS Trusted Agent on Behalf (TAOB)](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas-trusted-agent.html), paired with the Session Bridge I've [written about before](/what-is-the-ocapi-session-bridge/). TAOB is an authorization flow, not a content-delivery mechanism: a call-centre agent authenticates through Account Manager, and Salesforce swaps that authentication for a token scoped to a specific shopper's account, using the `sfcc.ta_ext_on_behalf_of` scope on a dedicated SLAS client. On the Business Manager side, the agent needs the `Login_On_Behalf` and, if they're placing orders for the shopper, `Create_Order_On_Behalf` functional permissions. The resulting token is deliberately short-lived, fifteen minutes, and can't be refreshed; the agent has to restart the flow if the call runs long. None of this touches how content reaches the storefront. It touches who's allowed to act as whom, for how long, and with what permissions once they're acting.

The two problems get conflated because both involve "something in the middle" between a shopper and the storefront: a CMS in the content case, an agent in the TAOB case. But a CMS integration decides where content lives and how it gets to the page. TAOB decides who's allowed to touch a shopper's cart and account, and for how long. Solve the wrong one and you'll end up building session-bridging logic to fix a content problem, or CMS integration work to fix an authorization problem. Neither will land.

## Back to That Slack Thread

The developer who asked about calling Contentful from PWA Kit got their answer eventually, and it wasn't wrong, exactly. It was just decided by momentum instead of by anyone weighing the other three options against what the content team actually needed. Next time that question shows up in `#headless`, the useful first reply isn't a code snippet. It's "which pattern did we actually pick, and why."
