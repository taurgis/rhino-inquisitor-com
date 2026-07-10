# Non-technical SFCC certifications article — July 2026 audit and refresh

## Change summary

`src/content/posts/non-technical-sfcc-certifications/index.md` is a 2023 survey of non-developer
Salesforce credentials relevant to B2C Commerce Cloud: User Experience Designer, Strategy Designer,
Business Analyst, Sales Representative, Commerce Cloud Einstein Accredited Professional, and Indirect
Sales Accredited Professional, closing with a wish for a dedicated "Salesforce B2C Commerce
Merchandiser" credential. It follows the same rule as the just-refreshed companion article
(`certifications-for-salesforce-b2c-commerce-cloud`): any certification or accreditation confirmed
**retired** is kept in the record, in a clearly labelled archive section, with a best-evidence
explanation of why it likely went and a genuine editorial "why it's a shame" passage — never deleted
outright.

Every item was checked against live official Salesforce sources (Trailhead credentials pages,
`help.salesforce.com` FAQs and exam guides, the current Accredited Professional catalog) via Bonsai,
plus a targeted web-search cross-check for the two accreditation retirements. Three findings drove
most of the edits: a three-year-old unresolved placeholder in the Sales Representative section, a
double rename of that same credential, and — the most consequential finding — a direct contradiction
with the sibling article's own just-published verdict on Commerce Cloud Einstein Accredited
Professional (see the dedicated section below).

## Certification/accreditation status table

| Item | 2023 claim | 2026 verdict | Evidence | Action taken |
|---|---|---|---|---|
| User Experience Designer | Active | **Active**, unchanged name | `trailhead.salesforce.com/credentials/userexperiencedesigner`; absent from the July 24, 2026 rename batch (`help.salesforce.com` article 005298915) | No change |
| Strategy Designer | Active | **Active**, unchanged name | `trailhead.salesforce.com/credentials/strategydesigner`; also absent from the rename batch | No change |
| Business Analyst | Active; Admin prerequisite removed May 2, 2023 | **Active**; prerequisite removal still accurate, confirmed verbatim on the live exam guide | `help.salesforce.com` articles 005298943 (FAQ) and 005298939 (exam guide, "Prerequisite: None") | Replaced the strikethrough-hack correction with a `[!NOTE]` callout; swapped both dead `click.mail.salesforce.com` tracking links for the permanent FAQ (005298943) and Maintenance Schedule (005298922) URLs |
| Sales Representative | Active; "watch for the upcoming guiding trailmix... I will update this section" | **Renamed twice**, not retired: → "Sales Foundations" (Jul 21, 2025) → scheduled "Agentforce Sales Foundations" (Jul 24, 2026); Foundations tier now requires no maintenance. The promised trailmix never arrived as a distinct resource — only a methodology-focused prep trailmix exists | `help.salesforce.com` articles 005298915 (Name Changes FAQ), 005298922 (Maintenance Schedule); live Trailhead prep trailmix page | Added a `[!NOTE]` with the rename history; resolved the placeholder plainly instead of leaving it open; fixed the flattened "Trailmix" heading artifact |
| Commerce Cloud Einstein Accredited Professional | Active | **Retired**, exact date unconfirmed (~2024) | Absent from the current Accredited Professional catalog (checked twice, including a forced fresh render) and from the named October 7, 2024 retirement batch | Converted to `### Archived: ... (Retired ~2024)`; dropped the tokenized PLC link |
| Indirect Sales Accredited Professional | Active | **Retired**, exact date unconfirmed (~2024) | Same absence pattern as above | Converted to `### Archived: ... (Retired ~2024)`; dropped the tokenized PLC link |
| "B2C Commerce Merchandiser" wish | "Only a dream" | **Still no credential**; Trailhead now has a non-certification module aimed at merchandisers | `trailhead.salesforce.com/content/learn/modules/b2c-page-designer-merchandiser` | Added a short, understated update — the wish stands, closer than in 2023 but not resolved |

## Decisions made explicitly (per the task's instruction to document, not silently pick)

1. **Business Analyst section format.** Converted the strikethrough-hack + flattened "Salesforce Admin
   is no longer required As of May 2, 2023..." line into a `> [!NOTE]` callout, per this site's callout
   convention and the "fix legacy artifacts on touch" rule. This is deliberately **not** the dedicated
   archive-section format — Business Analyst itself is still fully active; only a stale prerequisite
   claim needed correcting, and a callout is the right-sized fix. The original Salesforce announcement
   blockquote is kept intact below the callout (preserved, not deleted), with its two dead tracking
   links replaced by permanent URLs.
2. **Sales Representative rename, not retirement.** Because the credential lineage is unbroken and
   live (renamed twice, still obtainable, now maintenance-free), it does not get the `### Archived:`
   treatment reserved for credentials with no living successor. Instead, the section was updated in
   place: rename history added via callout, the trailmix placeholder resolved honestly (it never
   arrived as promised; the real, narrower prep trailmix is linked instead), and the flattened
   "Trailmix" artifact removed.
3. **Two genuine retirements** (Commerce Cloud Einstein AP, Indirect Sales AP) got full
   `### Archived: <Name> (Retired ~<Year>)` sections under a new shared `## Accredited Professional`
   heading, matching the sibling article's Headless API First structure: original description kept,
   retirement fact stated with the date explicitly flagged as approximate/unconfirmed, a "why did it
   go" paragraph noting Salesforce gives no exam-specific reason, an inference paragraph clearly
   labelled as a guess, and a "why it's a shame" passage naming what each credential let a non-technical
   B2C Commerce person prove that nothing replaces today.
4. **Tokenized PLC `plc__recordId=` links** (three of them) were dropped entirely rather than repaired,
   matching how the sibling article's own archive section avoided tokenized dead links — the surviving
   plain `partnerlearningcamp.salesforce.com/s/learner-dashboard` link and the official Accredited
   Professional catalog link replace them.
5. **The Business Analyst strikethrough section (lines 67–81 in the original) vs. the new dedicated
   archive-section format**: the task flagged this as a judgment call to make and document rather than
   silently pick. Decision: leave it as a `[!NOTE]` callout, not a dedicated archive section, because
   the two patterns solve different problems — archive sections are for credentials that no longer
   exist; this callout is for a single corrected fact about a credential that is still very much active.
   Using the heavier archive-section format here would overstate what changed.

## Commerce Cloud Einstein Accredited Professional — cross-article discrepancy (important)

The sibling article's own July 2026 refresh (`docs/content/certifications-for-salesforce-b2c-commerce-cloud-refresh-2026-07.md`)
had concluded Commerce Cloud Einstein Accredited Professional was **still active**, based on its absence
from Salesforce's named retirement lists plus old Credly badges and LinkedIn posts (evidence it flagged
itself as lower-confidence, since no positive "still on the current catalog" confirmation was found).

Live verification for this task directly contradicted that: a fresh, forced browser-render fetch of
`https://trailhead.salesforce.com/credentials/accreditedprofessionaloverview` shows no "Commerce Cloud
Einstein" entry, sitting in the exact alphabetical gap where it should appear (between "B2B Commerce for
Developers" and "Communications Cloud," both of which are present — ruling out a pagination cutoff).
Re-fetching the named-retirement-batch FAQ (`help.salesforce.com` article 002646692) directly confirms
it names five English exams, none of them this one.

Per user direction, this was resolved by fixing both articles in this task:

- This article archives Commerce Cloud Einstein AP as described above.
- The sibling article's `### Commerce Cloud Einstein` section was converted to
  `### Archived: Commerce Cloud Einstein Accredited Professional (Retired ~2024)`, matching its own
  Headless API First pattern, and its closing "What if I'm not a developer" section — which had
  recommended this exact accreditation as the one non-technical profiles could sit — now acknowledges
  that recommendation didn't survive either.
- The sibling's refresh doc got a dated "Correction" section explaining the reversal and the stronger
  evidence found, rather than silently rewriting its original verdict.
- Sibling article `lastmod` bumped to `2026-07-09T16:40:30.000Z`.

## Fact-check notes

- **Sales Representative rename**: confirmed via the live Trailhead credential page itself (header now
  reads "Certified Sales Foundations") and the official Certification Name Changes FAQ (article
  005298915), which lists the further scheduled rename to "Agentforce Sales Foundations" effective
  July 24, 2026.
- **Sales Representative trailmix**: the live prep trailmix
  (`trailhead.salesforce.com/users/strailhead/trailmixes/prepare-for-your-salesforce-certified-sales-representative-cred`)
  contains only sales-methodology modules (cold calling, sales process basics, emotional intelligence,
  pipeline management) — no distinct "product knowledge" module separate from methodology content. This
  is an absence-of-evidence finding, not a Salesforce statement that the originally-promised trailmix
  was cancelled; the article states the resolution plainly without overclaiming certainty.
- **Business Analyst prerequisite**: confirmed verbatim via `help.salesforce.com` article 005298943
  ("No. Effective May 2, 2023, the Salesforce Certified Platform Administrator certification is no
  longer be required...") and article 005298939 (exam guide, "Prerequisite: None").
- **Commerce Cloud Einstein AP and Indirect Sales AP retirement dates**: neither is documented on any
  official Salesforce page found in this task. The "~2024" used in both archive sections is inferred
  from catalog absence and secondary-source summaries (community posts suggesting roughly mid-2024),
  explicitly flagged in the article as a guess rather than a confirmed date.
- **Merchandiser wish**: current Trailhead credential catalogs still show only B2C Commerce Developer
  and B2C Commerce Architect as formal, exam-based B2C Commerce certifications. A web search first
  surfaced a "D2C Commerce for Merchandisers" module
  (`content/learn/modules/b2b2c-commerce-for-merchandisers`), but a live fetch of that URL returns
  HTTP 404 — the search index is stale, or the module was renamed/removed. The module actually cited
  in the article, `content/learn/modules/b2c-page-designer-merchandiser` ("Configure Page Designer
  pages for your B2C Commerce storefront," Advanced level, Administrator role), was confirmed live via
  direct fetch before being linked. The article notes this non-certification content without
  overstating it as a resolved wish.

## Old vs new behavior

| Aspect | Old | New |
|---|---|---|
| Business Analyst prerequisite correction | Strikethrough paragraphs + a flattened, un-boxed correction line | `[!NOTE]` callout; original Salesforce announcement kept intact with permanent link replacements |
| Sales Representative | Live "watch for the upcoming trailmix... I will update this section" placeholder | Rename history via `[!NOTE]`; placeholder resolved plainly; flattened heading artifact removed |
| Commerce Cloud Einstein AP | Presented as a current, biddable accreditation | Archived in place: heading relabelled, original description kept, retirement fact + inference + "shame" passage added |
| Indirect Sales AP | Presented as a current, biddable accreditation | Archived in place, same structure |
| PLC intro paragraph | "We ran out of Trailhead Certifications, so now we are turning to the Partner Learning Camp..." (present tense) | Replaced with a shared `## Accredited Professional` intro explaining both accreditations are now archived |
| Closing Merchandiser wish | Stood alone, unrevisited | Reconfirmed still accurate, with a short update noting non-certification Trailhead learning content that has since emerged |
| Front matter | `lastmod` 2026-07-04T17:47:13.000Z | Bumped to 2026-07-09T16:39:28.000Z. `date`, `url`, `title`, `description`, `takeaways` untouched |

## Impact and verification

- Impacted: two published posts — `non-technical-sfcc-certifications` (primary) and
  `certifications-for-salesforce-b2c-commerce-cloud` (Einstein AP correction only). `date`, `url`,
  `title`, `description`, and `takeaways` untouched on both.
- Verified with: `npm run validate:frontmatter`, `npm run check:spelling`, `npx markdownlint-cli2` on
  both posts, `npm run build:local`.
- Manually confirmed all new/changed links resolve: the two permanent Business Analyst URLs, the
  Certification Name Changes FAQ, the Maintenance Schedule, the live prep trailmix, the current
  Accredited Professional catalog, and the merchandiser Trailhead module.

## Related files

- `src/content/posts/non-technical-sfcc-certifications/index.md`
- `src/content/posts/certifications-for-salesforce-b2c-commerce-cloud/index.md` (Einstein AP
  correction)
- `docs/content/certifications-for-salesforce-b2c-commerce-cloud-refresh-2026-07.md` (correction
  addendum appended)
- Precedent docs: `docs/content/ocapi-endpoints-article-refresh-2026-07.md` (archive-section pattern
  origin)
