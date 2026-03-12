---
title: PDF And Salesforce B2C Commerce Cloud
description: >-
  Everyone knows PDF, right? It has been around for many years, and now we can
  use its full potential within Salesforce Commerce Cloud!
date: '2022-02-24T13:18:00.000Z'
lastmod: '2025-07-14T18:19:59.000Z'
url: /pdf-and-salesforce-commerce-cloud-b2c/
draft: false
heroImage: /media/2022/pdf-and-sfcc-f66c1d7bc5.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - pdf
  - sfcc
  - technical
author: Thomas Theunen
---
So, you need to whip up some documents in Salesforce B2C Commerce (SFCC). Invoices, return labels, maybe a digital gift card that looks suspiciously like a treasure map. Sounds simple, right?

_Wrong_. Welcome, brave developer, to one of SFCC's most legendary challenges. For years, creating a simple PDF has felt like a Herculean task, not because of a flaw, but because of a core design philosophy that prioritises security above all else.

Before you can claim your prize, you must first understand the battlefield. And today, that battlefield is split into two kingdoms: the traditional, monolithic-style Storefront Reference Architecture (SFRA) and the sleek, API-driven Composable Storefront. Your choice of kingdom will determine your path, your tools, and your strategy for victory.

## The Ghost in the Machine: Meet the Rhino Engine

The heart of our challenge lies deep within the SFCC backend. This realm isn't governed by Apex, the language of the core Salesforce empire, but by a special dialect of server-side JavaScript. This code is brought to life by the [Mozilla Rhino engine](https://en.wikipedia.org/wiki/Rhino_\(JavaScript_engine\)), a powerful translator that turns your JavaScript into Java bytecode.

Now, you might think, "Java-based? Great! I'll grab my favourite Java libraries and..."—hold it right there. That's where the quest gets tricky.

You see, developers are not given the keys to the whole Java kingdom. This isn't an oversight; it's a feature. To keep the multi-tenant SaaS environment safe and stable, SFCC puts your code in a "secure jail" or a sandboxed playground. This prevents custom code from running wild, accessing the server's file system, or causing trouble for other tenants. It’s a cornerstone of the platform's integrity, but it means that simple tasks like writing a file to disk or using a native PDF library are off-limits. You're restricted to the official toolkit: the `dw.*` Script APIs.

Even as the platform has learned new tricks, embracing modern JavaScript features, this fundamental rule remains. This is why creating anything more complex than a simple text file has historically been a headache. It's a direct, intentional trade-off for a fortress-like, secure architecture.

## The solution

As luck would have it, one of the "solutions" I had used until now was generating the PDF files client-side using [jsPDF](https://github.com/parallax/jsPDF) created by [Parallax](https://parall.ax/). Although the effort you have to make to create complex PDF files is relatively high, it gets the job done wonderfully.

> [!NOTE]
> **Thanks:** to [Oleg Sapishchuk](https://www.linkedin.com/in/osapishchuk/) for looking into this. It turns out that an older version of this plugin (with minor modifications) is compatible with the Rhino engine!

After reading that message on the Unofficial Slack, I could not contain myself to try this out. And what do you know, only an hour later, I had a working prototype that would generate a PDF server-side and render it on the client-side on the fly!

A few hours later, I found 15 minutes to spare and created a working job step using the same methodology to save it on the WebDAV rather than generate it on the fly.

And not to worry, these examples, together with the library, are available [here to download](https://github.com/taurgis/salesforce-commerce-cloud-libraries) and try out yourself.

![An example of code using jsPDF and the resulting PDF preview on the right.](/media/2022/jspdf-example-c6dcb73e48.png)

## With great power, comes great responsibility

Now with all things, and especially when working with sensitive personal data, you need to think before you do.

### Legal

In the digital marketplace, adherence to legal standards is not merely a suggestion but a strict requirement. For businesses operating in or selling to customers in France, for example, there is a legal obligation to retain all invoices for a period of **10 years**. This is a mandatory requirement that overrides other data deletion requests. You can find more information about this on the official French government website for businesses: [Factures : les règles à respecter](https://entreprendre.service-public.fr/vosdroits/F10029?lang=en).

Just so you know, while this is a specific requirement for France, other countries and jurisdictions will have their own regulations regarding data and invoice retention. Therefore, any e-commerce business needs to consult with legal counsel to ensure full compliance with the laws of all regions in which they operate. This proactive approach to legal compliance will not only prevent potential fines and legal disputes but also build trust with your customers by demonstrating a commitment to lawful and ethical business practices.

But what does this mean?

- **On-The-Fly:** This is no longer an option since you are not persisting the generated invoice yourself. Therefore, it must be stored somewhere before being given to the consumer to comply with local legislation.

- **Storing it on the WebDAV:** In the context of Commerce Cloud, this isn't the ideal choice, as such information should be stored closer to your invoicing system.

    Retaining all generated invoices on B2C Commerce for ten years is excessive. The platform is made for commerce, not finance.

Looking at the above statements, let something else take care of these invoices! But this will, again, depend on where you operate and what the rules of engagement are.

### Navigating the Privacy Maze (GDPR & Friends)

The General Data Protection Regulation (GDPR) has fundamentally changed how businesses handle the personal data of EU citizens. A key component of GDPR is the "right to be forgotten," which allows individuals to request the deletion of their personal data. However, this right is not absolute and must be balanced with other legal obligations.

The legal requirement to retain invoices for 10 years, as mentioned in the previous section, presents a direct conflict with the right to be forgotten. In this scenario, the legal obligation to retain the invoice takes precedence over the individual's request for data deletion. However, this does not mean that the personal data on the invoice can be kept indefinitely or used for other purposes.

To navigate this, businesses should adopt the principle of **data minimisation** and consider**pseudonymization**. Here's how this can be applied:

- **Data Minimisation:** Only collect and retain the personal data that is strictly necessary for the transaction and for legal compliance.

- **Pseudonymization:** After a certain period (for example, once the return window for an order has closed), you can pseudonymize the personal data on the invoice. This means replacing personally identifiable information (such as name, address, and contact details) with a non-identifiable token or code. The transactional data on the invoice (products purchased, price, etc.) remains, ensuring compliance with the 10-year retention law, while the customer's personal data is protected.

By implementing such a strategy, you can fulfil your legal obligations while still respecting the spirit of GDPR. It is also vital to be transparent with your customers.

The privacy policy should clearly state your data retention policies, explaining why specific data is kept for extended periods and how you protect it. This transparency will not only ensure GDPR compliance but will also foster a relationship of trust and confidence with your customers.

## What about the Composable Storefront

The [Composable Storefront](/the-move-from-sitegenesis-and-sfra-to-the-composable-storefront-as-a-developer/) is a whole new game. It's less like a pre-built castle and more like an infinite set of high-tech Lego bricks. Your frontend is a slick, fast Progressive Web App (PWA), completely separate from the backend commerce engine. They talk to each other exclusively through APIs, like the Salesforce Commerce API (SCAPI) and OCAPI.

This is a massive shift. Salesforce is betting big on this API-first, composable future. Trying to use an old-school, on-platform PDF hack in this new Lego world is like trying to glue your bricks together—it completely misses the point!

For a Composable architecture, the PDF logic belongs _outside_ the core SFCC platform, living in your BFF or as its own microservice. It's the modern, flexible, and correct way to build.  And... now you have the complete power of Node.js at your fingertips in this headless environment!

Third Party Service In a composable architecture, you don't need to build the service yourself; opting for the best third-party solution is also a valid choice!

## Think before you do

For PDF generation and all future quests, your success will be defined by your ability to find the best tool for the job and integrate it securely and efficiently. Sharpen your skills in Node.js, React, and API security.

The challenge is no longer, "How can I force the platform to do this?" but rather, "What is the best service for this task, and how do I plug it into my architecture?"

Master that, and you'll be ready for any adventure that comes your way.
