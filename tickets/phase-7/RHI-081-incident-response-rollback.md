## RHI-081 · Workstream H — Incident Response and Rollback

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 7  
**Assigned to:** Migration Owner  
**Target date:** 2026-05-30  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Define, document, and validate the incident response and rollback procedures for the DNS cutover, ensuring the team can respond decisively to launch-blocking failures within a bounded time window. Rollback triggers must be unambiguous, rollback steps must be tested before the live cutover, and the previous WordPress production stack must remain rollback-ready through the full stabilization window.

Rollback capability is not a contingency to think about on launch day — it is a commitment made before the launch window opens. This workstream produces that commitment in the form of a tested rollback procedure and defined incident thresholds.

---

### Acceptance Criteria

- [ ] `migration/phase-7-rollback-runbook.md` is committed and contains:
  - [ ] **Rollback trigger definitions** — specific, unambiguous criteria that mandate rollback (not subjective judgment calls):
    - [ ] 5 or more priority routes returning 404 or 5xx after the DNS propagation window closes
    - [ ] Enforce HTTPS unavailable 60 minutes after DNS propagation confirmation with incident impact requiring hold/rollback decision
    - [ ] Canonical tag or sitemap returning `github.io` host on live production domain
    - [ ] Any Priority-1 or Priority-2 URL returning a soft-404 (redirect to homepage for unrelated content)
    - [ ] Pages deployment environment unhealthy or unresponsive
  - [ ] **Rollback option A — Redeploy last known-good Pages artifact**:
    - [ ] Exact steps to identify the last known-good run
    - [ ] Exact steps to re-run the deploy job from the known-good run (not the build job)
    - [ ] Expected recovery time
    - [ ] Verification steps after redeployment
  - [ ] **Rollback option B — Revert DNS records to previous host**:
    - [ ] Exact DNS changes to execute (from `migration/phase-7-dns-snapshot.md`)
    - [ ] Expected propagation time with the TTL-reduced records
    - [ ] Verification steps after DNS revert
    - [ ] Conditions under which Option B is preferred over Option A
  - [ ] **Rollback option C — Hold crawl-sensitive endpoints**:
    - [ ] Steps to temporarily restrict crawling of affected endpoints via `robots.txt`
    - [ ] Appropriate only for isolated defects — not for systematic failures
    - [ ] Must be treated as a temporary hold, not a permanent fix
  - [ ] **Named owners** for rollback authorization:
    - [ ] Who can authorize Option A
    - [ ] Who can authorize Option B (DNS change)
    - [ ] Who can authorize Option C
  - [ ] **Mean time to rollback (MTTR) objective** is explicit by option: Option A action start < 30 minutes; Option B action start < 30 minutes with propagation tracked separately
  - [ ] **Stakeholder notification template** ready to send within 15 minutes of rollback decision
  - [ ] **Rollback deactivation criteria**: what must be true before rollback is reversed and re-launch is attempted
- [ ] Previous WordPress production stack remains rollback-ready:
  - [ ] WordPress site is confirmed still operational at the current host during the stabilization window
  - [ ] WordPress site owner/hosting team is notified not to decommission until end of Week 6 post-launch (or explicitly risk-accepted by migration, SEO, and engineering owners to shorten, never below end of Week 2)
  - [ ] WordPress host configuration is documented (where it lives, how to re-point DNS to it) in `migration/phase-7-rollback-runbook.md`
- [ ] Rollback dry run is completed and documented:
  - [ ] Option A tested: re-ran a previous deploy job from GitHub Actions and confirmed Pages URL served correct content
  - [ ] Option B tested in a non-production context (e.g., verified DNS record change procedure against a staging domain or via a dry-run of the DNS commands against the actual zone without committing)
  - [ ] Dry run results and timestamps recorded in Progress Log
- [ ] Incident log template is committed:
  - [ ] `migration/phase-7-incident-log.md` created with headers: Date, Incident Commander, Trigger, Start Time, End Time, Option Chosen, Steps Taken, Resolution, Post-Mortem Required (Y/N)
- [ ] Rollback runbook reviewed and signed off by migration owner, SEO owner, and engineering owner

---

### Tasks

- [ ] Define rollback trigger criteria:
  - [ ] Review Phase 7 non-negotiable constraints for launch-blocking failure conditions
  - [ ] Define specific, quantifiable thresholds (not "things look bad")
  - [ ] Agree thresholds with migration owner, SEO owner, and engineering owner; record in Progress Log
- [ ] Document rollback Option A (redeploy last known-good artifact):
  - [ ] Find the last known-good Pages deployment run in GitHub Actions
  - [ ] Document the exact steps to navigate to the run and re-run the deploy job
  - [ ] Test this by re-running an earlier `workflow_dispatch` deploy run on the non-production Pages URL
  - [ ] Measure and record time from decision to live redeployment
- [ ] Document rollback Option B (revert DNS records):
  - [ ] Use `migration/phase-7-dns-snapshot.md` as the source of truth for previous record values
  - [ ] Write out the exact DNS changes to make (previous A records, CNAME, etc.)
  - [ ] Dry run: rehearse the DNS commands in a test environment or document them with explicit before/after values
  - [ ] Estimate propagation time with TTL-reduced records
- [ ] Document rollback Option C (restrict crawl):
  - [ ] Write the exact `robots.txt` change to block a specific endpoint
  - [ ] Confirm this is a hotfix action only — commits back to `main` and triggers a deploy
- [ ] Confirm WordPress stack rollback-readiness:
  - [ ] Verify WordPress site is operational at existing host
  - [ ] Identify the current DNS A record values for the WordPress host
  - [ ] Contact WordPress hosting team to confirm no decommissioning in the stabilization window
  - [ ] Document WordPress host configuration in rollback runbook
- [ ] Define rollback authorization matrix (who can authorize which option)
- [ ] Define MTTR objective and escalation path if MTTR is not met
- [ ] Write stakeholder notification template (max 5 lines; include: what happened, impact, action taken, expected resolution time, contact)
- [ ] Create `migration/phase-7-incident-log.md` template
- [ ] Perform rollback dry runs:
  - [ ] Option A dry run: re-run a prior deploy job
  - [ ] Option B dry run: rehearse DNS commands (non-destructive)
  - [ ] Record timing and results in Progress Log
- [ ] Circulate rollback runbook for sign-off; record approvals in Progress Log
- [ ] Commit `migration/phase-7-rollback-runbook.md` and `migration/phase-7-incident-log.md`

---

### Out of Scope

- Executing a rollback (this workstream prepares the procedure; execution happens on launch day if triggered)
- Post-rollback root cause analysis and re-launch planning (Phase 9 scope)
- Writing new CI gates or quality checks (WS-F: RHI-079)
- Deciding whether to launch — that decision belongs to the launch runbook go/no-go criteria (WS-G: RHI-080)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-073 Done — Phase 7 Bootstrap complete | Ticket | Pending |
| RHI-074 Done — WS-A deployment workflow operational; previous deploy jobs available to test Option A | Ticket | Pending |
| RHI-076 Done — WS-C DNS cutover plan complete; DNS snapshot committed for Option B | Ticket | Pending |
| RHI-080 Done — WS-G launch window runbook committed; rollback triggers referenced in runbook | Ticket | Pending |
| WordPress production stack confirmed still operational at current host | Access | Pending |
| WordPress hosting team notified of stabilization window | Access | Pending |
| Migration owner, SEO owner, and engineering owner available for rollback runbook sign-off | Access | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| WordPress stack is decommissioned before the stabilization window ends, removing Option B DNS rollback target | Medium | High | Confirm WordPress hosting term with the hosting provider before finalizing the launch window; extend hosting if needed through Week 6 post-launch | Migration Owner |
| Rollback Option A (redeploy) is blocked because the deploy job needs the build job to re-run too | Low | High | Confirm in the dry run that the deploy job can be re-run independently from the build job; if not, create a workflow input to bypass the build job on rollback | Engineering Owner |
| MTTR objective of 30 minutes is not achievable for DNS rollback due to propagation lag | Medium | Medium | Option B (DNS rollback) has an inherent propagation delay that cannot be compressed below 2× the TTL. Document this honestly: MTTR for Option B is propagation-bound, not action-bound. Prefer Option A for fast recovery; reserve Option B for platform-blocking failures | Engineering Owner |
| Launch day rollback authorization is unclear, causing delay while decision-makers confer | Low | High | Pre-assign authorization levels at bootstrap; incident commander can authorize Option A unilaterally; Option B requires migration owner + SEO owner agreement; document this clearly in the runbook | Migration Owner |

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

- `migration/phase-7-rollback-runbook.md` — complete, reviewed, and dry-run-validated rollback procedure
- `migration/phase-7-incident-log.md` — incident log template
- Progress Log entries for Option A and Option B dry run timing and results
- WordPress hosting stack confirmation documented

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Rollback trigger criteria must be specific and pre-agreed — not improvised under stress on launch day. The criteria listed in the acceptance criteria are minimums; the team may add additional triggers, but they must not be vaguer than the ones listed.
- Option A (redeploy last known-good artifact) should be the first response to most rollback triggers. It is fast (under 5 minutes for a Pages deploy) and does not require DNS changes. Reserve Option B (DNS revert) for scenarios where the GitHub Pages platform itself is unavailable or the custom domain configuration is corrupt.
- The MTTR commitment (< 30 minutes) applies to initiating the rollback action, not to DNS propagation completing. For Option B, the team can begin the DNS revert immediately (MTTR < 30 min) but propagation takes additional time proportional to the TTL.
- WordPress must remain live for the full stabilization window. Do not let the WordPress hosting lapse or domain redirect to a maintenance page while the Pages site is in active DNS rollback range.
- Reference: `analysis/plan/details/phase-7.md` §Workstream H: Incident Response and Rollback
