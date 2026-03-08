## RHI-091 · Workstream H — Operational Readiness, Rehearsal, and Go/No-Go

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 8  
**Assigned to:** Migration Owner  
**Target date:** 2026-06-11  
**Created:** 2026-03-08  
**Updated:** 2026-03-08

---

### Goal

Execute the full pre-launch rehearsal — running every gate suite against the RC, deploying through the production-equivalent workflow, completing smoke tests, and drilling the rollback — before the go/no-go decision is made. The go/no-go decision must be evidence-based: every gate result is reviewed by name, every open blocking issue has a disposition, and every approver sign-off is recorded. No launch window begins without this ticket being `Done`.

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
- [ ] All Phase 8 validation artifacts from WS-B through WS-G are generated, reviewed, and archived:
  - [ ] `validation/url-parity-report.json` — reviewed and signed off
  - [ ] `validation/redirect-quality-report.json` — reviewed and signed off
  - [ ] `validation/seo-consistency-report.json` — reviewed and signed off
  - [ ] `validation/robots-sitemap-report.json` — reviewed and signed off
  - [ ] `validation/structured-data-report.json` — reviewed and signed off
  - [ ] `validation/social-preview-report.json` — reviewed and signed off
  - [ ] `validation/lhci-report/` — reviewed and signed off
  - [ ] `validation/performance-budget-report.json` — reviewed and signed off
  - [ ] `validation/accessibility-axe-report.json` — reviewed and signed off
  - [ ] `validation/accessibility-manual-checklist.md` — completed and reviewed
  - [ ] `validation/html-conformance-report.json` — reviewed and signed off
  - [ ] `validation/https-security-report.json` — reviewed and signed off
- [ ] Pre-launch rehearsal is complete:
  - [ ] RC artifact deployed through the production workflow (`workflow_dispatch` or release branch push)
  - [ ] All gate reports generated from the deployed RC
  - [ ] Smoke tests executed against the production-like deployment (see smoke test list below)
  - [ ] Smoke test results recorded in `migration/phase-8-smoke-test-results.md`
- [ ] Smoke tests pass (minimum set):
  - [ ] Homepage: HTTP 200, correct canonical, correct title
  - [ ] Top 3 recent post URLs: HTTP 200
  - [ ] Top 3 category pages: HTTP 200
  - [ ] Archive page: HTTP 200 or correct redirect
  - [ ] Privacy policy: HTTP 200
  - [ ] At least 5 priority legacy redirect URLs: correct HTTP 301 to expected target
  - [ ] `sitemap.xml`: HTTP 200, correct canonical host in `<loc>` elements, parseable XML
  - [ ] `robots.txt`: HTTP 200, correct `Sitemap:` directive
  - [ ] RSS feed (if applicable): HTTP 200, parseable XML
- [ ] Rollback drill is executed and timed:
  - [ ] Rollback initiated from the Phase 7 rollback runbook (`migration/phase-7-rollback-runbook.md`)
  - [ ] WordPress site is confirmed accessible (or equivalent rollback state)
  - [ ] Mean time to rollback is recorded (target: rollback initiated within 60 minutes of a trigger event)
  - [ ] Rollback drill result is committed to `migration/phase-8-rollback-drill-result.md`
- [ ] Exception register compiled:
  - [ ] All accepted deviations from the Phase 8 gate requirements are listed with: gate name, deviation description, owner, risk level, and target resolution phase
  - [ ] No unresolved blocking gate failure is carried to the go/no-go decision
  - [ ] Exception register committed to `migration/phase-8-exception-register.md`
- [ ] Go/No-Go decision is made and recorded:
  - [ ] All required approvers sign off: migration owner, SEO owner, engineering owner, DNS/operations owner
  - [ ] Written risk acceptance is recorded for any warning-level issue carried into launch
  - [ ] If any blocking gate is unresolved, decision is explicit No-Go with documented blockers
  - [ ] Go/No-Go decision committed to `migration/phase-8-go-nogo-decision.md`
- [ ] `LAUNCH-GATE-PASS-SUMMARY.md` is created and committed:
  - [ ] One row per gate: gate name, command, pass/fail, blocking threshold, report path, Actions run URL
  - [ ] Signed off by migration owner
- [ ] `CUTOVER-VERIFICATION-CHECKLIST.md` is created and committed:
  - [ ] Sections: DNS and HTTPS, Host and Canonical Behavior, Priority URL Smoke Tests, Sitemap and Robots Reachability, Rollback Readiness
  - [ ] Completed at T-24h before go/no-go meeting with ownership sign-off from engineering, SEO, and incident commander
- [ ] Phase 9 monitoring handoff package is prepared:
  - [ ] All validation artifacts committed to `validation/`
  - [ ] Rollback runbook location confirmed
  - [ ] Search Console properties and submission items listed for Phase 9
  - [ ] First monitoring checkpoint defined (4-week post-launch CWV check, crawl anomaly review)

---

### Tasks

- [ ] Confirm all Phase 8 workstream tickets (RHI-084 through RHI-090) are `Done` before beginning this ticket
- [ ] Run the full Phase 8 gate suite in a single CI run against the final RC commit:
  - [ ] Trigger `workflow_dispatch` on the RC branch with all gates enabled
  - [ ] Record the Actions run URL
  - [ ] If any gate fails, do not proceed to go/no-go; escalate the failure to the responsible workstream owner
- [ ] Review all validation artifacts:
  - [ ] Assign one named reviewer per artifact
  - [ ] Record review completion in Progress Log with reviewer name and date
- [ ] Execute pre-launch deployment rehearsal:
  - [ ] Deploy RC through the production workflow to a production-like environment (staging Pages deployment or a tagged release)
  - [ ] Confirm the site is reachable at the expected URLs
  - [ ] Run all gate scripts against the deployed URLs (not just the local `public/` directory)
- [ ] Execute smoke tests against the deployed environment:
  - [ ] Use `playwright` or `curl` to verify each smoke test URL
  - [ ] Record HTTP status codes, redirect chains, canonical, and title for each URL
  - [ ] Commit results to `migration/phase-8-smoke-test-results.md`
- [ ] Execute rollback drill:
  - [ ] Follow the Phase 7 rollback runbook step by step
  - [ ] Time the rollback from trigger to WordPress site confirmed accessible
  - [ ] Document any friction or missing steps in the runbook
  - [ ] Commit drill result to `migration/phase-8-rollback-drill-result.md`
- [ ] Compile exception register:
  - [ ] Review all warnings and deviations from WS-B through WS-G workstream reports
  - [ ] For each accepted deviation: document risk, owner, and resolution phase
  - [ ] Commit to `migration/phase-8-exception-register.md`
- [ ] Draft `LAUNCH-GATE-PASS-SUMMARY.md`:
  - [ ] One row per gate with all required fields
  - [ ] Obtain migration owner sign-off
- [ ] Complete `CUTOVER-VERIFICATION-CHECKLIST.md`:
  - [ ] Use the checklist template from Phase 7 or create one aligned with the minimum section requirements
  - [ ] Complete all items at T-24h before go/no-go meeting
- [ ] Prepare Phase 9 monitoring handoff package:
  - [ ] List all validation artifacts committed to `validation/`
  - [ ] Confirm rollback runbook path and rollback window timeline
  - [ ] List Search Console actions for Phase 9 (sitemap submission, URL inspection, monitoring dashboards)
- [ ] Convene Go/No-Go meeting with all required approvers:
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
| RHI-083 Done — Phase 8 Bootstrap complete | Ticket | Pending |
| RHI-084 Done — RC frozen, validation dataset committed | Ticket | Pending |
| RHI-085 Done — URL parity and redirect integrity gates passing | Ticket | Pending |
| RHI-086 Done — SEO and indexing readiness gates passing | Ticket | Pending |
| RHI-087 Done — Structured data and social preview gates passing | Ticket | Pending |
| RHI-088 Done — Performance and CWV gates passing | Ticket | Pending |
| RHI-089 Done — Accessibility and HTML conformance gates passing | Ticket | Pending |
| RHI-090 Done — Security and HTTPS readiness gates passing | Ticket | Pending |
| Migration owner, SEO owner, engineering owner, DNS/ops owner available for go/no-go meeting | Access | Pending |
| `migration/phase-7-rollback-runbook.md` drilled and confirmed ready | Phase | Pending |

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

---

### Notes

- The go/no-go decision is not a formality. It is the authoritative evidence record that the launch was approved by named individuals who reviewed specific evidence. In the event of a post-launch incident, this document is the first thing examined.
- If the rollback drill cannot be completed successfully (e.g., the WordPress site is no longer available as a rollback target), that is a launch blocker. Do not proceed to Phase 9 without a tested fallback.
- The 60-minute rollback target from `analysis/plan/details/phase-8.md` aligns with the Phase 7 incident response runbook. Verify this target is still achievable given the current deployment configuration.
- Reference: `analysis/plan/details/phase-8.md` §Workstream H: Operational Readiness, Rehearsal, and Go/No-Go; §Definition of Done
