---
title: What is the Salesforce B2C Commerce Cloud Managed Runtime?
description: >-
  In the last two years, more vocabulary has been added to the $1 ecosystem
  because of the $1. And one of the terms you might have heard is "$1", which
  pr...
lastmod: '2023-05-08T13:15:51.000Z'
url: /what-is-the-sfcc-managed-runtime/
draft: false
heroImage: /media/2023/people-maintaining-server-room-scaled-d510b8a413.jpg
date: '2023-05-08T13:04:24.000Z'
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - composable storefront
  - headless
  - sfcc
  - technical
author: Thomas Theunen
---
In the last two years, more vocabulary has been added to the [Salesforce B2C Commerce Cloud](/the-salesforce-b2c-commerce-cloud-environment/) ecosystem because of the [Composable Storefront](/sitegenesis-vs-sfra-vs-pwa/).

And one of the terms you might have heard is "[Managed Runtime](https://runtime.commercecloud.com/login)", which provides the infrastructure to deploy, host, and monitor your Progressive Web App (PWA) Kit storefront. In this article, we will explore the inner workings of Managed Runtime, its benefits, and how it empowers developers to build storefronts without having to think (much) about the underlying infrastructure.

## What does the Managed Runtime do?

The [Managed Runtime](https://runtime.commercecloud.com/login) is designed to support applications created from a PWA Kit template in the [PWA Kit repository](https://github.com/SalesforceCommerceCloud/pwa-kit) on GitHub. It operates within environments, which is the term to describe all of the cloud infrastructure and configuration values. It is possible within that infrastructure to differentiate between development and production environments.

Developers will use the PWA Kit tools to generate a bundle, a snapshot of the storefront code at a specific time, and push it to Managed Runtime. Once the bundle is pushed, it is possible to use the Runtime Admin Web Interface or [Managed Runtime API](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/using-the-managed-runtime-api.html) to designate that bundle as "deployed."

Each project can have multiple bundles, but each environment has only one "deployed" bundle. Similar to the fact that you can only have one active "[Code Version](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/site_development/b2c_code_versions.html)" on the server side.

[![A screenshot of the Managed Runtime showing the Organization "Salesforce Internal" with two projects called "sampleproject" and "projectx".](/media/2023/salesforce-commerce-cloud-managed-runtime-e2b922960d.jpg)](/media/2023/salesforce-commerce-cloud-managed-runtime-e2b922960d.jpg)

The Managed Runtime operates within a hierarchy of organisations and projects. Organisations can contain multiple projects for various storefronts, and each project can contain multiple environments.

This structure allows for efficiently managing multiple environments and separating different work streams.

[![A mindmap displays the managed runtime with three organisations. One organisation is split up into two projects, each with three environments. One of those environments is marked as "production", while the rest is marked as "development".](/media/2023/managed-runtime-projects-environments-ba31af2d92.png)](/media/2023/managed-runtime-projects-environments-ba31af2d92.png)

### AWS Lambda

Under the hood, the Managed Runtime uses AWS Lambda, a serverless computing service provided by Amazon Web Services (AWS) that allows you to run your code without provisioning or managing servers.

Curious about Lambda? [Here you go](https://aws.amazon.com/lambda/)!

## Benefits of the Managed Runtime for businesses

When a platform offers features, there are a lot of questions that will go through your mind. And one of them will probably be, "What benefits does it bring?":

1.  **Included in the license**: It is not a phrase you often see in the Salesforce Eco-system, but the managed runtime is ready to be taken advantage of if you have a license for B2C Commerce Cloud!
2.  **Simplified deployment**: Managed Runtime streamlines deploying and hosting your PWA Kit storefront, meaning that developers only need to develop - and not worry about the infrastructure. And that saves time and, ultimately, money.
3.  **Scalability**: Nothing new to B2C Commerce Cloud, but the infrastructure provided by Managed Runtime allows your storefront to scale seamlessly as your business grows, ensuring optimal performance and customer experience just like the "[monolithic solution](/sitegenesis-vs-sfra-vs-pwa/)".
4.  **Security**: Managed Runtime offers robust security features that protect your storefront from potential threats and vulnerabilities like the back end.
5.  **Improved troubleshooting**: The immutable nature of bundles allows for a complete and accurate history of deployments, making it easier to identify and resolve issues or even do a quick rollback to a previous version!

## Benefits of the Managed Runtime for developers

![a woman wearing headphones sitting in front of two computer monitors.](/media/2023/developer-working-on-multiple-monitors-27024b5da3.jpg)

Developers working with Salesforce B2C Commerce Cloud can leverage this runtime to:

1.  **Accelerate development**: This was already mentioned, but the fact that, as a developer, you do not have to worry about the infrastructure is a significant benefit!
2.  **Streamline collaboration**: The organisation and project structure within Managed Runtime enables you to work together more efficiently, sharing knowledge and resources across multiple environments.
3.  **Enhance productivity**: With the ability to designate specific bundles as deployed, developers can easily switch between different versions of their storefront, making testing and iterating on new features more accessible.
4.  **No credits:** The environments on the managed runtime do not work on the same system as the sandboxes (credits for uptime). That means no extra processes have to be set up!

## APIs?

Salesforce offers [a range of APIs](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/using-the-managed-runtime-api.html) that developers can use to interact with the platform, including:

1.  **Managed Runtime APIs**: This API allows developers to manage bundles, environments, and deployments within their projects.
2.  **Admin** **APIs**: This API provides access to administrative functions, such as managing users, organisations, and projects.

These APIs make setting up CI/CD pipelines and automating specific processes much easier!

## Conclusion

Some developers might hesitate to give up control when deciding whether to let Salesforce manage its environment. Others might appreciate the specialised skills needed to manage infrastructure and will gladly pass on the baton to Salesforce.

It's important to know that you don't have to use the Managed Runtime option and can create your own Headless Storefront for Salesforce B2C Commerce Cloud if you want to. But if you choose this route (build your own), the managed runtime might not be an option!

[![A diagram depicting how you would roll your own Headless Storefront based on a custom Node.js server running APIs through Apollo.](/media/2023/b2c-commerce-cloud-roll-your-own-b16dfb6a8d.jpg)](/media/2023/b2c-commerce-cloud-roll-your-own-b16dfb6a8d.jpg)

An example of a "roll your own" architecture
