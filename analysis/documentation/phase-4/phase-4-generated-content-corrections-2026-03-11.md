## Change summary

Added a durable post-generation correction stage for Phase 4 staged Markdown so the fixes previously applied manually in `migration/output/content/**` now survive reruns. The new flow normalizes fenced-code alignment, separates mixed image-and-prose paragraph blocks, and applies curated image-alt overrides from a CSV contract.

## Why this changed

Manual cleanup in generated Markdown was not durable because `npm run migrate:map-frontmatter` recreates `migration/output/content/` on every run. That meant code-block fixes, image paragraph fixes, and improved alt text had to be reapplied by hand after regeneration, which is not acceptable for batch migration work in RHI-043 through RHI-045.

## Behavior details

### Old behavior

- `npm run migrate:map-frontmatter` generated staged Markdown into `migration/output/content/`.
- `npm run migrate:rewrite-media` and `npm run migrate:rewrite-links` updated staged Markdown references, but no script normalized code fences or mixed image paragraphs afterward.
- Improved image alt text only existed as manual content edits and could be lost on rerun.

### New behavior

- `npm run migrate:apply-corrections` now performs a deterministic final correction pass over staged Markdown in `migration/output/content/`.
- The correction pass applies three behaviors:
  - strips wrapper-style blank-first-line and indentation artifacts from fenced code blocks
  - splits mixed image-and-prose lines into separate Markdown paragraph blocks when the generator leaves them combined
  - applies curated image-alt overrides from `migration/input/image-alt-corrections.csv`
- `npm run migrate:finalize-content` now provides the standard post-mapping sequence:
  - `npm run migrate:rewrite-media`
  - `npm run migrate:rewrite-links`
  - `npm run migrate:apply-corrections`
- `npm run migrate:export-alt-corrections` can compare current reviewed staged content against a clean regenerated baseline to seed or refresh `migration/input/image-alt-corrections.csv`.
- The CSV contract is occurrence-aware so repeated use of the same image path on one page can still receive distinct curated alt text. Matching is keyed by `page_url + image_src + occurrence_index`.

## Impact

- Affected workflow: Phase 4 staged Markdown preparation after `map-frontmatter`.
- Affected files and artifacts:
  - `scripts/migration/apply-content-corrections.js`
  - `scripts/migration/export-alt-text-corrections.js`
  - `migration/input/image-alt-corrections.csv`
  - `migration/reports/content-corrections-summary.json`
  - `migration/reports/image-alt-corrections-audit.csv`
  - `docs/migration/RUNBOOK.md`
- Maintainers can now keep reviewed alt text in version control without relying on manual patching after every content regeneration.
- Batch tickets that rely on staged Markdown review should use `npm run migrate:finalize-content` after `npm run migrate:map-frontmatter`.

## Verification

1. Syntax validation:
   - `node --check scripts/migration/apply-content-corrections.js`
   - `node --check scripts/migration/export-alt-text-corrections.js`
2. Seed the curated alt-text CSV from current reviewed staged content:
   - `npm run migrate:export-alt-corrections -- --current-dir migration/output/content --baseline-dir tmp/rhi-correction-baseline-content --output-file migration/input/image-alt-corrections.csv`
3. Working staged corpus validation:
   - `npm run migrate:apply-corrections`
   - rerun `npm run migrate:apply-corrections` and confirm `migration/reports/content-corrections-summary.json` reports `filesChanged: 0`
   - fenced-code scan after the final heuristic adjustment reports `0` findings across `0` files
4. Fresh temp validation run:
   - `node scripts/migration/map-frontmatter.js --content-dir tmp/rhi-correction-validate-content`
   - `node scripts/migration/rewrite-media-refs.js --content-dir tmp/rhi-correction-validate-content`
   - `node scripts/migration/rewrite-links.js --content-dir tmp/rhi-correction-validate-content --report tmp/rhi-correction-link-rewrite-log.csv`
   - `node scripts/migration/apply-content-corrections.js --content-dir tmp/rhi-correction-validate-content --summary-report tmp/rhi-correction-summary.json --alt-audit-report tmp/rhi-correction-audit.csv`
   - `node scripts/migration/apply-content-corrections.js --content-dir tmp/rhi-correction-validate-content --summary-report tmp/rhi-correction-summary.idempotent.json --alt-audit-report tmp/rhi-correction-audit.idempotent.csv`
   - `hugo --minify --environment production --contentDir tmp/rhi-correction-validate-content --destination tmp/rhi-correction-public`
5. Fresh temp run results with current logic:
   - first correction pass updated `133` files
   - normalized `187` fenced blocks
   - split `57` mixed image-and-prose lines
   - applied `314` curated alt corrections
   - reported `0` unmatched alt corrections
   - idempotent rerun updated `0` files

## Related files

- `package.json`
- `scripts/migration/apply-content-corrections.js`
- `scripts/migration/export-alt-text-corrections.js`
- `migration/input/image-alt-corrections.csv`
- `docs/migration/RUNBOOK.md`
