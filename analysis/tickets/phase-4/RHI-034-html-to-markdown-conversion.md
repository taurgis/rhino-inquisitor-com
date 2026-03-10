## RHI-034 · Workstream C — HTML-to-Markdown Conversion Engine

**Status:** Done  
**Priority:** Critical  
**Estimate:** L  
**Phase:** 4  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-16  
**Created:** 2026-03-07  
**Updated:** 2026-03-10

---

### Goal

Build a deterministic, rule-governed HTML-to-Markdown conversion engine that produces maintainable, semantically correct Markdown from WordPress `bodyHtml` content. The engine must handle WordPress-specific patterns (Gutenberg blocks, shortcodes, inline styles, legacy iframes) with explicit, documented rules — not silent transformations. Any conversion that cannot be handled cleanly must produce a controlled fallback fragment and be logged for manual review.

This is the most complex script in the pipeline. Quality here directly determines the fidelity and accessibility of all migrated content.

---

### Acceptance Criteria

- [x] Conversion script `scripts/migration/convert.js` exists and:
  - [x] Uses `turndown` with `@joplin/turndown-plugin-gfm` for base conversion
  - [x] Pre-processes `bodyHtml` with `cheerio` before Turndown (DOM-level cleanup)
  - [x] Preserves heading hierarchy: `h1` is reserved for template title; body content starts at `h2` or lower
  - [x] Preserves fenced code blocks with language identifier where detectable
  - [x] Preserves ordered/unordered lists and nested lists correctly
  - [x] Preserves GFM tables from HTML `<table>` elements
  - [x] Converts embedded media with a deterministic rule:
    - [x] YouTube/video iframes: convert to Hugo shortcode `{{< youtube id >}}` or plain link
    - [x] Unknown iframes: preserve as a commented-out `<!-- iframe: [url] -->` marker with manual review flag
  - [x] WordPress-specific handling:
    - [x] Strips Gutenberg block wrapper comments (`<!-- wp:... -->`)
    - [x] Strips `[caption]`, `[gallery]`, `[embed]` shortcodes or converts to Markdown equivalents
    - [x] Removes inline `<style>`, presentational `<span>`, `<div>` wrappers with no semantic meaning
    - [x] Removes `<!--more-->` WordPress read-more comments
    - [x] Removes `[…]` and `[Read more]` excerpt truncation patterns
  - [x] Raw HTML is disabled by default; any exception is explicit and sanitized
  - [x] Is idempotent across runs on the same input
  - [x] Exits with non-zero code and actionable errors if conversion fails for a record
- [x] Conversion fallback policy is implemented:
  - [x] Controlled HTML fallback fragment is preserved when semantic conversion fails
  - [x] Fallback records are written to `migration/reports/conversion-fallbacks.csv` with `sourceId`, `fallbackType`, and `manualReviewNote`
  - [x] Each fallback record requires an explicit owner assignment before it can be included in a merge batch
- [x] All converted records that pass validation are written to `migration/output/` as individual JSON objects (not yet as `.md` files — that is WS-D's job)
- [x] Image alt text extraction: every `<img>` `alt` attribute is preserved in the Markdown reference; missing alt text is logged as a warning (addressed further in WS-I)
- [x] Script is referenced in `package.json` as `npm run migrate:convert`
- [x] Markdown output can be parsed by Hugo's Goldmark renderer with zero errors on a 10-record spot-check

---

### Tasks

- [x] Audit a sample of 20 WordPress posts for conversion edge cases:
  - [x] Identify all Gutenberg block types in use
  - [x] Identify all shortcode types in use
  - [x] Identify all iframe embed sources in use
  - [x] Document findings in Progress Log before writing conversion rules
- [x] Create `scripts/migration/convert.js`:
  - [x] Configure Turndown options: `headingStyle: 'atx'`, `bulletListMarker: '-'`, `codeBlockStyle: 'fenced'`
  - [x] Register `@joplin/turndown-plugin-gfm` plugin
  - [x] Implement Cheerio pre-processing pipeline:
    - [x] Remove Gutenberg block wrapper comments
    - [x] Unwrap presentation-only `<div>` and `<span>` with inline styles
    - [x] Strip `<style>` and `<script>` tags
    - [x] Preserve semantic structure (`<table>`, `<ul>`, `<ol>`, `<code>`, `<pre>`)
  - [x] Implement shortcode handling rules (strip, convert, or flag per shortcode type)
  - [x] Implement iframe handling rules (YouTube shortcode or commented marker)
  - [x] Implement heading level normalization (shift `h1` body headings down by one)
  - [x] Implement fallback handler: wrap unresolvable HTML in `<!-- fallback -->` markers and log
- [x] Define conversion rule registry (map of shortcode/element → handler function) for maintainability
- [x] Run conversion on full normalized record set and review:
  - [x] Spot-check 10 output records for heading hierarchy, code blocks, tables, and list rendering
  - [x] Review `migration/reports/conversion-fallbacks.csv` — assign owners to all entries
  - [x] Re-run with fixes until fallback count is below the agreed per-batch cap
- [x] Add `"migrate:convert": "node scripts/migration/convert.js"` to `package.json`
- [x] Verify 10 sample converted records render correctly in Hugo Goldmark with zero raw-HTML warnings
- [x] Commit conversion script, updated `package.json`, and fallback report

---

### Out of Scope

- Generating Hugo front matter YAML (Workstream D — RHI-035)
- Writing final `.md` files to `src/content/` (Workstream D — RHI-035)
- Media file downloads (Workstream F — RHI-037)
- Image path rewriting (Workstream F — RHI-037)
- Internal link rewriting to canonical paths (Workstream G — RHI-038)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-031 Done — Phase 4 Bootstrap complete | Ticket | Done |
| RHI-033 Done — Normalized records available at `migration/intermediate/records.normalized.json` | Ticket | Done |
| `turndown`, `@joplin/turndown-plugin-gfm`, `cheerio` installed | Tool | Done |
| Hugo Goldmark configuration from RHI-021 (raw HTML policy confirmed) | Ticket | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Gutenberg block HTML wrappers produce noisy Markdown output | High | High | Audit block types on Day 1; add targeted Cheerio stripping rules before full conversion run | Engineering Owner |
| Nested shortcodes (e.g., `[gallery]` inside a `[caption]`) produce malformed output | Medium | Medium | Handle nested shortcode removal in Cheerio pre-processing; test with known complex records | Engineering Owner |
| Heading level shift breaks deeply nested content structure | Medium | Medium | Scan extracted records for `h1` usage in body before applying shift; warn if shift results in skipped levels | Engineering Owner |
| Large fallback count indicates a systemic conversion gap | High | High | Set batch cap at 5% fallback rate; halt and improve rules before proceeding if exceeded | Engineering Owner |
| YouTube iframes render as blocked content in Hugo's Goldmark with raw HTML disabled | Medium | Medium | Confirm Hugo shortcode approach with engineering owner before full run; test shortcode output on dev build | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-034 now has a validated HTML-to-Markdown conversion pipeline. The repository exposes `npm run migrate:convert`, which reads canonical normalized records, converts every in-scope `keep` and `merge` body to Goldmark-safe Markdown, and writes deterministic JSON payloads to `migration/output/` plus a fallback work queue at `migration/reports/conversion-fallbacks.csv`.

Validated 2026-03-10 full-run outcomes:

- 193 keep/merge records converted to output JSON
- 0 fallback entries in the validated full-run fallback report
- 213 warnings emitted across the corpus:
  - 211 `missing-image-alt`
  - 2 `shortcode-converted-to-note`
- 10-record Hugo Goldmark spot-check passed with zero raw-HTML warnings after converter normalization fixes
- Repeat full-run hash check confirmed idempotent output

**Delivered artefacts:**

- `scripts/migration/convert.js`
- `scripts/migration/schemas/converted-record.schema.js`
- `migration/reports/conversion-fallbacks.csv`
- Converted records in `migration/output/` (pre-front matter JSON)
- `package.json` updated with `migrate:convert` script
- `docs/migration/RUNBOOK.md` updated with the RHI-034 operational contract
- `analysis/documentation/phase-4/rhi-034-conversion-implementation-2026-03-10.md`

**Deviations from plan:**

- Goldmark validation was executed via a temporary Hugo build that exercised the same renderer path instead of a long-running `hugo server` session.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-10 | In Progress | Audited a 20-post sample before rule finalization and confirmed the current keep/merge corpus uses only Gutenberg `paragraph` and `heading` wrapper comments, two real shortcode types (`matomo_opt_out`, `cmplz-document`), and zero iframe embeds. |
| 2026-03-10 | Done | Implemented `npm run migrate:convert`, generated 193 converted JSON outputs with a zero-row fallback report, verified rerun stability, and passed a 10-record Goldmark spot-check with zero raw-HTML warnings. |

---

### Notes

- The editorial audit of 20 posts before writing conversion rules is not optional. Conversion rules written without inspecting real data will fail on edge cases that appear frequently in this specific site's content.
- Raw HTML rendering in Hugo's Goldmark must remain disabled by default. Any exception (e.g., a video embed with no shortcode equivalent) must be explicitly documented, scoped, and sanitized via the fallback mechanism.
- The conversion fallback list is not a cosmetic report — it is an explicit work queue. Every fallback entry with no assigned owner blocks the corresponding record from being included in a merge batch.
- Reference: `analysis/plan/details/phase-4.md` §Workstream C: HTML-to-Markdown Conversion
