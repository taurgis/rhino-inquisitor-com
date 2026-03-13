# RHI-054 Mobile-First and Core Web Vitals Implementation

## Change summary

RHI-054 adds a ticket-aligned mobile-first performance gate to the Phase 5 release path. The repository now validates representative homepage, article, and category routes with Lighthouse CI plus a static HTML/mobile-parity precheck before PR performance approval and before deploy-time Pages artifact publication.

## Why this changed

The previous performance baseline was advisory and incomplete for the RHI-054 acceptance criteria. It used a stricter but partial Lighthouse profile, targeted stale representative routes, and allowed PR workflow failures to pass with `continue-on-error`. That left mobile indexing regressions, missing mobile-visible metadata/schema, and hero-image loading mistakes outside the blocking Phase 5 gate.

## Behavior details

### Old behavior

- `lighthouserc.json` targeted `/`, `/phase-3-performance-baseline/`, and `/category/platform/`.
- Lighthouse assertions covered only LCP, CLS, and total blocking time.
- `npm run check:perf` was used in PR validation as a non-blocking baseline step.
- Static prechecks covered generic image dimensions, asset budgets, and external-script inventory only.
- Responsive `srcset` output was not emitted from the shared Hugo image partials.

### New behavior

- `lighthouserc.json` targets `/`, `/sending-emails-from-sfcc/`, and `/category/technical/`.
- Lighthouse assertions now enforce ticket-aligned FCP, LCP, CLS, Interactive, and accessibility thresholds, plus a warning threshold for performance score.
- `scripts/check-perf-report.js` turns representative Lighthouse reports into a blocking check when performance drops below 60 while keeping 60-74 as advisory.
- `scripts/check-perf-budget.js` now validates mobile-visible metadata, canonical/OG tags, required JSON-LD presence, representative content visibility, hero-image loading rules, and framework-free JS behavior from built HTML.
- Shared Hugo image rendering now emits responsive `srcset` and `sizes` values for processable local images, while article and featured images explicitly stay eager and high-priority.
- PR and deploy workflows now treat the performance gate as blocking and archive Lighthouse artifacts.

## Impact

- Maintainers get a blocking RHI-054 gate on representative mobile-first routes in both PR validation and deploy validation.
- Template changes that remove mobile-visible metadata/schema or regress hero-image loading now fail before deployment.
- Hugo image processing work increases because responsive variants are emitted for processable local images.
- Lighthouse artifacts are retained in CI for review when failures or warnings need investigation.

## Verification

1. Run `npm run check:perf` locally from the repository root.
2. Confirm the static precheck reports the three representative routes and exits successfully.
3. Confirm `tmp/lhci/manifest.json` and report files are produced.
4. Confirm PR workflow `performance` job fails on a broken threshold and uploads `pr-lhci-artifacts-*`.
5. Confirm deploy workflow blocks before Pages artifact upload if `npm run check:perf:gate` fails.

## Related files

- `lighthouserc.json`
- `package.json`
- `scripts/check-perf-budget.js`
- `scripts/check-perf-report.js`
- `src/layouts/partials/media/image.html`
- `src/layouts/_default/_markup/render-image.html`
- `src/layouts/_default/single.html`
- `src/layouts/home.html`
- `src/layouts/partials/cards/article-card.html`
- `.github/workflows/build-pr.yml`
- `.github/workflows/deploy-pages.yml`
- `analysis/tickets/phase-5/RHI-054-mobile-first-core-web-vitals.md`
