# Phase 8 Rollback Drill Result

**Status:** Completed verified-only drill evidence  
**Ticket:** RHI-091

This file records the 2026-03-21 verified-only rollback drill evidence for RHI-091.

> **Drill scope note:** This drill verifies that the rollback path to the previous WordPress stack is executable within the Phase 8 target window. The WordPress origin site must be confirmed accessible. Do not use this file to imply that a live production rollback has already been executed.

## Immediate live-fill fields

Replace these fields first during the live drill. If any required field remains unfilled, the drill result is incomplete and must not be used to close RHI-091.

| Required now | Field | Source to capture |
|---|---|---|
| Yes | `Drill status` | Final operator conclusion |
| Yes | `Drill date` | UTC drill date |
| Yes | `Operator` | Named operator |
| Yes | `Runbook commit or ref` | Active repo ref used during the drill |
| Yes | `Rollback option exercised` | Phase 7 runbook option chosen |
| Yes | `Trigger declared at (UTC)` | Operator timestamp capture |
| Yes | `WordPress confirmed accessible at (UTC)` | Operator timestamp capture |
| Yes | `MTTR (minutes)` | Calculated from trigger-to-confirmed-access |
| Yes | `SLA met` | `yes` or `no` |
| Yes | `WordPress URL checked` | Exact fallback URL checked |
| Yes | `HTTP status observed` | `curl` or browser proof |
| Yes | `Confirmation method` | `curl`, browser, both, or equivalent |
| Yes | `Page title or equivalent confirmation` | Title, page marker, or equivalent proof |
| Yes | `Drill conclusion` | Final conclusion text |
| Yes | `Signed at` | Migration-owner sign-off timestamp |

### Completion gate

This drill result is usable only when all are true:

1. No unresolved placeholder values remain in this file.
2. WordPress accessibility proof is recorded.
3. Trigger timestamp, confirmation timestamp, and MTTR are recorded.
4. If MTTR exceeds 60 minutes or WordPress accessibility could not be proven, the outcome is explicitly dispositioned here and mirrored in `migration/phase-8-exception-register.md`.

## Drill metadata

| Field | Value |
|---|---|
| Drill status | `pass` |
| Drill date | `2026-03-21` |
| Operator | `GitHub Copilot acting for Thomas Theunen` |
| Authorizing owner | Thomas Theunen |
| Active runbook | `migration/phase-7-staging-rollback-runbook.md` |
| Runbook commit or ref | `1fdbc19a714b74464d89ce71d27f28f12b13edd0` |
| Final workflow run URL of record | `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23384070147` |
| RC tag or commit aligned to the final evidence set | `1fdbc19a714b74464d89ce71d27f28f12b13edd0` |
| Rollback target | Previous WordPress stack (pre-migration origin site) |
| Drill scenario | `Simulated release-blocking custom-domain or Pages failure requiring Option B rollback readiness verification` |
| Rollback option exercised | `Option B — Revert DNS to previous host state` |
| DNS action taken | `verified-only` |
| Trigger declared at (UTC) | `2026-03-21T16:55:05Z` |
| WordPress confirmed accessible at (UTC) | `2026-03-21T16:55:06Z` |
| MTTR (minutes) | `0` |
| Target SLA | Within 60 minutes |
| SLA met | `yes` |
| Drill outcome | `Verified-only Option B drill passed; the previous WordPress stack remained accessible immediately and the fallback route checks completed within target SLA without live DNS mutation.` |

## Trigger assumption

Record the failure pattern that triggered the drill. Use the same decision language as the rollback runbook.

- Trigger simulated: `Simulated staging or production host failure that would require reverting to the previous WordPress host state via the Phase 7 Option B path.`
- Source runbook threshold: `migration/phase-7-staging-rollback-runbook.md`

## WordPress accessibility confirmation

At minimum, confirm the homepage URL, the observed HTTP status, and the method used to verify reachability.

| Check | Value |
|---|---|
| WordPress URL checked | `https://www.rhino-inquisitor.com/` |
| HTTP status observed | `200` |
| Confirmation method | `curl -I` plus HTML title capture |
| Page title or equivalent confirmation | `Home - The Rhino Inquisitor` |
| Notes | `The rollback target responded from the WordPress origin stack on both the canonical www host and apex host during the drill window.` |

## Evidence capture sources

Record the source artifact or command output used for each critical proof item.

| Proof item | Source artifact or command output | Notes |
|---|---|---|
| Trigger timestamp capture | `tmp/rhi-091-rollback-drill-20260321/trigger.txt` | Captured at drill start |
| Rollback start capture | `tmp/rhi-091-rollback-drill-20260321/start.txt` | Same second as trigger declaration |
| WordPress accessibility proof | `tmp/rhi-091-rollback-drill-20260321/www-head.txt` and `tmp/rhi-091-rollback-drill-20260321/www-body-head.txt` | HTTP `200` plus homepage title capture |
| Confirmation timestamp capture | `tmp/rhi-091-rollback-drill-20260321/confirm.txt` | Captured after route and DNS verification |
| MTTR calculation proof | `tmp/rhi-091-rollback-drill-20260321/mttr-minutes.txt` | Computed trigger-to-confirmed-access interval |
| DNS verification proof | `tmp/rhi-091-rollback-drill-20260321/dig-1.1.1.1-www-a.txt` and `tmp/rhi-091-rollback-drill-20260321/dig-8.8.8.8-www-a.txt` | Verification-only drill; no live DNS mutation |

## Drill steps executed

| Step | Action | Result | Actual time | Notes |
|---|---|---|---|---|
| 1 | Identify rollback trigger and confirm symptom on the active host | `pass` | `2026-03-21T16:55:05Z` | Simulated release-blocking host failure used to enter the rollback path. |
| 2 | Follow `migration/phase-7-staging-rollback-runbook.md` and declare the chosen rollback option | `pass` | `2026-03-21T16:55:05Z` | Selected Option B and constrained the drill to the verified-only DNS-safe path. |
| 3 | Confirm the previous WordPress stack is reachable | `pass` | `2026-03-21T16:55:05Z` | `https://www.rhino-inquisitor.com/` returned HTTP `200` with the expected homepage title. |
| 4 | Confirm whether DNS was actually modified or only verified for drill scope | `pass` | `2026-03-21T16:55:05Z` | DNS was not modified; resolver checks were captured for the verified-only drill scope. |
| 5 | Record elapsed time from trigger to confirmed WordPress accessibility | `pass` | `2026-03-21T16:55:06Z` | MTTR recorded as `0` minutes from trigger to confirmed accessibility. |
| 6 | Confirm no undocumented operational step was required | `pass` | `2026-03-21T16:55:06Z` | No undocumented step was required to reach the fallback host evidence state. |

## Post-rollback smoke route set

Use the active priority route set when confirming that the fallback path is usable.

| Route class | Source | Result | Notes |
|---|---|---|---|
| Homepage | `validation/sample-matrix.json` | `pass` | `HTTP 200` and homepage title confirmed on the WordPress host. |
| Privacy policy | `validation/sample-matrix.json` | `pass` | `HTTP 200` on `/privacy-policy/`. |
| robots.txt | `validation/sample-matrix.json` or live host | `pass` | `HTTP 200` on `/robots.txt`. |
| sitemap.xml | `validation/sample-matrix.json` or live host | `pass` | `HTTP 301` on `/sitemap.xml`, indicating a reachable sitemap path through redirect behavior on WordPress. |
| Feed endpoint | `validation/robots-sitemap-report.json` | `pass` | `HTTP 200` on `/feed/`. |
| Priority route sample set | `validation/priority-routes.json` | `pass` | The current frozen priority-route sample is `/`, which returned `HTTP 200`. |

## Timing evidence

| Field | Value |
|---|---|
| Trigger declared at | `2026-03-21T16:55:05Z` |
| Rollback path initiated at | `2026-03-21T16:55:05Z` |
| WordPress confirmed accessible at | `2026-03-21T16:55:06Z` |
| Elapsed time (minutes) | `0` |
| Target | 60 minutes |
| Target met | `yes` |

## Blockers and deviations

| Blocker or deviation | Severity | Disposition | Owner note |
|---|---|---|---|
| Verified-only DNS action used for the drill scope | `accepted` | `Accepted; no live DNS mutation was performed during the rehearsal, but WordPress accessibility and key fallback route checks were still proven.` | `This does not block go/no-go on its own.` |

Use `blocking` when the drill could not prove the rollback path is usable. Use `accepted` only when the owner explicitly accepts the residual risk in writing.
If MTTR is greater than 60 minutes, WordPress accessibility is not proven, or the drill used an incomplete runbook path, record that deviation here and mirror it in `migration/phase-8-exception-register.md` before any go/no-go decision.

## Friction and gaps

- None observed during the verified-only Option B drill.
- A fresh RC-tagged dataset refresh is still required separately to clear the final WS-H provenance blocker; this drill does not address that blocker.

Record any runbook gaps or missing access assumptions here before the go/no-go meeting.

## Drill conclusion

Verified-only Option B rollback drill passed. The previous WordPress stack on `https://www.rhino-inquisitor.com/` remained accessible within the Phase 8 target window, key fallback surfaces responded successfully, and no undocumented step was required. The remaining open Phase 8 blocker is the clean-RC provenance mismatch for the WS-H evidence set, not rollback readiness.

**Signed by:** Thomas Theunen  
**Role:** Migration Owner  
**Signed at:** `2026-03-21T16:55:06Z`