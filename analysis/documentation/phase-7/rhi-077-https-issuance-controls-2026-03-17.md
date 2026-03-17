# RHI-077 — HTTPS Issuance And Security Controls

**Date:** 2026-03-17  
**Phase:** 7  
**Ticket:** RHI-077

## Change Summary

Added a dedicated mixed-content gate for generated Hugo output, wired it into the GitHub Pages deploy workflow as a blocking pre-upload check, and created the staging HTTPS checklist artifact used to track live certificate and enforcement evidence.

## Why This Changed

RHI-077 required a concrete release gate for insecure `http://` resource references and an operational artifact to record staging HTTPS readiness. The repository already had broad security checks, but it did not have the dedicated Phase 7 gate and checklist that WS-D and WS-F depend on.

## Behavior Details

### Old Behavior

- The deploy workflow did not run a dedicated `check:mixed-content` command before artifact upload.
- RHI-077 pointed to two different checklist filenames (`phase-7-https-checklist.md` and `phase-7-https-staging-checklist.md`), creating traceability drift.
- There was no committed Phase 7 staging HTTPS checklist artifact with current CAA, redirect, route, and browser mixed-content evidence.

### New Behavior

- `scripts/phase-7/check-mixed-content.js` scans generated `public/**/*.html` and `public/**/*.css` output for `http://` resource references in HTML resource attributes, inline styles, style blocks, and built CSS.
- `.github/workflows/deploy-pages.yml` now runs `npm run check:mixed-content` as a blocking step before artifact upload.
- Phase 7 references now use `migration/phase-7-https-staging-checklist.md` consistently for the WS-D checklist artifact.
- The new checklist records current staging CAA results, effective HTTP-to-HTTPS behavior, representative route checks, browser mixed-content results, and the final owner-confirmed HTTPS closeout evidence.

## Impact

- Affects the GitHub Pages deployment workflow, local validation commands, and Phase 7 ticket traceability.
- Gives WS-D a dedicated gate that WS-F can depend on without relying on broader security checks.
- Keeps the ticket traceable by distinguishing repo-validated controls from owner-confirmed live GitHub Pages HTTPS evidence.

## Verification

1. Run `hugo --cleanDestinationDir --gc --minify --environment production`.
2. Run `npm run check:mixed-content` and confirm it exits `0` on the current artifact.
3. Confirm the deploy workflow contains the mixed-content step before `actions/upload-pages-artifact`.
4. Confirm `migration/phase-7-https-staging-checklist.md` contains the current CAA, redirect, route, and browser mixed-content evidence plus the remaining closeout items.
5. Confirm Phase 7 ticket references use the staging checklist filename consistently.

## Related Files

- `.github/workflows/deploy-pages.yml`
- `package.json`
- `scripts/phase-7/check-mixed-content.js`
- `migration/phase-7-https-staging-checklist.md`
- `analysis/tickets/phase-7/RHI-077-https-issuance-security-controls.md`
- `analysis/tickets/phase-7/INDEX.md`
- `analysis/tickets/INDEX.md`
- `analysis/tickets/phase-7/RHI-080-launch-window-execution-runbook.md`