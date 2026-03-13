## RHI-058 · Workstream K — Non-HTML Resource SEO Controls

**Status:** Done  
**Priority:** Medium  
**Estimate:** S  
**Phase:** 5  
**Assigned to:** SEO Owner  
**Target date:** 2026-04-25  
**Created:** 2026-03-07  
**Updated:** 2026-03-13

---

### Goal

Classify all non-HTML legacy resources (PDFs, media files, downloadable attachments) from the WordPress migration and define the correct disposition and index-control behavior for each class. GitHub Pages is a static host with no per-path HTTP header control — this means `X-Robots-Tag` is not emittable per path, and any non-HTML de-indexing or redirect needs must be handled at the edge, the DNS layer, or by preserving/retiring the resource.

This workstream prevents migration blind spots for non-HTML content that could remain indexed or become orphaned 404s after cutover.

---

### Acceptance Criteria

- [x] Non-HTML resource inventory is complete:
  - [x] All legacy non-HTML URLs identified in Phase 1 URL inventory are classified (`keep`, `redirect`, `retire`)
  - [x] Classification is recorded in `migration/reports/phase-5-non-html-policy.csv` with the following fields:
    - [x] `legacy_url` — original WordPress path
    - [x] `resource_type` — `pdf`, `media`, `attachment`, `feed`, `other`
    - [x] `disposition` — `keep`, `redirect`, `retire`
    - [x] `target_url` — final destination (if `redirect`) or `null`
    - [x] `index_control_needed` — `yes` or `no`
    - [x] `implementation_layer` — `pages-static`, `edge-cdn`, `dns`, `none`
    - [x] `header_control_possible` — `yes` or `no` (is `X-Robots-Tag` emittable on this resource on the chosen hosting path?)
    - [x] `owner` — who is responsible for implementing this record's outcome
- [x] For every non-HTML resource requiring index control:
  - [x] If `X-Robots-Tag` is required but the hosting path cannot emit it: document the gap and proposed resolution (edge layer, retire the resource, or preserve on infrastructure that supports headers)
  - [x] No non-HTML de-indexing need is left unresolved as of sign-off
- [x] Static assets committed to `src/static/` in the Hugo repo are confirmed:
  - [x] Served correctly under their expected paths in the `public/` build
  - [x] No legacy WordPress `wp-content/uploads` dependency remains for in-scope assets
- [x] `migration/reports/phase-5-non-html-policy.csv` is reviewed and signed off by SEO owner
- [x] Any non-HTML resource requiring an edge redirect or header-level control is escalated to Phase 6 with a documented handover entry

---

### Tasks

- [x] Pull all non-HTML URLs from Phase 1 URL inventory (`migration/url-inventory.normalized.json`):
  - [x] Filter for `url_class: attachment` records
  - [x] Identify PDF, media, and downloadable file paths
  - [x] Identify feed URLs (`/feed/`, category feeds) already handled in WS-D (RHI-051)
- [x] Classify each non-HTML resource:
  - [x] Determine if the resource is still needed (`keep`) or can be retired
  - [x] If `keep`: confirm the file exists in `src/static/` and is served correctly
  - [x] If `redirect`: record target URL and confirm mechanism (`pages-static` alias or `edge-cdn`)
  - [x] If `retire`: confirm no organic traffic or backlinks exist (per Phase 1 baseline); confirm 404 behavior
- [x] Assess `X-Robots-Tag` feasibility for each non-HTML resource needing index control:
  - [x] Confirm GitHub Pages cannot emit per-path `X-Robots-Tag` headers for static files
  - [x] For each resource needing `noindex` header: document whether it can be retired, moved to edge, or preserved as-is
- [x] Build `migration/reports/phase-5-non-html-policy.csv`
- [x] Escalate any records requiring edge-layer or header-level controls to Phase 6 owner with documented handover
- [x] Confirm all in-scope `src/static/` assets are present in `public/` after a local build
- [x] Record sign-off confirmation in Progress Log

---

### Out of Scope

- WordPress media database or `wp-content/uploads` CDN management (Phase 4 WS-F scope for downloads)
- Video hosting platform management (YouTube embeds are HTML, not non-HTML resources)
- `robots.txt` for HTML pages (Workstream C, RHI-050)
- Edge redirect infrastructure implementation (Phase 6 scope)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-047 Done — Phase 5 Bootstrap complete | Ticket | Done |
| RHI-002 Done — Phase 1 URL discovery (non-HTML URL classes identified) | Ticket | Done |
| RHI-037 Done — Phase 4 media migration (which static files are committed to repo) | Ticket | Done |
| `migration/url-inventory.normalized.json` with attachment/PDF URL classification | Phase | Available |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| GitHub Pages cannot emit `X-Robots-Tag` for PDFs/attachments needing de-indexing | High | Medium | Classify resources that need de-indexing at the start; if edge layer is unavailable, retire the resource or serve via a dedicated path on infrastructure that supports headers | SEO Owner |
| Non-HTML attachment URLs with backlinks are retired without a redirect, losing link equity | Low | High | Cross-reference attachment URLs against Phase 1 backlink data before assigning `retire` — any URL with external backlinks requires a redirect or explicit SEO owner approval to retire | SEO Owner |
| Phase 1 URL inventory incomplete for attachment class (some PDF paths not captured in sitemaps) | Medium | Medium | Review WordPress media library or search for `wp-content/uploads` paths in extracted content during Phase 4 | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-058 is complete. The repository now has a reproducible non-HTML policy artifact for manifest-tracked attachment and feed URLs, the feed compatibility helper routes are aligned with the already-approved RHI-051 policy, and the owner-approved split policy for high-signal attachments is recorded as exact media redirects where a migrated asset exists, preserved direct static downloads for the two article PDFs that had to remain attached, and an article-level redirect only where the legacy standalone PDF binary still does not exist.

**Delivered artefacts:**

- `migration/reports/phase-5-non-html-policy.csv`
- `scripts/seo/build-non-html-policy.js`
- `analysis/documentation/phase-5/rhi-058-non-html-resource-seo-controls-implementation-2026-03-13.md`
- `package.json` updated with `check:non-html-policy`
- Phase 6 handover encoded as all `edge-cdn` rows in `migration/reports/phase-5-non-html-policy.csv`
- SEO owner sign-off recorded in Progress Log

**Deviations from plan:**

- Feed helper compatibility rows `/feed/rss/` and `/feed/atom/` are included in the Phase 5 policy artifact even though they were not present in the legacy manifest, because RHI-051 already approved them as required compatibility routes.
- Two legacy PDFs originally redirected to article pages were corrected to preserved `keep` outcomes after owner clarification required them to stay attached as direct downloads in the articles.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-13 | Done | Added `check:non-html-policy`, committed `migration/reports/phase-5-non-html-policy.csv`, confirmed `src/static/` parity in the production build, and recorded the owner-approved policy: exact migrated media assets redirect at the edge to `/media/...`, legacy feed compatibility routes redirect to `/index.xml`, the Learn Commerce Cloud and Variation Groups PDFs are preserved as direct static downloads at their legacy paths, and the remaining retired standalone PDF redirects to its owning article page. |

---

### Notes

- GitHub Pages static hosting has no mechanism to emit per-path `X-Robots-Tag` response headers. Any non-HTML resource that requires `noindex` at the HTTP header level (e.g., PDFs that must not be indexed) cannot be handled by a Pages-only deployment. The options are: retire the resource, serve it from a CDN/edge layer that supports response headers, or accept that the resource will remain crawlable.
- Most WordPress sites have relatively few PDFs with active organic traffic. Assess the scale of the problem first — if only 1–2 PDFs are at risk, retirement with a redirect is usually the simplest resolution.
- Reference: `analysis/plan/details/phase-5.md` §Workstream K: Non-HTML Resource SEO Controls, §Critical Corrections §4
