---
title: 'Let’s GO-LIVE: The Salesforce B2C Commerce Cloud Environment'
description: >-
  Welcome to the, a set of articles about preparing for the launch of one or
  more channels on Salesforce B2C Commerce Cloud.
date: '2022-08-22T17:37:46.000Z'
lastmod: '2022-08-23T07:19:42.000Z'
url: /the-salesforce-b2c-commerce-cloud-environment/
draft: false
heroImage: /media/2022/connected-systems-d281b9e674.jpg
categories:
  - Architecture
  - GO-LIVE
  - Salesforce Commerce Cloud
  - Technical
tags:
  - security
  - sfcc
  - technical
author: Thomas Theunen
---
Welcome to the [GO-LIVE series](/category/go-live/), a set of articles about preparing for the launch of one or more channels on Salesforce B2C Commerce Cloud.

This is only the second article so far, but after releasing the first one about the [eCDN](/lets-go-live-ecdn/), I felt I might have skipped some vital information.

Sure, there was an explanation of the eCDN and its use. But not how it fits in the "bigger picture." So let us look at the architecture of the different environments in Salesforce B2C Commerce Cloud!

## An overview

Before we move into the details where the [Embedded CDN](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/admin/b2c_embedded_cdn.html) (eCDN) is mentioned, let us get an overview of the components that make up "SFCC."

[![System overview diagram of the main Salesforce B2C Commerce environment components.](/media/2022/system-overview-systems-v2-96d8264c0f.jpeg)](/media/2022/system-overview-systems-v2-96d8264c0f.jpeg)

[View on Lucidchart](https://lucid.app/lucidchart/b0626d57-dcec-4892-a5e9-5931606b6347/edit?viewport_loc=-594%2C632%2C3328%2C1558%2CCbsI46FLCC7p&invitationId=inv_90859153-9efa-47b0-89e1-e099b200ab73#)

### Commerce Cloud Core

It all starts with the big chunk of functionality at the center, "Commerce Cloud," which consists of:

-   The monolithic storefront using [SFRA or SiteGenesis](/sitegenesis-vs-sfra-vs-pwa/)
-   The Open Commerce API for Headless applications
-   The WebDAV filesystem



### Einstein

We can't forget about one of the big selling points of SFCC, the "built-in" AI that will analyze shopper behavior and give recommendations to increase revenue and the average size of the basket.

_**Note:** I have an article explaining what Einstein is and what it can do in the pipeline!_

### SCAPI

As you can see in the diagram at the top of the section, the SCAPI is a set of RESTful APIs built in MuleSoft that proxy the OCAPI behind the scenes to allow some extra things on top of the original OCAPI.

But besides having some APIs that the OCAPI does not have, there are [some drawbacks (for now)](https://developer.salesforce.com/docs/commerce/commerce-api/guide/get-started.html).

MuleSoft Even though this is MuleSoft, you do not get access to it yourself. It is fully managed by Salesforce and has probably been put in place to allow for flexibility in the future.

### Log Center

Can't find your way in the logs on the WebDAV? Have no fear; Log Center is here.

In the Log Center, you can easily filter and search for specific log entries and even be notified when particular thresholds are met.

### Reports & Dashboards

Need insights on your sales or site performance? In this tool, you can view statistics on:

-   Sales
-   Products
-   Promotions
-   Search
-   Traffic
-   Einstein
-   Technical data (performance)



### Control Center

The place to be if you want to manage all of your environments (Sandboxes, PIG Instances). Using this tool, you can create, start, restart, stop and reset environments linked to your account.

### Composable Storefront

The latest addition to the diagram, the answer to all your [Headless Storefront needs](/sitegenesis-vs-sfra-vs-pwa/)!

### Account Manager

Since all of the items mentioned above are separate tools/sites you have to visit, it would be a shame if you had to keep track of different credentials (you had to for a long time).

Account Manager provides you with "[Unified Authentication](https://help.salesforce.com/s/articleView?id=000358615&language=en_US&type=1)" so that permissions and user credentials can be managed from a central location, rather than having separate ones for each application.

## From the perspective of a request

In the diagram below, we look at a potential request to an SFRA or SiteGenesis channel and see what different layers it passes before a visitor gets a page rendered in their browser!

In this case, the explanation of each component of the environment is in the diagram itself. Word of warning though, this is a lot more "technical" than the previous section.

[![Request flow diagram showing how traffic moves through the Salesforce B2C Commerce environment.](/media/2022/system-overview-journey-of-a-request-de0673b3bd.jpeg)](/media/2022/system-overview-journey-of-a-request-de0673b3bd.jpeg)

[View on Lucidchart](https://lucid.app/lucidchart/b0626d57-dcec-4892-a5e9-5931606b6347/edit?viewport_loc=-658%2C62%2C3328%2C1558%2C0_0&invitationId=inv_90859153-9efa-47b0-89e1-e099b200ab73#)

### Layering the CDN

It is possible to introduce your CDN (e.g., Akamai) or your own Cloudflare account next to the eCDN.

The critical thing to remember is that the eCDN will **always be part of the chain**!

### Origin Shielding

As of August 2022, [Origin Shielding](https://help.salesforce.com/s/articleView?id=000364472&type=1) has become active. All storefront (shopper) traffic must pass through the eCDN (Cloudflare).

This change does not affect:

-   Business Manager
-   Inventory Service
-   Analytics Service
-   Mainstreet Order Management Service
-   Order Integration Service
-   Salesforce Commerce API (SCAPI) calls
-   Shopper Login (SLAS)
-   Image Downloader Service
-   WebDAV calls
-   /dw/monitor calls for health checks
-   sffc-ci tool (developer instance only)
-   Data APIs
