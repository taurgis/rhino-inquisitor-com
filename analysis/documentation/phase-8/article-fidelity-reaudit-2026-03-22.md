# Article Fidelity Re-Audit - 2026-03-22

## Change summary

Executed a fresh full-scope article fidelity audit for the current live site versus the local Hugo preview, then closed the pass with a focused manual review addendum.

The combined evidence now includes three tracked datasets:

- text/code/presentation critical rerun CSV + summary for all 151 article routes
- visual structure compare CSV + summary for all 151 article routes with screenshot evidence for flagged rows
- manual review CSV + summary for the flagged route plus high-risk canary routes

This run produced:

- `migration/reports/phase-8-article-fidelity-reaudit-2026-03-22.csv`
- `migration/reports/phase-8-article-fidelity-reaudit-summary-2026-03-22.csv`
- `tmp/phase-8-article-fidelity-reaudit-2026-03-22-details.json`
- `migration/reports/phase-8-article-fidelity-visual-2026-03-22.csv`
- `migration/reports/phase-8-article-fidelity-visual-summary-2026-03-22.csv`
- `tmp/phase-8-article-fidelity-visual-2026-03-22-details.json`
- `tmp/phase-8-article-fidelity-visual-2026-03-22-screenshots/`
- `migration/reports/phase-8-article-fidelity-manual-review-2026-03-22.csv`
- `migration/reports/phase-8-article-fidelity-manual-review-summary-2026-03-22.csv`

## Why this changed

The owner requested another critical audit pass that explicitly compares both text and visual rendering between:

- live: `https://www.rhino-inquisitor.com`
- local: `http://localhost:1313`

The audit contract remains unchanged:

- H1 drift is expected and non-blocking by default.
- URL drift is expected and non-blocking by default.
- Focus remains on reader-facing body fidelity, code example integrity, and meaningful visual presentation defects.

## Behavior details

### Text and code comparison behavior

1. Compared live `.speachify-content` against local `section.article-body` for all 151 routes.
2. Reused the existing 151-route inventory to keep results comparable with prior runs.
3. Classified only reader-facing defects as actionable (missing body, code drift, malformed visible URL, markdown leakage, raw media URL exposure).

### Visual comparison behavior

1. Added a dedicated visual structure audit pass across all 151 routes.
2. Compared rendered article-body structure metrics (text length, code blocks, images, tables, iframes, headings, lists, blockquotes).
3. Excluded emoji-only image assets from image-count parity checks to avoid WordPress-theme false positives.
4. Captured paired live/local screenshots for every visual row marked `needs-review`.

### Manual review addendum behavior

1. Performed manual side-by-side route review after automation completed.
2. Reviewed the single open non-pass route plus critical and watchlist canaries.
3. Recorded route-level dispositions (`confirmed-pass`, `accepted-low-drift`, `accepted-exception`) in a dedicated manual-review CSV.

### Old versus new behavior

- Old (2026-03-17): full text/code critical rerun with one low-severity scaffold exception and no confirmed critical regressions.
- New (2026-03-22): repeated full text/code critical rerun with the same closure state, added a full visual structure run with screenshot evidence, then added a manual closure pass over the flagged row and canaries.

### Current run results

Text/code rerun summary (`phase-8-reaudit-2026-03-22`):

- scope: 151
- pass: 150
- needs review: 1
- fail: 0
- confirmed regressions: 0
- open row: scaffold-only baseline exception at `/phase-3-performance-baseline/`

Visual compare summary (`phase-8-visual-compare-2026-03-22`):

- scope: 151
- pass: 150
- needs review: 1
- high severity: 0
- medium severity: 0
- low severity: 1
- visual structure drift: 0
- open row: scaffold-only baseline exception at `/phase-3-performance-baseline/`

Manual review summary (`phase-8-manual-review-2026-03-22`):

- scope: 12 routes
- pass: 11
- needs review: 1
- fail: 0
- confirmed regressions: 0
- accepted low-drift rows: 4
- accepted exception rows: 1
- open row: scaffold-only baseline exception at `/phase-3-performance-baseline/`

## Impact

- No new critical article-fidelity regressions were identified in the current live-versus-local state.
- The audit tracker now includes a dedicated visual CSV and evidence screenshots in addition to the text/code rerun CSV.
- Manual review confirmed that previously suspicious canary pages remain reader-safe for body and code fidelity.
- Remaining open audit noise is still limited to the known scaffold fixture row without live article baseline.

## Verification

1. Start local preview:
   - `hugo server --bind 127.0.0.1 --baseURL http://localhost:1313 --disableFastRender`
2. Run text/code critical rerun:
   - `node tmp/run-article-fidelity-reaudit-2026-03-22.mjs`
3. Run visual compare:
   - `node tmp/run-article-visual-compare-2026-03-22.mjs`
4. Confirm text/code rollup in:
   - `migration/reports/phase-8-article-fidelity-reaudit-summary-2026-03-22.csv`
5. Confirm visual rollup in:
   - `migration/reports/phase-8-article-fidelity-visual-summary-2026-03-22.csv`
6. Confirm only open row in both datasets is:
   - `/phase-3-performance-baseline/`
7. Confirm screenshot evidence for the open visual row exists under:
   - `tmp/phase-8-article-fidelity-visual-2026-03-22-screenshots/phase-3-performance-baseline/`
8. Confirm manual review detail rows in:
   - `migration/reports/phase-8-article-fidelity-manual-review-2026-03-22.csv`
9. Confirm manual summary counts in:
   - `migration/reports/phase-8-article-fidelity-manual-review-summary-2026-03-22.csv`
10. Confirm the manual summary reports zero `fail` rows and zero confirmed regressions.

## Related files

- `tmp/run-article-fidelity-reaudit-2026-03-22.mjs`
- `tmp/run-article-visual-compare-2026-03-22.mjs`
- `migration/reports/phase-8-article-fidelity-reaudit-2026-03-22.csv`
- `migration/reports/phase-8-article-fidelity-reaudit-summary-2026-03-22.csv`
- `tmp/phase-8-article-fidelity-reaudit-2026-03-22-details.json`
- `migration/reports/phase-8-article-fidelity-visual-2026-03-22.csv`
- `migration/reports/phase-8-article-fidelity-visual-summary-2026-03-22.csv`
- `tmp/phase-8-article-fidelity-visual-2026-03-22-details.json`
- `tmp/phase-8-article-fidelity-visual-2026-03-22-screenshots/phase-3-performance-baseline/live.png`
- `tmp/phase-8-article-fidelity-visual-2026-03-22-screenshots/phase-3-performance-baseline/local.png`
- `migration/reports/phase-8-article-fidelity-manual-review-2026-03-22.csv`
- `migration/reports/phase-8-article-fidelity-manual-review-summary-2026-03-22.csv`