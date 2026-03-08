## RHI-095 · Workstream B — Search Console Activation and Indexing Transition

**Status:** Open  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 9  
**Workstream:** WS-B  
**Assigned to:** SEO Owner  
**Target date:** 2026-07-29  
**Created:** 2026-03-08  
**Updated:** 2026-03-08

---

### Goal

Activate Google Search Console for the production host on launch day, submit the canonical sitemap, monitor the indexing transition for the full 6-week stabilization window, and detect and remediate any indexing coverage defects early enough to prevent lasting ranking impact.

Indexing changes are not instantaneous; ranking and coverage volatility is expected for weeks after cutover. Success means the indexing trend moves in the expected direction, every high-value URL is confirmed indexed or has an explicit understood exclusion reason, and no systemic soft-404, redirect-error, or coverage-drop pattern goes undetected.

---

### Acceptance Criteria

**Launch day (T+0):**
- [ ] Final production sitemap (`https://www.rhino-inquisitor.com/sitemap.xml`) submitted in Search Console Sitemaps report
- [ ] Sitemap fetch starts without parsing errors; sitemap status noted in `monitoring/sitemap-processing-report.json`
- [ ] URL Inspection run on highest-priority URLs (homepage + top 5 by organic traffic) to record initial indexed-vs-live state
- [ ] Priority URL Inspection outcomes recorded in `monitoring/url-inspection-sample-report.json`

**Week 1 (daily reviews):**
- [ ] Page Indexing report reviewed daily for: Not found (404), Soft 404, Redirect errors, Crawled-but-not-indexed
- [ ] Sitemaps report reviewed daily for fetch and parse health
- [ ] Canonical template correctness validated on live host for homepage and article template
- [ ] All Sev-1/Sev-2 indexing triggers escalated per severity model
- [ ] Daily findings recorded in `monitoring/search-console-indexing-report.md`

**Weeks 2–6 (weekly reviews):**
- [ ] Weekly indexing trend review against Phase 1 SEO baseline and expected migration curve
- [ ] Weekly excluded-URL reason review with remediation backlog updated
- [ ] Sitemap re-submitted only when a material URL set change occurs; re-submission rationale recorded
- [ ] Weekly findings appended to `monitoring/search-console-indexing-report.md`

**Stabilization exit:**
- [ ] Indexing trend is stable or improving for two consecutive weekly review periods
- [ ] No high-value URL in the priority set has an unresolved or unexplained exclusion
- [ ] Sitemap contains only canonical, indexable URLs (no redirected or helper pages)
- [ ] Sitemaps report confirms successful fetch and no parsing errors at end of stabilization window

---

### Tasks

**Launch-day setup:**
- [ ] Log in to Search Console; confirm `https://www.rhino-inquisitor.com` property is verified
- [ ] Navigate to Sitemaps report; submit `https://www.rhino-inquisitor.com/sitemap.xml`
- [ ] Confirm sitemap submission is accepted; record timestamp and initial status
- [ ] Use URL Inspection for the priority URL set (homepage + top organic pages from Phase 1 baseline); record outcomes
- [ ] Note any "URL is on Google" vs "URL is not on Google" differences vs the old WordPress URLs; these are expected and not Sev-1 on day 1 unless they represent critical template failures
- [ ] Record all launch-day Search Console actions in `monitoring/url-inspection-sample-report.json`

**Week 1 daily checks:**
- [ ] Review Page Indexing report; record daily snapshot of total indexed, excluded (by reason class), and errors
- [ ] Flag any Not Found (404), Soft 404, or Redirect Error in the excluded list and cross-reference against the URL manifest
- [ ] Check for accidental `noindex` on canonically indexable pages using URL Inspection spot-checks
- [ ] Check Sitemaps report fetch status; record any failures or warnings
- [ ] Run canonical consistency spot-check on live templates; record in `monitoring/canonical-consistency-report.json`
- [ ] Raise Sev-1 if: high-value route class shows systemic 404/soft-404; sitemap contains non-canonical URLs
- [ ] Raise Sev-2 if: indexing coverage trend stalls unexpectedly without clear cause
- [ ] Append daily findings to `monitoring/search-console-indexing-report.md`

**Weeks 2–6 weekly checks:**
- [ ] Pull Page Indexing trend data each week; compare against previous week and baseline
- [ ] Review excluded URL reasons; update remediation backlog for any new systemic exclusions
- [ ] Review Sitemaps report; confirm fetch health
- [ ] Re-submit sitemap only if material URL content changes occurred that week
- [ ] Record interpretation summary with expected vs actual trajectory
- [ ] Append weekly findings to `monitoring/search-console-indexing-report.md`

**Ongoing hygiene:**
- [ ] Do not use Change of Address tool — this is a platform-only migration with no URL scheme change; Change of Address is for domain-level moves only
- [ ] Do not use Request Indexing as a substitute for sitemap-driven broad discovery — use it only for a small critical set (homepage + highest-value articles)
- [ ] Monitor Search Console API quota usage if automation is active; do not exceed URL Inspection limits

---

### Out of Scope

- Submitting paid/search-ads sitemaps or product feeds
- Evaluating ranking position changes as a quality gate (ranking fluctuations are expected and not actionable in week 1–2)
- Bing Webmaster Tools or other search engine consoles (separate task if needed)
- Long-term content strategy or new content creation
- Search Analytics performance report analysis (Sev-3 monitoring task, not a blocker)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-093 Done — Phase 9 Bootstrap; Search Console access confirmed | Ticket | Pending |
| RHI-094 Done — Cutover executed; `sitemap.xml` live on production host | Ticket | Pending |
| Phase 1 SEO baseline (`migration/phase-1-seo-baseline.md`) available for trend comparison | Phase | Pending |
| Validated sitemap from Phase 5 (`RHI-051`) with canonical-only URLs | Phase | Pending |
| Search Console `https://www.rhino-inquisitor.com` property verified | Access | Pending |
| `googleapis` credentials available for optional API automation | Access | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Sitemap submission blocked by parsing error (malformed XML, wrong content-type) | Low | High | Validate sitemap with `fast-xml-parser` before submission; confirm content-type is `application/xml` | Engineering Owner |
| Soft-404s appear on redirected URLs that Google still has cached | Medium | Medium | This is expected during transition; classify by trend (improving vs worsening) and remediate only if systemic | SEO Owner |
| Search Console URL Inspection quota exceeded by automated sampling | Medium | Medium | Rate-limit API calls per Search Console API usage limits; use Page Indexing report for bulk signals | SEO Owner |
| Indexing coverage drop appears to be catastrophic on Day 1 | Medium | Medium | Day-1 snapshot is not representative; Google has not yet re-crawled all pages; assess trend over week 1 | SEO Owner |
| Search Console verification lost after DNS change | Low | High | Pre-check TXT record at bootstrap; restore immediately if broken; escalate to Sev-2 | SEO Owner |
| High-value articles remain uncrawled at end of week 2 | Low | High | Use Request Indexing for top-5 priority articles; review canonical and internal-link signals for affected pages | SEO Owner |

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

- `monitoring/search-console-indexing-report.md` — daily week-1 and weekly week-2–6 findings
- `monitoring/url-inspection-sample-report.json` — priority URL Inspection outcomes
- `monitoring/sitemap-processing-report.json` — sitemap submission and fetch-status log

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |

---

### Notes

- Sitemap submission accelerates discovery but does not guarantee indexing timing. Do not interpret a 0% indexed rate on day 1 as a defect — assess by trend over the 6-week window.
- The Page Indexing report is the primary bulk signal source for indexed/excluded direction. URL Inspection is per-URL and quota-limited; use it surgically for priority URLs only.
- Search Console data lags by up to a few days. Compare week-over-week trends to identify systemic issues, not daily snapshots.
- Do not use the Change of Address tool. This migration does not change URL paths or domain; it is a platform/hosting change only. Incorrect use of Change of Address creates irreversible signals in Google Search that are very difficult to undo.
- Reference: `analysis/plan/details/phase-9.md` §Workstream B: Search Console Activation and Indexing Transition, §SEO Implications and Best-Practice Enforcement
