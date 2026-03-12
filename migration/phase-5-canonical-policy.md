# Phase 5 Canonical Policy

Date: 2026-03-12
Owner: SEO Owner
Related ticket: `analysis/tickets/phase-5/RHI-048-metadata-canonical-architecture.md`

## Default canonical rule

- Every indexable page emits exactly one self-referencing canonical URL.
- The canonical URL must be absolute HTTPS and must use `https://www.rhino-inquisitor.com/`.
- The canonical URL must match the rendered page URL, including retained paginated archive routes such as `/posts/page/N/`.
- Canonical and `og:url` must resolve to the same final URL.

## Permitted canonical override conditions

- Canonical overrides are exceptional and require explicit SEO owner approval before merge.
- A canonical override is allowed only when the page must intentionally consolidate to another same-host canonical URL for an approved cross-canonical case.
- Override values must remain absolute HTTPS URLs on `https://www.rhino-inquisitor.com/`.
- Overrides are not allowed on paginated archive pages, alias redirect helpers, preview-host builds, or 404 pages.

## Canonical conflict resolution procedure

1. Treat more than one canonical tag on a page as a blocking defect.
2. Treat any canonical pointing to `http`, apex host, preview host, redirected URL, or retired URL as a blocking defect.
3. When a template-level canonical disagrees with the rendered page URL, fix the shared SEO partials first instead of adding per-page overrides.
4. When an override is approved, record the rationale in the owning ticket or implementation note and verify the destination is final, indexable, and same-host.
5. For non-indexable error or redirect surfaces, do not reuse a live indexable canonical URL.

## Canonical-to-sitemap consistency requirement

- Every indexable canonical URL must appear in `public/sitemap.xml` exactly as the final preferred URL.
- `sitemap.xml`, `rel=canonical`, and internal links must agree on scheme, host, path, and trailing-slash form.
- Redirect-helper pages, preview-host pages, draft pages, and the 404 page must not appear in the production sitemap.
- Metadata validation is a blocking gate: `npm run check:metadata` must pass before deploy.
