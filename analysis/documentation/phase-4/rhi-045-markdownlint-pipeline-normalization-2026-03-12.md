## Change summary

- Updated the Batch 3 staged-content correction workflow so `npm run migrate:apply-corrections` now combines deterministic Markdown normalization with a final `markdownlint-cli2 --fix` pass across `migration/output/content/**/*.md`.
- Extended `scripts/migration/apply-content-corrections.js` to repair generator-side markdownlint defects that were surfacing in Batch 3 PR validation, including malformed repository-entry links, blockquote/list spacing, duplicate heading disambiguation, in-page fragment cleanup, and inline code or emphasis formatting issues.

## Why this changed

- Batch 3 PR validation was failing on markdownlint for generated Markdown in both `migration/output/content/` and promoted `src/content/`.
- The existing deterministic cleanup pass handled many historical markdownlint-sensitive structures, but Batch 3 exposed additional generator patterns that were still escaping into the PR lint gate.
- Folding markdownlint autofix into the scripted correction workflow makes the post-generation sequence rerun-safe and keeps future migration batches from depending on manual Markdown edits.

## Behavior details

- Old behavior:
  - `npm run migrate:apply-corrections` only ran the custom Node correction pass.
  - Residual markdownlint issues could remain in staged generated content after deterministic normalization.
- New behavior:
  - `npm run migrate:apply-corrections` runs the custom Node correction pass and then runs `markdownlint-cli2 --fix` over `migration/output/content/**/*.md`.
  - The correction script now also repairs Batch 3-specific malformed Markdown patterns before autofix runs.

## Impact

- Maintainers can rely on `npm run migrate:apply-corrections` and `npm run migrate:finalize-content` to produce markdownlint-clean staged migration output for generated content.
- Batch promotion via `rsync -a migration/output/content/ src/content/` now inherits the improved Markdown normalization rather than carrying forward the pre-fix lint defects.
- The PR markdownlint gate still applies to authored analysis or ticket Markdown; those files remain outside the migration output correction scope.

## Verification

1. Ran `npm run migrate:map-frontmatter && npm run migrate:finalize-content` to regenerate the staged corpus from converted JSON.
2. Ran `npx markdownlint-cli2 "$(git diff --name-only origin/main...HEAD -- 'migration/output/content/**/*.md')"` equivalent scope and verified the generated-content changed-markdown set reached 0 errors.
3. Synced the staged corpus into `src/content/` with `rsync -a migration/output/content/ src/content/`.
4. Ran the full PR markdown scope and confirmed the remaining failures moved out of generated content and into one authored analysis document, which was then normalized.

## Related files

- `package.json`
- `scripts/migration/apply-content-corrections.js`
- `docs/migration/RUNBOOK.md`
- `migration/output/content/`
- `src/content/`