---
title: 'Page Designer: Dynamic Pages - Optional Subcategories'
description: >-
  A year after Salesforce released $1, many of the needed features were added.
  One of these features was called "$1." This feature allowed $1 pages to und...
lastmod: '2022-03-06T08:51:38.000Z'
url: /ideas/page-designer-dynamic-pages-optional-subcategories/
draft: false
author: Thomas Theunen
---
A year after Salesforce released [Page Designer](https://www.salesforce.com/video/3620472/), many of the needed features were added. One of these features was called "[Dynamic Pages](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/page_designer/b2c_develop_dynamic_page.html)."

This feature allowed [Page Designer](https://www.salesforce.com/video/3620472/) pages to understand their context: a category, or a product. These pages allow for dynamic components that show [product or category](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/page_designer/b2c_aspect_types.html) information without much manual labor.

Now, as with many things, no good deed comes unpunished. There is a "problem" with the dynamic category option. When you select a top-level category, it selects all subcategories as well. Whether you want this to happen or not.

Maybe a use-case to explain this. Your catalog structure is as follows:

-   Pants
    -   Shorts
    -   Jeans
        -   Blue Jeans
        -   Black Jeans



You decide to create a category landing page for Jeans to highlight all options.

Page Designer is "the" tool to do this. You assign a page to "Jeans" and add all components to highlight some products and content.

You are confident with what you have done and visit the page in the storefront (https://my-brand.com/pants/jeans), and it all looks **perfect**.

The changes get replicated to production, and the next day you start getting calls from customers who can no longer visit the Blue and Black jeans categories. All they see is your category landing page (possibly linking to those subcategories), seemingly putting them in an infinite loop of clicking.

This happened because your landing page also got assigned automatically to the Blue and Black Jeans subcategories, and there is no way to turn this off (besides custom development).

![A screenshot of page designer where a user selects a category to assign the page to.](/media/2022/page-designer-subcategories-8ed50d99ab.png)

Page Designer - Category Selection

Do you also want this automatic selection removed and get more control of your assignments?

[Vote for my idea here](https://ideas.salesforce.com/s/idea/a0B8W00000GdZcWUAV/page-designer-category-dynamic-pages-subcategories-should-be-optional)
