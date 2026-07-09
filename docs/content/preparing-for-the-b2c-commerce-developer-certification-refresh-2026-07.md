# B2C Commerce Developer certification prep — July 2026 audit and refresh

## Change summary

`src/content/posts/preparing-for-the-b2c-commerce-developer-certification/index.md` is a 2022
article that reproduces Salesforce's official exam blueprint for the "B2C Commerce Developer"
certification. Unlike the site's own SLAS and SiteGenesis/SFRA/PWA audits — which corrected this
site's own technical claims — this article gives advice about a real, external,
Salesforce-controlled exam. The mandatory first step was verifying the blueprint against the
current official exam guide before touching a single line, because a stale blueprint here means a
reader studies the wrong material for a real exam.

**Headline finding: the blueprint has not changed.** The current official exam guide, fetched live
on 2026-07-09, is still version-locked to the Spring '23 release — same four domains, same
weightings, same objective wording, OCAPI objectives included verbatim. The one genuine, dated,
sourced change is administrative, not technical: Salesforce renames this credential on **July 24,
2026** (name only, confirmed via the official Certification Name Changes FAQ). The refresh adds
that note, a scoped OCAPI-vs-SCAPI context callout, one new resource (Headless Commerce Basics,
newly present in the exam guide's own recommended-training list), and fixes for five confirmed dead
or degraded links out of 45 audited.

## A note on tooling reliability during this audit

Raw `WebFetch` against `help.salesforce.com` (a JS-rendered SPA) produced two internally
inconsistent, untrustworthy results on the first two attempts — including reproducing the article's
own 2022 content back at itself and inventing different passing-score figures between attempts.
A `WebSearch` AI summary separately claimed the exam had been restructured to three domains
(9%/35%/56%), sourced only from unofficial exam-dump/study-guide sites (`trailblazeprep.com`,
`passitexams.com`). Neither was acted on. The reliable read came from **Bonsai**
(`npx @taurgis/bonsai`), this repo's mandated tool for JS-rendered Salesforce Help/Developer pages,
which returned a clean, internally consistent, properly structured document. The three-domain claim
is confirmed false by the authoritative source — flagged here so a future editor doesn't
resurrect it from a search summary.

## Old vs new behavior

| Aspect | Old | New |
|--------|-----|-----|
| Certification name | Article title/intro assumed "B2C Commerce Developer" with no context | Added a dated note: Salesforce renames the credential from "Salesforce Certified B2C Commerce Cloud Developer" to "Salesforce Certified B2C Commerce Developer" on 2026-07-24 — name only, no content/maintenance change, per the official FAQ |
| Domains and weightings (11%/12%/24%/53%) | Presented as 2022 fact | Verified unchanged against the current exam guide (still Spring '23-aligned); left as-is |
| OCAPI objectives (Data Management: "configure OCAPI permissions…"; Application Development: "use OCAPI Shop and Data APIs…") | Presented as current fact with no platform context | Wording unchanged (confirmed still verbatim in the current guide) — but a `[!NOTE]` callout added explaining the guide is Spring '23-locked and still tests OCAPI even though the platform deprecated OCAPI in April 2026 (maintenance mode into 2028) |
| SCAPI / Composable Storefront / PWA Kit / headless coverage | Entirely absent | Still absent from the scored Exam Outline (confirmed) — **not** invented. One new resource added: the current guide's own Recommended Training list now includes a "Headless Commerce Basics" Trailhead module that wasn't in the guide (or this article) in 2022 |
| `b2c.learncommercecloud.com` (line 65 area) | "One-stop shop" link, third-party site | Domain no longer resolves (DNS failure). Replaced with Salesforce's own `trailheadacademy.salesforce.com/products/commerce-cloud`; surrounding sentence reworded to avoid overclaiming what the new page covers |
| Maxime Rebibo's Trailhead trailmix (line ~73) | Live personal trailmix, credited by name | Confirmed dead (renders only the generic Trailhead shell, no trailmix content — consistent with a user-tied trailmix going stale). Removed rather than left crediting a resource that no longer exists; no equivalent replacement found |
| Live SFRA Demo Site (`production-sitegenesis-dw.demandware.net/s/RefArch/...`) | Linked as "Live SFRA Demo Site" | Confirmed dead (403), matching the identical URL already flagged dead in the sibling `sitegenesis-vs-sfra-vs-pwa` refresh. Replaced with the official `developer.salesforce.com/docs/commerce/sfra/guide/sfra-overview.html` |
| "Salesforce Events" link (`cs.salesforce.com/events?filter=...`) | Linked as a B2C-Commerce-filtered events page | Confirmed the filter is lost — 301s to a generic Success Plan page. A candidate replacement (`cs.salesforce.com/product/commerce`) was checked and found to redirect to the exact same generic page, so no viable replacement exists. Removed rather than left pointing at unrelated content |
| "Webinar: Getting Started with Page Designer" (Vidyard) | Linked as a specific webinar | Confirmed dead — resolves but its `og:` metadata now points to the generic salesforce.com homepage, meaning the original video is gone, not just relocated. Removed; no recoverable replacement |
| OCAPI Settings doc link | Linked with no context | Confirmed the page itself now carries a "(deprecated)" label in its title. Added a short inline note pointing back to the OCAPI-vs-SCAPI callout |
| CCM101 course link | `.../ccm101-manage-and-merchandise-a-b2c-commerce-cloud-store---extended` | Both the old and a shorter slug (`.../ccm101-manage-and-merchandise-a-b2c-commerce-cloud-store`) resolve today, but the current official exam guide itself links the shorter form — switched to match the canonical link |
| PLC (Partner Learning Camp) links (9 total) | Linked with no access context | Confirmed "Partner Learning Camp" is still the current 2026 name (not renamed). Every PLC catalog link systemically serves an HTTP 200 page that's actually a client-side redirect to the partner login screen for unauthenticated readers — expected behavior for a partner-gated system, and already disclosed in the article's own "I'm not a partner. Can I access PLC" section. Added a one-time inline parenthetical at the first PLC link (login required) rather than repeating it nine times |
| Google Form "Knowledge Check" quiz | Linked with an "(Unknown who made this)" disclaimer already in the article | Confirmed live and functioning. Kept — it's already honestly caveated by the author as unattributed, which is different from silently presenting an unowned resource as authoritative; removing it would be an editorial judgment call beyond this refresh's scope |
| "Can I wing it" anecdote | Author's SiteGenesis-era pass-without-much-prep story, presented with no framing | Anecdote text itself untouched (per the task's explicit instruction not to alter the author's history). Added one sentence framing it as exam history, not a preview of the current exam |
| Front matter | `lastmod` 2026-07-04T14:20:18.000Z | Bumped to 2026-07-09T14:12:13.000Z. `date`, `url`, `title`, `description`, and `takeaways` untouched |

## Full link audit (checked 2026-07-09)

All 45 external links plus the exam-guide cross-reference (46 total) were checked live via a
combination of direct fetch, raw HTTP status/redirect-chain inspection, and — for JS-rendered SPA
domains that return identical shell HTML for valid and invalid routes (`help.salesforce.com`,
`trailhead.salesforce.com`, `trailheadacademy.salesforce.com`, `partnerlearningcamp.salesforce.com`)
— cross-verification against search-index snapshots of the same URL, the same method the sibling
WebDAV audit used for `help.salesforce.com`.

| # | URL (abridged) | Verdict | Action taken |
|---|---|---|---|
| 1 | trailhead.../b2c-on-demand-sandbox | Pass | None |
| 2 | trailhead.../cc-digital-for-developers (malformed trailmix params) | Pass, minor issue | Left as-is — base link works, query string cosmetic only |
| 3 | trailhead.../b2c-developer-resources-and-tools | Pass | None |
| 4 | PLC: Environment Setup | Login-walled (expected) | Added "(requires a Salesforce Partner Community login)" note |
| 5 | vidyard: SFRA overview webinar | Pass | None |
| 6 | b2c.learncommercecloud.com | **Dead — DNS failure** | Replaced with `trailheadacademy.salesforce.com/products/commerce-cloud`; sentence reworded |
| 7 | trailhead.../trails/cc-overview | Pass | None |
| 8 | trailhead.../trails/administer-b2c-commerce | Pass | None |
| 9 | trailhead: Maxime Rebibo trailmix | **Dead — shell only, content gone** | Removed |
| 10 | production-sitegenesis-dw.demandware.net SFRA demo | **Dead — 403** | Replaced with `developer.salesforce.com/docs/commerce/sfra/guide/sfra-overview.html` |
| 11 | help: B2C Commerce Videos | Pass (SPA shell limitation, confirmed live via search index) | None |
| 12 | cs.salesforce.com/events?...b2c-commerce | **Degraded — 301 to generic page, filter lost** | Removed; no working replacement found |
| 13 | vidyard: Page Designer webinar | **Dead — og: metadata points to salesforce.com homepage** | Removed |
| 14 | developer: Customer Service Centre | Pass | None |
| 15 | help: Search overview | Pass (SPA shell limitation, confirmed live) | None |
| 16 | developer: Log Files overview | Pass | None |
| 17 | developer: Business Objects (x2) | Pass | None |
| 18 | developer: Site Performance (x2) | Pass | None |
| 19 | GitHub Pages: Legacy Developer Documentation PDF | Pass | None |
| 20 | help: Technical Dashboard | Pass (SPA shell limitation, confirmed live) | None |
| 21 | developer: Troubleshooting Performance | Pass | None |
| 22 | developer: Content Cache | Pass | None |
| 23 | help: Cache Information Tool | Pass (SPA shell limitation, confirmed live) | None |
| 24 | developer: Custom Caches | Pass | None |
| 25 | developer: OCAPI Settings | Pass, page now labelled "(deprecated)" | Added inline note referencing the OCAPI-vs-SCAPI callout |
| 26 | vidyard: OCAPI & Web Service Framework webinar | Pass | None |
| 27 | GitHub Pages: Standard Job Steps API | Pass | None |
| 28–36 | PLC catalog links (Cartridges, SFRA Controllers/Models, ISML, Client JS, Forms, Transactions, Job Framework, Commerce API) | Login-walled (expected, systemic) | Confirmed "Partner Learning Camp" still current 2026 name; no per-link changes (see note at #4) |
| 37 | vidyard: SFRA Architecture Deep Dive | Pass — also the exam guide's own linked resource | None |
| 38–42 | share.vidyard.com webinars (Modules 2–5, Developer Academy) | Pass | None |
| 43 | Google Form "Knowledge Check" quiz | Pass, live | Kept, already self-caveated by the author |
| 44 | Trailhead Academy CCD102 | Pass | None |
| 45 | Trailhead Academy CCM101 | Pass (both slugs resolve) | Switched to the canonical slug used by the current exam guide |
| — | Exam guide cross-reference (`id=005298941`) | Pass — confirmed via Bonsai, not just status code | None |

**Result: 5 confirmed dead/degraded links out of 46 checked** (learncommercecloud.com, the Rebibo
trailmix, the SFRA demo site, the Salesforce Events link, the Page Designer webinar). All five were
fixed, replaced, or removed with the reasoning above — none silently dropped.

## Fact-check notes

- **Exam guide content**: fetched via `npx @taurgis/bonsai "https://help.salesforce.com/s/articleView?id=005298941&language=en_US&type=1" --format detailed`
  on 2026-07-09. Confirms: four domains at 11%/12%/24%/53%, all "Official List" bullets verbatim
  (aside from the article's existing British-spelling variants, e.g. "categorisation" vs. the
  guide's "categorization" — a pre-existing style choice, not a content drift, and left alone since
  this site's spelling gate (`npm run check:spelling`) checks against a British English
  dictionary), "Version: Exam questions align to the Spring '23 release," passing score 65%, 60
  scored + up to 5 unscored questions, 105 minutes, US$200/US$100 retake.
- **OCAPI objectives**: confirmed still present verbatim in the current guide. Cross-referenced
  against this campaign's own `docs/content/ocapi-endpoints-article-refresh-2026-07.md` and the
  `in-the-ring-ocapi-versus-scapi` article for the platform-side deprecation date (April 2026,
  maintenance mode into ~April 2028). No SCAPI wording found anywhere in the scored Exam Outline —
  did not invent an SCAPI rewrite that the source doesn't support.
- **Certification name change**: fetched via Bonsai,
  `https://help.salesforce.com/s/articleView?id=005298915&language=en_US&type=1`
  ("Salesforce Certification Name Changes FAQ") on 2026-07-09. Row 9 of the official 16-certification
  table: "Salesforce Certified B2C Commerce Cloud Developer" → "Salesforce Certified B2C Commerce
  Developer," effective 2026-07-24. The FAQ explicitly states exam content and maintenance
  requirements are unaffected — name only.
- **Three-domain (9%/35%/56%) claim**: traced to unofficial exam-dump/study-guide sites via
  `WebSearch`, not to Salesforce. Contradicted directly by the Bonsai-fetched official guide.
  Recorded here so it doesn't get treated as a lead in a future pass.
- **Headless Commerce Basics module**: confirmed present in the current guide's "Recommended
  Training and Resources" list (not the 2022 guide's, which the article's original resource list
  matches item-for-item otherwise) and confirmed live (`curl` 200) at
  `trailhead.salesforce.com/en/content/learn/modules/b2c-headless-commerce-basics?trail_id=develop-for-commerce-cloud&trailmix_creator_id=strailhead`.
  Added to the B2C Commerce Setup resource list, matching where it sits in the guide's own trail
  structure.
- **PDF exam guide** (`developer.salesforce.com/resources2/certification-site/files/SGCertifiedB2CCommerceDeveloper.pdf`):
  downloaded as a genuine 398 KB binary during research, but this environment has no
  `pdftotext`/PyPDF2/equivalent, and a manual `zlib` stream-extraction attempt only decompressed 1
  of 73 internal PDF object streams (binary data corrupting the naive `stream…endstream` boundary
  match). Not used as a source; the Bonsai-rendered Help page and the Trailhead credential page
  were sufficient corroboration instead.

## Impact and verification

- Impacted: one published post only. `date`, `url`, `title`, `description`, and `takeaways`
  untouched.
- Verified with: `npm run validate:frontmatter` (197 files, pass), `npm run check:spelling` (pass,
  no new allow-list entries needed), `npx markdownlint-cli2` on the post (0 errors), `npm run
  build:local` (Hugo build).

## Related files

- `src/content/posts/preparing-for-the-b2c-commerce-developer-certification/index.md`
- `docs/content/ocapi-endpoints-article-refresh-2026-07.md` (OCAPI deprecation source)
- `docs/content/sitegenesis-vs-sfra-vs-pwa-refresh-2026-07.md` (reused SFRA demo dead-link finding)
- `docs/content/webdav-article-refresh-2026-07.md` (link-audit methodology template)
- Cross-linked posts: `in-the-ring-ocapi-versus-scapi`, `getting-to-know-sfra-as-a-developer`
