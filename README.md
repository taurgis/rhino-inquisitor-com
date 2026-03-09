# Rhino Inquisitor Migration Workspace

This repository tracks the migration of rhino-inquisitor.com from WordPress to Hugo, with deployment on GitHub Pages via GitHub Actions.

The workspace is planning-first: it contains migration phases, implementation guidance, governance rules, and the Phase 3 Hugo scaffold used by contributors and coding agents.

## Migration Goal

- Preserve existing high-value URLs where possible.
- Migrate content to Markdown and Hugo front matter with explicit URL control.
- Keep SEO-critical signals intact during and after cutover.
- Validate parity and launch readiness before DNS cutover.

## Repository Structure

```text
.
|-- .github/
|   |-- agents/          # Agent role definitions
|   |-- instructions/    # Repository governance and quality gates
|   `-- skills/          # Domain skills used by agents
|-- analysis/
|   |-- documentation/
|   |   |-- README.md    # Documentation index and placement rules
|   |   |-- TEMPLATE.md  # Feature documentation scaffold
|   |   |-- checklists/  # Reusable cross-phase checklists
|   |   |-- governance/  # Governance and agent change reports
|   |   `-- phase-*/     # Phase-specific implementation and contract docs
|   |-- main-plan.MD     # Migration master plan
|   |-- plan/
|   |   `-- details/     # Phase-by-phase implementation detail documents
|   `-- tickets/         # Task tracking artifacts
`-- README.md
|-- src/
|   |-- content/         # Hugo content source files
|   |-- layouts/         # Hugo templates and partials
|   |-- static/          # Pass-through assets served by Hugo
|   |-- assets/          # Pipeline-processed assets
|   |-- data/            # Hugo data files
|   `-- archetypes/      # Hugo archetype stubs
```

## Key Documents

- [Main Migration Plan](analysis/main-plan.MD)
- [Documentation Index](analysis/documentation/README.md)
- [Phase 1](analysis/plan/details/phase-1.md)
- [Phase 2](analysis/plan/details/phase-2.md)
- [Phase 3](analysis/plan/details/phase-3.md)
- [Phase 4](analysis/plan/details/phase-4.md)
- [Phase 5](analysis/plan/details/phase-5.md)
- [Phase 6](analysis/plan/details/phase-6.md)
- [Phase 7](analysis/plan/details/phase-7.md)
- [Phase 8](analysis/plan/details/phase-8.md)
- [Phase 9](analysis/plan/details/phase-9.md)
- [Agent Catalog](AGENTS.md)
- [Repository Instructions](.github/instructions/)
- [Repository Skills](.github/skills/)

## How To Work In This Repo

1. Start with [analysis/main-plan.MD](analysis/main-plan.MD) for scope and phase ordering.
2. Use the current phase file in [analysis/plan/details/](analysis/plan/details/) for execution details.
3. Follow applicable rules in [.github/instructions/](.github/instructions/) before editing governed paths.
4. Use [AGENTS.md](AGENTS.md) to pick the right subagent for planning, analysis, validation, or specialized research.
5. Use [analysis/documentation/README.md](analysis/documentation/README.md) to place new documentation in the right phase or category.
6. Keep documentation changes traceable and consistent with phase acceptance criteria.

## Local Prerequisites

- Hugo Extended `0.157.0` pinned by the Phase 2 repo contract
- Node.js `>=18` as declared in `package.json`
- npm matching the active Node.js runtime

## Local Commands

- Production-style build: `hugo --minify --environment production`
- Local preview server: `hugo server`
- Front matter validation: `npm run validate:frontmatter`
- Hugo source components live under `src/`, while root `hugo.toml` remains the canonical config entry point and `public/` remains the build artifact directory.
- Validation scripts are introduced across later Phase 3 tickets. Planned commands include front matter, URL parity, SEO, link, accessibility, and performance checks.

See [docs/migration/RUNBOOK.md](docs/migration/RUNBOOK.md) for the phase-linked operational runbook.

## Current State

- This repository remains planning-first, but Phase 3 now includes the root Hugo scaffold required for downstream implementation tickets.
- The repository uses a hybrid layout: Hugo is still invoked from repository root, but the actual site source components live under `src/`.
- Runtime application hardening, templates, archetypes, and CI workflows remain phase-driven and are implemented in later Phase 3 workstreams.
- Validation currently centers on documented build reproducibility, document quality, link correctness, and governance compliance.

## Notes

- Use relative links for internal references.
- Keep top-level docs concise and link to phase documents for detail.
- Update this README when major structure or process changes occur.
