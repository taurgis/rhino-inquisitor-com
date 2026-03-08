# Senior Developer Agent and Parallel Subagent Governance - 2026-03-08

## Change summary

Added a new `Senior Developer` agent and a new instruction that permits multiple developer subagents in parallel only when feature slices are demonstrably independent and cross-agent file-awareness is explicit.

## Why this changed

The repository needed a faster implementation path for multi-feature requests without sacrificing governance controls. The new pattern preserves safety by requiring pre-validated independence, explicit coordination, and a reconciliation pass.

## Behavior details

Old behavior:
- No dedicated senior implementation-orchestration agent existed.
- No explicit rule defined when multiple developer subagents could run in parallel.
- No mandatory cross-agent notice existed to warn subagents that peers may modify related files.

New behavior:
- A `Senior Developer` agent now handles implementation decomposition and parallel-safe orchestration.
- Parallel execution is governed by a binary pass/fail rule set in `.github/instructions/parallel-developer-subagents.instructions.md`.
- Every parallel subagent prompt must include cross-agent file-awareness language.
- Integration and overlap reconciliation are required before final delivery.

## Impact

- Faster implementation throughput for independent feature slices.
- Lower coordination risk when concurrent subagents touch adjacent files.
- Improved traceability of why parallel execution was used and how overlaps were reconciled.

## Verification

- Manual verification of required sections in the new agent file (`Scope`, `Out of scope`, `Working approach`, output schema, verifiable quality rules).
- Manual verification of required sections in the new instruction file (trigger conditions, binary compliance expectations, exemptions, escalation path, precedence relationship).
- Manual link and table consistency check in `AGENTS.md`.

## Related files

- `.github/agents/senior-developer.agent.md`
- `.github/instructions/parallel-developer-subagents.instructions.md`
- `AGENTS.md`
