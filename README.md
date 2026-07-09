# Rhino Inquisitor

[![Deploy to GitHub Pages](https://github.com/taurgis/rhino-inquisitor-com/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/taurgis/rhino-inquisitor-com/actions/workflows/deploy-pages.yml)
[![Code License: MIT](https://img.shields.io/badge/code%20license-MIT-blue.svg)](LICENSE)
[![Content License: CC BY-NC-ND 4.0](https://img.shields.io/badge/content%20license-CC%20BY--NC--ND%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-nd/4.0/)

**[rhino-inquisitor.com](https://rhino-inquisitor.com/)** is a technical blog with articles, migration notes, and platform guidance — practical, hands-on write-ups rather than high-level opinion pieces.

This repository holds the site's source and tooling: a Hugo site deployed to GitHub Pages via GitHub Actions.

Day-to-day work here is authoring and publishing new articles while keeping SEO, URL/redirect integrity, accessibility, and performance intact.

## Repository Structure

```text
.
|-- .github/
|   |-- agents/          # Agent role definitions (Hugo Specialist, SEO Specialist)
|   |-- instructions/    # Repository governance and quality gates
|   `-- workflows/       # deploy-pages.yml (gates + publish)
|-- .agents/skills/      # Domain skills used by agents
|-- url-data/           # URL manifests and redirect/parity data read by live gates
|-- validation/          # Validation inputs and report schema
|-- monitoring/          # Site monitoring runbook and reports
|-- scripts/             # SEO, URL-parity, redirect, accessibility, and performance gate scripts
|-- src/
|   |-- content/         # Hugo content source files (articles live here)
|   |-- layouts/         # Hugo templates and partials
|   |-- static/          # Pass-through assets served by Hugo
|   |-- assets/          # Pipeline-processed assets
|   |-- data/            # Hugo data files
|   `-- archetypes/      # Hugo archetype stubs
|-- hugo.toml            # Canonical Hugo config
|-- LICENSE              # MIT license for site code/tooling
|-- SECURITY.md          # Vulnerability reporting policy
`-- README.md
```

## Key Documents

- [Agent Guide](AGENTS.md)
- [Repository Instructions](.github/instructions/)
- [Security Policy](SECURITY.md)

## Local Prerequisites

- Hugo Extended `0.163.3` (pinned; matches `HUGO_VERSION` in CI) — install with `scripts/install-hugo.sh`, which reads the CI pin and falls back to a Go-module-proxy source build when GitHub downloads are blocked (see `docs/development/hugo-local-install.md`)
- Node.js `>=22.11.0` as declared in `package.json` (CI runs Node 22)
- npm matching the active Node.js runtime

## Local Commands

- Production-style build: `hugo --minify --environment production` (or `npm run build:prod`)
- Local preview server: `npm run dev`
- Fast local build/preview without AVIF regeneration: `npm run build:local:fast` / `npm run dev:fast` (or `SKIP_AVIF_CACHE=1` on any script that runs `generate:avif-cache`) — skips the ~20–30 minute AVIF cache build; pages fall back to WebP-only `<img>` output for images without a cached AVIF variant. Use only for local verification, never for `build:prod` / deploy (see `docs/development/skip-avif-cache.md`)
- Front matter validation: `npm run validate:frontmatter`
- SEO smoke validation: `npm run check:seo`
- Security and privacy validation: `npm run check:security`
- Accessibility smoke validation: `npm run check:a11y`
- Full deploy gate suite (mirrors the publish pipeline): `npm run gates:local`
- Fast pre-push validation: `npm run preflight` — also runs automatically as a git pre-push hook (installed by `npm install` via `prepare`; bypass with `SKIP_PREFLIGHT=1 git push`)
- External-link check on staged articles: `npm run check:external-links -- --staged` — also runs automatically (with the spelling gate) as the git pre-commit hook when a commit touches `src/content/**` Markdown; a link to a domain not yet registered in `scripts/gates/external-link-domains.js` blocks the commit with instructions (bypass with `SKIP_LINK_CHECK=1 git commit`)
- Callout check on staged articles: `npm run check:callouts -- --staged` — also part of the pre-commit hook; staged articles may only use the alert types the theme styles (`[!NOTE]`/`[!TIP]`/`[!WARNING]`), with well-formed markers and no redundant bold mini-titles (bypass with `SKIP_CALLOUT_CHECK=1 git commit`)

## Publishing

- Push to `main`; `.github/workflows/deploy-pages.yml` builds and publishes to GitHub Pages after the blocking gate suite passes.
- Gates are scoped to the change: docs-only pushes skip gates and the deploy, content-only pushes run a reduced suite (url, seo, a11y), and route-sensitive pushes run the full suite.

## Follow

- Website: [rhino-inquisitor.com](https://rhino-inquisitor.com/)
- RSS feed: [rhino-inquisitor.com/index.xml](https://rhino-inquisitor.com/index.xml)

## Security

This is a static site with no server-side application or user data. See [SECURITY.md](SECURITY.md) for supported scope and how to privately report a suspected vulnerability (via GitHub's private vulnerability reporting, not a public issue).

## License

- **Code and tooling** (Hugo templates/partials, build and validation scripts, configuration under this repository) are licensed under the [MIT License](LICENSE).
- **Blog article content** under `src/content/posts/` is licensed separately under [Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)](https://creativecommons.org/licenses/by-nc-nd/4.0/). You may share and link to articles with attribution, but not modify, republish, or use them commercially without permission.

## Notes

- Use relative links for internal references.
- Keep this README current when major structure or process changes occur.
