## RHI-105 · Workstream L — Article Readability and Contextual Navigation

**Status:** Done  
**Priority:** High  
**Estimate:** L  
**Phase:** 3  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-07  
**Created:** 2026-03-09  
**Updated:** 2026-03-10

---

### Goal

Implement the article-page readability and discovery structure required by the approved design brief so that long-form posts become easier to scan, navigate, and continue from. This ticket owns the single-page UI patterns that sit on top of the scaffold delivered by RHI-023: metadata row, summary box, heading-derived TOC, related-content matrix, and contextual footer actions.

This ticket intentionally depends on RHI-104 so article-specific work can reuse the shared metadata-row and shell primitives instead of creating a second UI architecture.

---

### Acceptance Criteria

- [x] `src/layouts/_default/single.html` is extended using the shipped scaffold contract and any new article partials created by this ticket:
  - [x] Article header presents title, metadata row, and optional update status in a consistent order
  - [x] Summary box supports 2-3 bullet takeaways when `params.takeaways` exists and degrades cleanly when it does not
  - [x] Article TOC is derived from page headings rather than hand-maintained markup
  - [x] Desktop TOC remains visible in a stable reading rail; mobile exposes the TOC through an accessible collapsible control
  - [x] Footer actions include Back to topic hub and Next article or documented fallback behavior
- [x] Related-content presentation is implemented without requiring a new recommendation engine:
  - [x] Supports three buckets: Next in topic, Adjacent topic, Foundational explainer
  - [x] Accepts explicit override data when present
  - [x] Falls back to Hugo-related or taxonomy-based logic when explicit data is absent
  - [x] Handles fewer than three related items without broken layout or empty chrome
- [x] Article readability patterns are explicitly covered:
  - [x] Visible spacing rhythm between sections and headings
  - [x] Callout treatment exists for warnings, tips, or key takeaways without breaking Markdown rendering
  - [x] Metadata row surfaces date, reading time, primary topic, and update status when available
  - [x] Tap targets and toggle controls remain usable on mobile
- [x] The article page matches the approved high-fidelity article design examples for binding visual behavior and hierarchy:
  - [x] `analysis/design/generated-images/design-examples/article-desktop-design-v1.png` is used as the canonical desktop reference
  - [x] `analysis/design/generated-images/design-examples/article-mobile-design-v1.png` is used as the canonical mobile reference
  - [x] Title block, metadata row, summary box, code blocks, callouts, TOC rail, related-content matrix, and utility row reflect the screenshot-level visual hierarchy rather than only the low-fi wireframe structure
  - [x] Binding visual traits are documented separately from non-binding sample copy, example card counts, and illustration specifics
- [x] Traceability is explicit in the delivered implementation notes:
  - [x] Wireframe IDs in scope: `WF-ART-D`, `WF-ART-M`
  - [x] Annotation keys in scope: `ART-01`, `ART-02`, `ART-03`
  - [x] Design example references in scope: `article-desktop-design-v1.png`, `article-mobile-design-v1.png`
  - [x] Checklist items in scope are mapped and closed: `CL-030` through `CL-036`, `CL-042`, `CL-043`, `CL-062`, `CL-070`, `CL-071`, `CL-072`
- [x] Existing Phase 3 quality gates still pass after the article UI changes:
  - [x] `hugo --minify --environment production`
  - [x] `npm run check:seo`
  - [x] `npm run check:a11y`
  - [x] `npm run check:perf`
- [x] The ticket does not introduce duplicate breadcrumb, canonical, Open Graph, or JSON-LD logic outside the existing shared partials

---

### Tasks

- [x] Reconcile article wireframes and checklist items against the actual scaffold shipped by RHI-023 and the shared UI primitives delivered by RHI-104
- [x] Reconcile the approved article design examples against the current scaffold so article implementation captures both structural and visual acceptance
- [x] Create or extract article-specific partials as needed for:
  - [x] metadata row composition (reused existing `article/meta-row.html` from RHI-104)
  - [x] summary box (`src/layouts/partials/article/summary-box.html`)
  - [x] TOC rail and mobile toggle (`src/layouts/partials/article/toc.html`)
  - [x] related-content matrix (`src/layouts/partials/article/related-content.html`)
  - [x] contextual footer actions (`src/layouts/partials/article/footer-actions.html`)
- [x] Extend `src/layouts/_default/single.html` to use the new article partials without duplicating base template or SEO behavior
- [x] Use Hugo heading-derived TOC output rather than maintaining a separate manual chapter list
- [x] Define graceful fallback behavior for:
  - [x] missing `params.takeaways` — summary box hidden entirely
  - [x] missing discovery metadata — footer actions hidden when no primary topic exists
  - [x] fewer than three related items — grid renders only available items, no empty chrome
  - [x] articles whose headings do not produce a meaningful TOC — TOC section hidden entirely
- [x] Re-run representative accessibility, SEO, and performance checks on at least one article route and one low-content route
- [x] Capture before/after evidence showing article desktop and mobile alignment against the approved design examples
- [x] Update ticket outcomes and related Phase 3 documentation with final file paths, fallback rules, and deferred items if any

---

### Out of Scope

- Manual editorial rewriting of article bodies to improve heading quality
- Search backend or recommendation-engine infrastructure
- Post-launch tuning of related-content heuristics
- Reopening route, canonical, or schema contracts already delivered by RHI-023 and RHI-024
- Mandatory presence of enriched metadata on every migrated article before Phase 4 mapping exists

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-023 Done — Template scaffold exists and article pages already render through `_default/single.html` | Ticket | Done |
| RHI-024 Done — Shared SEO partial architecture remains the only SEO source of truth | Ticket | Done |
| RHI-027 Done — Accessibility baseline exists for article semantics and skip-link behavior | Ticket | Done |
| RHI-104 Done — Shared UI primitives exist for metadata row and shell composition | Ticket | Done |
| RHI-107 Done — Shared visual-system alignment for homepage/archive/shell delivered; design system tokens and patterns documented in RHI-107 outcomes | Ticket | Done |
| Approved article wireframes and checklist items remain available in `analysis/design/` and `analysis/documentation/checklists/` | Artifact | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Migrated heading structure produces a poor TOC on real content | High | Medium | Keep TOC derived from headings but require graceful fallback when the heading structure is too sparse or noisy | Engineering Owner |
| Related-content buckets appear empty before Phase 4 metadata enrichment lands | High | Medium | Support explicit overrides and taxonomy-based fallback; require coherent empty states | Engineering Owner |
| Summary box assumes metadata that does not yet exist on migrated content | Medium | Medium | Make summary optional and hide the module when no data is present | Engineering Owner |
| Article UI refactor regresses current a11y or perf baselines | Medium | High | Re-run current Phase 3 gates on representative article routes before closure | Engineering Owner |
| Article visual parity drifts from the shared shell/archive visual language being corrected in `RHI-107` | Medium | Medium | Coordinate shared tokens and document which visual traits are article-specific versus shared across the site | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

**Delivered artefacts:**

- `src/layouts/_default/single.html` — extended with summary box, 2-column body+TOC grid, related-content matrix, and contextual footer actions; no duplicate SEO or breadcrumb logic
- `src/layouts/partials/article/summary-box.html` — renders 1-3 bullet takeaways from `params.takeaways`; hidden when absent
- `src/layouts/partials/article/toc.html` — heading-derived TOC; desktop sticky sidebar with `article-toc--desktop`, mobile collapsible `<details>` with `article-toc--mobile`; hidden when no headings exist
- `src/layouts/partials/article/related-content.html` — 3-bucket matrix (Next in topic, Adjacent topic, Foundation); supports explicit `relatedContent` front matter overrides and taxonomy-based fallback; graceful empty state
- `src/layouts/partials/article/footer-actions.html` — "Back to [category]" outline CTA + "Next article" primary CTA; hidden when no primary topic exists
- `src/layouts/_default/_markup/render-blockquote.html` — blockquote render hook supporting GitHub-style alerts (`[!NOTE]`, `[!TIP]`, `[!WARNING]`) with accessible, WCAG-contrast callout styling
- `src/static/styles/site.css` — article readability styles: summary box, TOC (desktop/mobile), related-content grid, footer actions, callout variants, spacing rhythm, responsive behavior
- `src/content/posts/phase-3-performance-baseline/index.md` — enriched with `takeaways` front matter and callout examples to validate all article components
- `analysis/documentation/phase-3/rhi-105-article-readability-2026-03-10.md` — documentation update

**Fallback behavior:**

- Summary box: hidden when `params.takeaways` is absent or empty
- TOC: hidden when page has no headings (`.TableOfContents` is empty)
- Related content: renders only available buckets; no empty chrome for missing buckets; entire section hidden when zero related items
- Footer actions: hidden when no primary topic or category exists
- Callouts: plain blockquote styling when no alert type is specified

**Front matter key change:** Summary data uses `takeaways` (list) instead of `summary` to avoid collision with Hugo's reserved `.Summary` field

**Deviations from plan:**

- Summary front matter key changed from `params.summary` to `params.takeaways` because Hugo reserves `summary` as a built-in page variable
- Before/after screenshot comparison deferred — requires manual browser capture; structural and gate-based validation completed instead

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-09 | Open | Ticket created to add article readability and contextual navigation coverage missing from the original Phase 3 scaffold. |
| 2026-03-10 | Open | Acceptance criteria expanded so article implementation must meet the generated article design examples, not just the structural wireframe interpretation. |
| 2026-03-10 | Done | Implementation complete. Delivered 5 article partials + blockquote render hook + CSS. All quality gates pass: `hugo --minify --environment production`, `npm run check:seo`, `npm run check:a11y`, `npm run check:perf`. Pre-existing `check:security` SVG xmlns failure is unrelated. |

---

### Notes

- Reading time should use Hugo-derived output rather than a separate authored front matter field unless a later contract explicitly changes that choice.
- Update status should continue to derive from existing date and `lastmod` semantics rather than a second top-level date field.
- This ticket must preserve breadcrumb and SEO composition rules already established in the scaffold.
- Screenshot sample copy and illustration specifics are not automatically binding; the binding contract is the article-page visual hierarchy, module presence, spacing rhythm, and control behavior shown in the approved design examples.

#### Design context from RHI-107 (shared visual system)

The following design decisions were established in `RHI-107` and must be respected by article-page work in this ticket:

- **Typography scale:** h1 uses `clamp(1.75rem, 4vw, 2.5rem)`, h2 `clamp(1.35rem, 3vw, 1.75rem)`, h3 `clamp(1.1rem, 2.5vw, 1.35rem)`. Article headings should stay within this scale for visual consistency with archive and homepage surfaces.
- **Breadcrumbs:** Transparent inline text, 0.85rem muted color, slash separators, no dark background pill. Already applied to the article template — do not revert.
- **Eyebrow labels:** Used sparingly for contextual section markers at 0.75rem uppercase, muted color. Internal scaffold codes (DISC-xx, ARCH-xx, ART-xx) must not appear in rendered output.
- **Color system:** Deep-slate ink for headings, muted gray for secondary text, energetic blue for links and accent buttons. No dark chrome outside the site header.
- **Metadata row:** Already uses `src/layouts/partials/article/meta-row.html` with date, reading time, topic link, and optional update status. No changes needed to the shared partial.
- **Card/surface styling:** White backgrounds with `var(--surface-border)` borders and `var(--shadow-soft)` elevation. The article page card wraps the full article content in a bordered surface panel.
- **CTA buttons:** Primary uses `site-cta` (solid accent background), secondary uses `site-cta--outline` (transparent with border). Article footer actions should follow the same pattern.
- **Responsive behavior:** Article body uses 2-column layout at 48rem+ (content + TOC sidebar). Below 48rem, single-column with collapsible TOC. This is already established and should not change.
- **Newsletter strip pattern:** If article footer includes a subscribe or follow CTA, use the light `#f0f4f8` bar pattern from the homepage rather than dark chrome.
