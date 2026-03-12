---
title: Campaign ERD of Salesforce B2C Commerce Cloud
description: >-
  Are you wondering what entities make up a campaign in SFCC and how they are
  connected? Then look no more! Here is a small ERD.
date: '2023-02-27T08:24:42.000Z'
lastmod: '2023-02-27T18:57:17.000Z'
url: /b2c-commerce-cloud-campaign-erd/
draft: false
heroImage: /wp-content/uploads/2023/02/newsletter-surrounded-by-cogwheels.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - erd
  - sfcc
  - technical
author: Thomas Theunen
---
When scouring the documentation for the Campaign ERD ([Entity–relationship model](https://en.wikipedia.org/wiki/Entity%E2%80%93relationship_model)) of [Salesforce B2C Commerce Cloud](https://www.rhino-inquisitor.com/the-salesforce-b2c-commerce-cloud-environment/), you have probably come out empty-handed.

Sure, you find many diagrams on the entity model of [force.com](https://salesforce.stackexchange.com/questions/22720/standard-objects-in-salesforce) with a quick Google! But not so for SFCC. That is why I started to create my own, and share them with you!

The fourth on the [list](https://www.rhino-inquisitor.com/tag/erd/): Campaigns! And this one has quite a few things to remember for such a small diagram.

[![](/media/2023/salesforce-b2c-commerce-cloud-diagram-campaign-erd-4b241c1470.png)](/media/2023/salesforce-b2c-commerce-cloud-diagram-campaign-erd-4b241c1470.png)

[View this diagram on draw.io!](https://viewer.diagrams.net/?tags=%7B%7D&highlight=0000ff&edit=_blank&layers=1&nav=1&title=Salesforce%20B2C%20Commerce%20Cloud%20Diagram%20\(2\).drawio#R7V1Zd6rMEv01Weveh7igm%2FERnOIUTdQ4vKGgoiAEcPz1X4NgFNGTGMEhnZMTpZjp6l21q6qbJ5jWl3lLMkcVQ1a0J0DIyyeYeQKA4wD66wpWGwFF8RvB0FLljYj8EtTVteILCV86U2XF3tvQMQzNUc19Yd%2BYTpW%2BsyeTLMtY7G82MLT9s5rSUDkQ1PuSdihtqbIz8m%2BLJr7kL4o6HAVnJgl%2FjS4FG%2FsCeyTJxmJHBLNPMG0ZhrP5pi%2FTiuY%2Bu%2BC5bPbLHVm7vTBLmTrf2cFvCNtZBfc2t%2BVlIYO%2Bk09QHKialjY0w0LLU2OKNhGHliSr6Oghsbtl1ZT6quO2KYEktmMZEyUkc5emw4ZhIsEz%2FJKIhuMYekhYVgZOSPTuP1VPZhrq1PGakhbRL5EiuCeQJlI863480eh20p6cByE5%2BoWiJvUUTZT6k6FlzKZy6IY8mSL7D2JzM6FNRo6u%2BesXI9VR6uga3ae4QEqPZIdt4TfPXLEcZbkj8tsmrxi64lgrtIm%2FFtL0Zhe%2Fo9AEu1lefKkdTfmHHe2oHGB8bfc1fbg99JcyoC%2B%2BPkTrBjyuGyCkG08ADryfXyvISDLdk9mOMu2r2v%2FmH42ybFSG2RohadMi9QTEgkjq86Uwp8SG2i6Wlp0qYQ8gY%2BiVXkXS2a4hQ9Zea%2BuxoA5GI4lszbMrMc0pfLPdpPotrj7I6lVNYpugUOTqNRW1U666ns3zM%2FRFmY1mvPJe74wrTNFalbINffmitWn2VVtIlU6WsYRh6Q1dhdJBf4r2x1Jt1ow%2BMxn2u2xtJUwLtixNuEktPxnWBu1l1RCq49KqW5VUrtT5lLMVvS2LolJlinnpowffWk6vtP5oEvW8Skv8ataxdH7a6CmrgtrU6XdozsiOURzXyYoDuPrn8o3TZPgye82vJu9KNrcqzZV8oT%2Bu9tPDWbdaNh1CQrfxgv5DmeDWJfX1s2vzrOZ0J2%2B53KTNwHLHKdmfaAtR1gbTttrRlo0WSQ7LVZap9ug%2B8zYXM1RFnv8%2F9g7r9Up6r7OSEbLNMhkhI87u0D%2Fuu%2BDbfTeJvkn5VyNpM79vPgFGQycQZXW%2B12mZz5lrTMSBMXWebc%2BUCmgD0lx%2BrUPfhv6ndwwz8giSpg6naO8%2BeiYKerCiLllDdfqsea0uMF8Sa3OzuyLH1SABoLNuRT1fhQTCk6LH6jyrqIncJy64YDAPzqirsuxeDLo5C9lz1XCFmmNtLvnITbg3%2FM8nQTIpHnqn96QDSVc1hEWCYKkSevZif6ND6IlBiZcGPS7yIjTFQU%2Fk2Vf57R1p6lR5Dlpe8JwAGomNAPEE8vjV9wJBHXkd9sCwkHYCQkS6D4i0oevKRpDWjJmMPp%2Fd75JuSu4D8w%2BBdKgXPiySbZ7LgdiMkHm6FEhDtsBtLreNsLtwIXfBRRYV%2BZjCRukzW6X3e0Fm2%2B%2F2j%2FUbqPLXghRN7fkZIBUA1y6YQSZFcxF4RqZo%2FveQRh93N6i7060rWrZbcVUhjHBVwaH6kOTvdYc5rjt00q5qrrbwXNVSz6yihwNyRg4Kn80m4yhFARQ1fsAXzVa9Cmag%2F1JpFyS6P2lzlXL3kyio70RjziIWC0SdV6HaoIZLgh1I%2BXe%2BpYrce41e2QQF1i%2BQeEXbENlcsV4pG%2FrMMHpVKat8KG1u%2BSEQnYW5LrwIqjVglYFdLRFcUxx00h0p1yqK02xBWXdNpZfP9St8lW69veS6wrw%2Bzsr57idXbX729Yree1WUVo1Vq7OmhNzUebnYMOnPQt7mpcxy1unp6M7aeptqmJKxKLWZJTRsdaIOK%2FWlmTNa9Xl1wRcmtDXNzmt8Vaw3KobW6Ghatq%2BwLEIREbrPBrmy00mLWg%2BQGWOZWkMoL18Eu1tjW8Rbe7q0MyO00ZggO2WhUjLAjMnMuuyK6Wde6hkqP8iMcx55hhnsrO72Xvo8ZzWm3sliZ%2FUiziqf4rhb8lUbI0NHegGIxkiZTRXkeBLuL5vefEH%2FQPx%2BJ%2FYN7sYv%2FT4qHfNLkacZEQCDbApE8GxE7S7glnLHXQvmR6oX%2Bew3wiCInADncfXnGVGfKL0iD8X8MYoEo7cnNtSJgGE53ByHS84G%2FtiDpVm4p2zbeP6OrpE8cahowX6%2FUTP%2BuJqxP%2FdgD3zTbq3Xd8OoBWkwmjhwWGsKJJgyL5NVemXWS0Oms%2ByRnC3VPyVTG7zCXuFlYKFrziFQF8UZ8hvnaWmQYV5Br2bOx0AscoXuqmc5bWWczqqztEJ90rA9bitTdjSuzbsGizRKHMuD%2FgI2XvLV9ajab89KxY9%2BZvKB1nTIVxWZg1w69%2BHGKeqUuOLH8%2FlCLq1yWgW2rVLJmq4%2Fx0hHxsUM7QDjfVZlzCBoWi5Ln2rHzLQUx%2FWDW1K554ZxdZ0RC6PsG0uMB%2B%2BSLtCq3RSkZaEpjvlew6kZOb2cXrAfC6Zv9msVQhhVFbZTnBWQvcnVkCnLTeam0KCF0lAofXQFUXkziXw3MxwTZXrhGrFRNfPS77WWryMTtD449rVUV2fQjbem33Y80b2%2BjhqMpdx%2FBx0ePKqxIc7psdw5XmtsPTJINkZ1Se6wSxLez488j1Anba4%2FQNmmC%2BXs6OO1UTDK6rS0JihnTSzM1YdAylqWrNhWZUUMnZW6EG2t%2Ftr%2BaL1O5dpKJcsNFd1RscyRhSH6UihmJ1njrYQcR5DL5N%2FTYrM%2B0LtMt9pUG5NmVvuoiP01PyyUq4V8s4s6UUPvKBPoFOtr%2Bm3Fd7tMzpQoslVlRmSDZKqUWBmllQY3r6ya%2BdbbG6cbojBRC6QsnKH4D%2BtlPYLiB5bzhvgaccjXdkQbvkbcGl8jQYqN4GtpdOaepe4zti18nMvYSORk7f6Q5yQbrptCwP707fjTl2N93we3YC3qNvvZCDZFH6YjSIZORbA%2Bktlu%2FCsQPFEZw9%2Bfnt5T8PLHxG2b8boGcSNPlMmQBKZumLrdWZ89y4MN4PJWXFjqRKcMVypg8obJ2wOpfhBlx%2Bztz7E3Y2YaV%2BJu2Ce%2BSfL1A3C6KfZ1oqCHDBef34GqHQ0TuI5KFO%2FnjsQDwmGFG2Rj4TQaCQg6QTrGntAciOkYpmN3Zi7O80mZ2%2FJJTxRRkOECHkzHMB17INXnMR37o3SsZhm64Z38OgNysJ8cn598QYb2fby6JYYGTlTHkOGKtXvRvCOKtKeQd8C4GBYkR7iCy41UhIg6qcFAgRTAhAsTrkfyOgM4vBGvM0iIR3bKcKgWEy5MuB5I9SEmXH%2BUcKVnNnpqipVHGm1eiXRh1%2FcaJOoHGHRTJOpEmQp4CPp%2Bg2yJB%2FtjChOtFjw1ywXA6SnMlv6Gy0h9u9Mm0ilPVBsAnJ7CbOmBVf8G5%2Ba4T7ZEpUjye5NzXIksEXVjZvVRh5WVMEGKiQxhFzZm1vN9LDnFeiKSBfGynhPVICA8Xde9qMyNF%2BWFSU%2ByKaITk1uA8KBPnCLCpOcxPb%2FbGuUPTyTwQcSUM5j0YNLzKKqPJ7j4qymimqX2FdEwJtdJD2H3Nl5CdJ9zTcAT1RowPIXAPWjMsVlL7pAokUSgVIlYphOTScCIcesKR0JvVBNmSpgpPYy7GODhrbiLJ7L0MBziRG0MWAISJzolZkqYKd2L6uPJJBJPD21LPpIkSnXHsJJKC2GX9irk6AfQckvZIniiOAOGizPuQpM2xodg7nCk0QE7SnRuB3hibgd4xnt%2BMDvC7OgOXcTbGuAOT2TzYURyF%2BeRMDt6FNXHczv8jeI5jx0lQIywO3sdZnSZKRiSZkbUiQoO6mev470NVdrMiu%2B9tetmGVB4rvFEC%2BmCl%2FJGtnhEJBoX0mEC9HheYIB7N%2BIFBm9NjeyUEUP6MAHCBOhRVB%2FPtfBXC%2BnqmoGAC7WAx4SuUEqHPdx4SdEPoOaWaumoE8Ua1P1VX%2Frk%2Bp4YUbIVc9SJCRWoyLFFOCeEKdHD%2BYW3NaqcOpGzp%2FDYIkyJHlj18YQKf5YSGcj3Rj1rpilXokTYv42RD11msoXE%2BdCJ8gzqDl%2FadRdlcgevQKLJBOeYo05Mt0CHa28xJcKU6DH9wtsac06fSNbT%2BI20mBI9sOrj6Rb%2BKiXavgKppklXeg0SdnJj5kX3OedCUK0XWbaOblSRh0rdX7fVAslyBMsyFl8yZSqHJN5Wda%2FDZujNFjtLBwZN4qVBj7u4Rh1t3522%2FIk6KUvVabu6nyI4SLI84FmaZwkK0MHajreWZ0gaclTwl%2FFXZpZ%2Bv%2FEWVjsLNcVSUeO5qraRTVFDbs7EAwqQFEWyLEXxJMMHa4%2BfyV37dSpvabW7FD7ZUapne1Nl%2Btq5EaFmHSrOnsjVkZMKbyma5KhzZe%2FYUVrr71pzceCrozyH9jAGA9ulKF9ajnRPWu1s4QNJuB9sL%2Bl7XQNXdVzIXpMpwH%2BvrH3z8wtzjWz9v%2B2zGZhj%2B%2FJ29%2BsVGHQ0fMqSPdriibtQk9wbc9EJWQT3%2Bgkm5bks%2FwDa7PtasYyGUZGmq5OAy0cB7vZJ3wzg7oZg9lH3wBhvYXgPdGmC4Sgekv4n%2BAXo7mNs1IFjwVgyAmSDFyPGjbJkMBNi4I2cD7pHTsAzKWbvFBzH7h7wG3uQyBb6oi9g31zI2TAfBLQxzMcD8%2FHwsm8BvWHJilU7QPueG4XdMQbyrO%2F8Yyt7pJomupx%2FHyx%2By0KDsxxzbC9cKN%2BxGB6zhAzPMTD4%2FI2fTu8aDTJFABbyLGD8TzY2oxEwz2sYjcA1D2zGxY0Gw3D7BgDyVMovdjtmNtA%2BqeAFQ8d3%2B73hwJMCJc4PthP9xWo23r1OgUAcgT66%2Bqnh3oM0l1SERF9FDXvAr07d3jZ13GPGh%2FwU93NOsaEUIIJShAzC6RgOv2ciImM428a5ZxOxH8chOOSEkiwXfP7GPhCAQRSC5XiKhYhHAHKfZOyaIfczPntBHdoLLmZzsdo3F0lHchiM1Bipk0VqCiN17M4878EoQW%2BAld9B7gDFzwTq7TF9sN5H6pBnHyNSE8kjdbRjfy3gxlXEDxubsfdfwxZnwIQifg7GOBT%2FUzTmQv7tLhxHRkPOw2fXTO6hcyghmlywnjlE52BeyKThGdD8pSMvbCgfQEJAewN3TwXsSY5J0cxF9uOQiOEvG7EJajSwOXk4c9Kf2eixKFbsxgTy2JjEb0xIeNy3v6AxCUXtj2QEkjMfRLLm43LWgub5Q9TnqNNxeuhNl%2FfrvRiwmUriZEqARWzxH3v93r7giTAftGLIdme%2BjNWqHInsx2orHiQMtJvTJcMATt2lcQheUrBrHGDcOd2EgzsMgdESo%2BV5aMnGi5YPHTTfT0Lu5jsvC55EOIpO7aKpO1XybpyG3GLtT8AUNVlOdRHm%2B9AaUS0TE7LGg5p4FNnDxjDs7dunYgXP88b1YFfTK9Kg9pKDO%2BDpzmr4lRNEn78Dz1vJQUbBZdzjfpJ2RAGG1IeF1OSyjOBIYBiHe%2F%2BFq%2Fs1d%2Fc%2FjCcCM2NPDCaNmXhw5IOSd9NS%2B4poGJNYsfIa4c6HwMqHHMISoOMeYj52TTKDhx0%2BLIAmMAZwM3oAAyjOFx3zOGMfAhjjID%2BCobxXjP8jo8%2FS%2F9rt1yl9Bg%2Fye1CY7hszM%2BYZQBiM0Wdi9A5CXzIgEBpyd82AQDDVxy2Xev3GvcVD7h42pppYqS04Mm4DA%2BifjBJEhVXjLphNNEiAFi3D7Wpfm1uSOaoYsuJu8R8%3D)

## Some additional explanation

### Promotion relationships

You will notice that a solid line does not depict the relationships between promotion and CustomerGroup, SourceCodeGroup, and Coupon in the Campaign ERD.

This is because they are more "helper attributes/functions" made available on the entity, so you do not have to traverse all the related Campaigns yourself.

In reality, there is no direct relationship.

### StoreGroup & Store

People familiar with SFCC will look confused when they see "[Stores](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_campaign_Campaign.html?resultof=%22%63%61%6d%70%61%69%67%6e%22%20#dw_campaign_Campaign_getStores_DetailAnchor)" and "[StoreGroup](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_catalog_StoreGroup.html)" pop up in this Campaign ERD. (or maybe you have seen this by accident in the documentation or IntelliSense)

Even though this relationship is visible/accessible in the code, you can not assign "Store Groups" or "Stores" to a Campaign in the Business Manager.

It is also impossible to manage Store Groups from within the business manager. Or can we? It appears that this functionality is behind an undocumented feature switch!

After creating a support ticket, two new features appear in the business manager. First, we get a new administrative module!

https://www.rhino-inquisitor.com/wp-content/uploads/2023/02/campaign-store-groups-sfcc-2023-v2.mov

And suddenly, within campaign management, we get new options!

[![](/media/2023/campaign-store-groups-sfcc-1a646a927d.png)](/media/2023/campaign-store-groups-sfcc-1a646a927d.png)

Campaign Details

**Unfortunately, this Campaign feature does not appear to work in the storefront** (I got your hopes up there, didn't I 😉).

I experimented with the [StoreMgr.setStoreIDToSession()](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_catalog_StoreMgr.html#dw_catalog_StoreMgr_setStoreIDToSession_String_DetailAnchor) function, which did not activate an In-Store-only campaign. These scopes are also unavailable in the SCAPI/OCAPI, meaning we can not use them for Headless applications either.

If anyone has gotten this feature to work, please let me know on the social channels I am active on!

> [!NOTE]
> **Thanks:** Thanks to [Paul Shaver](https://www.linkedin.com/in/paulshaver/) for telling me about the "hidden feature switch"!

#### Import

It is possible to import this data, as described in the [store.xsd](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/xsd/store.xsd) file:

### Slots & Sorting Rules

It is possible to assign these to a campaign in the Business Manager, but they are not accessible through code.

### SlotContent, SortingRule, and PriceBook

These entities have been marked in yellow as there is a larger entity model behind them. These have been made available in other [ERD posts](https://www.rhino-inquisitor.com/tag/erd/) I have done (or will do) on this blog.

## More to follow?

You can be sure of that! Next is the basket and order ERD, so keep an eye out for this blog! There are still quite a few entities within Salesforce B2C Commerce Cloud, each in charge of an essential role within the entire flow.

Next up is basket and order, [so keep an eye out](https://www.rhino-inquisitor.com/category/salesforce-commerce-cloud/erd/) for this blog!

### Mistakes?

Don’t you love being human? We get to make mistakes and call it part of the experience. Please don't be shy if you spot something that needs fixing in this Campaign ERD. Let me know!
