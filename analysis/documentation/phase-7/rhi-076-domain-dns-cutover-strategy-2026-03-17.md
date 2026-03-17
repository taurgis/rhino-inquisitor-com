# RHI-076 — Domain and DNS Cutover Strategy

**Date:** 2026-03-17  
**Phase:** 7  
**Ticket:** RHI-076  
**Status:** Done  
**Author:** Engineering Owner

---

## Change Summary

Added the Phase 7 staging DNS validation plan for `staging.rhino-inquisitor.com` at `migration/phase-7-dns-cutover-plan.md`. The plan documents the staging cutover strategy as a prerequisite to production cutover, including target records, ordering controls, validation commands, rollback records, and T-24 operational checklists.

Refined the ticket to add a minimal closeout checklist that isolates the few remaining actions required before RHI-076 can be marked Done.

Refined the ticket further to add PM-ordered, ready-to-paste Progress Log entries for the remaining closeout actions.

Closed the final two closeout items by recording owner-confirmed provider-zone completion and engineering owner sign-off.

---

## Why This Changed

RHI-076 requires a staging DNS validation strategy before production cutover can be executed. Testing the cutover flow on a staging subdomain first reduces production risk and validates the runbook procedures and team readiness before live `www.rhino-inquisitor.com` traffic cutover.

---

## Behavior Details

### Before

- Phase 7 had a baseline DNS snapshot (`migration/phase-7-dns-snapshot.md`) but no dedicated staging validation plan artifact.
- DNS cutover sequencing and validation procedures were only described at ticket level.

### After

- `migration/phase-7-dns-cutover-plan.md` now defines the staging validation sequence:
  - staging-only DNS CNAME target and verification strategy
  - staging resolver validation commands and current-state evidence
  - staging-specific T-24 checklist and go/no-go criteria
  - staging rollback procedure and decision points
- `analysis/tickets/phase-7/RHI-076-domain-dns-cutover-strategy.md` now includes a minimal closeout checklist so operator follow-through and final sign-off requirements are explicit.
- The ticket now also includes PM-ordered, ready-to-paste Progress Log entry templates so the remaining closeout evidence can be recorded consistently.
- The plan explicitly gates staging completion before production cutover (RHI-080) is approved.

---

## Impact

- Workstream C now has a committed execution-ready DNS strategy document for downstream launch runbook work (RHI-080).
- DNS control-plane actions that still require provider-side evidence are explicitly tracked as blockers instead of assumed complete.
- Remaining blocker scope is fully resolved; staging validation is complete and RHI-080 is unblocked.
- Ticket evidence quality improved by including tested command set outputs for both Cloudflare and Google public resolvers.
- Owner confirmation now closes the GitHub Pages staging-configuration and ownership-verification prerequisites for this ticket.
- Remaining completion work is now reduced to a concise five-item closeout checklist in the ticket.

---

## Verification

1. Confirmed new artifact exists: `migration/phase-7-dns-cutover-plan.md`.
2. Verified ticket acceptance coverage by mapping plan sections to RHI-076 checklist requirements.
3. Ran staging command pack against current DNS state on 2026-03-17:
  - `dig @1.1.1.1 staging.rhino-inquisitor.com CNAME +short`
  - `dig @8.8.8.8 staging.rhino-inquisitor.com CNAME +short`
  - `dig @1.1.1.1 staging.rhino-inquisitor.com A +short`
  - `dig @8.8.8.8 staging.rhino-inquisitor.com A +short`
  - `dig @1.1.1.1 staging.rhino-inquisitor.com AAAA +short`
  - `dig @8.8.8.8 staging.rhino-inquisitor.com AAAA +short`
  - `dig _github-pages-challenge-taurgis.staging.rhino-inquisitor.com TXT +short`
  - `curl -s -o /dev/null -w "%{http_code} %{redirect_url}" https://staging.rhino-inquisitor.com/`
4. Captured staging-host metadata snapshot showing canonical and Open Graph host values on `https://staging.rhino-inquisitor.com/`.
5. Confirmed the remaining blocker set is narrowed to provider-zone confirmation for flattened DNS behavior plus final validation/sign-off.
6. Recorded owner confirmation that GitHub Pages staging configuration is complete and that existing GitHub Pages domain verification for other `rhino-inquisitor.com` subdomains satisfies the ownership prerequisite for staging.
7. Captured live staging crawl signals:
  - `robots.txt` returns `User-agent: *`, `Disallow: /`, and `Sitemap: https://staging.rhino-inquisitor.com/sitemap.xml`
  - `sitemap.xml` emits `https://staging.rhino-inquisitor.com/` URLs
8. Added a minimal closeout checklist to RHI-076 covering provider-zone confirmation, dual-resolver evidence, formal staging SEO validation, staging crawl-state acknowledgement, and engineering owner sign-off.
9. Added PM-ordered, ready-to-paste Progress Log entries for the remaining five closeout actions.
10. Captured final dual-resolver evidence showing no direct CNAME answer and consistent provider-flattened `A`/`AAAA` responses across Cloudflare and Google resolvers.
11. Ran `npm run check:seo` successfully; the gate passed and reported `SEO validation passed for 212 indexable route(s)`.
12. Recorded staging crawl-state acknowledgement as expected pre-production behavior and reduced the remaining open closeout items to provider-zone confirmation plus engineering owner sign-off.
13. Recorded owner-confirmed provider-zone completion for `staging.rhino-inquisitor.com` consistent with the flattened resolver outputs captured in the ticket.
14. Recorded engineering owner sign-off and closed RHI-076 as complete, clearing RHI-080 to proceed.

---

## Related Files

- `migration/phase-7-dns-cutover-plan.md`
- `migration/phase-7-dns-snapshot.md`
- `analysis/tickets/phase-7/RHI-076-domain-dns-cutover-strategy.md`
- `analysis/tickets/phase-7/INDEX.md`
- `analysis/tickets/INDEX.md`
- `analysis/plan/details/phase-7.md`

---

## Assumptions and Open Questions

- Assumes owner host remains `taurgis.github.io`; final value must be confirmed in Pages settings at execution time.
- Assumes DNS provider flattening/proxy behavior can hide direct CNAME answers; resolver A/AAAA plus provider-zone checks are used when needed.
- Open: none.
