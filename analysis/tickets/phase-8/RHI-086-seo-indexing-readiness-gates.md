## RHI-086 · Workstream C — SEO and Indexing Readiness Gates

**Status:** Done  
**Priority:** Critical  
**Estimate:** M  
**Phase:** 8  
**Assigned to:** SEO Owner  
**Target date:** 2026-06-06  
**Created:** 2026-03-08  
**Updated:** 2026-03-20

---

### Goal

Verify that every indexable page has correct, self-consistent SEO signals — canonical tags, sitemap inclusion, robots directives, title, meta description — so crawlers and search engines receive unambiguous guidance at launch. SEO indexing regressions (canonical drift, accidental noindex, soft-404 patterns) are among the hardest migration failures to recover from because search engines take weeks to re-evaluate signals after corrections. This gate catches these regressions before the launch window.

---

### Acceptance Criteria

- [x] Canonical tag consistency:
  - [x] Every indexable page in the sample matrix has exactly one `<link rel="canonical">` in the HTML head
  - [x] Each canonical tag uses an absolute HTTPS URL with the `www.rhino-inquisitor.com` host
  - [x] Each canonical tag URL matches the page's own URL (self-canonical) — no page canonicalizes to a redirected or non-canonical host URL
  - [x] Canonical and sitemap `<loc>` entries agree for every URL in `validation/sample-matrix.json`
  - [x] No canonical tag points to a `github.io` or staging URL
- [x] Sitemap integrity:
  - [x] Canonical sitemap endpoint is reachable at `https://www.rhino-inquisitor.com/sitemap.xml` or `https://www.rhino-inquisitor.com/sitemap_index.xml` (depending on configuration)
  - [x] All `<loc>` elements in the sitemap use absolute HTTPS `www.rhino-inquisitor.com` URLs
  - [x] Sitemap does not include Hugo alias/redirect helper pages
  - [x] Sitemap passes protocol constraints: UTF-8 encoding, fully qualified URLs, under 50 MB uncompressed or 50,000 URLs per file
  - [x] Sitemap `<lastmod>` values use ISO 8601 format
- [x] Robots.txt:
  - [x] `robots.txt` is served at the root (HTTP 200) or returns a proper 404 if intentionally absent
  - [x] No `Disallow` rules accidentally block crawling of indexable production content
  - [x] `Sitemap:` directive in `robots.txt` points to the production HTTPS canonical sitemap URL
  - [x] If staging/preview environments exist, they use `<meta name="robots" content="noindex">` — not relying solely on `robots.txt Disallow`
- [x] Noindex / indexability controls:
  - [x] No accidental `noindex` on pages intended to be indexed (every page in sample matrix verified)
  - [x] No restrictive robots directives (`noindex` or `nofollow`) on pages intended to be crawled and indexed
  - [x] Pages that should be de-indexed (draft, staging, utility pages) have both `noindex` and remain crawlable so the directive is seen
- [x] Metadata completeness:
  - [x] Every page in the sample matrix has a unique `<title>` tag (≤ 60 chars recommended)
  - [x] Every page in the sample matrix has a `<meta name="description">` (120–155 chars recommended)
  - [x] No two pages in the full build share identical title tags (duplicate title check)
- [x] Search Console verification continuity:
  - [x] Existing Search Console properties for `www.rhino-inquisitor.com` and apex `rhino-inquisitor.com` are still verified
  - [x] Any new host or protocol variant that will receive traffic post-cutover is added as a Search Console property
- [x] Gate outputs are machine-readable, archived as CI artifacts, and committed:
  - [x] `validation/seo-consistency-report.json` — per-URL: canonical URL, sitemap URL, match status, noindex flag, title, description, pass/fail
  - [x] `validation/robots-sitemap-report.json` — sitemap entry count, disallowed paths, `Sitemap:` directive value, noindex pages list

---

### Tasks

- [x] Create or update `scripts/phase-8/check-seo-consistency.js`:
  - [x] Parse each HTML file in `public/` corresponding to the sample matrix and priority routes
  - [x] Extract `<link rel="canonical">`, `<title>`, `<meta name="description">`, and `<meta name="robots">`
  - [x] Validate canonical: absolute HTTPS www URL, self-referencing, no github.io URLs
  - [x] Cross-reference canonical URL against sitemap `<loc>` entries for same page
  - [x] Flag any missing, duplicate, or mismatched canonical
  - [x] Flag any accidental `noindex` on indexable pages
  - [x] Flag missing title or description and warn on out-of-range metadata lengths
  - [x] Output `validation/seo-consistency-report.json`
  - [x] Exit with non-zero code on blocking failures (canonical mismatch on priority URLs, missing title/description on any sampled page)
- [x] Create or update `scripts/phase-8/check-robots-sitemap.js`:
  - [x] Parse generated sitemap output (`public/sitemap.xml` or `public/sitemap_index.xml`):
    - [x] Count total `<loc>` entries
    - [x] Verify all `<loc>` values are absolute HTTPS `www.rhino-inquisitor.com` URLs
    - [x] Check file size and URL count against Google sitemap protocol constraints
    - [x] Check UTF-8 encoding and `<lastmod>` ISO 8601 format
    - [x] Verify no alias/redirect pages appear in the sitemap
  - [x] Parse `public/robots.txt` if present:
    - [x] Check for `Disallow` rules that block production content paths
    - [x] Verify `Sitemap:` directive points to HTTPS canonical URL
  - [x] Output `validation/robots-sitemap-report.json`
  - [x] Exit with non-zero code on blocking failures
- [x] Check for duplicate `<title>` tags across the full build output:
  - [x] Use `fast-glob` to enumerate all HTML files in `public/`
  - [x] Extract and count title occurrences
  - [x] Flag duplicates as blocking defects (unless intentionally shared, e.g., pagination — document any exception)
- [x] Verify Search Console property verification:
  - [x] Confirm the `www.rhino-inquisitor.com` property exists and is verified in Search Console
  - [x] Confirm the apex `rhino-inquisitor.com` property is present (or document why it is not needed)
  - [x] Record verification status in Progress Log
- [x] Run both SEO gates against the accepted closeout build; archive all reports as CI artifacts with 30-day retention
- [x] Update `.github/workflows/deploy-pages.yml` to include both SEO gates as blocking pre-deploy steps
- [x] Add `package.json` scripts:
  - [x] `"check:seo-consistency": "node scripts/phase-8/check-seo-consistency.js"`
  - [x] `"check:robots-sitemap": "node scripts/phase-8/check-robots-sitemap.js"`

---

### Out of Scope

- Fixing template-level SEO issues (changes require RC re-cut per RHI-084 protocol)
- Structured data validation (covered by RHI-087)
- Search Console submission of the sitemap (covered by Phase 9 scope, though preparation is confirmed here)
- Making changes to `robots.txt` content (a content change; confirm with Phase 5 SEO owner before any edit)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-083 Done — Phase 8 Bootstrap complete | Ticket | Done |
| RHI-084 Done — RC frozen, sample matrix and priority routes committed | Ticket | Done |
| Phase 7 SEO safety checks already passing (`npm run check:seo-safe-deploy`) | Phase | Done |
| `fast-xml-parser` available in `package.json` | Tool | Done |
| `fast-glob` and `gray-matter` available in `package.json` | Tool | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Canonical tag points to `github.io` staging domain on one or more pages | Medium | High | This is a critical failure; any `github.io` canonical is a blocking defect; check the Hugo base URL configuration in `hugo.toml` | Engineering Owner |
| Sitemap includes Hugo alias redirect pages, polluting indexing signals | Medium | High | Cross-check sitemap entries against known alias paths; alias files should not be in the sitemap — confirm Hugo default behavior holds | SEO Owner |
| `noindex` accidentally appears on one or more category or post templates | Low | High | Automated check catches this; verify the source of any `noindex` found (front matter, template partial, or CDN rule) | SEO Owner |
| Duplicate title tags across pagination or archive pages | Medium | Medium | Investigate and accept with documentation or fix; pagination pages with identical titles are acceptable if the URL is unique and canonical is self-referencing | SEO Owner |
| Search Console verification is no longer valid after domain change | Low | High | Verify in Search Console before launch; re-add verification tag to `<head>` or DNS TXT record if needed | SEO Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-086 is complete. The repo now enforces Phase 8 SEO and indexing readiness through committed WS-C reports, blocking gate execution in the deployment flow, and archived CI artifacts. The final closeout used the passing 2026-03-20 branch-state production rebuild plus owner-confirmed Search Console verification continuity. By owner decision, that evidence is sufficient for ticket closure and no `phase-8-rc-v2` recut is required for this ticket.

**Delivered artefacts:**

- `scripts/phase-8/check-seo-consistency.js` — canonical, noindex, title/description gate
- `scripts/phase-8/check-robots-sitemap.js` — sitemap and robots.txt integrity gate
- `validation/seo-consistency-report.json` — per-URL SEO signal results from the accepted closeout build
- `validation/robots-sitemap-report.json` — sitemap and robots.txt analysis from the accepted closeout build
- Updated `package.json` with SEO gate scripts
- Updated `.github/workflows/deploy-pages.yml` with SEO gates wired as blocking steps
- `analysis/documentation/phase-8/rhi-086-seo-indexing-gates-2026-03-20.md` — implementation and closeout note for WS-C

**Deviations from plan:**

- The `/video/` title correction occurred after the original `phase-8-rc-v1` freeze. Instead of cutting a new RC tag and regenerating datasets, the owner accepted the passing 2026-03-20 branch-state rerun plus manual Search Console confirmation as the final closeout evidence for RHI-086.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | Open | Ticket created |
| 2026-03-20 | In Progress | Added Phase 8 SEO consistency and robots/sitemap gates, generated passing local JSON reports, and wired 30-day CI artifact uploads. |
| 2026-03-20 | In Progress | Completed a refreshed local branch-state rerun after the `/video/` title correction; both WS-C reports pass and now record explicit artifact provenance. |
| 2026-03-20 | In Progress | Owner confirmed Google Search Console verification continuity is complete and OK for `www.rhino-inquisitor.com` and apex `rhino-inquisitor.com`. Remaining closeout boundary is whether to accept the current branch-state rerun as sufficient evidence or cut a fresh RC tag and regenerate datasets. |
| 2026-03-20 | Done | Owner accepted the current branch-state production rerun plus Search Console confirmation as sufficient closeout evidence. No `phase-8-rc-v2` recut is required for this ticket. |

---

### Notes

- Canonical drift is the silent killer of WordPress-to-Hugo migrations. One template partial with a misconfigured base URL or a missing `.Permalink` can affect every page of that type simultaneously. The duplicate title and canonical checks must cover the full build output — not just the sample matrix.
- The sitemap exclusion of alias/redirect pages is a Hugo default but must be explicitly verified. Hugo does not add alias pages to the sitemap by default, but theme or custom template overrides can change this behavior.
- Search Console submission of the new sitemap is Phase 9 scope. However, Phase 8 must confirm that verification continuity holds so Phase 9 is not blocked on re-verification delays.
- Owner confirmed on 2026-03-20 that Google Search Console verification continuity is complete and acceptable for this ticket.
- Owner clarification resolved during implementation: duplicate titles remain blocking except for self-canonical pagination, and metadata length guidance is warning-only while metadata presence remains blocking.
- Official Google Search Central guidance confirms Search Console property verification continuity, sitemap fetch status, and indexing state require live Search Console property access or live URL inspection; they cannot be proven from the local build artifact alone.
- The new WS-C reports distinguish frozen-dataset lineage from current artifact provenance. Reports marked `artifactProvenance.provenanceStatus = branch-state` are valid closeout-preparation evidence but not a substitute for a newly frozen RC.
- Owner decision on 2026-03-20 closed this ticket using the branch-state rerun and manual Search Console confirmation instead of requiring a new RC tag.
- Reference: `analysis/plan/details/phase-8.md` §Workstream C: SEO and Indexing Readiness Gates; `.github/instructions/seo-compliance.instructions.md`
