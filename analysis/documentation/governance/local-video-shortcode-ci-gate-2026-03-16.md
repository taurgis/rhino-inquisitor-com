# Local Video Shortcode CI Gate

## Change summary

This update adds `npm run check:local-video-shortcodes` to the blocking CI quality-gate sequence in both pull request validation and main-branch Pages deployment workflows.

## Why this changed

The repository already includes a local video shortcode policy validator in `package.json`, but CI did not enforce it in the core gate chain. Wiring it into CI prevents regressions where bundle-local `.mp4` or `.mov` markdown links bypass the required `local-video` shortcode authoring path.

## Behavior details

### Old behavior

1. CI validated front matter and then continued to build and SEO gates without running `check:local-video-shortcodes`.
2. Local markdown video-link regressions could pass CI until discovered during later manual review.

### New behavior

1. CI now runs `npm run check:local-video-shortcodes` immediately after front matter validation in:
   - `.github/workflows/build-pr.yml`
   - `.github/workflows/deploy-pages.yml`
2. A non-zero exit from this check fails the current job, which blocks downstream deployment progression under existing job dependency rules.

## Impact

1. Pull requests now fail earlier when local markdown video links are used instead of the shortcode.
2. Main-branch deploy runs enforce the same policy before production/preview build validation continues.
3. Blast radius is limited to CI workflow execution order and quality-gate outcomes; no runtime template behavior changes were introduced.

## Verification

1. Run `npm run check:local-video-shortcodes` locally and confirm zero findings.
2. Confirm both workflows include the new step after front matter validation.
3. Validate workflow semantics against official GitHub docs references:
   - `jobs.<job_id>.needs` requires successful dependent jobs before downstream jobs run.
   - GitHub Pages custom workflows require build/deploy sequencing with `needs` and explicit deploy permissions/environment.

## Related files

1. `.github/workflows/build-pr.yml`
2. `.github/workflows/deploy-pages.yml`
3. `package.json`
4. `scripts/migration/check-local-video-shortcodes.js`
