---
schema_version: 1
artifact_type: section
source_url: https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/building-your-app.html#building-your-storefront-next-extension
source_urls:
  - https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/building-your-app.html#building-your-storefront-next-extension
normalized_url: https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/building-your-app.html
cache_key: 3bcb3deae9419a0e1ed646b5ebde38da42b1a21d2812e168f7ea1972dbdadcfd
topic: 
tags:
  - extension
  - app
  - hook
  - storefront
  - commerce
format_available:
  - compressed
  - detailed
tier: standard
ttl: 
fetched_at: 2026-07-21T08:20:38.550Z
validated_at: 2026-07-21T08:20:38.550Z
stale_after: 2026-08-20T08:20:38.550Z
capture_method: route_markdown
extraction_status: extracted
extraction_confidence: high
quality_notes:
  - captured from public Markdown/MDX source: https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/building-your-app.md
  - auto-generated tags via keyword extraction
supplied_at: 
supplied_by: 
etag: "5bec1b3820dca2cacdbb488b3c235516"
last_modified: Tue, 21 Jul 2026 01:09:03 GMT
content_hash: c69e89fa0b627f5d073745e9cbb46912c908bdba3e9ee89ca80ff21a6f493bf6
token_estimate:
  compressed: 1541
  detailed: 1802
status: active
site_module_id: salesforce-developer
docs_engine: 
docs_framework: 
source_doc_url: https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/building-your-app.md
search_provider: 
parent_cache_key: 7da6145ff485ec2662c4bb67a81b663e043b174889839cb3fe2f7653f3bb4582
section_anchor: building-your-storefront-next-extension
section_heading_path: Building Your Commerce App > UI-Only and Fullstack Apps > Building your Storefront Next extension
---

## Summary

Building Your Commerce App > UI-Only and Fullstack Apps > Building your Storefront Next extension

## Compressed

### Building your Storefront Next extension

Your extension lives in the `storefront-next/src/extensions/{app-name}/` directory of your CAP.

- One or more React components
- A `target-config.json` that maps your components to UI target IDs and declares context providers
- Localization files under `locales/` (minimum: `en-US`, `en-GB`, `it-IT`)
- Optionally, route files under `routes/` for custom pages
- Optionally, a context provider component

**Storefront Next tech stack:**

| Layer        | Technology                                       |
| :----------- | :----------------------------------------------- |
| Framework    | React 19                                         |
| Language     | TypeScript (strict)                              |
| Build        | Vite                                             |
| Styling      | Tailwind CSS 4 (`@theme inline`, no config file) |
| Components   | ShadCN UI (Radix UI primitives)                  |
| Variants     | CVA (class-variance-authority)                   |
| Routing      | React Router 7                                   |
| i18n         | react-i18next                                    |
| Unit testing | Vitest + React Testing Library                   |
| E2E testing  | CodeceptJS + Playwright                          |

Example extension directory structure:

```
src/extensions/my-app/
  target-config.json
  components/
    my-widget.tsx
    my-other-widget.tsx
  locales/
    en-US/translations.json
    en-GB/translations.json
    it-IT/translations.json
  providers/
    my-app-provider.tsx        # optional context provider
  routes/
    _app.my-app-page.tsx       # optional custom route
  hooks/
    use-my-app.ts              # optional custom hooks
```

#### target-config.json

The `target-config.json` defines which platform UI targets your components replace or extend, and optionally declares context providers that wrap the application root.

**Components** map to `UITarget` placeholders defined throughout the Storefront Next application. Each `UITarget` has a unique `targetId` — your extension specifies which target IDs to fill, the component file path (relative to `src/`), and an `order` value for controlling render order when multiple extensions target the same ID.

Target IDs follow the naming convention `sfcc.{location}.{domain}.{capability}` — for example, `sfcc.orderSummary.tax.line` targets the tax line item within the order summary, and `sfcc.pdp.reviews.rating` targets the star rating display on the product detail page.

```json
{
  "components": [
    {
      "targetId": "sfcc.orderSummary.tax.line",
      "path": "extensions/avatax-tax-breakdown/components/tax-line.tsx",
      "order": 0
    }
  ]
}
```

Multiple components can target different insertion points in the same `target-config.json`.

```json
{
  "components": [
    {
      "targetId": "sfcc.pdp.reviews.rating",
      "path": "extensions/yotpo-reviews/components/star-rating.tsx",
      "order": 0
    },
    {
      "targetId": "sfcc.pdp.reviews.list",
      "path": "extensions/yotpo-reviews/components/reviews-list.tsx",
      "order": 0
    },
    {
      "targetId": "sfcc.pdp.reviews.qna",
      "path": "extensions/yotpo-reviews/components/qna-section.tsx",
      "order": 0
    }
  ]
}
```

When multiple components target the same `targetId`, they are rendered in ascending `order`.

**Context providers** let your extension inject a React context provider at the application root (wrapping `root.tsx`).

```json
{
  "components": [
    {
      "targetId": "sfcc.checkout.payment.paymentMethods",
      "path": "extensions/my-payments/components/payment-methods.tsx",
      "order": 0
    }
  ],
  "contextProviders": [
    {
      "path": "extensions/my-payments/providers/payments-provider.tsx",
      "order": 0
    }
  ]
}
```

**Available UI target IDs** are defined throughout the Storefront Next application using the `<UITarget targetId="..." />` component.

#### How UITarget replacement works at build time

`UITarget` is a **build-time placeholder**, not a runtime component.

1. **Replace** each `<UITarget targetId="X">` with the registered extension component(s) for that target ID, generating the necessary `import` statements automatically.
2. **Preserve children** if no extension targets that ID — `<UITarget targetId="X">{defaultContent}</UITarget>` renders `defaultContent`.
3. **Remove** `<UITarget>` entirely if no extension targets it and no children are provided.

Context providers declared in `contextProviders` are similarly injected at build time by replacing the `<UITargetProviders>` placeholder in `root.tsx` with nested provider wrappers.

> **Important:** Changes to `target-config.json` during development automatically restart the Vite dev server so the registry is rebuilt.

#### Extension routes

Extensions can add custom pages by placing route files in a `routes/` subdirectory.

```
src/extensions/my-app/
  routes/
    _app.my-app-settings.tsx    # page route under the _app layout
    action.my-app-action.ts     # resource route (action endpoint)
    resource.my-app-data.ts     # resource route (data endpoint)
```

#### Extension localization

Extensions must include translation files for at least `en-US`, `en-GB`, and `it-IT` locales.

Translation namespaces are automatically generated from the extension folder name using PascalCase with an `ext` prefix.

```typescript
import { useTranslation } from "react-i18next";

export function MyAppWidget() {
  const { t } = useTranslation("extMyApp");
  return <h1>{t("widget.title")}</h1>;
}
```

An aggregation script (`aggregate-extension-locales`) runs during the build process to discover extension locale files and generate import manifests. This is handled automatically — you don't need to manually register your translations.

#### Extension installation

During installation, the extension code from your CAP is copied into the merchant's Storefront Next project under `src/extensions/{app-name}/`.

On the next build, the Vite plugin reads the new `target-config.json`, rebuilds the component registry, and replaces `UITarget` placeholders with your components.

## Detailed

### Building your Storefront Next extension

Your extension lives in the `storefront-next/src/extensions/{app-name}/` directory of your CAP. A typical extension includes:

- One or more React components
- A `target-config.json` that maps your components to UI target IDs and declares context providers
- Localization files under `locales/` (minimum: `en-US`, `en-GB`, `it-IT`)
- Optionally, route files under `routes/` for custom pages
- Optionally, a context provider component

**Storefront Next tech stack:**

| Layer        | Technology                                       |
| :----------- | :----------------------------------------------- |
| Framework    | React 19                                         |
| Language     | TypeScript (strict)                              |
| Build        | Vite                                             |
| Styling      | Tailwind CSS 4 (`@theme inline`, no config file) |
| Components   | ShadCN UI (Radix UI primitives)                  |
| Variants     | CVA (class-variance-authority)                   |
| Routing      | React Router 7                                   |
| i18n         | react-i18next                                    |
| Unit testing | Vitest + React Testing Library                   |
| E2E testing  | CodeceptJS + Playwright                          |

Example extension directory structure:

```
src/extensions/my-app/
  target-config.json
  components/
    my-widget.tsx
    my-other-widget.tsx
  locales/
    en-US/translations.json
    en-GB/translations.json
    it-IT/translations.json
  providers/
    my-app-provider.tsx        # optional context provider
  routes/
    _app.my-app-page.tsx       # optional custom route
  hooks/
    use-my-app.ts              # optional custom hooks
```

#### target-config.json

The `target-config.json` defines which platform UI targets your components replace or extend, and optionally declares context providers that wrap the application root.

**Components** map to `UITarget` placeholders defined throughout the Storefront Next application. Each `UITarget` has a unique `targetId` — your extension specifies which target IDs to fill, the component file path (relative to `src/`), and an `order` value for controlling render order when multiple extensions target the same ID.

Target IDs follow the naming convention `sfcc.{location}.{domain}.{capability}` — for example, `sfcc.orderSummary.tax.line` targets the tax line item within the order summary, and `sfcc.pdp.reviews.rating` targets the star rating display on the product detail page.

```json
{
  "components": [
    {
      "targetId": "sfcc.orderSummary.tax.line",
      "path": "extensions/avatax-tax-breakdown/components/tax-line.tsx",
      "order": 0
    }
  ]
}
```

Multiple components can target different insertion points in the same `target-config.json`. For example, a Ratings & Reviews extension might target the star rating, the full reviews list, and the Q\&A section on the PDP:

```json
{
  "components": [
    {
      "targetId": "sfcc.pdp.reviews.rating",
      "path": "extensions/yotpo-reviews/components/star-rating.tsx",
      "order": 0
    },
    {
      "targetId": "sfcc.pdp.reviews.list",
      "path": "extensions/yotpo-reviews/components/reviews-list.tsx",
      "order": 0
    },
    {
      "targetId": "sfcc.pdp.reviews.qna",
      "path": "extensions/yotpo-reviews/components/qna-section.tsx",
      "order": 0
    }
  ]
}
```

When multiple components target the same `targetId`, they are rendered in ascending `order`.

**Context providers** let your extension inject a React context provider at the application root (wrapping `root.tsx`). This is useful when your extension needs shared state accessible across multiple components or routes:

```json
{
  "components": [
    {
      "targetId": "sfcc.checkout.payment.paymentMethods",
      "path": "extensions/my-payments/components/payment-methods.tsx",
      "order": 0
    }
  ],
  "contextProviders": [
    {
      "path": "extensions/my-payments/providers/payments-provider.tsx",
      "order": 0
    }
  ]
}
```

**Available UI target IDs** are defined throughout the Storefront Next application using the `<UITarget targetId="..." />` component. Each target ID corresponds to a specific domain and location in the storefront. Consult the Storefront Next template application for the full list of available target IDs.

#### How UITarget replacement works at build time

`UITarget` is a **build-time placeholder**, not a runtime component. When the merchant runs `pnpm dev` or `pnpm build`, a Vite plugin scans all `target-config.json` files under `src/extensions/`, builds a component registry, and uses Babel AST transforms to:

1. **Replace** each `<UITarget targetId="X">` with the registered extension component(s) for that target ID, generating the necessary `import` statements automatically.
2. **Preserve children** if no extension targets that ID — `<UITarget targetId="X">{defaultContent}</UITarget>` renders `defaultContent`.
3. **Remove** `<UITarget>` entirely if no extension targets it and no children are provided.

Context providers declared in `contextProviders` are similarly injected at build time by replacing the `<UITargetProviders>` placeholder in `root.tsx` with nested provider wrappers.

> **Important:** Changes to `target-config.json` during development automatically restart the Vite dev server so the registry is rebuilt.

#### Extension routes

Extensions can add custom pages by placing route files in a `routes/` subdirectory. These follow the same file-based routing conventions as the main application (React Router v7 flat routes). Route files are automatically discovered and merged into the application's route tree at build time — no manual route registration is needed.

```
src/extensions/my-app/
  routes/
    _app.my-app-settings.tsx    # page route under the _app layout
    action.my-app-action.ts     # resource route (action endpoint)
    resource.my-app-data.ts     # resource route (data endpoint)
```

#### Extension localization

Extensions must include translation files for at least `en-US`, `en-GB`, and `it-IT` locales. Place them at `locales/{locale}/translations.json` within your extension directory.

Translation namespaces are automatically generated from the extension folder name using PascalCase with an `ext` prefix. For example, an extension in `src/extensions/my-app/` gets the namespace `extMyApp`.

```typescript
import { useTranslation } from "react-i18next";

export function MyAppWidget() {
  const { t } = useTranslation("extMyApp");
  return <h1>{t("widget.title")}</h1>;
}
```

An aggregation script (`aggregate-extension-locales`) runs during the build process to discover extension locale files and generate import manifests. This is handled automatically — you don't need to manually register your translations.

#### Extension installation

During installation, the extension code from your CAP is copied into the merchant's Storefront Next project under `src/extensions/{app-name}/`.

On the next build, the Vite plugin reads the new `target-config.json`, rebuilds the component registry, and replaces `UITarget` placeholders with your components.

## Provenance

Section "Building Your Commerce App > UI-Only and Fullstack Apps > Building your Storefront Next extension" of https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/building-your-app.html (parent 7da6145ff485ec2662c4bb67a81b663e043b174889839cb3fe2f7653f3bb4582)