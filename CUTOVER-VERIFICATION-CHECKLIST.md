# Cutover Verification Checklist

**Status:** Completed in the final single-owner decision window  
**Ticket:** RHI-091  
**Target completion window:** T-24h before final go/no-go decision  
**RC tag:** `phase-8-rc-v3`  
**RC commit:** `576709fd6217653446e8c8e031ebad705668c36e`  
**Final workflow run URL:** `https://github.com/taurgis/rhino-inquisitor-com/actions/runs/23398112474`

This checklist was completed and signed during the final 2026-03-22 single-owner decision window after the successful `phase-8-rc-v3` deploy rerun and the final WS-H report refresh.

## Completion record

| Role | Name | Signed | Date |
|---|---|---|---|
| Engineering Owner | Thomas Theunen | `yes` | `2026-03-22T07:32:54Z` |
| SEO Owner | Thomas Theunen | `yes` | `2026-03-22T07:32:54Z` |
| Incident Commander | Thomas Theunen | `yes` | `2026-03-22T07:32:54Z` |

## DNS and HTTPS

- [x] Confirm the intended final workflow run completed successfully and the `github-pages` deployment URL is recorded.
- [x] Confirm the Pages environment deployment record matches `576709fd6217653446e8c8e031ebad705668c36e`.
- [x] Confirm the target HTTPS host responds with the expected status.
- [x] Confirm the current DNS target state matches the planned release state.
- [x] Confirm any accepted apex-host warning remains unchanged from `validation/https-security-report.json` and is reflected in the final decision record.

| Role | Name | Signed | Date |
|---|---|---|---|
| Engineering Owner | Thomas Theunen | `yes` | `2026-03-22T07:32:54Z` |
| SEO Owner | Thomas Theunen | `yes` | `2026-03-22T07:32:54Z` |
| Incident Commander | Thomas Theunen | `yes` | `2026-03-22T07:32:54Z` |

## Host and Canonical Behavior

- [x] Confirm `validation/production-host-smoke-report.json` was regenerated from the clean final RC basis.
- [x] Confirm the production-build cleanliness report shows zero preview-host leakage.
- [x] Confirm the production-build cleanliness report shows zero unexpected `noindex` on indexable routes.
- [x] Confirm the live rehearsal-host smoke report shows the expected preview-host canonical and `noindex` behavior.
- [x] Confirm any accepted host-consolidation warnings are carried into the final decision record and not treated as new blockers.

| Role | Name | Signed | Date |
|---|---|---|---|
| Engineering Owner | Thomas Theunen | `yes` | `2026-03-22T07:32:54Z` |
| SEO Owner | Thomas Theunen | `yes` | `2026-03-22T07:32:54Z` |
| Incident Commander | Thomas Theunen | `yes` | `2026-03-22T07:32:54Z` |

## Priority URL Smoke Tests

- [x] Confirm `migration/phase-8-smoke-test-results.md` reflects the final clean live smoke run.
- [x] Confirm homepage, top 3 recent posts, top 3 category pages, archive, and privacy route all pass.
- [x] Confirm the preview entrypoint redirect chain is recorded explicitly.
- [x] Confirm the single available priority redirect sample from `validation/priority-routes.json` still resolves to the expected effective destination.
- [x] Confirm no new smoke-route regressions were introduced between the clean rerun and the go/no-go meeting.

| Role | Name | Signed | Date |
|---|---|---|---|
| Engineering Owner | Thomas Theunen | `yes` | `2026-03-22T07:32:54Z` |
| SEO Owner | Thomas Theunen | `yes` | `2026-03-22T07:32:54Z` |
| Incident Commander | Thomas Theunen | `yes` | `2026-03-22T07:32:54Z` |

## Sitemap and Robots Reachability

- [x] Confirm sitemap endpoint responds with HTTP `200` and parseable XML.
- [x] Confirm robots.txt responds with HTTP `200` and the expected `Sitemap:` directive.
- [x] Confirm the feed endpoint remains reachable and parseable.
- [x] Confirm sitemap and robots host values are aligned with the intended host state for the final decision window.
- [x] Confirm the final workflow run URL is recorded in `LAUNCH-GATE-PASS-SUMMARY.md` for the same evidence basis.

| Role | Name | Signed | Date |
|---|---|---|---|
| Engineering Owner | Thomas Theunen | `yes` | `2026-03-22T07:32:54Z` |
| SEO Owner | Thomas Theunen | `yes` | `2026-03-22T07:32:54Z` |
| Incident Commander | Thomas Theunen | `yes` | `2026-03-22T07:32:54Z` |

## Rollback Readiness

- [x] Confirm `migration/phase-8-rollback-drill-result.md` exists and records the final rollback drill.
- [x] Confirm the rollback drill record cites the same final workflow run URL and RC ref used by `LAUNCH-GATE-PASS-SUMMARY.md`.
- [x] Confirm the rollback target is the previous WordPress stack.
- [x] Confirm WordPress accessibility proof is recorded with URL, HTTP status, confirmation method, and title or equivalent confirmation.
- [x] Confirm the trigger timestamp, confirmation timestamp, rollback start timestamp, and MTTR are recorded in `migration/phase-8-rollback-drill-result.md`.
- [x] Confirm MTTR is within 60 minutes, or any over-target result is explicitly dispositioned in both `migration/phase-8-rollback-drill-result.md` and `migration/phase-8-exception-register.md`.
- [x] Confirm `migration/phase-7-staging-rollback-runbook.md` remains the active rollback runbook of record.
- [x] Confirm the final exception register shows zero open `blocking` entries.

| Role | Name | Signed | Date |
|---|---|---|---|
| Engineering Owner | Thomas Theunen | `yes` | `2026-03-22T07:32:54Z` |
| SEO Owner | Thomas Theunen | `yes` | `2026-03-22T07:32:54Z` |
| Incident Commander | Thomas Theunen | `yes` | `2026-03-22T07:32:54Z` |