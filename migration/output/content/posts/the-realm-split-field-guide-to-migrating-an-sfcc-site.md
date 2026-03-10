---
title: 'The Realm Split: A Developer''s Field Guide to Migrating an SFCC Site'
description: >-
  Learn when an SFCC realm split is justified, how to plan the migration, and
  which data, SEO, and operational risks demand the most attention.
date: '2025-09-08T09:14:15.000Z'
lastmod: '2025-09-05T11:12:50.000Z'
url: /the-realm-split-field-guide-to-migrating-an-sfcc-site/
draft: false
heroImage: /media/2025/realm-split-in-sfcc-c392b8965d.jpg
categories:
  - Architecture
  - Salesforce Commerce Cloud
tags:
  - sfcc
  - technical
author: Thomas Theunen
---
Have you ever found yourself in a deployment-day standoff? Your team is ready to push a critical feature for the US site, but it's blocked because a seemingly unrelated change for the EU site, which shares your codebase, has failed QA. You're stuck. This kind of organisational friction, where independent business units become entangled in a shared technical fate, is a clear signal that your single Salesforce B2C Commerce Cloud realm is cracking under pressure. The technical dependencies that once streamlined operations now create bottlenecks, and the shared codebase that once promised efficiency has become a source of risk and frustration.

When this friction becomes unbearable, the business is faced with a monumental decision: a realm split. This is the architectural divorce of a site from its original family of instances, code, and data. It is a deliberate move to carve out a new, autonomous environment where a business unit can operate without being constrained by the priorities, schedules, and technical debt of its siblings. But like any divorce, it is complex, costly, and fraught with peril. A realm split is not a simple data replication or a POD move; it is a full-scale migration that touches every aspect of the platform, from the underlying infrastructure to third-party integrations and historical analytics.

## Deconstructing the Monolith: The 'Why' and 'When' of a Realm Split

Before embarking on such a significant undertaking, it is imperative to understand the foundational architecture and the specific pressures that lead to its fracture. A realm split is a solution to a problem that is often more organisational than technical, and its justification must be built on a solid understanding of both the platform's structure and the business's evolution.

### A Technical Primer on the SFCC Realm

In the SFCC ecosystem, a realm is the fundamental organisational unit. It is not merely a collection of sites but the entire [infrastructure](/the-salesforce-b2c-commerce-cloud-environment/) stack provided by Salesforce to a customer. This stack contains all the necessary hardware and software components to develop, test, and deploy a storefront, including web servers, application servers, and database servers. For a developer, the realm is the entire world in which their sites live and operate.

This world is rigidly structured into two distinct groups:

-   **Primary Instance Group (PIG):** This is the core operational group, and a realm can have only one. It consists of three instances: Production (the live storefront), Staging (for data setup and pre-deployment testing), and Development (for data enrichment and configuration).
-   **Secondary Instance Group (SIG):** This group contains the developer sandboxes.  Like the PIG, a realm can only have one SIG.

This architecture is designed for efficiency under a unified operational model. Sites within the same realm can share a master product catalog, a single codebase, and a standard set of administrative and development teams, creating significant economies of scale. However, this inherent sharing is also its greatest weakness when the business model diverges from its core.

### Analyzing the Breaking Points: When a Single Realm Becomes Untenable

The decision to split a realm is a lagging indicator of a fundamental misalignment between a company's organizational structure and its technical architecture. The initial choice of a single realm is often based on an assumption of a unified business strategy. The need for a split arises when that assumption is no longer valid. This manifests through several distinct business and technical drivers.

![Two business teams pulling in different directions as their shared global process breaks down.](/media/2025/conflicts-across-the-world-on-processes-d64e01a143.jpg)

When Workflows Clash: The Tipping Point for a Realm Split

#### Business Drivers

-   **Divergent Business Processes:** The most compelling reason for a split is when different business units can no longer operate under a single set of rules. For example, a pharmaceutical site that requires doctor's prescription validation has a fundamentally different checkout and order processing logic than a standard apparel site. Forcing both to coexist in a single realm with a shared codebase leads to immense complexity and risk.
-   **Independent P&L and Operational Autonomy:** When business units have separate Profit & Loss (P&L) responsibilities, they often need the authority to define, prioritise, and fund initiatives independently. If the European division needs to launch a feature to meet a local market demand, it cannot be blocked by the North American division's development schedule. A shared realm creates a zero-sum game for resources and deployment windows, whereas separate realms provide the necessary autonomy.
-   **Global Teams and Conflicting Schedules:** A single realm has a unified maintenance and release schedule. This becomes untenable for global teams operating in different time zones. A release that requires downtime at 2 AM in the US might be prime shopping time in the Asia-Pacific region. Separate realms allow for independent operational schedules tailored to each market.

#### Technical Drivers

-   **Data Residency and Compliance:** This is often a non-negotiable, legally mandated driver. Regulations like the GDPR may require that all personally identifiable information (PII) for European customers be stored in a data centre (or POD) located within the EU. If the existing realm is hosted on a US POD, a new, separate realm must be provisioned in the correct region to achieve compliance.
-   **Codebase Complexity and Deployment Risk:** As divergent business requirements are shoehorned into a single codebase, it inevitably becomes a tangled mess of site-specific conditional logic (if (site.ID === 'US') {... } else if (site.ID === 'EU') {... }). This increases the cognitive load for developers, slows down development, and dramatically increases the risk that a change for one site will have unintended, catastrophic consequences for another. A realm split allows the departing site to start with a clean, purpose-built codebase, free from the technical debt of its former siblings.
-   **Performance and Governor Limits:** While it should be the last option considered, severe performance degradation can be a driver for a split. If extensive code optimisation fails to resolve issues and distinct business units consistently create resource contention or hit governor limits, isolating the high-traffic or computationally intensive site in its own realm can restore stability for all parties.

## The Cardinal Rule: A Realm Split is the Last Resort

It is crucial to understand that a realm split is a "complex and costly undertaking". Before committing to this path, all other alternatives must be thoroughly investigated and exhausted. If the primary issue is storage, adopting a data archiving solution or purchasing additional storage from Salesforce is a far more straightforward and cost-effective option.

If performance is the problem, a rigorous cycle of code optimisation and profiling should be the first course of action. A realm split introduces significant new overhead in terms of infrastructure costs and management complexity.

**_It should only be pursued when the strategic benefits of autonomy and isolation unequivocally outweigh these substantial new burdens._**

## The Grand Blueprint: A Phased Plan of Attack

Executing a realm split is a major re-platforming project disguised as a migration. Success depends on a meticulously detailed, phased [plan](https://help.salesforce.com/s/articleView?id=000391622&language=en_US&type=1) that accounts for every dependency, from stakeholder alignment to data integrity and third-party coordination. The following blueprint breaks the process down into six critical phases.

![Team collaborating around a blueprint for a phased realm-split migration.](/media/2025/the-grand-blueprint-v2-9c2bcca94a.jpg)

Success in a complex project like a realm split hinges on a meticulously detailed, phased plan. This image visualizes a team of experts collaborating on a holographic blueprint, representing the strategic and coordinated effort required to navigate the six critical phases of the migration.

### Phase 1: The Scoping & Justification Gauntlet

This initial phase is about building the business case and creating a comprehensive map of the existing environment. Rushing this stage is a recipe for budget overruns and unforeseen complications.

-   **Define Clear Goals and Objectives:** Before any technical work begins, all stakeholders—business, marketing, development, and operations—must agree on what a successful split looks like. These goals should be specific and measurable (e.g., "The new EU site is live on the new realm with a 15% improvement in average page load time," or "The EU development team can execute independent weekly deployments without impacting the US release schedule"). This provides a north star for the project and a clear definition of what is considered "done."
-   **Conduct a Thorough Audit of the Source Realm:** A new realm is a clean slate; do not pollute it with the cruft of the old one. Conduct a deep audit of the source environment to identify and catalogue every component. This includes all custom cartridges, jobs, services, custom object definitions, site preferences, and integrations. Any stale, redundant, or unused metadata should be earmarked for cleanup _before_ the migration begins. This reduces the complexity of the new environment and prevents future headaches.
-   **Map Every Integration:** This is one of the most critical and frequently underestimated tasks. Create a definitive diagram and inventory of every single third-party system that communicates with the SFCC instance. For each integration (payment gateways, tax services, OMS, ERP, PIM, etc.), determine its fate: Will it connect to the new realm only? Does it need to connect to both? Will it require a completely new configuration or even a new contract? Answering these questions early is essential for planning and vendor coordination.

### Phase 2: Engaging the Gatekeepers - Navigating Salesforce Support

Several key steps in a realm split can only be performed by Salesforce. Engaging with their support and provisioning teams early and clearly is a hard dependency for the entire project.

-   **Order the New Realm:** A new realm is a new commercial product. The process begins by working with your Salesforce account executive to submit a standard realm order form. This initiates the provisioning of the new PIG and SIG infrastructure.

-   **Data Migration Support:** Some pieces of data can only be migrated by Salesforce; keep this dependency in mind!
-   **Open the Go-Live Ticket:** If the site being moved will be the _first_ site in the new realm, you are required to go through the full, formal "Go Live" process. This is a structured engagement with Salesforce that has its own set of checklists, performance reviews, and timelines. This process must be initiated by opening a Go Live ticket well in advance of your target launch date.
-   **Establish Clear Communication Channels:** Use the Salesforce Help portal to log all cases related to the realm split. It is critical to ensure you select the correct B2C tenant/realm ID in the case details for both the source and destination environments. This ensures your requests are routed correctly and provides an official channel for coordinating the migration steps that require Salesforce intervention.

### Phase 3: The Great Data Exodus - A Migration Deep Dive

The process of moving data is not a single "lift and shift" operation; it is a series of carefully orchestrated steps. The core strategy is to minimize downtime during the final cutover window by migrating the bulk of the data incrementally in the days or weeks leading up to the launch. Only the final "delta"—the data that has changed since the last sync—should be moved during the go-live event.

This process reveals a critical truth about a realm split: it is not a simple copy. It is the construction of a new, parallel stack that must be made to perfectly mirror the relevant parts of the old one. Every piece of data, code, and configuration must be explicitly migrated and, more importantly, _validated_ in the new environment. The project plan must account for this re-validation effort, not just the migration itself. The most dangerous mindset a developer can have is "it worked in the old realm, so it will work in the new one."

#### The Realm Split Data Migration Checklist

The complexity of data migration, with its varied methods and ownership, demands a single source of truth. The following table acts as a project management artifact, translating the plan into a clear, actionable checklist.

Also, please review [this page](https://help.salesforce.com/s/articleView?id=000391622&language=en_US&type=1) carefully, as it contains a wealth of information on the migration plan you need to set up.

| Data Object | When | Key Considerations & Risks | Primary Owner |
| --- | --- | --- | --- |
| Product Catalog | Continuous in the old and new realms | Includes products, categories, assignments, and sorting rules. Relatively low risk. | Dev Team / Merchandising |
| Price Books | Continuous in the old and new realms | Ensure all relevant price books are included. Test pricing thoroughly post-import. | Dev Team / Merchandising |
| Content Assets & Libraries | Manual syncs at pre-defined moments | Includes content assets, folders, and library assignments. | Dev Team / Content Team |
| Slot Configurations | Manual syncs at pre-defined moments | Verify slot configurations on all page types post-import. | Dev Team / Merchandising |
| Promotions & Campaigns | Manual syncs at pre-defined moments | Includes promotion definitions, campaigns, and customer groups. | Dev Team / Marketing |
| Custom Objects | Manual syncs at pre-defined moments | Export definitions via Site Export. Migrate data using custom jobs with dw.io classes. | Dev Team |
| Site Preferences & Metadata | Manual syncs at pre-defined moments | Many settings are included in site export, but some such as sequence numbers must be manually configured and verified. | Dev Team |
| Customer Profiles | Complete migration 1-2 weeks before the go-live, delta during and after | Critical PII risk: set the Customer Sequence Number in the new realm above the highest imported customer number to prevent duplicate IDs and data exposure. | Dev Team |
| Customer Passwords | Part of the Customer Profiles | Passwords are encrypted, but can be exported and imported into different realms without Salesforce intervention. | Dev Team |
| Order History | Complete migration 1-2 weeks before the go-live, delta during and after | You can export and import orders yourself as long as the site is not marked live. Import customers first so order-to-customer links are preserved. For a live site, Salesforce Support must perform the order migration with at least 10 working days' notice. | Dev Team / Salesforce Support |
| System-Generated Coupons | Salesforce Support Ticket | Existing coupon seeds must be migrated by Salesforce Support so issued coupons remain valid. | Salesforce Support |
| Active Data & Einstein | Salesforce Support Ticket, During Go-Live | Different realms require Salesforce Support coordination for this migration. | Dev Team / SF Support |

### Phase 4: Rebuilding the Engine - Code, Config, and Integrations

With the new realm provisioned, the focus shifts to building out the application and its ecosystem.

-   **Establish a New CI/CD Pipeline:** Your existing deployment pipeline is tied to the old realm. A new, parallel pipeline must be created that targets the sandboxes and PIG instances of the new realm. The full codebase for the migrating site should be deployed and tested through this new pipeline.
-   **Replicate and Validate Configuration:** Although site import/export handles most of the configuration, several critical settings must be manually replicated and validated in the new realm's Business Manager. This includes global preferences like sequence numbers, security settings, and any custom site preferences that are not part of the standard export package.
-   **Execute the Integration Plan:** This is where the audit from Phase 1 becomes an action plan.

-   **Create New API Clients:** An API client in Account Manager is tied to a specific realm and cannot be moved (although they can be used by a different realm). You must create entirely new API clients for the new realm, which will generate new Client IDs and secrets for every single integration.
-   **Coordinate with Third-Party Vendors:** Proactively contact every third-party vendor. Provide them with the new API credentials and the new hostnames for the Staging and Production instances. Update any IP allowlists on both sides. This process can take time and must be initiated well in advance of the planned cutover.

### Phase 5: The Crucible of Testing

Rigorous, end-to-end testing is the only way to ensure a smooth launch. The new Staging instance is your battlefield for uncovering issues before they impact customers.

-   **User Acceptance Testing (UAT):** Business users and QA teams must conduct exhaustive testing of every user journey on the new Staging instance. This includes account creation, login, searching and browsing, adding to cart, applying promotions, and completing checkout with all supported payment methods.
-   **End-to-End Integration Validation:** It is not enough to test the SFCC functionality in isolation. Every single third-party integration must be tested end-to-end. Place test orders that flow through to your payment gateway, tax service, and Order Management System. Verify that inventory updates and shipping notifications are working correctly.
-   **Performance and Load Testing:** The new realm is a new set of infrastructure. Use the Business Manager Code Profiler to identify any server-side performance regressions. Conduct a full-scale load test against the new PIG (either on the pre-production environment or a dedicated "loaner realm") to simulate peak traffic and ensure the new environment is appropriately scaled and configured to handle the production load.

### Phase 6: The Cutover - A Minute-by-Minute Runbook

The go-live event should be a precisely choreographed execution of a pre-written script, not a series of improvisations. Create a hyper-detailed, time-stamped runbook that lists every action, its owner, and its expected duration. This runbook is law.

The sequence, based on Salesforce's official guidance, is as follows:

1.  Final communications to all stakeholders. Freeze all administrative changes in the old realm's Business Manager.
2.  Place the old site into **Maintenance Mode**. Immediately update the primary Salesforce Support ticket with the exact timestamp.
3.  **Go-Live:** The migration process can now begin. This 90-minute waiting period is a mandatory requirement from Salesforce.
4.  Execute the final delta data migration jobs (new customers, new orders, etc.). Coordinate closely with Salesforce Support as they perform their required migration tasks (active data).
5.  **Migration Complete:** Once all data is moved, perform a final smoke test on the new Production instance using internal hostnames (bypassing public DNS).
6.  Update the public DNS records (e.g., the www CNAME) to point the storefront domain to the new realm's Production instance endpoint.
7.  Once DNS propagation is confirmed, set the new site's status to **Online** in Business Manager. Update the Salesforce Support ticket again with the exact timestamp.
8.  **Post-Launch Hypercare****:** All hands on deck. Intensively monitor server logs, analytics dashboards, and order flow for any anomalies. The project team should be on standby to address any immediate issues.

## The SEO Minefield: Preserving Your Digital Ghost

![Navigator crossing an SEO minefield to preserve rankings during migration.](/media/2025/seo-minefield-03b727d6da.jpg)

Underestimating the SEO impact of a realm split is a catastrophic error that can wipe out years of search equity. This image visualizes the high-stakes process of navigating this "SEO minefield," where a single misstep can have explosive consequences. The illuminated path represents the meticulous, non-negotiable strategy—like a comprehensive 301 redirect map—required to safely migrate a site and preserve its valuable "digital ghost."

A realm split, from a search engine's perspective, is essentially a complete site migration. Underestimating the SEO impact is a catastrophic error that can instantly wipe out years of accumulated search equity, traffic, and revenue. Google's own representatives have stated that split and merge operations take "considerably longer for Google to process" than standard migrations because their algorithms must re-crawl and re-evaluate the entire structure of the new site (But if your site looks the same, has the same URL structure, etc, Google will not know anything changed at all - besides IP addresses). Patience and meticulous planning are paramount.

-   **The 301 Redirect Map is Non-Negotiable:** This is the single most critical SEO artefact for the migration. You must create a comprehensive map that pairs every single indexable URL on the old site with its corresponding URL on the new site. This includes the homepage, all category pages, all product detail pages, and any content or marketing pages. Use a site crawler to generate a comprehensive list of URLs from the old site, ensuring 100% coverage. These redirects must be implemented in Business Manager (Merchant Tools > SEO > URL Redirects) and be live the moment the new site is launched.

    _**Note:** This only applies if the URL structure changed._

-   **Replicate URL Rules and Configuration:** The structure of your URLs is a key ranking signal. In the new realm's Business Manager, you must meticulously replicate the URL Rules (Merchant Tools > SEO > URL Rules) from the old realm. Pay close attention to settings for forcing lowercase URLs and defining character replacements for spaces and special characters. This ensures that the URLs generated by the new site will match the old ones to the letter.
-   **Manage Sitemaps and Robots.txt:** The moment the new site is live and DNS has propagated, you must generate a new sitemap.xml file from the new realm's Business Manager and submit it to Google Search Console (only if the location changed). This tells Google to begin crawling the new site structure. Simultaneously, ensure that the
    robots.txt file for the new site is correctly configured, allowing crawlers to access all important pages and blocking any non-public sections of the site (like internal search or cart pipelines).
-   **Coordinate with SEO and Marketing Teams:** SEO migration is not solely a technical task. The SEO and marketing teams must be integral members of the project team from day one. They are responsible for auditing the redirect map, setting up the new Google Search Console property, monitoring for crawl errors post-launch, and tracking keyword rankings and organic traffic to measure the impact of the migration.

## The Developer's Survival Guide: Warnings, Pitfalls, and Pro-Tips

The difference between a smooth migration and a career-limiting disaster often comes down to awareness of the hidden dangers and adoption of battle-tested best practices. This is the hard-won wisdom from the trenches.

### Red Alerts (Warnings)

-   **Irreversible Analytics Loss****:** This cannot be overstated. Historical analytics data from Reports & Dashboards **does not transfer** to the new realm. The new realm begins with a zeroed-out dashboard. While you can still access the old data by selecting the old realm ID in the Reports & Dashboards interface, the data from the two realms is never combined into a single view

    **Actionable Advice****:** Before the split, work with the business and analytics teams to identify and export all critical historical reports. This data must be preserved externally, as it will be inaccessible from the new realm's reporting interface.
-   **The Data Corruption Gauntlet:** Heed the warnings from Salesforce Support. The cutover runbook is not a suggestion; it is a strict protocol. Changing the old site back to "Online" after the migration process has started, or failing to follow the instructions, can result in irreversible data corruption. There is no room for error in the cutover sequence.
-   **PII and the Sequence Number Bomb****:** The warning about Customer Sequence Numbers is critical enough to repeat. Suppose you import customer profiles with customer numbers (e.g., cust\_no = 5000) into a new realm where the sequence number is still at its default (e.g., 1000). In that case, the system will eventually start creating new customers with numbers that conflict with your imported data. This can lead to a catastrophic PII breach where one customer logs in and sees another customer's profile, address, and order history. (e.g. a customer wasn't imported because of "whatever reason", and their number is "taken over".)

    **Actionable Advice****:** Before importing any customer data, go to Administration > Global Preferences > Sequence Numbers in the new realm and manually set the Customer Number to a value safely above the highest customer number in your import file.

### Common Traps (Pitfalls)

-   **The Obscure Realm Setting:** A realm is more than what you see in Business Manager. There are underlying configurations that are only visible to Salesforce Support.

    **Lesson Learned:** Never assume the new realm is a perfect 1:1 clone of the old one. Suppose you encounter a bizarre, inexplicable bug that defies all logical debugging. In that case, your next step should be to open a high-priority support case and make sure that they perform a full comparison of all underlying realm configurations between the source and the destination.
-   **Forgetting the "Small" Data:** It is easy to focus on the big-ticket items like products and orders and completely forget smaller but equally critical data points. The migration of system-generated coupon seeds is a perfect example. If you use these types of coupons and forget to open the specific support ticket to have the seeds migrated, all previously issued coupons will become invalid the moment you go live, leading to failed promotions and customer frustration.
-   **Underestimating Integration Timelines:** A realm split is an integration project for every single system that connects to SFCC. Third-party vendors have their own change control processes, support SLAs, and technical resource availability. Assuming a vendor can instantly provide new credentials or update an IP allowlist on your go-live day is a recipe for failure.

### Veteran's Wisdom (Pro-Tips)

-   **Rehearse, Rehearse, Rehearse:** Conduct at least one, and preferably several, full dry runs of the entire data migration and cutover process. This can be done by migrating data from a sandbox in the old realm to a sandbox in the new realm. A rehearsal will inevitably uncover flawed assumptions, broken scripts, or missing data in a low-stakes environment, allowing you to fix the process before the high-pressure production event.
-   **Script Everything Possible:** Any manual step in a cutover plan is a potential point of failure. Automate as much of the process as you can. Write scripts for exporting and transforming data, for replicating configurations via Business Manager APIs (where possible), and for post-launch validation checks. Automation reduces the risk of human error and speeds up the execution of the runbook.
-   **Benchmark Performance Before and After:** Do not rely on subjective feelings about site speed. Before the split, use the Code Profiler and external web performance tools (like WebPageTest) to establish a clear, quantitative performance baseline for the site on the old realm. After the new site is live, run the exact same tests. This provides concrete data to demonstrate that performance has not degraded, allowing you to quantify any improvements gained from the new, isolated infrastructure.
-   **Plan for a Rollback, but Work to Not Need It:** Your runbook must include a clear "point of no return" and a detailed rollback plan. A rollback is technically possible in the early stages of the cutover (primarily by reverting the DNS change), as the old realm and site will still exist. However, it becomes exponentially more difficult with every new order and customer registration that occurs on the new site. The rollback plan is a critical safety net, but the primary focus should be on meticulous planning and testing to ensure it is never needed.

## Conclusion: Life in the Multiverse

The successful launch of the migrated site is not the end of the project; it is the beginning of a new, more complex operational reality. The realm split achieves its primary goal of technical and business autonomy, but it does so by trading the constraints of a monolith for the complexities of a distributed system.

The new normal is a multi-realm architecture. On the positive side, the newly independent site now has the flexibility to develop and deploy on its own schedule, with a codebase tailored to its specific needs. The risk of a change for one brand impacting another is eliminated.

However, this autonomy comes at a price. The business now bears the increased infrastructure costs of an additional PIG and SIG, along with the added maintenance overhead of managing two separate codebases, two deployment pipelines, and two sets of administrative processes.

![A cartoon-style illustration depicting a large, central digital structure breaking apart into several smaller, floating realms. Glowing streams of colorful data connect the new, separate realms, symbolizing their continued need for interconnectedness.](/media/2025/realm-split-97dc1add29.png)

An illustration of a realm split, where a single, monolithic system fractures into multiple autonomous realms. This transition unlocks business and technical flexibility but introduces the new operational complexity of managing a distributed system, including the critical need for data synchronization between the separate entities.

One of the most significant new challenges is data synchronisation. If the business still requires a shared product catalog or consistent promotional data across realms, this can no longer be achieved through the platform's native sharing capabilities. Sites in different realms cannot share a catalog directly. Instead, you must build and maintain a new operational process, likely a set of automated jobs and a CI/CD pipeline, to handle the export of data from a "master" realm and its import into the "subscriber" realm.

**_This introduces a new potential point of failure and a new set of tasks for the operations team._**

Ultimately, a realm split is an immense undertaking that fundamentally reshapes a company's digital commerce architecture. It is the right decision—and often the only decision—when the organisational friction and technical limitations of a single realm become an insurmountable barrier to growth. The significant cost and complexity are justified only when the business and technical autonomy it unlocks is a strategic necessity.
