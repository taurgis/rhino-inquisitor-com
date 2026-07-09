---
title: Secure Coding in Salesforce B2C Commerce Cloud
description: >-
  Security within Salesforce B2C Commerce might not be a concern because of
  out-of-the-box features. There are a few things to keep in mind!
date: '2022-04-26T12:09:00.000Z'
lastmod: '2026-07-04T17:47:13.000Z'
url: /secure-coding-in-salesforce-b2c-commerce-cloud/
draft: false
heroImage: code-security-147ad97b77.jpeg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - security
  - sfcc
  - technical
author: Thomas Theunen
takeaways:
  - "Explains the secure-coding responsibilities that remain even though SFCC provides strong platform-level protections"
  - "Covers practical security topics like Account Manager hardening, shared-account risks, secure headers, and npm supply-chain concerns"
  - "Points developers towards Salesforce's built-in security guidance and the specific areas that require ongoing discipline"
---
Salesforce B2C Commerce Cloud provides many security features out of the box. And because it is a [SaaS](https://en.wikipedia.org/wiki/Software_as_a_service) solution, the security of the servers is handled by the technical teams at Salesforce.

That doesn't mean that you can just lay back and do your thing without worrying about security. So let's look at what you need to keep in mind when developing for B2C Commerce Cloud.

## Account Manager Security

One of the most significant changes in Salesforce B2C Commerce Cloud is removing "local users" from the environments. Access to sandboxes and PIG (Primary Instance Group) instances passes through Account Manager and its security features.

This has brought up many discussions about sharing accounts over the past year (more on the core platform than on SFCC).

You might think it strange that the first topic is securing your account. But if someone has access, they can upload malicious code or download sensitive data with little effort.

### Single account to rule them all

The main advantage (from my perspective) is that you now have one account to log in to many different environments (and across realms).

But this comes at a price.

If an account becomes compromised, especially Account Managers, someone can get access to many different environments in one swing.

Salesforce [made MFA mandatory](https://help.salesforce.com/s/articleView?id=commerce.rn_b2c_mfa_enforcement_je.htm&language=en_US&type=5) for interactive B2C Commerce logins in May 2022 to mitigate this threat, after recommending it for about a year beforehand.

### MFA (Multi-Factor Authentication)

{{< img-caption src="mfa-1-6649345f2c.jpg" alt="Account Manager multi-factor authentication setup screen." caption="Account Manager MFA setup" >}}

With Account Manager, it is possible to add MFA to your account to secure it. Even if someone manages to figure out your account password, they still need to be able to provide the secondary authentication method.

For many people, having to put [Salesforce Authenticator](https://play.google.com/store/apps/details?id=com.salesforce.authenticator) into the log-in procedure wasn't the best experience at first, though it has improved considerably since.

There are different options possible with Account Manager:

- Salesforce Authenticator (Application)
- [Security Key](https://www.yubico.com/) (Physical Device)
- [TOTP](https://en.wikipedia.org/wiki/Time-based_one-time_password) (Time-based one-time password) application
- [Salesforce Identity](https://help.salesforce.com/s/articleView?id=sf.who_is_salesforce_identity_for.htm&type=5) ([Documentation](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_account_manager_link_account_to_salesforce_identity_sso.htm))

I decided to make logging in a bit more manageable by building "[Automaton](https://chromewebstore.google.com/detail/automaton-account-manager/clbadmmkinhmiblhkkiiabbbcpljohob)," a browser (Chromium) extension that acts as a TOTP generator for Account Manager. It's still maintained — the last update shipped in July 2024 — and automatically fills in your username, password, and one-time code once you've unlocked it with a "Vault Password," so having access to your laptop alone isn't enough to log in. Run into a problem? The [support repo](https://github.com/taurgis/automaton/issues) is the place to report it.

It may seem like an inconvenience that costs you time over the day. But think of what could happen if someone takes over your account and can access all of the Salesforce B2C Commerce Cloud environments linked to your account.

### Shared Accounts

Sharing accounts is something that Salesforce does not advise (for a good reason), but there are still use-cases where this necessary evil is needed.

Some use-cases where this might be necessary:

- An integration user
- ... no, that is about it for SFCC

You do not have to log in to the business manager as an integration user in most cases. But if it happens, usually more than one person needs to be able to do this (leave, sickness, ... )

So think of secure ways to share your MFA (usually TOTP for shared accounts). A good solution I found so far is [1password](https://support.1password.com/one-time-passwords/) which supports TOTP.

## Cloudflare

You might think that all of Salesforce's built-in services will keep you safe from bad actors. They block a lot of traffic with bad intentions, but they can't stop everything.

The eCDN in front of your storefront is [Cloudflare](https://www.cloudflare.com/) — Salesforce controls most of the configuration, but leaves a handful of switches for you to flip in Business Manager, covering things like the WAF, TLS, and compression settings. I go into that setup in detail in [Let's Go Live: Setting Up the eCDN](/lets-go-live-ecdn/); the [Infocenter](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_embedded_cdn_overview.htm) has the official overview.

## Security Best Practices

Lucky for me (and you), Salesforce has already written quite a few guidelines on Security Best Practices for Developers.

On the [Salesforce Commerce Cloud Infocenter](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_security_best_practices_for_developers.htm), there is a lot of information already documented about different types of attacks and how to mitigate them:

- [Encryption and Cryptography](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_encryption_and_cryptography.htm)
- [Cross-Site Scripting](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_cross_site_scripting.htm)
- [Declarative Security via HTTP Headers](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_declarative_security_via_http_headers.htm)
- [Commerce Script Injection](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_commerce_script_injection.htm)
- [Cross-Site Request Forgery](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_cross_site_request_forgery.htm)
- [Secret Storage](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_secret_storage.htm)
- [Using Hooks Securely](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_using_hooks_securely.htm)
- [Data Validation](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_data_validation.htm)
- [Open Redirect Attacks](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_open_redirect_attacks.htm)
- [Authentication and Authorisation](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_developer_authentication_and_authorization.htm)
- [Supply Chain Security](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_supply_chain_security.htm)
- [Secure Logging](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_secure_logging.htm)
- [General Secure Coding Practices](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_general_secure_coding_practices.htm)
- [AgentExchange Security Reviews](https://developer.salesforce.com/docs/atlas.en-us.packagingGuide.meta/packagingGuide/secure_code_b2c_commerce.htm) (this guide covered AppExchange until Salesforce folded it into AgentExchange)

Quite the list, isn't it! Even though Salesforce takes care of quite a few things, you still need to keep yourself in check. Follow the provided guidelines not to compromise the channels you implement on Salesforce B2C Commerce Cloud.

## Security Headers in SFRA

To increase the channel's security, Salesforce allows developers to set specific headers in the responses to tell browsers and applications what is permitted and what is not.

A [config file](https://github.com/SalesforceCommerceCloud/storefront-reference-architecture/blob/master/cartridges/app_storefront_base/cartridge/config/httpHeadersConf.json) was introduced into the SFRA to easily set headers for all responses, rather than having to do it for each endpoint separately — Salesforce's own [support article on adding custom headers in SFRA](https://help.salesforce.com/s/articleView?id=000396592&language=en_US&type=1) still points at that same path.

```json
[
    {
        "id": "Content-Security-Policy",
        "value": "frame-ancestors 'self'"
    },
    {
        "id": "X-Content-Type-Options",
        "value": "nosniff"
    }
]
```

The standard file (httpHeadersConf.json) only sets two security headers, but it is possible to develop more.

Salesforce limits the headers you can set to [a list of constants in the Response class](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_system_Response.html).

I have compiled a list and their descriptions below to make things easier.

### [Access-Control-Allow-Credentials](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials)

The Access-Control-Allow-Credentials response header tells browsers whether to expose the response to the frontend JavaScript code when the request's credentials mode (Request.credentials) is include.

When a request's credentials mode (Request.credentials) is include, browsers will only expose the response to the frontend JavaScript code if the Access-Control-Allow-Credentials value is true.

### [Access-Control-Allow-Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers)

The Access-Control-Allow-Headers response header is used in response to a preflight request which includes the Access-Control-Request-Headers to indicate which HTTP headers can be used during the actual request.

### [Access-Control-Allow-Methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Methods)

The Access-Control-Allow-Methods response header specifies one or more methods allowed when accessing a resource in response to a preflight request.

### [Access-Control-Allow-Origin](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin)

The Access-Control-Allow-Origin response header indicates whether the response can be shared with requesting code from the given origin.

### [Access-Control-Expose-Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers)

The Access-Control-Expose-Headers response header allows a server to indicate which response headers should be made available to scripts running in the browser, in response to a cross-origin request.

### [Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)

The HTTP Content-Security-Policy response header allows web site administrators to control resources the user agent is allowed to load for a given page. With a few exceptions, policies mostly involve specifying server origins and script endpoints. This helps guard against [cross-site scripting](https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting) attacks.

**Note:** The Commerce Cloud platform can override this header for tools like the Storefront Toolkit.

### [Content-Security-Policy-Report-Only](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only)

The HTTP Content-Security-Policy-Report-Only response header allows web developers to experiment with policies by monitoring (but not enforcing) their effects. These violation reports consist of JSON documents sent via an HTTP POST request to the specified URI.

**Note:** You can set this response header only for storefront requests. Report recipient can't be a B2C Commerce system.

### [Cross-Origin-Embedder-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy)

The HTTP Cross-Origin-Embedder-Policy (COEP) response header prevents a document from loading any cross-origin resources that don't explicitly grant the document permission (using CORP or CORS).

### [Cross-Origin-Embedder-Policy-Report-Only](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy-Report-Only)

The report-only counterpart to Cross-Origin-Embedder-Policy: it monitors and reports COEP violations without actually blocking the resources involved, which is useful for testing a policy before you enforce it. It's one of the constants Salesforce added to the Response class since this article's original list was written.

### [Cross-Origin-Opener-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy)

The HTTP Cross-Origin-Opener-Policy (COOP) response header allows you to ensure a top-level document does not share a browsing context group with cross-origin documents. Salesforce's Response class also exposes a `Cross-Origin-Opener-Policy-Report-Only` constant for testing a COOP policy before enforcing it, though MDN doesn't have a dedicated reference page for it yet.

### [Cross-Origin-Resource-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy)

The HTTP Cross-Origin-Resource-Policy response header conveys a desire that the browser blocks no-cors cross-origin/cross-site requests to the given resource.

### [Permissions-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy)

The Permissions-Policy header restricts which browser features (camera, geolocation, autoplay, and dozens more) a page and its embedded frames are allowed to use. Setting it to a narrow allowlist limits what a compromised or malicious script embedded on your page could actually do with the browser's capabilities.

### [Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy)

The Referrer-Policy HTTP header controls how much referrer information (sent with the Referer header) should be included with requests. Aside from the HTTP header, you can set this policy in HTML.

### [X-Content-Type-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options)

The X-Content-Type-Options response HTTP header is a marker used by the server to indicate that the MIME types advertised in the Content-Type headers should be followed and not be changed. The header allows you to avoid MIME type sniffing by saying that the MIME types are deliberately configured.

### [X-FRAME-OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)

The X-Frame-Options HTTP response header can be used to indicate whether or not a browser should be allowed to render a page in a `<frame>`, `<iframe>`, `<embed />` or `<object>`. Sites can use this to avoid click-jacking attacks, by ensuring that their content is not embedded into other sites.

**Note:** The Commerce Cloud platform can override this header for tools like the Storefront Toolkit.

**Note:** The values of this header are restricted to: "ALLOW-FROM", "DENY", "SAMEORIGIN". Salesforce's Response class still documents `ALLOW-FROM`, but it's an [obsolete directive that modern browsers ignore entirely](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options) — use the Content-Security-Policy `frame-ancestors` directive instead if you need per-origin control.

### [X-XSS-Protection](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection)

A legacy header that told older browsers to stop rendering a page when they detected a reflected XSS attack. It's deprecated and modern browsers have removed their XSS filters, so a solid Content-Security-Policy is what actually protects you today — this one's here for completeness since Salesforce still exposes the constant.

## PWA Kit

PWA Kit shipped back in 2021, and security guidance for it has caught up since. The [Managed Runtime best practices guide](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/best-practices.html) now links out to the B2C Commerce security guide, bot management, and bot mitigation, while the [Managed Runtime overview](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/mrt-overview.html) documents the WAF, proxy, and CDN layer that sits in front of your storefront by default. I've also covered storefront-level protection — gating an unfinished or staging site behind Basic Auth — separately in [Storefront Protection For Your Composable Storefront](/storefront-protection-in-the-pwa-kit/) (worth a refresh of its own, but the approach it describes still holds).

### Malicious Modules

One of the gripes developers have had is that the Rhino Engine does not take too kindly to NPM packages. Finding compatible packages is a challenge, and in many cases, they [need to be converted](https://github.com/taurgis/salesforce-commerce-cloud-libraries) to work correctly.

With the PWA Kit, all of that changes; you get a lot more freedom with the third-party packages you can install. But with that freedom comes a lot of responsibility. Granted, this is already something you need to keep in mind with SiteGenesis and SFRA, as the storefront JavaScript does not have the Rhino limitations. You have undoubtedly already installed a few packages to expand the capabilities in the storefront.

You shouldn't forget that npm is an open ecosystem where anyone can contribute to a module or repository. And in return, anyone can use a simple command to download that code into their project.

But what if the person behind that repository does not have the best intentions? They could put malicious code into it. Or maybe the repository itself does not contain the malicious code; it could be in a dependency that they have on another package!

I can go on about this topic, but the following blog post by Liran Tal tells the whole story:

[https://lirantal.medium.com/malicious-modules-what-you-need-to-know-when-installing-npm-packages-12b2f56d3685](https://lirantal.medium.com/malicious-modules-what-you-need-to-know-when-installing-npm-packages-12b2f56d3685)

## npm-audit

{{< img-caption src="npm-audit-ab1e401b03.png" alt="npm audit output showing dependency vulnerability results." caption="npm audit vulnerability summary" link="npm-audit-ab1e401b03.png" >}}

As SFRA and PWA Kit use npm for their third-party libraries, it makes sense to use the out-of-the-box feature of npm to do a security audit of all of your packages.

The audit command submits a description of the dependencies configured in your project to your default registry and asks for a report of known vulnerabilities.

**Note:** Always test thoroughly after updating your packages (with or without using the npm audit function) to ensure all functionalities work as expected!
