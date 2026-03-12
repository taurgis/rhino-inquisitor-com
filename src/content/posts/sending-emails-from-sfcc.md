---
title: Sending Emails from SFCC
description: >-
  This article covers the reasons for opting to send emails via Salesforce
  Commerce Cloud, the platform's limitations, the steps for programmatically
date: '2024-12-09T08:19:31.000Z'
lastmod: '2024-12-11T16:13:38.000Z'
url: /sending-emails-from-sfcc/
draft: false
heroImage: /media/2024/delivering-mail-in-sfcc-c46d2358ed.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - composable storefront
  - sfcc
  - sfra
  - technical
author: Thomas Theunen
---
Salesforce B2C Commerce Cloud is known as a [monolithic](https://www.atlassian.com/microservices/microservices-architecture/microservices-vs-monolith) system, providing a wide range of functionalities out of the box. One of the "_smaller_" features of the platform is its capability to send [emails directly](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-sending-email-via-scripts-or-hooks.html) without needing a third-party service.

In this article, we will discuss the reasons for choosing to send emails from Salesforce Commerce Cloud, the limitations of the platform, the steps to programmatically send an email, how to test email templates, the process of configuring SPF records, and whether you can utilise your own SMTP server.

## Why Choose Salesforce B2C Commerce Cloud for Email

In many past projects, I have opted to send emails from a Marketing Automation platform since it has many benefits compared to the built-in functionality. But if the items below do not affect you, SFCC can be a great platform to send your [transactional emails](https://help.salesforce.com/s/articleView?id=sf.icx_b2c_transactionalemail_req_workflow.htm&type=5) (order confirmation, password reset, registration, etc.).

### Marketing Opportunities

In most Marketing platforms, you have the freedom to be highly flexible with the templates, adapting them to the current time period and campaigns happening. In Salesforce B2C Commerce Cloud, a code deployment is necessary, and extra testing is required to ensure the built functionalities still work. This can increase the workload, making it less feasible to make multiple adaptations over the year.

While you may not want to modify your transactional emails frequently, it's a lot easier to give them a nice 'holiday' or 'easter' styling for a few weeks in the year using dedicated marketing tools.

![Illustration of seasonal variations in transactional email design.](/media/2024/a-mail-across-the-year-15b12cb7bc.jpg)

#### Page Designer to the rescue

With the addition of [Page Designer](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-dev-for-page-designer.html) a few years ago, we have gotten a more "visual" way of creating pages, compared to static ISML templates with slots and Content Assets.

But with choosing to go this route, a few things need to be kept in mind:

- A separate "master" template is required without the regular header/footer
- Only components that include HTML/CSS understood by mail clients should be used (modern HTML & CSS can cause issues in some mail clients).
- Personalization (Customer Groups in particular) can pose difficulties when the mail originates from a job rather than a direct storefront request, as the session "current customer" is not readily accessible.
- If a user inadvertently deletes the page (yes, accidents happen), there should be a backup option or a notification to resolve the issue promptly.

### Only Basic Features

Salesforce's email capabilities may not be as feature-rich as those of dedicated email marketing platforms. You might miss advanced features such as personalised templates, optimised sending times and tracking.

### Deliverability Concerns

Ensuring high deliverability rates can be challenging because you're relying on shared IP addresses, which may affect the reputation of your emails. We will return to this topic later in the article since the platform provides us with some solutions!

### Cost

The previous points may seem like I'm advocating for a dedicated email platform. However, the marketing automation features I mentioned come with costs!

Generally, each email sent comes with a charge, and these costs can accumulate significantly over time month.

Fortunately, Salesforce Commerce Cloud doesn't require a separate license, allowing you to send **unlimited emails ** at** no additional cost**!

Marketing Mails Sending transactional emails via Commerce Cloud remains the most sensible option, as creating marketing emails in SFCC is quite "challanging," to put it mildly.

## How to Send an Email Programmatically

Emails can be sent from Salesforce B2C Commerce Cloud via code easily. Here's a basic example using server-side scripts:

```js
function sendMail() {
    var mail = new dw.net.Mail();
    mail.addTo("to@example.org");
    mail.setFrom("from@example.org");
    mail.setSubject("Example Email");
    mail.setContent('my basic text content');
    mail.send();//returns either Status.ERROR or Status.OK, mail might not be sent yet, when this method returns
}
```

You can enhance your options further by creating custom ISML templates, offering greater flexibility:

```js
function sendMail() {
    var template = new dw.util.Template("myTemplate.isml");
    var content = template.render(o);
    var mail = new dw.net.Mail();
    mail.addTo("to@example.org");
    mail.setFrom("from@example.org");
    mail.setSubject("Example Email");
    mail.setContent(content);
    mail.send();//returns either Status.ERROR or Status.OK, mail might not be sent yet, when this method returns
}
```

But then, of course, comes the next question...

## How do I test email templates in Commerce Cloud

Unlike many Marketing Automation tools available today, the SFCC platform lacks an out-of-the-box email testing feature. However, there are ways to custom-build a solution.

### Rendering Controller

With an ISML mail template, you can create a controller to display the email as a web page, using pre-defined parameters that enable developers and testers to easily see how it will appear.

Production Hide this endpoint, or never deploy this controller to production.

### Email Test Controller

You could also build a controller that will send an email to an address passed, with other parameters like:

```text
TestEmail-Send?email=myemail@mail.com&orderId=10000001
```

This would send an email for that specific order to the email passed, allowing testers and developers to verify the template without having to go through the entire checkout flow.

Production Hide this endpoint, or never deploy this controller to production.

## Configuring SPF Records

Sender Policy Framework ([SPF](https://en.wikipedia.org/wiki/SPF)) records are crucial for ensuring email deliverability. If this is not configured, providers such as Outlook and Gmail will simply prevent your emails from arriving. They will be completely blocked and will not even arrive in the spam folder.

Configuring these SPF records is clearly documented [in the Salesforce SPF setup guide](https://help.salesforce.com/s/articleView?id=000391416&type=1).

## Can I Use My Own SMTP Server

[![Email Settings screen used to configure SMTP and DKIM options.](/media/2024/sfcc-email-settings-21507245df.png)](/media/2024/sfcc-email-settings-21507245df.png)

Administration > Operations > Email Settings

Salesforce B2C Commerce Cloud supports [the use of an external SMTP server for sending emails](https://help.salesforce.com/s/articleView?id=cc.b2c_business_manager_email_configurator.htm&type=5). If you already have an established SMTP service or require advanced configurations, using an external SMTP server allows you to gain more control over the email delivery process, customise your settings, and potentially improve email deliverability rates.

### DKIM Support

Using these SMTP settings, you can set up [DKIM](https://en.wikipedia.org/wiki/DomainKeys_Identified_Mail) directly on the same page in the Business Manager.

## What rules must I follow

Under typical usage, you should encounter no issues. However, certain security measures may lead to a [lockout](https://help.salesforce.com/s/articleView?id=000395276&type=1).

In the worst case, you will not be able to send emails for 48 hours.

## Are attachments possible

Absolutely! This was among the first articles I published on the blog: [How to send PDFs as attachments](/mail-attachments-in-b2c-commerce-cloud/) (though you're certainly not restricted to just PDFs).

## Can I send mails from the Composable Storefront

Directly from the Managed Runtime? No.

You will have to make an API call to a [custom API](/in-the-ring-ocapi-versus-scapi/) or [hook](/how-to-use-ocapi-scapi-hooks/) into an existing standard API to attach sending an email through the platform.

## Conclusion

While Salesforce B2C Commerce Cloud may not offer the same range of features as most Marketing Automation tools, it can still be highly effective for transactional messaging.
