---
title: How to set up SLAS for the Composable Storefront
description: >-
  Setting up SLAS for the first time can be quite a headache. Or maybe not? Is
  there an easy way to set up SLAS for the PWA Kit?
date: '2023-01-16T08:12:41.000Z'
lastmod: '2026-07-09T17:43:35.106Z'
url: /how-to-set-up-slas-for-the-composable-storefront/
draft: false
heroImage: slas-public-client-registered-user-b2c-a930192dd5.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - composable storefront
  - sfcc
  - slas
  - technical
author: Thomas Theunen
takeaways:
  - "Walks through a practical SLAS setup flow for connecting a Composable Storefront to an SFCC sandbox"
  - "Explains where to find the short code, organization ID, and SLAS Admin UI configuration flow"
  - "Covers client creation, when the OCAPI settings step still applies (public clients only, now that OCAPI is deprecated), and the Composable Storefront install inputs required to go live"
---
If you're setting up your Composable Storefront, the SLAS Client ID is one of the first things you'll need. [SLAS](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas.html) — Shopper Login and API Access Service — issues the access tokens your storefront uses to call Shopper APIs, but its setup flow spans Business Manager, Account Manager, and a separate Admin UI, which makes it easy to get lost. This guide walks through that flow end to end.

## Official Guide

Salesforce has a guide for this installation publicly available. Some steps are more fine-grained here, whilst others are more detailed in the official guide. [https://developer.salesforce.com/docs/commerce/commerce-api/guide/authorization-for-shopper-apis.html](https://developer.salesforce.com/docs/commerce/commerce-api/guide/authorization-for-shopper-apis.html) This official guide also shows you how to use the APIs, which I will not cover here.

## Step 1: Get a sandbox

If you want to connect the Composable Storefront to your own APIs (including SLAS), you need your own sandbox. I won't go into how to get one here — it's covered in [a previous article](/how-to-get-a-salesforce-b2c-commerce-cloud-sandbox/) and in [Salesforce's own documentation](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/creating-an-on-demand-sandbox.html).

## Step 2: Go to the Salesforce Commerce API Settings

After you have logged into the Business Manager of your environment, go to the following: "Administration > Site Development > Salesforce Commerce API Settings"

{{< img-caption src="slas-admin-ui-button-business-manager-7bdbd7a798.jpg" alt="Salesforce Commerce API Settings page with the SLAS Admin UI link." caption="This is the Business Manager starting point for finding your SLAS setup details." >}}

Salesforce's own documentation doesn't show a clickable SLAS Admin UI link on this page by default — construct the URL yourself from the Short Code: `https://{{Short_Code}}.api.commercecloud.salesforce.com/shopper/auth-admin/v1/ui/`. If you have the [DWithEase](https://dwithease.com/) browser extension installed, it may add a shortcut link here for you, but the manual URL is the dependable path either way.

On this screen, you'll also find the Short Code and Organization ID you'll need to install the Composable Storefront later. Open the SLAS Admin UI URL from above (or the shortcut link, if DWithEase added one) to continue.

{{< img-caption src="slas-admin-ui-login-ff882d0848.jpg" alt="Sign-in page that links to the SLAS Admin UI." caption="If the shortcut is missing, this login page still gets you into SLAS Admin." >}}

When you click this link, the screen above should appear, with a blue "SLAS Admin UI Login" button. Clicking it signs you in with your Account Manager user. To actually manage SLAS, that user needs a specific permission: a role in Account Manager with the correct Scopes assigned. Don't skip that — without it, the SLAS Admin UI login will reject you.

{{< img-caption src="slas-rights-account-manager-dfaa6aa6b8.jpg" alt="Account Manager role scopes required for SLAS administration." caption="These Account Manager scopes are the real prerequisite for managing SLAS clients." >}}

## Step 3: Add a new SLAS Client

If your account has the correct permissions, you'll land on a "Welcome screen".

{{< img-caption src="slas-admin-welcome-ui-bbc3ad8da9.jpg" alt="SLAS Admin UI welcome page after a successful sign-in." caption="A successful sign-in lands you on the SLAS Admin UI home screen." >}}

On this page, click the "Clients" tab to see the list of clients you're permitted to manage (per the scopes from the previous step).

{{< img-caption src="slas-admin-add-client-c488a4b6e3.jpg" alt="Client list in the SLAS Admin UI." caption="The Clients tab is where you manage existing entries and create a new one." >}}

Click the "Add Client" button on this page to go to the next step.

{{< img-caption src="slas-admin-ui-new-client-pwa-kit-c70f8d1fd1.jpg" alt="New client form for a PWA Kit SLAS application." caption="This form creates the public client the Composable Storefront will authenticate with." >}}

Fill in the following information:

- **What tenant will be used?:** Fill in the Tenant ID, part of the Organization ID, from step two. For an on-demand sandbox this looks like `zzte_053`; POD sandboxes use a different pattern, like `zzrf_s01`.
- **What site will be used?:** Fill in the site IDs you'll use, separated by a space.
- **Which App Type will be used?:** Select "_PWA Kit or SFRA or Mobile_" — this is the Composable Storefront path. Selecting this option will make a [Public Client](https://developer.salesforce.com/docs/commerce/commerce-api/guide/slas-public-client.html): one that can't keep a secret confidential (like a browser-based app), so it authenticates without one. Salesforce's current guidance recommends a **private** client instead for most PWA Kit 3.5+ projects, since a private client can hold a secret safely, which is a stronger security posture. The SLAS Admin UI creates both the same way; if your form offers the choice explicitly, pick private unless you have a specific reason not to. Step 4 and Step 5 below assume you know which one you picked.
- **Client Id:** The Client ID to use during the installation of the PWA Kit. This can be left as-is. _Note: This Client ID does not need to exist as an API Client in the Account Manager. They are not related._
- **Secret:** Public clients don't need a secret. Private clients do — store it in an environment variable, never directly in your project files.
- **Do you want the default shopper scopes?:** Leave this checked — the Composable Storefront needs the default shopper scopes.
- **Enter custom shopper scopes:** This step can be left empty.

Click "Submit" to create the client.

### Typo in the scopes

When this article was first written in January 2023, the SLAS Admin UI's default scope bundle had a missing space between "sfcc.shopper-myaccount.orders" and "sfcc.shopper-myaccount.paymentinstruments", and had to be fixed by hand before saving. I couldn't confirm live in July 2026 whether that's still the case — Salesforce's [Authorization Scopes Catalog](https://developer.salesforce.com/docs/commerce/commerce-api/guide/auth-z-scope-catalog.html) now lists the two as separate, correctly spaced entries (and the payments scope has since become `sfcc.shopper-myaccount.paymentinstruments.rw`), but that's static documentation, not the live Admin UI's generated textbox. **Check the scope list your own Admin UI produces before saving** — if two scope names run together, add the missing space manually.

{{< img-caption src="typo-in-scopes-3b0626d7b7.png" alt="Scope list showing the missing space in the default shopper scopes." caption="Check these default scopes before saving because the bundled list contains a typo." >}}

## Step 4: Update your OCAPI settings (public clients only)

If your project uses PWA Kit 3.5 or later, it's configured to use a SLAS **private** client by default, and private clients skip this step entirely — jump straight to Step 5.

> [!NOTE]
> This step only applies if you deliberately created a SLAS **public** client in Step 3. It's also worth knowing that [OCAPI was deprecated platform-wide in April 2026](/in-the-ring-ocapi-versus-scapi/) and now receives security patches only. The instructions below still work today, but they lean on a maintenance-mode API, not a long-term foundation.

If you are on a public client, follow the "Update Open Commerce API Settings" step on [Salesforce's Set Up API Access guide](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/setting-up-api-access.html), using the SLAS Client ID generated in the previous step.

## Step 5: Use the new SLAS Client

With your SLAS Client, Short Code, and Organization ID in hand, you're ready to install the PWA Kit. Open your terminal and enter:

```text
npx @salesforce/pwa-kit-create-app@latest
```

Pin an explicit version (e.g. `@v3.5.0`) instead of `@latest` if you want reproducible results — Salesforce's own docs warn that omitting a version can produce unexpected results due to caching of old versions. During the run you'll be asked for the following:

### What is your Project ID

Choose an identifier for your project. It doubles as the local folder name the CLI creates; Salesforce's current docs also tie it to your entry in Managed Runtime Admin, though for a sandbox-only local setup any identifier works.

### What is the URL for your Commerce Cloud instance

Fill in the URL of your sandbox, and this looks something like:

```text
https://xxxx-0xx.dx.commercecloud.salesforce.com/
```

### What is your Commerce API client ID

Enter the SLAS Client ID generated in step 3. Salesforce's current CLI docs call this the "Commerce API client ID" rather than "SLAS Client ID" — it's the same value, obtained the same way.

### Public or private client?

The CLI now asks explicitly whether you're using a private or public client. Private is the default and what most new projects should pick; only choose public if that's what you created in Step 3 (in which case Step 4's OCAPI update also applies to you).

### What is your Site ID in Business Manager

Enter the Site ID of the site you will use (e.g. RefArch).

### What is your Commerce API organization ID in Business Manager

This information can be found in the "Salesforce Commerce API Settings" in the Business Manager of your environment. This was covered in step 2.

### What is your Commerce API short code in Business Manager

This information can be found in the "Salesforce Commerce API Settings" in the Business Manager of your environment. This was covered in step 2.

## Step 6: Run the PWA Kit

With SLAS running and the PWA Kit installed locally, go into the new folder the command created and run:

```bash
npm start
```

A browser window opens automatically, and the storefront's homepage should load after a short wait.

{{< img-caption src="pwa-kit-03394b0f92.png" alt="Composable Storefront homepage after the starter app launches." caption="If the setup worked, the starter storefront should boot with the new SLAS client." >}}

That's the full path: a sandbox, a SLAS client from the Admin UI, and a Composable Storefront pointed at your short code and org ID. Most of what trips people up is exactly what this guide calls out explicitly — the scope list to double-check before saving, whether you picked a public or private client, and which OCAPI step that choice lets you skip. Get those three right and the rest is just following the CLI's prompts.
