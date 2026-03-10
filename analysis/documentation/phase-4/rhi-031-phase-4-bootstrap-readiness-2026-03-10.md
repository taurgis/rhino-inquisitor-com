# RHI-031 Phase 4 Bootstrap Readiness Update

Date: 2026-03-10
Ticket: `analysis/tickets/phase-4/RHI-031-phase-4-bootstrap.md`

## Change summary

Phase 4 bootstrap repo prerequisites were partially completed by adding the missing HTML-to-Markdown dependencies, creating the planned migration workspace directories, recording owner assignments, and capturing local evidence for the current scaffold, source artifacts, and external WordPress access points.

## Why this changed

RHI-031 is the hard gate before any Phase 4 workstream can start. The repo needed the migration workspace structure and the Phase 4 package set in place before later tickets can implement extraction, normalization, conversion, and reporting scripts safely.

## Behavior details

Old behavior:

- The repository did not contain committed placeholders for `migration/input/`, `migration/intermediate/`, `migration/output/`, `migration/reports/`, or `scripts/migration/`.
- `package.json` did not include `turndown`, `@joplin/turndown-plugin-gfm`, or `cheerio`, so the Phase 4 conversion toolchain was incomplete.
- Bootstrap evidence for RHI-031 existed only as scattered local observations and had not been summarized for Phase 4 operators.

New behavior:

- The Phase 4 migration workspace directories now exist and are ready for later script output.
- `package.json` and `package-lock.json` now include `turndown`, `@joplin/turndown-plugin-gfm`, and `cheerio` alongside the previously present Phase 4 dependencies.
- Local bootstrap evidence is now documented, including script callability, Phase 1 artifact counts, WXR/SQL/filesystem timestamps, filesystem content roots, REST API reachability, and a direct media-origin probe.
- The owner has confirmed Thomas Theunen as Migration Owner, SEO Owner, Engineering Owner, and the single workstream owner for WS-A through WS-K, with the current target dates retained as the initial agreed schedule.
- The owner has also confirmed review of the Phase 4 detailed plan, Phase 2 contracts RHI-012/RHI-013/RHI-015, and the Non-Negotiable Migration Constraints.
- Phase 4 remains blocked from full kickoff until the WXR-versus-SQL/filesystem freshness mismatch is reconciled and RHI-030 is closed with current GitHub-side sign-off evidence.

## Impact

- Engineering can begin adding Phase 4 scripts under `scripts/migration/` once the remaining gate items are cleared.
- No Phase 4 workstream is unblocked by this change on its own; the ticket remains `In Progress`, not `Done`.
- Source-channel decisions for RHI-032 must still account for the current cross-source freshness mismatch: the WXR export is newer than the SQL dump and filesystem snapshot.

## Verification

- `npm run validate:frontmatter`
- `npm run check:url-parity`
- `npm run check:seo`
- Local artifact count check: `migration/url-inventory.normalized.json` = 1199 records; `migration/url-manifest.json` = 1201 records with 1201 populated dispositions
- Local source timestamps: `tmp/therhinoinquisitor.WordPress.2026-03-10.xml` = `2026-03-10 11:03:55 +0100`; `tmp/wordpress-database.sql` = `2026-03-08 16:23:08 +0100`; `tmp/website-wordpress-backup` = `2026-03-08 16:22:14 +0100`
- Local filesystem paths: `tmp/website-wordpress-backup/wp-content` and `tmp/website-wordpress-backup/wp-content/uploads`
- WXR parse check: `tmp/therhinoinquisitor.WordPress.2026-03-10.xml` parsed successfully with 958 `<item>` records via `fast-xml-parser`
- REST API probe: `GET https://www.rhino-inquisitor.com/wp-json/wp/v2/posts?per_page=1&page=1` returned `200` and `X-WP-TotalPages: 160`
- Direct media probe: `GET https://www.rhino-inquisitor.com/wp-content/uploads/2022/03/modules-300x200.avif` returned `200`
- Owner confirmation: Thomas Theunen recorded for Migration Owner, SEO Owner, Engineering Owner, and WS-A through WS-K; existing Phase 4 target dates retained

## Related files

- `package.json`
- `package-lock.json`
- `analysis/tickets/phase-4/RHI-031-phase-4-bootstrap.md`
- `analysis/tickets/phase-4/INDEX.md`
- `migration/input/`
- `migration/intermediate/`
- `migration/output/`
- `migration/reports/`
- `scripts/migration/`
