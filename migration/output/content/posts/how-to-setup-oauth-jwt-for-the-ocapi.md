---
title: How to setup OAuth JWT for the OCAPI
description: >-
  IMPORTANT : This article is about server-to-server communication When working
  with the OCAPI ($1), you need to do some sort of authentication to prove who
date: '2022-06-27T17:49:25.000Z'
lastmod: '2022-07-23T19:16:34.000Z'
url: /how-to-setup-oauth-jwt-for-the-ocapi/
draft: false
heroImage: /media/2022/jwt-517bf34cae.png
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - jwt
  - security
  - sfcc
  - technical
author: Thomas Theunen
---
**_IMPORTANT_: This article is about server-to-server communication**

When working with the OCAPI ([Open Commerce API](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/usage/OpenCommerceAPI.html?cp=0_16)), you need to do some sort of authentication to prove who you are and to verify what actions you are allowed to take.

Salesforce B2C Commerce Cloud provides multiple methods for server-to-server authentication scenarios depending on the use case:

-   Basic Authentication using the API Key and the Secret
-   Basic Authentication using the API Key, Secret, Username, and User Password
-   JWT



In this article, we will focus on the one most 'challenging?' to set up: the JWT token.

## Generating a public and private key pair

When working with JWT, we will use a signing method to verify the authenticity of the requests sent to the server. These are easy to generate, and you have complete control over how long they are valid.

Open up your favorite terminal and execute the following command in your folder of choice:

```
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

This command will create two files:

-   **key.pem**: Your private key that will be used to sign requests to the OCAPI authorization endpoint


-   **cert.pem:** The certificate containing the public key will be needed later when setting up the API key in AM (Account Manager).



## Create a new API Key

Like always, when we set up a server-to-server connection, we need to generate an API key in the [Account Manager](https://account.demandware.com/).

Follow the i[nstructions on the Infocenter](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/account_manager/b2c_account_manager_add_api_client_id.html), with a few minor changes.

[![Account Manager client configuration for private_key_jwt authentication.](/media/2022/account-manager-set-up-jwt-c2ed29ddca.jpg)](/media/2022/account-manager-set-up-jwt-c2ed29ddca.jpg)

1.  In the JWT field, copy and paste the entire contents of the "**cert.pem**" file we generated earlier (no modifications needed)


2.  Set the Token Endpoint Auth Method to **private\_key\_jwt**.



And click save!

## Authenticate!

Ok, I made that title seem like this is an easy step to do. Generating the JWT might be the most challenging part as you need to be very specific, and there is a signing step with that private key mentioned before.

### JWT

But let us look at the basics. A JWT has three different parts.

[![Diagram showing the header, payload, and signature parts of a JWT.](/media/2022/jwt-visualized-74d5a59116.jpg)](/media/2022/jwt-visualized-74d5a59116.jpg)

The **header,** which describes what type the JWT is and what algorithm it is using. In this case, [RS256](https://auth0.com/blog/rs256-vs-hs256-whats-the-difference/) is used.

The **payload,** which is the data we are trying to send to the server. To get a token back, Salesforce B2C Commerce Cloud requires the following information to be in the JWT:

-   **iss (issuer)**: The client ID (API Key)
-   **sub (subject)**: The client ID (API key)
-   **exp (expiration time)**: Current time + x seconds (1 second should do it)
-   **aud (audience)**: The Account Manager auth endpoint



The **signature**, which is the header and payload signed with the private key to verify that you are allowed to send it to the server.

### Generating it

If you look at the above example, the contents of a JWT are far from "rocket science." The hard part is signing it correctly, as you need to find a sound library in your programming language of choice to get it done.

As an example, I have created a postman library to get you started!

In this example, you need to set two collection variables:

-   **pkey**: The entire contents of the _**key.pem**_ file we generated earlier


-   **api\_key**: The API key you generated in the Account Manager



There is also a variable called [**pmlib**](https://joolfe.github.io/postman-util-lib/dist/bundle.js): a third-party library meant to extend the capabilities of the scripting framework within [Postman](https://www.postman.com/). In the collection, a request called "1. Download JS for Postman" downloads it in case the initial value is not working.

Since Postman does not support generating JWT tokens out-of-the-box there is a "Pre-request script" within the second call "2. Authorization (JWT)" which generates it and stores it in a collection variable used during the request.

```
// Load third party library
eval(pm.collectionVariables.get("pmlib"));
// Prepare timestamp in seconds
var currentTimestamp = Math.floor(Date.now() / 1000)
// Create header and payload objects
var header = {
  "typ": "JWT",
  "alg": "RS256"
};
var payload = {
	'iss': pm.collectionVariables.get('api_key'),
	'sub': pm.collectionVariables.get('api_key'),
	'iat': currentTimestamp,
	'exp': currentTimestamp + 300, // expiry time is 30 seconds from time of creation
	'aud': 'https://account.demandware.com:443/dwsso/oauth2/access_token'
};
// Generate the JWT and sign it
var sJWT = pmlib.jwtSign(pm.collectionVariables.get('pkey'), payload, header);
// Store the JWT to set in the body
pm.collectionVariables.set("jwt_signed", sJWT);
```

Once the script is in place and all required variables are configured in the collection we can execute the request as follows:

-   A **POST** to [https://account.demandware.com/dwsso/oauth2/access\_token](https://account.demandware.com/dwsso/oauth2/access_token)


-   A body containing these 3 values as a **x-www-form-urlencoded** type:
    -   client\_assertion: The signed JWT generated by the script
    -   client\_assertion\_type: urn:ietf:params:oauth:client-assertion-type:jwt-bearer
    -   grant\_type: client\_credentials

 [![Postman request configured for OCAPI JWT authentication.](/media/2022/postman-authentication-ocapi-d973adb2eb.jpg)](/media/2022/postman-authentication-ocapi-d973adb2eb.jpg)[Download Postman Collection](https://gist.github.com/taurgis/df656968852275539d9f9d7a74bf62de)

_A big thanks to [Yuriy Boev](https://www.linkedin.com/in/yuriy-boev-3907002b/) and [John Boxall](https://www.linkedin.com/in/jboxall/) for helping me get to a working example! I will refer you to the [Unofficial Slack thread](https://sfcc-unofficial.slack.com/archives/CBB7YAAHW/p1656070265465869) for other scripts or languages!_
