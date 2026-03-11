---
title: Submit "multipart/form-data" to a third-party service in SFCC
description: >-
  A use case you will not run into often is submitting a file to a third-party
  service. And it is not easy to find documentation or examples on how to do it.
date: '2022-05-23T16:17:58.000Z'
lastmod: '2022-07-23T22:01:29.000Z'
url: /submit-multipart-form-data-to-a-third-party-service-in-sfcc/
draft: false
heroImage: /media/2022/files-cb310f59d5.jpeg
categories:
  - Technical
tags:
  - sfcc
  - technical
author: Thomas Theunen
---
A use case you will not run into often is submitting a file to a third-party service. And it is not easy to find documentation or examples on how to do it.  For that reason, I decided to write a quick guide on implementing it!

It turns out it is not hard to do once you have all the puzzle pieces! But isn't that the case with many things?

## TLDR; Solution

For the people who want a quick solution to their file upload problem without much reading work, here you go!

And before you start commenting that I put everything in a controller, it is just an example. Please use helper classes and the works, and don't put everything in a controller.

```
'use strict';
var server = require('server');
server.get('SubmitFile', function (req, res, next) {
    var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
    var HTTPRequestPart = require('dw/net/HTTPRequestPart');
    var File = require('dw/io/File');
    var myFormSubmissionService = LocalServiceRegistry.createService("FormService", {
        createRequest: function(svc, params) {
            var zipFile = new File(new File(File.TEMP), 'myFile.zip.gz');
            return [
                new HTTPRequestPart('zipFile', zipFile, 'application/gzip', 'UTF-8'),
                new HTTPRequestPart('zipFile-two', zipFile, 'application/gzip', 'UTF-8'),
            ];
        },
        parseResponse : function(svc, response) {
            return response;
        }
    });
    res.print(myFormSubmissionService.call().object.text)
    next();
});
module.exports = server.exports();
```

## Pieces of the puzzle

### Files

In this example, we use a file on the Webdav located in the TEMP directory:  "/on/demandware.servlet/webdav/Sites/Temp".

There are multiple ways to submit files, like a base64 encoded file string stored in different ways within Salesforce B2C Commerce Cloud. But we will not be covering these alternatives. The example should be enough to get you started.

### LocalServiceRegistry

As with any third-party integration, please use the built-in [LocalServiceRegistry](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_svc_LocalServiceRegistry.html).

But how do you configure it in the Business Manager? Let's have a look!

[![Third-party form service screen used in the multipart submission example.](/media/2022/form-service-1-e901798db6.png)](/media/2022/form-service-1-e901798db6.png)

Select the type "HTTP"; otherwise, the LocalServiceRegistry code might not behave as expected.

As for the profile and credentials linked to your service, they will depend on your implementation.

### Building the request

```
var zipFile = new File(new File(File.TEMP), 'myFile.zip.gz');
return [
    new HTTPRequestPart('zipFile', zipFile, 'application/gzip', 'UTF-8'),
    new HTTPRequestPart('zipFile-two', zipFile, 'application/gzip', 'UTF-8'),
];
```

To build up the multipart request, we need to ensure that we return an Array of [HTTPRequestParts](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_net_HTTPRequestPart.html). We submit the same file twice; they can, of course, be different.

In this example, we pass multiple [files](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_io_File.html). But it can also be other types:

-   [File](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_io_File.html)
-   [String](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_TopLevel_String.html)
-   [Bytes](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_util_Bytes.html)

### Encoding

```
new HTTPRequestPart('zipFile', zipFile, 'application/gzip', 'UTF-8');
```

When working with files, you must [send extra information](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_net_HTTPRequestPart.html#dw_net_HTTPRequestPart_HTTPRequestPart_String_Bytes_String_String_String_DetailAnchor) along the way:

-   **Content-Type:** The type of file, in this case, a zipped file (application/gzip)


-   **Encoding:**  The type of encoding of the file; if it is incorrect, it will be unreadable at the other end. Or it might open but show unreadable content.


-   **File Name:** You can also send the file name along if needed.

## The Response

```
res.print(myFormSubmissionService.call().object.text)
```

Nothing special to mention here. You will be able to handle the response like any service call and check whether or not the call was successful.
