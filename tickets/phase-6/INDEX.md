# Phase 6 Ticket Index

## Project: Rhino Inquisitor — WordPress to Hugo Migration

**Phase:** 6 — URL Preservation and Redirect Strategy  
**Goal:** Convert URL preservation and redirect behavior from documentation into release-blocking engineering controls, ensuring every legacy route has a deterministic, tested outcome — `keep`, `redirect`, or `retire` — before DNS cutover, with zero redirect chains, zero soft-404 patterns, zero open redirect vulnerabilities, and a fully drilled rollback plan.  
**Timeline:** 6–9 working days  
**Phase detail:** [`analysis/plan/details/phase-6.md`](../../analysis/plan/details/phase-6.md)

---

## Ticket Summary

| Ticket ID | Title | Workstream | Priority | Status | Estimate | Target Date | Depends On |
|-----------|-------|------------|----------|--------|----------|-------------|------------|
| [RHI-061](RHI-061-phase-6-bootstrap.md) | Phase 6 Bootstrap: Kickoff and Redirect Governance Environment Setup | Setup | Critical | Open | S | 2026-05-05 | RHI-060 |
| [RHI-062](RHI-062-redirect-architecture-decision.md) | Redirect Architecture Decision Record | ADR | Critical | Open | S | 2026-05-06 | RHI-061 |
| [RHI-063](RHI-063-legacy-url-inventory-finalization.md) | Workstream A — Legacy URL Inventory Finalization | WS-A | Critical | Open | M | 2026-05-07 | RHI-061 |
| [RHI-064](RHI-064-redirect-mapping-intent-review.md) | Workstream B — Redirect Mapping Specification and Intent Review | WS-B | Critical | Open | M | 2026-05-08 | RHI-062, RHI-063 |
| [RHI-065](RHI-065-hugo-route-preservation-alias-integration.md) | Workstream C — Hugo Route Preservation and Alias Integration | WS-C | Critical | Open | L | 2026-05-09 | RHI-062, RHI-064 |
| [RHI-066](RHI-066-host-protocol-canonical-consolidation.md) | Workstream D — Host and Protocol Canonical Consolidation | WS-D | High | Open | M | 2026-05-12 | RHI-061 |
| [RHI-067](RHI-067-retirement-error-path-governance.md) | Workstream E — Retirement and Error Path Governance | WS-E | High | Open | M | 2026-05-12 | RHI-063, RHI-064, RHI-062 |
| [RHI-068](RHI-068-security-privacy-redirect-controls.md) | Workstream F — Security and Privacy Controls for Redirect Logic | WS-F | High | Open | S | 2026-05-13 | RHI-065, RHI-062 |
| [RHI-069](RHI-069-redirect-observability-reporting.md) | Workstream G — Redirect Observability and Reporting | WS-G | High | Open | M | 2026-05-14 | RHI-063, RHI-064, RHI-065, RHI-066 |
| [RHI-070](RHI-070-ci-release-gates.md) | Workstream H — CI and Release Gates for URL Preservation | WS-H | Critical | Open | M | 2026-05-15 | RHI-063 through RHI-069 |
| [RHI-071](RHI-071-cutover-readiness-rollback-design.md) | Workstream I — Cutover Readiness and Rollback Design | WS-I | Critical | Open | M | 2026-05-16 | RHI-062, RHI-066, RHI-068, RHI-069, RHI-070 |
| [RHI-072](RHI-072-phase-6-signoff.md) | Phase 6 Sign-off and Handover to Phase 7/8 | Sign-off | Critical | Open | S | 2026-05-19 | RHI-061 through RHI-071 |

---

## Dependency Graph

```
RHI-060 (Phase 5 Sign-off)
    └── RHI-061 (Phase 6 Bootstrap)
            ├── RHI-062 (ADR: Redirect Architecture Decision) ◄─── runs in parallel with WS-A
            │       └── [unlocks WS-B, WS-C, WS-E, WS-F]
            │
            ├── RHI-063 (WS-A: Legacy URL Inventory Finalization)
            │       └── RHI-064 (WS-B: Redirect Mapping Intent Review) ◄─── also needs RHI-062
            │               └── RHI-065 (WS-C: Hugo Route Preservation) ◄─── also needs RHI-062
            │                       ├── RHI-068 (WS-F: Security Controls) ◄─── also needs RHI-062
            │                       └── RHI-069 (WS-G: Observability) ◄─── also needs RHI-063, RHI-064, RHI-066
            │
            ├── RHI-066 (WS-D: Host & Protocol Consolidation) ◄─── parallel from Day 1
            │       └── RHI-069 (WS-G) ◄─── canonical alignment needs WS-D
            │
            └── [RHI-063 + RHI-064 + RHI-062 Done] → RHI-067 (WS-E: Retirement)

[RHI-063 through RHI-069 all Done] ────────────────────────► RHI-070 (WS-H: CI Gates)

[RHI-062 + RHI-066 + RHI-068 + RHI-069 + RHI-070 all Done] ► RHI-071 (WS-I: Cutover Readiness)

[RHI-061 through RHI-071 all Done] ────────────────────────► RHI-072 (Sign-off)
```

> **Reading the graph:** RHI-061 is the hard entry gate. RHI-062 (architecture decision) must be resolved by Day 2 — it is the highest-risk scheduling dependency in Phase 6. WS-A (inventory) and RHI-062 (ADR) run in parallel starting Day 1. WS-B and WS-C are sequentially gated on WS-A + ADR. WS-D (host/protocol) is independent and can run in parallel from Day 1. WS-E (retirement) requires WS-A + WS-B + ADR. WS-F (security) requires WS-C. WS-G (reporting) requires WS-A through WS-D plus WS-C. WS-H (CI gates) is the integration layer, requiring all workstreams except WS-I. WS-I (cutover readiness) requires WS-H, WS-D, WS-F, and WS-G. Sign-off requires all workstreams.

---

## Phase 6 Workstream Map

| Workstream | Ticket | Focus Area | Timeline (Days) |
|------------|--------|------------|-----------------|
| ADR | RHI-062 | Redirect architecture model decision | Day 1–2 |
| WS-A | RHI-063 | Legacy URL inventory finalization | Day 1–2 |
| WS-B | RHI-064 | Redirect mapping and intent review | Day 2–3 |
| WS-D | RHI-066 | Host and protocol canonical consolidation | Day 1–3 |
| WS-C | RHI-065 | Hugo route preservation and alias implementation | Day 3–5 |
| WS-E | RHI-067 | Retirement and error path governance | Day 3–4 |
| WS-F | RHI-068 | Security and privacy controls | Day 5 |
| WS-G | RHI-069 | Observability and reporting | Day 5–6 |
| WS-H | RHI-070 | CI and release gates | Day 6–7 |
| WS-I | RHI-071 | Cutover readiness and rollback design | Day 7–8 |

---

## Key Deliverables

| Deliverable | Ticket | File Path |
|-------------|--------|-----------|
| Redirect architecture decision record | RHI-062 | `migration/phase-6-redirect-architecture-decision.md` |
| Finalized URL manifest | RHI-063 | `migration/url-manifest.json` |
| URL mapping table | RHI-063 | `migration/url-map.csv` |
| URL inventory validation script | RHI-063 | `scripts/phase-6/validate-url-inventory.js` |
| Intent review report | RHI-064 | `migration/reports/phase-6-redirect-intent-review.csv` |
| Alias page validation script | RHI-065 | `scripts/phase-6/validate-alias-pages.js` |
| Redirect chain detection script | RHI-065 | `scripts/phase-6/check-redirect-chains.js` |
| Host/protocol validation script | RHI-066 | `scripts/phase-6/check-host-protocol.js` |
| Retired URL audit report | RHI-067 | `migration/reports/phase-6-retired-url-audit.csv` |
| Custom 404 page (content) | RHI-067 | `content/404.md` |
| Custom 404 layout | RHI-067 | `layouts/404.html` |
| Retirement policy validation script | RHI-067 | `scripts/phase-6/check-retirement-policy.js` |
| Redirect security validation script | RHI-068 | `scripts/phase-6/check-redirect-security.js` |
| URL preservation and policy document | RHI-066, RHI-067, RHI-068 | `migration/phase-6-url-policy.md` |
| Coverage report | RHI-069 | `migration/reports/phase-6-coverage.csv` |
| Chains and loops report | RHI-069 | `migration/reports/phase-6-chains-loops.csv` |
| Canonical alignment report | RHI-069 | `migration/reports/phase-6-canonical-alignment.csv` |
| Coverage report generation script | RHI-069 | `scripts/phase-6/generate-coverage-report.js` |
| Canonical alignment report script | RHI-069 | `scripts/phase-6/generate-canonical-alignment-report.js` |
| Redirect target existence check | RHI-070 | `scripts/phase-6/check-redirect-targets.js` |
| Phase 6 gate summary | RHI-072 | `migration/reports/phase-6-gate-summary.csv` |
| Cutover runbook | RHI-071 | `migration/phase-6-cutover-runbook.md` |
| Rollback runbook | RHI-071 | `migration/phase-6-rollback-runbook.md` |
| Phase 6 sign-off document | RHI-072 | `migration/phase-6-signoff.md` |

---

## Phase 6 CI Gate Reference

All gates are blocking pre-deploy steps. Failure of any gate prevents artifact upload and deployment.

| Gate | Script | Blocking? | Zero-Tolerance? |
|------|--------|-----------|-----------------|
| URL manifest completeness and schema check | `npm run validate:url-inventory` | Yes | Yes (missing outcomes) |
| Legacy URL coverage against Hugo build | `npm run check:url-parity` | Yes | Yes |
| Redirect target existence in production build | `npm run check:redirect-targets` | Yes | Yes |
| Redirect chain and loop detection | `npm run check:redirect-chains` | Yes | Yes (any chain or loop) |
| Canonical tag and sitemap alignment | `npm run check:canonical-alignment` | Yes | Yes (any mismatch) |
| Retired URL absence from sitemap and aliases | `npm run check:retirement-policy` | Yes | Yes |
| Canonical host/protocol invariant check | `npm run check:host-protocol` | Yes | Yes (any non-canonical host) |
| Open redirect and HTTPS destination check | `npm run check:redirect-security` | Yes | Yes (off-site or HTTP redirect) |

---

## Phase 6 Definition of Done

All items below must be complete before Phase 7 DNS cutover and Phase 8 launch readiness can finalize their release assessments:

- [ ] RHI-061 Done — Phase 6 Bootstrap; Phase 5 contracts and tooling environment confirmed
- [ ] RHI-062 Done — Redirect architecture decision committed and signed off by SEO and Engineering owners
- [ ] RHI-063 Done — 100% URL inventory coverage; finalized manifest committed; validation script passing
- [ ] RHI-064 Done — 100% of redirect rows have approved intent class; zero deferred or unresolved mappings
- [ ] RHI-065 Done — All `keep` URLs render as content pages; all approved redirects implemented; zero chains; sitemap clean
- [ ] RHI-066 Done — Canonical tags and sitemap use `https://www.rhino-inquisitor.com/` exclusively; DNS consolidation plan documented
- [ ] RHI-067 Done — All retired URLs have explicit outcome; custom 404 page deployed; zero soft-404 redirects
- [ ] RHI-068 Done — Zero off-site alias destinations; zero HTTP destinations; security sign-off recorded
- [ ] RHI-069 Done — Coverage report 100%; chains/loops report zero; canonical alignment report zero mismatches; post-launch monitoring thresholds documented
- [ ] RHI-070 Done — All Phase 6 CI gates integrated and passing on latest `main` build
- [ ] RHI-071 Done — Redirect map frozen with git tag; rollback drill complete; cutover and rollback runbooks committed
- [ ] RHI-072 Done — Stakeholder sign-off recorded; Phase 7/8 notified and handover acknowledged

---

## Non-Negotiable Phase 6 Constraints

These constraints are hard requirements from `analysis/plan/details/phase-6.md` — they are not optional and cannot be deferred to a later phase:

1. Every legacy URL in scope has one explicit and testable outcome: `keep`, `redirect`, or `retire`.
2. Redirect chains for migration routes are **zero-tolerance** — no path may have more than one hop.
3. Redirect loops are **zero-tolerance**.
4. Broad fallback redirects of unrelated content to homepage are **blocked** — this is a soft-404 defect.
5. Canonical URL, sitemap URL, and internal-link destination must **agree** for each indexable target.
6. Redirect destinations must preserve content **intent** — topic-equivalent outcome required.
7. Redirect behavior and mapping must be **frozen before the launch window** (git tag applied).
8. **Security**: redirect destinations come from the static manifest only — no user-supplied destination parameters.

---

## Cross-Phase Dependencies

| This Phase Consumes | From Phase Tickets | Required By |
|---------------------|--------------------|-------------|
| URL inventory and disposition decisions | RHI-002, RHI-004 (Phase 1) | RHI-063, RHI-064 |
| SEO baseline (traffic and backlink data) | RHI-005 (Phase 1) | RHI-063, RHI-069, RHI-071 |
| Route and redirect contract | RHI-013 (Phase 2) | RHI-062 |
| Hugo config (`baseURL`) | RHI-021 (Phase 3) | RHI-066 |
| SEO partial templates (canonical tag) | RHI-024 (Phase 3) | RHI-066, RHI-069 |
| URL parity baseline script | RHI-025 (Phase 3) | RHI-070 |
| CI/CD pipeline | RHI-029 (Phase 3) | RHI-070 |
| Content files with `url:` and `aliases:` front matter | RHI-035, RHI-036 (Phase 4) | RHI-063, RHI-065 |
| Internal link rewrites | RHI-038 (Phase 4) | RHI-071 |
| Canonical policy and redirect signal matrix | RHI-048, RHI-049 (Phase 5) | RHI-061, RHI-062 |
| Phase 5 SEO contract | RHI-060 (Phase 5 sign-off) | RHI-061 |

---

## Decision Ownership Reference

| Decision Area | Owner | Tickets |
|---------------|-------|---------|
| Redirect architecture model (A vs B vs hybrid) | SEO Owner, Engineering Owner | RHI-062 |
| URL disposition changes during inventory review | SEO Owner | RHI-063 |
| Redirect intent class approval | SEO Owner | RHI-064 |
| Alias implementation approach per URL class | Engineering Owner | RHI-065 |
| DNS consolidation mechanism (apex-to-www) | Engineering Owner | RHI-066 |
| Retirement outcome per URL class | SEO Owner | RHI-067 |
| Security review sign-off | Engineering Owner | RHI-068 |
| Post-launch incident trigger thresholds | SEO Owner, Engineering Owner | RHI-069, RHI-071 |
| Rollback authorization | Migration Owner | RHI-071 |
| Phase 6 sign-off | Migration Owner, SEO Owner, Engineering Owner | RHI-072 |

---

## Search Tags

`phase-6` `url-preservation` `redirects` `redirect-architecture` `adr` `hugo-aliases` `static-redirects` `edge-redirects` `url-manifest` `url-map` `redirect-chains` `soft-404` `canonical-consolidation` `host-protocol` `apex-www` `https-enforcement` `retirement` `404-page` `410-gone` `open-redirect` `redirect-security` `owasp` `observability` `coverage-report` `canonical-alignment` `ci-gates` `url-parity` `cutover-runbook` `rollback-runbook` `rollback-drill` `launch-window` `dns-cutover` `search-console` `git-tag` `freeze` `github-pages` `deployment`
