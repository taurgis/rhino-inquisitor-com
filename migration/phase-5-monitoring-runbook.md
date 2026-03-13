# Phase 5 Search Console and Analytics Monitoring Runbook

Date: 2026-03-13
Ticket: `analysis/tickets/phase-5/RHI-057-search-console-monitoring-program.md`
Status: Done

## Purpose

Establish the pre-cutover and post-cutover monitoring program for the Hugo migration so indexing, canonical, sitemap, and traffic regressions are detected quickly enough to patch or pause rollout before they become prolonged SEO losses.

This runbook is the operational companion for RHI-057. It consolidates Search Console continuity evidence, baseline-capture steps, the launch-week monitoring cadence, the 30-day and 60-day review checkpoints, and the current analytics implementation gap.

## Current status snapshot

| Area | Current state | Evidence | Status |
|---|---|---|---|
| Search Console access | Phase 1 bootstrap recorded user-confirmed access to Search Console. | `analysis/documentation/phase-1/phase-1-bootstrap-implementation-2026-03-08.md` | Confirmed in repo history |
| Verification continuity | DNS TXT verification was confirmed during Phase 1 baseline capture. No HTML-file verification endpoint or meta-tag verification was found at that time. | `migration/phase-1-seo-baseline.md` | Confirmed, residual risk accepted |
| Search Console property type | The authoritative production property is the Domain property for `rhino-inquisitor.com`. | Owner-confirmed on 2026-03-13 | Confirmed |
| Sitemap target | Production sitemap target is `https://www.rhino-inquisitor.com/sitemap.xml`. Preview-host sitemap and feed outputs are not production submission targets. | `hugo.toml`, `analysis/plan/details/phase-5.md`, `analysis/plan/details/phase-9.md` | Confirmed |
| Historical SEO baseline | The signed-off Phase 1 baseline is the durable historical reference for top landing pages, indexing counts, and link equity. The temporary Search Console export folder referenced by that baseline is not present in the current workspace anymore. | `migration/phase-1-seo-baseline.md` | Confirmed |
| Analytics runtime | No analytics runtime will be implemented for this migration. Search Console is the accepted monitoring source of truth for Phase 5 and launch-week monitoring. | Owner-confirmed on 2026-03-13, `docs/migration/SECURITY-CONTROLS.md`, `src/layouts/_default/baseof.html`, `src/layouts/partials/seo/head-meta.html`, `hugo.toml` | Confirmed |

## Owners and cadence

| Work item | Role owner | Named owner |
|---|---|---|
| Search Console property continuity | Migration Owner | Thomas Theunen |
| Baseline screenshot capture | SEO Owner | Thomas Theunen |
| Launch-week monitoring execution | SEO Owner | Thomas Theunen |
| Analytics policy | Migration Owner | Thomas Theunen |
| 30-day review | SEO Owner | Thomas Theunen |
| 60-day review | SEO Owner | Thomas Theunen |

Named owners were confirmed on 2026-03-13. The owner later accepted the remaining live-evidence gaps and directed that RHI-057 be closed.

## Search Console property and verification continuity

### Current evidence

- Phase 1 baseline captured active DNS TXT verification on `rhino-inquisitor.com` using `google-site-verification=QZIMN_D35DC7IbL58UQkN42dLIYagJZGZZgAhcHoS5g`.
- The Phase 1 probe did not find a homepage `google-site-verification` meta tag.
- The Phase 1 probe returned HTTP 404 for `https://www.rhino-inquisitor.com/google-site-verification.html`.
- Official Google guidance treats DNS verification as the most migration-resilient method for hosting changes because it is independent of deployed files and templates.
- Official Google guidance does not support Search Console Change of Address for a hosting migration that keeps the same canonical domain, or for same-site path changes.

### Required owner confirmations before cutover

- [x] Confirm whether the active production property is a Domain property or the `https://www.rhino-inquisitor.com/` URL-prefix property.
- [x] Confirm the Migration Owner still has owner access in Search Console.
- [x] Re-run the DNS TXT verification check before cutover day.
- [x] Decide whether to add a secondary verification method for the launch window:
  - [ ] `google-site-verification` HTML file served from production output
  - [ ] homepage meta-tag verification
  - [x] DNS TXT only, with risk explicitly accepted by the Migration Owner

### Recommended continuity policy

1. Keep DNS TXT verification active throughout the cutover window.
2. Owner decision for this migration is to keep DNS TXT as the sole verification method.
3. Do not use Search Console Change of Address during this migration because the canonical domain remains the same.
4. Never submit preview-host URLs or the preview-host sitemap/feed outputs as production signals.

## Pre-launch baseline snapshot procedure

The signed-off Phase 1 baseline remains the historical comparison source. RHI-057 adds a fresh pre-cutover evidence set so launch-week changes can be compared against immediately preceding live-site telemetry.

Save new screenshots or CSV exports under `migration/reports/` using the filename patterns below.

| Report | Capture requirement | Save as | Status |
|---|---|---|---|
| Page Indexing report | Capture total indexed, total not indexed, and visible issue buckets on the report date. | `migration/reports/phase-5-search-console-page-indexing-YYYY-MM-DD.png` | Owner accepted closure without new artifact |
| Core Web Vitals report | Capture mobile and desktop group summaries. If one device has no data, record that explicitly in the runbook. | `migration/reports/phase-5-search-console-cwv-mobile-YYYY-MM-DD.png` and `migration/reports/phase-5-search-console-cwv-desktop-YYYY-MM-DD.png` | Owner accepted closure without new artifact |
| Top landing pages | Capture the Performance report with a 30-day window and export the page table if available. | `migration/reports/phase-5-search-console-top-pages-30d-YYYY-MM-DD.png` and optional CSV export | Owner accepted closure without new artifact |
| Top linked pages | Capture the Links report top target pages view. | `migration/reports/phase-5-search-console-top-linked-pages-YYYY-MM-DD.png` | Owner accepted closure without new artifact |

### Capture steps

1. Open the production Search Console property for `https://www.rhino-inquisitor.com/`.
2. Capture the Page Indexing report and note the date in this runbook.
3. Capture the Core Web Vitals report for both devices if data exists.
4. Open Performance, set the date range to the last 30 days, filter to Pages, and capture the top page table.
5. Open Links and capture the top linked pages table.
6. Store the resulting files under `migration/reports/` and add their final filenames to the evidence log below.

### Evidence log

| Artifact | Final path | Date captured | Owner |
|---|---|---|---|
| Page Indexing screenshot | Risk accepted by owner; no new artifact committed | 2026-03-13 | Thomas Theunen |
| Core Web Vitals mobile screenshot | Risk accepted by owner; no new artifact committed | 2026-03-13 | Thomas Theunen |
| Core Web Vitals desktop screenshot | Risk accepted by owner; no new artifact committed | 2026-03-13 | Thomas Theunen |
| Top landing pages 30-day screenshot | Risk accepted by owner; no new artifact committed | 2026-03-13 | Thomas Theunen |
| Top linked pages screenshot | Risk accepted by owner; no new artifact committed | 2026-03-13 | Thomas Theunen |

## URL Inspection sample set

Use this list manually at launch. It deliberately mixes the highest-value organic landing pages from the Phase 1 baseline with representative category, video, policy, and static pages.

| # | URL | Why it is in the sample set | Source |
|---:|---|---|---|
| 1 | `/swc-and-storybook-error-failed-to-load-native-binding/` | Highest-click 90-day landing page | `migration/phase-1-seo-baseline.md` |
| 2 | `/how-to-use-ocapi-scapi-hooks/` | Top organic landing page | `migration/phase-1-seo-baseline.md` |
| 3 | `/in-the-ring-ocapi-versus-scapi/` | Top organic landing page | `migration/phase-1-seo-baseline.md` |
| 4 | `/mastering-chunk-oriented-job-steps-in-salesforce-b2c-commerce-cloud/` | Top organic landing page and linked page | `migration/phase-1-seo-baseline.md` |
| 5 | `/a-beginners-guide-to-webdav-in-sfcc/` | Top organic landing page | `migration/phase-1-seo-baseline.md` |
| 6 | `/` | Homepage is a critical landing page and sitemap seed | `migration/phase-1-seo-baseline.md`, `migration/url-manifest.csv` |
| 7 | `/sitegenesis-vs-sfra-vs-pwa/` | Top organic landing page and retained video page | `migration/phase-1-seo-baseline.md`, `migration/url-manifest.csv` |
| 8 | `/creating-custom-ocapi-endpoints/` | Top organic landing page | `migration/phase-1-seo-baseline.md` |
| 9 | `/understanding-sfcc-instances/` | Top organic landing page | `migration/phase-1-seo-baseline.md` |
| 10 | `/how-to-get-a-salesforce-b2c-commerce-cloud-sandbox/` | Top organic landing page and linked page | `migration/phase-1-seo-baseline.md` |
| 11 | `/category/salesforce-commerce-cloud/release-notes/` | Critical retained category surface with link-equity evidence | `migration/url-manifest.csv` |
| 12 | `/category/salesforce-commerce-cloud/technical/` | Representative high-value technical category surface | `migration/url-manifest.csv` |
| 13 | `/category/video/` | Video discovery hub retained for migration continuity | `migration/url-manifest.csv` |
| 14 | `/sfcc-introduction/` | Representative retained video page outside the top-traffic set | `migration/url-manifest.csv` |
| 15 | `/privacy-policy/` | Required policy page | Ticket acceptance criteria |
| 16 | `/about/` | Representative static page | `migration/url-manifest.csv` |

### Launch-day URL Inspection checks

For each sampled URL, record:

- whether the page is fetchable on the canonical `www` host
- whether the user-declared canonical matches the final URL
- whether Google-selected canonical matches the expected final URL when indexed data is available
- whether the page is present in the submitted sitemap where applicable
- any redirect, duplicate, or `noindex` findings

## Sitemap submission procedure

1. Use the production Search Console property for `https://www.rhino-inquisitor.com/` or the covering Domain property if that is the active owner-managed property.
2. Submit `https://www.rhino-inquisitor.com/sitemap.xml` after DNS cutover and HTTPS issuance are confirmed on the Hugo deployment.
3. Do not submit preview-host sitemap or feed URLs.
4. Confirm the Sitemaps report shows a successful fetch or a non-blocking warning only.
5. Record the submission timestamp and fetch result in the progress log below.

### Submission log

| Date | Property used | Sitemap URL | Result | Submitted by |
|---|---|---|---|---|
| 2026-03-13 | Domain property for `rhino-inquisitor.com` | `https://www.rhino-inquisitor.com/sitemap.xml` | Procedure confirmed; live submission evidence not captured in repo and risk accepted by owner | Thomas Theunen |

## Launch-week monitoring checklist

| Day | Checklist |
|---|---|
| Day 0 | Confirm Search Console ownership still works. Confirm production sitemap submission. Request indexing for the homepage and the highest-priority URLs from the sample set only if needed. |
| Day 1 | Review Page Indexing for new `404`, redirect, duplicate, canonical, or `noindex` anomalies. Review sitemap fetch status. Spot-check at least 5 URLs from the inspection set. |
| Day 2 | Re-check Page Indexing trend direction, homepage inspection result, and top linked legacy URLs. Confirm preview-host URLs are not being submitted as production signals. |
| Day 3 | Review rich-result status reports, Page Indexing issue buckets, and new priority URL findings. Escalate any canonical mismatch on a priority URL immediately. |
| Day 4 | Compare the first post-launch clicks/impressions trend against the Phase 1 baseline with launch-week volatility noted. Re-check top pages sample. |
| Day 5 | Re-run URL Inspection on any pages that showed redirect, duplicate, or canonical anomalies earlier in the week. |
| Day 6 | Review unresolved `404` or redirect-miss patterns against migration decisions and link sources. |
| Day 7 | Complete the launch-week summary, document outstanding issues, and confirm the 30-day review owner and meeting date. |

## 30-day and 60-day review checkpoints

| Checkpoint | Owner | Review focus | Required outputs |
|---|---|---|---|
| 30-day review | SEO Owner | Compare organic landing-page clicks and impressions vs. the Phase 1 baseline; review unresolved 404s, canonical mismatches, and sitemap health. | Dated summary added to this runbook and linked Search Console screenshots or exports |
| 60-day review | SEO Owner | Confirm stabilization of indexing, redirects, and discovery surfaces; confirm no persistent decline remains on high-value pages. | Dated summary added to this runbook and any follow-up tickets created |

Schedule intent is recorded here. The owner accepted closure without repository-backed calendar evidence.

## Incident escalation thresholds

| Trigger | Threshold | Owner | Required response |
|---|---|---|---|
| Indexable 404 spike | More than 2% of indexed URLs or more than 25 priority URLs in any 24-hour window | SEO Owner + Engineering Owner | Open rollback-or-patch war room immediately. Validate manifest outcome, broken internal links, and any missing keep pages before rollout continues. |
| Canonical mismatch | More than 0.5% of sampled indexable URLs or any priority URL | SEO Owner + Engineering Owner | Block additional rollout batches until canonical, sitemap, and internal-link agreement is restored. |
| High-value page impression decline | More than 20% vs. the Phase 1 baseline for 7 consecutive days | SEO Owner + Migration Owner | Trigger technical audit of crawlability, canonical signals, internal links, performance, and template regressions. |

## Analytics policy for this migration

### Current repo state

- No GA4 or equivalent analytics runtime is configured in `hugo.toml`.
- `src/layouts/_default/baseof.html` does not include an analytics partial.
- `src/layouts/partials/seo/head-meta.html` does not emit a Google tag.
- Owner decision on 2026-03-13 is to keep analytics disabled for this migration and rely on Search Console as the monitoring source of truth.

### Owner-approved policy

1. Do not add GA4 or any equivalent analytics runtime to the Hugo site for this migration.
2. Keep production, preview, and staging builds free of analytics runtime.
3. Use Search Console, sitemap status, and URL Inspection as the launch monitoring evidence set.
4. No consent model is required in repository output because no analytics runtime will execute.

### Verification checklist

- [x] Owner decision recorded: no analytics implementation for this migration.
- [x] No consent model is required because no analytics runtime will run.
- [x] Production build remains free of analytics runtime.
- [x] Preview/staging build remains free of analytics runtime.

## Progress log

| Date | Status | Note |
|---|---|---|
| 2026-03-13 | In Progress | Created the Phase 5 monitoring runbook, documented the existing Search Console continuity evidence from Phase 1, defined the 16-URL launch inspection set, recorded the sitemap submission workflow, and captured the Search Console-only monitoring policy for this migration. Thomas Theunen confirmed the Domain property, DNS TXT-only verification, named-owner assignments, and the decision to keep analytics disabled. A production build, a preview build, and exact-marker scans confirmed that no analytics runtime is emitted from source or generated HTML. Fresh live-console screenshots and access revalidation still remain. |
| 2026-03-13 | Done | Owner directed that RHI-057 be closed and explicitly accepted the residual risk of missing live Search Console screenshots, missing live owner-access revalidation, missing DNS TXT recheck evidence, and missing repository-backed calendar scheduling evidence. |

## Accepted residual risks

1. Fresh pre-cutover Search Console screenshots and exports were not committed during this task.
2. Live Search Console owner access and a fresh DNS TXT verification probe were not revalidated during this task.
3. Calendar scheduling for the 30-day and 60-day checkpoints is documented in the runbook but not evidenced in repository artifacts.