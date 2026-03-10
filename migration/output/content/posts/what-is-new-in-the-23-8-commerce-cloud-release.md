---
title: What is new in the 23.8 Commerce Cloud release?
description: >-
  Everyone knows that getting ready for the holiday season starts in the summer
  in the Commerce Cloud world! And looking at the $1 this is apparent. Are y...
date: '2023-07-27T13:28:13.000Z'
lastmod: '2023-07-29T20:05:35.000Z'
url: /what-is-new-in-the-23-8-commerce-cloud-release/
draft: false
heroImage: /media/2023/christmas-at-the-beach-scaled-75bd57b575.jpg
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - scapi
  - sfcc
  - technical
author: Thomas Theunen
---
Everyone knows that getting ready for the holiday season starts in the summer in the Commerce Cloud world! And looking at the [23.8 release notes,](https://help.salesforce.com/s/articleView?id=sf.rn_b2c_rn_23_8_release.htm&type=5) this is apparent.

Are you interested in last month’s release notes? [Click here](/salesforce-b2c-commerce-the-22-6-release/)!

## Infrastructure and Scaling

Those who have reviewed the release notes may not notice many new additions to explore in the 23.8 release. However, upon closer inspection, it becomes apparent that the emphasis has been placed on improving infrastructure and scalability, which could account for the absence of fresh features.

Let's take a look!

## PWA Kit (3.1.0)

> The latest release of the PWA Kit now allows for the conditional enabling of cookies within Managed Runtime. Previously, cookies were not allowed on SSR requests, optimising performance but limited use cases where cookie data was required.
>
> With this new functionality, you can enable cookies per environment and modify their application logic and response via ssr.js. This means that after a customer logs in, the experience can be altered by setting the cache control header to private and leveraging the cookie on the response.
>
> To enable cookies, set the allow\_cookies attribute on an environment with the projects\_target\_partial\_update endpoint and use PWA Kit version 3.1.0 or greater.

With this new update, we get more flexibility to support use cases! It is crucial, however, to think about performance, as this can potentially **lower your cache-hit ratio**!

https://www.rhino-inquisitor.com/wp-content/uploads/2023/07/Cookie-Support-Demo.mp4

## OCAPI & SCAPI

### Get Accurate Allocation Amounts with a Null Allocation Payload

> PATCH and PUT /product\_inventory\_records/{product\_id} now supports a null allocation payload while keeping accurate account of product allocation amounts and allocation reset date. Previously, sending a Patch or Put call to set a custom inventory record attribute using a null allocation payload resulted in an invalid reset date.

Salesforce has implemented a bugfix in the [Inventory API](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-data-api?meta=Update%2BProduct%2BInventory%2BRecord) to ensure that the allocation reset date remains in a valid state and does not become invalid. There is not much else to report about this update.

### SCAPI

> -   Optional query parameter locale, is now supported for mergeBasket, transferBasket and all delete endpoints in Shopper Orders and Shopper Baskets, with the exception of deleteBasket.
> -   PaymentCardSpec includes a new field securityCodeLength. This is available in the response for Shopper baskets - getPaymentMethodsForBasket and Shopper Orders- getPaymentMethodsForOrder endpoints.
> -   Coming soon: mergeBasket and transferBasket response will no longer include the property notes. Previously, this property was sent with an empty value in the response.
> -   Fix coming soon: mergeBasket will return an HTTP 409 error response no-source-basket-exception if the guest's basket has already been ordered. Previously, the ordered guest basket was merged with the new basket.
> -   Shopper Search productSearch now correctly handles storefront search queries with the & character and considers all terms before and after the &. Previously, the search query was incorrectly truncated before the & character and subsequent terms were missing in the query.

More support for the "locale" parameter should make many people happy!

Nothing else to report except future bugfix statements and actual bug fixes. And, of course: **scalability and infrastructure improvements**.

### SLAS

> -   SLAS Infrastructure and scale improvements.
> -   SLAS Admin UI improvements related to user search and get user statistics.
> -   Fixed logout implementation. SLAS to OCAPI calls no longer fail throwing (ClientAccessForbiddenException)
> -   As part of our efforts to scale the SLAS service for the upcoming holiday volume, temporarily, starting the week of August 7th, registered shopper sessions are valid for only 45 days. This applies to shopping apps integrated with SLAS, and to shoppers who have not returned to the shopping app at least once in the last 45 days need to relogin. This temporary state will conclude until September 15. After September 15, registered shopper login sessions will resume their full 90 day, standard duration. Shopper Guest sessions and B2C Commerce basket retention is not affected in any way.

As I previously stated, the emphasis is on enhancing infrastructure and expanding scalability. However, it is essential to note that **SLAS will now only maintain active sessions for 45 days instead of the previous 90 days** until September 15th. If you are using SLAS in your projects, please keep in mind this temporary change.

## Account Manager

> -   Security Fixes
> -   Bug Fixes
> -   Infrastructure Updates

A bit of familiar maintenance has happened on the Account Manager. But not to worry: there is more!

### UUID API Access Tokens Deprecated

I have written [extensively on this topic](/the-deprecation-of-the-uuid-token-for-api-clients/) before, so it's not something new. The due date has already passed and your only recourse now is to use JWT.

### Specify Enhanced Domain Names In Account Manager

![A screenshot showing how Salesforce Identity allows you to log in with other services, which is part of the updates in 23.8](/media/2023/salesforce-identity-b628afdc63.jpeg)

> You can now configure Identity Federation with Salesforce Identity in Account Manager using supported enhanced domain names. You can specify the organization MyDomain subdomain name in Salesforce Core. The default domain suffix is my.salesforce.com. If the identity federation is allowed or enforced, you can change the value. For example, if you use a Salesforce Core sandbox, you can use sandbox.my.salesforce.com as the domain suffix.

This is a great new feature if you're using or planning to use Salesforce Identity.

If you are unfamiliar with it, you can have a single login for multiple Salesforce products. So depending on your situation, this [is one to look into!](https://www.salesforce.com/products/platform/products/identity/)

### Stricter rules for API Client Passwords

Only new passwords These new requirements will only be enforced when a password is changed and won't affect existing passwords.

> For stronger passwords and better security, new password requirements are now enforced for Account Manager API Clients.

To ensure better security, there are new password requirements in place. Passwords must be **at least 12 characters long** and have a minimum complexity that includes **three out of four - numbers, symbols, lower case, and upper case**.

Passwords **cannot include any part of your name, username, or UUID**.

### Auto Disable Inactive Users

> Compliance with PCI DSS 8.1.4 requires that Account Manager user accounts are disabled when their accounts are inactive for 90 days. To support compliance with PCI DSS 8.1.4, Account Manager administrators can now set the number of inactive days before an account is disabled. When the setting is enabled, users with inactive accounts receive an email notification 10 days and 1 day before their account is deactivated. To keep an account active, users can log in to any Commerce Cloud application. To enable the setting, in Account Manager > Organization details, activate or deactivate the setting. The setting is disabled by default.

One of the benefits of using Salesforce Commerce Cloud is that users don't have to concern themselves with infrastructure or compliance with various regulations, in this case: [PCI DSS 8.1.4](https://listings.pcisecuritystandards.org/documents/PCIDSS_QRGv3_1.pdf).

Remember that with this change, inactive accounts will be automatically disabled after 90 days of inactivity, **but not deleted**!

## Updated Cartridges & Tools

### resource manager (v2.0.1)

-   [https://github.com/SalesforceCommerceCloud/resource-manager](https://github.com/SalesforceCommerceCloud/resource-manager)

> This cartridge contains a Business Manager module that allows editing, translating and publishing of resource bundles.

-   Version 2.0.1 is here! This version contains a slew of updates and improvements.
-   Added **OpenAI translation support** - you can now translate your keys and bundles using ChatGPT
-   Updated Webpack and added development config
-   Added 'address' sample bundle from SFRA
-   Refactoring of client-side code
-   Various UI improvements
-   Upgrade to the latest compatibility mode (22.7) to support template literals
-   Update README.md with the latest changes, recent screenshots and OpenAI setup instructions
-   Feature/translation support by [@sfelius](https://github.com/sfelius) in [#17](https://github.com/SalesforceCommerceCloud/resource-manager/pull/17)
