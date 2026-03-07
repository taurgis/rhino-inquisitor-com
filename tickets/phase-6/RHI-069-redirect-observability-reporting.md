## RHI-069 · Workstream G — Redirect Observability and Reporting

**Status:** Open  
**Priority:** High  
**Estimate:** M  
**Phase:** 6  
**Assigned to:** Engineering Owner  
**Target date:** 2026-05-14  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Generate a complete set of pre-launch redirect reports that provide the migration team with measurable, auditable evidence of redirect coverage, quality, and intent-equivalence before the launch window. Define post-launch monitoring thresholds and incident response triggers so that redirect failures after DNS cutover are detected and resolved quickly.

Good redirect implementation without observability is still a risk: teams often discover soft-404s, missing redirects, or canonical mismatches weeks after launch through Search Console signals, not through proactive monitoring. This workstream closes that gap by defining what "healthy redirect behavior" looks like quantitatively and automating the checks.

---

### Acceptance Criteria

- [ ] Pre-launch coverage report generated: `migration/reports/phase-6-coverage.csv`
  - [ ] Columns: `legacy_url`, `route_class`, `disposition`, `target_url`, `outcome_verified`, `http_status` (if testable), `notes`
  - [ ] Total coverage percentage: (URLs with verified outcome / total in-scope URLs) × 100 — must be 100%
  - [ ] Breakdown by disposition (`keep`, `redirect`, `retire`) documented
- [ ] Pre-launch quality report generated: `migration/reports/phase-6-chains-loops.csv`
  - [ ] Zero redirect chains detected (path length > 1 hop in redirect graph)
  - [ ] Zero redirect loops detected
  - [ ] Zero unreachable target URLs (targets that resolve to 404 in production build)
  - [ ] Zero cross-host anomalies (redirect to non-canonical host variants)
- [ ] Pre-launch canonical alignment report generated: `migration/reports/phase-6-canonical-alignment.csv`
  - [ ] Columns: `url`, `canonical_tag_value`, `sitemap_loc_value`, `match` (yes/no), `notes`
  - [ ] All canonical tag values agree with corresponding sitemap `<loc>` values
  - [ ] Zero canonical mismatch rows
- [ ] Intent equivalence report generated: `migration/reports/phase-6-redirect-intent-review.csv` (produced by WS-B, referenced here):
  - [ ] All redirect rows have `review_status: approved`
  - [ ] No `non-equivalent` intent mappings remain in launch candidate
- [ ] Post-launch monitoring thresholds documented in `migration/phase-6-cutover-runbook.md`:
  - [ ] Daily review cadence for 404/soft-404 anomalies defined (T+1 to T+14)
  - [ ] Incident trigger thresholds defined:
    - [ ] High-value URL failure threshold (>5 priority URLs or >2% of priority-route sample failing in first 24 hours)
    - [ ] Canonical mismatch threshold for escalation
    - [ ] Redirect chain introduction threshold (any chain = immediate incident)
  - [ ] Escalation owners named per incident trigger type
- [ ] All required Phase 6 reports are committed before launch window freeze

---

### Tasks

- [ ] Generate pre-launch coverage report (`migration/reports/phase-6-coverage.csv`):
  - [ ] Load all in-scope URLs from `migration/url-map.csv`
  - [ ] For each URL, determine if the outcome is verifiable from build output:
    - [ ] `keep` URLs: verify content page exists at target path in `public/`
    - [ ] `redirect` URLs: verify alias page exists at legacy path in `public/`
    - [ ] `retire` URLs: verify URL does not appear in sitemap and has no alias destination
  - [ ] Calculate coverage percentage
  - [ ] Flag any unverified URL as a blocking issue
- [ ] Generate pre-launch chains/loops quality report (`migration/reports/phase-6-chains-loops.csv`):
  - [ ] Run `scripts/phase-6/check-redirect-chains.js` (produced by WS-C: RHI-065)
  - [ ] Capture all detected chains and loops
  - [ ] Fix all chains and loops before committing this report
  - [ ] Report must show zero chains and zero loops in final committed version
- [ ] Generate pre-launch canonical alignment report (`migration/reports/phase-6-canonical-alignment.csv`):
  - [ ] Build production site
  - [ ] Parse all HTML in `public/` with `cheerio` to extract canonical tag values
  - [ ] Parse `public/sitemap.xml` to extract all `<loc>` values
  - [ ] Cross-reference: for each URL in sitemap, find the canonical tag in the corresponding HTML page
  - [ ] Flag any mismatch as a blocking issue
  - [ ] Fix all mismatches before committing this report
- [ ] Write `scripts/phase-6/generate-coverage-report.js`
- [ ] Write `scripts/phase-6/generate-canonical-alignment-report.js`
- [ ] Write post-launch monitoring section of `migration/phase-6-cutover-runbook.md`:
  - [ ] Day-1 immediate check list (priority legacy URLs smoke test)
  - [ ] Daily review checklist for T+1 to T+14
  - [ ] Incident triggers and owners
  - [ ] Escalation path for each trigger type
- [ ] Run all report generation scripts against production build
- [ ] Fix all blocking issues identified in reports
- [ ] Commit all reports and updated runbook

---

### Out of Scope

- Post-launch redirect telemetry collection and analysis (Phase 9 monitoring; this workstream defines thresholds only)
- Fixing redirect implementations (WS-C: RHI-065 scope — this workstream reports; WS-C fixes)
- Canonical alignment at SEO template level (Phase 5: RHI-048 — this workstream validates the output)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-063 Done — finalized `migration/url-map.csv` | Ticket | Pending |
| RHI-064 Done — intent review report committed | Ticket | Pending |
| RHI-065 Done — Hugo aliases and chain-detection script available | Ticket | Pending |
| RHI-066 Done — canonical alignment expected (host/protocol check passed) | Ticket | Pending |
| Production build of full Hugo site available | Phase | Pending |

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- `migration/reports/phase-6-coverage.csv` — 100% coverage, all outcomes verified
- `migration/reports/phase-6-chains-loops.csv` — zero chains and loops
- `migration/reports/phase-6-canonical-alignment.csv` — zero mismatches
- `scripts/phase-6/generate-coverage-report.js`
- `scripts/phase-6/generate-canonical-alignment-report.js`
- `migration/phase-6-cutover-runbook.md` — post-launch monitoring section complete

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- The coverage report is the authoritative pre-launch evidence that every in-scope URL has a verified outcome. If it cannot be generated cleanly, the launch is not ready.
- The canonical alignment report is a cross-check between two independently generated artifacts (canonical tags from templates and sitemap from Hugo's built-in sitemap generation). Mismatches indicate a configuration error and must be resolved before launch.
- Post-launch monitoring using Search Console URL Inspection is a supplement, not a primary monitoring tool. The primary monitoring approach is direct HTTP checks (using `undici` or similar) against the production domain combined with Search Console coverage reports. Do not design the runbook around Search Console alone — it has latency of days to weeks.
- The cutover runbook monitoring section from this workstream feeds directly into Phase 9 (post-launch monitoring). The Phase 9 team should be able to execute the runbook without additional context.
- Reference: `analysis/plan/details/phase-6.md` §Workstream G, §Launch-Window Execution Plan
