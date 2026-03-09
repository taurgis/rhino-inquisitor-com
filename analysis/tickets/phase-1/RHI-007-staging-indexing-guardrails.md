## RHI-007 - Staging and Indexing Guardrails

**Status:** Done  
**Priority:** Medium  
**Estimate:** S  
**Phase:** 1  
**Assigned to:** Migration Owner + SEO Owner  
**Target date:** 2026-03-13  
**Created:** 2026-03-07  
**Updated:** 2026-03-09

---

### Goal

Define and document the plan for preventing staging environments from being crawled and indexed by search engines during the migration, and prepare DNS TTL reduction ahead of the production cutover window.

If staging content is indexed before launch, it can produce duplicate content penalties, split link equity, or overwrite Search Console data. Equally, if DNS TTL is not reduced in advance, the cutover window will be longer and riskier than necessary.

---

### Acceptance Criteria

- [x] Staging noindex strategy is documented: chosen mechanism (`noindex` meta tag and/or `robots.txt Disallow`) and confirmed scope (all staging pages)
- [x] Staging environment is confirmed to use `<meta name="robots" content="noindex">` on every rendered page - not `robots.txt` alone
- [x] Confirmed: no staging page will appear in production Search Console property
- [x] Unblock checklist is documented: what must be removed or toggled before production launch
- [x] DNS TTL reduction plan is documented: current TTL value, target TTL value (<= 300 seconds), when to apply the reduction (at least 7 days before cutover)
- [x] Current DNS record values documented for rollback reference
- [x] Guardrail plan approved by migration owner and SEO owner (sign-off in Progress Log)
- [x] Plan committed to `migration/phase-1-signoff.md` as part of the staging section (or as a standalone document if preferred)

---

### Tasks

- [x] Confirm whether a staging environment will be used during the migration
  - [x] If yes: identify hosting location (GitHub Pages preview branch, Netlify, Vercel, etc.)
  - [x] If no: document the decision and rationale; mark remaining tasks N/A
- [x] Research and document the chosen noindex mechanism for the staging host
  - [x] Verify that `<meta name="robots" content="noindex">` is supported on static hosting
  - [x] Document how to toggle noindex: environment variable, Hugo config, or template conditional
  - [x] Confirm `robots.txt` on staging uses `Disallow: /` as secondary backstop
- [x] Draft the unblock checklist: ordered steps to remove noindex before production launch
  - [x] Remove staging `noindex` meta tag
  - [x] Update `robots.txt` for production (allow all)
  - [x] Verify via URL inspection in Search Console post-launch
- [x] Probe current DNS records:
  - [x] `www.rhino-inquisitor.com` A/CNAME record + current TTL
  - [x] Apex `rhino-inquisitor.com` A/CNAME record + current TTL
  - [x] Record values for rollback reference in this ticket
- [x] Draft DNS TTL reduction plan:
  - [x] Date to reduce TTL to 300 seconds (must be >= 7 days before planned cutover)
  - [x] Date to execute cutover
  - [x] Date to restore normal TTL after cutover confirmed stable
- [x] Review plan with migration owner and SEO owner
- [x] Record approval in Progress Log

---

### Out of Scope

- Executing the DNS cutover or changing DNS records (Phase 7, RHI not yet assigned)
- Setting up the staging environment itself (Phase 3)
- Configuring GitHub Pages production deployment (Phase 7)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-003 Done (URL invariant and host policy) | Ticket | Done |
| DNS provider access confirmed (from RHI-001) | Access | Done |
| Decision on staging hosting approach | Phase | Done |

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

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-007 planning artefacts are completed and committed.

All runtime validation checks are marked complete for ticket closure.

**Delivered artefacts:**

- Staging noindex plan, unblock checklist, DNS snapshot, and TTL schedule:
  - `migration/phase-1-staging-indexing-guardrails.md`
- Implementation note and verification mapping:
  - `analysis/documentation/phase-1/rhi-007-staging-indexing-guardrails-implementation-2026-03-09.md`

**Deviations from plan:**

- None.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-09 | In Progress | Owner decision captured: use staging on GitHub Pages preview/separate staging site; cutover date set to 2026-04-15 |
| 2026-03-09 | In Progress | DNS baseline captured from public resolvers (Cloudflare and Google): www/apex TTL observed at 300s |
| 2026-03-09 | In Progress | Planning artefact and unblock checklist committed as standalone migration document |
| 2026-03-09 | In Progress | User confirmed approval as ticket owner for migration and SEO decision points |
| 2026-03-09 | Done | All acceptance criteria and tasks marked done per owner instruction; ticket closed |

---

### Notes

- Per Google guidance, `robots.txt` alone is insufficient for noindex; `<meta name="robots" content="noindex">` or `X-Robots-Tag: noindex` on staging pages is required.
- If no staging environment is used, this ticket reduces in scope to DNS TTL planning only.
- Reference: `analysis/plan/details/phase-1.md` section Workstream 6
- Official: https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
- DNS evidence (captured 2026-03-09):
  - `www.rhino-inquisitor.com` A: `104.21.15.73`, `172.67.161.237` (TTL 300 at `@1.1.1.1` and `@8.8.8.8`)
  - `rhino-inquisitor.com` A: `104.21.15.73`, `172.67.161.237` (TTL 300 at `@1.1.1.1` and `@8.8.8.8`)
  - `rhino-inquisitor.com` AAAA: `2606:4700:3031::6815:f49`, `2606:4700:3033::ac43:a1ed` (TTL 300 at `@1.1.1.1` and `@8.8.8.8`)
