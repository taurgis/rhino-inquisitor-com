---
title: 'Let''s GO-LIVE: eCDN'
description: >-
  Bringing your first site live on SFCC can be challenging. In this series, we
  will be looking at different parts. Part I: eCDN
date: '2022-08-04T06:53:47.000Z'
lastmod: '2022-08-05T07:52:02.000Z'
url: /lets-go-live-ecdn/
draft: false
heroImage: /media/2022/ecdn-5035a37164.png
categories:
  - GO-LIVE
  - Salesforce Commerce Cloud
  - Technical
tags:
  - cloudflare
  - sfcc
  - technical
author: Thomas Theunen
---
So, you want to set a website live on Salesforce B2C Commerce Cloud. It is all relatively new to you, but your task is to set up the Staging and Production instance to prepare your "GO-LIVE."

Not to worry! The ECDN is not rocket science, far from it. Once you have set up your first vanity domain, the second one will be peanuts.

**Update August 5, 2022:** Added some warnings to this post with things to keep in mind. Thank you, [Sachin Upmany,](https://www.linkedin.com/in/sachin-upmanyu-82428828/) for the reminder that this information is also essential in these guides!

## What is the eCDN

But first things first. It is as essential to know what the eCDN is to configure it! What does [Salesforce have to say](https://www.salesforce.com/products/commerce-cloud/resources/ecdn-for-commerce-cloud-digital-datasheet/) about this feature:

> Salesforce Commerce Cloud provides digital customers an embedded content delivery network (eCDN) designed to accelerate site speed access and content delivery. The end result is a more secure, reliable online shopping experience for the consumer.

Ok, ok. The sentence above might not explain what the eCDN is and does.

To put it in simple terms: it's [Cloudflare](https://www.cloudflare.com/)! If you have been active in web development for a while, you probably are already familiar with the service.

For the most part, Salesforce has put itself in between and taken complete control of the Cloudflare configuration. But luckily, they have left us with a few buttons and switches to fiddle with in the Business Manager.

[![Embedded CDN settings for the my-domain.com storefront.](/media/2022/ecdn-overview-fea46a41af.png)](/media/2022/ecdn-overview-fea46a41af.png)

Within this interface, you can configure:

- Your supported [vanity domains](https://en.wikipedia.org/wiki/Vanity_domain)
- Managing SSL certificates
- Firewall & [WAF](https://www.cloudflare.com/waf/) (Web Application Firewall)
- Performance Optimization
- Custom Error/Under Attack Pages

## Getting Prepared

Before configuring the **Production** Business Manager, a few things need to be in order and prepared.

### Domain

This one should be pretty obvious, but I'll mention it anyway. Make sure the domains you will be using have been purchased. If you don't own the domains, you won't be able to point them to Salesforce B2C Commerce Cloud.

### DNS Configuration Access

To point the domain to Salesforce B2C Commerce Cloud, you need access to the domain DNS configuration. In later steps, you (or someone else you are in contact with) must add [TXT](https://en.wikipedia.org/wiki/TXT_record) and [CNAME](https://en.wikipedia.org/wiki/CNAME_record) records to the DNS configuration.

[![DNS record editor for the vanity domain.](/media/2022/add-dns-record-domain-com-245d883c43.jpg)](/media/2022/add-dns-record-domain-com-245d883c43.jpg)

APEX Domain Pointing / Naked Domain It is essential to know that the APEX Domain or Naked Domain does not support CNAME records.

Usually, a DNS provider has solutions for this, but this needs to be considered. In a worst-case scenario, you need to set up a "mini-server" to do the redirection of the naked domain to the www subdomain. You can find some [information on Salesforce Help](https://help.salesforce.com/s/articleView?id=000361629&type=1) on this topic.

With a naked domain we mean **`<https://mybrand.com**>` (without the www). × Dismiss alert

### Get your SSL certificates

We have come to a time where no website should operate without a secure connection. To achieve that, an [SSL certificate](https://en.wikipedia.org/wiki/Certificate_authority) is required.

To do the configuration later, you need the following:

- The certificate
- The private key

Note: If you are unfamiliar with how certificates can be obtained, [a lot of helpful information](https://letmegooglethat.com/?q=how+to+get+a+ssl+certificate) is floating around on the net.

## Alias Configuration

A prerequisite for a domain to be available in the eCDN is that it is configured in one of the sites in the [alias](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/search_engine_optimization/b2c_hostname_aliases.html) configuration.

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

Alias Configuration Setting up this configuration can be a pain in the \*\*\*, so be prepared to fiddle around with it for a few hours if you are unfamiliar with it, especially if you are handling multiple sites with multiple domains.

## Add the domain to the eCDN

Use the correct environment Setting up the eCDN is done on the production instance! Zone Creation with care Once a zone is created, this can not be undone, and you will have to go through support to be able to undo this.

To get to the eCDN configuration, go to

"**Administration**" > "**Sites**" >"**Embedded CDN Settings**"

Once the page has loaded (be patient), you will see the following at the top right of the page.

[![Add Hostname action in Embedded CDN Settings.](/media/2022/ecdn-add-hostname-719cd44c57.png)](/media/2022/ecdn-add-hostname-719cd44c57.png)

You should see the message "x hostname(s) available" if everything goes well. If not, go back to the Alias configuration to verify everything was saved correctly.

Click "Add Hostname." A screen should show your configured Alias domain and to which site it is assigned.

[![Create Zone dialog for the selected hostname.](/media/2022/ecdn-add-hostname-second-step-1cfd425363.png)](/media/2022/ecdn-add-hostname-second-step-1cfd425363.png)

Click "Create Zone." Be patient; it can take a while before something happens.

### Verify ownership of the domain

Once the page responds in the previous step, you should see something like this.

[![Hostname row marked as verification needed.](/media/2022/ecdn-verification-needed-4d10fff1bf.png)](/media/2022/ecdn-verification-needed-4d10fff1bf.png)

If you see the above, you are well on your way! But there is a clear message: "Verification needed."

Before continuing, we need to verify that we own the domain. Click the text "Verification needed," and you will see more information on the next steps.

[![Verification details with the required TXT record value.](/media/2022/ecdn-verification-needed-step2-7bd0bfea95.png)](/media/2022/ecdn-verification-needed-step2-7bd0bfea95.png)

This builds on the pre-work steps where you need access to the domain's DNS. Before we can continue with the following steps, a TXT record with the provided value needs to be added to the DNS settings of your domain.

DO NOT DO THIS ON THE DAY OF THE GO-LIVE.

As the warning says, it can take up to 6 hours for these changes to take effect. And on the go-live day, you don't want to spend your time "stressing out" on something you have no control over.

From personal experience, this usually takes a couple of minutes rather than hours. But the warning is there for a reason!

## Domain Configuration

Now that we are a "verified owner" of the domain within the eCDN, we can start configuring that domain.

[![eCDN overview screen for a configured storefront domain.](/media/2022/ecdn-overview-fea46a41af.png)](/media/2022/ecdn-overview-fea46a41af.png)

To start, click the "settings" to the right of the top-level domain.

### Set up an SSL Certificate

[![TLS and certificate controls for the embedded CDN.](/media/2022/ecdn-crypto-settings-b5ebdefdd6.png)](/media/2022/ecdn-crypto-settings-b5ebdefdd6.png)

The first screen you will land on is the "crypto" settings. This is where you manage everything about SSL and TLS settings.

To add a certificate, click the "Add Certificate" button!

[![Certificate upload form for the embedded CDN.](/media/2022/ecdn-upload-certificate-2447fc3d76.png)](/media/2022/ecdn-upload-certificate-2447fc3d76.png)

The screen itself is pretty self-explanatory. If you followed the "get prepared" section at the beginning of this article, these should already be in your possession.

Once entered, the system will validate if it is correct. If it passes the validation, click "Upload Certificate," and bam... you are done!

#### TLS 1.3

You might have noticed that a BETA feature was marked in the screenshots above. Do you want to know more about this feature? Then visit [Cloudflare Docs](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/tls-13/).

Even though the notification popup warns you that this is a BETA feature, it has already gotten that mark for two years.

I have enabled this feature on most projects with no adverse effects.

#### HSTS

Once a certificate has been uploaded, a new setting should appear called [HSTS](https://hstspreload.org/).

Enabling this option will tell browsers that your domain only operates over HTTPS and that all HTTP connections should be blocked.

Since this includes all subdomains, ensure that no system besides Commerce Cloud operates on HTTP. Otherwise, people will be "barred" from using that site for the remainder of the TTL.

### Firewall Settings

[![Firewall settings for security level and trusted IPs.](/media/2022/ecdn-firewall-settings-ee94d7af54.png)](/media/2022/ecdn-firewall-settings-ee94d7af54.png)

You can manage the Security Level and Trusted IP Addresses in the firewall settings.

As the help popup informs, this part of the firewall looks at IP Address reputation to act appropriately.

Using the IP Allowlisting feature, you can inform the firewall to ignore specific IPs.

### WAF Settings

[![Cloudflare Speed tab with Auto Minify for HTML, CSS, and JavaScript plus Polish enabled.](/media/2022/ecdn-waf-settings-3ec4c7f73e.png)](/media/2022/ecdn-waf-settings-3ec4c7f73e.png)

The WAF ([Web Application Firewall](https://www.cloudflare.com/learning/ddos/glossary/web-application-firewall-waf/)) is a Cloudflare feature that is well documented.

This will look at more areas to detect malicious traffic using the OWASP rules.

There is a lot to say about this feature, but lucky for me Salesforce [has written extensive documentation](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/admin/b2c_waf_application.html) on this topic!

#### Download Log Files

In this section, you can also download log files per hour. It is essential to keep in mind that this is an asynchronous operation, and after clicking "Request Log," you will receive an email containing a download link at a later time (usually not so long)

These files contain a log of all network traffic, how the WAF analyzed it, and how it responded.

### Speed Settings

HTML Minification Those who have enabled this in the past might have wondered if this "did anything." Well, it deletes all of the comments from the HTML.

If you have comments on an environment that have value for an external system, be sure not to activate this type of minification.

**Note:** This also breaks the deprecated toolkit on Development as it relies on comments.

[![eCDN Speed panel showing Auto Minify and Polish options for the storefront.](/media/2022/ecdn-speed-settings-cccba25f5e.png)](/media/2022/ecdn-speed-settings-cccba25f5e.png)

Not much to say about this section; here, you can control a few settings that improve speed, such as minification of Javascript, CSS, and HTML.

The Polish Level settings are something to look into, though, as these can improve the performance of your images.

One thing to watch out for is if you choose to enable "Polish Level Basic+JPEG," your images might lose quality as this will use lossy compression. If you work for a brand that wants crisp and clear photos, you may want to do extensive testing before permanently enabling this.

Enabling [WebP](https://en.wikipedia.org/wiki/WebP) is a no-brainer, allowing a lossless compression that performs better on the web. It is also [supported](https://caniuse.com/webp) by all major browsers now (except Safari...).

Since these features are Cloudflare behind the scenes, you can also look at [their documentation](https://developers.cloudflare.com/images/polish/).

### Customize Settings

[![Custom error page settings for the embedded CDN.](/media/2022/ecdn-customize-settings-87c4ccf54c.png)](/media/2022/ecdn-customize-settings-87c4ccf54c.png)

A section you hope you will never need. When "\*\*\*\* hits the fan," Cloudflare provides standard error pages. In this section, you can choose to load your own rather than the default.

## Commerce API Configuration

The not-so-well-known thing is that some Cloudflare features you can enable are missing in the Business Manager.

There is a REST service available however:

[https://developer.salesforce.com/docs/commerce/commerce-api/references?meta=cdn-api-process-apis:updateSpeedSettings](https://developer.salesforce.com/docs/commerce/commerce-api/references?meta=cdn-api-process-apis:updateSpeedSettings)

Using these APIs, you can enable:

- [Brotli Compression](https://blog.cloudflare.com/brotli-compression-using-a-reduced-dictionary/)
- [HTTP2 Prioritization](https://blog.cloudflare.com/better-http-2-prioritization-for-a-faster-web/)

Make sure you do not forget about these! As they can also increase performance on certain pages. HTTP2 Prioritization will help a lot on lister pages with many images processed by the [DIS](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/image_management/b2c_image_transformation_service.html) (Dynamic Image Service).
