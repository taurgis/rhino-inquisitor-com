# RHI-013 Route and Redirect Contract - 2026-03-09

## Change summary

Closed RHI-013 by approving the Phase 2 Workstream C route and redirect contract, correcting feed endpoint dispositions in the URL manifest, creating the pagination-priority manifest scaffold, and locking the current edge-redirect threshold verdict.

## Why this changed

Phase 3 scaffold work cannot safely proceed until public route shapes, legacy endpoint behavior, redirect semantics, and pagination-governance rules are explicit. Leaving those decisions open would push irreversible URL policy choices into implementation tickets and create avoidable SEO, feed-continuity, and redirect-chain risk.

## Behavior details

Old behavior:
- Workstream C was still open, with unresolved ambiguity around tag routes, `/feed/`, feed variants, and the URL-change threshold verdict.
- `migration/url-manifest.json` incorrectly retired `/feed/` despite the approved Phase 2 plan requiring it to resolve.
- `/feed/rss/` and `/feed/atom/` had no explicit manifest records.
- The pagination-priority manifest schema was described in planning artifacts but no scaffold file existed.
- Edge redirect infrastructure was only conditionally described; the current manifest baseline had not been evaluated against the approved 5 percent threshold.

New behavior:
- Canonical public route policy is locked to `https://www.rhino-inquisitor.com/`, trailing slashes, and lowercase route output.
- `/video/` remains a preserved page route and is explicitly distinct from `/category/video/`.
- Tag archives are omitted from the approved public Phase 3 route contract; legacy `/tag/*` routes remain retired unless an explicit later exception is approved.
- Hugo `aliases` are approved only as Pages-only fallback behavior and are explicitly documented as client-side HTML meta-refresh output, not origin-level `301` or `308` redirects.
- The approved threshold formula was executed against the current manifest baseline and produced `39.1%` (`131 / 335`), so edge redirect infrastructure is now mandatory before launch.
- `/feed/` is preserved as the canonical feed route, while `/feed/rss/` and `/feed/atom/` now merge directly to `/feed/`.
- `migration/pagination-priority-manifest.json` now exists as a schema scaffold (`[]`), and population is assigned to the migration engineer before URL parity gate implementation.
- Current manifest baseline was checked for redirect chains; zero merge-chain violations were found.

## Impact

- Phase 3 can scaffold route config, taxonomy behavior, feed continuity, and redirect handling against a stable contract.
- Phase 4 and Phase 6 tickets now have an approved source of truth for feed endpoint outcomes, tag-route retirement, and one-hop redirect expectations.
- The project now has an explicit pre-launch dependency on edge redirect infrastructure because the threshold trigger is already met.
- RHI-018 signoff tracking can treat the RHI-013 route/redirect prerequisites as complete.

## Verification

- Manually reviewed the RHI-013 ticket, `analysis/plan/details/phase-2.md`, and dependent signoff/index files for consistency.
- Verified current manifest evidence from `migration/url-manifest.json`:
  - `indexed_urls = 335`
  - `changed_indexed_urls = 131`
  - `change_rate = 39.1%`
  - zero merge-chain violations
  - `/feed/rss/` and `/feed/atom/` were missing before this update
- Confirmed `/video/` and `/category/video/` remain separate preserved routes in the manifest.
- Cross-checked the approved alias/redirect wording against official Hugo, GitHub Pages, and Google Search documentation.

## Related files

- `analysis/tickets/phase-2/RHI-013-route-redirect-contract.md`
- `analysis/plan/details/phase-2.md`
- `migration/url-manifest.json`
- `migration/pagination-priority-manifest.json`
- `analysis/tickets/phase-2/INDEX.md`
- `analysis/tickets/INDEX.md`
- `analysis/tickets/phase-2/RHI-018-phase-2-signoff.md`