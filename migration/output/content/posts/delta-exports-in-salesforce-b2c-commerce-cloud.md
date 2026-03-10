---
title: Delta exports in Salesforce B2C Commerce Cloud
description: >-
  You probably already knew that it is possible to do full exports of your
  customer lists and catalogs from Salesforce B2C Commerce Cloud. This can be
  don...
lastmod: '2022-09-10T04:43:39.000Z'
url: /delta-exports-in-salesforce-b2c-commerce-cloud/
draft: false
date: '2022-08-01T14:18:24.000Z'
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - file
  - jobs
  - sfcc
  - sftp
  - technical
author: Thomas Theunen
---
You probably already knew that it is possible to do full exports of your customer lists and catalogs from Salesforce B2C Commerce Cloud. This can be done through the [business manager](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/import_export/b2c_catalog_object_import_export.html) or a [job](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/jobstepapi/html/api/jobstep.ExportCatalog.html).

But did you also know that delta job steps are available for the following items?

-   [Catalog](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/jobstepapi/html/api/jobstep.CatalogDeltaExport.html)
-   [Content Library](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/jobstepapi/html/api/jobstep.LibraryDeltaExport.html)
-   [Customer Lists](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/jobstepapi/html/api/jobstep.CustomerListsDeltaExport.html)
-   Maybe even more? Stick around to find out!



But as with many things, a few things should be kept in mind before using this functionality. Let us take a look!

_A big thanks to [Tim Loibl](https://www.linkedin.com/in/tloibl/) for experimenting with this feature and sharing some intel!_

## Support needs to enable these

If you already opened the links in the introduction you probably noticed a warning.

> Support must be contacted to enable delta exports.

This is because it is a hidden [feature switch](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/admin/b2c_feature_switches.html) and is only available for Salesforce support. So keep in mind you might have to wait a few hours to a few days, depending on how quickly support can activate this switch.

_**Important:**_ _This switch has to be turned on separately in each environment (DEV, STG & PRD). So be sure to mention in the ticket which ones you want this switch turned over._

## Business Manager Module

Once this feature has been enabled, you get a new toy to play with in the Business Manager at "_Administration_" > "_Site Development_" > "_Delta Exports._"

You can consider this to work the same as configuring the Sitemap or replications. It is not under the regular list of jobs, but behind the scenes, they are one.

[![](https://www.rhino-inquisitor.com/wp-content/uploads/2023/01/delta-jobs-overview-768x235.png)](https://www.rhino-inquisitor.com/wp-content/uploads/2023/01/delta-jobs-overview.png)

Let us open that "Test" configuration!

### General

[![](https://www.rhino-inquisitor.com/wp-content/uploads/2023/01/delta-job-selection-768x378.png)](https://www.rhino-inquisitor.com/wp-content/uploads/2023/01/delta-job-selection.png)

When we create a new job or open an existing one, we configure multiple items:

-   **Name**: The name of the job
-   **Consumers:** The comma-separated list of external systems you are generating this for (consumers of the feed)
-   **Data:** The data to export



But? Huh? I see more types listed here than there are Job Steps available! And you are correct; you get more options here.

A list of supported types can be found [here](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/import_export/b2c_delta_exports.html).

### Schedule

[![](https://www.rhino-inquisitor.com/wp-content/uploads/2023/01/delta-job-schedule-768x383.png)](https://www.rhino-inquisitor.com/wp-content/uploads/2023/01/delta-job-schedule.png)

Just like regular jobs, you can schedule this to be executed at your chosen interval.

### History

[![](https://www.rhino-inquisitor.com/wp-content/uploads/2023/01/History-768x205.png)](https://www.rhino-inquisitor.com/wp-content/uploads/2023/01/History.png)

This historical overview is unlike your usual "job" history, even though the description might seem similar.

This overview will show a history of all exported files rather than the job executions. Only if a job execution produces a file will it appear in this overview.

### Consumer

[![](https://www.rhino-inquisitor.com/wp-content/uploads/2023/01/delta-job-consumer-768x266.png)](https://www.rhino-inquisitor.com/wp-content/uploads/2023/01/delta-job-consumer.png)

For each "consumer" you have configured in the general tab, a new tab appears in which you get the path where the files are exported.

This gives each external system (consumer) its dedicated folder on the WebDAV to monitor.

_**Note:** Remember that you can limit access to a third-party system to this specific folder with [WebDAV Client Permissions](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/permissions/b2c_web_dav_client_permissions.html)!_

### Status

[![](https://www.rhino-inquisitor.com/wp-content/uploads/2023/01/delta-job-status-768x233.png)](https://www.rhino-inquisitor.com/wp-content/uploads/2023/01/delta-job-status.png)

You can view the log of the scheduled job on this page.

## Only available on PIG instances

If you were hoping to test out this functionality on your sandbox, you are out of luck. This feature only works in these environments because it depends on the Change Log to operate.

You can make use of delta exports on:

-   Staging
-   Development
-   Production

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

In the [Info Center](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/import_export/b2c_delta_exports.html), there are more items to consider.
