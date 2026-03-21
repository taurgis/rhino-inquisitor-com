# RHI-091 WS-H RC v3 Scope Isolation

## Change summary

This document records the current WS-H-only include set and the explicit non-WS-H exclude set for the planned `phase-8-rc-v3` clean rerun. It was created after live-fill preflight showed that the current branch contains broader Phase 8 and Phase 9 changes than the intended WS-H closeout boundary.

## Why this changed

The original RHI-091 closeout plan assumed the next RC cut could be taken from a branch whose delta from `phase-8-rc-v2` was limited to WS-H scripts, WS-H evidence artifacts, and related operational documentation. Preflight on 2026-03-21 showed that assumption is no longer true:

- the current diff from `phase-8-rc-v2` includes unrelated RHI-088, RHI-089, RHI-090, and Phase 9 files
- the working tree is not clean
- a local diagnostic gate run on the mixed branch failed at the Phase 8 accessibility axe gate, so the branch cannot be treated as a ready RC candidate as-is

## Behavior details

### Previous behavior

- The live-fill plan identified the order of operations for RC v3, but not the exact branch-scope boundary when unrelated work was present.
- The operator had to infer which files were safe to include in the WS-H-only RC candidate.

### New behavior

- This manifest defines the current WS-H-only candidate set to include in an isolated RC v3 preparation branch or worktree.
- It also lists the broader non-WS-H files that must remain outside the RC v3 candidate unless the owner explicitly broadens scope.
- It distinguishes diagnostic artifact churn produced by today's local gate run from files that are part of the intended WS-H operational-readiness slice.

## WS-H include set

These files are part of the current WS-H closeout slice or its directly supporting evidence scaffolding.

| Path | Reason |
|---|---|
| `package.json` | Adds the WS-H npm script entries for preview-launch-readiness and production-validation-build. |
| `scripts/phase-8/check-preview-launch-readiness.js` | WS-H live rehearsal smoke automation. |
| `scripts/phase-8/check-production-validation-build.js` | WS-H production-build cleanliness automation. |
| `validation/README.md` | Documents the new WS-H validation artifact contract. |
| `validation/preview-launch-readiness-report.json` | Current WS-H working evidence artifact. |
| `validation/production-host-smoke-report.json` | Current WS-H working evidence artifact. |
| `migration/phase-8-smoke-test-results.md` | Current WS-H human-readable smoke summary. |
| `migration/phase-8-exception-register.md` | WS-H launch blocker and warning register. |
| `migration/phase-8-go-nogo-decision.md` | WS-H final decision template. |
| `migration/phase-8-rc-v3-record.md` | WS-H RC v3 freeze scaffold. |
| `migration/phase-8-rollback-drill-result.md` | WS-H rollback drill scaffold. |
| `migration/phase-8-approver-roster.md` | WS-H owner-decision and sign-off references. |
| `LAUNCH-GATE-PASS-SUMMARY.md` | WS-H launch gate summary template. |
| `CUTOVER-VERIFICATION-CHECKLIST.md` | WS-H cutover checklist template. |
| `analysis/documentation/phase-8/rhi-091-operational-readiness-evidence-2026-03-21.md` | WS-H implementation and evidence doc. |
| `analysis/documentation/phase-8/rhi-091-clean-rerun-closeout-plan-2026-03-21.md` | WS-H clean rerun plan. |
| `analysis/documentation/phase-8/rhi-091-live-fill-command-checklist-2026-03-21.md` | WS-H live execution checklist. |
| `analysis/documentation/phase-8/rhi-091-wsh-rc-v3-scope-isolation-2026-03-21.md` | This isolation manifest. |
| `analysis/tickets/phase-8/RHI-091-operational-readiness-go-nogo.md` | WS-H ticket progress and acceptance tracking. |
| `analysis/tickets/phase-8/INDEX.md` | Phase 8 ticket index alignment for WS-H state. |

## Non-WS-H exclude set

These files are outside the WS-H-only RC v3 boundary and should not be bundled into the isolation candidate unless the owner explicitly broadens the RC scope.

| Path or group | Why excluded |
|---|---|
| `.github/workflows/deploy-pages.yml` | Broader workflow evolution outside the WS-H-only closeout slice. |
| `analysis/documentation/phase-8/rhi-088-performance-core-web-vitals-gates-2026-03-20.md` | RHI-088 documentation, not WS-H. |
| `analysis/documentation/phase-8/rhi-089-accessibility-markup-gates-2026-03-20.md` | RHI-089 documentation, not WS-H. |
| `analysis/documentation/phase-8/rhi-090-security-https-readiness-gates-2026-03-20.md` | RHI-090 documentation, not WS-H. |
| `analysis/tickets/phase-8/RHI-088-performance-core-web-vitals-gates.md` | RHI-088 ticket work. |
| `analysis/tickets/phase-8/RHI-089-accessibility-markup-conformance-gates.md` | RHI-089 ticket work. |
| `analysis/tickets/phase-8/RHI-090-security-https-readiness-gates.md` | RHI-090 ticket work. |
| `analysis/tickets/phase-8/RHI-092-phase-8-signoff.md` | Downstream Phase 8 signoff work. |
| `analysis/tickets/phase-9/**` | Phase 9 planning and bootstrap work. |
| `migration/phase-8-rc-v2-record.md` | Prior RC freeze artifact, not a WS-H addition. |
| `migration/phase-8-security-header-decision.md` | WS-G security decision artifact, not WS-H. |
| `scripts/phase-7/check-mixed-content.js` | Phase 7 mixed-content workstream change. |
| `scripts/phase-7/mixed-content-helpers.js` | Phase 7 helper addition, not WS-H. |
| `scripts/phase-7/run-all-gates.sh` | Broader gate-runner change not limited to WS-H. |
| `scripts/phase-8/check-accessibility-axe.js` | RHI-089 implementation. |
| `scripts/phase-8/check-html-conformance.js` | RHI-089 implementation. |
| `scripts/phase-8/check-https-security.js` | RHI-090 implementation. |
| `src/assets/styles/site.css` | Frontend styling change outside WS-H closeout scope. |
| `src/layouts/partials/site/header.html` | Template change outside WS-H closeout scope. |
| `src/layouts/shortcodes/realm-split-checklist-table.html` | Shortcode change outside WS-H closeout scope. |
| `validation/accessibility-axe-report.json` | RHI-089 artifact; also overwritten by today's mixed-branch diagnostic run. |
| `validation/accessibility-manual-checklist.md` | RHI-089 artifact. |
| `validation/expected-url-outcomes.json` | Broader RC dataset file; keep pinned to the owner-approved baseline until the isolated RC branch is prepared. |
| `validation/html-conformance-report.json` | RHI-089 artifact. |
| `validation/https-security-manual-evidence.json` | RHI-090 artifact. |
| `validation/https-security-report.json` | RHI-090 artifact. |
| `validation/lhci-report/**` | RHI-088 performance artifacts. |
| `validation/performance-budget-report.json` | RHI-088 artifact. |
| `validation/priority-routes.json` | Frozen dataset input outside the WS-H-only delta. |
| `validation/runs/phase-8-rc-v2-artifact-validation.json` | RC v2 artifact evidence, not WS-H. |
| `validation/runs/phase-8-rc-v2.json` | RC v2 machine-readable freeze snapshot. |
| `validation/sample-matrix.json` | Frozen dataset input outside the WS-H-only delta. |
| `analysis/documentation/phase-8/homepage-copy-font-baseline-2026-03-21.md` | Untracked design/copy work unrelated to WS-H. |

## Diagnostic churn to keep out of RC v3

The 2026-03-21 local `npm run gates:local` diagnostic on the mixed branch updated several validation outputs. Treat these as diagnostic churn, not as RC v3 candidate artifacts:

- `migration/reports/phase-5-pages-constraints-report.md`
- `migration/reports/phase-7-gate-summary.csv`
- `validation/accessibility-axe-report.json`
- `validation/html-conformance-report.json`
- `validation/redirect-quality-report.json`
- `validation/robots-sitemap-report.json`
- `validation/seo-consistency-report.json`
- `validation/social-preview-report.json`
- `validation/structured-data-report.json`
- `validation/url-parity-report.json`

These files should be regenerated only after the isolated RC v3 candidate exists and the clean rerun is intentionally executed.

## Accessibility classification note

The 2026-03-21 mixed-branch accessibility failure on `/sfcc-introduction/` should not be treated as a WS-H-only regression at this stage.

Current evidence points to a shared video-embed or third-party player issue outside the WS-H include set:

- the route content at `src/content/posts/sfcc-introduction/index.md` uses the shared `video-embed` shortcode
- the shortcode in `src/layouts/shortcodes/video-embed.html` emits a plain `youtube-nocookie` `iframe` with a title and no custom ARIA on player-internal nodes
- the built artifact at `public/sfcc-introduction/index.html` likewise contains only the `iframe`, not the failing `#movie_player` node
- the current accessibility report shows the blocking `aria-prohibited-attr` finding on the loaded player runtime DOM and the same rule appears on other video routes as warnings

Working classification:

- root-cause ownership is likely outside WS-H and closer to the shared accessibility or video-embed path
- WS-H still remains blocked if the isolated rerun fails, but the current mixed-branch failure must not be used to broaden the WS-H-only RC candidate automatically
- the remaining proof step is a clean-control rerun on the isolated candidate or a clean `phase-8-rc-v2` comparison using the same axe gate

## Recommended isolation path

1. Start from a clean branch or worktree that does not include the non-WS-H exclude set.
2. Apply only the WS-H include set listed above.
3. Re-run preflight and confirm `git diff --name-only phase-8-rc-v2..HEAD` contains only the intended WS-H scope.
4. Do not carry today's mixed-branch diagnostic artifacts forward as frozen evidence.
5. Only after the isolated branch is clean should the owner create the `phase-8-rc-v3` tag and proceed with the live-fill checklist.

## Impact

- The RC v3 preparation path now has an explicit branch-scope contract instead of a verbal assumption.
- This reduces the risk of bundling unrelated accessibility, security, performance, template, and Phase 9 work into the WS-H-only clean rerun.
- It also preserves the difference between diagnostic mixed-branch output and intentional frozen-RC evidence.

## Verification

Use this manifest when preparing the isolated RC v3 candidate.

Minimum checks:

1. `git diff --name-only phase-8-rc-v2..HEAD` on the isolation branch matches the WS-H include set.
2. None of the listed exclude-set files appear in the RC v3 candidate diff.
3. The working tree is clean before the RC tag is created.
4. The clean rerun uses freshly generated reports instead of today's mixed-branch diagnostic churn.

## Related files

- `analysis/documentation/phase-8/rhi-091-clean-rerun-closeout-plan-2026-03-21.md`
- `analysis/documentation/phase-8/rhi-091-live-fill-command-checklist-2026-03-21.md`
- `analysis/documentation/phase-8/rhi-091-operational-readiness-evidence-2026-03-21.md`
- `analysis/tickets/phase-8/RHI-091-operational-readiness-go-nogo.md`
- `scripts/phase-8/check-preview-launch-readiness.js`
- `scripts/phase-8/check-production-validation-build.js`
- `migration/phase-8-exception-register.md`
- `migration/phase-8-rc-v3-record.md`
- `migration/phase-8-rollback-drill-result.md`
- `LAUNCH-GATE-PASS-SUMMARY.md`
- `CUTOVER-VERIFICATION-CHECKLIST.md`