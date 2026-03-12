---
title: Salesforce B2C Commerce Cloud Documentation
description: >-
  Finding the documentation for a specific topic in Salesforce B2C Commerce
  Cloud can be a challenge sometimes. These are the options!
date: '2022-05-09T18:58:37.000Z'
lastmod: '2025-08-06T20:01:22.000Z'
url: /salesforce-b2c-commerce-cloud-documentation/
draft: false
heroImage: /wp-content/uploads/2022/05/documentation.jpg
categories:
  - Salesforce Commerce Cloud
tags:
  - documentation
  - sfcc
author: Thomas Theunen
---
Let's be direct. Navigating the Salesforce B2C Commerce Cloud documentation landscape has become a tactical challenge. For those of us who cut our teeth on platforms like Intershop, the sheer volume of official documentation Salesforce provides initially felt like a godsend. We had a central repository, the Infocenter, and while it had its quirks, it was our north star. That star has gone supernova.

In mid-2023, the Infocenter was retired, its contents scattered across a constellation of new sites. This move, while intended to modernise, has left many seasoned developers and architects adrift in a fragmented ecosystem. Finding a simple API method or a configuration guide now often feels like a digital scavenger hunt. This isn't just an inconvenience; it's a drag on productivity.

This article is not another list of stale links. It is a field manual, a strategic guide crafted for technical professionals in the trenches. Its purpose is to cut through the chaos, provide a precise and current map to the resources that matter, and offer an opinionated take on how to use them effectively. The current state of documentation is a direct reflection of the B2C Commerce platform's evolution—a pull between its monolithic past and its API-first, composable future.

Understanding this strategic context is the key to navigating the resources. This guide will provide that key.

## The Great Documentation Shuffle: Decommissioning the Infocenter

The single source of truth, `documentation.b2c.commercecloud.salesforce.com`, is officially a relic. On July 15, 2023, Salesforce retired the B2C Commerce Infocenter, a move that caused considerable friction within the developer community. The content wasn't deleted, but rather atomised and redistributed across three distinct platforms, each serving a different purpose and audience.

The three new homes for B2C Commerce documentation are:

1.  **Salesforce Help**: This is the new hub for content aimed at administrators and merchandisers. It covers topics like site administration, merchandising, and using Business Manager tools. It aligns B2C Commerce with the standard support and documentation model used across the broader Salesforce ecosystem.


2.  **Commerce Cloud Developer Center**: This is the primary destination for most developer-focused content, especially materials related to modern, headless development. This is where you will find documentation for SCAPI, PWA Kit, and composable storefronts.


3.  **Salesforce B2C Developer Documentation Resources**: Hosted on GitHub Pages, this site is a repository for deep technical references. It houses the B2C Commerce Script API documentation (`dw.*` packages), import/export schemas, and legacy developer documents that were preserved in [PDF](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/LegacyDeveloperDocumentation.pdf) format.




This migration wasn't a simple one-to-one mapping. Some outdated documentation, particularly for deprecated features, was archived into a single PDF to preserve the information without cluttering the new platforms. For developers with years of muscle memory tied to the Infocenter's structure, the following map is an essential tool for reorienting to the new landscape.

### The Infocenter Relocation Map

| Old Infocenter Section | Audience | New Location & Direct Link |
| --- | --- | --- |
| B2C Commerce Release Notes | Administrator & Developer | [https://help.salesforce.com/s/articleView?id=sf.b2c\_rn\_release\_notes.htm&type=5](https://help.salesforce.com/s/articleView?id=sf.b2c_rn_release_notes.htm&type=5) |
| Developing Your Site | Developer | [https://developer.salesforce.com/docs/commerce/b2c-commerce/overview](https://developer.salesforce.com/docs/commerce/b2c-commerce/overview) |
| Open Commerce API (OCAPI) | Developer | [https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/api-doc.html](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/api-doc.html) |
| B2C Commerce API (Script API) | Developer | [https://salesforcecommercecloud.github.io/b2c-dev-doc/](https://salesforcecommercecloud.github.io/b2c-dev-doc/) |
| Merchandising Your Site | Administrator & Merchandiser | [https://help.salesforce.com/s/articleView?id=cc.b2c\_merchandising.htm&type=5](https://help.salesforce.com/s/articleView?id=cc.b2c_merchandising.htm&type=5) |
| Administering Your Organization | Administrator & Merchandiser | [https://help.salesforce.com/s/articleView?id=cc.b2c\_administering.htm&type=5](https://help.salesforce.com/s/articleView?id=cc.b2c_administering.htm&type=5) |
| B2C Commerce Security Guide | Administrator & Developer | [https://help.salesforce.com/s/articleView?id=sf.b2c\_security\_guide.htm&type=5](https://help.salesforce.com/s/articleView?id=sf.b2c_security_guide.htm&type=5) |
| Legacy Developer Documentation | Developer | [https://salesforcecommercecloud.github.io/b2c-dev-doc/](https://salesforcecommercecloud.github.io/b2c-dev-doc/) |

## In the Trenches: The Unofficial SFCC Community (CommerceCrew)

Official documentation can tell you how a feature is _supposed_ to work. The community tells you how it _actually_ works in the wild. In a complex and rapidly evolving ecosystem like B2C Commerce, active participation in community channels is no longer a "nice to have"—it is a required competency for any top-tier professional.

For real-time problem-solving, debugging complex issues, and getting feedback on architectural patterns, the **Unofficial SFCC Slack community (CommerceCrew)** is an indispensable, primary resource. It is often faster and more practical than logging an official support ticket.

-   **How to Join:** The correct and direct way to join is via the community's official website: **[https://unofficialsfcc.com/](https://unofficialsfcc.com/)**.


-   **What's Inside:** This hub provides access to several key resources :
    -   The **Slack workspace**, with over 12,000 members, includes developers, architects, and even Salesforce employees who actively help answer questions.


    -   **Open Source Projects** on GitHub, offering shared tools and resources.


    -   The **Podcasts** provide news and deep dives into relevant topics.



The existence and vibrancy of communities like CommerceCrew and the official Trailblazer Community Groups underscore a critical shift in professional practice. The platform's complexity and the pace of change mean that relying solely on static documentation is an inefficient strategy. The modern SFCC expert's toolkit includes not only their code and official docs but also their network and their active engagement with peers. This collaborative ecosystem is where the toughest problems are solved and where true mastery is forged.

## Your Trailhead Compass: Strategic Learning for Technical Experts

![Astro cheering](/media/2022/trailhead-commerce-29dc66c342.png)

-   [https://trailhead.salesforce.com/](https://trailhead.salesforce.com/trails?products=commercecloud&sort=NEWEST)

Trailhead is Salesforce's free, online learning platform, and it's an ocean of content. For an experienced developer or architect, the challenge isn't a lack of information, but finding the advanced, relevant modules without wading through introductory material. This curated compass points directly to the trails and modules that provide the most value for technical experts.

### Your Trailhead Compass: Essential Learning Paths

| Learning Goal | Recommended Trail/Module |
| --- | --- |
| **Mastering the Dev Environment** | [https://trailhead.salesforce.com/content/learn/modules/cc-digital-for-developers](https://trailhead.salesforce.com/content/learn/modules/cc-digital-for-developers) |
| **Architectural Foundation** | [https://trailhead.salesforce.com/en/content/learn/trails/build-your-career-as-a-salesforce-b2c-commerce-technical-architect](https://trailhead.salesforce.com/content/learn/modules/architecture-of-sf-b2c-commerce) |
| **Headless Development** | [https://trailhead.salesforce.com/en/content/learn/modules/b2c-headless-commerce-basics](https://trailhead.salesforce.com/content/learn/modules/headless-commerce-basics) |
| **On-Demand Sandboxes** | [https://trailhead.salesforce.com/content/learn/modules/b2c-on-demand-sandbox](https://trailhead.salesforce.com/content/learn/modules/b2c-on-demand-sandbox) |
| **Functional Implementation** | [https://trailhead.salesforce.com/content/learn/modules/b2c-implement-functional-solution](https://trailhead.salesforce.com/content/learn/modules/b2c-implement-functional-solution) |

## Partner Learning Camp: The Insider's Track

![](/media/2022/5b7a39ea-b9bc-486b-9ca3-c77ab5a306b1-e1653998526739-e73418c862.jpeg)

-   [https://partnerlearningcamp.salesforce.com/s/learner-dashboard](https://partnerlearningcamp.salesforce.com/s/learner-dashboard)

While Trailhead is the public square for Salesforce knowledge, the Partner Learning Camp (PLC) is the exclusive, members-only club for Salesforce partners and employees. This is not just a rebranded Trailhead; it is a distinct learning destination designed to give partners the specialised knowledge needed to meet complex customer demands.

The PLC offers curricula on topics like SFRA, Headless development, PWA Kit, and Architect Success, along with formal accreditations that go beyond standard Trailhead badges. Access is gated through the Salesforce Partner Community, ensuring the content, some of which was previously available only to internal Salesforce employees, remains a strategic asset for the partner ecosystem. For any partner organisation, engaging with the PLC is a critical step in levelling up their team's capabilities.

## Salesforce Architects: The Multi-Cloud Command Center

![The Solution Architect certification diagram.](/media/2022/solution-architect-33ece62704.png)

-   [https://architect.salesforce.com/](https://architect.salesforce.com/)

While the Developer Centre is for hands-on coding, architect.salesforce.com is the strategic command centre for those designing the blueprints. This is the home base for Salesforce Architects but with a critical distinction: its lens is wide, focusing on multi-cloud architecture and the core Salesforce platform, not just B2C Commerce.

Here, you'll find high-level resources essential for system design: architect decision guides, diagram templates, operating models, and even product roadmaps that give a glimpse into the future. While you won't find a deep dive on a specific `dw.*` package, you will find the patterns and best practices for integrating B2C Commerce into a larger Salesforce ecosystem.

For the B2C architect, this site is less about the 'how' of a single platform and more about the 'what' and 'why' of a connected, multi-cloud solution.

## The Map in Your Hands

The Salesforce B2C Commerce documentation landscape has undeniably become more complex. The days of a single, centralised Infocenter are over, replaced by a distributed system that mirrors the platform's own architectural evolution. This fragmentation presents a challenge, but not an insurmountable one.

This field manual has provided a clear map to this new territory. It has charted the new locations of critical resources, provided a strategic framework for choosing between OCAPI and SCAPI, and curated the essential toolkits for coding, configuration, and continuous learning. It has been highlighted that the path to expertise now runs not only through official documentation but also through active participation in the vibrant community of professionals who build on this platform every day. The landscape has changed, but the tools to master it are all here.

The map is now in your hands. Go build something incredible.
