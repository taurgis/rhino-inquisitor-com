## RHI-041 · Workstream J — Security and Data Hygiene

**Status:** Done  
**Priority:** Medium  
**Estimate:** M  
**Phase:** 4  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-18  
**Created:** 2026-03-07  
**Updated:** 2026-03-11

---

### Goal

Prevent the migration from publishing unsafe, sensitive, or private content artifacts by scanning all generated output for script injection fragments, inline event handlers, private draft content, source-system metadata, and HTTPS-hostile references. This includes ensuring that data recovered from the WordPress SQL dump or filesystem snapshot does not leak internal paths, configuration values, or non-publishable metadata into generated content. The security content scan must be a blocking CI gate before any batch is committed to `src/content/`.

Static sites are not inherently safe from XSS if user-generated or third-party content is migrated without sanitization. WordPress content can include embedded JavaScript widgets, inline event handlers from legacy themes, and private metadata that should never reach a public static site.

---

### Acceptance Criteria

- [x] Security content scan script `scripts/migration/check-security-content.js` exists and:
  - [x] Scans corrected staged `.md` files after `npm run migrate:apply-corrections` (or `npm run migrate:finalize-content`) and converted HTML output built from that corrected state for:
    - [x] `<script>` tags in content (not in code blocks/pre elements)
    - [x] Inline event handler attributes: `onload`, `onclick`, `onerror`, and all `on*` patterns
    - [x] Suspicious `<iframe>` elements not in the approved list (YouTube, Vimeo approved; others flagged)
    - [x] `javascript:` URI schemes in links
    - [x] Private WordPress draft content (`status: draft`, `status: private`) that has `draft: false` set (misconfiguration check)
    - [x] WordPress nonce, authentication token, or admin URL patterns in content
    - [x] Internal WordPress admin URLs (e.g., `/wp-admin/`, `/wp-json/wp/v2/` in content body)
    - [x] `http://` image references on pages that will be served over HTTPS
  - [x] Distinguishes `critical` findings (script tags, event handlers, `javascript:` URIs) from `warnings` (http references, suspicious iframes)
  - [x] Produces `migration/reports/security-content-scan.csv` with per-file findings
  - [x] Exits with non-zero code on any `critical` finding
  - [x] Is referenced in `package.json` as `npm run check:security-content`
- [x] All `critical` findings are resolved before any batch is merged to `src/content/`
- [x] No WordPress private drafts or protected posts appear in generated output with `draft: false`
- [x] No source-system-only metadata is present in generated front matter (e.g., `sourceId`, internal WordPress IDs, SQL-only fields, or filesystem paths must not appear in final Hugo content files)
- [x] GitHub Pages hosting constraints are documented:
  - [x] HTTP security header capabilities and limitations on GitHub Pages are recorded
  - [x] Any header policy requiring edge/CDN layer is flagged for Phase 6/7 attention
- [x] `migration/reports/security-content-scan.csv` has zero critical findings in the release candidate batch
- [x] Batch execution guidance makes the scan order explicit: `npm run migrate:map-frontmatter` is followed by `npm run migrate:finalize-content` before `npm run check:security-content` runs

---

### Tasks

- [x] Audit a sample of 20 converted records for security-relevant patterns:
  - [x] Search for `<script>`, `on*=`, `javascript:` patterns
  - [x] Check for WordPress admin/nonce artifacts
  - [x] Check for leaked filesystem paths, SQL-only metadata, or plugin/theme configuration values recovered during extraction
  - [x] Check for `http://` image sources
  - [x] Document findings in Progress Log
- [x] Create `scripts/migration/check-security-content.js`:
  - [x] Implement script tag detector (exclude `<code>` and `<pre>` contexts)
  - [x] Implement inline event handler attribute detector
  - [x] Implement `javascript:` URI detector in links
  - [x] Implement approved iframe allowlist check
  - [x] Implement WordPress internal URL pattern detector
  - [x] Implement mixed-content `http://` image detector
  - [x] Implement draft status vs front matter mismatch detector
  - [x] Write findings to `migration/reports/security-content-scan.csv`
- [x] Verify Hugo `hugo.toml` Goldmark configuration:
  - [x] `unsafe: false` (default) — raw HTML rendering disabled in content
  - [x] Confirm this is set in Phase 3 Hugo config (RHI-021); document any exceptions
- [x] Define approved iframe sources (YouTube, Vimeo) and document in `docs/migration/RUNBOOK.md`
- [x] Ensure `sourceId` and other extraction-layer fields are not written to final `.md` front matter by WS-D
- [x] Review GitHub Pages header capabilities:
  - [x] Document what security headers GitHub Pages provides natively
  - [x] List any headers requiring edge/CDN layer (CSP, HSTS preload, Permissions-Policy)
  - [x] Record recommendations for Phase 6/7 header strategy decision
- [x] Run `check:security-content` on pilot batch and fix all critical findings
- [x] Document the batch execution sequence in `docs/migration/RUNBOOK.md` and downstream batch tickets:
  - [x] `npm run migrate:map-frontmatter`
  - [x] `npm run migrate:finalize-content` (or the explicit `rewrite-media -> rewrite-links -> apply-corrections` sequence)
  - [x] `npm run check:security-content`
- [x] Confirm generated-content cleanup remains script-owned:
  - [x] If the scan reveals a Markdown cleanup issue, fix the pipeline script or curated correction input and rerun the correction flow
  - [x] Do not hand-edit `migration/output/content/**` just to satisfy the security gate
- [x] Add `check:security-content` to `package.json` so it builds the staged migration HTML and runs `scripts/migration/check-security-content.js`
- [x] Commit security scan script and scan report

---

### Out of Scope

- Implementing Content Security Policy headers (requires edge/CDN layer — Phase 6/7)
- HTTPS enforcement configuration (GitHub Pages setting — Phase 7)
- Penetration testing or runtime security assessment
- Scanning WordPress source HTML for vulnerabilities (only scanning migration output)
- Manual cleanup of generated Markdown that is now owned by the scripted correction pipeline

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-031 Done — Phase 4 Bootstrap complete | Ticket | Satisfied |
| RHI-034 Done — Converted Markdown content available for scanning | Ticket | Satisfied |
| RHI-021 Done — Hugo Goldmark `unsafe: false` configuration confirmed | Ticket | Satisfied |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| WordPress content contains embedded JavaScript widgets from legacy analytics or social tools | High | High | These must be stripped during Cheerio pre-processing in WS-C; verify the WS-C sanitization handles `<script>` removal | Engineering Owner |
| Private WordPress posts accidentally published because WS-D `draft` mapping was misconfigured | Low | Critical | The WS-J draft mismatch check is a final safety net; but WS-D must map draft status correctly first | Engineering Owner |
| WordPress admin URLs present in older post content (e.g., "edit this post" links in body) | Medium | Low | These are `warning`-level findings; strip admin links during WS-G link rewrite rather than failing the batch | Engineering Owner |
| SQL dump or filesystem snapshot includes secrets, internal paths, or plugin settings that are accidentally surfaced in final content | Medium | High | Restrict extraction to publishable fields, scan for leaked internal paths/keys, and treat any source-system leakage as a blocker | Engineering Owner |
| GitHub Pages header limitations expose site to clickjacking without X-Frame-Options | Medium | Medium | Document the limitation for Phase 7; do not block migration on a hosting infrastructure gap | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-041 closed after the new staged migration security gate scanned the corrected release-candidate corpus cleanly at `0` critical findings and `0` warnings across both Markdown and rendered article HTML, while the runbook and security-control docs captured the approved iframe allowlist plus the GitHub Pages versus edge/CDN ownership split for stricter response headers.

**Delivered artefacts:**

- `scripts/migration/check-security-content.js`
- `migration/reports/security-content-scan.csv` (zero critical findings for release candidate batch)
- `docs/migration/RUNBOOK.md` security gate execution guidance and iframe allowlist
- `docs/migration/SECURITY-CONTROLS.md` GitHub Pages header-ownership notes for Phase 6/7 handover
- `analysis/documentation/phase-4/rhi-041-security-data-hygiene-implementation-2026-03-11.md`
- `package.json` updated with `check:security-content` script

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-11 | In Progress | Audited a representative 20-record corrected-content sample for script tags, inline event handlers, `javascript:` URIs, WordPress admin or nonce artifacts, source metadata leakage, and mixed-content image references. The sample produced no blocking security patterns; only non-blocking manual-review observations remained in the form of general `http://` links and one prose `<iframe>` mention. |
| 2026-03-11 | Done | Added `scripts/migration/check-security-content.js`, wired `npm run check:security-content` to a staged Hugo build from `migration/output/content`, documented the runbook and GitHub Pages header constraints, and validated the release-candidate corpus cleanly at `0` critical findings and `0` warnings in `migration/reports/security-content-scan.csv`. |

---

### Notes

- Goldmark's `unsafe: false` is the primary defense against raw HTML script injection in Hugo-rendered content. Confirm this is set correctly in `hugo.toml` before any batch is built. Any content that relies on raw HTML rendering for legitimate reasons (e.g., a complex data visualization) must be reviewed and explicitly approved as a documented exception.
- `sourceId` and internal WordPress IDs must not appear in final `.md` front matter. They belong in migration audit artifacts only, not in publishable content. The WS-D mapping script must filter them out — WS-J is the verification check, not the fix.
- The security scan validates the corrected staged Markdown, not the pre-correction draft state. Treat fenced-code cleanup, mixed image-paragraph normalization, and curated alt-text overrides as pipeline inputs, not manual pre-scan chores.
- Reference: `analysis/plan/details/phase-4.md` §Workstream J: Security and Data Hygiene
