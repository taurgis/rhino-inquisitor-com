---
description: 'Enforce Hugo coding standards for all changes to layouts, templates, partials, archetypes, hugo.toml, and GitHub Pages deployment workflows'
applyTo: 'layouts/**,archetypes/**,hugo.toml,.github/workflows/deploy*.yml'
---

# Hugo Coding Standards

## Mandatory Pre-Step

Consult the `hugo-development` skill before authoring or reviewing any file matched by `applyTo`.

## Configuration Standards (`hugo.toml`)

1. `baseURL` must be `"https://www.rhino-inquisitor.com/"` — protocol, www, trailing slash. Never change without full URL parity re-run.
2. `[outputs]` section must be explicit — never rely on undocumented Hugo defaults for sitemap, RSS, or robots output.
3. Production builds must never pass `--buildDrafts`, `--buildFuture`, or `--buildExpired`.
4. Hugo version must be pinned in CI (`HUGO_VERSION` env var, not `latest`).
5. `[taxonomies]` keys must match front matter field names exactly (`category`/`categories` mismatch breaks term pages).
6. Any change to `[permalinks]` or `[taxonomies]` requires an immediate URL parity check run before merge.

## Template and Partial Standards

1. **All SEO meta generation must live in `layouts/partials/seo/`** — never duplicate canonical, OG, or schema logic in individual templates.
2. `baseof.html` defines named blocks (`head`, `main`, `scripts`). Leaf templates extend it — no standalone HTML boilerplate in `single.html` or `list.html`.
3. Use `.Permalink` (not `.URL` or `.RelPermalink`) when generating absolute canonical or OG URLs.
4. All string values in `<script type="application/ld+json">` blocks must be piped through Hugo's `jsonify` function.
5. Use `partialCached` for partials that do not depend on page-level context (e.g., site-level JSON-LD).
6. Template conditional guards must use explicit type checks: `{{ if eq .Type "posts" }}` — not implicit `.IsPage` where ambiguous.

## Front Matter Standards

1. `url` is mandatory on every migrated content file. Hugo does not sanitize it — values must be pre-validated.
2. `url` format: lowercase, starts with `/`, ends with `/`, `a-z 0-9 - /` only.
3. `aliases` values must originate from `migration/url-manifest.json` — no arbitrary alias creation.
4. `canonical` front matter override must be absolute HTTPS `https://www.rhino-inquisitor.com/...` only.
5. `draft: true` must be set on all non-published content — never infer from absence.

## GitHub Pages Workflow Standards

1. Workflow permissions must include `pages: write` and `id-token: write` — no broader permissions.
2. `concurrency.cancel-in-progress` must be `false` for the deploy job — never cancel a Pages deploy in progress.
3. Deployment must use the official triple: `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages`.
4. Artifact path must be `./public` (Hugo default output directory).
5. No symbolic links in the `public/` output — GitHub Pages rejects them silently.
6. Custom domain is configured via repository Settings → Pages — do not treat a committed `CNAME` file as the authoritative source for Actions-based publishing.
7. Build step must run `hugo --minify --environment production`.

## Naming and Structure Conventions

| Asset type | Location | Naming |
|-----------|----------|--------|
| SEO partials | `layouts/partials/seo/` | `head-meta.html`, `open-graph.html`, `json-ld-article.html` |
| Section templates | `layouts/_default/` | `single.html`, `list.html`, `baseof.html` |
| Content type templates | `layouts/{type}/` | `single.html` for type-specific overrides |
| Archetypes | `archetypes/` | `posts.md`, `pages.md` |
| Hugo config | repository root | `hugo.toml` |
| Build output | `public/` | Excluded from source control |

## Validation Step Required

After any layout or config change:
1. Run `hugo --minify --environment production` and verify zero build errors.
2. For URL/routing changes: run `npm run check:url-parity` and verify zero failures.
3. For sitemap changes: run `grep -c "<loc>" public/sitemap.xml` and compare count to expected URL inventory.
4. For structured data changes: test with [Google Rich Results Test](https://search.google.com/test/rich-results).

## When This Is Not Required

- Markdown body content edits with no front matter changes
- Static asset changes (`static/images/`, CSS, fonts) with no template implications
- Documentation changes in `plan/` or `docs/` directories

## References

- `.github/skills/hugo-development/SKILL.md` — Full Hugo guidance
- `.github/skills/hugo-development/references/URL-STRATEGY.md` — URL/alias rules
- `.github/skills/hugo-development/references/TEMPLATE-PATTERNS.md` — Partial architecture and code patterns
- `.github/skills/hugo-development/assets/hugo-toml-template.toml` — Config baseline
- `plan/details/phase-3.md` — Scaffold requirements and workstream checklists
