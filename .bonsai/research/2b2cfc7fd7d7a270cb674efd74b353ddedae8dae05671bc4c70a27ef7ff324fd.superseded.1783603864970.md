---
schema_version: 1
artifact_type: section
source_url: https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/page-designer.html#react-component-structure
source_urls:
  - https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/page-designer.html#react-component-structure
normalized_url: https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/page-designer.html
cache_key: 2b2cfc7fd7d7a270cb674efd74b353ddedae8dae05671bc4c70a27ef7ff324fd
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
content_hash: 15dc4be067492cfd66a71a7c2406c98b9d54bdf39fdf4a9a5fd6407acb6acba4
token_estimate:
  compressed: 229
  detailed: 229
status: active
site_module_id: salesforce-developer
docs_engine: 
docs_framework: 
source_doc_url: https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/page-designer.md
search_provider: 
parent_cache_key: 467d717ec01dc9f4b7699de1cb7d5ac8f702454110ad55b18f553d1bb0aece01
section_anchor: react-component-structure
section_heading_path: Integrate Page Designer with PWA Kit > Building Layout Components > React Component Structure
---

## Summary

Integrate Page Designer with PWA Kit > Building Layout Components > React Component Structure

## Compressed

### React Component Structure

Here's an example of a layout component that shows content in a responsive grid:

```jsx
import React from 'react'
import PropTypes from 'prop-types'
import {SimpleGrid} from '@salesforce/retail-react-app/app/components/shared/ui'
import {Region, regionPropType} from '@salesforce/commerce-sdk-react/components'

/**
 * This layout component displays its children in a 2 row x 1 column grid on mobile
 * and a 1 row x 2 column grid on desktop.
 */
export const MobileGrid2r1c = ({regions, component}) => {
  return (
    <SimpleGrid columns={{base: 1, sm: 2}} gridGap={4}>
      {regions.map((region) => (
        <Region key={region.id} regionId={region.id} component={component} />
      ))}
    </SimpleGrid>
  )
}

MobileGrid2r1c.propTypes = {
  regions: PropTypes.arrayOf(regionPropType).isRequired,
  component: PropTypes.object.isRequired
}

export default MobileGrid2r1c
```

## Detailed

### React Component Structure

Here's an example of a layout component that shows content in a responsive grid:

```jsx
import React from 'react'
import PropTypes from 'prop-types'
import {SimpleGrid} from '@salesforce/retail-react-app/app/components/shared/ui'
import {Region, regionPropType} from '@salesforce/commerce-sdk-react/components'

/**
 * This layout component displays its children in a 2 row x 1 column grid on mobile
 * and a 1 row x 2 column grid on desktop.
 */
export const MobileGrid2r1c = ({regions, component}) => {
  return (
    <SimpleGrid columns={{base: 1, sm: 2}} gridGap={4}>
      {regions.map((region) => (
        <Region key={region.id} regionId={region.id} component={component} />
      ))}
    </SimpleGrid>
  )
}

MobileGrid2r1c.propTypes = {
  regions: PropTypes.arrayOf(regionPropType).isRequired,
  component: PropTypes.object.isRequired
}

export default MobileGrid2r1c
```

## Provenance

Section "Integrate Page Designer with PWA Kit > Building Layout Components > React Component Structure" of https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/page-designer.html (parent 467d717ec01dc9f4b7699de1cb7d5ac8f702454110ad55b18f553d1bb0aece01)