## RHI-041 · Workstream J — Security and Data Hygiene

**Status:** Open  
**Priority:** Medium  
**Estimate:** M  
**Phase:** 4  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-18  
**Created:** 2026-03-07  
**Updated:** 2026-03-10

---

### Goal

Prevent the migration from publishing unsafe, sensitive, or private content artifacts by scanning all generated output for script injection fragments, inline event handlers, private draft content, source-system metadata, and HTTPS-hostile references. This includes ensuring that data recovered from the WordPress SQL dump or filesystem snapshot does not leak internal paths, configuration values, or non-publishable metadata into generated content. The security content scan must be a blocking CI gate before any batch is committed to `src/content/`.

Static sites are not inherently safe from XSS if user-generated or third-party content is migrated without sanitization. WordPress content can include embedded JavaScript widgets, inline event handlers from legacy themes, and private metadata that should never reach a public static site.

---

### Acceptance Criteria

- [ ] Security content scan script `scripts/migration/check-security-content.js` exists and:
  - [ ] Scans all generated `.md` files and converted HTML output for:
    - [ ] `<script>` tags in content (not in code blocks/pre elements)
    - [ ] Inline event handler attributes: `onload`, `onclick`, `onerror`, and all `on*` patterns
    - [ ] Suspicious `<iframe>` elements not in the approved list (YouTube, Vimeo approved; others flagged)
    - [ ] `javascript:` URI schemes in links
    - [ ] Private WordPress draft content (`status: draft`, `status: private`) that has `draft: false` set (misconfiguration check)
    - [ ] WordPress nonce, authentication token, or admin URL patterns in content
    - [ ] Internal WordPress admin URLs (e.g., `/wp-admin/`, `/wp-json/wp/v2/` in content body)
    - [ ] `http://` image references on pages that will be served over HTTPS
  - [ ] Distinguishes `critical` findings (script tags, event handlers, `javascript:` URIs) from `warnings` (http references, suspicious iframes)
  - [ ] Produces `migration/reports/security-content-scan.csv` with per-file findings
  - [ ] Exits with non-zero code on any `critical` finding
  - [ ] Is referenced in `package.json` as `npm run check:security-content`
- [ ] All `critical` findings are resolved before any batch is merged to `src/content/`
- [ ] No WordPress private drafts or protected posts appear in generated output with `draft: false`
- [ ] No source-system-only metadata is present in generated front matter (e.g., `sourceId`, internal WordPress IDs, SQL-only fields, or filesystem paths must not appear in final Hugo content files)
- [ ] GitHub Pages hosting constraints are documented:
  - [ ] HTTP security header capabilities and limitations on GitHub Pages are recorded
  - [ ] Any header policy requiring edge/CDN layer is flagged for Phase 6/7 attention
- [ ] `migration/reports/security-content-scan.csv` has zero critical findings in the release candidate batch

---

### Tasks

- [ ] Audit a sample of 20 converted records for security-relevant patterns:
  - [ ] Search for `<script>`, `on*=`, `javascript:` patterns
  - [ ] Check for WordPress admin/nonce artifacts
  - [ ] Check for leaked filesystem paths, SQL-only metadata, or plugin/theme configuration values recovered during extraction
  - [ ] Check for `http://` image sources
  - [ ] Document findings in Progress Log
- [ ] Create `scripts/migration/check-security-content.js`:
  - [ ] Implement script tag detector (exclude `<code>` and `<pre>` contexts)
  - [ ] Implement inline event handler attribute detector
  - [ ] Implement `javascript:` URI detector in links
  - [ ] Implement approved iframe allowlist check
  - [ ] Implement WordPress internal URL pattern detector
  - [ ] Implement mixed-content `http://` image detector
  - [ ] Implement draft status vs front matter mismatch detector
  - [ ] Write findings to `migration/reports/security-content-scan.csv`
- [ ] Verify Hugo `hugo.toml` Goldmark configuration:
  - [ ] `unsafe: false` (default) — raw HTML rendering disabled in content
  - [ ] Confirm this is set in Phase 3 Hugo config (RHI-021); document any exceptions
- [ ] Define approved iframe sources (YouTube, Vimeo) and document in `docs/migration/RUNBOOK.md`
- [ ] Ensure `sourceId` and other extraction-layer fields are not written to final `.md` front matter by WS-D
- [ ] Review GitHub Pages header capabilities:
  - [ ] Document what security headers GitHub Pages provides natively
  - [ ] List any headers requiring edge/CDN layer (CSP, HSTS preload, Permissions-Policy)
  - [ ] Record recommendations for Phase 6/7 header strategy decision
- [ ] Run `check:security-content` on pilot batch and fix all critical findings
- [ ] Add `"check:security-content": "node scripts/migration/check-security-content.js"` to `package.json`
- [ ] Commit security scan script and scan report

---

### Out of Scope

- Implementing Content Security Policy headers (requires edge/CDN layer — Phase 6/7)
- HTTPS enforcement configuration (GitHub Pages setting — Phase 7)
- Penetration testing or runtime security assessment
- Scanning WordPress source HTML for vulnerabilities (only scanning migration output)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-031 Done — Phase 4 Bootstrap complete | Ticket | Pending |
| RHI-034 Done — Converted Markdown content available for scanning | Ticket | Pending |
| RHI-021 Done — Hugo Goldmark `unsafe: false` configuration confirmed | Ticket | Pending |

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- `scripts/migration/check-security-content.js`
- `migration/reports/security-content-scan.csv` (zero critical findings for release candidate batch)
- GitHub Pages header strategy notes (for Phase 6/7 handover)
- `package.json` updated with `check:security-content` script

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Goldmark's `unsafe: false` is the primary defense against raw HTML script injection in Hugo-rendered content. Confirm this is set correctly in `hugo.toml` before any batch is built. Any content that relies on raw HTML rendering for legitimate reasons (e.g., a complex data visualization) must be reviewed and explicitly approved as a documented exception.
- `sourceId` and internal WordPress IDs must not appear in final `.md` front matter. They belong in migration audit artifacts only, not in publishable content. The WS-D mapping script must filter them out — WS-J is the verification check, not the fix.
- Reference: `analysis/plan/details/phase-4.md` §Workstream J: Security and Data Hygiene
