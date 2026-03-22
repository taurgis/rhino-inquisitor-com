# Phase 8 Exception Register

**Status:** Closed for final Phase 8 decision  
**Ticket:** RHI-091  
**Last updated:** 2026-03-22

## Purpose

Track the current launch blockers, accepted launch warnings, and already-documented hosting limitations that the Phase 8 go/no-go decision must explicitly review.

## Current entries

| Gate or area | Risk level | Current state | Owner | Target resolution phase | Deviation description | Evidence |
|---|---|---|---|---|---|---|
| Final RC evidence rerun | `blocking` | Closed 2026-03-22 | Thomas Theunen | RHI-091 | An isolated `phase-8-rc-v3` tag was cut and corrected to commit `576709fd6217653446e8c8e031ebad705668c36e`. The superseded first rerun `23397686845` failed because the initial RC v3 sample matrix was regenerated before a production build existed, which dropped the required article selection. After rebuilding the datasets from a temp Hugo production output and rerunning `workflow_dispatch` as `23397825399`, the final RC build job passed and the WS-H production and preview reports were regenerated with `provenanceStatus: frozen-rc`. | `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23397686845`; `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23397825399`; `validation/production-host-smoke-report.json`; `validation/preview-launch-readiness-report.json`; `migration/phase-8-rc-v3-record.md` |
| Final RC preview deployment | `blocking` | Closed 2026-03-22 | Thomas Theunen | RHI-091 | The corrected RC rerun `23397825399` exposed a `github-pages` environment protection-rule gap: the environment allowed only `main`, so tag `phase-8-rc-v3` was rejected before deploy steps started. After adding a matching tag policy for `phase-8-rc-v3`, rerun `23398112474` completed successfully and GitHub recorded deployment `4139450958` for `http://staging.rhino-inquisitor.com/`. | `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23397825399`; `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23398112474`; `migration/phase-8-rc-v3-record.md`; `validation/preview-launch-readiness-report.json` |
| Rollback drill | `blocking` | Closed 2026-03-21 | Thomas Theunen | RHI-091 | A verified-only Option B rollback drill was executed on 2026-03-21. The previous WordPress stack remained accessible on `https://www.rhino-inquisitor.com/`, trigger-to-confirmed-access time was recorded as `0` minutes, and the drill result was committed to the dedicated evidence file. No live DNS mutation was performed during the rehearsal, but that scope choice is documented as a non-blocking accepted deviation inside the drill result itself. | `migration/phase-8-rollback-drill-result.md`; `migration/phase-7-staging-rollback-runbook.md` |
| Apex HTTP consolidation | `warning` | Accepted in WS-G closeout | Thomas Theunen | Phase 9 | `http://rhino-inquisitor.com/` currently redirects to `https://rhino-inquisitor.com/` instead of the canonical `https://www.rhino-inquisitor.com/` host. | `validation/https-security-report.json` |
| Apex HTTPS consolidation | `warning` | Accepted in WS-G closeout | Thomas Theunen | Phase 9 | `https://rhino-inquisitor.com/` currently returns `200` instead of redirecting to `https://www.rhino-inquisitor.com/`. | `validation/https-security-report.json` |
| Origin security-header posture | `accepted` | Accepted in WS-G closeout | Thomas Theunen | Phase 9 | GitHub Pages origin hosting still lacks the full edge-managed security header posture. The current repository decision is to document the limitation and defer any edge-layer hardening to a post-launch phase. | `migration/phase-8-security-header-decision.md`; `validation/https-security-report.json` |

## Notes

- This register is the final Phase 8 exception basis used by the 2026-03-22 Go decision.
- All `blocking` entries were resolved before sign-off.
- Existing WS-G accepted warnings are carried forward exactly as recorded in the upstream ticket closeout and security report.
- The owner confirmed on 2026-03-21 that rollback still targets the previous WordPress stack and that a new RHI-091 decision record is required instead of reusing the 2026-03-20 bootstrap note.
- New entries should use the same explicit severity classes required by RHI-091: `blocking`, `warning`, and `accepted`.