---
title: 'Custom Preferences in Salesforce B2C Commerce Cloud: A Developer Guide'
description: >-
  $1 uses custom preferences to store configurable settings for a storefront.
  These settings can be anything from feature settings to loyalty
  calculations...
date: '2023-10-16T12:01:58.000Z'
lastmod: '2023-10-16T18:11:19.000Z'
url: /custom-preferences-in-sfcc/
draft: false
heroImage: /media/2023/it-configuring-server-scaled-d8087e9ab9.jpeg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - sfcc
  - technical
author: Thomas Theunen
---
[Salesforce B2C Commerce Cloud](/the-salesforce-b2c-commerce-cloud-environment/) uses custom preferences to store configurable settings for a storefront. These settings can be anything from feature settings to loyalty calculations.

Custom preferences can be created at two levels:

-   global (organisation)
-   site

As a Salesforce B2C Commerce Cloud developer, you must understand the differences between Global Preferences and Site Preferences and use each appropriately.

## Global Custom Preferences

[Global Preferences](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_global_preferences.htm) are organisation-level preferences that any site within the environment can access. These preferences are ideal for settings that are common across all sites.

For example, if all sites in an organisation use the same preference value, using a global value is your best bet. This can help reduce code duplication and make maintaining and updating settings across multiple sites more accessible.

Global Preferences can be accessed using the System Preferences API:

```

					var System = require('dw/system');
var orgPrefs = System.getPreferences();
var myCustomPreference = orgPrefs.getCustom().myCustomPreference;


```

To add your preferences on this global level, head here in the Business Manager:

`Administration > Site Development > System Object Types > OrganizationPreferences`

## Site Specific Custom Preferences

[Site Preferences](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_site_preferences.htm) are site-level preferences that can only be accessed by the site to which they belong. These preferences are ideal for settings that are specific to a site.

For example, if a site has a particular loyalty program calculation not used by any other site, use Site Preferences. This can help ensure that settings are only applied to the site they belong to and do not affect other sites in the organisation.

Site Preferences can be accessed using the Site API:

```

					var Site = require('dw/system/Site');
var sitePrefs = Site.getCurrent().getCustom();
var loyaltyEnabled = sitePrefs.loyaltyEnabled;


```

To add your preferences on this site level, head here in the Business Manager:

`Administration > Site Development > System Object Types > Site Preferences`

## Code Config Files

Using a config file can be a better alternative to Custom Preferences. A config file is a file that stores application-specific settings that should not be modifiable in the Business Manager. This can be useful for settings that are not expected to change frequently, such as project-specific settings.

```

					// config.json
{
  "loyaltyCalculation": "simple"
}
// Using the config
var config = require('path/to/config.json');
if(config.loyaltyCalculation === 'simple') {
 // Do some things
}


```

Cartridge Overrides Like script files, using “\*” in the path to allow overrides according to the set cartridge path is possible.

## Tips & Tricks

### Custom Attributes

If you have reviewed the sample code, you may have noticed that these preferences are similar to how you use custom attributes. That's because they are custom attributes on System Objects, just like any other extensible object within the [data model](/salesforce-b2c-commerce-cloud-erd/).

### Default Values

Luckily, we have the option to set default values for our preferences. This will make it easier if you have a large set of sites, but only one uses a different value than the one you have in mind as the default.

Another advantage of setting this default is that your preference will have a preset value right after deployment!

Booleans Booleans are an “odd beast” within Salesforce B2C Commerce Cloud. You would expect the default value of a Boolean always to exist and be “false”, but this is not the case. The default value of a Boolean is: “null”!

### Add Descriptions

When creating preferences in the business manager, add proper names and descriptions. This will make it easier for users and other developers to understand the purpose of this preference. Without it, it is like having a complication function in the code with no documentation to explain what it is up to!

### Getting to the truth

Have you ever encountered a feature in Production that suddenly stopped working due to a preference update, leaving you scratching your head? Fear not! The "[Change History](https://help.salesforce.com/s/articleView?language=en_US&id=cc.b2c_change_history.htm&type=5)" feature is here to save the day! It can help you track down the exact moment and preference that caused the chaos.

7 Days The Change History only shows changes from the past seven days.

## SCAPI

Right now, there is no SCAPI endpoint available to fetch site preferences. Only OCAPI endpoints are available to fetch this information.

## Conclusion

![A decision diagram of when to use which type of storage, visualising the article.](/media/2023/global-preferenves-vs-site-specific-3a997fcbab.png)

Using the appropriate type of preference can help ensure that settings are applied correctly and efficiently. Each option has pros and cons, and make sure to weigh in roles and users in making these decisions!
