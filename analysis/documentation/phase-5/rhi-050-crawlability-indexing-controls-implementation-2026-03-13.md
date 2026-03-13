# RHI-050 Crawlability and Indexing Controls Implementation

Date: 2026-03-13
Ticket: `analysis/tickets/phase-5/RHI-050-crawlability-indexing-controls.md`

## Change summary

RHI-050 now has a dedicated crawl-control validation gate for production and preview artifacts, a committed alias helper template that keeps redirect pages `noindex`, and blocking CI coverage for both production crawl safety and preview-host de-indexing.

## Why this changed

Phase 5 Workstream C requires crawlability and index-control errors to be release blockers, not manual checklist items. The repository already had partial coverage through `check:noindex`, `check:metadata`, the shared SEO resolver, and the deploy preview rehearsal step, but it lacked a dedicated Phase 5 audit that combined `robots.txt` parsing, manifest-aware noindex detection, preview-host validation, and contradiction detection in one report.

## Behavior details

### Old behavior

- `src/layouts/partials/seo/resolve.html` emitted `noindex, nofollow` for non-production builds, 404 pages, and explicit `seo.noindex`, but there was no dedicated Phase 5 crawl-control report or contradiction detector.
- `scripts/check-noindex.js` detected unexpected `noindex` in built output, but it did not inspect `robots.txt`, did not scan `meta[name="googlebot"]`, and did not write a Phase 5 per-route CSV.
- Preview validation in `.github/workflows/deploy-pages.yml` only asserted homepage path-prefix correctness plus a homepage `noindex` marker after the preview build.
- Hugo alias helper pages used the embedded template, so preview redirect helpers emitted only canonical plus meta-refresh and did not inherit the explicit `noindex` signal used by the main page templates.
- The ticket text still referred to `src/static/robots.txt` and a preview `Disallow: /` posture, while the repository contract and owner-approved Phase 5 direction use template-generated `robots.txt` and a crawlable preview host with page-level `noindex`.

### New behavior

- `scripts/seo/check-crawl-controls.js` now scans built HTML plus the built `robots.txt` artifact, validates wildcard crawl rules, checks manifest-aware index intent, detects `robots.txt` and `noindex` contradictions, and writes `migration/reports/phase-5-crawl-control-audit.csv`.
- `package.json` now exposes the gate as `npm run check:crawl-controls`.
- `.github/workflows/build-pr.yml` and `.github/workflows/deploy-pages.yml` now run the crawl-control gate as a blocking production step, and both workflows also run preview-mode crawl-control validation after the preview build.
- Preview validation now checks every generated HTML page, not just the homepage, by running the new validator in `preview` mode with the expected preview base URL.
- `src/layouts/alias.html` overrides Hugo’s embedded alias template so redirect helper pages now emit `<meta name="robots" content="noindex, nofollow">` in both production and preview outputs.
- The PR workflow classification logic now keeps migration-batch-only behavior for pure staged-content changes while still forcing the full-site route-sensitive lane for SEO/runtime changes such as `scripts/seo/**`, workflow gating, layout changes, or `package.json` gate updates.

## Impact

- Maintainers now have a dedicated Phase 5 crawl-control report in `migration/reports/phase-5-crawl-control-audit.csv` for audit and sign-off evidence.
- Preview-host rehearsal now validates crawlable `noindex` across the full HTML output, including alias helper pages, instead of relying on homepage-only spot checks.
- Production validation will now fail if an indexable page leaks `noindex`, if `robots.txt` blocks an indexable route, or if a route is simultaneously blocked and marked `noindex`.
- The implementation follows the owner-approved contract to keep the preview host crawlable `noindex` and to keep `src/layouts/robots.txt` as the source of truth for the built `robots.txt` artifact.

## Verification

- `npm run build:prod`
- `npm run check:crawl-controls`
- `npm run check:metadata`
- `npm run check:seo:artifact`
- `npm run check:links`
- `hugo --gc --minify --environment preview --baseURL "https://taurgis.github.io/rhino-inquisitor-com/"`
- `node scripts/seo/check-crawl-controls.js --mode preview --base-url "https://taurgis.github.io/rhino-inquisitor-com/" --report tmp/phase-5-crawl-control-preview-audit.csv`

Observed results on 2026-03-13:

- Production crawl-control audit: zero blocking defects, `migration/reports/phase-5-crawl-control-audit.csv` written
- Preview crawl-control audit: zero blocking defects, `tmp/phase-5-crawl-control-preview-audit.csv` written
- `public/robots.txt` remains crawlable with the expected production or preview sitemap directive per build mode

## Related files

- `scripts/seo/check-crawl-controls.js`
- `src/layouts/alias.html`
- `src/layouts/robots.txt`
- `src/layouts/partials/seo/resolve.html`
- `package.json`
- `.github/workflows/build-pr.yml`
- `.github/workflows/deploy-pages.yml`
- `migration/reports/phase-5-crawl-control-audit.csv`
- `migration/reports/phase-5-metadata-report.csv`
- `analysis/tickets/phase-5/RHI-050-crawlability-indexing-controls.md`

## Assumptions and open questions

- Owner clarification resolved the preview-policy conflict in favor of a crawlable preview host with page-level `noindex`, matching the Phase 5 plan and Google’s crawlability guidance.
- The current live WordPress `robots.txt` entries for `/wp-admin/` and `admin-ajax.php` were reviewed but not copied, because the Hugo site does not serve those paths and the retained Hugo disallows (`/wp-json/`, `/xmlrpc.php`, `/author/`) are the intentional legacy-system carryovers still relevant to the migrated surface.
- The preview audit is generated as a temporary CI and local evidence file rather than a committed migration artifact because the ticket only requires the production Phase 5 audit CSV to persist under `migration/reports/`.
