---
title: 'Let’s GO-LIVE: Customer Migration'
description: >-
  We have already gotten $1 of our GO LIVE story, but we are far from done.
  Going live with any Commerce project can be quite an endeavor. But
  hopefully,...
lastmod: '2022-10-17T17:53:18.000Z'
url: /lets-go-live-customer-migration/
draft: false
heroImage: /media/2022/data-migration-2fc1d03d2f.jpg
date: '2022-10-17T17:49:09.000Z'
categories:
  - GO-LIVE
  - Salesforce Commerce Cloud
  - Technical
tags:
  - migration
  - sfcc
  - technical
author: Thomas Theunen
---
We have already gotten [a few parts down](/category/go-live/) of our GO-LIVE story, but we are far from done. Going live with any Commerce project can be quite an endeavor. But hopefully, with this series, the most critical parts of the puzzle are covered! On to the next piece: Customer migration!

## [Start sooner rather than later](http://t)

Although this series is about GO-LIVE, which happens at the end of a project - a lot of preparation goes into it, even weeks and months in advance. Data migration should be in your planning as soon as possible, as customers who existed on a previous platform (which usually applies) must be migrated. The main reason to start this sooner rather than later: **You are, in most cases, not in control!** What I mean by this is that the implementation partner of the previous platform needs to share the data with you, either in their format or in the one that Salesforce B2C Commerce Cloud uses. And since this is sensitive data, processes need to be put in place to ensure the transfer of information happens securely!

## Decide who is in charge

Salesforce B2C Commerce Cloud only allows formats it defines, which means that with any migration, some transformation needs to happen from the format of the previous platform to that of SFCC. And there is only one option: [XML](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/xsd/Schemas.html) (Business Manager or Automated job). But what do you mean by "who is in charge?". Well, who is going to be doing that transformation? Depending on the answer, this will affect your planning. There are a few options for who takes ownership of this:

1.  The Consulting (Implementation) Partner
2.  The Salesforce customer
3.  The previous implementation partner

Ultimately, it does not matter who does it as long as they have the required knowledge of both the old and new formats. There is enough [documentation](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/import_export/b2c_customer_object_import_export.html) available to get anyone started on the process, and guidance from the Implementation Partner is always a good thing.

## Handle with care

![](/media/2022/data-breach-7096540e7a.jpg) I have mentioned this before, but we deal with people's personal information in this process! Be sure that the data you work with is handled properly! Transfer the data securely, and only transfer it to people who need to work with this data. _😱 Don't email the database unencrypted to everyone involved in the project. 😱_ And also important, once the people have done their task, they must delete the data from their systems.

## Make a deployment plan

Work out a detailed plan on how you will do this migration. In many cases, the old platform will still be up and running a few hours before the scheduled go-live. So what about the registrations and account updates between the last export and when you go live? Think about, and discuss with the team how to handle the last delta import to make sure no data is lost. Make these steps part of your deployment plan, and decide who is in charge of each step.

## Compare and test

After converting the data, run extensive testing on the source and target file to ensure no data has been mixed up. This might seem obvious. But we don't want to link the address of person A to person B accidentally, do we?

## Password migration

I will not elaborate on this one too much, but compared to the other data in a customer migration, this tends to be the most challenging. Why is that? Well... better hope you get this data encrypted or hashed! Otherwise, the previous platform had some severe security issues. And because of that encryption/hashing, you need to find ways to handle this. To dig deeper into this topic, I will redirect you to an [excellent article by Oleg Sapishchuk](https://osapishchuk.medium.com/legacy-customers-password-migration-3fa1596303cc).

## Monitoring

![](/media/2022/robot-monitoring-a-screen-4af85584a4.jpg) The final step, as with many things, is monitoring after go-live. Make sure people can log in - and make Customer Service aware to note down all the information to track potential bugs. It is vital to keep this part of your daily routine for the first few days (amongst other things) after the big release.

## Rollback

With any big release, make sure you also have a contingency plan. Things can go wrong, and a rollback might be needed to make corrections. Like a deployment plan, ensure a rollback scenario is covered with tasks and who is responsible for each. We all wish everything goes as planned, but the reality is not always so kind.
