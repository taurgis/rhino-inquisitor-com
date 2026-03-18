# Phase 7 Staging Launch Runbook

**Date:** 2026-03-18  
**Ticket:** RHI-080  
**Status:** Done

## Purpose

This runbook turns the completed Phase 7 staging prerequisites into an operator-ready execution script for `https://staging.rhino-inquisitor.com/`. It assumes preview-host rehearsal is already approved, the production-validation artifact is already clean, and the team is now proving the custom-domain, DNS, HTTPS, and blocked-crawl choreography on staging before any final production ticket is executed.

## Scope Boundary

In scope:

1. Staging custom-domain cutover for `staging.rhino-inquisitor.com`.
2. Staging DNS verification, HTTPS verification, and blocked-crawl smoke checks.
3. Deterministic launch-day URL sampling and go/no-go criteria.
4. Production handoff notes for the later live cutover ticket.

Out of scope:

1. Final production DNS cutover for `www.rhino-inquisitor.com` and the apex domain.
2. Rollback execution steps beyond the escalation handoff to `migration/phase-7-staging-rollback-runbook.md`.
3. Phase 9 live monitoring after production launch.

## Owner Table

The repository currently uses a single-owner model, so the same named owner covers all launch-day roles unless explicitly delegated.

| Role | Name | Contact method | Primary responsibility |
|---|---|---|---|
| Incident Commander | Thomas Theunen | GitHub `@taurgis` | Declares hold, continue, or rollback evaluation when any launch gate fails. |
| Deployment Operator | Thomas Theunen | GitHub `@taurgis` | Triggers GitHub Pages deploy run, validates artifact and Pages environment state, and records CI evidence. |
| DNS Operator | Thomas Theunen | GitHub `@taurgis` | Applies staging DNS changes, records timestamps, and confirms resolver convergence or provider-zone confirmation. |
| SEO Monitor | Thomas Theunen | GitHub `@taurgis` | Verifies canonical, robots, sitemap, and blocked crawl-state on staging. |

## Evidence Snapshot

| Area | Current evidence | Status |
|---|---|---|
| DNS choreography | `migration/phase-7-dns-cutover-plan.md` | Ready |
| HTTPS and mixed-content validation | `migration/phase-7-https-staging-checklist.md` | Ready |
| Staging SEO safety and blocked crawl-state | `migration/phase-7-seo-safety-staging-report.md` | Ready |
| Deploy gates and CI evidence | `analysis/tickets/phase-7/RHI-079-deployment-quality-gates-tooling.md` | Ready |
| Equivalent dry-run deploy evidence | Deploy to GitHub Pages run `#132`: `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23213150405` | Ready |

## Deterministic Smoke Sample Set

Use the same route-selection method every time this runbook is executed.

### Recent posts

Derived from front matter date order in `src/content/posts` on 2026-03-18:

1. `/real-time-inventory-checks-in-sfcc/`
2. `/a-dev-guide-to-combating-fraud-on-sfcc/`
3. `/kickstart-guide-for-new-sfcc-developers/`

### Category pages

Derived from alphabetical live built output under `public/category/` on 2026-03-18:

1. `/category/ai/`
2. `/category/architecture/`
3. `/category/certification/`

### Legacy inbound route sample

Use `/category/salesforce-commerce-cloud/release-notes/` as the canonical legacy redirect-map sample. On GitHub Pages this may resolve through alias-backed HTML rather than an HTTP-native `301`, so verify the effective destination and destination canonical rather than assuming edge redirect semantics.

## Phase 7 Staging Validation Prerequisites

Before T-7 planning starts, confirm all of the following:

1. `RHI-074`, `RHI-076`, `RHI-077`, `RHI-078`, and `RHI-079` are `Done`.
2. Preview-host rehearsal on `https://taurgis.github.io/rhino-inquisitor-com/` is complete and archived.
3. The production-validation artifact is clean: zero preview-host leakage and zero accidental `noindex` for the production host.
4. `migration/phase-7-dns-cutover-plan.md` remains the source of truth for DNS target values.
5. `migration/phase-7-https-staging-checklist.md` remains the source of truth for HTTPS timing caveats and mixed-content verification.
6. `migration/phase-7-seo-safety-staging-report.md` remains the source of truth for staging blocked-crawl expectations.

## T-7 To T-2 Days

1. Freeze workflow design and permissions. No deploy workflow or gate changes after this point.
2. Reconfirm the owner table above and the escalation sequence.
3. Re-run the release-candidate CI path and confirm all nine blocking gates exit `0`.
4. Confirm the GitHub Pages custom domain entry for `staging.rhino-inquisitor.com` is healthy.
5. Confirm Search Console ownership access and analytics dashboards remain accessible.
6. Review rollback criteria in `migration/phase-7-staging-rollback-runbook.md` and confirm every operator understands the incident handoff.
7. Send the launch-window notice to stakeholders:
   - window start and expected duration
   - roles and escalation owner
   - staging host under validation
   - rollback decision path if any gate fails

## T-24 Hours

1. Lower staging DNS TTL to `300` seconds or the provider minimum.
2. Confirm the custom domain is configured in GitHub Pages settings before any DNS mutation.
3. Confirm account-level domain verification for `rhino-inquisitor.com` remains active.
4. If GitHub Pages explicitly requests `_github-pages-challenge-taurgis.staging.rhino-inquisitor.com`, add the TXT record and wait for propagation.
5. Re-run the release-candidate CI path against the final content snapshot.
6. Record the successful run URL in the launch log.
7. Confirm the Pages deployment URL and staging host are both reachable.
8. Confirm the rollback runbook and DNS snapshot are available to the operators.

## T-0 Cutover Sequence

| Step | Owner | Action | Evidence to capture | Go/No-Go rule |
|---|---|---|---|---|
| 1 | Deployment Operator | Trigger the release-candidate deploy run or confirm the equivalent validated deploy run is still the active artifact. | Actions run URL, commit SHA, workflow conclusion | No-go if deploy fails or artifacts do not match the release candidate. |
| 2 | Deployment Operator | Confirm all blocking gates passed before artifact upload. | Gate summary artifact or run summary | No-go if any blocking gate failed. |
| 3 | DNS Operator | Confirm `staging.rhino-inquisitor.com` is configured in Pages settings before touching DNS. | Pages settings screenshot or operator log note | No-go if custom-domain state is unhealthy or missing. |
| 4 | DNS Operator | Apply staging CNAME to `taurgis.github.io`. Add `_github-pages-challenge-taurgis.staging.rhino-inquisitor.com` only if GitHub Pages explicitly requires it. | Provider change timestamp, operator name | No-go if provider change cannot be completed or conflicts remain. |
| 5 | DNS Operator | Monitor resolver behavior using `@1.1.1.1` and `@8.8.8.8`. If the provider flattens/proxies records, use A/AAAA convergence plus provider-zone confirmation. | `dig` output or provider confirmation log | Hold if resolver behavior is unstable past the expected TTL window. |
| 6 | Deployment Operator | Confirm `https://staging.rhino-inquisitor.com/` serves the expected artifact. | Browser or `curl` note with timestamp | Hold if wrong content or wrong host is served. |
| 7 | Deployment Operator | Monitor GitHub Pages certificate provisioning and Enforce HTTPS availability. | Pages settings note, HTTP-to-HTTPS check | Hold if Enforce HTTPS is unavailable 60 minutes after propagation confirmation. |
| 8 | SEO Monitor | Run the smoke matrix below against the staging host. | Smoke matrix pass/fail log | No-go if any critical route fails. |
| 9 | SEO Monitor | Confirm canonical, robots, sitemap, and feed host behavior all stay on the staging host with blocked crawl-state. | Head/meta notes, `robots.txt`, `sitemap.xml`, `index.xml` samples | No-go if any production host, preview host, or indexable crawl state leaks. |
| 10 | Incident Commander | Declare staging launch complete or invoke incident hold and rollback evaluation. | Timestamped decision note | Do not declare complete until every complete criterion is satisfied. |

## Command Pack

Use these commands during T-0 and the first monitoring pass.

```bash
dig @1.1.1.1 staging.rhino-inquisitor.com CNAME +short
dig @8.8.8.8 staging.rhino-inquisitor.com CNAME +short
dig @1.1.1.1 staging.rhino-inquisitor.com A +short
dig @8.8.8.8 staging.rhino-inquisitor.com A +short
dig @1.1.1.1 staging.rhino-inquisitor.com AAAA +short
dig @8.8.8.8 staging.rhino-inquisitor.com AAAA +short
dig _github-pages-challenge-taurgis.staging.rhino-inquisitor.com TXT +short
curl -sI http://staging.rhino-inquisitor.com/
curl -sI https://staging.rhino-inquisitor.com/
curl -s https://staging.rhino-inquisitor.com/robots.txt
curl -s https://staging.rhino-inquisitor.com/sitemap.xml | head
```

## Smoke Test Checklist

| URL | Expected result |
|---|---|
| `https://staging.rhino-inquisitor.com/` | HTTP `200`, canonical `https://staging.rhino-inquisitor.com/`, robots `noindex, nofollow` |
| `https://staging.rhino-inquisitor.com/real-time-inventory-checks-in-sfcc/` | HTTP `200`, canonical on staging host, robots `noindex, nofollow` |
| `https://staging.rhino-inquisitor.com/a-dev-guide-to-combating-fraud-on-sfcc/` | HTTP `200`, canonical on staging host, robots `noindex, nofollow` |
| `https://staging.rhino-inquisitor.com/kickstart-guide-for-new-sfcc-developers/` | HTTP `200`, canonical on staging host, robots `noindex, nofollow` |
| `https://staging.rhino-inquisitor.com/archive/` | HTTP `200`, canonical `https://staging.rhino-inquisitor.com/archive/`, robots `noindex, nofollow` |
| `https://staging.rhino-inquisitor.com/category/ai/` | HTTP `200`, canonical on staging host, robots `noindex, nofollow` |
| `https://staging.rhino-inquisitor.com/category/architecture/` | HTTP `200`, canonical on staging host, robots `noindex, nofollow` |
| `https://staging.rhino-inquisitor.com/category/certification/` | HTTP `200`, canonical on staging host, robots `noindex, nofollow` |
| `https://staging.rhino-inquisitor.com/privacy-policy/` | HTTP `200`, canonical `https://staging.rhino-inquisitor.com/privacy-policy/`, robots `noindex, nofollow` |
| `https://staging.rhino-inquisitor.com/category/salesforce-commerce-cloud/release-notes/` | Effective destination `https://staging.rhino-inquisitor.com/category/release-notes/`; destination canonical on staging host |
| `https://staging.rhino-inquisitor.com/sitemap.xml` | HTTP `200`, XML response, all `<loc>` values on the staging host |
| `https://staging.rhino-inquisitor.com/robots.txt` | HTTP `200`, `Disallow: /`, `Sitemap: https://staging.rhino-inquisitor.com/sitemap.xml` |
| `http://staging.rhino-inquisitor.com/` | HTTP `301` to `https://staging.rhino-inquisitor.com/` |

## Go/No-Go Criteria

### Pre-cutover go/no-go

Go only if all are true:

1. `RHI-074` through `RHI-079` are `Done`.
2. All nine blocking CI gates pass on the release candidate.
3. The Pages custom domain entry is healthy.
4. DNS operator access and rollback evidence are confirmed.

### DNS cutover go/no-go

Go only if all are true:

1. Release candidate deploy run succeeded.
2. The staging artifact matches the expected commit.
3. DNS changes were applied without conflict.
4. Resolver checks or provider-zone confirmation show stable convergence.

### Launch complete criteria

Declare complete only if all are true:

1. `http://staging.rhino-inquisitor.com/` redirects to HTTPS.
2. All smoke URLs above meet their expected outcomes.
3. `robots.txt` and page-level robots meta keep the staging host blocked (`noindex, nofollow` and `Disallow: /`).
4. Canonical, Open Graph, JSON-LD, feed, and sitemap signals stay on the staging host.

### Incident hold / rollback evaluation triggers

1. Five or more priority routes return `404` or `5xx` after the propagation window.
2. Enforce HTTPS is still unavailable 60 minutes after propagation confirmation.
3. Canonical, sitemap, or robots output leaks the production host or preview host.
4. Any smoke URL returns indexable crawl-state on the staging host.

## T+1 To T+24 Hours Monitoring

1. Re-run the smoke matrix after the first propagation window closes.
2. Check analytics or server logs for 404 spikes; if they exceed 5% of requests in the first two hours, start incident hold.
3. Re-check HTTPS enforcement and mixed-content absence on homepage, article template, and category template.
4. Re-run parity and SEO-safety checks if any content hotfix ships during the window.
5. Confirm the legacy inbound route sample still resolves to the correct effective destination.
6. Record a final staging sign-off note and capture any production handoff caveats.

## Escalation Path

1. Deployment or gate failure: Incident Commander + Deployment Operator.
2. DNS convergence problem: Incident Commander + DNS Operator.
3. Canonical, robots, sitemap, or crawl-state problem: Incident Commander + SEO Monitor.
4. Rollback evaluation: hand off immediately to `migration/phase-7-staging-rollback-runbook.md`.

## Stakeholder Notification Template

Use the following message if the staging window enters hold or completes:

```text
Phase 7 staging cutover update: <status>.
Host: https://staging.rhino-inquisitor.com/
Impact: <none | blocked crawl-state issue | DNS convergence issue | HTTPS issue | other>
Action: <continue monitoring | incident hold | rollback evaluation>
Owner: Thomas Theunen (@taurgis)
```

## Production Handoff Notes

1. This runbook is the validated template for the future production cutover ticket.
2. Production execution must adapt host expectations from staging blocked-crawl mode to production indexable mode.
3. GitHub Pages documentation does not support treating one Pages site as simultaneously staging and production on separate arbitrary custom domains, so the production ticket must explicitly document the custom-domain transition window and the final host-state swap.

## Related Files

1. `analysis/tickets/phase-7/RHI-080-launch-window-execution-runbook.md`
2. `migration/phase-7-dns-cutover-plan.md`
3. `migration/phase-7-https-staging-checklist.md`
4. `migration/phase-7-seo-safety-staging-report.md`
5. `migration/phase-7-staging-rollback-runbook.md`