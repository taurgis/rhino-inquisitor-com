# RHI-023 Template Scaffolding - 2026-03-09

## Change Summary

Implemented the Phase 3 template scaffold under `src/layouts/` and reconciled the ticket with the approved Phase 2 route and SEO contracts. The scaffold now provides an explicit home template, shared SEO partials, shared breadcrumb logic, fallback single/list/taxonomy/term templates, and the validation-driven `hugo.toml` correction required for Hugo 0.157 to honor the intended `/category/...` taxonomy routes.

## Why This Changed

Before this change, the repo had no home or taxonomy layout and no shared SEO template layer. That left the Phase 3 build in a warning state and would have forced later workstreams to add SEO, metadata, and JSON-LD behavior directly in leaf templates. Centralizing the scaffold now prevents metadata drift before Phase 4 content import begins.

## Behavior Details

### Previous Behavior

- `src/layouts/` only contained `robots.txt`.
- `hugo --minify --environment production` completed, but warned that `home` and `taxonomy` layouts were missing.
- No shared template structure existed for canonical tags, Open Graph tags, Twitter compatibility tags, or JSON-LD output.
- The draft RHI-023 ticket still reflected an older file naming scheme that conflicted with the approved RHI-014 SEO partial contract and the RHI-013 route contract.

### New Behavior

- `src/layouts/_default/baseof.html` now defines the shared page shell and named blocks.
- `src/layouts/home.html` explicitly handles the homepage; `_default/list.html`, `_default/taxonomy.html`, and `_default/term.html` cover list kinds without build warnings.
- SEO output is centralized in `src/layouts/partials/seo/` using contract-aligned partials:
  - `head-meta.html`
  - `open-graph.html`
  - `json-ld-article.html`
  - `json-ld-site.html`
  - `json-ld-breadcrumb.html`
- Metadata resolution is centralized in `src/layouts/partials/seo/resolve.html`, so title, description, canonical, robots, and image logic are shared across head, OG, and schema output.
- HTML breadcrumbs and breadcrumb JSON-LD use the same crumb data source.
- The scaffold keeps category as the only public taxonomy and treats `/video/` as a preserved page route rendered by the standard page/single template chain.
- Validation uncovered that Hugo 0.157 only applies the taxonomy permalink overrides when the keys under `[permalinks.taxonomy]` and `[permalinks.term]` match the taxonomy name (`categories`). `hugo.toml` was corrected accordingly so the scaffold now renders `/category/` and `/category/{slug}/` instead of Hugo's default `/categories/...` fallback.

## Impact and Verification

### Impact

- Maintainers now have a stable template foundation for Phase 3 and Phase 4 work.
- RHI-024 can build on the SEO scaffold instead of inventing a parallel metadata layer.
- The repo no longer relies on implicit missing-layout fallbacks for the home and taxonomy kinds.
- Future page types inherit a consistent canonical/meta/schema baseline from one place.

### Verification

- Ran `hugo --minify --environment production` before the change to capture the baseline warnings.
- Ran `hugo --minify --environment production` after the scaffold was added and confirmed exit code 0 with no missing `home` or `taxonomy` warnings.
- Created temporary sample fixtures for one post, one page, and the preserved `/video/` page route, inspected generated HTML for canonical, description, and JSON-LD output, then removed the fixtures.
- Confirmed the scaffold still builds cleanly after fixture cleanup.
- A full URL parity rerun could not be executed in this task because the expected RHI-025 tooling is not in the repo yet: `scripts/check-url-parity.js` and `migration/url-parity-report.json` are both still absent.

## Related Files

- `src/layouts/_default/baseof.html`
- `src/layouts/home.html`
- `src/layouts/_default/single.html`
- `src/layouts/_default/list.html`
- `src/layouts/_default/taxonomy.html`
- `src/layouts/_default/term.html`
- `src/layouts/partials/seo/resolve.html`
- `src/layouts/partials/seo/head-meta.html`
- `src/layouts/partials/seo/open-graph.html`
- `src/layouts/partials/seo/json-ld-article.html`
- `src/layouts/partials/seo/json-ld-site.html`
- `src/layouts/partials/seo/json-ld-breadcrumb.html`
- `src/layouts/partials/breadcrumbs-data.html`
- `src/layouts/partials/breadcrumbs.html`
- `src/layouts/partials/pagination.html`
- `hugo.toml`
- `analysis/tickets/phase-3/RHI-023-template-scaffolding.md`
- `tickets/phase-3/INDEX.md`

## Assumptions and Open Questions

- `/video/` remains a preserved page route without a dedicated layout override. If a future ticket introduces an explicit `layout` or `type` override for `/video/`, a specialized template may be added then.
- Alias-helper noindex handling is intentionally left for RHI-024 because the current scaffold does not emit alias pages yet.