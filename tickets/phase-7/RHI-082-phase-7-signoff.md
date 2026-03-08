## RHI-082 · Phase 7 Sign-off and Handover to Phase 8/9

**Status:** Open  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 7  
**Assigned to:** Migration Owner  
**Target date:** 2026-06-02  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Formally close Phase 7 by verifying that all workstream deliverables are complete, all deployment quality gates are passing on the live production domain, the DNS cutover is confirmed complete, HTTPS is enforced, and the Phase 8 (Validation and Launch Readiness) and Phase 9 (Cutover and Post-Launch Monitoring) teams have received and acknowledged the Phase 7 handover package.

This sign-off is the authoritative record of the deployment state at the point of launch. Phase 8 launch readiness assessments and Phase 9 monitoring baselines cannot be finalized until this sign-off is recorded. Any unresolved Phase 7 blocking defect must be fixed or explicitly accepted with a documented owner before sign-off proceeds.

---

### Acceptance Criteria

- [ ] All Phase 7 workstream tickets are `Done`:
  - [ ] RHI-073 Done — Phase 7 Bootstrap complete
  - [ ] RHI-074 Done — Deployment workflow architecture complete and tested
  - [ ] RHI-075 Done — Artifact integrity and build limits gate operational
  - [ ] RHI-076 Done — DNS cutover plan complete and prepared
  - [ ] RHI-077 Done — HTTPS issuance controls confirmed and mixed-content gate operational
  - [ ] RHI-078 Done — SEO-safe deployment checks passing
  - [ ] RHI-079 Done — All quality gates integrated and passing
  - [ ] RHI-080 Done — Launch runbook committed and dry-run validated
  - [ ] RHI-081 Done — Rollback runbook committed and dry-run validated
- [ ] DNS cutover is complete and confirmed:
  - [ ] `dig www.rhino-inquisitor.com CNAME +short` returns `<owner>.github.io` (current expected value: `taurgis.github.io`)
  - [ ] `dig rhino-inquisitor.com A +short` returns GitHub Pages IP addresses
  - [ ] Cloudflare (`@1.1.1.1`) and Google (`@8.8.8.8`) resolvers return correct records
  - [ ] Pages settings show custom domain check as healthy
- [ ] Production site is live on the canonical domain:
  - [ ] `https://www.rhino-inquisitor.com/` returns HTTP 200 with the migrated Hugo site
  - [ ] HTTPS is enforced: `http://www.rhino-inquisitor.com/` redirects to `https://www.rhino-inquisitor.com/`
  - [ ] Correct TLS certificate is served (Let's Encrypt; not expired; valid for `www.rhino-inquisitor.com`)
- [ ] All smoke tests from the WS-G launch runbook are verified as passed:
  - [ ] Homepage (HTTP 200, correct canonical)
  - [ ] Three recent post URLs (the three most-recent published posts by front matter date) (HTTP 200)
  - [ ] Three category page URLs (first three alphabetical category slugs with live pages) (HTTP 200)
  - [ ] Archive page (HTTP 200 or correct redirect)
  - [ ] Privacy policy (HTTP 200)
  - [ ] At least one top legacy redirect (correct redirect outcome)
  - [ ] `sitemap.xml` (HTTP 200, correct canonical host in `<loc>` elements)
  - [ ] `robots.txt` (HTTP 200, correct `Sitemap:` directive)
- [ ] All Phase 7 CI gates pass on the live release commit:
  - [ ] `npm run validate:frontmatter` exits with code 0
  - [ ] `npm run check:url-parity` exits with code 0
  - [ ] `npm run check:redirect-chains` exits with code 0
  - [ ] `npm run check:canonical-alignment` exits with code 0
  - [ ] `npm run check:mixed-content` exits with code 0
  - [ ] `npm run check:seo-safe-deploy` exits with code 0
  - [ ] `npm run check:links` exits with code 0
  - [ ] `npm run validate:artifact` exits with code 0
  - [ ] Hugo production build exits with code 0
- [ ] `migration/phase-7-signoff.md` is committed with:
  - [ ] Summary of all Phase 7 workstream outcomes (RHI-074 through RHI-081) with ticket IDs and deliverable file paths
  - [ ] DNS cutover confirmation (DNS check results with timestamps)
  - [ ] HTTPS enforcement confirmation with timestamp
  - [ ] CI gate compliance statement with evidence (Actions run URL)
  - [ ] Smoke test results table
  - [ ] Exception register: all accepted deviations from plan with owner, reason, and resolution phase
  - [ ] Phase 7 Definition of Done compliance checklist
  - [ ] Phase 8/9 entry conditions — what downstream phases can rely on from Phase 7
  - [ ] Outstanding risks accepted for Phase 8/9 with owners
  - [ ] Stakeholder sign-off block (migration owner, SEO owner, engineering owner) with dates
- [ ] Phase 8 and Phase 9 teams have confirmed receipt of the Phase 7 handover package

---

### Tasks

- [ ] Confirm all Phase 7 workstream tickets (RHI-073 through RHI-081) are `Done`
- [ ] Execute DNS cutover per `migration/phase-7-launch-runbook.md` T-0 sequence:
  - [ ] Deploy release candidate artifact via `workflow_dispatch` or release branch push
  - [ ] Confirm all CI gates pass; record Actions run URL
  - [ ] Apply DNS changes per `migration/phase-7-dns-cutover-plan.md`
  - [ ] Monitor propagation with two independent resolvers
  - [ ] Enable Enforce HTTPS when certificate is issued
  - [ ] Run smoke tests against live domain
  - [ ] Record cutover completion timestamp in Progress Log
- [ ] Run all Phase 7 CI gates against the live release commit:
  - [ ] Full gate list as above — every gate must pass
  - [ ] Record Actions run URL
- [ ] Compile `migration/reports/phase-7-gate-summary.csv`:
  - [ ] One row per gate: gate name, script command, pass/fail, blocking threshold, run date, Actions run URL
- [ ] Review exception register from all workstreams:
  - [ ] Confirm all accepted deviations have owners and resolution phases
  - [ ] Confirm no deferred item represents an unacceptable risk for Phase 8
- [ ] Draft `migration/phase-7-signoff.md`:
  - [ ] Workstream outcomes table
  - [ ] DNS confirmation (dig outputs, timestamps)
  - [ ] HTTPS enforcement confirmation
  - [ ] CI gate evidence (Actions run URL, pass/fail per gate)
  - [ ] Smoke test results table
  - [ ] Exception register
  - [ ] Phase 8/9 entry conditions
  - [ ] Outstanding risks with owners
  - [ ] Stakeholder sign-off block
- [ ] Circulate sign-off document for approval (migration owner, SEO owner, engineering owner)
- [ ] Record final approval in Progress Log with approver names and dates
- [ ] Notify Phase 8 team (Validation and Launch Readiness) with:
  - [ ] Link to `migration/phase-7-signoff.md`
  - [ ] CI gate reference and current pass/fail state
  - [ ] Live domain URL and smoke test results
- [ ] Notify Phase 9 team (Cutover and Post-Launch Monitoring) with:
  - [ ] Live domain URL
  - [ ] DNS configuration reference
  - [ ] Rollback runbook location and rollback window timeline

---

### Out of Scope

- Full launch validation and synthetic monitoring setup (Phase 8 scope)
- Post-launch Search Console submission and monitoring (Phase 9 scope)
- Making any configuration changes to the live site after sign-off (these require a new ticket in Phase 8 or 9)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-073 through RHI-081 all Done | Ticket | Pending |
| Migration owner, SEO owner, and engineering owner available for sign-off | Access | Pending |
| Phase 8 and Phase 9 teams available to receive handover | Access | Pending |
| DNS cutover completed and propagated | Phase | Pending |
| HTTPS enforcement active on live domain | Phase | Pending |
| All Phase 7 CI gates passing on live release commit | Phase | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| One or more workstream tickets not `Done` by target date | Medium | High | Track workstream progress daily in the last week of Phase 7; surface blockers 3 days before scheduled sign-off | Migration Owner |
| DNS cutover reveals a failure not caught in dry run | Low | High | Use the Phase 7 rollback runbook (RHI-081) immediately if a rollback trigger condition is met; do not attempt to fix live DNS issues ad hoc | Migration Owner |
| Enforce HTTPS unavailable after 60-minute decision SLO with impact requiring hold/rollback decision | Low | High | Follow WS-D (RHI-077) HTTPS checklist, open WS-H incident response at 60 minutes, and decide hold vs rollback by severity while tracking GitHub certificate provisioning status | Engineering Owner |
| Sign-off gate run reveals a systematic failure on the live domain not caught in CI | Low | High | Run all CI gates against the live domain with a content-production build, not just the dry-run build; schedule gates run 24 hours after DNS propagation to allow CDN caches to settle | Engineering Owner |
| Phase 8 or Phase 9 teams unavailable to acknowledge handover | Low | Medium | Notify Phase 8/9 teams at T-3 days before sign-off; confirm handover receipt before closing RHI-082 | Migration Owner |

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

- `migration/phase-7-signoff.md`
- `migration/reports/phase-7-gate-summary.csv`
- All Phase 7 workstream tickets (RHI-074 through RHI-081) confirmed `Done`
- DNS cutover confirmation (dig output, timestamps)
- HTTPS enforcement confirmation (timestamp, curl check)
- Live smoke test results

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- The Phase 7 sign-off document is the single handover artifact for Phase 8 and Phase 9. Phase 8 engineers must be able to read it and know: which CI gates are integrated, what the current pass/fail state is, what the live domain URL is, and whether any gates were accepted with exceptions. Phase 9 engineers must know the DNS configuration, the rollback window timeline, and where to find the rollback runbook.
- Any exception accepted at sign-off must have a named owner and a target resolution phase. Undocumented exceptions become invisible risks in Phase 8 and Phase 9.
- The `migration/reports/phase-7-gate-summary.csv` provides Phase 8 with a machine-readable evidence trail for the Phase 8 launch readiness check.
- Reference: `analysis/plan/details/phase-7.md` §Definition of Done; `analysis/plan/details/phase-8.md` §Phase Position and Dependencies
