# Bundled Media Deduplication

## Change summary

The repository now includes a reproducible bundled-media audit and has removed redundant shared raster assets from `src/assets/media` after the post and page bundle migrations proved that current article and page rendering no longer depends on `/media/...` paths.

## Why this changed

Old behavior:

1. Post and page bundle migrations copied content-owned media into bundle folders but left the original shared copies in `src/assets/media`.
2. That left the repository with duplicated binary assets and made it harder to tell whether article and page rendering was truly independent of the shared media tree.
3. Safety proof required ad hoc shell inspection rather than a repeatable repository command.

New behavior:

1. `npm run check:bundle-media` scans `src/content/posts`, `src/content/pages`, and `public` for remaining `/media` and `assets/media` references.
2. The same audit classifies `src/assets/media` files by content hash against bundle-local post and page assets, writes a JSON report to `tmp/bundled-media-audit.json`, and writes a duplicate-only deletion list to `tmp/assets-media-duplicate-list.txt`.
3. Redundant shared copies were removed only for files proven to be exact duplicates of bundle-local assets.
4. Two non-duplicate holdouts remain in `src/assets/media` because they still exist only as legacy manifest records, not as bundle duplicates: `src/assets/media/2022/session-bridge-mobile-app-v3-b7664fb07d.jpeg` and `src/assets/media/2022/system-overview-journey-of-a-request-scaled-fe217a8070.jpeg`.

## Behavior details

Old behavior:

1. Shared media duplicates remained in `src/assets/media` even after articles and pages rendered bundle-local image paths.
2. The repository had no dedicated command to prove that current article/page source and rendered output were free of `/media` dependencies.

New behavior:

1. Article and page safety can be verified with `npm run check:bundle-media`.
2. Duplicate removal is now driven by the generated duplicate list instead of directory-wide deletion.
3. The cleanup boundary is explicit: only exact duplicates are removed, while unique holdouts remain until separately reviewed.

## Impact

1. The repository no longer carries duplicated shared raster assets for content that already owns bundle-local copies.
2. Future article/page media cleanup can be rerun safely from the committed audit command.
3. Migration-era manifest references remain visible for the two unique holdouts, which keeps later pipeline cleanup work traceable instead of silently deleting unmatched files.
4. The cleanup proof is intentionally scoped to the promoted `src/content` tree and the built `public` output, not to the historical staged migration corpus under `migration/output/content`.

## Verification

Run the bundled-media proof and the post-cleanup validation bundle:

```bash
npm run check:bundle-media
rm -rf public
npm run build:prod
npm run check:bundle-media
npm run validate:frontmatter
npm run check:media
npm run check:images
npm run check:url-parity
npm run check:links
npm run check:internal-links
```

Expected outcomes:

1. `check:bundle-media` reports zero source and built-output references to `/media` for current posts and pages.
2. The audit reports duplicate shared assets separately from any unique holdouts.
3. Production build and media/link validation remain green after duplicate removal.

## Related files

1. `scripts/migration/check-bundled-media.js`
2. `package.json`
3. `src/assets/media/`
4. `src/content/posts/`
5. `src/content/pages/`
6. `migration/reports/media-integrity-report.csv`
7. `migration/reports/phase-5-image-audit.csv`