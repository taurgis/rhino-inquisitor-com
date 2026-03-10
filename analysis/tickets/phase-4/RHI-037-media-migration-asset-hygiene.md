## RHI-037 · Workstream F — Media Migration and Asset Hygiene

**Status:** Done  
**Priority:** High  
**Estimate:** L  
**Phase:** 4  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-18  
**Created:** 2026-03-07  
**Updated:** 2026-03-10

---

### Goal

Download all referenced WordPress media assets to controlled local paths under `src/assets/` for processable raster images and `src/static/` for direct attachments or non-processable files, deduplicate them, and rewrite all media references in converted content to point to the new local paths. API responses and extracted HTML are the primary reference list, but the full WordPress filesystem snapshot is an approved recovery source for uploads and attachment files when origin URLs, attachment metadata, or featured-image relationships are incomplete. The completed output must have zero hotlinks to deprecated WordPress upload paths and zero missing media references on any page that passes the migration gate.

Media breakage is invisible at build time but immediately apparent to users and Lighthouse. Broken images cause CLS issues, reduce perceived quality, and harm Core Web Vitals scores.

---

### Acceptance Criteria

- [x] Media download script `scripts/migration/download-media.js` exists and:
  - [x] Reads `mediaRefs` from `migration/intermediate/records.normalized.json`
  - [x] Downloads each unique URL once (deduplication by checksum before writing)
  - [x] Preserves original file extension
  - [x] Normalizes file names to deterministic slug-based names (no spaces, special characters, or WordPress size-suffix patterns like `-300x200`)
  - [x] Writes processable raster images to `src/assets/media/{year}/{slug}.{ext}` and direct attachments or non-processable files to `src/static/media/{year}/{slug}.{ext}`
  - [x] Records source URL → local path mapping in `migration/intermediate/media-manifest.json`
  - [x] Uses `p-limit` for bounded concurrent downloads
  - [x] Retries failed downloads up to 3 times with exponential backoff
  - [x] Logs permanently failed downloads as errors (not warnings) in `migration/reports/media-missing.csv`
  - [x] Is idempotent — skips already-downloaded files by checking local path existence and checksum
  - [x] Is referenced in `package.json` as `npm run migrate:download-media`
- [x] Media reference rewrite script `scripts/migration/rewrite-media-refs.js` exists and:
  - [x] Reads `migration/intermediate/media-manifest.json`
  - [x] Updates all `bodyHtml` → converted Markdown image references to local paths
  - [x] Updates all `heroImage` front matter fields to local paths
  - [x] Does not rewrite external media references not in `media-manifest.json` (log as warning)
  - [x] Is referenced in `package.json` as `npm run migrate:rewrite-media`
- [x] Media integrity check script `scripts/migration/check-media.js` exists and:
  - [x] Scans all generated `.md` files and `public/` HTML for image `src` values
  - [x] Verifies each local image reference resolves to an existing file in `src/assets/` or `src/static/` and that rendered HTML references resolve in the built output
  - [x] Detects any remaining hotlinks to `*.wordpress.com` or the original WordPress domain
  - [x] Verifies MIME type aligns with file extension (using file signature)
  - [x] Checks for mixed-content `http://` image references on HTTPS pages
  - [x] Reports results to `migration/reports/media-integrity-report.csv`
  - [x] Is referenced in `package.json` as `npm run check:media`
- [x] `migration/reports/media-missing.csv` is empty for the release candidate batch (all downloads succeeded or are explicitly approved exceptions)
- [x] `migration/reports/media-hotlinks.csv` contains only approved exceptions (none by default)
- [x] Hero images are appropriately sized (no image exceeding 2000px longest edge deployed without resize)

---

### Tasks

- [x] Audit `mediaRefs` in normalized records to determine:
  - [x] Total unique media URL count
  - [x] Media types present (images, PDFs, videos, audio)
  - [x] Any media hosted on third-party CDNs (not WordPress origin)
  - [x] Any WordPress-generated size variants (e.g., `-150x150`, `-300x225`) in references
  - [x] Any filesystem-only uploads or attachment files that are not cleanly recoverable from the origin URLs alone
- [x] Decide on image optimization strategy with engineering owner:
  - [x] Native `src/static/` only (simpler) vs `src/assets/` with Hugo image processing (better performance)
  - [x] Record decision in Progress Log
- [x] Create `scripts/migration/download-media.js`:
  - [x] Build unique URL set from all `mediaRefs` arrays in normalized records
  - [x] Implement slug normalization for filenames (remove size suffixes, normalize to URL-safe)
  - [x] Implement download with retry logic using `p-limit`
  - [x] Write media manifest and error logs
- [x] Create `scripts/migration/rewrite-media-refs.js`:
  - [x] Load media manifest
  - [x] Update image references in converted content files
  - [x] Update `heroImage` fields in front matter objects
- [x] Create `scripts/migration/check-media.js`:
  - [x] Implement image reference scanner for both Markdown and generated HTML
  - [x] Implement WordPress URL detector
  - [x] Implement MIME check using `file-type` or file signature inspection
- [x] Add script references to `package.json`
- [x] Run full pipeline (download → rewrite → check) and fix all failures
- [x] Commit all media scripts, media manifest, and integrity report

---

### Out of Scope

- CDN configuration or edge asset hosting (deferred unless build time or asset volume becomes a problem)
- Video file downloads (videos hosted on YouTube/Vimeo remain embedded; only local attachments are downloaded)
- Creating new image designs or replacing media content
- Setting up `sharp` image optimization pipeline (recommended but optional; include if hero images exceed size budget)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-031 Done — Phase 4 Bootstrap complete | Ticket | Resolved |
| RHI-034 Done — Converted records available with `mediaRefs` populated | Ticket | Resolved |
| WordPress media origin accessible for download | Access | Verified |
| WordPress filesystem snapshot available for upload recovery and verification | Access | Verified |
| `p-limit` installed | Tool | Verified |
| `file-type` available (or equivalent MIME check) | Tool | Verified |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| WordPress media origin returns 403/404 for some attachment URLs | Medium | High | Test a sample of 20 URLs before full download run; escalate missing media to migration owner for manual recovery | Engineering Owner |
| WordPress size-suffix variants (`-300x200`) referenced in content but only full-size downloaded | High | Medium | Parse all size suffixes and map to the canonical base filename; update references accordingly | Engineering Owner |
| Total media volume exceeds GitHub Pages 1 GB site size limit | Medium | High | Audit total media size before download; if at risk, evaluate CDN strategy for large assets | Engineering Owner |
| Duplicate media files from multiple size variants waste storage | Medium | Low | Deduplicate by checksum during download; only download each unique image once | Engineering Owner |
| Hero image download fails for featured images referenced in post meta | Medium | Medium | Resolve `_thumbnail_id` and attachment metadata from the best available source (WXR, SQL, or REST) and fall back to the filesystem snapshot for file recovery; log failures separately | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-037 is complete. The Phase 4 media pipeline now downloads and deduplicates canonical media references into repo-owned storage, rewrites generated content and `heroImage` references to local `/media/...` paths, validates staged Markdown plus rendered HTML, and passes the release-candidate media gate with zero failures.

The final closeout pass also cleaned the last stale upstream normalized-source thumbnail reference by remapping one dead YouTube thumbnail to the verified WordPress-backed fallback image already present in the local snapshot. After rerunning `normalize -> convert -> map-frontmatter -> download-media -> rewrite-media -> build -> check`, `migration/reports/media-missing.csv` is header-only, `migration/reports/media-hotlinks.csv` is empty, and `migration/reports/media-integrity-report.csv` contains zero fail rows.

**Delivered artefacts:**

- `scripts/migration/normalize.js`
- `scripts/migration/download-media.js`
- `scripts/migration/rewrite-media-refs.js`
- `scripts/migration/check-media.js`
- `migration/intermediate/media-manifest.json`
- `migration/reports/media-missing.csv` (empty for release candidate batch)
- `migration/reports/media-hotlinks.csv`
- `migration/reports/media-integrity-report.csv`
- `src/assets/media/` directory with downloaded raster images
- `src/static/media/` directory with direct attachments and non-processable media
- `package.json` updated with `migrate:download-media`, `migrate:rewrite-media`, `check:media` scripts

**Deviations from plan:**

- Added `sharp`-backed hero-image resizing in the downloader so the 2000px longest-edge budget is enforced during asset generation rather than by manual content edits.
- Added a normalization-time fallback for one dead external YouTube thumbnail so the release-candidate media batch resolves fully through repo-owned or WordPress-backed assets.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-10 | In Progress | Owner approved Hugo-aware media handling: raster images now target `src/assets/media/` while non-processable or direct attachments stay under `src/static/media/`. Owner also directed that `heroImage` remains empty unless true featured-image metadata is recovered. Initial corpus run downloaded 425 canonical media groups, resolved 1449 source references, and left 52 distinct canonical assets as 404 recovery blockers. |
| 2026-03-10 | In Progress | Follow-up remediation completed for the staged release-candidate content set: `npm run check:media -- --content-dir migration/output/content --public-dir tmp/rhi037-public` now passes with 0 failures after downloader-side hero resizing, Markdown rewrite fixes, and a local WordPress-featured-image fallback on the `video` page. |
| 2026-03-10 | Done | The final normalization pass remapped the one dead upstream YouTube thumbnail to the verified WordPress-backed fallback source, after which `npm run migrate:download-media -- --filesystem-root tmp/website-wordpress-backup/wp-content` completed with 0 failures and the staged release-candidate media reports were fully clean. |

---

### Notes

- WordPress generates multiple size variants for every uploaded image (`-150x150`, `-300x225`, etc.). Content HTML often references these sized variants directly, not the original. Rewriting must handle all variant patterns and map them back to one canonical downloaded file.
- The effective uploads path may differ from the default `/wp-content/uploads/` if the source WordPress install changed its content directory settings. Use the captured filesystem snapshot and configuration evidence, not assumptions, when reconciling media paths.
- GitHub Pages has a recommended site size of 1 GB. If the media audit shows the site will approach this, the CDN strategy decision should be made before the long-tail batch (RHI-045), not after.
- The `heroImage` path must be a local path, not a WordPress URL, before any file is committed to `src/content/`. Check this explicitly in the media integrity script.
- Featured-image linkage is now recovered from approved source channels. `heroImage` is emitted only when that linkage is verified and is never inferred from the first body image.
- Reference: `analysis/plan/details/phase-4.md` §Workstream F: Media Migration and Asset Hygiene
