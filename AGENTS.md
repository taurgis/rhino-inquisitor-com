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
|-- .github/
|   |-- agents/          # Agent role definitions
|   |-- instructions/    # Governance and quality gates
|   `-- skills/          # Domain skills and references
|-- analysis/
|   |-- main-plan.MD     # Migration master plan
|   |-- design/          # Modernization direction, prompts, wireframes
|   |-- documentation/   # Structured phase docs, checklists, and governance reports
|   |-- plan/details/    # Phase 1-9 detailed plans
|   `-- tickets/         # Phase-indexed execution tickets
|-- migration/           # URL inventories, manifests, baselines, and sign-off evidence
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

## Default Multi-Agent Workflow

For implementation requests in this repository:

1. Run Project Manager and Business Analyst on every request unless all exemption conditions in `.github/instructions/pm-ba-subagent-research.instructions.md` are satisfied.
2. Run Senior QA Engineer when changes span multiple files or touch governance/quality controls.
3. Run Official Docs Researcher before technical guidance updates or technical claims.
4. Execute implementation only after the above recommendations are reconciled.

For analysis-closeout updates (phase plans, ticket indexes, governance docs), use the same workflow and treat phase ticket indexes as acceptance-criteria anchors.

Primary governance source for this flow:
- [.github/instructions/pm-ba-subagent-research.instructions.md](.github/instructions/pm-ba-subagent-research.instructions.md)

## Available Agents

| Agent | Use When | Source File |
|---|---|---|
| Project Manager | You need sequencing, milestones, risk framing, and delivery checkpoints | [.github/agents/project-manager.agent.md](.github/agents/project-manager.agent.md) |
| Business Analyst | You need clear requirements, assumptions, acceptance criteria, and traceability | [.github/agents/business-analyst.agent.md](.github/agents/business-analyst.agent.md) |
| Senior Developer | You need implementation decomposition, safe parallel subagent coordination, and integrated delivery across feature slices | [.github/agents/senior-developer.agent.md](.github/agents/senior-developer.agent.md) |
| Senior QA Engineer | You need verification strategy, risk-based test coverage, and go or no-go quality advice | [.github/agents/senior-qa-engineer.agent.md](.github/agents/senior-qa-engineer.agent.md) |
| Hugo Specialist | You need blog or website design direction plus Hugo implementation guidance for templates, configuration, and GitHub Pages workflows | [.github/agents/hugo-specialist.agent.md](.github/agents/hugo-specialist.agent.md) |
| SEO Specialist | You need URL disposition, redirect architecture, canonical, structured data, or Search Console strategy | [.github/agents/seo-specialist.agent.md](.github/agents/seo-specialist.agent.md) |
| Official Docs Researcher | You need official-source documentation evidence for technical claims and recommendations | [.github/agents/official-docs-researcher.agent.md](.github/agents/official-docs-researcher.agent.md) |

## Parallel Implementation Option

When a user request contains multiple independent implementation features:

1. Use `Senior Developer` to decompose work into `parallel-safe` and `sequential-only` slices.
2. Run parallel developer subagents only when independence is explicit and the user requested parallelization or explicitly accepted it in the current task.
3. Require every parallel subagent prompt to include cross-agent file-awareness (other agents may adjust related files).
4. Complete an integration pass before presenting final results.
5. Do not use parallel developer subagents for governance-heavy paths:
  - `.github/agents/**`
  - `.github/instructions/**`
  - `analysis/main-plan.MD`

Governance source:
- [.github/instructions/parallel-developer-subagents.instructions.md](.github/instructions/parallel-developer-subagents.instructions.md)


## Skills That Support Agent Work

Domain skills are located in [.github/skills/](.github/skills/):

- [content-migration](.github/skills/content-migration/SKILL.md)
- [documentation](.github/skills/documentation/SKILL.md)
- [hugo-development](.github/skills/hugo-development/SKILL.md)
- [implementation-ticket](.github/skills/implementation-ticket/SKILL.md)
- [javascript-development](.github/skills/javascript-development/SKILL.md)
- [seo-migration](.github/skills/seo-migration/SKILL.md)
- [skill-authoring](.github/skills/skill-authoring/SKILL.md)

## Instruction Sources

Instruction files live in [.github/instructions/](.github/instructions/) and define required checks, exemptions, escalation paths, and output expectations.

When instructions overlap, use the repository precedence model documented in:
- [.github/instructions/agent-governance-quality.instructions.md](.github/instructions/agent-governance-quality.instructions.md)

## Example Agent Prompts

- Project planning example:
  - "Run Project Manager to create milestones and top risks for Phase 4."
- Requirements example:
  - "Run Business Analyst to define FR and NFR acceptance criteria for this migration task."
- Verification example:
  - "Run Senior QA Engineer to build a requirement-to-test matrix and release recommendation."
- Official evidence example:
  - "Run Official Docs Researcher to validate this platform behavior from official documentation."

## Maintenance

- Update this file when adding, removing, or renaming agent definitions in [.github/agents/](.github/agents/).
- Keep workflow guidance synchronized with repository instruction files.
- Keep links relative and valid.

## Workspace Hygiene

- Ignore incidental churn under `node_modules/` during audits and implementation tasks unless dependency updates are explicitly in scope.
