# Article Fidelity Re-Audit - 2026-03-17

## Change summary

Ran a fresh rendered-body parity audit of all 151 article routes against the current live WordPress site and the current local Hugo preview, then cleaned the two angle-bracket example rows that were still causing avoidable audit noise.

This re-audit produced:

- `migration/reports/phase-8-article-fidelity-reaudit-2026-03-17.csv`
- `migration/reports/phase-8-article-fidelity-reaudit-summary-2026-03-17.csv`
- `tmp/phase-8-article-fidelity-reaudit-2026-03-17-details.json`

## Why this changed

The repository already had prior article-fidelity audits, follow-ups, and a same-day critical rerun, but the user requested another pass to verify that the current site state still holds up under a stricter review.

This rerun intentionally kept the scope narrow:

- H1 drift is expected and does not drive failure status.
- Route URL drift is expected and does not drive failure status.
- The audit focuses on reader-visible article-body fidelity, code examples, and presentation defects.

## Behavior details

### Comparison contract

1. Compare live `.speachify-content` against local `section.article-body`.
2. Reuse the 151-article critical inventory so the result is comparable to previous reruns.
3. Reopen rows only for reader-facing body, code, or presentation issues:
   - missing local article body
   - code-block loss or severe code drift
   - literal markdown leakage
   - visible malformed URLs or endpoint examples
   - naked media-file URLs shown in article prose
   - no-baseline local-only scope exceptions
4. Manually verify automation-reopened rows when the detector flags angle-bracket example URLs that may still be readable and copy-safe.

### Behavior before the cleanup

The fresh rerun initially reopened three rows:

1. `/mastering-sitemaps-in-sfcc/`
2. `/the-createorders-api-in-sfcc/`
3. `/phase-3-performance-baseline/`

The first two rows were not true content-loss defects, but they still rendered angle-bracketed visible examples that the audit continued to classify as malformed URL text.

### Behavior after the cleanup

Both article sources were normalized so the examples render as cleaner prose:

1. `/mastering-sitemaps-in-sfcc/`
   The hostname example now uses readable inline code, and the robots.txt example now uses linked prose instead of an angle-bracketed visible URL.
2. `/the-createorders-api-in-sfcc/`
   The trusted-system and createOrders endpoint bullets now use descriptive linked labels instead of angle-bracketed visible endpoint strings.

After rerunning the audit, both rows now close automatically as `pass` with no raw-presentation findings.

The remaining open row is unchanged from previous audits:

1. `/phase-3-performance-baseline/`
   The local route is a scaffold fixture and the live site returns a 404 instead of a comparable article baseline, so it remains a scope exception rather than a parity defect.

### Spot-check evidence beyond the reopened rows

Manual spot checks also confirmed that previously fixed higher-risk rows remain stable:

1. `/sfcc-url-cracking-the-code/`
   The malformed example-path text seen in earlier reruns is no longer present.
2. `/what-is-new-in-the-23-8-commerce-cloud-release/`
   The prior raw `.mp4` leak no longer appears in visible article prose on either live or local.

## Impact

- No new critical article-fidelity regressions were confirmed in the current site state.
- The two previously accepted angle-bracket rows no longer need manual waiver handling in the rerun tracker.
- The only remaining open row is still the accepted scaffold-only scope exception.
- The rerun tracker is now clean on raw-presentation findings, which should reduce repeat audit churn on future passes.

## Verification

1. Start the local preview with `hugo server --bind 127.0.0.1 --baseURL http://localhost:1313 --disableFastRender`.
2. Run `node tmp/run-article-fidelity-reaudit-2026-03-17.mjs` from the repository root.
3. Review `migration/reports/phase-8-article-fidelity-reaudit-summary-2026-03-17.csv` for final counts.
4. Review `migration/reports/phase-8-article-fidelity-reaudit-2026-03-17.csv` for row-level evidence and classifications.
5. Confirm the cleaned rows now pass without manual reconciliation:
   - `https://www.rhino-inquisitor.com/mastering-sitemaps-in-sfcc/` versus `http://localhost:1313/mastering-sitemaps-in-sfcc/`
   - `https://www.rhino-inquisitor.com/the-createorders-api-in-sfcc/` versus `http://localhost:1313/the-createorders-api-in-sfcc/`
6. Spot-check one repaired canary and one former raw-media row:
   - `https://www.rhino-inquisitor.com/sfcc-url-cracking-the-code/` versus `http://localhost:1313/sfcc-url-cracking-the-code/`
   - `https://www.rhino-inquisitor.com/what-is-new-in-the-23-8-commerce-cloud-release/` versus `http://localhost:1313/what-is-new-in-the-23-8-commerce-cloud-release/`
7. Confirm the only open row remains the scaffold exception at `http://localhost:1313/phase-3-performance-baseline/`.

## Related files

- `migration/reports/phase-8-article-fidelity-reaudit-2026-03-17.csv`
- `migration/reports/phase-8-article-fidelity-reaudit-summary-2026-03-17.csv`
- `tmp/phase-8-article-fidelity-reaudit-2026-03-17-details.json`
- `tmp/run-article-fidelity-reaudit-2026-03-17.mjs`
- `tmp/article-critical-rerun-2026-03-16.mjs`
- `analysis/documentation/phase-8/article-fidelity-critical-rerun-2026-03-17.md`
- `src/content/posts/mastering-sitemaps-in-sfcc/index.md`
- `src/content/posts/the-createorders-api-in-sfcc/index.md`