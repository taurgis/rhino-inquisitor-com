## RHI-038 · Workstream G — Internal Link and Navigation Rewrites

**Status:** Done  
**Priority:** High  
**Estimate:** M  
**Phase:** 4  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-18  
**Created:** 2026-03-07  
**Updated:** 2026-03-10

---

### Goal

Rewrite all internal links within migrated content from legacy WordPress URL variants (apex, `www`, `http`, old slugs) to canonical Hugo-relative paths. Remove links to retired pages unless a redirect exists. Prevent crawl traps on archive, category, and video hub pages by ensuring every internal navigation link resolves to a live page or a correct redirect.

Broken and non-canonical internal links dilute PageRank distribution, confuse crawlers, and degrade user experience. They are also invisible to external validators until the full build is running — this workstream catches them before they reach production.

---

### Acceptance Criteria

- [x] Internal link rewrite script `scripts/migration/rewrite-links.js` exists and:
  - [x] Reads all generated `.md` files from `migration/output/content/`
  - [x] Identifies and rewrites internal links matching the following legacy URL patterns:
    - [x] `https://www.rhino-inquisitor.com/...` → `/{path}/`
    - [x] `http://www.rhino-inquisitor.com/...` → `/{path}/`
    - [x] `https://rhino-inquisitor.com/...` (apex, no www) → `/{path}/`
    - [x] Any old WordPress domain variants (if applicable)
  - [x] Normalizes rewritten paths to canonical form: lowercase, trailing slash, `a-z 0-9 - /`
  - [x] For links to `retire`-disposition URLs:
    - [x] If a redirect target exists in manifest: rewrite to the redirect target
    - [x] If no redirect target: remove the link and log the orphaned anchor text for manual review
  - [x] Preserves query parameters only if documented as required (none by default)
  - [x] Does not rewrite external links or anchor-only links (`#section`)
  - [x] Logs all rewrites to `migration/reports/link-rewrite-log.csv` with `source_file`, `original_url`, `rewritten_url`, `action`
  - [x] Is idempotent and does not double-rewrite already-canonical links
  - [x] Is referenced in `package.json` as `npm run migrate:rewrite-links`
- [x] Navigation and hub page review:
  - [x] Archive pages link to correct paginated paths or are correctly marked as non-paginated
  - [x] Category pages link to correct canonical category paths (matching `url` front matter)
  - [x] Video hub pages link to correct video post paths
- [x] Broken link check after rewrite passes with zero critical broken internal links:
  - [x] `npm run check:links` exits with code 0 on the output of a Hugo build containing batch content

---

### Tasks

- [x] Audit internal links in a sample of 20 converted records:
  - [x] Identify all legacy URL patterns in use
  - [x] Identify links to pages with `retire` disposition and check if redirects exist
  - [x] Document patterns in Progress Log before writing the rewrite script
- [x] Create `scripts/migration/rewrite-links.js`:
  - [x] Implement URL pattern matcher for legacy host variants
  - [x] Load `migration/url-manifest.json` for disposition and target lookup
  - [x] Implement rewrite logic with canonicalization
  - [x] Implement retire-link handling (rewrite to target or orphan log)
  - [x] Write rewrite log
- [x] Run rewrite script on full `migration/output/content/` and review log:
  - [x] Verify no double-rewrites on already-canonical links
  - [x] Review all orphaned anchors; assign manual review owners
- [x] Run `npm run check:links` on a Hugo build with batch content; fix all critical failures
- [x] Add `"migrate:rewrite-links": "node scripts/migration/rewrite-links.js"` to `package.json`
- [x] Spot-check navigation pages (archive, 3 category pages, video hub) for correct link targets
- [x] Commit link rewrite script, updated `package.json`, and rewrite log

---

### Out of Scope

- Rewriting external links (link to third-party domains remain as-is)
- Updating navigation menus in Hugo templates (covered by Phase 3 template work in RHI-023)
- Link validation on the live WordPress site before cutover (Phase 8 scope)
- Implementing server-side redirects for removed links (Phase 6 scope)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-031 Done — Phase 4 Bootstrap complete | Ticket | Resolved |
| RHI-034 Done — Converted Markdown records available in `migration/output/content/` | Ticket | Resolved |
| RHI-035 Done — Front matter and `url` fields populated | Ticket | Resolved |
| RHI-036 Done — URL parity and redirect targets confirmed in manifest | Ticket | Resolved |
| `migration/url-manifest.json` with full disposition and `targetUrl` coverage | Ticket | Verified |
| `npm run check:links` from RHI-029 is callable | Ticket | Verified |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Large volume of links to retired pages without redirect targets (orphaned anchors) | Medium | Medium | Audit retire-disposition URLs in manifest before rewrite run; decide whether to add redirects or remove links before starting | Migration Owner |
| Rewrite script matches and rewrites links in code blocks or pre-formatted content | Low | High | Scope link rewriting to text nodes only; exclude content inside `<code>`, `<pre>`, and fenced code blocks | Engineering Owner |
| Internal links to anchor fragments on renamed pages fail after rewrite | Low | Medium | Log all `#fragment` rewrites separately; verify anchor IDs still exist in destination content | Engineering Owner |
| Category/archive URL patterns differ from post URL patterns causing missed rewrites | Medium | Medium | Test pattern matching against all URL types from Phase 1 manifest before full run | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-038 is implemented and validated. The new rewrite pass canonicalizes staged internal links, normalizes nested category targets to Hugo's `/category/{slug}/` route contract, rewrites mapped same-host WordPress media wrappers to local `/media/...` assets, removes six orphan page links with no redirect target, and links three matching video hub playlist headings to their staged page routes.

**Delivered artefacts:**

- `scripts/migration/rewrite-links.js`
- `migration/reports/link-rewrite-log.csv`
- `package.json` updated with `migrate:rewrite-links` script
- `analysis/documentation/phase-4/rhi-038-internal-link-rewrite-implementation-2026-03-10.md`
- `docs/migration/RUNBOOK.md` updated with the RHI-038 operator workflow

**Deviations from plan:**

- No migration manifest rows were changed. Instead, the rewrite step normalizes nested category targets to the existing Hugo taxonomy contract and applies one staged-route override for the legacy eCDN article slug because the generated content ships only the newer canonical page URL.
- Residual `npm run migrate:rewrite-media` warnings for 68 unmapped non-manifest media references remain tracked under RHI-037 scope and did not block the internal page-link gate for this ticket.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-10 | In Progress | Audited 20 representative converted records. Confirmed corpus is primarily Markdown links, protected code blocks are required, retire rows in the current manifest have no redirect targets, and the staged build initially failed on nested category targets plus one stale eCDN article slug. |
| 2026-03-10 | Done | Implemented `npm run migrate:rewrite-links`, generated a 332-row rewrite log with 6 orphan removals, linked three matching video hub headings to staged page routes, proved idempotency with a zero-change rerun, and passed `CHECK_LINKS_PUBLIC_DIR=tmp/rhi038-public npm run check:links` across 210 staged HTML files. |

---

### Notes

- Link rewrites must be scoped to text nodes only. Rewriting inside code blocks produces broken code examples, which is a worse outcome than a broken link in body text.
- Orphaned anchor text (links to retired pages with no redirect) requires a human decision: either add a manifest redirect target or remove the link and note the loss in the migration report. Do not silently delete links without logging them.
- Do not create new redirect targets in the manifest during this workstream. If a retire URL needs a redirect to fix a link, that is a disposition change requiring the migration data governance gate (`.github/instructions/migration-data.instructions.md`).
- Reference: `analysis/plan/details/phase-4.md` §Workstream G: Internal Link and Navigation Rewrites
