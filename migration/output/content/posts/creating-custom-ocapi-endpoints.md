---
title: Creating custom OCAPI endpoints
description: >-
  Deprecated Since writing this article, Salesforce has provided a new and
  better method for creating custom endpoints. You can find more information
  abou...
lastmod: '2023-09-26T09:54:35.000Z'
url: /creating-custom-ocapi-endpoints/
draft: false
heroImage: /media/2022/ocapi-bb5766fd49.jpg
date: '2022-07-11T17:40:22.000Z'
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - headless
  - ocapi
  - sfcc
  - technical
author: Thomas Theunen
---
Deprecated Since writing this article, Salesforce has provided a new and better method for creating custom endpoints. You can find more information about it at [https://developer.salesforce.com/docs/commerce/commerce-api/guide/custom-apis.html](https://developer.salesforce.com/docs/commerce/commerce-api/guide/custom-apis.html).

The OCAPI ([Open Commerce API](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/usage/OpenCommerceAPI.html?cp=0_16)) has been around for many years, giving the platform a sound basis for "headless" applications to connect to different parts of Salesforce B2C Commerce Cloud.

Although the APIs need to remain close to the standard, some endpoints have been given some freedom to be customized via a system called "[hooks](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/usage/Hooks.html)."

But how about adding completely custom endpoints?

Warning! The example I have used (getCustomer) is an example of something you should not do because of security reasons. It just shows the possibilities, and you should consider performance, security, and common sense when building these endpoints.

## Is there no "official" way?

The OCAPI provides a set of predefined endpoints you can not stray from. There is no out-of-the-box feature that allows you to create your endpoint on top of the existing set of REST APIs.

The only thing you are allowed to do is modify existing endpoints, but not all of them. A list of which customizations you are allowed to do is available on the [Salesforce Commerce Cloud Infocenter](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/usage/Hooks.html).

## TLDR; Just give me the solution

I have created a complete example available on GitHub based on the [sfcc-hooks-collection](https://github.com/SalesforceCommerceCloud/sfcc-hooks-collection/) project provided by [Holger Nestmann](https://github.com/hnestmann).

You can find that repository [here](https://github.com/taurgis/ocapi-custom-endpoints). Inside, you will find an example of a custom "get-customer" API added to the OCAPI**.**

## Limitation of this custom solution

The solution provided in this article will only allow you to create custom GET calls without any transactions.

This is because we will add a hook to the [GET call of Custom Objects](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/shop/Resources/CustomObjects.html#id1419723884__id-587924678) in the Shop API.

And a limitation of a hook added to a GET call is that opening transactions is forbidden (no creates or updates in the database).

> _**Note**: Do not modify a Script API object in an HTTP GET request or a modifyResponse hook, because they are never executed in a transactional context. It can cause an ORMTransactionException and an HTTP 500 fault response._
>
> Infocenter

## Custom Objects

Yes, custom objects! Since we have complete control of the naming and creation of custom objects, it is the perfect candidate. And because it allows us to add a hook to the REST GET call, it provides an ideal opportunity to create custom endpoints in the context of the customer session.

## Step 1: Create the Custom Object Type

So let's get cracking! The first step is to create a new custom object type in the business manager that we can use in the OCAPI.

Go to "_Administration_" > "_Site Development_" > "_Custom Object Types_."

[![](/media/2022/custom-api-custom-object-051e16e59a.png)](/media/2022/custom-api-custom-object-051e16e59a.png)

The Custom Object Definition is quite simple:

-   **ID**: CustomApi
-   **Key Attribute:**  ID of the type _String_
-   **Name:** Custom API (though this doesn't matter)
-   **Description:** Whatever you like ;-)
-   **Data Replication:** Replicable (we don't want to configure this separately per environment)
-   **Storage Scope:** Organization (it doesn't make sense to do this on the Site level)



There is also an [import file available on the GitHub repository](https://github.com/taurgis/ocapi-custom-endpoints/blob/main/metadata/custom-object-types.xml).

## Step 2: Create the Custom Object for your API

Each custom API endpoint needs its unique object of the "CustomApi" type. So in this example, we will make one get customers by their "Customer Number."

To do this go to "_Merchant Tools_" > "_Custom Objects_" > "_Manage Custom Objects_."

[![](/media/2022/manage-get-customer-object-7b88237d34.png)](/media/2022/manage-get-customer-object-7b88237d34.png)

The Custom Object is, again, easy to set up:

-   **ID**: get-customer (this is important as we need this ID to call the service and the script we will put behind it)



There is also an [import file available on the GitHub repository](https://github.com/taurgis/ocapi-custom-endpoints/blob/main/metadata/CustomApi.xml).

## Step 3: Configure OCAPI access

We also need to make sure we can access the GET call for the Custom Objects endpoint. To provide access we go to:

"_Administration_" > "_Site Development_" > "_Open Commerce API Settings._"

Fill in the following value for the type "_Shop_" and context "_Global (Organization-wide)_."

```

					{
	"_v": "22.6",
	"clients": [
		{
			"client_id": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
			"allowed_origins": [],
			"resources": [
				{
					"resource_id": "/custom_objects/*/*",
					"methods": [
						"get"
					],
					"read_attributes": "(**)",
					"write_attributes": "(**)"
				}
			]
		}
	]
}


```

[![](/media/2022/ocapi-settings-46b5f9c8b0.png)](/media/2022/ocapi-settings-46b5f9c8b0.png)

In the example, we make use of "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" ( 30 x a ), which is a Client Id that works on test environments without creating it in the Account Manager.

You can, of course, create your own Client ID, but we will not be covering that process in this article.

## Step 4: Create our custom hook

Time to start coding (finally)! But before we start creating our scripts, we need to tell Salesforce B2C Commerce Cloud that we want to "hook" into an OCAPI endpoint.

For this, we create a [package.json](https://github.com/taurgis/ocapi-custom-endpoints/blob/main/cartridges/plugin_custom_ocapi_endpoints/package.json) file in the root of our cartridge with the following contents.

```

					{
  "hooks": "./hooks.json"
}


```

This file says a "hooks" config file is available in our project. Now we also have to make [that file](https://github.com/taurgis/ocapi-custom-endpoints/blob/main/cartridges/plugin_custom_ocapi_endpoints/hooks.json)!

```

					{
    "hooks": [
        {
            "name": "dw.ocapi.shop.custom_object.modifyGETResponse",
            "script": "./cartridge/scripts/hooks/customObjectsHooks.js"
        }
    ]
}


```

In this file, we declare that we want to modify the GET response of the Custom Object endpoint with a specific script.

Not sure where to create these files? Have a peek at the [GitHub repository](https://github.com/taurgis/ocapi-custom-endpoints/tree/main/cartridges/plugin_custom_ocapi_endpoints)!

You probably noticed that we also need to create a script file 😉. So let us also do that at the location defined in "[hooks.json](https://github.com/taurgis/ocapi-custom-endpoints/blob/main/cartridges/plugin_custom_ocapi_endpoints/hooks.json)."

```

					'use strict';
var toCamel = function (s) {
    // eslint-disable-next-line no-useless-escape
    return s.replace(/(-[a-z])/g, function ($1) { return $1.toUpperCase().replace('-', ''); });
};
/**
 *  Custom Object Modify Get Hook
 * @param {Object} scriptObject - the database objec
 * @param {Object} doc - the document
 */
exports.modifyGETResponse = function (customObject, doc) {
    if (customObject.type === 'CustomApi') {
        var result = require('*/cartridge/scripts/apis/' + toCamel(customObject.custom.ID)).get(request.httpParameters);
        doc.c_result = result;
    }
};


```

Another simple step as the script does not contain anything complicated. It does the following things:

1.  Check if the API call is for an object of type "CustomApi," which we created earlier. We should not execute any custom code if it is of another type.


2.  Use the custom object ID we defined to call the correct script. This is, however, treated to become a camel-case filename.

    For example: "get-customer" becomes "getCustomer."

3.  The dynamic require is executed, and the result object is stored in a variable.


4.  The resulting object is added to the response object prefixed with "[c\_](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/usage/CustomProperties.html?resultof=%22%6f%63%61%70%69%22%20%22%63%5f%22%20%22%63%22%20)."



In our example, the code will execute our "getCustomer.js" file, which looks something like this:

```

					'use strict';
/**
 * Fetch customer data using the Customer Number.
 *
 * WARNING: This is a very unsafe endpoint as you can fetch all accounts with an ID the is incremental! The idea is
 * just to show what is possible! And that with this possibility you can create serious security holes!
 *
 */
exports.get = function (httpParams) {
    var result = {};
    if(!empty(httpParams.customer_no)) {
        var CustomerMgr = require('dw/customer/CustomerMgr');
        var customer = CustomerMgr.getCustomerByCustomerNumber(httpParams.customer_no.pop());
        if(customer) {
            result.first_name = customer.profile.firstName;
            result.last_name = customer.profile.lastName;
        } else {
            result.error = 'Customer not found';
            result.customer_no = httpParams.customer_no;
        }
    }
    return result;
};


```

Are you a bit confused about where to place these files? Have a look at the [GitHub repository](https://github.com/taurgis/ocapi-custom-endpoints/tree/main/cartridges/plugin_custom_ocapi_endpoints/cartridge/scripts)!

## Step 5: Upload the cartridge

As with any cartridge, we need to upload it to our environment. Don't forget to add it to the cartridge path of your site(s) (not the BM Cartridge path).

We add it to the sites because the API is part of the Shop API, which is meant for Storefront applications.

## Step 6: Call the API!

[![](/media/2022/get-customer-custom-api-response-a6c8902585.png)](/media/2022/get-customer-custom-api-response-a6c8902585.png)

The final step is calling your endpoint (with the correct parameters). In this case, we have the parameter "customer\_no," which we use in our custom code to fetch the right customer.

To make it easier to understand how to test the API, I added a [Postman collection to the GitHub repository](https://github.com/taurgis/ocapi-custom-endpoints/blob/main/Custom%20API.postman_collection.json).

This collection requires you to configure the following variables:

[![](/media/2022/postman-variables-custom-api-ec0a89ffce.png)](/media/2022/postman-variables-custom-api-ec0a89ffce.png)

-   **base\_url**: The domain of your environment.
-   **client\_id:** Your client ID, you can use the default one.
-   **client\_pw:** Your client password, you can use the default one.

The collection also contains two premade API calls:

-   **1\. GetOAuth2 client token:** This fetches the bearer token


-   **2\. Custom API: Get Customer:** The call to fetch the Custom Object with the customized response



## Final thoughts

Although this might seem like a "hacky" way to get a custom API up and running in the OCAPI, it allows you to create a custom endpoint without worrying about an authorization/authentication/caching framework.

It's not perfect, but this gives you another option to add to your arsenal to tackle specific use-cases thrown at you.

And it is always nice to have options!
