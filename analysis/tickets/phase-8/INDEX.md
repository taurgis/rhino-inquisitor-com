# Phase 8 Ticket Index

## Project: Rhino Inquisitor — WordPress to Hugo Migration

**Phase:** 8 — Validation and Launch Readiness  
**Goal:** Convert migration quality checks into objective release gates so the launch decision is evidence-based. Validate every hard-blocker gate (URL parity, redirect integrity, SEO consistency, structured data, performance, accessibility, security, and HTTPS) on the designated release candidate, execute a rehearsal deployment and smoke test run, drill the rollback, and record a formal go/no-go decision with named approvals before handing off to Phase 9 (Cutover and Post-Launch Monitoring).  
**Timeline:** 8–10 working days  
**Phase detail:** [`analysis/plan/details/phase-8.md`](../../analysis/plan/details/phase-8.md)

---

## Ticket Summary

| Ticket ID | Title | Workstream | Priority | Status | Estimate | Target Date | Depends On |
|-----------|-------|------------|----------|--------|----------|-------------|------------|
| [RHI-083](RHI-083-phase-8-bootstrap.md) | Phase 8 Bootstrap: Kickoff and Validation Environment Setup | Setup | Critical | Open | S | 2026-06-03 | RHI-082 |
| [RHI-084](RHI-084-rc-freeze-validation-dataset.md) | Workstream A — Release Candidate Freeze and Validation Dataset | WS-A | Critical | Open | M | 2026-06-04 | RHI-083 |
| [RHI-085](RHI-085-url-parity-redirect-integrity-gates.md) | Workstream B — URL Parity and Redirect Integrity Gates | WS-B | Critical | Open | L | 2026-06-06 | RHI-084 |
| [RHI-086](RHI-086-seo-indexing-readiness-gates.md) | Workstream C — SEO and Indexing Readiness Gates | WS-C | Critical | Open | M | 2026-06-06 | RHI-084 |
| [RHI-087](RHI-087-structured-data-social-preview-gates.md) | Workstream D — Structured Data and Social Preview Gates | WS-D | High | Open | M | 2026-06-09 | RHI-084 |
| [RHI-088](RHI-088-performance-core-web-vitals-gates.md) | Workstream E — Performance and Core Web Vitals Gates | WS-E | High | Open | M | 2026-06-09 | RHI-084 |
| [RHI-089](RHI-089-accessibility-markup-conformance-gates.md) | Workstream F — Accessibility and Markup Conformance Gates | WS-F | High | Open | M | 2026-06-09 | RHI-084 |
| [RHI-090](RHI-090-security-https-readiness-gates.md) | Workstream G — Security and HTTPS Readiness Gates | WS-G | High | Open | S | 2026-06-10 | RHI-084 |
| [RHI-091](RHI-091-operational-readiness-go-nogo.md) | Workstream H — Operational Readiness, Rehearsal, and Go/No-Go | WS-H | Critical | Open | M | 2026-06-11 | RHI-085 through RHI-090 |
| [RHI-092](RHI-092-phase-8-signoff.md) | Phase 8 Sign-off and Handover to Phase 9 | Sign-off | Critical | Open | S | 2026-06-13 | RHI-083 through RHI-091 |

---

## Dependency Graph

```
RHI-082 (Phase 7 Sign-off)
    └── RHI-083 (Phase 8 Bootstrap)
            └── RHI-084 (WS-A: RC Freeze and Validation Dataset)
                    ├── RHI-085 (WS-B: URL Parity and Redirect Integrity Gates)
                    │
                    ├── RHI-086 (WS-C: SEO and Indexing Readiness Gates)
                    │
                    ├── RHI-087 (WS-D: Structured Data and Social Preview Gates)
                    │
                    ├── RHI-088 (WS-E: Performance and Core Web Vitals Gates)
                    │
                    ├── RHI-089 (WS-F: Accessibility and Markup Conformance Gates)
                    │
                    └── RHI-090 (WS-G: Security and HTTPS Readiness Gates)

[WS-B through WS-G all Done] ──────────────────────────► RHI-091 (WS-H: Operational Readiness and Go/No-Go)

[WS-H Done + Go decision] ─────────────────────────────► RHI-092 (Phase 8 Sign-off)
```

> **Reading the graph:** RHI-083 (Bootstrap) is the hard entry gate for Phase 8. RHI-084 (WS-A: RC Freeze) is the prerequisite for all validation workstreams — it defines and freezes the inputs. WS-B through WS-G are all blocked by WS-A but can then run in parallel. WS-H (Operational Readiness and Go/No-Go) is the integration workstream that requires all preceding workstreams complete before the rehearsal and go/no-go decision can proceed. Sign-off requires all workstreams done and a Go decision recorded.

---

## Phase 8 Workstream Map

| Workstream | Ticket | Focus Area | Timeline (Days) |
|------------|--------|------------|-----------------|
| Setup | RHI-083 | Bootstrap and environment readiness | Day 1 |
| WS-A | RHI-084 | RC freeze and validation dataset | Day 2 |
| WS-B | RHI-085 | URL parity and redirect integrity gates | Day 3–4 |
| WS-C | RHI-086 | SEO and indexing readiness gates | Day 3–4 |
| WS-D | RHI-087 | Structured data and social preview gates | Day 4–5 |
| WS-E | RHI-088 | Performance and Core Web Vitals gates | Day 4–5 |
| WS-F | RHI-089 | Accessibility and markup conformance gates | Day 4–5 |
| WS-G | RHI-090 | Security and HTTPS readiness gates | Day 5–6 |
| WS-H | RHI-091 | Operational readiness, rehearsal, and go/no-go | Day 6–7 |
| Sign-off | RHI-092 | Phase 8 sign-off and Phase 9 handover | Day 9–10 |

---

## Key Deliverables

| Deliverable | Ticket | File Path |
|-------------|--------|-----------|
| RC record and freeze metadata | RHI-084 | `migration/phase-8-rc-record.md` |
| Approver roster | RHI-083 | `migration/phase-8-approver-roster.md` |
| Expected URL outcomes dataset | RHI-084 | `validation/expected-url-outcomes.json` |
| Sample page matrix | RHI-084 | `validation/sample-matrix.json` |
| Priority route set | RHI-084 | `validation/priority-routes.json` |
| Validation dataset README | RHI-084 | `validation/README.md` |
| URL parity gate script | RHI-085 | `scripts/phase-8/check-url-parity.js` |
| Redirect quality gate script | RHI-085 | `scripts/phase-8/check-redirect-quality.js` |
| URL parity report | RHI-085 | `validation/url-parity-report.json` |
| Redirect quality report | RHI-085 | `validation/redirect-quality-report.json` |
| SEO consistency gate script | RHI-086 | `scripts/phase-8/check-seo-consistency.js` |
| Robots and sitemap gate script | RHI-086 | `scripts/phase-8/check-robots-sitemap.js` |
| SEO consistency report | RHI-086 | `validation/seo-consistency-report.json` |
| Robots and sitemap report | RHI-086 | `validation/robots-sitemap-report.json` |
| Structured data gate script | RHI-087 | `scripts/phase-8/check-structured-data.js` |
| Social preview gate script | RHI-087 | `scripts/phase-8/check-social-preview.js` |
| Structured data report | RHI-087 | `validation/structured-data-report.json` |
| Social preview report | RHI-087 | `validation/social-preview-report.json` |
| Rich Results Test evidence | RHI-087 | `validation/rich-results-test-evidence/` |
| Updated Lighthouse CI config | RHI-088 | `lighthouserc.js` |
| Performance budget script | RHI-088 | `scripts/phase-8/check-performance-budget.js` |
| Lighthouse CI reports | RHI-088 | `validation/lhci-report/` |
| Performance budget report | RHI-088 | `validation/performance-budget-report.json` |
| Axe accessibility gate script | RHI-089 | `scripts/phase-8/check-accessibility-axe.js` |
| HTML conformance gate script | RHI-089 | `scripts/phase-8/check-html-conformance.js` |
| Axe accessibility report | RHI-089 | `validation/accessibility-axe-report.json` |
| Manual accessibility checklist | RHI-089 | `validation/accessibility-manual-checklist.md` |
| HTML conformance report | RHI-089 | `validation/html-conformance-report.json` |
| HTTPS security gate script | RHI-090 | `scripts/phase-8/check-https-security.js` |
| HTTPS security report | RHI-090 | `validation/https-security-report.json` |
| Security header decision doc | RHI-090 | `migration/phase-8-security-header-decision.md` |
| Smoke test results | RHI-091 | `migration/phase-8-smoke-test-results.md` |
| Rollback drill result | RHI-091 | `migration/phase-8-rollback-drill-result.md` |
| Exception register | RHI-091 | `migration/phase-8-exception-register.md` |
| Launch gate pass summary | RHI-091 | `LAUNCH-GATE-PASS-SUMMARY.md` |
| Cutover verification checklist | RHI-091 | `CUTOVER-VERIFICATION-CHECKLIST.md` |
| Go/No-Go decision document | RHI-091 | `migration/phase-8-go-nogo-decision.md` |
| Phase 8 sign-off document | RHI-092 | `migration/phase-8-signoff.md` |

---

## Phase 8 CI Gate Reference

All gates run as blocking pre-deploy steps. Failure of any hard-blocker gate prevents deployment.

| Gate | Script / Command | Blocking? | Phase 8 Threshold |
|------|-----------------|-----------|-------------------|
| Hugo production build | `hugo --gc --minify --environment production` | Yes | Zero errors |
| Front matter validation | `npm run validate:frontmatter` | Yes | Zero violations |
| URL parity check | `npm run check:url-parity:p8` | Yes | 100% legacy URLs resolved |
| Redirect quality check | `npm run check:redirect-quality` | Yes | Zero chains/loops; no broad fallbacks |
| SEO consistency check | `npm run check:seo-consistency` | Yes | Zero canonical mismatches; zero missing titles |
| Robots and sitemap check | `npm run check:robots-sitemap` | Yes | Zero disallowed production paths; correct `Sitemap:` |
| Structured data check | `npm run check:structured-data` | Yes | Zero critical errors on homepage/article |
| Social preview check | `npm run check:social-preview` | Yes | Zero broken image URLs on priority pages |
| Lighthouse CI | `npm run lhci:run:p8` | Yes | Performance ≥ 90, Accessibility ≥ 90, SEO ≥ 95, Best Practices ≥ 90 |
| Performance budget | `npm run check:perf-budget` | Yes | Critical-path < 170 KB compressed |
| Accessibility axe | `npm run check:accessibility` | Yes | Zero critical violations; zero serious on primary templates |
| HTML conformance | `npm run check:html-conformance` | Yes | Zero html-validate errors |
| HTTPS security | `npm run check:https-security` | Yes | Zero mixed content; valid TLS; Enforce HTTPS on |
| Broken link check | `npm run check:links` | Yes | Zero broken internal links (from Phase 7) |
| Artifact integrity | `npm run validate:artifact` | Yes | No symlinks; correct structure (from Phase 7) |

---

## Phase 8 Definition of Done

All items below must be complete before Phase 9 monitoring and cutover activities can proceed:

- [ ] RHI-083 Done — Phase 8 Bootstrap; Phase 7 contracts confirmed; RC identified; team and tools established
- [ ] RHI-084 Done — RC frozen with `phase-8-rc-v1` tag; expected-outcomes, sample matrix, and priority routes committed
- [ ] RHI-085 Done — URL parity and redirect integrity gates passing; reports committed and signed off
- [ ] RHI-086 Done — SEO consistency, sitemap, and robots.txt gates passing; reports committed and signed off
- [ ] RHI-087 Done — Structured data and social preview gates passing; Rich Results Test evidence committed
- [ ] RHI-088 Done — Lighthouse CI blocking thresholds passing; performance budget report committed
- [ ] RHI-089 Done — Axe accessibility gate passing; manual checklist completed; HTML conformance gate passing
- [ ] RHI-090 Done — HTTPS enforcement confirmed; no mixed content; CAA and domain verification checked
- [ ] RHI-091 Done — All gates pass on final RC; rehearsal deployment executed; smoke tests pass; rollback drilled; Go/No-Go decision recorded as Go
- [ ] RHI-092 Done — Phase 8 sign-off document committed; Phase 9 team acknowledges handover; `phase-8-signoff` git tag set

---

## Non-Negotiable Phase 8 Constraints

These constraints are hard requirements from `analysis/plan/details/phase-8.md` — they are not optional and cannot be deferred:

1. **URL parity gate must pass for 100% of in-scope legacy URLs** — no unresolved or mismapped URLs are carried to launch.
2. **Zero redirect chains on migration routes** — any chain is a blocking defect regardless of chain depth.
3. **Zero canonical mismatches on priority routes** — canonical, sitemap, and internal links must agree on final URLs.
4. **No accidental `noindex` on indexable pages** — verified programmatically and by manual review.
5. **All required structured data schema types pass Rich Results Test with no critical errors.**
6. **HTTPS enforced on canonical host before go/no-go** — valid cert, Enforce HTTPS enabled, no critical mixed content.
7. **Lighthouse blocking thresholds pass on homepage and article template** — Performance ≥ 90, SEO ≥ 95.
8. **Zero critical axe accessibility violations on any representative template.**
9. **Rollback drill completed with rollback initiation confirmed within 60 minutes.**
10. **All required approvers have signed the go/no-go decision document** — no verbal approvals.

---

## Non-Negotiable Constraint Traceability

| Constraint | Primary Verification Ticket(s) | Evidence Required |
|------------|-------------------------------|-------------------|
| URL parity gate passes for 100% of in-scope legacy URLs | RHI-085, RHI-091 | `validation/url-parity-report.json` + gate run URL |
| Zero redirect chains on migration routes | RHI-085, RHI-091 | `validation/redirect-quality-report.json` showing zero chains/loops |
| Zero canonical mismatches on priority routes | RHI-086, RHI-091 | `validation/seo-consistency-report.json` + sample matrix cross-check |
| No accidental `noindex` on indexable pages | RHI-086, RHI-091 | `validation/seo-consistency-report.json` noindex findings section |
| Required structured data schema types pass with no critical errors | RHI-087, RHI-091 | `validation/structured-data-report.json` + rich results evidence |
| HTTPS enforced with valid cert and no critical mixed content | RHI-090, RHI-091 | `validation/https-security-report.json` + redirect/cert checks |
| Lighthouse blocking thresholds pass on homepage and article template | RHI-088, RHI-091 | `validation/lhci-report/` + threshold assertions |
| Zero critical axe accessibility violations on representative templates | RHI-089, RHI-091 | `validation/accessibility-axe-report.json` + manual checklist |
| Rollback drill completed with rollback initiation within 60 minutes | RHI-091 | `migration/phase-8-rollback-drill-result.md` |
| All required approvers sign go/no-go decision | RHI-083, RHI-091, RHI-092 | `migration/phase-8-approver-roster.md` + `migration/phase-8-go-nogo-decision.md` + `migration/phase-8-signoff.md` |

---

## Cross-Phase Dependencies

| This Phase Consumes | From Phase Tickets | Required By |
|---------------------|--------------------|-------------|
| Phase 7 sign-off and deployment workflow | RHI-082, RHI-074 (Phase 7) | RHI-083, RHI-084 |
| Phase 7 gate suite (mixed-content, SEO-safe-deploy, url-parity, etc.) | RHI-079 (Phase 7) | RHI-083, RHI-091 |
| Phase 7 rollback runbook | RHI-081 (Phase 7) | RHI-091 |
| Phase 7 gate summary CSV | RHI-079, RHI-082 (Phase 7) | RHI-083 |
| Frozen URL manifest | RHI-063 (Phase 6) | RHI-084, RHI-085 |
| Redirect architecture decision | RHI-062 (Phase 6) | RHI-085 |
| SEO baseline (top traffic and backlink URLs) | RHI-005 (Phase 1) | RHI-084 |
| Performance baseline | RHI-006 (Phase 1) | RHI-088 |
| Migrated content with `url:`, `aliases:`, SEO front matter | RHI-035, RHI-036 (Phase 4) | RHI-085, RHI-086 |
| Structured data partials | RHI-052 (Phase 5) | RHI-087 |
| OG/Twitter tag partials | RHI-048 (Phase 5) | RHI-087 |
| Crawlability and noindex controls | RHI-050 (Phase 5) | RHI-086 |
| Sitemap and feed templates | RHI-051 (Phase 5) | RHI-086 |
| Lighthouse CI config from Phase 7 | RHI-079 (Phase 7) | RHI-088 |

---

## Decision Ownership Reference

| Decision Area | Owner | Tickets |
|---------------|-------|---------|
| RC identification and freeze protocol | Engineering Owner + Migration Owner | RHI-083, RHI-084 |
| Sample matrix and priority route selection | SEO Owner + Migration Owner | RHI-084 |
| URL parity and redirect quality gate thresholds | Engineering Owner | RHI-085 |
| SEO consistency gate thresholds and exception sign-off | SEO Owner | RHI-086 |
| Structured data schema requirements and Rich Results sign-off | SEO Owner | RHI-087 |
| Lighthouse score thresholds and performance budget | Engineering Owner | RHI-088 |
| Accessibility gate thresholds and manual check ownership | Engineering Owner | RHI-089 |
| HTTPS enforcement and security header decision | Engineering Owner | RHI-090 |
| Go/No-Go decision | Migration Owner (lead), all owners | RHI-091 |
| Phase 8 sign-off | Migration Owner, SEO Owner, Engineering Owner | RHI-092 |

---

## Search Tags

`phase-8` `validation` `launch-readiness` `release-candidate` `rc-freeze` `url-parity` `redirect-quality` `redirect-chains` `redirect-loops` `soft-404` `seo-gates` `canonical` `sitemap` `robots-txt` `noindex` `indexing` `search-console` `structured-data` `json-ld` `blogposting` `website` `videoobject` `rich-results` `open-graph` `twitter-card` `social-preview` `og-image` `performance` `core-web-vitals` `cwv` `lcp` `inp` `cls` `lighthouse` `lhci` `performance-budget` `accessibility` `wcag` `wcag-2.2` `axe` `axe-core` `playwright` `html-validate` `manual-checks` `wai-easy-checks` `keyboard-navigation` `focus` `alt-text` `heading-structure` `security` `https` `mixed-content` `tls` `enforce-https` `caa-records` `domain-verification` `security-headers` `csp` `hsts` `go-nogo` `smoke-tests` `rollback` `rollback-drill` `rehearsal` `exception-register` `launch-gate-summary` `cutover-checklist` `phase-9-handover`
