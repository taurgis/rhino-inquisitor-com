# Phase 8 Exception Register

**Status:** In Progress  
**Ticket:** RHI-091  
**Last updated:** 2026-03-21

## Purpose

Track the current launch blockers, accepted launch warnings, and already-documented hosting limitations that the Phase 8 go/no-go decision must explicitly review.

## Current entries

| Gate or area | Risk level | Current state | Owner | Target resolution phase | Deviation description | Evidence |
|---|---|---|---|---|---|---|
| Final RC evidence rerun | `blocking` | Open | Thomas Theunen | RHI-091 | Several current Phase 8 reports, including the new WS-H smoke and production-build checks, are branch-state evidence instead of clean frozen-RC reruns. The owner requires a clean rerun on the frozen RC basis, but the new WS-H scripts are not present on `phase-8-rc-v2`, so final WS-H evidence needs a post-merge clean snapshot or equivalent rerun plan before go/no-go can move forward. | `validation/preview-launch-readiness-report.json`; `validation/production-host-smoke-report.json`; `validation/seo-consistency-report.json`; `validation/accessibility-axe-report.json`; `validation/html-conformance-report.json`; `validation/https-security-report.json`; `git cat-file -e phase-8-rc-v2:scripts/phase-8/check-preview-launch-readiness.js` |
| Rollback drill | `blocking` | Open | Thomas Theunen | RHI-091 | The rollback runbook exists and remains the required path, but no timed Phase 8 rollback drill result has been committed yet. Go/no-go cannot move to `Go` until the drill is executed or an owner-approved equivalent fallback is documented. | `migration/phase-7-staging-rollback-runbook.md`; `analysis/tickets/phase-8/RHI-091-operational-readiness-go-nogo.md` |
| Apex HTTP consolidation | `warning` | Accepted in WS-G closeout | Thomas Theunen | Phase 9 | `http://rhino-inquisitor.com/` currently redirects to `https://rhino-inquisitor.com/` instead of the canonical `https://www.rhino-inquisitor.com/` host. | `validation/https-security-report.json` |
| Apex HTTPS consolidation | `warning` | Accepted in WS-G closeout | Thomas Theunen | Phase 9 | `https://rhino-inquisitor.com/` currently returns `200` instead of redirecting to `https://www.rhino-inquisitor.com/`. | `validation/https-security-report.json` |
| Origin security-header posture | `accepted` | Accepted in WS-G closeout | Thomas Theunen | Phase 9 | GitHub Pages origin hosting still lacks the full edge-managed security header posture. The current repository decision is to document the limitation and defer any edge-layer hardening to a post-launch phase. | `migration/phase-8-security-header-decision.md`; `validation/https-security-report.json` |

## Notes

- This register is a working Phase 8 draft, not the final signed launch exception package.
- Existing WS-G accepted warnings are carried forward exactly as recorded in the upstream ticket closeout and security report.
- The owner confirmed on 2026-03-21 that rollback still targets the previous WordPress stack and that a new RHI-091 decision record is required instead of reusing the 2026-03-20 bootstrap note.
- New entries should use the same explicit severity classes required by RHI-091: `blocking`, `warning`, and `accepted`.