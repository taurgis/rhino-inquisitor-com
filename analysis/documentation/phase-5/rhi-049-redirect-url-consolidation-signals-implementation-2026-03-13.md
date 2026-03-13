# Feature Name

RHI-049 Redirect and URL Consolidation Signals

## Change Summary

Added a dedicated Phase 5 redirect signal validation gate that emits the required redirect signal matrix and validation report, classifies which legacy URLs are Pages alias candidates versus edge-only cases, and blocks PR or deploy workflows on redirect chains, loops, or broad homepage redirects.

## Why This Changed

The repository already had migration-focused redirect checks, but they deferred most edge-sensitive cases and did not produce the Phase 5 SEO deliverables required by RHI-049. Phase 5 needs a release-facing view of redirect quality that distinguishes static alias coverage from request-aware edge requirements and records the current URL-change escalation outcome.

## Behavior Details

### Previous Behavior

- `scripts/migration/check-redirects.js` validated migration redirect integrity for selected-record and manifest scopes, but it primarily treated query-string and edge-layer rows as deferred outcomes.
- No dedicated Phase 5 redirect signal matrix or redirect validation CSV existed.
- Route-sensitive PR and deploy workflows did not block on a Phase 5 redirect signal gate.

### New Behavior

- `scripts/seo/check-redirects.js` now generates:
  - `migration/phase-5-redirect-signal-matrix.csv`
  - `migration/reports/phase-5-redirect-validation.csv`
- The matrix documents all manifest rows and resolves the effective implementation layer needed for each route class under GitHub Pages constraints.
- The validator checks all `merge` and `retire` rows for chain, loop, broad-homepage-redirect, alias-helper, and retire-not-found outcomes.
- Route-sensitive PR and deploy workflows now block on `npm run check:redirects:seo`.
- The current manifest baseline remains above the approved escalation threshold: `42.86%` (`144 / 336`), so edge redirects remain mandatory before launch.

## Impact and Verification

### Impact

- Maintainers now have an explicit Phase 5 redirect artifact pair for audit and Phase 6 handoff.
- PR and deploy workflows will now fail before release if redirect chains, loops, or broad homepage redirects appear.
- Query-string merge and retire URLs are now documented as edge-layer requirements instead of being silently treated as generic static redirects.

### Acceptance Criteria

- [x] Dedicated Phase 5 redirect matrix and validation report are generated from the current manifest and build artifact.
- [x] Route-sensitive PR and deploy workflows block on the Phase 5 redirect gate.
- [x] Current validation run reports zero chains, zero loops, and zero broad homepage redirects.

### Verification

- `npm run build:prod`
- `npm run check:url-parity`
- `npm run check:redirects:seo`
- `npm run check:metadata`
- `npm run check:seo:artifact`
- `npm run check:links`

Observed results on 2026-03-13:

- Redirect matrix rows: `1212` (`192 keep`, `140 merge`, `880 retire`)
- Redirect validation rows: `1020` (`140 merge`, `880 retire`)
- Effective implementation split: `541 edge-cdn`, `1 pages-static`, `670 none`
- Redirect validation outcomes: `0` fail, `0` chains, `0` loops, `0` broad homepage redirects

## Related Files

- `scripts/seo/check-redirects.js`
- `package.json`
- `.github/workflows/build-pr.yml`
- `.github/workflows/deploy-pages.yml`
- `migration/phase-5-redirect-signal-matrix.csv`
- `migration/reports/phase-5-redirect-validation.csv`
- `analysis/tickets/phase-5/RHI-049-redirect-url-consolidation-signals.md`

## Assumptions and Open Questions

- The matrix records the effective implementation layer required under current GitHub Pages constraints; it does not implement the edge redirect infrastructure itself.
- Optional runtime verification against a deployed host remains a future enhancement when Phase 6 edge infrastructure is in place.
