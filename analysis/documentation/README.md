# Documentation Index

This directory holds structured analysis documentation for the migration project.

## Layout

| Location | Use for |
|----------|---------|
| `analysis/documentation/TEMPLATE.md` | Shared feature-documentation scaffold |
| `analysis/documentation/checklists/` | Reusable cross-phase checklists and operational guides |
| `analysis/documentation/governance/` | Repository process, agent, instruction, and policy change reports |
| `analysis/documentation/phase-1/` | Phase 1 implementation, kickoff, and sign-off docs |
| `analysis/documentation/phase-2/` | Phase 2 contracts and implementation docs |
| `analysis/documentation/phase-3/` | Phase 3 kickoff, bootstrap, implementation, and sign-off docs |
| `analysis/documentation/phase-4/` | Phase 4 migration-planning, source-policy, and sign-off docs |
| `analysis/documentation/phase-7/` | Phase 7 deployment workflow, cutover-readiness, and validation docs |

## Placement Rules

1. Put phase-specific implementation, kickoff, contract, and sign-off docs in the matching `phase-N/` directory.
2. Put reusable checklists and shared operational guidance in `checklists/`.
3. Put repository governance, agent, instruction, and policy change reports in `governance/`.
4. Keep `TEMPLATE.md` and this index at the root so contributors can find the structure quickly.
5. If a clear new category is needed, create it under `analysis/documentation/` and update this index in the same change.

## Current Entry Points

- [Template](TEMPLATE.md)
- [Checklists](checklists/)
- [Governance docs](governance/)
- [Phase 1 docs](phase-1/)
- [Phase 2 docs](phase-2/)
- [Phase 3 docs](phase-3/)
- [Phase 4 docs](phase-4/)
- [Phase 7 docs](phase-7/)

## Naming Conventions

- Preserve established filenames such as `rhi-###-...` and date-stamped suffixes.
- Use phase folders for scope; do not encode the phase twice in a new naming pattern beyond existing filenames.
- Keep one document focused on one feature, contract, report, or tightly related change set.

## Related Guidance

- [.github/instructions/documentation-updates.instructions.md](../../.github/instructions/documentation-updates.instructions.md)
- [.github/skills/documentation/SKILL.md](../../.github/skills/documentation/SKILL.md)
- [AGENTS.md](../../AGENTS.md)