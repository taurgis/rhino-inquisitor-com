---
title: 'Salesforce B2C Commerce Cloud: The 22.7 Release'
description: >-
  Summer has arrived, and so has the next Salesforce B2C Commerce Cloud release!
  This time we look at the $1! Are you interested in last month’s release n...
lastmod: '2022-07-23T21:59:53.000Z'
url: /salesforce-b2c-commerce-cloud-the-22-7-release/
draft: false
date: '2022-06-13T15:06:49.000Z'
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - sfcc
  - technical
author: Thomas Theunen
---
Summer has arrived, and so has the next Salesforce B2C Commerce Cloud release! This time we look at the [July 2022 (22.7) release](https://help.salesforce.com/s/articleView?id=sf.rn_b2c_rn_22_7_release.htm&type=5)!

Are you interested in last month’s release notes? [Click here](https://www.rhino-inquisitor.com/salesforce-b2c-commerce-the-22-6-release/)!

## Social Commerce

[![](https://www.rhino-inquisitor.com/wp-content/uploads/2022/06/social-commerce-salesforce-1024x768.jpg)](https://www.rhino-inquisitor.com/wp-content/uploads/2022/06/social-commerce-salesforce-scaled.jpg)

Forward-looking statements apply!

During the [Connections '22](https://www.rhino-inquisitor.com/get-connected-at-salesforce-connections-2022/) event, it became apparent a more significant focus has been put on Social Commerce!

I already mentioned this in the [22.5 release](https://www.rhino-inquisitor.com/salesforce-b2c-commerce-the-22-5-release/), but a Tiktok and [Snapchat](https://forbusiness.snapchat.com/) integration is happening now.

To access these BETA features, contact your CSM (Customer Success Manager)!

## Development

### Rhino Engine

Whenever an update happens to the Rhino Engine, many developers (including me) have a smirk. It means we get to use more modern JavaScript in the back-end!

Some of the highlights:

-   [Shorthand property names](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer)
-   New JavaScript primitive type [`bigint`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt), replaces `dw.util.BigInterger`
-   [Template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals?retiredLocale=nl) support
-   `[Ojbect.values](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values)` / [`Object.entries`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries) / ...


For a complete list, you can have a look at [the documentation](https://documentation.b2c.commercecloud.salesforce.com/DOC3/index.jsp?topic=%2Fcom.demandware.dochelp%2Fcontent%2Fb2c_commerce%2Ftopics%2Fsite_development%2Fb2c_compatibility_mode_considerations.html).

If we look at this list, it is also clear this is an update to the 1.7.14 version of the engine. To get a complete list of what is possible, you can look at the [support list on the official website](https://mozilla.github.io/rhino/compat/engines.html).

### API Encryption Parameter Has Been Changed

Some significant encryption changes have been made to the [Order.getOrderExportXML](https://documentation.b2c.commercecloud.salesforce.com/DOC3/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_order_Order.html#dw_order_Order_getOrderExportXML_DetailAnchor) API, mainly around the encryption of payment instrument data.

A complete list of changes is available [here](https://help.salesforce.com/s/articleView?id=sf.rn_b2c_OCAPI_order_export_mc.htm&type=5).

## PWA Kit v2.0.0

A big release a lot of people have been waiting for. Focussing mainly on developer experience, this is an important release to set a solid base to support development for the future to come.

-   🥳 TypeScript support. The build tools now support TypeScript by default—without having to update the configuration files for Babel or Webpack.


-   🧰 An updated development server that supports hot reloading on the server-side and makes it possible to support hot reloading on the client-side in a future release.


-   🤓 An all-new command-line tool called pwa-kit-dev that bundles our recommended development tools like Webpack, Babel, and Jest to support zero-config project templates.


-   🖌️ Experimental support for non-React apps for those users interested in using Managed Runtime to host other Express-based apps (not just the Retail React App).



For a full changelog, have a look at the [GitHub Repository](https://github.com/SalesforceCommerceCloud/pwa-kit/releases/tag/v2.0.0).

## Bugfixes

I had a look at the "[Known Issues](https://trailblazer.salesforce.com/issues_index?page=2&tag=Commerce+Cloud+Platform)," but I could not find any new "resolved" items for this 22.7 release.

## Updated Cartridges & Tools

A new section to this monthly blogpost that I found could be handy for some people. The cartridges that have received updates in the past 30 days!

Not all of them will be listed here, and I will mainly focus on [Salesforce and Community cartridges](https://www.rhino-inquisitor.com/community-repositories/).

### [b2c-tools (v0.7.1)](https://github.com/SalesforceCommerceCloud/b2c-tools/releases/tag/v0.7.1)

> b2c-tools is a CLI tool and library for data migrations, import/export, scripting and other tasks with SFCC B2C instances. It is intended to be complimentary to other tools such as sfcc-ci for development and CI/CD scenarios.

What's new:

-   temporary workaround for origin shielding on development (use `--hack-origin-shielding-workaround` hidden option). A cleaner solution to come later
-   typo "no serve or clientID found" by [@jlbruno](https://github.com/jlbruno) in [#42](https://github.com/SalesforceCommerceCloud/b2c-tools/pull/42)




### [plugin\_einstein\_api (v0.0.4)](https://github.com/SalesforceCommerceCloud/plugin_einstein_api/releases/tag/0.0.4)

> Einstein API is the API-led interface from Salesforce B2C Commerce Einstein, and can be leverage to include Einstein product recommendations in places that are not displayed through a content slot on the storefront, or even outside of the storefront.

What's new:

-   Bugfix/cart productlineitems by [@adrien-monte](https://github.com/adrien-monte) in [#8](https://github.com/SalesforceCommerceCloud/plugin_einstein_api/pull/8)




### [social\_channel\_integrations (**New**)](https://github.com/SalesforceCommerceCloud/social_channel_integrations)

> This repository contains Social Channel integrations with B2C Commerce. (Cartridge for Tiktok)

An interesting new cartridge which you can track to see how Social selling will be implemented on Salesforce B2C Commerce Cloud.

### [plugin\_commercepayments (v4.2.0)](https://github.com/SalesforceCommerceCloud/plugin_commercepayments/releases/tag/v4.2.0)

> This is the repository for the plugin\_commercepayments plugin. This plugin enhances the app\_storefront\_base cartridge by providing payment functionality via Stripe.

What's new:

-   Add missing key and value, reorder entries
-   Bug: Fix not to show tax in order total summary on checkout and cart pages.
-   Bug: Fix email confirmation not translated for order placed with PM involving redirect
-   Change to use new saved payment
-   Add EPS payment method
-   Add keys for eps and ideal banks and update logic to use keys




### [resource-manager (v1.1.0)](https://github.com/SalesforceCommerceCloud/resource-manager/releases/tag/v.1.1.0)

> This cartridge contains a Business Manager module that allows editing and publishing of resource bundles.

What's new:

-   This release introduces some new ES6 language elements and requires Compatibility Mode 21.1 or higher
-   New 'global search' feature allows searching for keys across bundles.
-   UI updates and fixes for the new Lightning Business Manager layout.
-   Bundle last updated date now shown correctly.
-   Bundle JSON keys get sorted alphabetically on save.
