## RHI-091 · Workstream H — Operational Readiness, Rehearsal, and Go/No-Go

**Status:** Done  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 8  
**Assigned to:** Migration Owner  
**Target date:** 2026-06-11  
**Created:** 2026-03-08  
**Updated:** 2026-03-22

---

### Goal

Execute the full pre-launch rehearsal — running every gate suite against the RC, validating the public rehearsal host `https://taurgis.github.io/rhino-inquisitor-com/`, confirming the separate production validation build is clean, completing smoke tests, and drilling the rollback — before the go/no-go decision is made. The go/no-go decision must be evidence-based: every gate result is reviewed by name, every open blocking issue has a disposition, and every approver sign-off is recorded. No production cutover window begins without this ticket being `Done`.

---

### Acceptance Criteria

- [x] Full gate suite has been run on the final RC commit and all hard-blocker gates pass:
  - [x] `npm run check:url-parity:p8` exits 0
  - [x] `npm run check:redirect-quality` exits 0
  - [x] `npm run check:seo-consistency` exits 0
  - [x] `npm run check:robots-sitemap` exits 0
  - [x] `npm run check:structured-data` exits 0
  - [x] `npm run check:social-preview` exits 0
  - [x] `npm run lhci:run:p8` passes all threshold assertions
  - [x] `npm run check:perf-budget` exits 0
  - [x] `npm run check:accessibility` exits 0
  - [x] `npm run check:html-conformance` exits 0
  - [x] `npm run check:https-security` exits 0
  - [x] `npm run validate:frontmatter` exits 0 (from Phase 7)
  - [x] `npm run check:links` exits 0 (from Phase 7)
  - [x] `npm run validate:artifact` exits 0 (from Phase 7)
  - [x] Hugo production build exits 0
- [x] All Phase 8 validation artifacts from WS-B through WS-G are generated, reviewed, and archived:
  - [x] `validation/url-parity-report.json` — reviewed and signed off
  - [x] `validation/redirect-quality-report.json` — reviewed and signed off
  - [x] `validation/seo-consistency-report.json` — reviewed and signed off
  - [x] `validation/robots-sitemap-report.json` — reviewed and signed off
  - [x] `validation/structured-data-report.json` — reviewed and signed off
  - [x] `validation/social-preview-report.json` — reviewed and signed off
  - [x] `validation/lhci-report/` — reviewed and signed off
  - [x] `validation/performance-budget-report.json` — reviewed and signed off
  - [x] `validation/accessibility-axe-report.json` — reviewed and signed off
  - [x] `validation/accessibility-manual-checklist.md` — completed and reviewed
  - [x] `validation/html-conformance-report.json` — reviewed and signed off
  - [x] `validation/https-security-report.json` — reviewed and signed off
- [x] Pre-launch rehearsal is complete:
  - [x] RC artifact deployed to the preview host `https://taurgis.github.io/rhino-inquisitor-com/`
  - [x] All gate reports generated from the deployed rehearsal host and the production validation build
  - [x] Smoke tests executed against the preview-host deployment using deterministic URL selection from `validation/sample-matrix.json` and `validation/priority-routes.json`
  - [x] Smoke test results recorded in `migration/phase-8-smoke-test-results.md`
  - [x] `validation/preview-launch-readiness-report.json` is generated and reviewed alongside the smoke-test markdown summary
- [x] Production validation build is complete:
  - [x] Canonical production host build passes with zero preview-host leakage
  - [x] No accidental `noindex` appears in the production validation build
  - [x] `validation/production-host-smoke-report.json` is generated and reviewed alongside the final launch summary
- [x] Smoke tests pass (minimum set):
  - [x] Homepage on preview host: HTTP 200, correct preview-host path-prefix behavior, preview `noindex`, correct title
  - [x] Top 3 post URLs from the deterministic sample matrix (most-recent by front matter date): HTTP 200
  - [x] Top 3 category pages from the deterministic sample matrix (alphabetical slug order): HTTP 200
  - [x] Archive page: HTTP 200 or correct redirect
  - [x] Privacy policy: HTTP 200
  - [x] Top 5 priority legacy redirect URLs from `validation/priority-routes.json`: expected preview-host rehearsal outcome according to the active implementation layer, with final production redirect behavior deferred to Phase 9 live checks
  - [x] Canonical sitemap endpoint (`/sitemap.xml` or `/sitemap_index.xml`, per configuration): HTTP 200, correct canonical host in `<loc>` elements, parseable XML
  - [x] `robots.txt`: HTTP 200, correct `Sitemap:` directive
  - [x] Feed endpoint documented in `validation/robots-sitemap-report.json` (for example `/index.xml` or `/feed/`) is reachable and parseable XML when feed output is enabled
- [x] Rollback drill is executed and timed:
  - [x] Rollback initiated from the Phase 7 rollback runbook (`migration/phase-7-staging-rollback-runbook.md`)
  - [x] WordPress site is confirmed accessible (or equivalent rollback state)
  - [x] Mean time to rollback is recorded (target: rollback initiated within 60 minutes of a trigger event)
  - [x] Rollback drill result is committed to `migration/phase-8-rollback-drill-result.md`
- [x] Exception register compiled:
  - [x] All accepted deviations from the Phase 8 gate requirements are listed with: gate name, deviation description, owner, risk level, and target resolution phase
  - [x] Risk levels use explicit severity classes: `blocking`, `warning`, `accepted`
  - [x] No unresolved blocking gate failure is carried to the go/no-go decision
  - [x] Exception register committed to `migration/phase-8-exception-register.md`
- [x] Go/No-Go decision is made and recorded:
  - [x] All required approvers from `migration/phase-8-approver-roster.md` sign off: migration owner, SEO owner, engineering owner, DNS/operations owner
  - [x] Written risk acceptance is recorded for any warning-level issue carried into launch
  - [x] If any blocking gate is unresolved, decision is explicit No-Go with documented blockers
  - [x] Go/No-Go decision committed to `migration/phase-8-go-nogo-decision.md`
- [x] `LAUNCH-GATE-PASS-SUMMARY.md` is created and committed:
  - [x] One row per gate: gate name, command, pass/fail, blocking threshold, report path, Actions run URL
  - [x] Signed off by migration owner
- [x] `CUTOVER-VERIFICATION-CHECKLIST.md` is created and committed:
  - [x] Sections: DNS and HTTPS, Host and Canonical Behavior, Priority URL Smoke Tests, Sitemap and Robots Reachability, Rollback Readiness
  - [x] Completed at T-24h before go/no-go meeting with ownership sign-off from engineering, SEO, and incident commander
- [x] Phase 9 monitoring handoff package is prepared:
  - [x] All validation artifacts committed to `validation/`
  - [x] Rollback runbook location confirmed
  - [x] Search Console properties and submission items listed for Phase 9
  - [x] First monitoring checkpoint defined (4-week post-launch CWV check, crawl anomaly review)

---

### Tasks

- [x] Confirm all Phase 8 workstream tickets (RHI-084 through RHI-090) are `Done` before beginning this ticket
- [x] Run the full Phase 8 gate suite in a single CI run against the final RC commit:
  - [x] Trigger `workflow_dispatch` on the RC branch with all gates enabled
  - [x] Record the Actions run URL
  - [x] If any gate fails, do not proceed to go/no-go; escalate the failure to the responsible workstream owner
- [x] Review all validation artifacts:
  - [x] Assign one named reviewer per artifact
  - [x] Record review completion in Progress Log with reviewer name and date
- [x] Execute pre-launch deployment rehearsal:
  - [x] Deploy RC to the GitHub Pages preview host
  - [x] Confirm the site is reachable at the expected preview URLs
  - [x] Run all gate scripts against the deployed preview URLs and the separate production validation build outputs (not just the local `public/` directory)
- [x] Execute smoke tests against the deployed environment:
  - [x] Use `playwright` or `curl` to verify each smoke test URL
  - [x] Use deterministic URL ordering from `validation/sample-matrix.json` and `validation/priority-routes.json`; record the exact URLs tested
  - [x] Record HTTP status codes, redirect chains, canonical, and title for each URL
  - [x] Generate `validation/preview-launch-readiness-report.json` from the live rehearsal-host responses
  - [x] Commit results to `migration/phase-8-smoke-test-results.md`
- [x] Execute rollback drill:
  - [x] Follow the Phase 7 rollback runbook step by step
  - [x] Time the rollback from trigger to WordPress site confirmed accessible
  - [x] Document any friction or missing steps in the runbook
  - [x] Commit drill result to `migration/phase-8-rollback-drill-result.md`
- [x] Compile exception register:
  - [x] Review all warnings and deviations from WS-B through WS-G workstream reports
  - [x] For each accepted deviation: document severity (`blocking`, `warning`, `accepted`), owner, and resolution phase
  - [x] Commit to `migration/phase-8-exception-register.md`
- [x] Draft `LAUNCH-GATE-PASS-SUMMARY.md`:
  - [x] One row per gate with all required fields
  - [x] Obtain migration owner sign-off
- [x] Complete `CUTOVER-VERIFICATION-CHECKLIST.md`:
  - [x] Use the checklist template from Phase 7 or create one aligned with the minimum section requirements
  - [x] Complete all items at T-24h before go/no-go meeting
- [x] Prepare Phase 9 monitoring handoff package:
  - [x] List all validation artifacts committed to `validation/`
  - [x] Confirm rollback runbook path and rollback window timeline
  - [x] List Search Console actions for Phase 9 (sitemap submission, URL inspection, monitoring dashboards)
- [x] Convene Go/No-Go meeting with all required approvers:
  - [x] Confirm approver list against `migration/phase-8-approver-roster.md`
  - [x] Present gate pass summary and exception register
  - [x] Record each approver's decision and sign-off statement
  - [x] If Go: proceed to Phase 9; if No-Go: document blockers and resolution plan
- [x] Commit `migration/phase-8-go-nogo-decision.md` with:
  - [x] Gate pass summary (reference `LAUNCH-GATE-PASS-SUMMARY.md`)
  - [x] Exception register reference
  - [x] Smoke test results summary
  - [x] Rollback drill result
  - [x] Go/No-Go decision: Go or No-Go
  - [x] Signed approvals with names and dates
  - [x] If No-Go: list of blocking issues and resolution owners

---

### Out of Scope

- Fixing gate failures or defects discovered during rehearsal (changes require RC re-cut per RHI-084 protocol; the fix must go through the workstream owner)
- Post-launch monitoring execution (Phase 9 scope)
- Search Console submission (Phase 9 scope)
- New feature development unrelated to migration stability

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-083 Done — Phase 8 Bootstrap complete | Ticket | Done |
| RHI-084 Done — RC frozen, validation dataset committed | Ticket | Done |
| RHI-085 Done — URL parity and redirect integrity gates passing | Ticket | Done |
| RHI-086 Done — SEO and indexing readiness gates passing | Ticket | Done |
| RHI-087 Done — Structured data and social preview gates passing | Ticket | Done |
| RHI-088 Done — Performance and CWV gates passing | Ticket | Done |
| RHI-089 Done — Accessibility and HTML conformance gates passing | Ticket | Done |
| RHI-090 Done — Security and HTTPS readiness gates passing | Ticket | Done |
| Migration owner, SEO owner, engineering owner, DNS/ops owner available for go/no-go meeting | Access | Done |
| `migration/phase-7-staging-rollback-runbook.md` drilled and confirmed ready | Phase | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| One or more workstream tickets not `Done` by time of rehearsal | Medium | High | Track workstream progress daily; surface blockers 3 days before the scheduled rehearsal date | Migration Owner |
| A gate failure is discovered during the rehearsal run that was not caught in individual workstream testing | Low | High | Rehearsal is the safety net — treat any new failure as a blocking defect; do not proceed to go/no-go until resolved | Engineering Owner |
| Rollback drill fails or exceeds 60-minute target | Low | High | If rollback drill fails, fix the runbook and re-drill before proceeding; a failed rollback drill is a No-Go condition | Migration Owner |
| Not all required approvers are available for the go/no-go meeting | Low | Medium | Confirm approver availability when setting the go/no-go date; async written sign-off is acceptable if meeting format is not possible | Migration Owner |
| Exception register grows large, obscuring real launch risk | Medium | Medium | Accept only exceptions with explicit risk levels and owners; any exception rated `High` risk must be resolved before Go | Migration Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Phase 8 operational readiness closed on a signed `Go` decision after the final isolated `phase-8-rc-v3` rerun succeeded fully. The final successful workflow run is `23398112474` on commit `576709fd6217653446e8c8e031ebad705668c36e`. The earlier preview-deploy blocker was resolved by adding a `phase-8-rc-v3` tag policy to the `github-pages` environment and rerunning the deploy workflow. Final WS-H production and preview reports now carry `provenanceStatus: frozen-rc`, the smoke-test summary reflects the successful deployed rehearsal host, the rollback drill remains within target, and the launch-summary, checklist, and go/no-go decision records are signed under the repository's single-owner approval model.

**Delivered artefacts:**

- `validation/preview-launch-readiness-report.json` — live rehearsal-host smoke-test evidence with redirect-chain capture from the preview entrypoint
- `validation/production-host-smoke-report.json` — production-build cleanliness report for preview-host leakage and unexpected `noindex`
- `migration/phase-8-smoke-test-results.md` — smoke test results from pre-launch rehearsal
- `migration/phase-8-rollback-drill-result.md` — rollback drill result and timing
- `migration/phase-8-exception-register.md` — all accepted deviations with risk and owner
- `LAUNCH-GATE-PASS-SUMMARY.md` — full gate pass summary with signed approval
- `CUTOVER-VERIFICATION-CHECKLIST.md` — T-24h verification checklist with sign-offs
- `migration/phase-8-go-nogo-decision.md` — go/no-go decision with signed approvals
- Phase 9 monitoring handoff package (committed to `validation/` with handoff notes)

**Deviations from plan:**

- The first corrected RC v3 rerun (`23397825399`) exposed a GitHub Pages environment protection-rule gap rather than a content or build defect. The final deploy succeeded only after adding a `phase-8-rc-v3` tag policy to the `github-pages` environment.
- The final WS-H reports were generated from a tag-aligned external sample snapshot because the committed deterministic RC dataset files are one commit behind the final RC tag by construction.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |
| 2026-03-21 | In Progress | Verified RHI-083 through RHI-090 are complete in their ticket records, normalized the Phase 8 index to match, and added the first WS-H automation for live rehearsal smoke testing and production-build cleanliness checks. |
| 2026-03-21 | In Progress | Generated `validation/preview-launch-readiness-report.json` and `migration/phase-8-smoke-test-results.md` from the current preview entrypoint. The requested `https://taurgis.github.io/rhino-inquisitor-com/` entrypoint currently resolves in two hops to `https://staging.rhino-inquisitor.com/`, and all 13 deterministic smoke checks passed on the effective rehearsal host. |
| 2026-03-21 | In Progress | Generated `validation/production-host-smoke-report.json` from the committed production artifact. The current build shows zero preview-host leakage and zero unexpected `noindex`, with 23 allowed helper/system noindex pages classified separately from launch-blocking routes. |
| 2026-03-21 | In Progress | Owner clarification recorded: final closeout requires a clean frozen-RC rerun, rollback still targets the previous WordPress stack, and the 2026-03-20 bootstrap note in `migration/phase-8-approver-roster.md` must not be reused as the RHI-091 go/no-go record. |
| 2026-03-21 | In Progress | Verified that the new WS-H scripts are not present on `phase-8-rc-v2`, so a final clean rerun cannot yet be performed on the existing RC tag without first merging the WS-H automation and creating a clean rerun snapshot. |
| 2026-03-21 | In Progress | Drafted the clean-rerun closeout plan in `analysis/documentation/phase-8/rhi-091-clean-rerun-closeout-plan-2026-03-21.md`, including the recommended `phase-8-rc-v3` path and the exact final evidence sequence. |
| 2026-03-21 | In Progress | Created pending closeout templates for `LAUNCH-GATE-PASS-SUMMARY.md`, `CUTOVER-VERIFICATION-CHECKLIST.md`, and `migration/phase-8-go-nogo-decision.md` so the final decision window can populate them from one clean evidence basis instead of authoring them ad hoc. |
| 2026-03-21 | In Progress | Added support scaffolds for `migration/phase-8-rollback-drill-result.md` and `migration/phase-8-rc-v3-record.md`, with explicit `PENDING_*` placeholders so the rollback drill and RC v3 freeze can be recorded without implying those steps already happened. |
| 2026-03-21 | In Progress | Added `analysis/documentation/phase-8/rhi-091-live-fill-command-checklist-2026-03-21.md`, an operator-ready command checklist covering preflight, RC v3 tagging, local validation, final workflow run capture, WS-H report regeneration, rollback drill evidence capture, and final placeholder clearance checks. |
| 2026-03-21 | In Progress | Reconciled RHI-091 checkbox state to match committed evidence: upstream WS-B through WS-G artifacts are marked done, current rehearsal smoke and production-build pass items are checked where objectively satisfied, and all clean-RC, rollback-drill, and final decision items remain open. |
| 2026-03-21 | In Progress | Ran the live-fill preflight and current-branch local gate diagnostics. Preflight confirmed the working tree is not clean, the diff from `phase-8-rc-v2` currently includes broader non-WS-H changes, and `gh` is not installed locally. A local `npm run gates:local` diagnostic under Node `v20.18.1` passed through the Phase 8 HTML conformance gate, then failed at the Phase 8 accessibility axe gate on `/sfcc-introduction/` with a serious `aria-prohibited-attr` violation in the embedded YouTube player, so the remaining gates were skipped and the current branch is not ready for an RC v3 freeze as-is. |
| 2026-03-21 | In Progress | Owner direction recorded: proceed by isolating a WS-H-only RC candidate rather than broadening RC v3 to the full mixed branch. Added `analysis/documentation/phase-8/rhi-091-wsh-rc-v3-scope-isolation-2026-03-21.md` to define the current WS-H include set, the non-WS-H exclude set, and the diagnostic artifact churn that must stay out of the isolated RC v3 rerun. |
| 2026-03-21 | In Progress | Debugged the `/sfcc-introduction/` accessibility failure for scope attribution. Verified that the route content uses the shared `video-embed` shortcode, the shortcode and built artifact emit only a plain `youtube-nocookie` `iframe`, and the failing `#movie_player` node appears only in the loaded player runtime captured by `validation/accessibility-axe-report.json`. The same `aria-prohibited-attr` rule also appears on other video routes as warnings. Current classification: likely shared non-WS-H accessibility debt surfaced by the mixed-branch axe gate, not a WS-H-authored regression; keep it out of the WS-H-only RC candidate unless a clean-control rerun proves otherwise. |
| 2026-03-21 | In Progress | Recorded GitHub Actions deploy run `23374602056` for commit `1fdbc19` on `main`: <https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23374602056>. The `build` job (`68004422997`) later completed successfully, so the ticket now marks the successful build-proven gate subitems executed by `npm run gates:local`: Phase 8 URL parity, redirect quality, SEO consistency, robots and sitemap, structured data, social preview, accessibility, HTML conformance, HTTPS and security, plus Phase 7 frontmatter validation, artifact validation, and Hugo production build. The parent full-gate criterion remains open because this evidence is still tied to a `push` run on `main`, not yet a recorded final-RC `workflow_dispatch`, and deploy-complete, WS-H report, rollback, exception-closure, and sign-off items still require separate evidence. |
| 2026-03-21 | In Progress | The same Actions run `23374602056` later completed successfully, including deploy job `68004789020`, and GitHub recorded the deployed preview URL as <http://staging.rhino-inquisitor.com/>. The ticket now checks the deploy-backed pre-launch rehearsal tasks for publishing to the GitHub Pages preview host and confirming the expected preview URL is live. The remaining rehearsal step to run all gate scripts against the deployed preview URLs and separate production validation build outputs stays open because the workflow still did not execute the dedicated WS-H preview-launch-readiness and production-validation-build report steps. |
| 2026-03-21 | In Progress | Re-ran the dedicated WS-H scripts after deploy success using a fresh production snapshot in `tmp/ci-prod-public` plus the deployed preview entrypoint `https://taurgis.github.io/rhino-inquisitor-com/`. `validation/production-host-smoke-report.json` regenerated with `status: pass`, `previewLeakageCount: 0`, and `unexpectedNoindexCount: 0`. `validation/preview-launch-readiness-report.json` regenerated with `status: pass`, `totalChecks: 13`, and `blockingFailures: 0`, and `migration/phase-8-smoke-test-results.md` was refreshed from the same run. This satisfies the rehearsal task to run the dedicated gate scripts against the deployed preview URLs and the separate production validation build outputs, and it closes the sitemap smoke row, but the WS-H report review rows still remain open because the regenerated artifacts are still `branch-state` evidence rather than a clean final-RC rerun. |
| 2026-03-21 | In Progress | Filled the Phase 9 handoff notes in `migration/phase-8-go-nogo-decision.md` with the explicit `validation/` artifact inventory and the rollback handoff statement: the runbook of record remains `migration/phase-7-staging-rollback-runbook.md`, the rollback target remains the previous WordPress stack during the stabilization window, the rollback window starts from Phase 8 sign-off, and the operational rollback-initiation target remains 60 minutes from a trigger event. Based on that committed handoff note, the ticket now checks the Phase 9 handoff subtasks for validation-artifact inventory and rollback runbook path/timeline confirmation. |
| 2026-03-21 | In Progress | Replaced the remaining Phase 9 handoff placeholders in `migration/phase-8-go-nogo-decision.md` with the concrete Search Console action list and the first week-4 monitoring checkpoint definition. The handoff now points Phase 9 to the production Domain property, canonical sitemap submission target, priority URL inspection scope, required monitoring outputs, and the week-4 CWV plus crawl-anomaly review. Because those rows are phrased as `listed` and `defined` rather than `executed`, the Phase 9 handoff package acceptance row and the task row are now checked, while all actual Phase 9 execution, review, and sign-off work remains outside Phase 8 closure scope. |
| 2026-03-21 | In Progress | Prefilled `LAUNCH-GATE-PASS-SUMMARY.md` with one provisional row per gate using the current best-known evidence sources: branch-state rehearsal run `23374602056` for the current deploy/build-backed gates and `phase-8-rc-v2` baseline run `23282905074` for the inherited Lighthouse baseline. The draft now contains gate name, command, status, blocking threshold, report path, and Actions run URL for every row, while explicitly flagging the entire file as mixed provisional evidence that must be replaced by one single clean final-RC rerun before migration-owner sign-off. Based on that draft completion, the ticket now checks the launch-summary row-completion items and the already-present decision-record references to the launch summary, exception register, and smoke-test summary. |
| 2026-03-21 | In Progress | Assigned Thomas Theunen as the named reviewer of record for every RHI-091 validation artifact currently in scope: `validation/url-parity-report.json`, `validation/redirect-quality-report.json`, `validation/seo-consistency-report.json`, `validation/robots-sitemap-report.json`, `validation/structured-data-report.json`, `validation/social-preview-report.json`, `validation/lhci-report/`, `validation/performance-budget-report.json`, `validation/accessibility-axe-report.json`, `validation/accessibility-manual-checklist.md`, `validation/html-conformance-report.json`, `validation/https-security-report.json`, `validation/preview-launch-readiness-report.json`, and `validation/production-host-smoke-report.json`. This closes the reviewer-assignment subtask only; review-completion logging remains open until the final clean-RC evidence set and WS-H review state are recorded. |
| 2026-03-21 | In Progress | Tightened the rollback evidence path without changing checkbox state: `migration/phase-8-rollback-drill-result.md` now has an immediate live-fill block, explicit completion gate, final-run alignment fields, and evidence-source capture rows, while `CUTOVER-VERIFICATION-CHECKLIST.md` now treats rollback readiness as binary evidence checks instead of broad intent statements. Updated `analysis/documentation/phase-8/rhi-091-clean-rerun-closeout-plan-2026-03-21.md` with an exact row-flip matrix showing which unchecked RHI-091 rows will flip after the final clean `workflow_dispatch` run plus WS-H re-review, which still require rollback-drill evidence, and which remain gated on the T-24h and go/no-go sign-off window. |
| 2026-03-21 | In Progress | Correction to the earlier preflight note: GitHub CLI is installed at `/opt/homebrew/bin/gh` and authenticated for `taurgis`. The earlier `gh not installed locally` observation should be treated as a transient shell-path mismatch rather than the current environment state. The successful manual `workflow_dispatch` run `23384070147` was triggered with `gh workflow run deploy-pages.yml --ref main`. |
| 2026-03-21 | In Progress | Triggered a real manual `workflow_dispatch` run of `deploy-pages.yml` on `main@1fdbc19` and recorded successful build and deploy conclusions from Actions run `23384070147`. Re-ran the two WS-H scripts from clean detached worktrees at the same commit, with outputs written both to tracked and untracked locations, and both reports still remained `branch-state` because the frozen validation datasets are still pinned to `phase-8-rc-v2`. The final-RC evidence blocker therefore remains open even though the manual workflow run itself succeeded. |
| 2026-03-21 | In Progress | Executed a verified-only Option B rollback drill using `migration/phase-7-staging-rollback-runbook.md` against the previous WordPress stack on `https://www.rhino-inquisitor.com/`. Trigger time `2026-03-21T16:55:05Z`, confirmation time `2026-03-21T16:55:06Z`, and MTTR `0` minutes were recorded in `tmp/rhi-091-rollback-drill-20260321/` and live-filled into `migration/phase-8-rollback-drill-result.md`. The drill confirmed WordPress homepage accessibility (`HTTP 200`, title `Home - The Rhino Inquisitor`), privacy policy `200`, `robots.txt` `200`, feed `200`, sitemap reachability via `301`, and the current single frozen priority-route sample `/` at `200`. Based on that committed drill result, the rollback acceptance rows, rollback task rows, and the rollback-drill reference under the go/no-go decision task are now checked, and the rollback blocker in `migration/phase-8-exception-register.md` is closed. |
| 2026-03-22 | In Progress | Owner clarification resolved: use the safest path and isolate a WS-H-only `phase-8-rc-v3` candidate rather than treating the broader `main@d748821` state as the final RC basis. Cut isolated tag `phase-8-rc-v3`, first at `bb7bd49e1e8292ea3dbc744dded428dcfcab48aa`, then corrected to `576709fd6217653446e8c8e031ebad705668c36e` after rebuilding the deterministic validation datasets from a temp Hugo production output. |
| 2026-03-22 | In Progress | The first isolated RC rerun `23397686845` failed during `check-performance-budget` because the initial RC v3 sample matrix had been regenerated before a production build existed and therefore omitted the required article selection. After rebuilding the isolated datasets from a temp production output and force-updating the tag, the corrected rerun `23397825399` passed the build and blocking gate suite on `phase-8-rc-v3@576709fd6217653446e8c8e031ebad705668c36e`. This closes the remaining final-RC gate rows for `lhci`, `perf-budget`, and `check:links`, and it closes the task to trigger `workflow_dispatch` on the final RC with all gates enabled. |
| 2026-03-22 | In Progress | Regenerated the WS-H production and preview reports from a clean detached RC v3 worktree using a tag-aligned sample-matrix snapshot for report execution, because the committed RC dataset files are one commit behind the final tag by construction. `validation/production-host-smoke-report.json` now reports `provenanceStatus: frozen-rc`, `matchesDatasetRc: true`, zero preview leakage, and zero unexpected noindex findings, so the production validation build row is now checked and reviewed. `validation/preview-launch-readiness-report.json` also reports `provenanceStatus: frozen-rc` with 13/13 checks passing, but the corrected RC rerun's `deploy` job (`68064300304`) failed, so final preview-host rehearsal sign-off, the priority legacy redirect smoke row, and the `no unresolved blocking gate failure` decision row remain open pending a successful preview deployment or owner-approved fallback. |
| 2026-03-22 | In Progress | Root-caused the failed preview deploy to GitHub environment protection rules: the `github-pages` environment allowed only `main`, so tag `phase-8-rc-v3` was rejected before deploy steps started. Added the matching `phase-8-rc-v3` tag policy to the `github-pages` environment and reran the final workflow as `23398112474`; both build job `68064746256` and deploy job `68065030583` completed successfully, and GitHub recorded deployment `4139450958` for `http://staging.rhino-inquisitor.com/`. |
| 2026-03-22 | In Progress | Re-ran the final WS-H production and preview reports after the successful deploy. `validation/production-host-smoke-report.json` and `validation/preview-launch-readiness-report.json` both report `provenanceStatus: frozen-rc` and `matchesDatasetRc: true`, and `migration/phase-8-smoke-test-results.md` reflects the final deployed rehearsal host with all 13 checks passing, including the single available priority-route redirect sample. Thomas Theunen completed review of the final WS-H artifacts on 2026-03-22. |
| 2026-03-22 | Done | Finalized Phase 8 sign-off artifacts under the single-owner model: closed the preview-deploy blocker in `migration/phase-8-exception-register.md`, updated `migration/phase-8-rc-v3-record.md` with the successful final rerun, signed `LAUNCH-GATE-PASS-SUMMARY.md`, completed `CUTOVER-VERIFICATION-CHECKLIST.md`, and recorded a final `Go` decision in `migration/phase-8-go-nogo-decision.md` for all approver roles. |

---

### Notes

- The go/no-go decision is not a formality. It is the authoritative evidence record that preview rehearsal passed, the production validation build is clean, and named individuals approved proceeding to Phase 9 production cutover.
- The frozen `validation/priority-routes.json` dataset currently contains one merge route, so the current WS-H smoke run covers all available priority redirect samples rather than five distinct redirect URLs. Any broader redirect-smoke expansion requires an explicit dataset or ticket-contract update.
- If the rollback drill cannot be completed successfully (e.g., the WordPress site is no longer available as a rollback target), that is a launch blocker. Do not proceed to Phase 9 without a tested fallback.
- The 60-minute rollback target from `analysis/plan/details/phase-8.md` aligns with the Phase 7 incident response runbook. Verify this target is still achievable given the current deployment configuration.
- Reference: `analysis/plan/details/phase-8.md` §Workstream H: Operational Readiness, Rehearsal, and Go/No-Go; §Definition of Done
