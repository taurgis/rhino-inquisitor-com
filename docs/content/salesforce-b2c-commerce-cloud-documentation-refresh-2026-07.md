# "Salesforce B2C Commerce Cloud Documentation" — July 2026 audit and refresh

## Change summary

`src/content/posts/salesforce-b2c-commerce-cloud-documentation/index.md` carries a
`date` of 2022-05-09, but the body was substantially rewritten at some point after
mid-2023 to cover the Infocenter retirement — the only git history entry for this
file is a single bulk migration commit, so the rewrite predates this repository.
That rewrite is also the article `src/content/posts/AGENTS.md` names directly (line
46) as the *before* example of an over-polished register the site's writing style
guide is moving away from, quoting the article's own "This article is not another
list of stale links. It is a field manual" line and instructing "write closer to
the baseline" (the unassisted 2022 posts). This refresh treats that voice
correction as a required part of the audit, not optional polish, per that explicit
callout.

Three kinds of work went into this pass:

1. **A real internal-consistency fix.** The closing section claimed the article
   "provided a strategic framework for choosing between OCAPI and SCAPI" — no such
   framework exists anywhere in the body, and the premise itself is stale now that
   OCAPI is deprecated (confirmed live this task — see Fact-check notes). Fixed by
   correcting the closing claim and adding a deprecation note to the OCAPI row in
   the relocation-map table, cross-linking `/in-the-ring-ocapi-versus-scapi/` rather
   than trying to compress that article's content into a paragraph here.
2. **A full link audit** of all 16 external links (the article has slightly more
   than the ~13 originally estimated once the duplicate GitHub Pages citation and
   the two-link Trailhead intro replacement are counted individually) — see the
   Link audit table below.
3. **The voice pass** named by AGENTS.md — rewrote the opening three paragraphs and
   the closing section, and tightened three more paragraphs elsewhere in the body
   that used the same inflated register (the CommerceCrew "required competency for
   any top-tier professional" / "true mastery is forged" close, and the Partner
   Learning Camp "critical step in levelling up their team's capabilities" close).

## Old vs new behavior

| Aspect | Old | New |
|---|---|---|
| Closing claim | "provided a strategic framework for choosing between OCAPI and SCAPI" (no such content exists in the body) | Corrected to reference the relocation map's OCAPI deprecation flag instead, with a cross-link to the dedicated OCAPI-vs-SCAPI article |
| OCAPI relocation-map row | Presented as a normal, undated "new location" entry | Flagged inline as deprecated, with a `> [!NOTE]` callout citing Salesforce's own "Attention! ... is now deprecated" banner and title |
| B2C Commerce Release Notes row | Pointed at `sf.b2c_rn_release_notes.htm`, which now itself redirects readers to a newer article | Row updated to link the current `release-notes.rn_b2c.htm` article directly, with a note that this is the *second* relocation since the original migration |
| Trailhead intro link | Single link to a live, sorted search query (`trails?products=commercecloud&sort=NEWEST`) — content changes by design, never a stable citation | Replaced with two stable, curated trail landing pages (admin/merchandiser trail and developer trail) |
| Escaped underscores | `sf.b2c\_rn\_release\_notes.htm`, `cc.b2c\_merchandising\_your\_site.htm`, etc. (WordPress-migration artifacts) across 4 links | Cleaned to plain underscores |
| Alt text (2 images) | "Astro cheering"; "The Solution Architect certification diagram." | Rewritten to describe what each image actually shows, confirmed by viewing both files |
| Opening (3 paragraphs) | Sustained "north star ... gone supernova" metaphor, "digital scavenger hunt," "not another list of stale links ... field manual ... cut through the chaos," inflated-importance line ("not just an inconvenience; it's a drag on productivity"), redundant roadmap sentence | Plain scenario opening, dry idioms, one anchored metaphor ("the documentation hasn't settled any more than the platform has"), roadmap sentence cut entirely |
| Closing section | "The Map in Your Hands" heading, "field manual," CTA-style close ("Go build something incredible") | Plain heading ("Where things stand now"), ends on a hedge from experience ("Give it a few weeks"), no CTA |
| CommerceCrew closing paragraph | "underscore a critical shift in professional practice ... true mastery is forged" | Grounded first-person claim about where bugs actually get solved |
| PLC closing sentence | "a critical step in levelling up their team's capabilities" | Concrete stakes framing ("training budget left on the table") |
| `lastmod` | `2026-07-04T15:28:48.000Z` | `2026-07-10T14:17:21.000Z` (`date` and `url` untouched) |

## Fact-check notes

- **Infocenter retirement date**: confirmed **July 15, 2023** via the official
  Salesforce Help article
  [B2C Commerce Infocenter Retirement](https://help.salesforce.com/s/articleView?id=sf.rn_infocenter_retirement.htm&type=5),
  fetched live this task: "The Salesforce B2C Commerce Infocenter is being retired
  on July 15, 2023 ... Between June 15 and July 15, B2C Commerce documentation will
  be available in both the Infocenter and its new locations." This matches the
  date already stated in this site's own `where-is-the-new-sfcc-documentation`
  article (which quotes the same announcement) — no discrepancy between the two
  posts.
- **OCAPI deprecation status**: confirmed live via
  `https://developer.salesforce.com/docs/commerce/b2c-commerce/references`, which
  opens with "Attention! The Open Commerce API (OCAPI) is now deprecated. The
  provisions described in our versioning and deprecation policy fully apply. For
  all new projects and major refactoring work, use B2C Commerce API (SCAPI) as the
  default REST API," and whose page title renders as "Open Commerce API
  (deprecated)" in search results. This matches (and is now cited directly by) this
  site's own `in-the-ring-ocapi-versus-scapi` article, which states OCAPI was
  officially deprecated in April 2026. The specific "maintenance until ~April 2028"
  window quoted in that sibling article traces back to the general per-version
  two-year support window in Salesforce's
  [OCAPI Versioning and Deprecation Policy](https://developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-commerce-ocapi/versioninganddeprecationpolicy.html) —
  that policy page describes the ordinary per-version lifecycle rather than a
  named company-wide end-of-life date, so this refresh's new OCAPI note in the
  target article deliberately avoids repeating an unconfirmed specific end date and
  cites only the confirmed "deprecated, security patches only" facts, cross-linking
  the sibling article for readers who want the fuller migration timeline.
- **CommerceCrew Slack membership figure**: confirmed live via
  `https://unofficialsfcc.com/`, whose page text reads "Join the Unofficial SFCC
  Slack community, with over 12,000 members" — an exact match for the article's
  existing claim. Left unchanged. Note this is the community site's own
  self-reported, static figure rather than a live Slack member counter, but it is
  accurate to what the community currently publishes about itself.
- **Community gateway consistency check** (against
  `what-does-the-composable-storefront-mean-for-sfcc-developers`, which links
  `github.com/sfcc-unofficial/docs` for "Unofficial Slack"): confirmed these are
  two distinct, non-conflicting gateways into the *same* community rather than two
  different vintages of the same resource. `unofficialsfcc.com` is the
  marketing/join portal (join link, podcast, member count); `github.com/sfcc-unofficial/docs`
  is the community's own documentation/open-source-tools repository, which
  references joining via `sfcc-unofficial.slack.com` directly and doesn't use the
  "CommerceCrew" branding. Both articles linking one each is accurate; no edit
  needed to either link, and this article doesn't imply the two URLs are identical.

## Link audit (2026-07-10)

All links checked live via Bonsai (`npx @taurgis/bonsai <url> --format detailed`).
Per the known `help.salesforce.com` gotcha (documented in
`webdav-article-refresh-2026-07.md`): the site is a single-page app that returns
the same 200/301 shell for valid and invalid article IDs, so a non-error HTTP
response alone doesn't confirm an article ID is current — each `help.salesforce.com`
link below was checked for matching rendered content, not just response status.

| Link | Status | Action |
|---|---|---|
| `help.salesforce.com` — B2C Commerce Release Notes (`sf.b2c_rn_release_notes.htm`) | Drifted | The old ID still renders, but the page itself now redirects readers to `release-notes.rn_b2c.htm` (Salesforce moved release notes again as of release 26.3). Row updated to link the current article directly, with a note about the second relocation. |
| `developer.salesforce.com/docs/commerce/b2c-commerce/overview` — Developing Your Site | Valid | Live, matching content. No change. |
| `developer.salesforce.com/docs/commerce/b2c-commerce/guide/api-doc.html` — OCAPI table row | Valid, but not the deprecation source | Page is a live, correct API-doc landing page, but the deprecation banner itself lives one click deeper, on `/docs/commerce/b2c-commerce/references`. Row link kept as the correct relocation target; the new `> [!NOTE]` callout cites the `/references` page directly for the deprecation banner. |
| `salesforcecommercecloud.github.io/b2c-dev-doc/` (cited twice: Script API row, Legacy Developer Documentation row) | Valid | Live, current content (26.5/26.6 release cycle, Script API, Pipelet API, schemas, Legacy Developer Documentation PDF link). No change. |
| `help.salesforce.com` — Merchandising Your Site (`cc.b2c_merchandising_your_site.htm`) | Valid | Live, matching content. Only the escaped underscores were fixed. |
| `help.salesforce.com` — Administering Your Organisation (`cc.b2c_administering_your_organization.htm`) | Valid | Live, matching content. Only the escaped underscores were fixed. |
| `help.salesforce.com` — B2C Commerce Security Guide (`cc.b2c_commerce_security_guide.htm`) | Valid | Live, matching content. Only the escaped underscores were fixed. |
| `unofficialsfcc.com/` | Valid | Live, confirmed the "12,000 members" figure and the correct join gateway. No change. |
| `trailhead.salesforce.com/trails?products=commercecloud&sort=NEWEST` | Unstable, needed replacement | Confirmed this is a live, client-side-sorted search result with no stable article content — exactly the "will never 404 but never points at what it pointed at" problem flagged before checking. Replaced with two stable, curated trail pages: [Get Started with Salesforce B2C Commerce](https://trailhead.salesforce.com/content/learn/trails/get-started-with-salesforce-b2c-commerce) and [Develop for Salesforce B2C Commerce](https://trailhead.salesforce.com/content/learn/trails/develop-for-commerce-cloud). |
| `trailhead.salesforce.com/.../modules/cc-digital-for-developers` | Valid | Live; confirmed this module's own parent trail is `develop-for-commerce-cloud` (the replacement link above), corroborating that choice. No change. |
| `trailhead.salesforce.com/.../trails/build-your-career-as-a-salesforce-b2c-commerce-technical-architect` | Valid | Live; content now also mentions Agentforce Commerce architect roles, but the URL and topic mapping are unchanged. No change. |
| `trailhead.salesforce.com/.../modules/b2c-headless-commerce-basics` | Valid | Live, matching content. No change. |
| `trailhead.salesforce.com/.../modules/b2c-on-demand-sandbox` | Valid, title drift | Live; module is now branded "Agentforce Commerce for B2C On-Demand Sandboxes." URL unchanged; table label annotated to reflect the rebrand. |
| `trailhead.salesforce.com/.../modules/b2c-implement-functional-solution` | Valid | Live, matching content. No change. |
| `partnerlearningcamp.salesforce.com/s/learner-dashboard` | Valid (gated) | Redirects unauthenticated visitors to an SSO/Trailblazer.me login wall — expected behaviour for a partner-only resource, not a dead link. No change. |
| `architect.salesforce.com/` | Valid | Live, current 2026 content (Architecture Center, Well-Architected Framework, Decision Guides). No change. |

## Impact and verification

- Impacted: one published post. `date`, `url`, `title`, `description`, and hero
  image untouched. `lastmod` bumped to `2026-07-10T14:17:21.000Z`.
- No second post was edited — the community-gateway cross-check confirmed
  `what-does-the-composable-storefront-mean-for-sfcc-developers` already links a
  valid, non-conflicting resource, so no changes were needed there.
- Verified with: `npm run validate:frontmatter` (197 files, passed),
  `npm run check:spelling` (197 files, no issues), `npx markdownlint-cli2` on the
  post (0 errors), and `npm run build:local`. `node_modules` was not present at
  the start of this task and had to be installed
  (`PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install`, since this sandbox uses a
  pre-installed Chromium rather than Puppeteer's own download) before any gate
  could run.
- Research performed via the `salesforce-docs-researcher` subagent, with sources
  fetched and cached through Bonsai (`.bonsai/research/*.md`, included in this
  change per the shared-cache convention).

## Related files

- `src/content/posts/salesforce-b2c-commerce-cloud-documentation/index.md`
- `src/content/posts/AGENTS.md` (source of the voice-pass requirement, line 46)
- Cross-linked/cross-checked posts: `where-is-the-new-sfcc-documentation`,
  `in-the-ring-ocapi-versus-scapi`,
  `what-does-the-composable-storefront-mean-for-sfcc-developers`
