---
title: The Ultimate SFCC Guide to Finding Your POD Number
description: >-
  Knowing your POD number isn't just trivia; it's a critical piece of
  operational intelligence.
date: '2025-07-21T05:05:51.000Z'
lastmod: '2025-07-21T05:42:08.000Z'
url: /the-sfcc-guide-to-finding-pod-numbers/
draft: false
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - security
  - sfcc
  - technical
author: Thomas Theunen
---
As a Salesforce B2C Commerce Cloud developer, you operate within a sophisticated, multi-tenant cloud architecture. While Salesforce masterfully handles the underlying infrastructure, there are times when you need to peek behind the curtain. One of the most common—and often surprisingly elusive—pieces of information you'll need is your instance's **POD number**.

Knowing your POD number isn't just trivia; it's a critical piece of operational intelligence. It's the key to configuring firewalls, anticipating maintenance, troubleshooting effectively, and optimising performance. This guide is your definitive resource for uncovering that number. We’ll explore every method available, through clever UI tricks, so you can master your environment.

## What is an SFCC POD, and Why Should You Care?

Before we dive into the "how," let's establish the "[what](/the-salesforce-b2c-commerce-cloud-environment/)" and "why." In the Salesforce B2C Commerce ecosystem, a **POD (Point of Delivery)** is not just a single server. It is a complete, self-contained infrastructure cluster hosting the multi-tenant Software as a Service (SaaS) application. Think of it as a group of hardware—including firewalls, load balancers, application servers, and storage systems—that multiple customers share. Salesforce manages this grid, continually adding new PODs and refurbishing existing ones to balance loads, enhance performance, and improve disaster recovery capabilities.

This SaaS model is a significant advantage, enabling your team to focus on building exceptional storefronts instead of managing hardware.

Salesforce also frequently performs "POD moves," migrating entire customer realms to new hardware to ensure performance and reliability. By treating the POD as a transient, infrastructure-level detail rather than a permanent, customer-facing setting, Salesforce maintains the flexibility to manage the grid without requiring constant configuration changes on your end.

Hyperforce With the transition to the public cloud, the entire concept of "POD" will undergo substantial changes.

This means that for developers, finding the POD number is an act of reconnaissance. We must learn how to query the system's current state. Here’s why this knowledge is indispensable:

-   **Firewall & Integration Configuration:** This is the most frequent reason you'll need your POD number. When setting up integrations with third-party systems, such as payment gateways, Order Management Systems (OMS), or tax providers, their security policies often require you to allowlist the outbound IP addresses from your SFCC instances. These IP addresses are specific to the POD on which your realm resides. For a seamless transition during a potential POD move, it is best practice to allowlist the IPs for both your current POD and its designated Disaster Recovery (DR) POD at all times. (We'll explain where to find those later)

-   **Understanding Maintenance Schedules:** Salesforce announces maintenance windows and incidents on its [Trust site](https://status.salesforce.com/) on a per-POD basis. Knowing your POD number is the only way to accurately anticipate downtime for your Primary Instance Group (PIG), allowing you to plan releases and testing cycles effectively.

-   **Troubleshooting & Support:** When diagnosing elusive connectivity issues, performance degradation, or other strange behaviour, knowing the POD is a crucial data point. It's one of the first things you should check, and it's vital information to include when opening a support case with Salesforce to expedite a resolution.

-   **Performance Optimisation:** In the modern era of composable storefronts, performance is paramount. For sites built with the PWA Kit and Managed Runtime, deploying your Progressive Web App (PWA) to a Managed Runtime region that is geographically close to your data's POD is critical for minimising latency and delivering the fast page loads that customers expect.

### The Shift to Hyperforce: What It Means for PODs

Salesforce is fundamentally changing its infrastructure by migrating B2C Commerce Cloud to **Hyperforce**, its next-generation platform built on [public cloud technology](https://www.salesforce.com/platform/public-cloud-infrastructure/). This strategic move away from traditional Salesforce-managed data centres allows for greater scalability, enhanced security, and improved performance by leveraging the global reach of public cloud providers. For anyone working with SFCC, understanding this transition is crucial, as it marks a significant evolution in how the platform is architected and managed. The core takeaway is that the classic concept of a static, identifiable **POD** is becoming a thing of the past for realms on Hyperforce.

With the adoption of Hyperforce, the architecture is far more dynamic. Your SFCC instance is no longer tied to a single, fixed data centre or a specific POD number that can be easily identified through a URL or IP address lookup. This means that many of the clever methods currently used to pinpoint your POD will no longer be reliable once your realm is migrated.

Instead of a predictable POD, your instance operates within a more fluid public cloud environment.

## The UI Sleuth: Finding Your POD with a Few Clicks

For those times when you need a quick answer, this browser-based method~~s~~ ~~are~~ is your best friend~~s~~. (Yes, we went from plural to singular)

### Method 1: The Custom Maintenance Page Trick

This is a clever, indirect method that leverages the way Business Manager generates preview links. It's highly reliable for determining the POD of your PIG instances (Development, Staging, Production).

1.  1.  Log in to the Business Manager of the instance you want to investigate.

    2.  Navigate to **Administration > Site Development > Custom Maintenance Pages**.

    3.  In the `Preview` section, you will see links for your various storefronts. If you don't have a maintenance page uploaded, you must upload one first. You can download a template from this same page and create a simple `.zip` file to enable the preview links.

    4.  Locate the **(Production)** link.

    5.  **Do not click the link.** Instead, hover your mouse cursor over it.

    6.  Look at your browser's status bar (usually in the bottom-left corner). It will display the destination URL, and within that URL, you will find the POD number.

For example, the URL might look something like `https://pod**185**.production.demandware.net/...`, clearly indicating you are on POD 185.

### Method 2: The (lightning) PIG instance footer

By far the **_easiest and quickest_** option to explain.

Go to your staging, development, or production instance, log in, and finally look at the bottom right of any page to see the POD number in the footer!

New UI This is a feature of the new Lightning UI, and not the classic UI!

### The Account Manager Prerequisite

While you cannot find the POD number directly in Account Manager, it is the source for prerequisite information you will need for other methods, particularly when contacting support. Users with the `Account Administrator` role are the only ones who can access this information.

To find your Realm and Organization IDs:

1.  Log in to Account Manager at `https://account.demandware.com`.

2.  Navigate to the **Organization** tab.

3.  Open your organization and in the **Assigned Realms** section, you can find your 4-letter `Group ID` and the alphanumeric `Realm ID`.

Keep this information handy. It's essential for identifying your environment when interacting with Salesforce systems and support teams.

Permissions This approach is primarily intended for individuals seeking assistance via support.

### Method 3: The Legacy Log Center URL (A History Lesson)

This method is now largely historical ([migrated in 2023](https://help.salesforce.com/s/articleView?id=000394842&language=en_US&type=1)), but it remains important for context, especially if you work on older projects or encounter references to it in internal documentation.

Before the 2023 migration to a centralised logging platform, each POD had a dedicated Log Center application. The URL format explicitly included the POD number :

`https://logcenter-<POD-No.><Cylinder>-hippo.demandware.net/logcenter`

The `<Cylinder>` value was also significant: `00` for a SIG (your sandboxes) and `01` for a PIG (Dev, Staging, Prod).

The platform's evolution toward a more abstracted, public cloud infrastructure is evident in this instance. The old Log Center URL was tied directly to a specific hardware group (`hippo.demandware.net`), reflecting a more rigid infrastructure.

The new, centralised Log Centre decouples logging from the specific POD where an instance runs, using regional endpoints instead (e.g., AMER, EU, APAC). This shift is a classic pattern in modern cloud services, favouring centralised, scalable functions over hardware-specific endpoints.

Although this legacy URL is no longer a reliable method for active discovery, understanding its history offers insight into the platform's architectural evolution.

## The Official Channels: Guaranteed but Less Immediate

![A friendly rhino in a 2D flat cartoon style, similar to Salesforce illustrations, walks towards an official building with a cloud logo, representing going to official channels for trusted information.](/media/2025/going-to-salesforce-official-channels-b9f405d5e0.jpeg)

On the right path: Getting information from the official source.

When you need an officially sanctioned answer or want to monitor the health of your environment, these are the channels to use.

### Method 4: Consulting Salesforce Support (The Ultimate Fallback)

This is your most authoritative source. Salesforce Support can provide all realm information, including the current POD number. This is the best route to take when other methods are inconclusive or when you need an official record for compliance or audit purposes. To make the process efficient, open a support case and provide your `Organization ID` and `Realm ID` from the outset.

Support will also be the primary source of information during a planned POD move.

### Using the Salesforce Trust Site (For Monitoring, Not Discovery)

A common misconception is that the Salesforce Trust site can be used to find your POD (Point of Delivery) number.

**This is incorrect.**

The Trust site is where you go to check the status of a POD you _already know_. Once you've identified your POD number using one of the methods above, you can visit [https://status.salesforce.com/products/B2C\_Commerce\_Cloud](https://status.salesforce.com/products/B2C_Commerce_Cloud), find your POD in the list, and subscribe to notifications for maintenance and incidents.

### The Official POD Lists

Salesforce maintains official knowledge base articles that list all PODs, their general locations (e.g., USA East - VA, Japan, …), their DR (Disaster Recovery) POD counterparts, and their outgoing IP addresses. These are invaluable reference documents.

-   **[AMER PODS](https://help.salesforce.com/s/articleView?id=000391456&language=en_US&type=1)**

-   [EMEA/APAC PODS](https://help.salesforce.com/s/articleView?id=000391425&type=1)

You should use these lists in conjunction with the other discovery methods. For example, once the maintenance page URL indicates that you are on POD 126, you can consult the AMER list to find that its location is Virginia, its DR POD is 127, and its primary outbound IP address is `136.146.57.33`.

## Mastering Your Environment

Knowing how to find your POD number is more than a technical trick. It's a sign of a developer who understands the platform on a deeper level. It empowers you to configure integrations with confidence, anticipate operational changes, and troubleshoot with precision.
