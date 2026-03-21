## RHI-091 · Workstream H — Operational Readiness, Rehearsal, and Go/No-Go

**Status:** In Progress  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 8  
**Assigned to:** Migration Owner  
**Target date:** 2026-06-11  
**Created:** 2026-03-08  
**Updated:** 2026-03-21

---

### Goal

Execute the full pre-launch rehearsal — running every gate suite against the RC, validating the public rehearsal host `https://taurgis.github.io/rhino-inquisitor-com/`, confirming the separate production validation build is clean, completing smoke tests, and drilling the rollback — before the go/no-go decision is made. The go/no-go decision must be evidence-based: every gate result is reviewed by name, every open blocking issue has a disposition, and every approver sign-off is recorded. No production cutover window begins without this ticket being `Done`.

---

### Acceptance Criteria

- [ ] Full gate suite has been run on the final RC commit and all hard-blocker gates pass:
  - [ ] `npm run check:url-parity:p8` exits 0
  - [ ] `npm run check:redirect-quality` exits 0
  - [ ] `npm run check:seo-consistency` exits 0
  - [ ] `npm run check:robots-sitemap` exits 0
  - [ ] `npm run check:structured-data` exits 0
  - [ ] `npm run check:social-preview` exits 0
  - [ ] `npm run lhci:run:p8` passes all threshold assertions
  - [ ] `npm run check:perf-budget` exits 0
  - [ ] `npm run check:accessibility` exits 0
  - [ ] `npm run check:html-conformance` exits 0
  - [ ] `npm run check:https-security` exits 0
  - [ ] `npm run validate:frontmatter` exits 0 (from Phase 7)
  - [ ] `npm run check:links` exits 0 (from Phase 7)
  - [ ] `npm run validate:artifact` exits 0 (from Phase 7)
  - [ ] Hugo production build exits 0
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
- [ ] Pre-launch rehearsal is complete:
  - [x] RC artifact deployed to the preview host `https://taurgis.github.io/rhino-inquisitor-com/`
  - [ ] All gate reports generated from the deployed rehearsal host and the production validation build
  - [x] Smoke tests executed against the preview-host deployment using deterministic URL selection from `validation/sample-matrix.json` and `validation/priority-routes.json`
  - [x] Smoke test results recorded in `migration/phase-8-smoke-test-results.md`
  - [ ] `validation/preview-launch-readiness-report.json` is generated and reviewed alongside the smoke-test markdown summary
- [ ] Production validation build is complete:
  - [x] Canonical production host build passes with zero preview-host leakage
  - [x] No accidental `noindex` appears in the production validation build
  - [ ] `validation/production-host-smoke-report.json` is generated and reviewed alongside the final launch summary
- [ ] Smoke tests pass (minimum set):
  - [x] Homepage on preview host: HTTP 200, correct preview-host path-prefix behavior, preview `noindex`, correct title
  - [x] Top 3 post URLs from the deterministic sample matrix (most-recent by front matter date): HTTP 200
  - [x] Top 3 category pages from the deterministic sample matrix (alphabetical slug order): HTTP 200
  - [x] Archive page: HTTP 200 or correct redirect
  - [x] Privacy policy: HTTP 200
  - [ ] Top 5 priority legacy redirect URLs from `validation/priority-routes.json`: expected preview-host rehearsal outcome according to the active implementation layer, with final production redirect behavior deferred to Phase 9 live checks
  - [ ] Canonical sitemap endpoint (`/sitemap.xml` or `/sitemap_index.xml`, per configuration): HTTP 200, correct canonical host in `<loc>` elements, parseable XML
  - [x] `robots.txt`: HTTP 200, correct `Sitemap:` directive
  - [x] Feed endpoint documented in `validation/robots-sitemap-report.json` (for example `/index.xml` or `/feed/`) is reachable and parseable XML when feed output is enabled
- [ ] Rollback drill is executed and timed:
  - [ ] Rollback initiated from the Phase 7 rollback runbook (`migration/phase-7-staging-rollback-runbook.md`)
  - [ ] WordPress site is confirmed accessible (or equivalent rollback state)
  - [ ] Mean time to rollback is recorded (target: rollback initiated within 60 minutes of a trigger event)
  - [ ] Rollback drill result is committed to `migration/phase-8-rollback-drill-result.md`
- [ ] Exception register compiled:
  - [x] All accepted deviations from the Phase 8 gate requirements are listed with: gate name, deviation description, owner, risk level, and target resolution phase
  - [x] Risk levels use explicit severity classes: `blocking`, `warning`, `accepted`
  - [ ] No unresolved blocking gate failure is carried to the go/no-go decision
  - [x] Exception register committed to `migration/phase-8-exception-register.md`
- [ ] Go/No-Go decision is made and recorded:
  - [ ] All required approvers from `migration/phase-8-approver-roster.md` sign off: migration owner, SEO owner, engineering owner, DNS/operations owner
  - [ ] Written risk acceptance is recorded for any warning-level issue carried into launch
  - [ ] If any blocking gate is unresolved, decision is explicit No-Go with documented blockers
  - [ ] Go/No-Go decision committed to `migration/phase-8-go-nogo-decision.md`
- [ ] `LAUNCH-GATE-PASS-SUMMARY.md` is created and committed:
  - [ ] One row per gate: gate name, command, pass/fail, blocking threshold, report path, Actions run URL
  - [ ] Signed off by migration owner
- [ ] `CUTOVER-VERIFICATION-CHECKLIST.md` is created and committed:
  - [x] Sections: DNS and HTTPS, Host and Canonical Behavior, Priority URL Smoke Tests, Sitemap and Robots Reachability, Rollback Readiness
  - [ ] Completed at T-24h before go/no-go meeting with ownership sign-off from engineering, SEO, and incident commander
- [ ] Phase 9 monitoring handoff package is prepared:
  - [x] All validation artifacts committed to `validation/`
  - [x] Rollback runbook location confirmed
  - [ ] Search Console properties and submission items listed for Phase 9
  - [ ] First monitoring checkpoint defined (4-week post-launch CWV check, crawl anomaly review)

---

### Tasks

- [x] Confirm all Phase 8 workstream tickets (RHI-084 through RHI-090) are `Done` before beginning this ticket
- [ ] Run the full Phase 8 gate suite in a single CI run against the final RC commit:
  - [ ] Trigger `workflow_dispatch` on the RC branch with all gates enabled
  - [ ] Record the Actions run URL
  - [ ] If any gate fails, do not proceed to go/no-go; escalate the failure to the responsible workstream owner
- [ ] Review all validation artifacts:
  - [ ] Assign one named reviewer per artifact
  - [ ] Record review completion in Progress Log with reviewer name and date
- [ ] Execute pre-launch deployment rehearsal:
  - [ ] Deploy RC to the GitHub Pages preview host
  - [ ] Confirm the site is reachable at the expected preview URLs
  - [ ] Run all gate scripts against the deployed preview URLs and the separate production validation build outputs (not just the local `public/` directory)
- [ ] Execute smoke tests against the deployed environment:
  - [x] Use `playwright` or `curl` to verify each smoke test URL
  - [x] Use deterministic URL ordering from `validation/sample-matrix.json` and `validation/priority-routes.json`; record the exact URLs tested
  - [x] Record HTTP status codes, redirect chains, canonical, and title for each URL
  - [x] Generate `validation/preview-launch-readiness-report.json` from the live rehearsal-host responses
  - [x] Commit results to `migration/phase-8-smoke-test-results.md`
- [ ] Execute rollback drill:
  - [ ] Follow the Phase 7 rollback runbook step by step
  - [ ] Time the rollback from trigger to WordPress site confirmed accessible
  - [ ] Document any friction or missing steps in the runbook
  - [ ] Commit drill result to `migration/phase-8-rollback-drill-result.md`
- [ ] Compile exception register:
  - [ ] Review all warnings and deviations from WS-B through WS-G workstream reports
  - [ ] For each accepted deviation: document severity (`blocking`, `warning`, `accepted`), owner, and resolution phase
  - [x] Commit to `migration/phase-8-exception-register.md`
- [ ] Draft `LAUNCH-GATE-PASS-SUMMARY.md`:
  - [ ] One row per gate with all required fields
  - [ ] Obtain migration owner sign-off
- [ ] Complete `CUTOVER-VERIFICATION-CHECKLIST.md`:
  - [x] Use the checklist template from Phase 7 or create one aligned with the minimum section requirements
  - [ ] Complete all items at T-24h before go/no-go meeting
- [ ] Prepare Phase 9 monitoring handoff package:
  - [ ] List all validation artifacts committed to `validation/`
  - [ ] Confirm rollback runbook path and rollback window timeline
  - [ ] List Search Console actions for Phase 9 (sitemap submission, URL inspection, monitoring dashboards)
- [ ] Convene Go/No-Go meeting with all required approvers:
  - [ ] Confirm approver list against `migration/phase-8-approver-roster.md`
  - [ ] Present gate pass summary and exception register
  - [ ] Record each approver's decision and sign-off statement
  - [ ] If Go: proceed to Phase 9; if No-Go: document blockers and resolution plan
- [ ] Commit `migration/phase-8-go-nogo-decision.md` with:
  - [ ] Gate pass summary (reference `LAUNCH-GATE-PASS-SUMMARY.md`)
  - [ ] Exception register reference
  - [ ] Smoke test results summary
  - [ ] Rollback drill result
  - [ ] Go/No-Go decision: Go or No-Go
  - [ ] Signed approvals with names and dates
  - [ ] If No-Go: list of blocking issues and resolution owners

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

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

- None

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

---

### Notes

- The go/no-go decision is not a formality. It is the authoritative evidence record that preview rehearsal passed, the production validation build is clean, and named individuals approved proceeding to Phase 9 production cutover.
- The frozen `validation/priority-routes.json` dataset currently contains one merge route, so the current WS-H smoke run covers all available priority redirect samples rather than five distinct redirect URLs. Any broader redirect-smoke expansion requires an explicit dataset or ticket-contract update.
- If the rollback drill cannot be completed successfully (e.g., the WordPress site is no longer available as a rollback target), that is a launch blocker. Do not proceed to Phase 9 without a tested fallback.
- The 60-minute rollback target from `analysis/plan/details/phase-8.md` aligns with the Phase 7 incident response runbook. Verify this target is still achievable given the current deployment configuration.
- Reference: `analysis/plan/details/phase-8.md` §Workstream H: Operational Readiness, Rehearsal, and Go/No-Go; §Definition of Done
