---
title: What Composable Storefront Means for SFCC Developers
description: >-
  Many SFCC developers look at the Composable Storefront as the next step of
  Salesforce moving SFCC to the CRM core. But is it so?
date: '2023-01-30T07:59:37.000Z'
lastmod: '2026-07-10T09:18:23.000Z'
url: /what-does-the-composable-storefront-mean-for-sfcc-developers/
draft: false
heroImage: e0468610-0e86-403f-b486-743a38d4b763-d68cf607f8.png
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - ohana
  - sfcc
  - technical
author: Thomas Theunen
takeaways:
  - "Frames the composable storefront as a major architectural evolution for SFCC developers rather than an immediate replacement of existing monolithic projects"
  - "Explains why React and headless patterns broaden the technology stack while leaving plenty of value in existing backend Commerce Cloud knowledge"
  - "Encourages developers to adapt early, especially through phased or hybrid migration paths that preserve existing project stability"
---
Over the past year, I have seen increasing gossip (which I am partly to blame for) and discussions about what the Composable Storefront release means for development in Salesforce B2C Commerce Cloud. A comparison can be made to what has happened to [pipelines](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/LegacyDeveloperDocumentation.pdf) and [SiteGenesis](https://aaia-prd.my.commercecloud.salesforce.com/s/SiteGenesis/homepage?lang=en_US), and we found out [in September last year that many things are afoot](/what-is-commerce-on-core/)!

## Technology changes

{{< img-caption src="e094f768-3336-403f-8c75-9013cb07df2f-b7c7a5e8f2.png" alt="Graphic illustrating the long-term acceleration of computing progress." >}}

Let us get one thing out of the way first. This article is my opinion and my opinion alone.

As commerce and web developers, we are constantly reminded that technology never stands still. The world is rapidly evolving, and it's up to us to adapt and evolve with it. The rise of "Headless, API First, Composable Commerce, MACH Alliance, etc." has brought new opportunities to the eCommerce world.

Salesforce has introduced a solution to meet this demand: the [Composable Storefront](/sitegenesis-vs-sfra-vs-pwa/). This is an entirely different type of implementation built on React, a more modern library than we are used to in SiteGenesis and SFRA. It's an exciting new development that will support businesses' requirements now and ones they will have in the future.

I understand that there may be some concerns in the community about SFRA being phased out in favour of the "Core" with this move to Headless. However, [I don't see that happening within the next five years](/what-is-commerce-on-core/). But we need to adapt. Is it really so bad that the platform is evolving to a more modern "composable" architecture? We don't want to be left behind, and we don't want the words of our competitors to come true - that Salesforce B2C Commerce Cloud is a dinosaur. We are so much more than that, and it's up to us to prove it.

Let's embrace this change, take on the challenge, and make sure that Salesforce B2C Commerce Cloud is at the forefront of eCommerce technology. We are the ones shaping the future of commerce. Let's make it a bright one.

That felt like an inspirational speech, didn't it?

**A quick update, from 2026.** That five-year clock on SFRA I mentioned above hasn't run out yet, so I can't tell you I was wrong. But I'd be lying if I said nothing had moved. The OCAPI, the API the older monolith stack leans on, was [officially deprecated in April 2026](/in-the-ring-ocapi-versus-scapi/). Hybrid Authentication now ships natively instead of bolted on through a plugin cartridge. And Salesforce isn't shy about pointing new implementations towards the Composable side of the house. None of that kills my prediction outright, and SFRA projects are still very much a thing people build and ship. But if you'd asked 2023-me to bet on which way the needle would move over the next three years, I'd have called this direction correctly, and I'd call it again today with a bit less hedging.

## Advantages of a monolith

{{< img-caption src="salesforce-commerce-cloud-monolith-e3f50eb05b.jpg" alt="Illustration representing the strengths of a monolithic commerce architecture." >}}

I'll make sure to make one thing clear. Monolithic architecture has its advantages!

It's easier to develop, test, and deploy: the codebase lives in one place, so there's less inter-service communication and less complexity to reason about. That makes the application's flow easier to follow, and bugs easier to track down.

With a monolithic approach, you can quickly scale up the entire application by adding more resources rather than scaling each microservice individually.

A monolithic architecture may not be as trendy as microservices, but it has its perks!

And sometimes, simple beats clever.

## The Composable Storefront uses "boring" technology

React.JS counts as "boring" technology: it's been around for years and has proven reliable and stable as a platform for developers. Unlike newer and more experimental technologies, React.JS has a [large and active community of developers](https://reactjs.org/community/support.html) who have created a wide range of tools and resources for working with the library.

Newer, more experimental libraries carry more risk: less battle-testing means more bugs and compatibility surprises, and a smaller community means less help when something breaks.

If you sat through the training or followed the Slack conversations with the team, you've heard the pitch: stability, a broad developer base, and community support were the deciding factors.

### More competition and less niche

Unsurprisingly, experienced Salesforce B2C Commerce Cloud developers are in high demand. But with the addition of the PWA Kit, a new source of developers with Node.js and React experience opens up - removing a bit of the "niche" flavour.

This is good news for customers, but that also means we have more competition as developers. But not to worry, this "new source" still needs to catch up on how eCommerce and Salesforce work.

But honestly, as it stands, there is room for both of us in the Commerce Crew!

### Other platforms

Other platforms, such as Shopify ([Hydrogen](https://hydrogen.shopify.dev/) and Oxygen) and SAP ([Composable Storefront](https://help.sap.com/docs/SAP_COMMERCE_COMPOSABLE_STOREFRONT/6c7b98dbe68f4a508cac17a207182f4c/c9dcbd1ca0ec4219ac3c51b29c44625e.html?version=5) 🙄), have adopted headless solutions, so this isn't a space Salesforce can afford to sit still in — the pressure to keep shipping a better PWA Kit and a smoother migration story is real, and it's coming from more than one direction.

## Willingness to learn and evolve

{{< img-caption src="never-stop-learning-g3bc2c211b-1920-3142164f98.jpg" alt="A women holding a laptop displaying the text “never stop learning”." >}}

Working in a SaaS environment means the platform updates on its own schedule, not ours — Salesforce ships changes to meet the market's demands, whether we're ready or not.

Luckily, we can provide input to make some corrections here and there. But Salesforce is the captain of this boat! And that captain is giving developers and architects some really nice new options.

And now is the time to start learning how these new options work. Customers will be looking into them to migrate to now or in the next few years. Salesforce has provided us with a lot of options to learn how to work with React and the PWA Kit, offering courses on the [Partner Learning Camp](https://partnerlearningcamp.salesforce.com) and allowing us to ask questions to the team on the [Unofficial Slack](https://github.com/sfcc-unofficial/docs). Not all platforms (and the teams building them) provide this service.

The platform is evolving, but that doesn't mean SFRA projects are disappearing anytime soon. There will still be a need for developers and architects who can maintain and support them.

There will still be a fair share of projects starting today on SFRA!

## What about back-end development

That knowledge is transferable! The Rhino Engine (SFCC's server-side JavaScript runtime) and ISML (its templating language) still do the heavy lifting for custom Business Manager modules and API hooks, and we'll need plenty of that kind of development in the coming years. And who knows, we might even be able to build custom SCAPI endpoints using the same system as controllers soon!

**Update: called it.** [SCAPI Custom APIs went GA in the 24.2 release](/creating-custom-ocapi-endpoints/), letting you wire up custom endpoints against the same script-and-contract system controllers use, full CRUD and transactions included. It's a small thing to be smug about, but I'll take it.

This knowledge is critical to the success of projects, as customisations to Business Manager will be in high demand, and back in 2023 I would have added OCAPI to that sentence without a second thought. I can't anymore. Same story as the SFRA note further up: [OCAPI is now deprecated](/in-the-ring-ocapi-versus-scapi/), running on security patches only, and the customisation demand I described here is migrating to SCAPI instead. Business Manager module work still holds up fine; the OCAPI half of that 2023 sentence didn't.

To make things easier, do we need a BFRA (Back-End Reference Architecture) to assist us along the way? _I need to stop coming up with new ideas...but hey, who needs sleep?_

### Hybrid deployments

A potential path for existing Salesforce B2C Commerce Cloud customers is [the "hybrid" or "phased rollouts" solution](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/phased-headless-rollouts.html?q=phased). With this approach, you gradually migrate away from SiteGenesis or SFRA one page type at a time. For example, you can start with content pages, move on to lister and product detail pages, and finish with the checkout. This has several benefits:

- No big-bang release
- Risk is spread over time
- More current-budget-friendly
- One big development team, separate development teams, or something in between -> flexibility!

Additionally, this also provides an opportunity for experienced SFCC developers:

- The perfect chance to transition into the Composable Storefront, one page-type at a time
- Keeps the know-how of both setups fresh

## A 2026 footnote: Storefront Next

Here's something 2023-me didn't see coming: by 2026, PWA Kit itself is no longer Salesforce's top recommendation. That spot now belongs to [Storefront Next](/sitegenesis-vs-sfra-vs-pwa/), a newer storefront built on React Router 7, React 19, Tailwind CSS, and shadcn/ui, which Salesforce's own [product guidance](https://developer.salesforce.com/docs/commerce/commerce-api/guide/which-product.html) now lists as the "Recommended option" ahead of both SFRA and PWA Kit. There's an official path for migrating from PWA Kit to it, and a hybrid one for going straight from SFRA.

I haven't built anything on it yet, so I won't hand out a feature-by-feature verdict here. But it's worth knowing the name if you're weighing your next move — the Composable Storefront story didn't stop at PWA Kit, and it won't be the last name on this list either.

## Career Aspirations

As developers and architects, it is crucial that we not only stay up-to-date with the latest technologies but also constantly question our own aspirations and career goals. As the landscape evolves, it is essential to consider whether remaining in a specific environment aligns with our long-term plans.

The question we must ask ourselves is not just whether we are capable of adapting to the changing landscape, but whether we are willing to do so. Are we content with simply maintaining the status quo, or do we strive to be at the forefront of innovation and progress?

The future is uncertain, and it's hard to predict when certain technologies or skills will become obsolete. But as true professionals, we should be ready to embrace change and uncertainty, and always look for new opportunities and challenges to learn and grow.

So, let's ask ourselves, are we content with being a mere spectator of the eCommerce landscape or do we want to be a driving force shaping its future?

### _The choice is ours._
