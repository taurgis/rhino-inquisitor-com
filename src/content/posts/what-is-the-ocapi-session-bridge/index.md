---
title: What is the OCAPI session bridge?
description: >-
  It is possible to link a SiteGenesis/SFRA session with an OCAPI "session." But
  how can we do it, and what is it suitable for?
date: '2022-08-15T19:08:02.000Z'
lastmod: '2026-07-09T12:00:00.000Z'
url: /what-is-the-ocapi-session-bridge/
draft: false
heroImage: session-bridge-bbf2a7ba92.png
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - ocapi
  - sfcc
  - technical
author: Thomas Theunen
takeaways:
  - "Explains how the session bridge exchanges a storefront session cookie for a JWT, and back again, to keep monolithic and headless touchpoints in sync"
  - "Walks through parallel request flows for the current SLAS Session Bridge and the legacy OCAPI session bridge, so you can tell which one applies to your stack"
  - "Highlights the hybrid-deployment and mobile-app scenarios where session bridging is useful, the sensitive-data caveats, and OCAPI's April 2026 deprecation timeline"
---
With the added attention to [Headless architecture](/sitegenesis-vs-sfra-vs-pwa/) in Salesforce B2C Commerce Cloud and the option for hybrid deployments that mix SFRA/SiteGenesis with a headless storefront, the [Session Bridge](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-commerce-ocapi/sessionbridge.html) has had plenty of airtime.

But what is it, when do you actually need it, and what should you watch out for? Let's dig in.

> [!WARNING]
> **OCAPI is deprecated**
>
> Salesforce marked OCAPI deprecated as of April 2026. Per [Why Use SCAPI Instead of OCAPI](https://developer.salesforce.com/docs/commerce/commerce-api/guide/why-use-scapi.html), it keeps receiving security updates for two more years, but no new features. If you're starting a new integration on SCAPI and SLAS, default to the SLAS Session Bridge covered first below. The classic OCAPI session bridge, covered right after it, still works and still matters if you already depend on it, but treat it as the legacy path, not the one to reach for first.

## TLDR; Solution

For those who want a quick answer for the classic OCAPI flow, I have created a Postman collection with three API calls:

- Start an anonymous session in the OCAPI
- Exchange JWT for cookies
- Exchange cookies for JWT (_Postman automatically stores the cookies to the domain in the second call - that is why you will not see any variable or script in this call_)

- [OCAPI- Session Bridge.postman\_collection.json](https://gist.github.com/taurgis/5c31294867fc406669effa6fddc48b8a)

If you're building on SCAPI and SLAS instead, skip ahead to the [SLAS Session Bridge scenario](#scenario-slas-session-bridge) below for the equivalent walkthrough.

## What is it

Let's start with what the Session Bridge actually is.

It is a set of services that allow the exchange of a [session cookie](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_local_data_storage.htm) (Site) for a [JWT](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-commerce-ocapi/jwt.html) (OCAPI/SCAPI) and vice-versa. A JWT (JSON Web Token) is how OCAPI and SCAPI recognise a shopper on an API call; a session cookie (`dwsid`) is how an SFRA or SiteGenesis controller recognises the same shopper on a page request. Neither side understands the other's credential natively, so something has to translate between them.

Using this service, you can keep a session alive across different touchpoints. Take a mobile app with a button that redirects to the site: a shopper who's already logged into the app shouldn't have to log in again the moment they land on the storefront.

That's where the Session Bridge comes in. Before redirecting the shopper, the app exchanges its JWT for a valid cookie and sets it on the browser. Result: happy customer (hopefully 😊).

{{< img-caption src="session-bridge-mobile-app-v3-scaled-93e60b2f4b.jpeg" alt="Mobile app session bridging flow that transfers a shopper into the storefront." >}}

There are two mechanisms that do this exchange today, and which one applies to you depends on how you talk to the platform:

- **The SLAS Session Bridge** is the current default. If your app calls SCAPI and authenticates shoppers through SLAS (Shopper Login and API Access Service), as PWA Kit, a Composable Storefront, and Hybrid Auth all do, this is the one you want.
- **The classic OCAPI session bridge** is the original mechanism, built on the OCAPI Shop API. If you're calling OCAPI directly, or you have an older integration that predates SLAS, this is what you're already running, and it still works.

Both scenarios are covered below, starting with the current default.

## Scenario: SLAS Session Bridge

SLAS tokens are already the credential PWA Kit, Composable Storefront, and [Hybrid Auth](https://developer.salesforce.com/docs/commerce/commerce-api/guide/hybrid-authentication.html) use to talk to SCAPI, so this scenario is really about connecting that existing JWT to an SFRA/SiteGenesis session (and back), not about a new authentication system.

### Prerequisite: A SLAS client with the session bridge scope

You need a SLAS client (public or private) configured with the `sfcc.session_bridge` scope in Account Manager. If you haven't set up a SLAS client before, [SLAS Session Sync in SFRA and SiteGenesis](/slas-in-sfra-or-sitegenesis/) walks through that setup in detail. This section assumes it's already done and focuses on the bridge itself.

### Step 1: Get a SLAS access token (JWT)

Just like the OCAPI scenario, we need a JWT before we can do anything else. For a private SLAS client, a guest token is a single call to [`getAccessToken`](https://developer.salesforce.com/docs/commerce/commerce-api/references/auth?meta=getAccessToken):

```text
REQUEST:
POST /shopper/auth/v1/organizations/{organizationId}/oauth2/token HTTP/1.1
Host: {shortCode}.api.commercecloud.salesforce.com
Content-Type: application/x-www-form-urlencoded
Authorization: Basic <base64 of client_id:client_secret>

grant_type=client_credentials&channel_id=RefArch
```

The response hands the JWT straight back in the body, unlike OCAPI's `/customers/auth`, where you had to go digging in the `Authorization` header:

```json
{
    "access_token": "<sample-jwt>",
    "token_type": "Bearer",
    "expires_in": 900,
    "refresh_token": "<sample-refresh-token>",
    "refresh_token_expires_in": 7776000,
    "usid": "18cda486-fe32-4e27-888b-6e4f89938e67",
    "customer_id": "1000005"
}
```

### Step 2: Exchange the JWT for cookies

Here's the detail worth pausing on: this step uses the exact same OCAPI Shop [`/sessions`](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-shop-sessions?meta=Exchange%2BJWT) endpoint from the classic scenario below. A SLAS-issued JWT is just as valid there as an OCAPI-issued one: only the source of the bearer token changes.

```text
REQUEST:
POST /s/RefArch/dw/shop/v25_6/sessions HTTP/1.1
Host: example.com
x-dw-client-id: [your_own_client_id]
Authorization: Bearer <sample-jwt>
```

The response is the same `204 No Content` with the same `dwsecuretoken_*`, `dwsid`, and `dwanonymous_*` `Set-Cookie` headers shown in [Step 2 of the OCAPI scenario](#step-2-exchange-the-bearer-jwt-token-for-cookies) below. Copy the `dwsid` value the same way.

### Step 3: Exchange the cookies for a new JWT

This is where SLAS actually diverges from OCAPI. Instead of sending the raw `dwsid` cookie back, SLAS wants a signed token that proves you control the session, generated server-side from Script API:

- Guest shopper: [`Session.generateGuestSessionSignature()`](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_system_Session.html#dw_system_Session_generateGuestSessionSignature_DetailAnchor) returns the signed token you send as `dwsgst`.
- Registered shopper: [`Session.generateRegisteredSessionSignature()`](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_system_Session.html#dw_system_Session_generateRegisteredSessionSignature_DetailAnchor) returns the signed token you send as `dwsrst`. (The Script API reference itself still describes this as a token "for registered dwsid"; the `dwsrst` name comes from the session-bridge guide, not from the method's own doc text.)

Call [`getSessionBridgeAccessToken`](https://developer.salesforce.com/docs/commerce/commerce-api/references/auth?meta=getSessionBridgeAccessToken) with that signed value. This is a separate mechanism from the `session_bridge` grant type also listed on the plain [`getAccessToken`](https://developer.salesforce.com/docs/commerce/commerce-api/references/auth?meta=getAccessToken) endpoint, which exchanges an authorization code rather than a signed token; that code-based flow is out of scope here.

```text
REQUEST (guest shopper):
POST /shopper/auth/v1/organizations/{organizationId}/oauth2/session-bridge/token HTTP/1.1
Host: {shortCode}.api.commercecloud.salesforce.com
Content-Type: application/x-www-form-urlencoded
Authorization: Basic <base64 of client_id:client_secret>

grant_type=client_credentials&hint=sb-guest&login_id=guest&channel_id=RefArch&dwsgst=<signed-guest-token>
```

For a registered shopper, swap `hint=sb-guest` for `hint=sb-user`, set `login_id` to the shopper's login ID, and send `dwsrst` instead of `dwsgst`. The response is the same JSON shape as Step 1: a fresh `access_token`, `refresh_token`, and `customer_id`.

> [!WARNING]
> **`dwsid` for guest bridging is already gone; for registered shoppers it's next**
>
> Passing the raw `dwsid` for _guest_ session bridging isn't just discouraged, it's dead: Salesforce cut it off for good on March 31, 2024, and the endpoint now returns a 404 or 410 for that request shape. `dwsgst` has been mandatory for guests since then. For _registered_ shoppers, `dwsid` still works today in place of `dwsrst`, but Salesforce's docs flag it for the same eventual deprecation. Use `dwsrst`/`dwsgst` for both in new code, and don't build anything new on raw `dwsid`.

## Scenario: OCAPI to Site

This is the classic session bridge, built directly on the OCAPI Shop API. If you landed here from the SLAS scenario above looking for the shared `/sessions` step, this is the section it points to. If you're calling OCAPI directly, this is still the mechanism you're using.

### Prerequisite: Configure OCAPI

For this scenario, we'll use a placeholder client ID:

```text
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
```

You'll recognise this string from other SFCC tutorials: it's a common sandbox placeholder. An earlier version of this article claimed it doesn't need to be registered in [Account Manager](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-commerce-ocapi/clientapplicationidentification.html) to work on sandboxes. Current OCAPI documentation describes no such exemption: every client ID, sandbox or production, must be obtained through Account Manager and enabled before OCAPI accepts it. Register your own client ID and swap it in wherever you see `[your_own_client_id]` below. Don't assume this placeholder will actually authenticate.

With a real client ID, configure access to the necessary APIs in the Business Manager at

"_Administration_" > "_Site Development_" > "_Open Commerce API Settings_"

```json
{
    "_v": "25.6",
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

> [!NOTE]
> **Version numbers will drift**
>
> OCAPI versions stay supported for about two years after being superseded, then Salesforce deletes them without further notice. `25.6`/`v25_6` below is the version shown in Salesforce's Shop API reference docs at the time of this refresh, not necessarily what your org's OCAPI version metadata endpoint reports as current. Check your site's supported range in Business Manager, or that metadata endpoint, before copying these examples; the request and response shapes are what this walkthrough is teaching, not the specific version number.

### Step 1: Get an OCAPI session JWT

> [!NOTE]
> **Site ID**
>
> In the examples below, you will see the site "RefArch" used. Do not forget to replace this with your own.

The first resource we call is customer authentication. It returns a JWT bearer token, which we can then use against other OCAPI endpoints tied to that customer "session."

- [/customers/auth](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-shop-customers?meta=Summary)

To keep the example simple, we'll use a guest session:

```text
REQUEST:
POST /s/RefArch/dw/shop/v25_6/customers/auth HTTP/1.1
Host: example.com
Content-Type: application/json
x-dw-client-id: [your_own_client_id]
{
  "type" : "guest"
}
```

The result is a response containing the bearer token we need to continue talking to the OCAPI.

```json
{
    "_v": "25.6",
    "_type": "customer",
    "auth_type": "guest",
    "customer_id": "abEJE0Q5dATRwio9DZjEvBuDUq",
    "preferred_locale": "en_US",
    "visit_id": "477caf41e8a3d6a4ede60aa354"
}
```

But the JWT you need isn't in the response body... it's in the Authorization header!

{{< img-caption src="bearer-token-authorization-header-e377c64b9c.png" alt="Authorization header containing the OCAPI bearer token in Postman." >}}

### Step 2: Exchange the bearer JWT token for cookies

Now let's exchange that token for a cookie. For that, we need the "sessions" endpoint.

- [/sessions](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-shop-sessions?meta=Summary)

> [!TIP]
> The link above contains much information on things to keep in mind! Be sure to give it a good read.

The request itself is simple: call the endpoint with a bearer-type Authorization header, and you're done.

```text
POST /s/RefArch/dw/shop/v25_6/sessions HTTP/1.1
Host: example.com
x-dw-client-id: [your_own_client_id]
Authorization: Bearer <sample-jwt>
```

If all goes well, you will get a response that will attempt to set cookies on the current host domain.

```text
RESPONSE:
HTTP/1.1 204 NO CONTENT
Set-Cookie : dwsecuretoken_<suffix>=""; Expires=Thu, 01-Jan-1970 00:00:10 GMT;
Set-Cookie : dwsid=<sample-session-cookie>;
Set-Cookie : dwanonymous_<suffix>=<sample-anonymous-id>; Max-Age=15552000;
```

Copy the **dwsid** cookie: the next step needs it to convert the cookie back into a JWT.

### Step 3: Exchange the cookie for a bearer JWT

Sometimes you need to go the other way and convert a cookie back into a JWT. That uses the same endpoint as step 1.

- [/customers/auth](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-shop-customers?meta=Summary)

The only real difference from step 1 is the request body, plus the cookie.

```text
REQUEST:
POST /s/RefArch/dw/shop/v25_6/customers/auth HTTP/1.1
Host: example.com
Content-Type: application/json
x-dw-client-id: [your_own_client_id]
Cookie: dwsid=<sample-session-cookie>
{
  "type" : "session"
}
```

> [!NOTE]
> **`dwsecuretoken` on HTTP-only sites**
>
> If your site doesn't enforce HTTPS (the Business Manager "Enforce HTTPS" preference is off), OCAPI also requires a valid `dwsecuretoken` cookie alongside `dwsid` for this call, or it fails. Step 2's response cleared that cookie in the example above, which is what you'll see on an HTTPS-enforced site; on an HTTP one, send back whatever value it actually set.

Similar to our first request, we get a JSON response with the JWT token in the "Authorization" header.

```json
{
    "_v": "25.6",
    "_type": "customer",
    "auth_type": "guest",
    "customer_id": "abEJE0Q5dATRwio9DZjEvBuDUq",
    "preferred_locale": "en_US",
    "visit_id": "51e8f8af5015bd57bfeea12bed"
}
```

> [!NOTE]
> **Matching `customer_id`**
>
> To verify that the flow worked, the `customer_id` from step 1 should match the value you receive in response to this call.

## Guest basket and sensitive data

Something to keep in mind when using either session bridge is how it handles sensitive data; let's look at two scenarios.

> [!WARNING]
> **Sensitive basket data crosses over too**
>
> If the customer is authenticated and has a storefront basket, that basket is transferred into the session and can be retrieved using `BasketMgr.getCurrentBasket()`, along with sensitive data such as addresses and payment information.

{{< img-caption src="session-bridge-guest-basket-secure-order-df1146c25d.jpeg" alt="Secure guest-basket handover where sensitive basket data remains protected." caption="A secure way of working with sensitive data" >}}

{{< img-caption src="session-bridge-guest-basket-insecure-order-a252675925.jpeg" alt="Insecure handover example where SFCC blocks sensitive basket details after transfer." caption="SFCC Makes sure no sensitive data is shared in a possibly insecure scenario" >}}

In the second scenario, the basket is created or modified **after** the session handover.

As a security precaution, Salesforce ensures that SiteGenesis/SFRA cannot access this data.

Keep this in mind if your integration modifies or creates a basket after the handover.

## Use Case: Hybrid deployment

As mentioned in the intro, session bridging has drawn a lot more attention since PWA Kit's release.

One of PWA Kit's supported scenarios is a hybrid deployment: keeping some pages on SFRA/SiteGenesis and others on PWA Kit.

That lets existing customers migrate from a monolithic architecture to a headless one at their own pace.

Want to know more about how to implement this approach? Head to the official [Hybrid Authentication](https://developer.salesforce.com/docs/commerce/commerce-api/guide/hybrid-authentication.html) guide, which replaced the older Plugin SLAS approach as of B2C Commerce 25.3. If you're maintaining an existing Plugin SLAS setup, the [previous guide](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/phased-headless-rollouts.html) is still online, but new hybrid deployments should start with Hybrid Auth.
