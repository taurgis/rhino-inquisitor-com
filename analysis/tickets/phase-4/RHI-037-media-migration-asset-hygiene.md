## RHI-037 · Workstream F — Media Migration and Asset Hygiene

**Status:** Open  
**Priority:** High  
**Estimate:** L  
**Phase:** 4  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-18  
**Created:** 2026-03-07  
**Updated:** 2026-03-10

---

### Goal

Download all referenced WordPress media assets to a controlled local path under `src/static/`, deduplicate them, generate responsive image variants where warranted, and rewrite all media references in converted content to point to the new local paths. API responses and extracted HTML are the primary reference list, but the full WordPress filesystem snapshot is an approved recovery source for uploads and attachment files when origin URLs, attachment metadata, or featured-image relationships are incomplete. The completed output must have zero hotlinks to deprecated WordPress upload paths and zero missing media references on any page that passes the migration gate.

Media breakage is invisible at build time but immediately apparent to users and Lighthouse. Broken images cause CLS issues, reduce perceived quality, and harm Core Web Vitals scores.

---

### Acceptance Criteria

- [ ] Media download script `scripts/migration/download-media.js` exists and:
  - [ ] Reads `mediaRefs` from `migration/intermediate/records.normalized.json`
  - [ ] Downloads each unique URL once (deduplication by checksum before writing)
  - [ ] Preserves original file extension
  - [ ] Normalizes file names to deterministic slug-based names (no spaces, special characters, or WordPress size-suffix patterns like `-300x200`)
  - [ ] Writes media to `src/static/media/{year}/{slug}.{ext}` path structure
  - [ ] Records source URL → local path mapping in `migration/intermediate/media-manifest.json`
  - [ ] Uses `p-limit` for bounded concurrent downloads
  - [ ] Retries failed downloads up to 3 times with exponential backoff
  - [ ] Logs permanently failed downloads as errors (not warnings) in `migration/reports/media-missing.csv`
  - [ ] Is idempotent — skips already-downloaded files by checking local path existence and checksum
  - [ ] Is referenced in `package.json` as `npm run migrate:download-media`
- [ ] Media reference rewrite script `scripts/migration/rewrite-media-refs.js` exists and:
  - [ ] Reads `migration/intermediate/media-manifest.json`
  - [ ] Updates all `bodyHtml` → converted Markdown image references to local paths
  - [ ] Updates all `heroImage` front matter fields to local paths
  - [ ] Does not rewrite external media references not in `media-manifest.json` (log as warning)
  - [ ] Is referenced in `package.json` as `npm run migrate:rewrite-media`
- [ ] Media integrity check script `scripts/migration/check-media.js` exists and:
  - [ ] Scans all generated `.md` files and `public/` HTML for image `src` values
  - [ ] Verifies each local image reference resolves to an existing file in `src/static/`
  - [ ] Detects any remaining hotlinks to `*.wordpress.com` or the original WordPress domain
  - [ ] Verifies MIME type aligns with file extension (using file signature)
  - [ ] Checks for mixed-content `http://` image references on HTTPS pages
  - [ ] Reports results to `migration/reports/media-integrity-report.csv`
  - [ ] Is referenced in `package.json` as `npm run check:media`
- [ ] `migration/reports/media-missing.csv` is empty for the release candidate batch (all downloads succeeded or are explicitly approved exceptions)
- [ ] `migration/reports/media-hotlinks.csv` contains only approved exceptions (none by default)
- [ ] Hero images are appropriately sized (no image exceeding 2000px longest edge deployed without resize)

---

### Tasks

- [ ] Audit `mediaRefs` in normalized records to determine:
  - [ ] Total unique media URL count
  - [ ] Media types present (images, PDFs, videos, audio)
  - [ ] Any media hosted on third-party CDNs (not WordPress origin)
  - [ ] Any WordPress-generated size variants (e.g., `-150x150`, `-300x225`) in references
  - [ ] Any filesystem-only uploads or attachment files that are not cleanly recoverable from the origin URLs alone
- [ ] Decide on image optimization strategy with engineering owner:
  - [ ] Native `src/static/` only (simpler) vs `src/assets/` with Hugo image processing (better performance)
  - [ ] Record decision in Progress Log
- [ ] Create `scripts/migration/download-media.js`:
  - [ ] Build unique URL set from all `mediaRefs` arrays in normalized records
  - [ ] Implement slug normalization for filenames (remove size suffixes, normalize to URL-safe)
  - [ ] Implement download with retry logic using `p-limit`
  - [ ] Write media manifest and error logs
- [ ] Create `scripts/migration/rewrite-media-refs.js`:
  - [ ] Load media manifest
  - [ ] Update image references in converted content files
  - [ ] Update `heroImage` fields in front matter objects
- [ ] Create `scripts/migration/check-media.js`:
  - [ ] Implement image reference scanner for both Markdown and generated HTML
  - [ ] Implement WordPress URL detector
  - [ ] Implement MIME check using `file-type` or file signature inspection
- [ ] Add script references to `package.json`
- [ ] Run full pipeline (download → rewrite → check) and fix all failures
- [ ] Commit all media scripts, media manifest, and integrity report

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
| RHI-031 Done — Phase 4 Bootstrap complete | Ticket | Pending |
| RHI-034 Done — Converted records available with `mediaRefs` populated | Ticket | Pending |
| WordPress media origin accessible for download | Access | Pending |
| WordPress filesystem snapshot available for upload recovery and verification | Access | Pending |
| `p-limit` installed | Tool | Pending |
| `file-type` available (or equivalent MIME check) | Tool | Pending |

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

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

{Leave blank until work is complete.}

**Delivered artefacts:**

- `scripts/migration/download-media.js`
- `scripts/migration/rewrite-media-refs.js`
- `scripts/migration/check-media.js`
- `migration/intermediate/media-manifest.json`
- `migration/reports/media-missing.csv` (empty for release candidate batch)
- `migration/reports/media-hotlinks.csv`
- `migration/reports/media-integrity-report.csv`
- `src/static/media/` directory with downloaded assets
- `package.json` updated with `migrate:download-media`, `migrate:rewrite-media`, `check:media` scripts

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- WordPress generates multiple size variants for every uploaded image (`-150x150`, `-300x225`, etc.). Content HTML often references these sized variants directly, not the original. Rewriting must handle all variant patterns and map them back to one canonical downloaded file.
- The effective uploads path may differ from the default `/wp-content/uploads/` if the source WordPress install changed its content directory settings. Use the captured filesystem snapshot and configuration evidence, not assumptions, when reconciling media paths.
- GitHub Pages has a recommended site size of 1 GB. If the media audit shows the site will approach this, the CDN strategy decision should be made before the long-tail batch (RHI-045), not after.
- The `heroImage` path must be a local path, not a WordPress URL, before any file is committed to `src/content/`. Check this explicitly in the media integrity script.
- Reference: `analysis/plan/details/phase-4.md` §Workstream F: Media Migration and Asset Hygiene
