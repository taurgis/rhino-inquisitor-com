## RHI-057 · Workstream J — Search Console and Analytics Monitoring Program

**Status:** Done  
**Priority:** High  
**Estimate:** M  
**Phase:** 5  
**Assigned to:** SEO Owner  
**Target date:** 2026-04-24  
**Created:** 2026-03-07  
**Updated:** 2026-03-13

---

### Goal

Establish the monitoring program that will detect migration regressions before and after DNS cutover. Prepare Google Search Console for the new Hugo site, create baseline snapshots for post-launch comparison, define incident escalation thresholds, and document the monitoring runbook with owners and cadence.

A monitoring program that is not set up before cutover provides no early warning. Post-launch SEO regression analysis without a pre-launch baseline is forensic, not preventive. This workstream ensures the monitoring infrastructure and runbook are ready before Phase 7 DNS cutover begins.

---

### Acceptance Criteria

- [x] `migration/phase-5-monitoring-runbook.md` is committed and contains:
  - [x] Google Search Console property status: existing property confirmed or new property added for Hugo site
  - [x] Pre-launch baseline snapshot instructions (indexing count, CWV report, top landing pages, inbound links)
  - [x] URL Inspection sample set: list of 15–20 high-value URLs to check manually at launch
  - [x] Sitemap submission procedure: which Search Console property, which sitemap URL, who submits
  - [x] Launch-week monitoring checklist (daily tasks for the first 7 days post-cutover)
  - [x] 30-day and 60-day review checkpoints with owners
  - [x] Incident escalation thresholds with owner and response action:
    - [x] Indexable 404 spike: >2% of indexed URLs or >25 priority URLs in any 24-hour window → rollback/patch
    - [x] Canonical mismatch: >0.5% of sampled indexable URLs or any priority URL → block further rollout
    - [x] High-value page impression decline: >20% vs. Phase 1 baseline for 7 consecutive days → technical audit
- [x] Analytics policy is recorded for the migration:
  - [x] Owner decision: no analytics runtime will be implemented for this migration
  - [x] Search Console is the accepted monitoring source of truth for Phase 5 and launch week
  - [x] No consent model is required because no analytics runtime is shipped
- [x] Search Console access is verified:
  - [x] Existing Search Console property for `https://www.rhino-inquisitor.com/` is confirmed accessible
  - [x] DNS and HTML verification method for the canonical `www` host is confirmed and will survive the migration
  - [x] Ownership is confirmed with the migration owner
- [x] Baseline snapshots are captured before cutover:
  - [x] Page Indexing report screenshot saved
  - [x] Core Web Vitals report screenshot saved
  - [x] Top landing pages (by clicks) screenshot saved — minimum 30-day window
  - [x] Top linked pages (Links report) screenshot saved
  - [x] All baselines committed to `migration/phase-5-monitoring-runbook.md` or linked artifacts
- [x] URL Inspection sample list (15–20 high-value URLs) is prepared:
  - [x] Includes homepage
  - [x] Includes top 10 organic landing pages from Phase 1 SEO baseline (RHI-005)
  - [x] Includes 2–3 category pages
  - [x] Includes 1–2 video pages
  - [x] Includes privacy policy and at least one static page
- [x] Analytics policy is confirmed:
  - [x] No analytics runtime will be configured in the Hugo template for this migration
  - [x] No analytics tracking is allowed on staging/preview environments
  - [x] Search Console remains the monitoring source of truth

---

### Tasks

- [x] Verify Search Console access for `https://www.rhino-inquisitor.com/`:
  - [x] Confirm property type: domain property or URL prefix property
  - [x] Confirm verification method: DNS TXT record, HTML file, or GA integration
  - [x] Confirm that the verification method will survive a GitHub Pages deployment change
  - [x] Record access confirmation and owner in Progress Log
- [x] Capture pre-launch baseline snapshots in Search Console:
  - [x] Page Indexing report (record total indexed, not-indexed, and error breakdowns)
  - [x] Core Web Vitals (Good/NI/Poor counts by device)
  - [x] Performance report — Top pages by clicks (30-day window)
  - [x] Links report — Top linked pages
  - [x] Save screenshots or CSV exports to `migration/` directory or link from runbook
- [x] Build URL Inspection sample list:
  - [x] Pull top 10 pages from Phase 1 SEO baseline (RHI-005)
  - [x] Add homepage, privacy policy, 2 categories, 1 video page
  - [x] Record final list in `migration/phase-5-monitoring-runbook.md`
- [x] Record analytics owner decision in monitoring artifacts:
  - [x] Confirm no analytics runtime will be added for this migration
  - [x] Confirm no consent model is needed because no analytics runtime will ship
  - [x] Confirm production and preview builds remain free of analytics runtime
- [x] Draft `migration/phase-5-monitoring-runbook.md`:
  - [x] Pre-launch checklist section
  - [x] Launch-week daily monitoring checklist
  - [x] 30/60-day review checkpoints
  - [x] Incident escalation thresholds with owners and response actions
- [x] Schedule 30-day and 60-day post-launch review checkpoints in project calendar
- [x] Confirm sitemap submission procedure with migration owner

---

### Out of Scope

- Executing DNS cutover (Phase 7)
- Post-launch monitoring actions (Phase 9 — this workstream prepares the runbook, not executes it)
- Analytics implementation for production or preview builds (owner decision: no analytics runtime for this migration)
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
| Search Console property access confirmed for `https://www.rhino-inquisitor.com/` | Access | Done |
| Migration owner available to confirm Search Console verification method and no-analytics policy | Access | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Search Console verification method breaks during GitHub Pages domain reconfiguration | Medium | High | Confirm verification method at bootstrap; use DNS TXT verification if possible (most robust to hosting changes) | SEO Owner |
| No pre-launch baseline captured, making post-launch regression assessment impossible | Low | High | Capture baselines as a task-level gate in this workstream — do not defer to launch week | SEO Owner |
| Search Console-only monitoring misses analytics-side behavior data | Medium | Medium | Owner accepted a Search Console-only monitoring posture for this migration; rely on Search Console, sitemap, and URL Inspection evidence during launch week | Migration Owner |
| Monitoring runbook owners are undefined at launch time | Low | Medium | Assign owners for each monitoring checkpoint at bootstrap kickoff; record in runbook | SEO Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-057 is complete. The repository now contains the Phase 5 monitoring runbook, the 16-URL launch inspection set, the sitemap submission workflow, launch-week and 30-day and 60-day monitoring cadence, and the owner-approved Search Console-only monitoring policy for this migration. The owner explicitly accepted the risk of closing the ticket without fresh live Search Console screenshots, live Search Console access revalidation, DNS TXT recheck, or calendar-backed checkpoint evidence in the repository.

**Delivered artefacts:**

- `migration/phase-5-monitoring-runbook.md`
- Risk-accepted placeholder evidence references in `migration/phase-5-monitoring-runbook.md`
- URL Inspection sample list (15–20 URLs)
- Search Console-only monitoring decision recorded with owner confirmation
- 30/60-day review checkpoints documented in the runbook

**Deviations from plan:**

- Ticket closed on owner risk acceptance without committing fresh Search Console screenshots or exports.
- Ticket closed on owner risk acceptance without revalidating live Search Console access or rerunning the DNS TXT verification probe during this task.
- Ticket closed on owner risk acceptance without repository evidence for scheduled calendar events.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-13 | In Progress | Drafted `migration/phase-5-monitoring-runbook.md`, documented the existing DNS TXT verification continuity evidence from the signed-off Phase 1 baseline, assembled the 16-URL launch inspection sample set, and recorded the launch-week, 30-day, and 60-day monitoring cadence. Thomas Theunen confirmed the Domain property, DNS TXT-only verification, named-owner assignments, and the decision to keep analytics disabled for this migration. A production build, a preview build, and exact-marker scans confirmed that no analytics runtime is emitted from source or generated HTML. Fresh live Search Console screenshots and access revalidation remain open. |
| 2026-03-13 | Done | Owner directed that all remaining RHI-057 items be marked complete and explicitly accepted the residual risk. The ticket was closed without new live Search Console screenshots, live owner-access revalidation, DNS TXT recheck evidence, or repository-backed calendar scheduling evidence. |

---

### Notes

- A monitoring runbook that is not written until after launch is a post-mortem document, not a prevention tool. The purpose of this workstream is to prepare the runbook and capture baselines BEFORE cutover so that post-launch deviations are detectable immediately.
- The DNS verification method for Search Console is the most migration-safe option: it is independent of the hosting provider and survives a move from WordPress to GitHub Pages. For this migration, the owner explicitly chose DNS TXT as the only verification method.
- The remaining live Search Console evidence gaps were explicitly accepted by the owner when closing this ticket.
- Reference: `analysis/plan/details/phase-5.md` §Workstream J: Search Console and Analytics Monitoring Program
