---
schema_version: 1
artifact_type: source
source_url: https://help.salesforce.com/s/articleView?id=cc.b2c_sites_and_storefronts.htm&language=en_US&type=5
source_urls:
  - https://help.salesforce.com/s/articleView?id=cc.b2c_sites_and_storefronts.htm&language=en_US&type=5
  - https://salesforcecommercecloud.github.io/b2c-developer-tooling/help/help-admin/b2c_sites_and_storefronts.md
normalized_url: https://help.salesforce.com/s/articleView?id=cc.b2c_sites_and_storefronts.htm&language=en_US&type=5
cache_key: cec9223f26a50d2b4b4e73db7acbc36c6e6a6c3e14beabce0db32522ddc255ff
topic: 
tags:
  - site
  - sites
  - storefronts
  - multiple
  - storefront
format_available:
  - compressed
  - detailed
tier: standard
ttl: 
fetched_at: 2026-08-31T13:33:16.742Z
validated_at: 2026-08-31T13:33:16.742Z
stale_after: 2026-09-30T13:33:16.742Z
capture_method: route_markdown
extraction_status: extracted
extraction_confidence: high
quality_notes:
  - captured from public Markdown/MDX source: https://salesforcecommercecloud.github.io/b2c-developer-tooling/help/help-admin/b2c_sites_and_storefronts.md
  - auto-generated tags via keyword extraction
supplied_at: 
supplied_by: 
etag: W/"6a8dd184-8d7"
last_modified: Tue, 25 Aug 2026 17:31:48 GMT
content_hash: f9c3d2a9ed4337c9b21a1094a4bb2eec36af2009a2c15a99ca7663a777951887
token_estimate:
  compressed: 478
  detailed: 565
status: active
site_module_id: salesforce
docs_engine: 
docs_framework: 
source_doc_url: https://salesforcecommercecloud.github.io/b2c-developer-tooling/help/help-admin/b2c_sites_and_storefronts.md
search_provider: 
parent_cache_key: 
section_anchor: 
section_heading_path: 
---

## Summary

B2C Commerce Sites and Storefronts

## Compressed

# B2C Commerce Sites and Storefronts

_In B2C Commerce, a site is the application and associated code that runs a storefront.

### Site Architecture Scenarios

When designing your site, your architect must consider the following:

- The geographical relationship between storefronts and the teams that maintain them
- Data shared between sites, such as product data, tax and payment information, user roles and permissions, promotions, or application code
- Whether the storefront must be localized for different market locales or restructured for them
- Data that remains separately controlled due to corporate structure or legal requirements
- Whether customer, basket, or transaction data carries over from one storefront to the next
   
   Example: An apparel retailer lets customers shop simultaneously at both their adult and children's sites. But a retailer with two different customer bases, such as a book publisher for religious books and fantasy fiction, can prevent crossover.

### One Site, One Storefront

The simplest scenario is one site and one storefront that it supports.

### One Site, Multiple Storefronts

If you have many storefronts and a single team maintaining them, manage them more easily as a single site, even if the products are different for each site. Similarly, to share baskets between storefronts, the storefronts must be part of a single site. If you’re deploying many localized sites with similar branding and products, it's faster and easier to manage new storefronts as an extension of an existing site.

### Multiple Sites, Multiple Storefronts

You can have multiple sites, each of which supports multiple storefronts.

### Site Definition

A live site is defined as a listing in the Manage Sites screen on the merchant's production instance of Business Manager with a status set to Online, not including those sites with other statuses or sites that 's been deleted.

## Detailed

# B2C Commerce Sites and Storefronts

_In B2C Commerce, a site is the application and associated code that runs a storefront. A storefront is the user's online experience. A site can have multiple storefronts with different URLs for different brands, locales (with currency and tax differences), or multiple channels. If you’re referring to a specific URL, B2C Commerce uses the term storefront._

### Site Architecture Scenarios

When designing your site, your architect must consider the following:

- The geographical relationship between storefronts and the teams that maintain them
- Data shared between sites, such as product data, tax and payment information, user roles and permissions, promotions, or application code
- Whether the storefront must be localized for different market locales or restructured for them
- Data that remains separately controlled due to corporate structure or legal requirements
- Whether customer, basket, or transaction data carries over from one storefront to the next
   
   Example: An apparel retailer lets customers shop simultaneously at both their adult and children's sites. But a retailer with two different customer bases, such as a book publisher for religious books and fantasy fiction, can prevent crossover.

### One Site, One Storefront

The simplest scenario is one site and one storefront that it supports.

### One Site, Multiple Storefronts

If you have many storefronts and a single team maintaining them, manage them more easily as a single site, even if the products are different for each site. Similarly, to share baskets between storefronts, the storefronts must be part of a single site. If you’re deploying many localized sites with similar branding and products, it's faster and easier to manage new storefronts as an extension of an existing site.

### Multiple Sites, Multiple Storefronts

You can have multiple sites, each of which supports multiple storefronts. You can also choose to share site data, such as customer data, between sites.

### Site Definition

A live site is defined as a listing in the Manage Sites screen on the merchant's production instance of Business Manager with a status set to Online, not including those sites with other statuses or sites that 's been deleted.

## Provenance

Fetched from https://help.salesforce.com/s/articleView?id=cc.b2c_sites_and_storefronts.htm&language=en_US&type=5 on 2026-08-31T13:33:16.742Z