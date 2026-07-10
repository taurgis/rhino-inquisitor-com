---
title: The Ultimate SFCC Guide to Finding Your POD Number
description: >-
  Learn how to find your SFCC POD number, why it matters for troubleshooting,
  and where to verify it across tools and environments.
date: '2025-07-21T05:05:51.000Z'
lastmod: '2026-07-10T12:07:10.000Z'
url: /the-sfcc-guide-to-finding-pod-numbers/
draft: false
heroImage: sfcc-finding-your-pod-number-scaled-6830449d2b.jpeg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - security
  - sfcc
  - technical
author: Thomas Theunen
takeaways:
  - "Explains what an SFCC POD is and why knowing it matters for integrations, troubleshooting, maintenance awareness, and performance planning"
  - "Covers practical ways to identify the current POD through UI clues, official references, and support channels"
  - "Places POD discovery in the broader context of Salesforce infrastructure evolution and the shift towards Hyperforce"
---
You need to allowlist an outbound IP for a new payment integration, and the form wants your instance's **POD number**. You open Business Manager. Nowhere does it say "POD" in plain text.

That's the running joke of working on B2C Commerce Cloud: the POD number decides your firewall rules, your maintenance windows, and how fast your PWA loads, yet nothing in the UI hands it to you outright. This guide walks through every trick that still works for finding it — plus the official channels for when the tricks don't.

## What is an SFCC POD, and Why Should You Care

Before we dive into the "how," let's establish the "[what](/the-salesforce-b2c-commerce-cloud-environment/)" and "why." In the Salesforce B2C Commerce ecosystem, a **POD (Point of Delivery)** is not just a single server. It is a complete, self-contained infrastructure cluster hosting the multi-tenant Software as a Service (SaaS) application. Think of it as a group of hardware—including firewalls, load balancers, application servers, and storage systems—that multiple customers share. Salesforce manages this grid, continually adding new PODs and refurbishing existing ones to balance loads, enhance performance, and improve disaster recovery capabilities.

That SaaS model means your team builds storefronts instead of managing hardware.

Salesforce also frequently performs "POD moves," migrating entire customer realms to new hardware to ensure performance and reliability. By treating the POD as a transient, infrastructure-level detail rather than a permanent, customer-facing setting, Salesforce maintains the flexibility to manage the grid without requiring constant configuration changes on your end.

For developers, finding the POD number is reconnaissance work: querying the system for a state nobody prints on a label anywhere. Here's why it matters:

- **Firewall & Integration Configuration:** This is the most frequent reason you'll need your POD number. When setting up integrations with third-party systems, such as payment gateways, Order Management Systems (OMS), or tax providers, their security policies often require you to allowlist the outbound IP addresses from your SFCC instances. These IP addresses are specific to the POD on which your realm resides. So a POD move doesn't take your integrations down, allowlist the IPs for both your current POD and its Disaster Recovery (DR) POD before you need them, not after. (We'll explain where to find those later)

- **Understanding Maintenance Schedules:** Salesforce announces maintenance windows and incidents on its [Trust site](https://status.salesforce.com/) on a per-POD basis. Knowing your POD number is the only way to accurately anticipate downtime for your Primary Instance Group (PIG), allowing you to plan releases and testing cycles effectively.

- **Troubleshooting & Support:** When you're diagnosing connectivity issues, performance drops, or other strange behaviour, the POD is one of the first things to check — and one of the first things Salesforce Support will ask for when you open a case.

- **Performance Optimisation:** For sites built with the PWA Kit and Managed Runtime, deploying your Progressive Web App (PWA) to a Managed Runtime region close to your data's POD keeps latency down and page loads fast.

### The Shift to Hyperforce: What It Means for PODs

Salesforce is migrating B2C Commerce Cloud to **Hyperforce**, its infrastructure built on public cloud regions instead of first-party data centres. It's a multi-year effort that started in Q4 2024, and it moves realm by realm on Salesforce's own schedule: you get 60 to 90 days' notice, then the actual cutover happens inside a single maintenance window of two to five hours ([B2C Commerce Hyperforce FAQ](https://help.salesforce.com/s/articleView?id=cc.b2c_hyperforce_faq.htm&language=en_US&type=5)). New B2C Commerce customers are provisioned on Hyperforce from day one. The classic, static POD number is disappearing — but only for realms that have actually made the move.

How far along is that, in mid-2026? Salesforce keeps the first-party POD environments running until every realm has migrated, and its own current release documentation for B2C Commerce still describes deployment entirely in POD terms — staged rollouts by POD, not by region. So treat the methods below as very much still relevant for now, not a historical footnote.

Once your realm does move, the POD hunt stops mattering, but it isn't replaced with nothing. Outbound traffic starts coming from a small set of IP ranges tied to your realm's new AWS region instead of a single POD's outgoing IP, and Salesforce carries your existing firewall allowlist over automatically as part of the move ([Hyperforce Realm Move Preparation and Process](https://help.salesforce.com/s/articleView?id=002888834&language=en_US&type=1)). You'll be allowlisting a region, not chasing a number.

## The UI Sleuth: Finding Your POD with a Few Clicks

For those times when you need a quick answer, this browser-based method is your best option.

### Method 1: The Custom Maintenance Page Trick

This indirect method uses the way Business Manager generates preview links, and it's reliable for your PIG instances (Development, Staging, Production).

1. Log in to the Business Manager of the instance you want to investigate.

1. Navigate to **Administration > Site Development > Custom Maintenance Pages**.

1. In the `Preview` section, you will see links for your various storefronts. If you don't have a maintenance page uploaded, you must upload one first. You can download a template from this same page and create a simple `.zip` file to enable the preview links.

1. Locate the **(Production)** link.

1. **Do not click the link.** Instead, hover your mouse cursor over it.

1. Look at your browser's status bar (usually in the bottom-left corner). It will display the destination URL, and within that URL, you will find the POD number.

For example, the URL might look something like `https://pod185.production.demandware.net/...`, clearly indicating you are on POD 185.

Salesforce's own maintenance-page documentation confirms the mechanics here still hold: preview links keep embedding a POD number for as long as your realm sits on classic infrastructure ([Maintenance Pages](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-maintenance-pages.html)). Once Hyperforce takes over your realm, that hostname — and the POD number in it — goes away along with the rest of the classic scaffolding.

### Method 2: The (lightning) PIG instance footer

By far the *easiest and quickest* option to explain.

Go to your staging, development, or production instance, log in, and finally look at the bottom right of any page to see the POD number in the footer!

This is a feature of the new Lightning UI, not the classic UI. Like Method 1, it only applies while your realm still runs on classic infrastructure — Hyperforce doesn't give the footer a POD number to display.

### The Account Manager Prerequisite

While you cannot find the POD number directly in Account Manager, it is the source for prerequisite information you will need for other methods, particularly when contacting support. Users with the `Account Administrator` role are the only ones who can access this information.

To find your Realm and Organization IDs:

1. Log in to Account Manager at `https://account.demandware.com`.

1. Navigate to the **Organisation** tab.

1. Open your organisation and in the **Assigned Realms** section, you can find your 4-letter `Group ID` and the alphanumeric `Realm ID`.

Keep this information handy. It's essential for identifying your environment when interacting with Salesforce systems and support teams.

This approach is primarily intended for individuals who need to work with Salesforce Support.

### Method 3: The Legacy Log Center URL (A History Lesson)

This method is now largely historical ([migrated in 2023](https://help.salesforce.com/s/articleView?id=000394842&language=en_US&type=1)), but it's worth knowing if you inherit an older project or run into references to it in internal documentation.

Before the 2023 migration to a centralised logging platform, each POD had a dedicated Log Center application. The URL format explicitly included the POD number:

`https://logcenter-<POD-No.><Cylinder>-hippo.demandware.net/logcenter`

The `<Cylinder>` value was also significant: `00` for a SIG (your sandboxes) and `01` for a PIG (Dev, Staging, Prod).

The old Log Center URL was tied directly to a specific hardware group (`hippo.demandware.net`) — about as rigid as infrastructure addressing gets.

The new, centralised Log Center decouples logging from the specific POD where an instance runs, using regional endpoints instead (AMER, EU, APAC).

Nice bit of platform archaeology — just don't rely on it to find a live POD.

## The Official Channels: Guaranteed but Less Immediate

{{< img-caption
  src="going-to-salesforce-official-channels-b9f405d5e0.jpeg"
  alt="Friendly rhino in 2D flat cartoon style walks towards an official building with a cloud logo, representing trusted official channels"
  caption="Use official Salesforce channels to find reliable POD information"
>}}

When you need an officially sanctioned answer or want to monitor the health of your environment, these are the channels to use.

### Method 4: Consulting Salesforce Support (The Ultimate Fallback)

This is your most authoritative source. Salesforce Support can provide all realm information, including the current POD number. This is the best route to take when other methods are inconclusive or when you need an official record for compliance or audit purposes. Open a support case and provide your `Organization ID` and `Realm ID` up front to speed things along.

Support will also be the primary source of information during a planned POD move.

### Using the Salesforce Trust Site (For Monitoring, Not Discovery)

A common misconception is that the Salesforce Trust site can be used to find your POD (Point of Delivery) number.

This is incorrect.

The Trust site is where you go to check the status of a POD you *already know*. Once you've identified your POD number using one of the methods above, you can visit [https://status.salesforce.com/products/B2C\_Commerce\_Cloud](https://status.salesforce.com/products/B2C_Commerce_Cloud), find your POD in the list, and subscribe to notifications for maintenance and incidents.

### The Official POD Lists

Salesforce maintains official knowledge base articles that list all PODs, their general locations (e.g., USA East - VA, Japan, …), their DR (Disaster Recovery) POD counterparts, and their outgoing IP addresses.

- **[AMER PODS](https://help.salesforce.com/s/articleView?id=000391456&language=en_US&type=1)**

- [EMEA/APAC PODS](https://help.salesforce.com/s/articleView?id=000391425&type=1)

You should use these lists in conjunction with the other discovery methods. For example, once the maintenance page URL indicates that you are on POD 126, you can consult the AMER list to find that its location is Virginia, its DR POD is 127, and its primary outbound IP address is `136.146.57.33`.

## Mastering Your Environment

None of this stays useful forever. Once Hyperforce reaches your realm, Methods 1 and 2 stop producing a POD number, and the footer, the maintenance-page hover trick, and the old Log Center URL become stories about how things used to work. Until then, use them — and get comfortable with Account Manager and a support ticket for the day they stop.
