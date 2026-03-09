# RHI-012 Content Model Contract - 2026-03-09

## Change summary

Closed RHI-012 by approving the Phase 2 Workstream B front matter contract for migrated Hugo content files, including field scope, YAML serialization, manifest-driven routing, field precedence, and WordPress source mapping.

## Why this changed

Phase 3 validation/archetype work and Phase 4 front matter generation both depend on an explicit content contract. Leaving field scope, `url` source of truth, `draft` behavior, or alias/canonical rules ambiguous would force later tickets to invent behavior and create avoidable URL, SEO, and publishing regressions.

## Behavior details

Old behavior:
- Workstream B listed candidate fields and high-level rules, but did not yet close scope by content type.
- The contract did not decide the migrated content front matter serialization format.
- `draft` behavior was still framed as "default true until production review," which conflicted with downstream migration tickets and status-derived validation rules.
- The Phase 2 plan still created ambiguity between explicit per-file `url` values and Workstream C's config-driven route policy.

New behavior:
- The contract now applies only to migrated WordPress `post` and `page` records that become Hugo content files; attachments/media and generated list pages are out of scope.
- YAML is the approved serialization format for migrated content files.
- `migration/url-manifest.json` `target_url` is the source of truth for each content file `url`; slug-derived fallback routes are disallowed.
- `aliases` are path-only, manifest-backed legacy URLs for the same target and must not be absolute or self-referential.
- `draft` now follows WordPress publication state: published items map to `draft: false`; retained non-published states map to `draft: true`; trashed items do not produce content files.
- The Phase 2 plan now distinguishes explicit manifest-driven `url` values for migrated regular content from config-driven routing for generated list/taxonomy pages.
- Field precedence and fallback rules are explicit for `description`, `author`, `heroImage`/`seo.ogImage`, `canonical`, and `seo.noindex`.

## Impact

- Phase 3 can build archetypes and validators against a stable, content-type-aware contract.
- Phase 4 can map front matter without inventing route, draft, or metadata precedence rules.
- Workstream C no longer conflicts with Workstream B on when explicit `url` values are required.
- SEO-critical metadata inputs are clearer for RHI-014 and downstream template work.

## Verification

- Manual consistency check across the RHI-012 ticket, `analysis/plan/details/phase-2.md`, Phase 1 URL invariant policy, and dependent Phase 3/4 tickets.
- Verified the approved field and build rules against official Hugo documentation for front matter, URLs, build options, front matter configuration, cascade, and sitemap behavior.
- Confirmed the final contract preserves downstream ticket expectations for YAML serialization and existing custom field names.

## Related files

- `analysis/tickets/phase-2/RHI-012-content-model-contract.md`
- `analysis/plan/details/phase-2.md`
- `analysis/tickets/phase-2/INDEX.md`
- `analysis/tickets/INDEX.md`
- `analysis/tickets/phase-2/RHI-018-phase-2-signoff.md`