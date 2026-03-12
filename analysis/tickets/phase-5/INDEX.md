# Phase 5 Ticket Index

## Project: Rhino Inquisitor — WordPress to Hugo Migration

**Phase:** 5 — SEO and Discoverability  
**Goal:** Turn SEO and crawlability from "best effort" into release-blocking engineering controls, ensuring every indexable URL has deterministic metadata, canonical behavior, redirect integrity, and discoverable machine-readable surfaces before DNS cutover — without introducing regressions in mobile parity, performance, structured data coverage, or non-HTML indexing behavior.  
**Timeline:** 8–12 working days  
**Phase detail:** [`analysis/plan/details/phase-5.md`](../../analysis/plan/details/phase-5.md)

---

## Ticket Summary

| Ticket ID | Title | Workstream | Priority | Status | Estimate | Target Date | Depends On |
|-----------|-------|------------|----------|--------|----------|-------------|------------|
| [RHI-047](RHI-047-phase-5-bootstrap.md) | Phase 5 Bootstrap: Kickoff and SEO Governance Environment Setup | Setup | Critical | Done | S | 2026-04-09 | RHI-030 |
| [RHI-048](RHI-048-metadata-canonical-architecture.md) | Workstream A — Metadata and Canonical Signal Architecture | WS-A | Critical | Open | M | 2026-04-11 | RHI-047 |
| [RHI-049](RHI-049-redirect-url-consolidation-signals.md) | Workstream B — Redirect and URL Consolidation Signals | WS-B | Critical | Open | M | 2026-04-14 | RHI-047 |
| [RHI-050](RHI-050-crawlability-indexing-controls.md) | Workstream C — Crawlability and Indexing Controls | WS-C | Critical | Open | M | 2026-04-14 | RHI-047 |
| [RHI-051](RHI-051-sitemap-feed-discovery-continuity.md) | Workstream D — Sitemap, Feed, and Discovery Surface Continuity | WS-D | High | Open | M | 2026-04-16 | RHI-047, RHI-048 |
| [RHI-052](RHI-052-structured-data-rich-result-readiness.md) | Workstream E — Structured Data and Rich-Result Readiness | WS-E | High | Open | M | 2026-04-18 | RHI-047 |
| [RHI-053](RHI-053-internal-linking-ia-signals.md) | Workstream F — Internal Linking and Information Architecture Signals | WS-F | High | Open | M | 2026-04-18 | RHI-047, RHI-048 |
| [RHI-054](RHI-054-mobile-first-core-web-vitals.md) | Workstream G — Mobile-First and Core Web Vitals Controls | WS-G | High | Open | M | 2026-04-22 | RHI-047 |
| [RHI-055](RHI-055-image-video-seo-integrity.md) | Workstream H — Image and Video SEO Integrity | WS-H | Medium | Open | M | 2026-04-22 | RHI-047, RHI-052 |
| [RHI-056](RHI-056-accessibility-discoverability-support.md) | Workstream I — Accessibility as Discoverability Support | WS-I | Medium | Open | M | 2026-04-23 | RHI-047 |
| [RHI-057](RHI-057-search-console-monitoring-program.md) | Workstream J — Search Console and Analytics Monitoring Program | WS-J | High | Open | M | 2026-04-24 | RHI-047, RHI-051 |
| [RHI-058](RHI-058-non-html-resource-seo-controls.md) | Workstream K — Non-HTML Resource SEO Controls | WS-K | Medium | Open | S | 2026-04-25 | RHI-047 |
| [RHI-059](RHI-059-github-pages-limits-artifact-integrity.md) | Workstream L — GitHub Pages Limits and Artifact Integrity | WS-L | High | Open | S | 2026-04-25 | RHI-047, RHI-049 |
| [RHI-060](RHI-060-phase-5-signoff.md) | Phase 5 Sign-off and Handover to Phase 6/8 | Sign-off | Critical | Open | S | 2026-05-02 | RHI-047 through RHI-059 |

---

## Dependency Graph

```text
RHI-030 (Phase 3 Sign-off)
    └── RHI-047 (Phase 5 Bootstrap) ◄─── also requires Phase 3; planned in parallel with Phase 4, now operating from the finalized Phase 4 handover state
            ├── RHI-048 (WS-A: Metadata & Canonical)
            │       ├── RHI-051 (WS-D: Sitemap & Feed) ◄─── canonical policy needed
            │       └── RHI-053 (WS-F: Internal Linking) ◄─── canonical URL targets needed
            ├── RHI-049 (WS-B: Redirect Signals)
            │       └── RHI-059 (WS-L: Pages Limits) ◄─── alias count needed from redirect matrix
            ├── RHI-050 (WS-C: Crawlability & Indexing)
            ├── RHI-052 (WS-E: Structured Data)
            │       └── RHI-055 (WS-H: Image & Video SEO) ◄─── VideoObject scope from WS-E
            ├── RHI-054 (WS-G: Mobile & CWV)
            ├── RHI-056 (WS-I: Accessibility)
            ├── RHI-057 (WS-J: Search Console Monitoring) ◄─── also needs RHI-051
            └── RHI-058 (WS-K: Non-HTML Controls)

[RHI-047…RHI-059 all Done] ─────────────────────────────► RHI-060 (Sign-off)
```

> **Reading the graph:** RHI-047 is the hard gate — no Phase 5 workstream starts before it. WS-A (RHI-048) is the first workstream to complete because canonical policy is a prerequisite for WS-D (sitemap) and WS-F (internal links). WS-B (redirects) feeds into WS-L (pages constraints). WS-E (structured data) must determine VideoObject scope before WS-H (image/video SEO) can complete its schema validation. WS-D (sitemap) must be complete before WS-J (Search Console) can finalise the sitemap submission procedure. WS-B, WS-C, WS-E, WS-G, WS-I, and WS-K can all start in parallel after bootstrap.

---

## Phase 5 Workstream Map

| Workstream | Ticket | Focus Area | Timeline (Days) |
|------------|--------|------------|-----------------|
| WS-A | RHI-048 | Metadata and canonical architecture | Days 1–2 |
| WS-B | RHI-049 | Redirect and URL consolidation signals | Days 3–4 |
| WS-C | RHI-050 | Crawlability and indexing controls | Days 3–4 |
| WS-D | RHI-051 | Sitemap, feed, and discovery surfaces | Days 5–6 |
| WS-E | RHI-052 | Structured data and rich-result readiness | Days 5–6 |
| WS-F | RHI-053 | Internal linking and information architecture | Days 7–8 |
| WS-G | RHI-054 | Mobile-first and Core Web Vitals | Days 7–8 |
| WS-H | RHI-055 | Image and video SEO integrity | Days 7–8 |
| WS-I | RHI-056 | Accessibility as discoverability support | Days 7–8 |
| WS-J | RHI-057 | Search Console and analytics monitoring | Days 9–10 |
| WS-K | RHI-058 | Non-HTML resource SEO controls | Days 11–12 |
| WS-L | RHI-059 | GitHub Pages limits and artifact integrity | Days 11–12 |

---

## Key Deliverables

| Deliverable | Ticket | File Path |
|-------------|--------|-----------|
| Metadata validation script | RHI-048 | `scripts/seo/check-metadata.js` |
| Metadata audit report | RHI-048 | `migration/reports/phase-5-metadata-report.csv` |
| Canonical policy document | RHI-048 | `migration/phase-5-canonical-policy.md` |
| Redirect signal matrix | RHI-049 | `migration/phase-5-redirect-signal-matrix.csv` |
| Redirect validation script | RHI-049 | `scripts/seo/check-redirects.js` |
| Redirect validation report | RHI-049 | `migration/reports/phase-5-redirect-validation.csv` |
| Crawl control validation script | RHI-050 | `scripts/seo/check-crawl-controls.js` |
| Crawl control audit report | RHI-050 | `migration/reports/phase-5-crawl-control-audit.csv` |
| Sitemap feed policy document | RHI-051 | `migration/phase-5-sitemap-feed-policy.md` |
| Sitemap validation script | RHI-051 | `scripts/seo/check-sitemap.js` |
| Sitemap audit report | RHI-051 | `migration/reports/phase-5-sitemap-audit.csv` |
| Structured data coverage document | RHI-052 | `migration/phase-5-structured-data-coverage.md` |
| Schema validation script | RHI-052 | `scripts/seo/check-schema.js` |
| Schema audit report | RHI-052 | `migration/reports/phase-5-schema-audit.csv` |
| Internal links validation script | RHI-053 | `scripts/seo/check-internal-links.js` |
| Internal links audit report | RHI-053 | `migration/reports/phase-5-internal-links-audit.csv` |
| Lighthouse CI config | RHI-054 | `lighthouserc.js` |
| Image audit script | RHI-055 | `scripts/seo/check-images.js` |
| Image audit report | RHI-055 | `migration/reports/phase-5-image-audit.csv` |
| pa11y-ci config | RHI-056 | `pa11y-ci.config.js` |
| Accessibility audit report | RHI-056 | `migration/reports/phase-5-accessibility-audit.md` |
| Monitoring runbook | RHI-057 | `migration/phase-5-monitoring-runbook.md` |
| Non-HTML policy report | RHI-058 | `migration/reports/phase-5-non-html-policy.csv` |
| Pages constraints script | RHI-059 | `scripts/seo/check-pages-constraints.js` |
| Pages constraints report | RHI-059 | `migration/reports/phase-5-pages-constraints-report.md` |
| SEO contract (synthesis) | RHI-060 | `migration/phase-5-seo-contract.md` |
| Phase 5 gate summary | RHI-060 | `migration/reports/phase-5-gate-summary.csv` |
| Phase 5 sign-off document | RHI-060 | `migration/phase-5-signoff.md` |

---

## Phase 5 CI Gate Reference

Every batch PR and every deploy from `main` must pass all applicable gates. Failure must prevent deployment:

| Gate | Script | Blocking? | Zero-Tolerance? |
|------|--------|-----------|-----------------|
| Metadata completeness and canonical check | `npm run check:metadata` | Yes | Yes (missing or duplicate canonical) |
| Redirect chain/loop/broad-redirect check | `npm run check:redirects:seo` | Yes | Yes (chains, loops, broad redirects) |
| Crawl control and noindex policy check | `npm run check:crawl-controls` | Yes | Yes (unintended noindex; contradiction) |
| Sitemap validation | `npm run check:sitemap` | Yes | Yes (non-canonical URLs in sitemap) |
| Schema required-property check | `npm run check:schema` | Yes | Yes (missing required properties) |
| Internal links check (critical pages) | `npm run check:internal-links` | Yes | Yes (broken links on critical templates) |
| Image alt text and media integrity | `npm run check:images` | Yes | Yes (broken images; missing alt text) |
| Lighthouse performance assertions | `npm run check:perf` | Yes | No (score-based; warn below threshold) |
| Accessibility Level A check | `npm run check:a11y:seo` | Yes | Yes (Level A violations) |
| Pages artifact constraint check | `npm run check:pages-constraints` | Yes | Yes (size limit; symlinks) |

---

## Phase 5 Definition of Done

All items below must be complete before Phase 6 and Phase 8 downstream work can finalize their release assessments:

- [ ] RHI-047 Done — Phase 5 Bootstrap; Phase 3 contracts and tooling environment confirmed
- [ ] RHI-048 Done — Metadata completeness 100%; canonical policy documented and CI gate passing
- [ ] RHI-049 Done — Zero redirect chains/loops; redirect mechanism documented per URL class; 5% escalation decision made
- [ ] RHI-050 Done — Zero unintended noindex on indexable pages; zero robots/noindex contradiction; staging suppression verified
- [ ] RHI-051 Done — Sitemap valid and canonical-consistent; feed endpoint operational; `/feed/` must-resolve behavior implemented
- [ ] RHI-052 Done — Zero critical schema property errors on representative templates; VideoObject scope confirmed
- [ ] RHI-053 Done — Zero broken internal links on critical templates; zero orphan pages in representative set
- [ ] RHI-054 Done — Lighthouse assertions passing on representative templates; mobile parity confirmed
- [ ] RHI-055 Done — Zero broken images; zero missing alt text on non-decorative images; video watch-page indexability confirmed
- [ ] RHI-056 Done — Zero WCAG 2.2 Level A violations on representative pages; Level AA issues triaged
- [ ] RHI-057 Done — Monitoring runbook committed; Search Console access confirmed; pre-launch baselines captured
- [ ] RHI-058 Done — Non-HTML policy implemented per URL class; no unresolved index-control blockers; edge-layer escalations documented
- [ ] RHI-059 Done — Artifact within size limit; no symbolic links; `.nojekyll` present; HTTPS and DNS readiness confirmed
- [ ] RHI-060 Done — All Phase 5 gates green; SEO contract and sign-off committed; Phase 6/8 notified and acknowledged

---

## Non-Negotiable Phase 5 Constraints

These constraints are hard requirements from `analysis/plan/details/phase-5.md` — they are not optional and cannot be deferred to a later phase:

1. Every indexable URL must have one and only one intended canonical outcome.
2. Redirect chain count for migration routes must be **zero** in final configuration.
3. Canonical tag, sitemap URL, and internal-link destination must **agree** for each indexable URL.
4. `robots.txt` must **never** be used as a substitute for de-indexing decisions.
5. Staging `noindex` controls must **not** leak into release artifacts.
6. Any intentional URL retirement must resolve to meaningful `404` behavior — not thin soft-404 substitutes.
7. Pages targeted for indexation must be fully accessible on **mobile** with equivalent primary content and structured data.
8. Static-host redirect limitations must be treated as **design constraints**, not ignored as implementation details.

---

## Cross-Phase Dependencies

| This Phase Consumes | From Phase Tickets | Required By |
|---------------------|--------------------|-------------|
| URL inventory and disposition decisions | RHI-002, RHI-004 (Phase 1) | RHI-049, RHI-058 |
| SEO baseline (traffic data, backlinks) | RHI-005 (Phase 1) | RHI-049, RHI-053, RHI-057 |
| SEO and discoverability contract | RHI-014 (Phase 2) | RHI-047, RHI-048 |
| Route and redirect contract | RHI-013 (Phase 2) | RHI-049 |
| Hugo config (sitemap, feed) | RHI-021 (Phase 3) | RHI-051 |
| SEO partial templates | RHI-024 (Phase 3) | RHI-048, RHI-052 |
| Template scaffolding | RHI-023 (Phase 3) | RHI-048, RHI-052, RHI-053, RHI-056 |
| URL parity baseline script | RHI-025 (Phase 3) | RHI-047 |
| CI/CD pipeline | RHI-029 (Phase 3) | All Phase 5 CI gates |
| Media migration (static assets) | RHI-037 (Phase 4) | RHI-055, RHI-058 |
| Front matter fields (dates, author, URL) | RHI-035 (Phase 4) | RHI-048, RHI-052 |
| Internal link rewrites in content | RHI-038 (Phase 4) | RHI-053 |

---

## Decision Ownership Reference

| Decision Area | Owner | Tickets |
|---------------|-------|---------|
| Canonical override policy | SEO Owner | RHI-048 |
| Redirect mechanism per URL class (static alias vs edge) | SEO Owner, Engineering Owner | RHI-049 |
| Edge redirect escalation threshold (>5% changed URLs) | SEO Owner | RHI-049 |
| Crawl intent and `robots.txt` disallow rules | SEO Owner | RHI-050 |
| Sitemap exclusion rules and feed URL strategy | SEO Owner | RHI-051 |
| VideoObject schema scope | SEO Owner, Engineering Owner | RHI-052, RHI-055 |
| Orphan page resolution | SEO Owner | RHI-053 |
| Lighthouse CI assertion thresholds | Engineering Owner | RHI-054 |
| Non-HTML resource disposition | SEO Owner | RHI-058 |
| GitHub Pages artifact size threshold | Engineering Owner | RHI-059 |
| Phase 5 sign-off | SEO Owner, Migration Owner | RHI-060 |

---

## Search Tags

`phase-5` `seo` `discoverability` `canonical` `metadata` `open-graph` `redirects` `url-consolidation` `crawlability` `robots-txt` `noindex` `sitemap` `rss-feed` `structured-data` `json-ld` `schema` `blogposting` `videoobject` `breadcrumb` `internal-links` `orphan-pages` `mobile-first` `core-web-vitals` `lighthouse` `cwv` `lcp` `cls` `alt-text` `image-seo` `video-seo` `accessibility` `wcag` `pa11y` `search-console` `analytics` `monitoring-runbook` `non-html` `pdf` `attachments` `github-pages` `artifact-integrity` `pages-limits`
