---
title: Origin Shielding in Commerce Cloud
description: >-
  Learn why origin shielding matters in Commerce Cloud, how it protects origin
  infrastructure, and when to include it in your traffic strategy.
date: '2024-11-04T08:40:19.000Z'
lastmod: '2026-07-04T13:14:18.000Z'
url: /the-importance-of-origin-shielding/
draft: false
heroImage: protecting-your-server-26dacc7cc4.jpg
categories:
  - Architecture
  - Salesforce Commerce Cloud
  - Technical
tags:
  - composable storefront
  - sfcc
  - technical
author: Thomas Theunen
takeaways:
  - "Explains what origin shielding is in the SFCC and eCDN context and why it protects storefront and API origins from direct access"
  - "Highlights the practical impact on PIG access, third-party integrations, and Managed Runtime origin locking"
  - "Provides a short operational checklist for reducing disruption through vanity domains, communication, testing, and monitoring"
---
Today, we're exploring the crucial role of [Origin](https://www.cloudflare.com/learning/cdn/glossary/origin-server/) Shielding in Salesforce B2C Commerce Cloud. As online security becomes increasingly important (and always has been), we'll look at what Origin Shielding (and Origin Locking) is. We will also share the steps involved in your projects.

Let's dive into the details!

## What is "Origin Shielding"?

Origin shielding protects the origin server - in our case the Application Servers - by funneling all incoming traffic through an intermediate layer, or shield.

When someone tries to access content hosted on Salesforce, Mobify, or Demandware, the Embedded Content Delivery Network (eCDN) steps in. It intercepts the request, verifies its legitimacy, and only sends valid requests to the origin servers.

This process helps reduce the risk of direct attacks on the origin infrastructure and adds an extra layer of protection against unauthorised access. After all, Cloudflare does have a few things in its arsenal.

Long story short, origin shielding is a security measure for safeguarding cloud-hosted infrastructure, ensuring both the integrity and availability of Salesforce’s services.

{{< img-caption src="origin-shielding-v2-280aa345d3.jpg" alt="A dramatic image of a superhero in front of a server, protecting it from a 'bad' actor in the shadows." caption="Origin shielding acts as a protective layer between the public internet and Salesforce's cloud infrastructure." >}}

## The back-end and OCAPI

Origin shielding was implemented to manage access to the Demandware URLs of our storefronts and the OCAPI on the "Primary Instance Groups."

Although this change was communicated multiple times in advance, [many projects still encountered unexpected disconnections from third-party services](/a-look-back-at-origin-shielding/).

With the introduction of Origin Shielding, any third-party system attempting to access controllers or OCAPI APIs through the Demandware URL received an error page.

{{< img-caption src="cloudflare-origin-shielding-error-b81358c14c.png" alt="A screenshot of the Cloudflare Origin Shielding error shows that the user has been blocked." caption="Third-party integrations using the legacy Demandware hostname hit this Cloudflare block after Origin Shielding was enforced." link="cloudflare-origin-shielding-error-b81358c14c.png" >}}

## SCAPI

The SCAPI has not changed much. It still operates on Cloudflare Edge Functions and manages all the complexities behind the scenes.
However, this setup means we have less control and are entirely dependent on Salesforce to ensure everything works smoothly.

## Managed Runtime and Origin Locking

In the Composable Storefront, we gain more control because we handle all the operations ourselves. Fortunately, this process is [fully documented on the help site](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/managed-runtime-administration#access-control-headers)!

What if I don't? It's important to protect your "origin," which is the Mobify domain. If you don't, you risk allowing Google and other bots to index this domain, which can negatively impact your SEO.

This could lead to users accidentally accessing the Mobify domain, rather than your vanity one.

## An overprotective "hero"

The image I used before may seem a bit dramatic, but it highlights that we need to be vigilant with ourselves. The system doesn’t distinguish between good and bad actors, which can lead to inconveniences.

We need the "know-how" to ensure our third-party systems can access everything we require.

## What do I do?

To ensure that both you and any third-party systems do not encounter access issues due to Origin Shielding, just do a few simple things.

The steps below might seem simple and even like common sense. However, during the stress of going live and approaching deadlines, they can easily be overlooked.

All PIG instances are behind it In recent years, the "Origin Shielding" transformation has caused unexpected access errors for some users in their environments. However, this should no longer be an issue for new projects, as this is now the standard practice.

### 1\. Configure Vanity Domains

The first thing to do to prevent access interruptions is to configure a vanity domain for all your environments, including staging, development, and production.

A vanity domain serves as a friendly URL that is easier to remember and manage while also being recognised by Origin Shielding ([and configured in the eCDN itself](/lets-go-live-ecdn/) ).

Rather than having '_https://production-eu01-mybrand.demandware.net_', we can use a nicer domain such as '_https://brand.com_'

### 2\. Use the domains

The next step is pretty simple: _**Good communication**_. Make sure to inform all relevant parties to update their configurations to point to the vanity domains rather than the direct Demandware URLs.

Communicating this information to the right people will significantly reduce the likelihood of encountering error pages due to unauthorised access errors.

### 3\. Test

Before launching, make sure to test everything thoroughly. Check that all third-party systems can access your storefront and API features through the vanity domain. This step will help you find and fix any issues before they affect your operations.

{{< img-caption src="good-communication-8688aa2fb2.jpg" alt="A cartoon depicting two people conversing with a chat bubble containing various colored emoticons." caption="Good communication with integration teams is essential: confirm all third-party access works through the vanity domain before go-live." >}}

### 4\. Monitor

Not everything is in our power Some logs are easier to access than others. However, Salesforce has made significant improvements over the past two years to enhance our access to tools like the eCDN and Managed Runtime logs.

Monitor your eCDN logs for any unusual activity or blocked requests. This will help you spot if any third-party systems are trying to access your resources, allowing you to take action quickly.
