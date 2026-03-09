# RHI-014 SEO and Discoverability Contract - 2026-03-09

## Change summary

Closed RHI-014 by approving the Phase 2 Workstream D SEO and discoverability contract, including the template-type obligation matrix, named SEO partial contracts, sitemap policy, and the production `robots.txt` approach.

## Why this changed

Phase 3 template implementation could not proceed safely while metadata rules, schema selection, sitemap behavior, and robots policy remained partly optional or contradictory. Leaving those decisions open would have pushed core SEO behavior into implementation-time guesswork and created avoidable canonical, indexability, and structured-data regressions.

## Behavior details

Old behavior:
- Workstream D was still open and only partially described in the ticket and Phase 2 plan.
- The article schema choice (`BlogPosting` vs. `Article`) was unresolved.
- The `robots.txt` delivery mechanism was still open between Hugo template output and a static file.
- Tag-page handling and Twitter-card strictness were ambiguous.
- Alias-helper sitemap exclusion was written as an expectation without a verified implementation rule.

New behavior:
- Article/post pages now use `BlogPosting` as the approved schema default.
- Production `robots.txt` is locked to Hugo output using `enableRobotsTXT = true` and a repo-owned `src/layouts/robots.txt` template.
- Tag pages remain retired and non-indexable by default, aligned with RHI-013.
- Twitter card tags remain in scope but are explicitly best-effort and non-blocking; Open Graph remains the blocking social-preview baseline.
- Non-indexable built pages must be explicitly excluded from sitemap output; alias-helper exclusion is a verified Phase 3 implementation requirement rather than an assumed Hugo default.
- The contract now fixes the template matrix, metadata fallback order, named partial responsibilities, and staging/preview noindex behavior.

## Impact

- Phase 3 can implement SEO partials and template behavior against a stable contract instead of reopening policy decisions.
- Phase 5 and Phase 8 now have a clear upstream source of truth for canonical, sitemap, robots, and structured-data validation.
- Phase 2 tracking and sign-off artifacts can now treat RHI-014 as complete.

## Verification

- Manually reconciled the updated RHI-014 ticket, `analysis/plan/details/phase-2.md`, and Phase 2 tracking files for consistency.
- Cross-checked the approved policy against RHI-012 and RHI-013 outcomes so metadata, route, sitemap-host, and tag-retirement rules do not conflict.
- Used current official Hugo and Google Search documentation for sitemap behavior, robots generation, aliases, canonical guidance, noindex behavior, and structured-data recommendations.
- Confirmed the owner decisions needed to close the contract: `BlogPosting`, Hugo robots template output, tag pages retired by default, and Twitter best-effort handling.

## Related files

- `analysis/tickets/phase-2/RHI-014-seo-discoverability-contract.md`
- `analysis/plan/details/phase-2.md`
- `analysis/tickets/phase-2/INDEX.md`
- `analysis/tickets/INDEX.md`
- `analysis/tickets/phase-2/RHI-017-validation-gates-contract.md`
- `analysis/tickets/phase-2/RHI-018-phase-2-signoff.md`
- `analysis/tickets/phase-2/RHI-012-content-model-contract.md`
- `analysis/tickets/phase-2/RHI-013-route-redirect-contract.md`