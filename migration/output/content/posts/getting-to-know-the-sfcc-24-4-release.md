---
title: Getting to know the SFCC 24.4 Release
description: >-
  It's that time of the year again! The $1 release of Salesforce B2C Commerce
  Cloud is finally here, just in time for the spring season. Let's take a
  clos...
date: '2024-04-01T08:03:24.000Z'
lastmod: '2024-04-02T07:39:31.000Z'
url: /getting-to-know-the-sfcc-24-4-release/
draft: false
heroImage: /media/2024/a-group-of-paintings-walking-on-a-road-d1415ca232.jpg
categories:
  - Release Notes
  - Salesforce Commerce Cloud
tags:
  - release notes
  - sfcc
author: Thomas Theunen
---
It's that time of the year again! The [April 2024 (24.4)](https://help.salesforce.com/s/articleView?id=sf.rn_b2c_rn_24_4_release.htm&type=5) release of Salesforce B2C Commerce Cloud is finally here, just in time for the spring season. Let's take a closer look at all the exciting new features and improvements this release offers.

Are you interested in last month’s release notes? [Click here](/digging-into-the-b2c-commerce-cloud-24-3-release/)!

## Added support for additional HTTP methods for Custom APIs

The newly enabled methods in 22.4 now allow us to create custom endpoints for any use-case (theoretically):

-   POST
-   PUT
-   PATCH
-   DELETE
-   HEAD
-   OPTIONS

This update is highly anticipated by Headless projects, as it offers greater flexibility in the Composable Storefront than ever before!

Read all about it [here](https://developer.salesforce.com/docs/commerce/commerce-api/guide/custom-apis.html).

## Rogue Query Timeouts in B2C Commerce

> To protect customer instances and associated services from outages, B2C Commerce restricts rogue queries that produce 200 thousand results or more. To better protect Salesforce B2C Commerce, Salesforce plans to limit the allowed offset value from 200 thousand to 10 thousand..

Salesforce's Commerce Cloud B2C platform has restricted rogue queries producing 200,000 or more results to protect customer instances from outages.

In the 24.6 Release in June 2024, the allowed offset value will be limited to 10,000. If a rogue query is generated, an error message will notify API users that the offset value needs to be set to under 200,000, while Business Manager calls will fail without the message.

To reduce the risk of generating large queries, users are advised to make their queries more targeted via filters and offset values.

**What batch APIs can be used to still retrieve large datasets?**

-   For orders
    -   **[processOrders](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_order_OrderMgr.html#dw_order_OrderMgr_processOrders_Function_String_Object_DetailAnchor)**
    -   **[Class OrderMgr](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_order_OrderMgr.html)**
-   For customers
    -   **[processProfiles](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_customer_CustomerMgr.html#dw_customer_CustomerMgr_processProfiles_Function_String_Object_DetailAnchor)**
    -   **[Class CustomerMgr](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_customer_CustomerMgr.html)**

```

					application failed to invoke [search_protocol.search()] on server, responding with
            fault. exception was [com.demandware.core.rpc.server.InvocationException: exception
            while invoking operation], cause [org.elasticsearch.ElasticsearchIllegalArgumentException:
            Search request offset  is greater than offset limit 200000 for tenant '_, type 'order']


```

## Manage More Images in Page Designer

![A screenshot of the Image Picker in Page Designer showing 4 images available to select.](/media/2024/images-in-sfcc-page-designer-2ae797ab98.png)

> The Page Designer image and media picker now supports up to 1,000 images per folder. Previously, only 200 images within a folder were accessible in the image picker, even if more existed. The increased image limit improves the user experience for merchandisers and content creators and avoids workarounds, such as creating subfolders for extra images.

Since the introduction of Page Designer, users have been facing a recurring issue of images not being found due to the 200-image limit. This issue has been reported globally on a monthly basis.

The good news is that the limit has been increased to 1000. This should provide some relief to users while setting up their pages. It is still not unlimited, so it is important to manage folders effectively to avoid reaching the 1000 limit in the near future.

## Business Manager​

### Configure eCDN for Staging in Business Manager

![A screenshot of the Staging Business Manager showing the link "Embedded CDN Settings" highlighted.](/media/2024/ecdn-config-in-business-manager-staging-a7d7b2d965.png)

> Business Manager now supports configuring eCDN for staging environments. eCDN settings are specific to each instance (development, staging, and production), and you manage them individually. When you create a proxy zone in production, the zone doesn’t replicate a corresponding proxy zone in your development or staging instance. The new eCDN configuration feature simplifies onboarding new sites for staging instances, making it easier to mimic your production instance. Because the configuration uses the existing CDN-API, you can use either Business Manager or the API to manage your eCDN configurations.

It feels like only yesterday that I [published my blog post](/how-to-set-up-the-ecdn-in-sfcc-staging/) on how to upload certificates to the staging environment. With this latest release, we can now use the same user interface that we use in production and development. This is a great update that should simplify our lives, especially considering that in the past, we had to rely on support to get this done.

### Auto-Correction is Disabled by Default

![A screenshot of the Searchable Attributes in the Business Manager showing the new default setting for Autocorrection to be "No".](/media/2024/searchable-attributes-in-commerce-cloud-db3ab0524f.png)

> The default setting for auto-correction for searchable attributes added after the B2C Commerce 24.4 release is now set to No. This change affects searchable attributes added through the Business Manager UI or via import. Existing configurations aren’t affected. Previously, when you added a searchable attribute, the default setting was Yes, which could cause issues in instances when search functions shouldn’t correct values, such as the product SKU, ID, or ISBN. Additionally, the auto-correction dictionary’s size can incrementally increase over time, leading to search noise.

A small change has been made to remedy some confusion that can occur while configuring attributes. The Autocorrection feature is now a manual action that needs to be taken by the user, instead of being set by the system by default.

This is a nice change that will improve the overall user experience.

## OCAPI & SCAPI

### productSearch gets more data

> With B2C Commerce 24.3, expanded the Shopper Search API productSearch endpoint to include additional parameters: productPromotions, imageGroups, priceRanges, and variants

Hooks have been a go-to patch for information like this for a while now, and being able to replace these customisations with platform-native solutions will help keep our projects maintainable.

_Hook cleanup time!_

### New API: searchCustomerGroup

> Search for customer groups in a given Site Id. The query attribute specifies a complex query that can be used to narrow down the search.

With each new release, a new API seems to appear—[this time](https://developer.salesforce.com/docs/commerce/commerce-api/references/customers?meta=searchCustomerGroup), one for the "management" side of things.

### New API: Shopper Custom Objects API

> Use the Shopper Custom Objects API to retrieve custom object information. You can specify an object type ID as well as a key attribute for the object.

Another use case where the [OCAPI](/in-the-ring-ocapi-versus-scapi/) is no longer required, and we can access Custom Objects in our composable projects more easily.

### Check for Customization with SCAPI

> Two new SCAPI response headers are available to check for custom requests and resulting hook execution errors.

Two new headers have made their way into the SCAPI:

1.  **`sfdc_customization`**–indicates whether customization has been applied during the request execution. Currently, the only possible value for the header is “HOOK”, which indicates that a hook execution was registered.
2.  **`sfdc_customization_error`**–if the value is “1", an error occurred within a hook execution.

This is a great addition that will allow us to get more information on the client side of what is going on and take some of the guesswork out of it.

### OCAPI JWT Response to Updated Passwords Is Changed

> To enhance security and align with the SLAS JWT session handling, we updated how the OCAPI JWT handles password changes. Now, if your customer changes their password, all previously issued active OCAPI JWTs are invalidated. The OCAPI client receives an HTTP 401 response, accompanied by a body message that indicates an invalid access token. Previously, the JWT remained valid until its normal timeout.

```

					“fault”: {
        “arguments”: {
        “accessToken”: “Customer credentials changed after token was issued. Please Login again.”
        },
        “type”: “InvalidAccessTokenException”,
        “message”: “The request is unauthorized, the access token is invalid.”
        }


```

Security is a serious matter, and automatic deactivation of active sessions is a valuable update that can give peace of mind. We can also use the information from the response to inform customers of what is happening.

Unfortunately, the error message does not have a unique identifier, only an "English" message, making translating or creating a key slightly more challenging.

## Updated Cartridges & Tools

### b2c-tools (v0.21.1)

-   [https://github.com/SalesforceCommerceCloud/b2c-tools](https://github.com/SalesforceCommerceCloud/b2c-tools)

> b2c-tools is a CLI tool and library for data migrations, import/export, scripting and other tasks with SFCC B2C instances and administrative APIs (SCAPI, ODS, etc). It is intended to be complimentary to other tools such as sfcc-ci for development and CI/CD scenarios.

-   support parent traversal in page designer library



### plugin\_passwordlesslogin (v1.2.2)

-   [https://github.com/SalesforceCommerceCloud/plugin\_passwordlesslogin](https://github.com/SalesforceCommerceCloud/plugin_passwordlesslogin)

> Passwordless login is a way to verify a user’s identity without using a password. It offers protection against the most prevalent cyberattacks, such as phishing and brute-force password cracking. Passwordless login systems use authentication methods that are more secure than regular passwords, including magic links, one-time codes, registered devices or tokens, and biometrics.

-   exclude scapi calls from onSession logic by [@sandragolden](https://github.com/sandragolden) and [@clavery](https://github.com/clavery) in [#18](https://github.com/SalesforceCommerceCloud/plugin_passwordlesslogin/pull/18)
