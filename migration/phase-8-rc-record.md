# Phase 8 RC Freeze Record

## Freeze Summary

| Field | Value |
| --- | --- |
| RC tag | `phase-8-rc-v1` |
| RC commit | `a510ead82a28f85718866e1f6af3f7dda03034b7` (`a510ead8`) |
| Freeze timestamp | `2026-03-20T13:55:41.285Z` |
| Frozen by | Thomas Theunen |
| Frozen manifest path | `migration/url-manifest.json` |
| Frozen manifest tag | `phase-6-redirect-map-v1` |
| Frozen manifest peeled commit | `3f29de0ccfb587956ea405813dd27426edf98f61` (`3f29de0c`) |
| Phase 7 gate evidence URL | `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23282905074` |

This record freezes the release-candidate inputs that downstream Phase 8 workstreams must use. No content, URL-map, or configuration change may be treated as part of this RC without creating a new commit, minting a new RC tag, and regenerating the datasets recorded below.

## Toolchain

| Tool | Version / Evidence |
| --- | --- |
| Hugo | `hugo v0.157.0+extended+withdeploy darwin/arm64 BuildDate=2026-02-25T16:38:33Z VendorInfo=Homebrew` |
| Node runtime used for repo scripts | `v20.18.1` |
| `@lhci/cli` | `0.15.1` |
| `@axe-core/playwright` | `4.11.1` |
| `html-validate` | `10.11.2` |
| `lighthouserc.json` checksum | `sha256:472b3dbffba18e4b699e83ca75d56df8701fd561a6d407686da550c76a6f1352` |

## RC Build Evidence

| Check | Result |
| --- | --- |
| Build command | `hugo --gc --minify --environment production --source tmp/phase-8-rc-v1-worktree --destination tmp/phase-8-rc-v1-worktree/tmp/phase-8-rc-v1-public` |
| Hugo build result | Exit `0` |
| Hugo reported duration | `7657 ms` |
| Rounded wall-clock duration | `8 s` |
| Build output summary | `204` pages, `16` paginator pages, `591` non-page files, `17` static files, `372` processed images, `17` aliases |
| Top-level `index.html` | Present |
| Artifact validation command | `node scripts/phase-7/validate-artifact.js --public-dir tmp/phase-8-rc-v1-worktree/tmp/phase-8-rc-v1-public --report validation/runs/phase-8-rc-v1-artifact-validation.json --label phase-8-rc-v1` |
| Artifact validation result | Pass |
| Projected published size | `581.39 MB` |
| Compressed artifact size | `523.94 MB` |
| GitHub Pages published-site limit check | Within the official `1 GB` limit |
| Symlink / hard-link check | None detected |
| Artifact report | `validation/runs/phase-8-rc-v1-artifact-validation.json` |

## Publish Timing Baseline

RHI-084 does not re-run a GitHub Pages publish for the frozen RC tag. The inherited deployment timing baseline remains the successful Phase 7 evidence run recorded above:

- Total workflow duration: `5m 59s`
- Build job duration: `5m 27s`
- Deploy job duration: `25s`
- Workflow run source: `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23282905074`

This inherited baseline remains within GitHub Pages' documented `10-minute` deployment timeout. If a future RC publish exceeds that limit, launch is blocked until the timeout risk is resolved.

## Validation Datasets

| Artifact | SHA-256 |
| --- | --- |
| `validation/expected-url-outcomes.json` | `7940b234ef6b5ead2fc0118744c601e0c64a87d336ef592c3d8709c8dea2b0b3` |
| `validation/sample-matrix.json` | `827c983333b9ae30849f99453d309e096e3089e150655025d733a432e2d44815` |
| `validation/priority-routes.json` | `85663b5c6ea6e28183152d36800e27a09800606580194163a133a6f65ca9fadb` |
| `validation/runs/phase-8-rc-v1.json` | Recorded below as the machine-readable RC run snapshot |

Dataset note:

- `validation/expected-url-outcomes.json` separates the intended canonical migration outcome from the build-level validation mode.
- `525` query-string legacy URLs remain tracked as `accepted-risk` request-aware exceptions under the owner-approved Model A GitHub Pages posture from `migration/phase-6-redirect-architecture-decision.md`.
- All non-query `keep`, alias-backed `merge`, and `retire` rows remain blocking build-validation scope for downstream gates.

## Freeze Protocol

1. Downstream Phase 8 workstreams must consume `phase-8-rc-v1` and the three validation datasets generated from that RC.
2. Treat `migration/url-manifest.json` at `phase-6-redirect-map-v1` as immutable input for WS-B and all later URL-based checks.
3. If content, URL mapping, or site configuration changes are required after this freeze, create a new commit, tag it `phase-8-rc-v2`, regenerate the datasets, and rerun all Phase 8 gates against the new RC.
4. Do not overwrite this record in place to describe a different RC.