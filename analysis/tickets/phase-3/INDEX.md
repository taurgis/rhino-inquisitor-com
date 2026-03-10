# Phase 3 Ticket Index

## Project: Rhino Inquisitor — WordPress to Hugo Migration

**Phase:** 3 — Repository Scaffolding and Quality Baseline  
**Goal:** Build a production-ready Hugo repository baseline — project structure, configuration, templates, SEO foundation, URL parity framework, CI quality gates, and deployment workflow — so that Phase 4 content migration can proceed without reworking architecture, SEO foundations, or deployment mechanics.  
**Timeline:** 7–10 working days  
**Phase detail:** [`analysis/plan/details/phase-3.md`](../../analysis/plan/details/phase-3.md)

---

## Ticket Summary

| Ticket ID | Title | Workstream | Priority | Status | Estimate | Target Date | Depends On |
|-----------|-------|------------|----------|--------|----------|-------------|------------|
| [RHI-019](RHI-019-phase-3-bootstrap.md) | Phase 3 Bootstrap: Kickoff and Environment Readiness | Setup | Critical | Done | S | 2026-03-25 | RHI-018 |
| [RHI-020](RHI-020-repository-bootstrap.md) | Workstream A — Repository Bootstrap | WS-A | Critical | Done | S | 2026-03-26 | RHI-019 |
| [RHI-021](RHI-021-hugo-config-hardening.md) | Workstream B — Hugo Configuration Hardening | WS-B | Critical | Done | M | 2026-03-27 | RHI-019, RHI-020 |
| [RHI-022](RHI-022-content-contract-archetypes.md) | Workstream C — Content Contract and Archetypes | WS-C | Critical | Done | M | 2026-03-28 | RHI-019, RHI-021 |
| [RHI-023](RHI-023-template-scaffolding.md) | Workstream D — Template Scaffolding and Rendering Model | WS-D | Critical | Done | L | 2026-04-01 | RHI-019, RHI-021, RHI-022 |
| [RHI-024](RHI-024-seo-foundation.md) | Workstream E — SEO Foundation Implementation | WS-E | High | Done | M | 2026-04-02 | RHI-019, RHI-021, RHI-023 |
| [RHI-025](RHI-025-url-parity-redirect-baseline.md) | Workstream F — URL Preservation and Redirect Baseline | WS-F | Critical | Done | M | 2026-04-02 | RHI-019, RHI-021, RHI-022 |
| [RHI-026](RHI-026-asset-performance-baseline.md) | Workstream G — Asset and Performance Baseline | WS-G | Medium | Done | M | 2026-04-03 | RHI-019, RHI-023 |
| [RHI-027](RHI-027-accessibility-ux-baseline.md) | Workstream H — Accessibility and UX Baseline | WS-H | Medium | Open | M | 2026-04-03 | RHI-019, RHI-023 |
| [RHI-028](RHI-028-security-privacy-hardening.md) | Workstream I — Security, Privacy, and Operational Hardening | WS-I | Medium | Open | M | 2026-04-03 | RHI-019, RHI-021, RHI-023, RHI-024 |
| [RHI-029](RHI-029-cicd-deployment-scaffolding.md) | Workstream J — CI/CD and Deployment Scaffolding | WS-J | Critical | Done | L | 2026-04-04 | RHI-019, RHI-020 through RHI-025 |
| [RHI-104](RHI-104-discovery-surfaces-shared-ui-components.md) | Workstream K — Discovery Surfaces and Shared UI Components | WS-K | High | Done | L | 2026-04-05 | RHI-023, RHI-024, RHI-026, RHI-027 |
| [RHI-105](RHI-105-article-readability-contextual-navigation.md) | Workstream L — Article Readability and Contextual Navigation | WS-L | High | Done | L | 2026-04-07 | RHI-023, RHI-024, RHI-027, RHI-104 |
| [RHI-107](RHI-107-design-example-visual-alignment.md) | Workstream M — Design Example Visual Alignment | WS-M | High | Open | M | 2026-04-08 | RHI-104 |
| [RHI-030](RHI-030-phase-3-signoff.md) | Phase 3 Sign-off and Handover to Phase 4 | Sign-off | Critical | Open | S | 2026-04-08 | RHI-019 through RHI-029, RHI-104, RHI-105, RHI-107 |

---

## Dependency Graph

```
RHI-018 (Phase 2 Sign-off)
    └── RHI-019 (Phase 3 Bootstrap)
            └── RHI-020 (WS-A: Repository Bootstrap)
                    └── RHI-021 (WS-B: Hugo Config Hardening)
                            ├── RHI-022 (WS-C: Content Contract & Archetypes)
                            │       └── RHI-023 (WS-D: Template Scaffolding) ◄─ also needs RHI-022
                            │               ├── RHI-024 (WS-E: SEO Foundation)
                            │               ├── RHI-026 (WS-G: Asset & Performance)
                            │               ├── RHI-027 (WS-H: Accessibility)
                            │               ├── RHI-028 (WS-I: Security Hardening) ◄─ also needs RHI-024
                            │               └── RHI-104 (WS-K: Discovery UI & Shared Components) ◄─ also needs RHI-024, RHI-026, RHI-027
                            │                       ├── RHI-105 (WS-L: Article Readability & Contextual Navigation) ◄─ also needs RHI-024, RHI-027
                            │                       └── RHI-107 (WS-M: Design Example Visual Alignment)
                            └── RHI-025 (WS-F: URL Parity Baseline) ◄─ also needs RHI-022

[RHI-020 + RHI-021 + RHI-022 + RHI-023 + RHI-024 + RHI-025] ──► RHI-029 (WS-J: CI/CD)

[RHI-019…RHI-029 + RHI-104 + RHI-105 + RHI-107 all Done] ───────► RHI-030 (Sign-off)
```

> **Reading the graph:** RHI-019 is the hard gate — no Phase 3 workstream starts before it. RHI-020 and RHI-021 are the structural foundation; all other workstreams depend on them. RHI-022 (archetypes/validation) and RHI-023 (templates) can run in parallel after RHI-021. WS-E (RHI-024) depends on the template scaffold from RHI-023. WS-F (RHI-025, URL parity) also needs RHI-022 for the `url` validation logic. WS-G (RHI-026) and WS-H (RHI-027) depend only on the template scaffold. WS-I (RHI-028) waits for RHI-024 (staging noindex verified). WS-J (RHI-029, CI/CD) integrates all prior workstreams and must wait for all scripts to be ready. `RHI-104` closes the structural discovery surfaces, `RHI-107` owns screenshot-level homepage/archive/shared-shell parity, and `RHI-105` owns article implementation plus article screenshot parity. RHI-030 waits for everything.

---

## Key Deliverables

| Deliverable | Ticket | File Path |
|-------------|--------|-----------|
| Hugo project directory structure | RHI-020 | `src/content/`, `src/layouts/`, `src/static/`, `src/assets/`, `src/data/`, `src/archetypes/` |
| `.gitignore` with build exclusions | RHI-020 | `.gitignore` |
| `README.md` with build commands | RHI-020 | `README.md` |
| Migration operational runbook | RHI-020 | `docs/migration/RUNBOOK.md` |
| Hardened `hugo.toml` | RHI-021 | `hugo.toml` |
| Staging environment config | RHI-021, RHI-024 | `config/staging/hugo.toml` |
| Hugo archetypes | RHI-022 | `src/archetypes/posts.md`, `src/archetypes/pages.md`, `src/archetypes/categories.md`, `src/archetypes/default.md` |
| Front matter validation script | RHI-022 | `scripts/validate-frontmatter.js` |
| Base template and SEO partials | RHI-023 | `src/layouts/_default/baseof.html`, `src/layouts/partials/seo/` |
| Primary section and taxonomy templates | RHI-023 | `src/layouts/home.html`, `src/layouts/_default/single.html`, `src/layouts/_default/list.html`, `src/layouts/_default/taxonomy.html`, `src/layouts/_default/term.html` |
| SEO smoke-check script | RHI-024 | `scripts/check-seo.js` |
| Validated `sitemap.xml` and `robots.txt` output | RHI-024 | Generated: `public/sitemap.xml`, `public/robots.txt` |
| URL parity script | RHI-025 | `scripts/check-url-parity.js` |
| URL parity report format | RHI-025 | `migration/url-parity-report.json` |
| Asset policy documentation | RHI-026 | `docs/migration/ASSET-POLICY.md` |
| Lighthouse CI configuration | RHI-026 | `lighthouserc.js` or `.lighthouserc.json` |
| Accessibility check configuration | RHI-027 | `.pa11yci.json` |
| Security control matrix | RHI-028 | `docs/migration/SECURITY-CONTROLS.md` |
| Pages deployment workflow | RHI-029 | `.github/workflows/deploy-pages.yml` |
| PR build validation workflow | RHI-029 | `.github/workflows/build-pr.yml` |
| Broken link check script | RHI-029 | `scripts/check-links.js` |
| Shared discovery UI partials | RHI-104 | `src/layouts/partials/site/`, `src/layouts/partials/cards/`, `src/layouts/home.html`, `src/layouts/_default/list.html`, `src/layouts/_default/taxonomy.html`, `src/layouts/_default/term.html` |
| Discovery-surface screenshot fidelity contract | RHI-107 | `analysis/design/generated-images/design-examples/`, `analysis/documentation/checklists/ui-implementation-checklist-2026-03-08.md`, homepage/archive/shared-shell templates and stylesheets |
| Article readability and contextual-navigation partials | RHI-105 | `src/layouts/_default/single.html`, `src/layouts/partials/article/`, `src/layouts/partials/breadcrumbs.html` |
| Phase 3 sign-off document | RHI-030 | `migration/phase-3-signoff.md` |

---

## Phase 3 Definition of Done

All items below must be complete before Phase 4 work begins:

- [x] RHI-019 Done — Phase 3 Bootstrap; Phase 2 contracts confirmed accessible
- [x] RHI-020 Done — Hugo project layout committed; clean clone builds with one command
- [x] RHI-021 Done — `hugo.toml` with `baseURL`, generated routes, outputs, robots generation, and build behavior locked
- [x] RHI-022 Done — Archetypes for all content types; `validate:frontmatter` script passing in CI
- [x] RHI-023 Done — All primary template types with shared SEO partials committed
- [ ] RHI-024 Done — SEO signals verified; sitemap/robots validated; staging noindex confirmed; `check:seo` passing
- [x] RHI-025 Done — URL parity script implemented; `check:url-parity` passing; parity report generated
- [x] RHI-026 Done — Asset policy documented; Lighthouse CI passing CWV targets on scaffold
- [ ] RHI-027 Done — WCAG AA automated checks passing; semantic structure and skip links in templates
- [ ] RHI-028 Done — Security control matrix committed; mixed-content clean; migration artifacts not exposed in `public/`
- [x] RHI-029 Done — Pages deployment workflow successful; preview-host deployment active at `https://taurgis.github.io/rhino-inquisitor-com/`; all quality gates blocking; PR build validation active
- [x] RHI-104 Done — Homepage, archive, taxonomy, and shared discovery UI implemented on the shipped scaffold paths
- [ ] RHI-107 Done — Homepage, archive, taxonomy, and shared shell visually align with the approved generated design examples
- [x] RHI-105 Done — Article readability, TOC, summary, contextual-navigation UI, and article screenshot parity implemented with graceful fallback behavior
- [ ] RHI-030 Done — Stakeholder sign-off recorded; Phase 4 team notified and handover package confirmed

---

## Quality Gate Reference

All blocking gates must be passing before Phase 4 begins. Staged baseline gates must be run and either pass or be risk-accepted before Phase 4 begins:

| Gate | Script | Blocking? | Phase Introduced |
|------|--------|-----------|-----------------|
| Hugo production build | `hugo --minify --environment production` | Yes | 3 |
| Front matter validation | `npm run validate:frontmatter` | Yes | 3 |
| URL parity check | `npm run check:url-parity` | Yes | 3 |
| SEO smoke check | `npm run check:seo` | Yes | 3 |
| Broken link check | `npm run check:links` | Yes | 3 |
| Accessibility check | `npm run check:a11y` | No (Staged in Phase 3; required for sign-off) | 3 |
| Performance check (Lighthouse CI) | `npm run check:perf` | No (Staged in Phase 3; required for sign-off) | 3 |

---

## Decision Ownership Reference

| Decision Area | Owner | Tickets |
|---------------|-------|---------|
| Hugo version pin and project layout | Engineering Owner | RHI-020, RHI-021 |
| Permalink and taxonomy configuration | Engineering Owner | RHI-021 |
| Feed endpoint policy (`/feed/` must resolve; legacy variants mapped) | SEO Owner | RHI-021, RHI-024 |
| Front matter contract enforcement | Engineering Owner | RHI-022 |
| SEO partial architecture and JSON-LD obligations | SEO Owner | RHI-023, RHI-024 |
| URL-change threshold and edge redirect requirement | SEO Owner, Migration Owner | RHI-025 |
| Asset budgets and CWV targets | Engineering Owner | RHI-026 |
| Accessibility conformance targets | Engineering Owner | RHI-027 |
| Security control layer assignments (Pages vs edge) | Engineering Owner | RHI-028 |
| CI deployment workflow and quality gates | Engineering Owner | RHI-029 |
| Shared discovery UI structural composition and archive UX scope | Engineering Owner | RHI-104 |
| Discovery-surface screenshot-level visual parity | Engineering Owner | RHI-107 |
| Article readability and contextual-navigation scope | Engineering Owner | RHI-105 |
| Phase 3 sign-off and Phase 4 readiness | Migration Owner | RHI-030 |

---

## Cross-Phase Dependencies

| This Phase Input | From Phase Tickets | Required By |
|------------------|--------------------|-------------|
| Hugo version pin | RHI-011 (Phase 2) | RHI-020, RHI-021, RHI-029 |
| Front matter contract | RHI-012 (Phase 2) | RHI-022, RHI-023 |
| Route and redirect contract | RHI-013 (Phase 2) | RHI-021, RHI-025 |
| SEO partial architecture | RHI-014 (Phase 2) | RHI-023, RHI-024 |
| Approved tooling list | RHI-015 (Phase 2) | RHI-022, RHI-026, RHI-027, RHI-029 |
| Deployment and operations contract | RHI-016 (Phase 2) | RHI-029 |
| Validation gate specifications | RHI-017 (Phase 2) | RHI-029 |
| `migration/url-manifest.json` | RHI-004 (Phase 1) | RHI-025 |

---

## Search Tags

`phase-3` `hugo-scaffold` `hugo-config` `archetypes` `front-matter` `templates` `seo-partials` `canonical` `open-graph` `json-ld` `sitemap` `robots-txt` `url-parity` `redirect-baseline` `asset-policy` `core-web-vitals` `lighthouse` `accessibility` `wcag` `security` `ci-cd` `github-pages` `deployment` `wordpress-to-hugo` `migration`
