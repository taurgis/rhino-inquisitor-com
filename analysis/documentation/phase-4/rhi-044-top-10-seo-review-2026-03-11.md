# RHI-044 Top-10 SEO Review

## Change summary

Completed the PR-facing top-10 traffic review for RHI-044, tightened the remaining non-top-10 metadata-length warnings in the Batch 2 cohort, and corrected the SEO completeness summary so pass-level sample coverage rows no longer inflate the printed warning count.

## Why this changed

The first RHI-044 execution pass left two closeout-quality gaps:

- four of the combined-build top-10 traffic pages still had front matter titles above the ticket's 60-character target
- one top-10 page description was malformed and the homepage review note was still relying on a short site-level description rather than a stronger page-level source description
- the batch-scoped SEO completeness report still showed `video` sample coverage as a warning because the sampler only counted `url_class=video` manifest rows and not page-backed content assigned to the `Video` taxonomy

## Behavior details

Old behavior:

- Top-10 combined-build review still showed overlong titles on:
  - `/how-to-use-ocapi-scapi-hooks/`
  - `/mastering-chunk-oriented-job-steps-in-salesforce-b2c-commerce-cloud/`
  - `/a-beginners-guide-to-webdav-in-sfcc/`
  - `/understanding-sfcc-instances/`
- `/swc-and-storybook-error-failed-to-load-native-binding/` still carried a malformed description fragment.
- `scripts/migration/check-seo-completeness.js` sampled `video` coverage only from manifest rows whose `url_class` was already `video`.

New behavior:

- The reviewed top-10 front matter titles are now all at or below 60 characters.
- The malformed SWC/Storybook description was replaced with a readable manual description and the homepage front matter description was tightened for the PR-facing review pass.
- `scripts/migration/check-seo-completeness.js` now treats staged content tagged with the `Video` category as valid video-sample candidates, which matches the page-backed taxonomy behavior restored during RHI-044 execution.
- A narrow second-pass metadata cleanup reduced the remaining non-top-10 `title_length` and `description_length` findings to zero actual warning rows in the staged Batch 2 SEO report.
- `scripts/migration/check-seo-completeness.js` now counts only real `warn` rows in its summary output; sample-coverage `pass` rows no longer inflate the printed warning total.
- The post-fix correction rerun now reports `filesChanged: 0` in `migration/reports/content-corrections-summary.json`, so the idempotency evidence requested by the ticket is present.

## Impact

- The combined-build top-10 review is materially cleaner and more defensible for PR review.
- Batch-scoped SEO completeness still has warning-level metadata findings, but they are now limited to non-top-10 Batch 2 pages plus the existing homepage site-description behavior.
- The `video` sample coverage warning is removed from the staged Batch 2 SEO report.

## Verification

1. Tightened the combined-build top-10 front matter on:
   - `src/content/posts/how-to-use-ocapi-scapi-hooks.md`
   - `src/content/posts/mastering-chunk-oriented-job-steps-in-salesforce-b2c-commerce-cloud.md`
   - `src/content/posts/a-beginners-guide-to-webdav-in-sfcc.md`
   - `src/content/posts/understanding-sfcc-instances.md`
   - `src/content/pages/swc-and-storybook-error-failed-to-load-native-binding.md`
   - `src/content/pages/home.md`
2. Re-ran the correction pass and confirmed idempotency:
   - `npm run migrate:apply-corrections`
   - result: `filesChanged: 0`
3. Rebuilt the staged Batch 2 payload and reran SEO completeness:
   - `hugo --minify --environment production --contentDir migration/output/content --destination tmp/rhi044-public`
   - `npm run check:seo-completeness -- --content-dir migration/output/content --public-dir tmp/rhi044-public`
   - result: `Failures: 0`, `video sample_coverage: pass (3/3)`
4. Rebuilt the combined site and reviewed the owner-approved top-10 traffic sample:
   - all 10 reviewed front matter titles are `<= 60` characters
   - 9 of 10 reviewed front matter descriptions are between `120` and `155` characters
   - homepage description remains meaningful but is rendered from the site-level home metadata path at 81 characters in the built HTML
   - all 10 reviewed routes render canonical URLs matching the expected route
   - JSON-LD is present on all reviewed routes (`1` or `2` blocks depending on page type)
   - 9 reviewed routes expose a first-image alt text in the rendered HTML; `/swc-and-storybook-error-failed-to-load-native-binding/` has no hero image and was treated as `N/A`
5. Narrow second-pass cleanup on non-top-10 Batch 2 metadata warnings:
   - shortened the remaining overlong titles on eCDN staging, Kickstart Guide, PWA Kit speed, Sending Emails, SLAS session sync, Architect Certification, and Mastering Sitemaps
   - expanded the remaining short descriptions on custom TTF fonts, Custom Caches, Active Data, Kickstart Guide, Mail Attachments, Mastering Sitemaps, Architect Certification, POD numbers, and third-party API caching
6. Final staged Batch 2 SEO report state after the second pass:
   - `0` warning rows
   - `0` failure rows
   - `video sample_coverage: pass (3/3)`

## Related files

- `scripts/migration/check-seo-completeness.js`
- `src/content/pages/home.md`
- `src/content/pages/swc-and-storybook-error-failed-to-load-native-binding.md`
- `src/content/posts/how-to-use-ocapi-scapi-hooks.md`
- `src/content/posts/mastering-chunk-oriented-job-steps-in-salesforce-b2c-commerce-cloud.md`
- `src/content/posts/a-beginners-guide-to-webdav-in-sfcc.md`
- `src/content/posts/understanding-sfcc-instances.md`
- `migration/reports/seo-completeness-report.csv`
- `migration/reports/content-corrections-summary.json`
- `analysis/tickets/phase-4/RHI-044-high-value-content-batch.md`
