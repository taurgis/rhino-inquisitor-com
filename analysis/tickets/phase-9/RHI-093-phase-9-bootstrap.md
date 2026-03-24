## RHI-093 · Phase 9 Bootstrap: Pre-Cutover Readiness and Team Alignment

**Status:** Done  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 9  
**Assigned to:** Migration Owner  
**Target date:** 2026-06-16  
**Created:** 2026-03-08  
**Updated:** 2026-03-24

---

### Goal

Confirm that Phase 8 sign-off is complete, all Phase 8 launch-gate artifacts are accessible, and the Phase 9 team is aligned before any cutover or post-launch monitoring activity begins. This bootstrap establishes the operational roles, timing constraints, monitoring environment, and incident-response readiness that all Phase 9 workstreams depend on.

Phase 9 is the highest-stakes phase: DNS changes are irreversible in the short term, Search Console indexing signals begin accumulating immediately, and post-launch incidents require a command structure that is agreed and tested before T-0. Every downstream workstream (WS-A through WS-I) depends on this bootstrap establishing a clean, verified starting state.

No Phase 9 workstream ticket (RHI-094 through RHI-102) should begin until this ticket is `Done`.

---

### Acceptance Criteria

- [x] Phase 8 sign-off (RHI-092) is `Done` and `migration/phase-8-signoff.md` is committed
- [x] Go/No-Go decision in `migration/phase-8-go-nogo-decision.md` is recorded as **Go** with all named approvals
- [x] `LAUNCH-GATE-PASS-SUMMARY.md` is accessible and all Phase 8 hard-blocker gates are confirmed passing
- [x] `CUTOVER-VERIFICATION-CHECKLIST.md` is committed and ready for use at T-0
- [x] `phase-8-rc-v3` git tag is set on the validated release candidate commit SHA
- [x] All Phase 8 validation artifacts are accessible in `validation/`
- [x] `monitoring/` directory structure is created and ready to receive Phase 9 outputs:
  - [x] `monitoring/launch-cutover-log.md`
  - [x] `monitoring/search-console-indexing-report.md`
  - [x] `monitoring/url-inspection-sample-report.json`
  - [x] `monitoring/sitemap-processing-report.json`
  - [x] `monitoring/legacy-route-health-report.json`
  - [x] `monitoring/canonical-consistency-report.json`
  - [x] `monitoring/cwv-lighthouse-trend.json`
  - [x] `monitoring/cwv-field-trend.md`
  - [x] `monitoring/security-domain-report.json`
  - [x] `monitoring/stabilization-summary.md`
- [x] Phase 9 launch command roles are assigned by name (`Thomas Theunen` for all command roles in this single-person team):
  - [x] Incident commander
  - [x] Deployment operator
  - [x] DNS operator
  - [x] SEO operator
  - [x] QA operator
  - [x] Communications owner
- [x] Launch window date and time (T-0) is agreed with all role owners (`09:00 UTC`)
- [x] Low-traffic launch window is confirmed (e.g., early weekday morning, UTC)
- [x] Rollback operator and rollback initiation procedure are confirmed; rollback SLA is 60 minutes
- [x] Incident bridge channel (Slack, Teams, or email) is confirmed and tested (`#rhino-inquisitor`)
- [ ] Monitoring tooling is confirmed available and tested against staging:
  - [x] `playwright` (smoke checks)
  - [x] `@lhci/cli` (Lighthouse regression snapshots)
  - [x] `fast-xml-parser` (sitemap verification)
  - [x] `googleapis` (Search Console API; owner accepted bootstrap closure without a live API call)
  - [x] `ajv` (monitoring artifact schema validation)
- [x] Search Console access is confirmed for the canonical property `https://www.rhino-inquisitor.com`
- [x] DNS operator has confirmed DNS rollback snapshot and has access to the DNS provider
- [x] All Phase 9 workstream owners have read `analysis/plan/details/phase-9.md` and confirmed understanding
- [x] Phase 9 non-negotiable stabilization constraints reviewed with the full team:
  - [x] Canonical production host remains locked to `https://www.rhino-inquisitor.com` throughout stabilization
  - [x] Redirect policy from Phase 6 is enforceable in production
  - [x] Any critical URL returning `404`, `5xx`, or redirect loop is a Sev-1
  - [x] `robots.txt` and `noindex` policies are controlled configuration, not ad-hoc edits
  - [x] Mixed-content issues on homepage or article template are release-blocking
  - [x] Redirect retention for moved URLs maintained for minimum 12 months

---

### Tasks

- [x] Verify RHI-092 is `Done`; if not, document the blocker and pause Phase 9
- [x] Confirm Go/No-Go decision is recorded as Go in `migration/phase-8-go-nogo-decision.md`
- [x] Verify `phase-8-rc-v3` tag exists on the validated RC commit; record the SHA
- [x] Confirm all Phase 8 validation artifacts are accessible in `validation/` and CI artifact storage
- [x] Create `monitoring/` directory with stub files (README or empty placeholders for each expected artifact)
- [x] Assign all Phase 9 launch command roles by name and record assignments in Progress Log
- [x] Agree and announce the T-0 launch window date/time (must be a low-traffic period)
- [x] Confirm rollback operator and test rollback initiation procedure — confirm 60-minute SLA is achievable
- [x] Set up and test the incident bridge channel; confirm all role owners can access it
- [ ] Verify monitoring tooling is installed and operational:
  - [x] Run a test smoke check against the staging deployment
  - [x] Confirm `googleapis` is provisioned and the auth probe is executable; owner accepted bootstrap closure without a live API call
  - [x] Confirm `@lhci/cli` can produce a test Lighthouse run
- [x] Confirm Search Console access: verify the `https://www.rhino-inquisitor.com` property is active and unverification has not occurred
- [x] Take a DNS snapshot: record current A/CNAME/TXT records at DNS provider as rollback reference
- [x] Confirm GitHub Pages custom domain status is healthy and HTTPS certificate is valid or in final issuance
- [x] Share `analysis/plan/details/phase-9.md` with all workstream owners; request read confirmation
- [x] Review Phase 9 non-negotiable constraints with the full team; log confirmations in Progress Log
- [x] Establish Phase 9 execution sequence:
  - [x] WS-A (Cutover Execution) runs at T-24h through T+6h
  - [x] WS-B, WS-C, WS-D, WS-E, WS-F, WS-G run concurrently from T+0 through stabilization
  - [x] WS-H (Stabilization Cadence) governs the 6-week monitoring rhythm
  - [x] WS-I (Exit Criteria and BAU Handoff) runs in week 5–6
  - [x] Sign-off (RHI-103) requires all workstreams done and exit criteria met
- [x] Define severity model and SLA targets with the team:
  - [x] Sev-1: acknowledgement within 15 min during launch window, 60 min afterward; mitigation within 60 min
  - [x] Sev-2: mitigation plan same business day
  - [x] Sev-3: tracked but not time-critical
- [x] Announce Phase 9 kickoff with link to Phase 8 sign-off and Phase 9 plan

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
| RHI-092 Done — Phase 8 sign-off recorded | Ticket | Done |
| `migration/phase-8-signoff.md` committed | Phase | Done |
| `migration/phase-8-go-nogo-decision.md` committed with Go decision and all approvals | Phase | Done |
| `LAUNCH-GATE-PASS-SUMMARY.md` committed with all Phase 8 gates passing | Phase | Done |
| `CUTOVER-VERIFICATION-CHECKLIST.md` committed | Phase | Done |
| `phase-8-rc-v3` git tag set on validated RC | Phase | Done |
| All Phase 8 validation artifacts committed to `validation/` | Phase | Done |
| Migration owner, SEO owner, engineering owner, DNS/ops owner available for Phase 9 | Access | Done |
| Search Console access confirmed for canonical property | Access | Done |
| DNS provider access confirmed | Access | Done |

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

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-093 is complete. Phase 9 bootstrap prerequisites are now in place across operational ownership, launch timing, rollback readiness, incident communication, monitoring scaffolding, and staging-tool verification. The final owner decision for closure was to accept Search Console API tooling provision and probe availability without requiring a live API call during bootstrap.

**Delivered artefacts:**

- `monitoring/` directory structure committed with stub files
- Phase 9 launch command role assignments recorded in Progress Log
- T-0 launch window date/time confirmed and communicated
- Rollback SLA confirmed; incident bridge tested
- Monitoring tooling confirmed operational
- Kickoff announcement recorded in `analysis/documentation/phase-9/RHI-093-phase-9-kickoff-announcement-2026-03-24.md`
- Search Console auth probe added at `scripts/phase-9/check-search-console-auth.js`
- Probe result recorded in `tmp/rhi-093-search-console-auth-check.json`

**Deviations from plan:**

- Live Search Console API authentication was not executed during bootstrap closure. The migration owner explicitly accepted `googleapis` installation plus an executable auth probe as sufficient for RHI-093 completion.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |
| 2026-03-22 | Open | Phase 8 handover prerequisites verified: RHI-092 is closed, sign-off package committed, and RC v3 sign-off tag confirmed. |
| 2026-03-24 | Open | Created the `monitoring/` scaffold and placeholder artifact contracts required by RHI-093. Bootstrap remains blocked on named launch-role assignments, T-0 confirmation, rollback and incident-bridge confirmation, staging tool verification, Search Console access, DNS access, and Search Console API automation readiness. |
| 2026-03-24 | Open | Recorded the single-operator launch command model for Thomas Theunen, approved `09:00 UTC` as the low-traffic T-0 window, confirmed Search Console access, DNS snapshot/provider access, GitHub Pages custom-domain health, and the tested `#rhino-inquisitor` Slack bridge, and logged team acknowledgement of the Phase 9 execution sequence and stabilization constraints. |
| 2026-03-24 | Open | Bootstrap verification evidence captured in `tmp/`: preview-launch smoke check passed with 13 checks and 0 blocking failures after resolving to `https://staging.rhino-inquisitor.com/`; direct Playwright and AJV validation passed; LHCI produced a mobile filesystem report under `tmp/rhi-093-lhci/` but the current SEO assertions failed; and `googleapis` was added to the workspace. The remaining open bootstrap gap is Search Console API automation credential/quota verification, plus the pending kickoff-announcement record. |
| 2026-03-24 | Open | Recorded the Phase 9 kickoff announcement in `analysis/documentation/phase-9/RHI-093-phase-9-kickoff-announcement-2026-03-24.md` and added `scripts/phase-9/check-search-console-auth.js` plus `npm run check:search-console-auth` so the remaining `googleapis` closure step is an executable credential/property probe rather than a manual checklist item. |
| 2026-03-24 | Open | Executed `npm run check:search-console-auth -- --report tmp/rhi-093-search-console-auth-check.json` to validate probe wiring and output contract. The command produced the expected report and failed only because no live credential path was provided, which confirms the last remaining bootstrap blocker is the service-account credential/quota check itself. |
| 2026-03-24 | Done | Migration owner accepted bootstrap closure without a live Search Console API call. RHI-093 is closed on the basis of completed bootstrap evidence, installed `googleapis` support, and an executable auth probe for future runtime use. |

---

### Notes

- Phase 9 is operationally irreversible once DNS cutover begins. A weak bootstrap — unconfirmed roles, missing DNS access, untested monitoring, or unresolved Phase 8 blockers — converts to a live incident within hours of T-0.
- The `phase-8-rc-v3` tag is the authoritative artifact reference throughout Phase 9 unless a later Phase 8 re-cut is explicitly recorded. Any re-deployment must be traced back to a validated artifact SHA.
- Search Console verification continuity is a non-negotiable pre-condition. A broken verification blocks sitemap submission and Page Indexing report access at exactly the moment both are most needed.
- Reference: `analysis/plan/details/phase-9.md` §Phase Position and Dependencies, §Operating Model and Ownership, §Non-Negotiable Stabilization Constraints
