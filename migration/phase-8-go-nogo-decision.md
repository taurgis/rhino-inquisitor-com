# Phase 8 Go/No-Go Decision

**Status:** Draft template for final RHI-091 decision  
**Ticket:** RHI-091  
**Decision:** `PENDING_GO_OR_NO_GO`  
**Decision date:** `PENDING_FINAL_DECISION_DATE`  
**RC tag:** `PENDING_FINAL_RC_TAG`  
**RC commit:** `PENDING_FINAL_RC_SHA`  
**Workflow run type:** `PENDING_FINAL_RUN_TYPE`  
**Workflow run URL:** `PENDING_FINAL_WORKFLOW_RUN_URL`

This file is the final RHI-091 decision record and must not be replaced by, or treated as equivalent to, the 2026-03-20 bootstrap note recorded in `migration/phase-8-approver-roster.md`.

## Decision summary

- Final gate evidence basis: `PENDING_FINAL_RC_TAG` / `PENDING_FINAL_RC_SHA`
- Launch gate summary reference: `LAUNCH-GATE-PASS-SUMMARY.md`
- Cutover verification checklist reference: `CUTOVER-VERIFICATION-CHECKLIST.md`
- Smoke test reference: `migration/phase-8-smoke-test-results.md`
- Rollback drill reference: `migration/phase-8-rollback-drill-result.md`
- Exception register reference: `migration/phase-8-exception-register.md`
- Phase 9 handoff reference: `validation/` plus post-decision monitoring notes below

## Preconditions

- [ ] `LAUNCH-GATE-PASS-SUMMARY.md` is fully populated from one final clean evidence run.
- [ ] `CUTOVER-VERIFICATION-CHECKLIST.md` is completed at T-24h.
- [ ] `migration/phase-8-rollback-drill-result.md` exists and records the previous WordPress stack as the rollback target.
- [ ] `migration/phase-8-exception-register.md` shows zero open `blocking` entries.
- [ ] The WS-H reports no longer carry `provenanceStatus: "branch-state"`.

## Gate outcome

| Area | Outcome | Evidence |
|---|---|---|
| WS-B through WS-G hard-blocker gates | `PENDING_FINAL_RESULT` | `LAUNCH-GATE-PASS-SUMMARY.md` |
| Preview-host rehearsal smoke tests | `PENDING_FINAL_RESULT` | `validation/preview-launch-readiness-report.json`; `migration/phase-8-smoke-test-results.md` |
| Production-build cleanliness | `PENDING_FINAL_RESULT` | `validation/production-host-smoke-report.json` |
| Rollback drill | `PENDING_FINAL_RESULT` | `migration/phase-8-rollback-drill-result.md` |
| Exception register closure | `PENDING_FINAL_RESULT` | `migration/phase-8-exception-register.md` |

## Open warning and accepted items carried into decision review

Record every non-blocking item that remains open at decision time.

| Area | Risk level | Disposition | Owner acceptance note |
|---|---|---|---|
| Apex HTTP consolidation | `warning` | `PENDING_FINAL_DISPOSITION` | `PENDING_OWNER_ACCEPTANCE` |
| Apex HTTPS consolidation | `warning` | `PENDING_FINAL_DISPOSITION` | `PENDING_OWNER_ACCEPTANCE` |
| Origin security-header posture | `accepted` | `PENDING_FINAL_DISPOSITION` | `PENDING_OWNER_ACCEPTANCE` |
| Redirect sample coverage limited to one merge route in the frozen dataset | `accepted` | `PENDING_FINAL_DISPOSITION` | `PENDING_OWNER_ACCEPTANCE` |

## Decision rationale

### If Go

Use when all blocking prerequisites are closed and only documented `warning` or `accepted` items remain.

`PENDING_GO_RATIONALE`

### If No-Go

Use when any blocking prerequisite remains unresolved.

`PENDING_NO_GO_RATIONALE`

## Blocking issue list if No-Go

| Blocker | Owner | Target resolution date |
|---|---|---|
| `PENDING_BLOCKER_1` | Thomas Theunen | `PENDING_DATE` |
| `PENDING_BLOCKER_2` | Thomas Theunen | `PENDING_DATE` |

## Approver record

The repository currently uses the single-owner model recorded in `migration/phase-8-approver-roster.md`.

| Role | Name | Decision | Signed date |
|---|---|---|---|
| Migration Owner | Thomas Theunen | `PENDING_FINAL_DECISION` | `PENDING_FINAL_DECISION_DATE` |
| SEO Owner | Thomas Theunen | `PENDING_FINAL_DECISION` | `PENDING_FINAL_DECISION_DATE` |
| Engineering Owner | Thomas Theunen | `PENDING_FINAL_DECISION` | `PENDING_FINAL_DECISION_DATE` |
| DNS/Operations Owner | Thomas Theunen | `PENDING_FINAL_DECISION` | `PENDING_FINAL_DECISION_DATE` |

## Phase 9 handoff notes

- Validation artifacts location: `validation/`
- Validation artifacts inventory for Phase 9 handoff:
	- `validation/url-parity-report.json`
	- `validation/redirect-quality-report.json`
	- `validation/seo-consistency-report.json`
	- `validation/robots-sitemap-report.json`
	- `validation/structured-data-report.json`
	- `validation/social-preview-report.json`
	- `validation/performance-budget-report.json`
	- `validation/accessibility-axe-report.json`
	- `validation/accessibility-manual-checklist.md`
	- `validation/html-conformance-report.json`
	- `validation/https-security-report.json`
	- `validation/preview-launch-readiness-report.json`
	- `validation/production-host-smoke-report.json`
	- `validation/lhci-report/`
	- `validation/report-schema/`
	- `validation/runs/`
- Rollback runbook of record: `migration/phase-7-staging-rollback-runbook.md`
- Rollback target and timing note: the rollback target remains the previous WordPress stack during the stabilization window, and the rollback window starts from Phase 8 sign-off rather than DNS cutover. The operational target remains to initiate rollback within 60 minutes of a trigger event, with the timed drill result to be recorded separately in `migration/phase-8-rollback-drill-result.md`.
- Search Console and submission tasks: use the owner-managed Domain property for `rhino-inquisitor.com`, keep DNS TXT verification continuity intact, submit the production sitemap `https://www.rhino-inquisitor.com/sitemap.xml` after cutover verification, never submit preview-host URLs or preview-host sitemap/feed outputs, inspect the homepage plus the highest-priority URLs from the Phase 5 launch inspection set, request indexing only for the small critical set when needed, and record execution outcomes in `monitoring/sitemap-processing-report.json`, `monitoring/url-inspection-sample-report.json`, and `monitoring/search-console-indexing-report.md` during Phase 9.
- First monitoring checkpoint: complete the first post-launch checkpoint in the week-4 review window by reviewing Search Console Core Web Vitals p75 trend status for `LCP`, `INP`, and `CLS`, plus crawl and indexing anomaly trends for `404`, `soft 404`, redirect errors, crawled/discovered-not-indexed, and sitemap fetch/parse health. Record the checkpoint summary and any remediation owners in `monitoring/cwv-field-trend.md` and `monitoring/search-console-indexing-report.md`; this note defines the checkpoint only and does not imply that the review has already been executed.