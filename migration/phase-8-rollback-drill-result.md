# Phase 8 Rollback Drill Result

**Status:** Draft scaffold pending live drill execution  
**Ticket:** RHI-091

This file is a drill-result template only. Do not mark it as evidence until the rollback drill has been executed and every `PENDING_*` value below has been replaced with real observations.

> **Drill scope note:** This drill verifies that the rollback path to the previous WordPress stack is executable within the Phase 8 target window. The WordPress origin site must be confirmed accessible. Do not use this file to imply that a live production rollback has already been executed.

## Drill metadata

| Field | Value |
|---|---|
| Drill status | `PENDING_DRILL_STATUS` (`pass` / `partial` / `fail`) |
| Drill date | `PENDING_DRILL_DATE` |
| Operator | `PENDING_DRILL_OPERATOR` |
| Authorizing owner | Thomas Theunen |
| Active runbook | `migration/phase-7-staging-rollback-runbook.md` |
| Runbook commit or ref | `PENDING_RUNBOOK_COMMIT_OR_REF` |
| Rollback target | Previous WordPress stack (pre-migration origin site) |
| Drill scenario | `PENDING_DRILL_SCENARIO` |
| Rollback option exercised | `PENDING_ROLLBACK_OPTION` |
| DNS action taken | `PENDING_DNS_ACTION` (`modified` / `verified-only`) |
| Trigger declared at (UTC) | `PENDING_TRIGGER_TIMESTAMP_UTC` |
| WordPress confirmed accessible at (UTC) | `PENDING_CONFIRMATION_TIMESTAMP_UTC` |
| MTTR (minutes) | `PENDING_MTTR_MINUTES` |
| Target SLA | Within 60 minutes |
| SLA met | `PENDING_SLA_RESULT` (`yes` / `no`) |
| Drill outcome | `PENDING_DRILL_OUTCOME` |

## Trigger assumption

Record the failure pattern that triggered the drill. Use the same decision language as the rollback runbook.

- Trigger simulated: `PENDING_TRIGGER_DESCRIPTION`
- Source runbook threshold: `migration/phase-7-staging-rollback-runbook.md`

## WordPress accessibility confirmation

At minimum, confirm the homepage URL, the observed HTTP status, and the method used to verify reachability.

| Check | Value |
|---|---|
| WordPress URL checked | `PENDING_WORDPRESS_URL` |
| HTTP status observed | `PENDING_WORDPRESS_HTTP_STATUS` |
| Confirmation method | `PENDING_CONFIRMATION_METHOD` |
| Page title or equivalent confirmation | `PENDING_WORDPRESS_TITLE_CONFIRMATION` |
| Notes | `PENDING_WORDPRESS_CONFIRMATION_NOTES` |

## Drill steps executed

| Step | Action | Result | Actual time | Notes |
|---|---|---|---|---|
| 1 | Identify rollback trigger and confirm symptom on the active host | `PENDING_STEP_1_RESULT` | `PENDING_STEP_1_TIME` | `PENDING_STEP_1_NOTES` |
| 2 | Follow `migration/phase-7-staging-rollback-runbook.md` and declare the chosen rollback option | `PENDING_STEP_2_RESULT` | `PENDING_STEP_2_TIME` | `PENDING_STEP_2_NOTES` |
| 3 | Confirm the previous WordPress stack is reachable | `PENDING_STEP_3_RESULT` | `PENDING_STEP_3_TIME` | `PENDING_STEP_3_NOTES` |
| 4 | Confirm whether DNS was actually modified or only verified for drill scope | `PENDING_STEP_4_RESULT` | `PENDING_STEP_4_TIME` | `PENDING_STEP_4_NOTES` |
| 5 | Record elapsed time from trigger to confirmed WordPress accessibility | `PENDING_STEP_5_RESULT` | `PENDING_STEP_5_TIME` | `PENDING_STEP_5_NOTES` |
| 6 | Confirm no undocumented operational step was required | `PENDING_STEP_6_RESULT` | `PENDING_STEP_6_TIME` | `PENDING_STEP_6_NOTES` |

## Post-rollback smoke route set

Use the active priority route set when confirming that the fallback path is usable.

| Route class | Source | Result | Notes |
|---|---|---|---|
| Homepage | `validation/sample-matrix.json` | `PENDING_HOMEPAGE_RESULT` | `PENDING_HOMEPAGE_NOTES` |
| Privacy policy | `validation/sample-matrix.json` | `PENDING_PRIVACY_RESULT` | `PENDING_PRIVACY_NOTES` |
| robots.txt | `validation/sample-matrix.json` or live host | `PENDING_ROBOTS_RESULT` | `PENDING_ROBOTS_NOTES` |
| sitemap.xml | `validation/sample-matrix.json` or live host | `PENDING_SITEMAP_RESULT` | `PENDING_SITEMAP_NOTES` |
| Feed endpoint | `validation/robots-sitemap-report.json` | `PENDING_FEED_RESULT` | `PENDING_FEED_NOTES` |
| Priority route sample set | `validation/priority-routes.json` | `PENDING_PRIORITY_ROUTE_RESULT` | `PENDING_PRIORITY_ROUTE_NOTES` |

## Timing evidence

| Field | Value |
|---|---|
| Trigger declared at | `PENDING_TRIGGER_TIMESTAMP_UTC` |
| Rollback path initiated at | `PENDING_ROLLBACK_START_TIMESTAMP_UTC` |
| WordPress confirmed accessible at | `PENDING_CONFIRMATION_TIMESTAMP_UTC` |
| Elapsed time (minutes) | `PENDING_MTTR_MINUTES` |
| Target | 60 minutes |
| Target met | `PENDING_SLA_RESULT` |

## Blockers and deviations

| Blocker or deviation | Severity | Disposition | Owner note |
|---|---|---|---|
| `PENDING_BLOCKER_OR_DEVIATION_1` | `PENDING_SEVERITY` | `PENDING_DISPOSITION` | `PENDING_OWNER_NOTE` |

Use `blocking` when the drill could not prove the rollback path is usable. Use `accepted` only when the owner explicitly accepts the residual risk in writing.

## Friction and gaps

- `PENDING_FRICTION_OR_GAP_1`
- `PENDING_FRICTION_OR_GAP_2`

Record any runbook gaps or missing access assumptions here before the go/no-go meeting.

## Drill conclusion

`PENDING_DRILL_CONCLUSION`

**Signed by:** Thomas Theunen  
**Role:** Migration Owner  
**Signed at:** `PENDING_DRILL_SIGNOFF_DATE`