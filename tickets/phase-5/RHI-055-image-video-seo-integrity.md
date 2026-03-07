## RHI-055 · Workstream H — Image and Video SEO Integrity

**Status:** Open  
**Priority:** Medium  
**Estimate:** M  
**Phase:** 5  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-22  
**Created:** 2026-03-07  
**Updated:** 2026-03-07

---

### Goal

Confirm that all images have descriptive alt text, that media asset URLs are stable and not pointing to deprecated WordPress paths, and that video pages carrying organic traffic or backlinks preserve their indexability and schema. Prevent silent media regressions that degrade the visual and semantic quality of pages in search results.

Images without alt text exclude blind and low-vision users and forfeit Google Image Search ranking opportunities. Videos without schema lose eligibility for video-rich results. Missing media on migrated pages causes visual 404s that reduce user trust and dwell time. This workstream validates all three risks as gated checks before launch.

---

### Acceptance Criteria

- [ ] Image audit script `scripts/seo/check-images.js` exists and:
  - [ ] Scans all generated HTML in `public/` for `<img>` tags
  - [ ] Flags any `<img>` with empty or absent `alt` attribute (block on empty for non-decorative images)
  - [ ] Flags `<img>` `src` values pointing to `wp-content/uploads` or any legacy WordPress domain
  - [ ] Flags `<img>` `src` values pointing to URLs that return non-200 in local build (static asset check)
  - [ ] Flags `<img>` missing `width` and `height` attributes (CLS risk — warn, not block)
  - [ ] Produces `migration/reports/phase-5-image-audit.csv` with per-image results
  - [ ] Exits with non-zero code on missing alt text or broken image references
  - [ ] Is referenced in `package.json` as `npm run check:images`
- [ ] All migrated images are:
  - [ ] Served from `static/images/` or a documented CDN path — not from `wp-content`
  - [ ] Reachable as local files in the `public/` build
  - [ ] Named with stable, normalized filenames (lowercase, hyphens, no spaces)
- [ ] Video page SEO is validated:
  - [ ] All video pages retained from the WordPress migration (identified in Phase 1 URL inventory) are confirmed accessible in Hugo output
  - [ ] Video pages with `VideoObject` schema have required properties present: `name`, `description`, `thumbnailUrl`, `uploadDate`
  - [ ] `VideoObject` schema only emitted on pages with qualifying video content
  - [ ] Watch-page indexability confirmed: no video pages accidentally blocked by `noindex` or `robots.txt`
- [ ] Representative media set passes manual spot-check on the local build (5 post pages with images)
- [ ] `migration/reports/phase-5-image-audit.csv` achieves zero blocking errors in the representative content set

---

### Tasks

- [ ] Review Phase 4 media migration outcome (RHI-037):
  - [ ] Confirm `static/images/` contains downloaded media files
  - [ ] Confirm `migration/reports/media-integrity-report.csv` shows no unresolved failures
  - [ ] Note any images that were not downloaded (quarantined) — confirm alt text or caption handles the gap
- [ ] Create `scripts/seo/check-images.js`:
  - [ ] Use `cheerio` to parse HTML and extract `<img>` tags
  - [ ] Implement empty/absent alt text detection (skip decorative images with `alt=""` + `role="presentation"`)
  - [ ] Implement legacy WordPress URL detection in `src` attribute
  - [ ] Implement local static file existence check against `public/` and `static/` directories
  - [ ] Implement `width`/`height` absence warning
  - [ ] Write per-image results to `migration/reports/phase-5-image-audit.csv`
- [ ] Validate video page SEO:
  - [ ] Cross-reference Phase 1 URL inventory for video URL class
  - [ ] Confirm all video pages are present in `public/`
  - [ ] Audit `VideoObject` JSON-LD for required properties (coordinate with WS-E RHI-052)
  - [ ] Verify no video page is blocked by crawl/index controls
- [ ] Spot-check 5 migrated post pages with images in the local build:
  - [ ] Confirm images load correctly
  - [ ] Confirm alt text is present and descriptive
  - [ ] Confirm no `wp-content` links remain
- [ ] Add `"check:images": "node scripts/seo/check-images.js"` to `package.json`
- [ ] Integrate `check:images` as a blocking step in the deploy CI workflow

---

### Out of Scope

- Image compression and WebP conversion pipeline (Phase 3/4 scope for performance; flagged here for SEO impact only)
- Video transcoding or hosting (WordPress embeds assumed to be preserved via iframe or Hugo shortcode)
- Social media image dimension requirements (OG image validation in Workstream A, RHI-048)
- Full WCAG alt text review for all images (Workstream I, RHI-056, handles accessibility depth)

---

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| RHI-047 Done — Phase 5 Bootstrap complete | Ticket | Pending |
| RHI-037 Done — Phase 4 media migration and asset hygiene | Ticket | Pending |
| RHI-035 Done — Phase 4 front matter mapping (heroImage field populated) | Ticket | Pending |
| RHI-052 — Workstream E structured data (VideoObject schema scope confirmed) | Ticket | Pending |
| `cheerio` and `fast-glob` available in `package.json` | Tool | Pending |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Phase 4 media download incomplete when this workstream runs (parallel execution) | High | Medium | Run initial `check:images` audit against Phase 4 output; flag unresolved items as warnings; re-run as final gate after RHI-037 is Done | Engineering Owner |
| Some migrated posts have images with auto-generated alt text from WordPress (e.g., filename as alt) | High | Medium | Flag these in `check:images` as warnings with low-quality alt text pattern detection; manual review required for top-traffic pages | SEO Owner |
| Video pages from WordPress use YouTube embeds — `VideoObject` schema requires `thumbnailUrl` from YouTube API | Medium | Medium | Use YouTube thumbnail URL pattern (`https://img.youtube.com/vi/{videoId}/hqdefault.jpg`) where available; document fallback | Engineering Owner |

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

- `scripts/seo/check-images.js`
- `migration/reports/phase-5-image-audit.csv`
- `package.json` updated with `check:images` script
- CI workflow updated with `check:images` blocking gate
- Manual spot-check notes recorded in Progress Log

**Deviations from plan:**

- None

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |

---

### Notes

- Decorative images (spacers, dividers) should have `alt=""` and optionally `role="presentation"`. The `check:images` script should not flag these as missing alt text — implement a whitelist for `alt=""` images that also carry `role="presentation"`.
- `VideoObject` schema requires the page to have a video element with a viewable URL. Do not emit `VideoObject` for pages that merely reference or describe a video without embedding it. Coordinate VideoObject scope decision with Workstream E (RHI-052).
- Reference: `analysis/plan/details/phase-5.md` §Workstream H: Image and Video SEO Integrity
