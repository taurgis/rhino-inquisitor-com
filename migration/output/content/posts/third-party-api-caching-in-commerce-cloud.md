---
title: Third-Party API Caching in Commerce Cloud
description: >-
  Enhancing the performance of applications that rely on third-party services is
  crucial in today's digital environment. Numerous SFCC sites rely on APIs...
lastmod: '2024-11-13T09:26:49.000Z'
url: /third-party-api-caching-in-commerce-cloud/
draft: false
date: '2024-11-11T05:35:00.000Z'
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - composable storefront
  - sfcc
  - sfra
  - technical
author: Thomas Theunen
---
Enhancing the performance of your different online channels is a given, including keeping an eye on any third-party integrations. All Salesforce Commerce Cloud sites rely on APIs in some capacity, such as for retrieving location data, weather updates, address verification, [submitting files](https://www.rhino-inquisitor.com/submitting-a-file-to-a-third-party-service-in-sfcc/), and more, all with different levels of performance stability. 😅.

Understanding and applying caching for third-party services can enhance your third-party's integration performance and cost-effectiveness.

Now, let’s delve into the process, its benefits, and some things to remember to get you going.

## Caching with LocalServiceRegistry?

[![Salesforce Commerce Cloud Web Service Framework](https://www.rhino-inquisitor.com/wp-content/uploads/2024/11/sfcc-service-framework.jpg)](https://www.rhino-inquisitor.com/wp-content/uploads/2024/11/sfcc-service-framework.jpg)

Salesforce Commerce Cloud Web Service Framework

The [Web Service Framework](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-webservices.html) is key to managing external service interactions. It enables developers (and other profiles) to manage third-party integrations with [ease](https://trailhead.salesforce.com/content/learn/modules/b2c-integration-approaches/b2c-learn-web-services-framework) from the comfort of the Business Manager.
One of those built-in features is caching responses from third-party APIs, which reduces the need for repeated network requests and, in many cases, reduces costs related to those services (usage-based licenses).

Creating a service in the [LocalServiceRegistry](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/index.html?target=class_dw_svc_LocalServiceRegistry.html) comes with a simple configuration for managing request handling. Here's a basic example of how to create a service with a caching feature:

```

					var callTestGet = LocalServiceRegistry.createService("test.http.get", {
        createRequest: function(svc: HTTPService, args) {
  		    svc.client.enableCaching(1000);
            	svc.setRequestMethod("GET");
        },
        parseResponse: function(svc: HTTPService, client: HTTPClient) {
            return client.text;
        },
        mockCall: function(svc: HTTPService, client: HTTPClient) {
            return {
                statusCode: 200,
                statusMessage: "Success",
                text: "MOCK RESPONSE (" + svc.URL + ")"
            };
        },
        filterLogMessage: function(msg: String) {
            return msg.replace("headers", "OFFWITHTHEHEADERS");
        }
    });


```

[In this snippet](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-webservices.html#configure-underlying-clients), the \`**enableCaching**\` method is invoked, enabling caching for the HTTP requests serviced by this configuration. The argument (in this case, \`1000\`) represents a timeout setting, which dictates how long a cached response will be valid before the subsequent request is made.

[![](https://www.rhino-inquisitor.com/wp-content/uploads/2024/11/configuring-underlying-clients.png)](https://www.rhino-inquisitor.com/wp-content/uploads/2024/11/configuring-underlying-clients.png)

A screenshot of the official documentation on how to add caching to a service.

## Why Caching Matters

[Caching](https://www.rhino-inquisitor.com/caching-rest-apis-in-sfcc/) has several benefits, especially for services with consistent data and infrequent updates. Let's have a look at how this minor code change can significantly affect the way your Salesforce Commerce Cloud channel works:

1.  **Faster performance**: Caching allows your site to retrieve data from "local" storage instead of repeatedly calling an external server. When a cached response is available, the app server can quickly fulfil requests, significantly reducing wait times.
2.  **Greater Reliability**: With caching, your site becomes more robust. If a third-party service goes down or experiences issues, your app can still provide cached data, ensuring a smoother user experience.
3.  **Better Rate Limit Management**: Many APIs limit the number of requests you can make within a specific timeframe. Using cached responses reduces the number of requests sent out, helping you stay within these limits and preventing potential service interruptions.

## Everyday Use Cases for Caching

Here are a few everyday situations where you might want to use [caching](https://www.rhino-inquisitor.com/caching-in-the-sfcc-composable-storefront/):

1.  **Google Location Services**: Location data doesn't change very often, so caching it can speed up response times in local applications.
2.  **Address Verification Services**: Address information stays the same over time. Caching these responses can improve efficiency.
3.  **Weather Services**: Weather data can be cached for short periods. While it might change frequently, most applications don't require constant real-time updates.

Implementing caching for these services can significantly enhance performance, boost speed, and reduce expenses.

However, don't anticipate any "magic 🪄"—it's the accumulation of many small enhancements that can lead to significant improvements. The development effort here is minimal, yet the potential impact is substantial! Is anyone looking for quick wins?

## Clearing the cache

[![A screenshot of the "Service Maintenance" configuration page in the Business Manager.](https://www.rhino-inquisitor.com/wp-content/uploads/2024/11/clearing-httpclient-response-cache.png)](https://www.rhino-inquisitor.com/wp-content/uploads/2024/11/clearing-httpclient-response-cache.png)

A screenshot of the "Service Maintenance" configuration page in the Business Manager.

You can clear the HTTPClient Response cache in the Business Manager by going to `Administration > Operations > Service Maintenance`. Here, you'll find options related to this cache.

To clear cached responses for ALL services, simply click the **Invalidate** button next to "HTTP Client Response Cache."

Service Specific There isn't an option to clear the cache for a specific service.

## Some things to keep in mind

### General Caching Warnings

Caching HTTP responses has numerous benefits, yet it's crucial to be mindful of potential drawbacks.

-   **Stale Data**: Cached data can become outdated, especially if the third-party API updates its responses frequently. Be sure to set a cache expiration period that matches the data's update frequency.
-   **Inconsistent States**: Relying too much on cached data without refreshing it can lead to users receiving outdated or incorrect information. This can negatively affect user experience and erode trust.
-   **Error Propagation**: If there's an error from the external service and you cache this response, users might keep encountering the same error until the cache is cleared or expires.
-   **Debugging Complexity**: Debugging can get tricky if cached responses interfere with your expectations while developing or testing your application. It's important to know precisely what data is being cached.
-   **Impact on Business Logic**: Cached responses might not show real-time changes crucial for essential business processes. This can result in making incorrect decisions based on outdated data.

### LocalServiceRegistry-Specific Considerations

#### Limitations

[It caches only status codes of 2xx with content length and size under 50k](https://sfcclearning.com/infocenter/DWAPI/scriptapi/html/api/class_dw_svc_HTTPService.php#dw_svc_HTTPService_setCachingTTL_Number_DetailAnchor), which are not immediately written to a file. The cache keys consist of the URL and the user name. The system automatically manages and limits the total size of cacheable content and the number of cached items.

#### Initializing the HTTP Client

When configuring the HTTPClient, only use the \`getClient\` method and other HTTPClient functions within the \`createRequest\` callback or any following callbacks.

Accessing the client before invoking service will yield \`null\`, resulting in service call failures.

#### Rate Limits and Circuit Breakers

Remember that cached requests still count toward your service's rate limits and circuit breaker configuration (and quota limits).

While caching helps reduce direct external requests, every time you call the service—whether through the cache or directly—it impacts your statistical limits. This could cause service disruptions if you exceed certain [thresholds](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/quota/html/API_Quotas.html#category_I/O%20and%20Network).

#### Monitoring Cached Requests

Monitoring cached requests is a crucial part of making sure that your caching mechanism is working. It's about "pressing the enable button" _**and**_ actively tracking its impact on your site's performance and usability.

## Conclusion

In conclusion, adding a caching mechanism to the LocalServiceRegistry for third-party services is a significant step towards boosting your performance and reducing operational costs. Even if the improvements are not always dramatic, every enhancement contributes to a smoother user experience.

Here's an example of a successful (anonymised) result from using this cache and rate limiting bot traffic:

[![A screenshot of a graph showing the results of third-party service improvements, including using Cloudflare and secondly adding caching.](https://www.rhino-inquisitor.com/wp-content/uploads/2024/11/third-party-service-caching-results-e1731261763486-1024x495.jpg)](https://www.rhino-inquisitor.com/wp-content/uploads/2024/11/third-party-service-caching-results-e1731261763486.jpg)

The number of requests handled by the API decreased considerably, leading to a lower monthly bill.

These improvements not only increased overall performance but also reduced costs on the third-party service, as each API call incurred a charge.
