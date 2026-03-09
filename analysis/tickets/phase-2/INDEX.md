# Phase 2 Ticket Index

## Project: Rhino Inquisitor — WordPress to Hugo Migration

**Phase:** 2 — Stack and Architecture Decision  
**Goal:** Lock the final generator, deployment model, content model, route and redirect strategy, SEO template obligations, tooling list, and validation gate specifications required before Phase 3 scaffolding begins. No implementation — decisions and approved contracts only.  
**Timeline:** 6–8 working days  
**Phase detail:** [`analysis/plan/details/phase-2.md`](../../analysis/plan/details/phase-2.md)

---

## Ticket Summary

| Ticket ID | Title | Workstream | Priority | Status | Estimate | Target Date | Depends On |
|-----------|-------|------------|----------|--------|----------|-------------|------------|
| [RHI-010](RHI-010-phase-2-bootstrap.md) | Phase 2 Bootstrap: Kickoff and Decision Owner Alignment | Setup | Critical | Done | S | 2026-03-17 | RHI-009 |
| [RHI-011](RHI-011-generator-repo-contract.md) | Workstream A — Generator and Repo Contract | WS-A | Critical | Done | M | 2026-03-19 | RHI-010 |
| [RHI-012](RHI-012-content-model-contract.md) | Workstream B — Content Model and Front Matter Contract | WS-B | Critical | Done | M | 2026-03-19 | RHI-010, RHI-003 |
| [RHI-013](RHI-013-route-redirect-contract.md) | Workstream C — Route and Redirect Contract | WS-C | Critical | Done | L | 2026-03-20 | RHI-010, RHI-004, RHI-012 |
| [RHI-014](RHI-014-seo-discoverability-contract.md) | Workstream D — SEO and Discoverability Contract | WS-D | High | Done | M | 2026-03-20 | RHI-010, RHI-011, RHI-013 |
| [RHI-015](RHI-015-library-tooling-contract.md) | Workstream E — Library and Tooling Contract | WS-E | Medium | Done | S | 2026-03-18 | RHI-010 |
| [RHI-016](RHI-016-deployment-operations-contract.md) | Workstream F — Deployment and Operations Contract | WS-F | High | Done | M | 2026-03-20 | RHI-010, RHI-011 |
| [RHI-017](RHI-017-validation-gates-contract.md) | Validation Gates Contract Definition | Gates | High | Done | M | 2026-03-21 | RHI-011, RHI-012, RHI-013, RHI-014, RHI-016 |
| [RHI-018](RHI-018-phase-2-signoff.md) | Phase 2 Sign-off and Handover to Phase 3 | Sign-off | Critical | Open | S | 2026-03-24 | RHI-010 through RHI-017 |

---

## Dependency Graph

```
RHI-009 (Phase 1 Sign-off)
    └── RHI-010 (Phase 2 Bootstrap)
            ├── RHI-011 (WS-A: Generator & Repo)
            │       └── RHI-016 (WS-F: Deployment & Ops)
            │               └─┐
            ├── RHI-012 (WS-B: Content Model)          │
            │       └── RHI-013 (WS-C: Route & Redirects) ─┤
            │               └── RHI-014 (WS-D: SEO & Discovery) ─┤
            │                                                      │
            └── RHI-015 (WS-E: Library & Tooling)                 │
                                                                   │
[RHI-011 + RHI-012 + RHI-013 + RHI-014 + RHI-016] ──────────► RHI-017 (Validation Gates)
                                                                   │
[RHI-010…RHI-017 all Done] ──────────────────────────────────► RHI-018 (Sign-off)
```

> **Reading the graph:** RHI-010 is the hard gate — nothing in Phase 2 starts before it. WS-A (RHI-011) and WS-B (RHI-012) can run in parallel after RHI-010. WS-C (RHI-013) requires both WS-B and Phase 1 URL classification (RHI-004). WS-D (RHI-014) requires WS-A and WS-C. WS-E (RHI-015) is the lowest-dependency workstream and can start immediately after RHI-010. WS-F (RHI-016) depends on WS-A only. RHI-017 collects outputs from all contracts and must wait for them. RHI-018 waits for everything.

---

## Key Deliverables

| Deliverable | Ticket | File Path |
|-------------|--------|-----------|
| Generator and repo architecture decision | RHI-011 | Recorded in RHI-011 Outcomes |
| Content model and front matter contract | RHI-012 | Recorded in RHI-012 Outcomes |
| Route and redirect contract | RHI-013 | Recorded in RHI-013 Outcomes |
| Updated URL manifest (system endpoints) | RHI-013 | `migration/url-manifest.json` |
| Pagination priority manifest schema | RHI-013 | `migration/pagination-priority-manifest.json` (schema only) |
| SEO template obligation matrix | RHI-014 | Recorded in RHI-014 Outcomes |
| Approved tooling list | RHI-015 | Recorded in RHI-015 Outcomes |
| Deployment and operations contract | RHI-016 | Recorded in RHI-016 Outcomes |
| Validation gate specifications | RHI-017 | Recorded in RHI-017 Outcomes |
| Phase 2 sign-off | RHI-018 | `migration/phase-2-signoff.md` |

---

## Phase 2 Definition of Done

All items below must be complete before Phase 3 work begins:

- [x] RHI-010 Done — Phase 2 kickoff, decision owners confirmed, all Phase 1 deliverables accessible
- [x] RHI-011 Done — Hugo project layout, root `hugo.toml`, canonical `baseURL`, environment model, and version pin all approved
- [x] RHI-012 Done — All front matter fields, normalization rules, and `draft` lifecycle approved
- [x] RHI-013 Done — Host/trailing-slash/case policy, taxonomy routes, redirect mechanism, edge threshold, legacy endpoints, and pagination policy all approved
- [x] RHI-014 Done — SEO metadata obligations, JSON-LD schema, sitemap, and robots policy approved
- [x] RHI-015 Done — Tooling list approved; security checks passed; optional package decisions recorded
- [x] RHI-016 Done — Deployment workflow contract approved; rollback plan documented
- [x] RHI-017 Done — All seven validation gates specified with pass/fail criteria, blocking levels, evidence outputs, and implementation phase ownership
- [ ] RHI-018 Done — Stakeholder sign-off recorded; Phase 3 team notified

---

## Decision Ownership Reference

| Decision Area | Owner | Tickets |
|---------------|-------|---------|
| Redirect architecture, threshold enforcement, rollout acceptance | Migration Owner | RHI-013 |
| URL-change threshold usage, endpoint retire/keep, pagination parity exceptions | SEO Owner | RHI-013, RHI-014 |
| Implementation feasibility for Pages-only vs. edge-layer path | Engineering Owner | RHI-013, RHI-016 |
| Hugo version pin and project layout | Engineering Owner | RHI-011 |
| SEO template obligations and schema requirements | SEO Owner | RHI-014 |
| Tooling and dependency approvals | Engineering Owner | RHI-015 |
| CI workflow permissions and deployment contract | Engineering Owner | RHI-016 |

---

## Cross-Phase Dependencies

| This Phase Input | From Phase 1 Ticket | Required By |
|------------------|---------------------|-------------|
| `migration/url-manifest.json` | RHI-004 | RHI-013 (redirect contract), RHI-017 (Gate 1 spec) |
| `migration/url-inventory.normalized.json` | RHI-002 | RHI-013 (taxonomy route validation) |
| URL invariant policy | RHI-003 | RHI-012 (url normalization rules) |
| `migration/phase-1-seo-baseline.md` | RHI-005 | RHI-014 (SEO contract baseline) |
| `migration/risk-register.md` | RHI-008 | RHI-010 (risk context for decisions) |

---

## Search Tags

`phase-2` `architecture-decision` `hugo` `github-pages` `front-matter-contract` `redirect-contract` `url-policy` `seo-contract` `deployment-contract` `validation-gates` `tooling` `migration` `static-site` `wordpress-to-hugo`
