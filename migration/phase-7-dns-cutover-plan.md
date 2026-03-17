# Phase 7 DNS Cutover Plan

**Date:** 2026-03-17  
**Prepared by:** Engineering Owner  
**Ticket:** RHI-076  
**Status:** Done (staging validation complete; owner-confirmed provider-zone state and final sign-off recorded)

## Change Summary

This plan defines the staging-first DNS cutover strategy for validating `staging.rhino-inquisitor.com` on GitHub Pages before production cutover work. It includes staging target records, execution sequencing, validation commands, rollback, and go/no-go controls.

## Why This Changed

RHI-076 is a staging validation gate. Completing these steps on staging reduces production risk and creates a tested procedure for the final production cutover ticket.

## Behavior Details

### Previous Behavior

- Phase 7 had a DNS snapshot baseline in `migration/phase-7-dns-snapshot.md`.
- There was no staging-focused DNS cutover plan artifact with explicit execution controls.

### New Behavior

- This artifact now defines staging-only DNS sequencing, validation, rollback, and blocker handling.
- Production `www`/apex execution remains out of scope for RHI-076 and is deferred to a final production cutover ticket.

## Scope

In scope:

1. DNS target record strategy for `staging.rhino-inquisitor.com`.
2. GitHub Pages custom-domain and TXT verification preconditions for staging.
3. T-24 checklist and validation commands for staging cutover execution.
4. Staging rollback procedure.

Out of scope:

1. Production `www.rhino-inquisitor.com` and apex DNS execution.
2. Production HTTPS enforcement execution (covered in follow-up tickets after staging sign-off).
3. CDN/edge configuration changes outside DNS/provider controls.

## Hard Preconditions Before Any Staging DNS Change

1. Preview-host rehearsal evidence is complete and approved.
2. Release-candidate CI gate suite is green on the final content snapshot.
3. GitHub Pages settings are prepared for staging custom-domain setup before DNS mutation.
4. Domain verification TXT prerequisite assessed: existing account-level domain verification for rhino-inquisitor.com satisfies ownership prerequisite; staging-specific `_github-pages-challenge-<owner>.staging.rhino-inquisitor.com` TXT is required only if GitHub Pages UI explicitly demands it when staging custom domain is entered in Pages settings.
5. Incident commander, deployment operator, and DNS operator are assigned for the staging window.

## Current DNS State Baseline (Staging)

Validated on 2026-03-17 UTC.

### Observed Current Answers

- `dig @1.1.1.1 staging.rhino-inquisitor.com CNAME +short` -> no direct CNAME answer
- `dig @8.8.8.8 staging.rhino-inquisitor.com CNAME +short` -> no direct CNAME answer
- `dig @1.1.1.1 staging.rhino-inquisitor.com A +short` -> `172.67.161.237`, `104.21.15.73`
- `dig @8.8.8.8 staging.rhino-inquisitor.com A +short` -> `172.67.161.237`, `104.21.15.73`
- `dig @1.1.1.1 staging.rhino-inquisitor.com AAAA +short` -> `2606:4700:3033::ac43:a1ed`, `2606:4700:3031::6815:f49`
- `dig @8.8.8.8 staging.rhino-inquisitor.com AAAA +short` -> `2606:4700:3031::6815:f49`, `2606:4700:3033::ac43:a1ed`
- `dig _github-pages-challenge-taurgis.staging.rhino-inquisitor.com TXT +short` -> no answer
- `curl -s -o /dev/null -w "%{http_code} %{redirect_url}" https://staging.rhino-inquisitor.com/` -> `200`

## Target DNS Record Set for Staging Cutover

Reference source (official): GitHub Pages custom-domain documentation.

| Host | Type | Target Value | Notes |
|------|------|--------------|-------|
| `staging.rhino-inquisitor.com` | `CNAME` | `taurgis.github.io` | Must point to `<owner>.github.io` (no repository suffix). |
| `_github-pages-challenge-taurgis.staging.rhino-inquisitor.com` | `TXT` | `<value from GitHub domain verification UI>` | Conditional: add only if GitHub Pages UI explicitly demands it when staging custom domain is entered; account-level domain verification for rhino-inquisitor.com satisfies ownership prerequisite. |

### Conflict Controls

1. No wildcard DNS record may shadow `staging.rhino-inquisitor.com`.
2. No stale `staging` A/AAAA records should remain if staging is configured as CNAME.
3. Do not point staging CNAME to apex; point directly to `<owner>.github.io`.

## TTL Management Plan

1. Set staging record TTL to `300` seconds (or provider minimum) at least 24 hours before execution.
2. Record previous TTL values and timestamp in the Progress Log.
3. If provider minimum TTL is above `300`, extend preparation lead time.

## T-24 Checklist (Staging)

- [ ] Confirm staging custom domain is configured in GitHub Pages settings.
- [ ] If GitHub Pages UI shows a new TXT challenge when staging custom domain is entered, confirm token and add `_github-pages-challenge-taurgis.staging.rhino-inquisitor.com`; otherwise this step is satisfied by existing account-level domain verification.
- [ ] Set/confirm staging DNS TTL target.
- [ ] Re-run release-candidate CI and confirm all required gates pass.
- [ ] Confirm operator availability and rollback authority.

## Cutover Steps (Staging Validation)

1. Configure staging custom domain in GitHub Pages settings first.
2. If GitHub Pages UI demanded a staging-specific TXT challenge after Step 1, create `_github-pages-challenge-<owner>.staging.rhino-inquisitor.com` TXT record (conditional: account-level domain verification for rhino-inquisitor.com may satisfy this without a new record).
3. Apply `staging.rhino-inquisitor.com` CNAME to `<owner>.github.io`.
4. Validate record convergence from Cloudflare and Google resolvers.
5. Validate staging host response behavior and canonical signals.
6. Record evidence and sign-off before production ticket proceeds.

## Validation Commands

### Required Checks

1. `dig @1.1.1.1 staging.rhino-inquisitor.com CNAME +short`
2. `dig @8.8.8.8 staging.rhino-inquisitor.com CNAME +short`
3. `dig @1.1.1.1 staging.rhino-inquisitor.com A +short`
4. `dig @8.8.8.8 staging.rhino-inquisitor.com A +short`
5. `dig @1.1.1.1 staging.rhino-inquisitor.com AAAA +short`
6. `dig @8.8.8.8 staging.rhino-inquisitor.com AAAA +short`
7. `dig _github-pages-challenge-taurgis.staging.rhino-inquisitor.com TXT +short`
8. `curl -s -o /dev/null -w "%{http_code} %{redirect_url}" https://staging.rhino-inquisitor.com/`

### Notes on CNAME Visibility

If DNS proxy/flattening is enabled at the provider, direct CNAME output may be empty even when staging resolves correctly. In that case, convergence must be judged by resolver A/AAAA behavior plus host-response checks and provider-zone confirmation.

## Propagation Monitoring and Decision Window

1. Use both `@1.1.1.1` and `@8.8.8.8` as independent resolver checks.
2. Treat staging as converged when resolver behavior and host checks are stable and consistent with target configuration.
3. Expect variability based on provider proxy/flattening behavior.
4. If mismatch persists beyond expected windows, hold sign-off and evaluate rollback.

## DNS Rollback Record Set (Staging)

| Host | Type | Restore Action |
|------|------|----------------|
| `staging.rhino-inquisitor.com` | `CNAME` | Remove or restore previous value |
| `_github-pages-challenge-taurgis.staging.rhino-inquisitor.com` | `TXT` | Keep in place to preserve GitHub domain verification protection |

## Rollback Procedure (Staging)

1. Trigger rollback on unresolved convergence or unsafe staging behavior.
2. Remove/revert staging CNAME to pre-cutover state.
3. Re-run resolver checks.
4. Confirm staging host behavior matches rollback expectation.
5. Record rollback timestamp, reason, and owner.

## Go/No-Go Criteria (Staging)

### Go

- All hard preconditions are satisfied.
- Resolver and host checks are consistent.
- Staging canonical/metadata checks pass.

### No-Go / Hold

- Custom-domain DNS checks are unresolved or Pages custom-domain entry shows a blocking error.
- Resolver behavior is inconsistent or unstable.
- Required gate suite is not green.

### Rollback Evaluate

- Persistent resolver mismatch after wait threshold.
- Staging host behavior is unsafe or inconsistent with expected artifact.

## Open Blockers

None. Provider-zone confirmation and final engineering sign-off were recorded during RHI-076 closeout on 2026-03-17.

## Related Files

- `analysis/tickets/phase-7/RHI-076-domain-dns-cutover-strategy.md`
- `analysis/plan/details/phase-7.md`
- `migration/phase-7-dns-snapshot.md`
- `analysis/documentation/phase-7/rhi-076-domain-dns-cutover-strategy-2026-03-17.md`
