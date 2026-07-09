# SFRA REST endpoints article — July 2026 refresh

## Change summary

`src/content/posts/should-i-use-sfra-rest-endpoints-in-a-composable-storefront/index.md`
stated that `plugin_slas` was the way to bridge a shopper's SLAS JWT into an
SFRA session cookie for personalised controller endpoints, with no mention
that the cartridge has since been superseded. That contradicted the site's
own `slas-in-sfra-or-sitegenesis` article, which documents `plugin_slas` as a
legacy bridge now replaced by native Hybrid Authentication (B2C Commerce
25.3). The front matter `description` was also truncated mid-sentence, and
the closing "Conclusion?" section linked to a `#conclusion` anchor that
pointed at itself instead of the article's actual answer section. This was a
targeted fix, not a full rewrite: the article's real argument (custom SCAPI
endpoints over SFRA controllers for REST APIs) did not change.

## Old vs new behavior

| Aspect | Old | New |
|--------|-----|-----|
| `plugin_slas` framing | Presented as the current, only mechanism for session bridging | Named as the historical bridge (Feb 2022–25.3), with `plugin_slas` explicitly no longer the answer |
| Modern replacement | Not mentioned | Native [Hybrid Authentication](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/hybrid-auth.html) (25.3) named, cross-linked to `/slas-in-sfra-or-sitegenesis/` |
| "Extra API calls and delays" claim | Stated as an ongoing cost | Scoped to the `plugin_slas` era (three to five extra remote calls per login); Hybrid Auth removes that cost, but the session-bound design of controller endpoints remains the underlying problem |
| `description` | Truncated mid-sentence at "...end up with some" | Complete, 148-character, benefit-first sentence |
| Conclusion anchor | Self-referential `[start of the article](#conclusion)` link pointing at its own heading | Replaced with a plain restated verdict, no anchor dependency |
| Front matter | `lastmod` 2026-07-04 | `lastmod` bumped to 2026-07-09 |

## Fact-check notes

Claims were verified against primary Salesforce docs fetched via Bonsai in
this task, not copied uncritically from the sibling article:

- [Configure a Hybrid Storefront with Hybrid Auth](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/hybrid-auth.html) —
  confirms "With B2C Commerce version 25.3, hybrid authentication (Hybrid
  Auth) replaces the Plugin SLAS cartridge option," that it keeps a `dwsid`
  (SFRA/SiteGenesis) and SLAS JWT in sync, and that Salesforce "highly
  recommend[s] migrating to Hybrid Auth."
- [Custom APIs: Authentication and Authorization](https://developer.salesforce.com/docs/commerce/commerce-api/guide/custom-api-authentication.html) —
  confirms Custom SCAPI endpoints authenticate directly via the `ShopperToken`
  security scheme (SLAS JWT) for storefront use cases, with no mention of
  `plugin_slas` or session bridging — supporting the article's point that
  Custom APIs sidestep the session dependency controllers carry.

## Impact and verification

- Impacted: one published post only; no scripts, workflows, templates, or
  governance files changed. `url` and hero image untouched; only `date` was
  left untouched per the SEO gate, `lastmod` was bumped.
- Verified with: `npm run validate:frontmatter`, `npm run check:spelling`,
  `npx markdownlint-cli2` on the post, and `npm run build:local`.

## Related files

- `src/content/posts/should-i-use-sfra-rest-endpoints-in-a-composable-storefront/index.md`
- Cross-linked posts: `slas-in-sfra-or-sitegenesis`,
  `creating-custom-ocapi-endpoints`, `how-to-set-up-slas-for-the-composable-storefront`,
  `sitegenesis-vs-sfra-vs-pwa`
