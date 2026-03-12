---
title: SLAS Session Sync in SFRA and SiteGenesis
description: >-
  SLAS (Shopper Login And API Access Service) is one of the headless APIs made
  available by Salesforce. But how can we use it in SFRA?
date: '2025-07-24T20:52:39.000Z'
lastmod: '2025-07-25T06:41:00.000Z'
url: /slas-in-sfra-or-sitegenesis/
draft: false
heroImage: /wp-content/uploads/2022/03/slas.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - api
  - headless
  - sfcc
author: Thomas Theunen
---
Headless APIs have been available in Salesforce B2C Commerce Cloud for some time, under the "[OCAPI (Open Commerce API](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-commerce-ocapi/get-started-with-ocapi.html).)." In 2020, a new set of APIs, known as the SCAPI (Salesforce Commerce API), was introduced.

Within that new set of APIs, a subset was focused on giving developers complete control of the login process of customers, called [SLAS](https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-login?meta=Summary) (Shopper Login And API Access Service). In February 2022, Salesforce also released a [cartridge](https://github.com/SalesforceCommerceCloud/plugin_slas) for SFRA, enabling easy incorporation of SLAS within your current setup.

But let's cut to the chase. The `plugin_slas` cartridge (which we will discuss later in the article) was a necessary bridge for its time, but it also introduced performance bottlenecks, API quota concerns, and maintenance headaches.
With the release of native [Hybrid Authentication](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/hybrid-auth.html), Salesforce has fundamentally changed the game for hybrid SFRA/Composable storefronts. This guide is your in-depth exploration of the "why" and "how"—we'll dissect the architectural shift and equip you with the strategic insights you need.

## What is SLAS

![A diagram showing the different steps of the SLAS process.](/media/2022/slas-diagram-9890f180b6.png)

But what is SLAS, anywho? It is a set of APIs that allows secure access to Commerce Cloud shopper APIs for headless applications.

Some use-cases:

- **Single Sign-On:** Allow your customers to use a single set of log-ins across multiple environments (Commerce Cloud vs. a Community Portal)

- **Third-Party Identity Providers:** Use third-party services that support [OpenID](https://openid.net/) like Facebook or Google.

## Why use SLAS

Looking at the above, you might think: "But can't I already do these things with SFRA and SiteGenesis?"

In a way, you're right. These login types are already supported in the current system. However, they can't be used across other applications, such as Endless Aisle, kiosks, or mobile apps, without additional development. You will need to create custom solutions for each case.

SLAS is a headless API that can be used by all your channels, whether they are Commerce Cloud or not.

### Longer log-in time

People familiar with Salesforce B2C Commerce Cloud know that the storefront logs you out after 30 minutes of inactivity. Many projects have requested a longer session, especially during checkout, as this can be particularly frustrating.

Previously, extending this timeout wasn't possible. Now, with SLAS, you can increase it up to 90 days! Yes, you read correctly—a significant three-month extension compared to previous options!

## The Old Guard: A Necessary Evil Called plugin\_slas

To understand where we're going, we have to respect where we've been. When Salesforce B2C Commerce Cloud began its push into the headless and composable world with the [PWA Kit](https://www.rhino-inquisitor.com/sitegenesis-vs-sfra-vs-pwa/), a significant architectural gap emerged.

The traditional monoliths, Storefront Reference Architecture (SFRA) and SiteGenesis, managed user sessions using a dwsid cookie. The new headless paradigm, however, operates on a completely different authentication mechanism: the Shopper Login and API Access Service (SLAS), which utilises JSON Web Tokens (JWTs).

For any business looking to adopt a hybrid model—keeping parts of their site on SFRA while building new experiences with the PWA Kit—this created a jarring disconnect. How could a shopper's session possibly persist across these two disparate worlds?

### The Problem It Solved: A Bridge Over Troubled Waters

Salesforce's answer, released in February 2022, was the `plugin_slas` cartridge. It was designed as a plug-and-play solution for SFRA that intercepted the standard login process. Instead of relying on the traditional `dw.system.Session` script API calls for authentication, the cartridge rerouted these flows through SLAS. This clever maneuver effectively "bridged" the two authentication systems, allowing a shopper to navigate from a PWA Kit page to an SFRA checkout page without losing their session or their basket.

For its time, the cartridge was a critical enabler. It unlocked the possibility of hybrid deployments and introduced powerful SLAS features to the monolithic SFRA world, such as integration with third-party Identity Providers (IDPs) like Google and Facebook, as well as the much-requested ability to extend shopper login times from a paltry 30 minutes to a substantial 90 days.

### The Scars It Left: The True Cost of the Cartridge

While the `plugin_slas` cartridge solved an immediate and pressing problem, it came at a significant technical cost. Developers on the front lines quickly discovered the operational friction and performance penalties baked into its design.

- **The Performance Tax:** The cartridge introduced three to four remote API calls during login and registration. These weren't mere internal functions; they involved network-heavy SCAPI and OCAPI calls used for session bridging. This design resulted in noticeable latency during the crucial authentication phase. Every login, registration, and session refresh experienced this delay, impacting user experience.

- **The API Quota Black Hole:** This was perhaps the most challenging issue for development teams, especially when the quota limit was still 8 - this is now 16, luckily. B2C Commerce enforces strict API quotas that cap the number of API calls per storefront request. The plugin\_slas cartridge could consume four, and in some registration cases, even five API calls just to log in a user.

    Using nearly half of the API limit for authentication alone was a risky strategy. This heavily restricted other vital operations, such as retrieving product information, checking inventory, or applying promotions, all within the same request. It led to constant stress and compelled developers to create complex, fragile workarounds.

-

    **The Maintenance Quagmire:** As a cartridge, `plugin_slas` was yet another piece of critical code that teams had to install, configure, update, and regression test. When Salesforce released bug fixes or security patches for the cartridge, it required a full deployment cycle to get them into production. This added operational overhead and introduced another potential point of failure in the authentication path, a path that demands maximum stability and security. The cartridge was a tactical patch on a strategic problem, and its very architecture—an external add-on making remote calls back to the platform—was the root cause of its limitations.

## The New Sheriff in Town: Platform-Native Hybrid Authentication

![A classic-style robot labeled "plugin_slas cartridge" hands a glowing purple key to a sleek, modern robot labeled "Hybrid Authentication." They are standing on a path leading from a quaint town labeled "SFRA" to a futuristic city skyline, under a bright, sunny sky.](/media/2025/plugin-slas-to-hybrid-authentication-359f0381b0.jpg)

The transition to the future of authentication, as the classic "plugin\_slas cartridge" passes the key to newest "Hybrid Authentication."

Recognising the limitations of the cartridge-based approach, Salesforce went back to the drawing board and engineered a proper, strategic solution. Released with B2C Commerce version [25.3](https://developer.salesforce.com/docs/commerce/commerce-api/references/about-commerce-api/about.html#03112025), Hybrid Authentication is not merely an update; it is a fundamental architectural evolution.

### What is Hybrid Auth, Really? It's Not Just a Cartridge-ectomy

Feature Support Matrix When migrating to Hybrid Auth, be sure to check the [Hybrid Auth Feature Support Matrix](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/hybrid-auth.html#hybrid-auth-feature-support-matrix) to ensure that all required features for your project are supported at this time.

Hybrid Authentication is best understood as a **platform-level session synchronisation engine**. It completely replaces the `plugin_slas` cartridge by moving the entire logic of keeping the SFRA/SiteGenesis `dwsid` and the headless SLAS JWT is synced directly into the core B2C Commerce platform.

This isn't a patch or a workaround; it's a native feature. The complex dance of bridging sessions is no longer the responsibility of a fragile, API-hungry cartridge but is now handled automatically and efficiently by the platform itself.

### The Promised Land: Core Benefits of Going Native

For developers and architects, migrating to Hybrid Auth translates into tangible, immediate benefits that directly address the pain points of the past.

- **Platform-Native Data Synchronisation:** The session bridging process is now an intrinsic part of the platform's authentication flow. This means no more writing, debugging, or maintaining custom session bridging code. It simply works out of the box, managed and maintained by Salesforce.

- **A Seamless Shopper Experience:** By eliminating the clunky, multi-call process of the old cartridge, the platform ensures that session state is synchronised far more reliably and with significantly less latency. The nightmare scenario of a shopper losing their session or basket when moving between a PWA Kit page and an SFRA page is effectively neutralised. This seamlessness extends beyond just the session, automatically synchronising Shopper Context data and "Do Not Track" (DNT) preferences between the two environments.

- **Full Support for All Templates:** Hybrid Authentication is a first-class citizen for both SFRA and, crucially, the older SiteGenesis architecture. This provides a fully supported, productized, and stable path toward a composable future for all B2C Commerce customers, regardless of their current storefront template.

### Is The Promised Land Free of Danger

As with any new feature or solution, early adoption often means less community support initially, and you may encounter unique issues as one of the first partners or customers.

Therefore, it’s essential to review all available documentation and thoroughly test various scenarios in testing environments, such as a sandbox or development environment, before deploying to production.

## Hardening Your Security Posture for 2025 and Beyond

The security landscape for web authentication is constantly evolving. The migration to Hybrid Auth presents a perfect opportunity to not only simplify your architecture but also to modernise your security posture and ensure compliance with the latest standards.

### The 90-Day Session: A Convenience or a Liability

While this extended duration is highly convenient for users on trusted personal devices, such as mobile apps, it remains a significant security liability on shared or public computers. If a user authenticates on a library computer, their account and personal data could be exposed for up to three months.

The power to configure this timeout lies within your SLAS client's token policy. It is strongly recommended that development, security, and legal teams collaborate to define a session duration that strikes an appropriate balance between user convenience and risk. For most web-based storefronts, a much shorter duration, such as 1 to 7 days, is a more prudent and secure choice.

### Modern SLAS Security Mandates You Can't Ignore

Since the `plugin_slas` cartridge was first introduced, Salesforce has [rolled out several security enhancements](https://developer.salesforce.com/docs/commerce/commerce-api/references/about-commerce-api/about.html) that are now effectively mandatory. Failing to address them during your migration will result in a broken or insecure implementation.

- **Enforcing Refresh Token Rotation:** This is a major change, aligning with the OAuth 2.1 security specification. For public clients, which include most PWA Kit storefronts, SLAS now**prohibits the reuse of a refresh token**. When an application uses a refresh token to get a new access token, the response will contain a _new_ refresh token. The application must store and use this new refresh token for subsequent refreshes. Attempting to reuse an old refresh token will result in a `400 'Invalid Refresh Token'` error. The `plugin_slas` cartridge had to be updated to version 7.4.1 to support this, and any custom headless frontend must be updated to handle this rotation logic.

- **Stricter Realm Validation:** To enhance security and prevent misconfiguration, SCAPI requests now undergo stricter validation to ensure the realm ID in the request matches the assigned short code for that realm. A mismatch will result in a `404 Not Found` error.

- **Choosing the Right Client: Public vs. Private:** The fundamental rule of OAuth 2.0 remains paramount. If your application cannot guarantee the confidentiality of a client secret (e.g., a client-side single-page application or a native mobile app), you**must** use a public client. If the secret can be securely stored on a server (e.g., in a traditional web app or a Backend-for-Frontend architecture), you should use a private client.

Because the migration to Hybrid Auth requires touching authentication code on both the SFCC backend and the headless frontend, it is the ideal and necessary time to conduct a full security audit. The migration project's scope must include updating your implementation to meet these new, stricter standards.

## Conclusion: Be the Rhino, Not the Dodo

Migrating from the `plugin_slas` cartridge to native Hybrid Authentication is not just a simple version bump or a minor refactor; it is a strategic architectural upgrade. It's an opportunity to pay down significant technical debt, reclaim lost performance, eliminate API quota anxiety, and dramatically simplify your hybrid architecture.

This shift is a clear signal of Salesforce's commitment to making the composable and hybrid developer experience more robust, stable, and platform-native. By embracing foundational platform features, such as Hybrid Authentication, over temporary, bolt-on cartridges, you are actively future-proofing your implementation and aligning with the platform's strategic direction. Don't let your hybrid architecture become a relic held together by legacy code.

Be the rhino: charge head-first through the complexity and build on the stronger foundation the platform now provides.
