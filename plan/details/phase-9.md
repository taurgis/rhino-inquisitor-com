# Phase 9 Detailed Plan: Cutover and Post-Launch Monitoring

## Purpose
Execute DNS and traffic cutover safely, then run a strict 6-week stabilization program that protects rankings, user experience, and security posture for https://www.rhino-inquisitor.com.

Phase 9 is where migration outcomes become irreversible in public search and user behavior data. A technically successful deployment can still fail commercially if indexing, redirects, host canonicalization, or critical templates regress after launch.

## Why Phase 9 Is High Risk
1. Crawl and indexing updates are not immediate; ranking and coverage volatility is expected for weeks.
2. GitHub Pages hosting constraints can hide redirect/header limitations until real crawler traffic arrives.
3. Redirect defects and soft-404 patterns can damage migration signal transfer quickly.
4. Search Console data can lag and can be misread without a defined triage model.
5. Field Core Web Vitals are trailing-window metrics; early launch diagnostics must combine lab and field responsibly.
6. Post-launch "hotfix churn" can create conflicting SEO signals (canonical, internal links, redirects) and prolong instability.
7. Without a formal incident command model, operational response becomes fragmented during launch pressure.

## Phase Position and Dependencies
From [main-plan.MD](main-plan.MD), Phase 9 depends on Phase 8 readiness gates and executes cutover plus post-launch stabilization.

Phase 9 consumes:
1. [plan/details/phase-6.md](plan/details/phase-6.md): approved URL disposition (`keep`/`redirect`/`retire`), redirect policy, parity outcomes.
2. [plan/details/phase-7.md](plan/details/phase-7.md): GitHub Pages deployment runbook, domain and HTTPS setup, rollback mechanics.
3. [plan/details/phase-8.md](plan/details/phase-8.md): launch gate pass artifacts, sample route matrix, baseline quality reports.

Phase 9 enables:
1. Migration closure with objective evidence that ranking and UX regressions are contained.
2. Transition to business-as-usual (BAU) operations with known SLOs and ownership.
3. Safe decommissioning plan for old infrastructure once redirect retention requirements are met.

## Scope
In scope:
1. Launch window execution and real-traffic validation.
2. Search Console activation and indexing migration monitoring.
3. Redirect health monitoring and corrective actions.
4. Post-launch SEO consistency checks (canonical, sitemap, robots, structured data).
5. Performance and Core Web Vitals stabilization monitoring.
6. Incident response, rollback/hotfix decisioning, and stakeholder communication cadence.
7. 6-week stabilization exit review and handoff package.

Out of scope:
1. New features unrelated to migration stabilization.
2. Broad content strategy overhauls during stabilization window.
3. Long-term SEO growth experiments (start only after exit criteria pass).

## Non-Negotiable Stabilization Constraints (Operational Blockers)
1. Canonical production host remains locked to `https://www.rhino-inquisitor.com` for the full stabilization window.
2. Search Console property ownership and access must be active before cutover starts.
3. If this migration is host/platform-only with no user-visible URL changes, follow the site-move-no-URL-changes checklist and do not use Change of Address.
4. Sitemap submitted on launch day must contain only final canonical URLs.
5. Redirect policy from Phase 6 is enforceable in production for all priority legacy URLs.
6. Any critical URL returning unintended `404`, `5xx`, or redirect loop is launch-day Sev-1.
7. `robots.txt` and `noindex` policies are treated as controlled configuration, not ad-hoc edits.
8. Mixed-content issues on homepage or article template are release blocking.
9. Rollback and hotfix operators are assigned by name before T-0.
10. Redirect retention for moved URLs is maintained for as long as possible, generally at least 12 months.
11. Incident timeline, decisions, and remediations must be logged for every Sev-1/Sev-2 event.
12. Previous WordPress production stack remains rollback-ready through at least stabilization Week 2, and preferred through Week 6.

## Fixed Operational Thresholds
1. Sev-1 route-failure trigger:
- 5 or more priority URLs unresolved or mismapped within any 60-minute window.
2. Indexing anomaly trigger:
- soft-404 or not-found defects affecting 2 percent or more of sampled priority legacy routes in 24 hours.
3. Performance trigger:
- homepage or article median Lighthouse Performance below 90 for three consecutive daily runs.
4. Canonical consistency trigger:
- any canonical mismatch on a priority URL, or mismatch rate above 0.5 percent in sampled indexable URLs.

## Critical Corrections Encoded in This Phase
1. Indexing reality correction:
1.1. Sitemap submission accelerates discovery, but does not guarantee indexing.
1.2. Coverage should be assessed by trend and error class, not one-day snapshots.

2. Crawl-control correction:
2.1. `robots.txt` controls crawling, not guaranteed de-indexing.
2.2. `noindex` must be crawlable to be honored.

3. Redirect-signal correction:
3.1. Topic-irrelevant broad redirects (especially to homepage) are soft-404 risk.
3.2. Redirect chains must be minimized; persistent chains prolong migration instability.

4. Static-hosting correction:
4.1. GitHub Pages is static hosting; advanced redirect/header control may require an edge layer.
4.2. If origin constraints block required behavior, escalation to CDN/proxy is mandatory, not optional.

5. Performance interpretation correction:
5.1. Lighthouse is immediate regression detection, not real-user truth.
5.2. Field CWV uses trailing-window data and should be evaluated at p75.

6. Search Console tooling correction:
6.1. URL Inspection is per-URL and quota-limited; it is not a bulk substitute for Page Indexing telemetry.
6.2. Search Console API automation can cover Search Analytics, Sitemaps, and sampled URL Inspection checks, but not a full Page Indexing export equivalent.

## Operating Model and Ownership
Launch command roles:
1. Incident commander: owns severity decisions and launch continuation/hold decisions.
2. Deployment operator: executes deploy and verifies artifact integrity.
3. DNS operator: performs DNS changes and rollback DNS reversion if needed.
4. SEO operator: validates indexing/canonical/sitemap behavior and Search Console telemetry.
5. QA operator: runs synthetic route checks and user-path smoke checks.
6. Communications owner: posts status updates and decision logs to stakeholders.

Cadence:
1. T-0 to T+4h: status check every 15-30 minutes.
2. Day 1 to Day 3: two scheduled check-ins per day.
3. Week 1 to Week 2: daily standup with defect burndown.
4. Week 3 to Week 6: weekly stabilization review.

Decision policy:
1. Sev-1 unresolved beyond SLA triggers rollback or launch hold.
2. Sev-2 requires same-day remediation plan and owner assignment.
3. No silent risk acceptance; exceptions require written approval.

## Workstream A: Cutover Execution and Immediate Verification (T-24h to T+6h)
Goal: switch production traffic with controlled blast radius and immediate fault detection.

T-24h checklist:
1. Confirm final RC commit SHA and immutable artifact reference.
2. Confirm GitHub Pages custom domain status is healthy and HTTPS certificate is ready or in final issuance stage.
3. Re-check domain verification TXT record and DNS snapshots for rollback.
4. Confirm Search Console access and ownership continuity.
5. Confirm monitoring scripts and dashboards are live.
6. If HTTPS is still unavailable after DNS changes, prepare custom-domain remove/re-add recovery steps in the runbook.
7. If publishing through GitHub Actions, treat repository settings as custom-domain source of truth and do not rely on a repository CNAME file.

T-0 sequence:
1. Deploy approved artifact.
2. Apply DNS changes per Phase 7 runbook.
3. Verify DNS from at least two independent resolvers.
4. Validate homepage, sample posts, archive, category pages, privacy page, and high-value legacy inbound URLs.
5. Validate canonical tags and sitemap on live host.
6. Submit sitemap in Search Console.

T+0h to T+6h checks:
1. Confirm HTTP and host consolidation behavior.
2. Confirm no critical mixed content on primary templates.
3. Confirm no launch-time `noindex` leakage.
4. Confirm top-priority redirect mappings resolve as expected.

Blocking triggers:
1. Homepage unavailable or incorrect host/protocol behavior.
2. High-value legacy URLs unresolved/mismapped.
3. Canonical output pointing to non-canonical host.

## Workstream B: Search Console Activation and Indexing Transition (T+0 to T+42 days)
Goal: migrate indexing signals cleanly and detect coverage defects early.

Launch-day actions:
1. Submit final production sitemap.
2. Use URL Inspection for highest-priority URLs to compare indexed-versus-live state.
3. Request indexing only for a small critical set of URLs; use sitemap submission for broad discovery/recrawl.
4. Confirm sitemap processing starts without parsing errors.

Week 1 actions:
1. Daily review of Page Indexing report for:
1.1. Not found (`404`)
1.2. Soft `404`
1.3. Redirect errors
1.4. Crawled/Discovered currently not indexed
2. Daily review of Sitemaps report for fetch and parse health; treat sitemap status as discovery telemetry, not final index-coverage truth.
3. Validate critical templates for canonical correctness when rendered live.
4. Record Page Indexing trend snapshots from Search Console reports or exports as the source of truth for indexed/excluded direction.

Week 2-6 actions:
1. Weekly indexing trend review against baseline and expected migration curve.
2. Weekly review of excluded reasons and remediation backlog.
3. Re-submit sitemap only when material URL set changes occur.

Operational thresholds:
1. Sev-1: high-value route class shows systemic `404`/soft-404 pattern.
2. Sev-1: sitemap contains non-canonical or redirected URLs.
3. Sev-2: indexing coverage trend stalls beyond expected migration window without clear cause.
4. Sev-2: Search Console property verification continuity breaks on required canonical/variant properties.

## Workstream C: Redirect Retention and Legacy URL Governance (T+0 to T+12 months)
Goal: preserve link equity and user continuity while minimizing redirect debt.

Mandatory policy:
1. Moved URLs resolve to closest equivalent destination.
2. Deleted content returns intended not-found behavior (`404`/`410` where supported).
3. Redirect chains are actively reduced; no loops tolerated.
4. Redirect records for moved URLs are retained for as long as possible, generally at least 12 months.

Post-launch redirect program:
1. Daily (week 1) and weekly (week 2-6) check of priority legacy URL set.
2. Capture top unresolved legacy routes and assign explicit disposition updates.
3. Create link-reclamation list for highest-value inbound links still targeting legacy URLs.
4. Plan redirect infrastructure uplift (edge/CDN) if GitHub Pages-only behavior is insufficient.

Acceptance criteria:
1. Priority legacy URL set has no unresolved outcomes after stabilization week 2.
2. Redirect chain depth policy is met across sampled legacy routes.

## Workstream D: Incident Detection, Triage, and Recovery
Goal: treat post-launch anomalies as operational incidents, not ad-hoc tasks.

Primary signal sources:
1. Search Console Page Indexing and Sitemaps reports.
2. Synthetic route checker results (scheduled).
3. Browser and automated mixed-content checks.
4. Lighthouse trend runs on representative templates.
5. Optional analytics/event instrumentation for user-facing errors.

Severity model:
1. Sev-1: homepage outage, HTTPS enforcement failure, widespread canonical misconfiguration, systemic redirect failure on priority routes.
2. Sev-2: template-family defect with material SEO or UX impact but partial workaround available.
3. Sev-3: isolated route issues with low traffic and no systemic impact.

SLA targets:
1. Sev-1 acknowledgement: 15 minutes during launch window, 60 minutes afterward.
2. Sev-1 mitigation: initiate rollback/hotfix within 60 minutes.
3. Sev-2 mitigation plan: same business day.

Required artifacts:
1. Incident log with timeline and root-cause classification.
2. Post-incident corrective action entry linked to a permanent fix.

## Workstream E: Performance and Core Web Vitals Stabilization
Goal: detect launch regressions immediately and confirm field performance convergence over time.

Immediate (Day 0-7):
1. Run daily Lighthouse checks for representative template matrix.
2. Compare against Phase 8 baseline medians.
3. Investigate regressions in render-blocking resources, image payload, and layout shifts.

Transitional (Week 2-6):
1. Track field CWV in Search Console using p75 trend on URL groups (not as a single-URL diagnostic).
2. Expect temporary "No data available" gaps on low-traffic/new groups and continue using PSI/Lighthouse for short-window diagnostics.
3. Distinguish lab-only fluctuation from field degradation.
4. Use trend-based thresholds, not single-run outliers.

Core thresholds:
1. LCP target: <= 2.5s at p75.
2. INP target: <= 200ms at p75.
3. CLS target: <= 0.1 at p75.

Escalation triggers:
1. Homepage or article template remains below median Lighthouse Performance 90 for three consecutive daily runs.
2. Field CWV category moves from Good to Needs Improvement/Poor on critical template groups once sufficient data exists.

## Workstream F: SEO, Schema, and Content-Signal Drift Monitoring
Goal: prevent post-launch configuration drift that degrades discoverability.

Weekly checks:
1. Canonical tags remain self-consistent and absolute on final host.
2. Sitemap remains canonical-only and excludes helper/redirect pages.
3. `robots.txt` remains aligned with crawl policy and sitemap location.
4. Structured data for homepage and article templates remains valid and content-aligned.
5. Open Graph and social image URLs stay resolvable and HTTPS.

Change-control rule:
1. No template-level SEO field change without validation run and recorded owner approval during stabilization window.

Escalation triggers:
1. Canonical-host drift appears in any primary template family.
2. Structured data critical errors detected on homepage/article templates.

## Workstream G: Security and Domain Posture Monitoring
Goal: keep domain and transport security stable during and after cutover.

Mandatory checks:
1. HTTPS remains enforced and certificate remains valid.
2. Domain verification remains active and challenge record retained.
3. No wildcard DNS records that create takeover risk.
4. No critical mixed content introduced by content edits or embeds.

Hardening governance:
1. Document required security headers and current enforcement capabilities.
2. If origin constraints prevent required headers, record edge-layer implementation plan and owner.

Escalation triggers:
1. HTTPS disablement or certificate invalid state.
2. Domain verification failure or risky DNS change.
3. Repeated HTTP `429` responses indicating platform rate limiting or monitor-induced traffic pressure.

## Workstream H: Stabilization Cadence (Week-by-Week)
Goal: convert raw telemetry into controlled recovery and closure decisions.

Week 1 (intense monitoring):
1. Daily SEO and route-health triage.
2. Daily Lighthouse regression checks.
3. Immediate remediation for priority URL defects.

Week 2 (signal consolidation):
1. Confirm defect burndown and no new systemic classes.
2. Review redirect quality and unresolved legacy routes.
3. Validate canonical/sitemap stability after first patch wave.

Week 3-4 (trend stabilization):
1. Move from incident-driven to trend-driven monitoring.
2. Prioritize high-impact external link reclamation.
3. Confirm no recurring mixed-content/security regressions.

Week 5-6 (exit preparation):
1. Confirm sustained stability of indexing and route outcomes.
2. Produce final stabilization report and unresolved-risk list.
3. Prepare BAU handoff with monitoring schedule and owners.

## Workstream I: Exit Criteria and BAU Handoff
Goal: close migration phase only when objective stabilization evidence exists.

Exit criteria:
1. No open Sev-1 defects for 14 consecutive days.
2. Priority legacy URL set has approved outcomes with no unresolved gaps.
3. Canonical, sitemap, and robots consistency remains stable for two consecutive weekly audits.
4. Search Console indexing anomalies are understood, tracked, and non-escalating.
5. Performance trend is stable against fixed operational thresholds defined in this phase.
6. Security/domain checks pass without critical exceptions.

Handoff package:
1. Stabilization summary report.
2. Open-risk register with owners and due dates.
3. Redirect-retention calendar (minimum 12-month horizon for moved URLs).
4. BAU monitoring playbook (weekly/monthly cadence).

## Required Libraries and Tooling (Phase 9)
Required:
1. `playwright`: scripted production smoke checks and route assertions.
2. `@lhci/cli`: repeatable Lighthouse regression snapshots.
3. `fast-xml-parser`: sitemap consistency verification.
4. `fast-glob`: deterministic sample discovery for generated output checks.
5. `googleapis`: Search Console API automation for Search Analytics and sitemap status/submission, plus sampled URL Inspection checks for priority URLs.
6. `ajv`: JSON-schema validation for monitoring artifact contracts.

Recommended:
1. `lychee` or `linkinator`: post-launch broken-link scans on live host.
2. `curl` and `dig`: DNS/protocol/host verification in scheduled checks.
3. Rich Results Test and Search Console rich result status reports for schema drift detection.
4. Optional edge/CDN observability tooling when origin-level visibility is insufficient.

Implementation notes:
1. Pin versions and archive outputs from every scheduled monitoring job.
2. Keep monitor scripts deterministic and idempotent to avoid noisy false positives.
3. Design API jobs around Search Console quotas (notably URL Inspection per-site daily/minute limits) to avoid monitor-induced blind spots.
4. Treat Search Analytics rows as sampled/top-result output, not a complete site index inventory.

## Data Contracts and File Artifacts
Planned artifacts:
1. `monitoring/launch-cutover-log.md`: timestamped launch timeline and decisions.
2. `monitoring/search-console-indexing-report.md`: indexed/excluded trend notes from Search Console Page Indexing report/export, plus interpretation summary.
3. `monitoring/url-inspection-sample-report.json`: sampled URL Inspection outcomes for priority URLs.
4. `monitoring/sitemap-processing-report.json`: sitemap status and parsing outcomes.
5. `monitoring/legacy-route-health-report.json`: priority legacy URL outcomes.
6. `monitoring/canonical-consistency-report.json`: canonical/internal/sitemap alignment checks.
7. `monitoring/cwv-lighthouse-trend.json`: daily Lighthouse trend during week 1.
8. `monitoring/cwv-field-trend.md`: weekly field-CWV interpretation notes.
9. `monitoring/security-domain-report.json`: HTTPS, verification, and mixed-content checks.
10. `monitoring/stabilization-summary.md`: week 6 closure report and BAU handoff.

Contract rules:
1. Every report includes `runTimestamp`, `environment`, `commitSha`, `status`, `owner`, and `findings` fields.
2. Blocking findings must include remediation owner and due date.
3. Reports are immutable once attached to incident review.

## Test and Verification Strategy (Post-Launch)
Daily (Week 1):
1. Production smoke test matrix run.
2. Priority legacy route resolution check.
3. Canonical and sitemap consistency check.
4. Lighthouse regression run on representative templates.

Weekly (Week 2-6):
1. Search Console Page Indexing trend review plus sampled URL Inspection checks for priority URLs.
2. Structured data and social-preview sanity checks.
3. Mixed-content and HTTPS posture review.
4. Redirect debt review and chain reduction progress.

Manual spot checks:
1. Homepage and key templates in desktop/mobile browsers.
2. Top organic landing pages and top backlink destination routes.
3. Selected retired URLs for correct not-found behavior.

## SEO Implications and Best-Practice Enforcement
1. Keep URL churn minimal after launch; each post-launch URL change adds migration risk.
2. Maintain strict signal alignment: redirects, canonicals, internal links, sitemap URLs, and host policy must agree.
3. Do not use homepage redirects as a catch-all for missing legacy URLs.
4. Keep moved-URL redirects active for long enough to preserve transfer signals.
5. Treat soft-404 spikes and redirect warnings as urgent migration defects.
6. Preserve structured data accuracy with visible-content parity on each template class.
7. Avoid simultaneous major template rewrites during stabilization unless tied to incident mitigation.
8. Change of Address applies only to domain-level moves; do not use it for `http` to `https`, `www` to apex (or apex to `www`), or path-only changes.

## Launch-Window Execution Checklist (Detailed)
T-24h:
1. Confirm final artifact SHA and deployment lock.
2. Confirm GitHub Pages custom domain and verification state.
3. Confirm DNS rollback snapshot and operator availability.
4. Confirm monitoring jobs and alert channels.

T-2h:
1. Re-run smoke checks on current production baseline.
2. Freeze non-migration changes.
3. Confirm incident bridge and stakeholder channel.

T-0:
1. Deploy release artifact.
2. Apply DNS changes.
3. Validate DNS, HTTPS, canonical host, sitemap reachability.
4. Submit sitemap and inspect priority URLs.

T+1h to T+6h:
1. Run triage loop every 30 minutes.
2. Resolve/mitigate any Sev-1 immediately.
3. Record all decisions in cutover log.

T+24h:
1. Complete day-1 stabilization report.
2. Confirm risk register and owner assignments for remaining issues.

## Deliverables Produced by Phase 9
1. [plan/details/phase-9.md](plan/details/phase-9.md) approved plan.
2. Cutover execution log and incident timeline.
3. Search Console activation evidence (sitemap submission and indexing snapshots).
4. Daily and weekly stabilization report bundle.
5. Week-6 migration stabilization summary and BAU handoff package.

## Definition of Done
1. Cutover completed with no unresolved Sev-1 incidents.
2. Priority route classes (current and legacy) are stable and policy-compliant.
3. Indexing transition is monitored with documented trend interpretation and remediation actions.
4. Canonical/sitemap/robots/redirect signals remain consistent throughout stabilization window.
5. Performance and security posture remain within fixed operational thresholds.
6. Redirect retention plan and ownership are documented through at least month 12.
7. BAU monitoring ownership and cadence are accepted by operations and SEO owners.

## Official References Incorporated
1. Google site move with URL changes: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
2. Google site move with no URL changes: https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes
3. Google redirects guidance (`301`/`308`, JS/meta fallback): https://developers.google.com/search/docs/crawling-indexing/301-redirects
4. Google canonical consolidation: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
5. Google robots.txt introduction and behavior: https://developers.google.com/search/docs/crawling-indexing/robots/intro
6. Google block indexing and `noindex` behavior: https://developers.google.com/search/docs/crawling-indexing/block-indexing
7. Google HTTP status troubleshooting (soft-404 implications): https://developers.google.com/crawling/docs/troubleshooting/http-status-codes
8. Google sitemaps overview: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
9. Google recrawl/indexing request guidance: https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
10. Search Console Page Indexing report: https://support.google.com/webmasters/answer/7440203
11. Search Console Sitemaps report: https://support.google.com/webmasters/answer/7451001
12. Search Console URL Inspection: https://support.google.com/webmasters/answer/9012289
13. Search Console Change of Address tool: https://support.google.com/webmasters/answer/9370220
14. Google Search Console API overview: https://developers.google.com/webmaster-tools/about
15. Google Search Console API reference: https://developers.google.com/webmaster-tools/v1/api_reference_index
16. Google Search Console API usage limits: https://developers.google.com/webmaster-tools/limits
17. Google structured data policies: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
18. GitHub Pages overview (static hosting model): https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
19. GitHub Pages custom domains overview: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages
20. GitHub Pages custom domain management: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
21. GitHub Pages custom-domain troubleshooting (HTTPS/CNAME): https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages
22. GitHub Pages domain verification: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages
23. GitHub Pages HTTPS enforcement: https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
24. GitHub Pages limits: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
25. PageSpeed Insights methodology (lab vs field, p75): https://developers.google.com/speed/docs/insights/v5/about
26. Search Console Core Web Vitals report: https://support.google.com/webmasters/answer/9205520
27. Lighthouse overview: https://developer.chrome.com/docs/lighthouse/overview
28. MDN mixed content guidance: https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content
29. Robots Exclusion Protocol (RFC 9309): https://www.rfc-editor.org/rfc/rfc9309
