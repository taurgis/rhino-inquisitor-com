# Ticket Owner Clarification Instruction - 2026-03-08

## Change summary

Added a new governance instruction that requires agents to ask the user for owner-level clarifications before or during ticket implementation whenever decisions are unresolved.

## Why this changed

Ticket execution previously allowed room for assumption-based decisions when owner intent was not explicit. The repository needs a clear gate that routes all owner questions to the user and prevents completion on unresolved decision points.

## Behavior details

Old behavior:
- Owner clarification during ticket work was implicit and not enforced by a dedicated instruction.
- Agents could proceed with inferred owner intent when acceptance criteria were ambiguous.
- Ownership language in tickets could imply separate owners.

New behavior:
- A dedicated instruction now defines explicit trigger conditions for owner clarification questions.
- The user is defined as the sole owner for all owner-level decisions.
- Agents must ask blocking questions before or during implementation and cannot mark work complete until answers are resolved.
- Exemptions and escalation rules are now explicit for fully specified or non-behavioral tasks.

## Impact

- Reduces rework caused by assumption-driven implementation.
- Improves traceability from ticket ambiguity to user decision.
- Standardizes ownership handling across all ticket execution flows.
- Lowers risk of silent scope drift when multiple implementation paths are possible.

## Verification

- Manual review confirms instruction file includes trigger conditions, required action, binary compliance, exemptions, and escalation path.
- Cross-check confirms the instruction references existing precedence and PM/BA governance files.
- File naming and frontmatter follow existing `.instructions.md` repository conventions.

## Related files

- .github/instructions/ticket-owner-clarification.instructions.md
