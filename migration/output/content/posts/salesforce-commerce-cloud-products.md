---
title: 9 Salesforce Commerce Cloud Products
description: >-
  You are probably here, reading this blog to learn more about $1. But over the
  past years, more products have been put under Salesforce Commerce Cloud "w...
lastmod: '2023-07-17T09:11:18.000Z'
url: /salesforce-commerce-cloud-products/
draft: false
heroImage: /media/2022/salesforce-commerce-cloud-af0419a10b.png
date: '2023-07-17T09:07:01.000Z'
categories:
  - Salesforce Commerce Cloud
tags:
  - sfcc
author: Thomas Theunen
---
You are probably here, reading this blog to learn more about [Salesforce B2C Commerce Cloud](https://www.rhino-inquisitor.com/the-salesforce-b2c-commerce-cloud-environment/). But over the past years, more products have been put under Salesforce Commerce Cloud "wings."

Salesforce has quite the history of renaming products, causing some confusion with possible customers, partners, and within Salesforce itself!

Let us have a look at them, and see how some are connected to SFCC (or not).

## SFCC - Salesforce B2C Commerce Cloud (Demandware)

[![](/media/2022/sfra-vs-sitegenesis-965c09b9a6.jpg)](/media/2022/sfra-vs-sitegenesis-965c09b9a6.jpg)

Let us start with the most expected item on the list: "Salesforce B2C Commerce Cloud", also known as Demandware, before being [acquired by Salesforce for $2.8B](https://techcrunch.com/2016/06/01/salesforce-buys-demandware-for-2-8b-taking-a-big-step-into-e-commerce/). It sounds like a good deal compared to the [acquisition of Slack,](https://techcrunch.com/2020/12/01/salesforce-buys-slack/) doesn't it 😜?

Since this is an acquired product, it runs on a completely different stack than the core platform of Salesforce. And this has been a confusing topic in the general Salesforce community for a long time now (many think it is built on the CRM). The reason for that we will touch on later.

This platform mainly aims at B2C customers but doesn't shy away from supporting B2B. And being a SaaS platform, it auto-scales very well to support high-traffic events such as [Black Friday and the holiday period](https://help.salesforce.com/s/articleView?id=sf.rn_b2c_21_10_get_holiday_ready_je.htm&type=5)!

SFCC also offers some different "flavours," which I elaborated on [in an earlier article](https://www.rhino-inquisitor.com/sitegenesis-vs-sfra-vs-pwa/).

## Salesforce B2B Commerce Classic (CloudCraze)

[![](/media/2022/cloudcraze-cd6f91241b.png)](/media/2022/cloudcraze-cd6f91241b.png)

This is where the confusion started to originate (I think). In 2018 [another acquisition happened](https://techcrunch.com/2018/03/12/salesforce-will-acquire-enterprise-e-commerce-software-startup-cloudcraze/) by Salesforce, but this time in the CRM space: "CloudCraze." It was a Managed Package on the CRM that stretched the imagination of what the platform could do by building a complete B2B Platform on top of it.

Because it had to use a few tricks to allow the number of customizations an Ecommerce Platform requires, it had its "unique" way of working compared to the CRM. A lot of custom development was needed to get it up and running as you wanted it to.

But once you did, you had a fully operating B2B site in [Visualforce](https://trailhead.salesforce.com/content/learn/modules/visualforce_fundamentals).

## Salesforce B2B Commerce (Lightning)

[![](/media/2022/b2b-lightning-b6e80d0718.png)](/media/2022/b2b-lightning-b6e80d0718.png)

Since CloudCraze was a managed package on the classic environment, a new version was made in the Lightning Runtime. Salesforce started to rebuild the system from scratch to align with the CRM and allow customisations the same way as the rest of the product line.

This meant the more modern [Lightning Web Components](https://developer.salesforce.com/docs/component-library/documentation/lwc) could be used instead of [Visualforce](https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/pages_intro_what_is_it.htm) Pages.

And, of course, the feature set has grown over time to allow more flexibility and support more use cases than before!

Get to know more If you want to learn more about it, there is an excellent Youtube Channel called [Salesforce Mojo](https://www.youtube.com/@salesforcemojo)!

## Salesforce D2C or B2B2C or Commerce on Core

[![](/media/2022/salesforce-b2b2c-6f2e4e7217.webp)](/media/2022/salesforce-b2b2c-6f2e4e7217.webp)

A more recent product (not acquired this time) is D2C, which is meant to work as an extension to a B2B website. And again, this one is also built on the CRM!

With more and more B2B companies wanting to sell directly to the consumer, Salesforce had to come up with an answer. This turned out to be [D2C](https://trailhead.salesforce.com/content/learn/modules/b2b2c-commerce-basics).

The main idea of this product is to create a customer-facing website with just clicks and as little custom code as possible.

But let me get back to that "confusion" part. Do you see what name it has in the screenshot? It is also called Salesforce **B2C Commerce** Cloud. Both products target B2C customers but have a different angle on how to do this.

D2C (B2C Commerce) aims to give already Salesforce B2B Commerce clients an easy way to connect directly to their consumers as a secondary channel.
At the same time, Salesforce B2C Commerce Cloud is meant as a "primary" selling channel for Businesses that see B2B as a secondary channel.

I hope that clarifies the "confusion" regarding B2C Commerce in the Salesforce space. Or are you even more confused now? Let me know on the known social channels!

## Salesforce Order Management

[![](/media/2022/salesforce-order-management-533a060e99.png)](/media/2022/salesforce-order-management-533a060e99.png)

Another product built on the CRM, but good news. We are starting to head back into B2C Commerce Cloud territory! You may already know that an OMS (Order Management System) was once [built into Salesforce B2C Commerce Cloud](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OrderManagement/OrderManagement.html).

This has been deprecated for a while and is no longer maintained; Salesforce will always point you toward the new Salesforce OMS.

But not to worry, this product [natively integrates with SFCC](https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/salesforce_order_management_implementation_guide.pdf)! (Well, with one support ticket away to flip a switch and quite a bit of configuration) This sounds optimistic. A lot of work is involved in getting an OMS up and running. More than just connecting it to your commerce platform will be required!

If you want to learn more about this product, there are courses on the [Partner Learning Camp](https://partnerlearningcamp.salesforce.com/s/browse-catalog?plc__recordId=0RvBSrDfVelmoIn4Km63qy9o3goOMpwHhZFzPKvrn%2BcTyRqXMOHIrsQt2T0ai2Kx) and [Trailhead](https://trailhead.salesforce.com/en/content/learn/modules/om-salesforce-order-management).

## OCI (Omnichannel Inventory)

[![](/media/2022/omnichannel-inventory-0b29da8f29.png)](/media/2022/omnichannel-inventory-0b29da8f29.png)

A "smaller" product in the lineup: a "Headless" addon called [OCI (Omnichannel Inventory)](https://trailhead.salesforce.com/en/content/learn/modules/omnichannel-inventory). A set of headless APIs to manage all of your inventory.

I will not go into too much detail as I [already released a different article that digs into those details](https://www.rhino-inquisitor.com/what-is-oci-omnichannel-inventory/)!

License If you are a Salesforce B2C Commerce Cloud customer, this product is already included in your license!

## Commerce Marketplaces (Atonit)

[![](/media/2022/atonit-tableau-9dae3f80c1.png)](/media/2022/atonit-tableau-9dae3f80c1.png)

> It has been our mission to create a marketplace management solution that is both easy to start and ready to scale, which is why we originally chose to build this solution on the Salesforce platform.
>
> Salesforce has been a company that has inspired us for many years, so it is particularly exciting for us to be the first company headquartered in Brazil to be acquired by Salesforce.
>
> Atonit Corporate Blog Post

The most recent of acquisitions in the Commerce landscape: [Atonit](https://www.salesforceben.com/salesforce-signs-agreement-to-acquire-atonit/). A marketplace solution allows merchants to sell third-party products on their own website (or other channels).

Built already on the force.com platform, it made sense to make the acquisition. And also good news, it already has a cartridge for Salesforce B2C Commerce Cloud!

The idea within Salesforce is to tightly integrate this solution with its "Commerce Cloud" offering for all kinds of "markets" 😉 .

## Composable Storefront (PWA Kit and Managed Runtime)

[![](/media/2022/pwa-kit-comparison-07aff406fd.png)](/media/2022/pwa-kit-comparison-07aff406fd.png)

Last but certainly not least, we look at [another acquisition by Salesforce (Mobify)](https://www.digitalcommerce360.com/2020/09/09/salesforce-agrees-to-buy-headless-commerce-tech-firm-mobify/). The answer of Salesforce to the new buzzwords floating around:

-   Headless
-   API First
-   Composable
-   ...


The [PWA Kit](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/pwa-kit-overview.html) provides an easy path to go Headless at the pace you want to go.

Out of the box, it integrates with (_almost_) all Salesforce B2C Commerce Cloud features. But nothing stops you from swapping out a few components like CMS and Search... for another system that fits your needs.

And another advantage is the [Managed Runtime](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/mrt-overview.html). Like we are used to with SFCC, Salesforce handles the hosting, security, uptime, and performance. So really, what's not to like? [Keep Calm and Go Headless](https://shirtforce.org/tee/keep-calm-and-go-headless-salesforce-tshirt/)!

## Salesforce Payments

[![](/media/2023/salesforce-payments-7926558e4f.jpg)](/media/2023/salesforce-payments-7926558e4f.jpg)

[Salesforce Payments](https://www.rhino-inquisitor.com/salesforce-payments-experience-explained/) is a native payment solution developed for the Salesforce Commerce Cloud platforms. For B2C Commerce Cloud, it is a plugin consisting of a Business Manager interface and cartridge, which provides native integration with the payment provider Stripe.

Salesforce Payments is optional, and businesses can integrate any payment service provider (PSP) they desire. However, incorporating other PSPs may require more custom development work and offer different benefits than Salesforce Payments.
