## RHI-097 · Workstream D — Incident Detection, Triage, and Recovery

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 9  
**Workstream:** WS-D  
**Assigned to:** Incident Commander  
**Target date:** 2026-07-29  
**Created:** 2026-03-08  
**Updated:** 2026-03-08

---

### Goal

Operate a formal incident detection, triage, and recovery model for the full stabilization window. Post-launch anomalies must be treated as operational incidents — not ad-hoc tasks — with defined severity levels, SLA targets, named owners, and mandatory audit trails. The goal is to ensure that no Sev-1 incident goes unresolved beyond its SLA, no Sev-2 goes unowned, and every significant incident produces a corrective action entry linked to a permanent fix.

---

### Acceptance Criteria

**Operational model in place (from bootstrap):**
- [ ] Severity model documented, agreed, and communicated to all role owners:
  - [ ] Sev-1: homepage outage, HTTPS failure, widespread canonical misconfiguration, systemic redirect failure on priority routes
  - [ ] Sev-2: template-family defect with material SEO or UX impact but partial workaround available
  - [ ] Sev-3: isolated route issues with low traffic and no systemic impact
- [ ] SLA targets confirmed with all role owners:
  - [ ] Sev-1 acknowledgement: 15 min during launch window, 60 min afterward
  - [ ] Sev-1 mitigation (rollback or hotfix initiated): 60 min from acknowledgement
  - [ ] Sev-2 mitigation plan: same business day
  - [ ] Sev-3: tracked; resolved within stabilization window
- [ ] Incident bridge channel operational and all role owners subscribed
- [ ] Escalation path documented: who makes the rollback/hotfix decision and who executes it

**During stabilization:**
- [ ] Every Sev-1 incident has an incident log entry within the SLA acknowledgement window
- [ ] Every Sev-1 is resolved or rollback is initiated within 60 minutes of acknowledgement
- [ ] Every Sev-2 has a mitigation plan assigned same business day
- [ ] No silent risk acceptance: every accepted exception is documented with owner and rationale
- [ ] Incident log is updated after every incident with: timeline, root cause classification, and corrective action

**Exit criteria:**
- [ ] No open Sev-1 incidents for 14 consecutive days before stabilization exit
- [ ] All Sev-2 incidents either resolved or explicitly accepted with documented owner and plan
- [ ] Incident log reviewed as part of stabilization exit (RHI-102)
- [ ] Post-incident corrective actions are linked to permanent fixes (new tickets where appropriate)

---

### Tasks

**Incident model setup:**
- [ ] Document severity model and SLA targets in `monitoring/launch-cutover-log.md` (launch-day section) and reference in all monitoring workstream tickets
- [ ] Confirm escalation chain: incident commander → migration owner → DNS/deployment operator
- [ ] Confirm rollback decision criteria (when to rollback vs hotfix) with incident commander and migration owner
- [ ] Confirm and test incident bridge channel at bootstrap

**Primary signal source monitoring:**
- [ ] Ensure the following signal sources are checked on the cadence defined per WS-B through WS-H:
  - [ ] Search Console Page Indexing and Sitemaps reports (SEO operator, daily week 1 / weekly week 2–6)
  - [ ] Synthetic route checker (playwright smoke tests, daily week 1 / 2x/week thereafter)
  - [ ] Canonical consistency check (daily week 1 / weekly thereafter)
  - [ ] Lighthouse regression runs on representative templates (daily week 1)
  - [ ] Mixed-content and HTTPS checks (daily week 1 / weekly thereafter)
- [ ] Ensure monitoring cadence aligns with Phase 9 plan:
  - [ ] T-0 to T+4h: check every 15–30 minutes
  - [ ] Day 1 to Day 3: two scheduled check-ins per day
  - [ ] Week 1 to Week 2: daily standup with defect burndown
  - [ ] Week 3 to Week 6: weekly stabilization review

**Incident handling (per incident):**
- [ ] For every Sev-1:
  - [ ] Acknowledge in incident bridge within SLA
  - [ ] Open incident log entry in `monitoring/launch-cutover-log.md` (or dedicated incident file for post-launch-window incidents)
  - [ ] Assign incident commander and resolution owner
  - [ ] Initiate rollback or hotfix within 60 minutes of acknowledgement
  - [ ] Record timeline, decisions, and remediation in incident log
  - [ ] Post-incident: identify root cause and create corrective action entry or new ticket
- [ ] For every Sev-2:
  - [ ] Acknowledge and assign owner same business day
  - [ ] Produce mitigation plan with target resolution date
  - [ ] Track in defect burndown
  - [ ] Close with post-incident note referencing fix
- [ ] For every Sev-3:
  - [ ] Log and track; resolve within stabilization window or explicitly accept with rationale

**Stabilization exit gate check:**
- [ ] Review full incident log at week 6 exit review
- [ ] Confirm no open Sev-1 for 14 consecutive days
- [ ] Confirm all Sev-2s are resolved or explicitly accepted with owners
- [ ] Include incident summary in stabilization report (RHI-102)

---

### Out of Scope

- Creating or modifying monitoring scripts (covered per respective workstream tickets WS-B through WS-G)
- Performing DNS changes, deployments, or configuration changes (performed by deployment/DNS operators under incident commander direction)
- Long-term blameless post-mortems or engineering retrospectives (post-stabilization activity)
- Triaging content quality issues unrelated to migration stabilization

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-093 Done — Phase 9 Bootstrap; incident bridge, severity model, and role assignments confirmed | Ticket | Pending |
| RHI-094 Done — Cutover executed; launch window incident log started | Ticket | Pending |
| Monitoring workstreams active: WS-B (RHI-095), WS-E (RHI-098), WS-F (RHI-099), WS-G (RHI-100) | Ticket | Pending |
| `migration/phase-7-rollback-runbook.md` committed and drilled (Phase 7) | Phase | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Incident commander unavailable during a Sev-1 event | Low | Critical | Designate a named backup incident commander before T-0; confirm availability for launch window | Migration Owner |
| Sev-1 SLA breached because of unclear escalation path | Low | High | Escalation chain must be documented and tested at bootstrap; bridge channel confirmed operational | Incident Commander |
| Hotfix introduces new defect (regression) | Medium | High | All hotfixes require a targeted validation pass before deployment; no blind patches to production | Engineering Owner |
| Rollback decision delayed due to disagreement between operators | Low | High | Decision criteria agreed in advance; incident commander has final authority; document in runbook | Incident Commander |
| Incident log entries not maintained during high-pressure events | Medium | Medium | Designate communications owner to log in real time during incident; incident commander reviews log post-resolution | Communications Owner |
| Sev-3 backlog accumulates and creates hidden systemic risk | Medium | Medium | Weekly defect burndown review; escalate any Sev-3 pattern to Sev-2 if a common root cause is identified | Engineering Owner |

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

- Incident log entries (in `monitoring/launch-cutover-log.md` and/or dedicated incident files) for all Sev-1/Sev-2 events
- Post-incident corrective action entries linked to permanent fixes or new tickets
- Incident summary section in stabilization report (produced in RHI-102)

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |

---

### Notes

- Every Sev-1 incident must have a written timeline and root-cause classification. Verbal resolutions without documentation expose the team to repeated failures of the same type and make the exit review unreliable.
- The distinction between rollback and hotfix must be decided by the incident commander, not by default or inertia. A hotfix that cannot be tested in under 30 minutes is a rollback situation.
- Incident bridge hygiene: use clear message threading per incident; avoid a single noisy channel that mixes incident traffic with general monitoring updates.
- Reference: `analysis/plan/details/phase-9.md` §Workstream D: Incident Detection, Triage, and Recovery, §Fixed Operational Thresholds, §Operating Model and Ownership
