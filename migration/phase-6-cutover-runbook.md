# Phase 6 Cutover Runbook

## Scope

This runbook is intentionally seeded by RHI-069 with the post-launch monitoring, threshold, and escalation content required for redirect observability under the committed Model A launch posture.

RHI-071 owns the remaining cutover, rollback, freeze, and drill content. Until that ticket closes, treat this file as the monitoring section of the final runbook rather than the full operational handoff.

## Model A Monitoring Boundary

1. Hugo aliases on GitHub Pages are static helper pages, so repository checks prove artifact correctness, canonical alignment, and policy coverage before launch.
2. Runtime per-path HTTP redirect telemetry is not available from repository-controlled GitHub Pages configuration.
3. Day-0 through Day-14 monitoring therefore combines direct HTTP smoke sampling on the live site with Search Console coverage signals that arrive later.

## Day-0 Smoke Checks

Run these checks immediately after production cutover and before declaring the launch stable:

1. Verify the latest production artifact was built cleanly.
2. Run `npm run phase6:generate-coverage-report` against the production artifact and confirm 100% verified outcomes.
3. Run `npm run check:redirect-chains` and confirm zero chain, loop, missing-target, and cross-host anomalies.
4. Run `npm run check:canonical-alignment` and confirm zero mismatch rows.
5. Run `npm run check:host-protocol`, `npm run check:retirement-policy`, and `npm run check:redirect-security` against the same production artifact.
6. Smoke-test a priority legacy URL sample on the live production host, including homepage, article, category, `/feed/`, `/robots.txt`, `/sitemap.xml`, and the custom `404` route.

## T+1 To T+14 Review Cadence

| Window | Cadence | Required checks | Owner |
|---|---|---|---|
| T0 to T+1 | Every 4 hours during the first 24 hours | Priority legacy URL smoke sample, host/protocol spot check, canonical spot check, redirect-chain regression check | Engineering Owner |
| T+2 to T+7 | Daily | 404 and soft-404 review, canonical mismatch sample review, sitemap submission health, Search Console Page indexing trend review | SEO Owner + Engineering Owner |
| T+8 to T+14 | Every other day unless an incident is open | Priority route spot check, Search Console redirect and canonical status review, legacy-vs-canonical sitemap trend review | SEO Owner |

## Incident Trigger Thresholds

| Trigger type | Threshold | Owner | Escalation path |
|---|---|---|---|
| High-value URL failure | More than 5 priority URLs fail, or more than 2% of the priority-route sample fails, in the first 24 hours | Engineering Owner | Open incident immediately, notify SEO Owner, then notify Migration Owner if the threshold persists after the first verification rerun |
| Redirect chain or loop | Any confirmed chain, loop, missing target, off-site target, or HTTP downgrade in the production redirect sample | Engineering Owner | Immediate incident; freeze further content changes until corrected |
| Canonical mismatch | Any confirmed canonical mismatch on a production indexable URL | SEO Owner | Immediate SEO escalation and engineering validation; treat as release-blocking until resolved or explicitly waived by the user-owner |
| 404 or soft-404 anomaly | More than 5 new priority-route 404 or soft-404 cases in a day, or repeated failures on the same priority route across two review windows | SEO Owner | Escalate to Engineering Owner for route-level diagnosis and to Migration Owner if the issue remains open after one remediation cycle |
| Search Console redirect or canonical regression | Any new `Redirect error`, `Soft 404`, or `Duplicate, Google chose different canonical than user` issue affecting a priority URL sample | SEO Owner | Review within the same business day; escalate to Engineering Owner if confirmed in direct HTTP or artifact checks |

## Monitoring Workflow

1. Start with direct HTTP validation on the live canonical host for the priority URL sample.
2. Re-run the artifact-level Phase 6 commands when the runtime symptom matches an artifact contract violation.
3. Use Search Console Page indexing and URL Inspection as secondary evidence only; do not wait for Search Console before opening an incident when direct checks already fail.
4. Record every threshold breach with the failing URLs, timestamp, verification command, and owner action.

## Escalation Ownership

1. Engineering Owner handles redirect helper defects, missing targets, host/protocol drift, and chain or loop regressions.
2. SEO Owner handles canonical mismatch triage, Search Console signal review, and soft-404 classification.
3. Migration Owner decides whether a sustained production incident requires rollback or a launch-window communication update.

## Reserved For RHI-071

The sections below remain explicitly reserved for the downstream cutover-readiness ticket:

1. T-7 to T-1 pre-cutover checklist
2. T0 deployment execution steps
3. Verification tables and evidence log
4. Redirect-map freeze and tag references
5. Rollback triggers, options, and drill outcomes