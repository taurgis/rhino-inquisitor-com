# Change summary

The public privacy and cookie-policy pages were rewritten to remove migrated WordPress placeholder content and to reflect the current Hugo site's actual visitor-facing behavior.

# Why this changed

The site audit found that the live privacy page exposed unfinished migration output and that the source policy pages still described WordPress-era features such as comments, logins, and removed shortcode-driven consent widgets. That created a trust and accuracy problem on public legal and policy pages.

# Behavior details

Old behavior:

- `src/content/pages/privacy-policy/index.md` described comment submission, Gravatar, login cookies, editor cookies, and a legacy Matomo replacement note.
- `src/content/pages/cookie-policy-eu/index.md` was only a placeholder note about a removed Complianz shortcode.
- The generated policy pages exposed migration-state messaging rather than current site behavior.

New behavior:

- The privacy policy now describes the current Hugo site as a public, read-only publishing surface with no public accounts or comment system.
- The cookie policy now states that the legacy WordPress consent widget is not published and explains the limited cookie expectations for the current site.
- Both pages now frame third-party embeds and linked services as external processors under their own policies rather than as on-site account or comment features.

# Impact

- Public policy pages now align with the current site implementation instead of legacy WordPress behavior.
- The audit issue around raw migration placeholders on public policy pages is addressed in source.
- Future additions of analytics, consent tooling, or account features now require explicit policy updates before publication.

# Verification

1. Build the Hugo site and verify that `/privacy-policy/` and `/cookie-policy-eu/` no longer contain migration placeholder text or removed-widget notes.
2. Confirm that both pages describe the site as a public read-only publishing surface with no public comments or accounts.
3. Recheck the page descriptions and rendered body content for wording consistency with the current Hugo implementation.

# Related files

- `src/content/pages/privacy-policy/index.md`
- `src/content/pages/cookie-policy-eu/index.md`