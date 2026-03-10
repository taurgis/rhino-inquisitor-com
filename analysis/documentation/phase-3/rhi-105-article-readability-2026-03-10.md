# RHI-105 · Article Readability and Contextual Navigation

**Date:** 2026-03-10
**Ticket:** `analysis/tickets/phase-3/RHI-105-article-readability-contextual-navigation.md`

## Change Summary

Extended the Phase 3 article template with readability components: summary box, heading-derived TOC (desktop sidebar + mobile collapsible), blockquote-based callouts, related-content matrix, and contextual footer actions. All components degrade gracefully when data is absent.

## Delivered Files

| File | Purpose |
|------|---------|
| `src/layouts/_default/single.html` | Extended to compose article partials: summary → body+TOC grid → related content → footer actions |
| `src/layouts/partials/article/summary-box.html` | Renders 1-3 bullet takeaways from `params.takeaways` front matter; hidden when absent |
| `src/layouts/partials/article/toc.html` | Heading-derived TOC; sticky desktop sidebar (`article-toc--desktop`), collapsible `<details>` on mobile (`article-toc--mobile`); hidden when page has no headings |
| `src/layouts/partials/article/related-content.html` | 3-bucket related-content matrix (Next in topic, Adjacent topic, Foundation); supports explicit `relatedContent` front matter overrides and taxonomy-based fallback |
| `src/layouts/partials/article/footer-actions.html` | "Back to [category]" outline CTA + "Next article" primary CTA; hidden when no primary topic exists |
| `src/layouts/_default/_markup/render-blockquote.html` | Blockquote render hook supporting GitHub-style alerts (`[!NOTE]`, `[!TIP]`, `[!WARNING]`) with accessible callout styling |
| `src/static/styles/site.css` | Article readability styles for all new components |
| `src/content/posts/phase-3-performance-baseline/index.md` | Enriched with `takeaways` and callout examples |

## Behavior Details

### New vs previous behavior

| Component | Before (RHI-023 scaffold) | After (RHI-105) |
|-----------|--------------------------|-----------------|
| Summary box | Not present | Renders key takeaways list when `takeaways` front matter exists |
| TOC | Not present | Desktop: sticky sidebar rail in 2-column grid; Mobile: collapsible `<details>` |
| Callouts | Plain blockquotes only | `[!NOTE]`, `[!TIP]`, `[!WARNING]` render as styled callout boxes with labels |
| Related content | Not present | 3-bucket matrix with taxonomy-based fallback and explicit override support |
| Footer actions | Not present | Category hub link + next article navigation |

### Front matter key: `takeaways` not `summary`

Hugo reserves `summary` as a built-in page variable. Article takeaways use `takeaways` (a list of strings) to avoid this collision.

```yaml
takeaways:
  - "First key point"
  - "Second key point"
  - "Third key point (max 3 shown)"
```

### Fallback rules

| Missing data | Fallback behavior |
|-------------|-------------------|
| No `params.takeaways` | Summary box hidden entirely |
| No page headings | TOC section hidden entirely |
| No primary topic or categories | Footer actions hidden |
| Fewer than 3 related-content buckets populated | Only populated buckets rendered; no empty chrome |
| Zero related items total | Related-content section hidden |
| No alert type on blockquote | Plain blockquote styling (no label) |

### Related-content override format

```yaml
relatedContent:
  nextInTopic:
    - "/posts/some-article/"
  adjacentTopic:
    - "/posts/another-article/"
  foundational:
    - "/posts/basics-article/"
```

## Design Traceability

| Reference | ID |
|-----------|-----|
| Wireframes | `WF-ART-D`, `WF-ART-M` |
| Annotations | `ART-01`, `ART-02`, `ART-03` |
| Design examples | `article-desktop-design-v1.png`, `article-mobile-design-v1.png` |
| Checklist items | `CL-030`–`CL-036`, `CL-042`, `CL-043`, `CL-062`, `CL-070`–`CL-072` |

## Impact and Verification

- **Impacted routes:** All single-page article routes (`/posts/*`, `/phase-3-performance-baseline/`, `/scaffold-readiness/`, etc.)
- **No impact:** Archive pages, homepage, taxonomy pages, RSS, sitemap
- **No duplicate SEO logic:** All canonical, Open Graph, JSON-LD, and breadcrumb rendering remains in existing shared partials

### Quality gates passed

| Gate | Result |
|------|--------|
| `hugo --minify --environment production` | Pass |
| `npm run check:seo` | Pass |
| `npm run check:a11y` | Pass (4 pre-existing contrast warnings on header/footer copy unrelated to article changes) |
| `npm run check:perf` | Pass |
| `npm run check:security` | Pre-existing SVG xmlns failure only (unrelated) |

## Related Files

- `analysis/tickets/phase-3/RHI-105-article-readability-contextual-navigation.md`
- `analysis/documentation/checklists/ui-implementation-checklist-2026-03-08.md`
- `analysis/design/generated-images/design-examples/article-desktop-design-v1.png`
- `analysis/design/generated-images/design-examples/article-mobile-design-v1.png`
- `analysis/design/low-fi-wireframes-2026-03-08.md`
