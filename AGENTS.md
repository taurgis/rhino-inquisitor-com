# Agent Guide

This file is the root agent guide for the repository. It complements agent files in [.github/agents/](.github/agents/) and should stay aligned with repository instructions.

## Purpose

- Help contributors choose the right agent quickly.
- Connect agent usage to repository skills and instruction gates.
- Keep new article publishing safe: build, SEO, URL/redirect integrity, accessibility, and performance.

## Repository Status

- This is a live Hugo blog deployed to GitHub Pages.
- Day-to-day work is authoring and publishing new articles under `src/content/` and maintaining the site.
- URL parity and redirect gates are active permanently to protect existing URLs, redirects, and canonical signals — do not weaken them.

## Current Project Structure

```text
.
|-- .agents/
|   `-- skills/          # Canonical domain skills (shared across all agents)
|-- .github/
|   |-- agents/          # Canonical agent role definitions (source for generation)
|   |-- instructions/    # Canonical governance and quality gates (source for generation)
|   `-- workflows/       # deploy-pages.yml (gates + publish)
|-- .claude/             # Generated for Claude Code (skills/, rules/generated/)
|-- .cursor/             # Generated for Cursor (agents/, rules/*.mdc)
|-- url-data/           # URL manifests + redirect/parity data inputs used by live gates
|-- validation/          # Retained validation inputs (expected-url-outcomes, priority-routes, sample-matrix, schema)
|-- monitoring/          # Site monitoring runbook and reports
|-- src/                 # Hugo site source tree (content, layouts, static, assets, data, archetypes)
|-- scripts/             # SEO, URL-parity, redirect, accessibility, and performance gate scripts
|-- hugo.toml            # Hugo configuration
|-- package.json         # Scripts and tooling dependencies
`-- README.md
```

## Available Agents

- [Hugo Specialist](.github/agents/hugo-specialist.agent.md) — site design, information architecture, templates, Hugo config, GitHub Pages workflow.
- [SEO Specialist](.github/agents/seo-specialist.agent.md) — URL/redirect integrity, canonical strategy, structured data, sitemap/robots, Search Console.

## Instruction Gates

Governance and quality gates live in [.github/instructions/](.github/instructions/): `hugo-coding-standards`, `seo-compliance`, `content-quality`, `ci-workflow-standards`, `post-writing-skills`, `documentation-updates`, `skill-maintenance`, and `agent-governance-quality`.

## Local Hugo Setup

- If `hugo` is not on `PATH`, run `scripts/install-hugo.sh` first — it installs the pinned Hugo Extended version (read from `HUGO_VERSION` in `.github/workflows/deploy-pages.yml`, so local always matches CI).
- In sandboxed agent environments where GitHub release downloads are blocked, the script automatically falls back to building Hugo from source via the Go module proxy (needs Go and a C compiler; takes a few minutes).
- Do not skip local build verification because Hugo is missing — install it with this script instead. Details: `docs/development/hugo-local-install.md`.
- `build:local`, `build:prod`, and `dev` all regenerate the AVIF image cache (`generate:avif-cache`) before running Hugo, which can take ~20–30 minutes on a cold or invalidated cache in this sandbox. For quick local verification of template/content/CSS changes, use `npm run build:local:fast` or `npm run dev:fast` (or set `SKIP_AVIF_CACHE=1` on any script that runs `generate:avif-cache`) to skip AVIF regeneration — pages fall back to WebP-only `<img>` output with no build error. Never use the skip for `build:prod`, `check:seo`, `check:perf`, `check:security`, `check:a11y`, or anything feeding the deploy pipeline; those must build with the real AVIF cache. Details: `docs/development/skip-avif-cache.md`.

## Publishing Checklist

- Build: `npm run build:prod` must succeed with no errors.
- Full local deploy gate suite: `npm run gates:local` (mirrors the deploy pipeline).
- Fast checks run automatically on `git push` via the pre-push hook (`npm run preflight`); see `docs/development/local-preflight.md`.
- Commits that stage `src/content/**` Markdown run the callout, when-published, spelling, and external-link gates via the pre-commit hook; callouts must use the theme-styled alert types (`[!NOTE]`/`[!TIP]`/`[!WARNING]`, no redundant bold mini-titles), `when-published` shortcode targets must match a real content `url` (see `docs/publishing/when-published-shortcode.md`), and a new external domain must be registered in `scripts/gates/external-link-domains.js` before it can be committed (see the gate sections in `docs/publishing/deploy-gate-matrix.md`).
- PRs are disabled for this repository; validation and publish both happen on push to `main` via `.github/workflows/deploy-pages.yml` (scoped blocking gate suite, then deploy).

## Workspace Hygiene

- Ignore incidental churn under `node_modules/` and generated output (`public/`, `resources/`) during tasks unless explicitly in scope.
