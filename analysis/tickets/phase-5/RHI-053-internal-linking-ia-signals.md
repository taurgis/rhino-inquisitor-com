## RHI-053 · Workstream F — Internal Linking and Information Architecture Signals

**Status:** Done  
**Priority:** High  
**Estimate:** M  
**Phase:** 5  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-18  
**Created:** 2026-03-07  
**Updated:** 2026-03-13

---

### Goal

Ensure that every indexable page is reachable through internal links, that no page is an orphan, and that all internal links point to canonical final URLs — not to redirect sources, deprecated WordPress paths, or broken targets. Breadcrumb and related-content modules must reinforce taxonomy relevance.

Internal linking is how search engines discover content depth and assess topical authority. Orphan pages, broken internal links, and links pointing at redirect sources all degrade crawl efficiency and topical signal quality. This workstream makes internal link correctness a verifiable release gate before any page is indexed.

---

### Acceptance Criteria

- [x] Internal link validation script `scripts/seo/check-internal-links.js` exists and:
  - [x] Crawls all pages in `public/` and extracts all `<a href>` links
  - [x] Resolves relative links to absolute paths
  - [x] Validates that all internal links target existing pages in `public/` (no 404 targets)
  - [x] Detects links pointing to `merge`/`retire` disposition source URLs instead of their final canonical targets
  - [x] Detects links containing legacy WordPress domain (`wordpress.com`, old host) or `wp-content` paths
  - [x] Builds a reverse-link map: records which pages link to each indexable page
  - [x] Identifies orphan pages: indexable pages (`draft: false`, `keep`/`merge` disposition) with zero inbound internal links
  - [x] Reports click-depth from homepage for all indexable pages (warn if >3 clicks)
  - [x] Produces `migration/reports/phase-5-internal-links-audit.csv` with per-page and per-link results
  - [x] Exits with non-zero code on any broken internal link to a critical template page
  - [x] Is referenced in `package.json` as `npm run check:internal-links`
- [x] Zero broken internal links on the following critical template pages:
  - [x] Homepage
  - [x] All category archive pages
  - [x] All pages in the top-10 organic traffic set (Phase 1 SEO baseline)
  - [x] Privacy policy page
- [x] Zero indexable orphan pages in the representative content set
- [x] Navigation and breadcrumb modules link to canonical URLs (not redirect sources):
  - [x] Main navigation links checked against `url-manifest.json` canonical targets
  - [x] Breadcrumb links (if present) resolve to existing pages
- [x] `migration/reports/phase-5-internal-links-audit.csv` reviewed and zero critical defects

---

### Tasks

- [x] Identify current navigation structure from the current production-equivalent build:
  - [x] Record main navigation links from the built homepage and shared partials
  - [x] Note related-post and category cross-link patterns in post templates
- [x] Create `scripts/seo/check-internal-links.js`:
  - [x] Use `fast-glob` to enumerate all HTML files in `public/`
  - [x] Use `cheerio` to extract `<a href>` values from each page
  - [x] Resolve relative links to absolute paths based on page URL
  - [x] Build a page-existence set from `public/` structure
  - [x] Implement broken link detection (link target not in existence set)
  - [x] Implement deprecated URL detection (link target matches `merge`/`retire` source in manifest)
  - [x] Implement WordPress legacy domain detection
  - [x] Build inbound-link map and identify orphans
  - [x] Implement click-depth BFS from homepage
  - [x] Write per-page results to `migration/reports/phase-5-internal-links-audit.csv`
- [x] Audit navigation partial templates (from Phase 3 RHI-023):
  - [x] Confirm main navigation links use Hugo canonical URL output, not hardcoded paths
  - [x] Confirm breadcrumb partial (if exists) generates correct links from page hierarchy
- [x] Run `check:internal-links` in non-blocking compatibility mode and review findings
- [x] Fix broken internal page links in content and taxonomy templates
- [x] Document orphan page exceptions (if any) with rationale in Progress Log
- [x] Add `"check:internal-links": "node scripts/seo/check-internal-links.js"` to `package.json`
- [x] Integrate `check:internal-links` as a blocking step for critical pages in the deploy CI workflow

---

### Out of Scope

- External link validation (not a blocking SEO gate for launch)
- Automated related-content recommendation engine (future feature)
- Click-depth optimization beyond the 3-click warning threshold (post-launch)
- Content hub or topic cluster strategy (post Phase 9)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-047 Done — Phase 5 Bootstrap complete | Ticket | Resolved |
| RHI-023 Done — Phase 3 template scaffolding (navigation and breadcrumb partials) | Ticket | Resolved |
| RHI-038 Done — Phase 4 internal link rewrites (links in Markdown body corrected) | Ticket | Resolved |
| RHI-048 Done — Canonical policy established (internal links must target canonical URLs) | Ticket | Resolved |
| `fast-glob` and `cheerio` available in `package.json` | Tool | Resolved |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Phase 4 content not yet migrated when this workstream runs, causing false orphan/broken-link failures | High | Medium | Run `check:internal-links` against scaffold first (templates only); re-run against the full content set after RHI-043 (Pilot Batch) is merged | Engineering Owner |
| Navigation partial contains hardcoded WordPress URLs that were not updated in Phase 3 | Medium | High | Check navigation template code manually at task start; any hardcoded absolute WordPress URL is an immediate fix | Engineering Owner |
| High-volume category pages generate hundreds of internal links, making report noisy | Medium | Low | Scope blocking threshold to critical pages only; treat taxonomy pages as warnings initially | SEO Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-053 is complete. The repository now enforces internal-link and IA validation through a dedicated Phase 5 gate that checks built HTML output, records per-page and per-link audit rows, blocks on critical-template and orphan-page defects, and keeps the previous `check:links` command working as a compatibility alias.

The implementation also corrected two deprecated internal article links, replaced one broken placeholder link with the intended external documentation target, and updated the taxonomy hub so preserved empty category routes remain discoverable instead of orphaned.

**Delivered artefacts:**

- `scripts/seo/check-internal-links.js`
- `migration/reports/phase-5-internal-links-audit.csv`
- `package.json` updated with `check:internal-links` script
- CI workflow updated with `check:internal-links` blocking gate

**Deviations from plan:**

- Warning-only legacy non-HTML `wp-content` asset references remain in the audit report (`33` on the validated production build). They are intentionally visible but non-blocking for RHI-053 and should be handled in the non-HTML/media follow-up workstreams.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-13 | Done | Added `check:internal-links`, integrated PR/deploy CI coverage, fixed blocking canonical page-link issues, linked preserved empty category routes from the taxonomy hub, and validated `0` blocking findings on the full production build. |

---

### Notes

- This workstream is most valuable when run against the full migrated content set (after Pilot Batch RHI-043). Running it on the scaffold alone is a useful template check, but orphan detection requires pages to be present.
- The 3-click depth warning is a practical threshold, not a hard rule. Pages deeper than 3 clicks from the homepage may still be findable via category/archive traversal. Document cases where depth exceeds 3 but a discovery path exists.
- Reference: `analysis/plan/details/phase-5.md` §Workstream F: Internal Linking and Information Architecture Signals
