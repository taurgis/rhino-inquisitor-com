---
title: A look back at Origin Shielding
description: >-
  September has shown its face, and the sunny weather (at least here) is ending.
  Read the full article on Rhino Inquisitor for implementation details.
date: '2022-09-07T19:53:27.000Z'
lastmod: '2022-09-07T19:53:35.000Z'
url: /a-look-back-at-origin-shielding/
draft: false
heroImage: /media/2022/look-back-scaled-7bb346c563.jpg
categories:
  - Community
tags:
  - ohana
  - security
  - sfcc
  - technical
author: Thomas Theunen
---
September has shown its face, and the sunny weather (at least here) is ending. And with that also the complete activation of [Origin Shielding](https://help.salesforce.com/s/articleView?id=000364472&type=1), or it simply: "Putting everything behind the eCDN." For most, this change had little effect as it meant switching all third-party integrations from the demandware.net domain to the brand vanity domain. But for some, this was not a fairytale story. Why is that? _**Note:**_ _This article is pure speculation on my part, and I did not look at which percentage of Salesforce B2C Commerce Cloud customers did not have the "fairytale story." Even though this percentage is probably on the low side, I do feel the need to look at the possible cause._

## Communication

The first thing to make people aware of a change is communicating it to them as soon as possible. And from personal experience, I did get this notification quite a while in advance. I looked back in my documents and e-mails and found the first reference to this change in July 2021! A year in advance!

[![First communication about origin shielding from July 2021.](/media/2022/origin-shielding-first-mention-9d41cb51f2.jpg)](/media/2022/origin-shielding-first-mention-9d41cb51f2.jpg)

But, of course, the information given back then was pretty vague. And the impact on projects could not be estimated by this alone.

### What about 2022?

Months go by without any mention of this change, but I did know that this "Origin Shielding" for “dotted” URLs (i.e., http://production.xxx.demandware.net/) was [already active for new customers since June 21'](https://help.salesforce.com/s/articleView?id=sf.rn_b2c_selective_origin_shielding_w9343605_je.htm&type=5). In March, I joined the B2C Roadmap Session again (or a different webinar, I can't remember), and here we got the announcement for "phase 2": Origin Shielding activation for ‘hyphenated’ URLs (i.e., production-xxx.demandware.net).

[![March 2022 roadmap slide announcing the next origin shielding phase.](/media/2022/march-2022-origin-shielding-815c30777b.jpg)](/media/2022/march-2022-origin-shielding-815c30777b.jpg)

So again, quite a bit in advance: about six months to change demandware.net to your vanity domain. Over the months, this was shared across multiple channels: Trailblazer Communities, Webinars, [and slides shared with the release notes](https://help.salesforce.com/articleView?id=b2c_rn_release_notes.htm&type=5). I probably missed other media that might have been customer-facing. But as a partner, I do not get these. All in all, quite a lot of warnings ahead of time.

## Monitoring of these channels

But for communication to work, you need a second crucial thing to happen: "People need to read or view your communication." And honestly, I believe this is where the issue lies. Over the past few years, I have been monitoring multiple channels to stay up to date with everything:

-   Trailblazer communities
-   Partner communities
-   Webinars
-   Round tables
-   Slacking with people and monitoring different Slack channels

Without making all this effort, I would have missed quite a lot of vital information (which I probably did before I started monitoring.) Most of all, when I talk about all of these channels - especially the Partner Community - it appears that most people do not know these existed in the first place! And that is a problem because a lot of communication only happens there. If we look at all information about On-Demand-Sandboxes, I think about 95% of the communication happens in [a dedicated Partner Community](https://partners.salesforce.com/_ui/core/chatter/groups/GroupProfilePage?g=0F93A000000DQ6f).

### Single point of failure?

But what if someone is monitoring this communication (or has received an email) but is not sharing it with everyone? Or maybe the person receiving the communication is no longer working at the company, causing vital communication to be missed. I think it is essential that multiple people receive these notifications, so maybe it makes sense to set up a mailing list rather than having a single person receive this communication.

## Who is to blame?

This question probably drove you to this article. But sorry to disappoint, I don't feel anyone is to blame here. Partners and customers should be aware of these communities and subscribe to appropriate channels. But Salesforce needs to make people aware that these channels exist, and maybe they do - but do not express the value that monitoring these channels brings. I have brought all these sites into our onboarding process to ensure everyone can access this valuable information. But in the end, it is up to the individual to do the necessary actions of subscribing. So, in conclusion, work needs to be done on all sides! And hopefully, this article has made people aware of these channels and the value they bring. Feel free to share in the comments how you get your intel!
