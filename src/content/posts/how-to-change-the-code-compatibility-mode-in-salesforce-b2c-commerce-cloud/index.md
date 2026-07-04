---
title: Change Code Compatibility Mode in SFCC
description: >-
  Understand how to change code compatibility mode in SFCC, when a rollback
  matters, and what to check before switching versions.
date: '2022-11-14T08:04:44.000Z'
lastmod: '2026-07-04T10:39:24.000Z'
url: /how-to-change-the-code-compatibility-mode-in-salesforce-b2c-commerce-cloud/
draft: false
heroImage: sfcc-compatibility-mode-46f9d84af8.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - sfcc
  - technical
author: Thomas Theunen
takeaways:
  - "Explains what SFCC code compatibility mode controls and why upgrades can break custom code"
  - "Shows the WebDAV .apiversion workaround for aligning sandbox compatibility versions"
  - "Warns that rolling compatibility backward should be rare and limited to valid supported modes"
---
"How do I update my Compatibility mode to vxx.xx?" This is a question that many have asked over the years, especially with the On-Demand Sandboxes taking the last compatibility mode by default - not providing a way to go back.

So what now? How do you keep your sandboxes all on the same version if some are on an older one?

## What is this "Compatibility Mode"?

The easiest way to explain this is by linking the Compatibility Mode to the engine that runs between us (the developers) and the Java engine that runs Salesforce B2C Commerce Cloud.

Commerce Cloud uses an engine based on [Apache Rhino](https://en.wikipedia.org/wiki/Rhino_\(JavaScript_engine\)), which translates JavaScript to Java. And this engine has versioned releases, each providing new features to keep up with the JavaScript standards (or at least as much as possible).

### Forced upgrades are dangerous

Updating the engine can cause some functions that worked in the previous release to break down. The engineering team can only force this new version on us if they give us the time to update the custom code to be compatible with the latest version.

And that is where the choice of "Compatibility Mode" comes in. We can decide for ourselves when to make a move to this new engine ([and make use of the new toys that come with it](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-compatibility-mode-considerations.html))

## The only way is up?

As with all features baked into the Business Manager, Salesforce decides which modes you can use in the interface. And in most cases, the only way is up.

## Can we "downgrade"?

If the interface only allows us to upgrade, it is time to find ways to work around that "security"!

{{< img-caption src="hackerman-hr-6b82b63667.jpg" alt="Hacker-style illustration introducing code compatibility mode workarounds." caption="If the UI only supports upgrades, you need a workaround rather than the normal path." >}}

### Manipulate the form?

The first weapon we have is our browser console! Can we manipulate the HTML form and add the version we want?

{{< img-caption src="manipulate-form-code-compatibility-1d501b0279.jpg" alt="Browser DevTools inspecting the compatibility mode form in Business Manager." caption="The browser console is the quickest way to test whether the form can be bent." >}}

As it turns out... no. There is server-side validation in place. So we need to find another way to hack the system!

### To the WebDAV

Let us next see if we can do anything in the WebDAV to manipulate the Compatibility Mode. (**Spoiler**: We can)

To retrieve the URL for the WebDAV go to:

"Administration > Site Development > Development Setup"

{{< img-caption src="cartridges-webdav-88a388e63c.jpg" alt="Business Manager Development Setup screen showing the WebDAV URL." caption="The WebDAV URL in Development Setup is the doorway to the manual workaround." >}}

DWithEase I use the browser plugin [DWithEase](https://dwithease.com/) to make WebDAV browsing much more pleasant.

If you open the URL (and have the browser plugin installed), you will get a view such as this:

{{< img-caption src="webdav-overview-38949e23ef.jpg" alt="WebDAV directory listing for the cartridge folders in a code version." caption="Once inside WebDAV, you can inspect the code version directly instead of using the UI." >}}

Click on the **active** Code Version (this is important)!

Go into the folder, and a file called ".apiversion" will be there.

{{< img-caption src="code-version-26171e5278.jpg" alt="WebDAV folder showing the .apiversion file in the active code version." caption="The hidden .apiversion file is the small detail that makes the workaround possible." >}}

Missing File If you do not see the file, don't worry! You can upload it yourself to the folder.

Inside that file is where the "magic" happens, and it looks something like this:

```properties
#DO NOT EDIT! This is the api version with which *this* code version is compatible. It is managed by the system.
#Tue Aug 01 09:55:45 GMT 2017
api.version=21.7
```

This file has an interesting key, specifically "api.version"! You can change that to the version you want to use for your sandbox by downloading it, editing it, and re-uploading it to the same folder.

In this case, we will update it to "18.10"

```properties
#DO NOT EDIT! This is the api version with which *this* code version is compatible. It is managed by the system.
#Tue Aug 01 09:55:45 GMT 2017
api.version=18.10
```

Let us head back to the business manager and go to the "Manage Code Versions" screen:

"Administration > Site Development > Code Deployment"

If all has gone well, the code versions have changed to the one in the file!

{{< img-caption src="new-code-version-d4f4f68888.jpg" alt="Manage Code Versions screen reflecting the updated compatibility mode." caption="If the edit worked, the new compatibility mode shows up back in Code Versions." >}}

Not visible If no changes are visible, try switching active code versions to trigger the system to re-read the WebDAV files.

## Dangerous?

It depends. Only do this if you have to. In most cases, this is done on older projects already tested on that older Compatibility Mode, and you need to match it.

Please do not go back too far; it is in everyone's best interest to be on the latest and greatest version of the [Rhino Engine](https://github.com/mozilla/rhino)!

But developers worldwide have done this many times without any drawbacks! **Just make sure you configure a Compatibility Mode that exists**!
