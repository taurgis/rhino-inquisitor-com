# Implementation Ticket Field Reference

Detailed guidance for every field in the implementation ticket template.

---

## Header Fields

### TICKET-ID

Format: `RHI-NNN` (e.g. `RHI-001`).

- Use the `RHI-` prefix for all rhino-inquisitor tickets.
- Numbers are assigned sequentially and never reused.
- Zero-pad to three digits: `RHI-001`, not `RHI-1`.

### Title

A single sentence that tells a reader exactly what the ticket delivers.

| ❌ Vague | ✅ Specific |
|---------|-----------|
| Do the URL work | Export and classify all live URLs from WordPress sitemap |
| Hugo stuff | Initialise Hugo project with `hugo.toml` and placeholder homepage |

### Status

| Value | Meaning |
|-------|---------|
| `Open` | Ticket created; work has not started |
| `In Progress` | Work is actively underway |
| `Blocked` | Work cannot proceed; see Dependencies or Progress Log |
| `Done` | All Acceptance Criteria met; Outcomes section filled in |

Update Status every time it changes and add a corresponding entry to the Progress Log.

### Priority

| Value | When to use |
|-------|-------------|
| `Critical` | Blocks multiple other tickets or phases; must be resolved immediately |
| `High` | Significant impact; should be resolved in the current work cycle |
| `Medium` | Important but not urgent; schedule in the next cycle |
| `Low` | Nice to have; pick up when higher-priority work allows |

### Estimate

Use one sizing system consistently across the project:

- **T-shirt sizing**: `XS`, `S`, `M`, `L`, `XL`
- **Story points**: e.g. `1`, `2`, `3`, `5`, `8`

Do not mix both systems in the same board. Estimates support planning, not certainty. Re-estimate when scope materially changes.

### Phase

Reference the phase number from `main-plan.MD` (e.g. `1` for Phase 1: Baseline and URL Inventory). A ticket may span multiple phases; list them as `3, 4`.

### Target date

Use `YYYY-MM-DD` when there is a delivery commitment or coordination point. Use `TBD` only when sequencing is not yet known.

---

## Goal

Write 2–5 sentences answering:

1. **What** needs to be done?
2. **Why** does it matter for the migration?
3. **Who** benefits or depends on this output?

Avoid listing steps here — that belongs in **Tasks**.

---

## Acceptance Criteria

Each criterion must be:

- **Specific** — names a concrete artefact, state, or measurement
- **Verifiable** — can be checked by someone other than the author
- **Binary** — either passes or fails; no partial credit

For quality checks, follow the INVEST principle where possible: independent, valuable, estimable, small, and testable.

### Good examples

- [ ] `migration/url-inventory.raw.json` exists and contains at least 150 entries
- [ ] `hugo build` exits with code 0 and produces output in `public/`
- [ ] Every URL in `url-manifest.json` has a non-empty `disposition` field

### Bad examples

- [ ] The work looks good *(not verifiable)*
- [ ] Hugo is set up *(too vague)*

---

## Tasks

Break the goal into the smallest independently completable steps. Sequence them so each step produces something the next step can use.

Use nested checkboxes for sub-tasks when a step has multiple parts:

```markdown
- [ ] Parse all sitemap files
  - [ ] `post-sitemap.xml`
  - [ ] `page-sitemap.xml`
  - [ ] `category-sitemap.xml`
```

Check off each item as it is completed. Do not delete unchecked items; leave them visible so progress is clear at a glance.

---

## Out of Scope

List explicit non-goals to keep execution focused.

Examples:

- “Does not migrate historical blog comments”
- “Does not redesign content templates”

If new requests appear that fall in this section, create a follow-up ticket instead of silently expanding scope.

---

## Dependencies

List everything that must exist or be resolved before this ticket can be completed.

| Type | Example |
|------|---------|
| Ticket | `RHI-001` must be `Done` before this starts |
| Access | Search Console read access must be granted |
| Phase | Phase 1 sign-off required before Phase 2 work begins |
| Tool | `fast-xml-parser` must be installed (`npm install`) |

If a dependency is blocked, set the ticket Status to `Blocked` and describe the blocker in the Progress Log.

---

## Risks & Mitigations

Track delivery risks that could jeopardize schedule, quality, or scope.

For each risk:

1. State the risk clearly (what might happen)
2. Rate likelihood and impact (`Low`/`Medium`/`High`)
3. Define a mitigation action
4. Assign an owner for monitoring and response

Keep this section current when risks change.

---

## Definition of Done

A ticket is `Done` only when all of the following are true:

1. Acceptance criteria are verified
2. Remaining unchecked tasks are documented as descoped (if any)
3. Dependencies/blockers are resolved or explicitly documented
4. Outcomes section is completed with artefacts and deviations

This is separate from acceptance criteria: acceptance criteria validate deliverable behavior; Definition of Done validates completion discipline.

---

## Outcomes

Filled in **only when** the ticket reaches `Done`.

Describe:

1. **What was delivered** — artefacts produced, changes made
2. **Deviations** — anything that differs from the original plan and the reason why
3. **Links** — file paths, PR numbers, or external references

If the ticket is closed without completing all tasks (e.g. scope reduced), document which tasks were dropped and why.

---

## Progress Log

A chronological audit trail. Add one row per status change or key decision.

```markdown
| Date       | Status      | Note                                      |
|------------|-------------|-------------------------------------------|
| 2026-03-07 | Open        | Ticket created                            |
| 2026-03-09 | In Progress | Started sitemap harvest                   |
| 2026-03-10 | Blocked     | Awaiting Search Console access            |
| 2026-03-12 | In Progress | Access granted; resuming workstream 1     |
| 2026-03-14 | Done        | All deliverables merged to main           |
```

Never delete rows. This log is the single source of truth for when and why decisions were made.

---

## Notes

Free-form space for:

- Open questions that need an answer before or during work
- Decisions deferred to a later ticket
- Useful references or external links
- Constraints or risks discovered during execution
