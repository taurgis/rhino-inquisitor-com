---
title: 'Variation Groups 101: The attribute fallback system in Commerce Cloud'
description: >-
  One of the features of B2C Commerce Cloud is the ability to create and use $1
  products, which share common attributes but differ in one or more aspects,...
lastmod: '2024-02-12T07:54:18.000Z'
url: /the-attribute-fallback-system-in-sfcc/
draft: false
heroImage: /media/2024/a-pyramid-of-shoes-ecf8500927.jpg
date: '2024-02-12T07:54:09.000Z'
categories:
  - Architecture
  - Salesforce Commerce Cloud
  - Technical
tags:
  - sfcc
  - technical
author: Thomas Theunen
---
One of the features of B2C Commerce Cloud is the ability to create and use [variation](https://www.rhino-inquisitor.com/slicing-versus-variation-groups-in-sfcc/) products, which share common attributes but differ in one or more aspects, such as colour, size, or style. Variation products can help merchants offer more choices to their customers and optimise their inventory management.

Managing variant products can be a challenging task, especially when it comes to defining and displaying the attributes of each variant. To simplify the process for merchants, integrations, and developers, a system has been implemented that prevents duplication of data at different levels (base, variation group, variant). In this article, we will explore this system and its advantages.

## What are variation groups, and how do they differ from slicing?

When it comes to varying on an attribute, there are two options within Salesforce B2C Commerce Cloud. [In a previous article](https://www.rhino-inquisitor.com/slicing-versus-variation-groups-in-sfcc/), this concept has been explained in detail.

## How does the attribute fallback system work for variation products, groups, and base products?

![A visual representation of the Variation Group model by using a t-shirt. There colours of shirts, each with their own set of sizes with one base product at the top.](/media/2024/variation-model-attribute-fallback-af1b94cc0e.jpg)

An attempt at visualising the fallback system.

The attribute fallback system is a mechanism that allows B2C Commerce Cloud to automatically retrieve the attribute values of variation products from other sources, such as variation groups or base products when they are not explicitly defined for the variant. This way, merchants can save time and effort in maintaining the attributes of various products and ensure that the customers see the correct and relevant information on the storefront.

The attribute fallback system works as follows:

-   When a customer views a variation product on the storefront, B2C Commerce Cloud first checks if the attribute value is defined for the variation product itself. For example, if the customer views a red shirt in size L, B2C Commerce Cloud first checks if the variant's name and description are defined.
-   If the attribute value is not defined for the variation product, B2C Commerce Cloud then checks if the attribute value is defined for the variation group to which the variation product belongs. For example, if the red "large" shirt is part of a variation group "red shirt", B2C Commerce Cloud checks if the name and description of the shirt are defined for the variation group.
-   If the attribute value is not defined for any of the variation groups, B2C Commerce Cloud then checks if the attribute value is defined for the base product that the variation product is derived from. For example, if the red large shirt is a variation of a generic "shirt", B2C Commerce Cloud checks if the name and description are defined for the base product.
-   If the attribute value is not defined for the base product, B2C Commerce Cloud returns a default or empty value. For example, if none of the sources define the name of the red large shirt, B2C Commerce Cloud returns null for the variant.

### Price

![A variation group product detail page of a shirt where the variants have different prices, ending up with a "range".](/media/2024/modern-striped-shirt-price-range-f088973939.jpg)

A variation group with different prices for the variants

The attribute fallback system applies to all attributes of variation products except for the price attribute. The price attribute does not have a fallback from variation products to variation groups, as variation groups do not have prices.

Instead, the price of a variation group is calculated as the range of the prices of the variation products within the group.

For example, if a variation group for all red handbags contains three variants with prices of $130, $132, and $135, the price of the variation group is displayed as $130-$135 on the storefront.

## What does it mean for development?

Luckily for the developers this system works seamlessly for developers and fetching attributes will automatically set some processes in the works behind the scenes just as the [locale fallback](https://www.rhino-inquisitor.com/understanding-locale-fallback-in-sfcc/).

-   `dw.catalog.Variant` class has attribute fallback behavior to first obtain attributes from (one or more) assigned variation groups and then from the base product.
-   `dw.catalog.VariationGroup` class has attribute fallback behavior to obtain attributes from the base product, when the attribute isn't specified by the variation group.

[![](/media/2024/variation-model-fallback-in-code-docs-1-ba4d97c55f.jpg)](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/index.html?target=class_dw_catalog_Product.html)

## Advantages for data import

Importing data can be time-consuming and resource-intensive, especially when dealing with large or complex data structures.

The attribute fallback system can reduce the amount of data needed to be imported, as merchants do not have to define the attribute values for every variation product or group.

This way, the merchants can save time and effort in preparing and validating the data and avoid duplicating or conflicting information across different data sources.

### Import Speed

Reducing the amount of data in your XML files can lead to a significant decrease in file size. This, in turn, can result in faster imports and improved performance.

By removing unnecessary duplicate elements, attributes, and content, you can streamline the import XML files, making them easier to process and leaves more room for other processes.

## Many advantages

In conclusion, implementing a fallback system has many advantages, especially when it comes to keeping duplicate values away from your database.

It is possible that the fallback system may have some disadvantages. However, since this system is a part of Salesforce Commerce Cloud's "black box," we can only hope that any potential drawbacks have been addressed behind the scenes, so that we do not need to be concerned about them.
