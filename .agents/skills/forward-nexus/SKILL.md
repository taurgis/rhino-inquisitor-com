---
name: forward-nexus
description: 'Manage AI skills, instructions, and agents across projects using the Forward Nexus CLI. Use when adding or removing skills, pulling skill updates from the registry, generating IDE files for Claude Code and Cursor, diagnosing sync issues, or authoring new skills for the registry.'
metadata:
  version: '1.0.0'
---

# Forward Nexus

Forward Nexus is the CLI tool that manages AI skills across FastForward projects. It installs skills into `.agents/skills/`, generates IDE-specific files for Claude Code and Cursor, and keeps everything version-pinned in `skills-lock.json`.

## When to Use This Skill

- Adding or removing a skill from a project
- Pulling the latest skill versions from the registry
- Regenerating `.claude/` or `.cursor/` files after a branch switch
- Diagnosing sync drift between the registry and local skill files
- Authoring a new skill and publishing it to the registry
- Migrating a project from the legacy `.github/skills/` pattern

## Core Concepts

### `skills-lock.json`

The lock file records every installed skill with its source branch, version, hash, and install path. Treat it the same way as `package-lock.json`: commit it, and run `npm run sync:nexus` after pulling changes that touch it.

```json
{
  "version": 4,
  "skills": {
    "commit-message-writing": {
      "source": "Forward-Services-NV/forward-nexus-projects",
      "ref": "categories/fastforward-bm-accelerator",
      "installVersion": "1.0.0",
      "installPath": ".agents/skills/commit-message-writing"
    }
  }
}
```

### Install paths

| Path | Purpose |
| --- | --- |
| `.agents/skills/<name>/` | Source of truth — full skill content |
| `.claude/skills/<name>` | Symlink → `.agents/skills/<name>` (Claude Code reads this) |
| `.claude/rules/generated/` | Instruction Markdown files for Claude Code |
| `.claude/agents/` | Agent Markdown files for Claude Code |
| `.cursor/rules/` | Instruction `.mdc` files for Cursor |
| `.cursor/agents/` | Agent files for Cursor |

## Daily Workflow

### Pull the latest skill updates

```bash
npm run sync:nexus
# expands to: npx forward-nexus update && npx forward-nexus sync --pull -y
```

Run this after cloning, after switching branches that change `skills-lock.json`, or whenever you want the latest registry versions.

### Check for available updates without applying them

```bash
npx forward-nexus update --dry-run
```

### Regenerate IDE files only (no version check)

```bash
npx forward-nexus sync --pull -y
```

Useful when `.claude/` or `.cursor/` files are missing after a hard reset or worktree switch.

## Managing Skills

### Add a skill to a project

```bash
npx forward-nexus add Forward-Services-NV/forward-nexus-projects --skill <skill-name>
```

Nexus clones the registry, finds the skill, installs it to `.agents/skills/`, updates `skills-lock.json`, and generates IDE files.

```bash
# Examples
npx forward-nexus add Forward-Services-NV/forward-nexus-projects --skill commit-message-writing
npx forward-nexus add Forward-Services-NV/forward-nexus-projects --skill bm-testing-jest -y
```

### Add a skill from a specific branch

By default Nexus uses the `main` branch. Append `#<branch>` or `#<tag>` to the repo string to pin a different ref:

```bash
# Install from a feature or release branch
npx forward-nexus add Forward-Services-NV/forward-nexus-projects#categories/fastforward-bm-accelerator --skill commit-message-writing

# Install from a tag (stable, shareable release boundary)
npx forward-nexus add Forward-Services-NV/forward-nexus-projects#v1.2.0 --skill commit-message-writing

# Works the same for local source repos
npx forward-nexus add /path/to/forward-nexus-projects#my-feature-branch --skill my-skill
```

The installed entry in `skills-lock.json` records the `ref` so future `sync` commands know where to pull updates from:

```json
{
  "skills": {
    "commit-message-writing": {
      "source": "Forward-Services-NV/forward-nexus-projects",
      "ref": "categories/fastforward-bm-accelerator",
      "installVersion": "1.0.0",
      "installPath": ".agents/skills/commit-message-writing"
    }
  }
}
```

### Add multiple skills at once

```bash
npx forward-nexus add Forward-Services-NV/forward-nexus-projects --skill bm-testing-jest --skill commit-message-writing -y
```

### Add a standalone instruction file

Instructions are Markdown files (`.instructions.md`) installed into `.claude/rules/generated/` for Claude Code and `.cursor/rules/` for Cursor:

```bash
npx forward-nexus add Forward-Services-NV/forward-nexus-projects --instruction apex-best-practices
npx forward-nexus add Forward-Services-NV/forward-nexus-projects --instruction lwc-best-practices -y

# From a specific branch
npx forward-nexus add Forward-Services-NV/forward-nexus-projects#my-branch --instruction apex-best-practices
```

### Add a custom agent

Custom agents are Markdown files (`.agent.md`) installed into `.claude/agents/` for Claude Code and `.cursor/agents/` for Cursor:

```bash
npx forward-nexus add Forward-Services-NV/forward-nexus-projects --custom-agent apex-architect
npx forward-nexus add Forward-Services-NV/forward-nexus-projects --custom-agent senior-quality-engineer -y

# From a specific branch
npx forward-nexus add Forward-Services-NV/forward-nexus-projects#my-branch --custom-agent apex-architect
```

### Preview what a registry exposes before installing

```bash
npx forward-nexus add Forward-Services-NV/forward-nexus-projects --list
npx forward-nexus add . --list   # same, against a local checkout
```

### Dry-run any install (no files written)

```bash
npx forward-nexus add Forward-Services-NV/forward-nexus-projects --skill commit-message-writing -y --dry-run
npx forward-nexus add Forward-Services-NV/forward-nexus-projects --instruction apex-best-practices -y --dry-run
npx forward-nexus add Forward-Services-NV/forward-nexus-projects --custom-agent apex-architect -y --dry-run
```

### Remove a skill

```bash
npx forward-nexus remove <skill-name> -y
```

Removes the install directory, the IDE symlinks/files, and the entry from `skills-lock.json`.

### List installed skills

```bash
npx forward-nexus list
npx forward-nexus ls -a claude-code   # filter by IDE
```

### Search the registry

```bash
npx forward-nexus find bm
npx forward-nexus find --json         # machine-readable
```

## Sync and Drift

### Check sync status

```bash
npx forward-nexus sync
```

Reports each skill as one of:
- `synced` — local matches registry
- `local-only` — skill exists locally but not in registry
- `upstream-only` — registry has a skill not installed locally
- `diverged` — both sides changed; requires manual resolution
- `version-conflict` — registry version exceeds the tracked policy

### Pull upstream-only changes

```bash
npx forward-nexus sync --pull -y
```

### Push local changes to the registry as a PR

```bash
npx forward-nexus sync --push
```

### Diagnose environment and lock file issues

```bash
npx forward-nexus doctor
```

## Restoring from Lock File

After cloning a repo or when `.agents/skills/` is missing:

```bash
npx forward-nexus experimental_install -y
```

This reads `skills-lock.json` and reinstalls every pinned skill without fetching updates. Follow with `npx forward-nexus sync --pull -y` to also regenerate IDE files.

## Authoring a New Skill

### Scaffold a skill

```bash
npx forward-nexus init my-skill
```

Creates `my-skill/SKILL.md` with the required frontmatter skeleton.

### Required frontmatter

```yaml
---
name: my-skill
description: 'What this skill does AND when an agent should activate it.'
metadata:
  version: '1.0.0'
---
```

### Skill directory layout

```
skills/my-skill/
├── SKILL.md          # Required: instructions + frontmatter
├── references/       # Optional: additional Markdown docs loaded on demand
├── examples/         # Optional: concrete code or usage samples
├── templates/        # Optional: starter files for the agent to modify
├── scripts/          # Optional: executable helpers
└── assets/           # Optional: static resources (schemas, data files)
```

Publish by committing the folder to the appropriate branch of `Forward-Services-NV/forward-nexus-projects` and opening a PR.

## Migrating from `.github/skills/`

For projects still using the legacy flat-file pattern, see the migration guide at `docs/migrations/bm-starter-kit-nexus-skills-migration.md` in `fastforward-bm-lib`. The short version:

1. Add `"sync:nexus": "npx forward-nexus update && npx forward-nexus sync --pull -y"` to `package.json`.
2. Place a `skills-lock.json` (copy from a migrated project and trim to needed skills).
3. Run `npx forward-nexus experimental_install -y`.
4. Run `npx forward-nexus sync --pull -y`.
5. Delete `.github/skills/`.
6. Commit `skills-lock.json`, `.agents/skills/`, `.claude/`, `.cursor/`.

## Reference

| Command | What it does |
| --- | --- |
| `npx forward-nexus update` | Check registry for newer versions and update `skills-lock.json` |
| `npx forward-nexus sync --pull -y` | Apply registry-only changes and regenerate IDE files |
| `npx forward-nexus add <repo> --skill <name>` | Install a skill and add it to `skills-lock.json` |
| `npx forward-nexus add <repo>#<branch> --skill <name>` | Install a skill from a specific branch or tag |
| `npx forward-nexus add <repo> --instruction <name>` | Install a standalone instruction file |
| `npx forward-nexus add <repo> --custom-agent <name>` | Install a custom agent |
| `npx forward-nexus add <repo> --list` | Preview all installable items in the registry |
| `npx forward-nexus add <repo> ... --dry-run` | Preview an install without writing any files |
| `npx forward-nexus remove <skill> -y` | Remove a skill from install path and lock file |
| `npx forward-nexus list` | List all installed skills in the current project |
| `npx forward-nexus find <query>` | Search the registry interactively |
| `npx forward-nexus experimental_install -y` | Restore all skills from `skills-lock.json` |
| `npx forward-nexus doctor` | Diagnose auth, environment, and lock file health |
| `npx forward-nexus init <name>` | Scaffold a new skill skeleton |
| `npx forward-nexus sync --push` | Create a PR to push local skill changes upstream |
| `npm run sync:nexus` | Project shorthand: `update` then `sync --pull -y` |
