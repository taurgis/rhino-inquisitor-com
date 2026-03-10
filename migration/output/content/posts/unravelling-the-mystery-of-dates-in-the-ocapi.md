---
title: Unravelling the mystery of dates in the OCAPI
description: >-
  When we integrate third party systems with $1 using OCAPI or SCAPI, we often
  have the requirement to filter data based on date ranges or only retrieve d...
lastmod: '2023-12-14T12:46:21.000Z'
url: /unravelling-the-mystery-of-dates-in-the-ocapi/
draft: false
heroImage: /media/2023/a-developer-confused-by-dates-and-times-9d38bbf81d.jpg
date: '2023-12-18T09:16:13.000Z'
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - headless
  - ocapi
  - sfcc
author: Thomas Theunen
---
When we integrate third-party systems with [Salesforce B2C Commerce Cloud](https://www.rhino-inquisitor.com/the-salesforce-b2c-commerce-cloud-environment/) using OCAPI or SCAPI, we often have the requirement to filter data based on date ranges or only retrieve data that has been modified after a certain time.

But how can we achieve this? Are there any other options available? Let's explore the various filtering and query options in detail.

### Querying

Not all endpoints are alike, but within the OCAPI the way of searching for different objects remains the same: making use of Queries and Filtering options.

Here are some of the example endpoints:

-   [Search Catalogs (OCAPI)](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-data-api?meta=Search%2BCatalogs)
-   [Search Categories within a Catalog (OCAPI)](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-data-api?meta=Search%2BCategories%2Bwithin%2Ba%2BCatalog)
-   [Search for customers in a customer list (0CAPI)](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-data-api?meta=Search%2Bfor%2Bcustomers%2Bin%2Ba%2Bcustomer%2Blist)
-   [Search Products (SCAPI)](https://developer.salesforce.com/docs/commerce/commerce-api/references/products?meta=searchProducts)

#### Attributes

Make sure to check the documentation pages for the specific endpoint to view the supported attributes before building your query.

#### Date Format

When crafting these date filters, adherence to the [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html#:~:text=Therefore%2C%20the%20order%20of%20the,27%2018%3A00%3A00.000.) date format (YYYY-MM-DDTHH:MM:SS.mmmZ) is essential for the API to parse the values correctly. Additionally, ensure that the field names, like `creation_date`, `valid_from`, `valid_to`, and others, correspond to your Salesforce Commerce Cloud data model's actual date-related fields.

```

					2012-03-19T07:22:59Z // example


```

## Range Filter

![An image showing calendars with dates and a measure on a wooden table.](/media/2023/measuring-dates-7c1931cecc.jpg)

If you need to find records that fall within a specific date interval, the [range\_filter](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-shop-api?meta=type%3Arange_filter) is your go-to option. This filter can find records with a date value sitting between a specified start (from) and end (to) date.

```

					{
  "query": {
    "filtered_query": {
      "filter": {
        "range_filter": {
          "field": "creation_date",
          "from": "2020-03-08T00:00:00.000Z",
          "to": "2020-03-10T00:00:00.000Z"
        }
      },
      "query": {
        "match_all_query": {}
      }
    }
  }
}


```

## Range2 Filter

To deal with scenarios where you have two date fields and want to filter records with an overlapping date range, use the [range2\_filter](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-shop-api?meta=type%3Arange2_filter). This allows the specification of a date range that overlaps the range between the two fields you are considering.

A Range2Filter allows you to restrict search results to hits where the first range (`R1`), defined by a pair of attributes (e.g., `valid_from` and `valid_to`), has a specific relationship to a second range (`R2`), defined by two values (`from_value` and `to_value`). The relationship between the two ranges is determined by the `filter_mode`, which can be one of the following:

-   `overlap`: `R1` overlaps fully or partially with `R2`
-   `containing`: `R1` contains `R2`
-   `contained`: `R1` is contained in `R2`

```

					 "query" : {
        "filtered_query": {
           "filter": {
                "range2_filter": {
                    "from_field": "valid_from",
                    "to_field": "valid_to",
                    "filter_mode":"overlap",
                    "from_value": "2007-01-01T00:00:00.000Z",
                    "to_value": "2017-01-01T00:00:00.000Z"
                }
           },
           "query": { "match_all_query": {} }
       }
   }



```

## Bool Filter

![A woman combining different blocks in a particular order.](/media/2023/combining-blocks-bc1da56e90.jpg)

Sometimes, the need for complexity arises when constructing date-based queries. The [bool\_filter](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-shop-api?meta=type%3Abool_filter) permits the combination of numerous filters for complex logical expressions. This filter is specifically helpful for creating compound date queries that may, for instance, combine status checks with date ranges.

```

					{
  "query": {
    "filtered_query": {
      "query": {
        "match_all_query": {}
      },
      "filter": {
        "bool_filter": {
          "operator": "and",
          "filters": [
            {
              "term_filter": {
                "field": "status",
                "operator": "is",
                "values": ["open"]
              }
            },
            {
              "range_filter": {
                "field": "creation_date",
                "from": "2023-01-01T00:00:00.000Z"
              }
            }
          ]
        }
      }
    }
  }
}


```

## Term Query

For precision filtering, where a field must match an exact date, the [term\_query](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-shop-api?meta=type%3Aterm_query) becomes the instrument of choice. This query matches records based on absolute equality with the specified date.

```

					{
  "query": {
    "term_query": {
      "fields": ["creation_date"],
      "operator": "is",
      "values": ["2023-04-01T00:00:00.000Z"]
    }
  }
}


```

## Custom Endpoint

It is currently not fully available / BETA, but you can create [custom GET endpoints](https://www.rhino-inquisitor.com/creating-custom-ocapi-endpoints/) tailored entirely to your requirements.

When creating these endpoints, it's important to consider performance and caching - these are your responsibility when utilising this option.

## Conclusion

The search API capabilities of OCAPI in Salesforce B2C Commerce Cloud offer robust and flexible options for date-related searches.

You can customize your searches using range\_filter, range2\_filter, bool\_filter, and term\_query as per your requirements. It is important to use the correct date format and field names to make the most out of these tools. These data querying capabilities can help you segment promotional data, manage catalog validity, or filter orders based on dates, making your commerce data handling more streamlined.

Happy coding!
