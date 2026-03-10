---
title: Slicing versus Variation Groups in Commerce Cloud
description: >-
  Clarity and efficiency are key in the strategic display and management of
  products in your online store. In an age where various product options and
  var...
lastmod: '2023-11-20T11:59:10.000Z'
url: /slicing-versus-variation-groups-in-sfcc/
draft: false
heroImage: /media/2023/a-tshirt-sliced-into-multiple-colors-scaled-4ed0b9ab1a.jpg
date: '2023-11-20T11:08:09.000Z'
categories:
  - Documentation
  - Salesforce Commerce Cloud
tags:
  - sfcc
author: Thomas Theunen
---
Clarity and efficiency are key in the strategic display and management of products in your online store. In an age where various product options and variations dominate e-commerce, [we must grasp the organisational tools at our disposal](https://www.rhino-inquisitor.com/getting-to-know-sfra-as-a-developer/).

Today, we're thoroughly examining two tools provided by Salesforce B2C Commerce Cloud: 'Slicing' and 'Variation Groups'. Both are an option in product management, but which is your best bet?

In this article (and I am giving away already which option blows the other out of the window), I hope to help you prepare to understand these concepts in depth and learn why, more often than not, Variation Groups may be your best bet for an exceptional online catalog management system.

## What is slicing?

![A robot slicing a cake shaped like a t-shirt](/media/2023/a-robot-slicing-a-tshirt-27ef2248fc.jpg)

Slicing is a method of catalog management that hinges on separating product variants according to one attribute. It simplifies the distinct appearance of products by isolating them based on a characteristic like colour or size. For a while, this approach was quite popular as it provided a clear-cut way to handle product variations, particularly in systems with large counts of SKUs. The idea was that each variant stands alone, making it easy to list and manage inventory.

But simplicity comes at a price. When a variant sells out, it vanishes from the storefront, leaving a gap in your catalog and potentially disrupting the customer's shopping experience. What's more, this can be detrimental to your site's search engine ranking as each variant has its URL that might get indexed, and having this URL disappear can undo SEO optimisations.

From an operational standpoint, slicing demands that you replicate this process for each category your product fits into, escalating manual work and the likelihood of human error in maintaining a cohesive store experience.

## What are variation groups?

[![A representation of the base product, variation group and variant system. A base product, with variation groups as colour and variants that represent the size.](/media/2023/base-variation-group-variant-explained-ed19da17b7.png)](/media/2023/base-variation-group-variant-explained-ed19da17b7.png)

The "Master Product" has been renamed to "Base Product" to be more inclusive.

[Variation Groups](https://help.salesforce.com/s/articleView?id=cc.b2c_managing_variation_groups.htm&type=5) present a more refined and flexible approach to managing product variants. Think of a digital catalog where products are not sorted based on one characteristic, but rather, traits can mix and match across different features. This allows you to easily find a specific combination of products, like "all blue items in any size" or "small size in any colour." Variation Groups are what make this possible. These are groups of different versions of a product, all based on a central Variation Base, that are arranged in logical combinations that shoppers often look for.

Variation Groups are really useful because they help to show a product line in a complete way. They take information about the inventory from a group of SKUs, which makes it easier to keep track of the amount of each product you have and to show the products consistently. With Variation Groups, you can also choose specific products based on certain attributes like color and size, and place them in your store in a way that makes sense.

Variation Groups also make it possible to tag products to promotions, which gives you more control over sales. This is something that is difficult to do with traditional product organization methods. Variation Groups are really helpful in situations where you have lots of products that need to be managed carefully, and where you need to make sure that everything looks and works well together.

## Why use Variation Groups over Slicing

[The leap from slicing to Variation Groups](https://www.rhino-inquisitor.com/wp-content/uploads/2023/11/B2C-Commerce-Variation-Group-Guide.pdf) feels natural when considering the modern expectations of both merchants and customers online:

-   **Enhanced Control Over Display**: Variation Groups give you exacting authority over how products are presented in the store. Attributes maintained at the Group level contribute to a refined attribute value fallback system for variants, ensuring that variations adhere to predefined display rules without constant manual adjustments.
-   **Merchandising with Precision**: By assigning specific colours or sizes to content slots on grid or landing pages or curating sets by attributes within Variation Groups, you can create an aesthetically pleasing and user-friendly browsing experience.
-   **SEO and Inventory Consistency**: Since Variation Groups are indexed as a single entity, they avoid the SEO pitfalls of slicing, where individual out-of-stock variants negatively impact search visibility. Variation Groups stand sturdily in search engine results, maintaining a stable presence.
-   **Promotional Dexterity**: Variation Groups offer nuanced promotional capabilities, syncing effectively with seasonal or flash sales without needing individual product-level discounts, streamlining the promotional mechanics and adding value to the customer journey.
-   **Simple Category Management**: Variation Groups allow for reordering product displays in the view, which is invaluable for visual merchandising and alleviating the daily grind of category management. Conversely, slicing necessitates individual attention for [each product within categories](https://help.salesforce.com/s/articleView?id=cc.b2c_variation_slicing_by_category.htm&type=5).
-   **Composable Storefront**: Although SFRA and SiteGenesis supported slicing, the PWA Kit has never been tested with slicing and solely supports Variation Groups out of the box.
-   **Slicing is kind of deprecated**: Although the [Trailhead Module](https://trailhead.salesforce.com/content/learn/modules/b2c-catalog-category-product/b2c-configure-variation-groups-slicing) and documentation no longer show a deprecation message (I somehow remember it visible in more places), it is a deprecated feature (proved by the previous point).

![A screenshot of the ProductSearchHit script documentation with the following message below slicing: "Deprecated: Please use HIT_TYPE_VARIATION_GROUP instead."](/media/2023/sfcc-slicing-deprecated-42f8438771.png)

One location still has the deprecation message.

## Quota Limits

[![A screenshot of the quota limit for variations in SFCC: The Variations per Base Product object relation quota consists of: Log file ID: object.ProductPO.relation.variationProductAssignmentPOs Description: The maximum number of variations for a base product. Limit: 1,000 (warning at 600)](/media/2023/variations-quota-limit-sfcc-00862ef947.png)](/media/2023/variations-quota-limit-sfcc-00862ef947.png)

When dealing with variations, it is crucial to be mindful of a single quota limit - the maximum number of variations per base product, similar to slicing.

However, this limit is generally more lenient than other platforms, like [Shopify](https://help.shopify.com/en/manual/products/variants/add-variants) and [Commercetools](https://docs.commercetools.com/learning-composable-commerce-administrator/product-modeling/products#:~:text=A%20Product%20can%20only%20have%20100%20Product%20Variants.), which restrict the number of variations to only 100.

## Conclusion

While slicing provided a rudimentary structural approach to product management, Variation Groups currently embody the sophistication required in the fast-paced, multifaceted world of e-commerce. They offer fluid merchandising, robust category management, and a cohesive approach to inventory and promotion strategies, aligning with the needs and behaviours of online shoppers.

By leveraging Variation Groups within Salesforce B2C Commerce Cloud, merchants gain a competitive edge, ensuring their storefronts are adaptable, customer-centric, and optimised for operational excellence.

As your digital storefront evolves, remember that Variation Groups are more than just a feature; they are a strategic stepping stone towards a more elegant, intuitive, and successful online retail presence.
