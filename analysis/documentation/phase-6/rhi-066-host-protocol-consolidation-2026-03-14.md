# RHI-066 Host And Protocol Consolidation

## Change summary

RHI-066 now has a dedicated Phase 6 host/protocol gate, a shared URL-policy document for the canonical-host contract, and explicit separation between repository-verifiable controls and deployment-side checks that still require GitHub Pages, DNS, and Search Console access.

## Why this changed

The repository already enforced most of the production canonical-host behavior through Hugo configuration and Phase 5 SEO validators, but the ticket still lacked the Phase 6 artifacts named in its acceptance criteria:

1. `scripts/phase-6/check-host-protocol.js`
2. `migration/phase-6-url-policy.md`
3. Phase 6 ticket evidence showing what is complete in-repo versus what remains external

Without those artifacts, the repo could pass canonical, sitemap, and crawl-control checks indirectly, but Workstream D still had no ticket-specific entry point or policy record for host/protocol governance.

## Behavior details

Old behavior:

1. Production canonical behavior depended on `hugo.toml`, `src/layouts/partials/seo/resolve.html`, and the existing Phase 5 SEO validators.
2. Preview noindex behavior was enforced by the SEO partials and `scripts/seo/check-crawl-controls.js`, but there was no RHI-066-specific wrapper that grouped production and optional preview checks under a single Phase 6 command.
3. The ticket mixed local build checks with GitHub Pages settings, DNS redirect behavior, and Search Console property ownership without an explicit repository policy document separating those evidence types.

New behavior:

1. `npm run check:host-protocol` now runs a Phase 6 wrapper that orchestrates:
   - `scripts/seo/check-metadata.js`
   - `scripts/seo/check-sitemap.js`
   - `scripts/seo/check-crawl-controls.js` in production mode
2. The wrapper accepts an optional `--preview-public-dir` so the same command can also validate preview-host `noindex, nofollow` behavior when a separate preview artifact is available.
3. `migration/phase-6-url-policy.md` now records:
   - the fixed production canonical-host contract,
   - environment-specific host behavior for production, preview, and localhost,
   - the GitHub Pages custom-domain and HTTPS plan,
   - the DNS apex-to-`www` consolidation plan,
   - the Search Console coverage checklist,
   - the initial Phase 6 CI gate reference for host/protocol validation.
4. `.github/workflows/deploy-pages.yml` now normalizes the Pages preview base URL to HTTPS before the preview Hugo build and preview crawl-control validation run. This prevents the live preview host from emitting `http://taurgis.github.io/...` canonical, Open Graph, and `robots.txt` sitemap URLs when `actions/configure-pages` returns an HTTP scheme.
5. RHI-066 ticket progress now marks the repo-side controls as implemented and keeps the GitHub Pages, DNS, and Search Console validations explicitly pending instead of treating them as locally closed.

## Impact

1. Maintainers now have a single Phase 6 entry point for canonical-host validation instead of manually stitching together the underlying SEO validators.
2. The canonical-host contract is documented in a shared Phase 6 policy file that later URL-governance tickets can extend without redefining host behavior.
3. External platform checks are still required for final ticket closure, but they are no longer conflated with the repository-only implementation scope.
4. The next GitHub Pages deployment should replace the live preview host's current `http://` absolute URLs with `https://` preview-host URLs while preserving preview `noindex, nofollow` behavior.

## Verification

1. Build a clean production artifact outside `public/`:

```bash
hugo --gc --minify --environment production --baseURL "https://www.rhino-inquisitor.com/" --destination tmp/rhi066-prod-public
```

2. Build a clean preview artifact outside `public/`:

```bash
hugo --gc --minify --environment preview --baseURL "https://taurgis.github.io/rhino-inquisitor-com/" --destination tmp/rhi066-preview-public
```

3. Run the Phase 6 host/protocol gate against both artifacts:

```bash
npm run check:host-protocol -- \
  --public-dir tmp/rhi066-prod-public \
  --preview-public-dir tmp/rhi066-preview-public \
  --report-dir tmp/rhi066-host-protocol
```

4. Confirm the command exits with `0` and that the report directory contains:
   - `phase-6-host-protocol-metadata.csv`
   - `phase-6-host-protocol-sitemap.csv`
   - `phase-6-host-protocol-crawl-controls-production.csv`
   - `phase-6-host-protocol-crawl-controls-preview.csv`
5. Manual external verification still required before final RHI-066 closure:
   - GitHub Pages custom domain set to `www.rhino-inquisitor.com`
   - GitHub Pages `Enforce HTTPS` enabled
   - live apex/`www` and HTTP/HTTPS redirects validated with `curl`
   - Search Console ownership confirmed for the required host/protocol properties

Verified on 2026-03-14:

1. Production metadata validation passed for `215` indexable pages.
2. Production sitemap validation passed for `215` sitemap URLs.
3. Production crawl-control validation passed for `237` HTML routes.
4. Preview crawl-control validation passed for `237` HTML routes.
5. Live preview-host check before the workflow fix showed `https://taurgis.github.io/rhino-inquisitor-com/` serving `noindex, nofollow` correctly, but the deployed preview HTML and `robots.txt` still emitted `http://taurgis.github.io/rhino-inquisitor-com/...` absolute URLs. The workflow now normalizes that base URL to HTTPS for future deployments.
6. Live production-host checks showed `http://www.rhino-inquisitor.com/` and `http://rhino-inquisitor.com/` redirecting to HTTPS, while `https://rhino-inquisitor.com/` still resolved directly instead of consolidating to `https://www.rhino-inquisitor.com/`. That runtime DNS/edge item remains outside repository control.

## Related files

1. `scripts/phase-6/check-host-protocol.js`
2. `package.json`
3. `migration/phase-6-url-policy.md`
4. `analysis/tickets/phase-6/RHI-066-host-protocol-canonical-consolidation.md`
5. `.github/workflows/deploy-pages.yml`
6. `scripts/seo/check-metadata.js`
7. `scripts/seo/check-sitemap.js`
8. `scripts/seo/check-crawl-controls.js`
9. `hugo.toml`
10. `src/layouts/partials/seo/resolve.html`