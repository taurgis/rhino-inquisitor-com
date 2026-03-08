## RHI-073 · Phase 7 Bootstrap: Kickoff and Deployment Environment Setup

**Status:** Open  
**Priority:** Critical  
**Estimate:** S  
**Phase:** 7  
**Assigned to:** Migration Owner  
**Target date:** 2026-05-20  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Confirm that Phase 6 sign-off is complete and all Phase 6 outputs required by Phase 7 are accessible before any deployment workstream begins. Establish the Phase 7 team, review governing constraints and non-negotiable requirements, confirm tooling and access availability, agree the workstream sequence and owners, and set the architecture freeze and DNS cutover window deadlines.

Phase 7 is the highest blast-radius phase of the migration because deployment, DNS, HTTPS, canonical host behavior, and redirect behavior all converge simultaneously. Starting any deployment workstream before Phase 6 contracts are confirmed — particularly the URL parity gate results, redirect architecture decision, and cutover runbook — risks live canonical conflicts, missing redirects, or HTTPS failure that are difficult to reverse under traffic pressure. This bootstrap enforces the correct order of operations.

No Phase 7 workstream ticket (RHI-074 through RHI-081) should begin until this ticket is `Done`.

---

### Acceptance Criteria

- [ ] Phase 6 sign-off (RHI-072) is `Done` and `migration/phase-6-signoff.md` is committed
- [ ] Phase 6 URL preservation outputs are accessible and verified:
  - [ ] `migration/url-manifest.json` is frozen (git tag `phase-6-redirect-map-v1` confirmed)
  - [ ] `migration/url-map.csv` is committed and finalized
  - [ ] `migration/phase-6-redirect-architecture-decision.md` is committed and signed off
  - [ ] `migration/phase-6-cutover-runbook.md` is committed and drilled
  - [ ] `migration/phase-6-rollback-runbook.md` is committed and drilled
- [ ] Phase 6 CI gate suite is integrated and passing on `main`:
  - [ ] `npm run check:url-parity` passes
  - [ ] `npm run check:redirect-chains` passes (zero chains/loops)
  - [ ] `npm run check:canonical-alignment` passes (zero mismatches)
  - [ ] `npm run check:redirect-security` passes
- [ ] Phase 3 CI/CD scaffolding outputs are accessible:
  - [ ] `.github/workflows/deploy-pages.yml` from RHI-029 is committed and operational at scaffold level
  - [ ] Hugo version is pinned in `HUGO_VERSION` env var
  - [ ] All Phase 3 quality gate scripts are available and passing
- [ ] Migration owner, SEO owner, and engineering owner are confirmed and available for Phase 7
- [ ] All Phase 7 workstream owners have read `analysis/plan/details/phase-7.md` and confirmed understanding
- [ ] Phase 7 non-negotiable constraints reviewed with the full team:
  - [ ] Pages publishing source is GitHub Actions (not branch-based Jekyll publishing)
  - [ ] Deploy job permissions include `pages: write` and `id-token: write`
  - [ ] Build artifact contains top-level `index.html` and is Pages-compatible (no symlinks)
  - [ ] Canonical production host is locked before cutover
  - [ ] Custom domain configured in Pages settings before DNS records are pointed at GitHub Pages
  - [ ] HTTPS is available and enforceable before declaring launch complete
  - [ ] URL parity and redirect gates from Phase 6 pass on release candidate
  - [ ] Rollback procedure is validated and owners assigned before DNS cutover
  - [ ] Deploy job depends on successful build and artifact upload (`needs` dependency)
  - [ ] `github-pages` environment protections are configured for approved refs and actors only
- [ ] Phase 7 tooling dependencies confirmed available:
  - [ ] `lychee` or equivalent for static link checking in generated site
  - [ ] `@lhci/cli` for targeted Lighthouse checks
  - [ ] `html-validate` for markup sanity on generated HTML samples
  - [ ] `dig` and `nslookup` available in CI runner environment for DNS verification steps
  - [ ] `curl` available in CI runner for response header validation
- [ ] DNS access confirmed:
  - [ ] DNS provider login credentials available to DNS operator
  - [ ] DNS zone snapshot (current state) captured and committed to `migration/phase-7-dns-snapshot.md`
  - [ ] Current DNS TTL on relevant records documented
- [ ] GitHub repository settings access confirmed:
  - [ ] Pages settings access verified (can configure custom domain and HTTPS)
  - [ ] GitHub Pages environment protection rules can be configured
- [ ] Phase 7 workstream owner for each of WS-A through WS-H is named and recorded in the Progress Log
- [ ] Phase 7 target completion dates for each workstream are agreed and recorded
- [ ] DNS cutover window is agreed and communicated (low-traffic period; prefer weekday morning)
- [ ] Launch day incident commander is named and confirmed available during the cutover window

---

### Tasks

- [ ] Verify RHI-072 is `Done`; if not, document the blocker and pause Phase 7
- [ ] Confirm migration owner, SEO owner, and engineering owner identities for Phase 7
- [ ] Share `analysis/plan/details/phase-7.md` with all workstream owners; request read confirmation
- [ ] Verify Phase 6 URL preservation outputs are accessible:
  - [ ] Confirm `migration/phase-6-signoff.md` is committed and readable
  - [ ] Confirm git tag `phase-6-redirect-map-v1` exists and SHA is recorded
  - [ ] Confirm `migration/url-map.csv` is frozen with the tagged state
  - [ ] Confirm `migration/phase-6-redirect-architecture-decision.md` is committed
  - [ ] Confirm `migration/phase-6-cutover-runbook.md` is committed and rollback drill is recorded
  - [ ] Confirm `migration/phase-6-rollback-runbook.md` is committed
- [ ] Run all Phase 6 CI gates against the latest `main` build; confirm all pass
- [ ] Verify Phase 3 CI/CD scaffolding is operational:
  - [ ] Open `.github/workflows/deploy-pages.yml` and confirm Pages deployment triple is present
  - [ ] Confirm Hugo version is pinned in `HUGO_VERSION`
  - [ ] Run `hugo --minify --environment production` locally; confirm zero errors
- [ ] Capture DNS zone snapshot:
  - [ ] Run `dig www.rhino-inquisitor.com +short` and record result
  - [ ] Run `dig rhino-inquisitor.com A +short` and record result
  - [ ] Run `dig rhino-inquisitor.com AAAA +short` and record result
  - [ ] Commit snapshot to `migration/phase-7-dns-snapshot.md`
- [ ] Verify Phase 7 tooling dependencies are available or installable
- [ ] Review Phase 7 Non-Negotiable Constraints with the full team; log confirmations in Progress Log
- [ ] Name and record DNS cutover window (date and time range, low-traffic window)
- [ ] Name incident commander, deployment operator, and DNS operator for launch day
- [ ] Assign workstream owners for WS-A through WS-H
- [ ] Agree on target dates for each workstream ticket (RHI-074 through RHI-081)
- [ ] Establish Phase 7 execution sequence:
  - [ ] WS-A (workflow architecture) and WS-B (artifact integrity) can run in parallel from Day 1
  - [ ] WS-C (DNS strategy) and WS-E (SEO-safe deployment) both require WS-A done
  - [ ] WS-D (HTTPS) requires WS-C done (domain must be configured before cert monitoring)
  - [ ] WS-F (quality gates) requires WS-A, WS-B, and WS-E done — it is the integration gate
  - [ ] WS-G (launch runbook) requires WS-C, WS-D, and WS-F done
  - [ ] WS-H (incident response/rollback) requires WS-G done
- [ ] Log all confirmations in Progress Log with names and dates
- [ ] Announce Phase 7 kickoff with linked Phase 6 sign-off and Phase 7 plan

---

### Out of Scope

- Implementing the deployment workflow, DNS records, or HTTPS enforcement (covered by RHI-074 through RHI-081)
- Making changes to URL manifest or redirect architecture (Phase 6 scope; manifest is frozen)
- Full launch validation and smoke tests (Phase 8 scope)
- Post-launch monitoring execution (Phase 9 scope)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-072 Done — Phase 6 sign-off recorded | Ticket | Pending |
| `migration/phase-6-signoff.md` committed | Phase | Pending |
| `migration/url-manifest.json` frozen (git tag `phase-6-redirect-map-v1`) | Phase | Pending |
| `migration/phase-6-cutover-runbook.md` drilled and committed | Phase | Pending |
| Phase 6 CI gates passing on `main` | Phase | Pending |
| `.github/workflows/deploy-pages.yml` scaffold from RHI-029 | Ticket | Pending |
| GitHub Pages settings access (custom domain, environment protection) | Access | Pending |
| DNS provider access for cutover operator | Access | Pending |
| Migration owner, SEO owner, and engineering owner available | Access | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Phase 6 sign-off delayed, blocking Phase 7 start | Medium | High | Pre-position Phase 7 materials; confirm DNS access, Pages settings access, and tooling while waiting for Phase 6 sign-off | Migration Owner |
| Phase 6 CI gates failing at Phase 7 bootstrap check | Medium | High | If any Phase 6 gate fails, escalate to Phase 6 owners immediately and resolve before proceeding; Phase 7 cannot own Phase 6 defects | SEO Owner |
| DNS provider access not confirmed until late, delaying WS-C preparation | Medium | High | Confirm DNS operator identity and credentials at bootstrap Day 1; DNS prep tasks (TTL reduction, zone snapshot) must complete at least 24 hours before cutover | Engineering Owner |
| GitHub Pages environment protection configuration unavailable | Low | Medium | Confirm Pages settings access at bootstrap; if environment protections cannot be set, escalate to repository admin | Engineering Owner |
| Launch day incident commander is not confirmed | Medium | High | Name incident commander at bootstrap; this is a launch blocker — no cutover can proceed without a named and available incident commander | Migration Owner |

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

- Progress Log entries confirming Phase 7 team alignment and Phase 6 contract receipt
- `migration/phase-7-dns-snapshot.md` — current DNS zone state committed
- Phase 7 workstream owner assignments recorded
- DNS cutover window agreed and documented
- Incident commander, deployment operator, and DNS operator named

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Phase 7 operates at the intersection of deployment pipeline, DNS infrastructure, and live SEO equity. Mistakes in this phase are the hardest to reverse — DNS propagation is not instant, HTTPS certificate reissuance is not instant, and search engine deindexing from a bad canonical is not instant. The bootstrap is not optional ceremony; it is the gate that prevents preventable failures.
- The DNS cutover window should be chosen during a low-traffic period (typically weekday early morning in the site's primary timezone). Verify this against the current site's analytics before scheduling.
- The phase-6-redirect-map-v1 git tag is the immutable reference for the launch redirect state. If it is not present, Phase 7 cannot start — the launch state is not defined.
- Reference: `analysis/plan/details/phase-7.md` §Phase Position and Dependencies, §Non-Negotiable Constraints, §Critical Corrections Encoded in This Phase
