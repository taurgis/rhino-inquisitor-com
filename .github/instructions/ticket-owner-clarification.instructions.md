---
description: 'Require direct user-owner clarification when ticket decisions are unresolved during implementation'
applyTo: '**'
---

# Ticket Owner Clarification Gate

## Purpose

Prevent assumption-driven implementation when ticket work needs owner decisions. In this repository, the user is always the full owner for all decision points.

## Mandatory Pre-Step

Before implementation, review the ticket, acceptance criteria, and linked artifacts to determine whether any decision is unresolved.

## Trigger Conditions

Apply this instruction when any of the following is true:

1. The ticket or linked artifacts contain explicit open questions, placeholders, or TBD items.
2. Acceptance criteria conflict or are ambiguous enough to support multiple valid implementations.
3. Implementation requires selecting between options with different behavioral, quality, or risk outcomes.
4. A required input artifact is missing and the missing information changes implementation behavior.
5. New unresolved decisions are discovered during implementation.

## Required Action

When trigger conditions are met:

1. Ask the user the blocking question before or during implementation, with concise context and clear answer options.
2. Batch related questions together when practical to reduce interruption overhead.
3. Continue only independent, non-blocked work while awaiting clarification.
4. Do not mark the task complete until all blocking owner questions are answered.
5. Apply the user's answers exactly; if an answer invalidates prior work, reconcile and document the correction.

## Single-Owner Rule

All owner-level questions route to the user. Do not invent or defer to separate owners such as product owner, engineering owner, or migration owner.

## Binary Compliance Expectations

This requirement passes only if one of the following is true:

1. Trigger conditions are not met and the response explicitly states no owner clarification was required.
2. Trigger conditions are met and all are true:
   - Blocking questions were asked to the user.
   - The user provided answers.
   - Implementation and completion status reflect those answers.
   - Remaining assumptions or unresolved blockers are explicitly called out.

## Relationship to Other Governance Instructions

This instruction is additive and does not replace existing governance requirements.

1. `.github/instructions/pm-ba-subagent-research.instructions.md` remains mandatory when its triggers are met.
2. PM and BA research identifies gaps; this instruction governs how unresolved owner decisions are handled during implementation.
3. If an overlap or conflict exists, apply precedence from `.github/instructions/agent-governance-quality.instructions.md` and choose the safer interpretation.

## When This Is Not Required

Skip this instruction when all are true:

1. The task is fully specified with unambiguous acceptance criteria.
2. No owner-level decision is open.
3. The work is purely editorial or read-only with no behavior change.
4. No scope, risk, or trade-off decision is needed to complete the task.

## Escalation Path

If required user clarification is unavailable or incomplete:

1. List the exact blocking question(s) and why each blocks completion.
2. Provide the safest feasible partial progress and clearly mark assumptions.
3. Do not present blocked work as complete.
4. Request user confirmation to proceed after answers are provided.

## Examples

- Pass: "Decision required: Should unresolved URL class `attachment` map to keep or retire for this ticket?"
- Pass: "No owner clarification required; acceptance criteria were complete and unambiguous."
- Fail: Implementing a redirect strategy based on guessed owner intent without asking the user.
