# RHI-104 Discovery Surfaces and Shared UI Components - 2026-03-09

## Change summary

Implemented the Phase 3 shared discovery surfaces on the shipped Hugo scaffold by extracting reusable site chrome and metadata/card partials, rebuilding the homepage around discovery lanes, and refactoring the archive/category surfaces into metadata-first, crawl-safe browse views.

## Why this changed

Before this change, Phase 3 had the route and SEO scaffold from RHI-023 and RHI-024, but the homepage and list surfaces still behaved like placeholders. The approved design brief, low-fi wireframes, and UI checklist had explicit expectations for shared header/footer chrome, homepage discovery lanes, archive controls, and taxonomy browsing, yet those expectations were not executable in the live scaffold.

## Behavior details

### Previous behavior

- `src/layouts/_default/baseof.html` owned inline header/footer markup and ad hoc CSS.
- `src/layouts/home.html` only exposed a simple title, a recent-post list, and a category count list.
- `src/layouts/_default/list.html` and `src/layouts/_default/term.html` delegated to a minimal `content-list.html` partial with no search shell, filter shell, metadata row, or year jump.
- `src/layouts/_default/taxonomy.html` rendered a basic unordered list of terms.
- No dedicated partials existed for site header, site footer, article cards, metadata rows, or empty-state handling.

### New behavior

- `src/layouts/_default/baseof.html` now delegates visible site chrome to `src/layouts/partials/site/header.html` and `src/layouts/partials/site/footer.html`, while keeping the skip link, landmarks, and SEO partial ownership intact.
- A shared stylesheet at `src/static/styles/site.css` now defines the Phase 3 layout system, responsive archive rail behavior, visible focus states, and the higher-contrast surfaces needed to pass `npm run check:a11y`.
- Shared list primitives now exist and are reused across home, list, taxonomy, term, and single surfaces:
  - `src/layouts/partials/cards/article-card.html`
  - `src/layouts/partials/article/meta-row.html`
  - `src/layouts/partials/empty-state.html`
  - `src/layouts/partials/archive/topic-hubs.html`
- `src/layouts/home.html` now implements:
  - HERO-01: hero intro with `Start Reading` and `Browse Topics` CTAs
  - DISC-01: featured long-form lane
  - DISC-02: recent-post lane with stable empty-state behavior
  - DISC-03: topic hub lane with counts and freshness hints rendered server-side
  - PROJ-01: project rail intentionally omitted because no stable project data source exists in `src/data/`
- `src/layouts/_default/list.html`, `src/layouts/_default/taxonomy.html`, and `src/layouts/_default/term.html` now expose:
  - archive header and descriptor copy
  - a crawl-safe search shell
  - topic/type/year filter shells with desktop left rail and mobile disclosure
  - metadata-first article cards
  - visible pagination compatibility through the existing paginator partial
  - jump-to-year controls built from grouped archive years
- Minimal scaffolded `About` and `Privacy Policy` pages were added under `src/content/pages/` so the header/footer can expose real about/contact/legal destinations without inventing off-repo URLs.

## Traceability

### Wireframes and annotation keys

- `WF-HOME-D`, `WF-HOME-M`: implemented through `src/layouts/home.html`, `src/layouts/partials/site/header.html`, `src/layouts/partials/site/footer.html`, `src/layouts/partials/cards/article-card.html`, and `src/layouts/partials/archive/topic-hubs.html`
- `WF-ARCH-D`, `WF-ARCH-M`: implemented through `src/layouts/_default/list.html`, `src/layouts/_default/taxonomy.html`, `src/layouts/_default/term.html`, `src/layouts/partials/search/search-bar.html`, `src/layouts/partials/archive/filter-bar.html`, `src/layouts/partials/archive/filter-groups.html`, `src/layouts/partials/archive/year-jump.html`, and `src/layouts/partials/content-list.html`
- `NAV-01`: site header/footer extraction and responsive navigation shell
- `HERO-01`: homepage hero and dual CTA
- `DISC-01`, `DISC-02`, `DISC-03`: featured, recent, and topic-hub lanes on the homepage
- `PROJ-01`: documented omission because no stable project rail data source exists yet
- `ARCH-01`, `ARCH-02`: archive search/filter shell and metadata-first card listing

### Checklist coverage

- `CL-001` through `CL-005`: closed by the extracted site shell, responsive navigation, footer destination links, and above-the-fold CTA visibility
- `CL-010` through `CL-016`: closed by the homepage hero, featured/recent/topic lanes, topic counts/freshness, and documented project rail omission
- `CL-020` through `CL-026`: closed by archive descriptors, search/filter shell, responsive rail behavior, metadata-first cards, pagination, and jump-to-year controls
- `CL-040`, `CL-041`, `CL-044`: closed by the shared article-card, metadata-row, and archive/search control patterns
- `CL-060`, `CL-061`: closed by the mobile single-column collapse and disclosure-based archive controls
- `CL-070`, `CL-071`, `CL-072`: closed by the final heading structure, focus-visible styling, and contrast corrections verified through the accessibility gate

## Impact

- **Maintainers:** can now build Phase 3 UI work on reusable, route-aligned partials instead of editing one-off home/list markup.
- **Content migration workflow:** migrated posts and taxonomy terms now land into intentional browse surfaces instead of placeholder lists.
- **Quality gates:** the new UI ships without reopening SEO logic outside `src/layouts/partials/seo/` and continues to pass the Phase 3 Hugo, SEO, accessibility, and performance checks.

## Verification

Verified with:

1. `hugo --minify --environment production`
2. `npm run check:seo`
3. `npm run check:a11y`
4. `npm run check:perf`
5. Manual browser smoke checks for `/`, `/posts/`, `/category/`, `/category/platform/`, `/about/`, and `/privacy-policy/`

## Related files

- `src/layouts/_default/baseof.html`
- `src/layouts/home.html`
- `src/layouts/_default/list.html`
- `src/layouts/_default/taxonomy.html`
- `src/layouts/_default/term.html`
- `src/layouts/_default/single.html`
- `src/layouts/partials/site/header.html`
- `src/layouts/partials/site/footer.html`
- `src/layouts/partials/cards/article-card.html`
- `src/layouts/partials/article/meta-row.html`
- `src/layouts/partials/empty-state.html`
- `src/layouts/partials/content-list.html`
- `src/layouts/partials/search/search-bar.html`
- `src/layouts/partials/archive/filter-bar.html`
- `src/layouts/partials/archive/filter-groups.html`
- `src/layouts/partials/archive/year-jump.html`
- `src/layouts/partials/archive/topic-hubs.html`
- `src/static/styles/site.css`
- `src/content/pages/about/index.md`
- `src/content/pages/privacy-policy/index.md`
- `src/content/pages/scaffold-readiness/index.md`
- `analysis/tickets/phase-3/RHI-104-discovery-surfaces-shared-ui-components.md`

## Deferred or omitted items

- The optional project rail (`PROJ-01`) is intentionally omitted in this implementation because `src/data/` does not yet contain a stable project dataset. The homepage summary and ticket outcome now document that omission explicitly.