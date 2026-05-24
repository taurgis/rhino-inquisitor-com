# Claudeignore Indexing Hygiene

## Change summary

Added a root `.claudeignore` as a conservative assistant-indexing hygiene manifest for tools that honor that file name.

## Why this changed

The repository contains large generated and local-only folders that are useful on disk but noisy for an agentic coding assistant's default context, search, or indexing workflows. The new manifest records which paths are safe to treat as low-value indexing noise while keeping authored source, governance, content, migration, monitoring, and validation artifacts visible.

## Behavior details

Old behavior:

- The repository had `.gitignore` coverage for common build outputs and local files, but no assistant-facing ignore manifest.
- Agent indexing could include generated Hugo output, dependency trees, local validation cache files, temporary evidence, logs, and local environment files depending on the assistant implementation.

New behavior:

- `.claudeignore` now excludes dependencies, generated Hugo output, local caches, coverage output, temporary workspaces, logs, local environment files, OS files, and editor-local folders.
- The file deliberately keeps `src/`, `scripts/`, `analysis/`, `docs/`, `migration/`, `monitoring/`, `validation/`, root documentation, and root configuration visible.
- Official Anthropic Claude Code documentation currently documents `.claude/settings.json` `permissions.deny` as the supported enforcement path for file discovery/search/read exclusions. This `.claudeignore` is therefore maintained as a repo convention and compatibility manifest for tools that honor it, not as a confirmed Claude Code enforcement mechanism.

## Impact

- Agent workflows should spend less default context on reproducible output and local machine artifacts.
- Migration, SEO, governance, content, validation, monitoring, and Hugo source-of-truth files remain available for normal assistant reasoning.
- Maintainers who need enforceable Claude Code exclusions should mirror the same policy into `.claude/settings.json` `permissions.deny` after an explicit owner decision.

## Verification

- Confirmed existing `.gitignore` already treats `node_modules/`, `public/`, `resources/`, `src/assets/generated-avif/`, `.hugo_build.lock`, `.DS_Store`, `.idea/`, and `.vscode/` as disposable or local-only.
- Confirmed `validation/README.md` and `monitoring/README.md` describe authoritative report contracts, so those top-level folders were not broadly ignored.
- Reviewed the final patterns to avoid broad file-type ignores such as `*.json`, `*.csv`, or `*.md` that would hide manifests, reports, plans, or governance files.
- Confirmed no owner clarification was required because mixed authoritative folders were kept visible instead of hidden.

## Related files

- [../../../.claudeignore](../../../.claudeignore)
- [../../../.gitignore](../../../.gitignore)
- [../README.md](../README.md)
