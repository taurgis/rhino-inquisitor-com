## Change summary

Improved auto-generated front matter descriptions in the Phase 4 mapper so generated metadata avoids clipped `...` snippets, removes common migration artifacts, and falls back to readable sentence-based text when source excerpts are weak or missing.

## Why this changed

The previous description logic hard-clamped text at 155 characters with a forced ellipsis, which produced low-quality metadata fragments in many migrated records. Those fragments were acceptable for schema completeness but weak for SEO/snippet quality and manual preview review.

## Behavior details

### Old behavior

- `scripts/migration/map-frontmatter.js` used `excerptRaw` when present, otherwise derived text from `bodyMarkdown`.
- Text longer than 155 chars was truncated to 152 chars and always ended with `...`.
- Title-only records with empty body/excerpt produced weak descriptions such as the title alone.

### New behavior

- Description text is normalized before generation:
  - strips fenced/inline code wrappers, Markdown links/images, HTML comments, and common read-more tokens.
  - trims trailing ellipsis artifacts.
- Description generation now prefers complete sentence output:
  - tries sentence-based assembly up to the 155-char limit.
  - avoids forced `...` endings.
  - for short but usable first sentences, appends a concise contextual suffix.
- Title-only fallbacks now generate readable sentence metadata (for example: `Archive. Explore ...`) instead of raw title-only values.

## Impact

- Affected component: Phase 4 front matter mapper (`migrate:map-frontmatter`).
- SEO metadata quality improved for generated `description` values used by meta description, Open Graph description, and Twitter description outputs.
- No contract change to required field presence, URL mapping, alias filtering, or draft handling.

## Verification

1. `node --check scripts/migration/map-frontmatter.js`
2. `npm run migrate:map-frontmatter`
3. Description quality audit (generated corpus):
   - `total: 171`
   - `short (<80 chars): 0`
   - `equalsTitle: 0`
   - `ellipsis endings: 0`
4. Staged preview refresh and SEO validation:
   - `npm run migrate:rewrite-media`
   - `npm run migrate:rewrite-links`
   - `hugo --minify --environment production --contentDir migration/output/content --destination tmp/rhi-description-public`
   - `npm run check:seo-completeness -- --public-dir tmp/rhi-description-public` (0 failures, warnings remain)
   - `CHECK_NOINDEX_PUBLIC_DIR=tmp/rhi-description-public npm run check:noindex`
5. Spot-check rendered metadata in staged preview:
   - `/archive/`
   - `/the-realm-split-field-guide-to-migrating-an-sfcc-site/`
   - `/connecting-the-clouds-wedding-or-funeral/`

## Related files

- `scripts/migration/map-frontmatter.js`
- `migration/output/content/**`
- `migration/reports/seo-completeness-report.csv`
- `migration/reports/link-rewrite-log.csv`
