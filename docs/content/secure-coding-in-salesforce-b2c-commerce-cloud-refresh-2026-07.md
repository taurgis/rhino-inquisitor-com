# Secure Coding in Salesforce B2C Commerce Cloud — July 2026 audit and refresh

## Change summary

`src/content/posts/secure-coding-in-salesforce-b2c-commerce-cloud/index.md` was
audited against current Salesforce, MDN, GitHub, and Chrome Web Store sources,
and against two sibling refreshes already completed in this campaign
(`lets-go-live-ecdn` for the Cloudflare/eCDN claims, `a-beginners-guide-to-webdav-in-sfcc`
for MFA terminology and enforcement scope). The article carried three classes
of problem: pre-existing markup defects unrelated to platform drift (three
mislinked MDN hrefs, a mangled X-Frame-Options sentence, a garbled inline XSS
reference), stale 2FA terminology inconsistent with the sourced MFA
enforcement finding from the WebDAV refresh, and genuine five-year platform
drift (a "PWA Kit is new" framing that's been false since 2021, a thin
Cloudflare section duplicating less than the eCDN deep-dive already
established, a header list missing constants Salesforce has added since 2022,
and several links needing verification or updated terminology).

## Old vs new behavior

| Aspect | Old | New |
|--------|-----|-----|
| MDN header links | Access-Control-Allow-Methods and Access-Control-Allow-Origin both linked to the Access-Control-Allow-Headers MDN page; Content-Security-Policy linked to Access-Control-Expose-Headers | Each links to its own correct MDN page |
| XSS reference | `(Cross-site\_scripting)` — an escaped, unlinked parenthetical fragment | Inline link on "cross-site scripting" to the MDN XSS glossary entry |
| X-Frame-Options sentence | "...render a page in a , `<iframe>`, `<embed />` or `<object>`" — missing element and dangling comma | Restored the missing `<frame>` element, matching MDN's canonical embedding-element phrasing |
| Authentication terminology | "2FA (Two-Factor-Authentication)" throughout, with an unsourced "mandatory... for more than a year" claim | "MFA (Multi-Factor Authentication)" throughout, citing the May 2022 enforcement release note directly; matches the WebDAV refresh's confirmed terminology and scope (MFA enforced for interactive Account Manager logins) |
| Salesforce Authenticator link | Play Store URL carried `&hl=nl&gl=US` locale params | Locale-neutral URL |
| Automaton extension | Presented as current with no status check; linked the legacy `chrome.google.com/webstore/...` URL | Confirmed live and maintained (v1.3.1, updated July 2024); updated to the current `chromewebstore.google.com` domain and added a link to its support repo |
| Cloudflare section | Two generic sentences, no cross-link, linked the eCDN landing page | Expanded to match the eCDN refresh's established framing (eCDN = Cloudflare, Salesforce controls configuration, Business Manager exposes a subset of switches), cross-linked to `lets-go-live-ecdn`, links the eCDN Overview article instead of the landing page |
| PWA Kit section | "As the PWA Kit is 'relatively' new, there is no real documentation on PWA-specific security best practices" | Drops the stale framing; links the current Managed Runtime best-practices guide and MRT overview, cross-links `storefront-protection-in-the-pwa-kit` (flagged as itself pending a refresh) |
| Security header list | 14 headers, matching the 2022 `dw.system.Response` constant list; Permissions-Policy had no MDN link; no mention of ALLOW-FROM's real-world browser support | Adds Cross-Origin-Embedder-Policy-Report-Only and X-XSS-Protection (with deprecation caveat), notes the undocumented-on-MDN Cross-Origin-Opener-Policy-Report-Only constant, links Permissions-Policy to MDN, and flags that ALLOW-FROM is accepted by the Response class but ignored by modern browsers |
| AppExchange link | Labeled "AppExchange Security Reviews" | Relabeled "AgentExchange Security Reviews" — the linked packaging guide itself now uses the post-rebrand name |
| SFRA GitHub link | `blob/master/...httpHeadersConf.json`, unverified | Confirmed current: Salesforce's own April 2025 KB article (`000396592`) cites the same path, added as a corroborating citation |
| Front matter | `lastmod: 2026-07-04T17:47:13.000Z` | `lastmod` bumped to the current UTC timestamp; `date`, `url` untouched |

## Fact-check notes

**MFA enforcement.** Reused and cross-checked (not re-derived) the WebDAV
refresh's finding that Salesforce's current term is MFA and that enforcement
covers interactive B2C Commerce logins (Business Manager, Account Manager, Log
Center, Control Center, On-Demand Sandboxes) but not API-style access such as
WebDAV. This article's own context — Account Manager's interactive login — is
squarely inside that enforced scope, so the original claim was directionally
correct; only the terminology and sourcing needed fixing. Closed a gap the
WebDAV refresh left open: found and cited the actual May 2022 release note,
["Get Ready for Multi-Factor Authentication Enforcement in
May"](https://help.salesforce.com/s/articleView?id=commerce.rn_b2c_mfa_enforcement_je.htm&language=en_US&type=5),
which states plainly that the change applies to "Business Manager, Account
Manager, Log Center, Control Center, and On-Demand Sandboxes for Salesforce
B2C Commerce" and that "after MFA is enforced, all users must use MFA each
time they log in." The [B2C Commerce Multi-Factor Authentication
FAQ](https://help.salesforce.com/s/articleView?id=000392688&language=en_US&type=1)
(last published Jun 30, 2025) corroborates: "Admins won't be able to turn off
or modify Account Manager MFA settings for their organization."

**Response class header constants.** Fetched the current `dw.system.Response`
Script API doc
(`https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/api/class_dw_system_Response.html`).
Confirmed `ALLOW-FROM` is still a documented constant
(`X_FRAME_OPTIONS_ALLOW_FROM`) despite being an [obsolete X-Frame-Options
directive that modern browsers ignore
entirely](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options).
Identified security-relevant constants added since the article's original
2022 list: `CROSS_ORIGIN_EMBEDDER_POLICY_REPORT_ONLY`,
`CROSS_ORIGIN_OPENER_POLICY_REPORT_ONLY`, `X_XSS_PROTECTION`. Other new
constants on the class (`ALLOW`, `CONTENT_DISPOSITION`, `CONTENT_LANGUAGE`,
`CONTENT_LOCATION`, `CONTENT_MD5`, `LINK`, `LOCATION`, `REFRESH`,
`RETRY_AFTER`, `SERVICE_WORKER_ALLOWED`, `VARY`, `X_ROBOTS_TAG`, the legacy
P3P header) are general-purpose HTTP headers rather than security headers and
were deliberately left out of this security-focused list. MDN has a page for
`Cross-Origin-Embedder-Policy-Report-Only` (at the `/Reference/Headers/` path,
not the shorter `/Headers/` path that redirects for most other pages) but no
dedicated page yet for `Cross-Origin-Opener-Policy-Report-Only`, so the latter
is described inline without a broken link.

**eCDN help article ID.** Confirmed `cc.b2c_embedded_cdn.htm` (landing page)
and `cc.b2c_embedded_cdn_overview.htm` (child overview page) are both live,
distinct, current articles — not aliases of each other. Switched this
article's link to the Overview page to match what the `lets-go-live-ecdn`
refresh cites.

**PWA Kit / Managed Runtime docs.** The existing Developer Portal "Skills for
Success" link is still live but isn't itself a security document. Found and
linked two documents that are: the [Managed Runtime best practices
guide](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/best-practices.html)
(links to the B2C Commerce Security Guide, bot management, and bot
mitigation) and the [Managed Runtime
overview](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/mrt-overview.html)
(documents the Edge Services WAF/proxy/CDN layer and Admin Tool access
controls). `storefront-protection-in-the-pwa-kit` is confirmed **not yet
refreshed**: dated November 2024, body text still says "SFCC PWA" and "PWA
Kit" throughout (only the `takeaways` field mentions "Managed Runtime"). It
remains the right cross-link target for storefront-level (Basic Auth)
protection specifically, but should not be treated as a fully current source
until it gets its own pass.

**Automaton extension.** Checked the Chrome Web Store listing directly
(current domain, `chromewebstore.google.com`): version 1.3.1, last updated
July 2, 2024 — still live and maintained, not a Manifest V3 casualty as
hypothesized going in. Its support link resolves to a GitHub issues page
(`taurgis/automaton`), which is now referenced in the article.

**AppExchange → AgentExchange.** The linked packaging guide
(`secure_code_b2c_commerce.htm`) still resolves, but its current content
(Summer '26 / API v67.0) refers to "AgentExchange" rather than "AppExchange" —
part of Salesforce's platform-wide marketplace rebrand. Updated the link text
accordingly; the URL itself didn't need to change.

**taurgis/salesforce-commerce-cloud-libraries.** Confirmed still public,
active (301 commits on `master`, 63 stars, 2 open issues, 7 open PRs),
covering the same seven converted libraries (Moment.js, Lodash, date-fns,
fast-xml-parser, chance, ramda, jsPDF). The Rhino/npm-compatibility claim this
article makes still holds.

## Link audit (2026-07-09)

All 14 Security Best Practices links, plus the SFRA GitHub link and the
Automaton Chrome Web Store link, were checked live via Bonsai-cached fetches
(one non-Salesforce fetch — GitHub — went through a manual `WebFetch`
fallback after Bonsai's automated fetch was blocked with a 403, per the
skill's fallback path; results below still reflect a genuine live check, not
an assumption).

| # | Link | Status | Notes |
|---|------|--------|-------|
| 1 | Encryption and Cryptography (`cc.b2c_encryption_and_cryptography.htm`) | Live | Title matches |
| 2 | Cross-Site Scripting (`cc.b2c_cross_site_scripting.htm`) | Live | Title matches |
| 3 | Declarative Security via HTTP Headers (`cc.b2c_declarative_security_via_http_headers.htm`) | Live | Title matches |
| 4 | Commerce Script Injection (`cc.b2c_commerce_script_injection.htm`) | Live | Title matches |
| 5 | Cross-Site Request Forgery (`cc.b2c_cross_site_request_forgery.htm`) | Live | Title matches |
| 6 | Secret Storage (`cc.b2c_secret_storage.htm`) | Live | Title matches |
| 7 | Using Hooks Securely (`cc.b2c_using_hooks_securely.htm`) | Live | Title matches |
| 8 | Data Validation (`cc.b2c_data_validation.htm`) | Live | Title matches |
| 9 | Open Redirect Attacks (`cc.b2c_open_redirect_attacks.htm`) | Live | Title matches |
| 10 | Authentication and Authorisation (`cc.b2c_developer_authentication_and_authorization.htm`) | Live | Transient fetch error on first attempt, succeeded on retry — worth a re-check if this list is ever automated, since a slow SPA render can look like a soft-404 |
| 11 | Supply Chain Security (`cc.b2c_supply_chain_security.htm`) | Live | Title matches |
| 12 | Secure Logging (`cc.b2c_secure_logging.htm`) | Live | Title matches |
| 13 | General Secure Coding Practices (`cc.b2c_general_secure_coding_practices.htm`) | Live | Title matches |
| 14 | AgentExchange Security Reviews (`secure_code_b2c_commerce.htm`) | Live | Content now says "AgentExchange," not "AppExchange" — link text updated |
| — | Parent hub: Security Best Practices for Developers (`cc.b2c_security_best_practices_for_developers.htm`) | Live | Title matches |
| — | SFRA header config file (GitHub, `blob/master/.../httpHeadersConf.json`) | Live | Corroborated by Salesforce's own April 2025 KB article (`000396592`), which cites the same path |
| — | Automaton (Chrome Web Store) | Live | v1.3.1, updated July 2, 2024; migrated the link to the current `chromewebstore.google.com` domain |

## Impact and verification

- Impacted: one published post
  (`secure-coding-in-salesforce-b2c-commerce-cloud`). `date`, `url`, hero
  image, categories, and tags untouched; `lastmod` bumped.
- Verified with: `npm run validate:frontmatter`, `npm run check:spelling`,
  `npx markdownlint-cli2` on the post, and a full `npm run build:local` Hugo
  build.

## Related files

- `src/content/posts/secure-coding-in-salesforce-b2c-commerce-cloud/index.md`
- Cross-linked posts: `lets-go-live-ecdn`, `storefront-protection-in-the-pwa-kit`
- Referenced (not modified) sibling refresh docs: `webdav-article-refresh-2026-07.md`
