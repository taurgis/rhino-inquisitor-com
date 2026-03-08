## RHI-067 · Workstream E — Retirement and Error Path Governance

**Status:** Open  
**Priority:** High  
**Estimate:** M  
**Phase:** 6  
**Assigned to:** Engineering Owner  
**Target date:** 2026-05-12  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Ensure that every retired URL in the inventory has an explicit, documented outcome — either a meaningful not-found response (`404`) or, where technically feasible via an edge layer, a permanent removal response (`410`) — and that the custom `404` page provides genuine navigation recovery for users and crawlers. Prevent soft-404 patterns that arise from bulk-redirecting retired content to the homepage or thin category pages.

Unmanaged URL retirement is a silent SEO defect. Retired URLs that redirect to irrelevant destinations are treated as soft-404s by Google and waste crawl budget without passing equity. Retired URLs with no handling at all generate raw 404 signals, which is acceptable if intentional but must be explicit and monitored. This workstream makes retirement behavior deterministic, documented, and testable.

---

### Acceptance Criteria

- [ ] Every URL with `disposition: retire` in `migration/url-map.csv` has a documented outcome:
  - [ ] `404` behavior — URL resolves to Hugo's 404 page (expected default for retired static content on GitHub Pages)
  - [ ] `410` behavior — only for URLs where edge layer (Model B) is active and permanent removal is confirmed intent
  - [ ] No retired URL is redirected to homepage, category root, or any other destination unless topic equivalence is proven and documented
- [ ] `migration/reports/phase-6-retired-url-audit.csv` is generated:
  - [ ] One row per retired URL
  - [ ] Columns: `legacy_url`, `route_class`, `reason_code`, `has_organic_traffic`, `has_external_links`, `outcome` (`404`/`410`/`redirect-exception`), `reviewer`, `notes`
  - [ ] All rows with `has_organic_traffic: true` or `has_external_links: true` have an explicit `notes` entry confirming review decision
- [ ] Retirement decision rubric is documented in `migration/phase-6-url-policy.md`:
  - [ ] Redirect only when a topic-equivalent replacement exists (approved via WS-B)
  - [ ] Return `404` when no equivalent exists and content is intentionally removed
  - [ ] Return `410` only when: content is permanently removed AND edge layer is active AND removal is legally or editorially confirmed
  - [ ] Never redirect to homepage as a fallback for retired content
- [ ] Custom `404` page is implemented and meets quality bar:
  - [ ] `content/404.md` exists with front matter `url: "/404/"` and `layout: "404"`
  - [ ] `layouts/404.html` (or `layouts/_default/404.html`) exists and renders a helpful error page
  - [ ] 404 page includes: clear "page not found" message, site search or navigation links, link to homepage, link to archive or categories
  - [ ] 404 page has `<meta name="robots" content="noindex">` to prevent indexing
  - [ ] 404 page returns HTTP 404 status code (GitHub Pages serves 404.html at HTTP 404 by default — verify this behavior)
- [ ] `scripts/phase-6/check-retirement-policy.js` exits with code 0:
  - [ ] Checks: no retired URL appears in sitemap, no retired URL has a redirect destination in the alias/redirect output
  - [ ] Checks: `404` page exists at `public/404.html` in the production build

---

### Tasks

- [ ] Load all `disposition: retire` records from `migration/url-map.csv`
- [ ] For each retired URL record:
  - [ ] Document the retirement reason code (content removed, duplicate of kept URL, spam/low-quality, system/technical route, etc.)
  - [ ] Note organic traffic and external link status from Phase 1 baseline
  - [ ] Confirm outcome: `404`, `410` (only if Model B/edge layer is active), or `redirect-exception` (requires WS-B approval)
  - [ ] Flag any retired URL with `has_organic_traffic: true` and `has_external_links: true` for explicit SEO owner sign-off
- [ ] Write `migration/reports/phase-6-retired-url-audit.csv`
- [ ] Document retirement rubric in `migration/phase-6-url-policy.md`
- [ ] Implement or verify custom `404` page:
  - [ ] Create or update `content/404.md` with correct front matter
  - [ ] Create or update `layouts/404.html` with navigation recovery elements
  - [ ] Add `<meta name="robots" content="noindex">` to 404 template
  - [ ] Build production site; verify `public/404.html` exists
  - [ ] Test that GitHub Pages serves `404.html` on an unknown path (manual test with staging deploy or local Hugo server)
- [ ] Verify no retired URL appears in sitemap output:
  - [ ] Parse `public/sitemap.xml`; cross-check against retired URL list
  - [ ] Fix any retired URL appearing in sitemap
- [ ] Verify no retired URL is aliased to a destination:
  - [ ] Grep all content file front matter for alias values that match retired URLs
  - [ ] Remove any alias that corresponds to a URL with `retire` disposition
- [ ] Write `scripts/phase-6/check-retirement-policy.js`
- [ ] Run script against production build and fix all failures
- [ ] Commit all changes: retired-url audit report, url-policy update, 404 page, and validation script

---

### Out of Scope

- Implementing redirects for content being `keep` or approved `redirect` dispositions (WS-C: RHI-065)
- Deciding which URLs to retire (WS-A: RHI-063 and WS-B: RHI-064 — must be Done first)
- DNS-level `410` responses without an edge layer (not achievable on GitHub Pages alone)
- Post-launch monitoring of 404 trends (Phase 9 scope, but retirement audit report feeds Phase 9 baseline)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-063 Done — finalized URL inventory with `retire` dispositions confirmed | Ticket | Pending |
| RHI-064 Done — intent review complete; no retired URL has an unapproved redirect destination | Ticket | Pending |
| RHI-062 Done — architecture decision (determines `410` feasibility) | Ticket | Pending |
| Phase 3 template scaffold (RHI-023) for 404 page layout | Phase | Pending |
| Hugo content directory structure for `content/404.md` | Phase | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| High-traffic or high-backlink retired URLs have no suitable redirect alternative | Medium | High | Surface these URLs during retirement audit for explicit SEO owner review; options are: accept 404 and monitor, create a new relevant content page, or find a topic-equivalent destination | SEO Owner |
| 404 page is not served by GitHub Pages at HTTP 404 status (misconfigured Pages setup) | Low | Medium | Test with a deliberate unknown path on the staging deploy; verify HTTP status code in response; Pages should serve `404.html` at 404 by default | Engineering Owner |
| Legacy WordPress URLs that return 404 in WordPress are being retired in the new site, but some still have external backlinks | Medium | Medium | Flag all retired URLs with `has_external_links: true` for SEO owner review; in many cases a 404 is acceptable if the content was already 404 in WordPress; document decision per-URL | SEO Owner |
| Bulk of retired URLs belongs to a high-count route class (e.g., pagination, attachments) | Medium | Low | Group retirement by route class; confirm per-class policy once rather than per-URL; document class-level policy in url-policy document | Migration Owner |

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

- `migration/reports/phase-6-retired-url-audit.csv` — retirement audit with outcomes and reviewer sign-off
- `migration/phase-6-url-policy.md` — updated with retirement decision rubric
- `content/404.md` — custom 404 page content file
- `layouts/404.html` — custom 404 page layout
- `scripts/phase-6/check-retirement-policy.js` — retirement policy validation script

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- The key principle: a `404` response for intentionally retired content is a legitimate and correct SEO outcome. It is not a "failure" to be papered over with a homepage redirect. Google treats genuine 404s appropriately; the equity for that URL is eventually dropped from the index cleanly. Soft-404s (redirecting to irrelevant destinations) are much worse because they confuse the index for months.
- `410 Gone` is semantically stronger than `404` for permanently removed content, but it is only achievable via an edge/server layer. GitHub Pages + Hugo aliases cannot serve a `410` status. If Model A is chosen in RHI-062, all retired URLs will result in `404` behavior.
- The custom `404` page is both a UX requirement and an SEO signal. It should have a `noindex` meta tag because there is no value in indexing a 404 page, and it should provide real navigation options so users can find what they were looking for. A generic "page not found" with no links is a UX failure.
- Pagination URLs (e.g., `/page/2/`, `/category/sfcc/page/3/`) are almost always safe to retire. They should be grouped and documented as a class-level retirement decision rather than reviewed individually.
- Reference: `analysis/plan/details/phase-6.md` §Workstream E, §SEO Implications and Best-Practice Enforcement
