# RHI-074 Preview Validation Base URL Alignment

## Change summary

The GitHub Pages deploy workflow now derives the expected preview stylesheet path from `actions/configure-pages` `base_url` output instead of assuming the preview artifact is always served from `/rhino-inquisitor-com/`.

## Why this changed

GitHub Pages exposes the resolved deployment origin and path through `steps.pages.outputs.base_url`. A hardcoded repo-path grep caused false deploy failures when the Pages base path differed from the fixed `/rhino-inquisitor-com/` assumption.

## Behavior details

Old behavior:
- The deploy workflow built a preview artifact with the Pages-provided `base_url`.
- The verification step always grepped `public/index.html` for `/rhino-inquisitor-com/styles/site.css` and `noindex, nofollow`.
- Deploys failed when Pages resolved a different base path even if the generated HTML correctly matched the actual Pages target.

New behavior:
- The deploy workflow still builds the preview artifact with the Pages-provided `base_url`.
- The verification step now parses that `base_url`, computes the expected stylesheet path for the active Pages target, and asserts the generated homepage references that path.
- The workflow still blocks deployment if preview HTML omits the expected `noindex, nofollow` robots directive.

## Impact

- Maintainers can run the same deploy workflow against project-site, root-path, or custom-domain Pages targets without changing the verification logic.
- The preview validation remains strict about path-prefix correctness, but it now follows the official Pages base URL contract instead of repository-name assumptions.
- Production validation behavior is unchanged.

## Verification

1. Run `hugo --gc --minify --environment preview --baseURL "https://taurgis.github.io/rhino-inquisitor-com/"` and confirm the generated homepage contains `/rhino-inquisitor-com/styles/site.css` plus `noindex, nofollow`.
2. Run `hugo --gc --minify --environment preview --baseURL "https://example.com/"` and confirm the generated homepage contains `/styles/site.css` plus `noindex, nofollow`.
3. Run the workflow validation step logic locally or in CI and confirm it passes for both base URL shapes.

## Related files

- `.github/workflows/deploy-pages.yml`
- `analysis/documentation/README.md`