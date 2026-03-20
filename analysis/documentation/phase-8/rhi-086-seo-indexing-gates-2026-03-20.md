# RHI-086 SEO and Indexing Readiness Gates

## Change Summary

RHI-086 adds two new Phase 8 SEO validation gates for the built Hugo artifact: `check:seo-consistency` and `check:robots-sitemap`. The change replaces the WS-C placeholder JSON reports, wires the new gates into the existing blocking deployment gate flow, archives the resulting Phase 8 SEO reports as 30-day CI artifacts, and distinguishes frozen-RC evidence from later branch-state reruns through explicit report provenance metadata.

## Why This Changed

Before this change, the repository had Phase 5 and Phase 7 SEO checks plus placeholder Phase 8 report files, but no RC-scoped WS-C evidence layer tied to the frozen validation datasets. Maintainers could inspect metadata and sitemap outputs manually, yet they did not have a committed machine-readable report that enforced canonical alignment, unexpected `noindex`, duplicate-title defects, sitemap protocol limits, or `robots.txt` conflicts before the Pages artifact upload.

## Behavior Details

### Previous Behavior

- `validation/seo-consistency-report.json` and `validation/robots-sitemap-report.json` were bootstrap placeholders only.
- The repo had no `scripts/phase-8/check-seo-consistency.js` or `scripts/phase-8/check-robots-sitemap.js` commands.
- `scripts/phase-7/run-all-gates.sh` did not execute a dedicated Phase 8 SEO/indexing gate after WS-B.
- `.github/workflows/deploy-pages.yml` did not archive WS-C outputs with the required 30-day retention.
- Duplicate non-pagination titles could slip through unless another report happened to expose them indirectly.

### New Behavior

- `scripts/phase-8/check-seo-consistency.js` validates sampled indexable routes from `validation/sample-matrix.json` plus HTML-backed priority-route targets from `validation/priority-routes.json`.
- The SEO consistency gate enforces exactly one canonical tag, absolute HTTPS `www` canonical URLs, self-canonical alignment, sitemap inclusion, and the absence of unexpected `noindex` on sampled indexable pages.
- The same gate performs a full-build duplicate-title scan and treats non-pagination duplicate titles as blocking, while allowing paginated duplicates only when every page is self-canonical.
- Metadata presence is blocking; title and description length guidance is warning-only by owner decision recorded during implementation.
- `scripts/phase-8/check-robots-sitemap.js` validates sitemap URL formatting, sitemap file limits, `<lastmod>` formatting, alias-helper exclusion, `robots.txt` `Sitemap:` directives, and `Disallow` conflicts against sitemap URLs.
- `scripts/phase-7/run-all-gates.sh` now runs both WS-C commands as blocking production-artifact gates before the older Phase 5/6 SEO checks continue.
- `.github/workflows/deploy-pages.yml` now uploads `validation/seo-consistency-report.json` and `validation/robots-sitemap-report.json` as a dedicated Phase 8 SEO artifact bundle with `retention-days: 30`.
- Both WS-C reports now include `artifactProvenance` so reviewers can see whether the report was produced from the exact frozen RC artifact or from a later branch-state rerun that still consumes the frozen datasets.
- The standalone `/video/` page title was updated from `Video` to `Video Appearances` to resolve a real duplicate-title conflict with `/category/video/` that the new gate surfaced.

## Impact

- WS-C now has committed machine-readable launch-readiness evidence instead of placeholder artifacts.
- Maintainers can run `npm run check:seo-consistency` and `npm run check:robots-sitemap` locally against the production build path and receive the same report structure that CI archives.
- The deploy workflow now blocks on canonical drift, unexpected `noindex`, sitemap protocol violations, or `robots.txt` conflicts before uploading the Pages artifact.
- The `/video/` page now has a distinct title from the video taxonomy archive, reducing duplicate-title ambiguity for crawlers and users.
- The branch-state rerun after the `/video/` title correction now passes locally. The owner accepted that rerun as sufficient final closeout evidence for RHI-086, so this ticket does not require a `phase-8-rc-v2` recut even though the report provenance correctly remains `branch-state` rather than `frozen-rc`.
- Google Search Console verification continuity was completed manually and confirmed by the owner on 2026-03-20. Official Google Search Central guidance still applies: those states are established in Search Console and live URL inspection, not from a local build artifact alone.

## Verification

Verification completed for this change:

1. Built the site with `hugo --cleanDestinationDir --gc --minify --environment production`.
2. Ran `npm run check:seo-consistency` and confirmed `validation/seo-consistency-report.json` passed with `60` checked routes, `1` skipped system route, `0` blocking failures, and `28` advisory warnings.
3. Ran `npm run check:robots-sitemap` and confirmed `validation/robots-sitemap-report.json` passed with `212` sitemap URLs, `21` alias helpers excluded from the sitemap, `23` built `noindex` pages tracked, and `0` blocking failures.
4. Spot-checked the rebuilt `/video/` artifact and confirmed the rendered title is now `Video Appearances | Rhino Inquisitor`, the canonical remains `https://www.rhino-inquisitor.com/video/`, and sitemap membership is unchanged.
5. Confirmed the regenerated WS-C reports mark their provenance as branch-state evidence rather than claiming an exact frozen-RC artifact match when the workspace differs from the frozen dataset RC.
6. Confirmed `package.json`, `scripts/phase-7/run-all-gates.sh`, and `.github/workflows/deploy-pages.yml` now wire the new WS-C commands and archive the JSON outputs.

Manual verification and closeout status:

1. Search Console property verification continuity for `www.rhino-inquisitor.com` and `rhino-inquisitor.com` was confirmed manually by the owner on 2026-03-20.
2. The owner accepted the current branch-state rerun as the final closeout evidence for this ticket, so a true refreshed RC cut and rerun after the `/video/` title correction is not required for RHI-086.

## Related Files

- `scripts/phase-8/seo-gate-helpers.js`
- `scripts/phase-8/check-seo-consistency.js`
- `scripts/phase-8/check-robots-sitemap.js`
- `scripts/phase-7/run-all-gates.sh`
- `.github/workflows/deploy-pages.yml`
- `package.json`
- `src/content/pages/video/index.md`
- `validation/README.md`
- `validation/report-schema/README.md`
- `validation/seo-consistency-report.json`
- `validation/robots-sitemap-report.json`
- `migration/phase-8-rc-record.md`
- `analysis/tickets/phase-8/RHI-086-seo-indexing-readiness-gates.md`

## Assumptions and Open Questions

- Owner clarification was required during implementation and resolved as follows: duplicate titles remain blocking except for self-canonical pagination, and metadata length guidance remains warning-only while metadata presence remains blocking.
- Manual Search Console evidence is resolved by owner confirmation, and the owner also accepted the current branch-state rerun as sufficient final closeout evidence for this ticket. The report provenance model remains important for future work: any later task that needs fresh RC-scoped evidence must still create a new RC tag and regenerate datasets per `migration/phase-8-rc-record.md`.