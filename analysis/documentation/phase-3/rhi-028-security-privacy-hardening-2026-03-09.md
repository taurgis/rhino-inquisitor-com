# RHI-028 Security and Privacy Hardening - 2026-03-09

## Change summary

Added the Phase 3 security and privacy baseline for the GitHub Pages scaffold, including a repo-owned `check:security` command, a control matrix in `docs/migration/SECURITY-CONTROLS.md`, and runbook and README updates that make the baseline repeatable.

## Why this changed

Phase 3 needed an honest security posture before CI and deployment work continues. Without an explicit matrix, the scaffold could imply that header-based controls such as CSP or HSTS already exist when they do not, and without a repeatable verification command, draft leakage or artifact exposure could regress silently.

## Behavior details

Old behavior:

- The repository had no repo-owned command that checked for mixed-content regressions, artifact leakage into `public/`, or draft-route exclusion.
- Security and privacy expectations existed only in the RHI-028 ticket and Phase 3 plan, not in an operator-facing control matrix.
- Analytics policy was implicit because the scaffold shipped no analytics, but no baseline document recorded that the decision was intentionally deferred.

New behavior:

- `package.json` now exposes `npm run check:security`, backed by `scripts/check-security.js`.
- `scripts/check-security.js` verifies four conditions against the built artifact: no unexpected `http://` references in repo-owned templates or static files, no `http://` `href`/`src`/`action` attributes in generated HTML, no external runtime `<script src>` references in built output, and no blocked repo artifacts or Markdown sources under `public/`.
- The same check also validates that any `draft: true` content file stays out of both `public/` and `public/sitemap.xml`.
- `docs/migration/SECURITY-CONTROLS.md` now records the current control matrix, owner assignments, deferred analytics decision, and the distinction between scaffold-deliverable controls and edge-required controls.
- `docs/migration/RUNBOOK.md` and `README.md` now document the security verification flow so the baseline is discoverable outside the ticket.

## Impact

- Phase 3 now has a repo-owned security/privacy gate that can be reused in RHI-029 CI work instead of re-running ad hoc manual checks.
- The migration owner and engineering owner have one current source of truth for which controls are live today and which controls still depend on a later edge layer.
- Analytics remains intentionally out of the Phase 3 scaffold until the later monitoring workstream defines the tool, consent model, and staging suppression behavior.

## Verification

- Run `hugo --cleanDestinationDir --minify --environment production`.
- Run `npm run check:security`.
- Review `docs/migration/SECURITY-CONTROLS.md` for owner assignments and `implemented` versus `edge-required` versus `deferred` labels.
- For a manual draft spot check, add a temporary `draft: true` fixture, rebuild with the clean production command, confirm the route is absent from `public/` and `public/sitemap.xml`, then remove the fixture.

Observed results on 2026-03-09:

- `hugo --cleanDestinationDir --minify --environment production` passed.
- The generated artifact contained no `http://` `href`, `src`, or `action` attributes.
- The scaffold contained no external runtime `<script src>` references.
- `public/` contained no blocked migration or repository artifacts and no `.md` source files.
- A temporary `draft: true` fixture page was excluded from both `public/` and `public/sitemap.xml`.

## Related files

- `package.json`
- `scripts/check-security.js`
- `docs/migration/SECURITY-CONTROLS.md`
- `docs/migration/RUNBOOK.md`
- `README.md`
- `analysis/tickets/phase-3/RHI-028-security-privacy-hardening.md`