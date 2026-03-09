# RHI-003 URL Invariant Policy Implementation - 2026-03-08

## Change summary
Started implementation of RHI-003 by creating a draft policy artifact in migration/url-class-matrix.json and updating the ticket with live-site probe evidence, draft policy decisions, and unresolved blockers.

## Why this changed
RHI-004 classification is blocked until canonical host, trailing slash, case, query-parameter, and canonical-tag rules are defined in one normative source with implementation-layer mapping.

## Behavior details
Old behavior:
- No committed URL invariant policy artifact existed in migration/.
- RHI-003 remained Open with placeholder probe tasks and no recorded live evidence.
- Phase 1 index showed RHI-003 as Open despite RHI-002 completion.

New behavior:
- migration/url-class-matrix.json now exists as the normative draft for host, slash, case, query, and canonical decisions.
- The matrix includes implementation-layer assignments (pages-static, edge-cdn, dns, none), class defaults, observed probe outcomes, and explicit Phase 2 blockers.
- RHI-003 tracking is moved to In Progress and includes concrete probe findings.

## Impact
- Unblocks RHI-003 from planning to evidence-backed execution.
- Gives RHI-004 a stable draft policy input while approvals are pending.
- Makes unresolved policy gaps auditable as explicit Phase 2 blockers instead of implicit assumptions.

## Verification
- Live probe checks were run for:
  - apex vs www host behavior
  - slash vs no-slash variants
  - mixed-case variants
  - tracking/query parameter variants
  - canonical tag extraction from representative URLs
- JSON artifact syntax is valid and committed as a machine-readable draft policy source.
- Ticket acceptance checklist and task list were updated to reflect completed vs pending work.

## Related files
- analysis/tickets/phase-1/RHI-003-url-invariant-policy.md
- analysis/tickets/phase-1/INDEX.md
- migration/url-class-matrix.json
