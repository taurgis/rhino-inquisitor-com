---
title: Which Salesforce Commerce Is My Commerce?
description: >-
  Salesforce sells two unrelated Commerce products under one name. Here's how
  to tell B2C Commerce (SFCC) apart from B2B/D2C Commerce on Core.
date: '2026-07-11T14:30:00.000Z'
lastmod: '2026-07-11T14:30:00.000Z'
url: /which-salesforce-commerce-is-my-commerce/
draft: true
heroImage: the-commerce-crossroads.png
heroImageAlt: A signpost where both arrows read "Commerce" — one points to a dark server room, the other to a glass office tower.
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - sfcc
  - b2b
  - documentation
author: Thomas Theunen
takeaways:
  - "Distinguishes B2C Commerce (SFCC) from Core-based B2B/D2C Commerce despite Salesforce marketing both as 'Commerce'"
  - "Provides a login, URL, and ID checklist for identifying which Salesforce Commerce product an implementation runs on"
  - "Traces the naming confusion to Salesforce's own documentation, citing a mislabelled diagram and a misnamed URL slug"
---
A client rings me mid-engagement. The statement of work says B2C Commerce. I ask for a login. Twenty minutes later I'm three clicks deep in Lightning Setup, looking for Business Manager. There isn't one. No realm ID in the URL, no `dw.system.Site` anywhere in the sandbox, not a single cartridge in sight. The engagement was scoped for SFCC. What I'm looking at is not SFCC.

This isn't a one-off. I've heard a sales engineer promise a client "you already have B2C, just switch it on," when the org in question was running B2B Commerce on Core the entire time. Developers Google an error, land on Lightning Web Component docs, and quietly assume they've broken their sandbox. Nobody involved was careless. They were told, repeatedly, by Salesforce's own marketing, that these are the same product.

## Two Products, One Marketing Word

Salesforce agrees this is confusing enough to need its own page. The Help article "[Which Salesforce Commerce Product Do I Have?](https://help.salesforce.com/s/articleView?id=commerce.comm_what_product.htm)" exists purely to answer that question, and it draws the line plainly:

> B2C Commerce is an enterprise product that resides on realms, separate from the Salesforce platform... You use Business Manager to configure B2C Commerce.
>
> B2B Commerce are part of the Commerce application that resides on the Salesforce platform. B2B Commerce run on Salesforce orgs.

That's the whole split, in two sentences. B2C Commerce — the SFCC platform this blog is about, going back to Demandware — runs on its own realms, entirely separate from the rest of Salesforce. B2B Commerce, and its D2C mode, run inside a standard Salesforce org, the same platform underneath Sales Cloud and Service Cloud.

If you want the full family tree — Order Management, Composable Storefront, Payments, and everything else flying the "Commerce Cloud" banner — I've mapped all nine of them in [9 Salesforce Commerce Cloud Products](/salesforce-commerce-cloud-products/). This post isn't the roster. It's the fast test for working out which branch of that family you're standing in.

## Which One Are You Actually On

Before you read another paragraph of architecture, run the check that actually matters: log in and look around.

- **The login URL.** Business Manager sits behind something like `bm.commercecloud.salesforce.com`, or an older `*.demandware.net` path. B2B/D2C Commerce lives at a standard Lightning address: `*.lightning.force.com`, or `*.my.site.com` for the storefront.
- **The ID format.** SFCC identifies your environment with a four-letter realm ID plus an instance suffix — something like `zzte_053`. A Salesforce org has an 18-character ID starting with `00D`. Ask whoever manages the environment for either one; the format alone tells you which product you're in.
- **Who handed you the login.** SFCC access comes through Account Manager at `account.demandware.com`. B2B/D2C Commerce access comes through standard Salesforce Setup, under Users, like every other org.
- **Where the sandboxes live.** SFCC sandboxes are separate realm instances — Development, Staging, and so on — and have nothing to do with a CRM sandbox. B2B/D2C Commerce uses ordinary Salesforce sandbox types, copied straight from the org.
- **How code ships.** SFCC code moves as cartridges, over WebDAV, SFTP, or a CI pipeline, into Business Manager's Code Versions. B2B/D2C Commerce ships Lightning Web Components and metadata through SFDX, like any other Salesforce deployment.
- **Where the product catalogue lives.** SFCC catalogues and categories are edited in Business Manager. B2B/D2C Commerce stores its catalogue as `Product2` and `PricebookEntry` records, editable in Setup or with Data Loader.

Six checks are usually enough. If you can't answer even the first one, that's worth finding out before anyone writes a line of code.

> [!NOTE]
> If someone asks for company accounts, tiered pricing, an approval workflow, or a punch-out catalogue on a B2C Commerce storefront, they're describing B2B/D2C Commerce, whether they realise it or not. SFCC has no buyer-group or approval object anywhere in its data model.

That gap is structural. The buyer-group, buyer-account, and approval-policy objects — `BuyerAccount`, `BuyerGroup`, `CommerceEntitlementPolicy` — covered in [B2B Commerce's data model](https://developer.salesforce.com/docs/commerce/salesforce-commerce/guide/b2b-b2c-dev-data-model.html) simply don't exist on B2C Commerce. Every official page that mentions punch-out, tiered pricing, or an approval chain is written for the Core product instead.

So what do SFCC shops actually build when a client insists on "B2B on SFCC"? Nothing off the shelf — it's custom work, built from parts B2C Commerce already has.

- **Company accounts.** Usually a custom object linked to the customer profile, carrying a company ID and a credit limit.
- **Role-based access.** Bolted on through customer groups and a bit of controller logic gating checkout, catalogue visibility, or pricing by group membership.
- **Tiered and negotiated pricing.** Rides on the price-book and promotion engine B2C Commerce already has, rather than a dedicated B2B pricing object.
- **Approval workflows.** The hardest part to fake — there's no native concept of "this order needs a manager's sign-off" in B2C Commerce, so shops either build a custom order-hold status with an email or Slack notification, or push that step out to an external procurement system entirely.

It isn't elegant, and it isn't what the sales slide promised, but it works — Salesforce hasn't documented the pattern, because the official product for it lives elsewhere.

## Same Word, Different Stack

Away from logins and IDs, the two products don't share a runtime, a data model, or an API surface. Salesforce's own developer guide for B2B Commerce — "[Get Started with B2B Commerce](https://developer.salesforce.com/docs/commerce/salesforce-commerce/guide/b2b-b2c-comm-dev-guide.html)" — walks through Lightning Web Components, Lightning Web Runtime templates, Experience Builder, the Connect Commerce API, and SFDX. It never mentions OCAPI, SCAPI, cartridges, SFRA, or PWA Kit, because none of that exists in the product it's describing.

| | B2C Commerce (SFCC) | B2B / D2C Commerce (Core) |
| --- | --- | --- |
| **Stack** | Realm-based, dedicated instances separate from the Salesforce platform | Runs inside a standard Salesforce org |
| **APIs** | OCAPI and SCAPI (SFCC's REST APIs), plus the `dw.*` server-side scripting API | Connect Commerce API, standard SOQL/CRUD over SObjects |
| **Customisation model** | Cartridges (SFCC's packaged code modules), SFRA/SiteGenesis (SFCC's storefront frameworks), or PWA Kit (SFCC's React-based headless storefront) | Lightning Web Components, LWR (Lightning Web Runtime) templates, Experience Builder |
| **Who builds it** | SFCC developers and architects, Business Manager admins | Salesforce admins (declarative), LWC developers |
| **Core data objects** | Catalogues and categories managed in Business Manager | `Product2`, `PriceBook2`, `WebStore`, `WebCart`, `BuyerAccount`, `BuyerGroup` |

The table isn't cosmetic. Different teams built these products, on different platforms, at different points in Salesforce's acquisition history — Demandware, bought in 2016, became B2C Commerce; CloudCraze, bought in 2018, eventually became what's now B2B Commerce on Core. The only thing they still share is the word "Commerce" on the price list.

That said, "different stack" isn't the same as "never talk to each other." Salesforce documents a real [B2C Commerce Connection](https://help.salesforce.com/s/articleView?id=sf.om_b2c_commerce_connections.htm) into Order Management — a Core product, in the same family as B2B Commerce — that provisions things like Omnichannel Inventory, Order Self-Service, and shared cart and checkout data, typically through an SFRA plug-in on the storefront side. That's a genuine, documented integration, and worth knowing about if your SFCC storefront and a B2B/D2C org end up in the same customer's landscape. It's a data connection through a third product, though, not a shared runtime, template layer, or API — SFCC still doesn't speak the Connect Commerce API, and B2B Commerce still doesn't know what a cartridge is.

## Even Salesforce Mixes This Up

The mix-up isn't only a customer problem — it shows up in Salesforce's own documentation too.

Take the URL for that developer guide: `b2b-b2c-comm-dev-guide.html`. The slug promises a comparison of both products. Open it, and there's no B2C Commerce content anywhere — it's a B2B-only guide filed under a slug that promises both. The [data model page](https://developer.salesforce.com/docs/commerce/salesforce-commerce/guide/b2b-b2c-dev-data-model.html) does the same thing, right down to the diagram: its own alt text reads "Diagram of B2C data model," describing an image that lists `WebStore`, `BuyerAccount`, and `BuyerGroup` — objects that only exist in B2B Commerce.

The intro page leans into it just as hard. "[Salesforce B2B Commerce](https://help.salesforce.com/s/articleView?id=commerce.comm_intro.htm)" explains that you can "use the B2B Commerce platform to create a direct-to-customer (D2C) channel and operate both a B2B and D2C channel from a single Salesforce org." That's worth remembering next time someone treats D2C Commerce as a third product: it isn't. It's a mode of B2B Commerce, running in the same org, on the same data model, one toggle away.

Salesforce's own release notes have gone further than that. When [Summer '23 unified B2B Commerce onto Lightning Web Runtime](https://help.salesforce.com/s/articleView?id=release-notes.rn_comm_lwr_for_b2b.htm&release=244), the release note put it plainly: "When you create a store, you can select either the B2C or B2B template based on the Lightning Web Runtime (LWR)." That's a literal "B2C" option in the Commerce app's store-creation screen — and it's still entirely Core: same LWR components, same org, same "B2B Commerce and D2C Commerce" licensing the note names as the products it applies to. Nothing about it touches Business Manager, OCAPI, or a single cartridge. Salesforce has since settled on "D2C" for this in its Trailhead material, but for a while its own UI used "B2C" for a Core template, which is a fair summary of why this whole topic is confusing in the first place.

None of this makes the mix-up your fault. It's baked into how Salesforce names and files its own material.

## Check the Login Before You Trust the Word

There's nothing subtle here once you know where to look, which is exactly the point. The word "Commerce" tells you nothing on its own — not the stack, not the API, not who's meant to build it. The login does. Check the URL, check the ID format, check where the sandboxes live, and you'll know which product you're standing in before you've read a single line of documentation for the wrong one.

It's also worth closing the question this raises for anyone who's been in SFCC a while: will it ever move onto Core, the way B2B Commerce already has? I wrote about that back in 2022, treating it as a five-to-seven-year bet on [what Commerce on Core might look like](/what-is-commerce-on-core/). As of 2026, it hasn't happened, and there's still no public sign of it technically converging with B2B/D2C Commerce. They remain two separate stacks on two separate platforms, connected only at the edges through products like Order Management — and still marketed under one word.
