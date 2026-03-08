## RHI-053 · Workstream F — Internal Linking and Information Architecture Signals

**Status:** Open  
**Priority:** High  
**Estimate:** M  
**Phase:** 5  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-18  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Ensure that every indexable page is reachable through internal links, that no page is an orphan, and that all internal links point to canonical final URLs — not to redirect sources, deprecated WordPress paths, or broken targets. Breadcrumb and related-content modules must reinforce taxonomy relevance.

Internal linking is how search engines discover content depth and assess topical authority. Orphan pages, broken internal links, and links pointing at redirect sources all degrade crawl efficiency and topical signal quality. This workstream makes internal link correctness a verifiable release gate before any page is indexed.

---

### Acceptance Criteria

- [ ] Internal link validation script `scripts/seo/check-internal-links.js` exists and:
  - [ ] Crawls all pages in `public/` and extracts all `<a href>` links
  - [ ] Resolves relative links to absolute paths
  - [ ] Validates that all internal links target existing pages in `public/` (no 404 targets)
  - [ ] Detects links pointing to `merge`/`retire` disposition source URLs instead of their final canonical targets
  - [ ] Detects links containing legacy WordPress domain (`wordpress.com`, old host) or `wp-content` paths
  - [ ] Builds a reverse-link map: records which pages link to each indexable page
  - [ ] Identifies orphan pages: indexable pages (`draft: false`, `keep`/`merge` disposition) with zero inbound internal links
  - [ ] Reports click-depth from homepage for all indexable pages (warn if >3 clicks)
  - [ ] Produces `migration/reports/phase-5-internal-links-audit.csv` with per-page and per-link results
  - [ ] Exits with non-zero code on any broken internal link to a critical template page
  - [ ] Is referenced in `package.json` as `npm run check:internal-links`
- [ ] Zero broken internal links on the following critical template pages:
  - [ ] Homepage
  - [ ] All category archive pages
  - [ ] All pages in the top-10 organic traffic set (Phase 1 SEO baseline)
  - [ ] Privacy policy page
- [ ] Zero indexable orphan pages in the representative content set
- [ ] Navigation and breadcrumb modules link to canonical URLs (not redirect sources):
  - [ ] Main navigation links checked against `url-manifest.json` canonical targets
  - [ ] Breadcrumb links (if present) resolve to existing pages
- [ ] `migration/reports/phase-5-internal-links-audit.csv` reviewed and zero critical defects

---

### Tasks

- [ ] Identify current navigation structure from the live WordPress site:
  - [ ] Record main navigation links from `https://www.rhino-inquisitor.com/`
  - [ ] Note any related-post or category cross-link patterns in post templates
- [ ] Create `scripts/seo/check-internal-links.js`:
  - [ ] Use `fast-glob` to enumerate all HTML files in `public/`
  - [ ] Use `cheerio` to extract `<a href>` values from each page
  - [ ] Resolve relative links to absolute paths based on page URL
  - [ ] Build a page-existence set from `public/` structure
  - [ ] Implement broken link detection (link target not in existence set)
  - [ ] Implement deprecated URL detection (link target matches `merge`/`retire` source in manifest)
  - [ ] Implement WordPress legacy domain detection
  - [ ] Build inbound-link map and identify orphans
  - [ ] Implement click-depth BFS from homepage
  - [ ] Write per-page results to `migration/reports/phase-5-internal-links-audit.csv`
- [ ] Audit navigation partial templates (from Phase 3 RHI-023):
  - [ ] Confirm main navigation links use Hugo canonical URL output, not hardcoded paths
  - [ ] Confirm breadcrumb partial (if exists) generates correct links from page hierarchy
- [ ] Run `check:internal-links` against the scaffold build and review all findings
- [ ] Fix any broken internal links in templates (hardcoded deprecated paths)
- [ ] Document orphan page exceptions (if any) with rationale in Progress Log
- [ ] Add `"check:internal-links": "node scripts/seo/check-internal-links.js"` to `package.json`
- [ ] Integrate `check:internal-links` as a blocking step for critical pages in the deploy CI workflow

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
| RHI-047 Done — Phase 5 Bootstrap complete | Ticket | Pending |
| RHI-023 Done — Phase 3 template scaffolding (navigation and breadcrumb partials) | Ticket | Pending |
| RHI-038 Done — Phase 4 internal link rewrites (links in Markdown body corrected) | Ticket | Pending |
| RHI-048 Done — Canonical policy established (internal links must target canonical URLs) | Ticket | Pending |
| `fast-glob` and `cheerio` available in `package.json` | Tool | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Phase 4 content not yet migrated when this workstream runs, causing false orphan/broken-link failures | High | Medium | Run `check:internal-links` against scaffold first (templates only); re-run against the full content set after RHI-043 (Pilot Batch) is merged | Engineering Owner |
| Navigation partial contains hardcoded WordPress URLs that were not updated in Phase 3 | Medium | High | Check navigation template code manually at task start; any hardcoded absolute WordPress URL is an immediate fix | Engineering Owner |
| High-volume category pages generate hundreds of internal links, making report noisy | Medium | Low | Scope blocking threshold to critical pages only; treat taxonomy pages as warnings initially | SEO Owner |

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

- `scripts/seo/check-internal-links.js`
- `migration/reports/phase-5-internal-links-audit.csv`
- `package.json` updated with `check:internal-links` script
- CI workflow updated with `check:internal-links` blocking gate

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- This workstream is most valuable when run against the full migrated content set (after Pilot Batch RHI-043). Running it on the scaffold alone is a useful template check, but orphan detection requires pages to be present.
- The 3-click depth warning is a practical threshold, not a hard rule. Pages deeper than 3 clicks from the homepage may still be findable via category/archive traversal. Document cases where depth exceeds 3 but a discovery path exists.
- Reference: `analysis/plan/details/phase-5.md` §Workstream F: Internal Linking and Information Architecture Signals
