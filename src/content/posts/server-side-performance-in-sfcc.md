---
title: Server-Side Performance Troubleshooting in SFCC
description: >-
  Performance is important for any eCommerce site. You need to make sure your
  content loads quickly and customers can start shopping!
date: '2023-05-01T05:50:49.000Z'
lastmod: '2025-07-29T12:37:49.000Z'
url: /server-side-performance-in-sfcc/
draft: false
heroImage: /media/2022/performance-8200eea3e8.jpeg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - performance
  - sfcc
  - technical
author: Thomas Theunen
---
All web developers understand the crucial role [performance](https://www.rhino-inquisitor.com/caching-rest-apis-in-sfcc/) plays for a website, both in terms of the visitor experience and as a quality benchmark. Not to forget, conserving CPU cycles contributes to environmental sustainability, albeit in small increments.

So, how can you maintain high performance on your pages within [Salesforce B2C Commerce Cloud](https://www.rhino-inquisitor.com/the-salesforce-b2c-commerce-cloud-environment/)? In this article, we'll focus on server-side implementation. Salesforce offers numerous tools to enhance and diagnose performance issues, and we'll explore a selection of these valuable resources!

## Write performant code

It may seem like an obvious point, but many developers tend to overlook the importance of considering performance while coding. It's common to get stuck on an issue for hours, finally, come up with a solution, and then feel hesitant to make any further changes to the code since it's working.

However, it's crucial to revisit the code and perform some refactoring. You may have inadvertently written loops or commands that consume precious milliseconds of processing time. As you review the code, ask yourself if every line of code is necessary and if better alternatives or out-of-the-box solutions are available.

## Use Custom Caches for heavy-duty processes

If you have never heard about Custom Caches, [time to read up](https://www.rhino-inquisitor.com/field-guide-to-custom-caches-in-sfcc/)!

Custom Caches can significantly enhance performance when you need to perform resource-intensive operations. Keep in mind that **Custom Caches are only suitable if the process's outcome remains constant**.

For instance, you can cache the retrieval of configuration values from an external service or store an access token instead of fetching a new one for every request. Or, if you need to calculate the average of a custom attribute for all the variants of a master product, storing the outcome in custom caches is more efficient than calculating it repeatedly.

There are some things to keep in mind with Custom Caches:

-   It is not site-specific, so include the site-id in the key. If you don't, you might have some unexpected results.
-   Caches in the application servers of the same instance are separated
-   The cache can be cleared automatically in a lot of different ways, so don't depend on cached values existing (replication, code activation, and time-based)
-   You can only store a maximum of 20MB of data in total
-   The cache is stored in memory and is not persisted
-   Custom Caches can be turned off in the Business Manager

## Don't forget page caching

![A diagram of a web server and a web server. Showing the request of a page being handled by the Web Server to determine whether a cached page should be returned or to let the Application Server do the generation.](/media/2022/b2c-page-caching-110c7fcba6.gif)

In simple terms, page caching stores the Application Server responses (HTML, JSON, XML, ...) in the Web Server. By doing this, the requests coming from the browser don't have to traverse the entire stack again to render the same content as before.

But how do you set this up? There are two ways:

-   [`<iscache>` tags](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/isml/b2c_iscache.html)
-   [SFRA Cache Middleware Functions](https://github.com/SalesforceCommerceCloud/storefront-reference-architecture/blob/master/cartridges/app_storefront_base/cartridge/scripts/middleware/cache.js)



I will not cover all of the details of what page caching offers. That deserves a dedicated blog post, as this can become quite the rabbit hole! And as luck would have it, [there is a blog post about it](https://medium.com/salesforce-architects/caching-in-salesforce-commerce-cloud-part-1-e49b5f3e1801) (and more)!

_[Here is a link](https://medium.com/salesforce-architects/caching-in-salesforce-commerce-cloud-part-2-cc2adc664a1) to part 2 of that same blog post for completeness._

## Performance Debugging

Oh no... a certain thing hit the fan, and the product detail pages suddenly slowed to a crawl! But at first glance, you have no clue what the issue is.

You did a code release before this happened but can't pinpoint the cause. Luckily there are some tools to help you out within the platform to do performance monitoring and debugging.

### Technical Reports

We have live data since we are in production, which means "[Reports & Dashboards](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/analytics/b2c_reports_and_dashboards.html)" are available! Part of those reports is not about sales, but about performance! Just what we need!

The [Technical Dashboard](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/analytics/b2c_technical_dashboard.html) (as it is called) gives us a great overview about:

-   Average Response Time
-   Cache Hit Ratio
-   Error Rates
-   Response Time Distribution

Looking at the list of data above, it makes sense to have a look at it!

[![A screenshot of the "Reports & Dashboards" with the "Average Response Time" graph depicting a significant performance degradation (doubling in milliseconds).](/media/2022/performance-dashboard-8a847df133.png)](/media/2022/performance-dashboard-8a847df133.png)

Reports & Dashboards

This dashboard lets you obtain the essential information regarding your cache performance for all endpoints, including Remote Includes. Clicking on a controller will reveal insights into the various sub-requests caused by the [Remote Include](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/ops_troubleshooting/b2c_understanding_remote_includes.html) mechanism.

This dashboard is an excellent starting point for identifying caching issues and controllers with extended runtimes. _The screenshot shows performance has decreased for the Product-Show controller over the past few days or weeks._

### Pipeline Profiler

_Don't be fooled by its name; it will profile more than pipelines!_

The second tool you should be grabbing ahold of is the [Pipeline Profiler](https://documentation.b2c.commercecloud.salesforce.com/DOC1/index.jsp?topic=%2Fcom.demandware.dochelp%2FLegacyDevDoc%2FAnalyzePerformancePipelineProfiler.html). It is easy to use, will give you a high-level overview of all of your pipeline/controller endpoints, and show you how much processing time it needs to do its thing.

![A screenshot of the Pipeline Profiler showing the Search-Show controller with two hits and its total processing time of 1023 milliseconds. Below the controller is the template performance, showing the searchResults.isml file.](/media/2022/pipeline-profiler-24fb681d34.png)

As you can see, the above screenshot shows a basic overview of the performance of a controller and the template (response) it renders. If the template uses local includes, you can see their processing time separately.

All of the [Remote Includes](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/ops_troubleshooting/b2c_understanding_remote_includes.html) you have done are within the list of controllers.

![A screenshot of the Pipeline Profiler showing a list of Remote Includes, with the "Tile-Show" controller marked with a red circle around it.](/media/2022/pipeline-profile-remote-includes-0e99481937.png)

The information you get is quite basic, but it will give you the first indication of pain points and where to start looking. You can do this on production, but preferably as a last resort.

You should be able to reproduce the issue in a different environment, such as development.

Cache This method only works for uncached endpoints if caching is enabled. Cached responses are not taken into account by the Pipeline Profiler!

### Code Profiler

Last but not least, the [Code Profiler](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/site_performance/b2c_using_code_profiler.html) provides you with detailed insights on run-time performance. You can control how detailed you want that information as it supports three modes: Production, Development and Extended.

![A screenshot of the Code Profiler with the activated "Extended Script Development Mode" setting. The screenshot includes an extensive list of functions and Javascript files executed in the server-side code.](/media/2022/salesforce-code-profiler-extended-eeb0fcbb69.png)

Looking at the screenshot above, you can understand why they call it "Extended Script Development Mode." You get fine-grained details about the performance of your code, including information on which line in what JavaScript file.

This tool is your final stop for performance issues.

Production Enabling the Extended Script Development Mode offers a deeper understanding of the script's internal run-time behaviour, supplementing the information provided by the Development Mode. However, using the Code Profiler in this mode may severely impact performance, and therefore, it's recommended to exercise caution while using it in production environments.

## What about the Composable Storefront?

Although the Pipeline Profiler isn't applicable in this scenario, you can still utilize the Technical Reports and Dashboards in conjunction with the Code Profiler.

### Reports & Dashboards

Within these reports are dedicated tabs for OCAPI and SCAPI performance!

[![A screenshot of the OCAPI / SCAPI Technical Reports and Dashboards showing the average response times and response distribution graphs.](/media/2023/ocapi-and-scapi-performance-reports-f411be08a3.jpg)](/media/2023/ocapi-and-scapi-performance-reports-f411be08a3.jpg)

OCAPI and SCAPI Performance Reports

### Code Profiler

This report includes all Custom Hooks implemented for SCAPI and OCAPI, providing you with the opportunity to analyze the performance impact of your API customizations.

## Conclusion

Server-side performance is a crucial factor in ensuring the success of any website, and B2C Commerce Cloud is no exception. In today's fast-paced digital world, users expect websites to load quickly and efficiently, and any delays or lags can result in a negative user experience. This can lead to a loss of potential customers and revenue for businesses.

A performance debugging flow could look like this:

1.  **Production**: Look at Reports and Dashboards (Technical Dashboard).
2.  **Development:** Run the Pipeline Profiler to see if you have similar results as on the dashboard.
3.  **Development:** Run the Code Profiler to look for the lines of code that cause the performance issue.
