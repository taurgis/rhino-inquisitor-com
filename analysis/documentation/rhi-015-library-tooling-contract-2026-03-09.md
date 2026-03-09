# RHI-015 Library and Tooling Contract Update - 2026-03-09

## Change summary

Locked the Workstream E tooling contract for Phase 3 and Phase 4, including exact package pins for newly approved libraries, the HTTP-client decision for future scripts, optional-tool deferrals, and recorded security evidence.

## Why this changed

Phase 3 scaffold and validation work needs a bounded dependency set before `package.json` changes begin. Leaving Workstream E open would allow dependency churn, inconsistent HTTP-client usage, and unreviewed optional tools to leak into implementation.

## Behavior details

### Previous Behavior

- Workstream E listed candidate tooling but did not lock exact package versions.
- `undici` versus Node native `fetch` remained unresolved for future scripts.
- HTML DOM parser and output-minification decisions were still open.
- Phase 2 planning artifacts still treated RHI-015 as incomplete.

### New Behavior

- Exact pins are approved for `turndown`, `@joplin/turndown-plugin-gfm`, and `gray-matter`, alongside the retained Phase 1 baseline tooling already present in the repo.
- New Phase 3+ scripts standardize on Node native `fetch` under the repo Node `>=18` baseline; existing Phase 1 `undici` usage is grandfathered but not expanded.
- HTML DOM parser and output-minification tooling remain deferred behind explicit Phase 4 trigger conditions.
- Phase 2 ticket tracking and the Workstream E contract in the phase plan now mark RHI-015 complete.

## Impact

- Maintainers have an explicit dependency contract for upcoming Phase 3 `package.json` work.
- Conversion and validation scripts now have one preferred HTTP-client direction for new work.
- Optional tooling stays out of scope until there is evidence-based need rather than speculative package growth.
- Security evidence exists for the newly approved and deferred candidate packages reviewed in this ticket.

## Verification

- Reviewed current repo dependency baseline in `package.json`.
- Reviewed Phase 1 and Phase 2 plan sections for shared tooling requirements.
- Queried npm for current exact versions of approved and deferred candidate packages.
- Ran `npm audit --json` in a disposable temp manifest for `turndown`, `@joplin/turndown-plugin-gfm`, `gray-matter`, `node-html-parser`, `cheerio`, and `html-minifier-terser`; result: `0` known vulnerabilities.
- Verified ticket and phase index status updates align with the updated Workstream E contract.

## Related files

- analysis/tickets/phase-2/RHI-015-library-tooling-contract.md
- analysis/plan/details/phase-2.md
- analysis/tickets/phase-2/INDEX.md

## Assumptions and open questions

- Exact Node version pinning in CI remains owned by Phase 3 workflow work and RHI-016; this update only locks the Node `>=18` contract needed for native `fetch`.
- If early conversion QA shows repeated DOM cleanup failures beyond `turndown` plus the GFM plugin, a Phase 4 follow-up decision will be required to choose `node-html-parser` or `cheerio`.