# RHI-021 Hugo Configuration Hardening - 2026-03-09

## Change summary

Hardened the root Hugo configuration for Phase 3 by making locale defaults, generated category routes, rendered outputs, robots generation, and production build behavior explicit. Added the repo-owned `robots.txt` template required by the approved mechanism and documented the feed continuity boundary.

## Why this changed

The repository had only a minimal `hugo.toml`, which left route generation, output surfaces, and production build semantics partly implicit. Phase 3 needs these behaviors locked before archetypes, templates, SEO partials, and parity tooling build on top of them.

## Behavior details

Old behavior:

- `hugo.toml` only declared the canonical base URL and source directory mappings.
- Locale defaults, taxonomy generation, output lists, and production content-gating behavior were not explicit.
- `robots.txt` generation had no repo-owned template behind it.
- Feed continuity expectations existed in tickets and plans, but the boundary between Hugo's default `/index.xml` feed and the legacy `/feed/` requirement was not recorded in the operational runbook.

New behavior:

- Root `hugo.toml` now explicitly sets `defaultContentLanguage`, `languageCode`, `timeZone`, `buildDrafts`, `buildFuture`, `buildExpired`, `enableRobotsTXT`, and the rendered `outputs` list.
- Generated public taxonomy routing is limited to categories using `/category/` and `/category/{slug}/`.
- Tag archives remain retired by default to stay aligned with the approved Phase 2 route contract.
- A repo-owned `src/layouts/robots.txt` template now backs `enableRobotsTXT = true`.
- The runbook now documents Hugo's canonical home feed at `/index.xml` and records `/feed/` continuity as a downstream must-resolve dependency owned by RHI-024.

## Impact

- Downstream Phase 3 tickets inherit deterministic Hugo config behavior instead of defaults.
- Production-style validation now has explicit file expectations for `sitemap.xml`, `robots.txt`, and the home RSS feed.
- The repository avoids accidentally generating public `/tag/*` routes before an approved exception exists.
- Feed continuity remains tracked without prematurely forcing a custom feed path into the config layer.
- Remaining template-rendering and parity work stays with downstream tickets, but this configuration hardening slice is complete on its own scope.

## Verification

- Ran `hugo --minify --environment production` successfully.
- Verified generated output presence for `public/sitemap.xml`, `public/robots.txt`, and `public/index.xml`.
- Spot-checked generated machine-readable outputs for canonical host consistency on `https://www.rhino-inquisitor.com/`.
- Re-ran the build with `hugo --cleanDestinationDir --minify --environment production` to remove stale `public/` artifacts before final verification.
- Recorded the expected missing-layout warnings for `home` and `taxonomy` HTML kinds as the downstream template-scaffolding dependency owned by RHI-023.

## Related files

- `hugo.toml`
- `src/layouts/robots.txt`
- `docs/migration/RUNBOOK.md`
- `analysis/tickets/phase-3/RHI-021-hugo-config-hardening.md`
- `analysis/tickets/phase-3/INDEX.md`