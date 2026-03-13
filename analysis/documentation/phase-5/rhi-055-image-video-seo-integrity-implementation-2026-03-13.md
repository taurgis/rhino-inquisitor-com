# RHI-055 Image and Video SEO Integrity Implementation

Date: 2026-03-13
Ticket: `analysis/tickets/phase-5/RHI-055-image-video-seo-integrity.md`

## Change summary

Implemented the Phase 5 image and video SEO integrity gate for built Hugo output. The repository now includes `scripts/seo/check-images.js`, a dedicated `npm run check:images` command, and blocking CI steps in both PR route-sensitive validation and deploy validation. The gate scans rendered `<img>` tags, fails on missing non-decorative alt text, legacy WordPress media URLs, and broken local references, and also validates the kept `video` manifest routes for built-output presence and production indexability.

## Why this changed

RHI-055 required a release-grade guard against silent media regressions that would otherwise slip past migration-time media checks. Before this change, the repository had Phase 4 media integrity validation and Phase 5 schema/crawl-control gates, but it did not have a dedicated built-output image audit or a single gate that tied kept video routes to image/video SEO integrity requirements.

## Behavior details

### Old behavior

- No dedicated `check:images` SEO gate existed.
- Broken or legacy media references were primarily caught by migration-time checks such as `scripts/migration/check-media.js`, not by a Phase 5 built-output gate wired into current CI validation.
- `scripts/seo/check-schema.js` only enforced `VideoObject` presence or absence based on qualifying on-page video surfaces; it did not validate the RHI-055 property set when `VideoObject` was present.
- Empty-alt images in migrated Markdown could still reach production output because there was no built-output blocking audit focused on image semantics.

### New behavior

- `scripts/seo/check-images.js` scans all built HTML in `public/` for `<img>` tags and writes `migration/reports/phase-5-image-audit.csv`.
- The image gate blocks on:
  - missing `alt` attributes,
  - empty `alt` on non-decorative images,
  - legacy WordPress media sources such as `wp-content/uploads`, and
  - local image references that do not resolve in the built `public/` output.
- The image gate warns, but does not block, on missing intrinsic `width` and `height`.
- Decorative images are exempt only when they are explicitly rendered as decorative (`alt=""` plus `role="presentation"`, `role="none"`, or `aria-hidden="true"`).
- The same gate also validates the kept `video` manifest routes by confirming each built route exists, is not accidentally `noindex`, is not blocked by `robots.txt`, and does not emit `VideoObject` on non-qualifying pages.
- `scripts/seo/check-schema.js` now validates `VideoObject` required repository fields (`name`, `description`, `thumbnailUrl`, `uploadDate`) whenever a `VideoObject` node is present.

## Impact

- Maintainers now have a dedicated Phase 5 image/video SEO gate exposed as `npm run check:images`.
- PR route-sensitive builds and deploy validation both block on image/video SEO regressions.
- Built-output alt-text defects are now surfaced directly against rendered pages rather than only during migration review.
- The implementation follows the repository's approved local media pipeline: rendered media is validated at `/media/...` in `public/`, backed by the established `src/assets/media` and `src/static/media` source paths.

## Owner resolution

The ticket initially carried older wording that referenced `src/static/images/` for local migrated media. During implementation closeout, the user confirmed that media is fine under the repository's existing `/media/...` pipeline, so the ticket was closed against the established `src/assets/media` plus `src/static/media` model rather than forcing a path migration that the repository does not use.

## Verification

- Automated validation:
  - `npm run build:prod`
  - `npm run check:images`
  - `npm run check:schema`
  - `npm run check:crawl-controls`
- Image audit result:
  - `migration/reports/phase-5-image-audit.csv` generated with zero blocking rows and one warning-only row for an SVG without intrinsic dimensions on `/helpful-salesforce-b2c-commerce-cloud-cli-tools/`.
- Video route result:
  - `migration/reports/phase-5-image-audit.csv` records passing `video-route` rows for `/everything-new-in-sfcc-23-4/`, `/new-apis-and-features-for-a-headless-sfcc/`, `/sfcc-introduction/`, `/sitegenesis-vs-sfra-vs-pwa/`, and `/what-is-new-in-the-23-8-commerce-cloud-release/`.
- Manual representative spot-check on the local built site:
  - `/a-beginners-guide-to-webdav-in-sfcc/`
  - `/how-to-change-the-code-compatibility-mode-in-salesforce-b2c-commerce-cloud/`
  - `/understanding-sfcc-instances/`
  - `/ai-as-an-architect-and-content-creator/`
  - `/non-technical-sfcc-certifications/`
  - Result: all sampled pages rendered their main-content images successfully, all sampled images had non-empty alt text where required, and no sampled image source referenced `wp-content` or other legacy WordPress hosts.

## Related files

- `scripts/seo/check-images.js`
- `scripts/seo/check-schema.js`
- `package.json`
- `.github/workflows/build-pr.yml`
- `.github/workflows/deploy-pages.yml`
- `src/layouts/home.html`
- `src/content/posts/ai-as-an-architect-and-content-creator.md`
- `src/content/posts/an-overview-of-sfcc-global-functions.md`
- `src/content/posts/how-to-change-the-code-compatibility-mode-in-salesforce-b2c-commerce-cloud.md`
- `src/content/posts/non-technical-sfcc-certifications.md`
- `src/content/posts/reflecting-on-2-years-of-blogging.md`
- `src/content/posts/the-attribute-fallback-system-in-sfcc.md`
- `src/content/posts/the-realm-split-field-guide-to-migrating-an-sfcc-site.md`
- `src/content/posts/understanding-sfcc-instances.md`
- `src/content/pages/versioning-of-content-assets.md`
- `src/content/posts/where-to-start-when-you-are-new-to-salesforce-b2c-commerce-cloud-development.md`