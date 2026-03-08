## RHI-102 · Workstream I — Exit Criteria and BAU Handoff

**Status:** Open  
**Priority:** Critical  
**Estimate:** L  
**Phase:** 9  
**Workstream:** WS-I  
**Assigned to:** Migration Owner  
**Target date:** 2026-07-29  
**Created:** 2026-03-08  
**Updated:** 2026-03-08

---

### Goal

Formally close the migration stabilization window by verifying that all exit criteria are met with objective evidence, producing the stabilization summary report, and handing off ownership of the site to business-as-usual (BAU) operations with a known monitoring schedule, open-risk register, and redirect-retention calendar. Migration closure is only valid when evidence exists — not when time has elapsed.

---

### Acceptance Criteria

**Exit criteria (all must be met):**
- [ ] No open Sev-1 incidents for 14 consecutive days before exit review
- [ ] All priority legacy URL set entries have approved outcomes with no unresolved gaps (confirmed via `monitoring/legacy-route-health-report.json`)
- [ ] Canonical, sitemap, and robots consistency stable for two consecutive weekly audits (confirmed via `monitoring/canonical-consistency-report.json`)
- [ ] Search Console indexing anomalies are understood, tracked, and non-escalating (confirmed via `monitoring/search-console-indexing-report.md`)
- [ ] Performance trend is stable against fixed operational thresholds (LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 at p75; Lighthouse ≥ 90 on homepage and article) — confirmed via `monitoring/cwv-lighthouse-trend.json`
- [ ] Security and domain posture checks pass without critical exceptions (confirmed via `monitoring/security-domain-report.json`)

**Stabilization summary report:**
- [ ] `monitoring/stabilization-summary.md` committed, covering:
  - [ ] Launch date and cutover outcome
  - [ ] Incident log summary (Sev-1/Sev-2 count, resolution times, root causes)
  - [ ] Indexing transition narrative (trend from launch to exit)
  - [ ] Redirect health summary (priority URL set status at exit)
  - [ ] Performance and CWV summary (lab trend and field CWV status at exit)
  - [ ] SEO and canonical consistency summary
  - [ ] Security posture summary
  - [ ] Open-risk register with owners and resolution due dates
  - [ ] Redirect retention calendar (moved URLs with 12-month expiry tracking)

**BAU handoff:**
- [ ] BAU monitoring playbook documented:
  - [ ] Weekly checks: Search Console Page Indexing trend, canonical spot-check, sitemap fetch health, Lighthouse run
  - [ ] Monthly checks: mixed-content review, TLS certificate expiry, redirect health sample, structured data validation
  - [ ] Named BAU owner for SEO monitoring
  - [ ] Named BAU owner for engineering/infra monitoring
  - [ ] Escalation path for Sev-1/Sev-2 incidents post-stabilization
- [ ] BAU owners have confirmed readiness and accepted ownership
- [ ] Redirect retention calendar has named owner and review schedule
- [ ] Open-risk register has no unowned items

**Sign-off:**
- [ ] Migration owner signs stabilization summary and exit confirmation
- [ ] SEO owner signs stabilization summary
- [ ] Engineering owner signs stabilization summary

---

### Tasks

**Exit criteria verification:**
- [ ] Review `monitoring/launch-cutover-log.md` for Sev-1 history; confirm no open Sev-1 for 14+ days
- [ ] Review `monitoring/legacy-route-health-report.json`; confirm all priority URLs have approved outcomes
- [ ] Review `monitoring/canonical-consistency-report.json` for last two weekly audits; confirm stable
- [ ] Review `monitoring/search-console-indexing-report.md` for week-5–6 entries; confirm anomalies understood and non-escalating
- [ ] Review `monitoring/cwv-lighthouse-trend.json` and `monitoring/cwv-field-trend.md`; confirm thresholds met
- [ ] Review `monitoring/security-domain-report.json`; confirm no critical exceptions
- [ ] If any exit criterion is not met, document the gap, assign an owner, set a resolution date, and defer exit review

**Stabilization summary report authoring:**
- [ ] Draft `monitoring/stabilization-summary.md`:
  - [ ] Pull launch timeline and incident summary from `monitoring/launch-cutover-log.md`
  - [ ] Pull indexing trend narrative from `monitoring/search-console-indexing-report.md`
  - [ ] Pull redirect health summary from `monitoring/legacy-route-health-report.json`
  - [ ] Pull performance and CWV summary from `monitoring/cwv-lighthouse-trend.json` and `monitoring/cwv-field-trend.md`
  - [ ] Pull canonical and SEO summary from `monitoring/canonical-consistency-report.json`
  - [ ] Pull security summary from `monitoring/security-domain-report.json`
  - [ ] Compile open-risk register from all monitoring workstreams
  - [ ] Document redirect retention calendar for moved URLs (minimum 12-month horizon)
- [ ] Review draft with SEO owner and engineering owner
- [ ] Incorporate feedback; commit final version

**BAU handoff package:**
- [ ] Draft BAU monitoring playbook (weekly and monthly cadence, owned checks, escalation path)
- [ ] Review playbook with proposed BAU owners (SEO owner, engineering owner)
- [ ] Confirm BAU owners accept ownership; record names in `monitoring/stabilization-summary.md`
- [ ] Confirm redirect retention calendar has a named owner and scheduled review dates
- [ ] Confirm open-risk register items all have owners

**Sign-off circulation:**
- [ ] Circulate `monitoring/stabilization-summary.md` for approval:
  - [ ] Migration owner signs
  - [ ] SEO owner signs
  - [ ] Engineering owner signs
- [ ] Record approvals in Progress Log with names and dates
- [ ] Commit signed version with approvers noted

**Handoff announcement:**
- [ ] Announce migration stabilization closure with link to `monitoring/stabilization-summary.md`
- [ ] Communicate BAU monitoring ownership to relevant stakeholders

---

### Out of Scope

- Long-term SEO growth experiments or content strategy (post-BAU scope)
- New feature development
- Decommissioning the old WordPress infrastructure (separate task requiring its own ticket after redirect retention period)
- Search ranking analysis or competitive positioning reviews

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| All Phase 9 monitoring workstreams active and producing outputs: RHI-095 through RHI-101 | Ticket | Pending |
| WS-H (RHI-101) week-5–6 summary report produced | Ticket | Pending |
| All monitoring artifacts committed: `monitoring/legacy-route-health-report.json`, `monitoring/canonical-consistency-report.json`, `monitoring/search-console-indexing-report.md`, `monitoring/cwv-lighthouse-trend.json`, `monitoring/cwv-field-trend.md`, `monitoring/security-domain-report.json` | Phase | Pending |
| Migration owner, SEO owner, and engineering owner available for exit review and sign-off | Access | Pending |
| No open Sev-1 for 14 consecutive days (confirmed from WS-D incident log) | Condition | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Exit criteria not met at end of week 6 | Medium | High | Extend stabilization window by 1–2 weeks and re-evaluate; exit criteria cannot be waived | Migration Owner |
| Open-risk register items have no owner at exit review | Low | Medium | Review open risks at week-5 review; assign owners before week-6 exit; no unowned risks at sign-off | Migration Owner |
| BAU owner is not confirmed before sign-off | Low | High | BAU owner confirmation is a hard requirement for sign-off; escalate to stakeholders if unconfirmed | Migration Owner |
| Redirect retention calendar not maintained post-handoff (calendar abandoned after sign-off) | Medium | Medium | Calendar must have a named owner and scheduled review at month 3, 6, and 12 | SEO Owner |
| Stabilization summary does not reflect true state (gaps in monitoring artifact data) | Low | High | All referenced artifacts must be committed before summary is drafted; do not draft from memory | Engineering Owner |
| Old WordPress infrastructure decommissioned prematurely before redirect retention expires | Low | High | Document decommission moratorium until redirect retention period ends; include in BAU playbook | Engineering Owner |

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

- `monitoring/stabilization-summary.md` — week-6 closure report, incident summary, and BAU handoff
- BAU monitoring playbook (included in or referenced from stabilization summary)
- Redirect retention calendar with named owner
- Open-risk register with owners
- Signed exit confirmation from migration owner, SEO owner, and engineering owner

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |

---

### Notes

- Exit criteria are binary: either met with evidence or not met. "Mostly stable" is not a pass. If any criterion is unmet, extend the stabilization window and document the reason.
- The BAU handoff is a real ownership transfer, not a formality. If SEO monitoring and engineering monitoring do not have named owners post-handoff, the migration is not complete and will likely regress silently.
- The old WordPress infrastructure must not be decommissioned until the redirect retention period has passed and all high-value inbound links pointing to the legacy platform have either been reclaimed or are confirmed to resolve through the new redirect stack.
- Reference: `analysis/plan/details/phase-9.md` §Workstream I: Exit Criteria and BAU Handoff, §Definition of Done
