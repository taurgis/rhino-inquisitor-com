---
title: Simplifying the Salesforce Order of Execution
description: >-
  How can we simplify the Order of Execution in Salesforce? Find out in this
  article where we only use modern and KISS solutions!
date: '2023-01-09T05:48:13.000Z'
lastmod: '2023-02-26T17:38:41.000Z'
url: /simplifying-the-salesforce-order-of-execution/
draft: false
categories:
  - Salesforce Platform
tags:
  - apex
  - platform
  - salesforce
  - triggers
author: Thomas Theunen
---
When it comes to understanding how Salesforce operates, there are many factors to consider. One key aspect is the "Order of Execution", or the sequence in which Salesforce automation runs. Knowing the order of execution can help you better understand how your code, triggers, flows, and other automation tools operate within the platform. Whether you're a seasoned Salesforce developer or new to the platform, understanding the [Order of Execution](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_triggers_order_of_execution.htm) is essential to maximising the system's potential. But there are so many different automation types available, and do I need to consider all of them in all use cases? This article might spark some heated debate, I am well aware! It delves into the topic of automation and how to choose the right tools for your organization while filtering out unnecessary automation and simplifying processes to reduce complexity. But don't worry, and we're not trying to stir the pot too much... just a little 😜. As software developers and architects, it's essential to consider ways to streamline and improve our workflows constantly. Let's dive in and start the conversation.

## tl;dr - show me the diagram

For the impatient amongst us, here is the diagram showing the simplified representation of the "Order of Execution" based on [the original diagram posted on the Salesforce Architects blog](https://medium.com/salesforce-architects/salesforce-order-of-execution-visualized-76ac45721eba).

[![Simplified Salesforce order-of-execution diagram.](/media/2023/order-of-execution-simplified-apex-api-v56-0-23130ad657.png)](/media/2023/order-of-execution-simplified-apex-api-v56-0-23130ad657.png)

[View on Lucid](https://lucid.app/lucidchart/17edf202-1994-4772-8a0b-4d2835a9799e/edit?viewport_loc=3530%2C810%2C1844%2C838%2C0_0&invitationId=inv_f7af9e9a-9783-47ca-ab06-1142226cad87)

Not for everyone This diagram is meant to assist those starting a new project or has already migrated all of their automation to Flow. Remember that it may not work for every organization, as many have Workflow Rules and Process Builder automation that cannot be migrated overnight. If you are working on Sales or Service Cloud, the original diagram still applies to you if you use these types of automation. The goal is to help you make informed decisions about your automation strategy.​

## The complexity and nuances

### Continuously changing

Small (or significant) changes happen to the "Order of Execution" over time. And details on each step can change, so make sure to re-evaluate this process with each new release - it might impact you more than you might think (in a good or bad way). An excellent example between v55.0 and v56.0 is that the following warning has disappeared: Record-triggered flows If multiple active record-triggered flows are configured, the order in which those flows are executed isn't guaranteed. This is a great improvement, but warrants more investigation: "[In what order are they executed then?](https://help.salesforce.com/s/articleView?id=release-notes.rn_automate_flow_builder_trigger_order.htm&type=5&release=236)"

### An overview

When looking at all the different [automation tools](https://help.salesforce.com/s/articleView?id=sf.process_which_tool.htm&language=en_US) available within the Salesforce platform, it is easy to get overwhelmed. And that is not even considering the order they are executed in on the data.

-   [Workflow Rules](https://help.salesforce.com/s/articleView?id=customize_wf.htm) (retiring)
-   [Process Builder](https://help.salesforce.com/s/articleView?id=sf.process_overview.htm&type=5&language=en_US) (retiring)
-   [Flow Builder](https://help.salesforce.com/s/articleView?id=sf.flow.htm&type=5&language=en_US)
-   [Apex](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_triggers.htm)
-   [Assignment Rules](https://help.salesforce.com/s/articleView?id=sf.customize_leadrules.htm&language=en_US) (Lead & Case)
-   [Escalation Rules](https://help.salesforce.com/s/articleView?id=sf.rules_escalation_best_practices.htm&type=5) (Case)
-   [Entitlement Rules](https://help.salesforce.com/s/articleView?id=sf.entitlements_overview.htm&type=5) (Case & Work Order)
-   [Sharing Rules](https://help.salesforce.com/apex/HTViewHelpDoc?id=sf.security_about_sharing_rules.htm&language=en_us)
-   [Restriction Rules](https://help.salesforce.com/s/articleView?id=sf.security_restriction_rule.htm&release=240.17.0&language=en_us&type=5)
-   [Validation Rules](https://help.salesforce.com/s/articleView?id=sf.fields_defining_field_validation_rules.htm&type=5)

All in all, quite a list, correct? But behind a few of them, we notice that they are retiring or only apply to one or two object types. So what happens if we take those out of the equation? Does that make our "Order of Execution" easier?

### Retiring features

Salesforce [announced in 2021](https://admin.salesforce.com/blog/2021/go-with-the-flow-whats-happening-with-workflow-rules-and-process-builder) that it is retiring the Workflow Rules and Process Builder features in favour of Flow. This change is part of Salesforce's effort to streamline and modernize its platform. For those unfamiliar with Workflow and Process Builder, they are tools that allow users to automate various processes within Salesforce. Workflow Rules is a set of rules that can automatically trigger specific actions based on certain criteria, such as sending an email or updating a field. On the other hand, Process Builder is a visual tool for building automated processes and workflows, allowing users to create complex automation without needing code. It's worth noting that Workflow Rules and Process Builder will not disappear overnight – Salesforce has stated that they will continue supporting these features for the foreseeable future. However, it is strongly recommended that users begin transitioning to Flow as soon as possible, as support for Workflow Rules and Process Builder will eventually be phased out. The first signs are already here, as [you can no longer create new Workflow Rules](https://help.salesforce.com/s/articleView?id=release-notes.rn_automate_flow_mgmt_block_workflow_rules.htm&release=240.17.0&language=en_us&type=5). And yes, not being able to create new automation with Process Builder is next! _So let us take these out of the equation, shall we? Why? Because they are known for some quirky behaviour_:

-   The order of execution takes a turn for the worse in complexity
    -   Custom validation rules, flows, duplicate rules, processes, and escalation rules aren't run again with Workflow field updates.
    -   Workflow Rules executes before update triggers and after update triggers, regardless of the record operation (insert or update), one more time (and only one more time).
-   Recursion (up to 5 more times) in both Workflow Rules and Process Builder
-   Workflow Rules and Process Builder can run Flows - that's a fun one to start debugging

### Object specific features

Another consideration to simplify the chain is to look at processes that only run for a limited set of objects. It may have all started with Sales and Service Cloud. But in the meantime, many new products have joined the ecosystem that do not rely on these object types (and the automation that comes with them). Knowing that we can eliminate:

-   Assignment Rules (Lead & Case)
-   Escalation Rules (Case)
-   Entitlement Rules (Case & Work Order)

## Putting it all together

Now that we have taken out all the above from consideration, we end up with the following updated visual:

[![Simplified Salesforce order-of-execution diagram.](/media/2023/order-of-execution-simplified-apex-api-v56-0-23130ad657.png)](/media/2023/order-of-execution-simplified-apex-api-v56-0-23130ad657.png)

[View on Lucid](https://lucid.app/lucidchart/17edf202-1994-4772-8a0b-4d2835a9799e/edit?viewport_loc=3530%2C810%2C1844%2C838%2C0_0&invitationId=inv_f7af9e9a-9783-47ca-ab06-1142226cad87)

## Why create this diagram?

I am well aware that there is [already a clear and documented visual](https://medium.com/salesforce-architects/salesforce-order-of-execution-visualized-76ac45721eba), and it is linked in the article! But this diagram considers all the items I mentioned before (retiring and object-specific), and I wanted a simplified version taking out all of these and seeing what remained. Not for everyone This diagram is meant to assist those starting a new project or has already migrated all of their automation to Flow. Remember that it may not work for every organization, as many have Workflow Rules and Process Builder automation that cannot be migrated overnight. If you are working on Sales or Service Cloud, the original diagram still applies to you if you use these types of automation. The goal is to help you make informed decisions about your automation strategy.​

### Modern

When all of the retiring options are taken out, many of the known "quirks" fade into the distance - making our automation more future-proof and robust.

### Debugging becomes easier

Another advantage is that debugging the automation becomes a lot easier! There are fewer areas to keep track of, and your logs are cleaner. You don't have to catch them all; it is not a game of Pokémon! [Keep it simple, stupid!](https://en.wikipedia.org/wiki/KISS_principle)

### "Recursion" begone (almost)!

With the disappearance of recursion (up to 5x with Workflow Rules and Process Builder), we do not have to remember that some automation does not run inside that recursion. It is still possible to [create recursion](https://help.salesforce.com/HTViewSolution?id=000199485) with the remaining options, but it is much harder to do so - especially if you follow best practices in Apex and Flow.

### Getting rid of the Trigger warning

After "cleaning up", we are only left with a single warning: "The order in which our Apex Triggers are executed." But luckily, the notice also includes the solution: [Using a framework](https://www.salesforceben.com/the-salesforce-trigger-handler-framework/).

## Conclusion

We can lower the complexity of our automation "chain" when only modern features are used. And if we are not using Sales or Service Cloud, things become easier to keep track of.

> Getting rid of a "chaotic" / fragmented automation landscape is key to predictability & stability of your automations. [Daniel Stange](https://www.linkedin.com/posts/danielstange_simplifying-the-salesforce-order-of-execution-activity-7018472428523642880-Ef-S?utm_source=share&utm_medium=member_desktop)

Of course, cloud-specific automation will not disappear. But give it some time, and Workflow Rules and Process Builder will take their leave from the official diagram. And that will bring the above diagram closer to being obsolete! But until then, feel free to use the visual and make a copy to keep it up to date for yourself! Keeping the diagram up to date As it stands, I have yet to decide if I will spend the time to update this diagram with each new release. So always check the "last updated" date and API version at the top of the visual! For that reason, I have shared the link to the original Lucid file (look at the image) - so others can take charge and make updates where necessary. To err is human Did you spot a typo or mistake? Let me know! You can find links to my socials in the footer.
