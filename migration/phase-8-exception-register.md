# Phase 8 Exception Register

**Status:** In Progress  
**Ticket:** RHI-091  
**Last updated:** 2026-03-21

## Purpose

Track the current launch blockers, accepted launch warnings, and already-documented hosting limitations that the Phase 8 go/no-go decision must explicitly review.

## Current entries

| Gate or area | Risk level | Current state | Owner | Target resolution phase | Deviation description | Evidence |
|---|---|---|---|---|---|---|
| Final RC evidence rerun | `blocking` | Open | Thomas Theunen | RHI-091 | Manual `workflow_dispatch` run `23384070147` succeeded on `main@1fdbc19`, but the regenerated WS-H smoke and production-build checks still report `provenanceStatus: branch-state` because the frozen validation datasets remain pinned to `phase-8-rc-v2`. Final go/no-go evidence still requires a fresh RC-tagged dataset refresh or equivalent clean-RC provenance closure before this blocker can be closed. | `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23384070147`; `validation/preview-launch-readiness-report.json`; `validation/production-host-smoke-report.json`; `analysis/documentation/phase-8/rhi-091-clean-rerun-closeout-plan-2026-03-21.md` |
| Rollback drill | `blocking` | Closed 2026-03-21 | Thomas Theunen | RHI-091 | A verified-only Option B rollback drill was executed on 2026-03-21. The previous WordPress stack remained accessible on `https://www.rhino-inquisitor.com/`, trigger-to-confirmed-access time was recorded as `0` minutes, and the drill result was committed to the dedicated evidence file. No live DNS mutation was performed during the rehearsal, but that scope choice is documented as a non-blocking accepted deviation inside the drill result itself. | `migration/phase-8-rollback-drill-result.md`; `migration/phase-7-staging-rollback-runbook.md` |
| Apex HTTP consolidation | `warning` | Accepted in WS-G closeout | Thomas Theunen | Phase 9 | `http://rhino-inquisitor.com/` currently redirects to `https://rhino-inquisitor.com/` instead of the canonical `https://www.rhino-inquisitor.com/` host. | `validation/https-security-report.json` |
| Apex HTTPS consolidation | `warning` | Accepted in WS-G closeout | Thomas Theunen | Phase 9 | `https://rhino-inquisitor.com/` currently returns `200` instead of redirecting to `https://www.rhino-inquisitor.com/`. | `validation/https-security-report.json` |
| Origin security-header posture | `accepted` | Accepted in WS-G closeout | Thomas Theunen | Phase 9 | GitHub Pages origin hosting still lacks the full edge-managed security header posture. The current repository decision is to document the limitation and defer any edge-layer hardening to a post-launch phase. | `migration/phase-8-security-header-decision.md`; `validation/https-security-report.json` |

## Notes

- This register is a working Phase 8 draft, not the final signed launch exception package.
- Existing WS-G accepted warnings are carried forward exactly as recorded in the upstream ticket closeout and security report.
- The owner confirmed on 2026-03-21 that rollback still targets the previous WordPress stack and that a new RHI-091 decision record is required instead of reusing the 2026-03-20 bootstrap note.
- New entries should use the same explicit severity classes required by RHI-091: `blocking`, `warning`, and `accepted`.