---
title: 'Salesforce (Commerce) Payments: Payment Integration Simplified'
description: >-
  As a $1 connoisseur, you know how important it is to have a seamless customer
  payment process. After all, a clunky checkout experience can result in aba...
lastmod: '2023-03-31T07:19:52.000Z'
url: /salesforce-payments-experience-explained/
draft: false
heroImage: >-
  /media/2023/person-holding-creditcard-next-to-register-vintage-scaled-859dbc394a.jpg
date: '2023-03-27T14:54:22.000Z'
categories:
  - Salesforce Commerce Cloud
tags:
  - payment
  - sfcc
author: Thomas Theunen
---
As a [Commerce Cloud](https://www.rhino-inquisitor.com/the-salesforce-b2c-commerce-cloud-environment/) connoisseur, you know how important it is to have a seamless customer payment process. After all, a clunky checkout experience can result in abandoned carts and lost sales. But what exactly is [Salesforce Payments](https://trailhead.salesforce.com/content/learn/modules/cc-commerce-payments) - or [Commerce Payments](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/salesforce_payments/b2c_salesforce_payments.html), and how can it benefit you with the payment provider implementation? In this article, we'll explore the ins and outs of Salesforce Payments, from its features and benefits to the integration.

## A plugin?

![](/media/2023/salesforce-payments-business-manager-6773ef14af.webp)

Salesforce Payments in the Business Manager

Salesforce Payments is an optional "plugin" consisting of a native Business Manager interface and cartridge that provides native integration with the payment provider "[Stripe](https://stripe.com/)". Since this payment provider may not apply to all projects, you are not forced to enable and use it. But if you are still in the process of selecting a Payment Service Provider, this is a strong contender to consider. But hold off on deciding until you have read this article.

### Stripe

If you're a developer working with e-commerce platforms, you've likely heard of Stripe, a technology company that provides an online payment processing platform. Founded in 2010 by brothers [Patrick](https://en.wikipedia.org/wiki/Patrick_Collison) and [John Collison](https://en.wikipedia.org/wiki/John_Collison), Stripe has become one of the world's most widely used payment gateways, processing billions of transactions yearly. One of the reasons for Stripe's popularity is its ease of use and straightforward APIs. But Stripe is more than just popular because it's easy to use. The platform also offers a range of advanced features, such as support for multiple currencies, fraud prevention tools, and powerful analytics capabilities. Another factor that has contributed to Stripe's success is its commitment to innovation. The company constantly releases new features and updates to its platform, ensuring it stays at the forefront of the rapidly evolving e-commerce landscape. And with the integration of Salesforce Payments, companies can take advantage of Stripe's capabilities directly within the Salesforce platform.

## Salesforce Payments

The key benefit of integrating Salesforce Payments into your e-commerce project is the ability to manage payments directly within the Salesforce platform. That way, you can easily set up and manage payment methods and view payment information within a single, unified platform. This out-of-the-box integration can help save time and reduce the need for custom development work, allowing developers and businesses to focus on other aspects of their e-commerce projects. https://www.rhino-inquisitor.com/wp-content/uploads/2023/03/salesforce-payments-business-manager-sfcc.mov

### New features added regularly

Usually, when you integrate with a payment provider, updates happen to their APIs - but it is still your responsibility to implement them. With Salesforce Payments, new features get added regularly. Let us have a look at the past few months:

-   [23.4 - Extend Payment Processing with Salesforce Payment APIs](https://www.rhino-inquisitor.com/everything-new-in-sfcc-23-4/)
-   [23.3 - Buy Now Items Get Their Own Cart](https://www.rhino-inquisitor.com/salesforce-b2c-commerce-cloud-23-3-release/)
-   [23.2 - Set Up Payments for Immediate or Future Payment Capture](https://www.rhino-inquisitor.com/salesforce-b2c-commerce-cloud-23-2/)
-   [23.1 - Orders from Stored Information with Salesforce Payments](https://www.rhino-inquisitor.com/salesforce-b2c-commerce-cloud-23-1/)
-   [22.7 - AfterPay and Venmo added to Salesforce Payments](https://www.rhino-inquisitor.com/salesforce-b2c-commerce-cloud-22-9-release/)

#### Double-Edged Sword?

As you may already know, the checkout process plays a crucial role in the customer journey. However, by using Salesforce Payments, you surrender some control, and if any changes are made, you'll have to adjust accordingly. Nevertheless, this is the norm for the entire platform, and Salesforce is highly proficient in this field. It's simply a factor to be mindful of and to monitor by reviewing the release notes and known issues.

### Missing payment methods?

You may have noticed that Salesforce Payments [only supports some payment methods](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/salesforce_payments/b2c_salesforce_payments_platforms_services.html) available on Stripe. This is an important consideration when selecting a payment provider for your current and future projects. Keep this in mind!

### Combining with other payment providers

I talked about the "Double-Edged Sword" before, but it's even more important to keep in mind if you're considering adding more payment providers later. With most payment providers, you can get your hands on the source code for their cartridge and customise it however you want, even combining it with other providers. But you have less control over Salesforce Payments, which could cause you to hit a wall or two before coming to a solution.

### Composable Storefront

Currently, there is no readily available integration for the [PWA Kit,](https://www.rhino-inquisitor.com/sitegenesis-vs-sfra-vs-pwa/) a component of the Composable Storefront. However, plans are in place to include this integration in the future.

### Multi-Cloud (the future)

Do you have multiple Salesforce products in your architecture, such as Order Management? In that case, Salesforce payments will have the added benefit of being available and integrated out of the box in the future! The roadmap of Salesforce payments is filled with multi-cloud journeys! (Forward-looking statement 😅)

## How to get started

![](/media/2023/salesforce-payments-7926558e4f.jpg) For those familiar with my articles, I am not one to start reinventing (and writing) the wheel. And in this case, a rare one for B2C Commerce Cloud, Trailheads are available!

-   [Quick Look](https://trailhead.salesforce.com/en/content/learn/modules/cc-payments-processing)
-   [Salesforce Payments for Administrators](https://trailhead.salesforce.com/en/content/learn/modules/cc-commerce-payments)
-   [Official Salesforce Payments Product Page](https://www.salesforce.com/products/commerce-cloud/solutions/payments/)
-   [Documentation](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/salesforce_payments/b2c_salesforce_payments.html)
-   [Demo](https://www.salesforce.com/form/commerce/conf/payments-demo?leadcreated=true&redirect=true&sfuuid=31472534-1e3c-4b8a-a90a-9156e45c6e61&d=70130000000sUVq&nc=7013y000002KFkZAAW)

Support Ticket As usual, this feature must be enabled on your environment through a support ticket if you are a partner (on a sandbox, for example). As a customer, please contact your CSM to get the ball rolling!

## Other options

As mentioned, Salesforce provides this as an option - not a pre-requisite. You still have the freedom to integrate [any PSP your heart desires](https://appexchange.salesforce.com/category/payment). But does that mean more custom development is needed to integrate them? The short answer is no, but it depends on whether they provide a cartridge (third-party plugin). The most significant difference will be the need for integration in the Business Manager. You will have to configure the different payment options in a separate interface unless a payment provider decides to write a custom-built Business Manager module too.  But for most, the benefits of this fully-fledged custom-built administrative module outweigh the cost of development and keeping it up to date (at least, that is my speculation). But, of course, nothing stops you from building it yourself - if time and budget are available, that is. Here is a list of Payment Service Providers that have a storefront cartridge available, which will ultimately mean less development to get it up and running:

-   [Adyen](https://www.adyen.com/)
-   [Mollie](https://www.mollie.com/be)
-   [CCV](https://www.ccv.eu/en/)
-   [Braintree](https://www.braintreepayments.com/)
-   [Worldline](https://www.six-payment-services.com/en/site/e-commerce/solutions/paymentsolution.html)
-   [Stripe](https://stripe.com/) (yes, you can do the integration yourself)
-   Many, many more!

## Conclusion

By leveraging Salesforce Payments, you can provide customers with various payment options, reduce the need for custom development work (and the complexity), and streamline the payment processes.
