## RHI-093 · Phase 9 Bootstrap: Pre-Cutover Readiness and Team Alignment

**Status:** Open  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 9  
**Assigned to:** Migration Owner  
**Target date:** 2026-06-16  
**Created:** 2026-03-08  
**Updated:** 2026-03-08

---

### Goal

Confirm that Phase 8 sign-off is complete, all Phase 8 launch-gate artifacts are accessible, and the Phase 9 team is aligned before any cutover or post-launch monitoring activity begins. This bootstrap establishes the operational roles, timing constraints, monitoring environment, and incident-response readiness that all Phase 9 workstreams depend on.

Phase 9 is the highest-stakes phase: DNS changes are irreversible in the short term, Search Console indexing signals begin accumulating immediately, and post-launch incidents require a command structure that is agreed and tested before T-0. Every downstream workstream (WS-A through WS-I) depends on this bootstrap establishing a clean, verified starting state.

No Phase 9 workstream ticket (RHI-094 through RHI-102) should begin until this ticket is `Done`.

---

### Acceptance Criteria

- [ ] Phase 8 sign-off (RHI-092) is `Done` and `migration/phase-8-signoff.md` is committed
- [ ] Go/No-Go decision in `migration/phase-8-go-nogo-decision.md` is recorded as **Go** with all named approvals
- [ ] `LAUNCH-GATE-PASS-SUMMARY.md` is accessible and all Phase 8 hard-blocker gates are confirmed passing
- [ ] `CUTOVER-VERIFICATION-CHECKLIST.md` is committed and ready for use at T-0
- [ ] `phase-8-rc-v1` git tag is set on the validated release candidate commit SHA
- [ ] All Phase 8 validation artifacts are accessible in `validation/`
- [ ] `monitoring/` directory structure is created and ready to receive Phase 9 outputs:
  - [ ] `monitoring/launch-cutover-log.md`
  - [ ] `monitoring/search-console-indexing-report.md`
  - [ ] `monitoring/url-inspection-sample-report.json`
  - [ ] `monitoring/sitemap-processing-report.json`
  - [ ] `monitoring/legacy-route-health-report.json`
  - [ ] `monitoring/canonical-consistency-report.json`
  - [ ] `monitoring/cwv-lighthouse-trend.json`
  - [ ] `monitoring/cwv-field-trend.md`
  - [ ] `monitoring/security-domain-report.json`
  - [ ] `monitoring/stabilization-summary.md`
- [ ] Phase 9 launch command roles are assigned by name:
  - [ ] Incident commander
  - [ ] Deployment operator
  - [ ] DNS operator
  - [ ] SEO operator
  - [ ] QA operator
  - [ ] Communications owner
- [ ] Launch window date and time (T-0) is agreed with all role owners
- [ ] Low-traffic launch window is confirmed (e.g., early weekday morning, UTC)
- [ ] Rollback operator and rollback initiation procedure are confirmed; rollback SLA is 60 minutes
- [ ] Incident bridge channel (Slack, Teams, or email) is confirmed and tested
- [ ] Monitoring tooling is confirmed available and tested against staging:
  - [ ] `playwright` (smoke checks)
  - [ ] `@lhci/cli` (Lighthouse regression snapshots)
  - [ ] `fast-xml-parser` (sitemap verification)
  - [ ] `googleapis` (Search Console API)
  - [ ] `ajv` (monitoring artifact schema validation)
- [ ] Search Console access is confirmed for the canonical property `https://www.rhino-inquisitor.com`
- [ ] DNS operator has confirmed DNS rollback snapshot and has access to the DNS provider
- [ ] All Phase 9 workstream owners have read `analysis/plan/details/phase-9.md` and confirmed understanding
- [ ] Phase 9 non-negotiable stabilization constraints reviewed with the full team:
  - [ ] Canonical production host remains locked to `https://www.rhino-inquisitor.com` throughout stabilization
  - [ ] Redirect policy from Phase 6 is enforceable in production
  - [ ] Any critical URL returning `404`, `5xx`, or redirect loop is a Sev-1
  - [ ] `robots.txt` and `noindex` policies are controlled configuration, not ad-hoc edits
  - [ ] Mixed-content issues on homepage or article template are release-blocking
  - [ ] Redirect retention for moved URLs maintained for minimum 12 months

---

### Tasks

- [ ] Verify RHI-092 is `Done`; if not, document the blocker and pause Phase 9
- [ ] Confirm Go/No-Go decision is recorded as Go in `migration/phase-8-go-nogo-decision.md`
- [ ] Verify `phase-8-rc-v1` tag exists on the validated RC commit; record the SHA
- [ ] Confirm all Phase 8 validation artifacts are accessible in `validation/` and CI artifact storage
- [ ] Create `monitoring/` directory with stub files (README or empty placeholders for each expected artifact)
- [ ] Assign all Phase 9 launch command roles by name and record assignments in Progress Log
- [ ] Agree and announce the T-0 launch window date/time (must be a low-traffic period)
- [ ] Confirm rollback operator and test rollback initiation procedure — confirm 60-minute SLA is achievable
- [ ] Set up and test the incident bridge channel; confirm all role owners can access it
- [ ] Verify monitoring tooling is installed and operational:
  - [ ] Run a test smoke check against the staging deployment
  - [ ] Confirm `googleapis` credentials are available and quota is not exhausted
  - [ ] Confirm `@lhci/cli` can produce a test Lighthouse run
- [ ] Confirm Search Console access: verify the `https://www.rhino-inquisitor.com` property is active and unverification has not occurred
- [ ] Take a DNS snapshot: record current A/CNAME/TXT records at DNS provider as rollback reference
- [ ] Confirm GitHub Pages custom domain status is healthy and HTTPS certificate is valid or in final issuance
- [ ] Share `analysis/plan/details/phase-9.md` with all workstream owners; request read confirmation
- [ ] Review Phase 9 non-negotiable constraints with the full team; log confirmations in Progress Log
- [ ] Establish Phase 9 execution sequence:
  - [ ] WS-A (Cutover Execution) runs at T-24h through T+6h
  - [ ] WS-B, WS-C, WS-D, WS-E, WS-F, WS-G run concurrently from T+0 through stabilization
  - [ ] WS-H (Stabilization Cadence) governs the 6-week monitoring rhythm
  - [ ] WS-I (Exit Criteria and BAU Handoff) runs in week 5–6
  - [ ] Sign-off (RHI-103) requires all workstreams done and exit criteria met
- [ ] Define severity model and SLA targets with the team:
  - [ ] Sev-1: acknowledgement within 15 min during launch window, 60 min afterward; mitigation within 60 min
  - [ ] Sev-2: mitigation plan same business day
  - [ ] Sev-3: tracked but not time-critical
- [ ] Announce Phase 9 kickoff with link to Phase 8 sign-off and Phase 9 plan

---

### Out of Scope

- Executing DNS cutover (WS-A scope)
- Running post-launch monitoring checks (WS-B through WS-H scope)
- Resolving any open Phase 8 exceptions or defects (must be done before Phase 9 starts)
- New feature development unrelated to migration stabilization

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-092 Done — Phase 8 sign-off recorded | Ticket | Pending |
| `migration/phase-8-signoff.md` committed | Phase | Pending |
| `migration/phase-8-go-nogo-decision.md` committed with Go decision and all approvals | Phase | Pending |
| `LAUNCH-GATE-PASS-SUMMARY.md` committed with all Phase 8 gates passing | Phase | Pending |
| `CUTOVER-VERIFICATION-CHECKLIST.md` committed | Phase | Pending |
| `phase-8-rc-v1` git tag set on validated RC | Phase | Pending |
| All Phase 8 validation artifacts committed to `validation/` | Phase | Pending |
| Migration owner, SEO owner, engineering owner, DNS/ops owner available for Phase 9 | Access | Pending |
| Search Console access confirmed for canonical property | Access | Pending |
| DNS provider access confirmed | Access | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Phase 8 sign-off delayed, blocking Phase 9 start | Medium | High | Pre-position Phase 9 materials and role assignments while waiting for Phase 8 sign-off; do not delay role confirmation | Migration Owner |
| Go/No-Go decision is No-Go, blocking cutover | Low | High | If No-Go, document blockers, assign owners, set re-evaluation date; Phase 9 cannot proceed until Go is recorded | Migration Owner |
| Search Console property unverified or access lost | Low | High | Verify access at bootstrap Day 1; if verification is broken, recover immediately before setting T-0 | SEO Owner |
| DNS operator unavailable or DNS credentials inaccessible at T-0 | Low | Critical | Confirm DNS access at bootstrap; schedule a dry-run login; confirm backup operator | DNS Operator |
| Monitoring tooling not configured for production endpoints | Medium | Medium | Run test checks against staging at bootstrap; confirm no credential or quota issues before cutover | Engineering Owner |
| T-0 window set without checking traffic trough — cutover during peak traffic | Medium | High | Review analytics before confirming T-0 date; target lowest-traffic window (early weekday morning UTC) | Migration Owner |
| Incident command roles ambiguous or unconfirmed at T-0 | Low | High | Require named confirmation from every role owner before Phase 9 is unblocked | Migration Owner |

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

- `monitoring/` directory structure committed with stub files
- Phase 9 launch command role assignments recorded in Progress Log
- T-0 launch window date/time confirmed and communicated
- Rollback SLA confirmed; incident bridge tested
- Monitoring tooling confirmed operational

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |

---

### Notes

- Phase 9 is operationally irreversible once DNS cutover begins. A weak bootstrap — unconfirmed roles, missing DNS access, untested monitoring, or unresolved Phase 8 blockers — converts to a live incident within hours of T-0.
- The `phase-8-rc-v1` tag is the authoritative artifact reference throughout Phase 9. Any re-deployment must be traced back to a validated artifact SHA.
- Search Console verification continuity is a non-negotiable pre-condition. A broken verification blocks sitemap submission and Page Indexing report access at exactly the moment both are most needed.
- Reference: `analysis/plan/details/phase-9.md` §Phase Position and Dependencies, §Operating Model and Ownership, §Non-Negotiable Stabilization Constraints
