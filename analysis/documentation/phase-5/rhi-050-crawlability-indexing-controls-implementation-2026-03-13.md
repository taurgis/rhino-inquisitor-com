# RHI-050 Crawlability and Indexing Controls Implementation

Date: 2026-03-13
Ticket: `analysis/tickets/phase-5/RHI-050-crawlability-indexing-controls.md`

## Change summary

RHI-050 now enforces a production-only open-robots policy: only the canonical GitHub Pages production host may emit allow-all `robots.txt`, while preview and staging artifacts must pair `Disallow: /` with page-level `noindex, nofollow`. The crawl-control validator and deploy workflow were updated so this policy is machine-verified.

## Why this changed

Phase 5 Workstream C requires crawlability and index-control errors to be release blockers, not manual checklist items. The repository already had partial coverage through `check:noindex`, `check:metadata`, the shared SEO resolver, and the deploy preview rehearsal step, but the implemented policy drifted away from the Phase 1 staging guardrail and allowed non-production hosts to publish crawlable `robots.txt`. The current owner directive restores production-only allow rules and requires the deploy workflow to fail closed until GitHub Pages reports the canonical production host.

## Behavior details

### Old behavior

- `src/layouts/partials/seo/resolve.html` emitted `noindex, nofollow` for non-production builds, 404 pages, and explicit `seo.noindex`, but there was no dedicated Phase 5 crawl-control report or contradiction detector.
- `scripts/check-noindex.js` detected unexpected `noindex` in built output, but it did not inspect `robots.txt`, did not scan `meta[name="googlebot"]`, and did not write a Phase 5 per-route CSV.
- Preview validation in `.github/workflows/deploy-pages.yml` only asserted homepage path-prefix correctness plus a homepage `noindex` marker after the preview build.
- Hugo alias helper pages used the embedded template, so preview redirect helpers emitted only canonical plus meta-refresh and did not inherit the explicit `noindex` signal used by the main page templates.
- The ticket text and validator logic had been updated to a crawlable-preview posture, even though the earlier staging guardrail contract kept `Disallow: /` as the non-production backstop.

### New behavior

- `scripts/seo/check-crawl-controls.js` now treats preview mode as blocked-by-default: preview and staging artifacts must publish `Disallow: /` at the site root and still emit `noindex, nofollow` on HTML pages.
- `package.json` now exposes the gate as `npm run check:crawl-controls`.
- `.github/workflows/build-pr.yml` and `.github/workflows/deploy-pages.yml` run the crawl-control gate as a blocking production step, and both workflows also run preview-mode crawl-control validation after the preview build.
- `.github/workflows/deploy-pages.yml` now fails before the production build if `actions/configure-pages` does not report the canonical GitHub Pages host `www.rhino-inquisitor.com`, preventing an allow-all `robots.txt` deploy on the wrong Pages host.
- Preview validation checks every generated HTML page, not just the homepage, by running the validator in `preview` mode with the expected preview base URL.
- `src/layouts/alias.html` overrides Hugo’s embedded alias template so redirect helper pages now emit `<meta name="robots" content="noindex, nofollow">` in both production and preview outputs.
- The PR workflow classification logic now keeps migration-batch-only behavior for pure staged-content changes while still forcing the full-site route-sensitive lane for SEO/runtime changes such as `scripts/seo/**`, workflow gating, layout changes, or `package.json` gate updates.

## Impact

- Maintainers now have a dedicated Phase 5 crawl-control report in `migration/reports/phase-5-crawl-control-audit.csv` for audit and sign-off evidence.
- Preview-host rehearsal now validates blocked-by-default `robots.txt` plus page-level `noindex, nofollow` across the full HTML output, including alias helper pages.
- Production validation will now fail if an indexable page leaks `noindex`, if `robots.txt` blocks an indexable route, or if GitHub Pages is not configured for the canonical production host before deployment.
- The implementation now follows the owner-directed contract to keep `src/layouts/robots.txt` as the source of truth, block non-production hosts with `Disallow: /`, and allow crawling only on the canonical production Pages host.

## Verification

- `npm run build:prod`
- `npm run check:crawl-controls`
- `npm run check:metadata`
- `npm run check:seo:artifact`
- `npm run check:links`
- `hugo --gc --minify --environment preview --baseURL "https://taurgis.github.io/rhino-inquisitor-com/"`
- `node scripts/seo/check-crawl-controls.js --mode preview --base-url "https://taurgis.github.io/rhino-inquisitor-com/" --report tmp/phase-5-crawl-control-preview-audit.csv`
- review `.github/workflows/deploy-pages.yml` host guard against `actions/configure-pages` output `host`

Observed results on 2026-03-13:

- Production crawl-control audit: zero blocking defects, `migration/reports/phase-5-crawl-control-audit.csv` written
- Preview crawl-control audit: zero blocking defects, `tmp/phase-5-crawl-control-preview-audit.csv` written
- production `public/robots.txt` remains allow-all only when built for the canonical production host
- preview `public/robots.txt` blocks the site root and still carries the expected preview sitemap directive

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

- Owner clarification in the 2026-03-15 implementation task resolved the preview-policy conflict in favor of production-only allow rules. Preview and staging hosts now use both `Disallow: /` and page-level `noindex, nofollow` as dual guardrails.
- The current live WordPress `robots.txt` entries for `/wp-admin/` and `admin-ajax.php` were reviewed but not copied, because the Hugo site does not serve those paths and the retained Hugo disallows (`/wp-json/`, `/xmlrpc.php`, `/author/`) are the intentional legacy-system carryovers still relevant to the migrated surface.
- The preview audit is generated as a temporary CI and local evidence file rather than a committed migration artifact because the ticket only requires the production Phase 5 audit CSV to persist under `migration/reports/`.
