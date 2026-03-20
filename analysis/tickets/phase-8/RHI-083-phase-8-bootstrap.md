## RHI-083 · Phase 8 Bootstrap: Kickoff and Validation Environment Setup

**Status:** Done  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 8  
**Assigned to:** Migration Owner  
**Target date:** 2026-06-03  
**Created:** 2026-03-08  
**Updated:** 2026-03-20

---

### Goal

Confirm that Phase 7 sign-off is complete and all Phase 7 outputs required by Phase 8 are accessible before any validation workstream begins. Establish the Phase 8 team, review governing constraints and non-negotiable gate requirements, verify tooling and environment readiness, agree workstream ownership and sequencing, and set the go/no-go decision window.

Phase 8 is the final technical control point before DNS cutover and public indexing impact. Every downstream workstream (WS-A through WS-H) depends on this bootstrap establishing a clean, verified starting state. No Phase 8 workstream ticket (RHI-084 through RHI-091) should begin until this ticket is `Done`.

---

### Acceptance Criteria

- [x] Phase 7 sign-off (RHI-082) is `Done` and `migration/phase-7-signoff.md` is committed
- [x] Phase 7 CI gate suite is passing on `main` or the designated release branch:
  - [x] `npm run validate:frontmatter` exits 0
  - [x] `npm run check:url-parity` exits 0
  - [x] `npm run check:redirect-chains` exits 0
  - [x] `npm run check:canonical-alignment` exits 0
  - [x] `npm run check:mixed-content` exits 0
  - [x] `npm run check:seo-safe-deploy` exits 0
  - [x] `npm run check:links` exits 0
  - [x] `npm run validate:artifact` exits 0
  - [x] Hugo production build exits 0
- [x] Phase 7 deliverables are accessible and verified:
  - [x] `.github/workflows/deploy-pages.yml` is committed and operational
  - [x] `.github/workflows/build-pr.yml` is committed and operational
  - [x] `migration/reports/phase-7-gate-summary.csv` is committed (Phase 7 evidence trail)
  - [x] `migration/phase-7-staging-launch-runbook.md` is committed and available as the validated staging cutover template
  - [x] `migration/phase-7-staging-rollback-runbook.md` is committed and drill is recorded
  - [x] `lighthouserc.json` is committed
- [x] Phase 8 tooling dependencies are confirmed available or installable:
  - [x] `@axe-core/playwright` for automated accessibility checks
  - [x] `playwright` for smoke tests and scripted browser flows
  - [x] `html-validate` for HTML markup conformance checks
  - [x] `fast-xml-parser` for sitemap/feed validation
  - [x] `@lhci/cli` for Lighthouse CI (already added in Phase 7)
  - [x] `fast-glob` for deterministic output discovery
  - [x] `gray-matter` for front matter policy checks
  - [x] `ajv` for JSON-schema validation of manifest and report contracts
  - [x] `linkinator` for broken-link scanning of deployed URLs
- [x] Release candidate branch or tag is identified and the team agrees the RC is the validation target
- [x] `validation/` directory structure is defined and ready to receive gate outputs:
  - [x] `validation/url-parity-report.json`
  - [x] `validation/redirect-quality-report.json`
  - [x] `validation/seo-consistency-report.json`
  - [x] `validation/robots-sitemap-report.json`
  - [x] `validation/structured-data-report.json`
  - [x] `validation/social-preview-report.json`
  - [x] `validation/lhci-report/`
  - [x] `validation/performance-budget-report.json`
  - [x] `validation/accessibility-axe-report.json`
  - [x] `validation/accessibility-manual-checklist.md`
  - [x] `validation/html-conformance-report.json`
  - [x] `validation/https-security-report.json`
- [x] Migration owner, SEO owner, engineering owner, and DNS/operations owner are confirmed and available for Phase 8
- [x] `migration/phase-8-approver-roster.md` is committed with role-to-name mapping and backup contacts for migration owner, SEO owner, engineering owner, and DNS/operations owner
- [x] All Phase 8 workstream owners have read `analysis/plan/details/phase-8.md` and confirmed understanding
- [x] Go/no-go decision window is agreed (date, approvers, required present)
- [x] Phase 8 non-negotiable release gates reviewed with the full team:
  - [x] URL parity gate must pass for all in-scope legacy URLs
  - [x] Redirect quality gate: direct redirects only, zero chains, zero loops on migration routes
  - [x] Canonical consistency gate: canonical, sitemap, internal links agree on final URLs
  - [x] Robots/noindex gate: no accidental blocking or accidental `noindex` on indexable pages
  - [x] Structured data gate: no critical errors on representative templates
  - [x] HTTPS gate: valid cert, enforce HTTPS enabled, no critical mixed content
  - [x] Accessibility gate: automated axe checks pass on representative templates
  - [x] Performance gate: Lighthouse thresholds met on homepage and article template
  - [x] Launch smoke test gate passes on production-like environment
  - [x] Rollback drill executed and timed before launch window

---

### Tasks

- [x] Verify RHI-082 is `Done`; if not, document the blocker and pause Phase 8
- [x] Run all Phase 7 CI gates against the current release candidate; confirm all pass; record Actions run URL
- [x] Confirm all Phase 7 deliverable files are committed to the repository
- [x] Audit tooling dependencies: install any Phase 8-specific packages not already present
- [x] Define and create `validation/` directory structure (empty files or README as placeholders)
- [x] Identify the release candidate commit SHA or branch; tag it as `phase-8-rc-v1`
- [x] Confirm Phase 8 team: migration owner, SEO owner, engineering owner, DNS/ops owner
- [x] Create `migration/phase-8-approver-roster.md` with primary and backup approvers by role
- [x] Share `analysis/plan/details/phase-8.md` with all workstream owners; request read confirmation
- [x] Review Phase 8 non-negotiable release gates with the full team; log confirmations in Progress Log
- [x] Set go/no-go decision window (target date, approver availability, meeting/async format)
- [x] Assign workstream owners for WS-A through WS-H
- [x] Agree target dates for each workstream ticket (RHI-084 through RHI-091)
- [x] Establish Phase 8 execution sequence:
  - [x] WS-A (RC Freeze and Validation Dataset) must complete first — it defines inputs for all others
  - [x] WS-B through WS-G can run in parallel after WS-A is done
  - [x] WS-H (Operational Readiness and Go/No-Go) requires all preceding workstreams done
  - [x] Sign-off (RHI-092) requires WS-H done and go/no-go decision recorded
- [x] Log all confirmations in Progress Log with names and dates
- [x] Announce Phase 8 kickoff with link to Phase 7 sign-off and Phase 8 plan

---

### Out of Scope

- Implementing validation gates, scripts, or workflows (covered by RHI-084 through RHI-091)
- Changing URL manifest, redirect architecture, or site configuration (Phase 6 and 7 are frozen)
- Post-launch monitoring execution (Phase 9 scope)
- New feature development unrelated to migration stability

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-082 Done — Phase 7 sign-off recorded | Ticket | Done |
| `migration/phase-7-signoff.md` committed | Phase | Done |
| `migration/reports/phase-7-gate-summary.csv` committed (Phase 7 evidence) | Phase | Done |
| Phase 7 CI gate suite passing on RC | Phase | Done |
| `.github/workflows/deploy-pages.yml` operational | Phase | Done |
| `migration/phase-7-staging-rollback-runbook.md` drilled and committed | Phase | Done |
| Migration owner, SEO owner, engineering owner, DNS/ops owner available | Access | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Phase 7 sign-off delayed, blocking Phase 8 start | Medium | High | Pre-position Phase 8 materials and confirm tooling availability while waiting for Phase 7 sign-off | Migration Owner |
| Phase 7 CI gates failing at Phase 8 bootstrap check | Medium | High | If any Phase 7 gate fails, escalate to Phase 7 owners immediately; Phase 8 cannot own Phase 7 defects | Engineering Owner |
| Phase 8 tooling packages not yet installed or missing from `package.json` | Medium | Medium | Audit Phase 8-specific dependencies at bootstrap Day 1; install and pin before workstreams begin | Engineering Owner |
| Go/no-go decision window cannot be agreed upfront | Low | Medium | Establish a target date range; a firm date must be set before WS-H begins | Migration Owner |
| RC not clearly identified or tagged, causing workstreams to validate different builds | Medium | High | Tag RC as `phase-8-rc-v1` at bootstrap; all workstreams validate against this tag | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Phase 8 bootstrap completed on 2026-03-20. The Phase 7 handoff contract was verified from the RHI-082 artefacts, the designated release candidate was locked to annotated tag `phase-8-rc-v1` on commit `a510ead8`, the missing Phase 8 validation scaffold and tooling packages were committed, and the single-owner role, workstream, and go/no-go records were captured in `migration/phase-8-approver-roster.md`.

**Delivered artefacts:**

- `phase-8-rc-v1` annotated git tag on commit `a510ead8`
- `validation/` scaffold with placeholder report files and README placeholders for downstream workstreams
- `migration/phase-8-approver-roster.md`
- Progress Log entries confirming Phase 7 contract receipt, single-owner acknowledgments, and the Phase 8 kickoff baseline
- `analysis/documentation/phase-8/rhi-083-bootstrap-scaffold-2026-03-20.md`

**Deviations from plan:**

- Backup contacts remain the same named owner as the primary contact under the current single-owner model; no delegated secondary approvers were added during bootstrap.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |
| 2026-03-20 | In Progress | Verified the Phase 7 handoff contract from RHI-082: `migration/phase-7-signoff.md`, `migration/reports/phase-7-gate-summary.csv`, `.github/workflows/deploy-pages.yml`, `.github/workflows/build-pr.yml`, `migration/phase-7-staging-launch-runbook.md`, `migration/phase-7-staging-rollback-runbook.md`, and `lighthouserc.json` are present and remain the Phase 8 bootstrap inputs. |
| 2026-03-20 | In Progress | Installed the missing Phase 8 validation packages (`@axe-core/playwright`, `ajv`, and `linkinator`) and committed the initial `validation/` scaffold with placeholder report files, the manual accessibility checklist template, and README placeholders for `validation/lhci-report/`, `validation/report-schema/`, and `validation/runs/`. |
| 2026-03-20 | In Progress | Recorded the owner-approved RC selection: annotated git tag `phase-8-rc-v1` now targets commit `a510ead8`, which is the Phase 7 sign-off commit with the recorded Actions evidence URL `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23282905074`. |
| 2026-03-20 | In Progress | Thomas Theunen confirmed the repository single-owner model for migration, SEO, engineering, DNS/operations, and all Phase 8 workstreams. The Phase 8 plan and non-negotiable release gates were acknowledged for WS-A through WS-H, and the existing target dates from `analysis/tickets/phase-8/INDEX.md` were accepted as the Phase 8 execution baseline. |
| 2026-03-20 | In Progress | Created `migration/phase-8-approver-roster.md` with the current single-owner primary and fallback contact mapping. |
| 2026-03-20 | Done | Recorded the go/no-go decision window as a same-day single-owner approval meeting with Thomas Theunen present for the migration, SEO, engineering, and DNS/operations roles. All acceptance criteria are now satisfied and RHI-083 is closed. |

---

### Notes

- Phase 8 is the final technical control point before DNS cutover and public indexing impact. A weak bootstrap here — skipping gate verification, missing tooling, or vague RC identification — propagates defects to the go/no-go decision and to live users.
- The `phase-8-rc-v1` git tag is the immutable reference for the Phase 8 validation run. All workstreams must validate the same commit. If the RC is re-cut during Phase 8 due to a defect fix, the tag must be updated and all gates re-run from WS-A.
- Phase 8 starts after deployment (Phase 7) is already operational. Validation failures discovered in this phase are launch blockers and should be triaged with production-level urgency. If the production host is already serving Hugo traffic, treat failures as active production risk.
- For this ticket, "operational" means the required file is committed on the selected RC and any referenced workflow has a successful run record for the same workflow definition in the current Phase 7 evidence set or on the selected RC itself.
- Record owner acknowledgments, backup contacts, and the go/no-go decision window in `migration/phase-8-approver-roster.md`. Mirror any blocking owner decisions in this ticket's Progress Log so downstream Phase 8 tickets can consume them without guessing.
- This repository's Lighthouse CI configuration file is `lighthouserc.json`. Use that filename in Phase 8 records unless a later ticket intentionally renames the config.
- Reference: `analysis/plan/details/phase-8.md` §Phase Position and Dependencies, §Non-Negotiable Release Gates
