---
title: Local vs Shared Variation Attributes in Commerce Cloud
description: >-
  Understand when to use local or shared variation attributes in Commerce Cloud
  and how each model affects merchandising and product data.
date: '2025-04-14T07:17:18.000Z'
lastmod: '2025-04-23T07:24:17.000Z'
url: /local-vs-shared-variation-attributes-sfcc/
draft: false
heroImage: variation-attributes-e1743754688196-8eda8ce6ea.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - sfcc
  - technical
author: Thomas Theunen
takeaways:
  - "Compares local and shared variation attributes in SFCC at both the data-model and XML-import levels"
  - "Explains the flexibility, maintenance, and scalability trade-offs between both approaches"
  - "Helps teams choose when to centralize variation models and when product-specific attributes are justified"
---
In the dynamic world of eCommerce, the concept of [product variation](/slicing-versus-variation-groups-in-sfcc/) holds significant importance. It empowers merchants to effectively present a range of product options, a crucial aspect for platforms like Salesforce B2C Commerce Cloud. These platforms often deal with extensive catalogs, each with a variety of attributes to cater to diverse customer preferences.

Among the ways to handle [product variations](/the-attribute-fallback-system-in-sfcc/) are local and shared variation attributes. In this article, we will delve into the technical differences between these two types of attributes, exploring their definitions, implementations in catalog import XML, and their respective advantages and disadvantages.

## What Are Variation Attributes?

Let's start by understanding what [variation attributes](https://help.salesforce.com/s/articleView?id=commerce.comm_var_att_intro.htm&type=5) are. These are the unique characteristics that define the different options for a specific product. For instance, a t-shirt available in multiple colors and sizes has 'color' and 'size' as its variation attributes, allowing customers to select their preferred options.

In Salesforce B2C Commerce Cloud, variation attributes play a pivotal role. They not only help in categorizing products but also significantly enhance the shopping experience by making product selection easier and more intuitive for customers.

In terms of catalog import XML, variation attributes are represented in a structured format that ensures the system understands the attributes associated with each product.

Supported Attribute Types Currently, only non-localizable string and integer fields are supported for variation.

## What Are Local Variation Attributes?

Local variation attributes are specific to a single product or a small group of products within a catalog. These attributes apply only to the respective products that define them, which means they can vary significantly from one product to another. Local attributes are particularly useful when there is a need to cater to unique product offerings that don't apply to the broader catalog.

{{< img-caption src="local-variation-attributes-5fad46fb81.png" alt="A screenshot of a product in the business manager showing the Variations tab with local variation attributes." caption="Local variation attributes are defined per-product and do not propagate across the catalog." >}}

### Implementation in Catalog Import XML

In the [catalog import XML](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/xsd/catalog.xsd), local variation attributes are defined under the specific product they are associated with, which distinguishes them from shared attributes. The XML snippet below illustrates how local variation attributes are structured:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<catalog
  xmlns="http://www.demandware.com/xml/impex/catalog/2006-10-31" catalog-id="apparel-m-catalog">
  <product product-id="25113204M">
    ...

    <variations>
      <attributes>
        <variation-attribute attribute-id="color" variation-attribute-id="color">
          <display-name xml:lang="x-default">Color</display-name>
          <variation-attribute-values>
            <variation-attribute-value value="JJ2KCXX">
              <display-value xml:lang="x-default">Gulf</display-value>
            </variation-attribute-value>
            <variation-attribute-value value="JJG28XX">
              <display-value xml:lang="x-default">Pink</display-value>
            </variation-attribute-value>
            <variation-attribute-value value="JJI15XX">
              <display-value xml:lang="x-default">White</display-value>
            </variation-attribute-value>
          </variation-attribute-values>
        </variation-attribute>
        <variation-attribute attribute-id="size" variation-attribute-id="size">
          <display-name xml:lang="x-default">Size</display-name>
          <variation-attribute-values>
            <variation-attribute-value value="004">
              <display-value xml:lang="x-default">4</display-value>
            </variation-attribute-value>
            <variation-attribute-value value="006">
              <display-value xml:lang="x-default">6</display-value>
            </variation-attribute-value>
            <variation-attribute-value value="008">
              <display-value xml:lang="x-default">8</display-value>
            </variation-attribute-value>
          </variation-attribute-values>
        </variation-attribute>
      </attributes>
      <variants>
        <variant product-id="008885004885M"/>
    ...

      </variants>
    </variations>
  ...

  </product>
  <product product-id="008885004885M">
    <custom-attributes>
      <custom-attribute attribute-id="color">JJI15XX</custom-attribute>
      <custom-attribute attribute-id="refinementColor">white</custom-attribute>
      <custom-attribute attribute-id="size">006</custom-attribute>
      <custom-attribute attribute-id="width">Z</custom-attribute>
    </custom-attributes>
  </product>
</catalog>
```

In this example, the main product defines a color and size variation attribute that only applies to this particular main product and its variants.

## What Are Shared Variation Attributes?

On the other hand, shared variation attributes are those that can be applied across multiple products within the catalog. These attributes promote consistency and can streamline the management of products that share similar characteristics. For instance, if multiple shoes come in the same colors and sizes, having shared variation attributes simplifies catalog management.

{{< img-caption src="defining-shared-variation-attributes-92b82313b9.png" alt="A screenshot of the Business Manager showing where to configure Shared Varaiation Attributes: Products and Catalogs > Shared Variation Attributes - Select Catalog" caption="Shared variation attributes are configured centrally and reused across multiple products in the catalog." link="defining-shared-variation-attributes-92b82313b9.png" >}}

{{< img-caption src="shared-variation-attributes-0d55796d17.png" alt="A screenshot of a product in the business manager showing the Variations tab with shared variation attributes." caption="Once shared attributes are assigned, the product's Variations tab reflects the catalog-wide attribute definition." link="shared-variation-attributes-0d55796d17.png" >}}

### Implementation in Catalog Import XML

Shared variation attributes in the catalog import XML are referenced as part of the catalog, rather than an individual product. The following XML example showcases how shared variation attributes are represented:

```xml
<catalog
  xmlns="http://www.demandware.com/xml/impex/catalog/2006-10-31" catalog-id="apparel-m-catalog">
  <variation-attribute attribute-id="color" variation-attribute-id="color">
    <display-name xml:lang="x-default">Kleur</display-name>
    <variation-attribute-values>
      <variation-attribute-value value="black">
        <display-value xml:lang="x-default">Black</display-value>
      </variation-attribute-value>
    </variation-attribute-values>
  </variation-attribute>
  <variation-attribute attribute-id="size" variation-attribute-id="size">
    <display-name xml:lang="x-default">Size</display-name>
    <variation-attribute-values>
      <variation-attribute-value value="16">
        <display-value xml:lang="x-default">16</display-value>
        <description xml:lang="x-default">16</description>
      </variation-attribute-value>
      <variation-attribute-value value="17">
        <display-value xml:lang="x-default">17</display-value>
        <description xml:lang="x-default">17</description>
      </variation-attribute-value>
      <variation-attribute-value value="18">
        <display-value xml:lang="x-default">18</display-value>
        <description xml:lang="x-default">18</description>
      </variation-attribute-value>
    </variation-attribute-values>
  </variation-attribute>
  ...

  <product product-id="main">
  ....

    <variations>
      <attributes>
        <shared-variation-attribute attribute-id="color" variation-attribute-id="color"/>
        <shared-variation-attribute attribute-id="size" variation-attribute-id="size"/>
      </attributes>
      <variants>
        <variant product-id="123456"/>
        <variant product-id="7891011"/>
      </variants>
      <variation-groups>
        <variation-group product-id="123"/>
        <variation-group product-id="456"/>
      </variation-groups>
    </variations>
  </product>
  <product product-id="main-2">
  ....

    <variations>
      <attributes>
        <shared-variation-attribute attribute-id="color" variation-attribute-id="color"/>
        <shared-variation-attribute attribute-id="size" variation-attribute-id="size"/>
      </attributes>
      <variants>
        <variant product-id="223456"/>
        <variant product-id="8891011"/>
      </variants>
      <variation-groups>
        <variation-group product-id="223"/>
        <variation-group product-id="556"/>
      </variation-groups>
    </variations>
  </product>
  <product product-id="123456">
    <custom-attributes>
      <custom-attribute attribute-id="color">black</custom-attribute>
      <custom-attribute attribute-id="size">18</custom-attribute>
    </custom-attributes>
  </product>
</catalog>
```

In this case, both products utilise the same shared attributes for "Color," demonstrating the shared nature of these attributes.

## Pros and Cons of Local Variation Attributes

### Pros

1.  **Specificity**: Local variation attributes allow for highly tailored product offerings, accommodating unique features that don't apply to other products.
2.  **Flexibility**: Merchants have the flexibility to quickly change or update the attributes for individual products without affecting others.
3.  **Simplicity**: For products that have very distinctive attributes, local variation attributes can simplify the overview for customers by streamlining options.

### Cons

1.  **Management Complexity**: Having numerous local attributes can lead to a complex catalog management system, making it harder to maintain and update individual products.
2.  **Redundancy**: Local variation attributes, when overused, can lead to redundancy, especially if multiple products share similar attributes.
3.  **Limited Scalability**: As the catalog grows, managing local attributes can become increasingly cumbersome, limiting long-term scalability.
4.  **Import XML Size:** The import file exponentially grows over time, slowing down the overall import process.

## Pros and Cons of Shared Variation Attributes

### Pros

1.  **Consistency**: Shared attributes ensure consistency across products, creating a more streamlined shopping experience for customers.
2.  **Ease of Management**: Managing shared attributes can be less complex since changes made to these attributes automatically apply to all associated products.
3.  **Scalability**: Shared attributes offer a scalable approach; as new products are added, they can easily adopt existing attributes without requiring extensive modifications.
4.  **Import performance:** A smaller XML to import, with less duplication, means faster import speeds.

### Cons

1.  **Lack of Flexibility**: The main drawback of shared variation attributes is the potential lack of flexibility when unique attributes are necessary for specific products.
2.  **Limiting Options**: Merchants may find it challenging to personalise products since shared attributes can constrain variation options.
3.  **Over-generalisation**: There is a risk of over-generalising product attributes, which may lead to a lackluster shopping experience for customers seeking specificity.

## Combination?

In certain scenarios, combine approaches by utilising shared attributes for most of your product catalog while relying on localised variation attributes for a smaller portion!

## Conclusion

Local and shared variation attributes play essential roles in product management within Salesforce B2C Commerce Cloud. Each has its set of advantages and potential downsides, and the choice between them often depends on the business's specific requirements, the nature of the products being offered, and the desired customer experience.

Understanding the nuances of local and shared attributes is not only important but paramount for any organisation aiming to leverage the full potential of its B2C Commerce Cloud solution.
