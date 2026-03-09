# UI Implementation Checklist - Hugo Templates and Partials

Date: 2026-03-08  
Scope: Implementation-ready checklist mapped to proposed Hugo templates and partials.

## Scope and traceability

- Wireframe source: [analysis/design/low-fi-wireframes-2026-03-08.md](analysis/design/low-fi-wireframes-2026-03-08.md)
- Wireframe IDs in scope: WF-HOME-D, WF-HOME-M, WF-ARCH-D, WF-ARCH-M, WF-ART-D, WF-ART-M
- Annotation keys in scope: NAV-01, HERO-01, DISC-01, DISC-02, DISC-03, PROJ-01, ARCH-01, ARCH-02, ART-01, ART-02, ART-03

## Hugo lookup contract (implementation guardrails)

- Use `src/layouts/_default/single.html` for regular content pages unless front matter sets explicit `type` or `layout`.
- Use `src/layouts/_default/list.html` for list pages unless front matter or section routing overrides it.
- Ensure base template composition rules are valid: content templates should use define blocks to participate in `baseof.html` composition.
- Use partials for shared UI modules and pass explicit context (prefer dict when passing multiple values).
- If using partial caching, define and document cache keys per module to avoid stale or cross-page leakage.

## Template and partial map (proposed)

| UI area | Hugo template or partial (proposed path) | Primary responsibilities |
|---------|------------------------------------------|--------------------------|
| Global layout | src/layouts/_default/baseof.html | Base HTML shell, global slots, shared assets |
| Homepage | src/layouts/index.html | Homepage hero and discovery lanes |
| Archive / blog index | src/layouts/_default/list.html | Search, filters, and card listing |
| Article | src/layouts/_default/single.html | Article header, body, TOC, related content |
| Header | src/layouts/partials/site/header.html | Logo, primary nav, search entry |
| Footer | src/layouts/partials/site/footer.html | Global footer links and metadata |
| SEO head | src/layouts/partials/seo/head-meta.html | Canonical, meta title, description |
| Open Graph | src/layouts/partials/seo/open-graph.html | Social metadata tags |
| Article JSON-LD | src/layouts/partials/seo/json-ld-article.html | Structured data for articles |
| Card | src/layouts/partials/cards/article-card.html | Reusable cards for lists |
| Article meta row | src/layouts/partials/article/meta-row.html | Date, read time, topic, updated |
| TOC | src/layouts/partials/article/toc.html | Table of contents render |
| Related content | src/layouts/partials/article/related.html | Next and related modules |
| Search bar | src/layouts/partials/search/search-bar.html | Search input and scope hint |
| Filter bar | src/layouts/partials/archive/filter-bar.html | Topic, type, sort, and year controls |

## Traceability map

| Wireframe ID | Annotation keys | Primary template/partials |
|-------------|------------------|---------------------------|
| WF-HOME-D, WF-HOME-M | NAV-01, HERO-01, DISC-01, DISC-02, DISC-03, PROJ-01 | `src/layouts/index.html`, `src/layouts/partials/site/header.html`, `src/layouts/partials/cards/article-card.html` |
| WF-ARCH-D, WF-ARCH-M | NAV-01, ARCH-01, ARCH-02 | `src/layouts/_default/list.html`, `src/layouts/partials/search/search-bar.html`, `src/layouts/partials/archive/filter-bar.html` |
| WF-ART-D, WF-ART-M | NAV-01, ART-01, ART-02, ART-03 | `src/layouts/_default/single.html`, `src/layouts/partials/article/meta-row.html`, `src/layouts/partials/article/toc.html`, `src/layouts/partials/article/related.html` |

## Global layout checklist (base, header, footer)

- [ ] CL-001 Base layout defines primary slots for head, header, main, and footer. (WF-HOME-*, WF-ARCH-*, WF-ART-*)
- [ ] CL-002 Header includes logo, primary nav, and search entry in desktop layout. (NAV-01)
- [ ] CL-003 Header collapses to menu + search on mobile. (NAV-01)
- [ ] CL-004 Footer includes global navigation, contact, and legal links. (WF-HOME-*, WF-ARCH-*, WF-ART-*)
- [ ] CL-005 All primary actions remain visible above the fold on desktop and mobile. (WF-HOME-*)

## Homepage checklist (hero + discovery lanes)

- [ ] CL-010 Hero contains short intro copy and two CTAs: Start Reading and Browse Topics. (HERO-01)
- [ ] CL-011 Discovery lanes include Featured long-form, Recent posts, and Topic hubs. (DISC-01/02/03)
- [ ] CL-012 Featured card includes title, short excerpt, and metadata row. (DISC-01)
- [ ] CL-013 Recent posts show 3-5 cards with consistent metadata row. (DISC-02)
- [ ] CL-014 Topic hubs show topic name plus visible count or freshness hint. (DISC-03)
- [ ] CL-015 Project rail is compact and does not compete with primary discovery lanes. (PROJ-01)
- [ ] CL-016 Mobile layout stacks lanes in order: Featured, Recent, Topics, Projects. (WF-HOME-M)


## Archive checklist (search + filters + listing)

- [ ] CL-020 Archive header includes title and one-line description. (WF-ARCH-*)
- [ ] CL-021 Search bar defaults to blog scope and shows scope in placeholder text. (ARCH-01)
- [ ] CL-022 Filters include topic, type, and year; sort control is visible. (ARCH-01)
- [ ] CL-023 Filter rail is left on desktop and collapses to chip row on mobile. (WF-ARCH-D/M)
- [ ] CL-024 Cards show title, metadata row, and one-sentence excerpt. (ARCH-02)
- [ ] CL-025 Pagination is visible with Prev/Next and current page index. (WF-ARCH-*)
- [ ] CL-026 Jump-to-year control appears on desktop and mobile. (WF-ARCH-*)

## Article checklist (readability + navigation)

- [ ] CL-030 Article header includes title, metadata row, and summary box. (ART-01)
- [ ] CL-031 Summary box is visible on desktop and collapsible on mobile. (WF-ART-D/M)
- [ ] CL-032 TOC is sticky on desktop and collapsible on mobile. (ART-02)
- [ ] CL-033 Body rhythm includes spacing between sections and consistent heading scale. (WF-ART-*)
- [ ] CL-034 Callout styles exist for warnings, tips, and key takeaways. (WF-ART-*)
- [ ] CL-035 Related content includes three buckets: Next in topic, Adjacent, Foundation. (ART-03)
- [ ] CL-036 Footer actions include Back to topic hub and Next article. (WF-ART-*)

## Shared component checklist (cards, metadata, related)

- [ ] CL-040 Card component supports image, title, excerpt, and metadata row.
- [ ] CL-041 Metadata row displays date, read time, primary topic, and updated date when present.
- [ ] CL-042 TOC uses heading levels from article content without manual duplication.
- [ ] CL-043 Related content accepts explicit list plus fallback when fewer than 3 items.
- [ ] CL-044 Search and filter controls announce state changes visually and in text.

## Data and metadata requirements

- [ ] CL-050 Each article has title, publish date, description, and primary topic.
- [ ] CL-051 Reading time is available via Hugo built-in or explicit front matter field.
- [ ] CL-052 Updated date shows only when lastmod is newer than publish date.
- [ ] CL-053 Categories and tags exist for archive filtering.


## Responsive behavior checks

- [ ] CL-060 All pages render as single-column below mobile breakpoints.
- [ ] CL-061 TOC and filter rails collapse to toggles on mobile.
- [ ] CL-062 Tap targets meet minimum size and spacing expectations.

## Accessibility and usability checks

- [ ] CL-070 Page heading structure is logical and sequential.
- [ ] CL-071 Interactive controls have visible focus state and keyboard access.
- [ ] CL-072 Color contrast meets WCAG AA for primary text and links.

## Implementation notes

- Proposed template and partial paths may be adjusted to match existing conventions.
- If front matter uses `type` or `layout`, align template paths with Hugo lookup rules.
- The checklist is designed to be used in parallel with the low-fidelity wireframes.
