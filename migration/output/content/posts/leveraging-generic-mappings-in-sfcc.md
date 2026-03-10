---
title: Leveraging Generic Mapping for Efficient Data Integration
description: >-
  offers many features that empower developers to build custom features on its
  platform. Generic Mapping are one feature that few use or have heard of.
date: '2023-11-27T09:29:26.000Z'
lastmod: '2023-11-27T09:29:35.000Z'
url: /leveraging-generic-mappings-in-sfcc/
draft: false
heroImage: /media/2023/a-robot-connecting-data-files-3fa4ea9dce.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - sfcc
  - technical
author: Thomas Theunen
---
[Salesforce B2C Commerce Cloud](/getting-to-know-sfra-as-a-developer/) offers many features that empower developers to build custom features on its platform. Generic Mapping are one feature that few use or have heard of. This enables developers to map keys to values stored in a high-performance data store—ideal for handling large datasets with speedy lookup times.

In this article, we’ll dissect the inner workings of Generic Mapping, complemented by code examples and job configurations, to serve as a practical guide.

## Understanding Generic Mapping

Generic Mapping is a powerful tool that allows you to establish a connection between different sets of data, even if they don't share a standard format.

For example, you can use Generic Mapping to link SKU numbers from a backend system to the corresponding SKU numbers within Salesforce B2C Commerce Cloud, even if formatted differently.

This is especially useful when you are integrating third-party systems that may not be familiar with data formats used by B2C Commerce Cloud or if you have a large set of static information needed to make calculations or lookups.

## Steps to Utilize Generic Mapping

### Create the Mapping File

The first task is to structure a .csv file that defines your mapping. The file should meet the following criteria:

-   Each line corresponds to one key-value pair, separated by commas.
-   The first row specifies property names that will serve as keys in the map retrieved by `MappingMgr.get(mapping, key).`
-   The rest of the file contains your data in the format (`<key>`\[,`<key2>`,…\],`<value1>`\[,`<value2>`,`<value3>`,...\])`.`
-   Any malformed records result in the import process being aborted.

Here's an example of how your CSV might look:

```

					backendSKU,commerceCloudSKU
12345,67890
12346,67891
...


```

#### Compound Keys

![This key is a unique representation of the "Compound Key" system in Generic Mappings, crafted from multiple metal puzzle pieces. The key is striking in its design, with a complete key lying in the center, surrounded by unused pieces that were likely intended to be used for different variations of the key. The craftsmanship of the metal pieces is impressive, with intricate designs etched into each individual piece. The key itself appears to be the final piece in a complex puzzle, with the other pieces surrounding it serving as potential alternative solutions to unlocking whatever the key is meant to open. Overall, this key is a fascinating example of the ingenuity and creativity that goes into the design of complex systems like Generic Mappings.](/media/2023/a-key-created-with-puzzle-pieces-c01118782f.jpg)

Compound keys in a CSV file refer to combining multiple columns to create a unique identifier for the mapping entries. Unlike a simple key using a single data point, a compound key requires two or more data points to form a unique one. You might need to use a compound key when you cannot uniquely identify an item with a single-column value. Instead, you need to use a combination of values to ensure uniqueness.

Here’s how you might define a mapping with compound keys in your `.csv` file:

```

					productCode,locationCode,commerceCloudSKU
PROD001,LOC001,CC_SKU_001
PROD001,LOC002,CC_SKU_002
PROD002,LOC001,CC_SKU_003
...


```

This will affect how you do configurations in the following steps. I may be getting ahead of myself, but here are some essential things to remember:

-   In the Job configuration, the KeyCount is "key 🔑" here
-   In the code, the "[MappingKey](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_util_MappingKey.html)" class is there to make usage of Compound Keys easier

### Upload the Mapping File

As with any file-based operation, to make the .csv mapping accessible, upload it to the B2C Commerce server. Use the Business Manager at `Administration > Site Development > Import & Export`, or upload it to the Impex directory via WebDAV or an HTTP client.

Just to remind you, mappings are global and must be explicitly imported on each instance.

### Import the Generic Mapping

Now, it’s time to create an automation job using the [`ImportKeyValueMapping`](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/jobstepapi/html/index.html) step:

[![A screenshot of a job with one job step "ImportKeyValueMapping" with the configuration described below this image.](/media/2023/job-import-generic-mapping-2cce4b36aa.jpg)](/media/2023/job-import-generic-mapping-2cce4b36aa.jpg)

Job Step Parameters:

-   **AfterImportFileHandling**: Determines what happens to the file post-import. Options include Keep, Delete, Archive, Archive Zipped (`AfterImportFileHandling: 'Archive'`).
-   **WorkingFolder**: The source folder of your files relative to IMPEX/src. (WorkingFolder: 'customization').
-   **FileNamePattern**: Regex to select import files (`FileNamePattern: '.*.csv'`).
-   **ImportFailedHandling**: How to handle failed imports—WARN skips, ERROR aborts (`ImportFailedHandling: 'WARN'`).
-   **KeyCount:** Leave this at one unless you use a Compound Key. (KeyCount: '1')
-   **ImportMode**: Specifies how the import should proceed—Replace, Merge, Delete (`ImportMode: 'Replace'`).
-   **MappingName**: The name used to access the mapping (`MappingName: 'backend-to-web-skus'`). We will need this later in the code!

### Accessing Values in Code

After the mapping is set up and the job is created, access the mappings in your script using the `dw.util.MappingMgr` class:

```

					var MappingMgr = require('dw/util/MappingMgr');
var MappingKey = require('dw/util/MappingKey');
// Retrieving the entire map with all properties for a specific key
var map = MappingMgr.get('backend-to-web-skus', new MappingKey('12345'));
// Accessing the B2C Commerce SKU associated with a backend SKU
var commerceCloudSKU = map.get('commerceCloudSKU');


```

#### Advanced Usage: Iterators and Mapping Names

Iterate over all keys or list all known mappings to enable more dynamic and adaptive script implementations:

```

					var iterator = MappingMgr.keyIterator('backend-to-web-skus');
while (iterator.hasNext()) {
    var key = iterator.next();
    var value = MappingMgr.getFirst('backend-to-web-skus', key);
    // Processing code here
}


```

## Best Practices and Limitations

-   Mappings should be planned carefully as they’re global and can impact all sites within an instance.
-   Single `.csv` files are limited to 20 MB, roughly translating to 1 million records of 20 bytes each.
-   A maximum of 20 mappings are supported to prevent performance degradation.
-   Clean and consistent data is crucial before uploading .csv files to prevent mapping inaccuracies and operational problems.
-   Maintain consistency across all environments and communicate updates to stakeholders by carefully managing changes to your key-value mappings and keeping a detailed change log.
-   Maintaining backups of your mapping files and having a disaster recovery plan to restore them in case of data loss or corruption is important.
