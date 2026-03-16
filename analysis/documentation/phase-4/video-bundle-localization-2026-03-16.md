# Video Bundle Localization for Migrated Articles

## Change summary

Migrated WordPress `.mp4` and `.mov` article links are now localized into each article bundle directory and rendered as local HTML5 video players in article bodies instead of remaining external WordPress links.

## Why this changed

Old behavior left multiple article demo recordings on external `wp-content/uploads` URLs, which created migration-parity drift, dependency on legacy hosting, and reader-visible raw media-link issues.

The update aligns video handling with the existing bundle-local image strategy: article-owned media should live with article content when possible.

## Behavior details

### Old behavior

1. `scripts/migration/bundle-posts.js` only localized references that already pointed at `/media/...` assets.
2. Existing article bundles under `src/content/posts/*/index.md` were not processed for post-bundle media localization because the script skipped files once `index.md` already existed.
3. WordPress upload video links such as `https://www.rhino-inquisitor.com/wp-content/uploads/.../*.mp4` and `*.mov` remained external in article markdown.
4. Markdown link rendering in `src/layouts/_default/_markup/render-link.html` always emitted `<a>` tags, so local video files were shown as links, not inline players.

### New behavior

1. `scripts/migration/bundle-posts.js` now:
   - scans both flat markdown files and existing bundle `index.md` files,
   - detects WordPress upload `.mp4` and `.mov` references,
   - resolves source files from the approved WordPress filesystem snapshot root (`tmp/website-wordpress-backup/wp-content` by default),
   - copies matched video files into the target bundle folder,
   - rewrites references to bundle-local filenames,
   - reports migrated and localized bundle counts in `tmp/post-bundle-migration-report.json`.
2. `src/layouts/_default/_markup/render-link.html` now renders local page-resource video links as `<video>` elements with controls and fallback links.
3. `src/assets/styles/site.css` now includes article-body styling for local rendered video elements.

## Impact

1. Article demo recordings no longer depend on legacy WordPress media hosting for the localized routes.
2. Reader experience improves because local video links are rendered as inline playable video elements.
3. Existing article URLs and front matter routing remain unchanged.
4. The migration utility can now reconcile external WordPress upload video references in already-bundled content.

## Verification

Commands run:

```bash
npm run migrate:bundle-posts
npm run migrate:bundle-posts -- --write
npm run build:prod
npm run check:media
npm run check:links
```

Observed results:

1. Dry run: `Localized bundles: 8`, `Bundle assets: 10`, `Unresolved references: 0`.
2. Write run: `Localized bundles: 8`, `Copied assets: 10`, `Unresolved references: 0`.
3. Production build succeeded (`hugo --minify --environment production`).
4. `npm run check:media` reported `Failures: 0`.
5. `npm run check:links` reported `Blocking findings: 0`.

## Related files

1. `scripts/migration/bundle-posts.js`
2. `src/layouts/_default/_markup/render-link.html`
3. `src/assets/styles/site.css`
4. `src/content/posts/new-apis-and-features-for-a-headless-sfcc/index.md`
5. `src/content/posts/everything-new-in-sfcc-23-4/index.md`
6. `src/content/posts/salesforce-b2c-commerce-cloud-23-2/index.md`
7. `src/content/posts/salesforce-payments-experience-explained/index.md`
8. `src/content/posts/what-is-new-in-the-23-8-commerce-cloud-release/index.md`
