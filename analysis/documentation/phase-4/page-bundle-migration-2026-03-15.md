# Page Bundle Migration

## Change summary

The repository now applies the same Hugo leaf-bundle packaging model to flat content pages under `src/content/pages/` that was previously introduced for posts: each migrated page moves to `src/content/pages/<slug>/index.md` with page-owned media copied into the same folder.

## Why this changed

Old behavior:

1. Most content pages still lived as flat files such as `src/content/pages/about.md`.
2. Page media references remained global `/media/...` paths even when the page would benefit from colocated bundle resources.
3. The repository had a post migration utility, but no page-targeted wrapper for the same workflow.

New behavior:

1. `npm run migrate:bundle-pages` runs the existing bundling utility against `src/content/pages` and writes a page-specific report to `tmp/page-bundle-migration-report.json`.
2. Existing target directories are reused safely when they do not already contain `index.md`, which allows empty placeholder directories such as `src/content/pages/about/` to become proper page bundles.
3. Pages now use the same bundle-local image and linked-resource rendering path already supported by the Hugo render hooks.

## Impact

1. Flat pages are repackaged as Hugo leaf bundles without changing their explicit front matter `url` values.
2. Page-owned media is colocated with the page content, which improves maintainability and bundle-local resource handling.
3. Existing special page behavior remains intact because the change only repackages content files and leaves templates, routes, and front matter contracts unchanged.

## Verification

Recommended verification sequence:

```bash
npm run migrate:bundle-pages
npm run migrate:bundle-pages -- --write
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

1. Flat page files are replaced by bundle folders with `index.md`.
2. Page media resolves from the bundle in the production build.
3. URL parity and link validation remain green after the structural migration.

## Related files

1. `scripts/migration/bundle-posts.js`
2. `package.json`
3. `src/layouts/_default/_markup/render-image.html`
4. `src/layouts/_default/_markup/render-link.html`
5. `scripts/migration/check-media.js`