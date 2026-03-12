# Phase 4 Ticket Index

## Project: Rhino Inquisitor — WordPress to Hugo Migration

**Phase:** 4 — Content Migration Pipeline  
**Goal:** Execute a controlled, auditable migration of all in-scope WordPress content into Hugo Markdown files, preserving URL equity, metadata quality, media integrity, internal link correctness, and indexability — without introducing regressions in SEO, accessibility, or security.  
**Timeline:** 10–15 working days  
**Phase detail:** [`analysis/plan/details/phase-4.md`](../../analysis/plan/details/phase-4.md)

---

## Ticket Summary

| Ticket ID | Title | Workstream | Priority | Status | Estimate | Target Date | Depends On |
|-----------|-------|------------|----------|--------|----------|-------------|------------|
| [RHI-031](RHI-031-phase-4-bootstrap.md) | Phase 4 Bootstrap: Kickoff and Pipeline Environment Setup | Setup | Critical | Done | S | 2026-04-09 | RHI-030 |
| [RHI-032](RHI-032-wordpress-content-extraction.md) | Workstream A — WordPress Content Extraction | WS-A | Critical | Done | M | 2026-04-11 | RHI-031 |
| [RHI-033](RHI-033-normalization-record-model.md) | Workstream B — Normalization and Canonical Record Model | WS-B | Critical | Done | M | 2026-04-14 | RHI-031, RHI-032 |
| [RHI-034](RHI-034-html-to-markdown-conversion.md) | Workstream C — HTML-to-Markdown Conversion Engine | WS-C | Critical | Done | L | 2026-04-16 | RHI-031, RHI-033 |
| [RHI-106](RHI-106-discovery-metadata-extension.md) | Workstream L — Discovery Metadata Extension and Enrichment | WS-L | High | Done | M | 2026-04-15 | RHI-012, RHI-031, RHI-033 |
| [RHI-035](RHI-035-front-matter-mapping.md) | Workstream D — Front Matter Mapping and Hugo Contract | WS-D | Critical | Done | M | 2026-04-16 | RHI-031, RHI-033, RHI-106 |
| [RHI-036](RHI-036-url-preservation-redirect-integrity.md) | Workstream E — URL Preservation and Redirect Integrity | WS-E | Critical | Done | M | 2026-04-17 | RHI-031, RHI-035 |
| [RHI-037](RHI-037-media-migration-asset-hygiene.md) | Workstream F — Media Migration and Asset Hygiene | WS-F | High | Done | L | 2026-04-18 | RHI-031, RHI-034 |
| [RHI-038](RHI-038-internal-link-navigation-rewrites.md) | Workstream G — Internal Link and Navigation Rewrites | WS-G | High | Done | M | 2026-04-18 | RHI-031, RHI-034, RHI-035, RHI-036 |
| [RHI-039](RHI-039-seo-signal-preservation.md) | Workstream H — SEO Signal Preservation | WS-H | High | Done | M | 2026-04-17 | RHI-031, RHI-035 |
| [RHI-040](RHI-040-accessibility-content-semantics.md) | Workstream I — Accessibility and Content Semantics | WS-I | Medium | Done | M | 2026-04-18 | RHI-031, RHI-034 |
| [RHI-041](RHI-041-security-data-hygiene.md) | Workstream J — Security and Data Hygiene | WS-J | Medium | Done | M | 2026-04-18 | RHI-031, RHI-034 |
| [RHI-042](RHI-042-reporting-traceability-audit.md) | Workstream K — Reporting, Traceability, and Audit | WS-K | High | Done | M | 2026-04-17 | RHI-031, RHI-032 |
| [RHI-043](RHI-043-pilot-batch-migration.md) | Batch 1 — Pilot Migration Run (20–30 Records) | Batch | Critical | Done | M | 2026-04-22 | RHI-032 through RHI-042 |
| [RHI-044](RHI-044-high-value-content-batch.md) | Batch 2 — High-Value Content Migration | Batch | Critical | Done | L | 2026-04-25 | RHI-043 |
| [RHI-045](RHI-045-long-tail-taxonomy-batch.md) | Batch 3 — Long-Tail and Taxonomy Migration | Batch | High | Done | L | 2026-04-29 | RHI-044 |
| [RHI-046](RHI-046-phase-4-signoff.md) | Phase 4 Sign-off and Handover to Phase 5/6 | Sign-off | Critical | Done | S | 2026-05-02 | RHI-031 through RHI-045 |

---

## Dependency Graph

```text
RHI-030 (Phase 3 Sign-off)
    └── RHI-031 (Phase 4 Bootstrap)
            ├── RHI-032 (WS-A: Extraction)
            │       └── RHI-033 (WS-B: Normalization)
            │               ├── RHI-034 (WS-C: HTML-to-MD Conversion) ◄─────────────────────┐
            │               ├── RHI-106 (WS-L: Discovery Metadata Extension) ─┐              │
            │               └── RHI-035 (WS-D: Front Matter Mapping) ◄─────────┘              │
            │                       ├── RHI-036 (WS-E: URL Preservation)                    │
            │                       └── RHI-039 (WS-H: SEO Signal Preservation)              │
            │                                                                                │
            ├── RHI-037 (WS-F: Media Migration) ◄─── needs RHI-034                          │
            ├── RHI-038 (WS-G: Internal Links)  ◄─── needs RHI-034, RHI-035, RHI-036        │
            ├── RHI-040 (WS-I: Accessibility)   ◄─── needs RHI-034 ──────────────────────────┘
            ├── RHI-041 (WS-J: Security)        ◄─── needs RHI-034
            └── RHI-042 (WS-K: Reporting)       ◄─── needs RHI-032

[RHI-032…RHI-042 all Done] ──────────────────► RHI-043 (Batch 1: Pilot)

[RHI-043 Done] ──────────────────────────────► RHI-044 (Batch 2: High-Value)

[RHI-044 Done] ──────────────────────────────► RHI-045 (Batch 3: Long-Tail)

[RHI-031…RHI-045 all Done] ─────────────────► RHI-046 (Sign-off)
```

> **Reading the graph:** RHI-031 is the hard gate — no Phase 4 workstream starts before it. RHI-032 (extraction) and RHI-033 (normalization) are the sequential foundation; all transformation workstreams depend on normalized records. RHI-034 (HTML-to-MD) and RHI-035 (front matter) can run in parallel after RHI-033. RHI-036 (URL) depends on RHI-035. RHI-037 (media) and WS-I (RHI-040), WS-J (RHI-041) depend on RHI-034. WS-G (RHI-038) depends on RHI-034 + RHI-035 + RHI-036. WS-K (RHI-042) reporting framework can be built early after extraction. All pipeline workstreams must be Done before the Pilot batch begins. Every batch uses the same post-mapping execution contract: `npm run migrate:map-frontmatter`, then `npm run migrate:finalize-content`, then `npm run migrate:report` before CI gates and PR review. Batches are sequential — each batch proves the pipeline before the next batch expands scope.

---

## Key Deliverables

| Deliverable | Ticket | File Path |
|-------------|--------|-----------|
| WordPress extraction dataset and source-channel summary | RHI-032 | `migration/input/`, `migration/intermediate/extract-summary.json` |
| Extract summary report | RHI-032 | `migration/intermediate/extract-summary.json` |
| Quarantine log | RHI-032 | `migration/intermediate/extract-quarantine.json` |
| Normalized canonical records | RHI-033 | `migration/intermediate/records.normalized.json` |
| Normalization schema (Zod) | RHI-033 | `scripts/migration/schemas/record.schema.js` |
| HTML-to-Markdown conversion script | RHI-034 | `scripts/migration/convert.js` |
| Conversion fallback log | RHI-034 | `migration/reports/conversion-fallbacks.csv` |
| Discovery metadata extension contract | RHI-106 | `scripts/migration/schemas/discovery-metadata.schema.js`, `src/archetypes/`, `scripts/validate-frontmatter.js`, `scripts/migration/map-frontmatter.js`, `src/layouts/partials/article/`, `analysis/documentation/phase-4/rhi-106-discovery-metadata-contract-2026-03-10.md` |
| Front matter mapping script | RHI-035 | `scripts/migration/map-frontmatter.js` |
| Front matter error report | RHI-035 | `migration/reports/frontmatter-errors.csv` |
| Curated image-alt corrections input | RHI-043, RHI-044, RHI-045 | `migration/input/image-alt-corrections.csv` |
| Content corrections summary | RHI-043, RHI-044, RHI-045 | `migration/reports/content-corrections-summary.json` |
| Image-alt corrections audit | RHI-043, RHI-044, RHI-045 | `migration/reports/image-alt-corrections-audit.csv` |
| URL parity validation script | RHI-036 | `scripts/migration/validate-url-parity.js` |
| Redirect integrity check script | RHI-036 | `scripts/migration/check-redirects.js` |
| Media download and relink script | RHI-037 | `scripts/migration/download-media.js` |
| Media integrity report | RHI-037 | `migration/reports/media-integrity-report.csv` |
| Internal link rewrite script | RHI-038 | `scripts/migration/rewrite-links.js` |
| SEO completeness validation script | RHI-039 | `scripts/migration/check-seo-completeness.js` |
| Feed compatibility validation script | RHI-039 | `scripts/migration/check-feed-compatibility.js` |
| Noindex validation script | RHI-039 | `scripts/check-noindex.js` |
| SEO completeness report | RHI-039 | `migration/reports/seo-completeness-report.csv` |
| Feed compatibility report | RHI-039 | `migration/reports/feed-compatibility-report.csv` |
| Accessibility scan config/script | RHI-040 | `scripts/migration/check-a11y-content.js` |
| Accessibility scan summary | RHI-040 | `migration/reports/accessibility-scan-summary.md` |
| Security content scan script | RHI-041 | `scripts/migration/check-security-content.js` |
| Security scan report | RHI-041 | `migration/reports/security-content-scan.csv` |
| Migration item report | RHI-042 | `migration/reports/migration-item-report.csv` |
| URL parity report | RHI-042 | `migration/reports/url-parity-report.csv` |
| Pilot batch content (20–30 files) | RHI-043 | `src/content/` |
| High-value batch content | RHI-044 | `src/content/` |
| Long-tail and taxonomy content | RHI-045 | `src/content/` |
| Phase 4 sign-off document | RHI-046 | `migration/phase-4-signoff.md` |

---

## Phase 4 Definition of Done

All items below must be complete before Phase 5/6/8 downstream work can consume Phase 4 outputs:

- [x] RHI-031 Done — Phase 4 Bootstrap; Phase 3 contracts and pipeline environment confirmed accessible and WordPress source artifacts verified
- [x] RHI-032 Done — WordPress content fully extracted; approved source-channel strategy, extract summary, and quarantine log committed
- [x] RHI-033 Done — All in-scope records normalized to canonical schema; 100% `targetUrl` coverage
- [x] RHI-034 Done — HTML-to-Markdown conversion engine operational; fallback policy applied and logged
- [x] RHI-106 Done — Discovery metadata extension documented, validated, and available to mapping and batch review flows
- [x] RHI-035 Done — Front matter mapping validated; zero required-field errors in release candidate batch
- [x] RHI-036 Done — URL parity passing; redirect integrity validated; zero unresolved failures on critical URLs
- [x] RHI-037 Done — All media downloaded and relinked; media integrity report clean; no hotlinks to deprecated WordPress paths
- [x] RHI-038 Done — Internal links rewritten to canonical paths; broken link scan passing on representative templates
- [x] RHI-039 Done — SEO completeness at 100% for title/description/canonical on all indexable pages; no unintended `noindex` in release artifacts
- [x] RHI-040 Done — Automated accessibility gate passing on sample set; manual checklist complete; no unresolved critical defects
- [x] RHI-041 Done — Security content scan clean for critical issues; no unsafe script fragments in generated output
- [x] RHI-042 Done — All migration reports generated, reproducible, and CI-attached; blocking thresholds enforced
- [x] RHI-043 Done — Pilot batch passed all CI gates; pipeline proven end-to-end on representative records; correction artifacts and idempotent rerun evidence attached to the pilot PR
- [x] RHI-044 Done — High-value batch committed and passing all gates; top-traffic pages verified manually; correction artifacts attached to the batch PR
- [x] RHI-045 Done — Long-tail and taxonomy batch correction evidence is refreshed, archive/category routes are preserved correctly, and merge proof is recorded on `main`
- [x] RHI-046 Done — Stakeholder sign-off recorded; Phase 5/6 team notified and handover package confirmed

---

## CI Gate Reference (Per Migration Batch PR)

Every batch PR must pass all gates before merge:

Before these gates run, each batch must complete the standard post-mapping sequence so the correction artifacts exist for review: `npm run migrate:map-frontmatter`, `npm run migrate:finalize-content`, and `npm run migrate:report`.

| Gate | Script | Blocking? | Zero-Tolerance? |
|------|--------|-----------|-----------------|
| Hugo production build | `hugo --minify --environment production` | Yes | Yes |
| Front matter schema validation | `npm run validate:frontmatter` | Yes | Yes (missing required fields) |
| URL parity check | `npm run check:url-parity` | Yes | Yes |
| Redirect integrity check | `npm run check:redirects` | Yes | Yes (critical SEO URLs) |
| SEO metadata completeness | `npm run check:seo-completeness` | Yes | Yes (title/desc/canonical) |
| Index-control check | `npm run check:noindex` | Yes | Yes (unintended noindex) |
| Feed compatibility check | `npm run check:feed-compatibility` | Yes | Yes (compatibility-critical feed routes) |
| Media integrity check | `npm run check:media` | Yes | Yes |
| Broken link check | `npm run check:links` | Yes | Yes (critical pages) |
| Accessibility quick scan | `npm run check:a11y` | Yes | No (cap per batch) |
| Security content scan | `npm run check:security-content` | Yes | Yes (critical findings) |

---

## Batch Execution Strategy

| Batch | Records | Scope | Gate Before Next Batch |
|-------|---------|-------|------------------------|
| Pilot (RHI-043) | 20–30 | Representative: 1 of each content type, 1 video, 1 category, homepage | All CI gates green; manual review of every generated file; `content-corrections-summary.json` and `image-alt-corrections-audit.csv` attached to PR with idempotency confirmation |
| High-value (RHI-044) | 30–50 | Top traffic + top backlink pages per Search Console baseline | All CI gates green; SEO spot-check on 10 pages; correction artifacts attached to PR |
| Long-tail + taxonomy (RHI-045) | Remainder | All remaining posts/pages/categories/archives | All CI gates green; cumulative correction artifacts attached; exception log reviewed and signed off |

---

## Decision Ownership Reference

| Decision Area | Owner | Tickets |
|---------------|-------|---------|
| WordPress source-channel strategy (WXR, REST API, SQL dump, filesystem snapshot) | Engineering Owner | RHI-032 |
| Canonical record schema and normalization rules | Engineering Owner | RHI-033 |
| HTML conversion rules and fallback policy | Engineering Owner | RHI-034 |
| Front matter field mapping and URL assignment | Engineering Owner, SEO Owner | RHI-035 |
| Discovery metadata extension and optional enrichment contract | Engineering Owner | RHI-106 |
| Redirect implementation type per URL | SEO Owner, Migration Owner | RHI-036 |
| Media hosting strategy (static vs CDN) | Engineering Owner | RHI-037 |
| Internal link rewrite scope | Engineering Owner | RHI-038 |
| SEO field coverage requirements | SEO Owner | RHI-039 |
| Accessibility conformance target scope | Engineering Owner | RHI-040 |
| Security sanitization rules | Engineering Owner | RHI-041 |
| Blocking report thresholds | Migration Owner | RHI-042 |
| Pilot batch record selection | Migration Owner | RHI-043 |
| Phase 4 sign-off | Migration Owner | RHI-046 |

---

## Cross-Phase Dependencies

| This Phase Input | From Phase Tickets | Required By |
|------------------|--------------------|-------------|
| Normalized URL inventory | RHI-002 (Phase 1) | RHI-032, RHI-033, RHI-035, RHI-036 |
| URL manifest with dispositions | RHI-004 (Phase 1) | RHI-035, RHI-036 |
| SEO baseline data | RHI-005 (Phase 1) | RHI-039, RHI-043, RHI-044 |
| Front matter contract | RHI-012 (Phase 2) | RHI-035 |
| Route and redirect contract | RHI-013 (Phase 2) | RHI-036 |
| Approved tooling list | RHI-015 (Phase 2) | RHI-032, RHI-034 |
| Discovery/readability UI requirements | RHI-104, RHI-105 (Phase 3) | RHI-106 |
| Hugo scaffold and archetypes | RHI-022 (Phase 3) | RHI-035 |
| Front matter validation script | RHI-022 (Phase 3) | RHI-035 |
| URL parity baseline script | RHI-025 (Phase 3) | RHI-036, RHI-043 |
| SEO smoke-check script | RHI-024 (Phase 3) | RHI-039, RHI-043 |
| CI/CD pipeline | RHI-029 (Phase 3) | RHI-043, RHI-044, RHI-045 |

---

## Search Tags

`phase-4` `content-migration` `wordpress-export` `wxr` `rest-api` `wordpress-sql` `wordpress-filesystem` `wp-content` `html-to-markdown` `turndown` `front-matter` `url-preservation` `redirects` `aliases` `media-migration` `asset-hygiene` `internal-links` `seo-signals` `metadata-completeness` `accessibility` `wcag` `security` `sanitization` `migration-reports` `audit` `pilot-batch` `hugo` `github-pages` `batch-migration`
