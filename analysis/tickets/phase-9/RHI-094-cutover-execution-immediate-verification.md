## RHI-094 · Workstream A — Cutover Execution and Immediate Verification

**Status:** Open  
**Priority:** Critical  
**Estimate:** L  
**Phase:** 9  
**Workstream:** WS-A  
**Assigned to:** Deployment Operator + DNS Operator  
**Target date:** 2026-06-17  
**Created:** 2026-03-08  
**Updated:** 2026-03-08

---

### Goal

Execute the production DNS cutover with a controlled blast radius, perform immediate post-cutover verification, detect and resolve any Sev-1 faults within the launch window (T-0 to T+6h), and record a complete timestamped cutover log. This workstream is the point of no short-term return: once traffic routes to the new host, indexing signals begin accumulating and the WordPress rollback window enters its most critical period.

Success means the canonical host responds correctly, HTTPS is enforced, priority routes resolve as expected, and no Sev-1 incident is left unresolved at the end of the launch window.

---

### Acceptance Criteria

**T-24h checks:**
- [ ] Final RC commit SHA confirmed and matches `phase-8-rc-v1` tag; no post-tagging changes committed
- [ ] GitHub Pages custom domain (`www.rhino-inquisitor.com`) status is healthy and HTTPS certificate is valid or confirmed in final issuance
- [ ] Domain verification TXT record is present and GitHub Pages domain verification is active
- [ ] DNS rollback snapshot recorded: current A/AAAA/CNAME/TXT record values and TTLs documented
- [ ] Search Console access and ownership continuity confirmed by SEO operator
- [ ] Monitoring scripts and dashboards confirmed live
- [ ] Incident bridge channel confirmed active; all role owners present
- [ ] Non-migration changes frozen on `main` for the duration of the launch window

**T-0 execution:**
- [ ] Release artifact deployed from `phase-8-rc-v1` tag via GitHub Actions
- [ ] DNS A/CNAME records updated per Phase 7 runbook (`migration/phase-7-launch-runbook.md`)
- [ ] DNS propagation verified using explicit public resolvers:
  - [ ] `dig @1.1.1.1 www.rhino-inquisitor.com CNAME +short`
  - [ ] `dig @8.8.8.8 www.rhino-inquisitor.com CNAME +short`
  - [ ] `dig @1.1.1.1 rhino-inquisitor.com A +short`
  - [ ] `dig @8.8.8.8 rhino-inquisitor.com A +short`
  - [ ] `dig @1.1.1.1 rhino-inquisitor.com AAAA +short`
  - [ ] `dig @8.8.8.8 rhino-inquisitor.com AAAA +short`
- [ ] All changes and timestamps recorded in `monitoring/launch-cutover-log.md`

**T+0h to T+6h verification:**
- [ ] `https://www.rhino-inquisitor.com` responds HTTP 200 with correct content
- [ ] HTTP → HTTPS redirect enforced: `http://www.rhino-inquisitor.com` → `https://www.rhino-inquisitor.com`
- [ ] Apex → www redirect confirmed: `https://rhino-inquisitor.com` → `https://www.rhino-inquisitor.com`
- [ ] All URLs in the post-launch smoke test matrix return expected status codes:
  - [ ] Homepage (`/`)
  - [ ] 3 most-recent published article pages (by front matter date)
  - [ ] Archive page (`/archive/`)
  - [ ] First 3 alphabetical category pages with live content
  - [ ] Privacy policy page
  - [ ] At least 5 high-value legacy inbound URLs (highest-priority `critical`/`high` set from Phase 6 manifest)
- [ ] Canonical tags on homepage and article template reference `https://www.rhino-inquisitor.com/...`
- [ ] `sitemap.xml` is reachable at `https://www.rhino-inquisitor.com/sitemap.xml` and returns 200
- [ ] `robots.txt` is reachable at `https://www.rhino-inquisitor.com/robots.txt` and `Sitemap:` directive is correct
- [ ] No `noindex` leakage on indexable pages confirmed via Playwright smoke check
- [ ] No critical mixed content on homepage and article templates
- [ ] Priority redirect mappings resolve in a single hop according to the configured implementation layer (`301/308` at edge/origin where implemented, alias/meta-refresh fallback for Pages-only paths)
- [ ] No redirect chains or loops detected in priority routes
- [ ] Sitemap submitted to Search Console (RHI-095 task, but submission triggered here)
- [ ] `monitoring/launch-cutover-log.md` is updated with all decisions, timestamps, and operator names
- [ ] Any Sev-1 incident raised during the launch window is resolved or rollback is initiated; no unresolved Sev-1 incidents at T+6h

---

### Tasks

**T-24h preparation:**
- [ ] Confirm `phase-8-rc-v1` tag exists and no post-RC commits are on `main` that haven't been validated
- [ ] Log into GitHub Pages settings and confirm custom domain is set to `www.rhino-inquisitor.com`; verify Enforce HTTPS status and record a 60-minute post-propagation decision checkpoint if it is not yet available
- [ ] Confirm TLS certificate status; if in issuance, confirm expected completion time before T-0
- [ ] Record DNS rollback snapshot: copy current DNS record values and TTLs to `monitoring/launch-cutover-log.md`
- [ ] Lower DNS TTLs to 300s (5 minutes) if not already done — enables faster rollback
- [ ] Confirm Search Console access: SEO operator logs in and confirms `https://www.rhino-inquisitor.com` property is verified
- [ ] Run smoke check against staging to confirm monitoring scripts are operational
- [ ] Brief all role owners; confirm incident bridge is active; confirm everyone knows the rollback trigger criteria
- [ ] Freeze non-migration changes: communicate freeze to any contributors

**T-0 execution:**
- [ ] Deploy release artifact by triggering GitHub Actions `deploy-pages.yml` workflow from `phase-8-rc-v1`
- [ ] Confirm deployment workflow completes successfully; record Actions run URL in cutover log
- [ ] Update DNS A/CNAME records at provider per `migration/phase-7-launch-runbook.md`
- [ ] Record DNS change timestamps and operator name in `monitoring/launch-cutover-log.md`
- [ ] Wait for DNS propagation (check TTL; verify using `@1.1.1.1` and `@8.8.8.8` checks listed in acceptance criteria)

**T+0h to T+6h verification loop:**
- [ ] Run smoke test matrix against live host; record pass/fail per URL in `monitoring/launch-cutover-log.md`
- [ ] Verify HTTP→HTTPS and apex→www redirects
- [ ] Check canonical tags on homepage and one article page
- [ ] Fetch sitemap and robots.txt; confirm accessibility and content
- [ ] Check top-priority redirect mappings using `playwright` or `curl`
- [ ] Check for mixed content using browser DevTools or automated check
- [ ] Trigger `npm run check:links` or equivalent against live host for critical paths
- [ ] Run triage loop every 30 minutes for the first 6 hours; record findings each cycle
- [ ] Raise Sev-1 alert if any blocking trigger is hit:
  - [ ] Homepage unavailable or wrong host/protocol
  - [ ] High-value legacy URL unresolved or mismapped
  - [ ] Canonical output pointing to non-canonical host
  - [ ] HTTPS enforcement not active
- [ ] Resolve or escalate any Sev-1 within 60 minutes of acknowledgement
- [ ] Close T+6h window: record final status, all Sev-1s resolved, go/no-go for continued monitoring
- [ ] Update `monitoring/launch-cutover-log.md` with final T+6h summary

**T+24h wrap-up:**
- [ ] Complete day-1 stabilization report entry in `monitoring/launch-cutover-log.md`
- [ ] Confirm risk register and owner assignments for any open issues
- [ ] Restore DNS TTLs to normal values if no rollback was needed (optional, per ops preference)
- [ ] Hand off to ongoing monitoring workstreams (WS-B through WS-H)

---

### Out of Scope

- Post-launch ongoing monitoring beyond T+24h (WS-B through WS-H scope)
- Search Console sitemap submission tracking and indexing trend review (WS-B scope)
- Redirect retention governance beyond immediate launch-day checks (WS-C scope)
- Performance trend monitoring beyond immediate regression check (WS-E scope)
- Making configuration changes not in the validated RC (requires new ticket and re-validation)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-093 Done — Phase 9 Bootstrap complete; all roles assigned and tooling confirmed | Ticket | Pending |
| `migration/phase-7-launch-runbook.md` committed (DNS steps) | Phase | Pending |
| `migration/phase-7-rollback-runbook.md` committed and drilled | Phase | Pending |
| `CUTOVER-VERIFICATION-CHECKLIST.md` committed and ready | Phase | Pending |
| `phase-8-rc-v1` git tag set on validated RC commit | Phase | Pending |
| GitHub Pages custom domain and HTTPS healthy | Infra | Pending |
| DNS provider access confirmed for DNS operator | Access | Pending |
| Search Console access confirmed for SEO operator | Access | Pending |
| Incident bridge channel confirmed and tested | Ops | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| HTTPS certificate not ready at T-0 (GitHub Pages issuance delay) | Low | High | Check cert status at T-24h; if incomplete, delay T-0 or prepare manual remove/re-add recovery steps in runbook | DNS Operator |
| DNS propagation slower than TTL implies | Medium | Medium | Verify from multiple independent resolvers; accept partial propagation delay as normal; monitor continuously | DNS Operator |
| Apex redirect not working (provider doesn't support ALIAS/ANAME records) | Medium | High | Pre-validate apex behavior in staging/pre-prod; have edge-layer fallback plan ready | Engineering Owner |
| Homepage returns 404 or wrong content immediately after cutover | Low | Critical | Have rollback DNS revert prepared; escalate to Sev-1 immediately; initiate rollback within 15 minutes if unresolved | Incident Commander |
| Priority legacy redirects resolve incorrectly on live host | Medium | High | Validate top 10 priority routes within first 30 minutes; any mismatch is Sev-1 | QA Operator |
| Search Console ownership breaks during domain change | Low | High | Pre-check verification record at T-24h; if DNS change removes TXT record, restore immediately | SEO Operator |
| Rollback cannot complete within 60-minute SLA | Low | Critical | Rollback drill performed in Phase 8 must have confirmed timing; DNS operator must have provider access ready before T-0 | DNS Operator |
| Non-migration change merged to `main` during launch freeze | Low | High | Enforce branch protection or communicate freeze clearly; verify RC tag integrity before deploying | Engineering Owner |

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

- `monitoring/launch-cutover-log.md` — complete timestamped cutover record through T+24h
- DNS change record with timestamps and operator name
- Smoke test matrix results through T+6h
- Day-1 stabilization summary

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |

---

### Notes

- This is the highest-consequence workstream in Phase 9. DNS changes take effect for real users within minutes. Every action from T-0 onward must be timestamped and attributed to an operator.
- The 60-minute rollback SLA starts from Sev-1 acknowledgement, not from problem discovery. Confirm that DNS provider access is ready before T-0; a locked-out DNS operator negates the rollback plan entirely.
- Do not rely on `robots.txt` for staging de-indexing at this point — the Phase 7 staging environment should have `noindex` headers. The production deployment must not accidentally carry over staging robots or noindex settings.
- If HTTPS is still unavailable after DNS propagation completes, follow the GitHub Pages custom-domain remove/re-add recovery steps documented in the Phase 7 runbook before escalating further.
- Reference: `analysis/plan/details/phase-9.md` §Workstream A: Cutover Execution and Immediate Verification, §Launch-Window Execution Checklist
