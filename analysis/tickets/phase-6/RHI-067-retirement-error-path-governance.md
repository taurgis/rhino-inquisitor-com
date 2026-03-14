## RHI-067 · Workstream E — Retirement and Error Path Governance

**Status:** Done  
**Priority:** High  
**Estimate:** M  
**Phase:** 6  
**Assigned to:** Engineering Owner  
**Target date:** 2026-05-12  
**Created:** 2026-03-07  
**Updated:** 2026-03-14

---

### Goal

Ensure that every retired URL in the inventory has an explicit, documented outcome — either a meaningful not-found response (`404`) or, where technically feasible via an edge layer, a permanent removal response (`410`) — and that the custom `404` page provides genuine navigation recovery for users and crawlers. Prevent soft-404 patterns that arise from bulk-redirecting retired content to the homepage or thin category pages.

Unmanaged URL retirement is a silent SEO defect. Retired URLs that redirect to irrelevant destinations are treated as soft-404s by Google and waste crawl budget without passing equity. Retired URLs with no handling at all generate raw 404 signals, which is acceptable if intentional but must be explicit and monitored. This workstream makes retirement behavior deterministic, documented, and testable.

---

### Acceptance Criteria

- [x] Every URL with `disposition: retire` in `migration/url-map.csv` has a documented outcome:
  - [x] `404` behavior — URL resolves to Hugo's 404 page (expected default for retired static content on GitHub Pages)
  - [x] `410` behavior — only for URLs where edge layer (Model B) is active and permanent removal is confirmed intent
  - [x] No retired URL is redirected to homepage, category root, or any other destination unless topic equivalence is proven and documented
- [x] `migration/reports/phase-6-retired-url-audit.csv` is generated:
  - [x] One row per retired URL
  - [x] Columns: `legacy_url`, `route_class`, `reason_code`, `has_organic_traffic`, `has_external_links`, `outcome` (`404`/`410`/`redirect-exception`), `reviewer`, `notes`
  - [x] All rows with `has_organic_traffic: true` or `has_external_links: true` have an explicit `notes` entry confirming review decision
- [x] Retirement decision rubric is documented in `migration/phase-6-url-policy.md`:
  - [x] Redirect only when a topic-equivalent replacement exists (approved via WS-B)
  - [x] Return `404` when no equivalent exists and content is intentionally removed
  - [x] Return `410` only when: content is permanently removed AND edge layer is active AND removal is legally or editorially confirmed
  - [x] Never redirect to homepage as a fallback for retired content
- [x] Custom `404` page is implemented and meets quality bar:
  - [x] `src/content/404.md` exists with front matter `url: "/404/"` and `layout: "404"`
  - [x] `src/layouts/404.html` (or `src/layouts/_default/404.html`) exists and renders a helpful error page
  - [x] 404 page includes: clear "page not found" message, site search or navigation links, link to homepage, link to archive or categories
  - [x] 404 page has `<meta name="robots" content="noindex">` to prevent indexing
  - [x] 404 page returns HTTP 404 status code (GitHub Pages serves 404.html at HTTP 404 by default — verify this behavior)
- [x] `scripts/phase-6/check-retirement-policy.js` exits with code 0:
  - [x] Checks: no retired URL appears in sitemap, no retired URL has a redirect destination in the alias/redirect output
  - [x] Checks: `404` page exists at `public/404.html` in the production build

---

### Tasks

- [x] Load all `disposition: retire` records from `migration/url-map.csv`
- [x] For each retired URL record:
  - [x] Document the retirement reason code (content removed, duplicate of kept URL, spam/low-quality, system/technical route, etc.)
  - [x] Note organic traffic and external link status from Phase 1 baseline
  - [x] Confirm outcome: `404`, `410` (only if Model B/edge layer is active), or `redirect-exception` (requires WS-B approval)
  - [x] Flag any retired URL with `has_organic_traffic: true` and `has_external_links: true` for explicit SEO owner sign-off
- [x] Write `migration/reports/phase-6-retired-url-audit.csv`
- [x] Document retirement rubric in `migration/phase-6-url-policy.md`
- [x] Implement or verify custom `404` page:
  - [x] Create or update `src/content/404.md` with correct front matter
  - [x] Create or update `src/layouts/404.html` with navigation recovery elements
  - [x] Add `<meta name="robots" content="noindex">` to 404 template
  - [x] Build production site; verify `public/404.html` exists
  - [x] Test that GitHub Pages serves `404.html` on an unknown path (manual test with staging deploy or local Hugo server)
- [x] Verify no retired URL appears in sitemap output:
  - [x] Parse `public/sitemap.xml`; cross-check against retired URL list
  - [x] Fix any retired URL appearing in sitemap
- [x] Verify no retired URL is aliased to a destination:
  - [x] Grep all content file front matter for alias values that match retired URLs
  - [x] Remove any alias that corresponds to a URL with `retire` disposition
- [x] Write `scripts/phase-6/check-retirement-policy.js`
- [x] Run script against production build and fix all failures
- [x] Commit all changes: retired-url audit report, url-policy update, 404 page, and validation script

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
| Hugo content directory structure for `src/content/404.md` | Phase | Pending |

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

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-067 is complete. The repository now has a dedicated retirement-policy gate, a generated retired URL audit covering all `885` retire rows, an explicit retirement rubric in `migration/phase-6-url-policy.md`, and a strengthened custom 404 implementation with both the host-served `404.html` artifact and a non-indexable content-backed `/404/` route.

Runtime verification on 2026-03-14 confirmed that an unknown path on the preview GitHub Pages host returns the custom 404 page at HTTP `404`. The only request-aware retire route that does not produce deterministic `404` behavior under Model A is `/?s=ocapi`, which returns the homepage at HTTP `200` because it shares the published `/` path. The user accepted that route as the sole owner-approved residual limitation for RHI-067, and the retirement-policy gate now records it as a documented exception while still failing closed on any other request-aware retire route with the same pattern.

**Delivered artefacts:**

- `migration/reports/phase-6-retired-url-audit.csv` — retirement audit with outcomes and reviewer sign-off
- `migration/phase-6-url-policy.md` — updated with retirement decision rubric
- `src/content/404.md` — custom 404 page content file
- `src/layouts/404.html` — custom 404 page layout
- `scripts/phase-6/check-retirement-policy.js` — retirement policy validation script
- `analysis/documentation/phase-6/rhi-067-retirement-error-path-governance-2026-03-14.md` — implementation and verification evidence

**Deviations from plan:**

- `/?s=ocapi` is an owner-accepted residual Model A limitation because GitHub Pages cannot force a deterministic query-aware `404` when the legacy search route shares the published homepage path.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-14 | In Progress | Added `scripts/phase-6/check-retirement-policy.js`, wired `npm run check:retirement-policy`, generated `migration/reports/phase-6-retired-url-audit.csv`, documented the retirement rubric in `migration/phase-6-url-policy.md`, added `src/content/404.md`, and expanded the recovery links in `src/layouts/404.html`. Verification on a clean production build: `npm run build:prod` completed with `Pages 204`, `Paginator pages 17`, and zero build errors; `npm run check:metadata` passed for `215` indexable pages with `10` warnings; `npm run check:sitemap` passed for `215` sitemap URLs; `npm run check:crawl-controls` passed for `238` production HTML routes. `npm run check:retirement-policy` audited `885` retired URL rows and failed only `/?s=ocapi` because that request-aware retire route shares the published `/` path and cannot guarantee deterministic `404` behavior under Model A without an edge layer. |
| 2026-03-14 | Done | User accepted `/?s=ocapi` as the sole owner-approved Model A residual limitation for RHI-067. Updated `scripts/phase-6/check-retirement-policy.js` to codify that single exception and fail closed on any other request-aware retire route with the same pattern. Re-ran `npm run check:retirement-policy`, which passed after auditing `885` retire rows. Runtime GitHub Pages verification on `https://taurgis.github.io/rhino-inquisitor-com/` confirmed that an unknown path returns HTTP `404`, while `/?s=ocapi` still returns HTTP `200` on the homepage and remains documented as the accepted residual limitation. |

---

### Notes

- The key principle: a `404` response for intentionally retired content is a legitimate and correct SEO outcome. It is not a "failure" to be papered over with a homepage redirect. Google treats genuine 404s appropriately; the equity for that URL is eventually dropped from the index cleanly. Soft-404s (redirecting to irrelevant destinations) are much worse because they confuse the index for months.
- `410 Gone` is semantically stronger than `404` for permanently removed content, but it is only achievable via an edge/server layer. GitHub Pages + Hugo aliases cannot serve a `410` status. If Model A is chosen in RHI-062, all retired URLs will result in `404` behavior.
- `/?s=ocapi` remains the sole owner-accepted residual Model A limitation for this ticket. GitHub Pages ignores the query-string layer on the published `/` route, so this legacy WordPress search URL cannot be forced to a deterministic `404` without an edge layer.
- The custom `404` page is both a UX requirement and an SEO signal. It should have a `noindex` meta tag because there is no value in indexing a 404 page, and it should provide real navigation options so users can find what they were looking for. A generic "page not found" with no links is a UX failure.
- Pagination URLs (e.g., `/page/2/`, `/category/sfcc/page/3/`) are almost always safe to retire. They should be grouped and documented as a class-level retirement decision rather than reviewed individually.
- Reference: `analysis/plan/details/phase-6.md` §Workstream E, §SEO Implications and Best-Practice Enforcement
