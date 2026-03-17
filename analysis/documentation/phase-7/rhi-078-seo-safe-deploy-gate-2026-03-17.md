# RHI-078 — SEO-Safe Deploy Gate

**Date:** 2026-03-17  
**Phase:** 7  
**Ticket:** RHI-078  
**Status:** In Progress  
**Author:** SEO Owner

---

## Change summary

Added a dedicated Phase 7 host-safety checker at `scripts/phase-7/check-seo-safe-deploy.js`, wired it into the GitHub Pages deploy workflow, and normalized same-site absolute Markdown links so preview, staging, and production builds emit host-correct internal links.

## Why this changed

RHI-078 needed a staging-first anti-regression gate that checks more than canonical tags alone. Before this change, the repo had strong production-oriented SEO gates, but no single Phase 7 checker focused on the blocked staging host contract. It also still allowed same-site Markdown links hard-coded to `https://www.rhino-inquisitor.com/`, which leaked the production host into staging HTML and feed output.

## Behavior details

### Before

- No dedicated `check:seo-safe-deploy` script existed.
- `.github/workflows/deploy-pages.yml` did not run a staging host-safety gate after the preview or staging rehearsal build.
- Same-site absolute Markdown links stayed on `https://www.rhino-inquisitor.com/` regardless of the active build host.
- RHI-078 documentation still mixed production-host, preview-host, and staging-host expectations.

### After

- `scripts/phase-7/check-seo-safe-deploy.js` validates canonical tags, `og:url`, JSON-LD URLs, sitemap `<loc>` values, feed links, `robots.txt`, and internal absolute links against an expected host and crawl mode.
- `package.json` exposes the new gate as `npm run check:seo-safe-deploy`.
- `.github/workflows/deploy-pages.yml` runs the new gate against the post-preview/post-staging rehearsal build before artifact upload.
- `src/layouts/_default/_markup/render-link.html` now rewrites same-site absolute Markdown links onto the active site host and base path, so staging and project-site builds stop leaking the production host.
- The workflow host summary now expects the staging custom domain during the staging-first Phase 7 sequence.

## Impact

- Phase 7 now has a dedicated blocking gate for blocked staging-host correctness.
- Feed output and rendered article links now follow the active build host instead of leaking `www` URLs into staging.
- The staging sign-off path is clearer: blocked staging validation uses `check:seo-safe-deploy`, while the older Phase 6 canonical-alignment gate remains tied to the default production-validation artifact because it only audits indexable pages.

## Verification

1. Run a staging-style blocked build and gate:
   - `hugo --cleanDestinationDir --gc --minify --environment preview --baseURL "https://staging.rhino-inquisitor.com/"`
   - `npm run check:seo-safe-deploy -- --expected-origin "https://staging.rhino-inquisitor.com/" --crawl-mode blocked`
2. Re-run Phase 6 parity checks on their intended surfaces:
   - `npm run check:url-parity`
   - `npm run build:prod && npm run check:canonical-alignment`
3. Confirm live staging metadata on deterministic sample routes plus live `robots.txt`, `sitemap.xml`, and `index.xml` host signals.

## Related files

- `scripts/phase-7/check-seo-safe-deploy.js`
- `package.json`
- `.github/workflows/deploy-pages.yml`
- `src/layouts/_default/_markup/render-link.html`
- `analysis/tickets/phase-7/RHI-078-seo-safe-deployment-host-consolidation.md`
- `migration/phase-7-seo-safety-staging-report.md`
