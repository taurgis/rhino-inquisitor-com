# RHI-045 Formatting-Fidelity Signature Remediation (2026-03-12)

## Change summary

- Updated `scripts/migration/convert.js` and `scripts/migration/apply-content-corrections.js` to remediate the first formatting-fidelity backlog signature set in the durable pipeline.
- Targeted signatures: dismiss-button leakage, flattened callout titles/alert blocks, adjacent OCAPI/SCAPI scoreboard bold runs, spaced note-marker corruption, joined emphasis word boundary, and malformed angle-bracket code in the eCDN article.

## Why this changed

- These six signatures were confirmed pipeline defects in generated staged content.
- Fixes must survive reruns of the standard flow and must not rely on one-off edits in generated Markdown.

## Behavior details

### Old behavior

- Conversion and correction passes could leave residual `Dismiss alert` text in body content.
- Certain flattened callout labels were not reconstructed into callout blocks.
- Some content lines retained malformed emphasis/code combinations such as `**OCAPI:**1**SCAPI:**`, `_**Note:** _ _`, `**guest**customer`, and `**`-wrapped angle-bracket code spans.

### New behavior

- `convert.js` now strips dismiss-button residue both during WordPress artifact stripping and post-Turndown markdown normalization.
- `convert.js` loose-alert label handling now includes the affected callout-title signatures (`Alias Configuration`, `APEX Domain Pointing / Naked Domain`, `Server to Server`, `Not all APIs are the same`, `ISO-8859-1`, `Encoding Might Differ`).
- `apply-content-corrections.js` now:
  - extends inline label/callout reconstruction for the same affected label set, with curated display casing for acronym-sensitive labels
  - preserves original paragraph line boundaries when no callout rewrite applies
  - normalizes the signature-specific emphasis defects (`_**Note:** _ _...`, `**OCAPI:**...**SCAPI:**...`, `**guest**customer`, and leaked `Dismiss alert` fragments)
  - normalizes malformed `**`-wrapped angle-bracket URL code patterns into valid Markdown code spans
  - avoids escaping valid Markdown autolinks while normalizing inline HTML tokens

## Impact

- Affected workflow: Phase 4 staged-content finalization after `migrate:map-frontmatter`, specifically `migrate:apply-corrections`.
- The six confirmed signatures are now pipeline-owned corrections rather than manual content edits.

## Verification

1. `node --check scripts/migration/convert.js`
2. `node --check scripts/migration/apply-content-corrections.js`
3. `npm run migrate:apply-corrections`
4. Targeted six-signature scan over `migration/output/content/posts/**/*.md`

Observed result on 2026-03-12:

- Correction script pass completed successfully (`Scanned 191`, `Updated 23` on the second rerun).
- `npm run migrate:apply-corrections` still exits non-zero at the markdownlint phase due existing MD045 `no-alt-text` findings in staged content (outside this signature-remediation scope).
- Signature scan results: `0` hits for all six targeted signatures.

## Related files

- `scripts/migration/convert.js`
- `scripts/migration/apply-content-corrections.js`
- `migration/reports/content-corrections-summary.json`
- `analysis/documentation/phase-4/rhi-045-formatting-fidelity-signature-remediation-2026-03-12.md`
