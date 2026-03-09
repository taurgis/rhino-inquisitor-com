---
name: implementation-ticket
description: 'Creates and fills implementation ticket documents for tracking tasks, outcomes, and progress without Jira. Use when asked to "create a ticket", "write an implementation ticket", "track a task", "describe a work item", or "log what needs to be done". Generates structured markdown tickets with goals, acceptance criteria, and a task checklist.'
license: Forward Proprietary
compatibility: VS Code 1.x+, GitHub Copilot
---

# Implementation Ticket Skill

Generates structured implementation tickets in Markdown. Each ticket captures the problem, desired outcome, acceptance criteria, scope boundaries, risks, and a trackable task checklist — no Jira required.

## When to Use This Skill

- Creating a new ticket for a feature, bug fix, or migration task
- Capturing work that needs to be done across one or more phases
- Documenting an outcome and the steps required to reach it
- Tracking incremental progress against a defined goal
- **Not for:** full project plans (use `main-plan.MD` conventions instead)

## Quick Start

1. Copy the template from [`assets/ticket-template.md`](assets/ticket-template.md)
2. Save as `tickets/{TICKET-ID}-{short-slug}.md` (e.g. `tickets/RHI-001-url-inventory.md`)
3. Fill in every section — leave nothing as a placeholder
4. Check off tasks as work progresses

## Ticket Quality Checklist (PM Best Practices)

Before considering a ticket ready for execution, verify:

- A clear Goal explains **what** outcome is needed and **why** it matters
- Acceptance Criteria are specific, testable, and binary pass/fail
- Tasks are sequenced and small enough to execute independently
- Out of Scope clearly prevents scope creep
- Dependencies identify blockers and ordering constraints
- Risks & Mitigations include ownership and response actions
- Estimate and target date are captured (or explicitly marked `TBD`)
- Definition of Done is understood before implementation starts

## GitHub Tasklist Best Practices (Official)

When tickets are maintained in GitHub-flavored Markdown, follow these rules so checklists render and track correctly:

- Use `- [ ]` for open tasks and `- [x]` for completed tasks
- Reference issue/PR IDs in checklist items when the task maps to an existing issue or PR (for example `- [ ] #123`) so ticket context is linked
- Keep tasks small and actionable so progress is visible at a glance
- For issue hierarchy and decomposition, prefer GitHub sub-issues (Markdown tasklist blocks were retired; see the February 18, 2025 GitHub changelog entry)

## Ticket File Location

Store tickets in the `tickets/` directory at the repository root.

```
tickets/
├── RHI-001-url-inventory.md
├── RHI-002-hugo-scaffold.md
└── RHI-003-content-migration.md
```

## Ticket ID Convention

Use the prefix `RHI-` followed by a zero-padded three-digit sequence number.

| Format | Example |
|--------|---------|
| `RHI-NNN` | `RHI-001`, `RHI-042` |

Assign numbers sequentially. Never reuse a number, even for retired tickets.

## Required Sections

| Section | Purpose |
|---------|---------|
| **ID & Title** | Unique identifier and one-line summary |
| **Status** | Current state: `Open`, `In Progress`, `Blocked`, `Done` |
| **Priority** | `Critical`, `High`, `Medium`, `Low` |
| **Estimate** | Relative size (`XS`-`XL`) or story points |
| **Goal** | What we are trying to achieve and why |
| **Acceptance Criteria** | Testable conditions that prove the work is done |
| **Tasks** | Ordered checklist of concrete steps |
| **Out of Scope** | Explicit non-goals for this ticket |
| **Outcomes** | What changed as a result; filled in on completion |
| **Dependencies** | Tickets, phases, or access that must exist first |
| **Risks & Mitigations** | Delivery risks with mitigation plan and owner |
| **Definition of Done** | Completion checklist before moving to `Done` |

See [`references/FIELDS.md`](references/FIELDS.md) for detailed guidance on every field.

## Status Lifecycle

```
Open → In Progress → Done
           ↓
        Blocked → In Progress
```

Change **Status** at the top of the ticket each time state changes. Add a dated note to the **Progress Log** section when doing so.

## Filling In Outcomes

When marking a ticket `Done`, complete the **Outcomes** section with:

1. A brief summary of what was actually delivered
2. Any deviations from the original plan and why
3. Links to relevant files, PRs, or deliverables

## Examples

### Example 1: New feature ticket

```markdown
## RHI-012 · Set up Hugo project scaffold

**Status:** In Progress  
**Priority:** High  
**Estimate:** M  
**Phase:** 3

### Goal
Initialize the Hugo project so content authors can add Markdown pages and the CI pipeline can produce a static build artifact.

### Acceptance Criteria
- [ ] `hugo.toml` exists at repository root with correct base URL
- [ ] `hugo build` succeeds with zero errors
- [ ] Output artifact lands in `public/`

### Tasks
- [x] Run `hugo new site .` in repository root
- [x] Add `hugo.toml` with `baseURL`, `languageCode`, and `title`
- [ ] Create placeholder homepage at `src/content/_index.md`
- [ ] Verify CI build step runs `hugo --minify`

### Out of Scope
- Migrating production content from WordPress

### Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Hugo extended binary mismatch in CI | Medium | Medium | Pin Hugo version in CI config | Platform Team |

### Definition of Done
- [ ] Acceptance criteria verified
- [ ] Outcomes completed with links to merged artefacts
```

### Example 2: Completed ticket with outcomes

```markdown
## RHI-005 · Export WordPress URL inventory

**Status:** Done  
**Priority:** Critical  
**Phase:** 1

### Outcomes
Exported all 205 URLs from `sitemap_index.xml` into `migration/url-inventory.raw.json`.
Discovered 3 pagination routes not in sitemaps; added to manifest with `retire` disposition.
Delivered: `migration/url-inventory.raw.json`, `migration/url-manifest.json`.
```

## References

- [assets/ticket-template.md](assets/ticket-template.md) — Copy-paste blank ticket
- [references/FIELDS.md](references/FIELDS.md) — Field definitions and guidance
- [Agent Skills Specification](https://agentskills.io/specification) — official SKILL.md/frontmatter requirements and structure guidance
- [GitHub Docs: About tasklists](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/about-tasklists) — official task list syntax and behavior
- [GitHub Docs: Adding sub-issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/adding-sub-issues) — official replacement for retired tasklist blocks
- [GitHub Changelog (2025-02-18)](https://github.blog/changelog/2025-02-18-github-issues-projects-february-18th-update/) — retirement notice for tasklist blocks
- [The Scrum Guide](https://scrumguides.org/scrum-guide.html) — authoritative source for backlog refinement and Definition of Done practices
