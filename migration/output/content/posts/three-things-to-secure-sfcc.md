---
title: Three things you can do today to secure your SFCC environment
description: >-
  The importance of security in any digital environment can not be stressed
  enough.
date: '2024-01-15T17:47:00.000Z'
lastmod: '2024-01-08T20:35:25.000Z'
url: /three-things-to-secure-sfcc/
draft: false
heroImage: /media/2022/robot-locking-a-gate-9a4abf2129.png
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - security
  - sfcc
  - technical
author: Thomas Theunen
---
The importance of security in any digital environment can not be stressed enough. Even though [Salesforce Commerce Cloud](/the-salesforce-b2c-commerce-cloud-environment/) is a SaaS solution, you are still in charge of your system and how some aspects are secured.

A good example is user management; you securely handle access to different environments. Salesforce provides the tools to secure it, but you must use them correctly for optimal protection.

There is no time like the present, so let us look at three things you can do today to secure your Salesforce B2C Commerce Cloud environment!

## Verify account manager access

![Someone on the stage of an opera house auditing the audience. This represents making account manager secure by doing regular audits.](/media/2024/someone-auditing-an-audience-bcf9568dda.jpg)

As mentioned, user management is under your (or someone within your team) supervision. A few automations exist, [such as auto disabling of accounts](https://help.salesforce.com/s/articleView?id=sf.account_manager_rn_auto_disable_inactive_users_release.htm&type=5), but that doesn't mean you shouldn't have a look!

So why not do an audit now? Look at all the accounts and what access rights they have. Ask the question: “Do they need access to this now?” They might have needed access to administer an environment at one point, but that was aeons ago. So why not restrict that access?

You should always have a [system of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege), but mistakes happen - we are only human! Or off-boarding procedures that need to be correctly followed. So, an audit every once in a while is a good idea.

But why do this, you might ask? Well, there are quite a few reasons for this:

-   People do administrative tasks in the wrong environment by accident, even though they have not been working on that project for weeks/months/years (it happens)
-   An account was hacked that had access to multiple projects they no longer worked on
-   Someone left the company on bad terms and decided to abuse their access
-   … and many more

I am not saying that with a system of least privilege, all damage could have been prevented, but they could have done much less damage if the correct procedures had been adhered to.

## Check the code for security issues

Just as user access is something you and your team are in charge of, so is the security quality of the code deployed to the environments.

It might be a good idea to go and check out the repository and review the most sensitive areas, looking for security holes. Don’t know where to start? I wrote [an extensive article about security best practices](/secure-coding-in-salesforce-b2c-commerce-cloud/) to remember during development.

## Third-party access

![People grabbing keys from a treasure chest](/media/2024/people-grabbing-keys-from-a-chest-728c293140.jpg)

Next to user access to the business manager of the environments, there are also API Keys that allow administrative access to the system through REST endpoints and the [WebDAV](/a-beginners-guide-to-webdav-in-sfcc/).

If you have systems that integrate with Salesforce B2C Commerce Cloud, document those systems and how they integrate. And again, make sure they work with a [Principle of Least Privilege](https://www.cisa.gov/uscert/bsi/articles/knowledge/principles/least-privilege).

An excellent example of such an integration is an ERP system that updates orders via the OCAPI and uploads Price Book files to WebDAV. Verify that the ERP can only do those two things with the API Key it has been given.

There may be an integration that is no longer active or an API key that has been replaced. Ensure these are removed from the configuration so no one can abuse them if they are accidentally shared outside your organisation.

We always hope people who get these by accident bear no ill will, but that is not the world we live in.

## Get crackin’

These three items are just to get you started, there are many other things that you can check today to make sure your environments are secured. And make sure to check the documentation for helpful features and tools that Salesforce provides[tools that Salesforce provides](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/account_manager/b2c_account_manager_register_verification_methods_for_mfa.html) to make your life easier.
