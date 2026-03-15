# Post Bundle Migration

## Change summary

The repository now includes a reusable migration utility to convert flat post files under `src/content/posts/` into Hugo leaf bundles with `index.md` and colocated post-owned media, plus the template and validation updates required for bundle-local assets to render and validate correctly.

## Why this changed

Old behavior:

1. Migrated articles mostly lived as flat files such as `src/content/posts/<slug>.md`.
2. Post media remained in shared `src/assets/media/` or `src/static/media/` locations and post bodies referenced those global `/media/...` paths.
3. Hero images already supported page resources, but markdown body images did not resolve bundle-local page resources.
4. Source media validation assumed markdown references resolved only from `src/assets/` or `src/static/`.

New behavior:

1. `npm run migrate:bundle-posts` runs a dry-run capable migration utility that converts flat post files into `src/content/posts/<slug>/index.md` bundles and copies referenced post media into the same folder.
2. Markdown image render hooks now resolve relative bundle assets from `.Page.Resources` before falling back to global resources.
3. Markdown link render hooks now resolve relative bundle resource links such as bundled PDFs to their published `RelPermalink`.
4. `scripts/migration/check-media.js` now validates bundle-local markdown media references in addition to global asset and static references.

## Impact

1. Post content is easier to maintain because article files and article-owned media are colocated.
2. Existing public URLs remain stable because the change only repackages content files and leaves front matter `url` values intact.
3. Future migration or cleanup work can reuse the same script against other flat post directories instead of repeating ad hoc file moves.

## Verification

Recommended verification sequence after running the write mode migration:

```bash
npm run migrate:bundle-posts -- --write
rm -rf public
npm run build:prod
npm run validate:frontmatter
npm run check:media
npm run check:images
npm run check:url-parity
npm run check:links
npm run check:internal-links
```

Expected outcomes:

1. Flat post files are replaced by bundle folders with `index.md`.
2. Post hero images and markdown body images resolve from the page bundle in the production build.
3. Validation gates continue to pass with bundle-local assets.

## Related files

1. `scripts/migration/bundle-posts.js`
2. `scripts/migration/check-media.js`
3. `src/layouts/_default/_markup/render-image.html`
4. `src/layouts/_default/_markup/render-link.html`
5. `package.json`