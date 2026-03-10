# RHI-034 HTML-to-Markdown Conversion Implementation

## Change summary

RHI-034 now has a deterministic HTML-to-Markdown conversion pipeline. The implementation adds `npm run migrate:convert`, validates converted record payloads against a dedicated schema, writes one JSON artifact per converted record under `migration/output/`, and emits a CSV fallback queue at `migration/reports/conversion-fallbacks.csv`.

## Why this changed

Phase 4 needed a stable, rule-governed bridge between normalized WordPress HTML and the downstream front matter and file-writing workstreams. Without a converter that understands this corpus's real Gutenberg wrappers, shortcode usage, code samples, and Goldmark constraints, later migration work would either duplicate HTML parsing logic or silently lose content fidelity.

## Behavior details

Old behavior:

- Phase 4 stopped at normalized `bodyHtml` records.
- No repository entry point converted normalized HTML into Goldmark-safe Markdown.
- No fallback queue or converted-record contract existed for Workstream D and later batch work.

New behavior:

- `scripts/migration/convert.js` converts in-scope `keep` and `merge` records from `migration/intermediate/records.normalized.json` into individual JSON artifacts under `migration/output/`.
- The converter uses `cheerio` DOM cleanup before `turndown` with `@joplin/turndown-plugin-gfm`, preserves tables, lists, and fenced code blocks, normalizes body headings so `h1` stays reserved for templates, and logs non-blocking conversion warnings in the per-record output.
- WordPress wrapper comments are stripped, presentation-only wrappers and inline styles are removed, known shortcode types in the current corpus (`matomo_opt_out`, `cmplz-document`) become explicit Markdown notes, and literal technical examples like `<iscache>` or `<iframe>` are escaped to inline code so Hugo Goldmark can render them with raw HTML disabled.
- The fallback mechanism remains implemented for unknown iframes or future unsupported conversion fragments, but the validated 2026-03-10 full run produced a zero-row fallback report.

## Impact

- Workstream D can now consume deterministic `bodyMarkdown` content instead of reparsing `bodyHtml`.
- Batch planning gains an explicit fallback queue contract and per-record warning metadata for manual review workflows.
- Hugo-facing conversion risk is reduced because representative Markdown was verified against Goldmark before the ticket was closed.

## Verification

- Ran `npm run migrate:convert` successfully on the full normalized dataset.
- Verified `migration/output/` contains 193 converted keep/merge JSON records.
- Verified `migration/reports/conversion-fallbacks.csv` exists and contains zero data rows on the validated full run.
- Verified full-run warning distribution is:
  - `missing-image-alt`: 211
  - `shortcode-converted-to-note`: 2
- Verified rerun stability by hashing all generated `migration/output/*.json` files plus `migration/reports/conversion-fallbacks.csv` before and after a repeat run; hashes remained unchanged.
- Verified a 10-record representative Hugo Goldmark spot-check completed with zero `warning-goldmark-raw-html` warnings.

## Related files

- `scripts/migration/convert.js`
- `scripts/migration/schemas/converted-record.schema.js`
- `package.json`
- `docs/migration/RUNBOOK.md`
- `migration/output/`
- `migration/reports/conversion-fallbacks.csv`
- `analysis/tickets/phase-4/RHI-034-html-to-markdown-conversion.md`