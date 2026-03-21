# Launch Gate Pass Summary

**Status:** Draft template for final clean-RC rerun  
**Ticket:** RHI-091  
**Final evidence basis:** Pending clean rerun snapshot  
**Workflow run type:** Pending final run (`workflow_dispatch` or rerun attempt to be recorded explicitly)  
**Workflow run URL:** `PENDING_FINAL_WORKFLOW_RUN_URL`  
**RC tag:** `PENDING_FINAL_RC_TAG`  
**RC commit:** `PENDING_FINAL_RC_SHA`  
**Signed by:** Thomas Theunen (Migration Owner)  
**Signed at:** `PENDING_FINAL_SIGNOFF_DATE`

Do not treat this file as final sign-off evidence until every row below is populated from a single clean final evidence run and the open `blocking` entries in `migration/phase-8-exception-register.md` are closed.

| Gate | Command | Status | Blocking threshold | Report path | Actions run URL |
|---|---|---|---|---|---|
| URL parity | `npm run check:url-parity:p8` | `pending final RC rerun` | Exit `0` | `validation/url-parity-report.json` | `PENDING_FINAL_WORKFLOW_RUN_URL` |
| Redirect quality | `npm run check:redirect-quality` | `pending final RC rerun` | Exit `0` | `validation/redirect-quality-report.json` | `PENDING_FINAL_WORKFLOW_RUN_URL` |
| SEO consistency | `npm run check:seo-consistency` | `pending final RC rerun` | Exit `0` | `validation/seo-consistency-report.json` | `PENDING_FINAL_WORKFLOW_RUN_URL` |
| Robots and sitemap | `npm run check:robots-sitemap` | `pending final RC rerun` | Exit `0` | `validation/robots-sitemap-report.json` | `PENDING_FINAL_WORKFLOW_RUN_URL` |
| Structured data | `npm run check:structured-data` | `pending final RC rerun` | Exit `0` | `validation/structured-data-report.json` | `PENDING_FINAL_WORKFLOW_RUN_URL` |
| Social preview | `npm run check:social-preview` | `pending final RC rerun` | Exit `0` | `validation/social-preview-report.json` | `PENDING_FINAL_WORKFLOW_RUN_URL` |
| Lighthouse CI | `npm run lhci:run:p8` | `pending final RC rerun` | All Phase 8 score assertions pass | `validation/lhci-report/` | `PENDING_FINAL_WORKFLOW_RUN_URL` |
| Performance budget | `npm run check:perf-budget` | `pending final RC rerun` | Exit `0` and no blocking budget failures | `validation/performance-budget-report.json` | `PENDING_FINAL_WORKFLOW_RUN_URL` |
| Accessibility axe | `npm run check:accessibility` | `pending final RC rerun` | Exit `0` and no blocking severity findings | `validation/accessibility-axe-report.json` | `PENDING_FINAL_WORKFLOW_RUN_URL` |
| HTML conformance | `npm run check:html-conformance` | `pending final RC rerun` | Exit `0` and zero errors | `validation/html-conformance-report.json` | `PENDING_FINAL_WORKFLOW_RUN_URL` |
| HTTPS and security | `npm run check:https-security` | `pending final RC rerun` | Exit `0` and no blocking artifact or live failures | `validation/https-security-report.json` | `PENDING_FINAL_WORKFLOW_RUN_URL` |
| Front matter validation | `npm run validate:frontmatter` | `pending final RC rerun` | Exit `0` | `n/a - command output only` | `PENDING_FINAL_WORKFLOW_RUN_URL` |
| Internal links | `npm run check:links` | `pending final RC rerun` | Exit `0` | `migration/reports/phase-5-internal-links-audit.csv` | `PENDING_FINAL_WORKFLOW_RUN_URL` |
| Artifact validation | `npm run validate:artifact` | `pending final RC rerun` | Exit `0` | `tmp/phase-7-artifact-validation-production.json` | `PENDING_FINAL_WORKFLOW_RUN_URL` |
| Hugo production build | `hugo --cleanDestinationDir --gc --minify --environment production` | `pending final RC rerun` | Exit `0` | `tmp/ci-prod-public/` | `PENDING_FINAL_WORKFLOW_RUN_URL` |

## WS-H additional evidence

| Evidence | Status | Path | Notes |
|---|---|---|---|
| Preview-host smoke report | `pending final RC rerun` | `validation/preview-launch-readiness-report.json` | Must come from the final live rehearsal-host run and not remain `branch-state`. |
| Production-build cleanliness report | `pending final RC rerun` | `validation/production-host-smoke-report.json` | Must be regenerated from the final production artifact snapshot and not remain `branch-state`. |
| Smoke-test markdown summary | `pending final RC rerun` | `migration/phase-8-smoke-test-results.md` | Must match the final live rehearsal-host run. |

## Sign-off

I confirm that every gate above was reviewed from the same final evidence run and that no open `blocking` exceptions remain.

**Name:** Thomas Theunen  
**Role:** Migration Owner  
**Date:** `PENDING_FINAL_SIGNOFF_DATE`