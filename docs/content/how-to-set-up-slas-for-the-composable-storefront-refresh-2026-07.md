# SLAS setup guide article — July 2026 refresh

## Change summary

`src/content/posts/how-to-set-up-slas-for-the-composable-storefront/index.md`
was refreshed for the 2026 platform state. This is a click-by-click setup
walkthrough (Business Manager navigation, a third-party browser extension,
CLI scaffolding), so a stale step here doesn't just read as dated — it
actively breaks a reader's setup. The article had not been substantively
edited since it was published in January 2023, and its central "Step 4:
Enable OCAPI endpoints" predated this campaign's finding that
[OCAPI was deprecated platform-wide in April 2026](/in-the-ring-ocapi-versus-scapi/).
It also carried a literal "Currently (January 16th, 2023)" bug note that had
never been revisited.

Unlike the `creating-custom-ocapi-endpoints` refresh, this is not a case of
one workaround being fully superseded by an official replacement — it's a
narrower, single-step correction (OCAPI settings are now conditional on
public-vs-private client choice, not an unconditional step), so the fix uses
an inline `> [!NOTE]` callout at the affected step rather than a full
"For the Archives" split.

## Old vs new behavior

| Aspect | Old (Jan 2023) | New (July 2026) |
|--------|-----|-----|
| Step 4 ("Enable OCAPI endpoints") | Presented as an unconditional required step for every reader | Reframed as public-client-only; private clients (the PWA Kit 3.5+ default) skip it entirely. Kept as a labeled fallback with a deprecation note and a link to `/in-the-ring-ocapi-versus-scapi/` |
| Scopes typo note | Stated as a current fact dated "January 16th, 2023" | Reframed as the 2023 finding, explicitly marked unconfirmed for July 2026 (static docs show the scopes correctly separated, but the live SLAS Admin UI textbox couldn't be checked) |
| DWithEase link-insertion claim | Stated as fact ("the link is inserted by DWithEase") | Softened — manual URL construction is now the lead instruction; DWithEase is described as a possible shortcut, since its specific link-insertion behavior on this page couldn't be confirmed against current official docs or DWithEase's own site |
| CLI scaffolding command | `npx pwa-kit-create-app` (unscoped package) | `npx @salesforce/pwa-kit-create-app@latest` (current scoped package per Salesforce's Quick Start and Set Up Your Local Environment guides), with a note to pin a version instead of `@latest` |
| CLI prompts | Project name, instance URL, SLAS Client ID, Site ID, org ID, short code | Same core list, renamed to match Salesforce's current configuration-values table ("Commerce API client ID"), plus a new explicit public/private client prompt reflecting the private-client-default shift |
| Step 3 client creation | Framed "PWA Kit or SFRA or Mobile" App Type as always producing a public client | Noted that Salesforce's current guidance favors a private client for most PWA Kit 3.5+ projects, created the same way via the SLAS Admin UI with the secret set via an environment variable |
| Business Manager nav path (Step 2) | "Administration > Site Development > Salesforce Commerce API Settings" | Unchanged — confirmed still accurate; left as-is |
| Closing paragraph | Generic filler ("...impressed by your technical prowess. So go forth and conquer...") | Replaced with a concrete recap of the three things most likely to trip a reader up |
| `lastmod` | `2026-07-04T14:48:28.000Z` (bumped previously with no substantive edit) | `2026-07-09T17:43:35.000Z` |

## Fact-check notes

Verified in July 2026, live, before editing (not from training-data
knowledge):

- **`setting-up-api-access.html`** (PWA Kit Managed Runtime guide, "Set Up
  API Access"), fetched directly: confirms "Projects generated from PWA Kit
  3.5 and above will be configured to use a SLAS private client by default"
  and "If you are using a SLAS public client, skip this section and continue
  with updating your OCAPI settings" — i.e., the OCAPI settings step is
  conditional on client type, not universal. Also confirms the mechanics of
  that step (Business Manager → paste JSON → replace `PLACEHOLDER_CLIENT_ID`)
  are otherwise unchanged.
- **`in-the-ring-ocapi-versus-scapi/index.md`** (this site, already
  refreshed): source for "OCAPI deprecated in April 2026, maintenance-only,
  security patches only" — used to add the deprecation caveat to Step 4.
- **`auth-z-scope-catalog.html`** ("Authorization Scopes Catalog"), fetched
  via Bonsai by the Salesforce Docs Researcher subagent: current default
  scope list shows `sfcc.shopper-myaccount.orders` and
  `sfcc.shopper-myaccount.paymentinstruments.rw` as separate, correctly
  spaced entries. This is static documentation, not the live SLAS Admin UI's
  generated textbox, so it does **not** confirm whether the original
  UI-rendering typo is fixed — the article says so explicitly rather than
  asserting either way.
- **`base-url.html`** and **`setting-up-your-local-environment.html`**,
  fetched via Bonsai: both confirm the exact current Business Manager path
  "Administration > Site Development > Salesforce Commerce API Settings" is
  still accurate for Organization ID / Short Code — no change needed there.
  These same sources describe the SLAS Admin UI URL as something you
  construct manually from the short code; neither claims Business Manager
  itself shows a clickable SLAS Admin UI link — consistent with softening the
  DWithEase claim rather than dropping it.
- **`quick-start.html`** and **`setting-up-your-local-environment.html`**,
  fetched via Bonsai: confirm the current scaffolding command is
  `npx @salesforce/pwa-kit-create-app@latest` (with a `@latest`-caching
  caveat in Salesforce's own docs), and that the current configuration-values
  table lists "Project ID in Managed Runtime Admin," "Commerce API client
  ID," and a "Commerce API private client mode" toggle (default private) —
  none of these pages print a literal interactive-prompt transcript, so the
  post's "### What is..." headings paraphrase the confirmed values rather
  than quoting exact CLI wording.
- **DWithEase** (`dwithease.com`, `dwithease.com/faq/`, Chrome Web Store
  listing): confirmed the extension is still actively maintained (25,000+
  users, current browser support). Could not confirm the specific claim that
  it auto-inserts a link on the Commerce API Settings Business Manager page —
  its own docs/FAQ describe general "shortcut" and "context menu" features
  but don't call out this specific page.

**Not independently reverified in this pass:** the article's 7 in-body
screenshots (Business Manager settings page, SLAS Admin UI login/welcome/
client-list/new-client screens, the scopes-typo screenshot) and the hero
image. This session has no live SFCC sandbox or SLAS Admin UI login, so
these could not be checked against the current UI. None of the verified
doc changes above directly contradict what any specific screenshot shows,
so none were replaced or flagged as wrong — but their visual currency
remains unconfirmed and should be revisited if someone with sandbox access
can compare them against the live UI.

## Impact and verification

- Impacted: one published post only. No scripts, workflows, templates, or
  governance files changed. `url`, `aliases`, and hero image untouched.
- Verified with: `npm run validate:frontmatter`, `npm run check:spelling`,
  `npx markdownlint-cli2` on the post, and a full `npm run build:local` Hugo
  build.

## Related files

- `src/content/posts/how-to-set-up-slas-for-the-composable-storefront/index.md`
- Cross-linked posts: `in-the-ring-ocapi-versus-scapi`,
  `slas-in-sfra-or-sitegenesis`, `creating-custom-ocapi-endpoints`,
  `how-to-get-a-salesforce-b2c-commerce-cloud-sandbox`
