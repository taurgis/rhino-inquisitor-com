# RHI-046 Formatting Fidelity Signature Remediation

## Change summary

This update hardens the migration pipeline against the confirmed formatting-fidelity signature set from the live-vs-Markdown audit. The implementation changes both the conversion stage and the staged-content correction stage so the fixes survive reruns instead of depending on manual Markdown edits.

The targeted signatures were:

- leaked `Dismiss alert` button text
- flattened callout titles and alert blocks
- adjacent `OCAPI` / `SCAPI` scoreboard bold runs
- spaced note-marker corruption
- joined emphasis word boundary in `**guest**customer`
- malformed angle-bracket URL rendering in the eCDN article

## Why this changed

The previous audit confirmed that these signatures were present in both `migration/output/content` and `src/content`, which showed they were durable pipeline defects rather than one-off sync drift. The existing pipeline already fixed some of the affected patterns heuristically, but not enough of the callout-title vocabulary or the URL-in-emphasis case to clear the known six-page set.

## Behavior details

### Old behavior

- `convert.js` could miss image-prefixed alert titles and several multi-word alert labels, leaving callout semantics flattened into prose.
- `apply-content-corrections.js` did not recognize the full confirmed label set for inline callout reconstruction.
- URLs wrapped in emphasis could be converted into malformed autolink-like tokens during bare-URL normalization.
- Adjacent generated callouts could emit blank lines between blockquote-based alerts, which triggered `markdownlint` `MD028` on rerun.

### New behavior

- `convert.js` now splits mixed image-plus-text lines before loose-alert promotion, which lets the converter recognize image-prefixed alert titles such as the eCDN APEX-domain warning.
- `convert.js` recognizes the remaining safe single-alert labels needed for the confirmed signature set without swallowing known multi-label paragraphs that are better handled later.
- `apply-content-corrections.js` recognizes the remaining confirmed multi-word labels and reconstructs them into adjacent GFM alerts.
- `apply-content-corrections.js` preserves emphasized bare URLs as valid autolinks inside emphasis, preventing malformed `**\`<https://...`**` output.
- Adjacent reconstructed callouts no longer emit blank lines between alert blocks, which keeps the staged Markdown `markdownlint`-clean.

## Impact

Impacted pipeline components:

- `scripts/migration/convert.js`
- `scripts/migration/apply-content-corrections.js`
- staged Markdown under `migration/output/content/**`

Impacted workflows:

- `npm run migrate:convert`
- `npm run migrate:map-frontmatter`
- `npm run migrate:finalize-content`

Operationally, this removes the confirmed six-signature set from staged content without requiring direct edits in generated Markdown.

## Verification

The following checks were run after implementation:

1. `node --check scripts/migration/convert.js`
2. `node --check scripts/migration/apply-content-corrections.js`
3. `npm run migrate:convert && npm run migrate:map-frontmatter && npm run migrate:finalize-content`
4. Targeted staged-post scan for the six confirmed signatures

Verification results:

- `markdownlint-cli2` completed with `0 error(s)` during `migrate:apply-corrections`
- staged signature scan results were all zero:
  - `dismiss_alert`
  - `flattened_callout_titles`
  - `adjacent_scoreboard`
  - `spaced_note_marker`
  - `guest_customer_join`
  - `broken_angle_code`

Representative staged outcomes after rerun:

- `migration/output/content/posts/lets-go-live-ecdn.md` now emits separate warning blocks for `Use the correct environment` and `Zone Creation with care`, and preserves `**<https://mybrand.com>**`
- `migration/output/content/posts/mail-attachments-in-b2c-commerce-cloud.md` now emits separate note blocks for `ISO-8859-1` and `Encoding Might Differ`
- `migration/output/content/posts/in-the-ring-ocapi-versus-scapi.md` now renders the OCAPI/SCAPI score lines with valid spacing

## Related files

- `scripts/migration/convert.js`
- `scripts/migration/apply-content-corrections.js`
- `migration/reports/content-corrections-summary.json`