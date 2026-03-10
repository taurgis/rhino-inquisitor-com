---
title: Helpful Salesforce B2C Commerce Cloud CLI tools
description: >-
  Although Salesforce B2C Commerce Cloud is a ‘niche’ developer space, there is
  no shortage of $1 available to make our lives a little bit easier. In this...
lastmod: '2023-09-18T12:33:59.000Z'
url: /helpful-salesforce-b2c-commerce-cloud-cli-tools/
draft: false
heroImage: /media/2022/5517c6d9-6282-4468-a840-0af54ac19068-9222fff64d.png
date: '2023-09-11T17:19:00.000Z'
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - cli
  - sfcc
  - technical
author: Thomas Theunen
---
Although Salesforce B2C Commerce Cloud is a ‘niche’ developer space, there is no shortage of [open-source solutions](https://www.rhino-inquisitor.com/community-repositories/) available to make our lives a little bit easier.

In this article, we will list a few of these and provide information on their uses.

## sfcc-ci

-   [GitHub Repository Link](https://github.com/SalesforceCommerceCloud/sfcc-ci)

People who have been working with Salesforce B2C Commerce Cloud as a developer or in a similar technical role will have come into contact with this project.

This tool provides you with a [CLI](https://en.wikipedia.org/wiki/Command-line_interface) (Command Line Interface) and a library to use within your projects to connect to a Salesforce B2C Commerce environment.

It provides you with some handy commands that we will go over in more detail.

### Sandbox Management

You will most likely know SFCC-CI for its [Sandbox management capabilities](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/sandboxes/b2c_developer_sandboxes.html). It provides commands to create, delete, start, stop, and many more.

This project paves the way for setting up Continuous Integration and Continuous Deployment. You could potentially set this up to create a sandbox for automated testing that would destroy the instance at the end.

### Site Import/Export & Jobs

The second set of commands allows you to manage your [Site Import & Exports](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/import_export/b2c_site_import_export.html).

### SLAS

One of the more recent additions is a complete set of commands to manage SLAS (Shopper Login And API Access Service.)

[This set of Headless APIs](https://developer.commercecloud.com/s/api-details/a003k00000VWfNDAA1/commerce-cloud-developer-centershopperloginandapiaccessservice?tabset-888ee=2) is not the easiest to set up, and SFCC-CI has made a set of commands available to help set this up (and possibly even automate once you get a feel for how it works.)

### Many more and growing

There are still more commands available, but I will not review them all.

## b2c-tools

![A screenshot of B2C Tools depicting a migration](/media/2022/b2c-tools-ff2c3df29f.svg)

-   [GitHub Repository Link](https://github.com/SalesforceCommerceCloud/b2c-tools)

A relatively new repository (January 2022) made its way into GitHub. It is a CLI & Library project meant to be complementary to SFCC-CI.

B2C Tools mainly focus on allowing you to script import/export tasks and migration between environments.

## Catalog Reducer

-   [GitHub Repository Link](https://github.com/SalesforceCommerceCloud/catalog-reducer)

A super-fast sandbox and an extensive product catalog are usually not two things you hear together in a single sentence.

When working on a project as a developer, you like to have a representative environment to reproduce issues that arise [in the Primary Instance Group](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/getting_started/b2c_demandware_instances.html). However, getting a good amount of products from production to a sandbox is not easy.

The "Catalog Reducer" project gives you a CLI to convert an extensive catalog to a smaller one containing only what you want/need.

Using a JSON configuration file, you determine how many masters, variants, and products with a particular attribute should be included in a filtered file.

And since this is a CLI, you can combine this with sfcc-ci or b2c-tools to create an automated process to update sandboxes!

I'm starting to see a common thread here!

_**Note:**_ _This particular library does not handle huge files well. It loads the entire source XML into memory, which will cause Out-Of-Memory exceptions rather quickly._

## SFCC Catalog Pricebook

-   [GitHub Repository Link](https://github.com/redvanworkshop/sfcc-catalog-pricebook)

If you have already looked around GitHub for Salesforce B2C Commerce Cloud cartridges and tools, you will probably have run into [Red Van Workshop](https://redvanworkshop.com/). They have released quite a few handy cartridges and tools, so be sure to check out [their organization](https://github.com/redvanworkshop/) on GitHub.

This CLI tool is complimentary to "Catalog Reducer." It takes in a Product Catalog and pushes out a Price Book based on your configuration (randomized prices based on rules).

## And many others

These are only a few examples of tools you will find from the Salesforce B2C Commerce Cloud community. Have one that you think needs some love? Feel free to leave send me a slack message!
