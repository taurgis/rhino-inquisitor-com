## RHI-038 · Workstream G — Internal Link and Navigation Rewrites

**Status:** Open  
**Priority:** High  
**Estimate:** M  
**Phase:** 4  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-18  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Rewrite all internal links within migrated content from legacy WordPress URL variants (apex, `www`, `http`, old slugs) to canonical Hugo-relative paths. Remove links to retired pages unless a redirect exists. Prevent crawl traps on archive, category, and video hub pages by ensuring every internal navigation link resolves to a live page or a correct redirect.

Broken and non-canonical internal links dilute PageRank distribution, confuse crawlers, and degrade user experience. They are also invisible to external validators until the full build is running — this workstream catches them before they reach production.

---

### Acceptance Criteria

- [ ] Internal link rewrite script `scripts/migration/rewrite-links.js` exists and:
  - [ ] Reads all generated `.md` files from `migration/output/content/`
  - [ ] Identifies and rewrites internal links matching the following legacy URL patterns:
    - [ ] `https://www.rhino-inquisitor.com/...` → `/{path}/`
    - [ ] `http://www.rhino-inquisitor.com/...` → `/{path}/`
    - [ ] `https://rhino-inquisitor.com/...` (apex, no www) → `/{path}/`
    - [ ] Any old WordPress domain variants (if applicable)
  - [ ] Normalizes rewritten paths to canonical form: lowercase, trailing slash, `a-z 0-9 - /`
  - [ ] For links to `retire`-disposition URLs:
    - [ ] If a redirect target exists in manifest: rewrite to the redirect target
    - [ ] If no redirect target: remove the link and log the orphaned anchor text for manual review
  - [ ] Preserves query parameters only if documented as required (none by default)
  - [ ] Does not rewrite external links or anchor-only links (`#section`)
  - [ ] Logs all rewrites to `migration/reports/link-rewrite-log.csv` with `source_file`, `original_url`, `rewritten_url`, `action`
  - [ ] Is idempotent and does not double-rewrite already-canonical links
  - [ ] Is referenced in `package.json` as `npm run migrate:rewrite-links`
- [ ] Navigation and hub page review:
  - [ ] Archive pages link to correct paginated paths or are correctly marked as non-paginated
  - [ ] Category pages link to correct canonical category paths (matching `url` front matter)
  - [ ] Video hub pages link to correct video post paths
- [ ] Broken link check after rewrite passes with zero critical broken internal links:
  - [ ] `npm run check:links` exits with code 0 on the output of a Hugo build containing batch content

---

### Tasks

- [ ] Audit internal links in a sample of 20 converted records:
  - [ ] Identify all legacy URL patterns in use
  - [ ] Identify links to pages with `retire` disposition and check if redirects exist
  - [ ] Document patterns in Progress Log before writing the rewrite script
- [ ] Create `scripts/migration/rewrite-links.js`:
  - [ ] Implement URL pattern matcher for legacy host variants
  - [ ] Load `migration/url-manifest.json` for disposition and target lookup
  - [ ] Implement rewrite logic with canonicalization
  - [ ] Implement retire-link handling (rewrite to target or orphan log)
  - [ ] Write rewrite log
- [ ] Run rewrite script on full `migration/output/content/` and review log:
  - [ ] Verify no double-rewrites on already-canonical links
  - [ ] Review all orphaned anchors; assign manual review owners
- [ ] Run `npm run check:links` on a Hugo build with batch content; fix all critical failures
- [ ] Add `"migrate:rewrite-links": "node scripts/migration/rewrite-links.js"` to `package.json`
- [ ] Spot-check navigation pages (archive, 3 category pages, video hub) for correct link targets
- [ ] Commit link rewrite script, updated `package.json`, and rewrite log

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
| RHI-031 Done — Phase 4 Bootstrap complete | Ticket | Pending |
| RHI-034 Done — Converted Markdown records available in `migration/output/content/` | Ticket | Pending |
| RHI-035 Done — Front matter and `url` fields populated | Ticket | Pending |
| RHI-036 Done — URL parity and redirect targets confirmed in manifest | Ticket | Pending |
| `migration/url-manifest.json` with full disposition and `targetUrl` coverage | Ticket | Pending |
| `npm run check:links` from RHI-029 is callable | Ticket | Pending |

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- `scripts/migration/rewrite-links.js`
- `migration/reports/link-rewrite-log.csv`
- `package.json` updated with `migrate:rewrite-links` script

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Link rewrites must be scoped to text nodes only. Rewriting inside code blocks produces broken code examples, which is a worse outcome than a broken link in body text.
- Orphaned anchor text (links to retired pages with no redirect) requires a human decision: either add a manifest redirect target or remove the link and note the loss in the migration report. Do not silently delete links without logging them.
- Do not create new redirect targets in the manifest during this workstream. If a retire URL needs a redirect to fix a link, that is a disposition change requiring the migration data governance gate (`.github/instructions/migration-data.instructions.md`).
- Reference: `analysis/plan/details/phase-4.md` §Workstream G: Internal Link and Navigation Rewrites
