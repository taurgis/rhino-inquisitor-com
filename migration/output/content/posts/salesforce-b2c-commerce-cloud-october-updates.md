---
title: Salesforce B2C Commerce Cloud October Updates
description: >-
  We have just received the final release ($1) of the year. But that does not
  mean there are no updates to some APIs and cartridges.
date: '2022-10-24T17:48:25.000Z'
lastmod: '2022-10-24T17:52:28.000Z'
url: /salesforce-b2c-commerce-cloud-october-updates/
draft: false
heroImage: /media/2022/people-upgrading-a-server-rack-0c2ba08791.png
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - sfcc
  - technical
author: Thomas Theunen
---
We have just received the final release ([22.10](/salesforce-b2c-commerce-cloud-22-10/)) of the year. But that does not mean there are no updates to some APIs and cartridges.  Let us have a look what has changed in the past month.

## OCAPI & SCAPI

### Trusted Agent

[![Diagram showing SLAS trusted-agent authentication in the October updates article.](/media/2022/slas-trusted-agent-099b4e2206.png)](/media/2022/slas-trusted-agent-099b4e2206.png)

-   [https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas-trusted-agent.html](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas-trusted-agent.html)

This month a new addition to the SLAS ([Shopper Login API](/slas-in-sfra-or-sitegenesis/)) appeared! The ability to authenticate as a Trusted Agent (Customer Service) to log in on behalf of a customer. This is not a new feature, as this was already possible using the OCAPI. But it is good to see that this has also made its way to SLAS, so we do not have to combine authentication methods for these use cases. Another added advantage is that this authentication works with the Account Manager, so we do not have to worry about security on that part (2FA is included this way!) Permissions This new API depends on an Account Manager account with a "user" in that specific environment. Permissions and roles define what these users are capable of:

-   Login\_On\_Behalf
-   Create\_Order\_On\_Behalf

## Account Manager

The account Manager [received some updates](https://help.salesforce.com/s/articleView?id=sf.account_manager_rn_1_31_102_release.htm&type=5&language=en_US) this month on the 5th of October:

-   Security Fixes
-   Bug Fixes
-   Updates to the email sent by the Account Manager.  Updates include new messaging and a new format that improves the user email experience.

## New Ideas

Whether or not you believe this works to get things prioritized, giving good ideas some points will at least point the roadmap team in a specific direction. For that reason, I created this new section that lists all new ideas posted in the past month!

-   [Reports & Dashboards - Promotion dashboard enhancements](https://ideas.salesforce.com/s/idea/a0B8W00000L7GuRUAV/reports-dashboards-promotion-dashboard-enhancements)
-   [Provision to upload custom robots.txt per domain similar to custom sitemap files](https://ideas.salesforce.com/s/idea/a0B8W00000L7BCbUAN/provision-to-upload-custom-robotstxt-per-domain-similar-to-custom-sitemap-files)
-   [Audit Log on Custom Object Values](https://ideas.salesforce.com/s/idea/a0B8W00000KuSVfUAN/audit-log-on-custom-object-values)

## Updated Cartridges & Tools

### plugin\_reorder\_demo

-   [https://github.com/SalesforceCommerceCloud/plugin\_reorder\_demo](https://github.com/SalesforceCommerceCloud/plugin_reorder_demo)

> This is the repository for the plugin\_reorder\_demo plugin. This plugin enhances the plugin\_commercepayments cartridge by providing re-order functionality, including the following capabilities: - Registered shoppers can re-order previously placed orders from their accounts

A new cartridge popped up with re-ordering functionalities. Although it requires the Salesforce Payments cartridge, you can use the code as a cheat sheet when implementing your version that does not use it.

### b2c-tools (v0.11.1)

-   [https://github.com/SalesforceCommerceCloud/b2c-tools](https://github.com/SalesforceCommerceCloud/b2c-tools)

> b2c-tools is a CLI tool and library for data migrations, import/export, scripting and other tasks with SFCC B2C instances. It is intended to be complimentary to other tools such as sfcc-ci for development and CI/CD scenarios.

Page Designer orphan cleanup example and support by [@clavery](https://github.com/clavery) in [#86](https://github.com/SalesforceCommerceCloud/b2c-tools/pull/86) See [examples/page-designer-orphan-cleanup.js](https://github.com/SalesforceCommerceCloud/b2c-tools/blob/main/examples/page-designer-orphan-cleanup.js)
