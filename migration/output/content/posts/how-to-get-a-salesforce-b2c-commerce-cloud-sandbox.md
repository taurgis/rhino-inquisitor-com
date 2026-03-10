---
title: How to get a Salesforce B2C Commerce Cloud Sandbox
description: >-
  As a developer, you want to know what you are getting yourself into to make a
  conscious choice of what you will be doing for the years to come. And look...
date: '2022-04-05T05:36:43.000Z'
lastmod: '2022-12-20T16:23:36.000Z'
url: /how-to-get-a-salesforce-b2c-commerce-cloud-sandbox/
draft: false
heroImage: /media/2022/sandbox-84618f4042.png
categories:
  - Salesforce Commerce Cloud
tags:
  - sandbox
  - sfcc
author: Thomas Theunen
---
As a developer, you want to know what you are getting yourself into to make a conscious choice of what you will be doing for the years to come. And looking at the Salesforce core platform, [it is straightforward to spin up a sandbox](https://developer.salesforce.com/signup)!

But does this also apply to Salesforce B2C Commerce Cloud? Long story short, no.

There are three scenarios in play that might apply to you.

## You are new to Salesforce

You have been into web development for a while now (or are new to it), and e-commerce is "your thing." People told you about Salesforce and how easy it is to set up an environment for free. But much to your surprise, you can easily set up a Salesforce Developer Sandbox, but this has nothing to do with Salesforce B2C Commerce Cloud. You scour google and Trailhead, and you find information on spinning up an [On-Demand Sandbox.](https://trailhead.salesforce.com/en/content/learn/modules/b2c-on-demand-sandbox) It talks about an account on [Account Manager](https://account.demandware.com/) that you have to use to spin up a sandbox, but there are no details on how to access it.

### A bit of history

Salesforce B2C Commerce Cloud wasn't always named like that; it was called [Demandware](https://en.wikipedia.org/wiki/Demandware) until the end of 2016, when Salesforce acquired it.

It is an entirely different "stack" and has no relation to the Salesforce Core Platform (but more and more integrations have been happening over the years).

Because of this, getting access to this system is [an entirely different process](https://trailhead.salesforce.com/en/content/learn/trails/build-your-b2c-commerce-consulting-practice).

_I also wrote a post recently explaining the [difference in the community](/the-state-of-ohana-for-salesforce-commerce-cloud/)._

### So then ... how do I get access?

~~There is no automated system yet to spin up a sandbox easily. The only way I am aware of is to send an e-mail to [sfcc-b2c-trial@salesforce.com](mailto:sfcc-b2c-trial@salesforce.com).~~

~~Unfortunately, that is all I have.~~

~~_**UPDATE:** I have gotten the message from multiple people since I have written this article that they successfully obtained a trial using this e-mail address._~~

Since I have written this article, I have been given some information about the e-mail mentioned above. For now, this address is only for internal (Salesforce) use by Account Executives or Partner Managers.

The primary purpose is to provide a contact point for accounts that already have access to a trial sandbox for maintenance purposes.

So, for now, the message is as follows:

> To obtain a trial sandbox please reach out to either your Commerce Cloud Account Executive (customers) or your Partner Manager (partners). For details on the partner program look [here](https://partners.salesforce.com/pdx/s/learn/article/isv-b2c-commerce-MCDSZA63SNTNCRRBPDZX3PU7OGWI?language=en_US).

### PWA Kit

If you, however, plan on working on the storefront with [PWA-Kit](http://pwa-kit.mobify-storefront.com/), that is an entirely different story. This headless storefront has been made entirely open-source and provides an install command that will automatically connect you to a public sandbox so you can learn how to work with the [APIs](https://developer.commercecloud.com/s/commerce-api). If you are a [React](https://reactjs.org/) developer, this is the playground for you! _Note: You can not access the Business Manager of this public sandbox; Salesforce manages it!_

## You are a Salesforce partner

Being a partner will make finding documentation a little easier and a lot more confusing, weird right! On the [partner community](https://partners.salesforce.com/pdx/s/), you will find two groups that contain helpful information on becoming a Salesforce B2C Commerce Cloud-enabled partner:

-   **[B2C Commerce](https://partners.salesforce.com/_ui/core/chatter/groups/GroupProfilePage?g=0F93A0000009SFY):** A group that contains the documentation required to become "[enabled](https://partners.salesforce.com/0693A000006lGVl?retUrl=%2F_ui%2Fcore%2Fchatter%2Fcontent%2FGroupFileListPage)."
-   **[Partner On-Demand Sandboxes](https://partners.salesforce.com/_ui/core/chatter/groups/GroupProfilePage?g=0F93A000000DQ6f):** A group containing all information about ODS, more specifically the ones used by partners



_Note: Depending on your journey towards B2C, you might want to send an email to the trial address mentioned in the previous section._

## You are a B2C partner or Client

Well, now, you should be set! If you are a B2C-enabled partner or a client, you can spin up as many On-Demand sandboxes as you want!

Watch out! If you go overboard, [extra charges will be added to your contract](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/sandboxes/b2c_purchase_sb_credits.html?resultof=%22%63%72%65%64%69%74%73%22%20%22%63%72%65%64%69%74%22%20)!

Just read all of the available documentation, and you should be good to go:

-   [Documentation Site](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/sandboxes/b2c_developer_sandboxes.html)
-   [Trailhead](https://trailhead.salesforce.com/content/learn/modules/b2c-on-demand-sandbox)

## Trailhead Academy

![](/media/2022/trailhead-academy-77b0322d57.jpeg)

If all else above is unavailable to you and no sandbox is within your reach, a paid training course is the final option with [Trailhead Academy](https://trailheadacademy.salesforce.com/overview).

There is one course available that gives you access to a Sandbox for about three weeks:

-   [CCD102: B2C Commerce Developer (SFRA) Training](https://trailheadacademy.salesforce.com/classes/ccd102-b2c-commerce-developer-with-sfra?_ga=2.254667784.102261915.1666000067-1536331326.1643878545)

The critical thing to note here is that this course is not the cheapest and will force you to dig deeper into your pockets. On the flip side, you immediately get training on how to develop for Salesforce B2C Commerce Cloud.
