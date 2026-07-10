# OCAPI/SCAPI refresh campaign — July 2026 QA pass

## Change summary

The OCAPI/SCAPI audit-and-refresh campaign (eCDN, custom OCAPI endpoints,
WebDAV, hooks, JWT setup, date-filtering, and the OCAPI-vs-SCAPI rematch) ran
across 2026-07-07 and 2026-07-08. This entry documents a follow-up QA pass
against that work: a cross-article consistency review turned up one real
contradiction and a handful of cosmetic leftovers across five articles.

## Old vs new behavior

| Aspect | Old | New |
|--------|-----|-----|
| OCAPI end-of-support date (`how-to-use-ocapi-scapi-hooks`) | Warning callout said "There is no published shut-off date... migrate on your own timeline rather than waiting for a deadline" | Now states OCAPI was deprecated April 2026 and is in maintenance mode with security updates "until around April 2028," matching `creating-custom-ocapi-endpoints` and `in-the-ring-ocapi-versus-scapi`; adds a cross-link to the rematch article for the full migration picture |
| Request-body unit (`creating-custom-ocapi-endpoints`) | Shopper Custom API body cap stated as "5 MiB" immediately next to the Admin cap stated as "20 MB" | Both expressed as MB for consistency |
| Escaped underscores (`how-to-use-ocapi-scapi-hooks`, `how-to-setup-oauth-jwt-for-the-ocapi`, `unravelling-the-mystery-of-dates-in-the-ocapi`) | Leftover Markdown-escaped underscores in prose (`my\_project`, `client\_assertion`, `creation\_date`, `private\_key\_jwt`, etc.), including one inside a rendered link label | All de-escaped to plain `_` |
| Missing image caption (`in-the-ring-ocapi-versus-scapi`) | The "Infrastructure" section's `img-caption` shortcode had `alt` text but no `caption` | Added a caption carrying the section's argument (OCAPI shares an address with Business Manager/storefront; SCAPI does not) |
| Refresh-doc audit trail (`docs/content/webdav-article-refresh-2026-07.md`) | Said `lastmod` was "bumped to 19:00" | Corrected to 21:30 to match the live front matter, which was updated again later the same day during the voice/fact-check follow-up commits |

## Fact-check notes

The "around April 2028" figure was not re-derived here — it was already
independently stated, in agreement, by both `creating-custom-ocapi-endpoints`
and `in-the-ring-ocapi-versus-scapi`. The hooks article's "no published
shut-off date" line was the outlier and was brought into agreement with the
other two rather than the reverse. The MiB/MB figures themselves (5 and 20)
were not changed, only the unit label, since nothing in this pass could
confirm which unit Salesforce's own docs use for the Shopper cap specifically;
a future pass should verify this against the live Custom API guide.

## Impact and verification

- Impacted: five published posts (`how-to-use-ocapi-scapi-hooks`,
  `how-to-setup-oauth-jwt-for-the-ocapi`, `unravelling-the-mystery-of-dates-in-the-ocapi`,
  `creating-custom-ocapi-endpoints`, `in-the-ring-ocapi-versus-scapi`) plus one
  documentation file. No URLs, aliases, titles, or descriptions changed;
  `lastmod` bumped on all five posts.
- Verify with: `npm run validate:frontmatter`, `npm run check:spelling`,
  `markdownlint-cli2` on the five posts, and `npm run build:local`.

## Related files

- `src/content/posts/how-to-use-ocapi-scapi-hooks/index.md`
- `src/content/posts/how-to-setup-oauth-jwt-for-the-ocapi/index.md`
- `src/content/posts/unravelling-the-mystery-of-dates-in-the-ocapi/index.md`
- `src/content/posts/creating-custom-ocapi-endpoints/index.md`
- `src/content/posts/in-the-ring-ocapi-versus-scapi/index.md`
- `docs/content/webdav-article-refresh-2026-07.md`
