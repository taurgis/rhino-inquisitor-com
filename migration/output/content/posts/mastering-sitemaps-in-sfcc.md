---
title: Mastering Sitemaps in SFCC
description: >-
  Learn how sitemaps work in Salesforce B2C Commerce Cloud, how to configure
  them correctly, and what developers should monitor for SEO.
date: '2025-06-16T07:30:19.000Z'
lastmod: '2025-06-24T18:22:38.000Z'
url: /mastering-sitemaps-in-sfcc/
draft: false
heroImage: /wp-content/uploads/2025/06/sitemaps-in-sfcc.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - composable storefront
  - sfcc
  - sfra
  - technical
author: Thomas Theunen
---
**Let's be honest, as developers, "SEO" can sometimes feel like a four-letter word handed down from the marketing team. But what if I told you that one of the most critical SEO tools, the sitemap, is actually a fascinating piece of platform architecture you can control, automate, and even extend with code?**

In Salesforce B2C Commerce Cloud (SFCC), the sitemap serves a purpose beyond simply listing links. It is a robust and scalable system that communicates to search engines precisely what content exists on your site and its level of importance. Properly configuring your sitemap results in faster indexing, improved visibility, and greater satisfaction for your marketing team. If done incorrectly, however, it could render your newly launched products invisible to search engines like Google, as well as tools such as ChatGPT and Google Gemini.

This guide will walk you through everything you need to know, from leveraging the powerful out-of-the-box tools to writing custom integrations and mastering sitemaps in a headless PWA Kit world.

## The "Easy Button": The Built-in Sitemap Generator

Think of the standard SFCC sitemap [generator](https://help.salesforce.com/s/articleView?id=cc.b2c_sitemap_topology.htm&language=de&type=5) as the "easy button" that handles 80% of the work for you. For massive e-commerce sites with millions of URLs, this is a lifesaver.

At its core, the platform cleverly sidesteps search engine limitations, like the 50,000 URL or 10MB file size cap, by creating a two-tiered system. It generates a main sitemap\_index.xml file, which is the only URL you need to give to Google. This index file then points to a series of child sitemaps (sitemap\_ 0.xml, sitemap\_1.xml, etc.) that contain the actual URLs.

You control all of this from the Business Manager: Merchant Tools > SEO > Sitemaps.

### Your Control Panel: The Settings Tab

[![Sitemap settings panel in Business Manager.](/media/2025/sitemap-business-manager-sfcc-1e208116dd.jpg)](/media/2025/sitemap-business-manager-sfcc-1e208116dd.jpg)

The Sitemap Settings in the Business Manager

The Settings tab is your main control panel. Here’s what you, as a developer, need to care about 4:

- **Content Inclusion:** You can choose exactly what gets included: products, categories, content assets, and even product images.
- **Priority & Change Frequency:** These settings are direct hints to search engine crawlers. Priority (a scale of 0.1 to 1.0) suggests a URL's importance relative to other pages on your site. Change Frequency (from always to never) suggests how often a page's content is updated.
- **Product Rules:** You can get granular, choosing to include only available products, available and orderable products, or all products. This directly ties into your inventory and data strategy.
- **hreflang for Multi-Locale Sites (Alternate URLs):** If you manage a site with multiple languages or regions, enabling Include alternate URLs (hreflang) is a huge win. It automatically adds the necessary tags to tell search engines about the different versions of a page, a task that can be a manual pain on other platforms.

### The Golden Rule of Scheduling

[![Job tab for scheduling sitemap generation in Business Manager.](/media/2025/sitemap-business-manager-job-13ba1762a2.jpg)](/media/2025/sitemap-business-manager-job-13ba1762a2.jpg)

The Job tab

You can run the sitemap generation manually or, more practically, schedule it as a recurring job from the Job tab. Here is the single most important operational detail:

_**Always schedule the sitemap job to run** **after** **your daily data replication from the staging instance.**_

If you run it before, all the new products and content from that day's replication will be missing from the sitemap, rendering it stale the moment it's created.

## Going Custom: When the Built-in Isn't Enough

[![The Custom tab in the Sitemap settings in the Business Manager](/media/2025/sitemap-business-manager-custom-sitemaps-sfcc-2fdf912121.png)](/media/2025/sitemap-business-manager-custom-sitemaps-sfcc-2fdf912121.png)

The "Custom Sitemaps" tab

What happens when you have content that doesn't live in SFCC? Maybe you have a WordPress blog, an external reviews provider, or a separate forum. You need to get those URLs into your site's sitemap index. SFCC gives you two powerful paths to do this.

### Path 1: The Classic Job Step (The Batch Approach)

The traditional method involves building a custom job step within a cartridge. This is ideal for batch-oriented processes, such as pulling a sitemap file from an SFTP server on a nightly basis.

Your script would use the [dw.sitemap.SitemapMgr](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_sitemap_SitemapMgr.html) script API. The key method is SitemapMgr.addCustomSitemapFile(hostName, file), which takes a file your script has fetched and places it in the correct directory to be picked up by the main sitemap generation job. This requires some classic SFCC development: writing the script and defining the job step in a [steptypes.json](https://www.rhino-inquisitor.com/mastering-chunk-oriented-job-steps-in-salesforce-b2c-commerce-cloud/) or steptypes.xml file.

### Path 2: The Modern SCAPI Endpoint (The Real-Time Approach)

For a more modern, API-first architecture, consider using the Salesforce Commerce API (SCAPI). The Shopper SEO API provides the [uploadCustomSitemapAndTriggerSitemapGeneration](https://developer.salesforce.com/docs/commerce/commerce-api/references/seo?meta=uploadCustomSitemapAndTriggerSitemapGeneration) endpoint.

This is a PUT request that enables a trusted external system to upload a custom sitemap file directly to SFCC and initiate the generation process asynchronously. This is the ideal solution for event-driven systems. For example, a headless CMS could use a webhook to call this endpoint the instant a new article is published, getting that URL into the sitemap almost immediately.

Time to run Remember that the generation part won't be complete in just a few seconds. Run your POC to determine how long it takes to process, allowing you to make informed decisions about your architecture.

## Choices... choices

| _Integration Method_|_Best For_|_Mechanism_|_Vibe_ |
| --- | --- | --- | --- |
| **Manual Upload** | One-offs, testing | UI in Business Manager | Quick & Dirty |
| **Script API Job** | Batch processes (e.g., nightly sync) | Custom job step using dw.sitemap.SitemapMgr | Classic & Reliable |
| **SCAPI Endpoint** | Real-time, event-driven integrations | PUT request to the Shopper SEO API | Modern & Agile |

## Sitemaps in the Headless Universe: PWA Kit Edition

Going headless with the Composable Storefront (PWA Kit) changes the game, but the sitemap strategy remains firmly [rooted in the backend](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/create-a-sitemap.html)—and for good reason. The SFCC backend is the system of record for the entire product catalog.

Forcing the PWA Kit frontend to generate the sitemap would require an API call nightmare to fetch all that data.

Instead, you use the backend's power and bridge the gap.

### The Standard Headless Playbook

1. **Configure the Hostname Alias:** This is the most critical step. In Business Manager (Merchant Tools > SEO > Aliases), you must create an alias that exactly matches your PWA Kit's live domain (e.g., <www.your-pwa.com>). This ensures the backend generates URLs with the correct domain.
1. **Generate in Business Manager:** Use the standard job you've already configured.
1. **Update robots.txt:** In your PWA Kit project's code, add the Sitemap directive to your robots.txt file, pointing to the full URL of the sitemap index (e.g., Sitemap: <https://www.your-pwa.com/sitemap\_index.xml>).
1. **Proxy the Request:** Your PWA Kit app needs to handle requests for the sitemap. You can add a rule to your server-side rendering logic (often in app/ssr.js) to proxy requests for /sitemap\_index.xml and its children to the SFCC backend where the files actually live. Or use the [eCDN for this job!](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/ecdn-rules-for-phased-headless-rollout.html)

### The Hybrid Approach for PWA-Only Routes

But what about pages that _only_ exist in your PWA? Think of custom React-based landing pages or an "About Us" page that isn't a content asset in SFCC. The backend generator has no idea these exist.

The solution is an elegant hybrid approach that you can automate in your CI/CD pipeline:

1. **Backend Generates Core Sitemap:** The scheduled job on SFCC runs as normal, creating sitemaps for all products, categories, and content assets.

1. **Frontend Generates Custom Sitemap:** As a build step in your CI/CD pipeline, run a script that scans your PWA Kit's routes and generates a small, separate sitemap file (e.g., `pwa-custom.xml`) containing only these frontend-specific URLs.

1. **Automate the Merge:** The final step of your deployment script makes a `PUT` request to the `uploadCustomSitemapAndTriggerSitemapGeneration` SCAPI endpoint, uploading the `pwa-custom.xml` file. This tells SFCC to regenerate the main index, adding a link to your new custom file.

This strategy uses the right tool for the job: the backend's efficiency for the massive catalog and the frontend's build process to handle its own unique pages.

## Conclusion

By mastering these tools and strategies, you can transform sitemap management from a chore into a powerful, automated part of your development and deployment workflow. You'll build more robust sites, ensure content is discovered faster, and become an SEO hero in the process.
