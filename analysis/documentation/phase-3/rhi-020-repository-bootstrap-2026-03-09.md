# RHI-020 Repository Bootstrap - 2026-03-09

## Change summary

Added the initial Hugo repository scaffold required by Phase 3 Workstream A, including the root `hugo.toml`, tracked Hugo source directories under `src/`, updated ignore rules, root README command guidance, and the migration runbook stub.

## Why this changed

RHI-020 is the structural gate for the rest of Phase 3. Downstream workstreams cannot safely harden configuration, add archetypes, build templates, or wire CI until the repository has a deterministic Hugo baseline that can build from a documented command.

## Behavior details

Old behavior:
- The repository was planning-first only at the root and did not contain the Hugo source directory scaffold.
- No root `hugo.toml` existed.
- The README described planning artifacts but did not document Hugo prerequisites or local Hugo commands.
- No migration runbook existed under `docs/migration/`.

New behavior:
- The repository now contains the minimal Phase 3 Hugo source scaffold under `src/`: `src/content/`, `src/layouts/`, `src/static/`, `src/assets/`, `src/data/`, and `src/archetypes/`.
- Root `hugo.toml` now exists with the approved production `baseURL`, `languageCode`, and site title stub.
- Root `hugo.toml` explicitly maps Hugo component directories to the `src/` tree while keeping `public/` at repository root.
- `.gitignore` now excludes Hugo build output and common local/editor artifacts.
- The README now documents the Hugo and Node prerequisites plus the production build and local preview commands.
- `docs/migration/RUNBOOK.md` now exists with phase-linked operational headings and initial Phase 3 execution notes.

## Impact

- Unblocks RHI-021 and the remaining Phase 3 implementation tickets.
- Establishes a reproducible local Hugo build baseline without replacing the planning-first repository structure.
- Gives maintainers a single root config entry point and a concise operational handoff reference.

## Verification

- Run `hugo --minify --environment production` from the repository root and confirm exit code `0`.
- Run `hugo server` from the repository root when local preview work begins.
- Confirm generated `public/` and `resources/` outputs remain untracked because of `.gitignore`.
- Confirm a clean working-copy simulation with only documented prerequisites can run the production build command.

## Related files

- `hugo.toml`
- `src/content/.gitkeep`
- `src/layouts/.gitkeep`
- `src/static/.gitkeep`
- `src/assets/.gitkeep`
- `src/data/.gitkeep`
- `src/archetypes/.gitkeep`
- `.gitignore`
- `README.md`
- `docs/migration/RUNBOOK.md`
- `analysis/tickets/phase-3/RHI-020-repository-bootstrap.md`
- `analysis/tickets/phase-3/INDEX.md`