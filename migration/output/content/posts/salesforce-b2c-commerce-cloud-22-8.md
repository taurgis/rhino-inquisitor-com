---
title: Salesforce B2C Commerce Cloud 22.8
description: >-
  A new month means new candy for us in Salesforce B2C Commerce Cloud. But what
  will we find in that jar this month? Let us find out!
date: '2022-07-25T07:19:45.000Z'
lastmod: '2022-07-25T14:32:45.000Z'
url: /salesforce-b2c-commerce-cloud-22-8/
draft: false
heroImage: /media/2022/85e37556-72f2-49a5-b436-a5616e9776a7-3984eb1bb9.jpeg
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - sfcc
  - technical
author: Thomas Theunen
---
A new month means new candy for us in Salesforce B2C Commerce Cloud. But what will we find in that jar this month? Let us find out!

Are you interested in last month’s release notes? [Read the 22.7 release notes](/salesforce-b2c-commerce-cloud-the-22-7-release/)! Or are you looking for the [official release notes](https://help.salesforce.com/s/articleView?id=sf.rn_b2c_rn_22_8_release.htm&type=5)?

## Language

A few changes are happening in "terms" used in Salesforce B2C Commerce Cloud:

-   **master product/variation** **master:** base product
-   **master catalog/master product catalog:** product catalog
-   **master and child items:** main items and secondary items
-   **master document:** main document



This update is in line with the [inclusive language within the Salesforce ecosystem](https://www.salesforce.com/news/stories/how-were-bringing-inclusive-language-to-our-products/). Expect these changes to take effect in all communication slowly and inside the documentation!

## Platform

### Holiday Readiness Preparations

Summer has just begun, but Salesforce is already underway to ensure all merchant instances can handle the holiday period!

But nothing major in this release, just some database optimizations. [Sign up for this Salesforce webinar series](https://trailhead.salesforce.com/trailblazer-community/feed/0D54S00000IRu3J) to prepare for the holidays!

### New Sandbox clusters

With the steady growth of on-demand sandbox usage, Salesforce will add new clusters to ensure enough resources are available to support it.

This change will affect partner sandboxes as they will be moved to US03. Currently, this is US01.

> The usage of the on-demand sandbox has been steadily growing. To meet the demand and while maintaining the availability and performance of the on-demand sandbox, new ODS clusters have been added to provide more resources overall to all ODS.
>
> A change coming to this community is that the ODS you currently use will be moved to a new and dedicated cluster: US03. Salesforce engineers will make the move itself in batches. No actions are required from you, and your sandboxes should still work as they are after the move. The expected move is in batches and will be done in August on Friday evenings and Saturdays. More details will be posted here in the following days.
>
> All new realms provisioned after this announcement (including realm zyfo and zyft that are being provisioned) will be on the new cluster US03. If your realms fall into this category, please note the following:
>
> -   The documentation and instructions you have received may still have the URLs that contain "us01" (e.g., [https://admin.us01.dx.commercecloud.salesforce.com/](https://admin.us01.dx.commercecloud.salesforce.com)). If that is the case, replace "us01" with "us03" in those URLs
>
>
> -   Please use the API, not the Control Center, to manage your sandbox for the time being as the integration of cluster US03 with Control Center is still in its final test stage
>
>
> -   If any issues create or access your sandbox, [please post in this forum and tag John Zhao directly.](https://partners.salesforce.com/_ui/core/chatter/groups/GroupProfilePage?g=0F93A000000DQ6f&fId=0D54V00006G4PZ2&s1oid=00D300000000iTz&OpenCommentForEdit=1&s1nid=0DB3000000007Uh&emkind=chatterPostNotification&s1uid=0053A00000EITbU&emtm=1658419675624&fromEmail=1&s1ext=0)
>
> John Zhao (21/07/2022)

### New Sandbox maintenance times

Everyone using the On-demand Sandboxes has known that maintenance always happens on a weekday (Thursday mornings for me). This has [annoyed many developers](https://ideas.salesforce.com/s/idea/a0B8W00000GdYE0UAN/b2c-commerce-od-sandboxes-maintenance-window), depending on the time zone.

And for a good reason, it is in the middle of the week and during working hours for many. When you are ready to start your day and work on a ticket or a deadline is breathing in your neck, the last thing you need is your sandbox being unavailable!

Good news: The weekly maintenance is moved to Saturday between 02:00 and 08:00 UTC!

### HTTPClient.send quota limit doubled

![Superhero-style illustration warning that higher HTTPClient limits still require restraint.](/media/2022/great-power-responsibility-844bd031ba.jpg)

Good news, but with a warning, for many developers who have done real-time integrations! The quote limit of external API calls you can do in a single request has doubled, going from 8 to 16.

But with great power comes great responsibility. Even though you can do more API calls now, it is not a good idea to take it to the limit.

As always, when implementing third-party integrations, keep in mind performance. Ask the question: “Does this really have to happen in real-time? Or can I do this async in a job?”

**Any delay the third-party introduces will impact the storefront performance and user experience!**

### Salesforce Payment Information in Customer Import

The customer import ([customer.xsd](https://documentation.b2c.commercecloud.salesforce.com/DOC3/topic/com.demandware.dochelp/DWAPI/xsd/customer.xsd)) has added additional site-specific data about payments.

_**Note:** This information points to where the data is, not the actual data._

```
This element is for use with Salesforce Payments to track references of customer profiles between systems.
```

```
The ID of the payment account used to create the customer payment profile.






The type of the payment account used to create the customer payment profile.






The ID of the customer payment profile in the payment account.
```

### Verify Hostname Ownership

When uploading a custom hostname certificate, you are now required to [verify ownership by adding a TXT record](https://documentation.b2c.commercecloud.salesforce.com/DOC3/topic/com.demandware.dochelp/content/b2c_commerce/topics/admin/b2c_add_a_certificate_to_a_zone.html) in the DNS configuration of that domain.

The value is shown in the Business Manager after uploading the certificate.

## Business Manager

### eCDN Interface Update

[![Updated eCDN interface workflow for creating storefront zones.](/media/2022/ecdn-interface-update-8e83d9ac74.png)](/media/2022/ecdn-interface-update-8e83d9ac74.png)

The workflow for creating zones gets an update:

-   Updated storefront zone creation UX workflow in Business Manager.


-   Zone is created using [SSL for SaaS](https://www.cloudflare.com/ssl-for-saas-providers/) V2 (No [USSL](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/)\*) and configured and activated using CDN-API.


-   No need to refresh the entire page after zone creation.


-   Users can use the "Refresh" and "Verify Configuration" buttons to confirm that the zone has been verified/configured.



This is nothing "too exciting," except if you have to configure about 50 zones. This minor update will speed up the process a lot!

### Quotas: Site Specific

[![Quota settings showing site-specific limit handling.](/media/2022/site-specific-quota-limit-information-c67623c0c3.png)](/media/2022/site-specific-quota-limit-information-c67623c0c3.png)

This improvement is more for the engineering and performance team at Salesforce to make sure POD performance can be ensured.

Rather than having to manage/relax a quota at a "realm" level, quotas can now be addressed at the Site level (when applicable).

### Change History for campaigns & promotions

[![Change History interface for campaigns, promotions, and coupons.](/media/2022/1da84b9d-7a51-4f6f-bcb0-b0217c4e5cb7-bf0735587c.jpeg)](/media/2022/1da84b9d-7a51-4f6f-bcb0-b0217c4e5cb7-bf0735587c.jpeg)

The [Change History](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/change_history/b2c_change_history.html) feature is getting some more options! With this release, you can keep track (if you want to) of all modifications of:

-   Campaigns
-   Promotions
-   Coupons

## OCAPI & SCAPI

### Identify SCAPI requests in hooks

Until now, you had to do a custom header check to differentiate between OCAPI and SCAPI requests.

In this release, you get a new function/attribute on the [Request](https://documentation.b2c.commercecloud.salesforce.com/DOC3/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_system_Request.html) global object that makes life a little bit easier:

[request.isSCAPI()](https://documentation.b2c.commercecloud.salesforce.com/DOC3/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_system_Request.html?resultof=%22%53%63%61%70%69%22%20%22%73%63%61%70%69%22%20%22%72%65%71%75%65%73%74%22%20#dw_system_Request_isSCAPI_DetailAnchor)

> When writing your hook logic, it’s important to keep in mind the context of the API that is calling the hook. Both OCAPI and SCAPI share the same hooks, so it’s possible to write a hook that is used for both. Use request.isSCAPI() to determine SCAPI or OCAPI usage, especially if you’re already using the calculate hook in the context of controllers and use transactions in that hook, as that breaks SCAPI. Direct access to the \_sfdc\_mercury HTTP header is deprecated.

### New SLAS Identity Providers supported

SLAS does not allow you to hook in any external IDP at the moment. You need to ask the SLAS team to add support for these through [a message on the community groups](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas-identity-providers.html).

Newly supported IDPs are:

-   [SAP Gigya](https://www.sap.com/acquired-brands/what-is-gigya.html)
-   [AWS Cognito](https://aws.amazon.com/cognito/)
-   [Apple](https://developer.apple.com/sign-in-with-apple/)
-   [Azure Active Directory](https://azure.microsoft.com/en-us/services/active-directory/)

## PWA Kit v2.1.0

The PWA Kit is under continuous development as some features are still missing and new use-cases are presented to the team every week that might require some changes.

This release can be found in the [PWA Kit v2.1.0 release notes](https://github.com/SalesforceCommerceCloud/pwa-kit/releases/tag/v2.1.0).

### What’s New

-   🔥 Client side hot module replacement.



### Changes

#### pwa-kit-dev

-   Replace `Mobify` references/links with proper PWA Kit values. [#619](https://github.com/SalesforceCommerceCloud/pwa-kit/pull/619)
-   Add support for a custom build directory to `pwa-kit-dev build`. [#628](https://github.com/SalesforceCommerceCloud/pwa-kit/pull/628)
-   Introduce client-side hot module replacement. [#630](https://github.com/SalesforceCommerceCloud/pwa-kit/pull/630)

#### pwa-kit-react-sdk

-   Remove console logs from route component. [#651](https://github.com/SalesforceCommerceCloud/pwa-kit/pull/651)

## Bugfixes

For the 22.8 release, I have not found any newly accepted bug fixes, but that might change a few weeks after this article is released. I found that an issue was fixed in 22.7, which I didn't mention in last month's release note article.

-   [Navigation failing when orders are more than 1000](https://trailblazer.salesforce.com/issues_view?id=a1p4V0000029kTjQAI&title=navigation-failing-when-orders-are-more-than-1000)

## Updated Cartridges & Tools

### sfcc-cartridge-overrides-vscode-extension (v1.0.1)

-   [https://github.com/sfccdevops/sfcc-cartridge-overrides-vscode-extension](https://github.com/sfccdevops/sfcc-cartridge-overrides-vscode-extension)

> VS Code Extension to Display SFCC Cartridge Overrides

Fix issue with Workspace Detection Issues. Tested this solution with a few different workspace setups and it seems to resolve the following issues:

Fixes [#1](https://github.com/sfccdevops/sfcc-cartridge-overrides-vscode-extension/issues/1), [#2](https://github.com/sfccdevops/sfcc-cartridge-overrides-vscode-extension/issues/2) & [#3](https://github.com/sfccdevops/sfcc-cartridge-overrides-vscode-extension/issues/3)

### commerce-sdk-isomorphic (v1.6.0)

-   [https://github.com/SalesforceCommerceCloud/commerce-sdk-isomorphic](https://github.com/SalesforceCommerceCloud/commerce-sdk-isomorphic)

> The Salesforce Commerce SDK Isomorphic allows easy interaction with the Salesforce B2C Commerce platform Shopper APIs through a lightweight SDK that works both on browsers and NodeJS applications.

API Changes

_Shopper Login New Endpoints_

-   `getPasswordResetToken`: Request a reset password token.
-   `resetPassword`: Creates a new password.


Enchancements

More error handling has been added in the SLAS helpers

Bug fixes

SLAS helper `loginRegisteredUserB2C` no longer calls `redirectURI` when running server side

Documentation

`README` updated to explicitly note lack of CORS support for SCAPI

### plugin\_redirect

-   [https://github.com/SalesforceCommerceCloud/plugin\_redirect](https://github.com/SalesforceCommerceCloud/plugin_redirect)

> The Hybrid Storefront plug-in cartridge (name tentative) provides Storefront Reference Architecture (SFRA) and SiteGenesis sites with a mechanism for redirecting pages to PWA Kit as part of a hybrid storefront strategy.

Not so much an update as this cartridge does not have an official release yet, but an important one exists if you want to implement a hybrid deployment using SFRA/SG in combination with the PWA Kit.

### sgmf-scripts (v2.4.2)

-   [https://github.com/SalesforceCommerceCloud/sgmf-scripts](https://github.com/SalesforceCommerceCloud/sgmf-scripts)

> This repository contains a collection of scrips that are useful for creating Storefront Reference Architecture overlay cartridges. All of the scripts are executable through CLI.

Changes

-   Added `--fix` option when linting js and scss files ([#33](https://github.com/SalesforceCommerceCloud/sgmf-scripts/pull/33))
-   Removed unused `webdriverio` ([#60](https://github.com/SalesforceCommerceCloud/sgmf-scripts/pull/60))

### sfra-webpack-builder (v3.3.2)

-   [https://github.com/SalesforceCommerceCloud/sfra-webpack-builder](https://github.com/SalesforceCommerceCloud/sfra-webpack-builder)

> Webpack can be cumbersome to setup, especially in multicartridge projects for SFRA. This plugin let you bundle all your js, scss and jsx files out of the box.

I don't think anything has changed in this release besides updating the package version. But it might be good to put it on the list, so people know this one exists!

### b2c-commerce-toolkit-for-grocery (v1.3.0)

-   [https://github.com/SalesforceCommerceCloud/b2c-commerce-toolkit-for-grocery](https://github.com/SalesforceCommerceCloud/b2c-commerce-toolkit-for-grocery)

> This demo version of a grocery storefront includes store and time slot selection, grocery-specific shopping experiences for all key store pages, and edit order capabilities. A sample grocery data set and a few typical configurations are also included.

Changes

Removed some redundant code which is now part of SFRA

### plugin\_einstein\_api (v0.0.4)

-   [https://github.com/SalesforceCommerceCloud/plugin\_einstein\_api](https://github.com/SalesforceCommerceCloud/plugin_einstein_api)

> This is the repository for the plugin\_einstein\_api plugin. This plugin enhances the app\_storefront\_base cartridge by adding the Einstein API capabilities.
>
> Einstein API is the API-led interface from Salesforce B2C Commerce Einstein, and can be leverage to include Einstein product recommendations in places that are not displayed through a content slot on the storefront, or even outside of the storefront.

What's Changed

Bugfix/cart productlineitems by [@adrien-monte](https://github.com/adrien-monte) in [#8](https://github.com/SalesforceCommerceCloud/plugin_einstein_api/pull/8)

New Contributors

[_@_adrien-monte](https://github.com/adrien-monte) made their first contribution in [#8](https://github.com/SalesforceCommerceCloud/plugin_einstein_api/pull/8)
