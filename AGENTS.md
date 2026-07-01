# Agent Guide

This file is the root agent guide for the repository. It complements agent files in [.github/agents/](.github/agents/) and should stay aligned with repository instructions.

## Purpose

- Help contributors choose the right agent quickly.
- Connect agent usage to repository skills and instruction gates.
- Keep new article publishing safe: build, SEO, URL/redirect integrity, accessibility, and performance.

## Repository Status

- The WordPress → Hugo migration is complete. This repo is now a live Hugo blog deployed to GitHub Pages.
- Day-to-day work is authoring and publishing new articles under `src/content/` and maintaining the site.
- URL parity and redirect gates remain active permanently to protect the URLs and redirects established during migration — do not weaken them.

## Current Project Structure

```text
.
|-- .agents/
|   `-- skills/          # Canonical domain skills (shared across all agents)
|-- .github/
|   |-- agents/          # Canonical agent role definitions (source for generation)
|   |-- instructions/    # Canonical governance and quality gates (source for generation)
|   `-- workflows/       # build-pr.yml (PR gates) and deploy-pages.yml (publish)
|-- .claude/             # Generated for Claude Code (skills/, rules/generated/)
|-- .cursor/             # Generated for Cursor (agents/, rules/*.mdc)
|-- migration/           # Retained URL manifests + redirect/parity data inputs used by live gates
|-- validation/          # Retained validation inputs (expected-url-outcomes, priority-routes, sample-matrix, schema)
|-- monitoring/          # Post-launch monitoring runbook and reports
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

## Publishing Checklist

- Build: `npm run build:prod` must succeed with no errors.
- Full local deploy gate suite: `npm run gates:local` (mirrors the deploy pipeline).
- PR validation runs automatically via `.github/workflows/build-pr.yml`; publish happens on merge to `main` via `.github/workflows/deploy-pages.yml`.

## Workspace Hygiene

- Ignore incidental churn under `node_modules/` and generated output (`public/`, `resources/`) during tasks unless explicitly in scope.
