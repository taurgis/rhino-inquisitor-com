---
title: Mastering Chunk-Oriented Job Steps in SFCC
description: >-
  Salesforce B2C Commerce Cloud offers a robust, flexible Jobs framework vital
  for performing scheduled or on-demand tasks for e-commerce operations.
date: '2023-12-04T08:55:16.000Z'
lastmod: '2025-06-25T11:58:01.000Z'
url: /mastering-chunk-oriented-job-steps-in-salesforce-b2c-commerce-cloud/
draft: false
heroImage: /wp-content/uploads/2023/11/boxes-grouped-in-warehouse.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - jobs
  - sfcc
  - technical
author: Thomas Theunen
---
Salesforce B2C Commerce Cloud offers a robust, flexible Jobs framework vital for performing scheduled or on-demand tasks for e-commerce operations. One of the critical capabilities of this framework is the ability to define [custom job steps](https://trailhead.salesforce.com/content/learn/modules/b2c-admin-create-and-manage-jobs/b2c-admin-create-custom-job-steps), which can be either task-oriented or chunk-oriented.

In this article, I'll focus specifically on chunk-oriented job steps and how you can master them to enhance your platform's performance.

## Understanding Chunk-Oriented Job Steps

Chunk-oriented job steps are designed to handle lists of items by processing them in manageable segments called chunks. This technique is handy for operations that need to work with large sets of data, like processing orders, exporting data, or bulk updates.

Each [chunk-oriented job](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-custom-job-steps.html) step involves reading, processing, and writing items. If the list contains more items than can be processed in a single chunk, the system starts a new chunk, and the cycle repeats until all items have been processed.

## Essential Components of a Chunk-Oriented Job Step

When developing a chunk-oriented job step, you need to implement several functions:

1. **`read-function`:** Retrieves one item or null if no more items are left to process.
1. **Process function:** Applies business logic to each item, transforming it as necessary.
1. `**write-function**`: Writes the processed items, typically to a file or database.

There are optional functions you can implement for further control:

- `total-count-function`: Returns the total number of items available for processing. This can improve monitoring and progress feedback.
- `before-step-function`: Executes logic before all chunks are processed.
- `before-chunk-function`: Runs logic before each chunk is processed.
- `after-chunk-function`: Invoked after each chunk is successfully processed.
- `after-step-function`: Executes after all chunks have been processed.

### An example

Salesforce provides a visualisation example in their documentation: [https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-custom-job-steps.html#chunk-oriented-script-module](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-custom-job-steps.html#chunk-oriented-script-module).

## Creating a Chunk-Oriented Script Module

We will start with the script. If you need a `steptypes.json` reference as you go, see the [official example](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-step-types-json-example.html).

### Importing what you need

Before writing our chunk-oriented script module, let's ensure we have the required modules imported and variables set:

```js
'use strict';
var CustomerMgr = require('dw/customer/CustomerMgr');
var Transaction = require('dw/system/Transaction');
var ArrayList = require('dw/util/ArrayList');
var customerNoIterator;
```

### before-step-function

Let's initialise our iterator to retrieve all customer numbers.

```js
// Define the beforeStep function to initialize any resources before processing
exports.beforeStep = function (parameters, stepExecution) {
    var customerNumbers = new ArrayList(['customer1', 'customer2', 'customer3']); // Example customer Numbers
    customerNoIterator = customerNumbers.iterator();
};
```

### read-function

This function would retrieve the next customer profile to update.

```js
// Mockup read function - replace with actual logic to retrieve customers
exports.read = function (parameters, stepExecution) {
    if (customerNoIterator && customerNoIterator.hasNext()) {
        // If there's an existing iterator, return the next customer
        const customerNo = customerNoIterator.next();
        return CustomerMgr.getCustomerByCustomerNumber(customerNo);
    }
};
```

### process-function

Here we would perform the business logic to update the custom attribute:

```js
exports.process = function(customer, parameters, stepExecution) {
    // Update the 'myBoolean' custom attribute to a new value
    Transaction.wrap(function() {
        customer.custom.myBoolean = true; // set this to the desired value
    });
    return customer;
};
```

### write-function

As the customer profile is updated in the process step within a transaction, the write function may not be necessary unless you log the updates or perform additional actions.

If required, it could look like:

```js
// Mockup write function - replace with actual logic if writing out
exports.write = function(updatedCustomers, parameters, stepExecution) {
    // Optional: Log the update or perform other write operations
    var Logger = require('dw/system/Logger');
    updatedCustomers.toArray().forEach(function(customer) {
        // For example, log each customer's update status
       Logger.debug('Updated customer: {0} with myBoolean set to: {1}',
            customer.getProfile().getCustomerNo(),
            customer.getProfile().custom.myBoolean);
    });
};
```

### Putting it all together

```js
/**
* Copyright 2022-2025 FORWARD SERVICES
* Project: FastForward
*
* Description: The FastForward Business Manager Accelerator strives to enhance the Business
* Manager's functionality by developing modules that efficiently improve its user-friendliness.
*
* Author: Thomas Theunen
*/
var CustomerMgr = require('dw/customer/CustomerMgr');
var Transaction = require('dw/system/Transaction');
var ArrayList = require('dw/util/ArrayList');
var customerNoIterator;
// Define the beforeStep function to initialize any resources before processing
exports.beforeStep = function (parameters, stepExecution) {
    var customerNumbers = new ArrayList(['customer1', 'customer2', 'customer3']); // Example customer Numbers
    customerNoIterator = customerNumbers.iterator();
};
// Mockup read function - replace with actual logic to retrieve customers
exports.read = function (parameters, stepExecution) {
    if (customerNoIterator && customerNoIterator.hasNext()) {
        // If there's an existing iterator, return the next customer
        const customerNo = customerNoIterator.next();
        return CustomerMgr.getCustomerByCustomerNumber(customerNo);
    }
};
// Mockup process function - replace with actual logic for customer update
exports.process = function (customer, parameters, stepExecution) {
    // Perform the update of 'myBoolean' custom attribute
    Transaction.wrap(function () {
        customer.getProfile().custom.myBoolean = true; // Sets 'myBoolean' to true
    });
    // Return the customer for any further processing needed in write function
    return customer;
};
// Mockup write function - replace with actual logic if writing out
exports.write = function (updatedCustomers, parameters, stepExecution) {
    // Optional: Log the update or perform other write operations
    var Logger = require('dw/system/Logger');
    updatedCustomers.toArray().forEach(function (customer) {
        // For example, log each customer's update status
        Logger.debug(
            'Updated customer: {0} with myBoolean set to: {1}',
            customer.getProfile().getCustomerNo(),
            customer.getProfile().custom.myBoolean
        );
    });
};
// Define the afterStep function to clean up resources after processing
exports.afterStep = function (success, parameters, stepExecution) {
    // Clean up logic goes here
    if (customerNoIterator) {
        customerNoIterator = null; // Clear the iterator
    }
};
```

### Adding the Chunk Size and Configuration

Finally, don't forget to define the custom job step in your [steptypes.json](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-step-types-json-example.html), including specifying the chunk size and the path to your custom module:

```js
{
  "step-types": {
    "chunk-script-module-step": [
      {
        "@type-id": "custom.MyCustomChunkScriptModuleStep",
        "@supports-parallel-execution": false,
        "@supports-site-context": true,
        "@supports-organization-context": false,
        "description": "My custom chunk script step type",
        "module": "my_cartridge/cartridge/scripts/steps/myChunkModule.js",
        "read-function": "read",
        "process-function": "process",
        "write-function": "write",
        "chunk-size": 10,
        "transactional": true,
        "parameters": {
          "parameter": [
            {
              "@name": "MyParameter",
              "@type": "boolean",
              "@required": false,
              "description": "An optional boolean parameter."
            }
            // additional parameters...
          ]
        },
        "status-codes": {
          "status": [
            {
              "@code": "ERROR",
              "description": "Used when the step failed with an error."
            },
            {
              "@code": "OK",
              "description": "Used when the step finished successfully."
            }
            // additional status codes...
          ]
        }
      }
    ]
  }
}
```

Remember that the process function wraps the update code within a transaction using `Transaction.wrap()`. This ensures the integrity of your data update operation.

Do you need to do my updates one by one? Of course not. The size of your commit is all up to you! Keep reading to get some insights into why the way you handle transactions is essential! Maybe that optional "after-chunk-function" can help us there 😊.

Now you have a chunk-oriented job step to update the custom attribute `myBoolean` for a list of customers. This job step can be configured and run via the Business Manager in Salesforce B2C Commerce Cloud.

### Chunk Size

The "Chunk Size" option refers to the number of data items processed in each chunk (part of the total). The chunk size parameter is crucial in optimising transaction performance and ensuring efficient handling of large datasets.

The ideal chunk size for a script module depends on various factors, such as:

- **The processing logic's complexity:** Depending on the operations that must be done and other database objects that need to be fetched, we need to remember memory management. For example, choosing a smaller chunk size will allow the system to clean up more efficiently after processing each chunk.
- **The data set's size & the risk of optimistic locking:** When working with a "high risk" object such as profiles that can be modified at any time, setting a smaller chunk size and committing these immediately to the database will reduce the risk of running into [Optimistic Concurrency](https://help.salesforce.com/s/articleView?id=000393690&language=en_US&type=1) Exceptions!

### Transactional

When setting a job to transactional, the job step executes as a single and potentially substantial transaction. This means that if there are any errors during the execution of the job step, the entire transaction will be rolled back (because of the Optimistic Concurrency mentioned in the previous section).

This can be dangerous, primarily if the job processes a large amount of data. If the transaction is rolled back, all the data processed until that point will be lost. This can result in data consistency, integrity, and even performance issues.

Keeping the default setting false is recommended to avoid this negative impact and allow for more granular transaction control. Instead, implement transaction handling within the job step using the "[dw.system.Transaction](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/index.html?target=class_dw_system_Transaction.html)" API. This API provides more transaction handling control and better error handling and recovery mechanisms.

## Using a Chunk-Oriented Script Module in Jobs

Once your script module and `steptypes.json` are ready, upload them as part of your custom cartridge. You can then create a job in Business Manager with your custom chunk-oriented step to start processing data in chunks.

[![Chunk-oriented job step configuration screen in Business Manager.](/media/2023/configure-chunk-job-business-manager-ce41f2bdab.jpg)](/media/2023/configure-chunk-job-business-manager-ce41f2bdab.jpg)

### Advantages of "total-count"

If you decide to implement the "`total-count-function`", you can conveniently keep track of your job's progress in the Business Manager. This feature is handy if you have a large dataset and need to estimate when the job will be completed or if you want to know how far along the job has progressed on the list.

![Job status view showing processed items when total-count is enabled.](/media/2023/sfcc-job-status-total-count-chunks-299b79ade4.png)

Without the "total-count-function," we only see the amount processed, not the total record count.

![Job status view without total-count information for comparison.](/media/2023/sfcc-job-status-total-count-chunks-with-total-e82b2b178e.png)

Using the "total-count-function," we can determine the amount of processed records as well as the total number of records.

## Best Practices and Performance

When working with chunk-oriented job steps, keep the following best practices in mind for optimal performance:

- **Focus on memory management:** Only keep necessary items in memory and promptly discard references to processed items.
- **Stream data when appropriate:** Avoid accumulating large amounts of data in memory.
- **Utilise transactions strategically:** Wrap operations in transactions only when necessary to avoid locking resources for extended periods.
- **Monitor and handle errors:** Ensure your job can gracefully handle and recover from errors.
