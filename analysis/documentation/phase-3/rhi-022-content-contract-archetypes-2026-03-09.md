# RHI-022 Content Contract and Archetypes - 2026-03-09

## Change summary

Implemented the Phase 3 front matter enforcement layer for posts, pages, category term metadata bundles, and default content by adding Hugo archetypes, a repo-side front matter validator, and the `npm run validate:frontmatter` command.

## Why this changed

Phase 2 approved the content contract, but the repository still lacked an enforcement point. Without archetypes and a machine-run validator, Phase 4 bulk-imported Markdown could land with missing required fields, unsafe `url` values, duplicate routes, or invalid canonical overrides.

## Behavior details

Old behavior:

- `src/archetypes/` was empty.
- No validator existed for Markdown front matter under `src/content/`.
- `package.json` had no `validate:frontmatter` script.
- The repository documented the content contract, but did not enforce it.

New behavior:

- `src/archetypes/posts.md`, `pages.md`, `categories.md`, and `default.md` now scaffold the approved fields and optional extension entries.
- `scripts/validate-frontmatter.js` scans `src/content/**/*.md`, validates front matter by content path, and fails on required-field, datetime, URL, canonical, alias, and duplicate-route violations.
- Validation is path-driven so category term metadata bundles are handled separately from migrated post/page content.
- `npm run validate:frontmatter` is now the repository entry point for this Phase 3 quality gate.

## Impact

- Maintainers and contributors now have a reproducible pre-merge check for front matter safety.
- Phase 4 import work has a concrete contract target instead of relying only on written guidance.
- Category term metadata can be scaffolded explicitly without expanding the migrated post/page `url` contract.

## Verification

- Ran `npm run validate:frontmatter` against the empty scaffold and confirmed exit code 0.
- Ran negative fixture checks for a missing required field and duplicate `url` collision; both failed with non-zero exit codes and per-file messages.
- Ran `hugo new content posts/example.md`, `pages/example.md`, and `categories/example/_index.md` to confirm Hugo selects the expected archetype files.

## Related files

- `package.json`
- `README.md`
- `docs/migration/RUNBOOK.md`
- `src/archetypes/posts.md`
- `src/archetypes/pages.md`
- `src/archetypes/categories.md`
- `src/archetypes/default.md`
- `scripts/validate-frontmatter.js`
- `analysis/tickets/phase-3/RHI-022-content-contract-archetypes.md`
- `analysis/tickets/phase-3/INDEX.md`