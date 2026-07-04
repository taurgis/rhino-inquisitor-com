---
title: Delta exports in Salesforce B2C Commerce Cloud
description: >-
  Salesforce B2C Commerce Cloud supports delta export jobs. But how do I enable
  this feature and what do I need to watch out for?
date: '2022-08-01T14:18:24.000Z'
lastmod: '2026-07-04T14:48:28.000Z'
url: /delta-exports-in-salesforce-b2c-commerce-cloud/
draft: false
heroImage: sharinglargefiles-c0cb3315f4.png
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - file
  - jobs
  - sfcc
  - sftp
  - technical
aliases:
  - /delta-exports-in-salesforce-b2c-commerce/
author: Thomas Theunen
takeaways:
  - "Explains how delta exports work in SFCC and which data types they can cover"
  - "Highlights enablement constraints like support activation, change-log retention, and PIG-only support"
  - "Warns about runtime, performance, and synchronisation trade-offs before relying on the feature"
---
You probably already knew that it is possible to do full exports of your customer lists and catalogues from Salesforce B2C Commerce Cloud. This can be done through the [business manager](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_catalog_object_import_export.htm) or a [job](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/jobstepapi/html/api/jobstep.ExportCatalog.html).

But did you also know that delta job steps are available for the following items?

- [Catalogue](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/jobstepapi/html/api/jobstep.CatalogDeltaExport.html)
- [Content Library](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/jobstepapi/html/api/jobstep.LibraryDeltaExport.html)
- [Customer Lists](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/jobstepapi/html/api/jobstep.CustomerListsDeltaExport.html)
- Maybe even more? Stick around to find out!

But as with many things, a few things should be kept in mind before using this functionality. Let us take a look!

A big thanks to [Tim Loibl](https://www.linkedin.com/in/tloibl/) for experimenting with this feature and sharing some intel!

## Support needs to enable these

If you already opened the links in the introduction you probably noticed a warning.

> Support must be contacted to enable delta exports.

This is because it is a hidden [feature switch](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_feature_switches.htm) and is only available for Salesforce support. So keep in mind you might have to wait a few hours to a few days, depending on how quickly support can activate this switch.

**Important:** This switch has to be turned on separately in each environment (DEV, STG & PRD). So be sure to mention in the ticket which ones you want this switch turned over.

## Business Manager Module

Once this feature has been enabled, you get a new toy to play with in the Business Manager at "_Administration _" > "_ Site Development _" > "_ Delta Exports._"

You can consider this to work the same as configuring the Sitemap or replications. It is not under the regular list of jobs, but behind the scenes, they are one.

{{< img-caption
  src="delta-jobs-overview-dccafc63a7.png"
  alt="Business Manager screenshot showing Delta Exports module under Administration > Site Development"
  caption="Delta Exports module overview"
>}}

Let us open that "Test" configuration!

### General

{{< img-caption
  src="delta-job-selection-718f8a1686.png"
  alt="Delta export job configuration form showing Name field, Consumers field, and Data Type dropdown"
  caption="Delta export general settings"
>}}

When we create a new job or open an existing one, we configure multiple items:

- **Name:** The name of the job
- **Consumers:** The comma-separated list of external systems you are generating this for (consumers of the feed)
- **Data:** The data to export

But? Huh? I see more types listed here than there are Job Steps available! And you are correct; you get more options here.

A list of supported types can be found [in the Delta Exports documentation](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_delta_exports.htm).

### Schedule

{{< img-caption
  src="delta-job-schedule-1c300976ae.png"
  alt="Delta job Schedule tab showing fixed interval configuration options"
  caption="Delta export schedule tab"
>}}

Just like regular jobs, you can schedule this to be executed at your chosen interval.

### History

{{< img-caption
  src="history-70bccb6f6f.png"
  alt="Delta export history table showing previously generated export files"
  caption="Delta export file history"
>}}

This historical overview is unlike your usual "job" history, even though the description might seem similar.

This overview will show a history of all exported files rather than the job executions. Only if a job execution produces a file will it appear in this overview.

### Consumer

{{< img-caption
  src="delta-job-consumer-867e8bc380.png"
  alt="Consumer tab showing WebDAV export folder path for each configured consumer"
  caption="Delta export consumer folder mapping"
>}}

For each "consumer" you have configured in the general tab, a new tab appears in which you get the path where the files are exported.

This gives each external system (consumer) its dedicated folder on the WebDAV to monitor.

**Note:** Remember that you can limit access to a third-party system to this specific folder with [WebDAV Client Permissions](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_web_dav_client_permissions.htm)!

### Status

{{< img-caption
  src="delta-job-status-9552cad99f.png"
  alt="Status tab displaying the scheduled delta export job execution log"
  caption="Delta export status log"
>}}

You can view the log of the scheduled job on this page.

## Only available on PIG instances

If you were hoping to test out this functionality on your sandbox, you are out of luck. This feature only works in these environments because it depends on the Change Log to operate.

You can make use of delta exports on:

- Staging
- Development
- Production

## Impact on performance

> The Delta Exports feature requires the Change Log feature to be active, which can cause a slight (<5%) database performance penalty. This affects update and delete transactions on any entity types that can be selected for delta exports (not only the types that actually are selected).

Since an extra step is being added when making modifications to these objects, a minor performance penalty takes place (less than 5 %).

But if you have a lot of jobs that modify objects (imports), you need to take this information into account and recalculate the time you expect these processes to run.

## Initial enablement

If you expect the first export to contain all objects, this will not be the case. The initial export will only include the objects that have been modified since the enablement of the feature.

A solution for this is easy; use the existing options to do the full export if necessary.

## Seven days

The retention time of the Change Logs is seven days, so make sure to do your exports once every seven days to ensure your delta exports towards external systems are correct!

A good habit is to provide a full export to external systems every once in a while (maybe every month?) to ensure all systems are in sync!

## Large amount of modifications to data in SFCC

The delta will become bloated when multiple processes (API Calls, Jobs, and manual) modify data within Salesforce B2C Commerce Cloud. This will cause the job runtime to be long, causing this feature to lose its value.

## Other Considerations

In the [Info Centre](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_delta_exports.htm), there are more items to consider.
