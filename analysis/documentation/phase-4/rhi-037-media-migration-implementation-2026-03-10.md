# RHI-037 Media Migration Implementation

## Change summary

RHI-037 adds the Phase 4 media pipeline: download referenced media into repo-owned storage, rewrite migrated content to local media paths, validate media integrity, and enable Hugo global-resource handling for migrated body images while preserving Hugo image processing support in the existing partial-based image flows.

## Why this changed

Phase 4 converted content still referenced legacy WordPress upload URLs and third-party image hosts. That left the staged migration corpus vulnerable to broken images, mixed content, and post-cutover hotlinks. The ticket also required an owner decision on media strategy. The owner approved including Hugo image processing, while also deciding not to synthesize `heroImage` values when the source corpus lacks true featured-image linkage. This follow-on implementation was needed once the source channels proved they did contain real featured-image metadata that could be recovered safely.

## Behavior details

### Old behavior

- Converted JSON records under `migration/output/*.json` could still contain remote media URLs in `bodyMarkdown`.
- Staged Markdown under `migration/output/content/` had no dedicated media rewrite pass.
- The Hugo site had no image render hook, so Markdown body images could not be processed as Hugo resources.
- The existing image partial only handled page resources and direct URLs, not global media resources downloaded for migration.
- True featured-image metadata was not propagated into `heroImage`, even when WordPress source records carried `_thumbnail_id` linkage.

### New behavior

- `npm run migrate:download-media` reads `migration/intermediate/records.normalized.json`, groups media references by canonical source, downloads them with bounded concurrency and retry/backoff, deduplicates by checksum, and writes `migration/intermediate/media-manifest.json` plus `migration/reports/media-missing.csv`.
- `scripts/migration/extract.js` now preserves WXR postmeta linkage for `_thumbnail_id` and `_yoast_wpseo_metadesc`, while `scripts/migration/normalize.js` resolves verified featured-image URLs into `_raw.extracted.featuredImageUrl` and appends them to `mediaRefs` so the media pipeline can download hero-banner assets alongside body images.
- `scripts/migration/map-frontmatter.js` now emits `heroImage` only when converted records carry verified featured-image linkage. It does not synthesize hero banners from first body images or heuristics.
- Raster images are stored as Hugo global resources under `src/assets/media/**` so Markdown image render hooks and existing partials can resolve them through Hugo resource metadata. Non-processable or non-image attachments remain direct static files under `src/static/media/**`.
- `npm run migrate:download-media` now also falls back to the approved WordPress filesystem snapshot under `tmp/website-wordpress-backup/wp-content` when an HTTP download fails for a WordPress-origin asset.
- `npm run migrate:download-media` now also caps any localized hero asset above the 2000px longest-edge budget during asset generation, which keeps hero-image quality enforcement in the media pipeline instead of weakening the gate.
- `npm run migrate:rewrite-media` rewrites converted record bodies and staged Markdown files from legacy media URLs to local `/media/...` paths using the manifest, including featured-image-backed `heroImage` fields.
- `scripts/migration/rewrite-media-refs.js` now handles Markdown image and link syntax separately before running its generic URL replacement pass, which fixes previously skipped hotlinks where a media URL appeared next to another URL inside Markdown markup.
- `npm run check:media` scans staged Markdown and built HTML, verifies local file resolution, checks MIME/extension alignment, flags WordPress hotlinks and mixed content, enforces the hero-image size budget when hero images exist, and writes `migration/reports/media-integrity-report.csv` plus `migration/reports/media-hotlinks.csv`.
- `src/layouts/_default/_markup/render-image.html` now lets staged Markdown images resolve through Hugo global resources without forcing bulk image transforms during every staged build. `src/layouts/partials/media/image.html` and `src/layouts/partials/seo/resolve.html` now support global media resources in addition to page resources, which preserves Hugo `.Process` support for partial-driven image flows.

## Impact

- Phase 4 migrated content can be built without depending on legacy WordPress media hosts.
- Hugo can resolve migrated raster images from Markdown bodies through global resources, while existing partial-driven image flows retain Hugo processing support where that remains operationally safe.
- The repo now produces explicit media audit artifacts for missing downloads, unresolved hotlinks, and integrity failures.
- `heroImage` now appears only where source channels provide verified featured-image linkage. This preserves the owner-approved no-synthesis rule while restoring the intended hero-banner behavior for real featured images.
- All 150 staged posts and 8 staged pages with true featured-image metadata now resolve those hero images to local `/media/...` paths after the rewrite pass.
- Filesystem-backed recovery plus the final normalized-source thumbnail remap collapses the prior 52 canonical WordPress `404` blockers to 0 release-candidate download failures.
- The staged media gate is now green: the prior 30 hero-size failures are removed by downloader-side hero resizing, the remaining WordPress hotlink is fixed by rewrite-media Markdown matching, and the last unrecoverable video thumbnail now uses a local WordPress-featured-image fallback on the staged page.

## Verification

- Run `npm run migrate:download-media`.
- Run `npm run migrate:rewrite-media`.
- Build staged content with `hugo --minify --environment production --contentDir migration/output/content --destination tmp/rhi037-public`.
- Run `npm run check:media -- --content-dir migration/output/content --public-dir tmp/rhi037-public`.
- Confirm `migration/reports/media-missing.csv` and `migration/reports/media-hotlinks.csv` are empty or contain only explicitly accepted exceptions.

Current 2026-03-10 validation snapshot:

- `npm run migrate:download-media` now completes with filesystem-backed recovery enabled, producing 1803 manifest-backed source references across 573 canonical media items and leaving `migration/reports/media-missing.csv` header-only for the staged release-candidate batch.
- `npm run migrate:rewrite-media` rewrites staged content successfully, including featured-image-backed `heroImage` fields for posts and pages with verified linkage.
- `hugo --minify --environment production --contentDir migration/output/content --destination tmp/rhi037-public` completes successfully after the recovered hero-image assets are localized.
- `npm run check:media -- --content-dir migration/output/content --public-dir tmp/rhi037-public` now reports 0 failures on the staged release-candidate content set.
- `migration/output/content/pages/video.md` now uses the local WordPress-featured-image fallback `/media/2022/yte-hd-image-96d2c1f499.jpg` for the final unrecoverable EP9 thumbnail, because the upstream `img.youtube.com` asset returns `404` across all tested thumbnail variants and has no filesystem counterpart.

## Related files

- `scripts/migration/media-helpers.js`
- `scripts/migration/extract.js`
- `scripts/migration/normalize.js`
- `scripts/migration/map-frontmatter.js`
- `scripts/migration/download-media.js`
- `scripts/migration/rewrite-media-refs.js`
- `scripts/migration/check-media.js`
- `migration/output/1077.json`
- `migration/output/content/pages/video.md`
- `src/layouts/_default/_markup/render-image.html`
- `src/layouts/partials/media/image.html`
- `src/layouts/partials/seo/resolve.html`
- `package.json`