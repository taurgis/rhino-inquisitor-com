---
title: "The B2C Shopper Agent: What the Setup Docs Don't Model"
description: >-
  A worked Einstein Requests and Flex Credits cost model, the SFRA/PWA
  Kit/Storefront Next setup gaps, and the versioning limits nobody documents.
date: '2026-07-11T15:10:00.000Z'
lastmod: '2026-07-11T15:10:00.000Z'
url: /b2c-shopper-agent-setup-limits-and-cost/
draft: true
heroImage: ""
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - ai
  - einstein
  - sfcc
  - headless
  - agentforce
author: Thomas Theunen
takeaways:
  - "Builds a worked cost model for B2C Shopper Agent conversations from Salesforce's own Einstein Requests and Flex Credits billing tables"
  - "Warns that active B2C Shopper Agents can't be edited directly and explains the clone-edit-swap discipline the 20-version limit forces on a team"
  - "Maps how Storefront Next, PWA Kit, and SFRA setup actually diverge, since SFRA carries far more ground to cover than the other two"
---
A merchandising director wants one number before signing off on the B2C Shopper Agent: what will this cost at our traffic? Salesforce's help pages answer with a list of usage types — Einstein Requests, Flex Credits, Data 360 Data Services Credits — and no example connecting any of them to a figure you could put in front of a budget committee. You end up doing that multiplication yourself, from a rate card nobody has turned into a scenario.

Then, midway through the build, you go to fix a typo in the live agent's welcome message and discover you can't. Not a permissions problem — the platform genuinely does not let you edit an active B2C Shopper Agent. You clone it, edit the clone, and swap which version is active. None of the fifteen setup articles mentions this until you hit it.

I've written before about how [Einstein quietly became Agentforce Commerce](/ai-einstein-in-salesforce-b2c-commerce-cloud/) without the underlying engine changing. This isn't that piece again. This is the operational one: what the B2C Shopper Agent actually costs, what standing it up takes depending on your storefront, and the limits that will bite a team mid-project regardless of which one you picked.

## Shopper Agent for B2C Commerce, Not Agentforce Personal Shopper

Here's the name, as of the Help pages I pulled while writing this: **Shopper Agent for B2C Commerce**, "B2C Shopper Agent" for short, abbreviated **ASA** in the billing tables — an abbreviation Salesforce never expands anywhere I could find. My earlier Einstein piece called this same feature "Agentforce Personal Shopper." That wasn't wrong when I wrote it; it's just already out of date, which confirms that post's running theme rather than embarrassing it: this feature has now worn at least four names since Salesforce started layering agentic commerce features on top of Einstein.

Don't confuse it with **Agentforce for B2B Commerce**, a genuinely separate product with its own hub page, its own Guided Shopping agent, and its own Merchandising agent for B2B stores. Different licensing, different setup path, different considerations page. If you're not sure which "Commerce" your org actually runs, [Which Salesforce Commerce Is My Commerce?](/which-salesforce-commerce-is-my-commerce/) covers the wider B2C-versus-B2B/D2C-on-Core confusion this naming trap feeds off. Everything below is B2C Commerce (SFCC) only.

Three gating facts decide whether you can turn this on at all, and what you're agreeing to when you do. It requires B2C Commerce paired with Service Cloud or Sales Cloud, on Enterprise, Professional, or Unlimited edition. The agent runs on exactly one model, OpenAI's GPT-4o, with no option to swap in a different LLM. And Einstein Trust Layer's data masking — the layer that normally strips personal data before a prompt reaches a third-party model — is switched off by default for this agent, "to improve the performance and accuracy of agents," in Salesforce's own words. Zero-data-retention still applies, so OpenAI isn't training on your prompts, but masking off means shopper data reaches the model unmasked. That's worth a real conversation with your privacy or security reviewer before launch.

## Setup, Fragmented Three Ways

Salesforce documents the shared setup steps once, at the top level of the hub: enable the required licensing, enable Einstein generative AI, enable Agentforce for guided shopping, create the agent's own SLAS client and permission set, then configure Enhanced Chat as the messaging channel. None of that repeats three times. What forks by storefront type is what comes after — getting the agent actually running against your specific stack.

Storefront Next and PWA Kit fork into genuinely near-identical guides. Both run on Managed Runtime (MRT), so both setups reduce to the same two steps: configure MRT and trusted domains, then choose where the agent launches on the page. PWA Kit adds a third step Storefront Next's guide doesn't have yet — Apple Pay and Google Pay through Adyen. If you already know you're on MRT, reading one of these two guides tells you almost everything the other one would.

SFRA is the most involved of the three. It carries seven further sub-articles: install the `plugin_shopper_agent` cartridge (1.0.0-GA), wire up Apple Pay and Google Pay, configure the inputs and outputs each agent action needs, import custom metadata by hand, drop an Embedded Services snippet into site preferences for Enhanced Chat, choose launch placement, and set up the analytics dashboard. There's a version-dependent wrinkle here too: from B2C Commerce 25.3 onward, Hybrid Auth replaces the older plug-in SLAS cartridge as the storefront's own auth setup, so which instructions apply depends on which B2C Commerce version you're running, not just which storefront architecture.

Reading order matters here. Take the shared steps once, then go straight to your storefront's own container: Storefront Next and PWA Kit readers can mostly skip each other's guide, SFRA readers should budget real time for the extra seven articles, and everyone should check their B2C Commerce version against the Hybrid Auth cutover before starting anything.

## What Nobody Has Modelled: The Actual Cost

Salesforce documents [the billing mechanics](https://help.salesforce.com/s/articleView?id=cc.b2c_shopping_agent_considerations.htm) precisely and never once connects them to a number:

| Usage type | What triggers it | Notes |
| --- | --- | --- |
| Conversations (ASA Messaging) | Each conversation window — starts on the shopper's first message or the agent's welcome message | Window length depends on the channel: ends on explicit "End Conversation" for unauthenticated Web chat, 24 hours after start for every other channel |
| Einstein Requests | Every API call the agent makes to the LLM gateway | Requests-per-call depend on an undisclosed call-size factor and usage-type multiplier from Salesforce's Rate Card |
| Flex Credits – Standard Action | Built-in agent actions (product search, add to cart, and so on) | Each action covers up to 10,000 tokens; 20,001 tokens bills as 3 actions |
| Flex Credits – Custom Action | Actions you build or modify from a standard one | Same 10,000-token banding as Standard Actions |
| Data 360 – Batch Data Pipeline | Data 360 connectors moving catalog/order data in bulk | Charged on data volume, not request count |
| Data 360 – Data Queries | The agent querying Data 360 records | Charged per record processed; depends on query shape |
| Data 360 – Unstructured Data | PDFs, docs, or media chunked and embedded for grounding | Charged by MB; chunking and embedding count once, not twice |
| Data 360 Storage | Conversation and connected data beyond your allocation | Only Data 360 storage counts — Commerce Cloud or Lightning Platform storage doesn't |

Here's a worked scenario, with the assumptions stated up front so you can swap in your own numbers. Say your store runs 50,000 shopper conversations a month — that's 50,000 billed conversation windows on its own, before anything else — averaging 6 shopper turns each, and each turn fires roughly 1.5 agent actions: a product search, plus a cart update about half the time. That's 300,000 LLM gateway calls (Einstein Requests, before whatever multiplier your Rate Card applies) and 450,000 standard or custom actions. Add one Data 360 query per conversation for a product or order lookup, and you're at 50,000 queries a month before you've indexed a single PDF for grounding.

Salesforce won't publish the dollar-per-unit rate in Help; that lives behind your account and your Rate Card. The real cost lever the docs never spell out is this: your Einstein Request count scales with turns per conversation, and your Flex Credit count scales with how many actions each turn fires relative to that 10,000-token boundary. Four small custom actions per turn burn four separate token bands even if their combined size would have fit inside one. Fewer, larger custom actions cost less than many small ones, provided none of them individually crosses the boundary — a real constraint for whoever designs your custom actions.

Digital Wallet, the free consumption-tracking tool Salesforce bundles for this feature, is worth turning on before you launch — it gives you near-real-time usage against every line in that table, per active contract, instead of leaving you to reconstruct it from an invoice.

## The Limits That Bite Mid-Project

- **You can't edit an active agent.** Clone it, edit the clone, then swap which version is active. That's the whole workflow, and it's the one your team needs a written procedure for — who owns the swap, what gets tested on the clone first, how you roll back if the new version misbehaves. Salesforce gives you the mechanism. Building the process is on you.
- **20 versions per agent, one active at a time.** Hit the ceiling and you delete older versions before cloning another. Without a naming and retention convention, that limit arrives as a mid-sprint surprise.
- **100 active agents total, and active Einstein bots count against it.** If your org already runs a stack of Einstein bots for other channels, the B2C Shopper Agent isn't drawing from a fresh allowance.
- **The B2C Shopper Agent inherits a whole separate limitations page.** It runs on the general Agentforce Service agent type, so everything Salesforce documents as a limitation for that underlying agent type applies here too, on top of everything in this list.
- **The Metadata API won't stop you wiring in unsupported pieces.** The B2C Shopper Agent doesn't support the General CRM or Single Record Summary subagents, or the Identify Object by Name, Identify Record by Name, Query Records, Query Records With Aggregate, Summarize Record, Draft or Revise Email, Update Record Fields, or Extract Fields And Values From User Input actions. None of that is enforced at deploy time — the deploy succeeds either way, and whether the subagent or action actually works is something you only discover at runtime.
- **Some standard actions need add-on licensing that isn't enforced yet.** Certain built-in actions require every user who accesses them to hold an Agentforce for Sales or Agentforce for Service add-on subscription. Salesforce says this isn't enforced today, and says plainly that unlicensed users will lose access once it is. Plan for that now.
- **Version floors:** PWA Kit 3.13.0 or later; `plugin_shopper_agent` 1.0.0-GA.
- **17 languages and locales are supported, and welcome, error, and escalation messages still need manual translation** the moment you're not running in English — the agent's generative responses handle the target language, but its fixed system messages don't translate themselves.
- **Data 360 integration only works against the default dataspace.** If your Data Cloud setup uses multiple dataspaces, plan around that constraint before the agent goes live — it's a much more expensive thing to discover afterwards.
- **Enhanced Chat is the only supported channel**, and a message that exceeds that channel's character limit is silently dropped: not delivered, no response generated. Different Enhanced Chat channels carry different limits, so test per channel rather than assuming Web behaves like WhatsApp.

Worth having in your pocket if procurement asks before the merchandising team does: Agentforce is covered under Salesforce's SOC 2 and SOC 3 reports, is HIPAA eligible, and carries ISO 27001, 27017, and 27018 certification.

One gap I won't pretend to fill: Salesforce documents what custom subagents and actions the B2C Shopper Agent doesn't support, but there's no first-party worked example of building a supported custom action against real B2C Commerce data. I don't have one built to show you either. If you're looking for that tutorial, it doesn't exist yet. That's a sign of how young this surface still is.

## The Latency and Caching Questions the Docs Don't Answer

Everything in this section is inference from the documented architecture, not a fact Salesforce states outright. The company doesn't publish latency or caching guidance for this feature, so treat this as my read, and verify against your own instance before you plan around it.

Each shopper turn in Enhanced Chat routes through its own SLAS client and named credential, provisioned specifically for the agent and separate from whatever your storefront uses for its own shopper sessions, to call SCAPI (or OCAPI) for product search, cart, or order data. A single turn can trigger several of those calls plus the round trip to the LLM gateway itself, stacking additional latency on top of whatever the storefront already spends per request. For SFRA stores on B2C Commerce 25.3 and later, the storefront's own side of that auth picture has moved too, from the older SLAS cartridge to Hybrid Auth — a separate concern from the agent's own credential, but a reminder that "SLAS" no longer means one fixed mechanism across this whole feature.

None of this touches your storefront's page cache. Enhanced Chat is a side channel, not a rendered page, so nothing in [how caching works in the composable storefront](/caching-in-the-sfcc-composable-storefront/) or in [using custom caches safely](/field-guide-to-custom-caches-in-sfcc/) applies to it directly. It has its own latency budget, and right now that budget is undocumented.

What does carry over is the shared backend: the agent's SCAPI calls land on the same instance and count against the same [SLAS and SCAPI rate limits](/a-survival-guide-to-sfcc-platform-limits/) your storefront's own calls depend on. A spike in chat traffic — a viral product, a marketing push into the agent — adds pressure to endpoints your checkout flow also needs headroom on. I haven't seen Salesforce publish a separate rate-limit allowance for agent-originated SCAPI traffic, which makes it reasonable to assume there isn't one: plan capacity as if the agent is just another authenticated client competing for the same budget.

## What to Build Before You Turn It On

Turn this on now if you're confidently B2C-only, already comfortable with SLAS and SCAPI, and willing to run a monitored pilot with Digital Wallet watching consumption from day one and a defined cost threshold that ends the pilot if you cross it. Wait if your team is still mid-decision on an SFRA-to-headless migration — the setup differs enough by storefront type that you'll redo this work once you move — or if "who owns the version-swap process" is still an open question with no assigned name.

Before general rollout, build three things Salesforce's docs assume you'll figure out yourself: a Digital Wallet-based cost dashboard your merchandising team can actually read, a written clone-edit-swap procedure with a named owner, and a one-page internal note that collapses the three storefront-specific setup guides into whichever one paragraph applies to your stack. None of that is difficult. It's just work the setup docs never model, and somebody on your team has to do it before the agent goes live, not after the first invoice arrives.
