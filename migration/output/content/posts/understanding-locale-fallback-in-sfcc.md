---
title: Understanding Locale Fallback in Salesforce B2C Commerce Cloud
description: >-
  In today's digitally connected world, personalization and play a crucial role
  in delivering a tailored shopping experience.
date: '2024-01-29T09:06:32.000Z'
lastmod: '2024-01-31T08:11:45.000Z'
url: /understanding-locale-fallback-in-sfcc/
draft: false
heroImage: /media/2024/different-languages-and-countries-of-the-world-0ec542fc07.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - localisation
  - sfcc
  - technical
author: Thomas Theunen
---
In today's digitally connected world, personalization and [localization](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-localization.html) play a crucial role in delivering a tailored shopping experience. Salesforce B2C Commerce Cloud understands this and includes a powerful locale fallback mechanism to help businesses cater to various markets while managing content efficiently. In this deep-dive article, we will explore the locale fallback feature, its importance, configuration, and potential considerations for developers working on international storefronts.

## What is the Locale Fallback?

Locale fallback refers to the system's ability to serve alternative content when localised data for a request is unavailable. On Salesforce B2C Commerce Cloud, the mechanism ensures that when dealing with multi-locale settings, the application server can source localisable attributes or properties from a predefined sequence of related locales.

The default hierarchy handles locales by country first (e.g., `en_US` for United States English), then by language (`en` for English), and finally, referring to a default locale if necessary.

## Importance of Locale Fallback

Locale fallback plays a critical role in maintaining a seamless user experience. Imagine a customer browsing an e-commerce website that lacks translation or specific data for their locale. Without fallback, this would lead to incomplete or inconsistent data, negatively impacting user experience and trust. With fallback, the store can still display relevant, albeit generic information, ensuring the site remains functional and informative.

Manage Translations Thoroughly Ensuring a positive user experience on your site involves managing messages and translations; although a protection system is in place, this responsibility ultimately falls on you.

## How Locale Fallback Works

![Locale Fallback explained with a decision tree going from en_US to en, and finally to default.](/media/2024/locale-fallback-explained-bfdfc55392.png)

Is there a translation present?

Here's an example to illustrate the concept:

1.  A shopper from the United States with the locale "`en_US"` visits a product page.
2.  The system first looks for product description, pricing, etc., data relevant to the "`en_US"` locale.
3.  If that specific locale data is unavailable, it falls back to "en" (indicating the English language).
4.  Should the `en` data also be missing, the system retrieves the default locale's content.

This hierarchy ensures that the user receives readable and relevant content despite gaps in localised information.

Inconsistent languages on a single page. If you configure the fallback system differently, let's say you have the German language option (de\_DE) and the "default" locale is set as English. In this case, there is a possibility that a customer may see some parts of a webpage in German while others will appear in English.

## Configuring Locale Fallback

[![A screenshot showing the locale config in 'Administration > Global Preferences > Locales'](/media/2024/sfcc-localisation-config-e5d2f27043.jpg)](/media/2024/sfcc-localisation-config-e5d2f27043.jpg)

Locales and fallback can be configured at "Administration > Global Preferences > Locales"

Salesforce B2C Commerce Cloud allows for customized fallback configurations. You can skip levels in the fallback chain or even eliminate fallback entirely for particular locales, depending on your specific requirements.

For the `en_US` example, the fallback chain by default is `en_US > en > default`. However, you could configure `en_US` to bypass the `en` step and go straight to `default`, or you might decide that `en_US` should not fallback at all.

Fallback to different language You are only allowed to fall back within the same language:

**Allowed**: fr\_FR > FR > Default
**Allowed**: fr\_FR > Default
**Allowed**: fr\_FR > Disabled

**Not allowed**: fr\_FR > DE > Default
**Not allowed**: fr\_FR > fr\_BE > Default
**Not allowed**: fr\_FR > de\_DE > Default

[![Screenshot of the locale fallback for en-GB](/media/2024/locale-fallback-en-uk-bd32fc597d.png)](/media/2024/locale-fallback-en-uk-bd32fc597d.png)

The possible fallback options for en\_GB

## Things to Consider

-   **Disabling Locale Fallback**: You can disable fallback for individual locales. For instance, if the `en` locale's fallback is disabled, and there's no description for a product in the `en` dataset, then no description will be presented, unlike the usual fallback behavior where default text might be used.

-   **Content Types Affected**: The locale fallback mechanism applies primarily to subclasses of `PersistentObject`. This includes objects such as products but does not extend to ISML templates, web forms, resource files in cartridges, or static content such as images.

-   **Restrictions**: Configuring a locale as a fallback for another locale creates a dependency. Therefore, a locale that serves as a fallback cannot be deleted as long as another locale relies on it. This restriction ensures stability and consistency within your localizable content structure.


## Developer Implications

Developers must carefully consider the implications of the fallback system when creating custom modules and localisable attributes. Aspects to keep in mind include:

-   **Implementation of Fallback Logic**: Developers need to incorporate logic that respects the fallback configurations when developing customisations involving localisable content. Generally, nothing needs to be done, but [workarounds](/fetching-data-in-a-locale-with-sfcc/) are required for some use cases.

-   **Testing**: Custom fallback configurations require thorough testing across different locales to ensure the expected behaviour and prevent content gaps.


## Conclusion

The locale fallback mechanism in Salesforce B2C Commerce Cloud offers a powerful tool for businesses to effectively manage their international content strategy. By understanding and correctly configuring locale fallbacks, developers can ensure that their storefronts are localised and robust, providing a continuous flow of information across different regions and languages.

As they advance in their Salesforce B2C journey, leveraging this feature will help create an inclusive shopping experience that [resonates](https://www.forbes.com/sites/forbesbusinesscouncil/2022/01/24/three-important-aspects-of-localization-often-overlooked-by-small-businesses/?sh=515ca5652847) with a global audience.
