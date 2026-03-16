# Phase 7 DNS Snapshot

**Date:** 2026-03-16  
**Captured by:** Migration Owner (Thomas Theunen)

## Change Summary

This snapshot records the current public DNS state for `rhino-inquisitor.com` before any Phase 7 cutover work. It captures the live answers and TTL values needed for bootstrap, rollback planning, and later DNS-diff review.

## Why This Changed

RHI-073 requires a committed DNS snapshot before Phase 7 deployment and cutover work begins. The repository did not yet contain a Phase 7 DNS baseline artefact.

## Behavior Details

Old behavior:

- Phase 7 had no committed DNS baseline for the current production host state.
- Later DNS planning would have had to rely on ad hoc terminal history instead of a shared artefact.

New behavior:

- The current public DNS answers and TTLs are recorded in a committed markdown snapshot.
- The snapshot explicitly notes that `www` currently exposes flattened A and AAAA answers rather than a public CNAME response.

## Public DNS Answers

Resolver used: `@1.1.1.1`

### `www.rhino-inquisitor.com` CNAME

- No public CNAME answer returned.
- Current public behavior is flattened to A and AAAA answers.

### `www.rhino-inquisitor.com` A

| Name | TTL | Type | Value |
|------|-----|------|-------|
| `www.rhino-inquisitor.com.` | `300` | `A` | `172.67.161.237` |
| `www.rhino-inquisitor.com.` | `300` | `A` | `104.21.15.73` |

### `www.rhino-inquisitor.com` AAAA

| Name | TTL | Type | Value |
|------|-----|------|-------|
| `www.rhino-inquisitor.com.` | `300` | `AAAA` | `2606:4700:3031::6815:f49` |
| `www.rhino-inquisitor.com.` | `300` | `AAAA` | `2606:4700:3033::ac43:a1ed` |

### `rhino-inquisitor.com` A

| Name | TTL | Type | Value |
|------|-----|------|-------|
| `rhino-inquisitor.com.` | `300` | `A` | `104.21.15.73` |
| `rhino-inquisitor.com.` | `300` | `A` | `172.67.161.237` |

### `rhino-inquisitor.com` AAAA

| Name | TTL | Type | Value |
|------|-----|------|-------|
| `rhino-inquisitor.com.` | `300` | `AAAA` | `2606:4700:3033::ac43:a1ed` |
| `rhino-inquisitor.com.` | `300` | `AAAA` | `2606:4700:3031::6815:f49` |

## Impact

- Phase 7 now has a committed pre-cutover DNS baseline for rollback comparison.
- The current TTL baseline of `300` seconds is documented for both `www` and apex answers.
- Future DNS-cutover docs can reference this snapshot instead of reconstructing the starting state.

## Verification

Commands executed on 2026-03-16:

1. `dig @1.1.1.1 www.rhino-inquisitor.com CNAME +nocmd +noall +answer`
2. `dig @1.1.1.1 www.rhino-inquisitor.com A +nocmd +noall +answer`
3. `dig @1.1.1.1 www.rhino-inquisitor.com AAAA +nocmd +noall +answer`
4. `dig @1.1.1.1 rhino-inquisitor.com A +nocmd +noall +answer`
5. `dig @1.1.1.1 rhino-inquisitor.com AAAA +nocmd +noall +answer`

## Related Files

- `analysis/tickets/phase-7/RHI-073-phase-7-bootstrap.md`
- `analysis/documentation/phase-7/rhi-073-phase-7-bootstrap-readiness-2026-03-16.md`
- `analysis/plan/details/phase-7.md`
