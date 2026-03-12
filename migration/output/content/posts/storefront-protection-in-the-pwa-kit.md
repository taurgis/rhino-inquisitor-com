---
title: Storefront Protection For Your Composable Storefront
description: >-
  Learn how storefront protection applies to Composable Storefront projects,
  where SFRA patterns still help, and what extra checks to add.
date: '2024-11-18T07:26:53.000Z'
lastmod: '2024-11-20T12:36:26.000Z'
url: /storefront-protection-in-the-pwa-kit/
draft: false
heroImage: /wp-content/uploads/2024/11/storefront-protection.jpeg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - pwa kit
  - sfcc
  - sfra
author: Thomas Theunen
---
Protecting online stores using [Storefront Protection](https://help.salesforce.com/s/articleView?id=cc.b2c_storefront_password_protection.htm&type=5) in [SiteGenesis and SFRA](https://www.rhino-inquisitor.com/the-move-from-sitegenesis-and-sfra-to-the-composable-storefront-as-a-developer/) is simple. But now that we have the [Composable Storefront](https://www.rhino-inquisitor.com/sitegenesis-vs-sfra-vs-pwa/), we need to think about whether those protections still work. This blog post will talk about how to keep your Composable Storefront safe and what this new technology means for security.

## The Shift from Business Manager to Managed Runtime

When utilising SFCC with SiteGenesis or SFRA (Salesforce Reference Architecture) sites, enabling Storefront Protection was a straightforward process.

You can easily navigate through the Business Manager by following this path:

```text
Administration > Sites > Manage Sites
```

We proceed on our journey by selecting the site you want to enable this for, then navigating to the site status tab after the page has finished loading.

[![Site Status screen in Business Manager with Online Protected selected.](/media/2024/online-protected-sfcc-b0634b710d.jpg)](/media/2024/online-protected-sfcc-b0634b710d.jpg)

This page allows us to switch to "Online (Protected)," which unveils a new field.

[![Protected storefront password field shown after enabling Online Protected.](/media/2024/storefront-protection-password-sfcc-c017798dc4.png)](/media/2024/storefront-protection-password-sfcc-c017798dc4.png)

Here, you choose a password that allows users to access the storefront.

### 1\. simple 2. effortless 3. straightforward

The Storefront Protection method helps keep your online store safe and controls who can access it. However, things have changed with the new SFCC PWAs (Progressive Web Apps). Moving from Business Manager to Managed Runtime (MRT) is a big shift, and developers need to know that the protection settings from Business Manager don’t work for PWAs anymore.

Because of this change, we must find new ways to keep our online stores safe. Password protection is still very important, especially when we're working on a site or when we need to limit who can see it.

So, how can we keep SFCC PWA storefronts safe and restrict access?

## Implementing Basic Authentication in The Composable Storefront

A straightforward way to limit who can access your SFCC PWA storefront is to use [Basic Authentication](https://en.wikipedia.org/wiki/Basic_access_authentication). This method works on the server side, meaning it runs on the computer that hosts your website. It involves setting up a special middleware function for the login process. Here are the steps to help you get started.

### Step 1: Locate the \`ssr.js\` File

First, find your \`ssr.js\` file in your SFCC PWA project folder. This file is important because it helps with server-side rendering, which is necessary for safely displaying your online store's content.

### Step 2: Create Middleware for Basic Authentication

I’m not particularly eager to do things all over again if someone has already done a fantastic job. Here are some examples of how to add your own authentication middleware:

- [A deprecated method (just for reference)](https://github.com/SalesforceCommerceCloud/pwa-kit/pull/732/files)
- [The latest example made by John Boxall](https://gist.github.com/taurgis/e6a60e14672df31a0e1d7ea311671f3c)
- [An example Hamza Javed made recently on LinkedIn](https://www.digitscommerce.com/sfcc-pwa-ssr.js)

## Why would you do this

Making sure your SFCC PWA store has a password is really important. This is especially true when you’re still working on it or it’s not ready for everyone to see. Because it’s in the cloud, anything you put online can be accessed unless you put up some protection. If you don’t secure it, people who shouldn’t see your work might get access to important information and unfinished parts of the site.

Also, if the site isn’t protected, search engines might find it too soon and show it to everyone, even though it’s not finished. This could hurt your website’s reputation and lower how it ranks in search results.

By using a simple password protection, you can keep your work safe and ensure only the right people can check it out. This helps keep your project intact and protects your brand’s reputation.

## Is there an interface planned

Right now, the main suggestion (to my knowledge) is to stick with the coding solution. I haven’t seen any plans for an interface for "Storefront Protection".

This feature can be added easily with just a little development using environment variables. I believe the time and resources spent on improving the PWA Kit project would be better used on other priorities instead of creating interfaces for these features.
