---
title: 'B2C Commerce Cloud Introduction: Exploring Features & Tech Stacks'
description: >-
  Join us for an insightful episode as we delve into the Salesforce B2C Commerce
  Cloud world! We’ll trace the product’s journey, including its acquisition...
lastmod: '2024-10-28T06:53:53.000Z'
url: /sfcc-introduction/
draft: false
heroImage: /media/2024/b2c-commerce-cloud-introduction-323fe8bb6c.jpg
date: '2024-10-28T06:53:07.000Z'
categories:
  - Uncategorized
tags:
  - composable storefront
  - headless
  - sfcc
  - sfra
author: Thomas Theunen
---
https://www.youtube.com/watch?v=qeyqm19m820 AI Summary Here’s a summary of the presentation created by AI. (With a little course correction help from me)

Join me as we delve into the world of B2C Commerce cloud, its history, tech stacks, and the shift towards headless architecture. In this insightful session, learn about the evolution, development languages, APIs, and setting up a composable storefront.

## Introduction to B2C Commerce Cloud (Demandware)

Welcome to the world of B2C Commerce Cloud, part of the expansive Salesforce ecosystem. If you're looking to dive into the intricacies of B2C Commerce Cloud, you're in the right place. Let’s explore what makes this platform unique, how it fits into the Salesforce family, and understand its various components and historical background.

## Evolution from Demandware to B2C Commerce Cloud

### The Demandware Genesis

In 2004, Demandware was founded to offer e-commerce solutions with a unique flavour. After twelve years of service, the company was acquired by Salesforce in 2016 and rebranded as B2C Commerce Cloud. This acquisition coincided with a series of strategic integrations by Salesforce and solidified Demandware’s role as a core component of Salesforce Commerce offerings.

### The Growth Phase

Over the years, several acquisitions and integrations have significantly enhanced B2C Commerce Cloud's capabilities.

## B2C Commerce cloud versus Commerce on Core

One of the first points of clarification when discussing Commerce Cloud is the differentiation between its various offerings:

-   **B2C Commerce Cloud**: Tailored for business-to-consumer interactions.
-   **B2B Commerce Cloud**: Designed for business-to-business operations, also known as Commerce on Core, emphasising its deep integration with the core Salesforce platform.
-   **D2C Commerce Cloud:** Designed for business-to-consumer interactions, focusing on B2B companies directly selling to consumers.

### Managed Packages vs. Cartridges

A unique trait of B2C Commerce Cloud is the absence of managed and unmanaged packages. Instead, developers use cartridges similar to zip files containing all the necessary source code. This differs from the package-based model seen in core Salesforce development.

### Role-Based Access and Permissions

While Salesforce's core platform offers extensive role-based access and permissions options, B2C Commerce Cloud simplifies this by offering module-level access. Users can have read or write access to entire modules, such as products, rather than specific records or fields.

### The Development Landscape

B2C Commerce Cloud utilises JavaScript for both backend and frontend development, marking a notable shift from the Apex and Lightning Web Components traditionally used in core Salesforce.

## B2C Commerce Cloud Development Evolution

### The Early Days: Pipelines

At first, Demandware utilised a pipeline architecture similar to Salesforce flows, adopting a low-code method to establish backend logic. This setup enabled developers to outline page rendering processes using a visual interface.

### Transition to Controllers

In subsequent years, pipelines were supplemented and later largely replaced by controllers written in JavaScript. This phase saw Demandware transitioning into more conventional coding methods while retaining some of its original workflow design elements.

### Modern Stack: Storefront Reference Architecture and Beyond

The most significant evolution in the platform's architecture was the introduction of the Mobile-First Reference Architecture (MFRA) and the Storefront Reference Architecture (SFRA). These updates modernised the front end and established a more modular and flexible e-commerce platform.

### Headless Commerce: Composable Storefront

In 2021, B2C Commerce Cloud underwent another substantial transformation, embracing the headless commerce model with the acquisition and integration of Mobify. This led to the creation of the PWA Kit and Managed Runtime, now known collectively as the Composable Storefront. This shift aimed to separate frontend and backend development, providing:

-   **Flexibility**: Different teams can work on the frontend and backend simultaneously without conflicting changes.
-   **Scalability**: Easier to scale different parts of the application independently.
-   **Adaptability**: Enables use of the latest frontend technologies like React, ensuring developers leverage modern, well-supported tools and frameworks.

## Delving into the Technical Architecture

### Understanding the Composable Storefront

The composable storefront represents the latest and most flexible approach to building e-commerce apps on B2C Commerce Cloud. Here’s how it plays out:

-   **Managed Runtime**: Hosts the frontend application, handling deployment and environment management.
-   **PWA Kit**: A React-based frontend framework that communicates with the backend using robust APIs.

### API Connectivity: Open Commerce API and Salesforce Commerce API

B2C Commerce Cloud offers two primary API sets:

1.  **Open Commerce API (OCAPI)**: The original set of APIs dating back to Demandware's early days.
2.  **Salesforce Commerce API (SCAPI)**: A newer set designed to provide a more seamless and integrated experience with Salesforce environments, capable of connecting to the environment's underlying services, like the product database.

Both APIs enable different degrees of interaction between the frontend and backend systems, with SCAPI being pushed as the preferred future standard.

## Creating Your Own Composable Storefront

### Local Development Setup

To set up a local development environment for the composable storefront:

1.  Clone the [Retail App Example](https://github.com/SalesforceCommerceCloud/pwa-kit) from GitHub. (via npx)
2.  Install necessary dependencies and configure local settings.
3.  Run the application locally to start your development.

```

					npx @salesforce/pwa-kit-create-app
npm start


```

The above commands will set up your project, start the development server, and allow you to make changes to the code, with instant live reloading to see your updates.

## Accessing Sandboxes

[Getting a sandbox](/how-to-get-a-salesforce-b2c-commerce-cloud-sandbox/) is not easy if you are not a partner or customer.

## Conclusion

B2C Commerce Cloud offers a robust, scalable, and customisable solution for modern e-commerce needs. Understanding its history, components, and the evolving development landscape can provide powerful insights for architects, developers, and business owners. Whether you’re just starting or are looking to deepen your expertise, the paths to learning and development within the B2C Commerce Cloud ecosystem are numerous and rewarding. Dive in, explore, and make the most of the invaluable resources available to you.
