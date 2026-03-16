# RHI-075 — Artifact Integrity and Build Limits

**Date:** 2026-03-16
**Phase:** 7
**Ticket:** RHI-075
**Status:** Implemented
**Author:** Engineering Owner

---

## Change Summary

RHI-075 added a dedicated artifact integrity validator for Phase 7 deployment gating and wired it into the GitHub Pages deployment workflow as a blocking pre-upload step. The new validator enforces `public/` structural constraints, checks accidental build-output leakage, records compressed and projected site-size metrics, and emits machine-readable reports that are archived in CI.

---

## Why This Changed

GitHub Pages deploy failures caused by invalid artifact shape or size are expensive to diagnose during cutover windows. This change makes those conditions deterministic and visible before `actions/upload-pages-artifact`, reducing launch risk unrelated to content correctness.

---

## Old vs. New Behavior

### Before

- The workflow had `check:pages-constraints` but no dedicated Phase 7 `validate:artifact` gate.
- Production build used `hugo --minify --environment production` without explicit destination cleaning.
- No dedicated artifact-validator report artifact was produced per deployment run.

### After

- Added `scripts/phase-7/validate-artifact.js` and package script `npm run validate:artifact`.
- Workflow now runs artifact validation twice:
  - after production validation build
  - after preview rehearsal build and immediately before `actions/upload-pages-artifact`
- Production and preview build commands now use `--cleanDestinationDir --gc --minify` to avoid stale output drift.
- Artifact validator reports are uploaded as a dedicated CI artifact and included in the broader build artifact bundle.
- Validator enforces:
  - top-level `public/index.html` exists
  - no symlinks, hard links, or special files
  - no `.map` files
  - no accidental source artifacts (`node_modules`, `.git`, backup-file suffixes)
  - lowercase output paths, with explicit exceptions only for owner-approved uppercase `keep` routes in `migration/url-manifest.json`
  - compressed-size warning threshold at 700 MB
  - projected published-size hard stop above 900 MB

---

## Impact

- Deployment workflow now blocks Pages artifact upload earlier when artifact structure/size policy is violated.
- CI now provides deterministic artifact validation JSON output for every run.
- Bundle-local media filenames were normalized to lowercase in two articles to align generated output paths with the lowercase policy.

---

## Verification

Local verification completed:

1. `hugo --cleanDestinationDir --gc --minify --environment production`
2. `npm run validate:artifact -- --label local-npm --report tmp/phase-7-artifact-validation-local-npm.json`
3. Fixture-based negative test for `.map` leak produced expected `status=fail`.
4. Fixture-based threshold test with tiny warning threshold produced expected `status=warn`.

Expected CI verification path:

1. `deploy-pages.yml` run must show both validator steps succeeding before `Upload Pages artifact`.
2. Artifact `phase-7-artifact-validator-<sha>` must include the production and preview validator JSON reports.
3. Any validator failure must block `actions/upload-pages-artifact` and downstream `deploy` execution.

---

## Related Files

- `.github/workflows/deploy-pages.yml`
- `scripts/phase-7/validate-artifact.js`
- `package.json`
- `docs/migration/RUNBOOK.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-23-2/index.md`
- `src/content/posts/what-is-new-in-the-23-8-commerce-cloud-release/index.md`
- `src/content/posts/salesforce-b2c-commerce-cloud-23-2/rd-overview.mov`
- `src/content/posts/what-is-new-in-the-23-8-commerce-cloud-release/cookie-support-demo.mp4`
