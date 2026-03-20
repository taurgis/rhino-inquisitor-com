# Phase 8 RC v2 Freeze Record

## Freeze Summary

| Field | Value |
| --- | --- |
| RC tag | `phase-8-rc-v2` |
| RC commit | `efdcefce5a51f1a3cf70d6b437b7b2868df39cb8` (`efdcefce`) |
| Freeze timestamp | `2026-03-20T19:04:18Z` |
| Frozen by | Thomas Theunen |
| Frozen manifest path | `migration/url-manifest.json` |
| Frozen manifest tag | `phase-6-redirect-map-v1` |
| Frozen manifest peeled commit | `3f29de0ccfb587956ea405813dd27426edf98f61` (`3f29de0c`) |
| Trigger for re-cut | RHI-088 performance-budget remediation |

This record captures the Phase 8 RC re-cut required after the RHI-088 Hugo template and performance-gate changes. It preserves the same frozen Phase 6 manifest input as `phase-8-rc-v1`, but records the new code/configuration snapshot and regenerated datasets used for the successful dual-profile Lighthouse and performance-budget pass.

## Toolchain

| Tool | Version / Evidence |
| --- | --- |
| Hugo | `hugo v0.157.0+extended+withdeploy darwin/arm64 BuildDate=2026-02-25T16:38:33Z VendorInfo=Homebrew` |
| Node runtime used for repo scripts | `v20.18.1` |
| `@lhci/cli` | `0.15.1` |
| `@axe-core/playwright` | `4.11.1` |
| `html-validate` | `10.11.2` |
| `lighthouserc.json` checksum | `sha256:5868bbbee20ac03bf56188d00ba1f543a4b348d57dc948b8daf5af59475fe6f3` |

## RC Build Evidence

| Check | Result |
| --- | --- |
| Build command | `hugo --gc --minify --environment production --destination /tmp/rhi088-rc-v2.ifMjZ4/public` |
| Hugo build result | Exit `0` |
| Hugo reported duration | `516 ms` |
| Rounded wall-clock duration | `1 s` |
| Build output summary | `204` pages, `16` paginator pages, `591` non-page files, `17` static files, `372` processed images, `17` aliases |
| Top-level `index.html` | Present |
| Artifact validation command | `node scripts/phase-7/validate-artifact.js --public-dir /tmp/rhi088-rc-v2.ifMjZ4/public --report /tmp/rhi088-rc-v2.ifMjZ4/phase-8-rc-v2-artifact-validation.json --label phase-8-rc-v2` |
| Artifact validation result | Pass |
| Projected published size | `581.38 MB` |
| Compressed artifact size | `523.94 MB` |
| GitHub Pages published-site limit check | Within the official `1 GB` limit |
| Symlink / hard-link check | None detected |
| Artifact report | `validation/runs/phase-8-rc-v2-artifact-validation.json` |

## Publish Timing Baseline

RHI-088 re-used the inherited deployment timing baseline from the successful Phase 7 evidence run already recorded for Phase 8:

- Total workflow duration: `5m 59s`
- Build job duration: `5m 27s`
- Deploy job duration: `25s`
- Workflow run source: `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23282905074`

## Validation Datasets

| Artifact | SHA-256 |
| --- | --- |
| `validation/expected-url-outcomes.json` | `25875e3fdd85a2ed51c3e36dcb09fbb3e3d6fb8600657fac1b02163206163517` |
| `validation/sample-matrix.json` | `b39cd740ef1643030f97e5900600b1405a519e256e9ae0029c44c2567ad36eaf` |
| `validation/priority-routes.json` | `0bea211b2fca2f6fa1c3ed49c1b64fec9dcd195a2c81b66e5faff24d309d7a56` |
| `validation/runs/phase-8-rc-v2.json` | Recorded below as the machine-readable RC re-cut snapshot |

Dataset note:

- The re-cut keeps the owner-approved Phase 6 Model A request-aware exception posture intact.
- The dataset regeneration exists to re-pin WS-E evidence and any future RC-scoped reruns to `phase-8-rc-v2`.

## RHI-088 Gate Evidence

| Check | Result |
| --- | --- |
| Mobile Lighthouse thresholds | Pass |
| Desktop Lighthouse thresholds | Pass |
| Performance budget report | Pass |
| Performance report path | `validation/performance-budget-report.json` |
| LHCI report root | `validation/lhci-report/` |

Key budget outcomes from the committed report:

- Homepage critical-path transfer: `109034` bytes (`106.48 KB`)
- Article critical-path transfer: `131235` bytes (`128.16 KB`)
- Category critical-path transfer: informational only; no blocking failures

## Re-cut Protocol Note

This re-cut was required because RHI-088 remediated real template behavior after the original `phase-8-rc-v1` freeze. Future workstreams that require fresh RC-scoped evidence should validate against `phase-8-rc-v2` unless and until another explicit Phase 8 RC re-cut is recorded.