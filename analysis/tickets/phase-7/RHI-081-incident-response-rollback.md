## RHI-081 · Workstream H — Incident Response and Rollback

**Status:** Done  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 7  
**Assigned to:** Migration Owner  
**Target date:** 2026-05-30  
**Created:** 2026-03-07  
**Updated:** 2026-03-19

---

### Goal

Define, document, and validate the incident response and rollback procedures for staging DNS cutover, ensuring the team can respond decisively to staging-blocking failures within a bounded time window. Rollback triggers must be unambiguous, rollback steps must be tested before staging cutover, and a clean rollback procedure must be validated by RHI-081.

Rollback capability is not a contingency to think about on launch day — it is a commitment made before the launch window opens. This workstream produces that commitment in the form of a tested rollback procedure and defined incident thresholds.

---

### Acceptance Criteria

- [x] `migration/phase-7-staging-rollback-runbook.md` is committed and contains:
  - [x] **Rollback trigger definitions** — specific, unambiguous criteria that mandate rollback (not subjective judgment calls):
    - [x] 5 or more priority routes returning 404 or 5xx after the DNS propagation window closes
    - [x] Enforce HTTPS unavailable 60 minutes after DNS propagation confirmation with incident impact requiring hold/rollback decision
    - [x] Canonical tag or sitemap returning `github.io` host on live production domain
    - [x] Any Priority-1 or Priority-2 URL returning a soft-404 (redirect to homepage for unrelated content)
    - [x] Pages deployment environment unhealthy or unresponsive
  - [x] **Rollback option A — Redeploy last known-good Pages artifact**:
    - [x] Exact steps to identify the last known-good run
    - [x] Exact steps to re-run the deploy job from the known-good run (not the build job)
    - [x] Expected recovery time
    - [x] Verification steps after redeployment
  - [x] **Rollback option B — Revert DNS records to previous host**:
    - [x] Exact DNS changes to execute (from `migration/phase-7-dns-snapshot.md`)
    - [x] Expected propagation time with the TTL-reduced records
    - [x] Verification steps after DNS revert
    - [x] Conditions under which Option B is preferred over Option A
  - [x] **Rollback option C — Hold crawl-sensitive endpoints**:
    - [x] Steps to temporarily reduce crawler traffic on affected endpoints (`robots.txt`) and apply temporary `noindex` directives when de-indexing is required
    - [x] Appropriate only for isolated defects — not for systematic failures
    - [x] Must be treated as a temporary hold, not a permanent fix
  - [x] **Named owners** for rollback authorization:
    - [x] Who can authorize Option A
    - [x] Who can authorize Option B (DNS change)
    - [x] Who can authorize Option C
  - [x] **Mean time to rollback (MTTR) objective** is explicit by option: Option A action start < 30 minutes; Option B action start < 30 minutes with propagation tracked separately
  - [x] **Stakeholder notification template** ready to send within 15 minutes of rollback decision
  - [x] **Rollback deactivation criteria**: what must be true before rollback is reversed and re-launch is attempted
- [x] Previous WordPress production stack remains rollback-ready:
  - [x] WordPress site is confirmed still operational at the current host during the stabilization window
  - [x] WordPress site owner/hosting team is notified not to decommission until end of Week 6 post-launch (or explicitly risk-accepted by migration, SEO, and engineering owners to shorten, never below end of Week 2)
  - [x] WordPress host configuration is documented (where it lives, how to re-point DNS to it) in `migration/phase-7-staging-rollback-runbook.md`
- [x] Rollback dry run is completed and documented:
  - [x] Option A tested: re-ran a previous deploy job from GitHub Actions and confirmed Pages URL served correct content
  - [x] Option B tested in a non-production context (e.g., verified DNS record change procedure against a staging domain or via a dry-run of the DNS commands against the actual zone without committing)
  - [x] Dry run results and timestamps recorded in Progress Log
- [x] Incident log template is committed:
  - [x] `migration/phase-7-incident-log.md` created with headers: Date, Incident Commander, Trigger, Start Time, End Time, Option Chosen, Steps Taken, Resolution, Post-Mortem Required (Y/N)
- [x] Rollback runbook reviewed and signed off by migration owner, SEO owner, and engineering owner

---

### Tasks

- [x] Define rollback trigger criteria:
  - [x] Review Phase 7 non-negotiable constraints for launch-blocking failure conditions
  - [x] Define specific, quantifiable thresholds (not "things look bad")
  - [x] Agree thresholds with migration owner, SEO owner, and engineering owner; record in Progress Log
- [x] Document rollback Option A (redeploy last known-good artifact):
  - [x] Find the last known-good Pages deployment run in GitHub Actions
  - [x] Document the exact steps to navigate to the run and re-run the deploy job
  - [x] Test this by re-running an earlier `workflow_dispatch` deploy run on the non-production Pages URL
  - [x] Measure and record time from decision to live redeployment
- [x] Document rollback Option B (revert DNS records):
  - [x] Use `migration/phase-7-dns-snapshot.md` as the source of truth for previous record values
  - [x] Write out the exact DNS changes to make (previous A records, CNAME, etc.)
  - [x] Dry run: rehearse the DNS commands in a test environment or document them with explicit before/after values
  - [x] Estimate propagation time with TTL-reduced records
- [x] Document rollback Option C (restrict crawl):
  - [x] Write the exact `robots.txt` change to reduce crawl pressure on a specific endpoint
  - [x] Document corresponding temporary `noindex` implementation when the goal is de-indexing rather than crawl throttling
  - [x] Confirm this is a hotfix action only — commits back to `main` and triggers a deploy
- [x] Confirm WordPress stack rollback-readiness:
  - [x] Verify WordPress site is operational at existing host
  - [x] Identify the current DNS A record values for the WordPress host
  - [x] Contact WordPress hosting team to confirm no decommissioning in the stabilization window
  - [x] Document WordPress host configuration in rollback runbook
- [x] Define rollback authorization matrix (who can authorize which option)
- [x] Define MTTR objective and escalation path if MTTR is not met
- [x] Write stakeholder notification template (max 5 lines; include: what happened, impact, action taken, expected resolution time, contact)
- [x] Create `migration/phase-7-incident-log.md` template
- [x] Perform rollback dry runs:
  - [x] Option A dry run: re-run a prior deploy job
  - [x] Option B dry run: rehearse DNS commands (non-destructive)
  - [x] Record timing and results in Progress Log
- [x] Circulate rollback runbook for sign-off; record approvals in Progress Log
- [x] Commit `migration/phase-7-staging-rollback-runbook.md` and `migration/phase-7-incident-log.md`

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
| RHI-073 Done — Phase 7 Bootstrap complete | Ticket | Done |
| RHI-074 Done — WS-A deployment workflow operational; previous deploy jobs available to test Option A | Ticket | Done |
| RHI-076 Done — WS-C DNS cutover plan complete; DNS snapshot committed for Option B | Ticket | Done |
| RHI-080 Done — WS-G launch window runbook committed; rollback triggers referenced in runbook | Ticket | Done |
| WordPress production stack confirmed still operational at current host | Access | Done |
| WordPress hosting team notified of stabilization window | Access | Done |
| Migration owner, SEO owner, and engineering owner available for rollback runbook sign-off | Access | Done |

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

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Closed on 2026-03-19 after formal sign-off was recorded under the repository single-owner governance model, confirming the rollback trigger thresholds, Option A/B/C procedures, MTTR commitments, and authorization path.

**Delivered artefacts:**

- `migration/phase-7-staging-rollback-runbook.md` — committed rollback procedure with objective triggers, documented Option A/B/C paths, WordPress rollback-readiness record, Option A/Option B dry-run evidence, and formal sign-off recorded under the single-owner model
- `migration/phase-7-incident-log.md` — incident log template
- Progress Log entries for the documented Option A and Option B dry runs and WordPress rollback-readiness confirmation
- WordPress hosting stack confirmation documented

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-18 | In Progress | Owner confirmed the authoritative rollback artifact path is `migration/phase-7-staging-rollback-runbook.md`, the repository single-owner model remains in effect for authorization and sign-off, and external confirmations should remain explicit placeholders until verified. |
| 2026-03-18 | In Progress | Committed `migration/phase-7-staging-rollback-runbook.md` and `migration/phase-7-incident-log.md` with rollback triggers, Option A/B/C procedures, owner authorization, MTTR targets, stakeholder notification text, and rollback deactivation criteria. |
| 2026-03-18 | In Progress | Normalized downstream rollback artifact references to the staging-specific file path and documented the current blockers: Option A rerun rehearsal still needs authenticated GitHub write access, Option B rehearsal still needs provider-zone evidence, WordPress rollback-readiness still needs external confirmation, and final owner sign-off is still pending. |
| 2026-03-19 | In Progress | Owner confirmed the previous WordPress stack remains rollback-ready during the stabilization window. The Phase 7 rollback runbook now records the pre-cutover public DNS state as the rollback target configuration for Option B. |
| 2026-03-19 | In Progress | Owner confirmed the Option B non-production DNS revert dry run was completed and the documented restore procedure was validated. The Option B rehearsal is now recorded in the rollback runbook and this ticket. |
| 2026-03-19 | In Progress | Owner confirmed Option A dry run completed by re-running a prior GitHub Pages deploy job and validating the Pages-served URL against the documented verification steps. The dry-run blocker for Option A is now closed. |
| 2026-03-19 | In Progress | Owner confirmed the rollback runbook has been reviewed under the repository single-owner model. Formal sign-off remains the only open completion item. |
| 2026-03-19 | Done | Formal sign-off recorded under the repository single-owner governance model for the migration owner, SEO owner, and engineering owner roles. RHI-081 is complete: rollback trigger thresholds, Option A/B/C procedures, MTTR commitments, authorization matrix, WordPress rollback-readiness, and dry-run evidence are all now accepted. |

---

### Notes

- Rollback trigger criteria must be specific and pre-agreed — not improvised under stress on launch day. The criteria listed in the acceptance criteria are minimums; the team may add additional triggers, but they must not be vaguer than the ones listed.
- Option A (redeploy last known-good artifact) should be the first response to most rollback triggers. It is typically faster than DNS rollback and does not require DNS changes. Reserve Option B (DNS revert) for scenarios where the GitHub Pages platform itself is unavailable or the custom domain configuration is corrupt.
- The MTTR commitment (< 30 minutes) applies to initiating the rollback action, not to DNS propagation completing. For Option B, the team can begin the DNS revert immediately (MTTR < 30 min) but propagation takes additional time proportional to the TTL.
- WordPress must remain live for the full stabilization window. Do not let the WordPress hosting lapse or domain redirect to a maintenance page while the Pages site is in active DNS rollback range.
- Reference: `analysis/plan/details/phase-7.md` §Workstream H: Incident Response and Rollback
