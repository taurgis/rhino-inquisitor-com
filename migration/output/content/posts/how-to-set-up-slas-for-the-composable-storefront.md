---
title: How to set up SLAS for the Composable Storefront
description: >-
  Are you setting up your Composable Storefront and wondering what the SLAS
  Client ID is all about? You're not alone! The $1, or SLAS, has been gaining
  po...
lastmod: '2023-01-16T08:12:55.000Z'
url: /how-to-set-up-slas-for-the-composable-storefront/
draft: false
heroImage: /media/2023/slas-public-client-registered-user-b2c-a930192dd5.jpg
date: '2023-01-16T08:12:41.000Z'
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - composable storefront
  - sfcc
  - slas
  - technical
author: Thomas Theunen
---
Are you setting up your Composable Storefront and wondering what the SLAS Client ID is all about? You're not alone! The [Shopper Login and API Access Service](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas.html), or SLAS, has been gaining popularity, but it can be challenging to set up. But don't worry. We've got you covered. Instead of diving into a sea of Administrative APIs, we're here to break it down and show you a simple way to set up your SLAS. Keep reading to find out how!

## Official Guide

Salesforce has a guide for this installation publicly available. Some steps are more fine-grained here, whilst others are more detailed in the official guide. [https://developer.salesforce.com/docs/commerce/commerce-api/guide/authorization-for-shopper-apis.html](https://developer.salesforce.com/docs/commerce/commerce-api/guide/authorization-for-shopper-apis.html) This official guide also shows you how to use the APIs, which I will not cover here.

## Step 1: Get a sandbox

If you want to connect the Composable Storefront to your own APIs (including SLAS), you need your own Sandbox. We will not be digging into this topic here, but the information to get one [is described in a previous article](/how-to-get-a-salesforce-b2c-commerce-cloud-sandbox/) and [the official documentation](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/creating-an-on-demand-sandbox.html).

## Step 2: Go to the Salesforce Commerce API Settings

After you have logged into the Business Manager of your environment, go to the following: "Administration > Site Development > Salesforce Commerce API Settings"

[![](/media/2023/slas-admin-ui-button-business-manager-7bdbd7a798.jpg)](/media/2023/slas-admin-ui-button-business-manager-7bdbd7a798.jpg)

The link is only visible if you have DWithEase (Browser Extension) installed.

The link is not there If you do not see the link (The link is inserted by [DWithEase](https://dwithease.com/)), manually go to the URL: https://**{{Short\_Code}}**.api.commercecloud.salesforce.com/shopper/auth-admin/v1/sso/login On this screen, some necessary information to install the PWA Kit can be found. But besides the Short Code and the Organization ID, there is an interesting link present. "SLAS Admin UI" Let's click that now, shall we? [![](/media/2023/slas-admin-ui-login-ff882d0848.jpg) ](/media/2023/slas-admin-ui-login-ff882d0848.jpg)When we click this link, the above screen should become visible. It shows a blue button with the text "SLAS Admin UI Login". We are logged in with our Account Manager user when this link is clicked. To manage SLAS, we need the necessary permission (given to us by an Account Manager "Account Manager": Scopes Do not forget to assign the correct scopes to this role! [![](/media/2023/slas-rights-account-manager-dfaa6aa6b8.jpg)](/media/2023/slas-rights-account-manager-dfaa6aa6b8.jpg)

## Step 3: Add a new SLAS Client

If the used account has the correct permissions, we should be greeted by a friendly "Welcome screen".  [![](/media/2023/slas-admin-welcome-ui-bbc3ad8da9.jpg) ](/media/2023/slas-admin-welcome-ui-bbc3ad8da9.jpg)On this page, click the "Clients" tab to go to the list of active clients we are permitted to manage (see scopes in the previous step). [![](/media/2023/slas-admin-add-client-c488a4b6e3.jpg) ](/media/2023/slas-admin-add-client-c488a4b6e3.jpg)Click the "Add Client" button on this page to go to the next step. [![](/media/2023/slas-admin-ui-new-client-pwa-kit-c70f8d1fd1.jpg) ](/media/2023/slas-admin-ui-new-client-pwa-kit-c70f8d1fd1.jpg)And with that, we are almost there! Fill in the following information:

-   **What tenant will be used?:** Fill in the Tenant ID, part of the Organization ID, from step two. (format: xxxx\_sxx)
-   **What site will be used?:** Here, we fill in the site IDs used - separated by a space.
-   **Which App Type will be used?:** Well... the article is for the Composable Storefront - So let us select "_PWA Kit or SFRA or Mobile_".Selecting this option will make a "[Public Client](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas-public-client.html)".
-   **Client Id:** The Client ID to use during the installation of the PWA Kit. This can be left as-is. _**Note:**_ _This Client Id does not need to exist as an API Client in the Account Manager - They are not related!!!_
-   **Secret:** Public Clients do not need a secret
-   **Do you want the default shopper scopes?:** Since we will be using the PWA Kit, leave this checked.
-   **Enter custom shopper scopes:** This step can be left empty.

As the final step: "Click Submit". Otherwise, not a lot is going to be happening.

### Typo in the scopes

Currently (January 16th, 2023), there is an error in the default scopes that needs to be fixed manually. Specifically, there is a missing space between "sfcc.shopper-myaccount.orders" and "sfcc.shopper-myaccount.paymentinstruments". [![](/media/2023/typo-in-scopes-3b0626d7b7.png)](/media/2023/typo-in-scopes-3b0626d7b7.png)

## Step 4: Enable OCAPI endpoints

Follow step "Update Open Commerce API Settings" on the following page using the SLAS Client ID generated in the previous step: [https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/setting-up-api-access.html](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/setting-up-api-access.html)

## Step 5: Use the new SLAS Client

Now that we have our SLAS Client, Short Code, and Organization ID, we can start installing the PWA Kit! Open up your favorite terminal and enter:

```

					npx pwa-kit-create-app

```

During the execution you will be prompted to enter certain information.

### What is the name of your Project?

You can choose whatever name makes the most sense for you. Keep in mind that this is also the name of the folder it will create.

### What is the URL for your Commerce Cloud instance?

Fill in the URL of your sandbox, and this looks something like:

```

					https://xxxx-0xx.dx.commercecloud.salesforce.com/

```

### What is your SLAS Client ID?

Enter the Client Id generated in step 3.

### What is your Site ID in Business Manager?

Enter the Site ID of the site you will use (e.g. RefArch).

### What is your Commerce API organization ID in Business Manager?

This information can be found in the "Salesforce Commerce API Settings" in the Business Manager of your environment. This was covered in step 2.

### What is your Commerce API short code in Business Manager?

This information can be found in the "Salesforce Commerce API Settings" in the Business Manager of your environment. This was covered in step 2.

## Step 6: Run the PWA Kit

Now that we have SLAS up and running and our PWA Kit installed locally, all that is left is to run our application by going into the new folder the command has created, and doing:

```

					npm start

```

A browser screen will automatically open. And if all goes well, a homepage will appear after a short wait! ![](/media/2022/pwa-kit-03394b0f92.png) In conclusion, setting up the SLAS Client ID for your Composable Storefront may seem like a daunting task, but with the help of this guide, you'll be a pro in no time. And if you're still feeling a bit overwhelmed, remember that we've all been there. But hey, at least now you have a fancy new configured SLAS to show off to your friends and family, who are sure to be impressed by your technical prowess. So go forth and conquer the world of online business, one SLAS at a time.
