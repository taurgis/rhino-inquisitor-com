---
schema_version: 1
artifact_type: section
source_url: https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/page-designer.html#2-create-component-registry
source_urls:
  - https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/page-designer.html#2-create-component-registry
normalized_url: https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/page-designer.html
cache_key: 2ebbc84e7bc289b7b32ba38d8af01438d0a4a6fea7f5fdd5e7fadae4e924b81d
topic: 
tags:
  - page
  - components
  - component
  - designer
  - metadata
format_available:
  - compressed
  - detailed
tier: standard
ttl: 
fetched_at: 2026-07-09T13:31:03.825Z
validated_at: 2026-07-09T13:31:03.825Z
stale_after: 2026-08-08T13:31:03.825Z
capture_method: route_markdown
extraction_status: extracted
extraction_confidence: high
quality_notes:
  - captured from public Markdown/MDX source: https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/page-designer.md
  - auto-generated tags via keyword extraction
supplied_at: 
supplied_by: 
etag: "841a08caf801d958b905f2c61d83759b"
last_modified: Thu, 09 Jul 2026 01:19:22 GMT
content_hash: 9b827715c17d4236ee4cdf2aa8f29a834bfa04abe0294bae90d5a1a889790383
token_estimate:
  compressed: 188
  detailed: 188
status: active
site_module_id: salesforce-developer
docs_engine: 
docs_framework: 
source_doc_url: https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/page-designer.md
search_provider: 
parent_cache_key: 467d717ec01dc9f4b7699de1cb7d5ac8f702454110ad55b18f553d1bb0aece01
section_anchor: 2-create-component-registry
section_heading_path: Integrate Page Designer with PWA Kit > Configure Page Designer > 2. Create Component Registry
---

## Summary

Integrate Page Designer with PWA Kit > Configure Page Designer > 2. Create Component Registry

## Compressed

### 2. Create Component Registry

Create `app/page-designer/registry.js` to register your components with lazy loading:

```jsx
import {registry} from '@salesforce/commerce-sdk-react'

export function initializeRegistry() {
  // Register layout components
  registry.registerImporter('commerce_layouts.carousel', () => import('./layouts/carousel'))
  registry.registerImporter('commerce_layouts.mobileGrid2r1c', () =>
    import('./layouts/mobileGrid2r1c')
  )

  // Register asset components
  registry.registerImporter('commerce_assets.photoTile', () => import('./assets/image-tile'))
  registry.registerImporter('commerce_assets.imageAndText', () =>
    import('./assets/image-with-text')
  )

  // Add all your Page Designer components here
}
```

## Detailed

### 2. Create Component Registry

Create `app/page-designer/registry.js` to register your components with lazy loading:

```jsx
import {registry} from '@salesforce/commerce-sdk-react'

export function initializeRegistry() {
  // Register layout components
  registry.registerImporter('commerce_layouts.carousel', () => import('./layouts/carousel'))
  registry.registerImporter('commerce_layouts.mobileGrid2r1c', () =>
    import('./layouts/mobileGrid2r1c')
  )

  // Register asset components
  registry.registerImporter('commerce_assets.photoTile', () => import('./assets/image-tile'))
  registry.registerImporter('commerce_assets.imageAndText', () =>
    import('./assets/image-with-text')
  )

  // Add all your Page Designer components here
}
```

## Provenance

Section "Integrate Page Designer with PWA Kit > Configure Page Designer > 2. Create Component Registry" of https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/page-designer.html (parent 467d717ec01dc9f4b7699de1cb7d5ac8f702454110ad55b18f553d1bb0aece01)