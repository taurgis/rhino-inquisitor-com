---
title: Unravelling the mystery of dates in the OCAPI
description: >-
  When we integrate third-party systems with Salesforce B2C Commerce Cloud using
  OCAPI or SCAPI, we often have the requirement to filter data based on date
date: '2023-12-18T09:16:13.000Z'
lastmod: '2026-07-08T14:45:00.000Z'
url: /unravelling-the-mystery-of-dates-in-the-ocapi/
draft: false
heroImage: a-developer-confused-by-dates-and-times-9d38bbf81d.jpg
categories:
  - Salesforce Commerce Cloud
  - Technical
tags:
  - headless
  - ocapi
  - sfcc
author: Thomas Theunen
takeaways:
  - "Explains how to filter OCAPI and related API searches using date-based query constructs such as range, range2, bool, and term filters"
  - "Highlights the date-format requirements and endpoint-specific field support developers need to check before building queries"
  - "Acts as a practical guide for integrations that need incremental syncs or time-based record retrieval"
---
When you build an integration or a nightly sync job against [Salesforce B2C Commerce Cloud](/the-salesforce-b2c-commerce-cloud-environment/), a common requirement shows up almost immediately: pull only the records that changed since your last run, or only the ones valid within a date range. Catalogs, customer lists, orders — all of them need this at some point.

The tricky part isn't the concept. It's figuring out which API you should even be reading docs for, and whether the query syntax you learn for one carries over to the other. This article answers both questions and then walks through the actual filter types, field by field.

> [!NOTE]
> **Updated July 2026:** OCAPI is now officially deprecated. This refresh confirms which of the query syntax below still applies to the SCAPI, separates the one SCAPI surface that genuinely shares it from the one that doesn't, and replaces the outdated "custom endpoints are BETA" section with the current, GA answer.

### Querying

Not all endpoints are alike, but for the use case in this article, one shape keeps showing up: a JSON **Query** document describes what to match, and an optional **Filter** narrows it down. Salesforce built the OCAPI Data API around this shape years ago. Here's the detail worth knowing before you write a line of code: the newer SCAPI Admin Data API endpoints for Catalogs, Products, and Customers reuse the exact same document types, down to the snake\_case field names.

> [!NOTE]
> **This grammar is not universal across SCAPI.** It applies to the SCAPI **Admin Data API** (system-to-system integrations, authenticated with an Account Manager token) because Salesforce carried the OCAPI Data API's query documents over field-for-field — see the [Query](https://developer.salesforce.com/docs/commerce/commerce-api/references/catalogs?meta=type:Query) and [Filter](https://developer.salesforce.com/docs/commerce/commerce-api/references/products?meta=type:Filter) type references for Catalogs and Products. It does **not** apply to the shopper-facing [Shopper Search API](https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-search?meta=productSearch), which takes no JSON query body at all: it filters through `refine` query-string parameters (`refine=price=(0..100)`) against attributes your catalog defines as searchable, and it has no general-purpose way to filter by an arbitrary date field like `creation_date`. If you're building storefront search, that's the API you want, and everything below this note won't help you. If you're syncing or auditing records from the back end, keep reading.

Here are the endpoints this article's examples apply to, paired with their SCAPI Admin Data API equivalent where one exists:

- [Search Catalogs (OCAPI Data API)](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-data-catalogs?meta=Summary)
- [Search Categories within a Catalog (OCAPI Data API)](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-data-catalogs?meta=Summary) / [Search categories (SCAPI Admin Data API)](https://developer.salesforce.com/docs/commerce/commerce-api/references/catalogs?meta=searchCategories)
- [Search for customers in a customer list (OCAPI Data API)](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-data-customer-lists?meta=Summary) / [Search customer in customer list (SCAPI Admin Data API)](https://developer.salesforce.com/docs/commerce/commerce-api/references/customers?meta=searchCustomerInCustomerList)
- [Search Products (SCAPI Admin Data API)](https://developer.salesforce.com/docs/commerce/commerce-api/references/products?meta=searchProducts)

> [!WARNING]
> OCAPI is officially deprecated as of April 2026. Every OCAPI reference page now carries a "(deprecated)" label, and Salesforce ships new features to SCAPI only. The query knowledge in this article isn't obsolete: the same documents still work if you're maintaining an existing OCAPI integration, but a new integration should target the SCAPI Admin Data API endpoints above instead. See [the OCAPI versus SCAPI rematch](/in-the-ring-ocapi-versus-scapi/) for the full migration picture and the maintenance-window timeline.

#### Attributes

Not every field on an object is filterable, and that's set per endpoint, not globally. Before you write a query, check the documentation page for the specific endpoint (OCAPI or SCAPI) to see which attributes it actually supports as filter fields.

#### Date Format

Every date value you pass into these filters needs to be [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html#:~:text=Therefore%2C%20the%20order%20of%20the,27%2018%3A00%3A00.000.), in the UTC form `YYYY-MM-DDTHH:MM:SSZ`. Milliseconds are optional, not required: you can add them as `YYYY-MM-DDTHH:MM:SS.mmmZ` when you have that precision, but the API parses a plain-seconds timestamp just as well. The worked example below leaves them off for exactly that reason. Field names still have to match your data model, so confirm that `creation_date`, `valid_from`, `valid_to`, and similar names actually exist on the object you're querying.

```text
2012-03-19T07:22:59Z // example, no milliseconds needed
```

## Range Filter

{{< img-caption src="measuring-dates-7c1931cecc.jpg" alt="Calendars and ruler illustration introducing date-range filtering." >}}

Use a `range_filter` when you have one date field and want everything that falls between a start and an end value. This is the filter behind the classic "give me everything created last week" sync query, and it's documented as part of the shared [Filter document](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/ocapi-shop-product-search?meta=Summary) type.

```json
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

Read it from the outside in:

- **`filtered_query`** is the wrapper that says "run a query, then narrow the hits with a filter." Every example in this article uses it for that reason.
- **`filter.range_filter`** is where the actual date logic lives. `field` names the date attribute to check (`creation_date` here), and `from`/`to` set the interval's boundaries.
- **`query.match_all_query`** fills the "query" half of the wrapper. It matches every record unconditionally, so the `range_filter` ends up doing all the real work. You'll see this same empty query in nearly every date-filtering example, because most of the time you don't need a text or attribute query on top of the date range.

Leave out `from` or `to` and the range becomes open-ended on that side. A range with only `from` means "everything created on or after this date," which is exactly the shape an incremental sync needs.

## Range2 Filter

A single `range_filter` breaks down the moment your data has two date fields instead of one, like a promotion's `valid_from`/`valid_to` pair, and you need to know whether that validity window overlaps a period you care about. That's what `range2_filter` is for.

It compares two ranges: `R1`, defined by a pair of fields on the record (`from_field` and `to_field`), against `R2`, defined by two literal values you supply (`from_value` and `to_value`). `filter_mode` sets the relationship the search has to satisfy:

- `overlap` (the default if you omit `filter_mode`): `R1` overlaps fully or partially with `R2`
- `containing`: `R1` contains `R2`
- `contained`: `R1` is contained in `R2`

```text
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

With `filter_mode` set to `overlap`, this query returns every record whose `valid_from`–`valid_to` window touches the 2007–2017 range at all, even if it started years earlier or ends years later. Switch to `contained` and you'd only get records whose entire validity window sits inside that decade.

## Bool Filter

{{< img-caption src="combining-blocks-bc1da56e90.jpg" alt="A woman combining different blocks in a particular order." >}}

Real-world date queries rarely stand alone. "Open orders created this year" needs a status check *and* a date range at the same time, and that's a job neither `range_filter` nor `term_filter` can do by itself. `bool_filter` combines several filters into one logical expression.

```json
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

`bool_filter.operator` sets how its `filters` array combines: `and` means a hit has to satisfy every entry, `or` means any single one is enough. Inside the array, each entry is a complete filter object in its own right, so you can mix filter types freely: this example pairs a `term_filter` (exact match on `status`) with the `range_filter` from the first section (an open-ended `creation_date` range with no `to`). The result: open orders created since the start of 2023, and nothing else.

## Term Query

`range_filter` and `bool_filter` narrow a search after it runs, through the `filter` half of `filtered_query`. Sometimes you don't need a filter at all: you know the exact date a record was created and want to match it precisely. That's `term_query`, and unlike the filters above, it belongs on the `query` side of the document.

```json
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

`fields` takes an array because a term query can check more than one field at once (multiple fields are OR'd together, so a hit on any of them counts). `operator` controls how many values you're allowed to supply: `is` accepts exactly one, while `one_of` accepts several and matches a record if any of them hits. Here, `is` with a single value in `values` means "creation\_date must equal this exact instant": useful for re-fetching one known record, not for the range-based syncs the earlier filters handle.

## Custom Endpoint

None of the query types above cover every case. If you need an endpoint shaped entirely around your own requirements instead of an existing search resource, [Custom APIs](/creating-custom-ocapi-endpoints/) are the supported way to build one. They've been generally available since release 24.2, with real routing, a contract that validates every request before your code runs, and support for all HTTP methods, including transactions on POST, PUT, PATCH, and DELETE. That's a solid step up from the GET-only, no-transaction workaround that used to be the only option here.

Performance and caching are still on you: the platform handles routing and validation, but a slow or uncacheable custom endpoint is exactly as slow or uncacheable as you build it.

## Conclusion

Date filtering in Salesforce B2C Commerce Cloud comes down to one JSON grammar, `range_filter`, `range2_filter`, `bool_filter`, and `term_query`, shared by the OCAPI Data API and the SCAPI Admin Data API's Catalogs, Products, and Customers endpoints. Get the date format right (ISO 8601, milliseconds optional), confirm the field names against the actual endpoint's documentation, and pick the filter that matches the shape of your question: a single range, an overlap between two ranges, a combination of conditions, or an exact match.

The one thing to carry forward: this grammar is not the whole SCAPI story. Shopper-facing search runs on a different mechanism entirely, and OCAPI itself is on a maintenance clock. Know which side of that line your integration is on before you start filtering.
