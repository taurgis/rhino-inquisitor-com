---
description: 'Require Official Docs Researcher before repo changes'
applyTo: '**'
---

# Repository Research Requirement

## Mandatory Pre-Step
- Always run the subagent **Official Docs Researcher** before creating, updating, refactoring, scaffolding, or deleting technical guidance artifacts in the repository.
- Run the subagent before audits when the audit is intended to produce technical recommendations that may influence repository changes.
- This includes updates to `.github/agents/**`, `.github/instructions/**`, `.github/skills/**`, workflows, prompts, docs, and implementation guidance files.
- Use its findings to incorporate the most current official documentation and online references in the change.

## When not to Use
- When no technical content is being modified (for example, spelling or grammar fixes only).
- When the task is read-only and no repository files are modified.
- When official documentation has already been incorporated in the current task and no new technical claims are introduced.

## Examples
- ✅ Run **Official Docs Researcher** before editing instructions, prompts, agents, skills, workflows, collections, or docs.
- ✅ Include relevant official doc links when the change references platform behavior or standards.
- ✅ Re-run the subagent if scope expands to a new platform or tool not covered by the initial research pass.
- ❌ Do not modify content in those directories without running the subagent first.

## Escalation Path

If official documentation is unavailable, conflicting, or insufficient for a technical claim:

1. Escalate to the user with the unresolved claim and risk.
2. Mark the claim as an assumption instead of a fact.
3. Recommend the safest implementation path until authoritative guidance is found.
