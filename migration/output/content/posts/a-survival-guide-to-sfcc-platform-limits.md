---
title: >-
  The SFCC Quota Gauntlet: A Developer's Survival Guide to the Top Platform
  Limits
description: >-
  It is a scenario that haunts every e commerce developer: the 3 AM pager alert.
  The production site is down, shoppers are seeing the dreaded "general err...
date: '2025-11-24T12:41:24.000Z'
lastmod: '2025-12-01T08:10:09.000Z'
url: /a-survival-guide-to-sfcc-platform-limits/
draft: false
heroImage: /media/2025/b2c-commerce-cloud-quota-warnings-scaled-adc4dec7e9.jpeg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - quota
  - sfcc
  - technical
author: Thomas Theunen
---
It is a scenario that haunts every e-commerce developer: the 3 AM pager alert. The production site is down, shoppers are seeing the dreaded "general error page," and sales have come to a standstill. After a frantic dive into the logs, the culprit is revealed: a cryptic message about an "enforced quota violation". This is the moment every developer working on Salesforce B2C Commerce Cloud learns that, despite its power, the platform is a governed territory with strict rules.

These laws are known as quotas. They are not arbitrary punishments designed to frustrate developers. Instead, they are the platform's sophisticated immune system, a set of essential guardrails designed to ensure stability, performance, and fairness in a complex multi-tenant environment. Think of them as the zoning laws and building codes of a bustling digital metropolis. They prevent one tenant's poorly designed skyscraper from blocking the sun for everyone else, ensuring the shared infrastructure—memory, CPU, database resources—remains healthy and responsive for all.

For developers migrating from the Salesforce Core platform, it is tempting to equate these quotas with Apex Governor Limits. While the philosophy of resource protection is similar, the specifics are worlds apart. B2C Commerce has its own unique set of constraints—Object Quotas, API Quotas, and Script Timeouts—that demand a different mindset and a distinct set of architectural patterns. Understanding these is not optional; it is fundamental to survival.

This guide serves as a definitive map through that governed territory. It moves beyond the official documentation to provide the "in-the-trenches" wisdom needed to build robust, scalable, and, most importantly, quota-proof applications on B2C Commerce. It serves as a survival guide for navigating the platform's unspoken rules and leveraging constraints into a competitive advantage.

## The Monolith's Mandates: Top 10 Quotas for Every SFCC Developer

These are the foundational limits that every Salesforce B2C Commerce developer must internalize, whether they are maintaining a legacy SiteGenesis implementation, building on the modern Storefront Reference Architecture (SFRA), or managing the backend services for a headless storefront. These are the immutable laws of the land, and ignorance is no defense when an enforced quota brings a production instance to its knees. The following table provides a quick-reference cheat sheet for the most critical quotas to keep in mind during architecture, development, and code review.

## The Digital Hoarder's Downfall: Custom Objects (400,000 Limit)

**The Limit:** An instance can hold a maximum of 400,000 replicable (stageable) custom objects and a separate 400,000 non-replicable (non-stageable) custom objects.



**The Danger Zone:** This limit, while seemingly vast, is often threatened by insidious data accumulation. Common culprits include using custom objects to store transactional data, such as detailed integration logs or granular user interaction events, which rightfully belong in an external system of record.

Another frequent anti-pattern is the complete lack of data retention policies, allowing temporary data—such as tokens for password resets or abandoned cart information—to accumulate indefinitely until the limit is reached.



**The Fallout:** Once this enforced quota is hit, the consequences are severe. Any call to `dw.object.CustomObjectMgr.create()` will fail with an uncatchable exception. This means any feature relying on the creation of new custom objects, from saving a user's address preference to logging a critical integration failure, will cease to function. It is a systemic failure that can cripple significant portions of a site's custom functionality.



**The Pro Move:** The key to avoiding this downfall is architectural discipline and rigorous data hygiene.

-   **Be Ruthless with Data:** Before storing anything in a custom object, developers and architects must ask the critical question: "Is B2C Commerce the correct system of record for this data?". If the data originates from or is primarily used by another platform (like a CRM or Marketing Cloud), it should reside there.

-   **Mandate Cleanup:** No custom object intended for temporary storage should be created without a corresponding, regularly scheduled purge job. A clear data retention period must be defined and enforced as part of the development lifecycle for that feature.

-   **Extend, Don't Invent:** Before creating a new custom object type, developers should exhaust all possibilities of extending existing system objects with custom attributes. System objects are generally more performant and do not count against this specific quota.

Beyond the hard limit, there is a more subtle performance drag to consider. The documentation and best practices repeatedly warn that custom objects are not optimised for high-performance database access. This means that even when an instance is well below the 400,000 object ceiling, heavy reliance on custom objects for frequent read/write operations (e.g., a custom inventory system or a real-time logging mechanism) creates significant database churn. This churn leads to a gradual degradation of site performance—slower page loads, longer job execution times—that does not trigger a hard quota violation but insidiously damages the user experience and erodes site stability. The limit is a hard stop, but the performance penalty begins long before the wall is hit.

## The Blueprint Boundary: Object Type Definitions (300 Limit)

**The Limit:** An instance is [capped](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/quota/html/Object_Quotas.html) at a maximum of 300 total business object definitions. This count includes all the platform's built-in system object types, as well as any custom object types created by developers.



**The Danger Zone:** This limit is rarely a concern for typical, single-brand e-commerce sites. However, it can become a very real constraint for large, complex, multi-brand organisations operating on a single B2C Commerce instance. In such environments, numerous bespoke features, each potentially demanding its own custom data model, can quickly consume the available slots for new object types.

**The Fallout:** The consequence is absolute: the inability to create new custom object types. This effectively halts the development of any new feature that requires a distinct data structure, putting the brakes on innovation and business agility.

**The Pro Move:** This strategy is rooted in effective data modelling and long-term architectural planning. Developers should practice data consolidation, designing a single, well-structured custom object with multiple attributes to represent a feature's data, rather than creating a constellation of small, single-purpose object types. It is also good practice to regularly audit development and staging environments to remove unused custom object types that may have been created for proofs-of-concept or abandoned features, freeing up slots in the blueprint.

This limit imposes a hidden constraint on architectural freedom. While 300 types may seem generous, the platform's system objects already occupy a significant portion of that budget. This creates a strategic tension. A developer might be tempted to create a new custom object type to keep a feature's data cleanly isolated. However, in doing so, they consume a precious, non-renewable, instance-wide resource. This pressure forces architects to think about the long-term data model of the entire instance. A short-sighted decision to create a new object type for a minor feature today could prevent the development of a more critical, large-scale feature tomorrow. It encourages a pattern of extending existing objects, which, if not managed carefully, can lead to bloated objects with hundreds of attributes, creating their own set of maintenance challenges.

## The 5-Minute Fuse: Storefront Script Execution Timeout

PWA Kit / Headless If you're working with a Headless or Composable setup, refer to the official documentation, as different rules may apply to your situation!

**The Limit:** Any script running within a storefront request context, such as a controller or a script module it calls, has a [maximum execution time](https://developer.salesforce.com/docs/commerce/commerce-api/guide/timeout-troubleshoot.html) of 5 minutes (300,000 milliseconds).



**The Danger Zone:** This limit is typically breached by one of three culprits: highly complex, unoptimized calculations performed in real-time; synchronous calls to slow or unresponsive third-party services; or inefficient loops that iterate over massive datasets without proper optimisation.

**The Fallout:** The platform shows no mercy. A non-catchable `ScriptingTimeoutError` is thrown, the script is immediately aborted, and the user is presented with an error page. There is no opportunity for graceful recovery; the transaction is dead.

**The Pro Move:** Adhering to this limit requires a shift in thinking from synchronous to asynchronous processing.

-   **Offload to Jobs:** Any process that is not absolutely essential for the immediate, initial rendering of the page should be moved to an asynchronous job. This is the canonical pattern for tasks like order export, complex report generation, or large data synchronisations.

-   **Write Efficient Code:** This is a table-stakes requirement for any performance-conscious developer. Optimise loops by using efficient APIs like `seekable` iterators instead of loading entire large collections into memory. Cache the results of expensive or repeated operations within a single request.

-   **Use the Service Framework:** For all external API calls, the Service Framework is mandatory. It allows for the configuration of aggressive timeouts and circuit breakers, enabling the system to "fail fast" rather than waiting for a slow third-party service to consume the entire 5-minute budget.



A critical nuance is the interplay of different timeout contexts.

The [documentation](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-working-with-scripts.html) reveals a hierarchy of timeouts: 5 minutes for controllers, but a much stricter 30 seconds for contexts like OCAPI hooks or Page Designer scripts. The governing rule is that the timeout that ends earliest wins. This creates a crucial dependency chain. A controller might call a script module, which is then used within a hook. Even though the controller has a generous 5-minute budget, the hook's 30-second budget becomes the real, effective constraint for that piece of the execution. Developers cannot think about the 5-minute limit in isolation; they must consider the entire potential call stack of a script and design for the most restrictive timeout it might encounter.

## The Party Line: API HTTPClient Calls Per Page (16 Limit)

![A cartoon illustration of frustrated developers crowded around a single, old-fashioned telephone, with a sign above it that reads "16 API Calls Per Page," symbolizing a resource bottleneck.](/media/2025/the-api-party-line-53588b75f5.jpeg)

Remember old party lines? B2C Commerce's HTTPClient is similar. You only get 16 external API calls per request. If too many services try to "talk" at once, your page will throw an error. Plan your integrations wisely!

**The Limit:** A single storefront page request is permitted to make a maximum of 16 outbound calls using dw.net.HTTPClient.send(). The platform will log a warning starting at 10 calls.

**The Danger Zone:** This quota is a direct threat to "chatty" integrations. Pages that need to assemble data from numerous disparate microservices or third-party APIs are at high risk. A common scenario is a product detail page that attempts to fetch real-time shipping quotes, tax calculations, inventory levels from multiple warehouses, and personalised content, all through separate API calls.

**The Fallout:** An enforced quota violation will abruptly terminate the request, sending the user to an error page. The page they were trying to load will simply fail.

**The Pro Move:** Avoiding this limit requires a deliberate integration strategy that favours consolidation and caching over chattiness.

-   **API Aggregation:** When the external services are within the team's control, the best practice is to create an aggregation layer or a Backend-for-Frontend (BFF) service. This service can receive a single request from B2C Commerce, make multiple downstream calls itself, and return a consolidated data payload in one response.


-   **Aggressive Caching:** Responses from external systems that do not change on every request should be aggressively cached using B2C Commerce's custom cache framework. This avoids making a network call on every single page load for the same data.


-   **Switch to Data Feeds:** For data that does not require real-time updates (e.g., product specifications, warehouse inventory), the entire model should be transitioned from real-time API calls to scheduled data feed imports. Importing inventory levels every 15 minutes via a job is far more scalable and performant than hitting an inventory API on every product page view.

This limit of 16 calls is more than just a technical constraint; it is a powerful driving force for better architecture. It actively discourages a naive, chatty integration pattern where the storefront directly communicates with a fleet of microservices. This quota, especially when combined with the 5-minute script timeout, compels architects to adopt more robust and performant patterns, such as the API Gateway. The limit is not just about preventing resource exhaustion on the B2C Commerce side; it is about enforcing a more resilient and scalable integration architecture for the entire solution.

## The Overstuffed Cart: Product Line Items Per Basket (400 Limit)

**The Limit:** The total number of product line items that can be contained within a single basket is 400. This includes both independent products and any dependent items, such as those in a product bundle. A warning is logged when a basket reaches 200 items.

**The Danger Zone:** While most B2C shoppers will never approach this limit, it is a significant and common hurdle in B2B commerce scenarios. A business customer placing a replenishment order might need to purchase hundreds of unique SKUs in a single transaction. It can also appear in B2C contexts, such as with features like "quick order" forms or when a user attempts to add a very large wishlist to their cart at once.

**The Fallout:** The consequence is a direct blocker to conversion. The platform will prevent the user from adding any more items to their cart once the limit is reached. The API call to add the 401st item will fail, and without graceful error handling, the user will be left confused and unable to complete their purchase.

**The Pro Move:** Handling this limit requires different strategies for B2B and B2C.

-   **B2B Solutions:** For B2B use cases, a custom solution is often required. One approach is to build logic that automatically splits a large order into multiple, smaller baskets behind the scenes, presenting it to the user as a single order confirmation. Another is to guide the user through the UI to create several smaller orders.


-   **B2C Graceful Handling:** For B2C, the focus is on clear user feedback. When the cart approaches the limit, the UI should display a non-intrusive message. When the limit is hit, a clear, helpful error message should explain the situation: "Your shopping cart is full. To add more items, please proceed to checkout with your current selection or save items to a wishlist for later."



## The Promotion Paradox: Enabled Promotions (10,000 Limit)

**The Limit:** An instance can have a maximum of 10,000 promotions in an "enabled" state.6 It is critical to note that there is an even stricter, more performance-relevant limit of 1,000 _active_ promotions (enabled, assigned to a campaign, and currently within their run dates) at any given time.

**The Danger Zone:** This limit is typically threatened by large retailers with complex, overlapping, and long-running promotional strategies, compounded by a failure to perform basic data hygiene. Merchandising teams can create new promotions for every minor event without needing to revisit and clean up old or expired ones.

**The Fallout:** The primary risk here is not a hard error but a slow, creeping death of performance. The B2C Commerce promotion engine must evaluate all potentially applicable promotions during basket calculation. As the number of enabled—and especially active—promotions grows, this calculation becomes exponentially more complex. The result is a slowdown in the basket and checkout pipelines, which impacts the checkout experience for _all_ users, even those not using a promotion. Hitting the hard limit is rare, but the performance degradation begins far sooner.

**The Pro Move:** The solution is not technical but procedural: a strict "Promotion Lifecycle Management" process must be implemented. Business users and merchandisers must be trained and required to archive promotions as soon as their effective date range has passed. From a technical monitoring perspective, the "Number of Active Promotions" quota (1,000) should be treated as the more critical performance indicator. Any sustained approach toward this number should trigger an immediate review and cleanup of the active promotion landscape.

## The Unfurled Scroll: ISML Template Size (10MB Limit)

![A flat cartoon illustration showing a worried developer looking at a massive, unfurling scroll that represents an ISML template, with a prominent "10MB" warning sign indicating the file size limit.](/media/2025/isml-10-mb-limit-00017e3dfb.jpeg)

Like an ancient, endless scroll, an ISML template can grow beyond its bounds. Keep an eye on that 10MB file size limit, or your beautifully crafted template might just refuse to render, leaving you with nothing but a blank page.

**The Limit:** The final, rendered HTML output generated by an ISML template cannot exceed 10MB in size.

**The Danger Zone:** This limit is most commonly encountered on pages that render huge loops of data, such as a "view all" category page that attempts to display thousands of product tiles without any form of pagination. Another culprit can be content slots that have been bloated with excessive, unoptimized, or copy-pasted HTML from a WYSIWYG editor.

**The Fallout:** The platform throws a Page size limit of 10 MB exceeded exception, and the entire page processing request is cancelled. The user sees an error page.

**The Pro Move:** This limit enforces fundamental web performance best practices.

-   **Pagination is Not Optional:** All product listing pages, search result pages, and any other page that displays a potentially large list of items must implement robust and user-friendly pagination. The "Infinite scroll" feature can be utilised, but it must be implemented intelligently with asynchronous calls to fetch subsequent pages of data.


-   **Lazy Loading:** For content that is "below the fold" (not immediately visible to the user), use lazy loading techniques to defer the loading of that content until the user scrolls down.



**Keep Logic Out of ISML:** ISML templates should be used solely for presentation logic. All complex data preparation, filtering, and business logic should be handled in controller or script module files before being passed to the template. This keeps templates clean, small, and focused on rendering.

## The Tiny Backpack: Session Size (10KB Limit)

**The Limit:** The total serialized size of all data stored in the dw.system.Session object is limited to 10KB. Furthermore, individual strings stored within the session are capped at 2,000 characters.

**The Danger Zone:** The most common anti-pattern that leads to violating this quota is storing large, complex objects or entire collections of data in the session. A classic mistake is to perform a product search, store the entire result set of Product objects in the session, and then attempt to read from it on the next page for rendering.

**The Fallout:** Exceeding the limit can lead to unpredictable behaviour, including data truncation or runtime exceptions.

**The Pro Move:** The session should be treated as a tiny, temporary backpack, not a storage warehouse.

-   **Store Identifiers, Not Objects:** The correct pattern is to store only small, primitive identifiers in the session, such as productID, customerNo, or orderID. The full objects should be re-fetched from the database or, preferably, from a cache when they are needed on a subsequent page.

-   **Use session.privacy:** For data that is specific to a user's logged-in session and should be cleared upon logout (like temporary preferences), use the session.privacy custom attributes. The platform automatically handles the cleanup of this data.


## The Ten Commandments of Creation: API Custom Object Creation Per Page (10 Limit)

**The Limit:** A maximum of 10 custom objects can be created within a single storefront page request through the dw.object.CustomObjectMgr.create() API call.

**The Danger Zone:** This quota is often hit by custom forms that create multiple, separate custom object records upon submission. For example, a complex user survey with ten questions where each answer is saved as an individual custom object record would hit the limit. Another common cause is a custom logging implementation that attempts to create a new custom object for every minor event that occurs during a single page view.

**The Fallout:** This is an enforced quota. The 11th call to create() will fail, the request will be stopped, and the user will see an error. If they were submitting a form, all the data they entered would be lost, leading to a highly frustrating experience.

**The Pro Move:** The key is to consolidate data. Instead of creating many small objects, developers should batch the data into a single, larger, and more structured custom object. For the survey example, all ten answers should be collected and stored as a single JSON string within a single attribute of a custom object. For logging, a third-party logging service should be used, or logs should be buffered and sent asynchronously to avoid impacting the user-facing request.

## The Read-Only Rule: File I/O in Storefront (0 Limit)

**The Limit:** Nearly all file writing and manipulation methods in the dw.io.File and dw.io.FileWriter classes have a strict storefront limit of zero. This includes File.createNewFile(), FileWriter(), File.zip(), and others.

**The Danger Zone:** This is a trap for developers new to the platform who might attempt to dynamically generate a file—such as a custom PDF invoice or a CSV export of user data—and serve it for download directly from a storefront controller request.

**The Fallout:** This is a non-negotiable architectural constraint. The code will work perfectly in a sandbox job context but will fail with a hard, enforced quota violation in a production storefront request. It is a guaranteed failure.

**The Pro Move:** Any form of dynamic file generation must happen in an asynchronous job context. The canonical pattern is as follows:

1.  A user on a storefront page clicks a button to request a file (e.g., "Download My Order History").
2.  The storefront controller does not generate the file. Instead, it creates a "token" custom object with a status of "pending" and triggers a job, passing the ID of this token object as a parameter.
3.  The user's page receives a confirmation and begins to poll a separate, lightweight controller every few seconds, checking the status of the token object. The job executes in the background. It performs the heavy lifting of querying the data and generating the file, which it then saves to a temporary location in the WebDAV impex or temp directory. Once complete, the job updates the token custom object's status to "complete" and adds the path to the generated file.
4.  The polling mechanism on the user's page sees the "complete" status, retrieves the file path, and presents the user with a direct download link to the file in WebDAV.
5.  Clean up your custom objects! Remember 😇



## The Headless Frontier: A PWA Kit & SCAPI Hit List

Transitioning to a headless architecture with the PWA Kit and the Salesforce Commerce API (SCAPI) represents a fundamental paradigm shift. The performance battleground moves away from the server-side rendering of ISML templates and into the realm of API response times, network latency, and the efficiency of the client-side JavaScript application. In this world, the browser is no longer a thin client rendering HTML; it is a rich application responsible for its own state management, routing, and data fetching. The quotas and limits that matter most are less about single, monolithic server requests and more about the rate, size, and efficiency of the constant communication between the client and a constellation of API endpoints.

![A cartoon astronaut developer floating in digital space and interacting with a detached user interface, representing the concept of headless commerce. The background features constellations of API icons.](/media/2025/the-headless-frontier-ae21ed3f28.jpeg)

Welcome to the headless frontier. Here, developers are like astronauts, decoupling the front-end "head" to explore new user experiences, all powered by a universe of back-end APIs and services.

## The Bouncer at the Door: SCAPI & OCI Rate Limits (HTTP 429)

**The Limit:** Unlike the hard-and-fast quotas of the monolith, SCAPI operates on a system of rate limiting and load shedding. There is not one single number to watch. Instead, when the platform determines that a client is making too many requests in a given timeframe, it will respond with an `HTTP 429 Too Many Requests` status code. Specific, high-volume API families, like Omnichannel Inventory (OCI), have very granular, published rate limits. For instance, the `get-availability` endpoint can handle a massive 10,000 requests every 10 seconds, while the `imports` endpoint is limited to just 2 requests per 10 seconds.



**The Danger Zone:** The primary risk factor is a high-traffic site with poorly implemented or non-existent caching for API responses. A classic example is a product list page (PLP) in a PWA Kit application where, for every user, the browser makes individual, uncached calls to the Shopper Products and OCI Availability APIs for every single product tile visible on the page. During a sales event, this can quickly overwhelm the rate limits.

**The Fallout:** The API client—the PWA Kit application running in the user's browser—gets throttled. If the client-side code is not built to handle the 429 response gracefully, the UI will simply fail to load the required data. Users will see endless loading spinners, empty components, or jarring error messages, resulting in a broken and untrustworthy user experience.

**The Pro Move:** Resilience is the name of the game.

-   **Honor `Retry-After`:** The 429 response is often accompanied by a `Retry-After` header, which specifies the number of seconds the client should wait before attempting to reconnect. Client-side code _must_ be built to respect this header. The best practice is to implement an exponential backoff strategy, where the delay between retries increases with each subsequent failure, thereby preventing a "thundering herd" of retries from exacerbating the problem.

-   **Embrace Client-Side Caching:** Modern libraries like React Query, which is a standard part of the PWA Kit, are essential. They provide sophisticated client-side caching, automatically preventing the application from making redundant API calls for data that it has recently fetched and that has not yet been invalidated.

-   **Leverage CDN Caching for APIs:** For API endpoints that return public, non-personalised data (e.g., product details for a guest user), the PWA Kit's Managed Runtime proxy can be configured to cache the API JSON response at the CDN edge. This is achieved by changing the request path prefix from `/proxy/` to `/caching/`.



This shift to rate-limiting signals a profound change in responsibility. In a traditional SFRA architecture, the server owns the execution and is responsible for handling errors that may occur. If a quota is hit, the server throws a fatal exception. In the headless SCAPI world, the platform simply puts its hand up and says "no more for now" with a 429 code. The responsibility for handling this rejection and maintaining a coherent, resilient user experience shifts almost entirely to the client-side application. Headless development is not just about a different frontend technology; it requires a more sophisticated level of client-side engineering, with a deep understanding of state management, asynchronous error handling, and fault-tolerance patterns.

## The Gatekeeper's Toll: SLAS Rate Limits

**The Limit:** The Shopper Login and API Access Service (SLAS), which governs all authentication and authorisation for Shopper APIs, has its own distinct, high-level rate limits: 24,000 requests per minute (RPM) for production tenants and 500 RPM for non-production tenants.



**The Danger Zone:** The most common way to violate this limit is with a poorly configured client application that requests a new guest user token on every single API call, rather than caching and reusing the token it has already received.

**The Fallout:** Authentication fails. Guest shoppers are unable to obtain the necessary JWT to perform actions such as adding items to a cart, and registered users are unable to log in or refresh their sessions. Essentially, all authenticated or basket-related e-commerce functionality grinds to a halt.

**The Pro Move:** Token management is paramount.

-   **Token Caching is Mandatory:** A standard SLAS JWT is valid for 30 minutes. The client application must be designed to cache this token (e.g., in browser local storage) and include it in the `Authorization` header of all subsequent API calls. A new token should only be requested when the current one does not exist or is nearing its expiration time.


-   **Master the Refresh Token Flow:** For registered users, the client should use the provided refresh token to obtain a new access token in the background seamlessly, without requiring the user to re-authenticate. Developers should be aware of the latest security enhancements, such as mandatory refresh token rotation, which prohibits the reuse of a refresh token after it has been used once.


## The 30-Second Lifeline: PWA Kit Managed Runtime Proxy Timeout

**The Limit:** Any request that is proxied through the PWA Kit's Managed Runtime to an external, third-party API is subject to a hard, non-configurable timeout of 30 seconds.



**The Danger Zone:** This becomes a problem when using the proxy to make a synchronous call to a system known for slow response times. This could be a legacy ERP system for a complex price lookup or a third-party service that provides real-time, computationally intensive freight shipping calculations.

**The Fallout:** If the origin server does not respond within 30 seconds, the Managed Runtime will terminate the connection and return an `HTTP 504 Gateway Timeout` error to the client application. This happens regardless of whether the origin server is still processing the request. From the user's perspective, the operation has failed.

**The Pro Move:** This is a firm architectural boundary. If a service cannot guarantee a response in under 30 seconds, it cannot be called synchronously during a user-facing interaction that flows through the proxy. The solution is to adopt the same asynchronous, polling-based pattern used for file generation in the monolith: trigger a background process via a quick API call, and have the client poll a separate endpoint for the result.

## The Hook's Handcuffs: OCAPI Hook Script Timeout

Custom Timeouts Timeouts for STANDARD API endpoints can be [overridden](https://developer.salesforce.com/docs/commerce/commerce-api/references/timeouts?meta=Summary), but not for custom ones.

**The Limit:** While SCAPI is the future, many implementations still use OCAPI, especially during a phased migration. Scripts executed within OCAPI hooks (e.g., `dw.ocapi.shop.basket.beforePOST`, `afterPOST`) are constrained by a very tight 30-second execution timeout.



**The Danger Zone:** It is a common temptation for teams migrating from SFRA to lift heavy business logic from their old controllers and drop it directly into an OCAPI hook to modify API behaviour. This could include complex custom price adjustments, intricate promotion applications, or calls to multiple external systems.

**The Fallout:** If the script in the hook exceeds the 30-second limit, the entire OCAPI API call fails, typically returning a generic 500 error to the client. The hook's logic is aborted mid-execution, which carries the additional risk of leaving data in an inconsistent state.

**The Pro Move:** Hooks must be treated with extreme prejudice. They should be kept as lightweight as possible, used only for minor data modifications, simple validations, or setting a value. Any process that involves significant computation, database lookups, or external network calls should be moved out of the hook and into a separate, dedicated custom API endpoint that can be called asynchronously by the client or handled by a backend job.

## The Two-Tier System: Custom API Constraints

**The Limit:** The Custom APIs framework, which allows developers to extend SCAPI with their own endpoints, is built on a fundamental two-tier system: "Shopper" endpoints and "Admin" endpoints. Shopper endpoints are designed for high-scale, low-latency, user-facing interactions and are therefore subject to stricter, unpublished limits on execution runtime and request/response body size. They must be associated with a `siteId` and are secured using SLAS tokens. Admin endpoints, by contrast, are more permissive but require authentication via Account Manager OAuth and are intended for backend or administrative tasks.



**The Danger Zone:** The primary mistake is attempting to perform a data-intensive or long-running operation through a Shopper-scoped Custom API. This might include a user-triggered request to generate a large, custom data export or a complex calculation over a customer's entire order history.

**The Fallout:** The request will likely encounter an uncatchable platform timeout or resource limit, resulting in the operation failing for the user.

**The Pro Move:** The architecture of any custom API must be designed with this split in mind from day one.

-   **Shopper Endpoints:** Utilise for high-frequency, low-latency operations integral to the core user journey (e.g., retrieving a custom piece of data for the product page).

-   **Admin Endpoints:** Use for heavy, backend processes or administrative functions that might be called by a custom Business Manager module, an external system, or an asynchronous job (e.g., triggering a bulk data synchronisation).


## The Ghost in the Machine: dw.system.Session in a Headless World

**The Limit:** This is not a formal quota but a critical architectural anti-pattern. The `dw.system.Session` object is a construct of the B2C Commerce server-side web tier. In a pure, stateless SCAPI architecture, there is no server session. However, in hybrid architectures or during a phased migration from SFRA, developers may be tempted to use OCAPI session bridging or pass the `dwsid` session cookie in custom headers to SCAPI calls to maintain a semblance of the old session-based state.



**The Danger Zone:** Relying on the server-side session to manage state in an application that is supposed to be headless. This creates a tight, brittle coupling to the old monolithic architecture, negating many of the benefits of going headless, such as the independent scaling and deployment of the frontend. It is a recipe for bizarre and hard-to-debug caching and state management bugs.

**The Fallout:** Unpredictable behaviour is the main outcome. A user's state may seem to vanish and then reappear, as subsequent API requests are load-balanced to different server nodes in the B2C Commerce grid, some of which may not yet have the user's session data replicated. Caching at the CDN level becomes nearly impossible, as every request is uniquely personalised by the presence of the `dwsid` cookie.

**The Pro Move:** The server session must be avoided at all costs in a headless build. State management is the responsibility of the client application, utilising tools such as React's built-in state and context APIs or more advanced libraries like Redux. State should be persisted by making explicit API calls, for example, saving the user's cart contents via the Shopper Baskets API. For personalisation, the modern, stateless approach is to use the `Shopper Context API`, which allows context (like customer group or source code) to be passed directly in the API call itself, influencing the response without relying on a sticky server session.

## Conclusion: From Quota-Fearing to Quota-Fluent

The extensive landscape of quotas and limits within Salesforce B2C Commerce Cloud should not be viewed as a field of landmines for developers. Instead, these constraints are a design partner, a set of rules that, when understood and respected, guide the development of applications that are inherently more performant, stable, and scalable.

The most successful B2C Commerce developers are not those who discover clever workarounds to circumvent limits—a path that inevitably leads to performance bottlenecks, maintenance nightmares, and platform instability. The true experts are those who architect their solutions to thrive within these boundaries. A quota-fluent developer internalises these limits and uses them as a lens through which they evaluate every technical decision. They write efficient code, choose the right tool for the job (a real-time API versus an asynchronous job), cache intelligently at every layer, and have a deep understanding of the unique constraints of their chosen architecture, whether it's a traditional monolith or a modern headless application.



The path to this fluency begins with proactive monitoring. The Quota Status dashboard in Business Manager should be a regular destination, not just a reactive tool used during an outage. Every `WARN` level message in the quota logs should be treated as a valuable, early signal—an opportunity to refactor, optimise, and improve before a minor inefficiency becomes a major production incident. By embracing these limits as a core part of the development process, teams can transition from being quota-fearing to quota-fluent —a critical step in mastering the art of building elite e-commerce experiences on the Salesforce platform.
