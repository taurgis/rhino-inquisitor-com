# Agent Guide

This file is the root agent guide for the repository. It complements agent files in [.github/agents/](.github/agents/) and should stay aligned with repository instructions.

## Purpose

- Help contributors choose the right agent quickly.
- Standardize planning, analysis, testing, and documentation research flow.
- Connect agent usage to repository skills and instruction gates.

## Default Multi-Agent Workflow

For implementation requests in this repository:

1. Run Project Manager and Business Analyst for scope and requirements framing.
2. Run Tester when changes span multiple files or touch governance/quality controls.
3. Run Official Docs Researcher before technical guidance updates or technical claims.
4. Execute implementation only after the above recommendations are reconciled.

Primary governance source for this flow:
- [.github/instructions/pm-ba-subagent-research.instructions.md](.github/instructions/pm-ba-subagent-research.instructions.md)

## Available Agents

| Agent | Use When | Source File |
|---|---|---|
| Project Manager | You need sequencing, milestones, risk framing, and delivery checkpoints | [.github/agents/project-manager.agent.md](.github/agents/project-manager.agent.md) |
| Business Analyst | You need clear requirements, assumptions, acceptance criteria, and traceability | [.github/agents/business-analyst.agent.md](.github/agents/business-analyst.agent.md) |
| Tester | You need verification strategy, risk-based test coverage, and go or no-go quality advice | [.github/agents/tester.agent.md](.github/agents/tester.agent.md) |
| Hugo Specialist | You need blog or website design direction plus Hugo implementation guidance for templates, configuration, and GitHub Pages workflows | [.github/agents/hugo-specialist.agent.md](.github/agents/hugo-specialist.agent.md) |
| SEO Specialist | You need URL disposition, redirect architecture, canonical, structured data, or Search Console strategy | [.github/agents/seo-specialist.agent.md](.github/agents/seo-specialist.agent.md) |
| Official Docs Researcher | You need official-source documentation evidence for technical claims and recommendations | [.github/agents/official-docs-researcher.agent.md](.github/agents/official-docs-researcher.agent.md) |

## Skills That Support Agent Work

Domain skills are located in [.github/skills/](.github/skills/):

- [content-migration](.github/skills/content-migration/SKILL.md)
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
  - "Run Tester to build a requirement-to-test matrix and release recommendation."
- Official evidence example:
  - "Run Official Docs Researcher to validate this platform behavior from official documentation."

## Maintenance

- Update this file when adding, removing, or renaming agent definitions in [.github/agents/](.github/agents/).
- Keep workflow guidance synchronized with repository instruction files.
- Keep links relative and valid.
