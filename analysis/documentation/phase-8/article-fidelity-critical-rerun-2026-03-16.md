# Article Fidelity Critical Rerun - 2026-03-16

## Change summary

Reran the live-versus-local article audit against the current production site and the current local Hugo build, then rebuilt the queue around reader-facing defects instead of expected H1 or route drift.

After that baseline was established, remediated the two requested defect buckets in article content:

1. Literal markdown leaking into rendered prose
2. Naked media-file URLs leaking into rendered prose

This rerun produced:

- `migration/reports/phase-8-article-fidelity-critical-rerun-2026-03-16.csv`
- `migration/reports/phase-8-article-fidelity-critical-rerun-summary-2026-03-16.csv`
- `tmp/phase-8-article-fidelity-critical-rerun-2026-03-16-details.json`

## Why this changed

The existing phase-8 rerun already established that title/H1 drift and route-level URL drift are expected. This pass was done again to confirm there are no hidden reader-facing regressions in article body text, rendered code examples, or rendered presentation.

## Behavior details

### Comparison contract

1. Use the established 151-article scope from the earlier rerun inventory.
2. Compare live `.speachify-content` against local `section.article-body`.
3. Evaluate rendered prose and rendered `pre` code blocks separately.
4. Ignore expected H1 drift for the critical queue.
5. Keep only reader-facing issues open: naked media URLs, malformed visible URLs, literal markdown leaking into prose, missing rendered article bodies, or code-block loss.

### Manual review decisions applied

Three rows were automatically flagged for visible URL differences but were closed after direct rendered review because the examples remain readable and copy-safe:

1. `/mastering-sitemaps-in-sfcc/`
2. `/the-createorders-api-in-sfcc/`
3. `/the-sfcc-guide-to-finding-pod-numbers/`

Those rows stay visible in the CSV as `accepted-readable-url-drift`, but they are not part of the critical defect queue.

### Current outcome

- Scope reviewed: `151`
- Pass: `149`
- Needs review: `2`
- Fail: `0`
- High severity: `0`
- Medium severity: `1`
- Low severity: `1`
- Expected title/H1 drift rows: `45`
- Confirmed reader-facing regressions: `1`
- Scaffold exceptions: `1`

### Remediation outcome

The requested remediation buckets are now closed:

1. The four naked media-file URL rows were corrected and no longer render raw asset URLs in local article prose.
2. The eight markdown-render leak rows were corrected and no longer render visible markdown syntax in local article prose.

The residual queue is now limited to:

1. Malformed visible URL punctuation on `/sfcc-url-cracking-the-code/`.
2. `/phase-3-performance-baseline/`, which remains a local-only scaffold exception with no live WordPress baseline.

### Representative verification evidence

Post-fix rendered checks across all twelve edited routes confirmed:

1. `markdownLeakCount = 0` for every remediated markdown-leak route.
2. `mediaLeakCount = 0` for every remediated media-URL route.
3. The rerun reduced the queue from `14` open rows to `2` open rows after the accepted placeholder-URL closures were re-applied.

## Impact

- The two requested remediation buckets are fully cleared from the critical queue.
- No rendered code-block loss or missing article-body regression was introduced while fixing the content.
- The remaining actionable parity defect is now limited to one malformed visible URL example outside the requested buckets.

## Verification

1. Review `migration/reports/phase-8-article-fidelity-critical-rerun-2026-03-16.csv` for the per-article decision log.
2. Review `migration/reports/phase-8-article-fidelity-critical-rerun-summary-2026-03-16.csv` for the aggregate counts.
3. Re-run `node tmp/article-critical-rerun-2026-03-16.mjs` to regenerate the baseline report, then reapply the accepted placeholder-URL decisions for the three readable example rows.
4. Spot-check the twelve remediated routes in a local browser by reading `section.article-body` text and confirming there are no visible markdown markers or naked media-file URLs.
5. Treat title/H1 drift and the three accepted readable placeholder-URL rows as expected unless owner guidance changes.

## Related files

- `migration/reports/phase-8-article-fidelity-critical-rerun-2026-03-16.csv`
- `migration/reports/phase-8-article-fidelity-critical-rerun-summary-2026-03-16.csv`
- `tmp/phase-8-article-fidelity-critical-rerun-2026-03-16-details.json`
- `tmp/article-critical-rerun-2026-03-16.mjs`
- `migration/reports/phase-8-article-fidelity-rerun-2026-03-16.csv`
- `tmp/article-fidelity-rerun-2026-03-16-raw.json`