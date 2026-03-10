---
title: What does the Composable Storefront mean for SFCC Developers?
description: >-
  Over the past year, I have seen increasing gossip (which I am partly to blame
  for) and discussions about what the Composable Storefront release means fo...
lastmod: '2023-01-30T18:11:48.000Z'
url: /what-does-the-composable-storefront-mean-for-sfcc-developers/
draft: false
heroImage: /media/2022/e0468610-0e86-403f-b486-743a38d4b763-d68cf607f8.png
date: '2023-01-30T07:59:37.000Z'
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - ohana
  - sfcc
  - technical
author: Thomas Theunen
---
Over the past year, I have seen increasing gossip (which I am partly to blame for) and discussions about what the Composable Storefront release means for development in Salesforce B2C Commerce Cloud. A comparison can be made to what has happened to [pipelines](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/LegacyDevDoc/WorkingwithPipelines.html) and [SiteGenesis](https://production-sitegenesis-dw.demandware.net/on/demandware.store/Sites-SiteGenesis-Site), and we found out [in September last year that many things are afoot](/what-is-commerce-on-core/)!

## Technology changes

[![Image depicting 120 years of Moore’s Law](/media/2022/e094f768-3336-403f-8c75-9013cb07df2f-b7c7a5e8f2.png)](/media/2022/e094f768-3336-403f-8c75-9013cb07df2f-b7c7a5e8f2.png)

**Let us get one thing out of the way first. This article is my opinion and my opinion alone.**

As commerce and web developers, we are constantly reminded that technology never stands still. The world is rapidly evolving, and it's up to us to adapt and evolve with it. The rise of "Headless, API First, Composable Commerce, MACH Alliance, etc." has brought new opportunities to the eCommerce world.

Salesforce has introduced a solution to meet this demand: the [Composable Storefront](/sitegenesis-vs-sfra-vs-pwa/). This is an entirely different type of implementation built on React, a more modern library than we are used to in SiteGenesis and SFRA. It's an exciting new development that will support businesses' requirements now and ones they will have in the future.

I understand that there may be some concerns in the community about SFRA being phased out in favour of the "Core" with this move to Headless. However, [I don't see that happening within the next five years](/what-is-commerce-on-core/). But we need to adapt.
Is it really so bad that the platform is evolving to a more modern "composable" architecture? We don't want to be left behind, and we don't want the words of our competitors to come true - that Salesforce B2C Commerce Cloud is a dinosaur. We are so much more than that, and it's up to us to prove it.

Let's embrace this change, take on the challenge, and make sure that Salesforce B2C Commerce Cloud is at the forefront of eCommerce technology. We are the ones shaping the future of commerce. Let's make it a bright one.

_**That felt like an inspirational speech, didn't it?**_

## Advantages of a monolith

![](/media/2023/salesforce-commerce-cloud-monolith-e3f50eb05b.jpg)

I'll make sure to make one thing clear. Monolithic architecture has its advantages!

First and foremost, it's easier to develop, test and deploy. All the codebase is in one place, meaning there's less need for inter-service communication and less complexity. This makes it easier for developers (and businesses) to understand the flow of the application and more straightforward to debug and fix issues.

With a monolithic approach, you can quickly scale up the entire application by adding more resources rather than scaling each microservice individually.

A monolithic architecture may not be as trendy as microservices, but it has its perks!

**_And sometimes, simplicity is the key to success._**

## The Composable Storefront uses "boring" technology

React.JS is something you can refer to as "boring" technology. This is because it has been around for several years and has proven to be a reliable and stable option as a platform for developers. Unlike newer and more experimental technologies, React.JS has a [large and active community of developers](https://reactjs.org/community/support.html) who have created a wide range of tools and resources for working with the library.

Newer, more experimental libraries can be dangerous as they are often untested and unproven, leading to possible bugs and compatibility issues. They may also have a smaller community of developers, which can result in a lack of support and resources.

If you attended the training or participated in the Slack conversations with the team, you will have noticed the emphasis on stability, broad developer base, and community support as critical factors in selecting the technologies used.

### More competition and less niche

Unsurprisingly, experienced Salesforce B2C Commerce Cloud developers are in high demand. But with the addition of the PWA Kit, a new source of developers with Node.js and React experience opens up - removing a bit of the "niche" flavour.

This is good news for customers, but that also means we have more competition as developers. But not to worry, this "new source" still needs to catch up on how eCommerce and Salesforce works.

But honestly, as it stands, there is room for both of us in the Commerce Crew!

### Other platforms

Other platforms, such as Shopify ([Hydrogen](https://hydrogen.shopify.dev/) and Oxygen) and SAP ([Composable Storefront](https://help.sap.com/docs/SAP_COMMERCE_COMPOSABLE_STOREFRONT/6c7b98dbe68f4a508cac17a207182f4c/c9dcbd1ca0ec4219ac3c51b29c44625e.html?version=5) 🙄), have adopted headless solutions, meaning that we as developers need to recognise the fierce competition in this space. As more platforms enter the market offering similar solutions, Salesforce must continue differentiating itself and stay ahead in innovation and customer satisfaction.

This competition serves as a reminder that complacency is not an option and drives the need for continued investment and improvements in the Commerce Cloud platform.

## Willingness to learn and evolve

[![A women holding a laptop displaying the text “never stop learning”.](/media/2022/never-stop-learning-g3bc2c211b-1920-3142164f98.jpg)](/media/2022/never-stop-learning-g3bc2c211b-1920-3142164f98.jpg)

As developers and architects working in eCommerce, we must stay ahead of the constantly evolving technology landscape. This is especially true when working in a SaaS environment, where platforms continually update and change to meet the market's demands (and these updates are out of our control).

Luckily, we can provide input to make some corrections here and there. But Salesforce is the captain of this boat! And that captain is giving developers and architects some really nice new options.

And now is the time to start learning how these new options work. Customers will be looking into them to migrate to now or in the next few years.
Salesforce has provided us with a lot of options to learn how to work with React and the PWA Kit, offering courses on the [Partner Learning Camp](http://partnerlearningcamp.salesforce.com) and allowing us to ask questions to the team on the [Unofficial Slack](https://github.com/sfcc-unofficial/docs). Not all platforms (and the teams building them) provide this service.

However, it's important to note that while the platform is evolving, it doesn't mean that SFRA projects will disappear in the near future. There will still be a need for developers and architects who can maintain and support them.

There will still be a fair share of projects starting today on SFRA!

## What about back-end development?

That knowledge is transferrable! The Rhino Engine and ISML are still crucial for creating custom Business Manager modules and API hooks, and we will need a lot of this type of development in the coming years. And who knows, we might even be able to build custom SCAPI endpoints using the same system as controllers soon!

This knowledge is critical to the success of projects, as customisations to SCAPI, OCAPI, and Business Manager will be in high demand.

To make things easier, do we need a BFRA (Back-End Reference Architecture) to assist us along the way? _I need to stop coming up with new ideas...but hey, who needs sleep?_

### Hybrid deployments

A potential path for existing Salesforce B2C Commerce Cloud customers is [the "hybrid" or "phased rollouts" solution](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/phased-headless-rollouts.html?q=phased). With this approach, you gradually migrate away from SiteGenesis or SFRA one page type at a time. For example, you can start with content pages, move on to lister and product detail pages, and finish with the checkout. This has several benefits:

-   No big-bang release
-   Risk is spread over time
-   More current-budget-friendly
-   One big development team, separate development teams, or something in between -> flexibility!



Additionally, this also provides an opportunity for experienced SFCC developers:

-   The perfect chance to transition into the Composable Storefront, one page-type at a time
-   Keeps the know-how of both setups fresh

## Career Aspirations

As developers and architects, it is crucial that we not only stay up-to-date with the latest technologies but also constantly question our own aspirations and career goals. As the landscape evolves, it is essential to consider whether remaining in a specific environment aligns with our long-term plans.

The question we must ask ourselves is not just whether we are capable of adapting to the changing landscape, but whether we are willing to do so. Are we content with simply maintaining the status quo, or do we strive to be at the forefront of innovation and progress?

The future is uncertain, and it's hard to predict when certain technologies or skills will become obsolete. But as true professionals, we should be ready to embrace change and uncertainty, and always look for new opportunities and challenges to learn and grow.

So, let's ask ourselves, are we content with being a mere spectator of the eCommerce landscape or do we want to be a driving force shaping its future?

**_The choice is ours._**
