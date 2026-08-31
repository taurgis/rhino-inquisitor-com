---
schema_version: 1
artifact_type: section
source_url: https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-dev-for-page-designer.html#initialize-a-region-with-a-component-already-populated
source_urls:
  - https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-dev-for-page-designer.html#initialize-a-region-with-a-component-already-populated
normalized_url: https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-dev-for-page-designer.html
cache_key: b4cdafc2092ba501283ee3efcaff99bb906bb09ab480fbc025fdf5dea3030ac3
topic: 
tags:
  - page
  - component
  - editor
  - type
  - attribute
format_available:
  - compressed
  - detailed
tier: standard
ttl: 
fetched_at: 2026-08-31T13:33:44.107Z
validated_at: 2026-08-31T13:33:44.107Z
stale_after: 2026-09-30T13:33:44.107Z
capture_method: route_markdown
extraction_status: extracted
extraction_confidence: high
quality_notes:
  - captured from public Markdown/MDX source: https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-dev-for-page-designer.md
  - 1 ::include directive(s) removed (shared snippets are not published on the .md route)
  - auto-generated tags via keyword extraction
supplied_at: 
supplied_by: 
etag: "b91201fcc2deb89f8007999cbbb75a73"
last_modified: Fri, 28 Aug 2026 03:42:55 GMT
content_hash: 212679c27304ec70ccbcaa7a402c16692a5db26b95ecb51b4e77a71b5666deb7
token_estimate:
  compressed: 348
  detailed: 401
status: active
site_module_id: salesforce-developer
docs_engine: 
docs_framework: 
source_doc_url: https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-dev-for-page-designer.md
search_provider: 
parent_cache_key: a0fa851d57df643ccaba3ed2c00ee85aaeb491e4adee24d129a955905c3b88cf
section_anchor: initialize-a-region-with-a-component-already-populated
section_heading_path: Page Designer > Page Designer and PWA Kit > Initialize a Region with a Component Already Populated
---

## Summary

Page Designer > Page Designer and PWA Kit > Initialize a Region with a Component Already Populated

## Compressed

### Initialize a Region with a Component Already Populated

Prepopulating a region with default components is a best practice that guides a merchant in creating a page. Use this property in the meta definition file for a component type that includes a region. When the merchant creates a page in the Visual Editor using the page type or component type, the default components are already populated in the region.

The following example specifies that the main region of the page is prepopulated with a default component. The component has id `commerce_layouts.productDetail`and name `Product Detail Layout`.

```json
{
  "name": "Product Detail Page",
  "description": "Product detail page with 3 regions",
  "region_definitions": [
    {
      "id": "top",
      "name": "Top Region",
      "component_type_exclusions": [{ "type_id": "commerce_assets.campaignBanner" }]
    },
    {
      "id": "main",
      "name": "Main Region",
      "default_component_constructors": [
        {
          "type_id": "commerce_layouts.productDetail",
          "name": "Product Detail Layout"
        }
      ],
      "component_type_exclusions": [{ "type_id": "commerce_assets.campaignBanner" }]
    },
    {
      "id": "bottom",
      "name": "Bottom Region",
      "component_type_exclusions": [{ "type_id": "commerce_assets.campaignBanner" }]
    }
  ],
  "supported_aspect_types": ["pdp"]
}
```

## Detailed

### Initialize a Region with a Component Already Populated

Prepopulating a region with default components is a best practice that guides a merchant in creating a page. To specify that a region contains specific components by default, use the `default_component_constructors` property in the meta definition file for a page type. Use this property in the meta definition file for a component type that includes a region. When the merchant creates a page in the Visual Editor using the page type or component type, the default components are already populated in the region. The merchant can delete the components if necessary.

The following example specifies that the main region of the page is prepopulated with a default component. The component has id `commerce_layouts.productDetail`and name `Product Detail Layout`.

```json
{
  "name": "Product Detail Page",
  "description": "Product detail page with 3 regions",
  "region_definitions": [
    {
      "id": "top",
      "name": "Top Region",
      "component_type_exclusions": [{ "type_id": "commerce_assets.campaignBanner" }]
    },
    {
      "id": "main",
      "name": "Main Region",
      "default_component_constructors": [
        {
          "type_id": "commerce_layouts.productDetail",
          "name": "Product Detail Layout"
        }
      ],
      "component_type_exclusions": [{ "type_id": "commerce_assets.campaignBanner" }]
    },
    {
      "id": "bottom",
      "name": "Bottom Region",
      "component_type_exclusions": [{ "type_id": "commerce_assets.campaignBanner" }]
    }
  ],
  "supported_aspect_types": ["pdp"]
}
```

## Provenance

Section "Page Designer > Page Designer and PWA Kit > Initialize a Region with a Component Already Populated" of https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-dev-for-page-designer.html (parent a0fa851d57df643ccaba3ed2c00ee85aaeb491e4adee24d129a955905c3b88cf)