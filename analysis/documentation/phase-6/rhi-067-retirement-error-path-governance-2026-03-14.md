# RHI-067 Retirement And Error Path Governance

## Change summary

RHI-067 now has a Phase 6 retirement-policy gate, an explicit retirement rubric in the shared URL-policy document, and a content-backed `/404/` route that complements the host-served `404.html` artifact without changing the existing GitHub Pages error-document behavior.

## Why this changed

The repository already had part of the retirement foundation in place:

1. `src/layouts/404.html` rendered a basic custom not-found page.
2. `scripts/phase-6/validate-retire-sitemap.js` already proved that merge and retire routes stayed out of the sitemap and that path-based retire routes were not silently published.
3. The SEO partials already emitted `noindex, nofollow` for the root `404.html` artifact.

RHI-067 still lacked the ticket-specific artifacts named in its acceptance criteria:

1. a one-row-per-retire audit report,
2. a dedicated retirement-policy gate,
3. a documented retirement rubric in `migration/phase-6-url-policy.md`,
4. the content-backed `src/content/404.md` route required by the ticket wording.

## Behavior details

Old behavior:

1. Retirement behavior was distributed across `migration/url-map.csv`, the generic retire/sitemap audit, and the shared SEO checks.
2. The root `404.html` artifact already existed, but there was no content-backed `/404/` route and no ticket-specific audit file tying retire outcomes to reviewer notes.
3. Request-aware query-string retire routes were not called out by a dedicated Phase 6 gate even though Model A cannot enforce deterministic query-aware not-found behavior on GitHub Pages.

New behavior:

1. `npm run check:retirement-policy` now:
   - reads every `retire` row from `migration/url-map.csv`,
   - generates `migration/reports/phase-6-retired-url-audit.csv`,
   - fails if any retired route still appears in source aliases, published HTML or asset output, or the sitemap,
   - fails if `public/404.html` is missing,
   - fails if a request-aware retire route still shares a published path component under Model A.
2. `migration/phase-6-url-policy.md` now documents the retirement rubric, the Model A boundary, and the retired URL audit contract.
3. `src/content/404.md` now adds a non-indexable, sitemap-disabled `/404/` route to satisfy the ticket’s content-backed route requirement while keeping `404.html` as the authoritative GitHub Pages error document generated from `src/layouts/404.html`.
4. `src/layouts/404.html` now makes recovery options explicit on-page with homepage, archive, search, and topic links instead of relying only on the global shell navigation.

## Impact

1. Maintainers now have a single Phase 6 command that both generates the retire audit and enforces retirement leakage rules.
2. The retirement policy is explicit about `404` as the default Model A outcome and rejects generic homepage or category redirects for removed content.
3. The custom 404 experience is more explicit about recovery paths while preserving the repo’s centralized SEO partial behavior.
4. The gate also exposes the remaining Model A request-aware limitation instead of silently classifying it as a pass.

## Verification

1. Build a clean production artifact:

```bash
npm run build:prod
```

2. Run the retirement-policy gate:

```bash
npm run check:retirement-policy
```

3. Confirm the command writes `migration/reports/phase-6-retired-url-audit.csv` and review any failures.
4. Confirm `public/404.html` exists and that the root 404 artifact remains `noindex, nofollow` and absent from `public/sitemap.xml`.
5. Manual runtime verification is still required on a deployed Pages environment to confirm that unknown paths render the custom 404 page with a true HTTP `404` response.

Verified on 2026-03-14:

1. The repository now contains `src/content/404.md`, the updated `src/layouts/404.html`, the new `scripts/phase-6/check-retirement-policy.js` gate, and the updated Phase 6 URL policy.
2. `npm run build:prod` completed with `Pages 204`, `Paginator pages 17`, and zero build errors.
3. `npm run check:metadata` passed for `215` indexable pages with `10` warnings, `npm run check:sitemap` passed for `215` sitemap URLs, and `npm run check:crawl-controls` passed for `238` production HTML routes.
4. `npm run check:retirement-policy` generated `migration/reports/phase-6-retired-url-audit.csv` with `885` retire rows.
5. Runtime verification on the preview GitHub Pages host showed:
   - `https://taurgis.github.io/rhino-inquisitor-com/definitely-missing-rhi067/` returns HTTP `404`
   - `https://taurgis.github.io/rhino-inquisitor-com/?s=ocapi` returns HTTP `200`
6. The user accepted `/?s=ocapi` as the sole owner-approved residual Model A limitation for RHI-067, and the retirement-policy gate now records that one route as a documented exception while still failing closed on any other request-aware retire route that shares a published path component.

## Related files

1. `scripts/phase-6/check-retirement-policy.js`
2. `package.json`
3. `migration/phase-6-url-policy.md`
4. `migration/reports/phase-6-retired-url-audit.csv`
5. `src/content/404.md`
6. `src/layouts/404.html`
7. `analysis/tickets/phase-6/RHI-067-retirement-error-path-governance.md`
8. `analysis/tickets/phase-6/INDEX.md`