---
title: How to retrieve the Request Body in an SFCC Controller easily
description: >-
  $1 are a way to create personalised solutions that meet the needs of a
  particular business. If we are working with POST or PUT requests, developers
  need...
lastmod: '2023-04-03T06:57:14.000Z'
url: /the-request-body-in-an-sfcc-controller/
draft: false
heroImage: /media/2023/json-e912c3b91a.jpeg
date: '2023-04-03T06:57:02.000Z'
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - api
  - sfcc
  - technical
author: Thomas Theunen
---
[Custom endpoints](https://www.rhino-inquisitor.com/creating-custom-ocapi-endpoints/) are a way to create personalised solutions that meet the needs of a particular business. If we are working with POST or PUT requests, developers need to be able to access and handle the submitted data within an SFCC controller. But where can we find this [request body](https://en.wikipedia.org/wiki/HTTP_message_body)?

## TLDR;

 [![Example code in SiteGenesis of accessing the Request Body in the COPlaceOrder controller.](/media/2023/reques-body-sfcc-00c1f40887.jpg)](/media/2023/reques-body-sfcc-00c1f40887.jpg)To get the request body in an SFCC controller, use the following script:

```

					request.httpParameterMap.requestBodyAsString

```

This attribute will provide a string representation of the request data, which can then be parsed and processed. Global Variable "request" is a [global variable](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_TopLevel_global.html) available everywhere in the back end.

## Understanding SFCC Controllers and Body

In the context of SFCC, a controller is a script module that takes care of processing various HTTP requests and generating suitable responses. Controllers are typically used to implement server-side logic for various user interactions, such as adding items to the cart or processing payments. The request body is part of an HTTP request containing the client's data to the server. In the case of an e-commerce platform, this might include information such as item details or a query.

## Accessing submitted data in an SFCC Controller

To access the body in an SFCC controller, you must use the "[request](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_system_Request.html)" object provided by the controller's execution context. This object represents the incoming HTTP request and provides various attributes and methods for accessing request data. The "request.[httpParameterMap](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_web_HttpParameterMap.html)" attribute is a collection of all input parameters received in the HTTP request. This includes query parameters, form parameters, and the request body. You can use the "[requestBodyAsString](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_web_HttpParameterMap.html#dw_web_HttpParameterMap_getRequestBodyAsString_DetailAnchor)" attribute to access the request body. This attribute provides a string representation of the request body, allowing you to parse and process the data as needed. Here's an example of how to use the "request.httpParameterMap.requestBodyAsString" attribute to access the request body inside a basic SFCC controller (without the SFRA wrapping):

```

					var ISML = require('dw/template/ISML');
function start() {
    var requestBody = request.httpParameterMap.requestBodyAsString;
    // Process the request body here
    // Render the response
    ISML.renderTemplate('mytemplate', {
        requestBody: requestBody
    });
}
exports.Start = start;

```

The "requestBodyAsString" attribute gets the request body as a string (what's in a name). You can then process the value as needed, such as parsing it into a JSON object or using it to perform server-side validation.

## Parsing the data

In many cases, the request body will be a JSON string that needs to be parsed into a JavaScript object. You can use the "JSON.parse()" method to do this. Here's an example of how to parse these requests into a JSON object:

```

					var requestBody = request.httpParameterMap.requestBodyAsString;
var requestBodyJson = JSON.parse(requestBody);

```

## Handling Errors

![](/media/2023/security-check-border-api-security-5695d3d810.jpg) When working with data being submitted to the server, handling any errors that might occur, such as malformed JSON or an invalid request, is essential. You can use a try-catch block to catch any exception thrown during the processing of the request body.  Here's a basic example of how to handle errors:

```

					var requestBody = request.httpParameterMap.requestBodyAsString;
var requestBodyJson;
try {
    requestBodyJson = JSON.parse(requestBody);
} catch (error) {
    // Handle the error, such as sending an error response or logging the error
}

```

Validation It is always a good idea to have some validation of the made request, such as:

-   **Structure of the request (contract)**: Does it contain all required fields, and are they the correct type?
-   **Values**: Validate the minimum and maximum length of the field and if they follow a certain structure (e.g. email, phone, address, ...)
-   **Rate Limiting**: The SCAPI may come with rate limiting, but you don't want the eCDN to be fully in charge of your controller limits, right?

## Conclusion

API-first development has been long-awaited in the Salesforce B2C Commerce Cloud world, but that time is finally upon us. By creating custom endpoints, either with the OCAPI (hopefully soon the SCAPI) or with custom controllers, we can add new features to Headless storefronts such as the Composable Storefront. And in a transactional context, we will need that request body!
