---
title: 'Understanding Salesforce B2C Commerce Instances: A Comprehensive Guide'
description: >-
  Salesforce B2C Commerce is a robust platform that enables businesses to create
  highly customised and scalable digital storefronts.
date: '2023-04-17T14:18:06.000Z'
lastmod: '2023-04-17T14:18:18.000Z'
url: /understanding-sfcc-instances/
draft: false
heroImage: /media/2023/salesforce-b2c-commerce-cloud-instances-scaled-59ed2cbb06.jpeg
categories:
  - Architecture
  - Salesforce Commerce Cloud
tags:
  - architect
  - instance
  - sfcc
  - technical
author: Thomas Theunen
---
Salesforce B2C Commerce is a [robust platform](/the-salesforce-b2c-commerce-cloud-environment/) that enables businesses to create highly customised and scalable digital storefronts. One of the key components (and advantages) of B2C Commerce is the available instances, which contain the tools and resources needed for customising your storefront. This blog post will discuss the different types of B2C Commerce instances, their uses, and how different teams within your organisation can utilise them.

[![Diagram of a pod, realm, and the related Salesforce B2C Commerce instances.](/media/2023/pod-realm-and-instances-transparent-65c6b4e389.png)](/media/2023/pod-realm-and-instances-transparent-65c6b4e389.png)

POD, Realm, Instances, and Domains

## POD (Point of Delivery)

In Salesforce B2C Commerce, a Point of Delivery (POD) is a comprehensive infrastructure hosting a multi-tenant Software as a Service (SaaS) application. This infrastructure comprises computing, networking, and storage services, which work together to support the operation of the B2C Commerce platform. The POD architecture ensures that resources are allocated effectively to handle various tenants' needs on the platform while maintaining high performance and availability. This approach allows businesses to focus on building and managing their digital storefronts without worrying about the underlying infrastructure. Salesforce takes care of maintaining the POD and ensuring its optimal performance.

> [!WARNING]
> **Deprecation:** This also means that [Salesforce makes crucial decisions on this infrastructure](/a-look-back-at-origin-shielding/) that must be considered during development.

## Realms

A realm is an essential organisational component that houses instances required for developing, testing, and deploying your online storefront. Typically, a single realm is adequate for managing multiple sites with different branding or locales. This setup allows for flexible management, as individuals overseeing the storefront sites can be located in various places. However, consider using multiple realms if you have distinct lines of business, global teams with unique processes, or separate organisations with different backend integrations. While sites within the same realm can share product catalogs, sites in other realms cannot share data through the catalog structure. You can, however, set up a CI/CD system to automate the synchronisation of the data when working with multiple realms.

## PIG vs SIG

Within a [realm](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/getting_started/b2c_platform_overview.html), instances are organised into Primary Instance Group (PIG) and Secondary Instance Group (SIG). The PIG comprises three instances:

- Development
- Staging
- Production

These are used for site configuration, testing, and hosting the live site. In the SIG, you will find the Developer Sandboxes. _**Note:** _ _ Each realm can have only one PIG and SIG._

## Instance Types

There are four types of B2C Commerce instances: Sandbox, Staging, Development, and Production. Each instance type has a unique purpose and set of features, making it suitable for specific tasks within the development and management of your storefront.

### Sandbox

![A server in the desert](/media/2023/a-server-in-the-desert-v2-f8f32e48de.jpg)

Developers use sandbox instances to create and update storefront code. These instances are located in a secondary instance group (SIG) and have most system jobs disabled.

> [!WARNING]
> **Deletion:** Sandboxes without login activity for 150 days might be deleted, but Salesforce will notify you before this occurs. Though honesty, I never saw this happen on the old system, and with On-Demand sandboxes having become the default option, you are in total control.

### Staging

The staging instance is where merchandising work takes place. This instance simulates the production environment and is used as the final step in testing the intersection of content and code. Staging instances are located in the realm's primary instance group (PIG) and are ([since recently](/how-to-set-up-the-ecdn-in-sfcc-staging/)) connected to the eCDN.

### Development

Development instances are used to replicate the production environment closely and are ideal for testing purposes. Like Staging instances, they are located in the PIG and have data and code replicated from the Staging instance.

### Production

The production instance is the live environment used for storefront transactions. It is also located in the PIG and is connected to the eCDN provided by B2C Commerce.

> [!NOTE]
> **Caching:** Caching can not be disabled in this instance.

## Matching Roles with Instances

Depending on the size of your team, one person may play more than one role. Here is a breakdown of the different roles within an organization and the instance types they typically use.

### Architect

The role of an Architect in Salesforce B2C Commerce Cloud involves designing and implementing scalable, reliable, and high-performance solutions to meet the needs of the business. They work closely with stakeholders to understand requirements and develop technical solutions using best practices and industry standards. Architects also oversee the development and deployment of customisations, integrations, and extensions to ensure that they align with the overall architecture and roadmap of the platform. In terms of instances, Architects will be interacting will all instances that Salesforce has to offer.

### Developer

Developers play a critical role in shaping a digital storefront's look, feel, and functionality on the Salesforce B2C Commerce platform. They are responsible for creating and modifying templates, pipelines/controllers, and scripts that define the site's user experience and overall performance. Developers primarily work with three instances: Sandbox, development, and staging. The Sandbox instance is a safe environment for developers to experiment with and test their code without affecting the live storefront or other instances. It is an isolated space where developers can create, modify, and debug their code to ensure proper functionality and compatibility with the rest of the system.

![Developer working on implementation tasks for a Salesforce B2C Commerce project.](/media/2023/woman-developer-working-on-a-project-1-4710b72058.jpeg)

Once developers are satisfied with their work in the Sandbox instance, they move on to the Staging instance. The Development environment is where developers upload their finalised code, which is subject to further testing and integration with the content created by merchandisers. This ensures the code and content work seamlessly before being deployed to the Production instance. Depending on your process, the content is first replicated to the Development instance and tested with the latest code before moving it into staging, where bugs in the code can disrupt the daily merchandising activity. Developers may also export data added by merchandisers on the Staging instance to use as test data for their Sandbox environments. This helps them develop and test their code with realistic data that reflects the actual content and structure of the live storefront. Developers play a collaborative role within the organisation, working closely with merchandisers, SEO engineers, administrators, and QA engineers. This collaboration ensures that all aspects of the digital storefront are well-coordinated, resulting in a seamless and high-quality user experience.

### Merchandiser

A Merchandiser plays a vital role in creating and managing content for a digital storefront, such as campaigns, promotions, and product information. In the Salesforce B2C Commerce ecosystem, Merchandisers typically work within the Staging instance. The Staging environment allows Merchandisers to develop and refine their content strategies and marketing efforts without affecting the live storefront. They can also configure search behaviour to optimise the user experience. Once satisfied with their work, the changes are replicated in the Production instance for seamless integration.

### Quality Assurance Engineer

A Quality Assurance (QA) Engineer is responsible for ensuring the optimal performance and functionality of a digital storefront before it goes live. In the context of Salesforce B2C Commerce, QA Engineers primarily work with the Development instance. The Development instance offers a close replication of the Production environment, allowing QA Engineers to test the site under conditions similar to the live storefront. By thoroughly examining the website's features, design, and user experience, QA Engineers can identify and address any issues before they impact the end-users.

### SEO Specialist

![SEO Specialist looking at a screen with the Google Logo](/media/2023/seo-specialist-looking-at-google-1b930270d3.jpg)

An [SEO Engineer](/lets-go-live-seo/) is crucial in optimising a digital storefront for search engines, ensuring better visibility and higher organic traffic. Typically, an SEO Engineer will utilise the Staging instance to work on various aspects of search engine optimisation. SEOs can configure essential elements such as meta tags, sitemaps, and URL configurations in the Staging environment. These configurations are crucial for improving the website's search engine rankings and overall online visibility. Once the SEO optimisations have been implemented and tested in the Staging instance, they will be replicated in the Production instance. After replication, the SEO Engineer must verify that the changes work as intended on the Production instance. This ensures that the optimisations made in the Staging environment are correctly applied and functioning in the live storefront.

## Conclusion

Understanding the different types of Salesforce B2C Commerce instances and their specific uses is crucial for successfully managing and developing your digital storefront. By assigning the appropriate instance types to the relevant team members within your organization, you can ensure a streamlined and efficient development process, ultimately leading to a better end-user experience for your customers.
