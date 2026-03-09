# UI Implementation Checklist - Hugo Templates and Partials

Date: 2026-03-08  
Scope: Implementation-ready checklist mapped to the shipped Phase 3 scaffold paths and the follow-on design-traceability tickets.

## Scope and traceability

- Wireframe source: [analysis/design/low-fi-wireframes-2026-03-08.md](analysis/design/low-fi-wireframes-2026-03-08.md)
- Wireframe IDs in scope: WF-HOME-D, WF-HOME-M, WF-ARCH-D, WF-ARCH-M, WF-ART-D, WF-ART-M
- Annotation keys in scope: NAV-01, HERO-01, DISC-01, DISC-02, DISC-03, PROJ-01, ARCH-01, ARCH-02, ART-01, ART-02, ART-03

## Ticket ownership

- `RHI-104` owns the global shell, homepage discovery, archive/category listing, and shared UI primitives.
- `RHI-105` owns article readability, TOC behavior, related-content presentation, and contextual footer actions.
- `RHI-106` owns the optional discovery/readability metadata extension under `params`; it does not replace the existing front matter baseline.
- Accessibility checks `CL-070` through `CL-072` are shared verification gates for both `RHI-104` and `RHI-105`.

## Hugo lookup contract (implementation guardrails)

- Use `src/layouts/home.html` for the homepage kind in this repo.
- Use `src/layouts/_default/single.html` for regular content pages unless front matter sets explicit `type` or `layout`.
- Use `src/layouts/_default/list.html` as the shared list fallback, with `src/layouts/_default/taxonomy.html` and `src/layouts/_default/term.html` as dedicated category archive views where behavior diverges.
- Ensure base template composition rules are valid: content templates should use define blocks to participate in `baseof.html` composition.
- Use partials for shared UI modules and pass explicit context (prefer dict when passing multiple values).
- Treat `.TableOfContents` as heading-derived output from article content; custom TOC presentation must preserve heading-fragment linking.
- If using partial caching, define and document cache keys per module to avoid stale or cross-page leakage.

## Template and partial map

| UI area | Shipped scaffold anchor(s) | Ticket-owned target path(s) | Primary responsibilities |
|---------|---------------------------|-----------------------------|--------------------------|
| Global layout | `src/layouts/_default/baseof.html` | `RHI-104`: `src/layouts/partials/site/header.html`, `src/layouts/partials/site/footer.html` | Base HTML shell, global slots, extracted shell components |
| Homepage | `src/layouts/home.html` | `RHI-104`: homepage discovery composition on the shipped home template | Homepage hero and discovery lanes |
| Archive / blog index | `src/layouts/_default/list.html` | `RHI-104`: search/filter shell extraction as needed | Search shell, filters, and card listing |
| Category archives | `src/layouts/_default/taxonomy.html`, `src/layouts/_default/term.html` | `RHI-104`: category archive and term-page discovery structure | Category landing and category term browsing |
| Article | `src/layouts/_default/single.html`, `src/layouts/partials/breadcrumbs.html` | `RHI-105`: `src/layouts/partials/article/` | Article header, body, TOC, related content |
| Shared listing primitives | `src/layouts/partials/content-list.html`, `src/layouts/partials/pagination.html` | `RHI-104`: reusable listing/card extraction as needed | Reusable list rendering and pagination |
| SEO head | `src/layouts/partials/seo/head-meta.html` | Shipped scaffold prerequisite | Canonical, meta title, description |
| Open Graph | `src/layouts/partials/seo/open-graph.html` | Shipped scaffold prerequisite | Social metadata tags |
| Article JSON-LD | `src/layouts/partials/seo/json-ld-article.html` | Shipped scaffold prerequisite | Structured data for articles |
| Card | `src/layouts/partials/content-list.html` | `RHI-104`: `src/layouts/partials/cards/article-card.html` | Reusable cards for list-like surfaces |
| Article meta row | `src/layouts/_default/single.html` | `RHI-104`/`RHI-105`: `src/layouts/partials/article/meta-row.html` | Date, reading time, primary topic, updated state |
| TOC | `src/layouts/_default/single.html` | `RHI-105`: `src/layouts/partials/article/toc.html` | Table of contents render |
| Related content | `src/layouts/_default/single.html` | `RHI-105`: `src/layouts/partials/article/related.html` | Next and related modules |
| Search and filter shell | `src/layouts/_default/list.html`, `taxonomy.html`, `term.html` | `RHI-104`: `src/layouts/partials/search/search-bar.html`, `src/layouts/partials/archive/filter-bar.html` | Search input and filter/sort presentation |

## Traceability map

| Wireframe ID | Annotation keys | Primary template/partials | Owner |
|-------------|------------------|---------------------------|-------|
| WF-HOME-D, WF-HOME-M | NAV-01, HERO-01, DISC-01, DISC-02, DISC-03, PROJ-01 | `src/layouts/home.html`, `src/layouts/_default/baseof.html`, shared site/card partial targets under `src/layouts/partials/` | `RHI-104` |
| WF-ARCH-D, WF-ARCH-M | NAV-01, ARCH-01, ARCH-02 | `src/layouts/_default/list.html`, `src/layouts/_default/taxonomy.html`, `src/layouts/_default/term.html`, search/filter partial targets under `src/layouts/partials/` | `RHI-104` |
| WF-ART-D, WF-ART-M | NAV-01, ART-01, ART-02, ART-03 | `src/layouts/_default/single.html`, `src/layouts/partials/breadcrumbs.html`, article partial targets under `src/layouts/partials/article/` | `RHI-105` |

## Global layout checklist (base, header, footer)

Owner: `RHI-104`

- [ ] CL-001 Base layout defines primary slots for head, header, main, and footer. (WF-HOME-*, WF-ARCH-*, WF-ART-*)
- [ ] CL-002 Header includes logo, primary nav, and search entry in desktop layout. (NAV-01)
- [ ] CL-003 Header collapses to menu + search on mobile. (NAV-01)
- [ ] CL-004 Footer includes global navigation, contact, and legal links. (WF-HOME-*, WF-ARCH-*, WF-ART-*)
- [ ] CL-005 All primary actions remain visible above the fold on desktop and mobile. (WF-HOME-*)

## Homepage checklist (hero + discovery lanes)

Owner: `RHI-104`

- [ ] CL-010 Hero contains short intro copy and two CTAs: Start Reading and Browse Topics. (HERO-01)
- [ ] CL-011 Discovery lanes include Featured long-form, Recent posts, and Topic hubs. (DISC-01/02/03)
- [ ] CL-012 Featured card includes title, short excerpt, and metadata row. (DISC-01)
- [ ] CL-013 Recent posts show 3-5 cards with consistent metadata row. (DISC-02)
- [ ] CL-014 Topic hubs show topic name plus visible count or freshness hint. (DISC-03)
- [ ] CL-015 Project rail is compact and does not compete with primary discovery lanes, or is explicitly omitted with rationale when no stable data source exists. (PROJ-01)
- [ ] CL-016 Mobile layout stacks lanes in order: Featured, Recent, Topics, then optional Projects. (WF-HOME-M)


## Archive checklist (search + filters + listing)

Owner: `RHI-104`

- [ ] CL-020 Archive header includes title and one-line description. (WF-ARCH-*)
- [ ] CL-021 Search bar defaults to blog scope, shows scope in placeholder text, and can be delivered as a crawl-safe UI shell without a search backend. (ARCH-01)
- [ ] CL-022 Filters include topic, type, and year; sort control is visible; no JavaScript-only discovery requirement is introduced. (ARCH-01)
- [ ] CL-023 Filter rail is left on desktop and collapses to an accessible toggle or chip row on mobile. (WF-ARCH-D/M)
- [ ] CL-024 Cards show title, metadata row, and one-sentence excerpt. (ARCH-02)
- [ ] CL-025 Pagination is visible with Prev/Next and current page index. (WF-ARCH-*)
- [ ] CL-026 Jump-to-year control appears on desktop and mobile. (WF-ARCH-*)

## Article checklist (readability + navigation)

Owner: `RHI-105`

- [ ] CL-030 Article header includes title, metadata row, and summary box. (ART-01)
- [ ] CL-031 Summary box is visible on desktop and collapsible on mobile. (WF-ART-D/M)
- [ ] CL-032 TOC is heading-derived, sticky on desktop, and collapsible on mobile. (ART-02)
- [ ] CL-033 Body rhythm includes spacing between sections and consistent heading scale. (WF-ART-*)
- [ ] CL-034 Callout styles exist for warnings, tips, and key takeaways. (WF-ART-*)
- [ ] CL-035 Related content includes three buckets: Next in topic, Adjacent, Foundation. (ART-03)
- [ ] CL-036 Footer actions include Back to topic hub and Next article. (WF-ART-*)

## Shared component checklist (cards, metadata, related)

- [ ] CL-040 (`RHI-104`) Card component supports image, title, excerpt, and metadata row.
- [ ] CL-041 (`RHI-104` with `RHI-105` reuse) Metadata row displays date, read time, primary topic, and updated date when present.
- [ ] CL-042 (`RHI-105`) TOC uses heading levels from article content without manual duplication.
- [ ] CL-043 (`RHI-105`) Related content accepts explicit list plus fallback when fewer than 3 items.
- [ ] CL-044 (`RHI-104`) Search and filter controls announce state changes visually and in text.

## Data and metadata requirements

Owner: existing front matter baseline plus `RHI-106` for optional discovery/readability enrichment

- [ ] CL-050 Each article has title, publish date, and description; `primaryTopic` is available when discovery metadata enrichment is present.
- [ ] CL-051 Reading time is available via Hugo built-in output; explicit authored override requires later approval.
- [ ] CL-052 Updated date shows only when lastmod is newer than publish date.
- [ ] CL-053 Categories are the required public archive/filter surface; tags may remain metadata but are not a required public Phase 3 archive surface.


## Responsive behavior checks

Primary owner: `RHI-104`; `RHI-105` reuses the same mobile behavior baseline for article controls

- [ ] CL-060 All pages render as single-column below mobile breakpoints.
- [ ] CL-061 TOC and filter rails collapse to toggles on mobile.
- [ ] CL-062 Tap targets meet minimum size and spacing expectations.

## Accessibility and usability checks

Shared verification gates for `RHI-104` and `RHI-105`

- [ ] CL-070 Page heading structure is logical and sequential.
- [ ] CL-071 Interactive controls have visible focus state and keyboard access.
- [ ] CL-072 Color contrast meets WCAG AA for primary text and links.

## Implementation notes

- Shipped scaffold anchors take precedence over earlier proposed component paths; extracted partial targets should be confirmed by the owning ticket when implementation closes.
- If front matter uses `type` or `layout`, align template paths with Hugo lookup rules.
- `RHI-104` owns global shell, homepage, archive/category listing, and shared discovery primitives.
- `RHI-105` owns article readability, TOC, related-content, and contextual navigation patterns.
- `RHI-106` owns additive discovery/readability metadata under `params`; it does not replace the Phase 2 top-level front matter contract.
- The checklist is designed to be used in parallel with the low-fidelity wireframes.
