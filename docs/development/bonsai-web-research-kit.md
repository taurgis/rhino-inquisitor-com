# Bonsai Web-Research Agent Kit (Salesforce Variant)

## What changed and why

Installed the Salesforce-specialized "agent kit" from [Bonsai](https://bonsai.rhino-inquisitor.com/) — a
local research-cache CLI (`@taurgis/bonsai`) — so agents ground technical claims about Salesforce
Commerce Cloud (SFCC) in cached, source-cited official documentation instead of relying on memory
or one-off web fetches. The kit was pulled with `forward-nexus` (the same tool that manages
`skills-lock.json` and the `caveman`/`caveman-compress` skills already in this repo) from
`https://github.com/taurgis/bonsai/tree/main/agents`:

```bash
npx forward-nexus add https://github.com/taurgis/bonsai/tree/main/agents \
  --instruction instructions/salesforce-research.instructions.md \
  --custom-agent agents/salesforce-docs-researcher.agent.md \
  --agent=github-copilot,claude-code,cursor
```

The kit's underlying `web-research` skill is shared by both variants, so it installs once as a
linked dependency of the instruction/custom agent rather than as a separate top-level item. The
generic (non-Salesforce) instruction and subagent were installed first, then removed in favor of
this Salesforce variant with `forward-nexus remove`.

## Old vs new behavior

- **Before:** agents verified Salesforce Commerce Cloud (and other platform/library) behavior by
  fetching pages ad hoc or from training memory, with no repo-wide rule requiring verification and
  no shared cache across sessions or agents.
- **After:**
  - A new always-on instruction (`salesforce-research`) requires agents to verify current
    official Salesforce docs before Salesforce-related technical changes, via the `web-research`
    skill inline or by delegating larger/multi-source research to the new
    `salesforce-docs-researcher` subagent.
  - The `web-research` skill teaches the cache-first workflow: `bonsai status <url> --json`,
    `bonsai <url> --format detailed --json`, `--rendered` for JS-heavy pages (needed for
    Salesforce's JavaScript-only Help and Developer docs), and `bonsai import --stdin` for
    manually gathered notes.
  - The `salesforce-docs-researcher` subagent isolates verbose fetch output from the main agent
    context, uses Bonsai's Salesforce site modules for rendered fetch/extraction, and returns
    source-cited findings.
  - These are wired into the same generated-file pattern already used for `hugo-specialist` and
    `seo-specialist`: canonical source in `.github/`, generated copies for Claude Code and Cursor.

## Impact and verification

Impacted components: `.github/instructions/`, `.github/agents/`, `.agents/skills/`,
`.claude/skills/`, `.claude/agents/`, `.claude/rules/generated/`, `.cursor/agents/`,
`.cursor/rules/`, and `skills-lock.json`.

To verify:

1. `npx forward-nexus doctor` — lockfile and install health check.
2. `npx forward-nexus list` — confirms `web-research` (skill), the `salesforce-research`
   instruction, and `salesforce-docs-researcher` (custom agent) are tracked, and that no generic
   `web-research`/`official-docs-researcher` instruction or custom agent remain.
3. In Claude Code, `/web-research` is available as a skill and `salesforce-docs-researcher` as a
   subagent (visible via the Agent tool's agent-type list).
4. Ask an agent to research an official Salesforce Commerce Cloud doc page with a known URL and
   confirm it runs `bonsai <url> --format detailed` (or delegates to
   `salesforce-docs-researcher`) instead of an ad hoc fetch.

Regenerating the Claude Code/Cursor files also refreshed unrelated stale references in generated
files that already existed before this change (`.claude/rules/generated/*.md`,
`.cursor/rules/*.mdc`, `.claude/agents/hugo-specialist.md`, `.cursor/agents/hugo-specialist.md`):
the old `.github/skills/hugo-development/SKILL.md` path became
`.agents/skills/hugo-development/SKILL.md`, and the old `https://www.rhino-inquisitor.com/`
baseURL became `https://rhino-inquisitor.com/`, matching the canonical
`.github/instructions/*.instructions.md` sources they were already out of sync with.

## Related files

- `.github/instructions/salesforce-research.instructions.md`
- `.github/agents/salesforce-docs-researcher.agent.md`
- `.agents/skills/web-research/SKILL.md`
- `.claude/skills/web-research/SKILL.md`
- `.claude/agents/salesforce-docs-researcher.md`
- `.claude/rules/generated/salesforce-research.md`
- `.cursor/agents/salesforce-docs-researcher.md`
- `.cursor/rules/salesforce-research.mdc`
- `skills-lock.json`
