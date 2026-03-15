# RHI-074 Preview Validation Base URL Alignment

## Change summary

The GitHub Pages deploy workflow now derives the expected preview stylesheet path from `actions/configure-pages` `base_url` output instead of assuming the preview artifact is always served from `/rhino-inquisitor-com/`.

## Why this changed

GitHub Pages exposes the resolved deployment origin and path through `steps.pages.outputs.base_url`. A hardcoded repo-path grep caused false deploy failures when the Pages base path differed from the fixed `/rhino-inquisitor-com/` assumption.

## Behavior details

Old behavior:
- The deploy workflow built a preview artifact with the Pages-provided `base_url`.
- The preview base URL normalizer removed at most one trailing slash, and later workflow steps appended `/` when invoking Hugo and the crawl-control gate.
- The verification step always grepped `public/index.html` for `/rhino-inquisitor-com/styles/site.css` and `noindex, nofollow`.
- Deploys failed when Pages resolved a different base path even if the generated HTML correctly matched the actual Pages target.
- A root-host custom domain such as `https://staging.rhino-inquisitor.com//` could also produce a false preview crawl-control failure because the validator expected `//sitemap.xml` while Hugo emitted the normalized `/sitemap.xml` directive.

New behavior:
- The deploy workflow still builds the preview artifact with the Pages-provided `base_url`.
- The preview base URL is now normalized to exactly one trailing slash before any preview build or crawl-control step consumes it.
- The verification step now parses that `base_url`, computes the expected stylesheet path for the active Pages target, and asserts the generated homepage references that path.
- The crawl-control gate also normalizes `--base-url` before deriving the expected sitemap directive, so equivalent root-host and path-prefix preview URLs no longer fail on redundant trailing slashes.
- The workflow still blocks deployment if preview HTML omits the expected `noindex, nofollow` robots directive.

## Impact

- Maintainers can run the same deploy workflow against project-site, root-path, or custom-domain Pages targets without changing the verification logic.
- The preview validation remains strict about path-prefix correctness, but it now follows the official Pages base URL contract instead of repository-name assumptions.
- Production validation behavior is unchanged.

## Verification

1. Run `hugo --gc --minify --environment preview --baseURL "https://taurgis.github.io/rhino-inquisitor-com/"` and confirm the generated homepage contains `/rhino-inquisitor-com/styles/site.css` plus `noindex, nofollow`.
2. Run `hugo --gc --minify --environment preview --baseURL "https://example.com/"` and confirm the generated homepage contains `/styles/site.css` plus `noindex, nofollow`.
3. Run `node scripts/seo/check-crawl-controls.js --mode preview --base-url "https://staging.rhino-inquisitor.com//" --report tmp/ci-preview-crawl-control-audit.csv` against a preview build and confirm `/robots.txt` passes with the normalized sitemap directive.
4. Run the workflow validation step logic locally or in CI and confirm it passes for both root-host and path-prefix preview base URL shapes.

## Related files

- `.github/workflows/deploy-pages.yml`
- `scripts/seo/check-crawl-controls.js`
- `analysis/documentation/README.md`