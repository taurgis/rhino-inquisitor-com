---
title: Can an isslot Element have a dynamic ID?
description: >-
  TL;DR It is not possible to set a dynamic ID in the <isslot tag. $1 For quite
  some time now, Content Slots have been the go to method for displaying per...
lastmod: '2023-06-28T18:56:00.000Z'
url: /can-a-isslot-element-have-a-dynamic-id/
draft: false
author: Thomas Theunen
---
TL;DR It is not possible to set a dynamic ID in the `<isslot>` tag. ![Screenshot of the isslot official documentation.](https://www.rhino-inquisitor.com/wp-content/uploads/2023/06/isslot-element.jpg)

-   [Official Documentation](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-isslot.html?q=isslot)

For quite some time now, Content Slots have been the go-to method for displaying personalized or scheduled content. However, the advent of Page Designer has given rise to a new option.

Despite their popularity, one major limitation of [Content Slots](https://www.rhino-inquisitor.com/salesforce-b2c-commerce-cloud-content-erd/) is the inability to set a dynamic ID. It's likely that the system scans all ISML files to determine which slots to display for configuration in the Business Manager, but this is merely speculation since it is a black box feature.

## Alternative solutions to isslot

### Page Designer

Using Page Designer will give you (and the merchandisers) a more modern option to manage their content!

### Context

Slots support "category" and "folder" context objects that may provide a solution in specific use cases.
