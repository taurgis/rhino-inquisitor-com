---
title: SFCC 23.10 Release Overview
description: >-
  It's a yearly tradition not to release major updates during the holiday season
  to maintain platform stability, so here we are with the final release of
date: '2023-10-02T12:35:45.000Z'
lastmod: '2023-10-02T12:35:58.000Z'
url: /salesforce-b2c-commerce-cloud-23-10-release-a-comprehensive-overview/
draft: false
heroImage: /media/2023/shopping-carts-on-a-tablet-fa1824b0b9.jpeg
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - release notes
  - sfcc
  - technical
author: Thomas Theunen
---
It's a yearly tradition not to release major updates during the holiday season to maintain platform stability, so here we are with the final release of 2023. This time, we look at the [October 2023 (23.10) release](https://help.salesforce.com/s/articleView?id=sf.rn_b2c_rn_23_10_release.htm&type=5)! Are you interested in last month’s release notes? [Click here](https://www.rhino-inquisitor.com/a-look-at-the-23-9-commerce-cloud-release/)!

## Temporary Baskets

> You can now create temporary baskets for immediate order requests in B2C Commerce. For example, a shopper uses a Buy Now option to purchase an item. The temporary basket, which has a limited lifetime of 15 minutes, is populated with all the data required to ready the basket for checkout without affecting the regular shopper basket. **How**: Use the basket script API to enable temporary baskets. The supported basket functions include pricing, promotions, coupons, inventory, shipping methods, order creation, and reopening an order.

The new feature that allows for multiple baskets is a game-changer. I recall the hassle of having to manipulate transactions frequently to perform real-time calculations without interfering with the current basket, or having to work with custom objects. But now, those days are behind us! Here are the new APIs:

-   [BasketMgr.createTemporaryBasket()](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/upcoming/scriptapi/html/api/class_dw_order_BasketMgr.html#dw_order_BasketMgr_createTemporaryBasket_DetailAnchor)
-   [BasketMgr.deleteTemporaryBasket()](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/upcoming/scriptapi/html/api/class_dw_order_BasketMgr.html#dw_order_BasketMgr_deleteTemporaryBasket_Basket_DetailAnchor)
-   [BasketMgr.getTemporaryBasket()](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/upcoming/scriptapi/html/api/class_dw_order_BasketMgr.html#dw_order_BasketMgr_getTemporaryBasket_String_DetailAnchor)
-   [BasketMgr.getTemporaryBaskets(](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/upcoming/scriptapi/html/api/class_dw_order_BasketMgr.html#dw_order_BasketMgr_getTemporaryBaskets_DetailAnchor)

The SCAPI/OCAPI have not received any updates despite the official documentation still stating the same:

> Each customer can have just one open basket. When a basket is created, it is said to be open. It remains open until either an order is created from it or it is deleted.

But I hope this will be changed with standard APIs in the future, or once we have full access to the custom API option for POST/PUT/..., we can build them ourselves!

## Platform

### Get Einstein Recommendations for Large Product Catalogs

![Einstein is standing in the middle of a warehouse lane, looking at the camera.](/media/2023/einstein-standing-in-a-warehouse-1c76aa5ec5.jpg)

> Commerce Cloud Einstein now generates recommendations for product catalogs that exceed 3 million product SKUs. Einstein Product Recommendations enable you to create and manage recommenders and assign strategies that predict the most relevant products to promote to individual shoppers. **How**: If you have a product catalog that exceeds 3 million product SKUs, Commerce Cloud Einstein compiles a reduced list of 3 million product SKUs by default–no action required. To compile the list, Einstein uses sorting and filtering logic based on pre-defined criteria. Einstein recommendations are generated from this list. If your catalog exceeds 3 million product SKUs, and you want to ensure that products matching specific criteria appear in the reduced product list, contact Commerce Cloud Support.

Having a large catalog and providing the right recommendations can be challenging. This change supports an even larger catalog, making it an excellent improvement.

### Renew eCDN Certificates in Business Manager

[![A screenshot of the new eCDN screen in the 23.10 release of Salesforce B2C Commerce Cloud](/media/2023/ecdn-renewable-certificates-ae09665c51.png)](/media/2023/ecdn-renewable-certificates-ae09665c51.png)

> You can now use Business Manager to auto-renew up to five proxy zone eCDN certificates per realm. The new feature simplifies the annual renewal for eCDN certificates. If you use custom certificates, you can easily switch to auto-renewing certificates in the Business Manager UI. When you create a CDN zone, you can select to use eCDN Managed certificates.

Is that [Let's Encrypt](https://letsencrypt.org/) in the screenshot? This new feature will make life a lot easier! Forgetting to upload a certificate can have serious repercussions - so having this automated (for supported services) is a welcome change!

## OCAPI & SCAPI

### Updated infrastructure layers and routing

> Updated infrastructure layers and routing rules for SCAPI requests to use fewer hops in the network.

Recently, there has been some "architectural refactoring" which involved removing and changing some components. Unfortunately, there isn't much information available about this. However, this is happening on the v1 of the APIS and it doesn't require any action from the customers' end. But if you notice any new bugs or peculiarities - report them!

### Custom Query Parameters in SCAPI

> Introduction of new custom query parameters: `c_[yourparameter]` can now be defined on SCAPI requests and is routed end to end. Parameters are available in hooks for custom control logic.

A highly requested feature to expand the possibilities of custom hooks has been added, providing greater flexibility and supporting more use cases in headless.

### Update Main Product Variants for a Bundled Line Item

> You can now update a main product variant in a bundled line item. This change allows shoppers to select a main product variant when adding a bundled line item to a cart. For example, a product bundle contains a belt and a T-shirt. The T-shirt is a main product with red, blue, and green variations. When the shopper adds the product bundle to a basket, the belt and T-shirt are added as bundled items, and the shopper can select a T-shirt color, one of the T-shirt variants. Previously, the API didn’t support selecting a main product variant when a main product was included in a line item bundle. You can update these properties using (PATCH /baskets/\[basketId\]/items/\[itemId\]) .
>
> -   productId
> -   isGift
> -   giftMessage
> -   Custom properties

The support for headless scenarios is essential as the Composable Storefront gains more prominence in customer projects. Therefore, it is a great addition. However, it is unclear whether this support is for the OCAPI, the SCAPI, or both. Since the SCAPI has a different release log, it is suspected that the support is for the OCAPI, which flows through to the SCAPI as it is a layer on top of the OCAPI. Does someone care to experiment and let me know?

## Account Manager

### Email Notification of Changes to Inactive User Settings

> As part of the Auto Disable Inactive Users feature, an email notification is sent to users when the Inactive User settings are activated or deactivated. An email is also sent when the Days Before Deletion settings are changed on the organization detail page. The email is sent to the email address entered in the Contact Users field on the organization detail page.

There isn't much to say about this feature, but it's important for users to be aware of its automatic nature.

### Enable Read Only Account Manager Access

> The Read Only Account Administrator role is now available in Account Manager. The role provides users read-only access to view details about their organization, API clients, and users. The role doesn’t include permissions to make updates. The new role is useful for auditors who want to confirm compliance with their company policies. High-privilege roles such as Account Administrator or API Administrator override the new role.

A new feature in the Account Manager allows viewing of critical configuration without editing access. A great new addition to the roles in my opinion!

## PWA Kit v3.1.1

-   [GitHub](https://github.com/SalesforceCommerceCloud/pwa-kit/releases/tag/v3.1.1)

This minor release is packed with enhancements and bug fixes to help you build better commerce experiences. **@salesforce/commerce-sdk-react@1.0.2**

-   Updated commerce-sdk-isomorphic to v1.10.4 for improved performance and stability.
-   Streamlined the development process by moving typedoc-related dependencies to dev dependencies (Issue #1425).

**@salesforce/retail-react-app@2.0.0**

-   Fixed a critical issue with the Checkout Card Number in V3 (Issue #1424).
-   Cleaned up incorrect import paths for the page-designer component (Issue #1441).
-   Modularized the country code source for targeting via extensibility (Issue #1445).
-   Exported an icon helper function for targeting via overrides (Issue #1420).
-   Migrated Page Designer core types to commerce-sdk-react (Issue #1441).

**@salesforce/pwa-kit-dev@3.1.1**

-   Resolved a performance issue caused by webpack stats in V3 (Issue #1391).
