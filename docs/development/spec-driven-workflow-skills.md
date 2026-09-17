# Spec-Driven Workflow Skills (mattpocock/skills)

## What changed and why

Multi-session work on this repo had no durable place to keep the reasoning behind a change: a plan lived in one agent conversation and was lost when the context window rolled over. The [spec-driven workflow](https://www.aihero.dev/skills-to-spec) from `mattpocock/skills` closes that gap by writing the decisions down between phases.

All 25 skills from that repository are now installed via Forward Nexus, plus the `forward-nexus` skill itself from `Forward-Services-NV/forward-nexus-projects`. The workflow chain is:

```text
grill-with-docs → to-spec → to-tickets → implement → code-review
```

- `grill-with-docs` — interview that pressure-tests a plan against the codebase and official docs
- `wayfinder` — maps work too large for one session; a finished map feeds `/to-spec #<map_issue>`
- `to-spec` — synthesises the current conversation into a spec on the issue tracker (no interview)
- `to-tickets` — splits a spec into context-window-sized tracer-bullet tickets
- `implement` — builds a ticket or spec; delegates to `tdd` and `code-review`
- `ask-matt` — router when it is unclear which skill fits
- `setup-matt-pocock-skills` — one-time repo configuration (issue tracker, triage labels, domain glossary)

Single-session work skips the spec: `grill-with-docs → implement`.

The full set was installed rather than only the five chain skills because `ask-matt` routes across all of them and the chain skills reference `domain-modeling`, `triage`, `improve-codebase-architecture`, `tdd`, `handoff`, and `codebase-design` by name. A partial install leaves those references dangling.

Installed for three agents: Claude Code (`.claude/skills/` symlinks), GitHub Copilot and Cursor (both read `.agents/skills/`). Sources live in `.agents/skills/`; version policy is `minor`.

## Old vs new behavior

- **Before:** `.agents/skills/` held 24 content, SEO, and frontend skills. Planning happened inside a single agent conversation with no artefact, and `.cursor/rules/skill-maintenance.mdc` was present without a matching `.github/instructions/` source file — a stale rule Cursor still loaded.
- **After:** `.agents/skills/` holds 50 skills; 44 are symlinked into `.claude/skills/`. Spec, tickets, and review artefacts are written to the issue tracker instead of living only in chat. `forward-nexus sync` removed the orphaned `.cursor/rules/skill-maintenance.mdc`, so the eight Cursor rules again match the eight instruction files one-for-one.
- **Configured:** `/setup-matt-pocock-skills` has since been run. It wrote `docs/agents/issue-tracker.md` (GitHub Issues in `taurgis/rhino-inquisitor-com` via the `gh` CLI, PRs-as-request-surface off because PRs are disabled here), `docs/agents/triage-labels.md` (the five canonical labels used verbatim), and `docs/agents/domain.md` (single-context), and added an `## Agent skills` section to `AGENTS.md` pointing at all three. `to-spec`, `to-tickets`, `wayfinder`, `triage`, and `code-review` read these files and no longer prompt for setup.
- **Still lazy:** `CONTEXT.md` and `docs/adr/` do not exist. `/domain-modeling` creates them when a term or decision actually needs recording; the skills proceed silently without them. Of the five triage labels only `wontfix` exists on GitHub today — `/triage` creates the rest on first use.

## Impact and verification

Impacted: agent skill discovery for Claude Code, GitHub Copilot, and Cursor; `skills-lock.json`; `.cursor/rules/`. No Hugo build, content, or CI behaviour changes — these files are agent configuration only.

One gate changed: `.markdownlint-cli2.jsonc` now ignores `.agents/skills/**/*.md`, because the vendored `SKILL.md` files trip MD033/MD029/MD040 and lint-fixing them would drift from upstream. See `docs/publishing/deploy-gate-matrix.md` for the full rationale.

To verify:

1. `npx forward-nexus list` — shows the 25 `mattpocock/skills` entries and `forward-nexus`, each targeting Claude Code, GitHub Copilot, and Cursor.
2. `npx forward-nexus sync` — reports `synced` for every tracked skill and no drift. Three pre-existing `taurgis/bonsai` items report `pull` (upstream updates available, unrelated to this change); `caveman` and `caveman-compress` report `unsupported` because they predate the current lockfile format.
3. `ls .cursor/rules/ .github/instructions/` — eight files each, with matching basenames.
4. `grep -A2 '### Issue tracker' AGENTS.md` — resolves to `docs/agents/issue-tracker.md`; `gh issue list` succeeds, confirming the tracker the skills will write to.
5. `npm run preflight` — unchanged; confirms no build or gate regression.

## Related files

- `skills-lock.json` (tracking and version policy for every installed item)
- `.agents/skills/` (skill sources, one directory per skill)
- `.claude/skills/` (symlinks into `.agents/skills/`)
- `.cursor/rules/skill-maintenance.mdc` (removed)
- `.markdownlint-cli2.jsonc` (ignore entry for vendored skills)
- `docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md`, `docs/agents/domain.md` (written by `/setup-matt-pocock-skills`)
- `AGENTS.md` (`## Agent skills` section)
