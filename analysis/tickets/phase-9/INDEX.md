# Phase 9 Ticket Index

## Project: Rhino Inquisitor — WordPress to Hugo Migration

**Phase:** 9 — Cutover and Post-Launch Monitoring  
**Goal:** Execute DNS and traffic cutover safely, then run a strict 6-week stabilization program that protects rankings, user experience, and security posture for https://www.rhino-inquisitor.com. Confirm the migration is complete with objective evidence and hand off to business-as-usual (BAU) operations.  
**Timeline:** 7+ weeks (DNS cutover day + 6-week stabilization + sign-off)  
**Phase detail:** [`analysis/plan/details/phase-9.md`](../../analysis/plan/details/phase-9.md)

> **Note:** Phase 9 has not been executed yet. All tickets are in `Open` status. This is preparation only.

---

## Ticket Summary

| Ticket ID | Title | Workstream | Priority | Status | Estimate | Target Date | Depends On |
|-----------|-------|------------|----------|--------|----------|-------------|------------|
| [RHI-093](RHI-093-phase-9-bootstrap.md) | Phase 9 Bootstrap: Pre-Cutover Readiness and Team Alignment | Setup | Critical | Open | S | 2026-06-16 | RHI-092 |
| [RHI-094](RHI-094-cutover-execution-immediate-verification.md) | Workstream A — Cutover Execution and Immediate Verification | WS-A | Critical | Open | L | 2026-06-17 | RHI-093 |
| [RHI-095](RHI-095-search-console-indexing-transition.md) | Workstream B — Search Console Activation and Indexing Transition | WS-B | Critical | Open | M | 2026-07-29 | RHI-094 |
| [RHI-096](RHI-096-redirect-retention-legacy-url-governance.md) | Workstream C — Redirect Retention and Legacy URL Governance | WS-C | Critical | Open | M | 2026-07-29 | RHI-094 |
| [RHI-097](RHI-097-incident-detection-triage-recovery.md) | Workstream D — Incident Detection, Triage, and Recovery | WS-D | Critical | Open | M | 2026-07-29 | RHI-093 |
| [RHI-098](RHI-098-performance-cwv-stabilization.md) | Workstream E — Performance and Core Web Vitals Stabilization | WS-E | High | Open | M | 2026-07-29 | RHI-094 |
| [RHI-099](RHI-099-seo-schema-content-signal-drift.md) | Workstream F — SEO, Schema, and Content-Signal Drift Monitoring | WS-F | High | Open | M | 2026-07-29 | RHI-094 |
| [RHI-100](RHI-100-security-domain-posture-monitoring.md) | Workstream G — Security and Domain Posture Monitoring | WS-G | High | Open | S | 2026-07-29 | RHI-094 |
| [RHI-101](RHI-101-stabilization-cadence-weekly-reviews.md) | Workstream H — Stabilization Cadence and Weekly Reviews | WS-H | High | Open | M | 2026-07-29 | RHI-095 through RHI-100 |
| [RHI-102](RHI-102-exit-criteria-bau-handoff.md) | Workstream I — Exit Criteria and BAU Handoff | WS-I | Critical | Open | L | 2026-07-29 | RHI-101 |
| [RHI-103](RHI-103-phase-9-signoff.md) | Phase 9 Sign-off and Migration Closure | Sign-off | Critical | Open | S | 2026-08-05 | RHI-093 through RHI-102 |

---

## Dependency Graph

```
RHI-092 (Phase 8 Sign-off)
    └── RHI-093 (Phase 9 Bootstrap)
            │
            ├── RHI-094 (WS-A: Cutover Execution)     ← T-0 execution
            │       │
            │       ├── RHI-095 (WS-B: Search Console and Indexing)
            │       │
            │       ├── RHI-096 (WS-C: Redirect Retention)
            │       │
            │       ├── RHI-098 (WS-E: Performance and CWV)
            │       │
            │       ├── RHI-099 (WS-F: SEO/Schema Drift)
            │       │
            │       └── RHI-100 (WS-G: Security and Domain)
            │
            └── RHI-097 (WS-D: Incident Detection)    ← runs from bootstrap through stabilization

[WS-B through WS-G active + WS-D active] ─────────► RHI-101 (WS-H: Stabilization Cadence)

[WS-H complete] ───────────────────────────────────► RHI-102 (WS-I: Exit Criteria and BAU Handoff)

[WS-I Done + exit criteria met] ───────────────────► RHI-103 (Phase 9 Sign-off)
```

> **Reading the graph:** RHI-093 (Bootstrap) is the hard entry gate. RHI-094 (WS-A: Cutover) is the prerequisite for the monitoring workstreams (WS-B through WS-G) since they require the live production host to exist. WS-D (Incident Detection) begins at bootstrap and runs continuously. WS-H (Stabilization Cadence) integrates all monitoring workstreams and governs the weekly review rhythm. WS-I (Exit Criteria) requires WS-H to complete and all exit criteria to be met with evidence before sign-off can proceed.

---

## Phase 9 Workstream Map

| Workstream | Ticket | Focus Area | Timeline |
|------------|--------|------------|----------|
| Setup | RHI-093 | Bootstrap: pre-cutover readiness and role alignment | T-24h to T-0 |
| WS-A | RHI-094 | Cutover execution and immediate verification | T-24h through T+24h |
| WS-B | RHI-095 | Search Console activation and indexing transition | T+0 through Week 6 |
| WS-C | RHI-096 | Redirect retention and legacy URL governance | T+0 through Month 12 |
| WS-D | RHI-097 | Incident detection, triage, and recovery | T-0 through Week 6 |
| WS-E | RHI-098 | Performance and Core Web Vitals stabilization | T+0 through Week 6 |
| WS-F | RHI-099 | SEO, schema, and content-signal drift monitoring | T+0 through Week 6 |
| WS-G | RHI-100 | Security and domain posture monitoring | T+0 through Week 6 |
| WS-H | RHI-101 | Stabilization cadence and weekly reviews (integration) | T+0 through Week 6 |
| WS-I | RHI-102 | Exit criteria verification and BAU handoff | Week 5–6 |
| Sign-off | RHI-103 | Phase 9 and migration closure sign-off | Week 7+ |

---

## Key Deliverables

| Deliverable | Ticket | File Path |
|-------------|--------|-----------|
| `monitoring/` directory structure | RHI-093 | `monitoring/` |
| Launch cutover log | RHI-094 | `monitoring/launch-cutover-log.md` |
| Search Console indexing report | RHI-095 | `monitoring/search-console-indexing-report.md` |
| URL Inspection sample report | RHI-095 | `monitoring/url-inspection-sample-report.json` |
| Sitemap processing report | RHI-095 | `monitoring/sitemap-processing-report.json` |
| Legacy route health report | RHI-096 | `monitoring/legacy-route-health-report.json` |
| Redirect retention calendar | RHI-096 | `monitoring/redirect-retention-calendar.md` |
| Incident logs (Sev-1/Sev-2) | RHI-097 | `monitoring/launch-cutover-log.md` + incident files |
| CWV Lighthouse trend | RHI-098 | `monitoring/cwv-lighthouse-trend.json` |
| Field CWV trend notes | RHI-098 | `monitoring/cwv-field-trend.md` |
| Canonical consistency report | RHI-099 | `monitoring/canonical-consistency-report.json` |
| Security and domain report | RHI-100 | `monitoring/security-domain-report.json` |
| Weekly stabilization reports (×4) | RHI-101 | Weekly report files |
| Stabilization summary | RHI-102 | `monitoring/stabilization-summary.md` |
| Phase 9 sign-off + git tag | RHI-103 | `monitoring/stabilization-summary.md` + `phase-9-signoff` tag |

---

## Monitoring Cadence Reference

| Period | Frequency | Workstreams Active |
|--------|-----------|-------------------|
| T-0 to T+4h | Every 15–30 min | WS-A, WS-D |
| Day 1–3 | 2× per day | WS-B, WS-C, WS-D, WS-E, WS-F, WS-G, WS-H |
| Week 1–2 | Daily standup | WS-B, WS-C, WS-D, WS-E, WS-F, WS-G, WS-H |
| Week 3–4 | Weekly review | WS-B, WS-C, WS-E, WS-F, WS-G, WS-H |
| Week 5–6 | Weekly review + exit prep | WS-B, WS-C, WS-E, WS-F, WS-G, WS-H, WS-I |

---

## Fixed Operational Thresholds

| Signal | Threshold | Escalation |
|--------|-----------|------------|
| Sev-1 route failures | ≥ 5 priority URLs unresolved within 60 min | Sev-1 → rollback or hotfix within 60 min |
| Soft-404 / not-found rate | ≥ 2% of sampled priority legacy routes in 24h | Sev-1 |
| Lighthouse Performance | < 90 for 3 consecutive daily runs on homepage/article | Sev-2 |
| Canonical consistency | Any mismatch on priority URL or > 0.5% in sample | Sev-1 |
| HTTPS enforcement | Enforce HTTPS unavailable 60 minutes after DNS propagation confirmation, or certificate invalid after enforcement is available | Sev-1 |
| LCP (field CWV, p75) | > 2.5 s | Track; escalate if trend worsening over 2+ weeks |
| INP (field CWV, p75) | > 200 ms | Track; escalate if trend worsening |
| CLS (field CWV, p75) | > 0.1 | Track; escalate if trend worsening |

---

## Phase 9 Definition of Done

All items below must be complete before migration is formally closed:

- [ ] RHI-093 Done — Phase 9 Bootstrap; all roles assigned; tooling confirmed; T-0 agreed
- [ ] RHI-094 Done — Cutover executed; no unresolved Sev-1 at T+6h; cutover log committed
- [ ] RHI-095 Done — Sitemap submitted; 6-week indexing transition monitored; stable trend confirmed
- [ ] RHI-096 Done — Priority legacy URL set approved; 12-month redirect retention calendar committed
- [ ] RHI-097 Done — No open Sev-1 for 14 consecutive days; all Sev-2s resolved or accepted with owners
- [ ] RHI-098 Done — Performance trend stable within Lighthouse and CWV thresholds through stabilization
- [ ] RHI-099 Done — Canonical/sitemap/schema consistency stable for two consecutive weekly audits
- [ ] RHI-100 Done — HTTPS enforced; TLS valid; no critical mixed content; domain verification active
- [ ] RHI-101 Done — All weekly reviews complete; defect burndown stable; BAU schedule drafted
- [ ] RHI-102 Done — All exit criteria met with evidence; stabilization summary signed; BAU handoff accepted
- [ ] RHI-103 Done — Phase 9 sign-off document committed; `phase-9-signoff` tag set; closure announced

---

## Non-Negotiable Phase 9 Constraints

These constraints are hard requirements from `analysis/plan/details/phase-9.md` — they are not optional and cannot be deferred:

1. **Canonical production host locked to `https://www.rhino-inquisitor.com`** for the full stabilization window.
2. **Search Console property verified and active before cutover starts** — sitemap submission requires it.
3. **Do not use the Change of Address tool** unless the registered domain itself changes; host/platform moves and path-level redirects do not qualify.
4. **Sitemap submitted on launch day must contain only final canonical URLs** — no helper, redirect, or draft pages.
5. **Redirect policy from Phase 6 must be enforceable in production for all priority legacy URLs.**
6. **Any critical URL returning `404`, `5xx`, or redirect loop is a launch-day Sev-1** regardless of traffic volume.
7. **`robots.txt` and `noindex` policies are controlled configuration** — no ad-hoc edits during stabilization.
8. **Mixed content on homepage or article template is release-blocking** on launch day.
9. **Rollback and hotfix operators assigned by name before T-0** — verbal or implicit assignment is not acceptable.
10. **Redirect retention for moved URLs maintained for minimum 12 months** — no unilateral expiry.
11. **Every Sev-1/Sev-2 incident must have a written timeline and root-cause entry** — no verbal-only resolutions.
12. **WordPress production stack remains rollback-ready through stabilization Week 6 by default**; any shorter window requires explicit risk acceptance and can never be below Week 2.

---

## Non-Negotiable Constraint Traceability

| Constraint | Primary Verification Ticket(s) | Evidence Required |
|------------|-------------------------------|-------------------|
| Canonical host lock to `https://www.rhino-inquisitor.com` | RHI-094, RHI-099, RHI-103 | Cutover log host checks + canonical consistency report |
| Search Console verified before cutover | RHI-093, RHI-095 | Bootstrap checklist + Search Console verification evidence |
| Change of Address not used for this migration type | RHI-095, RHI-103 | Search Console action log with no CoA action |
| Launch-day sitemap is canonical-only | RHI-094, RHI-095, RHI-099 | Sitemap processing report + canonical consistency report |
| Phase 6 redirect policy enforced on priority legacy routes | RHI-094, RHI-096 | Legacy route health report + disposition checks |
| Critical URL `404`/`5xx`/loop is Sev-1 | RHI-094, RHI-097 | Incident log + Sev classification records |
| `robots.txt` and `noindex` are controlled config | RHI-099, RHI-103 | SEO drift report + approved change log |
| Mixed content on homepage/article is release-blocking | RHI-094, RHI-100 | Launch smoke checks + security-domain report |
| Rollback and hotfix operators assigned by name pre-T-0 | RHI-093, RHI-097 | Bootstrap role assignment log |
| Redirect retention maintained for at least 12 months | RHI-096, RHI-102, RHI-103 | Redirect retention calendar with owners and review dates |
| Every Sev-1/Sev-2 has written timeline and RCA | RHI-097, RHI-102 | Incident entries linked to corrective actions |
| WordPress stack rollback-ready through default Week 6 window | RHI-093, RHI-102, RHI-103 | Exit review evidence + explicit risk-acceptance record if shortened |

---

## Cross-Phase Dependencies

| This Phase Consumes | From Phase Tickets | Required By |
|---------------------|--------------------|-------------|
| Phase 8 sign-off and Go/No-Go decision | RHI-092 (Phase 8) | RHI-093 |
| Launch runbook and rollback runbook | RHI-080, RHI-081 (Phase 7) | RHI-093, RHI-094 |
| Phase 8 gate pass summary and validation artifacts | RHI-091 (Phase 8) | RHI-093, RHI-094 |
| `phase-8-rc-v1` validated artifact tag | RHI-092 (Phase 8) | RHI-094 |
| GitHub Pages deployment workflow | RHI-074 (Phase 7) | RHI-094 |
| DNS configuration and custom domain | RHI-076 (Phase 7) | RHI-094 |
| Frozen URL manifest | RHI-063 (Phase 6) | RHI-094, RHI-096 |
| Redirect architecture | RHI-062 (Phase 6) | RHI-096 |
| Sitemap template | RHI-051 (Phase 5) | RHI-095, RHI-099 |
| SEO partials (canonical, OG, JSON-LD) | RHI-048, RHI-052 (Phase 5) | RHI-099 |
| Performance baseline | RHI-006 (Phase 1) | RHI-098 |
| SEO baseline (traffic, backlinks) | RHI-005 (Phase 1) | RHI-095, RHI-096 |

---

## Decision Ownership Reference

| Decision Area | Owner | Tickets |
|---------------|-------|---------|
| T-0 launch window date/time | Migration Owner | RHI-093 |
| Rollback vs hotfix decision | Incident Commander | RHI-097 |
| Exit criteria pass/fail | Migration Owner (lead) + all owners | RHI-102 |
| BAU monitoring ownership | Migration Owner (assigns) | RHI-102 |
| Redirect retention expiry decisions | SEO Owner | RHI-096 |
| Edge-layer escalation for redirect/header gaps | Engineering Owner | RHI-096, RHI-100 |
| Change-control approvals for SEO template changes | SEO Owner | RHI-099 |
| Phase 9 sign-off | Migration Owner, SEO Owner, Engineering Owner | RHI-103 |

---

## Search Tags

`phase-9` `cutover` `dns-cutover` `launch-window` `t-zero` `post-launch` `stabilization` `monitoring` `search-console` `sitemap-submission` `indexing-transition` `page-indexing-report` `url-inspection` `soft-404` `redirect-retention` `legacy-url` `redirect-health` `redirect-chains` `link-reclamation` `incident-response` `sev-1` `sev-2` `sev-3` `rollback` `hotfix` `incident-commander` `performance` `core-web-vitals` `cwv` `lcp` `inp` `cls` `lighthouse` `lhci` `field-cwv` `psi` `seo-drift` `canonical` `sitemap` `robots-txt` `structured-data` `json-ld` `open-graph` `social-preview` `schema-drift` `change-control` `security` `https` `tls` `mixed-content` `domain-verification` `security-headers` `csp` `github-pages` `edge-layer` `cdn` `bau-handoff` `bau-monitoring` `exit-criteria` `stabilization-summary` `redirect-retention-calendar` `stabilization-exit` `migration-closure` `phase-9-signoff` `wordpress-rollback` `dns` `cname` `apex-redirect` `host-consolidation` `canonical-host` `noindex-leakage` `crawlability` `googleapis` `search-console-api`
