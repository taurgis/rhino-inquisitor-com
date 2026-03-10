---
title: What is the OCAPI session bridge?
description: >-
  With the added attention to $1 in Salesforce B2C Commerce Cloud and the option
  for "$1," the $1 has also gotten some more airtime. But what is it? What...
date: '2022-08-15T19:08:02.000Z'
lastmod: '2023-12-07T10:36:32.000Z'
url: /what-is-the-ocapi-session-bridge/
draft: false
heroImage: /media/2023/session-bridge-bbf2a7ba92.png
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - ocapi
  - sfcc
  - technical
author: Thomas Theunen
---
With the added attention to [Headless architecture](/sitegenesis-vs-sfra-vs-pwa/) in Salesforce B2C Commerce Cloud and the option for "[hybrid deployments](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/phased-headless-rollouts.html)," the [Session Bridge](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/usage/SessionBridge.html) has also gotten some more airtime.

But what is it? What do I use it for? What do I watch out for? Let us dig deeper into these questions and try to give them a clear answer!

## TLDR; Solution

For those who want a quick answer to this, I have created a postman collection with three API calls:

-   Start an anonymous session in the OCAPI
-   Exchange JWT for cookies
-   Exchange cookies for JWT (_Postman automatically stores the cookies to the domain in the second call - that is why you will not see any variable or script in this call_)

-   [OCAPI- Session Bridge.postman\_collection.json](https://gist.github.com/taurgis/5c31294867fc406669effa6fddc48b8a)

### Looking for the SLAS Session Bridge?

A new option is available for session bridging linked to SLAS. This alternative is handy if you primarily work with SCAPI endpoints and SLAS. It provides a more efficient and effective way to manage sessions and streamline your transfer workflow.

You can find the documentation [here](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas-session-bridge-auth.html?q=session%20bridge)!

## What is it?

First things first, let us dig into what the Session Bridge is. And luckily for us, it is not rocket science!

It is a set of services that allow the exchange of a [session cookie](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DataProtectionAndPrivacy/LocalDataStorage.html) (Site) for a [JWT](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/usage/JWT.html) (OCAPI/SCAPI) and visa-versa.

Using this service, you can keep a session alive across different touchpoints. A good example is a mobile application with a button redirecting to the site.
In this scenario, it would be a shame if someone logged into the application would have to log in again on the site.

Come into play the "Session Bridge!" The mobile application, before being redirected, exchanges its JWT token for a valid cookie and sets it before pushing the customer to the site. Result: Happy customer (hopefully 😊)!

[![](/media/2022/session-bridge-mobile-app-v3-scaled-93e60b2f4b.jpeg)](/media/2022/session-bridge-mobile-app-v3-scaled-93e60b2f4b.jpeg)

## Scenario: OCAPI to Site

### Prerequisite: Configure OCAPI

For this scenario, we will be making use of the following API key:

```

					aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa


```

For those unaware, the above key does not need to be configured in the Account Manager to be used on Sandboxes and test systems. **It is not meant to be used in production!**

With this API key, we can configure access to the necessary APIs in the Business Manager at

"_Administration_" > "_Site Development_" > "_Open Commerce API Settings_"

```

					{
	"_v": "22.6",
	"clients": [
		{
			"client_id": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
			"allowed_origins": [],
			"resources": [
				{
					"resource_id": "/customers/auth",
					"methods": [
						"post"
					],
					"read_attributes": "(**)",
					"write_attributes": "(**)"
				},
				{
					"resource_id": "/sessions",
					"methods": [
						"post"
					],
					"read_attributes": "(**)",
					"write_attributes": "(**)"
				}
			]
		}
	]
}


```

### Step 1: Get a OCAPI session JWT

Site ID In the examples below, you will see the site "RefArch" used. Do not forget to replace this with your own.

The first resource we need to call is customer authentication. And with this, we will get a JWT bearer token we can use other OCAPI endpoints linked to that customer "session."

-   [/customers/auth](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/shop/Resources/Customers.html#id152105914__id-98588883)

In this example, to make it a bit easier to test out, we will use a guest session by forming a request like this:

```

					REQUEST:
POST /s/RefArch/dw/shop/v22_6/customers/auth HTTP/1.1
Host: example.com
Content-Type: application/json
x-dw-client-id: [your_own_client_id]
{
  "type" : "guest"
}


```

The result is a response containing the bearer token we need to continue talking to the OCAPI.

```

					{
    "_v": "22.6",
    "_type": "customer",
    "auth_type": "guest",
    "customer_id": "abEJE0Q5dATRwio9DZjEvBuDUq",
    "preferred_locale": "en_US",
    "visit_id": "477caf41e8a3d6a4ede60aa354"
}


```

But what you need is not visible in the response... huh? Not to worry, it is in the Authorization header!

[![](/media/2023/bearer-token-authorization-header-e377c64b9c.png)](/media/2023/bearer-token-authorization-header-e377c64b9c.png)

### Step 2: Exchange the bearer JWT token for cookies

Let us exchange that token for a cookie, shall we? And for that, we need the "sessions" endpoint.

-   [/sessions](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/shop/Resources/Sessions.html#id-2104258718__id-514053870)

Important information The link above contains much information on things to keep in mind! Be sure to give it a good read.

The request itself is pretty easy! Call the endpoint with the correct authorization header (type bearer), and you are as good as gold!

```

					POST /s/RefArch/dw/shop/v22_6/sessions HTTP/1.1
Host: example.com
x-dw-client-id: [your_own_client_id]
Authorization: Bearer eyJfdiI6IjXXXXXX.eyJfdiI6IjEiLCJleHAXXXXXXX.-d5wQW4c4O4wt-Zkl7_fiEiALW1XXXX


```

If all goes well, you will get a response that will attempt to set cookies on the current host domain.

```

					RESPONSE:
HTTP/1.1 204 NO CONTENT
Set-Cookie : dwsecuretoken_a85a5236a2e852d714eb6f1585efb61c=""; Expires=Thu, 01-Jan-1970 00:00:10 GMT;
Set-Cookie : dwsid=eXv5R3FZGI4BBfbK1Opk5s1mJ-41Aw7ZuaMKxeye5xa16fJMX--AnNkXsvmakbi1UZSzP1zoPmUILgoom1_jKg==;
Set-Cookie : dwanonymous_a85a5236a2e852d714eb6f1585efb61c=bdjalnzmfrkJ0FtYliwud5db67; Max-Age=15552000;


```

For the next step to work, copy the **dwsid** cookie. We need it to convert the cookie back to a JWT bearer token.

### Step 3: Exchange the cookie for a bearer JWT

In some scenarios, we need to be able to do it the other way around and convert our cookie to a JWT token. To do this, we use a familiar endpoint (step 1)!

-   [/customers/auth](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/shop/Resources/Customers.html#id152105914__id-98588883)

The most significant difference from step 1 is that we send a different body and, of course, our cookie.

```

					REQUEST:
POST /s/RefArch/dw/shop/v22_6/customers/auth HTTP/1.1
Host: example.com
Content-Type: application/json
x-dw-client-id: [your_own_client_id]
Cookie: dwsid=pATvWUO3KSdt-Kmcy-8-RsxKnoO4BMDwoec7ACVlW6tZNnhaOL7gt7mHqL-h7QYn5TyE61z0DeSMCqxngsWeHw==
{
  "type" : "session"
}


```

Similar to our first request, we get a JSON response with the JWT token in the "Authorization" header.

```

					{
    "_v": "22.6",
    "_type": "customer",
    "auth_type": "guest",
    "customer_id": "abEJE0Q5dATRwio9DZjEvBuDUq",
    "preferred_locale": "en_US",
    "visit_id": "51e8f8af5015bd57bfeea12bed"
}


```

Matching customer\_id To verify that the flow worked, the "customer\_id" from step 1 should match the value you receive in response to this call.

## SCAPI & SLAS

Suppose you are making use of SLAS to get a JWT token, no worries. This JWT token is also compatible with the session bridge and is used actively by the PWA Kit (Composable Storefront) and the [SFRA SLAS Plugin](/slas-in-sfra-or-sitegenesis/).

## Guest basket and sensitive data

> If the customer is authenticated and has a storefront basket, that basket is transferred into the session and can be retrieved using BasketMgr.getCurrentBasket(), along with sensitive data such as addresses and payment information.

Something to keep in mind when using the Session Bridge is how it handles sensitive data; let us look at two scenarios.

[![](/media/2022/session-bridge-guest-basket-secure-order-df1146c25d.jpeg)](/media/2022/session-bridge-guest-basket-secure-order-df1146c25d.jpeg)

A secure way of working with sensitive data

[![](/media/2022/session-bridge-guest-basket-insecure-order-a252675925.jpeg)](/media/2022/session-bridge-guest-basket-insecure-order-a252675925.jpeg)

SFCC Makes sure no sensitive data is shared in a possibly insecure scenario

_**A basket is created/modified**_ _**after the session handover**_ in the second scenario.

As a security precaution, Salesforce ensures that SiteGenesis/SFRA can not access this data.

Consider this if you have a scenario where one might modify or set a basket after a session handover.

## Use Case: Hybrid deployment

As mentioned in the intro, this API endpoint has gotten much more attention since the release of the PWA Kit.

One of the official scenarios supported by this new storefront option is a hybrid deployment, which means keeping some pages running on SFRA/SiteGenesis and others on the PWA Kit.

This allows existing clients to slowly migrate from the "monolithic architecture" to a "headless architecture."

Want to know more about how to implement this approach? Head to [the official documentation](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/phased-headless-rollouts.html)!
