## RHI-080 · Workstream G — Staging Cutover Execution Runbook

**Status:** Done  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 7  
**Assigned to:** Migration Owner  
**Target date:** 2026-05-29  
**Created:** 2026-03-07  
**Updated:** 2026-03-18

---

### Goal

Produce a complete, step-by-step staging cutover execution runbook that can be followed by the migration team on staging cutover day without improvisation. The runbook begins from the assumption that preview-host rehearsal and Phase 7 workstream validation have already passed, then defines every staging action from T-7 days to T+24 hours.

This staging runbook is a precursor to the final production cutover. After staging cutover is complete and sign-off is recorded, a separate final ticket will adapt the validated choreography for production `www.rhino-inquisitor.com` and the apex domain.

The runbook must be reviewed and validated against a dry-run deploy before the staging cutover window is scheduled. A runbook that has not been tested is not a runbook — it is a wish list.

---

### Acceptance Criteria

- [x] `migration/phase-7-staging-launch-runbook.md` is committed and contains all of the following sections:
  - [x] **Phase 7 staging validation prerequisites**: required Phase 7 workstream completion and sign-off evidence before T-7 planning begins
  - [x] **T-7 to T-2 days**: pre-launch preparation checklist
  - [x] **T-24 hours**: final preparation actions (exact commands and steps)
  - [x] **T-0 cutover**: ordered step-by-step cutover sequence with owner per step
  - [x] **T+1 to T+24 hours**: post-cutover monitoring and verification
  - [x] **Go/no-go criteria**: explicit pass/fail conditions at each phase transition
  - [x] **Owner table**: incident commander, deployment operator, DNS operator, and SEO monitor identified with names and contact methods
  - [x] **Smoke test checklist**: exact URLs to verify with expected HTTP status codes and canonical values
  - [x] **Escalation path**: who to contact if a gate fails or a rollback trigger is met
- [x] T-0 cutover sequence is fully specified with exact steps and owners:
  - [x] Confirm true Phase 7 prerequisites are Done (`RHI-074` through `RHI-079`; `RHI-081` remains downstream and is not a prerequisite)
  - [x] Deploy the staging release candidate artifact to Pages (equivalent `workflow_dispatch` or release-candidate deploy run)
  - [x] Verify all quality gates pass in CI
  - [x] Apply DNS changes for staging (CNAME: `staging.rhino-inquisitor.com` → `taurgis.github.io`, TXT: `_github-pages-challenge-taurgis.staging.rhino-inquisitor.com` only if GitHub Pages explicitly demands it)
  - [x] Monitor DNS propagation using Cloudflare (`@1.1.1.1`) and Google (`@8.8.8.8`) resolvers
  - [x] Verify Pages serves the correct artifact at `staging.rhino-inquisitor.com`
  - [x] Monitor HTTPS certificate issuance status in Pages settings for staging domain
  - [x] Enable Enforce HTTPS once certificate is issued
  - [x] Run smoke tests against the staging domain
  - [x] Confirm canonical, sitemap, robots.txt, and blocked crawl state on staging domain
  - [x] Record staging launch completion in Progress Log with timestamp
- [x] Smoke test checklist specifies the following with expected HTTP status and canonical URL:
  - [x] `https://staging.rhino-inquisitor.com/` — homepage (HTTP `200`, canonical `https://staging.rhino-inquisitor.com/`, robots `noindex, nofollow`)
  - [x] `https://staging.rhino-inquisitor.com/real-time-inventory-checks-in-sfcc/`, `https://staging.rhino-inquisitor.com/a-dev-guide-to-combating-fraud-on-sfcc/`, and `https://staging.rhino-inquisitor.com/kickstart-guide-for-new-sfcc-developers/` — three most-recent published posts by front matter date on 2026-03-18 (HTTP `200`, expected canonical on the staging host, robots `noindex, nofollow`)
  - [x] `https://staging.rhino-inquisitor.com/archive/` — archive page (HTTP `200`, canonical `https://staging.rhino-inquisitor.com/archive/`, robots `noindex, nofollow`)
  - [x] `https://staging.rhino-inquisitor.com/category/ai/`, `https://staging.rhino-inquisitor.com/category/architecture/`, and `https://staging.rhino-inquisitor.com/category/certification/` — first three alphabetical category slugs with live built output on 2026-03-18 (HTTP `200`, canonical on the staging host, robots `noindex, nofollow`)
  - [x] `https://staging.rhino-inquisitor.com/privacy-policy/` — privacy policy (HTTP `200`, canonical `https://staging.rhino-inquisitor.com/privacy-policy/`, robots `noindex, nofollow`)
  - [x] `https://staging.rhino-inquisitor.com/category/salesforce-commerce-cloud/release-notes/` — top legacy inbound route sample resolved through redirect-map logic; expected effective destination `https://staging.rhino-inquisitor.com/category/release-notes/` with canonical on the destination page
  - [x] `https://staging.rhino-inquisitor.com/sitemap.xml` — canonical sitemap endpoint (HTTP `200`, XML content on the staging host)
  - [x] `https://staging.rhino-inquisitor.com/robots.txt` — (HTTP `200`, `Sitemap: https://staging.rhino-inquisitor.com/sitemap.xml`, `Disallow: /`)
  - [x] HTTP-to-HTTPS redirect: `http://staging.rhino-inquisitor.com/` → `https://staging.rhino-inquisitor.com/` (HTTP `301`)
- [x] Dry-run validation is complete:
  - [x] Equivalent release-candidate deploy run reached the `github-pages` environment successfully
  - [x] All quality gates passed in the dry-run CI run
  - [x] Preview Pages URL and staging host evidence were accessible during validation
  - [x] Dry-run run URL is recorded in Progress Log
- [x] Go/no-go criteria are documented at each phase:
  - [x] Pre-cutover go/no-go: true Phase 7 prerequisites done; all 9 blocking CI gates passing (exit code `0`); DNS operator confirmed; HTTPS monitoring plan confirmed
  - [x] DNS cutover go/no-go: release candidate deployed successfully; artifact verified; Pages custom-domain entry healthy
  - [x] Launch complete criteria: DNS converged or provider-zone confirmation recorded; HTTPS enforced (`301` from HTTP); zero critical smoke-test failures; blocked crawl-state intact

---

### Tasks

- [x] Draft T-7 to T-2 days checklist:
  - [x] Confirm preview-host rehearsal has passed and staging validation artifacts are available
  - [x] Freeze workflow design and permissions (no workflow changes after T-7)
  - [x] Confirm all true prerequisite Phase 7 workstream tickets (`RHI-074` through `RHI-079`) are Done
  - [x] Confirm all Phase 6 CI gates still pass on latest `main`
  - [x] Confirm Search Console ownership access and analytics dashboards are accessible
  - [x] Validate all go/no-go criteria for cutover day
  - [x] Confirm incident commander, deployment operator, DNS operator, and SEO monitor are available during the window
  - [x] Send launch notification to stakeholders
- [x] Draft T-24 hours checklist:
  - [x] Lower DNS TTL (per WS-C plan, RHI-076)
  - [x] Confirm custom domain is configured in Pages settings and no blocking validation errors are present
  - [x] Confirm domain verification TXT is in place or explicitly not required beyond account-level verification
  - [x] Re-run release candidate CI with final content snapshot; confirm all gates pass
  - [x] Record CI run URL in the runbook
  - [x] Confirm Pages dry-run deployment URL is accessible
  - [x] Confirm rollback procedure is understood by all operators
- [x] Draft T-0 cutover sequence (ordered, with assigned owner per step)
- [x] Draft smoke test checklist with exact URLs and expected results, including the deterministic URL-selection method used
- [x] Draft T+1 to T+24 monitoring section:
  - [x] Check 404 rate in analytics or server logs
  - [x] Confirm HTTPS enforcement is active
  - [x] Re-run parity checks against live domain
  - [x] Monitor Search Console Coverage report for 404 spikes or crawl errors
  - [x] Confirm top legacy inbound routes resolve correctly
  - [x] Escalation trigger: if 404 rate exceeds 5% of requests in first 2 hours, trigger incident response
- [x] Define go/no-go criteria at each phase transition
- [x] Build owner table (incident commander, deployment operator, DNS operator, SEO monitor)
- [x] Perform dry-run deploy for staging using equivalent release-candidate deploy evidence:
  - [x] Confirm all gates pass
  - [x] Confirm Pages deployment URL is accessible
  - [x] Note: Production cutover runbook will be created as a final ticket after staging sign-off, using this staging runbook as a validated template
  - [x] Walk through smoke test steps against the validated staging artifact and staging host evidence set
  - [x] Record run URL in Progress Log
- [x] Review runbook with SEO owner and engineering owner under the repository single-owner model
- [x] Commit `migration/phase-7-staging-launch-runbook.md`

---

### Out of Scope

- Defining rollback triggers and executing rollback (WS-H: RHI-081)
- Configuring DNS records (WS-C: RHI-076 — the runbook references the DNS cutover plan produced there)
- Post-launch monitoring runbook (Phase 9 scope — this workstream covers T+24 hours only)
- Submitting sitemap to Search Console (Phase 9 scope, though the runbook may note it as a T+24 action)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-073 Done — Phase 7 Bootstrap complete | Ticket | Done |
| RHI-074 Done — WS-A deployment workflow operational | Ticket | Done |
| RHI-076 Done — WS-C DNS cutover plan committed (`migration/phase-7-dns-cutover-plan.md`) | Ticket | Done |
| RHI-077 Done — WS-D HTTPS checklist committed (`migration/phase-7-https-staging-checklist.md`) | Ticket | Done |
| RHI-079 Done — WS-F all quality gates integrated and passing | Ticket | Done |
| Migration owner, SEO owner, and engineering owner available for runbook review | Access | Done |
| Launch window timing guidance captured in the runbook; final scheduling remains owner-operated | Access | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Dry-run deploy reveals a quality gate failure that was not caught earlier | Medium | High | Perform dry run at least 5 working days before the launch window; leave time to address gate failures before the scheduled cutover | Engineering Owner |
| Launch window is too short for propagation and monitoring to complete | Medium | High | Schedule at least 4 hours for DNS propagation monitoring, cert issuance, and HTTPS enforcement; do not schedule a launch window of less than 4 hours | Migration Owner |
| Runbook not reviewed by all operators before launch day | Medium | High | Circulate for review at least 3 working days before the launch window; require explicit acknowledgment from each operator | Migration Owner |
| Smoke test failures post-cutover reveal a redirect or content issue that was not caught in CI | Low | High | Smoke tests run against the live domain as part of T-0 sequence — if any smoke test fails, do not declare launch complete; trigger incident response | Migration Owner |
| Incident commander is unavailable on launch day | Low | High | Name a backup incident commander at bootstrap; confirm both are available before scheduling the launch window | Migration Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

Closed on 2026-03-18 after the owner confirmed staging-first scope, the ticket and phase indexes were reconciled to the staging contract, and the validated staging launch runbook was committed with dry-run evidence.

**Delivered artefacts:**

- `migration/phase-7-staging-launch-runbook.md` — complete, reviewed, and dry-run-validated staging launch window runbook
- Progress Log entry with equivalent release-candidate deploy run URL and staging/Pages evidence references
- Stakeholder launch-notification template captured in the runbook

**Deviations from plan:**

- Equivalent push-triggered deploy evidence was accepted in place of a dedicated `workflow_dispatch` dry run because it exercised the same `github-pages` environment, gate sequence, and staging artifact path on the validated release-candidate commit.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-18 | Done | Owner confirmed the staging-first contract for RHI-080 in chat; repository references were normalized to a single staging runbook artifact (`migration/phase-7-staging-launch-runbook.md`) and the circular prerequisite on RHI-081 was removed. |
| 2026-03-18 | Done | Committed `migration/phase-7-staging-launch-runbook.md` with Phase 7 prerequisites, T-7/T-24/T-0/T+24 steps, deterministic smoke test URLs, go/no-go criteria, escalation path, and production handoff notes. |
| 2026-03-18 | Done | Recorded equivalent dry-run evidence using successful Deploy to GitHub Pages run `#132` (`https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23213150405`) on commit `bbb183e`, supported by staging DNS (`RHI-076`), HTTPS (`RHI-077`), SEO safety (`RHI-078`), and gate (`RHI-079`) closeout evidence. |

---

### Notes

- The dry-run deploy is non-optional. A runbook that has not been tested under real CI conditions (not just local builds) is not a trusted runbook. Equivalent release-candidate deploy evidence is acceptable when it exercises the actual `github-pages` environment and the same staging artifact path.
- This runbook governs the staging custom-domain cutover window, not the initial preview deployment and not the final production DNS cutover. Preview rehearsal on the GitHub Pages project URL is a prerequisite input to this ticket, and final production execution is deferred to a future ticket after staging sign-off.
- The launch window must be during a low-traffic period. Consult the current WordPress analytics to identify the lowest-traffic time slot. A weekday early morning (5–9 AM local time, site's primary audience timezone) is typically the safest window.
- DNS propagation cannot be accelerated. The T-24 TTL reduction is the only lever. After the TTL has expired (post-reduction), new resolver caches will pick up the new records within the new TTL. Plan for up to 2× the reduced TTL as the propagation buffer.
- The smoke test checklist should be run using both `curl -I` (for header inspection) and a real browser check for the homepage and a post to catch client-side issues that `curl` may miss. For Pages alias-backed legacy routes, verify the effective destination and destination canonical rather than assuming an HTTP-native `301`/`308`.
- Reference: `analysis/plan/details/phase-7.md` §Workstream G: Launch Window Execution Runbook
