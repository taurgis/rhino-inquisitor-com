---
title: 'Salesforce B2C Commerce: The 22.5 Release'
description: >-
  In this article, we look at the release notes of Salesforce B2C Commerce Cloud
  for May 2022 and dig deeper into them.
date: '2022-04-18T07:31:52.000Z'
lastmod: '2022-07-23T21:51:46.000Z'
url: /salesforce-b2c-commerce-the-22-5-release/
draft: false
heroImage: /media/2022/b2c-control-center-3581b7d6c3.png
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - on demand sandbox
  - sfcc
  - technical
author: Thomas Theunen
---
A new month, a new release of Salesforce B2C Commerce Cloud. Let us dig a little deeper in the [release notes](https://help.salesforce.com/s/articleView?id=sf.rn_b2c_rn_22_5_release.htm&type=5) to see what is new!

Are you interested in last month's release notes? [Read the 22.4 release notes](/b2c-commerce-whats-new-in-22-4/)!

## Documentation and community move

In May, a significant change is the decommissioning of the [CCDC](https://developer.commercecloud.com/) (Commerce Cloud Developer Center).

But do not fear! All documentation has been safely migrated to the primary [Salesforce Developer Center](http://developer.salesforce.com/developer-centers/commerce-cloud)!

The communities that were part of the CCDC have also been migrated into the existing [Trailblazer Community](https://trailhead.salesforce.com/trailblazer-community/groups/0F94S000000H1fESAS?tab=discussion&sort=LAST_MODIFIED_DATE_DESC), so all of that information (questions and answers) is not lost!

This is, in my opinion, an excellent move to integrate the Commerce Cloud community more into the [Salesforce Ohana](/the-state-of-ohana-for-salesforce-commerce-cloud/).

## Platform

### Encryption at Rest

To improve the platform's security, a new **PILOT** program was started. This program aims to encrypt all customer data on the Salesforce B2C Commerce platform stored on the POD (servers).

This is achieved using Host Disk Encryption offered by the OS and [Volume Encryption](https://docs.netapp.com/us-en/ontap/encryption-at-rest/configure-netapp-volume-encryption-concept.html) provided by NetApp.

Another great move to ensure all sensitive data stored on Salesforce servers are protected from "prying eyes." 2022 is undoubtedly a year with a significant focus on improving the platform's (already solid) base.

**Note**: Salesforce is actively looking for customers in the AMER region who deal with highly sensitive data (health information). If you are already an active customer, **a realm move will be required.**

### Control Center

[![Control Center scheduler for planning on-demand sandbox uptime.](/media/2022/control-center-ods-scheduler-6e883d6157.png)](/media/2022/control-center-ods-scheduler-6e883d6157.png)

As On-Demand Sandboxes have become the new standard for Salesforce B2C Commerce, the UI of the [Control Center](https://controlcenter.commercecloud.salesforce.com/index.html) is being revamped as well.

We already had [the option to schedule our Sandboxes uptime through a REST API](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/sandboxes/b2c_sandbox_operation_scheduler.html), but a UI is now available to make life a little easier.

### Tiktok Integration

[![TikTok for Business branding used for the beta integration announcement.](/media/2022/tiktok-for-business-e34f4d0876.jpeg)](/media/2022/tiktok-for-business-e34f4d0876.jpeg)

A beta program is available to test an integration between B2C Commerce Cloud and Tiktok. This Beta aims to create storefronts and advertise products on Tiktok using products and shopper activity data.

**Currently, recruiting for this feature is paused until further notice!**

Even though recruiting is currently on hold, it is good to see the Salesforce team is actively investigating integrating with social channels.

## PWA Kit v1.5.x

As with SFRA, the first years will see quick releases with new features added. Besides the major "2.x" release currently in the developer preview, improvements are being made to the "1.x" version concurrently.

In this release, these new features and improvements were added:

- [Multiple Sites support](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/multiple-sites.html)
- Forgot Password Flow ([Community Contribution](https://github.com/SalesforceCommerceCloud/pwa-kit/pull/373))
- Support Hybrid Storefronts ([SFRA and PWA Kit](https://github.com/SalesforceCommerceCloud/pwa-kit/pull/429))
- [Bug Fixes](https://github.com/SalesforceCommerceCloud/pwa-kit/releases/tag/v1.5.0)

## SCAPI

### Shopper Context API

The Shopper Context API will enable customers to build headless storefronts with personalization. This API is currently in the BETA stage, so you may opt in at your discretion.

> The context information is evaluated against the customer group definitions to determine a customer group (shopper segment) and then used to activate the experiences associated with a particular segment, such as promotions.

Want to make use of this API? The documentation is available [in the Shopper Context API reference](https://developer.salesforce.com/docs/commerce/commerce-api/references?meta=shopper-context:Summary)!

### SLAS Password-less Login

This new addition to the SLAS APIs will allow registered customers to log in without using a password.

Instead, it will allow you to log in using a private link sent to your email (and later through SMS or a TOTP application).

The documentation is available here:

- [Shopper](https://developer.salesforce.com/docs/commerce/commerce-api/references?meta=shopper-login:/organizations/%7BorganizationId%7D/oauth2/passwordless/login)
- [Admin](https://developer.salesforce.com/docs/commerce/commerce-api/references?meta=slas-admin:/tenants/%7BtenantId%7D/clients/%7BclientId%7D/passwordless-templates)

This change gives us more flexibility in providing login options to customers.

**Note:** This API is only available for private clients~~, and the email login templates only support plain text. For now, styling the e-mail for the password-less login option is out of the question.~~

**Update:** It turns out that HTML is supported; the API determines if it is plain text or not. **Be sure to validate your HTML on different email clients,** as the service does not do any validation of the template!

## Business Manager

### Rule-Based Categorization

[![Rule-based categorization screen showing product exclusion rules.](/media/2022/product-exclusion-list-rule-based-0acada8ea8.png)](/media/2022/product-exclusion-list-rule-based-0acada8ea8.png)

[Dynamic Categorization](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/categories/b2c_dynamic_categories.html) is a recent addition to the Salesforce B2C Commerce Cloud feature list, allowing the automatic (job-based) assignment of products to specific categories on configurable criteria.

Over the past months, a lot of feedback has been provided on this feature. And in this release, two new updates are announced:

- Ability to create exclusion rules for products
- Maximum conditions for a rule have been increased from 5 to 20

Having the option to set more than five conditions will give merchandisers more flexibility when organizing their categories.

### Salesforce Payments Credentials Storage

Salesforce Payments is getting some love in this release. The first addition is storing payment card credentials for:

- **Future off-session use:** Support for recurring subscription payments or delayed payments (pay when order is fulfilled)

- **Save for on-session use:** Store payment options for a quicker customer check-out (only available in a shopper session)

It is good to see these features being added to the "native" payment option within Commerce Cloud. Storing payment methods will open the door for new use-cases and allow customers to place orders faster and have a better user experience!

### Klarna for Salesforce Payments

[![Klarna availability within the Salesforce Payments and Stripe flow.](/media/2022/klarnastripe-6dabc3b122.jpg)](/media/2022/klarnastripe-6dabc3b122.jpg)

For most, [Klarna](https://www.klarna.com/international/) is a well-known payment method. This option has now been added to Salesforce Payments giving shoppers the ability to use the three different pay-later options that Klarna provides:

- Installments
- Pay Later
- Financing

Another advantage for merchants is that no additional agreement needs to be signed with Klarna. But as always, with payment providers, check the costs per payment that are part of your [existing agreement](https://stripe.com/en-be/pricing?utm_campaign=paid_brand-BE_en_Search_Brand_Stripe-868855632&utm_medium=cpc&utm_source=google&ad_content=307877157763&utm_term=kwd-487920435973&utm_matchtype=e&utm_adposition=&utm_device=c) with Stripe.

**Note:** The merchant receives payments [according to a payout schedule](https://www.klarna.com/uk/business/merchant-support/when-will-we-receive-payment-from-klarna/) even though customers pay the amount later.

## Development

### Custom Job Steps Context

Jobs that store non-primitive data types of values in **dw.job.JobExecution.getContext()** now fail. Previously, the job logged a warning, ignored the invalid value, and continued.

### Known Issue Bugfixes

I have looked at the recently updated issues but found that they are still "In Review," and none have been updated to resolve for this release.
