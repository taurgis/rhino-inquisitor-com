# Homepage Route Collision and SEO Workflow Hardening - 2026-03-12

## Change summary

Resolved a duplicate root-route publisher that made the first production build render a legacy content page at `/` instead of the real homepage template, and updated the GitHub Actions validation workflows so CI validates the already-built production artifact for SEO, preserves production build output when route-sensitive validation fails, and emits more actionable homepage schema diagnostics.

## Why this changed

The failing deploy run on commit `582e936` confirmed the latest code was present in CI, but local probing then reproduced the same discrepancy: the first explicit production build emitted `src/content/pages/home.md` at `/`, while the second production build flipped back to the real homepage template in `src/layouts/home.html`. That meant the repository had two publishers competing for the root URL. `npm run check:seo` appeared green locally because it rebuilt `public/` a second time before validating.

At the same time, the deploy and PR workflows were already running an explicit production build before calling `npm run check:seo`, which introduced a second Hugo build in the same job and left failed runs with almost no retained artifact evidence.

## Behavior details

Old behavior:

- `deploy-pages.yml` and the full-site route-sensitive path in `build-pr.yml` ran `hugo --minify --environment production` and then ran `npm run check:seo`, causing a second production build inside the SEO gate.
- `src/content/pages/home.md` published with `url: /` and `draft: false`, which let a legacy page claim the root route during the first production build.
- If the SEO step failed, the later artifact-copy and upload steps were skipped, so the failing `public/` output was not retained.
- Homepage schema failures only reported `missing WebSite JSON-LD on homepage`, which made it difficult to tell whether CI rendered no JSON-LD at all, rendered the wrong page at `/`, or whether the parser saw a different schema shape.

New behavior:

- `src/content/pages/home.md` is now `draft: true`, so the root URL is owned only by the real homepage template.
- CI workflows now run `npm run check:seo:artifact`, which validates the existing `public/` output without rebuilding it.
- The production validation output is archived and uploaded with `if: ${{ !cancelled() }}` so failed route-sensitive runs still retain the built artifact for inspection.
- `scripts/check-seo.js` now includes homepage schema-type context and whether a raw `"@type":"WebSite"` marker was present when the homepage schema requirement fails.
- Local `npm run check:seo` remains self-contained and still rebuilds `public/` before validation.

## Impact

- The production homepage is deterministic on the first build because the legacy `Home` page no longer competes for `/`.
- CI route-sensitive validation no longer performs an unnecessary second Hugo production build after the explicit build step.
- Deploy and PR failures preserve the rendered production artifact, which makes homepage-schema regressions inspectable instead of opaque.
- Maintainers still have a one-command local SEO smoke gate, while CI gets a built-artifact-specific path that matches the workflow order of operations.

## Verification

- Run `npm run build:prod` and then `npm run check:seo:artifact`; confirm the validator passes on the first built artifact.
- Run `npm run check:seo` and confirm the self-contained local gate still passes.
- Confirm the workflow YAML validates with no editor diagnostics.
- On the next failing or passing CI run, verify the production validation artifact uploads even if a route-sensitive validation step fails.

## Related files

- `.github/workflows/deploy-pages.yml`
- `.github/workflows/build-pr.yml`
- `src/content/pages/home.md`
- `package.json`
- `scripts/check-seo.js`
