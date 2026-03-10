---
title: What is Salesforce B2C Commerce on Core?
description: >-
  People who have been around "$1" for a while and continued after the
  acquisition by Salesforce know that this announcement was bound to happen at
  one po...
lastmod: '2023-02-08T18:02:55.000Z'
url: /what-is-commerce-on-core/
draft: false
date: '2022-10-09T14:17:31.000Z'
categories:
  - Salesforce Commerce Cloud
tags:
  - security
  - sfcc
  - technical
author: Thomas Theunen
---
People who have been around "[Demandware](https://www.rhino-inquisitor.com/sitegenesis-vs-sfra-vs-pwa/)" for a while and continued after the acquisition by Salesforce know that this announcement was bound to happen at one point.

It is a question that many have asked over the years looking at the core platform of Salesforce: "When will they migrate everything and move Salesforce B2C Commerce Cloud to the Salesforce core platform ( [force.com](https://www.salesforce.com/products/platform/products/force/?sfdc-redirect=300) )?"

During Dreamforce, the first mention of this happening reared its face this year. During the keynote even! Although honestly, if you blinked, you probably missed this.

A big announcement for Marketing Cloud is "hidden" in this slide too 😉.

[![](https://www.rhino-inquisitor.com/wp-content/uploads/2022/10/commerce-on-core-1024x521.jpg)](https://www.rhino-inquisitor.com/wp-content/uploads/2022/10/commerce-on-core.jpg)

The Dreamforce '22 Main Keynote

There was another slide and a short presentation they gave during the Keynote, but it seems it never made it to [Salesforce Plus](https://www.salesforce.com/plus/experience/Dreamforce_2022/series/Best_of_Dreamforce/episode/episode-s1e4). Unfortunately, I was not able to snap a pic of that one.

However, I found another slide in one of the more recent presentations for onboarding new partners.

[![](https://www.rhino-inquisitor.com/wp-content/uploads/2022/10/commerce-on-core-subscriptions-1024x573.jpg)](https://www.rhino-inquisitor.com/wp-content/uploads/2022/10/commerce-on-core-subscriptions.jpg)

Commerce on Core can take many shapes and forms.

Speculation Before you continue to read on, the article below is speculation and opinionated (my opinion only). So take everything with a grain of salt and contact Salesforce if you want to know more! **I do not work for Salesforce, and I do not know the internal roadmap!**

## Is it happening?

Yes, I have talked with multiple people within Salesforce. This change has been in the works for quite a while now. And this should have been clear if you look at some of the decisions made over the past two years and where Salesforce put focus.

Though not much is known about this topic yet, I first saw mention of this "Commerce on Core" in September for research and UX testing.

## When is it happening?

As I have mentioned, a roadmap is not yet publicly available, nor is much information to be found.

What can be speculated is that this will only be for new customers and likely only for small to medium businesses at first. The reasons why this will be the case should become more apparent as you continue reading.

_And more importantly, there is no reason to "**panic**." This change will take many more years to complete, and innovations will keep happening to the current set-up (albeit in a different form - Composable microservices, anyone?). So please keep on reading!_

## What will it look like?

![](https://www.rhino-inquisitor.com/wp-content/uploads/2022/10/experience-cloud-1024x565.jpg)

Hard to say, looking from the outside in. But chances are incredibly high that it will be the [B2B2C](https://trailhead.salesforce.com/content/learn/modules/b2b2c-commerce-basics) offering that will be used as a basis for this product. And I am sure the Composable Storefront will play a significant role in this transition.

## The preparations that Salesforce has done

So what signs were there of the preparational work? Let's dig into what has happened in the past few years, shall we?

### SCAPI

An essential part of understanding how the SCAPI works is that [Mulesoft](https://www.mulesoft.com/) is involved. Using this orchestration layer allows for a lot more flexibility for future choices, and one of these options is ... drumroll please ... swapping out systems!

### OCI

The [Omnichannel Inventory](https://www.rhino-inquisitor.com/what-is-oci-omnichannel-inventory/) (part of the B2C Commerce Cloud license) was another sign that Salesforce pointed products more to a "composable architecture." It is a separate product that can be used for B2C, B2B, B2B2C, or other applications.

Many other products that followed, like Order Management and Commerce Marketplaces, were separated from the B2C Offering, and most noteworthy are on the [force.com](https://www.salesforce.com/products/platform/products/force/) (core) platform.

### Composable Storefront

![](https://www.rhino-inquisitor.com/wp-content/uploads/2022/10/composable-storefront.png)

Another separate product on its own "stack" is the [PWA Kit](https://www.rhino-inquisitor.com/sitegenesis-vs-sfra-vs-pwa/) (or now rebranded to the Composable Storefront).

A headless storefront talking to the SCAPI, rather than the monolithic setup of SiteGenesis and SFRA, will allow back-end systems to be swapped more easily.

Off course, the composable storefront has many more advantages, but composability is one of the signature advantages!

## Advantages of moving to the "Core"

### Hook into everything!

Unlike the current stack, we can [hook into all events](https://www.salesforce.com/products/platform/solutions/automate-business-processes/) that happen to objects:

-   Create
-   Update
-   Delete



And we can do this for all cases: imports, "Business Manager" modifications, REST API, ...

This would solve one of the most common gripes of not being able to hook into Business Manager pages to add validations or other extensions. And, of course, it gives us much more flexibility about what we can do.

With great power comes great responsibility Given this flexibility, you can also mess up a lot more. You could, for instance, break the entire import with a click of a button.

### Truly API first

The force.com platform comes with a way more extensive array of integration options than we have with Salesforce B2C Commerce:

-   [SOAP API](https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/sforce_api_quickstart_intro.htm) (got to mention it, sorry )
-   [REST API](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_rest.htm)
-   [Connect REST API](https://developer.salesforce.com/docs/atlas.en-us.chatterapi.meta/chatterapi/intro_what_is_chatter_connect.htm)
-   [Apex REST & SOAP API](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_rest_intro.htm) (Custom Endpoints through code)
-   [Tooling API](https://developer.salesforce.com/docs/atlas.en-us.api_tooling.meta/api_tooling/intro_api_tooling.htm)
-   [Bulk API](https://developer.salesforce.com/docs/atlas.en-us.api_asynch.meta/api_asynch/asynch_api_intro.htm)
-   [Metadata API](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_intro.htm)
-   [Streaming API](https://developer.salesforce.com/docs/atlas.en-us.api_streaming.meta/api_streaming/intro_stream.htm)
-   [Pub/Sub API](https://developer.salesforce.com/blogs/2021/07/pub-sub-api-building-event-driven-integrations-just-got-even-easier)
-   [Composite API](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_composite_composite.htm) (part of the REST API)
-   [Composite Graph API](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/using_resources_composite_graph.htm) (part of the REST API)



And maybe I missed one... But that sure is a lot of options, isn't it?

### Actually integrated

I am not going too deep into B2C Solution Architecture as it stands now. There is [an excellent book for you](https://www.amazon.com/Salesforce-Solution-Architects-business-consumer/dp/1801817030) already available!

But anyone who has had to integrate Service Cloud, Marketing Cloud, or Order Management can see the advantages of having B2C Commerce Cloud join the fray on the core platform.

Now don't get me wrong. The grass is always greener on the other side, and if this move happens, we will have other fish to fry!

### Sandboxes and replication

You have many more options for Sandboxes on the core platform, including [copying metadata from a production instance to a Sandbox](https://help.salesforce.com/s/articleView?id=sf.data_sandbox_refresh.htm&language=en_US&type=5).

This could also open up the road for Trailhead to have hands-on exercises!

### Flows

![](https://www.rhino-inquisitor.com/wp-content/uploads/2022/10/salesforceflow.jpg)

Does anyone miss pipelines? The good news is that there is a low / no-code alternative to Apex (code) to do automation: [Lightning Flow](https://www.salesforce.com/blog/introducing-lightning-flow-blog/).

## Will bits and pieces remain from the current stack (Demandware)?

I am optimistic some bits and pieces will be used to resolve some of the “shortcomings“ of the core platform. A good example is the high-scale cart/basket service already used behind the scenes in the “Demandware” stack. It would make a lot of sense to move this over.

Maybe the promotion engine is also a good contender, as it will work well in conjunction with the cart service. But this is something that only the future (and Salesforce) can tell.

Wouldn't we all wish to get a glass ball to see what the future holds? But this keeps things exciting and fresh.

## What is stopping the move?

### Features

Currently, the core platform does not have all the features that B2C Commerce Cloud offers. Before making the switch possible, it will take time to "migrate" all of these.

### Performance

Currently, B2B and B2B2C are already on the core platform. But generally have lower traffic (but higher volume) than a B2C site.

Especially during the holiday seasons and days like Black Friday, I am not sure that the way it stands, the platform will be able to provide a good and performant user experience.

The Composable Storefront end [Genie](https://www.forward.eu/blog/salesforce-genie-the-architecture/) is possibly the first step to make this happen, but we are not there yet. I will keep an eye on all the channels to see this evolve and maybe even try to get some hands-on access.

But for now, I have more questions than I have answers.

### Existing customers

Did I scare some of you? Have you just bought or started implementing SFRA? No worries. The current setup is not going anywhere soon. If you look at how many customers are still on SiteGenesis, it will take a very long time to migrate everyone away from how everything is set up now.

And I hope Salesforce will give us a heads-up a few years in advance on the Commerce on Core road map and how this affects customers.

## Should I worry?

![](https://www.rhino-inquisitor.com/wp-content/uploads/2022/10/confused-people-on-the-street.jpg)

As mentioned in the previous section, it will take a while before existing customers are contacted about migrating to the new platform. I guess a minimum of 5-7 years before this will start occurring, but who knows - I have been wrong before.

In the meanwhile, updates will happen to the current stack. And new features will be added. You might see a shift that features are separate products rather than being built in, such as the OMS, Marketplace, Composable Storefront, and OCI. Some will be included in the license, and others will come at an extra cost.

This is a long time to prepare for this change as a customer and developer. And have you recently chosen the Composable Storefront (PWA Kit) as your go-to solution? Then there is nothing to worry about, as this will make migrating the back end "easier."

### What about SFRA?

Did you choose an [SFRA](https://www.rhino-inquisitor.com/sitegenesis-vs-sfra-vs-pwa/) setup? Then again: there is nothing to worry about. This change will take many years to come to fruition. You have a solution for your needs now (and in the near to medium future), and SFRA will do that perfectly. In many cases, a need to renew your stack arises every few years.

Technology evolves rapidly, and who knows what options will be available in 5 years!

### I am on SiteGenesis - What do I do?

At any rate, moving away from [SiteGenesis](https://www.rhino-inquisitor.com/sitegenesis-vs-sfra-vs-pwa/) should be somewhere at the top of your priority list. But as to what the best option for your situation is: Talk to [your implementation team](https://www.forward.eu) and Salesforce.

Everyone has their requirements and needs for now and the future, and all options on the table have pros and cons.

And the good news is - With Salesforce, you have many options to choose from:

-   SFRA
-   Composable Storefront
-   Hybrid migration from SiteGenesis to the Composable Storefront
-   Build your own Headless Storefront
-   Commerce on Core ([B2B2C](https://trailhead.salesforce.com/content/learn/modules/b2b2c-commerce-basics))



### My personal take

I have no negative and no positive feelings about this change. It will all depend on the future and whether all missing features make it to the core platform to handle B2CE customers.
The most important thing is that the new stack can provide a stable, secure, performant, and “ready to tackle the future” solution for customers.

I am not married to a particular stack and have made many switches over the past decade. I like to discover new ways of doing things, and whichever way you put it - the force.com platform does resolve some of the shortcomings we have in the current setup.

But then again, the current stack has a lot of advantages over the force.com platform too.

### How do you feel about this change?

[Leave a reply](#reply-title) on this page to express your opinion!
