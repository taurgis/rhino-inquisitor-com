# Implementation Ticket Template

Copy this file to `tickets/{TICKET-ID}-{short-slug}.md` and fill in every section.

---

## {TICKET-ID} · {One-line title summarising the work}

**Status:** Open  
**Priority:** {Critical | High | Medium | Low}  
**Estimate:** {XS | S | M | L | XL or story points}  
**Phase:** {Phase number from main-plan.MD, e.g. 1}  
**Assigned to:** {Name or team — leave blank if unassigned}  
**Target date:** {YYYY-MM-DD or TBD}  
**Created:** {YYYY-MM-DD}  
**Updated:** {YYYY-MM-DD}

---

### Goal

> What are we trying to achieve, and why does it matter?

{Describe the problem or opportunity this ticket addresses. Include relevant context, such as which phase of the migration it belongs to and what downstream work depends on it.}

---

### Acceptance Criteria

> Testable conditions. Every item must be verifiable before marking the ticket Done.

- [ ] {Condition 1 — specific, observable, and unambiguous}
- [ ] {Condition 2}
- [ ] {Condition 3}

---

### Tasks

> Ordered checklist of concrete steps. Check off each item as it is completed.
> In GitHub, optionally reference issue/PR IDs in a task item (for example `- [ ] #123`) for linked tracking.

- [ ] {Step 1}
- [ ] {Step 2}
- [ ] {Step 3}
- [ ] {Step 4}

---

### Out of Scope

> Explicitly state what this ticket will not do. Helps prevent scope creep.

- {Not included item 1}
- {Not included item 2}

---

### Dependencies

> Other tickets, phases, access grants, or external factors that must be resolved before or alongside this work.

| Dependency | Type | Status |
|------------|------|--------|
| {RHI-NNN or description} | {Ticket \| Access \| Phase \| Tool} | {Pending \| Ready \| Blocked} |

---

### Risks & Mitigations

> Capture likely delivery risks and a planned response for each.

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| {Short risk statement} | {Low \| Medium \| High} | {Low \| Medium \| High} | {How we reduce or respond} | {Name or team} |

---

### Definition of Done

> Must be fully checked before status can move to `Done`.

- [ ] All acceptance criteria are satisfied and verified
- [ ] Tasks are complete or intentionally descoped with rationale
- [ ] Dependencies and blockers are resolved or documented
- [ ] Outcomes section is completed with delivered artefacts and deviations

---

### Outcomes

> Fill in when the ticket reaches Done. Summarise what was delivered, any deviations from the plan, and links to produced artefacts.

{Leave blank until work is complete.}

**Delivered artefacts:**

- {File, PR, or link}

**Deviations from plan:**

- {None, or describe what changed and why}

---

### Progress Log

> Dated notes on status changes and significant decisions. Add a new entry each time the ticket status changes or a key decision is made.

| Date | Status | Note |
|------|--------|------|
| {YYYY-MM-DD} | Open | Ticket created |

---

### Notes

> Anything else relevant: constraints, open questions, references, decisions deferred.

{Optional free-form notes.}
