## RHI-058 · Workstream K — Non-HTML Resource SEO Controls

**Status:** Open  
**Priority:** Medium  
**Estimate:** S  
**Phase:** 5  
**Assigned to:** SEO Owner  
**Target date:** 2026-04-25  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Classify all non-HTML legacy resources (PDFs, media files, downloadable attachments) from the WordPress migration and define the correct disposition and index-control behavior for each class. GitHub Pages is a static host with no per-path HTTP header control — this means `X-Robots-Tag` is not emittable per path, and any non-HTML de-indexing or redirect needs must be handled at the edge, the DNS layer, or by preserving/retiring the resource.

This workstream prevents migration blind spots for non-HTML content that could remain indexed or become orphaned 404s after cutover.

---

### Acceptance Criteria

- [ ] Non-HTML resource inventory is complete:
  - [ ] All legacy non-HTML URLs identified in Phase 1 URL inventory are classified (`keep`, `redirect`, `retire`)
  - [ ] Classification is recorded in `migration/reports/phase-5-non-html-policy.csv` with the following fields:
    - [ ] `legacy_url` — original WordPress path
    - [ ] `resource_type` — `pdf`, `media`, `attachment`, `feed`, `other`
    - [ ] `disposition` — `keep`, `redirect`, `retire`
    - [ ] `target_url` — final destination (if `redirect`) or `null`
    - [ ] `index_control_needed` — `yes` or `no`
    - [ ] `implementation_layer` — `pages-static`, `edge-cdn`, `dns`, `none`
    - [ ] `header_control_possible` — `yes` or `no` (is `X-Robots-Tag` emittable on this resource on the chosen hosting path?)
    - [ ] `owner` — who is responsible for implementing this record's outcome
- [ ] For every non-HTML resource requiring index control:
  - [ ] If `X-Robots-Tag` is required but the hosting path cannot emit it: document the gap and proposed resolution (edge layer, retire the resource, or preserve on infrastructure that supports headers)
  - [ ] No non-HTML de-indexing need is left unresolved as of sign-off
- [ ] Static assets committed to `static/` in the Hugo repo are confirmed:
  - [ ] Served correctly under their expected paths in the `public/` build
  - [ ] No legacy WordPress `wp-content/uploads` dependency remains for in-scope assets
- [ ] `migration/reports/phase-5-non-html-policy.csv` is reviewed and signed off by SEO owner
- [ ] Any non-HTML resource requiring an edge redirect or header-level control is escalated to Phase 6 with a documented handover entry

---

### Tasks

- [ ] Pull all non-HTML URLs from Phase 1 URL inventory (`migration/url-inventory.normalized.json`):
  - [ ] Filter for `url_class: attachment` records
  - [ ] Identify PDF, media, and downloadable file paths
  - [ ] Identify feed URLs (`/feed/`, category feeds) already handled in WS-D (RHI-051)
- [ ] Classify each non-HTML resource:
  - [ ] Determine if the resource is still needed (`keep`) or can be retired
  - [ ] If `keep`: confirm the file exists in `static/` and is served correctly
  - [ ] If `redirect`: record target URL and confirm mechanism (`pages-static` alias or `edge-cdn`)
  - [ ] If `retire`: confirm no organic traffic or backlinks exist (per Phase 1 baseline); confirm 404 behavior
- [ ] Assess `X-Robots-Tag` feasibility for each non-HTML resource needing index control:
  - [ ] Confirm GitHub Pages cannot emit per-path `X-Robots-Tag` headers for static files
  - [ ] For each resource needing `noindex` header: document whether it can be retired, moved to edge, or preserved as-is
- [ ] Build `migration/reports/phase-5-non-html-policy.csv`
- [ ] Escalate any records requiring edge-layer or header-level controls to Phase 6 owner with documented handover
- [ ] Confirm all in-scope `static/` assets are present in `public/` after a local build
- [ ] Record sign-off confirmation in Progress Log

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
| RHI-047 Done — Phase 5 Bootstrap complete | Ticket | Pending |
| RHI-002 Done — Phase 1 URL discovery (non-HTML URL classes identified) | Ticket | Pending |
| RHI-037 Done — Phase 4 media migration (which static files are committed to repo) | Ticket | Pending |
| `migration/url-inventory.normalized.json` with attachment/PDF URL classification | Phase | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| GitHub Pages cannot emit `X-Robots-Tag` for PDFs/attachments needing de-indexing | High | Medium | Classify resources that need de-indexing at the start; if edge layer is unavailable, retire the resource or serve via a dedicated path on infrastructure that supports headers | SEO Owner |
| Non-HTML attachment URLs with backlinks are retired without a redirect, losing link equity | Low | High | Cross-reference attachment URLs against Phase 1 backlink data before assigning `retire` — any URL with external backlinks requires a redirect or explicit SEO owner approval to retire | SEO Owner |
| Phase 1 URL inventory incomplete for attachment class (some PDF paths not captured in sitemaps) | Medium | Medium | Review WordPress media library or search for `wp-content/uploads` paths in extracted content during Phase 4 | Engineering Owner |

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

- `migration/reports/phase-5-non-html-policy.csv`
- Escalation entries for edge-layer or header-control needs (handed to Phase 6)
- SEO owner sign-off recorded in Progress Log

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- GitHub Pages static hosting has no mechanism to emit per-path `X-Robots-Tag` response headers. Any non-HTML resource that requires `noindex` at the HTTP header level (e.g., PDFs that must not be indexed) cannot be handled by a Pages-only deployment. The options are: retire the resource, serve it from a CDN/edge layer that supports response headers, or accept that the resource will remain crawlable.
- Most WordPress sites have relatively few PDFs with active organic traffic. Assess the scale of the problem first — if only 1–2 PDFs are at risk, retirement with a redirect is usually the simplest resolution.
- Reference: `analysis/plan/details/phase-5.md` §Workstream K: Non-HTML Resource SEO Controls, §Critical Corrections §4
