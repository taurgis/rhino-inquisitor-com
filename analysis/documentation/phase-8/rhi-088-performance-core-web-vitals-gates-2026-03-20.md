# RHI-088 Performance And Core Web Vitals Gates

## Change summary

RHI-088 upgrades the repository's performance validation from a Phase 7-era single-profile, partially advisory Lighthouse setup to a Phase 8 blocking gate that evaluates the frozen sample-matrix homepage, first sampled post, and first sampled category on both mobile and desktop.

The change also replaces the old JS-budget-only check with a committed performance budget report under `validation/performance-budget-report.json`, and archives Lighthouse CI JSON and HTML output under `validation/lhci-report/` for CI retention.

## Why this changed

Phase 8 requires objective launch blockers for performance quality. The older setup was still tied to stale representative routes, lower thresholds, and a temporary report destination. That was not sufficient for release-candidate sign-off.

The updated contract keeps Lighthouse lab data as the launch gate and documents field Core Web Vitals as readiness evidence only, which matches the Phase 8 ticket scope and avoids treating sparse field data as a launch override.

## Behavior details

### Old behavior

- `lighthouserc.json` targeted `/sending-emails-from-sfcc/` and `/category/technical/` instead of the frozen Phase 8 sample matrix.
- Performance used an advisory threshold of 75 and did not block on SEO or Best Practices.
- Lighthouse output went to `tmp/lhci`.
- The existing performance budget check focused on a narrow JS budget plus markup assertions and did not emit the Phase 8 budget report contract.

### New behavior

- `lighthouserc.json` targets the Phase 8 deterministic routes: homepage, first sampled recent post, and first sampled category.
- Blocking Lighthouse assertions now require:
  - Performance >= 90
  - Accessibility >= 90
  - SEO >= 95
  - Best Practices >= 90
- The gate runs both mobile and desktop profiles with three runs and median aggregation.
- Lighthouse filesystem output is archived under:
  - `validation/lhci-report/mobile/`
  - `validation/lhci-report/desktop/`
- `scripts/phase-8/check-performance-budget.js` emits `validation/performance-budget-report.json` with:
  - dual-profile Lighthouse score summaries
  - lab LCP, INP, CLS, and TTI values
  - gzip-based critical-path transfer totals from the built `public/` artifact
  - WordPress Phase 1 baseline comparison notes by template family

## Impact

- Maintainers now get a hard failure in the Phase 7/8 deploy gate when either mobile or desktop Lighthouse assertions fail.
- GitHub Pages artifact upload remains blocked until the performance gate passes.
- CI now uploads a dedicated Phase 8 performance artifact bundle with 30-day retention.
- The budget gate blocks homepage and article templates at the 170 KB compressed target and records category budget findings as informational evidence.

## Verification

1. Run `npm run build:prod`.
2. Run `npm run check:perf:gate`.
3. Confirm these outputs exist:
   - `validation/lhci-report/mobile/manifest.json`
   - `validation/lhci-report/desktop/manifest.json`
   - `validation/performance-budget-report.json`
4. Confirm `.github/workflows/deploy-pages.yml` uploads `validation/lhci-report/` and `validation/performance-budget-report.json` with `retention-days: 30`.
5. Confirm `validation/performance-budget-report.json` records both mobile and desktop scores and the field-vs-lab CWV policy.

## Related files

- `lighthouserc.json`
- `.github/workflows/deploy-pages.yml`
- `package.json`
- `scripts/phase-8/run-lhci.js`
- `scripts/phase-8/run-performance-gates.js`
- `scripts/phase-8/check-performance-budget.js`
- `validation/README.md`
- `validation/lhci-report/`
- `validation/performance-budget-report.json`