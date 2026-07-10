---
title: Secure Coding in Salesforce B2C Commerce Cloud
description: >-
  Salesforce secures the B2C Commerce Cloud platform itself, but secure
  coding is still on you. Here's what needs ongoing attention.
date: '2022-04-26T12:09:00.000Z'
lastmod: '2026-07-09T21:18:17.000Z'
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
Salesforce B2C Commerce Cloud (SFCC) provides many security features out of the box. And because it's a [SaaS](https://en.wikipedia.org/wiki/Software_as_a_service) platform, Salesforce's own technical teams handle the security of the servers.

That doesn't mean you can just lay back and stop worrying about security. Here's what still falls on you when you develop for B2C Commerce Cloud.

## Account Manager Security

Salesforce removed "local users" — separate login credentials scoped to a single sandbox — from B2C Commerce environments. Access to sandboxes and PIG (Primary Instance Group) instances now goes exclusively through Account Manager and its security features.

This has brought up many discussions about sharing accounts over the past year (more on the core platform than on SFCC).

You might think it strange that the first topic is securing your account. But if someone has access, they can upload malicious code or download sensitive data with little effort.

### Single account to rule them all

The main advantage (from my perspective) is that you now have one account to log in to many different environments (and across realms).

But this comes at a price.

If an account becomes compromised — especially one with Account Manager admin privileges, not just SFCC access — someone can reach every environment tied to it in one swing.

Salesforce [made MFA mandatory](https://help.salesforce.com/s/articleView?id=commerce.rn_b2c_mfa_enforcement_je.htm&language=en_US&type=5) for interactive B2C Commerce logins in May 2022 to mitigate this threat, after recommending it for about a year beforehand.

### MFA (Multi-Factor Authentication)

{{< img-caption src="mfa-1-6649345f2c.jpg" alt="Account Manager multi-factor authentication setup screen." caption="Account Manager MFA setup" >}}

Account Manager lets you add MFA to your account. Even if someone figures out your password, they still need the secondary authentication method to get in.

For many people, adding [Salesforce Authenticator](https://play.google.com/store/apps/details?id=com.salesforce.authenticator) to the log-in procedure was clunky at first — extra taps, a separate app to juggle — though it's improved since.

Account Manager supports several MFA options:

- Salesforce Authenticator (Application)
- [Security Key](https://www.yubico.com/) (Physical Device)
- [TOTP](https://en.wikipedia.org/wiki/Time-based_one-time_password) (Time-based one-time password) application
- [Salesforce Identity](https://help.salesforce.com/s/articleView?id=sf.who_is_salesforce_identity_for.htm&type=5) ([Documentation](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_account_manager_link_account_to_salesforce_identity_sso.htm))

I decided to make logging in a bit more manageable by building "[Automaton](https://chromewebstore.google.com/detail/automaton-account-manager/clbadmmkinhmiblhkkiiabbbcpljohob)," a browser (Chromium) extension that acts as a TOTP generator for Account Manager. It's still maintained — the last update shipped in July 2024 — and automatically fills in your username, password, and one-time code once you've unlocked it with a "Vault Password," so having access to your laptop alone isn't enough to log in. Run into a problem? The [support repo](https://github.com/taurgis/automaton/issues) is the place to report it.

The extra step costs you a few seconds at every login. Weigh that against the alternative: one stolen password away from every environment tied to your account being open to whoever has it.

### Shared Accounts

Sharing accounts is something Salesforce advises against, for good reason — but it still happens.

Where does this actually come up in SFCC?

- An integration user
- ... no, that's about it

You rarely need to log into Business Manager (SFCC's admin console) as an integration user. When you do, more than one person usually needs the credentials — for coverage during leave or sick days.

So think of secure ways to share your MFA (usually TOTP for shared accounts). A good solution I found so far is [1password](https://support.1password.com/one-time-passwords/) which supports TOTP.

## Cloudflare

Salesforce's built-in services block a lot of malicious traffic, but they can't stop everything that means to do harm.

The eCDN (Salesforce's embedded content delivery network) in front of your storefront is [Cloudflare](https://www.cloudflare.com/): Salesforce controls most of the configuration, but leaves a handful of switches for you to flip in Business Manager, covering things like the WAF (web application firewall), TLS, and compression settings. I go into that setup in detail in [Let's Go Live: Setting Up the eCDN](/lets-go-live-ecdn/); the [Infocenter](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_embedded_cdn_overview.htm) has the official overview.

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

Salesforce's Storefront Reference Architecture (SFRA) lets developers set specific response headers to tell browsers and applications what's permitted on the storefront.

SFRA ships a [config file](https://github.com/SalesforceCommerceCloud/storefront-reference-architecture/blob/master/cartridges/app_storefront_base/cartridge/config/httpHeadersConf.json) that sets headers for every response at once, instead of repeating the same logic in each controller. Salesforce's own [support article on adding custom headers in SFRA](https://help.salesforce.com/s/articleView?id=000396592&language=en_US&type=1) still points at that same path.

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

The standard file only sets two security headers, but you can add more.

Salesforce limits the headers you can set to [a list of constants in the Response class](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_system_Response.html).

Here's the full list, with what each one actually does:

### [Access-Control-Allow-Credentials](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials)

Set Access-Control-Allow-Credentials to `true` when a cross-origin request carries credentials (`Request.credentials: "include"`) and you want the browser to expose that response to the requesting page's JavaScript. Leave it unset and the browser hides the response even if the request itself succeeded.

### [Access-Control-Allow-Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers)

Before certain cross-origin requests, the browser first sends a preflight `OPTIONS` call asking what's allowed. Access-Control-Allow-Headers answers that question for custom request headers: list the ones your endpoint accepts, and the browser lets the real request through.

### [Access-Control-Allow-Methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Methods)

Access-Control-Allow-Methods answers that same preflight check for HTTP methods: list `PUT`, `DELETE`, or whichever verbs your endpoint supports, or the browser blocks the follow-up request before it reaches your controller.

### [Access-Control-Allow-Origin](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin)

Access-Control-Allow-Origin decides which origins may read the response at all. Setting it to `*` is the easiest option, but it means any site can read that response — scope it to the specific origins you trust instead.

### [Access-Control-Expose-Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers)

Access-Control-Expose-Headers is the reverse of Allow-Headers: it lists which of your response headers a cross-origin script may read, beyond the handful browsers expose by default — a custom pagination or rate-limit header your storefront JavaScript needs to see, for example.

### [Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)

Content-Security-Policy controls which origins a page may load scripts, styles, and other resources from — the actual defence against [cross-site scripting](https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting) attacks, since an injected script tag can't run if its origin isn't allow-listed. With a few exceptions, policies mostly involve specifying server origins and script endpoints.

**Note:** The Commerce Cloud platform can override this header for tools like the Storefront Toolkit.

### [Content-Security-Policy-Report-Only](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only)

Content-Security-Policy-Report-Only runs the same policy in observe-only mode: violations get logged as JSON, POSTed to a reporting URI, but nothing is actually blocked — useful for testing a tighter CSP before you commit to enforcing it.

**Note:** You can set this response header only for storefront requests. Report recipient can't be a B2C Commerce system.

### [Cross-Origin-Embedder-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy)

Cross-Origin-Embedder-Policy (COEP) blocks a document from loading cross-origin resources unless those resources explicitly opt in, via the Cross-Origin-Resource-Policy header (CORP) or CORS. It's what lets a page use powerful browser APIs, such as `SharedArrayBuffer`, that would otherwise leak data across origins.

### [Cross-Origin-Embedder-Policy-Report-Only](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy-Report-Only)

The report-only counterpart to Cross-Origin-Embedder-Policy: it monitors and reports COEP violations without actually blocking the resources involved, which is useful for testing a policy before you enforce it. It's one of the constants Salesforce added to the Response class since this article's original list was written.

### [Cross-Origin-Opener-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy)

Cross-Origin-Opener-Policy (COOP) keeps a top-level document out of the same browsing context group — the internal grouping that lets `window.opener` and similar APIs reach across tabs — as any cross-origin document it opens or is opened by. Salesforce's Response class also exposes a `Cross-Origin-Opener-Policy-Report-Only` constant for testing a COOP policy before enforcing it, though MDN doesn't have a dedicated reference page for it yet.

### [Cross-Origin-Resource-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy)

Cross-Origin-Resource-Policy (CORP) tells the browser to block cross-origin, `no-cors` requests — the fetch mode that skips CORS checks — from reading this resource at all, closing a gap CORS alone doesn't cover for things like images and scripts loaded without credentials.

### [Permissions-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy)

The Permissions-Policy header restricts which browser features (camera, geolocation, autoplay, and dozens more) a page and its embedded frames are allowed to use. Setting it to a narrow allowlist limits what a compromised or malicious script embedded on your page could actually do with the browser's capabilities.

### [Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy)

Referrer-Policy controls how much of your page's URL leaks into the Referer header of outgoing requests. Set it to `strict-origin-when-cross-origin` or tighter if your URLs ever carry order IDs, session tokens, or other data you don't want showing up in a third party's server logs. You can also set this policy in HTML, alongside the header.

### [X-Content-Type-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options)

X-Content-Type-Options set to `nosniff` stops the browser from guessing a file's type from its content instead of trusting the declared Content-Type. Without it, a browser that reads an uploaded text file as HTML or JavaScript can end up executing content it should have just displayed.

### [X-FRAME-OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)

X-Frame-Options tells the browser whether it may render this page inside a `<frame>`, `<iframe>`, `<embed />`, or `<object>`. Set it to block embedding and you close off click-jacking attacks that trick users into clicking a disguised, invisibly-framed version of your page.

**Note:** The Commerce Cloud platform can override this header for tools like the Storefront Toolkit.

**Note:** The values of this header are restricted to: "ALLOW-FROM", "DENY", "SAMEORIGIN". Salesforce's Response class still documents `ALLOW-FROM`, but it's an [obsolete directive that modern browsers ignore entirely](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options) — use the Content-Security-Policy `frame-ancestors` directive instead if you need per-origin control.

### [X-XSS-Protection](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection)

A legacy header that told older browsers to stop rendering a page when they detected a reflected XSS attack. It's deprecated and modern browsers have removed their XSS filters, so a solid Content-Security-Policy is what actually protects you today — this one's here for completeness since Salesforce still exposes the constant.

## PWA Kit

PWA Kit, Salesforce's React-based framework for composable storefronts, shipped back in 2021, and security guidance for it has caught up since. Managed Runtime — the hosting layer that runs PWA Kit apps — now has its own [best practices guide](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/best-practices.html) linking out to the B2C Commerce security guide, bot management, and bot mitigation, while the [Managed Runtime overview](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/mrt-overview.html) documents the WAF, proxy, and CDN layer that sits in front of your storefront by default. I've also covered storefront-level protection — gating an unfinished or staging site behind Basic Auth — separately in [Storefront Protection For Your Composable Storefront](/storefront-protection-in-the-pwa-kit/) (worth a refresh of its own, but the approach it describes still holds).

### Malicious Modules

SFCC's server-side scripting runs on the Rhino engine, a JavaScript runtime older than Node.js that doesn't provide Node's built-in modules (`fs`, `http`, native addons). Most npm packages assume those modules exist, so finding one that works unmodified is rare — in many cases, they [need to be converted](https://github.com/taurgis/salesforce-commerce-cloud-libraries) first.

PWA Kit changes that: it runs on Node.js, so you get far more freedom with third-party packages, and with that freedom comes more responsibility. The same risk already applies to storefront JavaScript in SiteGenesis and SFRA (SFCC's legacy and current reference storefronts) — that code runs in the shopper's browser, not on Rhino, so it was never subject to those limitations, and you've likely already installed packages there to extend the storefront.

npm is an open ecosystem: anyone can publish a module, and anyone can pull that code into their project with one `npm install`.

But what if that maintainer is malicious? They could slip harmful code into the package directly — or the package itself could be clean while a dependency it pulls in isn't.

For a deeper walkthrough of this attack pattern, see Liran Tal's post:

[https://lirantal.medium.com/malicious-modules-what-you-need-to-know-when-installing-npm-packages-12b2f56d3685](https://lirantal.medium.com/malicious-modules-what-you-need-to-know-when-installing-npm-packages-12b2f56d3685)

## npm-audit

{{< img-caption src="npm-audit-ab1e401b03.png" alt="npm audit output showing dependency vulnerability results." caption="npm audit vulnerability summary" link="npm-audit-ab1e401b03.png" >}}

Since SFRA and PWA Kit both pull third-party libraries through npm, run `npm audit` against your dependencies before you ship — no extra tooling required.

The audit command submits a description of the dependencies configured in your project to your default registry and asks for a report of known vulnerabilities.

**Note:** A patched dependency that breaks checkout, cart, or search is its own incident — run your test suite after every update, not just `npm audit`.
