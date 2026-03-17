# Phase 7 DNS Cutover Plan

**Date:** 2026-03-17  
**Prepared by:** Engineering Owner  
**Ticket:** RHI-076  
**Status:** In Progress (plan and command validation complete; external control-plane steps pending)

## Change Summary

This plan defines the production DNS cutover strategy for moving `www.rhino-inquisitor.com` and `rhino-inquisitor.com` to GitHub Pages while preserving the canonical `www` host. It includes target records, T-24 preparation, validation commands, rollback records, and go/no-go controls.

## Why This Changed

RHI-076 requires an execution-ready DNS cutover runbook before launch-window execution (RHI-080). Without a committed plan, DNS changes could be performed in the wrong order and increase domain takeover, propagation, and rollback risk.

## Behavior Details

### Previous Behavior

- Phase 7 had a DNS snapshot baseline in `migration/phase-7-dns-snapshot.md`.
- No dedicated DNS cutover plan existed for GitHub Pages custom-domain execution.

### New Behavior

- Phase 7 now has a dedicated DNS cutover plan with target record definitions, preconditions, validation command pack, and rollback procedure.
- The plan blocks cutover execution until preview-host rehearsal validation and Phase 8 sign-off conditions are met.

## Scope

In scope:

1. DNS target record strategy for `www` and apex.
2. GitHub Pages custom-domain and TXT verification preconditions.
3. T-24 preparation checklist and validation commands.
4. Rollback record set and rollback procedure.

Out of scope:

1. Live DNS execution during the launch window (RHI-080).
2. HTTPS issuance and enforcement execution (RHI-077).
3. CDN/edge configuration changes outside DNS/provider controls.

## Hard Preconditions Before Any DNS Change

1. Preview-host rehearsal evidence is complete and approved for `https://taurgis.github.io/rhino-inquisitor-com/`.
2. Phase 8 sign-off evidence is recorded as go/no-go input for launch execution.
3. GitHub Pages Settings -> Pages contains custom domain `www.rhino-inquisitor.com`.
4. Pages settings shows no blocking custom-domain validation errors.
5. Domain verification TXT `_github-pages-challenge-<owner>` is present in DNS and retained.
6. Release-candidate CI gate suite is green on the final content snapshot.

## Current DNS State Baseline (Pre-Cutover)

Source: `migration/phase-7-dns-snapshot.md` (2026-03-16), with command revalidation on 2026-03-17.

### Observed Current Answers

- `www.rhino-inquisitor.com` returns no public CNAME answer and is currently flattened to Cloudflare A/AAAA answers.
- `rhino-inquisitor.com` currently resolves to Cloudflare A/AAAA answers.
- `_github-pages-challenge-taurgis.rhino-inquisitor.com` currently returns no TXT answer.

## Target DNS Record Set for Cutover

Reference source (official): GitHub Pages custom-domain docs (verify again at execution time).

| Host | Type | Target Value | Notes |
|------|------|--------------|-------|
| `www.rhino-inquisitor.com` | `CNAME` | `taurgis.github.io` | Must point to `<owner>.github.io` (no repository suffix). |
| `rhino-inquisitor.com` | `A` | `185.199.108.153` | GitHub Pages apex IPv4 target set. |
| `rhino-inquisitor.com` | `A` | `185.199.109.153` | GitHub Pages apex IPv4 target set. |
| `rhino-inquisitor.com` | `A` | `185.199.110.153` | GitHub Pages apex IPv4 target set. |
| `rhino-inquisitor.com` | `A` | `185.199.111.153` | GitHub Pages apex IPv4 target set. |
| `rhino-inquisitor.com` | `AAAA` | `2606:50c0:8000::153` | GitHub Pages apex IPv6 target set. |
| `rhino-inquisitor.com` | `AAAA` | `2606:50c0:8001::153` | GitHub Pages apex IPv6 target set. |
| `rhino-inquisitor.com` | `AAAA` | `2606:50c0:8002::153` | GitHub Pages apex IPv6 target set. |
| `rhino-inquisitor.com` | `AAAA` | `2606:50c0:8003::153` | GitHub Pages apex IPv6 target set. |
| `_github-pages-challenge-taurgis.rhino-inquisitor.com` | `TXT` | `<value from GitHub domain verification UI>` | Must be present before cutover and kept after verification. |

### Conflict Controls

1. No wildcard `*` DNS records that shadow `www` or apex.
2. No stale `www` A/AAAA records once the `www` CNAME is active.
3. No duplicate or conflicting apex records that override the target set.
4. Never point `www` CNAME at apex; always point directly at `taurgis.github.io`.

## TTL Reduction Plan

Operational policy for cutover:

1. Set TTL to `300` seconds (or lowest supported value) for all affected `www` and apex records at least 24 hours before cutover.
2. Capture previous TTL values and change timestamp in execution log.
3. If provider minimum TTL is greater than `300`, extend lead time to 48 hours.

## T-24 Checklist (Pre-Cutover)

- [ ] Lower DNS TTL on affected records and record before/after values with timestamp.
- [ ] Confirm preview-host rehearsal evidence is approved.
- [ ] Re-run release-candidate CI and confirm all required gates pass.
- [ ] Confirm custom domain is set in Pages settings with no blocking errors.
- [ ] Confirm `_github-pages-challenge-<owner>` TXT record is present.
- [ ] Confirm deploy workflow readiness from RHI-074 and RHI-075 evidence.
- [ ] Confirm incident commander, deployment operator, and DNS operator availability.

## Cutover Steps (Execution in RHI-080)

1. Verify custom domain is already configured in GitHub Pages settings.
2. Verify TXT ownership record exists in DNS.
3. Apply `www` CNAME to `taurgis.github.io`.
4. Apply apex A and AAAA record set to GitHub Pages values.
5. Remove conflicting wildcard or stale `www` A/AAAA records.
6. Validate records from Cloudflare and Google public resolvers.
7. Validate production host response behavior and canonical host consolidation.
8. Keep monitoring until both resolvers are stable at target values.

## Validation Commands

### Required Resolver Checks

1. `dig @1.1.1.1 www.rhino-inquisitor.com CNAME +short`
2. `dig @8.8.8.8 www.rhino-inquisitor.com CNAME +short`
3. `dig @1.1.1.1 rhino-inquisitor.com A +short`
4. `dig @8.8.8.8 rhino-inquisitor.com A +short`
5. `dig @1.1.1.1 rhino-inquisitor.com AAAA +short`
6. `dig @8.8.8.8 rhino-inquisitor.com AAAA +short`
7. `dig _github-pages-challenge-<owner>.rhino-inquisitor.com TXT +short`
8. `curl -s -o /dev/null -w "%{http_code} %{redirect_url}" https://www.rhino-inquisitor.com/`

### Command Pre-Test Evidence (Current State)

Captured on 2026-03-17 UTC:

- `dig @1.1.1.1 www.rhino-inquisitor.com CNAME +short` -> no response (flattened at provider edge)
- `dig @8.8.8.8 www.rhino-inquisitor.com CNAME +short` -> no response (flattened at provider edge)
- `dig @1.1.1.1 rhino-inquisitor.com A +short` -> `104.21.15.73`, `172.67.161.237`
- `dig @8.8.8.8 rhino-inquisitor.com A +short` -> `172.67.161.237`, `104.21.15.73`
- `dig @1.1.1.1 rhino-inquisitor.com AAAA +short` -> `2606:4700:3033::ac43:a1ed`, `2606:4700:3031::6815:f49`
- `dig @8.8.8.8 rhino-inquisitor.com AAAA +short` -> `2606:4700:3033::ac43:a1ed`, `2606:4700:3031::6815:f49`
- `dig _github-pages-challenge-taurgis.rhino-inquisitor.com TXT +short` -> no response
- `curl -s -o /dev/null -w "%{http_code} %{redirect_url}" https://www.rhino-inquisitor.com/` -> `200`

## Propagation Monitoring and Decision Window

1. Use both `@1.1.1.1` and `@8.8.8.8` as independent resolver checks.
2. Treat DNS as converged only when both resolvers return expected targets for `www` and apex.
3. Expected stabilization under lowered TTL is usually short, but official guidance allows up to 24 hours.
4. If resolver mismatch persists beyond expected TTL windows, hold launch completion and evaluate rollback thresholds.

## DNS Rollback Record Set (Restore Baseline)

Rollback source of truth: `migration/phase-7-dns-snapshot.md`.

| Host | Type | Restore Values |
|------|------|----------------|
| `www.rhino-inquisitor.com` | `A` | `172.67.161.237`, `104.21.15.73` |
| `www.rhino-inquisitor.com` | `AAAA` | `2606:4700:3031::6815:f49`, `2606:4700:3033::ac43:a1ed` |
| `rhino-inquisitor.com` | `A` | `104.21.15.73`, `172.67.161.237` |
| `rhino-inquisitor.com` | `AAAA` | `2606:4700:3033::ac43:a1ed`, `2606:4700:3031::6815:f49` |

## Rollback Procedure

1. Trigger rollback if required resolver checks do not converge or if production host behavior is unsafe.
2. Restore baseline A/AAAA record values from rollback table.
3. Re-run resolver checks from Cloudflare and Google.
4. Confirm expected host behavior is restored.
5. Log rollback time, reason, and operator.

## Go/No-Go Criteria

### Go

- All hard preconditions are satisfied.
- Both resolvers return target DNS values.
- Production host behavior checks pass.

### No-Go / Hold

- Custom-domain or TXT ownership checks are unresolved.
- Resolver values are inconsistent across public resolvers.
- Release-candidate gates are not green.

### Rollback Evaluate

- Persistent resolver mismatch after wait threshold.
- Host behavior indicates unsafe serving state.
- HTTPS or host-consolidation checks fail at launch threshold.

## Open Blockers

1. GitHub Pages custom-domain settings validation requires repository settings access.
2. Domain verification TXT creation/confirmation requires DNS provider write access.
3. Wildcard and stale-record conflict audit requires DNS zone-level access.

## Related Files

- `analysis/tickets/phase-7/RHI-076-domain-dns-cutover-strategy.md`
- `analysis/plan/details/phase-7.md`
- `migration/phase-7-dns-snapshot.md`
- `analysis/documentation/phase-7/rhi-076-domain-dns-cutover-strategy-2026-03-17.md`
