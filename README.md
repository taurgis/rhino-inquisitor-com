# Rhino Inquisitor Migration Workspace

This repository tracks the migration of rhino-inquisitor.com from WordPress to Hugo, with deployment on GitHub Pages via GitHub Actions.

The workspace is planning-first: it contains migration phases, implementation guidance, and governance rules used by contributors and coding agents.

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
|   |-- plan/
|   |   `-- details/     # Phase-by-phase implementation detail documents
|   `-- tickets/         # Task tracking artifacts
`-- main-plan.MD         # Top-level migration plan
```

## Key Documents

- [Main Migration Plan](main-plan.MD)
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

1. Start with [main-plan.MD](main-plan.MD) for scope and phase ordering.
2. Use the current phase file in [analysis/plan/details/](analysis/plan/details/) for execution details.
3. Follow applicable rules in [.github/instructions/](.github/instructions/) before editing governed paths.
4. Use [AGENTS.md](AGENTS.md) to pick the right subagent for planning, analysis, validation, or specialized research.
5. Keep documentation changes traceable and consistent with phase acceptance criteria.

## Current State

- This repository is focused on planning and governance artifacts.
- Runtime application scaffolding and CI implementation are phase-driven and documented in plan details.
- Validation currently centers on document quality, link correctness, and governance compliance.

## Notes

- Use relative links for internal references.
- Keep top-level docs concise and link to phase documents for detail.
- Update this README when major structure or process changes occur.
