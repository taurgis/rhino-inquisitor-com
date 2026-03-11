## Change summary

Added a durable post-generation correction stage for Phase 4 staged Markdown so the fixes previously applied manually in `migration/output/content/**` now survive reruns. The flow now normalizes fenced-code alignment, separates mixed image-and-prose paragraph blocks, repairs a known malformed-table artifact, applies curated image-alt overrides, and supports curated weak-link label overrides through a second CSV contract.

## Why this changed

Manual cleanup in generated Markdown was not durable because `npm run migrate:map-frontmatter` recreates `migration/output/content/` on every run. That meant code-block fixes, image paragraph fixes, malformed-table cleanup, and improved alt text had to be reapplied by hand after regeneration. The remaining weak-link warnings also needed a curated workflow instead of unsafe heuristic rewrites.

## Behavior details

### Old behavior

- `npm run migrate:map-frontmatter` generated staged Markdown into `migration/output/content/`.
- `npm run migrate:rewrite-media` and `npm run migrate:rewrite-links` updated staged Markdown references, but no script normalized code fences or mixed image paragraphs afterward.
- Improved image alt text only existed as manual content edits and could be lost on rerun.

### New behavior

- `npm run migrate:apply-corrections` now performs a deterministic final correction pass over staged Markdown in `migration/output/content/`.
- The correction pass now applies five behaviors.
- It strips wrapper-style blank-first-line and indentation artifacts from fenced code blocks.
- It splits mixed image-and-prose lines into separate Markdown paragraph blocks when the generator leaves them combined.
- It promotes the real header row when a generated Markdown table starts with an empty placeholder header row followed by the divider row.
- It applies curated image-alt overrides from `migration/input/image-alt-corrections.csv`.
- It applies curated weak-link label overrides from `migration/input/link-text-corrections.csv`.
- `npm run migrate:finalize-content` now provides the standard post-mapping sequence:
- `npm run migrate:rewrite-media`
- `npm run migrate:rewrite-links`
- `npm run migrate:apply-corrections`
- `npm run migrate:export-alt-corrections` can compare current reviewed staged content against a clean regenerated baseline to seed or refresh `migration/input/image-alt-corrections.csv`.
- `npm run migrate:export-link-text-corrections` seeds or refreshes `migration/input/link-text-corrections.csv` with every weak-link finding from the staged corpus.
- The CSV contract is occurrence-aware so repeated use of the same image path on one page can still receive distinct curated alt text. Matching is keyed by `page_url + image_src + occurrence_index`.
- The weak-link CSV is also occurrence-aware. Matching is keyed by `page_url + target + occurrence_index`, and rows with blank `corrected_text` are preserved as seed inventory until curated copy is supplied.

## Impact

- Affected workflow: Phase 4 staged Markdown preparation after `map-frontmatter`.
- Affected file: `scripts/migration/apply-content-corrections.js`
- Affected file: `scripts/migration/export-alt-text-corrections.js`
- Affected file: `scripts/migration/export-link-text-corrections.js`
- Affected file: `migration/input/image-alt-corrections.csv`
- Affected file: `migration/input/link-text-corrections.csv`
- Affected file: `migration/reports/content-corrections-summary.json`
- Affected file: `migration/reports/image-alt-corrections-audit.csv`
- Affected file: `migration/reports/link-text-corrections-audit.csv`
- Affected file: `docs/migration/RUNBOOK.md`
- Maintainers can now keep reviewed alt text in version control without relying on manual patching after every content regeneration.
- Maintainers can now review generic link labels in a CSV inventory instead of editing staged Markdown by hand.
- Batch tickets that rely on staged Markdown review should use `npm run migrate:finalize-content` after `npm run migrate:map-frontmatter`.

## Verification

1. Syntax validation:
   - `node --check scripts/migration/apply-content-corrections.js`
   - `node --check scripts/migration/export-alt-text-corrections.js`
   - `node --check scripts/migration/export-link-text-corrections.js`
2. Seed the curated alt-text CSV from current reviewed staged content:
   - `npm run migrate:export-alt-corrections -- --current-dir migration/output/content --baseline-dir tmp/rhi-correction-baseline-content --output-file migration/input/image-alt-corrections.csv`
3. Seed the weak-link correction inventory:
   - `npm run migrate:export-link-text-corrections`
4. Working staged corpus validation:
   - `npm run migrate:apply-corrections`
   - rerun `npm run migrate:apply-corrections` and confirm `migration/reports/content-corrections-summary.json` reports `filesChanged: 0`
   - `npm run check:a11y-content`
5. Fresh temp validation run:
   - `node scripts/migration/map-frontmatter.js --content-dir tmp/rhi-correction-validate-content`
   - `node scripts/migration/rewrite-media-refs.js --content-dir tmp/rhi-correction-validate-content`
   - `node scripts/migration/rewrite-links.js --content-dir tmp/rhi-correction-validate-content --report tmp/rhi-correction-link-rewrite-log.csv`
   - `node scripts/migration/apply-content-corrections.js --content-dir tmp/rhi-correction-validate-content --summary-report tmp/rhi-correction-summary.json --alt-audit-report tmp/rhi-correction-audit.csv`
   - `node scripts/migration/apply-content-corrections.js --content-dir tmp/rhi-correction-validate-content --summary-report tmp/rhi-correction-summary.idempotent.json --alt-audit-report tmp/rhi-correction-audit.idempotent.csv`
   - `hugo --minify --environment production --contentDir tmp/rhi-correction-validate-content --destination tmp/rhi-correction-public`
6. Fresh temp run results with current logic:
   - first correction pass updated `133` files
   - normalized `187` fenced blocks
   - split `57` mixed image-and-prose lines
   - applied `314` curated alt corrections
   - reported `0` unmatched alt corrections
   - idempotent rerun updated `0` files
7. 2026-03-11 accessibility follow-up on the working staged corpus:
   - `npm run migrate:export-link-text-corrections` exported `47` weak-link seed rows
   - `npm run migrate:apply-corrections` updated `4` files on the first rerun after the script change, auto-promoted `3` malformed table headers, and applied `1` curated alt correction
   - after curating descriptive link labels, `npm run migrate:apply-corrections` updated `37` files with `46` link-text replacements, and a follow-up ERD occurrence fix updated `1` file with `2` more replacements
   - `npm run check:a11y-content` now reports `0` blocking findings, `1` remaining weak-link warning, and `1` remaining multiline-table warning

## Related files

- `package.json`
- `scripts/migration/apply-content-corrections.js`
- `scripts/migration/export-alt-text-corrections.js`
- `scripts/migration/export-link-text-corrections.js`
- `migration/input/image-alt-corrections.csv`
- `migration/input/link-text-corrections.csv`
- `docs/migration/RUNBOOK.md`
