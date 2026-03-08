## RHI-030 · Phase 3 Sign-off and Handover to Phase 4

**Status:** Open  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 3  
**Assigned to:** Migration Owner  
**Target date:** 2026-04-08  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Formally close Phase 3 by verifying that all prerequisite and workstream tickets (RHI-019 through RHI-029) are complete, the Hugo scaffold is deployable end-to-end, all blocking quality gates are passing in CI, staged baseline checks are resolved or risk-accepted, and the Phase 4 content migration team has received and acknowledged the Phase 3 handover package. Phase 4 content migration and Phase 5 SEO discoverability work must not begin until this ticket is `Done`. Any unresolved scaffold gap or failing quality gate identified here must be fixed or explicitly accepted with documented risk before sign-off is recorded.

---

### Acceptance Criteria

- [ ] All Phase 3 workstream tickets are `Done`:
  - [ ] RHI-019 Done — Phase 3 Bootstrap complete
  - [ ] RHI-020 Done — Repository Bootstrap (Hugo layout, `.gitignore`, `README.md`)
  - [ ] RHI-021 Done — Hugo Configuration Hardening (`hugo.toml`, routing, outputs, taxonomies)
  - [ ] RHI-022 Done — Content Contract and Archetypes (validation script, archetypes committed)
  - [ ] RHI-023 Done — Template Scaffolding (all primary templates with SEO partials)
  - [ ] RHI-024 Done — SEO Foundation (`check:seo` script passing, sitemap/robots validated, staging noindex working)
  - [ ] RHI-025 Done — URL Parity Baseline (`check:url-parity` script passing, parity report generated)
  - [ ] RHI-026 Done — Asset and Performance Baseline (Lighthouse CI passing, asset policy documented)
  - [ ] RHI-027 Done — Accessibility and UX Baseline (`check:a11y` passing, manual checklist documented)
  - [ ] RHI-028 Done — Security, Privacy, and Operational Hardening (`SECURITY-CONTROLS.md` complete, mixed-content clean)
  - [ ] RHI-029 Done — CI/CD and Deployment Scaffolding (deployment workflow successful)
- [ ] All Phase 3 Exit Gate conditions are met (from `analysis/plan/details/phase-3.md §Exit Gate to Phase 4`):
  - [ ] CI pipeline is passing on scaffold-only content
  - [ ] URL parity tooling is validated against a sampled subset of Phase 1 manifest
  - [ ] SEO smoke checks pass on all primary template classes
  - [ ] Deployment to Pages succeeds with correct canonical host behavior in non-production dry run
  - [ ] Blocking gates pass in CI (`validate:frontmatter`, production build, `check:url-parity`, `check:seo`, `check:links`)
  - [ ] Staged baseline gates (`check:a11y`, `check:perf`) are passing or explicitly risk-accepted with owners and target resolution phase
- [ ] Phase 3 Definition of Done conditions are met:
  - [ ] Repository scaffolding supports deterministic local and CI builds
  - [ ] Core template types exist and include shared SEO primitives
  - [ ] Front matter contract is machine-validated in CI
  - [ ] URL parity checks are implemented and release-blocking
  - [ ] Pages deployment workflow is configured and successfully deploys test artifact
  - [ ] Baseline performance/accessibility/security checks run and produce report artifacts
  - [ ] Custom domain and HTTPS readiness are validated
  - [ ] Staging noindex controls are verified
  - [ ] Outstanding risks have owners, mitigations, and target resolution phases
- [ ] `migration/phase-3-signoff.md` is committed with:
  - [ ] Summary of all Phase 3 workstream outcomes (RHI-020 through RHI-029) with ticket IDs and file paths
  - [ ] Phase 3 Definition of Done compliance statement
  - [ ] Outstanding risks with owners and mitigation plans
  - [ ] Phase 4 entry conditions — what Phase 4 can rely on from Phase 3 outputs
  - [ ] Stakeholder sign-off block (migration owner, SEO owner, engineering owner)
- [ ] Phase 4 team has confirmed receipt of the Phase 3 handover package
- [ ] 5% URL-change threshold status is reported: is the edge redirect layer mandatory before Phase 7?

---

### Tasks

- [ ] Confirm each workstream ticket is `Done` (run through checklist in Acceptance Criteria)
- [ ] Run all blocking quality gates locally against the final scaffold commit to verify end-to-end pass:
  - [ ] `npm run validate:frontmatter`
  - [ ] `hugo --minify --environment production`
  - [ ] `npm run check:url-parity`
  - [ ] `npm run check:seo`
  - [ ] `npm run check:links`
- [ ] Run staged baseline gates locally and record outcomes:
  - [ ] `npm run check:a11y`
  - [ ] `npm run check:perf`
- [ ] Review all Phase 3 Non-Negotiable Constraints from `analysis/plan/details/phase-3.md`:
  - [ ] `baseURL` includes protocol and trailing slash
  - [ ] Hugo alias redirect semantics are documented (HTML meta refresh, not `301`/`308`)
  - [ ] GitHub Pages artifact requirements are met (no symlinks, correct artifact name)
  - [ ] Custom domain source of truth is repository settings/API — verified in Settings, not only CNAME
  - [ ] Staging noindex is via meta tag, not robots.txt Disallow
- [ ] Review `migration/url-parity-report.json` — confirm 5% threshold status and record finding:
  - [ ] If below threshold: note that Pages-only redirects are sufficient for current state
  - [ ] If at or above threshold: escalate edge redirect infrastructure decision before Phase 7 (flag in sign-off document)
- [ ] Trigger full CI deployment workflow (`workflow_dispatch`) on the final scaffold commit:
  - [ ] Confirm all quality gates pass in CI
  - [ ] Confirm Pages deployment succeeds
  - [ ] Confirm deployed canonical URLs use `https://www.rhino-inquisitor.com/`
  - [ ] Record CI run URL in Progress Log
- [ ] Draft `migration/phase-3-signoff.md`:
  - [ ] Workstream outcomes table (ticket ID, deliverable, file path)
  - [ ] Definition of Done compliance checklist
  - [ ] Exit gate status (all four conditions from phase-3.md)
  - [ ] Outstanding risks accepted for Phase 4 (with owners)
  - [ ] Phase 4 entry conditions
  - [ ] 5% threshold status
  - [ ] Stakeholder sign-off block
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
- All Phase 3 workstream tickets (RHI-020 through RHI-029) confirmed `Done` and documented

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- The sign-off document must include a clear Phase 4 entry conditions section. Phase 4 engineers should be able to read `migration/phase-3-signoff.md` and know exactly what has been built, what they can rely on, and what is still an open question.
- The 5% URL-change threshold finding is not optional to report. If it is exceeded, the edge redirect infrastructure decision cannot wait until Phase 7. Surface this in the sign-off document regardless of the finding.
- Any risk accepted at sign-off must be logged with the accepting owner's name. Undocumented risk acceptance is indistinguishable from overlooked risk.
- Reference: `analysis/plan/details/phase-3.md` §Definition of Done, §Exit Gate to Phase 4, §Critical Risks and Mitigations
