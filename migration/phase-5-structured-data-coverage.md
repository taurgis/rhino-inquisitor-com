# Phase 5 Structured Data Coverage

Date: 2026-03-13
Ticket: `analysis/tickets/phase-5/RHI-052-structured-data-rich-result-readiness.md`

## Schema type inventory

| Schema type | Emitted | Template families | Implementation path | Notes |
|---|---|---|---|---|
| `WebSite` | Yes | Homepage only | `src/layouts/partials/seo/head-meta.html` -> `src/layouts/partials/seo/json-ld-site.html` | Emitted only on `/` with the canonical production URL and site name. |
| `BlogPosting` | Yes | Single post detail pages only (`.IsPage` + `.Type == "posts"`) | `src/layouts/partials/seo/head-meta.html` -> `src/layouts/partials/seo/json-ld-article.html` | Not emitted on pages, lists, taxonomy terms, pagination, 404, or alias helpers. |
| `BreadcrumbList` | Yes | Pages, posts, list pages, taxonomy pages, and term pages where visible breadcrumbs render | `src/layouts/partials/seo/head-meta.html` -> `src/layouts/partials/seo/json-ld-breadcrumb.html` | Emitted only when the visible breadcrumb partial has more than one crumb. Explicitly suppressed on the 404 page. |
| `VideoObject` | No | None currently qualify | None | Current video-related content links to external YouTube watch pages or archive listings, but the site does not yet render a dedicated on-page video watch experience with the required metadata. |

## Required property checklist

### `WebSite`

| Property | Source | Automated validation |
|---|---|---|
| `@context` | Static schema partial value | Parsed by `scripts/seo/check-schema.js` |
| `@type` | Static schema partial value (`WebSite`) | Parsed by `scripts/seo/check-schema.js` |
| `name` | `.Site.Title` | Required by `scripts/seo/check-schema.js` |
| `url` | `.Site.Home.Permalink` | Required and host-validated by `scripts/seo/check-schema.js` |
| `description` | Shared SEO resolver output | Included for completeness; non-blocking beyond JSON parse safety |

### `BlogPosting`

| Property | Source | Automated validation |
|---|---|---|
| `@context` | Static schema partial value | Parsed by `scripts/seo/check-schema.js` |
| `@type` | Static schema partial value (`BlogPosting`) | Parsed by `scripts/seo/check-schema.js` |
| `headline` | `.Title` | Required and matched to visible `<h1>` or `<title>` by `scripts/seo/check-schema.js` |
| `description` | Shared SEO resolver output | Required by `scripts/seo/check-schema.js` |
| `url` | Shared canonical resolver output | Required, canonical-aligned, and host-validated by `scripts/seo/check-schema.js` |
| `datePublished` | `.Date.Format "2006-01-02T15:04:05Z07:00"` | Required and ISO 8601-with-timezone validated by `scripts/seo/check-schema.js` |
| `dateModified` | `.Lastmod.Format "2006-01-02T15:04:05Z07:00"` | Required and ISO 8601-with-timezone validated by `scripts/seo/check-schema.js` |
| `author.@type` | Static object value (`Person`) | Required by `scripts/seo/check-schema.js` |
| `author.name` | `.Params.author \| default .Site.Title` | Required by `scripts/seo/check-schema.js` |
| `mainEntityOfPage.@id` | Shared canonical resolver output | Canonical-aligned and host-validated by `scripts/seo/check-schema.js` |
| `image` | Shared SEO image resolver output | Present in current output; not a blocking validator requirement for this ticket |
| `publisher` | `.Site.Title` organization object | Present in current output; not a blocking validator requirement for this ticket |

### `BreadcrumbList`

| Property | Source | Automated validation |
|---|---|---|
| `@context` | Static schema partial value | Parsed by `scripts/seo/check-schema.js` |
| `@type` | Static schema partial value (`BreadcrumbList`) | Parsed by `scripts/seo/check-schema.js` |
| `itemListElement` | `src/layouts/partials/breadcrumbs-data.html` | Required by `scripts/seo/check-schema.js` |
| `itemListElement[].@type` | Static item value (`ListItem`) | Required by `scripts/seo/check-schema.js` |
| `itemListElement[].position` | Loop index + 1 | Required and sequence-validated by `scripts/seo/check-schema.js` |
| `itemListElement[].name` | Visible breadcrumb labels | Required and compared to visible breadcrumb text by `scripts/seo/check-schema.js` |
| `itemListElement[].item` | Breadcrumb URLs from `breadcrumbs-data.html` | Required for emitted rows and host-validated by `scripts/seo/check-schema.js` |

### `VideoObject`

| Property | Current status | Rationale |
|---|---|---|
| `name` | Not emitted | No qualifying on-page video watch template is implemented. |
| `description` | Not emitted | Current video-related pages are article/page content or archive listings, not watch pages. |
| `thumbnailUrl` | Not emitted | Existing pages have hero images and archive thumbnails but no dedicated video schema contract. |
| `uploadDate` | Not emitted | Available page dates are insufficient on their own without a qualifying watch-page experience. |

## Template mapping

| Template family | Structured data behavior |
|---|---|
| `baseof.html` / shared head partials | All schema output is centralized in `src/layouts/partials/seo/` and assembled through `src/layouts/partials/seo/head-meta.html`. |
| Homepage (`/`) | Emits `WebSite` only. Does not emit `BlogPosting`. Breadcrumb schema does not emit because the homepage has no visible breadcrumb trail. |
| Single post detail (`src/layouts/_default/single.html` for `posts`) | Emits `BlogPosting` and `BreadcrumbList` when breadcrumbs render. |
| Single page detail (`src/layouts/_default/single.html` for `pages`) | Emits `BreadcrumbList` when breadcrumbs render. Does not emit `BlogPosting`. |
| List/archive pages (`src/layouts/_default/list.html`) | Emits `BreadcrumbList` when breadcrumbs render. Does not emit `BlogPosting`. |
| Taxonomy and term pages (`src/layouts/_default/taxonomy.html`, `src/layouts/_default/term.html`) | Emits `BreadcrumbList` when breadcrumbs render. Does not emit `BlogPosting`. |
| 404 (`src/layouts/404.html`) | Emits no structured data. |
| Alias helper (`src/layouts/alias.html`) | Emits no structured data. |

## Confirmed scope

- `WebSite`: In scope and implemented.
- `BlogPosting`: In scope and implemented for single post pages.
- `BreadcrumbList`: In scope and implemented where visible hierarchical navigation exists.
- `VideoObject`: Assessed and currently not applicable. The existing corpus contains video-related landing pages and outbound YouTube links, but not a qualifying on-page video watch template with the required metadata to safely emit `VideoObject`.

## Validation coverage

- Automated validator: `npm run check:schema`
- Report artifact: `migration/reports/phase-5-schema-audit.csv`
- Current result on 2026-03-13: `223` built HTML pages scanned, `0` critical failures after suppressing 404 breadcrumb schema emission
