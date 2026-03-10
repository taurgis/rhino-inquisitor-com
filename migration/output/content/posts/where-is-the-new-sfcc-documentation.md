---
title: Where can I find the new SFCC Documentation?
description: >-
  In early 2023, we were notified that the Infocenter would be replaced with a
  supposedly more "modern" solution. While some may have looked forward to th...
date: '2023-07-03T06:32:44.000Z'
lastmod: '2023-11-29T06:47:22.000Z'
url: /where-is-the-new-sfcc-documentation/
draft: false
heroImage: /media/2023/documentation-on-the-move-scaled-59762baa75.jpg
categories:
  - Documentation
  - Salesforce Commerce Cloud
tags:
  - documentation
  - sfcc
author: Thomas Theunen
---
In early 2023, we were notified that the Infocenter would be replaced with a supposedly more "modern" solution. While some may have looked forward to this update, others were disappointed by the news.

Were these reactions anticipated? What changes are occurring? And where can we find the relevant [documentation](/salesforce-b2c-commerce-cloud-documentation/) now? Time to have a look!

## The official announcement

In case you didn't catch the official announcement, I've got you covered! Check out this link, or just read my copy/paste work.

-   [Salesforce B2C Commerce Infocenter Documentation Is Moving to Salesforce Help/Salesforce Developers/GitHub Pages](https://help.salesforce.com/s/articleView?id=000395100&type=1)

> Beginning June 15, 2023, the information currently hosted on the Salesforce B2C Commerce Infocenter will be published across three locations.
>
>
> -   Salesforce Help is the new home for administrator and merchandiser content.
> -   Commerce Cloud Developer Center is the new home for most developer-focused content.
> -   Salesforce B2C Commerce Developer Documentation Resources is the new home for the B2C Commerce API and other developer-focused content, including legacy developer documentation.
>
>
> Many improvements were made to the documentation as a part of the migration. As a result, there won’t always be a direct one-to-one mapping between topics in the Salesforce B2C Commerce Infocenter and topics in their new locations. Between June 15 and July 15, B2C Commerce documentation will be available in both the Infocenter and its new locations to help ensure a smooth transition for users. On July 15, 2023, the Infocenter will be retired and will no longer be available.

## The new locations

![Books with documentation scattered on multiple piles, falling over.](/media/2023/documents-on-multiple-locations-5bb9c96f2b.jpg)

The word "locations" in the title of this section may be a concern for many people. Everything once found in a single place is now distributed among several. And the fact that this makes some veterans of SFCC nervous should come as no surprise.

Nevertheless, this will have some advantages:

-   **Separation of concerns**: when looking for technical documentation, you will not be distracted or sent to the wrong place as easily as that happens now. And visa-versa.


-   **Included in the general help:** How well this works out will depend on the quality of the search engine of Salesforce Help. However, having one location and a similar style of documentation as the rest of Salesforce is (for me) a welcome change. The fact the URLs don't contain the search query anymore is also helpful...

## Merchandisers & Admins

-   [Salesforce Help](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_getting_started.htm&type=5)

Although this section applies to all roles, all functional documentation has been put under the "B2C Commerce for Merchandisers and Administrators".

In this section you will find everything about how to:

-   Merchandise B2C Commerce Cloud
-   Data protection & privacy
-   Account Manager
-   Log Center (although this one is technical)
-   Control Center
-   Storefront Toolkit
-   ....

## Developers

-   [Salesforce Developers](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/get-started.html)

Salesforce provides a dedicated site for developers that serves as a centralized location for all developer documentation, with the exception two things which we will address later.

Here you will find:

-   General development guidelines
-   Einstein documentation
-   Customer Service Center
-   [OCAPI](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-commerce-ocapi/get-started-with-ocapi.html) documentation

As with the SCAPI documentation, the OCAPI now also lives in its separated bubble from the rest of the documentation.

### Legacy Documentation

-   [Legacy Documentation](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/LegacyDeveloperDocumentation.pdf)

The Infocenter previously had documentation on features that are no longer available and outdated. Unfortunately, these documents cannot be transferred to the new system. However, they have been consolidated into a single PDF to ensure that important information is not lost.

But does it make it easy to find something if you need it? Probably not.

### B2C Commerce API

-   [B2C Commerce API](https://salesforcecommercecloud.github.io/b2c-dev-doc)

This movement will cause considerable friction with the Salesforce B2C Commerce Cloud developer community. The biggest question here is why it was not moved over to the developer center, to match [what was done on the core platform](https://developer.salesforce.com/docs/atlas.en-us.244.0.apexref.meta/apexref/apex_methods_system_system.htm#apex_System_System_enqueueJob_2).

Understandably, it is a huge effort to move this over - and monthly releases need more maintenance. (Although the release notes of the core platform should not be underestimated....so many pages)

#### An unofficial alternative

Are you completely lost in the new system? Maybe this [unofficial solution](https://github.com/clavery/docset-sfcc-b2c) for [Dash](https://kapeli.com/dash), built by [Charles Lavery](https://github.com/clavery) will help you!

![A screenshot of Dash showing the B2C Commerce Cloud API documentation.](/media/2023/charles-lavery-dash-2de6a904d6.jpg)

## My opinion

![Artwork of a person choosing between two flows.](/media/2023/go-with-the-flow-e1aeefde3e.jpg)

I just go with the flow...but suggest improvements

As it stands for me, this change was to be expected. All new documentation was already moved over to these respective platforms (GitHub taken out of the equation), and the Infocenter was the "odd one out".

However, there is still a lot of work to be done, also on my side to get used to all of these new locations. Whether my workflow will improve or worsen is something I can not comment on yet. But we must give feedback via the known channels (such as [#documentation](https://sfcc-unofficial.slack.com/archives/CM7GDCR54) and [#airing-of-grievences](https://sfcc-unofficial.slack.com/archives/C019VUTDQ86)).

Only time will tell! _Though I suspect the #airing-of-grievences channel on the [Unofficial Slack](https://unofficialsfcc.com/) should be monitored by the Salesforce team._
