## RHI-083 · Phase 8 Bootstrap: Kickoff and Validation Environment Setup

**Status:** Open  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 8  
**Assigned to:** Migration Owner  
**Target date:** 2026-06-03  
**Created:** 2026-03-08  
**Updated:** 2026-03-08

---

### Goal

Confirm that Phase 7 sign-off is complete and all Phase 7 outputs required by Phase 8 are accessible before any validation workstream begins. Establish the Phase 8 team, review governing constraints and non-negotiable gate requirements, verify tooling and environment readiness, agree workstream ownership and sequencing, and set the go/no-go decision window.

Phase 8 is the final technical control point before DNS cutover and public indexing impact. Every downstream workstream (WS-A through WS-H) depends on this bootstrap establishing a clean, verified starting state. No Phase 8 workstream ticket (RHI-084 through RHI-091) should begin until this ticket is `Done`.

---

### Acceptance Criteria

- [ ] Phase 7 sign-off (RHI-082) is `Done` and `migration/phase-7-signoff.md` is committed
- [ ] Phase 7 CI gate suite is passing on `main` or the designated release branch:
  - [ ] `npm run validate:frontmatter` exits 0
  - [ ] `npm run check:url-parity` exits 0
  - [ ] `npm run check:redirect-chains` exits 0
  - [ ] `npm run check:canonical-alignment` exits 0
  - [ ] `npm run check:mixed-content` exits 0
  - [ ] `npm run check:seo-safe-deploy` exits 0
  - [ ] `npm run check:links` exits 0
  - [ ] `npm run validate:artifact` exits 0
  - [ ] Hugo production build exits 0
- [ ] Phase 7 deliverables are accessible and verified:
  - [ ] `.github/workflows/deploy-pages.yml` is committed and operational
  - [ ] `.github/workflows/build-pr.yml` is committed and operational
  - [ ] `migration/phase-7-gate-summary.csv` is committed (Phase 7 evidence trail)
  - [ ] `migration/phase-7-launch-runbook.md` is committed
  - [ ] `migration/phase-7-rollback-runbook.md` is committed and drill is recorded
  - [ ] `lighthouserc.js` (or `.lighthouserc.json`) is committed
- [ ] Phase 8 tooling dependencies are confirmed available or installable:
  - [ ] `@axe-core/playwright` for automated accessibility checks
  - [ ] `playwright` for smoke tests and scripted browser flows
  - [ ] `html-validate` for HTML markup conformance checks
  - [ ] `fast-xml-parser` for sitemap/feed validation
  - [ ] `@lhci/cli` for Lighthouse CI (already added in Phase 7)
  - [ ] `fast-glob` for deterministic output discovery
  - [ ] `gray-matter` for front matter policy checks
  - [ ] `ajv` for JSON-schema validation of manifest and report contracts
  - [ ] `lychee` or `linkinator` for broken-link scanning of deployed URLs
- [ ] Release candidate branch or tag is identified and the team agrees the RC is the validation target
- [ ] `validation/` directory structure is defined and ready to receive gate outputs:
  - [ ] `validation/url-parity-report.json`
  - [ ] `validation/redirect-quality-report.json`
  - [ ] `validation/seo-consistency-report.json`
  - [ ] `validation/robots-sitemap-report.json`
  - [ ] `validation/structured-data-report.json`
  - [ ] `validation/social-preview-report.json`
  - [ ] `validation/lhci-report/`
  - [ ] `validation/performance-budget-report.json`
  - [ ] `validation/accessibility-axe-report.json`
  - [ ] `validation/accessibility-manual-checklist.md`
  - [ ] `validation/html-conformance-report.json`
  - [ ] `validation/https-security-report.json`
- [ ] Migration owner, SEO owner, engineering owner, and DNS/operations owner are confirmed and available for Phase 8
- [ ] `migration/phase-8-approver-roster.md` is committed with role-to-name mapping and backup contacts for migration owner, SEO owner, engineering owner, and DNS/operations owner
- [ ] All Phase 8 workstream owners have read `analysis/plan/details/phase-8.md` and confirmed understanding
- [ ] Go/no-go decision window is agreed (date, approvers, required present)
- [ ] Phase 8 non-negotiable release gates reviewed with the full team:
  - [ ] URL parity gate must pass for all in-scope legacy URLs
  - [ ] Redirect quality gate: direct redirects only, zero chains, zero loops on migration routes
  - [ ] Canonical consistency gate: canonical, sitemap, internal links agree on final URLs
  - [ ] Robots/noindex gate: no accidental blocking or accidental `noindex` on indexable pages
  - [ ] Structured data gate: no critical errors on representative templates
  - [ ] HTTPS gate: valid cert, enforce HTTPS enabled, no critical mixed content
  - [ ] Accessibility gate: automated axe checks pass on representative templates
  - [ ] Performance gate: Lighthouse thresholds met on homepage and article template
  - [ ] Launch smoke test gate passes on production-like environment
  - [ ] Rollback drill executed and timed before launch window

---

### Tasks

- [ ] Verify RHI-082 is `Done`; if not, document the blocker and pause Phase 8
- [ ] Run all Phase 7 CI gates against the current release candidate; confirm all pass; record Actions run URL
- [ ] Confirm all Phase 7 deliverable files are committed to the repository
- [ ] Audit tooling dependencies: install any Phase 8-specific packages not already present
- [ ] Define and create `validation/` directory structure (empty files or README as placeholders)
- [ ] Identify the release candidate commit SHA or branch; tag it as `phase-8-rc-v1`
- [ ] Confirm Phase 8 team: migration owner, SEO owner, engineering owner, DNS/ops owner
- [ ] Create `migration/phase-8-approver-roster.md` with primary and backup approvers by role
- [ ] Share `analysis/plan/details/phase-8.md` with all workstream owners; request read confirmation
- [ ] Review Phase 8 non-negotiable release gates with the full team; log confirmations in Progress Log
- [ ] Set go/no-go decision window (target date, approver availability, meeting/async format)
- [ ] Assign workstream owners for WS-A through WS-H
- [ ] Agree target dates for each workstream ticket (RHI-084 through RHI-091)
- [ ] Establish Phase 8 execution sequence:
  - [ ] WS-A (RC Freeze and Validation Dataset) must complete first — it defines inputs for all others
  - [ ] WS-B through WS-G can run in parallel after WS-A is done
  - [ ] WS-H (Operational Readiness and Go/No-Go) requires all preceding workstreams done
  - [ ] Sign-off (RHI-092) requires WS-H done and go/no-go decision recorded
- [ ] Log all confirmations in Progress Log with names and dates
- [ ] Announce Phase 8 kickoff with link to Phase 7 sign-off and Phase 8 plan

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
| RHI-082 Done — Phase 7 sign-off recorded | Ticket | Pending |
| `migration/phase-7-signoff.md` committed | Phase | Pending |
| `migration/phase-7-gate-summary.csv` committed (Phase 7 evidence) | Phase | Pending |
| Phase 7 CI gate suite passing on RC | Phase | Pending |
| `.github/workflows/deploy-pages.yml` operational | Phase | Pending |
| `migration/phase-7-rollback-runbook.md` drilled and committed | Phase | Pending |
| Migration owner, SEO owner, engineering owner, DNS/ops owner available | Access | Pending |

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- Progress Log entries confirming Phase 8 team alignment and Phase 7 contract receipt
- `phase-8-rc-v1` git tag on the release candidate commit
- `validation/` directory structure committed
- Phase 8 workstream owner assignments recorded
- Go/no-go decision window agreed and documented

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |

---

### Notes

- Phase 8 is the final technical control point before DNS cutover and public indexing impact. A weak bootstrap here — skipping gate verification, missing tooling, or vague RC identification — propagates defects to the go/no-go decision and to live users.
- The `phase-8-rc-v1` git tag is the immutable reference for the Phase 8 validation run. All workstreams must validate the same commit. If the RC is re-cut during Phase 8 due to a defect fix, the tag must be updated and all gates re-run from WS-A.
- Phase 8 starts after deployment (Phase 7) is already operational. Validation failures discovered in this phase are launch blockers and should be triaged with production-level urgency. If the production host is already serving Hugo traffic, treat failures as active production risk.
- Reference: `analysis/plan/details/phase-8.md` §Phase Position and Dependencies, §Non-Negotiable Release Gates
