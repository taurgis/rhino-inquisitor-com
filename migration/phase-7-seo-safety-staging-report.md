# Phase 7 SEO Safety Staging Report

**Date:** 2026-03-17  
**Phase:** 7  
**Ticket:** RHI-078  
**Status:** Done

## Change summary

Validated the blocked staging host contract for `https://staging.rhino-inquisitor.com/` after adding the dedicated `check:seo-safe-deploy` gate and normalizing same-site absolute Markdown links onto the active build host.

## Why this changed

RHI-078 requires a staging-first SEO safety gate before production cutover work can proceed. The blocked staging host must remain self-consistent on canonical, Open Graph, JSON-LD, sitemap, feed, and internal absolute URLs without leaking the production host or the project-site host.

## Behavior details

### Previous risk

- The repo had production-oriented SEO gates, but no single Phase 7 checker focused on blocked staging host safety.
- Same-site Markdown links hard-coded to `https://www.rhino-inquisitor.com/` leaked the production host into staging HTML and feed output.

### Current behavior

- `scripts/phase-7/check-seo-safe-deploy.js` now validates staging host consistency and crawl-state.
- Same-site Markdown links are rewritten at render time onto the active build host and base path.
- Live staging pages remain intentionally blocked with `noindex, nofollow` and `Disallow: /`, while still self-canonicalizing on the staging host.

## Sampling method

Deterministic sample set used for live staging verification:

- Homepage: `/`
- Three most-recent published posts by front matter date:
  - `/real-time-inventory-checks-in-sfcc/`
  - `/a-dev-guide-to-combating-fraud-on-sfcc/`
  - `/kickstart-guide-for-new-sfcc-developers/`
- First alphabetical category slug from built category output: `/category/ai/`
- Archive page: `/archive/`

## Automated validation

### Blocked staging artifact

- Command:

```bash
hugo --cleanDestinationDir --gc --minify --environment preview --baseURL "https://staging.rhino-inquisitor.com/"
npm run check:seo-safe-deploy -- --expected-origin "https://staging.rhino-inquisitor.com/" --crawl-mode blocked --report tmp/local-phase-7-seo-safe-deploy.json
```

- Result: `pass`
- Checked HTML routes: `235`
- Checked sitemap files: `public/sitemap.xml`
- Checked sitemap `<loc>` values: `212`

### Phase 6 parity and canonical alignment

- `npm run check:url-parity`
  - Result: `pass`
  - Manifest entries: `1223`
  - Fail rows: `0`
- `npm run build:prod && npm run check:canonical-alignment`
  - Result: `pass`
  - Checked rows: `212`
  - Mismatch rows: `0`

Note: `check:canonical-alignment` remains tied to the default production-validation artifact because it only audits indexable pages. The blocked staging host is validated by `check:seo-safe-deploy` plus the live staging checks below.

## Live staging sample results

| URL | HTTP | Canonical | `og:url` | `robots` | `X-Robots-Tag` |
|---|---:|---|---|---|---|
| `https://staging.rhino-inquisitor.com/` | 200 | `https://staging.rhino-inquisitor.com/` | `https://staging.rhino-inquisitor.com/` | `noindex, nofollow` | _(empty)_ |
| `https://staging.rhino-inquisitor.com/real-time-inventory-checks-in-sfcc/` | 200 | `https://staging.rhino-inquisitor.com/real-time-inventory-checks-in-sfcc/` | `https://staging.rhino-inquisitor.com/real-time-inventory-checks-in-sfcc/` | `noindex, nofollow` | _(empty)_ |
| `https://staging.rhino-inquisitor.com/a-dev-guide-to-combating-fraud-on-sfcc/` | 200 | `https://staging.rhino-inquisitor.com/a-dev-guide-to-combating-fraud-on-sfcc/` | `https://staging.rhino-inquisitor.com/a-dev-guide-to-combating-fraud-on-sfcc/` | `noindex, nofollow` | _(empty)_ |
| `https://staging.rhino-inquisitor.com/kickstart-guide-for-new-sfcc-developers/` | 200 | `https://staging.rhino-inquisitor.com/kickstart-guide-for-new-sfcc-developers/` | `https://staging.rhino-inquisitor.com/kickstart-guide-for-new-sfcc-developers/` | `noindex, nofollow` | _(empty)_ |
| `https://staging.rhino-inquisitor.com/category/ai/` | 200 | `https://staging.rhino-inquisitor.com/category/ai/` | `https://staging.rhino-inquisitor.com/category/ai/` | `noindex, nofollow` | _(empty)_ |
| `https://staging.rhino-inquisitor.com/archive/` | 200 | `https://staging.rhino-inquisitor.com/archive/` | `https://staging.rhino-inquisitor.com/archive/` | `noindex, nofollow` | _(empty)_ |

## Host-level staging evidence

### `robots.txt`

Observed live response:

```text
User-agent: *
Disallow: /
Disallow: /wp-json/
Disallow: /xmlrpc.php
Disallow: /author/
Sitemap: https://staging.rhino-inquisitor.com/sitemap.xml
```

### `sitemap.xml`

Observed live sample:

```text
<loc>https://staging.rhino-inquisitor.com/
<loc>https://staging.rhino-inquisitor.com/category/
<loc>https://staging.rhino-inquisitor.com/pages/
<loc>https://staging.rhino-inquisitor.com/phase-3-performance-baseline/
<loc>https://staging.rhino-inquisitor.com/category/platform/
```

### `index.xml`

Observed live sample:

```text
<link>https://staging.rhino-inquisitor.com/
atom:link href="https://staging.rhino-inquisitor.com/index.xml
<link>https://staging.rhino-inquisitor.com/404.html
<link>https://staging.rhino-inquisitor.com/404/
<link>https://staging.rhino-inquisitor.com/phase-3-performance-baseline/
<link>https://staging.rhino-inquisitor.com/scaffold-readiness/
```

## Impact

- Staging host SEO signals are now covered by a dedicated blocking gate in the deploy workflow.
- Same-site content links no longer force the production host into staging or project-site builds.
- The remaining closeout item is operational evidence, not code: a release-candidate GitHub Actions run URL after the next push.

## Verification

1. Local blocked staging build and `check:seo-safe-deploy` pass.
2. `npm run check:url-parity` passes.
3. `npm run build:prod && npm run check:canonical-alignment` passes on the default production-validation artifact.
4. Live staging sample routes return `200`, self-canonicalize on staging, emit matching `og:url`, and serve `noindex, nofollow` without `X-Robots-Tag`.
5. Live `robots.txt`, `sitemap.xml`, and `index.xml` samples all use the staging host exclusively.

## Actions evidence

- Release-candidate Actions run URL: `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23204306809`
- Result: `Deploy to GitHub Pages #125` succeeded on commit `ace8cc63e7b89d194f3ea029d34cc40aed1da02c`

## Related files

- `scripts/phase-7/check-seo-safe-deploy.js`
- `package.json`
- `.github/workflows/deploy-pages.yml`
- `src/layouts/_default/_markup/render-link.html`
- `analysis/tickets/phase-7/RHI-078-seo-safe-deployment-host-consolidation.md`
- `analysis/documentation/phase-7/rhi-078-seo-safe-deploy-gate-2026-03-17.md`
