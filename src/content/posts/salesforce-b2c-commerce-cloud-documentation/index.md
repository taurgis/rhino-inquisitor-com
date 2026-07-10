---
title: Salesforce B2C Commerce Cloud Documentation
description: >-
  Finding the documentation for a specific topic in Salesforce B2C Commerce
  Cloud can be a challenge sometimes. These are the options!
date: '2022-05-09T18:58:37.000Z'
lastmod: '2026-07-10T17:06:46.000Z'
url: /salesforce-b2c-commerce-cloud-documentation/
draft: false
heroImage: documentation-ea8c96aa90.jpg
categories:
  - Salesforce Commerce Cloud
tags:
  - documentation
  - sfcc
author: Thomas Theunen
takeaways:
  - "Maps the post-Infocenter Salesforce B2C Commerce documentation landscape across Help, Developer Centre, and GitHub-hosted references"
  - "Explains how official docs, Trailhead, Partner Learning Camp, and community channels each serve different technical needs"
  - "Acts as a field guide for navigating fragmented SFCC documentation more efficiently"
---
Let's get this out of the way: the single Infocenter search bar is gone. If you cut your teeth on a platform like Intershop before landing on B2C Commerce, that central repository was probably the first thing that impressed you about Salesforce's documentation. It had its quirks, but it was one search box for everything.

In mid-2023, Salesforce retired the Infocenter and split its contents across three separate sites. The move was pitched as modernisation, and for anyone who'd built years of muscle memory around the old structure, it landed instead as three new places to get lost in. Finding a simple API method or a configuration guide can now mean three tabs open and a bit of guesswork about which site actually has it.

This isn't another set of links to bookmark and forget. It's what I actually reach for day to day, plus an honest opinion on which of these sites is worth your time for a given question. The mess mirrors the platform itself, caught between its monolithic past and its API-first, composable future — the documentation hasn't settled any more than the platform has.

## The Great Documentation Shuffle: Decommissioning the Infocenter

The single source of truth, `documentation.b2c.commercecloud.salesforce.com`, doesn't exist as its own site any more — it now redirects straight into Salesforce Help. Salesforce retired the B2C Commerce Infocenter on July 15, 2023, and moved its content — not deleted, just redistributed — across three separate platforms.

The three new homes for B2C Commerce documentation are:

1. **Salesforce Help:** This is the new hub for content aimed at administrators and merchandisers — site administration, merchandising, Business Manager tools. It puts B2C Commerce on the same Help site as every other Salesforce cloud, for better or worse.

1. **Commerce Cloud Developer Centre:** This is the primary destination for most developer-focused content, especially anything headless. This is where you will find documentation for SCAPI (Salesforce Commerce API), PWA Kit, and composable storefronts.

1. **Salesforce B2C Developer Documentation Resources:** Hosted on GitHub Pages, this site is a repository for deep technical references. It houses the B2C Commerce Script API documentation (`dw.*` packages), import/export schemas, and legacy developer documents that were preserved in [PDF](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/LegacyDeveloperDocumentation.pdf) format.

This migration wasn't a simple one-to-one mapping. Some outdated documentation, particularly for deprecated features, was archived into a single PDF to preserve the information without cluttering the new platforms. If you still remember exactly where things lived in the old Infocenter, here's where each section landed:

### The Infocenter Relocation Map

| Old Infocenter Section | Audience | New Location & Direct Link |
| --- | --- | --- |
| B2C Commerce Release Notes — moved again as of release 26.3 | Administrator & Developer | [https://help.salesforce.com/s/articleView?id=release-notes.rn_b2c.htm&language=en_US&type=5](https://help.salesforce.com/s/articleView?id=release-notes.rn_b2c.htm&language=en_US&type=5) |
| Developing Your Site | Developer | [https://developer.salesforce.com/docs/commerce/b2c-commerce/overview](https://developer.salesforce.com/docs/commerce/b2c-commerce/overview) |
| Open Commerce API (OCAPI) — **deprecated, see note below** | Developer | [https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/api-doc.html](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/api-doc.html) |
| B2C Commerce API (Script API) | Developer | [https://salesforcecommercecloud.github.io/b2c-dev-doc/](https://salesforcecommercecloud.github.io/b2c-dev-doc/) |
| Merchandising Your Site | Administrator & Merchandiser | [https://help.salesforce.com/s/articleView?id=cc.b2c_merchandising_your_site.htm&type=5](https://help.salesforce.com/s/articleView?id=cc.b2c_merchandising_your_site.htm&type=5) |
| Administering Your Organisation | Administrator & Merchandiser | [https://help.salesforce.com/s/articleView?id=cc.b2c_administering_your_organization.htm&type=5](https://help.salesforce.com/s/articleView?id=cc.b2c_administering_your_organization.htm&type=5) |
| B2C Commerce Security Guide | Administrator & Developer | [https://help.salesforce.com/s/articleView?id=cc.b2c_commerce_security_guide.htm&type=5](https://help.salesforce.com/s/articleView?id=cc.b2c_commerce_security_guide.htm&type=5) |
| Legacy Developer Documentation | Developer | [https://salesforcecommercecloud.github.io/b2c-dev-doc/](https://salesforcecommercecloud.github.io/b2c-dev-doc/) |

> [!NOTE]
> That OCAPI row in the map above is now a historical entry, not a live recommendation. Salesforce's own [OCAPI reference page](https://developer.salesforce.com/docs/commerce/b2c-commerce/references) now opens with "Attention! The Open Commerce API (OCAPI) is now deprecated," and its title renders as "Open Commerce API (deprecated)" in search results. If you're deciding what to build against today, that decision is already made: use the SCAPI. For the full picture on what changed and how to migrate, see [In the ring: OCAPI versus SCAPI](/in-the-ring-ocapi-versus-scapi/).

## In the Trenches: The Unofficial SFCC Community (CommerceCrew)

Official documentation can tell you how a feature is _supposed_ to work. The community tells you how it _actually_ works in the wild. B2C Commerce changes fast enough that skipping the community channels is a bad bet.

For real-time problem-solving, debugging complex issues, and getting feedback on architectural patterns, the **Unofficial SFCC Slack community (CommerceCrew)** is usually faster and more practical than logging an official support ticket.

- **How to Join:** Join via the community's official website: [https://unofficialsfcc.com/](https://unofficialsfcc.com/).

- **What's Inside:** This hub covers:
- The **Slack workspace**, with over 12,000 members, includes developers, architects, and even Salesforce employees who answer questions themselves.

- **Open Source Projects** on GitHub, plus a set of unofficial SFCC logos and icons if you need those too.

- The **Unofficial SFCC Podcast** — a new episode every other Tuesday, with a companion YouTube channel.

CommerceCrew and the official Trailblazer Community Groups exist for a reason: static documentation can't keep pace with a platform that ships this often. In my experience, the toughest bugs usually get solved in a Slack thread before they get solved in a doc page — so treat your network the same way you treat your bookmarks folder.

## Your Trailhead Compass: What's Actually Worth Your Time

{{< img-caption src="trailhead-commerce-29dc66c342.png" alt="Astro the Trailhead mascot cheering with arms raised next to a shopping cart icon, representing Commerce Cloud Trailhead content." >}}

- [Get Started with Salesforce B2C Commerce](https://trailhead.salesforce.com/content/learn/trails/get-started-with-salesforce-b2c-commerce) (admin/merchandiser trail) or [Develop for Salesforce B2C Commerce](https://trailhead.salesforce.com/content/learn/trails/develop-for-commerce-cloud) (developer trail)

Trailhead is Salesforce's free, online learning platform, and there's a lot of it. For an experienced developer or architect, the problem is volume: finding the advanced modules means wading through a pile of introductory material first. The list below skips straight to what's worth your time as a technical expert.

### Essential Learning Paths

| Learning Goal | Recommended Trail/Module |
| --- | --- |
| **Mastering the Dev Environment** | [https://trailhead.salesforce.com/content/learn/modules/cc-digital-for-developers](https://trailhead.salesforce.com/content/learn/modules/cc-digital-for-developers) |
| **Architectural Foundation** | [https://trailhead.salesforce.com/content/learn/trails/build-your-career-as-a-salesforce-b2c-commerce-technical-architect](https://trailhead.salesforce.com/content/learn/trails/build-your-career-as-a-salesforce-b2c-commerce-technical-architect) |
| **Headless Development** | [https://trailhead.salesforce.com/content/learn/modules/b2c-headless-commerce-basics](https://trailhead.salesforce.com/content/learn/modules/b2c-headless-commerce-basics) |
| **On-Demand Sandboxes** (now branded Agentforce Commerce) | [https://trailhead.salesforce.com/content/learn/modules/b2c-on-demand-sandbox](https://trailhead.salesforce.com/content/learn/modules/b2c-on-demand-sandbox) |
| **Functional Implementation** | [https://trailhead.salesforce.com/content/learn/modules/b2c-implement-functional-solution](https://trailhead.salesforce.com/content/learn/modules/b2c-implement-functional-solution) |

## Partner Learning Camp: The Insider's Track

{{< img-caption src="5b7a39ea-b9bc-486b-9ca3-c77ab5a306b1-e1653998526739-e73418c862.jpeg" alt="Partner Learning Camp dashboard used to introduce the partner-only training track." >}}

- [https://partnerlearningcamp.salesforce.com/s/learner-dashboard](https://partnerlearningcamp.salesforce.com/s/learner-dashboard)

While Trailhead is the public square for Salesforce knowledge, the Partner Learning Camp (PLC) is the members-only counterpart for Salesforce partners and employees, built around the specialised knowledge partners actually need on customer projects.

The PLC runs over 200 courses, plus "Accredited Professional" credentials that go beyond standard Trailhead badges. Access is gated through the Salesforce Partner Community, so there's no public syllabus I can point you to — I can't tell you exactly which B2C Commerce tracks are in there this quarter, only that if your partner organisation isn't using the PLC at all, that's training budget left on the table.

## Salesforce Architects: The Multi-Cloud Command Centre

{{< img-caption src="solution-architect-33ece62704.png" alt="Pyramid diagram of the Salesforce Solution Architect certification path, with B2B and B2C Solution Architect at the top tier above supporting certifications such as Data Architect and Integration Architect." caption="Treat this as illustrative rather than current — Salesforce reshuffles certification prerequisites often, so check Trailhead for the exact chain before you plan a study path." >}}

- [https://architect.salesforce.com/](https://architect.salesforce.com/)

While the Developer Centre is for hands-on coding, architect.salesforce.com is the command centre for those designing the blueprints. It's the home base for Salesforce Architects generally, so its lens covers multi-cloud architecture and the core Salesforce platform — B2C Commerce is one piece of a much bigger picture here.

Here, you'll find the resources architects actually use: decision guides, reference diagrams, and product roadmaps. You won't find a deep dive on a specific `dw.*` package, but you will find the patterns for fitting B2C Commerce into a larger Salesforce ecosystem.

For the B2C architect, this site works at the decision layer, not the implementation layer.

## Where things stand now

The single Infocenter is gone, and it's not coming back. What's left is three official sites instead of one, plus Trailhead, the Partner Learning Camp, and a Slack community that's often faster than any of them — including a flag on that OCAPI row in the relocation map, now that it's deprecated rather than just relocated.

None of that is going away either. In my experience, once you've bookmarked the right handful of pages, and joined CommerceCrew for the rest, the extra tabs stop being an inconvenience and start being just how you work. Give it a few weeks.
