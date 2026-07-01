# Agent Guide

This file is the root agent guide for the repository. It complements agent files in [.github/agents/](.github/agents/) and should stay aligned with repository instructions.

## Purpose

- Help contributors choose the right agent quickly.
- Standardize planning, analysis, testing, and documentation research flow.
- Connect agent usage to repository skills and instruction gates.
- Support analysis-phase closeout and implementation handoff decisions.

## Repository Status

- Analysis artifacts are in place and the project is finishing the analysis phase.
- Current work is focused on analysis sign-off quality, evidence traceability, and implementation readiness.
- Use phase detail and ticket indexes under `analysis/` as the source of truth for sequencing and acceptance criteria.

## Current Project Structure

```text
.
|-- .agents/
|   |-- skills/          # Canonical domain skills (shared across all agents)
|   `-- rules/           # Generated instruction rules for universal agents (codex, antigravity, ...)
|-- .github/
|   |-- agents/          # Canonical agent role definitions (source for generation)
|   `-- instructions/    # Canonical governance and quality gates (source for generation)
|-- .claude/             # Generated for Claude Code (skills/, agents/, rules/generated/)
|-- .cursor/             # Generated for Cursor (agents/, rules/*.mdc)
|-- analysis/
|   |-- main-plan.MD     # Migration master plan
|   |-- design/          # Modernization direction, prompts, wireframes
|   |-- documentation/   # Structured phase docs, checklists, and governance reports
|   |-- plan/details/    # Phase 1-9 detailed plans
|   `-- tickets/         # Phase-indexed execution tickets
|-- migration/           # URL inventories, manifests, baselines, and sign-off evidence
|-- src/                 # Hugo site source tree (content, layouts, static, assets, data, archetypes)
|-- scripts/             # Utility scripts for crawl, sitemap, performance, and SEO work
|-- tmp/                 # Working evidence, Search Console exports, DNS checks, and WP source data
|-- package.json         # Workspace package manifest
|-- package-lock.json    # Locked dependency tree for workspace tooling
`-- README.md
```

## Analysis Artifacts To Consult First

- Master plan: [analysis/main-plan.MD](analysis/main-plan.MD)
- Documentation index: [analysis/documentation/README.md](analysis/documentation/README.md)
- Phase sequencing: [analysis/plan/details/](analysis/plan/details/)
- Phase work tracking: [analysis/tickets/INDEX.md](analysis/tickets/INDEX.md)
- Design direction: [analysis/design/blog-modernization-designs-2026-03-08.md](analysis/design/blog-modernization-designs-2026-03-08.md)
- Low-fi wireframes: [analysis/design/low-fi-wireframes-2026-03-08.md](analysis/design/low-fi-wireframes-2026-03-08.md)
- Design prompt packs: [analysis/design/design-prompts/README.md](analysis/design/design-prompts/README.md)
- Generated design examples guidance: [analysis/design/generated-images/design-examples/README.md](analysis/design/generated-images/design-examples/README.md)
- UI implementation checklist: [analysis/documentation/checklists/ui-implementation-checklist-2026-03-08.md](analysis/documentation/checklists/ui-implementation-checklist-2026-03-08.md)

## Supporting Execution Artifacts

- Migration baselines and manifests: [migration/](migration/)
- Validation and discovery scripts: [scripts/](scripts/)
- Temporary evidence, exports, and source snapshots: [tmp/](tmp/)

## Workspace Hygiene

- Ignore incidental churn under `node_modules/` during audits and implementation tasks unless dependency updates are explicitly in scope.
