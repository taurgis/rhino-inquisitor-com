---
title: Submitting a file to a third party service in SFCC
description: >-
  Learn how to submit files to a third-party service from SFCC with the Service
  Framework, including setup concerns and pitfalls.
date: '2023-01-02T08:00:00.000Z'
lastmod: '2022-12-29T18:02:41.000Z'
url: /submitting-a-file-to-a-third-party-service-in-sfcc/
draft: false
heroImage: /wp-content/uploads/2022/07/file-upload.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - file
  - services
  - sfcc
  - technical
author: Thomas Theunen
---
Salesforce B2C Commerce Cloud provides developers and architects with a [framework to integrate third-party services](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/web_services/b2c_webservices.html), making it much more streamlined to get up and running. With the [LocalServiceRegistry,](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/web_services/b2c_coding_your_web_service.html) you get some neat features like configuration management from the business manager, logging, and service monitoring! There are examples available on how to use this system, but how do you send a file to a service using it? There isn't an example available for this (except for an FTP service that, by definition, works with files).

## TLDR; solution

### Multipart/Form-Data

A [separate article is available](https://www.rhino-inquisitor.com/submit-multipart-form-data-to-a-third-party-service-in-sfcc/) if your service uses the Multipart format.

### Single File

For those who want a code snippet to copy and paste, here you go!

```

					LocalServiceRegistry.createService('test.http.post', {
        createRequest: function (svc, args) {
            var File = require('dw/io/File');
            // In case you have a variable endpoint
            svc.setURL(args.uploadUrl);
            return new File(args.filePath);
        },
        parseResponse: function(svc, client) {
            return client.text;
        }
    })

```

Or if you want more control over your request:

```

					LocalServiceRegistry.createService('test.http.post', {
	 	createRequest: function (svc, args) {
	 	    // In case you have a variable endpoint
			svc.setURL(args.uploadUrl);
			return args;
    	},
    	executeOverride: true,
        execute: function(svc, args) {
            var File = require('dw/io/File');
            var client = svc.client;
            client.send(new File(args.filePath));
        },
        parseResponse: function(svc, client) {
            return client.text;
        }
});

```

## Configuration in the Business Manager

In the Business Manager go to: "Administration > Operations > Services"

[![](/media/2022/administration-operations-services-ecba1de963.jpg) ](/media/2022/administration-operations-services-ecba1de963.jpg)

And click the "New" button on the bottom right. Here we can configure our service:

[![](/media/2022/test-http-post-service-be40e7ba49.jpeg) ](/media/2022/test-http-post-service-be40e7ba49.jpeg)

This example service is configured with the following values:

-   **Name:** It can be any name as long as it matches the name (ID) used in the code.
-   **Type:** In this case, HTTP service is selected. This ensures the Service Framework behind the scenes uses the correct client (HTTP).
-   **Service Mode:** To call the service endpoint, the value needs to be "Live."
-   **Log Name Prefix:** If you want to debug and have all request and response data in a dedicated file for this service, fill this in.
-   **Communication Log Enabled:** This must be enabled to debug the requests and responses through logging.
-   **Force PRD Behavior in Non-PRD Environments:** If you filter the logs and want to test as if it is a production environment, enable this.
-   **Profile:** Select the profile to be used (timeouts, rate limiting, circuit breaker.)
-   **Credentials:** Depending on the service, this needs to be configured.

Now everything is configured in the Business Manager, and we can move on to writing some code.

## Returning the file in createRequest

```

					LocalServiceRegistry.createService('test.http.post', {
        createRequest: function (svc, args) {
            ...
            return new File(args.filePath);
        }
    })

```

No rocket science is happening here. The Service Framework automatically detects it is a file being returned and executes the appropriate logic on the [HTTPClient](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_net_HTTPClient.html) "beneath the surface".

## In case we override the execute logic

```

					LocalServiceRegistry.createService('test.http.post', {
	 	createRequest: function (svc, args) {
	 	    ...
    	},
    	executeOverride: true,
        execute: function(svc, args) {
            var File = require('dw/io/File');
            var client = svc.client;
            client.send(new File(args.filePath));
        },
        parseResponse: function(svc, client) {
            ...
        }
});

```

Overriding the "execute" logic is quite simple. As explained in the [ServiceCallback](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_svc_ServiceCallback.html) documentation, we can use the "_executeOverride_" flag to write some custom code on how the external service is called. In this case, we get the original [HTTPClient](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_net_HTTPClient.html) from the [Service](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_svc_HTTPService.html) using "_svc.client._" This client has a function for us to send a file over to an external endpoint: [send(File)](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_net_HTTPClient.html#dw_net_HTTPClient_send_File_DetailAnchor).

## Effects on logging

When working with files, the function "[_filterLogMessage_](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_svc_ServiceCallback.html#dw_svc_ServiceCallback_filterLogMessage_String_DetailAnchor)" receives what you return in the "_createRequest_" call rather than the request's body. This might be a good thing if you are sending large files.

```

					INFO PipelineCallServlet|1954691750|Sites-RefArch-Site|Login-Post|PipelineCall|kxZB-_nwKL custom.service.test.http.post.COMM []  Request:
[File path=/TEMP/my-file.zip]

```
