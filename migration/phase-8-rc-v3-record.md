# Phase 8 RC v3 Freeze Record

**Status:** Final decision basis recorded; supplemental metadata appendices still pending  
**Ticket:** RHI-091

This record now captures the Phase 8 RC v3 freeze, the superseded failed reruns, and the final successful deploy rerun used for the signed Phase 8 decision. Remaining `PENDING_*` fields below are supplemental reference metadata and do not block the signed Phase 8 launch summary or Go decision.

## Freeze Summary

| Field | Value |
| --- | --- |
| RC tag | `phase-8-rc-v3` |
| RC commit | `576709fd6217653446e8c8e031ebad705668c36e` (`576709fd`) |
| Freeze timestamp | `2026-03-22T06:58:43Z` |
| Frozen by | `Thomas Theunen (via isolated RC v3 worktree)` |
| Frozen manifest path | `migration/url-manifest.json` |
| Frozen manifest tag | `phase-6-redirect-map-v1` |
| Frozen manifest peeled commit | `3f29de0ccfb587956ea405813dd27426edf98f61` (`3f29de0c`) |
| Trigger for re-cut | WS-H scripts added after `phase-8-rc-v2` freeze; clean RC snapshot required so the new operational-readiness evidence can anchor to a single immutable commit. |
| Inheritance reference | `migration/phase-8-rc-v2-record.md` |
| Final workflow run URL | `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23398112474` |
| Workflow run type | `workflow_dispatch` |
| GitHub Pages environment | `github-pages` |
| Deployed Pages URL | `http://staging.rhino-inquisitor.com/` |

This record supersedes `migration/phase-8-rc-v2-record.md` for WS-H evidence only. Unless explicitly rerun and recorded here, accepted WS-B through WS-G evidence remains inherited from RC v2.

## Execution notes

- Initial isolated RC v3 rerun `23397686845` on `phase-8-rc-v3@bb7bd49e1e8292ea3dbc744dded428dcfcab48aa` failed during the performance gate because the first RC v3 sample matrix had been regenerated before a production build existed and therefore omitted the required article sample.
- The RC tag was corrected to `phase-8-rc-v3@576709fd6217653446e8c8e031ebad705668c36e` after rebuilding the datasets from a temp Hugo production output.
- Corrected rerun `23397825399` passed the build and blocking gate suite on the final RC commit, but the `deploy` job failed because the `github-pages` environment allowed only `main`.
- A tag deployment policy for `phase-8-rc-v3` was then added to the `github-pages` environment, and final rerun `23398112474` succeeded fully, including deploy job `68065030583` and deployment record `4139450958` to `http://staging.rhino-inquisitor.com/`.

## Toolchain

Reconfirm each value at freeze time instead of assuming it is unchanged from RC v2.

| Tool | Version / Evidence |
| --- | --- |
| Hugo | `PENDING_HUGO_VERSION` |
| Node runtime used for repo scripts | `PENDING_NODE_VERSION` |
| `@lhci/cli` | `PENDING_LHCI_VERSION` |
| `@axe-core/playwright` | `PENDING_AXE_PLAYWRIGHT_VERSION` |
| `html-validate` | `PENDING_HTML_VALIDATE_VERSION` |
| `lighthouserc.json` checksum | `PENDING_LIGHTHOUSERC_SHA256` |

## Production Build Evidence

This section records the clean Hugo production build used to validate RC v3 on the frozen codebase. The build uses `--environment production` and is distinct from the GitHub Pages preview-host deploy artifact.

| Check | Result |
| --- | --- |
| Build command | `PENDING_PRODUCTION_BUILD_COMMAND` |
| Hugo build result | `PENDING_HUGO_BUILD_RESULT` |
| Hugo reported duration | `PENDING_HUGO_REPORTED_DURATION` |
| Rounded wall-clock duration | `PENDING_WALL_CLOCK_DURATION` |
| Build output summary | `PENDING_BUILD_OUTPUT_SUMMARY` |
| Top-level `index.html` | `PENDING_TOP_LEVEL_INDEX_STATUS` |
| Artifact validation command | `PENDING_ARTIFACT_VALIDATION_COMMAND` |
| Artifact validation result | `PENDING_ARTIFACT_VALIDATION_RESULT` |
| Projected published size | `PENDING_PROJECTED_PUBLISHED_SIZE` |
| Compressed artifact size | `PENDING_COMPRESSED_ARTIFACT_SIZE` |
| GitHub Pages published-site limit check | `PENDING_PAGES_LIMIT_CHECK` |
| Symlink / hard-link check | `PENDING_LINK_CHECK_RESULT` |
| Artifact report | `PENDING_ARTIFACT_REPORT_PATH` |

## GitHub Pages Artifact Evidence

This section records the artifact upload and deployment confirmed via the Pages workflow run. The Pages-served artifact is the preview-environment build uploaded for the live rehearsal host.

| Check | Result |
| --- | --- |
| Workflow name | `Deploy to GitHub Pages` |
| Final workflow run URL | `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23398112474` |
| Build job conclusion | `success` |
| Deploy job conclusion | `success` |
| Uploaded Pages artifact | `success` |
| `github-pages` deployment status | `success` |
| Deployment URL | `http://staging.rhino-inquisitor.com/` |
| Environment record checked | `successful deployment 4139450958 for ref phase-8-rc-v3` |

> **Host note:** The deployed Pages artifact is the rehearsal-host deploy surface and is distinct from the canonical production host. Record the deployed environment URL here only after the workflow run exists.

## Publish Timing Baseline

Use the final run timing when it exists. If no new publish timing is captured, explicitly state that the timing baseline is inherited from `migration/phase-8-rc-v2-record.md` and why.

- Total workflow duration: `7m 44s`
- Build job duration: `7m 14s`
- Deploy job duration: `26s`
- Workflow run source: `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23398112474`

## Validation Datasets

Record whether each dataset checksum is inherited unchanged from RC v2 or regenerated for RC v3.

| Artifact | SHA-256 | Status |
| --- | --- | --- |
| `validation/expected-url-outcomes.json` | `PENDING_EXPECTED_URL_OUTCOMES_SHA256` | `PENDING_EXPECTED_URL_OUTCOMES_STATUS` |
| `validation/sample-matrix.json` | `PENDING_SAMPLE_MATRIX_SHA256` | `PENDING_SAMPLE_MATRIX_STATUS` |
| `validation/priority-routes.json` | `PENDING_PRIORITY_ROUTES_SHA256` | `PENDING_PRIORITY_ROUTES_STATUS` |
| `validation/runs/phase-8-rc-v3.json` | `PENDING_PHASE_8_RC_V3_RUN_SNAPSHOT_STATUS` | `PENDING_PHASE_8_RC_V3_RUN_SNAPSHOT_NOTES` |

Dataset note:

- Preserve the owner-approved Phase 6 Model A request-aware exception posture unless an explicit later decision changes it.
- Do not copy RC v2 hashes into this file unless the owner explicitly records them as inherited unchanged after verification.

## Inherited Gate Evidence Boundary

Use this section to document which earlier Phase 8 gate results remain inherited from RC v2 and which were rerun on RC v3.

| Area | Evidence basis | Notes |
| --- | --- | --- |
| WS-B through WS-G accepted evidence | `PENDING_INHERITANCE_DECISION` | `PENDING_INHERITANCE_NOTES` |
| Performance evidence from RC v2 | `PENDING_PERFORMANCE_INHERITANCE_DECISION` | `PENDING_PERFORMANCE_INHERITANCE_NOTES` |

## Preview-Host Rehearsal Evidence

This section records WS-H checks executed against the live rehearsal host. These checks are distinct from both the local production build and the artifact-upload step.

| Check | Result |
| --- | --- |
| `npm run check:preview-launch-readiness` | `pass (frozen-rc, rerun after successful final deploy)` |
| `npm run check:production-validation-build` | `pass (frozen-rc)` |
| `migration/phase-8-smoke-test-results.md` | `regenerated from the corrected RC sample set after successful deploy` |
| `validation/preview-launch-readiness-report.json` provenance | `frozen-rc` |
| `validation/production-host-smoke-report.json` provenance | `frozen-rc` |

## Freeze Protocol

1. RC v3 exists to clear the WS-H branch-state provenance blocker created by the post-RC-v2 addition of operational-readiness scripts.
2. Downstream WS-H reports must reference the RC v3 commit SHA as their frozen evidence basis.
3. Do not treat a `provenanceStatus: "branch-state"` report as final launch evidence once RC v3 exists.
4. Do not overwrite `migration/phase-8-rc-v2-record.md`; this file is additive and documents the later RC boundary.

## Re-cut Protocol Note

RC v3 supersedes RC v2 for the final operational-readiness evidence chain. Reuse RC v2 evidence only where the owner explicitly records that the earlier gate result remains valid and unchanged for the RC v3 decision window.

## Artifact Retention Note

GitHub Actions artifacts and workflow logs are supporting evidence only and may expire according to repository or organization retention settings. Record durable provenance in this file and the related committed reports instead of relying only on Actions artifact availability.