## RHI-057 · Workstream J — Search Console and Analytics Monitoring Program

**Status:** Open  
**Priority:** High  
**Estimate:** M  
**Phase:** 5  
**Assigned to:** SEO Owner  
**Target date:** 2026-04-24  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Establish the monitoring program that will detect migration regressions before and after DNS cutover. Prepare Google Search Console for the new Hugo site, create baseline snapshots for post-launch comparison, define incident escalation thresholds, and document the monitoring runbook with owners and cadence.

A monitoring program that is not set up before cutover provides no early warning. Post-launch SEO regression analysis without a pre-launch baseline is forensic, not preventive. This workstream ensures the monitoring infrastructure and runbook are ready before Phase 7 DNS cutover begins.

---

### Acceptance Criteria

- [ ] `migration/phase-5-monitoring-runbook.md` is committed and contains:
  - [ ] Google Search Console property status: existing property confirmed or new property added for Hugo site
  - [ ] Pre-launch baseline snapshot instructions (indexing count, CWV report, top landing pages, inbound links)
  - [ ] URL Inspection sample set: list of 15–20 high-value URLs to check manually at launch
  - [ ] Sitemap submission procedure: which Search Console property, which sitemap URL, who submits
  - [ ] Launch-week monitoring checklist (daily tasks for the first 7 days post-cutover)
  - [ ] 30-day and 60-day review checkpoints with owners
  - [ ] Incident escalation thresholds with owner and response action:
    - [ ] Indexable 404 spike: >2% of indexed URLs or >25 priority URLs in any 24-hour window → rollback/patch
    - [ ] Canonical mismatch: >0.5% of sampled indexable URLs or any priority URL → block further rollout
    - [ ] High-value page impression decline: >20% vs. Phase 1 baseline for 7 consecutive days → technical audit
  - [ ] Analytics platform verification (confirm GA4 or equivalent is configured and receiving hits)
- [ ] Search Console access is verified:
  - [ ] Existing Search Console property for `https://www.rhino-inquisitor.com/` is confirmed accessible
  - [ ] DNS and HTML verification method for the canonical `www` host is confirmed and will survive the migration
  - [ ] Ownership is confirmed with the migration owner
- [ ] Baseline snapshots are captured before cutover:
  - [ ] Page Indexing report screenshot saved
  - [ ] Core Web Vitals report screenshot saved
  - [ ] Top landing pages (by clicks) screenshot saved — minimum 30-day window
  - [ ] Top linked pages (Links report) screenshot saved
  - [ ] All baselines committed to `migration/phase-5-monitoring-runbook.md` or linked artifacts
- [ ] URL Inspection sample list (15–20 high-value URLs) is prepared:
  - [ ] Includes homepage
  - [ ] Includes top 10 organic landing pages from Phase 1 SEO baseline (RHI-005)
  - [ ] Includes 2–3 category pages
  - [ ] Includes 1–2 video pages
  - [ ] Includes privacy policy and at least one static page
- [ ] Analytics platform is confirmed operational:
  - [ ] Google Analytics 4 (or equivalent) is configured in Hugo template
  - [ ] Analytics tracking code does not block page load (async or defer)
  - [ ] No analytics tracking on staging/preview environments

---

### Tasks

- [ ] Verify Search Console access for `https://www.rhino-inquisitor.com/`:
  - [ ] Confirm property type: domain property or URL prefix property
  - [ ] Confirm verification method: DNS TXT record, HTML file, or GA integration
  - [ ] Confirm that the verification method will survive a GitHub Pages deployment change
  - [ ] Record access confirmation and owner in Progress Log
- [ ] Capture pre-launch baseline snapshots in Search Console:
  - [ ] Page Indexing report (record total indexed, not-indexed, and error breakdowns)
  - [ ] Core Web Vitals (Good/NI/Poor counts by device)
  - [ ] Performance report — Top pages by clicks (30-day window)
  - [ ] Links report — Top linked pages
  - [ ] Save screenshots or CSV exports to `migration/` directory or link from runbook
- [ ] Build URL Inspection sample list:
  - [ ] Pull top 10 pages from Phase 1 SEO baseline (RHI-005)
  - [ ] Add homepage, privacy policy, 2 categories, 1 video page
  - [ ] Record final list in `migration/phase-5-monitoring-runbook.md`
- [ ] Verify analytics configuration in Hugo templates:
  - [ ] Confirm GA4 measurement ID is present in `hugo.toml` or site params
  - [ ] Confirm analytics partial is included in `baseof.html` with async loading
  - [ ] Confirm analytics is suppressed on staging builds
- [ ] Draft `migration/phase-5-monitoring-runbook.md`:
  - [ ] Pre-launch checklist section
  - [ ] Launch-week daily monitoring checklist
  - [ ] 30/60-day review checkpoints
  - [ ] Incident escalation thresholds with owners and response actions
- [ ] Schedule 30-day and 60-day post-launch review checkpoints in project calendar
- [ ] Confirm sitemap submission procedure with migration owner

---

### Out of Scope

- Executing DNS cutover (Phase 7)
- Post-launch monitoring actions (Phase 9 — this workstream prepares the runbook, not executes it)
- Advanced analytics configuration (events, goals, audiences) beyond basic traffic measurement
- Bing Webmaster Tools setup (deferred — prioritize Google Search Console)
- Search Console API integration (manual monitoring is sufficient for launch)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-047 Done — Phase 5 Bootstrap complete | Ticket | Pending |
| RHI-005 Done — Phase 1 SEO baseline (top landing pages, inbound links, baseline traffic data) | Ticket | Pending |
| RHI-051 Done — Sitemap validated (sitemap URL confirmed for submission) | Ticket | Pending |
| Search Console property access confirmed for `https://www.rhino-inquisitor.com/` | Access | Pending |
| Migration owner available to confirm analytics tracking and verification method | Access | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Search Console verification method breaks during GitHub Pages domain reconfiguration | Medium | High | Confirm verification method at bootstrap; use DNS TXT verification if possible (most robust to hosting changes) | SEO Owner |
| No pre-launch baseline captured, making post-launch regression assessment impossible | Low | High | Capture baselines as a task-level gate in this workstream — do not defer to launch week | SEO Owner |
| Analytics tracking ID not present in production Hugo build, causing data loss post-launch | Medium | High | Verify analytics partial in templates as part of this workstream; run local build and confirm network request in browser dev tools | Engineering Owner |
| Monitoring runbook owners are undefined at launch time | Low | Medium | Assign owners for each monitoring checkpoint at bootstrap kickoff; record in runbook | SEO Owner |

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

- `migration/phase-5-monitoring-runbook.md`
- Pre-launch Search Console baseline screenshots/exports
- URL Inspection sample list (15–20 URLs)
- Analytics verification confirmed (local build dev tools check)
- 30/60-day review checkpoints scheduled

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- A monitoring runbook that is not written until after launch is a post-mortem document, not a prevention tool. The purpose of this workstream is to prepare the runbook and capture baselines BEFORE cutover so that post-launch deviations are detectable immediately.
- The DNS verification method for Search Console is the most migration-safe option: it is independent of the hosting provider and survives a move from WordPress to GitHub Pages. If the current verification method is the HTML file approach, assess whether it will survive the migration and switch to DNS TXT if there is any risk.
- Reference: `analysis/plan/details/phase-5.md` §Workstream J: Search Console and Analytics Monitoring Program
