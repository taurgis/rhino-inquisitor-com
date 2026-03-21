# Cutover Verification Checklist

**Status:** Draft template for final RHI-091 closeout  
**Ticket:** RHI-091  
**Target completion window:** T-24h before final go/no-go decision  
**RC tag:** `PENDING_FINAL_RC_TAG`  
**RC commit:** `PENDING_FINAL_RC_SHA`  
**Final workflow run URL:** `PENDING_FINAL_WORKFLOW_RUN_URL`

Do not mark this checklist complete until the final clean evidence run exists and `migration/phase-8-rollback-drill-result.md` is committed.

## Completion record

| Role | Name | Signed | Date |
|---|---|---|---|
| Engineering Owner | Thomas Theunen | `pending` | `PENDING_T_MINUS_24H_DATE` |
| SEO Owner | Thomas Theunen | `pending` | `PENDING_T_MINUS_24H_DATE` |
| Incident Commander | Thomas Theunen | `pending` | `PENDING_T_MINUS_24H_DATE` |

## DNS and HTTPS

- [ ] Confirm the intended final workflow run completed successfully and the `github-pages` deployment URL is recorded.
- [ ] Confirm the Pages environment deployment record matches `PENDING_FINAL_RC_SHA`.
- [ ] Confirm the target HTTPS host responds with the expected status.
- [ ] Confirm the current DNS target state matches the planned release state.
- [ ] Confirm any accepted apex-host warning remains unchanged from `validation/https-security-report.json` and is reflected in the final decision record.

| Role | Name | Signed | Date |
|---|---|---|---|
| Engineering Owner | Thomas Theunen | `pending` | `PENDING_T_MINUS_24H_DATE` |
| SEO Owner | Thomas Theunen | `pending` | `PENDING_T_MINUS_24H_DATE` |
| Incident Commander | Thomas Theunen | `pending` | `PENDING_T_MINUS_24H_DATE` |

## Host and Canonical Behavior

- [ ] Confirm `validation/production-host-smoke-report.json` was regenerated from the clean final RC basis.
- [ ] Confirm the production-build cleanliness report shows zero preview-host leakage.
- [ ] Confirm the production-build cleanliness report shows zero unexpected `noindex` on indexable routes.
- [ ] Confirm the live rehearsal-host smoke report shows the expected preview-host canonical and `noindex` behavior.
- [ ] Confirm any accepted host-consolidation warnings are carried into the final decision record and not treated as new blockers.

| Role | Name | Signed | Date |
|---|---|---|---|
| Engineering Owner | Thomas Theunen | `pending` | `PENDING_T_MINUS_24H_DATE` |
| SEO Owner | Thomas Theunen | `pending` | `PENDING_T_MINUS_24H_DATE` |
| Incident Commander | Thomas Theunen | `pending` | `PENDING_T_MINUS_24H_DATE` |

## Priority URL Smoke Tests

- [ ] Confirm `migration/phase-8-smoke-test-results.md` reflects the final clean live smoke run.
- [ ] Confirm homepage, top 3 recent posts, top 3 category pages, archive, and privacy route all pass.
- [ ] Confirm the preview entrypoint redirect chain is recorded explicitly.
- [ ] Confirm the single available priority redirect sample from `validation/priority-routes.json` still resolves to the expected effective destination.
- [ ] Confirm no new smoke-route regressions were introduced between the clean rerun and the go/no-go meeting.

| Role | Name | Signed | Date |
|---|---|---|---|
| Engineering Owner | Thomas Theunen | `pending` | `PENDING_T_MINUS_24H_DATE` |
| SEO Owner | Thomas Theunen | `pending` | `PENDING_T_MINUS_24H_DATE` |
| Incident Commander | Thomas Theunen | `pending` | `PENDING_T_MINUS_24H_DATE` |

## Sitemap and Robots Reachability

- [ ] Confirm sitemap endpoint responds with HTTP `200` and parseable XML.
- [ ] Confirm robots.txt responds with HTTP `200` and the expected `Sitemap:` directive.
- [ ] Confirm the feed endpoint remains reachable and parseable.
- [ ] Confirm sitemap and robots host values are aligned with the intended host state for the final decision window.
- [ ] Confirm the final workflow run URL is recorded in `LAUNCH-GATE-PASS-SUMMARY.md` for the same evidence basis.

| Role | Name | Signed | Date |
|---|---|---|---|
| Engineering Owner | Thomas Theunen | `pending` | `PENDING_T_MINUS_24H_DATE` |
| SEO Owner | Thomas Theunen | `pending` | `PENDING_T_MINUS_24H_DATE` |
| Incident Commander | Thomas Theunen | `pending` | `PENDING_T_MINUS_24H_DATE` |

## Rollback Readiness

- [ ] Confirm `migration/phase-8-rollback-drill-result.md` exists and records the final rollback drill.
- [ ] Confirm the rollback target is the previous WordPress stack.
- [ ] Confirm the measured rollback time is recorded and within the ticket threshold, or that any overage is explicitly dispositioned.
- [ ] Confirm `migration/phase-7-staging-rollback-runbook.md` remains the active rollback runbook of record.
- [ ] Confirm the final exception register shows zero open `blocking` entries.

| Role | Name | Signed | Date |
|---|---|---|---|
| Engineering Owner | Thomas Theunen | `pending` | `PENDING_T_MINUS_24H_DATE` |
| SEO Owner | Thomas Theunen | `pending` | `PENDING_T_MINUS_24H_DATE` |
| Incident Commander | Thomas Theunen | `pending` | `PENDING_T_MINUS_24H_DATE` |