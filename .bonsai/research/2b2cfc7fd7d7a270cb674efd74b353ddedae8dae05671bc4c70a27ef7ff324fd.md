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
content_hash: 3a939f3a45ac107fca7335a3691aa73ec0ba73c08a67ad2f3703f698d41d80ed
token_estimate:
  compressed: 266
  detailed: 266
status: active
site_module_id: salesforce-developer
docs_engine: 
docs_framework: 
source_doc_url: https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/page-designer.md
search_provider: 
parent_cache_key: 467d717ec01dc9f4b7699de1cb7d5ac8f702454110ad55b18f553d1bb0aece01
section_anchor: react-component-structure
section_heading_path: Integrate Page Designer with PWA Kit > Building Leaf Components > React Component Structure
---

## Summary

Integrate Page Designer with PWA Kit > Building Leaf Components > React Component Structure

## Compressed

### React Component Structure

Here's an example of a leaf component that displays an image:

```jsx
import React from 'react'
import PropTypes from 'prop-types'
import {Box, Image} from '@salesforce/retail-react-app/app/components/shared/ui'

/**
 * Simple ImageTile component that displays a responsive image.
 * This component can be placed inside any Layout component.
 */
export const ImageTile = ({image}) => {
  return (
    <Box className="image-tile">
      <figure>
        <picture>
          <source srcSet={image?.src?.tablet} media="(min-width: 48em)" />
          <source srcSet={image?.src?.desktop} media="(min-width: 64em)" />
          <Image src={image?.src?.mobile || image?.url} alt={image?.alt} title={image?.alt} />
        </picture>
      </figure>
    </Box>
  )
}

ImageTile.propTypes = {
  image: PropTypes.shape({
    url: PropTypes.string,
    alt: PropTypes.string,
    src: PropTypes.shape({
      mobile: PropTypes.string,
      tablet: PropTypes.string,
      desktop: PropTypes.string
    })
  })
}

export default ImageTile
```

## Detailed

### React Component Structure

Here's an example of a leaf component that displays an image:

```jsx
import React from 'react'
import PropTypes from 'prop-types'
import {Box, Image} from '@salesforce/retail-react-app/app/components/shared/ui'

/**
 * Simple ImageTile component that displays a responsive image.
 * This component can be placed inside any Layout component.
 */
export const ImageTile = ({image}) => {
  return (
    <Box className="image-tile">
      <figure>
        <picture>
          <source srcSet={image?.src?.tablet} media="(min-width: 48em)" />
          <source srcSet={image?.src?.desktop} media="(min-width: 64em)" />
          <Image src={image?.src?.mobile || image?.url} alt={image?.alt} title={image?.alt} />
        </picture>
      </figure>
    </Box>
  )
}

ImageTile.propTypes = {
  image: PropTypes.shape({
    url: PropTypes.string,
    alt: PropTypes.string,
    src: PropTypes.shape({
      mobile: PropTypes.string,
      tablet: PropTypes.string,
      desktop: PropTypes.string
    })
  })
}

export default ImageTile
```

## Provenance

Section "Integrate Page Designer with PWA Kit > Building Leaf Components > React Component Structure" of https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/page-designer.html (parent 467d717ec01dc9f4b7699de1cb7d5ac8f702454110ad55b18f553d1bb0aece01)