# RHI-087 Structured Data and Social Preview Gates

## Change Summary

RHI-087 adds two new Phase 8 validation gates for the built Hugo artifact: `check:structured-data` and `check:social-preview`. The change replaces the WS-D placeholder JSON reports, wires both checks into the existing blocking deployment gate flow, archives the resulting WS-D reports as 30-day CI artifacts, and commits the completed Rich Results evidence set under `validation/rich-results-test-evidence/`.

## Why This Changed

Before this change, the repository had Phase 5 schema and metadata audits plus placeholder WS-D report files, but no RC-scoped machine-readable evidence that representative template families emit valid JSON-LD, correct Open Graph and Twitter metadata, or resolvable social preview images. That left rich-result eligibility and share-preview quality dependent on ad hoc manual inspection instead of repeatable gates tied to the Phase 8 sample matrix and priority-route datasets.

## Behavior Details

### Previous Behavior

- `validation/structured-data-report.json` and `validation/social-preview-report.json` were bootstrap placeholders only.
- The repo had no `scripts/phase-8/check-structured-data.js` or `scripts/phase-8/check-social-preview.js` commands.
- `scripts/phase-7/run-all-gates.sh` did not execute a dedicated Phase 8 structured-data or social-preview gate after WS-C.
- `.github/workflows/deploy-pages.yml` did not archive WS-D outputs with the required 30-day retention.
- Manual Rich Results validation targets were defined only in ticket prose, not surfaced in a generated report or evidence directory.

### New Behavior

- `scripts/phase-8/check-structured-data.js` validates every `validation/sample-matrix.json` page sample for required schema families, required properties, ISO 8601 date values, canonical-host URL fields, breadcrumb correctness, and image resolvability.
- The structured-data gate treats missing homepage/article schema, invalid JSON-LD, wrong-family schema leakage, raw HTML fragments inside JSON-LD values, and broken same-host image references as blocking failures.
- `scripts/phase-8/check-social-preview.js` validates sample-matrix routes plus HTML-backed priority-route targets from `validation/priority-routes.json` for `og:*` and `twitter:*` tag presence, title/description parity, canonical-host `og:url`, correct `og:type`, and social image resolvability from the built artifact.
- The social-preview gate treats missing required tags or unresolved image URLs as blocking failures, while keeping image-dimension checks warning-only.
- `scripts/phase-7/run-all-gates.sh` now runs both WS-D commands as blocking production-artifact gates after the Phase 8 WS-C checks and before the older Phase 5/6 SEO checks continue.
- `.github/workflows/deploy-pages.yml` now uploads `validation/structured-data-report.json` and `validation/social-preview-report.json` as a dedicated Phase 8 WS-D artifact bundle with `retention-days: 30`.
- Both WS-D reports include `artifactProvenance` so reviewers can distinguish frozen-RC evidence from later branch-state reruns that still consume the frozen datasets.
- `validation/rich-results-test-evidence/README.md` now records the final owner-approved manual validation path: Google Rich Results Test code mode run against a fresh local production build, plus the retained screenshot of the staging live-URL rejection for audit context.

## Impact

- WS-D now has committed machine-readable launch-readiness evidence instead of placeholder artifacts.
- Maintainers can run `npm run check:structured-data` and `npm run check:social-preview` locally against the production build path and receive the same report structure that CI archives.
- The deploy workflow now blocks on broken JSON-LD, missing required schema, wrong `og:type`, missing social tags, or unresolved preview-image URLs before uploading the Pages artifact.
- The local gate runner now validates WS-D inside the full blocking sequence; on 2026-03-20 the complete `npm run gates:local` chain passed with both new WS-D checks included.
- WS-D closeout is now complete: automated reports pass, blocking CI wiring is in place, and representative Google validation evidence is committed.

## Verification

Verification completed for this change:

1. Built the site with `hugo --cleanDestinationDir --gc --minify --environment production`.
2. Ran `npm run check:structured-data` and confirmed `validation/structured-data-report.json` passed with `27` checked routes, `46` parsed JSON-LD blocks, `0` invalid JSON blocks, `26` routes with `BreadcrumbList`, `7` routes with `VideoObject`, and `0` blocking failures.
3. Ran `npm run check:social-preview` and confirmed `validation/social-preview-report.json` passed with `60` checked routes, `1` skipped system route, `49` unique social-image URLs, `0` unresolved image URLs, `0` blocking failures, and `21` advisory warnings (`20` for below-recommendation image dimensions).
4. Ran `npm run gates:local` and confirmed the full blocking gate chain passed with the new WS-D steps wired into the production validation sequence.
5. Built a clean production artifact with `hugo --cleanDestinationDir --gc --minify --environment production --destination tmp/rich-results-prod-public` and served it locally for manual Google validation.
6. Ran Google Rich Results Test in code mode against the production HTML for the representative homepage, top 2 recent posts, first category sample, and first video-capable sample. Results: homepage `No items detected` with no critical errors; post 1 `2 valid items` (`Articles`, `Breadcrumbs`); post 2 `2 valid items` (`Articles`, `Breadcrumbs`); category `1 valid item` (`Breadcrumbs`); video page `2 valid items` (`Videos`, `Breadcrumbs`). Screenshots are stored in `validation/rich-results-test-evidence/`.
7. Retained the staging live-URL screenshot showing `URL is not available to Google` at `validation/rich-results-test-evidence/staging-homepage-url-unavailable.png` for historical traceability.

## Related Files

- `scripts/phase-8/check-structured-data.js`
- `scripts/phase-8/check-social-preview.js`
- `scripts/phase-7/run-all-gates.sh`
- `.github/workflows/deploy-pages.yml`
- `package.json`
- `validation/README.md`
- `validation/structured-data-report.json`
- `validation/social-preview-report.json`
- `validation/rich-results-test-evidence/README.md`
- `validation/rich-results-test-evidence/homepage-code-mode.png`
- `validation/rich-results-test-evidence/recent-post-1-code-mode.png`
- `validation/rich-results-test-evidence/recent-post-2-code-mode.png`
- `validation/rich-results-test-evidence/category-ai-code-mode.png`
- `validation/rich-results-test-evidence/video-page-code-mode.png`
- `validation/rich-results-test-evidence/staging-homepage-url-unavailable.png`
- `analysis/tickets/phase-8/RHI-087-structured-data-social-preview-gates.md`

## Assumptions and Open Questions

- Owner clarification was required and resolved: because staging is intentionally blocked from indexing, Google Rich Results code mode against a clean local production build is the accepted manual evidence path for this ticket.
- No open questions remain for RHI-087 closeout.