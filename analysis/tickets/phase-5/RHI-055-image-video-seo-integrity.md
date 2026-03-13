## RHI-055 · Workstream H — Image and Video SEO Integrity

**Status:** Done  
**Priority:** Medium  
**Estimate:** M  
**Phase:** 5  
**Assigned to:** Engineering Owner  
**Target date:** 2026-04-22  
**Created:** 2026-03-07  
**Updated:** 2026-03-13

---

### Goal

Confirm that all images have descriptive alt text, that media asset URLs are stable and not pointing to deprecated WordPress paths, and that video pages carrying organic traffic or backlinks preserve their indexability and schema. Prevent silent media regressions that degrade the visual and semantic quality of pages in search results.

Images without alt text exclude blind and low-vision users and forfeit Google Image Search ranking opportunities. Videos without schema lose eligibility for video-rich results. Missing media on migrated pages causes visual 404s that reduce user trust and dwell time. This workstream validates all three risks as gated checks before launch.

---

### Acceptance Criteria

- [x] Image audit script `scripts/seo/check-images.js` exists and:
  - [x] Scans all generated HTML in `public/` for `<img>` tags
  - [x] Flags any `<img>` with empty or absent `alt` attribute (block on empty for non-decorative images)
  - [x] Flags `<img>` `src` values pointing to `wp-content/uploads` or any legacy WordPress domain
  - [x] Flags `<img>` `src` values pointing to URLs that return non-200 in local build (static asset check)
  - [x] Flags `<img>` missing `width` and `height` attributes (CLS risk — warn, not block)
  - [x] Produces `migration/reports/phase-5-image-audit.csv` with per-image results
  - [x] Exits with non-zero code on missing alt text or broken image references
  - [x] Is referenced in `package.json` as `npm run check:images`
- [x] All migrated images are:
  - [x] Served from the approved local `/media/...` pipeline backed by `src/assets/media` and `src/static/media`, or a documented CDN path — not from `wp-content`
  - [x] Reachable as local files in the `public` build
  - [x] Named with stable, normalized filenames (lowercase, hyphens, no spaces)
- [x] Video page SEO is validated:
  - [x] All video pages retained from the WordPress migration (identified in Phase 1 URL inventory) are confirmed accessible in Hugo output
  - [x] Video pages with `VideoObject` schema have required properties present: `name`, `description`, `thumbnailUrl`, `uploadDate`
  - [x] `VideoObject` schema only emitted on pages with qualifying video content
  - [x] Watch-page indexability confirmed: no video pages accidentally blocked by `noindex` or `robots.txt`
- [x] Representative media set passes manual spot-check on the local build (5 post pages with images)
- [x] `migration/reports/phase-5-image-audit.csv` achieves zero blocking errors in the representative content set

---

### Tasks

- [x] Review Phase 4 media migration outcome (RHI-037):
  - [x] Confirm the approved local media pipeline is `src/assets/media` and `src/static/media`, rendered at `/media/...`
  - [x] Confirm `migration/reports/media-integrity-report.csv` is superseded for release gating by the built-output Phase 5 image audit on current rendered pages
  - [x] Note any images that were not downloaded (quarantined) are outside the final representative set and would fail the built-output gate if still referenced
- [x] Create `scripts/seo/check-images.js`:
  - [x] Use `cheerio` to parse HTML and extract `<img>` tags
  - [x] Implement empty/absent alt text detection (skip decorative images with `alt=""` + `role="presentation"`)
  - [x] Implement legacy WordPress URL detection in `src` attribute
  - [x] Implement local static file existence check against `public/` and `src/static/` directories
  - [x] Implement `width`/`height` absence warning
  - [x] Write per-image results to `migration/reports/phase-5-image-audit.csv`
- [x] Validate video page SEO:
  - [x] Cross-reference Phase 1 URL inventory for video URL class
  - [x] Confirm all video pages are present in `public/`
  - [x] Audit `VideoObject` JSON-LD for required properties (coordinate with WS-E RHI-052)
  - [x] Verify no video page is blocked by crawl/index controls
- [x] Spot-check 5 migrated post pages with images in the local build:
  - [x] Confirm images load correctly
  - [x] Confirm alt text is present and descriptive
  - [x] Confirm no `wp-content` links remain
- [x] Add `"check:images": "node scripts/seo/check-images.js"` to `package.json`
- [x] Integrate `check:images` as a blocking step in the deploy CI workflow

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
| RHI-047 Done — Phase 5 Bootstrap complete | Ticket | Done |
| RHI-037 Done — Phase 4 media migration and asset hygiene | Ticket | Done |
| RHI-035 Done — Phase 4 front matter mapping (heroImage field populated) | Ticket | Done |
| RHI-052 — Workstream E structured data (VideoObject schema scope confirmed) | Ticket | Done |
| `cheerio` and `fast-glob` available in `package.json` | Tool | Done |

---

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Phase 4 media download incomplete when this workstream runs (parallel execution) | High | Medium | Run initial `check:images` audit against Phase 4 output; flag unresolved items as warnings; re-run as final gate after RHI-037 is Done | Engineering Owner |
| Some migrated posts have images with auto-generated alt text from WordPress (e.g., filename as alt) | High | Medium | Flag these in `check:images` as warnings with low-quality alt text pattern detection; manual review required for top-traffic pages | SEO Owner |
| Video pages from WordPress use YouTube embeds — `VideoObject` schema requires `thumbnailUrl` from YouTube API | Medium | Medium | Use YouTube thumbnail URL pattern (`https://img.youtube.com/vi/{videoId}/hqdefault.jpg`) where available; document fallback | Engineering Owner |

---

### Definition of Done

- [x] All acceptance criteria are satisfied and verified
- [x] Tasks are complete or intentionally descoped with rationale
- [x] Dependencies and blockers are resolved or documented
- [x] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

RHI-055 is complete. The repository now has a blocking built-output image and video SEO gate, representative manual evidence, and updated content/template fixes for the empty-alt regressions discovered during the first audit run. The user confirmed that the repository's established `/media/...` pipeline backed by `src/assets/media` and `src/static/media` is the accepted implementation target for local migrated media, so the earlier `src/static/images/` wording is resolved and no longer blocks closure.

**Delivered artefacts:**

- `scripts/seo/check-images.js`
- `migration/reports/phase-5-image-audit.csv`
- `package.json` updated with `check:images` script
- CI workflow updated with `check:images` blocking gate
- Manual spot-check notes recorded in Progress Log
- `analysis/documentation/phase-5/rhi-055-image-video-seo-integrity-implementation-2026-03-13.md`
- Content alt-text corrections across affected migrated posts and pages
- `src/layouts/home.html` updated so the homepage illustration is explicitly decorative

**Deviations from plan:**

- Acceptance wording was reconciled to the repository-approved local media pipeline (`/media/...` rendered from `src/assets/media` and `src/static/media`) rather than the older `src/static/images/` shorthand in the original ticket text.

---

### Progress Log

| Date | Status | Note |
|------|--------|------|
| 2026-03-07 | Open | Ticket created |
| 2026-03-13 | In Progress | Added `check:images`, generated `migration/reports/phase-5-image-audit.csv` with zero blocking rows and one warning-only SVG width/height finding, wired the gate into PR and deploy validation, validated the kept `video` manifest routes, and fixed rendered empty-alt content defects discovered by the first audit run. Ticket closeout still needs owner confirmation on the legacy `src/static/images/` wording because the implemented and already-established media pipeline validates approved local `/media/...` output backed by `src/assets/media` and `src/static/media`. |
| 2026-03-13 | Done | User confirmed the approved local media pipeline and accepted the repository's existing `/media/...` implementation model. Ticket closed with the built-output `check:images` gate, passing automated validation (`build:prod`, `check:images`, `check:schema`, `check:crawl-controls`), and representative manual image spot-check evidence recorded. |

---

### Notes

- Decorative images (spacers, dividers) should have `alt=""` and optionally `role="presentation"`. The `check:images` script should not flag these as missing alt text — implement a whitelist for `alt=""` images that also carry `role="presentation"`.
- `VideoObject` schema requires the page to have a video element with a viewable URL. Do not emit `VideoObject` for pages that merely reference or describe a video without embedding it. Coordinate VideoObject scope decision with Workstream E (RHI-052).
- Reference: `analysis/plan/details/phase-5.md` §Workstream H: Image and Video SEO Integrity
