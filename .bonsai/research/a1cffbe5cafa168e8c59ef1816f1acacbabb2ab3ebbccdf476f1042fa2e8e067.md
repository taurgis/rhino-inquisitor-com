---
schema_version: 1
artifact_type: section
source_url: https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/sfnext-page-designer.md#component-patterns-fallbacks-and-loaders
source_urls:
  - https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/sfnext-page-designer.md#component-patterns-fallbacks-and-loaders
normalized_url: https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/sfnext-page-designer.md
cache_key: a1cffbe5cafa168e8c59ef1816f1acacbabb2ab3ebbccdf476f1042fa2e8e067
topic: 
tags:
  - page
  - designer
  - components
  - component
  - storefront
format_available:
  - compressed
  - detailed
tier: standard
ttl: 
fetched_at: 2026-08-31T09:03:01.106Z
validated_at: 2026-08-31T09:03:01.106Z
stale_after: 2026-09-30T09:03:01.106Z
capture_method: route_markdown
extraction_status: extracted
extraction_confidence: high
quality_notes:
  - captured from public Markdown/MDX source: https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/sfnext-page-designer.md
  - auto-generated tags via keyword extraction
supplied_at: 
supplied_by: 
etag: "a07477abc7d0871d3ab9c12a26ad2007"
last_modified: Fri, 28 Aug 2026 03:42:57 GMT
content_hash: c114a9d180162d1a4dec17bce4517f45ed1338edaa57d742754bb293414fd18a
token_estimate:
  compressed: 1070
  detailed: 1180
status: active
site_module_id: salesforce-developer
docs_engine: 
docs_framework: 
source_doc_url: https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/sfnext-page-designer.md
search_provider: 
parent_cache_key: 27f9c4f5c510b1f12232c78ab20260fed65c8752446e989c7284c8fa5f51bb8b
section_anchor: component-patterns-fallbacks-and-loaders
section_heading_path: Page Designer Integration with Storefront Next > Implement Page Designer Components > Component Patterns: Fallbacks and Loaders
---

## Summary

Page Designer Integration with Storefront Next > Implement Page Designer Components > Component Patterns: Fallbacks and Loaders

## Compressed

### Component Patterns: Fallbacks and Loaders

#### Fallback Components

We recommend that every Page Designer component exports a `fallback` function.

```tsx
// Lightweight skeleton - no heavy logic
export function fallback({ title }: Partial<MyComponentProps>) {
  return (
    <div className="h-48 bg-gray-200 animate-pulse rounded">
      {title && <span className="sr-only">Loading {title}</span>}
    </div>
  );
}
```

**Best Practices:**

- Keep fallbacks lightweight (no state, effects, or data fetching).
- Match the approximate dimensions of the real component.
- Use CSS animations for loading indication.

#### Data Loaders

Export a `loader` object for components that need dynamic data.

This code example defines a `ProductCarousel` that gets its list from a dual loader. The component loads data on the server only, therefore the client loader returns null.

```tsx
// Server-side data loading
export const loader = {
  server: async ({ component, request, context }) => {
    // Fetch data on the server
    const products = await fetchProducts(component.data?.categoryId);
    return { products };
  },
  client: async ({ component, request }) => {
    // Optional: Client-side data loading
    return null;
  },
};

export default function ProductCarousel({ data, title }: ProductCarouselProps) {
  // `data` is already resolved - not a Promise!
  return (
    <div>
      <h2>{title}</h2>
      {data?.products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

**Key Points:**

- The `data` prop is **always resolved** when your component receives it.
- The internal Component wrapper handles Promise resolution.
- Your fallback is shown while data loads.
- Multiple components load data **in parallel**.

#### Components with Regions

Container components can define the regions where other components can be placed.

This code example defines a Grid Layout Page Designer component that acts as a container with two regions. `@Component` registers it and `@RegionDefinition` declares Main Content with up to 6 components, and Sidebar with up to 3 components. `GridMetadata` adds an optional `Columns` attribute. The default `Grid` component renders a two-column layout and uses the `Region` component to render the nested content for main and sidebar.

```tsx
import { Component } from "@/lib/decorators/component";
import { RegionDefinition } from "@/lib/decorators/region-definition";
import { Region } from "@/components/region";

@Component("grid", {
  name: "Grid Layout",
  group: "odyssey_base",
  description: "A flexible grid container for arranging components",
})
@RegionDefinition([
  {
    id: "main",
    name: "Main Content",
    maxComponents: 6,
  },
  {
    id: "sidebar",
    name: "Sidebar",
    maxComponents: 3,
  },
])
export class GridMetadata {
  @AttributeDefinition({
    name: "Columns",
    type: "integer",
    defaultValue: 2,
  })
  columns?: number;
}

export function fallback() {
  return <div className="grid gap-4 animate-pulse" />;
}

export default function Grid({ component, columns = 2 }: GridProps) {
  return (
    <div className={`grid grid-cols-${columns} gap-4`}>
      <div className="col-span-1">
        {/* Nested region - uses component mode */}
        <Region component={component} regionId="main" />
      </div>
      <div className="col-span-1">
        <Region component={component} regionId="sidebar" />
      </div>
    </div>
  );
}
```

#### Region Definition Options

These options are available for the region definition metadata.

```tsx
@RegionDefinition([
    {
        id: 'content',                    // Required: Unique region ID
        name: 'Content Area',             // Required: Display name in Business Manager
        maxComponents: 5,                 // Optional: Maximum components allowed
        minComponents: 1,                 // Optional: Minimum components required
        componentTypeInclusions: [        // Optional: Only allow these component types
            'sfnext.hero',
            'sfnext.productCarousel',
        ],
        componentTypeExclusions: [        // Optional: Disallow these component types
            'sfnext.grid',                // Prevent nested grids
        ],
    },
])
```

## Detailed

### Component Patterns: Fallbacks and Loaders

#### Fallback Components

We recommend that every Page Designer component exports a `fallback` function. The fallback skeleton is shown while the component loads.

```tsx
// Lightweight skeleton - no heavy logic
export function fallback({ title }: Partial<MyComponentProps>) {
  return (
    <div className="h-48 bg-gray-200 animate-pulse rounded">
      {title && <span className="sr-only">Loading {title}</span>}
    </div>
  );
}
```

**Best Practices:**

- Keep fallbacks lightweight (no state, effects, or data fetching).
- Match the approximate dimensions of the real component.
- Use CSS animations for loading indication.

#### Data Loaders

Export a `loader` object for components that need dynamic data.

This code example defines a `ProductCarousel` that gets its list from a dual loader. A server loader calls `fetchProducts` using `component.data?.categoryId` and returns products. The component loads data on the server only, therefore the client loader returns null. The component receives already-resolved data and title as props—no Promise handling in the component. It renders the title and a list of products as `ProductCard`s.

```tsx
// Server-side data loading
export const loader = {
  server: async ({ component, request, context }) => {
    // Fetch data on the server
    const products = await fetchProducts(component.data?.categoryId);
    return { products };
  },
  client: async ({ component, request }) => {
    // Optional: Client-side data loading
    return null;
  },
};

export default function ProductCarousel({ data, title }: ProductCarouselProps) {
  // `data` is already resolved - not a Promise!
  return (
    <div>
      <h2>{title}</h2>
      {data?.products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

**Key Points:**

- The `data` prop is **always resolved** when your component receives it.
- The internal Component wrapper handles Promise resolution.
- Your fallback is shown while data loads.
- Multiple components load data **in parallel**.

#### Components with Regions

Container components can define the regions where other components can be placed.

This code example defines a Grid Layout Page Designer component that acts as a container with two regions. `@Component` registers it and `@RegionDefinition` declares Main Content with up to 6 components, and Sidebar with up to 3 components. `GridMetadata` adds an optional `Columns` attribute. A fallback export renders a simple loading grid. The default `Grid` component renders a two-column layout and uses the `Region` component to render the nested content for main and sidebar. That way, you can place other components in each region in Page Designer.

```tsx
import { Component } from "@/lib/decorators/component";
import { RegionDefinition } from "@/lib/decorators/region-definition";
import { Region } from "@/components/region";

@Component("grid", {
  name: "Grid Layout",
  group: "odyssey_base",
  description: "A flexible grid container for arranging components",
})
@RegionDefinition([
  {
    id: "main",
    name: "Main Content",
    maxComponents: 6,
  },
  {
    id: "sidebar",
    name: "Sidebar",
    maxComponents: 3,
  },
])
export class GridMetadata {
  @AttributeDefinition({
    name: "Columns",
    type: "integer",
    defaultValue: 2,
  })
  columns?: number;
}

export function fallback() {
  return <div className="grid gap-4 animate-pulse" />;
}

export default function Grid({ component, columns = 2 }: GridProps) {
  return (
    <div className={`grid grid-cols-${columns} gap-4`}>
      <div className="col-span-1">
        {/* Nested region - uses component mode */}
        <Region component={component} regionId="main" />
      </div>
      <div className="col-span-1">
        <Region component={component} regionId="sidebar" />
      </div>
    </div>
  );
}
```

#### Region Definition Options

These options are available for the region definition metadata.

```tsx
@RegionDefinition([
    {
        id: 'content',                    // Required: Unique region ID
        name: 'Content Area',             // Required: Display name in Business Manager
        maxComponents: 5,                 // Optional: Maximum components allowed
        minComponents: 1,                 // Optional: Minimum components required
        componentTypeInclusions: [        // Optional: Only allow these component types
            'sfnext.hero',
            'sfnext.productCarousel',
        ],
        componentTypeExclusions: [        // Optional: Disallow these component types
            'sfnext.grid',                // Prevent nested grids
        ],
    },
])
```

## Provenance

Section "Page Designer Integration with Storefront Next > Implement Page Designer Components > Component Patterns: Fallbacks and Loaders" of https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/sfnext-page-designer.md (parent 27f9c4f5c510b1f12232c78ab20260fed65c8752446e989c7284c8fa5f51bb8b)