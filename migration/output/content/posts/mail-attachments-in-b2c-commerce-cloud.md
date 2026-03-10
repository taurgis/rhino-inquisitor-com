---
title: Mail Attachments in B2C Commerce Cloud
description: >-
  Sooner or later, a client will ask: "Can we attach the PDF invoice to the
  order confirmation email?" In the world of Salesforce B2C Commerce Cloud, a
date: '2022-03-15T06:04:04.000Z'
lastmod: '2025-07-16T14:10:47.000Z'
url: /mail-attachments-in-b2c-commerce-cloud/
draft: false
heroImage: /media/2022/mail-a7e287274f.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - mail
  - pdf
  - sfcc
author: Thomas Theunen
---
Sooner or later, a client will ask: "Can we attach the PDF invoice to the order confirmation email?" In the world of Salesforce B2C Commerce Cloud, a seemingly simple request sends a developer down a rabbit hole of undocumented features and hidden platform quirks. The standard dw.net.Mail API offers no 'addAttachment' method. The official documentation is silent. The developer is on their own.

This report will deconstruct the MIME protocol, build a bulletproof, reusable service for generating attachments, navigate the treacherous gauntlet of platform quotas, and discuss the strategic choice between this native method and a third-party Email Service Provider (ESP).

## TLDR; Solution

For those who want a quick solution to their attachment problem without extensive reading, here you go!

An alternative example can also be found [here](https://github.com/taurgis/salesforce-commerce-cloud-libraries/blob/master/cartridges/plugin_testlibraries/cartridge/controllers/jsPDF.js)!

### Controller

```

					'use strict';
var server = require('server');
/**
 * Encodes a string into a base64 string with an email-safe line width
 *
 * @param {string} str String the string to encode
 * @param {string} characterEncoding String the character encoding (i.e. 'ISO-8859-1')
 *
 * @return {string} The encoded string
 */
function encodeBase64ForEmail(str, characterEncoding) {
    var StringUtils = require('dw/util/StringUtils');
    var StringWriter = require('dw/io/StringWriter');
    var strBase64 = StringUtils.encodeBase64(str, characterEncoding);
    var strBase64LB = '';
    var stringWriter = new StringWriter();
    var offset = 0;
    var length = 76;
    while (offset < strBase64.length) {
        var maxOffset = offset + length;
        if (strBase64.length >= maxOffset) {
            stringWriter.write(strBase64, offset, length);
            stringWriter.write('n');
        } else {
            stringWriter.write(strBase64, offset, length - (maxOffset - strBase64.length));
        }
        offset += length;
    }
    stringWriter.flush();
    strBase64LB = stringWriter.toString();
    stringWriter.close();
    return strBase64LB;
}
/**
 * Read a file to a String (encoded in IS0-8859-1)
 *
 * @param {string} filePath - The file path to read
 *
 * @return {string} - The file content
 */
function readPDFFile(filePath) {
    var File = require('dw/io/File');
    var FileReader = require('dw/io/FileReader');
    var testPDF = new File(filePath);
    var pdfReader = new FileReader(testPDF, 'ISO-8859-1');
    var pdfContent = '';
    var line = '';
    /**
     * Warning: You can reach the maximum string length with this code!
     */
    do {
        line = pdfReader.readN(1000);
        pdfContent += line;
    } while (line != null);
    return pdfContent;
}
/**
 * Add files to the attributes to render the mail template.
 *
 * @param {dw.util.Map} mailAttributes - The mail attributes
 */
function addFilesToMailAttributes(mailAttributes) {
    var Map = require('dw/util/HashMap');
    var pdfContent = readPDFFile('IMPEX/jspdf/test_0.pdf');
    var files = new Map();
    files.put('test.pdf', encodeBase64ForEmail(pdfContent, 'ISO-8859-1'));
    mailAttributes.put('Base64FileMap', files);
}
/**
 * Just an example controller to test sending a mail with attachments
 */
server.get('Test', function (req, res, next) {
    var Map = require('dw/util/HashMap');
    var Template = require('dw/util/Template');
    var Mail = require('dw/net/Mail');
    // Create the template that we will use to send the email.
    var template = new Template('mail/testMail.isml');
    // Work with a HashMap to pass the data to the template.
    var mailAttributes = new Map();
    mailAttributes.put('EmailMessage', 'Test Message');
    addFilesToMailAttributes(mailAttributes);
    var mail = new Mail();
    // Render the template with the data in the Hash
    var content = template.render(mailAttributes);
    mail.addTo('thomas.theunen@gmail.com');
    mail.setFrom('info@forward.eu');
    mail.setSubject('Example Email');
    mail.setContent(content);
    res.json({
        success: mail.send().message,
        content: content.getText()
    });
    next();
});
module.exports = server.exports();



```

### Template

```

					--001a113414f6401b8604f1451630
Content-Type: multipart/mixed; boundary=001a113414f6401b8604f1451630
--001a113414f6401b8604f1451630
Content-Type: text/plain; charset=ISO-8859-1
Content-Transfer-Encoding: quoted-printable

--001a113414f6401b8604f1451630
Content-Type: text/html; charset=ISO-8859-1
Content-Transfer-Encoding: quoted-printable

--001a113414f6401b8604f1451630
Content-Type: application/pdf; name="${key}";
Content-Description: ${key}
Content-Disposition: attachment; filename="${key}"; size=${fileContent.length}; creation-date="${(new Date()).toISOString()}"; modification-date="${(new Date()).toISOString()}"
Content-Transfer-Encoding: base64
${fileContent}
--001a113414f6401b8604f1451630--



```

## Deconstructing the Challenge: Why dw.net.Mail Plays Hard to Get

### The Root of the Problem: A Deliberate Abstraction

The lack of a simple attachment feature in the `dw.net.Mail` class is not an oversight but a design choice. A review of the API documentation reveals methods for setting recipients, subjects, and content, but no methods are provided for files. The API is a high-level wrapper, engineered for a specific purpose: sending simple, transactional text or HTML emails with minimal fuss. It deliberately abstracts away the complexities of the underlying email protocols.

This design philosophy reflects a broader platform strategy. Salesforce offers a comprehensive ecosystem of interconnected products, including the powerful Marketing Cloud for sophisticated email campaigns, and recommends third-party ESPs for bulk email sending.

The fact that sending an attachment requires a developer to manually construct the email at a low level—a task akin to building a raw HTTP request by hand—while the rest of the platform offers high-level abstractions, is a strong signal.

The platform is implicitly [guiding](https://help.salesforce.com/s/articleView?id=000391416&type=1) developers toward more robust, specialised, and often separately licensed solutions for complex requirements. The built-in mailer is for basic transactions. For anything more, the intended path is to integrate with a service _designed_ for that purpose.

This guide, therefore, is about learning to operate skillfully and safely outside of that intended path when business needs demand it.

### Welcome to the MIME-Verse

Because the `dw.net.Mail` API will not do the heavy lifting, the developer must do it. This means manually constructing a `multipart/alternative` or `multipart/mixed` email.

This is the world of Multipurpose Internet Mail Extensions ([MIME](https://en.wikipedia.org/wiki/MIME)). In layman's terms, the process involves splitting the message into multiple, distinct pieces and separating them with a predetermined key or "boundary".

It's a way of telling the recipient's email client, "This message isn't just one thing; it's a collection of parts—some plain text for compatibility, some rich HTML for the main body, and one or more files." The entire construction, including the headers and the multipart body, must be rendered into a single string and passed to the `mail.setContent()` method.

### The Role of Base64 Encoding

Email is a fundamentally text-based protocol. The raw bytes of a PDF or a JPEG image cannot be simply dumped into the message body. Doing so would corrupt the file and likely cause the email to be rejected by mail servers. The solution is to encode the binary file data into a text-safe format. This is the role of [Base64](https://en.wikipedia.org/wiki/Base64) encoding.

Base64 is the universal translator that converts any binary data into a long string of 64 common ASCII characters that can travel safely through any mail server on the internet. The process involves reading the file's binary content, running it through a Base64 encoding algorithm, and then embedding that resulting string within the appropriate MIME part of the email structure. The email client then reads the `Content-Transfer-Encoding: base64` header, decodes the string back into its original binary form, and presents it to the user as a downloadable file. This encoding step is non-negotiable and is the technical cornerstone of sending attachments natively from SFCC.

## Breakdown of the solution

"Give a man a fish, and he'll eat for a day. Teach a man to fish, and he'll eat for a lifetime." We will be taking this approach to the code above.

You can easily copy-paste the code from above and get it to work with your project, but it is also essential to understand each piece of the puzzle. If something goes wrong or an unexpected change is needed, you will know where to look.

### The controller

Within the controller, we have multiple functions to help us get all the data to send that e-mail with an attachment.

_Note: It would be best to move these to a helper file for re-use!_

#### base64

To work with files (and emails), [base64 encoding](https://en.wikipedia.org/wiki/Email_attachment#:~:text=With%20MIME%2C%20a%20message%20and,support%20via%20the%208BITMIME%20extension.) is the way to go. We will be working with a [multipart](https://en.wikipedia.org/wiki/Multipart_message) message to get this to work.

We have the following function in the controller to help us get the required string to use in the mail.

```

					/**
 * Encodes a string into a base64 string with an email-safe line width
 *
 * @param {string} str String the string to encode
 * @param {string} characterEncoding String the character encoding (i.e. 'ISO-8859-1')
 *
 * @return {string} The encoded string
 */
function encodeBase64ForEmail(str, characterEncoding) {
    var StringUtils = require('dw/util/StringUtils');
    var StringWriter = require('dw/io/StringWriter');
    var strBase64 = StringUtils.encodeBase64(str, characterEncoding);
    var strBase64LB = '';
    var stringWriter = new StringWriter();
    var offset = 0;
    var length = 76;
    while (offset < strBase64.length) {
        var maxOffset = offset + length;
        if (strBase64.length >= maxOffset) {
            stringWriter.write(strBase64, offset, length);
            stringWriter.write('n');
        } else {
            stringWriter.write(strBase64, offset, length - (maxOffset - strBase64.length));
        }
        offset += length;
    }
    stringWriter.flush();
    strBase64LB = stringWriter.toString();
    stringWriter.close();
    return strBase64LB;
}


```

And once we have that base64 encoded string, we can use it in our mail template. And inside that template, we are adding some metadata to give information about the file we are trying to send:

-   **Content-Type**: Here, we will mark which file type and what name the file has.
-   **Content-Description:** The description of the file
-   **Content-Disposition:** Here, we provide more information about the file like its filename, the size of the PDF, ...
-   **Content-Transfer-Encoding**: Here, we tell the mail client that the attachment is encoded using base64

```

					--001a113414f6401b8604f1451630
Content-Type: application/pdf; name="${key}";
Content-Description: ${key}
Content-Disposition: attachment; filename="${key}"; size=${fileContent.length}; creation-date="${(new Date()).toISOString()}"; modification-date="${(new Date()).toISOString()}"
Content-Transfer-Encoding: base64
${fileContent}


```

As you can see, base64 poses no real challenge for Salesforce Commerce Cloud, and we will be able to send attachments quite easily using it.

#### ISO-8859-1

Within the controller, we have multiple options to work with:

-   [On-the-fly generation of a file](/pdf-and-salesforce-commerce-cloud-b2c/)
-   Reading a file from the WebDAV



In this example, we will be using the second option.

```

					/**
 * Read a file to a String (encoded in IS0-8859-1)
 *
 * @param {string} filePath - The file path to read
 *
 * @return {string} - The file content
 */
function readPDFFile(filePath) {
    var File = require('dw/io/File');
    var FileReader = require('dw/io/FileReader');
    var testPDF = new File(filePath);
    var pdfReader = new FileReader(testPDF, 'ISO-8859-1');
    var pdfContent = '';
    var line = '';
    /**
     * Warning: You can reach the maximum string length with this code!
     */
    do {
        line = pdfReader.readN(1000);
        pdfContent += line;
    } while (line != null);
    return pdfContent;
}


```

While this solution relies on `[ISO-8859-1](https://en.wikipedia.org/wiki/ISO/IEC_8859-1)`, the modern and recommended standard for all email development is **`UTF-8`**. For any new implementation in Salesforce B2C Commerce Cloud, you should attempt to use `UTF-8`. This encoding provides universal compatibility, correctly handling international characters, symbols (e.g., €, ©), and emojis that are common in today's digital landscape and would otherwise fail or cause issues with a more limited character set.

The principle of consistency, however, remains paramount. Whichever encoding you choose—and we strongly recommend it **`UTF-8`**—it must be applied uniformly at every single step of the process. This means specifying `UTF-8` when reading the file's bytes into a string, when declaring the charset in your `<iscontent>` tag, and in every `Content-Type` header within the MIME structure. This discipline is not optional; it is the key to ensuring that the receiving email client can correctly reconstruct the file, preventing data corruption and guaranteeing a valid attachment for the end-user.

ISO-8859-1 This encoding was chosen because the jsPDF library I used during testing relies on the 'addImage' plugin, which has ISO-8859-1 hard-coded for adding JPEG images to PDFS. When this encoding isn't used consistently across the examples, the PDF renders correctly but the images do not display. Encoding Might Differ In my experience, ISO-8859-1 encoding works best for handling files. However, if you encounter unreadable files, experimenting with the encoding settings in the reader, template, or other levels could help resolve the problem.

### The template

Within the template, we will be using a few tricks to get our solution to work.

#### Content-Type: multipart/alternative

For mails to work with multiple files and a text or HTML option, we must work with the [multipart](https://nl.wikipedia.org/wiki/Multipurpose_Internet_Mail_Extensions) content type and [boundaries](https://www.w3.org/Protocols/rfc1341/7_2_Multipart.html).

But what does this mean? In layman's terms, we split our messages into multiple pieces separating them by a predetermined key.

At the top of the file, we tell the system which key it is within the Content-Type (both to Commerce Cloud using the [`<iscontent>`](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/isml/b2c_iscontent.html) tag and the HTML itself for the e-mail reader).

Boundary definition error On recent code compatibility modes, we have noticed an error to the likes of "No start boundary defined".

Removing the "Content-Type: multipart/mixed; boundary=001a113414f6401b8604f1451630" below the tag resolves this.

```

					--001a113414f6401b8604f1451630
Content-Type: multipart/mixed; boundary=001a113414f6401b8604f1451630


```

Once the key has been set, it can "split up" the mail into different parts. A good example is a separate part for the plain-text and HTML emails.

_Note: Do not forget the '--' in front of the key as you see them in the examples._

```

					--001a113414f6401b8604f1451630
Content-Type: text/plain; charset=ISO-8859-1
Content-Transfer-Encoding: quoted-printable

--001a113414f6401b8604f1451630
Content-Type: text/html; charset=ISO-8859-1
Content-Transfer-Encoding: quoted-printable

--001a113414f6401b8604f1451630--


```

The same methodology is used for the files. Each attachment gets its own "section" separated by that same key.

```



--001a113414f6401b8604f1451630
Content-Type: application/pdf; name="${key}";
Content-Description: ${key}
Content-Disposition: attachment; filename="${key}"; size=${fileContent.length}; creation-date="${(new Date()).toISOString()}"; modification-date="${(new Date()).toISOString()}"
Content-Transfer-Encoding: base64
${fileContent}



```

#### Watch out for spaces and new lines

You will have undoubtedly noticed that the code within the template is quite compressed and not "pretty printed."

Multipart is extremely sensitive to empty lines, tabs, and spaces. So keep that in mind when making modifications to the template.

## Navigating the Gauntlet: Quotas, Sources, and Composable Strategy

We have been working with PDF in this example, but you can also use this solution for other file types! You could send CSV reports, as an example, using this method.

### jsStringLength

When working with files (especially in the storefront), you have to keep watch of the [Quota Limits](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/DWAPI/quota/html/index.html?resultof=%22%71%75%6f%74%61%22%20%22%6c%69%6d%69%74%22%20) - every developer's friend in SFCC.

In my example, one is especially one to keep an eye on.

![A screenshot of the quota limit surround string length in Salesforce Commerce CLoud.](/media/2022/api-jsstringlength-6ae1560d95.png)

There are multiple ways to work around this limit, but we will not be digging into that in this post.

### Template Size

Now for the gotchas, because in the world of Commerce Cloud, there are always gotchas. Two critical and distinct size limits are waiting to trip you up, and confusing them can lead you straight into a debugging nightmare. The first is a 10 MB ceiling on the rendered template response. Think of this as a server-side guardrail within the application server itself. As the `ISMLRenderer` processes your template, it combines your email's text and, more importantly, the Base64-encoded string of your attachments. This Base64 encoding is a key detail, as it inflates the file size by roughly 33%. If this combined, in-memory result surpasses 10 MB, the platform protects itself by throwing a server error and halting the process.

**_You'll see the failure in your logs; it's a noisy, obvious problem._**

However, the more immediate and ruthless limit—the one that truly matters for delivery—is the **3 MB quota for the final, sent email**. This is not a template-rendering limit; it's a [hard quota](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-dev-best-practices.html#email-support) imposed by the Salesforce mail gateway that physically transmits the message. This is where things get insidious. Your code can successfully render a 5 MB template (well under the 10 MB limit), and the `dw.net.Mail` script will execute without any errors, leading you to believe the email is on its way. However, when the 5 MB package reaches the mail server, it is silently dropped because it exceeds the 3 MB quota. There's no error thrown back to your script, no explicit failure in the logs—the email simply vanishes into the void.

To clarify, your attachment strategy should prioritise the smaller of the two limits. The 10 MB template limit is a technical constraint, but the 3 MB mail gateway limit is the real practical ceiling. You need to calculate the total payload size, including headers, HTML body, and all attachments, after Base64 encoding, to ensure it remains within that 3 MB limit. Ignoring this means your emails won't be delivered; instead, you'll be running code that sends your data nowhere.

## Not just PDF

We have been working with PDF in this example, but you can also use this solution for other file types! You could send CSV reports, as an example, using this method.

## Sources

It wouldn't be fair to the authors if I did not provide links to the sources I used to get a working example.

-   [GitHub: dpavlikovskiy](https://github.com/dpavlikovskiy/mhe_enhancements/blob/f437062fd851d96c15c4f4366d48ddcdf8147c1f/cartridges/int_simplefeed_jfw/cartridge/templates/default/mail/emailTemplateAttachment.isml)
-   [Salesforce B2C Commerce Cloud Unofficial Slack](https://sfcc-unofficial.slack.com/archives/CAT794PC3/p1616592855270900)

## The Composable Storefront Consideration

The architecture built thus far is entirely server-side logic. In a traditional SFRA world, it would be called from a controller as shown. In the modern landscape of the Composable Storefront (PWA Kit), the core service logic does not change, but the access pattern does.

The code should be integrated into a custom API endpoint or a hook within a standard one that utilises the Commerce API (SCAPI). The PWA Kit front-end would then securely and authentically call this endpoint—such as after a successful checkout—to initiate the email creation and dispatch process on the server.

The main task of building the MIME stream remains the same, but when the attachment is something a user submits via the front-end, it introduces a whole new set of concerns. However, that might be an idea for a future article.

## The Strategic Choice: Native Attachments vs. The ESP Alternative

A powerful new tool now joins the developer's toolkit. Yet, experienced developers understand that just because something can be created doesn’t mean it should be. This native attachment method acts like a scalpel, ideal for targeted, low-volume transactional tasks. For more complex or demanding situations, a different approach is necessary.

The superior alternative for more complex requirements is to integrate a third-party Email Service Provider (ESP) or Marketing Automation Platform, such as [Marketing Cloud](https://www.salesforce.com/marketing/). Salesforce itself recommends this path for any form of bulk mailing. The integration is typically straightforward, involving a call to the a REST API from an SFCC service configured in the Business Manager.

### A Clear Decision Tree

The choice becomes clear when framed by project needs.

Use the **Native SFCC Method** when:

-   The use case is strictly for low-volume, transactional emails with attachments.

-   The attached files are consistently small (well under 1 MB to leave room for the email body) to avoid breaching the 3 MB limit.

-   Cost is the absolute primary driver, and leveraging the included platform functionality is a mandate.

-   There is no business requirement for email tracking, analytics, or advanced deliverability management.


Use a **Third-Party ESP** when:

-   Emails need to be sent at any significant scale.

-   Deliverability and inbox placement are paramount for the business.

-   The business requires analytics on open rates, click-throughs, and user engagement.

-   Attachments regularly exceed 1-2 MB, making the native 3 MB limit a constant risk.

-   The development team's time is better spent on core commerce features than on manually managing MIME complexities.
