## RHI-030 · Phase 3 Sign-off and Handover to Phase 4

**Status:** In Progress  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 3  
**Assigned to:** Migration Owner  
**Target date:** 2026-04-08  
**Created:** 2026-03-07  
**Updated:** 2026-03-10

---

### Goal

Formally close Phase 3 by verifying that all prerequisite and workstream tickets (RHI-019 through RHI-029 plus RHI-104, RHI-105, and RHI-107) are complete, the Hugo scaffold is deployable end-to-end, all blocking quality gates are passing in CI, staged baseline checks are resolved or risk-accepted, and the Phase 4 content migration team has received and acknowledged the Phase 3 handover package. Phase 4 content migration and Phase 5 SEO discoverability work must not begin until this ticket is `Done`. Any unresolved scaffold gap or failing quality gate identified here must be fixed or explicitly accepted with documented risk before sign-off is recorded.

---

### Acceptance Criteria

- [x] All Phase 3 workstream tickets are `Done`:
  - [x] RHI-019 Done — Phase 3 Bootstrap complete
  - [x] RHI-020 Done — Repository Bootstrap (Hugo layout, `.gitignore`, `README.md`)
  - [x] RHI-021 Done — Hugo Configuration Hardening (`hugo.toml`, routing, outputs, taxonomies)
  - [x] RHI-022 Done — Content Contract and Archetypes (validation script, archetypes committed)
  - [x] RHI-023 Done — Template Scaffolding (all primary templates with SEO partials)
  - [x] RHI-024 Done — SEO Foundation (`check:seo` script passing, sitemap/robots validated, staging noindex working)
  - [x] RHI-025 Done — URL Parity Baseline (`check:url-parity` script passing, parity report generated)
  - [x] RHI-026 Done — Asset and Performance Baseline (Lighthouse CI passing, asset policy documented)
  - [x] RHI-027 Done — Accessibility and UX Baseline (`check:a11y` passing, manual checklist documented)
  - [x] RHI-028 Done — Security, Privacy, and Operational Hardening (`SECURITY-CONTROLS.md` complete, mixed-content clean)
  - [x] RHI-029 Done — CI/CD and Deployment Scaffolding (deployment workflow successful)
  - [x] RHI-104 Done — Shared discovery surfaces and list-page UI implemented on the shipped scaffold paths
  - [x] RHI-107 Done — Homepage/archive/shared-shell visual alignment matches the approved generated design examples
  - [x] RHI-105 Done — Article readability and contextual-navigation UI implemented with graceful fallbacks
- [ ] All Phase 3 Exit Gate conditions are met (from `analysis/plan/details/phase-3.md §Exit Gate to Phase 4`):
  - [ ] CI pipeline is passing on scaffold-only content
  - [x] URL parity tooling is validated against a sampled subset of Phase 1 manifest
  - [x] SEO smoke checks pass on all primary template classes
  - [ ] Deployment to Pages succeeds with correct canonical host behavior in non-production dry run
  - [ ] Blocking gates pass in CI (`validate:frontmatter`, production build, `check:url-parity`, `check:seo`, `check:links`)
  - [x] Staged baseline gates (`check:a11y`, `check:perf`) are passing or explicitly risk-accepted with owners and target resolution phase
- [ ] Phase 3 Definition of Done conditions are met:
  - [x] Repository scaffolding supports deterministic local and CI builds
  - [x] Core template types exist and include shared SEO primitives
  - [x] Discovery and article UI layers are implemented without duplicating SEO logic
  - [x] Structural and screenshot-level visual acceptance are both satisfied or explicitly risk-accepted with owner sign-off
  - [x] Front matter contract is machine-validated in CI
  - [x] URL parity checks are implemented and release-blocking
  - [x] Pages deployment workflow is configured and successfully deploys test artifact
  - [ ] Baseline performance/accessibility/security checks run and produce report artifacts
  - [ ] Custom domain and HTTPS readiness are validated
  - [x] Staging noindex controls are verified
  - [x] Outstanding risks have owners, mitigations, and target resolution phases
- [ ] `migration/phase-3-signoff.md` is committed with:
  - [x] Summary of all Phase 3 workstream outcomes (RHI-020 through RHI-029 plus RHI-104, RHI-105, and RHI-107) with ticket IDs and file paths
  - [x] Phase 3 Definition of Done compliance statement
  - [x] Outstanding risks with owners and mitigation plans
  - [x] Phase 4 entry conditions — what Phase 4 can rely on from Phase 3 outputs
  - [x] Any accepted deviation from the approved generated design examples is explicitly documented with owner approval
  - [x] Stakeholder sign-off block (migration owner, SEO owner, engineering owner)
- [ ] Phase 4 team has confirmed receipt of the Phase 3 handover package
- [x] 5% URL-change threshold status is reported: is the edge redirect layer mandatory before Phase 7?

---

### Tasks

- [x] Confirm each workstream ticket is `Done` (run through checklist in Acceptance Criteria), including `RHI-107` screenshot-fidelity scope
- [ ] Run all blocking quality gates locally against the final scaffold commit to verify end-to-end pass:
  - [x] `npm run validate:frontmatter`
  - [x] `hugo --minify --environment production`
  - [x] `npm run check:url-parity`
  - [x] `npm run check:seo`
  - [x] `npm run check:links`
- [ ] Run staged baseline gates locally and record outcomes:
  - [x] `npm run check:a11y`
  - [x] `npm run check:perf`
- [ ] Review all Phase 3 Non-Negotiable Constraints from `analysis/plan/details/phase-3.md`:
  - [x] `baseURL` includes protocol and trailing slash
  - [x] Hugo alias redirect semantics are documented (HTML meta refresh, not `301`/`308`)
  - [x] GitHub Pages artifact requirements are met (no symlinks, correct artifact name)
  - [ ] Custom domain source of truth is repository settings/API — verified in Settings, not only CNAME
  - [x] Staging noindex is via meta tag, not robots.txt Disallow
- [ ] Review `migration/url-parity-report.json` — confirm 5% threshold status and record finding:
  - [x] If at or above threshold: escalate edge redirect infrastructure decision before Phase 7 (flag in sign-off document)
- [ ] Trigger full CI deployment workflow (`workflow_dispatch`) on the final scaffold commit:
  - [ ] Confirm all quality gates pass in CI
  - [ ] Confirm Pages deployment succeeds
  - [ ] Confirm deployed canonical URLs use `https://www.rhino-inquisitor.com/`
  - [ ] Record CI run URL in Progress Log
- [ ] Draft `migration/phase-3-signoff.md`:
  - [x] Workstream outcomes table (ticket ID, deliverable, file path)
  - [x] Definition of Done compliance checklist
  - [x] Exit gate status (all four conditions from phase-3.md)
  - [x] Structural versus visual-acceptance status for the discovery and article surfaces
  - [x] Outstanding risks accepted for Phase 4 (with owners)
  - [x] Phase 4 entry conditions
  - [x] 5% threshold status
  - [x] Stakeholder sign-off block
- [ ] Circulate sign-off document for approval (migration owner, SEO owner, engineering owner)
- [ ] Record final approval in Progress Log with approver names and dates
- [ ] Notify Phase 4 team that Phase 3 is complete; provide link to `migration/phase-3-signoff.md` and RHI-020 through RHI-029

---

### Out of Scope

- Importing WordPress content (Phase 4)
- Final DNS cutover (Phase 7)
- Post-launch monitoring (Phase 9)
- Implementing edge redirect layer (Phase 6/7 scope, unless 5% threshold forces earlier decision)
- Full WCAG manual audit (Phase 8)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-019 Done | Ticket | Pending |
| RHI-020 Done | Ticket | Pending |
| RHI-021 Done | Ticket | Pending |
| RHI-022 Done | Ticket | Pending |
| RHI-023 Done | Ticket | Pending |
| RHI-024 Done | Ticket | Pending |
| RHI-025 Done | Ticket | Pending |
| RHI-026 Done | Ticket | Pending |
| RHI-027 Done | Ticket | Pending |
| RHI-028 Done | Ticket | Pending |
| RHI-029 Done | Ticket | Pending |
| RHI-104 Done | Ticket | Pending |
| RHI-105 Done | Ticket | Pending |
| RHI-107 Done | Ticket | Pending |
| Migration owner, SEO owner, and engineering owner available for sign-off | Access | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| One or more workstream tickets not `Done` by target date | Medium | High | Identify on Day 8 of Phase 3; triage blockers; defer only with explicit scope-reduction approval | Migration Owner |
| Quality gate failure discovered at sign-off time | Low | High | Run all gates locally before convening sign-off; document any known failures and their planned fix phase | Engineering Owner |
| 5% URL threshold exceeded — edge redirect infrastructure not yet scoped | Medium | High | Flag in sign-off document; initiate edge infrastructure scoping before Phase 7 target date; do not suppress the finding | Migration Owner |
| Phase 4 team not available to receive handover | Low | Low | Notify Phase 4 team on Day 7 of Phase 3; confirm receipt before sign-off is recorded as complete | Project Manager |
| `migration/phase-3-signoff.md` lacks enough detail for Phase 4 to operate independently | Low | Medium | Use RHI-009 and RHI-018 sign-off documents as structural references; ensure Phase 4 entry conditions section is actionable | Migration Owner |

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

- `migration/phase-3-signoff.md`
- All Phase 3 workstream tickets (RHI-020 through RHI-029 plus RHI-104, RHI-105, and RHI-107) confirmed `Done` and documented

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-10 | Open | Sign-off criteria expanded so discovery/article surfaces must also reconcile the approved generated design examples, not only the structural scaffold tickets. |
| 2026-03-10 | In Progress | Reconciled ticket state with the completed workstreams (`RHI-027`, `RHI-028`, and `RHI-107` were stale in the phase index), drafted `migration/phase-3-signoff.md`, and verified the local blocking gate stack passes on commit `7dd15ad`. |
| 2026-03-10 | In Progress | Initial staged sign-off validation found a contrast regression on `.site-header__search-label` and `.site-footer__copy`; updated `src/static/styles/site.css`, then re-ran `npm run check:a11y` and `npm run check:perf` successfully. |
| 2026-03-10 | In Progress | Final RHI-030 closure remains blocked on GitHub-side evidence that is not directly accessible from this environment: fresh `workflow_dispatch` run URL, Pages settings/API verification for the custom domain, stakeholder approvals, and Phase 4 handover receipt. |

---

### Notes

- The sign-off document must include a clear Phase 4 entry conditions section. Phase 4 engineers should be able to read `migration/phase-3-signoff.md` and know exactly what has been built, what they can rely on, and what is still an open question.
- The 5% URL-change threshold finding is not optional to report. If it is exceeded, the edge redirect infrastructure decision cannot wait until Phase 7. Surface this in the sign-off document regardless of the finding.
- Any risk accepted at sign-off must be logged with the accepting owner's name. Undocumented risk acceptance is indistinguishable from overlooked risk.
- Reference: `analysis/plan/details/phase-3.md` §Definition of Done, §Exit Gate to Phase 4, §Critical Risks and Mitigations
