# Phase 1 Ticket Index

## Project: Rhino Inquisitor — WordPress to Hugo Migration

**Phase:** 1 — Baseline and URL Inventory  
**Goal:** Establish an authoritative migration baseline covering all live URLs, SEO metrics, performance benchmarks, and risk register before any implementation begins.  
**Timeline:** 6–8 working days  
**Phase detail:** [`analysis/plan/details/phase-1.md`](../../analysis/plan/details/phase-1.md)

---

## Ticket Summary

| Ticket ID | Title | Workstream | Priority | Status | Estimate | Target Date | Depends On |
|-----------|-------|------------|----------|--------|----------|-------------|------------|
| [RHI-001](RHI-001-phase-1-bootstrap.md) | Phase 1 Bootstrap: Access, Tooling, and Environment | Setup | Critical | Done | S | 2026-03-07 | — |
| [RHI-002](RHI-002-url-discovery-inventory.md) | URL Discovery and Inventory | WS1 | Critical | In Progress | L | 2026-03-09 | RHI-001 |
| [RHI-003](RHI-003-url-invariant-policy.md) | Canonical and URL Invariant Policy | WS2 | Critical | Open | M | 2026-03-10 | RHI-002 |
| [RHI-004](RHI-004-url-classification-mapping.md) | URL Classification and Disposition Mapping | WS3 | Critical | Open | L | 2026-03-11 | RHI-002, RHI-003 |
| [RHI-005](RHI-005-seo-baseline.md) | SEO Baseline Capture | WS4 | High | Open | M | 2026-03-12 | RHI-001 |
| [RHI-006](RHI-006-performance-ux-baseline.md) | Performance and UX Baseline | WS5 | High | Open | M | 2026-03-12 | RHI-001 |
| [RHI-007](RHI-007-staging-indexing-guardrails.md) | Staging and Indexing Guardrails | WS6 | Medium | Open | S | 2026-03-13 | RHI-003 |
| [RHI-008](RHI-008-risk-register.md) | Risk Register and Mitigations | WS7 | High | Open | M | 2026-03-12 | RHI-002, RHI-003, RHI-004 |
| [RHI-009](RHI-009-phase-1-signoff.md) | Phase 1 Sign-off and Handover to Phase 2 | Sign-off | Critical | Open | S | 2026-03-16 | RHI-002 through RHI-008 |

---

## Dependency Graph

```
RHI-001 (Bootstrap)
    ├── RHI-002 (URL Discovery)
    │       └── RHI-003 (URL Invariant Policy)
    │               └── RHI-007 (Staging Guardrails)
    ├── RHI-005 (SEO Baseline)
    └── RHI-006 (Performance Baseline)

[RHI-002 + RHI-003] ──────────────────► RHI-004 (URL Classification)

[RHI-002 + RHI-003 + RHI-004] ────────► RHI-008 (Risk Register)

[RHI-001…RHI-008 all Done] ───────────► RHI-009 (Sign-off)
```

> **Reading the graph:** RHI-004 has two direct blockers — RHI-002 (inventory) and RHI-003 (policy). RHI-008 collects risks from all three workstreams and must wait for RHI-002, RHI-003, and RHI-004 to be Done or in final review. RHI-005, RHI-006, and RHI-007 can run in parallel with RHI-004 and RHI-008 once their own blockers are clear.

---

## Key Deliverables

| Deliverable | Ticket | File Path |
|-------------|--------|-----------|
| Raw URL inventory | RHI-002 | `migration/url-inventory.raw.json` |
| Normalised URL inventory | RHI-002 | `migration/url-inventory.normalized.json` |
| URL class matrix | RHI-003 | `migration/url-class-matrix.json` |
| URL manifest (JSON) | RHI-004 | `migration/url-manifest.json` |
| URL manifest (CSV) | RHI-004 | `migration/url-manifest.csv` |
| SEO baseline report | RHI-005 | `migration/phase-1-seo-baseline.md` |
| Performance baseline | RHI-006 | `migration/phase-1-performance-baseline.md` |
| Security header matrix | RHI-005 | `migration/phase-1-security-header-matrix.md` |
| Risk register | RHI-008 | `migration/risk-register.md` |
| Phase 1 sign-off | RHI-009 | `migration/phase-1-signoff.md` |

---

## Phase 1 Definition of Done

All items below must be complete before Phase 2 work begins:

- [x] RHI-001 Done — access confirmed, tooling installed
- [ ] RHI-002 Done — all sitemap URLs in normalised inventory
- [ ] RHI-003 Done — canonical/slash/case/query policies approved
- [ ] RHI-004 Done — 100% URL mapping completeness, every URL has implementable behaviour
- [ ] RHI-005 Done — SEO baseline approved as launch benchmark
- [ ] RHI-006 Done — performance and accessibility baselines captured
- [ ] RHI-007 Done — staging noindex and DNS TTL plan approved
- [ ] RHI-008 Done — risk owners and mitigations documented
- [ ] RHI-009 Done — stakeholder sign-off recorded

---

## Search Tags

`phase-1` `url-inventory` `seo-baseline` `url-manifest` `url-classification` `canonical-policy` `risk-register` `staging` `wordpress` `hugo` `migration` `github-pages`
