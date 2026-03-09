---
description: 'Require Hugo Specialist subagent for design and Hugo expert requests'
applyTo: '**'
---

# Hugo Specialist Subagent Requirement

## Mandatory Pre-Step

Before implementation work, evaluate whether the request needs expert guidance on website design or Hugo implementation.

## Trigger Conditions

Run the **Hugo Specialist** subagent when any of the following is true:

1. The request asks for website design direction, layout strategy, information architecture, component patterns, wireframes, or responsive behavior recommendations.
2. The request asks for Hugo-specific implementation or troubleshooting guidance, including templates/partials/archetypes, `hugo.toml`, permalinks, taxonomies, sitemap/RSS/robots behavior, or GitHub Pages Hugo deployment workflow behavior.
3. The request requires trade-off advice across design quality, Hugo implementation effort, and production safety.

## Required Action

When a trigger condition is met:

1. Run the **Hugo Specialist** subagent before writing or editing implementation artifacts.
2. Use the subagent output to shape implementation decisions and validation steps.
3. Include subagent evidence in the final response.

## Relationship to Other Governance Instructions

This instruction is additive and does not replace existing governance requirements.

1. Continue to follow `.github/instructions/pm-ba-subagent-research.instructions.md` for PM/BA/Senior QA Engineer/Official Docs requirements.
2. Continue to follow `.github/instructions/hugo-coding-standards.instructions.md`, `.github/instructions/seo-compliance.instructions.md`, and `.github/instructions/ci-workflow-standards.instructions.md` when their `applyTo` scopes are matched.
3. If advice conflicts, apply repository precedence and safety rules from `.github/instructions/agent-governance-quality.instructions.md`.

## Binary Compliance Expectations

This requirement passes only if one of the following is true:

1. Trigger conditions are not met and the response states that Hugo Specialist was not required.
2. Trigger conditions are met and:
   - Hugo Specialist was invoked, and
   - Its output was used in the recommendation or implementation plan, and
   - The final response includes subagent evidence.

## When This Is Not Required

Skip Hugo Specialist invocation when all of the following are true:

1. The task is purely editorial (spelling, grammar, formatting, broken link fixes) with no design or Hugo behavior implications.
2. The task is read-only research or file discovery with no implementation recommendation requested.
3. The task does not ask for design guidance and does not involve Hugo-specific decisions.

## Escalation Path

If it is unclear whether a request requires Hugo Specialist, or if subagent outputs conflict materially with other required guidance:

1. Escalate to the user with the exact ambiguity or conflict.
2. Provide the safest feasible fallback recommendation and label assumptions.
3. Do not present unresolved conflicts as confirmed conclusions.

## References

- `.github/agents/hugo-specialist.agent.md`
- `.github/instructions/pm-ba-subagent-research.instructions.md`
- `.github/instructions/agent-governance-quality.instructions.md`