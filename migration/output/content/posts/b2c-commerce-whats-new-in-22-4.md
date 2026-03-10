---
title: 'B2C Commerce: What''s New In 22.4'
description: >-
  In this post, we will be looking at the release notes of Salesforce B2C
  Commerce Cloud for April 2022. Since the release cycles for B2C Commerce are
  $1,...
lastmod: '2022-07-23T21:46:22.000Z'
url: /b2c-commerce-whats-new-in-22-4/
draft: false
date: '2022-03-21T19:57:05.000Z'
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - Business Manager
  - ocapi
  - sfcc
  - technical
author: Thomas Theunen
---
In this post, we will be looking at the release notes of Salesforce B2C Commerce Cloud for April 2022. Since the release cycles for B2C Commerce are [a lot quicker than the other Salesforce platforms](https://medium.com/inside-the-salesforce-ecosystem/a-partners-guide-to-navigating-the-salesforce-release-cycle-efa36ed3c64), not every month will be as extensive a list as the other.

Check out the original release notes [here](https://help.salesforce.com/s/articleView?id=rn_b2c_rn_22_4_release.htm&type=5&language=en_US).

## PWA Kit

### Managed Runtime logs

To access the logs of the Managed Runtime, you had to request access to the AWS logging for everyone separately.

It will now be possible to tail or download the logs via the Runtime Admin UI! This update will make it easier for developers to debug, analyze, and address issues on a deployed version of their PWA Kit!

_**Note:** Keep in mind that the Managed Runtime is on a different release cycle, so it will probably not match the "B2C core" release dates._

### v2.0 Developer Preview

A new major release of PWA Kit is on the horizon! This release has a few new toys:

-   First steps towards Typescript support
-   The development server is updated to support hot-reloading of the server-side
-   An all-new CLI tool called "mrt" that combines Webpack, Jest, and Babel to support zero-config projects
-   Experimental support for non-React projects is added

You can find more information about this release on [GitHub](https://github.com/SalesforceCommerceCloud/pwa-kit/discussions/395).

## SCAPI

### Deprecation of /login

When using the login endpoint, if an outage happens in the Account Manager, customers will be unable to log in to the storefront. It goes without saying that this is a very strange "dependency" for storefront customers.

To mitigate this dependency, the/login endpoint is deprecated and replaced by [SLAS](https://developer.commercecloud.com/s/api-details/a003k00000VWfNDAA1/commerce-cloud-developer-centershopperloginandapiaccessservice) (Shopper Login and API Access Service).

**Benefits of this change:**

-   Account Manager outages will no longer impact the ability to log in or checkout in the storefront applications
-   SLAS is more secure
-   SLAS supports more login mechanisms



## OCAPI

### GET Products Caching

With this update, eCDN caching is enabled for the GET Products API! The update will improve the scalability and performance of Salesforce B2C Commerce Cloud.

**But it is not enabled by default!** To take advantage of this update, you need to do the following:

-   Set "cache-control" headers
-   Ensure the client ID is included as a query parameter or in the "x-dw-client-id" and "cache-control" header.
-   Do not include an "Authorization" header with the request. Adding it will disable caching.

If you still have questions about caching in the OCAPI, [you can find more information in the Infocenter](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/usage/Caching.html).

### General Improvements

Over the years, some frustration with developers has been that some fields or functionalities were unavailable within the Open Commerce API.

Salesforce has heard our concerns and has slowly closed these holes over the years. However, there are still some big ones (e.g., Price Books).

**With this update, the following changes have happened:**

-   **Search and sort by creation and last modified date:** Now, more data APIs allow you to utilize the create and last-modified dates.

    This change will make it a lot easier to acquire **delta** information!

    The following [DATA APIs](https://documentation.b2c.commercecloud.salesforce.com/DOC3/topic/com.demandware.dochelp/OCAPI/current/usage/DataAPIResources.html?cp=0_16_4) have been extended:

    -   Order Search
    -   Product Search
    -   Customer Search
    -   Custom Object Search
    -   Catalog Search
-   **[Guest Flag](https://documentation.b2c.commercecloud.salesforce.com/DOC3/index.jsp?topic=%2Fcom.demandware.dochelp%2FOCAPI%2Fcurrent%2Fshop%2FDocuments%2FOrder.html&anchor=id1520261250):** It is now easier to detect an order made by a guest checkout or a registered customer.



## Business Manager

### Product Management

If you use Variation Groups, this feature will make the storefront search a little more flexible. A new [Feature Switch](https://documentation.b2c.commercecloud.salesforce.com/DOC1/index.jsp?topic=%2Fcom.demandware.dochelp%2Fcontent%2Fb2c_commerce%2Ftopics%2Fproducts%2Fb2c_configure_variation_groups_display_mode.html) will enable the option to merge all Variation Groups in the lister pages (category & search).

Once enabled, merchandizers [will see extra options in the business manager](https://documentation.b2c.commercecloud.salesforce.com/DOC1/index.jsp?topic=%2Fcom.demandware.dochelp%2Fcontent%2Fb2c_commerce%2Ftopics%2Fproducts%2Fb2c_configure_variation_groups_display_mode.html).

![A screenshot of the Variation Group mode configuration on a catalog.](https://www.rhino-inquisitor.com/wp-content/uploads/elementor/thumbs/category-option-plzwjt3ux7rivo7o7mgc8xhnroisdxv69lzyysd3pa.png "Category Options – Variation Groups")

Category Attributes on a Catalog

But once you enable this option, how does it translate in the storefront? Let's have a look!

![Image depicting 3 variation groups of pants, being display seperate](https://www.rhino-inquisitor.com/wp-content/uploads/2022/03/variation-groups-before-1024x565.jpg)

Storefront - Before

![](https://www.rhino-inquisitor.com/wp-content/uploads/2022/03/variation-groups-after-1024x539.png)

Storefront - After

![](https://www.rhino-inquisitor.com/wp-content/uploads/2022/03/configuration-variation-groups-1024x352.png)

Configuration of a Category

But why use this option? Could you assign the master product to the category to get the same result?

~~The answer is no. When you assign the master, you include all of your Variation Groups (this shows all the swatches without custom development). With this option enabled, you can control which swatches show by assigning only the applicable Variation Groups.~~

The above is not valid. I got lucky with the products I assigned during my test to match the swatches exactly, and it acts the same as you would assign the master.
Does that mean that there are no differences? Probably not. I feel there will be slight changes in how the [SearchModel](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_catalog_ProductSearchHit.htm) represents products, and a good place to start looking is the "[Represented Products](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_catalog_ProductSearchHit.html#dw_catalog_ProductSearchHit_getRepresentedProducts_DetailAnchor)."

**Have you experimented with this feature already and found differences? Share your findings in the comments!**

Is it necessary for everyone to turn the switch on? No, this depends on your situation and how you want to present your products to the customer.

But this option gives us more flexibility, which is never a bad thing!

_**Note:** If you set the type to "merged" on the top level but "individual" on a sub-category, it will not work. The products do not display correctly anymore._

![A screenshot of a broken product lister page, showing all attributes as "null" instead of product data.](https://www.rhino-inquisitor.com/wp-content/uploads/2022/03/broken-category-1024x323.png)

Broken category page

### Prorated Discounts

From now on, when you configure a "percentage discount promotion" on multiple items, this will be prorated automatically across all eligible items.

Before, you had to select the "Prorate Discount" option on the promotion.

![A screenshot of the prorating option in the business manager.](https://www.rhino-inquisitor.com/wp-content/uploads/2022/03/prorate-discount-1024x186.png)

### Source Code Groups

Not much has changed here. A new limit is imposed on the ID field to 28 ASCII characters.

Before this change, you could enter an ID that was longer, but it would be truncated after saving.

## Bugfixes

Last but not least, we will have a look at if any of the bugs that customers and partners reported have been fixed in this release!

-   [Stored Basket returns already ordered basket](https://trailblazer.salesforce.com/issues_view?id=a1p4V000000pOrSQAU)
-   [Source Code Group export fails due to trailing white space in ID](https://trailblazer.salesforce.com/issues_view?id=a1p4V000001nT8NQAU&title=source-code-group-export-fails-due-to-trailing-white-space-in-id)
