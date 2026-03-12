---
title: >-
  How do you fetch data in a different locale from Salesforce B2C Commerce
  Cloud?
description: >-
  In some use cases, you have to fetch data in a different language than the
  locale you are currently in. But how do you do that?
date: '2023-07-31T08:40:09.000Z'
lastmod: '2023-07-31T08:43:08.000Z'
url: /fetching-data-in-a-locale-with-sfcc/
draft: false
heroImage: /media/2023/country-flags-427934b006.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - sfcc
  - technical
author: Thomas Theunen
---
SFCC provides a [built-in system to manage different aspects of the data](/the-salesforce-b2c-commerce-cloud-environment/) in multiple languages. But sometimes, you want to show something in a specific locale outside the current session context. How can this be done?

## tl;dr solution

For those in a hurry:

```js
// Store the current situation to re-set it later
var currentLocale = request.getLocale();
request.setLocale('xx_XX');
/*
 * Do your thing
*/
// Reset the request language to the original
request.setLocale(currentLocale);
```

## How does it work

Ultimately, the solution is quite simple - the Salesforce B2C Commerce Cloud systems take care of the "hard stuff" for us. We have to tell it at the right time in what language we want our object to be returned.

### The request takes point

The system will look at the current request's language preference (or setting) whenever an object is fetched through its appropriate function (and it has localised attributes). The request is always available in every context under the global variable "[request](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_system_Request.html)". It is always there, no matter where you are:

- Storefront request
- Business Manager request
- Job Step
- [OCAPI / SCAPI Hook](/how-to-use-ocapi-scapi-hooks/)

### Changing the language before fetching data

To fetch data in a specific language, we must modify the current request before doing the "get". If we want to fetch an attribute in a specific language, we can do something like this:

```js
var ProductMgr = require('dw/catalog/ProductMgr');
var product = ProductMgr.getProduct('my_sku');
request.setLocale('zh_CN');
var cnName = product.name;
request.setLocale('en_US');
var enName = product.name;
```

No re-fetching of the entire record is required! Always think about performance, and do not needlessly fetch the same object when it is not necessary.

### Restoring the locale if necessary

Remember to restore the original language after the data has been fetched in the alternate language. If this is forgotten, all the data fetched after will be in the incorrect language!

## Use cases

![A map of the world representing all locale in the world.](/media/2023/people-around-the-world-551b94bfa5.png)

Some might ask, why would you need to do such a thing? Well, there are a few reasons which will cause you to resort to fiddling with the request:

- Fetching a content asset in a different language, a language selection popup, for example.
- Generating a single-file feed with multiple languages
- Fetching a translation from a resource bundle in a specific language
- ... and many more

## What about the Composable Storefront

The system of working with locales within the [PWA Kit](/sitegenesis-vs-sfra-vs-pwa/) is entirely different, which should be no surprise as this is a Headless Storefront in React. The composable storefront uses the '[commerce-sdk-isomorphic](https://github.com/SalesforceCommerceCloud/commerce-sdk-isomorphic)' package, which accepts a locale parameter passed on to the endpoint as a URL parameter:

```text
https://{shortCode}.api.commercecloud.salesforce.com/product/shopper-products/v1/organizations/{organizationId}/products/{id}?siteId=SiteGenesis&locale=en-US"
```

This means you can easily fetch something in a specific language by doing a REST API call, with the downside of having the fetch the entire record (unless it supports property selection). You could resort to [custom hooks](/how-to-use-ocapi-scapi-hooks/) or even [a custom endpoint](/creating-custom-ocapi-endpoints/) in certain use cases.
