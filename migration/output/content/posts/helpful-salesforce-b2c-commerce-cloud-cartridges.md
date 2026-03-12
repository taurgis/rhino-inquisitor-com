---
title: Helpful Salesforce B2C Commerce Cloud Cartridges
description: >-
  There are quite a bit of third-party cartridges available for Salesforce B2C
  Commerce Cloud. Let us look in detail at a few of these!
date: '2022-09-20T06:29:08.000Z'
lastmod: '2022-09-20T06:31:08.000Z'
url: /helpful-salesforce-b2c-commerce-cloud-cartridges/
draft: false
heroImage: /wp-content/uploads/2022/03/modules.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - cartridge
  - technical
author: Thomas Theunen
---
Over the years, an extensive list of cartridges has grown in the [marketplace](https://www.salesforce.com/products/commerce-cloud/partner-marketplace/). These are certified integrations that have gone through a checklist and verified by Salesforce.

Whether or not this checklist is as complete as it should be is another topic I will probably give a stab at in a future blog post.

But besides these third-party integrations, there are a lot of other cartridges [available on GitHub](https://github.com/SalesforceCommerceCloud). These range from third-party integration to utility cartridges to make our lives a little bit easier.

Let us have a look at a few of these!

_**Note**: If you do not have access to the Salesforce B2C Commerce Cloud GitHub repositories, follow the [documentation](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/site_development/b2c_github_repo_access.html)._

## Custom Feeds

[![A screenshot of the Custom Feeds interface in the Business Manager, showing a configuration for a Google Feed.](/media/2022/custom-feed-9148030910.png)](/media/2022/custom-feed-9148030910.png)

-   [GitHub Repository Link](https://github.com/SalesforceCommerceCloud/custom-feeds)

When a request has come in to generate a "custom" feed towards an external system, this is probably one of the first cartridges that pop up in searches for pre-made solutions.

This cartridge allows you to generate Custom XML or CSV feeds from the business manager through a custom-built interface. In a sort of "programming language," you define the structure of your file and which attributes to print.

A convenient cartridge! But there are some things to keep in mind:

-   **It is old:** Looking at the last commit date being five years ago, it goes without saying that a lot has changed in that period.

    I have a version kept up to date with all deprecated code removed.

    So for anyone new to the cartridge, it is no longer plug-and-play. You will need to update a bit of code!


-   **Complex Use Cases:** Some use-cases that are a bit more complex will require modification to the code. e.g., in the screenshot, you see {{locale}}, this is not available by default and has to be customized to allow the generation of files per locale.


-   **Demandware library:** Besides being "old," it is also dependent on a secondary cartridge called "Demandware library." This cartridge was "abandoned" more than five years ago.


-   **Heavy Job:** The cartridge uses a job to generate all configured feeds. Remember that the more data you have, the longer the job will run. **With an extensive catalog, it could run for hours!**

## plugin\_slas

-   [GitHub Repository Link](https://github.com/SalesforceCommerceCloud/plugin_slas)

This cartridge integrates the SLAS (Shopper Login and API Access Service) within SFRA. [I have covered this one extensively](https://www.rhino-inquisitor.com/slas-in-sfra-or-sitegenesis/) in a separate article which I recommend reading!

## Resource Manager

[![A screenshot of the Resource Manager in the business manager.](/media/2022/resource-manager-4a86b3a33c.png)](/media/2022/resource-manager-4a86b3a33c.png)

-   [GitHub Repository Link](https://github.com/SalesforceCommerceCloud/resource-manager)

Most people involved with Salesforce B2C Commerce Cloud will have probably asked or get the question(s): "Can we work with translations easier?", "Can we quickly deploy this translation to production?" and many more in that area.

Since translations are part of the code (resource files), they depend on the code's release cycles. This can be a very long time for translations to wait for a simple change.

The Resource Manager project is an attempt to answer these questions. It moves translation management from the code repository to the Business Manager by cleverly using the [Velocity Template](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/site_development/b2c_velocity_templates.html) system.

There are some things to keep in mind when switching to this method:

-   **Initial Migration**: If you are already live with a large number of translations, you will have to think carefully and plan your migration as it takes a few steps to do (conversion of property files to custom objects)


-   **Site-Specific:** With this setup, all of your translations become site-specific. If you have a lot of different sites in your structure, maintenance could become tricky.


-   **Instance Specific:** Since translations are stored in custom objects, they are instance-specific (sandbox vs. staging vs. development vs. production)


-   **Sandboxes:** Resource Manager is designed with replication in mind, but not your sandboxes. So a workflow needs to be thought up to keep all instances up-to-date with all translations.

## Page Designer Plus

[![](/media/2022/page-designer-plus-9eedd5b72f.jpg)](https://www.rhino-inquisitor.com/wp-content/uploads/2022/04/page-designer-plus.png)

-   [GitHub Repository Link](https://github.com/SalesforceCommerceCloud/link_royalcyberpd)

People who follow [Royal Cyber Inc.](https://www.linkedin.com/company/royal-cyber-inc-/) on LinkedIn have probably seen this cartridge pop up in their feed. But a little-known secret is that this is available on GitHub for anyone to use (for now)!

This cartridge adds new page types and components to Page Designer:

-   HTML Markup
-   Video
-   Slider
-   Content Assets within Page Designer
-   ...

## Commerce Cloud Libraries

-   [GitHub Repository Link](https://github.com/taurgis/salesforce-commerce-cloud-libraries)

A little bit tooting my own horn, but I honestly believe this collection of cartridges is something people should at least know exists.

A few years ago, I was frustrated that I couldn't use a few popular libraries on the server-side of Salesforce B2C Commerce Cloud. So I set out to convert a few to cartridges:

-   Moment.js
-   Lodash
-   date-fns
-   fast-XML-parser
-   chance
-   ramda
-   jsPDF

The list hasn't grown much in the last two to three years (I switch side projects a little bit too much). But the most recent addition (jsPDF) [received an extensive blog post](https://www.rhino-inquisitor.com/pdf-and-salesforce-commerce-cloud-b2c/).

## B2C CRM Sync

[![A slide from the B2C CRM Sync presentation showing a list of advantages and features.](/media/2022/b2c-crm-sync-96c282e333.gif)](/media/2022/b2c-crm-sync-96c282e333.gif)

-   [GitHub Repository Link](https://github.com/SalesforceCommerceCloud/b2c-crm-sync)

This might seem a little out of place than the others as "multi-cloud."

The main goal of this solution is to link Salesforce B2C Commerce Cloud and Salesforce CRM together, and it does it well.

But why is it in there? Well, it is an excellent source of inspiration for other cartridges or tools for your projects:

-   **CLI:** The entire system can be set up using an environment file and commands. The commands include deploying code and running jobs. A great cheat sheet if you ask me!


-   **CRM:** Integrations with other platforms of Salesforce have happened more often in recent years; this gives you a sound basis for setting up your connection!

## And many more

There are [a lot of cartridges like this](https://www.rhino-inquisitor.com/community-repositories/) out there, and covering them all is quite impossible. But be sure to leave a comment if you have an interesting one to share! I might do a follow-up blog post with more cartridges that need some love.
