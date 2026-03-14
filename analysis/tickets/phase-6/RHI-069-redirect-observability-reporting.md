## RHI-069 · Workstream G — Redirect Observability and Reporting

**Status:** Done  
**Priority:** High  
**Estimate:** M  
**Phase:** 6  
**Assigned to:** Engineering Owner  
**Target date:** 2026-05-14  
**Created:** 2026-03-07  
**Updated:** 2026-03-14

---

### Goal

Generate a complete set of pre-launch redirect reports that provide the migration team with measurable, auditable evidence of redirect coverage, quality, and intent-equivalence before the launch window. Define post-launch monitoring thresholds and incident response triggers so that redirect failures after DNS cutover are detected and resolved quickly.

Good redirect implementation without observability is still a risk: teams often discover soft-404s, missing redirects, or canonical mismatches weeks after launch through Search Console signals, not through proactive monitoring. This workstream closes that gap by defining what "healthy redirect behavior" looks like quantitatively and automating the checks.

---

### Acceptance Criteria

- [x] Pre-launch coverage report generated: `migration/reports/phase-6-coverage.csv`
  - [x] Columns: `legacy_url`, `route_class`, `disposition`, `target_url`, `outcome_verified`, `http_status` (if testable), `notes`
  - [x] Total coverage percentage: (URLs with verified outcome / total in-scope URLs) × 100 — must be 100%
  - [x] Breakdown by disposition (`keep`, `redirect`, `retire`) documented
- [x] Pre-launch quality report generated: `migration/reports/phase-6-chains-loops.csv`
  - [x] Zero redirect chains detected (path length > 1 hop in redirect graph)
  - [x] Zero redirect loops detected
  - [x] Zero unreachable target URLs (targets that resolve to 404 in production build)
  - [x] Zero cross-host anomalies (redirect to non-canonical host variants)
- [x] Pre-launch canonical alignment report generated: `migration/reports/phase-6-canonical-alignment.csv`
  - [x] Columns: `url`, `canonical_tag_value`, `sitemap_loc_value`, `match` (yes/no), `notes`
  - [x] All canonical tag values agree with corresponding sitemap `<loc>` values
  - [x] Zero canonical mismatch rows
- [x] Intent equivalence report generated: `migration/reports/phase-6-redirect-intent-review.csv` (produced by WS-B, referenced here):
  - [x] All redirect rows have `review_status: approved`
  - [x] No `non-equivalent` intent mappings remain in launch candidate
- [x] Post-launch monitoring thresholds documented in `migration/phase-6-cutover-runbook.md`:
  - [x] Daily review cadence for 404/soft-404 anomalies defined (T+1 to T+14)
  - [x] Incident trigger thresholds defined:
    - [x] High-value URL failure threshold (>5 priority URLs or >2% of priority-route sample failing in first 24 hours)
    - [x] Canonical mismatch threshold for escalation
    - [x] Redirect chain introduction threshold (any chain = immediate incident)
  - [x] Escalation owners named per incident trigger type
- [x] All required Phase 6 reports are committed before launch window freeze

---

### Tasks

- [x] Generate pre-launch coverage report (`migration/reports/phase-6-coverage.csv`):
  - [x] Load all in-scope URLs from `migration/url-map.csv`
  - [x] For each URL, determine if the outcome is verifiable from build output:
    - [x] `keep` URLs: verify content page exists at target path in `public/`
    - [x] `redirect` URLs: verify alias page exists at legacy path in `public/`
    - [x] `retire` URLs: verify URL does not appear in sitemap and has no alias destination
  - [x] Calculate coverage percentage
  - [x] Flag any unverified URL as a blocking issue
- [x] Generate pre-launch chains/loops quality report (`migration/reports/phase-6-chains-loops.csv`):
  - [x] Run `scripts/phase-6/check-redirect-chains.js` (produced by WS-C: RHI-065)
  - [x] Capture all detected chains and loops
  - [x] Fix all chains and loops before committing this report
  - [x] Report must show zero chains and zero loops in final committed version
- [x] Generate pre-launch canonical alignment report (`migration/reports/phase-6-canonical-alignment.csv`):
  - [x] Build production site
  - [x] Parse all HTML in `public/` with `cheerio` to extract canonical tag values
  - [x] Parse `public/sitemap.xml` to extract all `<loc>` values
  - [x] Cross-reference: for each URL in sitemap, find the canonical tag in the corresponding HTML page
  - [x] Flag any mismatch as a blocking issue
  - [x] Fix all mismatches before committing this report
- [x] Write `scripts/phase-6/generate-coverage-report.js`
- [x] Write `scripts/phase-6/generate-canonical-alignment-report.js`
- [x] Write post-launch monitoring section of `migration/phase-6-cutover-runbook.md`:
  - [x] Day-1 immediate check list (priority legacy URLs smoke test)
  - [x] Daily review checklist for T+1 to T+14
  - [x] Incident triggers and owners
  - [x] Escalation path for each trigger type
- [x] Run all report generation scripts against production build
- [x] Fix all blocking issues identified in reports
- [x] Commit all reports and updated runbook

---

### Out of Scope

- Post-launch redirect telemetry collection and analysis (Phase 9 monitoring; this workstream defines thresholds only)
- Fixing redirect implementations (WS-C: RHI-065 scope — this workstream reports; WS-C fixes)
- Canonical alignment at SEO template level (Phase 5: RHI-048 — this workstream validates the output)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-063 Done — finalized `migration/url-map.csv` | Ticket | Done |
| RHI-064 Done — intent review report committed | Ticket | Done |
| RHI-065 Done — Hugo aliases and chain-detection script available | Ticket | Done |
| RHI-066 Done — canonical alignment expected (host/protocol check passed) | Ticket | Done |
| Production build of full Hugo site available | Phase | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Coverage report reveals unverified URLs at launch preparation time | Medium | High | Run coverage report as early as possible after WS-C is Done; fix any gaps before the freeze deadline | Engineering Owner |
| Canonical alignment report reveals widespread mismatches from template issues | Low | High | If >10 mismatches found, escalate to Phase 5 WS-A owner (RHI-048); do not fix canonical template issues in Phase 6 — raise as a Phase 5 regression | SEO Owner |
| Post-launch monitoring thresholds set too loosely (miss real incidents) or too tightly (generate false alarms) | Medium | Medium | Base thresholds on Phase 1 SEO baseline data; calibrate priority URL count against actual backlink and traffic volumes; review with SEO owner before cutover | SEO Owner |
| Reporting scripts too slow to run against full production build in CI time budget | Low | Medium | Use `p-limit` to control concurrency; test script performance against full URL set before adding to CI; if necessary, create a fast-mode subset for CI and full-mode for manual pre-launch runs | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-069 is complete. The repository now has dedicated pre-launch evidence for URL coverage, redirect quality, and canonical alignment, plus a seeded cutover runbook section that documents the post-launch monitoring cadence and incident thresholds required under the committed Model A launch posture.

**Delivered artefacts:**

- `migration/reports/phase-6-coverage.csv` — 1223 reviewed rows, 100% verified outcomes
- `migration/reports/phase-6-chains-loops.csv` — 18 reviewed alias-backed redirect rows, zero chains, zero loops, zero missing-target or cross-host anomalies
- `migration/reports/phase-6-canonical-alignment.csv` — 215 canonical sitemap rows, zero mismatches
- `scripts/phase-6/generate-coverage-report.js`
- `scripts/phase-6/generate-canonical-alignment-report.js`
- `migration/phase-6-cutover-runbook.md` — post-launch monitoring section complete and reserved for RHI-071 expansion
- `src/content/404-html.md` — root `404.html` content entry so GitHub Pages emits the authoritative error document required by the retirement-policy gate
- `analysis/documentation/phase-6/rhi-069-redirect-observability-reporting-2026-03-14.md` — implementation and verification record

**Deviations from plan:**

- A small Hugo follow-up was required during validation: the clean production build emitted `/404/` but not the root `404.html` document expected by GitHub Pages and the RHI-067 retirement-policy gate, so a dedicated non-indexable `src/content/404-html.md` entry was added before final validation.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-14 | In progress | Added coverage and canonical-alignment report generators, upgraded the redirect-chain report contract, and seeded `migration/phase-6-cutover-runbook.md` with the RHI-069 monitoring thresholds and escalation ownership. |
| 2026-03-14 | Done | Clean production validation passed: coverage `1223/1223`, chains report `18` pass rows with zero defects, canonical alignment `215` rows with zero mismatches, and the adjacent alias, host/protocol, retirement, and redirect-security gates all passed after the root `404.html` Hugo document was added. |

---

### Notes

- The coverage report is the authoritative pre-launch evidence that every in-scope URL has a verified outcome. If it cannot be generated cleanly, the launch is not ready.
- The canonical alignment report is a cross-check between two independently generated artifacts (canonical tags from templates and sitemap from Hugo's built-in sitemap generation). Mismatches indicate a configuration error and must be resolved before launch.
- Post-launch monitoring using Search Console URL Inspection is a supplement, not a primary monitoring tool. The primary monitoring approach is direct HTTP checks (using `undici` or similar) against the production domain combined with Search Console coverage reports. Do not design the runbook around Search Console alone — it has latency of days to weeks.
- The cutover runbook monitoring section from this workstream feeds directly into Phase 9 (post-launch monitoring). The Phase 9 team should be able to execute the runbook without additional context.
- Reference: `analysis/plan/details/phase-6.md` §Workstream G, §Launch-Window Execution Plan
