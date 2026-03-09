## RHI-080 · Workstream G — Production Cutover Execution Runbook

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 7  
**Assigned to:** Migration Owner  
**Target date:** 2026-05-29  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Produce a complete, step-by-step production cutover execution runbook that can be followed by the migration team on cutover day without improvisation. The runbook must begin from the assumption that preview-host rehearsal and Phase 8 validation have already passed on `https://taurgis.github.io/rhino-inquisitor-com/`, then define every production action from T-7 days to T+24 hours.

The runbook must be reviewed and validated against a dry-run deploy before the launch window is scheduled. A runbook that has not been tested is not a runbook — it is a wish list.

---

### Acceptance Criteria

- [ ] `migration/phase-7-launch-runbook.md` is committed and contains all of the following sections:
  - [ ] **Preview rehearsal prerequisites**: required preview-host validation evidence and Phase 8 sign-off inputs before T-7 planning begins
  - [ ] **T-7 to T-2 days**: pre-launch preparation checklist
  - [ ] **T-24 hours**: final preparation actions (exact commands and steps)
  - [ ] **T-0 cutover**: ordered step-by-step cutover sequence with owner per step
  - [ ] **T+1 to T+24 hours**: post-cutover monitoring and verification
  - [ ] **Go/no-go criteria**: explicit pass/fail conditions at each phase transition
  - [ ] **Owner table**: incident commander, deployment operator, DNS operator, and SEO monitor identified with names and contact methods
  - [ ] **Smoke test checklist**: exact URLs to verify with expected HTTP status codes and canonical values
  - [ ] **Escalation path**: who to contact if a gate fails or a rollback trigger is met
- [ ] T-0 cutover sequence is fully specified with exact steps and owners:
  - [ ] Confirm preview-host rehearsal evidence and Phase 8 go/no-go approval are complete
  - [ ] Deploy the production release candidate artifact to Pages (`workflow_dispatch` or push to release branch)
  - [ ] Verify all quality gates pass in CI
  - [ ] Apply DNS changes (exact records from `migration/phase-7-dns-cutover-plan.md`)
  - [ ] Monitor DNS propagation using Cloudflare (`@1.1.1.1`) and Google (`@8.8.8.8`) resolvers
  - [ ] Verify Pages serves the correct artifact at `www.rhino-inquisitor.com`
  - [ ] Monitor HTTPS certificate issuance status in Pages settings
  - [ ] Enable Enforce HTTPS once certificate is issued
  - [ ] Run smoke tests against the live domain
  - [ ] Confirm canonical, sitemap, and robots.txt on live domain
  - [ ] Record launch completion in Progress Log with timestamp
- [ ] Smoke test checklist specifies the following with expected HTTP status and canonical URL:
  - [ ] `https://www.rhino-inquisitor.com/` — homepage (HTTP 200, canonical `https://www.rhino-inquisitor.com/`)
  - [ ] Three recent post URLs (defined as the three most-recent published posts by front matter date) — (HTTP 200, expected canonical)
  - [ ] `/archive/` or equivalent archive page — (HTTP 200 or redirect to existing equivalent)
  - [ ] Three category page URLs (defined as the first three alphabetical category slugs with live pages) — (HTTP 200, expected canonical)
  - [ ] `/privacy-policy/` or equivalent — (HTTP 200)
  - [ ] At least one top legacy inbound URL from Phase 6 redirect map (highest-priority legacy URL marked `high` or `critical`) — correct redirect behavior
  - [ ] Canonical sitemap endpoint (`/sitemap.xml` or `/sitemap_index.xml`, per configuration) — (HTTP 200, XML content)
  - [ ] `https://www.rhino-inquisitor.com/robots.txt` — (HTTP 200, correct Sitemap directive)
  - [ ] HTTP-to-HTTPS redirect: `http://www.rhino-inquisitor.com/` → `https://www.rhino-inquisitor.com/` (HTTP 301)
- [ ] Dry-run validation is complete:
  - [ ] Dry-run deploy was performed using `workflow_dispatch` to the `github-pages` environment
  - [ ] All quality gates passed in the dry-run CI run
  - [ ] Preview Pages URL was accessible during dry run
  - [ ] Dry-run run URL is recorded in Progress Log
- [ ] Go/no-go criteria are documented at each phase:
  - [ ] Pre-cutover go/no-go: all Phase 7 workstream tickets Done; all 9 blocking CI gates passing (exit code 0); DNS operator confirmed; HTTPS monitoring plan confirmed
  - [ ] DNS cutover go/no-go: release candidate deployed successfully; artifact verified
  - [ ] Launch complete criteria: DNS propagated on both resolvers; HTTPS enforced (301 from HTTP); zero critical smoke-test failures

---

### Tasks

- [ ] Draft T-7 to T-2 days checklist:
  - [ ] Confirm preview-host rehearsal has passed and Phase 8 sign-off artifacts are available
  - [ ] Freeze workflow design and permissions (no workflow changes after T-7)
  - [ ] Confirm all Phase 7 workstream tickets (RHI-074 through RHI-079, RHI-081) are Done
  - [ ] Confirm all Phase 6 CI gates still pass on latest `main`
  - [ ] Confirm Search Console ownership access and analytics dashboards are accessible
  - [ ] Validate all go/no-go criteria for cutover day
  - [ ] Confirm incident commander, deployment operator, DNS operator are available during the window
  - [ ] Send launch notification to stakeholders
- [ ] Draft T-24 hours checklist:
  - [ ] Lower DNS TTL (per WS-C plan, RHI-076)
  - [ ] Confirm custom domain is configured in Pages settings and no blocking validation errors are present
  - [ ] Confirm domain verification TXT is in place
  - [ ] Re-run release candidate CI with final content snapshot; confirm all gates pass
  - [ ] Record CI run URL in the runbook
  - [ ] Confirm Pages dry-run deployment URL is accessible
  - [ ] Confirm rollback procedure is understood by all operators
- [ ] Draft T-0 cutover sequence (ordered, with assigned owner per step)
- [ ] Draft smoke test checklist with exact URLs and expected results, including the deterministic URL-selection method used
- [ ] Draft T+1 to T+24 monitoring section:
  - [ ] Check 404 rate in analytics or server logs
  - [ ] Confirm HTTPS enforcement is active
  - [ ] Re-run parity checks against live domain
  - [ ] Monitor Search Console Coverage report for 404 spikes or crawl errors
  - [ ] Confirm top legacy inbound routes resolve correctly
  - [ ] Escalation trigger: if 404 rate exceeds 5% of requests in first 2 hours, trigger incident response
- [ ] Define go/no-go criteria at each phase transition
- [ ] Build owner table (incident commander, deployment operator, DNS operator, SEO monitor)
- [ ] Perform dry-run deploy via `workflow_dispatch`:
  - [ ] Confirm all gates pass
  - [ ] Confirm Pages deployment URL is accessible
  - [ ] Walk through smoke test steps against the dry-run Pages URL
  - [ ] Record run URL in Progress Log
- [ ] Review runbook with SEO owner and engineering owner
- [ ] Commit `migration/phase-7-launch-runbook.md`

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
| RHI-073 Done — Phase 7 Bootstrap complete | Ticket | Pending |
| RHI-074 Done — WS-A deployment workflow operational | Ticket | Pending |
| RHI-076 Done — WS-C DNS cutover plan committed (`migration/phase-7-dns-cutover-plan.md`) | Ticket | Pending |
| RHI-077 Done — WS-D HTTPS checklist committed (`migration/phase-7-https-checklist.md`) | Ticket | Pending |
| RHI-079 Done — WS-F all quality gates integrated and passing | Ticket | Pending |
| Migration owner, SEO owner, and engineering owner available for runbook review | Access | Pending |
| Launch window date agreed and communicated (from bootstrap) | Access | Pending |

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- `migration/phase-7-launch-runbook.md` — complete, reviewed, and dry-run-validated launch window runbook
- Progress Log entry with dry-run `workflow_dispatch` run URL and Pages deployment URL
- Stakeholder launch notification sent with runbook link

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- The dry-run deploy is non-optional. A runbook that has not been tested under real CI conditions (not just local builds) is not a trusted runbook. The dry run must use `workflow_dispatch` against the actual `github-pages` Pages environment — not a preview branch or local serve.
- This runbook governs the production cutover window, not the initial preview deployment. Preview rehearsal on the GitHub Pages project URL is a prerequisite input to this ticket, not an output.
- The launch window must be during a low-traffic period. Consult the current WordPress analytics to identify the lowest-traffic time slot. A weekday early morning (5–9 AM local time, site's primary audience timezone) is typically the safest window.
- DNS propagation cannot be accelerated. The T-24 TTL reduction is the only lever. After the TTL has expired (post-reduction), new resolver caches will pick up the new records within the new TTL. Plan for up to 2× the reduced TTL as the propagation buffer.
- The smoke test checklist should be run using both `curl -I` (for header inspection) and a real browser check for the homepage and a post to catch client-side issues that `curl` may miss.
- Reference: `analysis/plan/details/phase-7.md` §Workstream G: Launch Window Execution Runbook
