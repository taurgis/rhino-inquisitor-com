## RHI-007 · Staging and Indexing Guardrails

**Status:** Open  
**Priority:** Medium  
**Estimate:** S  
**Phase:** 1  
**Assigned to:** Migration Owner + SEO Owner  
**Target date:** 2026-03-13  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Define and document the plan for preventing staging environments from being crawled and indexed by search engines during the migration, and prepare DNS TTL reduction ahead of the production cutover window.

If staging content is indexed before launch, it can produce duplicate content penalties, split link equity, or overwrite Search Console data. Equally, if DNS TTL is not reduced in advance, the cutover window will be longer and riskier than necessary.

---

### Acceptance Criteria

- [ ] Staging noindex strategy is documented: chosen mechanism (`noindex` meta tag and/or `robots.txt Disallow`) and confirmed scope (all staging pages)
- [ ] Staging environment is confirmed to use `<meta name="robots" content="noindex">` on every rendered page — not `robots.txt` alone
- [ ] Confirmed: no staging page will appear in production Search Console property
- [ ] Unblock checklist is documented: what must be removed or toggled before production launch
- [ ] DNS TTL reduction plan is documented: current TTL value, target TTL value (≤ 300 seconds), when to apply the reduction (at least 7 days before cutover)
- [ ] Current DNS record values documented for rollback reference
- [ ] Guardrail plan approved by migration owner and SEO owner (sign-off in Progress Log)
- [ ] Plan committed to `migration/phase-1-signoff.md` as part of the staging section (or as a standalone document if preferred)

---

### Tasks

- [ ] Confirm whether a staging environment will be used during the migration
  - [ ] If yes: identify hosting location (GitHub Pages preview branch, Netlify, Vercel, etc.)
  - [ ] If no: document the decision and rationale; mark remaining tasks N/A
- [ ] Research and document the chosen noindex mechanism for the staging host
  - [ ] Verify that `<meta name="robots" content="noindex">` is supported on static hosting
  - [ ] Document how to toggle noindex: environment variable, Hugo config, or template conditional
  - [ ] Confirm `robots.txt` on staging uses `Disallow: /` as secondary backstop
- [ ] Draft the unblock checklist: ordered steps to remove noindex before production launch
  - [ ] Remove staging `noindex` meta tag
  - [ ] Update `robots.txt` for production (allow all)
  - [ ] Verify via URL inspection in Search Console post-launch
- [ ] Probe current DNS records:
  - [ ] `www.rhino-inquisitor.com` A/CNAME record + current TTL
  - [ ] Apex `rhino-inquisitor.com` A/CNAME record + current TTL
  - [ ] Record values for rollback reference in this ticket
- [ ] Draft DNS TTL reduction plan:
  - [ ] Date to reduce TTL to 300 seconds (must be ≥ 7 days before planned cutover)
  - [ ] Date to execute cutover
  - [ ] Date to restore normal TTL after cutover confirmed stable
- [ ] Review plan with migration owner and SEO owner
- [ ] Record approval in Progress Log

---

### Out of Scope

- Executing the DNS cutover or changing DNS records (Phase 7, RHI not yet assigned)
- Setting up the staging environment itself (Phase 3)
- Configuring GitHub Pages production deployment (Phase 7)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-003 Done (URL invariant and host policy) | Ticket | Pending |
| DNS provider access confirmed (from RHI-001) | Access | Pending |
| Decision on staging hosting approach | Phase | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Staging site accidentally indexed before launch | Medium | High | Enforce `noindex` meta tag as primary control; do not rely on `robots.txt` alone | SEO Owner |
| DNS TTL not reduced in time before cutover window | Medium | High | Schedule TTL reduction on Day 6 of Phase 1; track explicitly in cutover log | Migration Owner |
| Current DNS TTL is very high (e.g. 86400 seconds) | Medium | High | Identify TTL on Day 6; reduce as soon as Phase 1 completes if cutover is planned | Migration Owner |
| GitHub Pages does not support per-branch noindex toggle out of the box | Medium | Medium | Use Hugo environment config to inject `noindex` on non-production builds | Migration Engineer |

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

- Staging noindex plan (added to `migration/phase-1-signoff.md` or standalone file)
- DNS TTL reduction plan (added to same document)
- DNS record snapshot for rollback reference

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Per Google guidance, `robots.txt` alone is insufficient for noindex; `<meta name="robots" content="noindex">` or `X-Robots-Tag: noindex` on staging pages is required.
- If no staging environment is used, this ticket reduces in scope to DNS TTL planning only.
- Reference: `analysis/plan/details/phase-1.md` §Workstream 6
- Official: https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
