## Change summary

Expanded the Phase 4 pilot remediation behavior in the existing migration scripts so the pilot rerun can fix several manual-review findings without patching generated Markdown by hand, and added a durable page-level body override path for source-content defects.

## Why this changed

The first RHI-043 manual review pass found a small cluster of repeatable script-owned defects in the pilot subset: malformed descriptions when source text began with Markdown links, flattened inline label/callout text, a split-word inline link in the WebDAV article, and an adjacent link/image block in the home-page payload. It also exposed one non-pipeline defect in `/about/`, where the WordPress source itself contained placeholder and corrupted copy. Those issues needed durable script fixes and a rerun-safe authored override path before pilot approval.

## Behavior details

### Old behavior

- `scripts/migration/map-frontmatter.js` derived descriptions from generated excerpt/body text only and dropped the visible text of Markdown links during normalization.
- `scripts/migration/apply-content-corrections.js` normalized fenced code, mixed image paragraphs, tables, and curated text overrides, but it did not reconstruct flattened inline label/callout paragraphs or repair split-word inline links.
- The migration workflow had no durable way to replace source-authored body copy for a single page without patching generated Markdown directly.
- The mixed-image splitter treated link-only text before a linked image as non-meaningful, so the home-page project links and image block stayed jammed together on one line.

### New behavior

- `scripts/migration/map-frontmatter.js` now prefers `_raw.extracted.metaDescription` when present and preserves Markdown link text while normalizing description candidates.
- `scripts/migration/apply-content-corrections.js` now rewrites pilot-style flattened inline labels such as `Info`, `CDN`, `Default Cache Times`, `Not Found`, `Replication`, `Deprecation`, `Deletion`, and `Caching` into Markdown alert blocks that render through the existing Hugo blockquote render hook.
- The correction pass now repairs inline links when anchor markup splits a word boundary, such as `Clou` + `d` in the WebDAV pilot article.
- The correction pass now supports page-level body and description overrides declared in `migration/input/body-overrides.json`, with authored Markdown bodies stored under `migration/input/body-overrides/`.
- The mixed-image normalization now treats link-only text as meaningful context, so preceding links and following linked images are split into separate Markdown blocks.
- The About page is now replaced through that override path, so the pilot no longer carries the placeholder WXR copy into staged Markdown or `src/content/pages/about.md`.

## Impact

- Affected workflow: the RHI-043 pilot rerun after `npm run migrate:map-frontmatter` and `npm run migrate:finalize-content`.
- Affected components: front-matter description generation and the staged-content correction pass.
- Result for the pilot subset: all previously identified script-fixable findings in `home.md`, `a-beginners-guide-to-webdav-in-sfcc.md`, `caching-in-the-sfcc-composable-storefront.md`, `how-to-use-ocapi-scapi-hooks.md`, `sitegenesis-vs-sfra-vs-pwa.md`, and `understanding-sfcc-instances.md` were cleared on rerun.
- Result for the source-content gap: `/about/` was traced to sourceId `68` in the WXR-derived record and resolved through the durable body override input instead of a direct patch to generated Markdown.

## Verification

1. `node --check scripts/migration/apply-content-corrections.js`
2. `node --check scripts/migration/map-frontmatter.js`
3. `npm run migrate:map-frontmatter`
4. `npm run migrate:finalize-content`
5. `npm run migrate:apply-corrections`
6. `hugo --minify --environment production --contentDir migration/output/content --destination tmp/rhi043-public`
7. `npm run validate:frontmatter -- --content-dir migration/output/content`
8. `node scripts/migration/validate-url-parity.js --scope selected-records --records-file migration/intermediate/records.normalized.json --content-dir migration/output/content --public-dir tmp/rhi043-public`
9. `node scripts/migration/check-redirects.js --scope selected-records --records-file migration/intermediate/records.normalized.json --public-dir tmp/rhi043-public`
10. `npm run check:seo-completeness -- --content-dir migration/output/content --public-dir tmp/rhi043-public`
11. `npm run check:feed-compatibility -- --public-dir tmp/rhi043-public`
12. `npm run check:media -- --content-dir migration/output/content --public-dir tmp/rhi043-public`
13. `CHECK_LINKS_PUBLIC_DIR=tmp/rhi043-public CHECK_LINKS_ALLOW_MANIFEST_TARGETS=1 npm run check:links`
14. `npm run check:a11y-content -- --content-dir migration/output/content`
15. `node scripts/migration/check-security-content.js --content-dir migration/output/content --records-dir migration/output --public-dir tmp/rhi043-public`
16. `CHECK_NOINDEX_PUBLIC_DIR=tmp/rhi043-public npm run check:noindex`

Additional final-state checks:

- `tmp/rhi043-public/caching-in-the-sfcc-composable-storefront/index.html`
- `tmp/rhi043-public/how-to-use-ocapi-scapi-hooks/index.html`
- `tmp/rhi043-public/a-beginners-guide-to-webdav-in-sfcc/index.html`
- `migration/output/content/pages/home.md`

- Rerun `npm run migrate:apply-corrections` and confirm `migration/reports/content-corrections-summary.json` reports `filesChanged: 0`
- Run `npm run migrate:apply-corrections` after adding `migration/input/body-overrides.json` and confirm the second rerun still reports `filesChanged: 0`
- Build `tmp/rhi043-final-public` and browser-review `/about/`, `/`, `/a-beginners-guide-to-webdav-in-sfcc/`, `/how-to-use-ocapi-scapi-hooks/`, `/caching-in-the-sfcc-composable-storefront/`, `/sitegenesis-vs-sfra-vs-pwa/`, `/understanding-sfcc-instances/`, and the canonical Delta Exports route

## Related files

- `scripts/migration/map-frontmatter.js`
- `scripts/migration/apply-content-corrections.js`
- `migration/input/body-overrides.json`
- `migration/input/body-overrides/about.md`
- `analysis/tickets/phase-4/RHI-043-pilot-batch-migration.md`
- `docs/migration/RUNBOOK.md`
- `migration/output/content/**`
- `migration/reports/content-corrections-summary.json`
