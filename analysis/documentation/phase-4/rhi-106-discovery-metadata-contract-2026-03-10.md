# RHI-106 Discovery Metadata Contract

## Change summary

RHI-106 adds an optional discovery/readability metadata layer under Hugo `params` so the shipped Phase 3 article and discovery UI can consume curated signals without changing the required Phase 2 routing-critical front matter contract. The contract is now implemented across validation, archetype authoring, article partial consumption, and the front matter mapping entry point.

## Why this changed

Phase 3 introduced article summary, related-content, and discovery surfaces that need richer metadata than the base migration contract provides. Without an approved extension, those surfaces would either depend on undocumented ad hoc fields or invent template-only fallbacks that the migration pipeline cannot validate or report on.

## Behavior details

Old behavior:

- The repo had no approved discovery metadata contract under `params`.
- `scripts/validate-frontmatter.js` did not validate discovery field shape or placement.
- Article summary UI only consumed legacy `params.takeaways`.
- Related-content overrides expected legacy string arrays only.
- No front matter mapping entry point existed to preserve optional discovery enrichment or report its coverage.

New behavior:

- Discovery metadata is additive and must live under `params`.
- The approved optional field set is:
  - `params.primaryTopic`: string
  - `params.secondaryTopics`: string array
  - `params.contentType`: enum `article | video | external | podcast`
  - `params.difficulty`: enum `beginner | intermediate | advanced`
  - `params.series`: object with `id`, `title`, optional `position`, optional `total`, optional `landingPage`
  - `params.summary`: string array for article takeaway bullets
  - `params.relatedContent`: object with optional `nextInTopic`, `adjacentTopic`, and `foundational` arrays; each item is an object with required `path` and optional `title` and `description`
  - `params.featuredHome`: boolean
- Reading time and update status remain derived and are rejected if authored under `params`.
- `scripts/validate-frontmatter.js` now enforces discovery field placement and shape while remaining backward compatible when `params` is absent.
- `scripts/migration/map-frontmatter.js` now loads converted records, optionally merges `migration/input/discovery-metadata.json` when present, emits Markdown output, writes front matter errors, and produces discovery coverage visibility.
- Article summary now prefers `params.summary` and falls back to legacy `params.takeaways`.
- Article related-content overrides now accept the canonical object-list contract while continuing to tolerate legacy string entries.

## Impact

- Maintainers can author curated discovery metadata in archetypes without reopening the Phase 2 contract.
- The migration pipeline now has one approved place to preserve and report optional enrichment before pilot and high-value batches.
- Phase 3 article partials can consume the approved contract directly instead of relying on legacy-only shapes.
- RHI-035 can treat discovery metadata as an established dependency instead of defining the contract itself.

## Verification

Run the validator against authored content:

```bash
npm run validate:frontmatter
```

Run the mapper on converted records and a temporary output directory:

```bash
npm run migrate:map-frontmatter -- --content-dir tmp/rhi-106-content --error-report tmp/rhi-106-frontmatter-errors.csv --coverage-report tmp/rhi-106-discovery-coverage.json
```

Run a production Hugo build to verify the article partial compatibility:

```bash
hugo --minify --environment production
```

## Related files

- `scripts/migration/schemas/discovery-metadata.schema.js`
- `scripts/validate-frontmatter.js`
- `scripts/migration/map-frontmatter.js`
- `src/archetypes/posts.md`
- `src/archetypes/pages.md`
- `src/archetypes/default.md`
- `src/archetypes/categories.md`
- `src/layouts/partials/article/summary-box.html`
- `src/layouts/partials/article/related-content.html`
- `analysis/tickets/phase-4/RHI-106-discovery-metadata-extension.md`
- `analysis/tickets/phase-4/RHI-043-pilot-batch-migration.md`
