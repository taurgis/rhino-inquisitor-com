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

## Publishing Checklist

- Build: `npm run build:prod` must succeed with no errors.
- Full local deploy gate suite: `npm run gates:local` (mirrors the deploy pipeline).
- Fast checks run automatically on `git push` via the pre-push hook (`npm run preflight`); see `docs/development/local-preflight.md`.
- Commits that stage `src/content/**` Markdown run the spelling and external-link gates via the pre-commit hook; a new external domain must be registered in `scripts/gates/external-link-domains.js` before it can be committed (see the external-link gate section in `docs/publishing/deploy-gate-matrix.md`).
- PRs are disabled for this repository; validation and publish both happen on push to `main` via `.github/workflows/deploy-pages.yml` (scoped blocking gate suite, then deploy).

## Workspace Hygiene

- Ignore incidental churn under `node_modules/` and generated output (`public/`, `resources/`) during tasks unless explicitly in scope.
