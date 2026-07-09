# B2C Commerce Architect Certification Guide — July 2026 audit and refresh

## Change summary

`src/content/posts/the-b2c-commerce-architect-certification/index.md` is a 2023 exam-prep article
that reproduces Salesforce's official exam blueprint for the "B2C Commerce Architect" certification.
Like the sibling Developer cert audit, the mandatory first step was verifying the blueprint against
the current official exam guide before touching a line, because a stale blueprint here means a
reader studies the wrong material for a real exam.

**Headline finding, not flagged in the original audit brief: this certification is being retired.**
The current official exam guide, fetched live on 2026-07-09, opens with an "Upcoming Retirement"
notice: last day to register **July 24, 2026**, last day to take the exam **August 31, 2026**,
retirement date **February 1, 2027**. Today's date is 2026-07-09 — registration closes in about two
weeks. A `[!WARNING]` callout was added near the top of the article stating this plainly, since it
changes what a reader should actually do with the rest of the page.

Beyond the retirement notice, the domain weightings turned out to be unchanged, but two "Official
List" objective bullets had drifted from the guide's current wording (both replaced "LINK cartridge"
phrasing with "AppExchange solutions" — the underlying objectives, including the Pipelines one,
are still tested). Separately, this site's own `the-sunsetting-of-arc300-architect-b2c-commerce-solutions`
article (published April 2024, in the author's voice as the course's former instructor) already
established that ARC300 no longer exists, yet this article still presented it as bookable — an
internal self-contradiction, now fixed. OCAPI is officially deprecated platform-wide, so the OCAPI
resource link and the personal "Can I wing it" anecdote were updated to acknowledge SCAPI, though
the exam guide itself never names OCAPI or SCAPI in this domain's objectives. Finally, a full audit
of 64 external and 16 internal links found one dead Trailhead module and two stale course-link
slugs; both were fixed.

## Old vs new behavior

| Aspect | Old | New |
|--------|-----|-----|
| Certification retirement | Not mentioned | Added a `[!WARNING]` callout: retires Feb 1, 2027; register by July 24, 2026; last exam Aug 31, 2026 (per the official exam guide) |
| Domain weightings (29%/19%/14%/22%/16%) | Presented as 2023 fact | Verified unchanged against the current exam guide; left as-is |
| Design/Discovery bullet on integrations | "evaluate LINK cartridges applicable versions, 3rd-Parties' technical specifications..." | Updated verbatim to the current guide: "evaluate applicable versions of AppExchange solutions, third-party technical specifications..." |
| Integrations/Customisations bullet on Pipelines | "identify 'legacy' LINK cartridges that are still using Pipelines..." | Updated verbatim to the current guide: "identify legacy code that still uses Pipelines..." — **Pipelines is still explicitly tested**, only the "LINK cartridge" framing was dropped by Salesforce. Not archived as historical; the objective is current |
| "LINK" terminology | Used unqualified throughout (resource label, both objective bullets) | Confirmed mixed status: gone from the exam guide and from the current "Get to Know B2C Commerce Cartridges" Trailhead module (now "AgentExchange" branding), but still central in the current SFRA developer guide. Removed from the two objective bullets and the stale credential-page resource label; not claimed as fully retired platform-wide |
| "B2C Commerce: LINK Certification Guide" resource link | Linked the credential marketing page (duplicating the intro paragraph's link) with a stale "LINK" label | Relabeled and repointed to the actual official exam guide article (`help.salesforce.com`, id=005298936) |
| OCAPI resource (Integrations/Customisations) | `[Get started with the OCAPI]` presented as the only integration resource, no context | Added `[Get started with the B2C Commerce API (SCAPI)]` as the primary resource; kept the OCAPI link but labeled it deprecated with a pointer to SCAPI, per the official `developer.salesforce.com` OCAPI deprecation banner |
| "Can I wing it" anecdote | "...configuration aspect of the Business Manager, including setting up search, category management, Jobs, and OCAPI, among others." | Anecdote otherwise untouched; only the OCAPI clause updated to "...Jobs, and OCAPI/SCAPI settings, among others." |
| ARC300 course listing | Listed as bookable with a live-looking Trailhead Academy link | Removed; replaced with a sentence linking to this site's own `the-sunsetting-of-arc300-architect-b2c-commerce-solutions` article (sunset April 2024, no successor announced). CCD102 and CCM101 kept — both still in the current exam guide's Recommended Training list |
| CCD102 link | `trailheadacademy.salesforce.com/classes/ccd102-b2c-commerce-developer-with-sfra` | Switched to the exact URL the current exam guide itself links: `trailhead.salesforce.com/en/academy/classes/ccd102-b2c-commerce-developer-with-sfra/` |
| CCM101 link | `.../ccm101-manage-and-merchandise-a-b2c-commerce-cloud-store---extended` | Switched to the shorter slug the current exam guide itself links: `.../ccm101-manage-and-merchandise-a-b2c-commerce-cloud-store` (both resolve; matched to the canonical guide link) |
| Trailhead "Commerce Cloud Features" module (`cc_cccapability`) | Linked as a Design/Discovery resource | Confirmed dead (404, both static and rendered fetch). Its content has dispersed across several newer Agentforce Commerce modules with no single 1:1 successor, so the bullet was removed rather than pointed at an approximate replacement |
| PLC (Partner Learning Camp) link | Linked with no access context | Added a one-time inline "(requires a Salesforce Partner Community login)" note, matching the sibling Developer cert article's treatment of the same system-wide behavior |
| Image captions (Build and Launch section photos) | Alt text only, no caption | Evaluated per the `image-caption-writing` skill and left uncaptioned: both are generic stock photos (people at a table, people with drinks) where any caption would just restate the alt text or the section heading, adding no reader value |
| Front matter | `lastmod` 2026-07-04T17:47:13.000Z | Bumped to 2026-07-09T19:39:01.000Z. `date`, `url`, `title`, `description`, and `takeaways` untouched |

## Full link audit (checked 2026-07-09)

All 64 original external links (63 remaining after removing the one dead module) plus 16 internal
links were checked live: `curl` for HTTP status/redirect behavior on every external URL, followed by
Bonsai rendered fetches for the JS-rendered SPA domains (`trailhead.salesforce.com`,
`trailheadacademy.salesforce.com`, `developer.salesforce.com`, `help.salesforce.com`) where a raw
status code doesn't confirm the actual content resolved. For the ~46 Trailhead module links split
across four distinct trailmix creator/slug wrapper combinations (`mking23`'s
`b-2-c-commerce-architect-certification-prep`, `auser1343`'s
`arc300-salesforce-b2c-commerce-architect-classwork`, a bare `auser1343` link with no slug, and
`globantuniveristy`'s `salesforce-commerce-cloud-architecture`), one representative URL from each
combination was rendered via Bonsai to confirm real module content (badge, description, points)
loads rather than an empty shell — all four returned live content. This mirrors the sampling
approach the Developer cert audit used for its own Trailhead link volume rather than individually
rendering all 46.

| # | URL / category (abridged) | Verdict | Action taken |
|---|---|---|---|
| 1 | help: Official Exam Guide (id=005298936) | Pass — fetched via Bonsai, confirms retirement notice and current bullet wording | Relinked from the credential page; sourced the retirement notice and bullet corrections |
| 2 | trailhead: credential page (`/en/credentials/b2ccommercearchitect`) | Pass | None |
| 3 | developer: OCAPI get-started | Pass (curl 403 was Akamai bot-blocking; confirmed live via Bonsai rendered fetch) | Relabeled as deprecated, SCAPI added alongside |
| 4 | developer: SCAPI get-started (new link) | Pass (same 403/Bonsai-confirmed pattern) | Added as new primary integration resource |
| 5–11 | help: Einstein, Release Notes, Videos, Account Manager, Getting Started, Security Guide, Data Protection (7 `articleView?id=` links) | Pass — all confirmed via Bonsai rendered fetch to return correctly matching titles/content, not just a 200 shell | None. Note: the "Control Centre" label (id=cc.b2c_getting_started.htm) actually renders as "Get Started with B2C Commerce" — a pre-existing minor label/content mismatch, left as-is since the link itself is live and on-topic, and relabeling it is outside this audit's scope |
| 12 | Trailhead: "Commerce Cloud Features" (`cc_cccapability`) | **Dead — 404 on both static and rendered fetch** | Removed; content dispersed across multiple newer Agentforce Commerce modules, no single successor found |
| 13–58 | ~46 Trailhead module links across 4 trailmix wrapper combinations | Pass (sampled one per combination via Bonsai rendered fetch; all returned live module content) | None |
| 59 | PLC: Frontend Architectural Options | Login-walled (expected, systemic partner-gated behavior) | Added "(requires a Salesforce Partner Community login)" note |
| 60–62 | Vidyard: SFRA overview, Reports & Dashboards access, AB Testing webinars (3 links) | Pass — confirmed via `og:title`/`og:description` metadata matching the article's own link labels | None |
| 63 | Trailhead Academy CCD102 | Pass, but URL didn't match the guide's own link | Switched to the guide's canonical URL |
| 64 | Trailhead Academy CCM101 | Pass (both slugs resolve) | Switched to the guide's canonical (shorter) slug |
| — | Trailhead Academy ARC300 | **Dead concept — course sunset April 2024** (confirmed by this site's own `the-sunsetting-of-arc300-architect-b2c-commerce-solutions` article, corroborated by ARC300's absence from the current exam guide's Recommended Training list) | Removed; replaced with a link to the sunsetting article |
| — | 16 internal links | Pass, all 16 (one — `/salesforce-b2c-commerce-cloud-erd/` — briefly flagged as missing because it's a `src/content/pages/` entry, not a `posts/` entry; re-verified as a live page) | None |

**Result: 2 confirmed dead links (the Trailhead module, the ARC300 course) out of 80 checked
(64 external + 16 internal), plus 2 canonical-URL normalizations. Both dead links were fixed with a
forward link or removal reasoning above — neither silently dropped.**

## Fact-check notes

- **Exam guide content and retirement notice**: fetched via `npx @taurgis/bonsai "https://help.salesforce.com/s/articleView?id=005298936&type=1&language=en_US" --format detailed` on 2026-07-09. Confirms: "Upcoming Retirement — Effective February 1, 2027... Last day to register: July 24, 2026 · Last day to take the exam: August 31, 2026." "Version: Exam questions align to the Spring '24 release." Domains/weightings 29%/19%/14%/22%/16% all confirmed exact matches.
- **Design/Discovery objective bullet**: current guide text is "Given systems integration requirements and technical details, evaluate applicable versions of AppExchange solutions, third-party technical specifications, and API documentation for integrations" (same Bonsai fetch as above). No Wayback Machine snapshot exists for this Help article ID, so the exact date the "LINK cartridges" → "AppExchange solutions" wording changed could not be pinned down — flagged as an unconfirmed-timing gap rather than guessed.
- **Integrations/Customisations objective bullet**: current guide text is "Given a list of third-party AppExchange solutions, identify legacy code that still uses Pipelines and define an integration approach with Controllers" (same fetch). Pipelines remains an explicitly tested concept; only the cartridge-branding language changed.
- **"LINK" terminology status**: the exam guide and the current Trailhead "Get to Know B2C Commerce Cartridges" module (fetched at `trailhead.salesforce.com/content/learn/modules/b2c-cartridges/b2c-cartridges-explore`) both use "AppExchange solutions" / "AgentExchange" and contain zero instances of "LINK." The current SFRA developer guide (`developer.salesforce.com/docs/commerce/sfra/guide/b2c-sfra-features-and-comps.html`) still explicitly says "LINK partners... provide LINK cartridges." Treated as legacy-but-not-fully-retired terminology, not a platform-wide rename.
- **OCAPI/SCAPI**: neither "OCAPI" nor "SCAPI" appears anywhere in the current exam guide's Integrations and Customisations objectives (confirmed by full-text search of the Bonsai-fetched guide). The OCAPI deprecation itself is confirmed via the `developer.salesforce.com/docs/commerce/b2c-commerce/references/b2c-commerce-ocapi` section-index page banner: "The Open Commerce API (OCAPI) is now deprecated... For all new projects and major refactoring work, use B2C Commerce API (SCAPI) as the default REST API." Cross-referenced against this campaign's `docs/content/ocapi-endpoints-article-refresh-2026-07.md` (OCAPI deprecated platform-wide April 2026).
- **ARC300**: this site's own `src/content/posts/the-sunsetting-of-arc300-architect-b2c-commerce-solutions/index.md` (dated 2024-04-29, author's first-person account as a former ARC300 instructor) states: "In April 2024, the course was sunsetted... Since no alternative course is available yet, you will have to resort to all resources available on Trailhead, the Partner Learning Camp, and... my own blog" — which links back to this very article. Corroborated by the current exam guide's Recommended Training list, which names only CCD102 and CCM101, no ARC300.
- **CCD102/CCM101 canonical links**: both pulled directly from the current exam guide's own "Recommended Training and Resources" section (same Bonsai fetch), lines linking `https://trailhead.salesforce.com/en/academy/classes/ccd102-b2c-commerce-developer-with-sfra/` and `https://trailheadacademy.salesforce.com/classes/ccm101-manage-and-merchandise-a-b2c-commerce-cloud-store`.
- **Trailhead Academy live-booking status**: could not be independently confirmed beyond HTTP 200 — `trailheadacademy.salesforce.com` class pages are a client-rendered SPA that returns an empty generic shell to both static and rendered fetch attempts (no course-specific text for CCD102, CCM101, or the now-removed ARC300 slug). Flagged as a tooling limitation, not asserted as confirmed live booking.
- **Trailhead trailmix wrapper links**: one representative URL from each of the four distinct trailmix creator/slug combinations used across ~46 links was rendered via Bonsai and returned live module content (badge, description, points) in all four cases — no evidence of a dead trailmix wrapper, unlike the Developer cert audit's Maxime Rebibo case.

## Impact and verification

- Impacted: one published post only (`src/content/posts/the-b2c-commerce-architect-certification/index.md`). `date`, `url`, `title`, `description`, and `takeaways` untouched.
- Verify with: `npm run validate:frontmatter`, `npm run check:spelling`, `npx markdownlint-cli2 "src/content/posts/the-b2c-commerce-architect-certification/index.md"`, `npm run build:local`.

## Related files

- `src/content/posts/the-b2c-commerce-architect-certification/index.md`
- `src/content/posts/the-sunsetting-of-arc300-architect-b2c-commerce-solutions/index.md` (ARC300 sunset source)
- `docs/content/preparing-for-the-b2c-commerce-developer-certification-refresh-2026-07.md` (sibling audit, shared OCAPI/SCAPI and link-rot risk categories)
- `docs/content/ocapi-endpoints-article-refresh-2026-07.md` (OCAPI platform-wide deprecation source)
- `src/content/posts/creating-custom-ocapi-endpoints/index.md` (preserve-and-explain archive pattern referenced during planning)
- Cross-linked posts: `src/content/posts/how-to-use-ocapi-scapi-hooks/index.md`, `src/content/posts/what-is-the-ocapi-session-bridge/index.md`
