---
title: "Let’s GO-LIVE: eCDN"
description: >-
  Bringing your first site live on SFCC can be challenging. In this series, we
  will be looking at different parts. Part I: eCDN
date: '2022-08-04T06:53:47.000Z'
lastmod: '2026-07-07T10:30:00.000Z'
url: /lets-go-live-ecdn/
draft: false
heroImage: ecdn-5035a37164.png
categories:
  - GO-LIVE
  - Salesforce Commerce Cloud
  - Technical
tags:
  - cloudflare
  - sfcc
  - technical
author: Thomas Theunen
takeaways:
  - "Explains what the SFCC embedded CDN is and which storefront controls Business Manager exposes per instance"
  - "Walks through the vanity-domain flow from alias setup and DNS verification to auto-renewing managed certificates"
  - "Covers what changed since 2022, including WAFv2, mandatory TLS 1.3, the retired Auto Minify options, and Default Domains"
---
So, you want to set a website live on Salesforce B2C Commerce Cloud. It is all relatively new to you, but your task is to set up the Staging and Production instance to prepare your "GO-LIVE."

Not to worry! The eCDN is not rocket science, far from it. Once you have set up your first vanity domain, the second one will be peanuts.

> [!NOTE]
> **Updated July 2026:** The eCDN has moved on since this guide was written in 2022. WAFv2 replaced the old firewall, TLS 1.3 shed its beta label, Cloudflare retired Auto Minify, certificates learned to renew themselves, and staging got its own Business Manager module. Every section below has been brought in line with the current platform. The go-live warnings from the original (added back then with thanks to [Sachin Upmanyu](https://www.linkedin.com/in/sachin-upmanyu-82428828/)) still stand.

## What is the eCDN

But first things first. It is as essential to know what the eCDN is to configure it! The datasheet I quoted here in 2022 has since vanished from Salesforce's site. The [current help page](https://help.salesforce.com/s/articleView?id=cc.b2c_embedded_cdn_overview.htm&language=en_US&type=5) keeps it drier: the eCDN is "a geographically distributed network of proxy servers" that sits in front of your storefront to improve speed, availability, and security.

Ok, ok. That still might not explain what the eCDN is and does.

To put it in simple terms: it's [Cloudflare](https://www.cloudflare.com/)! If you have been active in web development for a while, you probably are already familiar with the service.

For the most part, Salesforce has put itself in between and taken complete control of the Cloudflare configuration. But luckily, they have left us with a few buttons and switches to fiddle with in the Business Manager.

{{< img-caption src="ecdn-overview-fea46a41af.png" alt="Embedded CDN settings for the my-domain.com storefront." caption="Business Manager's eCDN workspace is where the storefront domain, certificates, and traffic rules come together." >}}

Within this interface, you can configure:

- Your supported [vanity domains](https://en.wikipedia.org/wiki/Vanity_domain)
- Managing SSL certificates
- Firewall & [WAF](https://www.cloudflare.com/waf/) (Web Application Firewall)
- Performance Optimisation
- Custom Error/Under Attack Pages

## Getting Prepared

Before configuring the **Production** Business Manager, a few things need to be in order and prepared.

### Domain

This one should be pretty obvious, but I'll mention it anyway. Make sure the domains you will be using have been purchased. If you don't own the domains, you won't be able to point them to Salesforce B2C Commerce Cloud.

> [!NOTE]
> **No vanity domain yet?** Since the 26.4 release, every instance ships with a [Default Domain](https://help.salesforce.com/s/articleView?id=cc.b2c_default_domain.htm&language=en_US&type=5): a Salesforce-managed hostname that is already behind the eCDN, with the whole certificate lifecycle handled for you. It does not replace a vanity domain for go-live, but it lets you test eCDN behaviour while the domain purchase is still stuck in procurement.

### DNS Configuration Access

To point the domain to Salesforce B2C Commerce Cloud, you need access to the domain DNS configuration. In later steps, you (or someone else you are in contact with) must add [TXT](https://en.wikipedia.org/wiki/TXT_record) and [CNAME](https://en.wikipedia.org/wiki/CNAME_record) records to the DNS configuration.

{{< img-caption src="add-dns-record-domain-com-245d883c43.jpg" alt="DNS record editor for the vanity domain." caption="This DNS panel is where the TXT and CNAME records for the new storefront domain are added." >}}

> [!WARNING]
> **APEX Domain Pointing / Naked Domain:** It is essential to know that the APEX Domain or Naked Domain does not support CNAME records, and the eCDN does not support apex domains directly.

Usually, a DNS provider has solutions for this, but this needs to be considered. In a worst-case scenario, you need to set up a "mini-server" to do the redirection of the naked domain to the www subdomain. Salesforce [documents the limitation and the recommended redirect](https://help.salesforce.com/s/articleView?id=000391603&language=en_US&type=1) on the help site.

With a naked domain we mean <https://mybrand.com> (without the www).

### Get your SSL certificates (or don't)

We have come to a time where no website should operate without a secure connection. To achieve that, an [SSL certificate](https://en.wikipedia.org/wiki/Certificate_authority) is required. "Getting" one, though, no longer has to mean buying one. The eCDN supports two flavours:

- **eCDN-managed certificates:** Salesforce provisions the certificate through Let's Encrypt or Google Trust Services and, since the 23.6 release, [renews it automatically](https://developer.salesforce.com/docs/commerce/commerce-api/guide/cdn-zones-automatic-certs.html). No private keys to guard, and no renewal reminder that everyone ignores until the storefront goes down.
- **Custom certificates:** the classic route. You purchase a certificate and upload it together with its private key, and its renewal remains your problem. Still the way to go if you need certificate pinning, extended validation, or a specific certificate authority.

For a new project, the managed certificate is the sensible default. If you go the custom route, have the certificate and the private key at hand before you start the configuration.

## Alias Configuration

A prerequisite for a domain to be available in the eCDN is that it is configured in one of the sites in the [alias](https://help.salesforce.com/s/articleView?id=cc.b2c_hostname_aliases.htm&language=en_US&type=5) configuration.

An example config you can use to get you up and running quickly:

```json
{
  "__version": "1",
  "settings": {
    "http-host": "www.my-domain.com",
    "https-host": "www.my-domain.com"
  }
}
```

Once an Alias is configured on at least one site in your production environment, we can continue to the next step!

> [!NOTE]
> **Alias Configuration:** Setting up this configuration can be a pain in the \*\*\*, so be prepared to fiddle around with it for a few hours if you are unfamiliar with it, especially if you are handling multiple sites with multiple domains.

## Add the domain to the eCDN

> [!NOTE]
> **Use the correct environment:** For a go-live, the eCDN is set up on the production instance. Since the [24.4 release](/getting-to-know-the-sfcc-24-4-release/), staging has its own Embedded CDN Settings module too (retiring the [API-only dance](/how-to-set-up-the-ecdn-in-sfcc-staging/) it required before), and settings are per instance: nothing you configure on staging replicates to production, or the other way around.

> [!WARNING]
> **Zone Creation with care:** Once a zone is created, you can not delete it yourself, not even through the CDN Zones API. You will have to go through support to undo this.

To get to the eCDN configuration, go to

"**Administration**" > "**Sites**" > "**Embedded CDN Settings**"

Once the page has loaded (be patient), you will see the following at the top right of the page.

{{< img-caption src="ecdn-add-hostname-719cd44c57.png" alt="Add Hostname action in Embedded CDN Settings." caption="Start the eCDN setup by adding the storefront hostname from the Embedded CDN Settings screen." >}}

You should see the message "x hostname(s) available" if everything goes well. If not, go back to the Alias configuration to verify everything was saved correctly.

Click "Add Hostname." A screen should show your configured Alias domain and to which site it is assigned.

{{< img-caption src="ecdn-add-hostname-second-step-1cfd425363.png" alt="Create Zone dialog for the selected hostname." caption="The zone-creation dialog links the selected alias domain to the correct storefront." >}}

Click "Create Zone." Be patient; it can take a while before something happens.

### Verify ownership of the domain

Once the page responds in the previous step, you should see something like this.

{{< img-caption src="ecdn-verification-needed-4d10fff1bf.png" alt="Hostname row marked as verification needed." caption="A new hostname stays blocked here until Salesforce can verify that you own the domain." >}}

If you see the above, you are well on your way! But there is a clear message: "Verification needed."

Before continuing, we need to verify that we own the domain. Click the text "Verification needed," and you will see more information on the next steps.

{{< img-caption src="ecdn-verification-needed-step2-7bd0bfea95.png" alt="Verification details with the required TXT record value." caption="This panel gives the exact TXT record your DNS team must publish before setup can continue." >}}

This builds on the pre-work steps where you need access to the domain's DNS. Before we can continue with the following steps, a TXT record with the provided value needs to be added to the DNS settings of your domain.

DO NOT DO THIS ON THE DAY OF THE GO-LIVE.

As the warning says, it can take up to 6 hours for these changes to take effect. And on the go-live day, you don't want to spend your time "stressing out" on something you have no control over.

From personal experience, this usually takes a couple of minutes rather than hours. But the warning is there for a reason!

## Domain Configuration

Now that we are a "verified owner" of the domain within the eCDN, we can start configuring that domain.

{{< img-caption src="ecdn-overview-fea46a41af.png" alt="eCDN overview screen for a configured storefront domain." caption="Once the domain is verified, this becomes the main screen for certificate and traffic settings." >}}

To start, click the "settings" to the right of the top-level domain.

### Set up an SSL Certificate

{{< img-caption src="ecdn-crypto-settings-b5ebdefdd6.png" alt="TLS and certificate controls for the embedded CDN." caption="The Crypto tab holds the certificate and TLS settings. This 2022 screenshot still shows the old TLS 1.3 beta toggle." >}}

The first screen you will land on is the "crypto" settings. This is where you manage everything about SSL and TLS settings.

For a new setup, the path of least resistance is an eCDN-managed certificate: request one, prove you own the domain, and let Salesforce handle every renewal after that. Since the 23.10 release, those renewals can be managed straight from Business Manager as well.

Uploading your own certificate still works the same way it did in 2022. Click the "Add Certificate" button!

{{< img-caption src="ecdn-upload-certificate-2447fc3d76.png" alt="Certificate upload form for the embedded CDN." caption="Use this form to upload the certificate and private key for the storefront domain." >}}

The screen itself is pretty self-explanatory. If you followed the "get prepared" section at the beginning of this article, these should already be in your possession.

Once entered, the system will validate if it is correct. If it passes the validation, click "Upload Certificate," and bam... you are done!

#### TLS 1.3

The 2022 version of this section poked fun at a checkbox: "Enable TLS 1.3 (beta)" had been carrying that beta label for two years, and I had enabled it on most projects with no adverse effects.

That discussion is now closed. With the [26.2 release](https://www.salesforce.com/blog/b2c-commerce-february-26-release/), Salesforce made TLS 1.3 support on the eCDN mandatory rather than optional. Browsers that do not speak TLS 1.3 fall back to TLS 1.2. Curious what the protocol actually brings? The [Cloudflare Docs](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/tls-13/) explain it well, and these days without a beta warning in sight.

#### HSTS

Once a certificate is in place, the same Crypto tab offers [HSTS](https://hstspreload.org/). Don't see it? There is a feature switch for it under "**Administration**" > "**Global Preferences**" > "**Feature Switches**".

Enabling this option will tell browsers that your domain only operates over HTTPS and that all HTTP connections should be blocked.

Since this includes all subdomains, ensure that no system besides Commerce Cloud operates on HTTP. Otherwise, people will be "barred" from using that site for the remainder of the TTL. And think twice before ticking "preload": getting off the preload list again takes months.

### Firewall Settings

{{< img-caption src="ecdn-firewall-settings-ee94d7af54.png" alt="Firewall settings for security level and trusted IPs." caption="These firewall controls are where the baseline launch protection is tightened before traffic arrives." >}}

You can manage the Security Level and Trusted IP Addresses in the firewall settings.

As the help popup informs, this part of the firewall looks at IP Address reputation to act appropriately.

Using the IP Allowlisting feature, you can inform the firewall to ignore specific IPs.

Need something more precise than a trust list? Since the 24.2 release, the CDN Zones API supports [custom rules](https://developer.salesforce.com/docs/commerce/commerce-api/guide/cdn-zones-custom-rules.html) (the successor of the old firewall rules) that can block, log, or challenge traffic based on expressions such as the URI path or user agent.

### WAF Settings

The WAF ([Web Application Firewall](https://www.cloudflare.com/learning/ddos/glossary/web-application-firewall-waf/)) looks beyond IP reputation and inspects the requests themselves for malicious patterns.

This part of the article needed the biggest rewrite. The WAF you configure today is not the one from 2022: Salesforce introduced WAFv2 with the [24.5 release](/getting-secured-with-the-24-5-salesforce-b2c-commerce-cloud-release/), added a self-service [migration button in 24.7](/the-latest-in-sfcc-version-24-7/), and required every zone to be migrated by February 1, 2025. Whatever zone you are configuring now, it is running WAFv2.

Instead of the single OWASP rule list from the old days, WAFv2 gives every zone three managed rulesets:

- **eCDN managed ruleset:** rules maintained by the Salesforce security team.
- **OWASP Core Ruleset:** based on the official OWASP project. Rather than each rule acting on its own, matched rules add up to a threat score, and the zone responds when the total gets too high.
- **Exposed credentials check:** compares login attempts against databases of leaked credentials.

In the eCDN and exposed-credentials rulesets, individual rules can be overridden with actions such as block, log, or managed challenge; the OWASP ruleset acts on its combined score instead. And one thing to plan for: WAF settings live per instance and are never replicated, so an exception you validated on staging has to be applied to production by hand. Salesforce documents the details on [the help site](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_waf_application.htm) and in the [CDN Zones WAFv2 guide](https://developer.salesforce.com/docs/commerce/commerce-api/guide/cdn-zones-wafv2.html).

#### Download Log Files

In this section, you can also download log files per hour. It is essential to keep in mind that this is an asynchronous operation, and after clicking "Request Log," you will receive an email containing a download link at a later time (usually not so long).

These files contain a log of all network traffic, how the WAF analysed it, and how it responded. They are kept for seven days, so fetch them while they are fresh.

The hourly download is no longer the only option, though. [CDN Logpush](https://developer.salesforce.com/docs/commerce/commerce-api/guide/cdn-zones-logpush.html) (added in the [23.6 release](/a-look-at-the-salesforce-b2c-commerce-cloud-23-6-release/)) streams request and firewall logs continuously to destinations such as Amazon S3, Datadog, or Splunk. And since the 25.10 release, eCDN error logs for production proxy zones also show up in Log Center.

### Speed Settings

This section used to open with advice about Auto Minify, the Cloudflare feature that stripped comments and whitespace from your HTML, CSS, and JavaScript. You can forget that advice: [Cloudflare retired Auto Minify in August 2024](https://community.cloudflare.com/t/deprecating-auto-minify/655677) after concluding it barely moved the needle for sites that already minify at build time, and Salesforce [removed the checkboxes from Business Manager](https://help.salesforce.com/s/articleView?id=commerce.b2c_rn_replace_discontinued_cloudflare_auto_minification.htm&language=en_US&type=5) in the 24.10 release. If you counted on it to strip HTML comments, that job now belongs to your build pipeline.

{{< img-caption src="ecdn-speed-settings-cccba25f5e.png" alt="The 2022 eCDN Speed tab showing the retired Auto-Minify checkboxes above the Polish settings." caption="This 2022 screenshot has aged: the Auto-Minify block at the top is gone, and only the Polish settings remain." >}}

What remains on the Speed tab is [Polish](https://developers.cloudflare.com/images/polish/), Cloudflare's image optimisation, and that one is still worth your attention.

One thing to watch out for is if you choose to enable "Polish Level Basic+JPEG," your images might lose quality as this will use lossy compression. If you work for a brand that wants crisp and clear photos, you may want to do extensive testing before permanently enabling this. "Polish Level Basic" sticks to lossless compression and is the safer starting point.

Enabling [WebP](https://en.wikipedia.org/wiki/WebP) remains a no-brainer. The 2022 version of this article claimed Safari did not support the format; that claim had already expired when I wrote it. Safari gained WebP support in version 14 (2020), with the small print that it required macOS Big Sur, and today [every major browser](https://caniuse.com/webp) handles it. With the option enabled, Polish serves a WebP variant when the browser asks for one and the conversion actually saves a meaningful number of bytes.

### Customise Settings

{{< img-caption src="ecdn-customize-settings-87c4ccf54c.png" alt="Custom error page settings for the embedded CDN." caption="Custom error pages let the CDN fail more gracefully when traffic spikes or attacks hit." >}}

A section you hope you will never need. When "\*\*\*\* hits the fan," Cloudflare provides standard error pages. In this section, you can choose to load your own rather than the default.

## Commerce API Configuration

The not-so-well-known thing is that some Cloudflare features you can enable are missing in the Business Manager.

There is a REST service available however:

[https://developer.salesforce.com/docs/commerce/commerce-api/references?meta=cdn-api-process-apis:updateSpeedSettings](https://developer.salesforce.com/docs/commerce/commerce-api/references?meta=cdn-api-process-apis:updateSpeedSettings)

The speed settings alone are worth a look; they are all opt-in:

- [Brotli Compression](https://blog.cloudflare.com/brotli-compression-using-a-reduced-dictionary/): Cloudflare compresses responses by default on its self-serve plans these days, but eCDN zones are Enterprise zones and do not get that default, so this flag is still ours to flip.
- [HTTP/2 Prioritisation](https://blog.cloudflare.com/better-http-2-prioritization-for-a-faster-web/): helps a lot on lister pages with many images processed by the [DIS](/image-ine-sfcc-dis-for-developers/) (Dynamic Image Service). Do test it, though: Cloudflare [documents cases](https://developers.cloudflare.com/speed/optimization/protocol/troubleshooting/enhanced-http2-prioritization-ios-safari/) where it slows down content loading in Safari on macOS and in any browser on iOS.
- Early Hints, HTTP/3, and HTTP/2 to origin: newer toggles that did not exist when this article was first written.

Make sure you do not forget about these! The same API family also covers cache purging, Logpush, custom rules, rate limiting, and the WAFv2 configuration. And if raw REST calls are not your thing, the official [B2C Developer Toolkit CLI](https://salesforcecommercecloud.github.io/b2c-developer-tooling/cli/ecdn.html) now wraps most of it in a `b2c ecdn` command.

That is the eCDN tour, 2026 edition. The platform keeps absorbing more of the Cloudflare feature set, and [more of the instance types keep joining the eCDN](/the-importance-of-origin-shielding/), so expect this article to age again. The vanity-domain flow itself has barely changed, though: alias, zone, TXT record, certificate. Once you have done it once, the second one really is peanuts.
