# "What Composable Storefront Means for SFCC Developers" — July 2026 retrospective refresh

## Change summary

`src/content/posts/what-does-the-composable-storefront-mean-for-sfcc-developers/index.md`
is a January 2023 **opinion piece** — the author states directly in the article that
"this article is my opinion and my opinion alone." Unlike every other article refreshed
in this campaign so far, the job here was not to correct stale facts as bugs. It was to
let the author honestly revisit his own 2023 predictions with 2026 hindsight, in his own
reflective first-person voice, the way he already does mid-article ("That felt like an
inspirational speech, didn't it?").

Three predictions from the original article got a retrospective look:

1. **SFRA being phased out within five years of the "Core" push** — the five-year window
   (from January 2023) hasn't closed yet, so this can't be marked right or wrong. But the
   platform's direction of travel has shifted visibly since 2023, and the article now says
   so honestly instead of staying silent.
2. **"We might even be able to build custom SCAPI endpoints... soon!"** — this came true.
   SCAPI Custom APIs went GA in the 24.2 release.
3. **"Customisations to SCAPI, OCAPI, and Business Manager will be in high demand"** — the
   OCAPI half of this take has aged badly given the platform-wide OCAPI deprecation, and
   the article now says so in the same reflective voice as (1) rather than silently
   dropping "OCAPI" from the sentence.

A fourth addition, made at the site owner's explicit request mid-task and not part of the
original audit brief: a short, scoped new section on **Storefront Next**, Salesforce's
newer GA headless product that now ranks ahead of PWA Kit in Salesforce's own product
guidance. Kept deliberately small — one short section, no feature-parity claims, matching
how the sibling `sitegenesis-vs-sfra-vs-pwa` refresh handled the same finding.

The self-aware "inspirational speech" crescendo (lines 36-38, punchline at line 40) and
the "Career Aspirations" closing section were left untouched — they are the author's
intentional voice, not scaffolding to clean up, per an explicit instruction to preserve
them.

## Old vs new: predictions and their outcomes

| Prediction (2023) | Status as of July 2026 | What changed in the article |
|---|---|---|
| "I don't see [SFRA being phased out] happening within the next five years" | Not falsifiable yet (window doesn't close until ~Jan 2028), but the platform's direction has moved: OCAPI fully deprecated April 2026, Hybrid Auth now native, Composable Storefront push visibly accelerated | Added a first-person retrospective aside right after the "inspirational speech" punchline (line 40): honest about the shift, doesn't declare the prediction wrong, cross-links `/in-the-ring-ocapi-versus-scapi/` |
| "We might even be able to build custom SCAPI endpoints using the same system as controllers soon!" | Came true — SCAPI Custom APIs went GA in release 24.2 (beta in 23.9), full CRUD + transactions via `dw.system.RESTResponseMgr` | Added a dry, plainly-stated "called it" note directly after the original sentence, cross-linking `/creating-custom-ocapi-endpoints/` |
| "Customisations to SCAPI, OCAPI, and Business Manager will be in high demand" | The OCAPI half hasn't held up — OCAPI is deprecated platform-wide and running on security patches only; that demand is migrating to SCAPI | Added a retrospective note in the same reflective voice, explicitly referencing back to the SFRA-longevity aside, cross-linking `/in-the-ring-ocapi-versus-scapi/`; the Business Manager half of the claim stands unchanged |
| (not part of the 2023 article — added by explicit request) | Salesforce's own product guidance now recommends **Storefront Next** (React Router 7, React 19, Tailwind CSS, shadcn/ui) ahead of both SFRA and PWA Kit, with an official PWA-Kit-to-Storefront-Next migration guide | New short section, "A 2026 footnote: Storefront Next," added before "Career Aspirations" — one paragraph, no parity claims, cross-links `/sitegenesis-vs-sfra-vs-pwa/` and the official Salesforce doc |

## Fact-check notes

- **OCAPI deprecation (April 2026)**: confirmed via this site's own `in-the-ring-ocapi-versus-scapi`
  article (line 26), itself sourced from a genuine Salesforce page
  (`developer.salesforce.com/docs/commerce/commerce-api/guide/why-use-scapi.html`:
  "OCAPI is marked deprecated as of April 2026").
- **SCAPI Custom APIs GA in 24.2**: confirmed via this site's own
  `docs/content/ocapi-endpoints-article-refresh-2026-07.md`, which documents beta in 23.9
  (GET only) and GA in 24.2 with full POST/PUT/PATCH/DELETE and transaction support via
  `dw.system.RESTResponseMgr`.
- **Storefront Next**: independently verified this task via direct fetch of
  `developer.salesforce.com/docs/commerce/commerce-api/guide/which-product.html`, which
  lists Storefront Next as the "Recommended option" ahead of SFRA and PWA Kit, built on
  React Router 7, React 19, Tailwind CSS, shadcn/ui, and Vite, with a phased
  SFRA-to-Storefront-Next migration path and a PWA-Kit-to-Storefront-Next guide. This
  matches the independent finding already recorded in the sibling
  `sitegenesis-vs-sfra-vs-pwa-refresh-2026-07.md`.

## Link audit

All flagged links were checked live this task:

- `http://partnerlearningcamp.salesforce.com` (line 88) → confirmed a live, active Salesforce
  Partner Learning Camp login page. Upgraded to `https://`; destination unchanged.
- `https://github.com/sfcc-unofficial/docs` ("Unofficial Slack" link, line 88) → confirmed
  still live and current (12,000+ member community, actively maintained docs repo). **Left
  unchanged** — the community has not moved.
- Legacy Pipelines PDF (`salesforcecommercecloud.github.io/.../LegacyDeveloperDocumentation.pdf`,
  line 24) → resolves and returns the actual PDF. Left unchanged.
- SiteGenesis demo link (line 24, `production-sitegenesis-dw.demandware.net/...`) → 301
  redirects to `https://aaia-prd.my.commercecloud.salesforce.com/s/SiteGenesis/homepage?lang=en_US`.
  Updated to the resolved URL directly, matching the identical fix already applied in the
  sibling `sitegenesis-vs-sfra-vs-pwa` refresh.
- Shopify Hydrogen (`hydrogen.shopify.dev`, line 76) → confirmed still an accurate, current
  description of Shopify's headless commerce framework. Left unchanged.
- SAP Composable Storefront help link (line 76) → confirmed still resolves to a live,
  current SAP Commerce Cloud Composable Storefront doc page. Left unchanged.
- "BFRA (Back-End Reference Architecture)" joke (line 102) → confirmed via web search that
  no such product or term exists at Salesforce. Still just a joke; left unchanged.

## Follow-up line-edit pass

A second, narrower pass ran `anti-ai-writing`, `human-prose-editing`, and (for the one section
that actually teaches a technical concept) `beginner-technical-writing` across the full article,
per `post-writing-skills.instructions.md`. This tightened generic or padded sentences outside the
two sections explicitly protected in the original brief — the "inspirational speech" crescendo
(lines 36-38, punchline at line 40) and the "Career Aspirations" closing section, both left
untouched as intentional voice, not scaffolding.

Changes made:

- "Advantages of a monolith": cut a throat-clearing "First and foremost" opener and a redundant
  clause; replaced the cliché close ("simplicity is the key to success") with a sharper verdict
  line.
- "The Composable Storefront uses 'boring' technology": cut a "This is because" throat-clear,
  de-hedged a stacked-qualifier sentence about experimental libraries, and tightened a wordy,
  prepositional-clutter sentence about the training/Slack pitch.
- Fixed a subject-verb agreement slip ("how eCommerce and Salesforce works" → "...work").
- "Other platforms": replaced vague corporate-speak ("recognise the fierce competition...stay
  ahead in innovation and customer satisfaction") and cut a content-free follow-up sentence
  ("complacency is not an option..."), without asserting any unsourced claims about Salesforce's
  competitive strategy.
- "Willingness to learn and evolve": replaced a cliché "constantly evolving technology landscape"
  opener with the more concrete SaaS-release-cadence point already implicit in the sentence; cut
  a textbook "it's important to note that" throat-clear.
- "What about back-end development": applied `beginner-technical-writing` to define "Rhino
  Engine" and "ISML" on first use (this section teaches a technical concept, unlike the rest of
  the opinion piece) and replaced the vague adjective "crucial" with a concrete statement of what
  they do.
- Added "templating" to the spelling allow-list (a standard, widely-used technical term
  introduced by the ISML definition above).

## Impact and verification

- Impacted: one published post; two spelling allow-list additions
  (`scripts/gates/spelling-allow.txt`: "shadcn" for the Storefront Next section, "templating" for
  the ISML definition added in the line-edit pass). `date`, `url`, and `takeaways` untouched.
- Verified with: `npm run validate:frontmatter`, `npm run check:spelling`,
  `npx markdownlint-cli2` on the post, and `npm run build:local`. The Hugo binary is not present
  in this task's execution environment, so the compile step of `build:local` could not be
  exercised end-to-end in either pass — everything ahead of it (frontmatter validation, spelling,
  markdownlint, AVIF cache generation) ran clean.

## Related files

- `src/content/posts/what-does-the-composable-storefront-mean-for-sfcc-developers/index.md`
- `scripts/gates/spelling-allow.txt`
- Cross-linked posts: `in-the-ring-ocapi-versus-scapi`, `creating-custom-ocapi-endpoints`,
  `sitegenesis-vs-sfra-vs-pwa`
