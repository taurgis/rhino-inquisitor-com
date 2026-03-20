# RHI-085 URL Parity and Redirect Integrity Gates

## Change Summary

RHI-085 added RC-aware URL parity and redirect quality gates for Phase 8, replaced the WS-B placeholder reports with committed JSON evidence, and wired those checks into the existing deployment gate flow and GitHub Actions artifact uploads. The implementation reuses the established Phase 6 Model A redirect posture instead of inventing a new edge-style redirect contract for GitHub Pages.

## Why This Changed

Before this change, the repository had Phase 6 and Phase 7 CSV-oriented validators and placeholder Phase 8 report files, but no RC-pinned WS-B evidence layer. The ticket prose also described `301`-style redirect expectations more broadly than GitHub Pages and Hugo aliases can prove on their own. Phase 8 needed a report format that preserved canonical migration intent while failing only on the build-validation behaviors the current stack can actually enforce.

## Behavior Details

### Previous Behavior

- `validation/url-parity-report.json` and `validation/redirect-quality-report.json` were bootstrap placeholders only.
- The repo had no `scripts/phase-8/check-url-parity.js` or `scripts/phase-8/check-redirect-quality.js` commands.
- `.github/workflows/deploy-pages.yml` uploaded Phase 7 audit artifacts only and did not archive Phase 8 WS-B reports with the required 30-day retention.
- Maintainers had to infer how Phase 8 should treat alias-backed redirects, request-aware query-string routes, and non-HTML resources from ticket prose plus earlier Phase 6/7 validators.

### New Behavior

- `scripts/phase-8/check-url-parity.js` reads `validation/expected-url-outcomes.json`, evaluates every row against the frozen `build_validation` contract, and writes `validation/url-parity-report.json` with RC provenance, per-row results, and blocking versus accepted-risk totals.
- `scripts/phase-8/check-redirect-quality.js` validates redirect-helper correctness, chain and loop safety, priority-route evidence from `validation/priority-routes.json`, non-HTML coverage, and redirect-retention policy evidence, then writes `validation/redirect-quality-report.json`.
- `scripts/phase-8/url-gate-helpers.js` centralizes the dataset-aware evaluation logic so WS-B consistently distinguishes canonical migration intent from Pages-verifiable build behavior.
- `scripts/phase-7/run-all-gates.sh` now runs the new Phase 8 commands as blocking production-artifact gates before later deploy checks.
- `.github/workflows/deploy-pages.yml` now uploads `validation/url-parity-report.json` and `validation/redirect-quality-report.json` as a dedicated Phase 8 artifact bundle with `retention-days: 30`.
- `validation/report-schema/README.md` now documents the WS-B JSON report shape instead of remaining a pure placeholder.

## Impact and Verification

### Impact

- WS-B now has committed machine-readable evidence tied to `phase-8-rc-v1` instead of relying on ticket interpretation.
- Maintainers can run `npm run check:url-parity:p8` and `npm run check:redirect-quality` locally and in CI against the standard production build path.
- WS-H and Phase 8 sign-off consumers can use the RC-tagged JSON reports directly when assembling launch evidence.
- The deploy workflow now preserves WS-B artifacts for 30 days without changing the official GitHub Pages artifact upload sequence.

### Verification

Verification completed for this change:

1. Built the frozen RC artifact from commit `a510ead82a28f85718866e1f6af3f7dda03034b7` in a detached worktree and ran both Phase 8 gate scripts against that artifact.
2. Confirmed `validation/url-parity-report.json` passes for all `1223` dataset rows (`698` blocking rows, `525` accepted-risk request-aware exceptions) with `0` blocking failures.
3. Confirmed `validation/redirect-quality-report.json` passes for all `141` redirect rows with `0` chains, `0` loops, `0` generic fallback redirects, `0` priority-route failures, and `0` non-HTML blocking failures.
4. Ran the repo-default production build and workflow-facing commands:
   - `hugo --cleanDestinationDir --gc --minify --environment production`
   - `npm run check:url-parity:p8`
   - `npm run check:redirect-quality`
5. Verified `.github/workflows/deploy-pages.yml` now uploads a dedicated `phase-8-url-validation-${{ github.sha }}` artifact bundle with `retention-days: 30`.

## Related Files

- `scripts/phase-8/url-gate-helpers.js`
- `scripts/phase-8/check-url-parity.js`
- `scripts/phase-8/check-redirect-quality.js`
- `scripts/phase-7/run-all-gates.sh`
- `.github/workflows/deploy-pages.yml`
- `package.json`
- `validation/README.md`
- `validation/report-schema/README.md`
- `validation/url-parity-report.json`
- `validation/redirect-quality-report.json`
- `analysis/tickets/phase-8/RHI-085-url-parity-redirect-integrity-gates.md`

## Assumptions and Open Questions

- No owner clarification was required during implementation because `validation/README.md` already defines `build_validation` as the executable WS-B contract for the current Model A stack.
- Runtime host-specific HTTP status validation remains a later concern for the actual deployment environment and is not claimed by these artifact-level Phase 8 reports.