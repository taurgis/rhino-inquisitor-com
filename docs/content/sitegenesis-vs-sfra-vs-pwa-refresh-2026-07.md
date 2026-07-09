# SiteGenesis vs SFRA vs PWA — July 2026 audit and refresh

## Change summary

`src/content/posts/sitegenesis-vs-sfra-vs-pwa/index.md` is a 2022 foundational comparison
piece. It was audited against the site's own more-recent articles and against current
Salesforce documentation, and corrected on one materially wrong claim, one stale
feature-parity list, one stale ecosystem-maturity claim, and several dead or artifact-laden
links. The refresh keeps the article's SiteGenesis → M(S)FRA → PWA Kit teaching structure and
its 2022 voice intact — nothing was restructured or rewritten wholesale — and follows the same
lead-with-current-state playbook as the eCDN, WebDAV, and custom-OCAPI-endpoints refreshes
earlier in this campaign.

A significant new fact surfaced mid-task and was independently verified (not just from
research subagent output): Salesforce now ships a newer, GA headless product called
**Storefront Next**, listed as the *recommended* option ahead of PWA Kit. That wasn't part of
the original audit brief. Per an explicit call with the site owner, it gets a brief, scoped
mention only — a sentence with an official doc link, no feature-parity claims, no structural
changes — rather than a deep dive that would expand this refresh beyond its intended scope.

## Old vs new behavior

| Aspect | Old | New |
|--------|-----|-----|
| PWA Kit connectivity claim | "It connects with the SCAPI and OCAPI (REST APIs)" | SCAPI only, with an explicit note that OCAPI was officially deprecated in April 2026 and a cross-link to `/in-the-ring-ocapi-versus-scapi/` |
| Developer warning callout | "Developers will still need to learn about the SCAPI and OCAPI endpoints" | SCAPI only; OCAPI knowledge reframed as still useful for legacy maintenance-mode integrations, not as something new developers must learn |
| "Composable Storefront" terminology | Never used anywhere in the article | Introduced once, in the PWA Kit & Managed Runtime section, as this site's umbrella term for PWA Kit + Managed Runtime, with cross-links to the two articles that define it |
| Third-party ecosystem maturity | "As this solution is pretty new, few third-party solutions are plug-and-play like SFRA" (written when PWA Kit was ~1 year old) | Softened to reflect 5 years of ecosystem growth: named vendor example (Adyen), Salesforce's own first-party investment (Hybrid Auth, native Order Management actions), explicit statement that no official Salesforce source grades this maturity |
| A/B Testing | Listed as an unqualified missing feature | Confirmed still missing in 2026 against current docs; annotated with the specific bridge (a custom SCAPI Custom API around `ABTestMgr`) |
| Personalisation / Page Designer | `~~Personalisation~~ (Added in 2023)` / `[~~Page Designer~~] ( Added in 2023)` | Left as-is (still accurate); fixed the stray leading space before the "(Added in 2023)" annotation on the Page Designer line |
| Sitemap | Listed as an unqualified missing feature | Reworded: not built in, but no longer a dead end — links to this site's own `mastering-sitemaps-in-sfcc` pattern (backend generation + PWA Kit proxy + the `uploadCustomSitemapAndTriggerSitemapGeneration` SCAPI endpoint) |
| SEO URL Configuration | Listed as an unqualified missing feature | Reworded: narrowed, not closed — SCAPI's `getUrlMapping` endpoint resolves the same Business Manager URL rules SFRA uses, but still requires custom routing integration |
| Page Meta Tag Rules | Listed as an unqualified missing feature | Reworded and linked to this site's `taming-the-beast-...-meta-tag-rules` article: SCAPI's Shopper Search/Shopper Products expansion is making custom endpoints for this "increasingly unnecessary" |
| Storefront Next | Not mentioned (didn't exist in 2022) | One-sentence pointer added before the Comparison section, flagging it as Salesforce's newer recommended headless option, with an official doc link and no parity claims |
| SiteGenesis demo link (line 42) | `production-sitegenesis-dw.demandware.net/on/demandware.store/Sites-SiteGenesis-Site` (301s) | Updated to the resolved live URL, `aaia-prd.my.commercecloud.salesforce.com/s/SiteGenesis/homepage?lang=en_US` |
| SFRA reference link (line 82) | `production-sitegenesis-dw.demandware.net/s/RefArch/home?lang=en_US` (403, dead) | Replaced with the official Salesforce Developer docs SFRA overview page |
| PWA Kit demo link (line 112) | `pwa-kit.mobify-storefront.com` | Verified live, unchanged |
| YouTube URL artifact | `feature=emb\_title` (WordPress-migration escaped underscore) | Fixed to `feature=emb_title` |
| Timeline diagram | 1024×660 PNG, stops at "PWA Kit in 2021" | Regenerated at 2000×900 as an HTML-rendered illustration, extended through SCAPI Custom APIs (2024), Hybrid Auth (2025), the OCAPI deprecation (2026), and Storefront Next (2026); plain kebab-case filename |
| Comparison table image | 1024×865 PNG encoding the stale 2022 feature list | Regenerated at 1500×1000 as an HTML-rendered table matching the corrected feature-parity statuses; plain kebab-case filename |
| Front matter | `lastmod` 2026-07-07T18:30 | Bumped to 2026-07-09T12:41:29.000Z (`date`, `url`, and `takeaways` untouched — the existing takeaways still accurately describe the refreshed content) |

## Fact-check notes

- **OCAPI deprecation**: confirmed via this site's own `in-the-ring-ocapi-versus-scapi`
  refresh — deprecated platform-wide in April 2026, maintenance/security-only until roughly
  April 2028. That article also states PWA Kit "used to be connected to the OCAPI due to some
  limitations with the hooks system, the latest version is now fully connected to the SCAPI,"
  which is the basis for this article's corrected claim.
- **A/B Testing**: checked against `help.salesforce.com` (`cc.b2c_ab_testing.htm`,
  `cc.b2c_ab_testing_for_developers.htm`) and the `dw.campaign.ABTestMgr` Script API doc. No
  SCAPI shopper-facing experimentation endpoint exists as of 2026; the only bridge is a custom
  SCAPI Custom API wrapping the same script API SFRA uses. Confirmed via
  `developer.salesforce.com/docs/commerce/commerce-api/guide/custom-apis.html`.
- **Sitemap**: this site's `mastering-sitemaps-in-sfcc` (2025-06-16, refreshed 2026-07-04) has a
  full "Sitemaps in the Headless Universe: PWA Kit Edition" section documenting a
  backend-generated and PWA-Kit-proxied pattern, plus the
  `uploadCustomSitemapAndTriggerSitemapGeneration` SCAPI endpoint for PWA-only custom routes.
  This directly contradicted the "missing feature" framing and is now cited instead.
- **Page Meta Tag Rules**: this site's `taming-the-beast-a-developers-deep-dive-into-sfcc-meta-tag-rules`
  (2025-08-04, refreshed 2026-07-04) has a "What about the PWA Kit" section stating that SCAPI's
  continued expansion (citing Shopper Search and Shopper Products enrichment specifically) is
  making custom meta-tag endpoints "increasingly unnecessary." Cited and linked.
- **SEO URL Configuration**: checked against `developer.salesforce.com/docs/commerce/commerce-api/guide/url-resolution.html`
  (the Shopper SEO API's `getUrlMapping` endpoint) and the PWA Kit Managed Runtime routing
  guide, which cross-references it as a routing option. The endpoint resolves the same
  Business Manager URL Rules SFRA uses, but there is no zero-config equivalent — the PWA Kit
  developer still wires it into their own routing logic. Worded as "narrowed, not closed"
  rather than either "missing" or "solved."
- **Third-party ecosystem maturity**: no official Salesforce statement grades this. Checked the
  Salesforce AppExchange Commerce Cloud collection, which shows a small number of vendor
  packages built specifically for PWA Kit (Adyen's headless integration was the clearest
  example found), alongside Salesforce's own first-party investment: Hybrid Auth replacing the
  old Plugin SLAS setup, and native Order Management actions shipping inside PWA Kit's default
  implementation per the July 2026 PWA Kit Managed Runtime release notes. This is presented in
  the article as the site's own current assessment, not an official Salesforce maturity grade,
  because no such official grading exists.
- **"Not marketed to replace SFRA"**: checked against Salesforce's "Choose Your B2C Commerce
  Storefront Type" guide (`developer.salesforce.com/docs/commerce/commerce-api/guide/which-product.html`),
  which still frames SFRA and headless options as coexisting, with dedicated Hybrid
  Authentication tooling specifically built for hybrid SFRA/headless rollouts. Confirmed still
  accurate for the PWA Kit specifically. The same page surfaced the Storefront Next finding
  below.
- **Storefront Next**: confirmed live and independently verified by direct fetch (not just
  research-subagent output) at `developer.salesforce.com/docs/commerce/commerce-api/guide/which-product.html`,
  which lists it as the "Recommended option" ahead of SFRA and PWA Kit, built on React Router 7,
  React 19, Tailwind CSS, shadcn/ui, and Vite, with a dedicated "Migrate from PWA Kit to
  Storefront Next" guide. No other article on this site mentions it yet. Per the site owner's
  explicit decision, this refresh adds only a single scoped sentence pointing to it — no
  feature-parity analysis, no structural changes to this comparison.
- **"Missing features" checklist device**: per the site owner's explicit decision, the
  struck-through checklist format is kept (not restructured to prose), with all six items
  refreshed to their actual 2026 status rather than the binary "missing" framing from 2022.

## Link audit (2026-07-09)

All three flagged legacy/Mobify links were fetched live (not assumed):

- `production-sitegenesis-dw.demandware.net/on/demandware.store/Sites-SiteGenesis-Site`
  (line 42) → 301s to `https://aaia-prd.my.commercecloud.salesforce.com/s/SiteGenesis/homepage?lang=en_US`,
  a live, official Salesforce SiteGenesis demo store. Updated the link to the resolved URL
  directly and registered the new host in `scripts/gates/external-link-domains.js` (plain
  `status` strategy — it's a server-rendered storefront instance, not a client-side SPA shell).
- `production-sitegenesis-dw.demandware.net/s/RefArch/home?lang=en_US` (line 82) → 403
  Forbidden, no redirect. Dead. Replaced with the official Salesforce Developer docs SFRA
  overview page (`developer.salesforce.com/docs/commerce/sfra/guide/sfra-overview.html`),
  confirmed live by direct fetch.
- `pwa-kit.mobify-storefront.com` (line 112) → 200, a live Retail React App PWA Kit demo store
  with a "demo store only" disclaimer. Kept unchanged.

The local pre-commit external-link gate could not render `developer.salesforce.com` or
`help.salesforce.com` URLs in this environment (`net::ERR_CONNECTION_RESET` from the sandboxed
headless Chromium instance the gate uses) and flagged 10 links as "verify manually." All of
those links were independently fetched and confirmed live during this task via a
proxy-aware fetch tool before being added or left in place — the gate's warning reflects a
sandbox network limitation, not evidence of a dead link. The commit passed the gate (10
verified, 1 skip-listed, 10 warnings, no hard failures).

## Impact and verification

- Impacted: one published post; one gate registry addition
  (`scripts/gates/external-link-domains.js`); two new images added to the post's own asset
  bundle, two WordPress-legacy images removed (confirmed unreferenced anywhere else on the
  site before deletion). `date`, `url`, `title`, and `takeaways` untouched.
- Verified with: `npm run validate:frontmatter`, `npm run check:spelling`,
  `npx markdownlint-cli2` on the post, and `npm run gates:local`.
- New images were rendered from self-contained HTML files via headless Chromium
  (Playwright, `chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })`), the same
  technique used for the eCDN DNS-record diagram earlier in this campaign, and use plain
  kebab-case filenames rather than the WordPress-migration hash-suffix convention.

## Related files

- `src/content/posts/sitegenesis-vs-sfra-vs-pwa/index.md`
- `src/content/posts/sitegenesis-vs-sfra-vs-pwa/sfcc-storefront-timeline.png` (new)
- `src/content/posts/sitegenesis-vs-sfra-vs-pwa/sitegenesis-sfra-pwa-comparison-table.png` (new)
- `scripts/gates/external-link-domains.js`
- Cross-linked posts: `in-the-ring-ocapi-versus-scapi`, `mastering-sitemaps-in-sfcc`,
  `taming-the-beast-a-developers-deep-dive-into-sfcc-meta-tag-rules`,
  `what-does-the-composable-storefront-mean-for-sfcc-developers`,
  `the-move-from-sitegenesis-and-sfra-to-the-composable-storefront-as-a-developer`
