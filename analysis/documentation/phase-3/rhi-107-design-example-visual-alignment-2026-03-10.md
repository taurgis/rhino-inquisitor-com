# RHI-107 Design Example Visual Alignment - 2026-03-10

## Change summary

Implemented the screenshot-driven visual alignment pass for the Phase 3 homepage, archive, taxonomy, and shared shell surfaces by replacing the earlier warm placeholder styling with a deep-slate and blue editorial system, tightening the homepage discovery modules, and restyling archive controls and cards without changing routing or SEO ownership.

## Why this changed

`RHI-104` delivered the structural discovery surfaces and shared primitives, but it intentionally stopped short of the higher-fidelity visual contract shown in the generated design examples. The live scaffold was structurally correct yet still looked like an intermediate scaffold instead of the intended editorial product. `RHI-107` closes that gap while preserving the no-JavaScript discovery model and the centralized SEO implementation already established in Phase 3.

## Behavior details

### Previous behavior

- Shared shell styling used a warm, placeholder-oriented palette and a lighter masthead treatment that did not match the approved design examples.
- Homepage hero and supporting modules exposed the right structure from `RHI-104`, but the hierarchy, typography scale, card treatment, and supporting-module density did not resemble the screenshot contract.
- Archive and taxonomy surfaces kept the correct server-rendered controls and cards, but the filter rail, search row, jump-to-year controls, and metadata cards still read as utilitarian scaffold UI rather than the approved editorial system.

### New behavior

- `src/static/styles/site.css` now defines a shared editorial visual system with:
  - deep-slate shell chrome
  - higher-contrast serif display headings and clean sans body copy
  - restrained white support panels and archive surfaces
  - blue-driven action hierarchy and card rhythm aligned with the design examples
- `src/layouts/partials/site/header.html` now renders a darker editorial masthead with a stronger search affordance, clearer CTA hierarchy, and term-aware Topics navigation state.
- `src/layouts/home.html` now implements screenshot-aligned visual behavior on top of the existing `RHI-104` structure:
  - larger editorial hero headline and stronger supporting-copy hierarchy
  - a complementary visual companion panel with metrics and summary copy
  - image-first featured content presentation
  - a compact supporting-module strip with RSS/newsletter-style follow action and explicit project-rail omission status
- `src/layouts/partials/cards/article-card.html` now places media before the body so featured and archive cards scan like the approved design examples.
- `src/layouts/partials/archive/filter-bar.html` and the shared stylesheet now present archive controls as a denser left rail with a clearer control introduction, compact mobile disclosure, and consistent treatment across `/posts/`, `/category/`, and `/category/platform/`.
- `src/layouts/partials/site/footer.html` now uses real About and Privacy destinations while matching the calmer shared shell styling.

## Traceability

### Screenshot-to-template ownership

- `analysis/design/generated-images/design-examples/homepage-desktop-design-v1.png`
  - `src/layouts/home.html`
  - `src/layouts/partials/cards/article-card.html`
  - `src/layouts/partials/site/header.html`
  - `src/layouts/partials/site/footer.html`
  - `src/static/styles/site.css`
- `analysis/design/generated-images/design-examples/homepage-mobile-design-v1.png`
  - `src/layouts/home.html`
  - `src/layouts/partials/site/header.html`
  - `src/static/styles/site.css`
- `analysis/design/generated-images/design-examples/archive-desktop-design-v1.png`
  - `src/layouts/_default/list.html`
  - `src/layouts/_default/taxonomy.html`
  - `src/layouts/_default/term.html`
  - `src/layouts/partials/archive/filter-bar.html`
  - `src/layouts/partials/archive/filter-groups.html`
  - `src/layouts/partials/archive/year-jump.html`
  - `src/layouts/partials/content-list.html`
  - `src/layouts/partials/cards/article-card.html`
  - `src/static/styles/site.css`
- `analysis/design/generated-images/design-examples/archive-mobile-design-v1.png`
  - `src/layouts/_default/list.html`
  - `src/layouts/_default/taxonomy.html`
  - `src/layouts/_default/term.html`
  - `src/layouts/partials/archive/filter-bar.html`
  - `src/static/styles/site.css`

### Binding traits vs illustrative details

Binding visual traits applied in this ticket:

- dark editorial shell chrome for header and breadcrumbs
- high-contrast serif display treatment for hero and archive titles
- image-first featured/archive cards with restrained white support surfaces
- compact left-rail archive controls with visible mobile disclosure
- blue action hierarchy instead of the earlier warm scaffold palette

Illustrative details treated as non-binding:

- exact sample copy lengths and phrasing in the generated screenshots
- sample counts, editorial labels, and placeholder project/newsletter content
- decorative imagery not backed by a stable repository data source

### Cross-reference to RHI-104

`RHI-107` reuses the structural ownership already closed in `RHI-104` rather than reinterpreting it:

- `NAV-01`, `HERO-01`, `DISC-01`, `DISC-02`, `DISC-03`, `ARCH-01`, and `ARCH-02` stay structurally owned by `RHI-104`
- this ticket only upgrades their visual contract and screenshot parity
- the project rail remains intentionally omitted for the same reason documented in `RHI-104`: `src/data/` still has no stable project dataset

## Evidence and verification notes

- Generated design examples were reviewed from `analysis/design/generated-images/design-examples/` and used as the canonical visual reference for this pass.
- Manual route checks were performed for `/`, `/posts/`, `/category/`, `/category/platform/`, and `/phase-3-performance-baseline/` in the integrated browser after the final build.
- Browser-session screenshot evidence was captured for homepage and archive routes during the implementation session to confirm the final shell, hero, and archive-control treatment against the design examples.

## Impact

- **Readers:** now get a scaffold that feels editorial and intentionally designed instead of visually provisional.
- **Maintainers:** can continue extending homepage, archive, and taxonomy surfaces through shared partials and tokens rather than one-off template overrides.
- **Phase 3 safety:** URL, metadata, JSON-LD, robots, and no-JavaScript archive behavior remain unchanged.

## Verification

Verified with:

1. `hugo --minify --environment production`
2. `npm run check:seo`
3. `npm run check:a11y`
4. `npm run check:perf`
5. Manual browser checks for `/`, `/posts/`, `/category/`, `/category/platform/`, and `/phase-3-performance-baseline/`

## Related files

- `src/layouts/home.html`
- `src/layouts/partials/site/header.html`
- `src/layouts/partials/site/footer.html`
- `src/layouts/partials/cards/article-card.html`
- `src/layouts/partials/archive/filter-bar.html`
- `src/static/styles/site.css`
- `analysis/tickets/phase-3/RHI-107-design-example-visual-alignment.md`

## Deferred or omitted items

- The project rail remains intentionally omitted because `src/data/` is still empty; this ticket documents the omission instead of inventing placeholder project data.
- Article-page screenshot parity remains owned by `RHI-105`; this ticket only verified that the shared visual-system changes did not regress the representative article scaffold.