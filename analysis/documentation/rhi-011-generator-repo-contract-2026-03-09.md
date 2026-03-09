# RHI-011 Generator and Repo Contract - 2026-03-09

## Change summary

Closed RHI-011 by approving the Phase 2 Workstream A repo contract for Hugo project structure, configuration location, canonical `baseURL`, environment model, output artifact path, and Hugo version pin.

## Why this changed

Phase 3 scaffolding and the downstream deployment contract depend on an explicit repo contract. Leaving `baseURL` handling, environment behavior, or Hugo version pinning ambiguous would create avoidable drift between local preview, CI validation, and production deploy behavior.

## Behavior details

Old behavior:
- Workstream A described the decision space but did not close the owner choice for `baseURL` handling.
- The repo contract did not name an exact Hugo Extended version.
- The Phase 2 plan and main plan did not yet carry the finalized Workstream A contract.

New behavior:
- Root `hugo.toml` is the approved primary config file and canonical production source of truth.
- Production `baseURL` is fixed to `https://www.rhino-inquisitor.com/` with trailing slash.
- Phase 2 does not introduce `config/_default/` or `config/production/` overlays.
- Environment model is explicit:
  - `local`: `hugo server` development preview.
  - `ci`: production-semantics validation build using `hugo --environment production --gc --minify`.
  - `prod`: deploy the exact `./public/` artifact produced in CI.
- `HUGO_BASEURL` remains available only for exceptional future preview overrides; it is not part of the standard production deploy path.
- Hugo Extended `0.156.0` is the approved pin, to be implemented in CI as `HUGO_VERSION=0.156.0`.

## Impact

- Phase 3 can scaffold the repository without revisiting generator-contract decisions.
- RHI-016 now has a stable Workstream A contract for workflow and artifact decisions.
- Canonical-host handling is simpler and reviewable because production config remains rooted in committed `hugo.toml`.

## Verification

- Manual consistency check across the RHI-011 ticket, `analysis/plan/details/phase-2.md`, and `analysis/main-plan.MD`.
- Verified that the approved contract matches the repo’s Hugo skill baseline: root `hugo.toml`, canonical `baseURL`, pinned `HUGO_VERSION`, and `public/` artifact output.
- Verified the chosen version and config approach against official Hugo and GitHub Pages guidance used during the ticket review.

## Related files

- `analysis/tickets/phase-2/RHI-011-generator-repo-contract.md`
- `analysis/plan/details/phase-2.md`
- `analysis/main-plan.MD`
- `analysis/tickets/phase-2/INDEX.md`