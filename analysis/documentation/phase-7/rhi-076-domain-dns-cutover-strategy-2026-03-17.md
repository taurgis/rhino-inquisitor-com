# RHI-076 — Domain and DNS Cutover Strategy

**Date:** 2026-03-17  
**Phase:** 7  
**Ticket:** RHI-076  
**Status:** In Progress  
**Author:** Engineering Owner

---

## Change Summary

Added the Phase 7 DNS cutover plan artifact for GitHub Pages custom-domain launch readiness at `migration/phase-7-dns-cutover-plan.md`. The plan documents target DNS records, ordering controls, validation commands, propagation checks, rollback records, and T-24 operational checklist items.

---

## Why This Changed

RHI-076 requires a dry-run validated DNS strategy before launch-window execution. The repository had a DNS snapshot baseline from RHI-073 but did not yet have an execution-ready cutover plan for Workstream C.

---

## Behavior Details

### Before

- Phase 7 had a baseline DNS snapshot (`migration/phase-7-dns-snapshot.md`) but no dedicated cutover plan artifact.
- DNS cutover sequencing, command pack, and rollback details were only described at ticket level.

### After

- `migration/phase-7-dns-cutover-plan.md` now defines:
  - current-state baseline reference and rollback set
  - target GitHub Pages record model (A, AAAA, CNAME, TXT)
  - hard sequencing guardrails (Pages settings first, DNS second)
  - resolver validation commands and current-state command evidence
  - T-24 checklist, go/no-go criteria, and rollback procedure
- The plan explicitly blocks live DNS execution until preview rehearsal and Phase 8 readiness preconditions are satisfied.

---

## Impact

- Workstream C now has a committed execution-ready DNS strategy document for downstream launch runbook work (RHI-080).
- DNS control-plane actions that require external access are explicitly tracked as blockers instead of assumed complete.
- Ticket evidence quality improved by including tested command set outputs for both Cloudflare and Google public resolvers.

---

## Verification

1. Confirmed new artifact exists: `migration/phase-7-dns-cutover-plan.md`.
2. Verified ticket acceptance coverage by mapping plan sections to RHI-076 checklist requirements.
3. Ran required command pack against current DNS state on 2026-03-17:
  - `dig @1.1.1.1 www.rhino-inquisitor.com CNAME +short`
  - `dig @8.8.8.8 www.rhino-inquisitor.com CNAME +short`
  - `dig @1.1.1.1 rhino-inquisitor.com A +short`
  - `dig @8.8.8.8 rhino-inquisitor.com A +short`
  - `dig @1.1.1.1 rhino-inquisitor.com AAAA +short`
  - `dig @8.8.8.8 rhino-inquisitor.com AAAA +short`
  - `dig _github-pages-challenge-taurgis.rhino-inquisitor.com TXT +short`
  - `curl -s -o /dev/null -w "%{http_code} %{redirect_url}" https://www.rhino-inquisitor.com/`
4. Confirmed blockers remain for Pages settings and DNS-provider write operations.

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
- Assumes DNS provider allows the intended apex model and does not enforce incompatible flattening behavior.
- Open: execution-time TXT token value from `_github-pages-challenge-<owner>` UI prompt is still pending external access.
