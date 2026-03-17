# Phase 7 Staging-First Validation Pattern

**Date:** 2026-03-17  
**Phase:** 7  
**Scope:** Tickets RHI-076 through RHI-082

## Change Summary

Phase 7 workstreams D through H (RHI-076 onwards) have been adjusted to implement a staging-first validation pattern. All cutover procedures, HTTPS enforcement, SEO verification, and incident response practices will be validated on `staging.rhino-inquisitor.com` before production cutover to `www.rhino-inquisitor.com` and the apex domain.

## Why This Matters

**Staging-first approach reduces production risk by:**
1. Proving DNS procedures work before production cutover
2. Validating team readiness and runbook accuracy in a low-risk environment
3. Confirming HTTPS, SEO signals, and smoke tests succeed before production stakes
4. Allowing rollback testing on staging without affecting production
5. Providing a repeatable, tested template for production execution

## Affected Tickets and Changes

| Ticket | Workstream | Change | Notable Update |
|--------|-----------|--------|---|
| RHI-076 | WS-C | DNS strategy now focuses on `staging.rhino-inquisitor.com` CNAME | Single target CNAME (no apex records for staging) |
| RHI-077 | WS-D | HTTPS on staging subdomain; production deferred | Staging HTTPS gate blocks staging sign-off |
| RHI-078 | WS-E | SEO validation on staging host; canonical checks for staging | Report renamed to `phase-7-seo-safety-staging-report.md` |
| RHI-079 | WS-F | Quality gates remain domain-agnostic | No substantial change; gates work for staging/production|
| RHI-080 | WS-G | Renamed to "Staging Cutover Execution Runbook" | Staging runbook is template for final production ticket |
| RHI-081 | WS-H | Staging rollback procedures; production rollback in final ticket | Staging rollback focuses on subdomain DNS revert |
| RHI-082 | Sign-off | Staging sign-off gates production ticket creation | Explicit: production cutover is separate ticket |

## Execution Sequence

1. **RHI-076**: Deploy `staging.rhino-inquisitor.com` CNAME + TXT verification records
2. **RHI-077**: Validate HTTPS and enable Enforce HTTPS for staging domain
3. **RHI-078**: Verify canonical, sitemap, robots.txt all point to staging host
4. **RHI-079**: Run quality gates (results are domain-independent)
5. **RHI-080**: Execute staging cutover using documented runbook
6. **RHI-081**: Complete staging rollback procedures and dry-run validation
7. **RHI-082**: Sign off on staging completion
8. **[Future ticket]**: Create final production cutover ticket using staging runbook as template

## Production Cutover Deferred

**Production cutover to `www.rhino-inquisitor.com` and apex domain will be handled in a separate ticket after Phase 7 staging sign-off (RHI-082) is complete.**

This allows:
- Clean separation of staging validation from production execution
- Time to review staging outcomes before scheduling production cutover
- Flexibility to address any staging findings before production commitment
- Clear "production cutover ticket" that can be created once staging is approved

## Key Deliverables for Staging

- `migration/phase-7-dns-cutover-plan.md` — staging DNS strategy (already created)
- `migration/phase-7-https-staging-checklist.md` — staging HTTPS gate
- `migration/phase-7-seo-safety-staging-report.md` — staging SEO validation
- `migration/phase-7-staging-launch-runbook.md` — stagingcutover procedure (template for production)
- `migration/phase-7-staging-rollback-runbook.md` — staging rollback plan
- `migration/phase-7-staging-signoff.md` — staging completion evidence

## Notes

- Staging validation proves team readiness and procedures; it does not replace production cutover planning
- The staging runbook is the authoritative template for production cutover execution
- All quality gates (RHI-079) are domain-agnostic and produce the same pass/fail criteria for both staging and production
- Staging sign-off (RHI-082) is the gate for production cutover ticket creation
