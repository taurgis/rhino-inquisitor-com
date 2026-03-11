## Change summary

Updated the Phase 4 extraction contract so subset migration runs automatically pull in the WXR attachment records referenced by selected records' `_thumbnail_id` links. This restores deterministic featured-image recovery for RHI-043 and RHI-044 style batches and turns missing thumbnail support rows into an extraction failure instead of a silent downstream regression.

## Why this changed

The Phase 4 media contract already depended on verified featured-image linkage flowing from extraction into normalization, front matter mapping, media download, and staged Markdown rewriting. Full-corpus runs included attachment rows, but subset runs filtered strictly to the requested source IDs and post types. That meant pilot and high-value batches could keep `thumbnailId` metadata while dropping the attachment records needed to resolve `featuredImageUrl`, which in turn removed `heroImage` from staged Markdown and from the copied files under `src/content/`.

## Behavior details

### Old behavior

- `scripts/migration/extract.js` subset mode only included explicitly requested source IDs and post types.
- Selected records could retain `_thumbnail_id` metadata while the supporting WXR attachment records were excluded.
- `scripts/migration/normalize.js` then produced `_raw.extracted.featuredImageUrl: null`, and `scripts/migration/map-frontmatter.js` emitted no `heroImage` field.
- The failure was silent until maintainers noticed missing hero banners in migrated content or compared staged output manually.

### New behavior

- After the primary WXR and SQL extraction passes, `scripts/migration/extract.js` now scans the selected records for `_raw.thumbnailId` references.
- Any referenced attachment IDs missing from the selected record set are backfilled from the approved WXR export as support rows.
- `migration/intermediate/extract-summary.json` now records the closure result under `featuredImageDependencies`, including required attachment count, added support-row count, and unresolved IDs.
- The extractor now exits non-zero if any selected record references a thumbnail attachment that still cannot be recovered from the approved WXR source.
- With those support rows present, the existing normalization, front matter mapping, media download, and media rewrite steps restore `featuredImageUrl` and local `/media/...` `heroImage` values without template changes.

## Impact

- Affected workflow: Phase 4 subset migration batches that use `--source-id-file` or post-type filtering.
- Affected tickets and batches: RHI-043 pilot content and RHI-044 high-value content, plus future subset-driven migration batches.
- Maintainers no longer need to manually include attachment source IDs in batch input files just to preserve featured images.
- Missing featured-image dependencies now fail at extraction time, which is earlier and easier to diagnose than missing hero banners in rendered content.

## Verification

1. `node --check scripts/migration/extract.js`
2. Pilot batch rerun:
   - `npm run migrate:extract -- --source-id-file migration/input/pilot-source-ids.txt`
   - `npm run migrate:normalize`
   - `npm run migrate:convert`
   - `npm run migrate:download-media`
   - `npm run migrate:map-frontmatter`
   - `npm run migrate:finalize-content`
3. Pilot extraction summary now reports:
   - `featuredImageDependencies.requiredCount: 14`
   - `featuredImageDependencies.addedCount: 14`
   - `featuredImageDependencies.missingCount: 0`
4. High-value batch rerun:
   - `npm run migrate:extract -- --source-id-file migration/input/batch2-source-ids.txt`
   - `npm run migrate:normalize`
   - `npm run migrate:convert`
   - `npm run migrate:download-media`
   - `npm run migrate:map-frontmatter`
   - `npm run migrate:finalize-content`
5. High-value extraction summary now reports:
   - `featuredImageDependencies.requiredCount: 30`
   - `featuredImageDependencies.addedCount: 30`
   - `featuredImageDependencies.missingCount: 0`
6. Authored-content validation after refreshing the copied Markdown in `src/content/`:
   - `npm run validate:frontmatter`
   - `hugo --minify --environment production`
7. Focused staged media validation for the repaired migration batch:
   - `hugo --minify --environment production --contentDir migration/output/content --destination tmp/rhi-featured-image-public`
   - `npm run check:media -- --content-dir migration/output/content --public-dir tmp/rhi-featured-image-public`
8. Current authored-surface caveat:
   - `npm run check:media -- --content-dir src/content --public-dir public` still reports one unrelated pre-existing fixture failure for `src/content/posts/phase-3-performance-baseline/index.md` referencing `hero.png`.

## Related files

- `scripts/migration/extract.js`
- `migration/intermediate/extract-summary.json`
- `docs/migration/RUNBOOK.md`
- `migration/output/content/**`
- `src/content/**`
