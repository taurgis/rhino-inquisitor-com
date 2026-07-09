# B2C Commerce Cloud certifications article — July 2026 audit and refresh

## Change summary

`src/content/posts/certifications-for-salesforce-b2c-commerce-cloud/index.md` is a 2022 post
mapping the Salesforce B2C Commerce Cloud certification and accreditation landscape. This refresh
follows a different rule than the other campaign audits on this branch (OCAPI endpoints, WebDAV,
SiteGenesis/SFRA/PWA, B2C Commerce Developer cert-prep): where those corrected or removed stale
claims outright, any certification or accreditation confirmed **retired** here is kept in the
article, in a clearly labelled archive section, with a best-evidence explanation of why it likely
went away and a genuine editorial "why it's a shame" passage — the same "clearly labelled archive
section" idea already used for the 2022 OCAPI workaround in the `creating-custom-ocapi-endpoints`
refresh, applied here to a certification instead of a technical workaround.

Every certification/accreditation named in the article was checked against live official Salesforce
sources (Trailhead credentials pages, `help.salesforce.com` exam guides and FAQs, Trailhead Academy,
Partner Learning Camp) via the `salesforce-docs-researcher` subagent and Bonsai. Headline finding:
the article's prime retirement suspect (Headless API First Accredited Professional) is indeed
retired, but the single most consequential, time-sensitive finding was unplanned — the **B2C
Commerce Architect certification is retiring February 1, 2027**, with a **registration cutoff of
July 24, 2026**, roughly two weeks from this audit.

## Certification/accreditation status table

| Item | 2022 claim | 2026 verdict | Evidence | Action taken |
|---|---|---|---|---|
| Superbadges (B2C Commerce Cloud) | Not available, "don't expect this to change anytime soon" | **Still true** | trailhead.salesforce.com/superbadges (no B2C entry found); salesforce.com blog (Sept 2025) confirms the whole superbadge program was restructured into shorter "skill assessments" in 2025, without adding a Commerce entry | Added one sentence noting the 2025 program restructure; core claim unchanged |
| Webassessor (exam platform) | Current testing platform for Salesforce Credentials | **Retired for this purpose** — replaced by Pearson VUE via Trailhead Academy, effective July 21, 2025 | `help.salesforce.com` article 005298846 ("New Salesforce Certification Experience FAQ") | Corrected in place (infrastructure fact, not a certification/accreditation — no archive section needed) |
| B2C Commerce Developer credential | Active, exam guide linked | **Active**, exam guide confirmed current (Spring '23-aligned); credential renames "...Cloud Developer" → "...Developer" (name only) effective July 24, 2026 | `help.salesforce.com` articles 005298941 (exam guide), 005298915 (Certification Name Changes FAQ) — same facts already confirmed in the sibling `preparing-for-the-b2c-commerce-developer-certification` refresh | Added a `[!NOTE]` callout for the rename, matching the sibling article's existing wording pattern |
| B2C Commerce Architect credential | Active, exam guide linked, ARC-300 "which I am teaching" | **Active but retiring** Feb 1, 2027; last day to register **July 24, 2026**; last day to sit the exam Aug 31, 2026; no successor exam named | `help.salesforce.com` articles 005298936 (exam guide, "Upcoming Retirement" banner) and 005360289 (2027 Certification Retirements FAQ) | Added a `[!WARNING]` callout with verbatim dates and the "no successor, only comparable learning content" fact; swapped the exam-guide link from the `trailhead.salesforce.com/help?article=...` redirect to the canonical `help.salesforce.com/s/articleView?id=005298936...` URL it resolves to |
| ARC-300 course | "which I am teaching in EMEA" | **Retired**, sunsetted April 2024 | Live check of trailheadacademy.salesforce.com/classes/arc300-architect-b2c-commerce-solutions returns an empty client-rendered shell (no title, no session data); corroborated by this site's own `the-sunsetting-of-arc300-architect-b2c-commerce-solutions` post, where the author (an ARC-300 instructor) confirms the April 2024 sunset in the first person | Rewrote to past tense, replaced the dead trailheadacademy.salesforce.com link with a cross-link to the site's own sunsetting post |
| Headless API First Accredited Professional | Introduced "last year" (~2021), SCAPI-focused | **Retired** October 7, 2024 | `help.salesforce.com` article 002646692 (Partner Program FAQ) — retired in a same-day batch with 4 other English APs (Einstein Prediction Builder, Salesforce CMS, Salesforce Maps, Security & Privacy); Salesforce's stated reason ("gaps, overlaps, and consumption," "an updated exam will not be built in its place") is generic/collective, not exam-specific | Kept in place as an archived/retired subsection (relabelled heading), original description preserved, plus a "why it was likely retired" passage that states plainly Salesforce gave no exam-specific reason (with the article's own inference clearly labelled as a guess) and a "why it's a shame" editorial passage in the author's voice |
| Commerce Cloud Einstein Accredited Professional | Active | **Active**, not on either retirement list (Oct 2024 batch or Feb 2027 batch); community corroboration (Credly, Partner Community) it's still offered | Absence from `help.salesforce.com` articles 002646692 and 005360289 | No structural change; annotated the PLC course link with a login-required note |

## PLC (Partner Learning Camp) link audit

All three PLC catalog links in the article (Headless API First course, Commerce Cloud Einstein
course, Commerce Cloud Einstein credentials-catalog entry) return HTTP 200 to an empty/blank
client-rendered Experience Cloud shell for an unauthenticated fetch — no visible title, no content,
but also no explicit login form and no 404. This is the same systemic auth-gating behavior already
documented in the sibling `preparing-for-the-b2c-commerce-developer-certification-refresh-2026-07.md`
audit for its own 9 PLC links. Treated the same way: annotated once per link with "(requires a
Salesforce Partner Community login)" rather than treating the blank-shell response as evidence of a
dead link.

## Fact-check notes

- **Superbadges**: no Commerce Cloud superbadge found via the Trailhead superbadge catalog (checked
  plain, filtered by `?products=commercecloud`, and rendered) or via the Sept 24, 2025
  salesforce.com blog post announcing the program's restructure into shorter "skill assessments."
  Absence-of-evidence is reasonably strong here (multiple search angles, no Commerce hit) but the
  catalog itself is a client-rendered filter widget that could not be fully enumerated server-side.
- **Webassessor → Pearson VUE**: confirmed via `help.salesforce.com` article 005298846, which states
  plainly: *"Will my Salesforce exam test-taking experience change? Yes, Salesforce certification
  exams will be delivered through a new platform, Pearson VUE."* Last day to register via Webassessor
  was June 30, 2025; last day to complete a Webassessor exam was July 13, 2025. Applies to both
  Credentials and Accredited Professional exams — both are now on the same Trailhead Academy hub.
  webassessor.com itself now serves only generic Kryterion product marketing with no Salesforce exam
  catalog content.
- **B2C Commerce Architect retirement — verbatim banner** (article 005298936): *"Effective February
  1, 2027, this certification will be retired... Last day to register: July 24, 2026. Last day to
  take the exam: August 31, 2026. Retirement date: February 1, 2027."* The 2027 Certification
  Retirements FAQ (article 005360289) gives no cert-specific reason beyond the generic "align with
  changing industry priorities" framing applied to all 24 retiring certifications, and names no
  successor exam for B2C Commerce Architect specifically — only "comparable learning content"
  (Trailhead, B2C Commerce documentation, CCD102, CCM101).
- **ARC-300**: live fetch (both Bonsai rendered/forced and raw `curl`) of
  trailheadacademy.salesforce.com/classes/arc300-architect-b2c-commerce-solutions returns HTTP 200
  with no `<title>` tag and no session content — consistent with a delisted course whose URL still
  resolves. Corroborated, not solely evidenced, by the site's own first-person account in
  `the-sunsetting-of-arc300-architect-b2c-commerce-solutions/index.md` ("In April 2024, the course
  was sunsetted").
- **Headless API First retirement reasoning — verbatim**: *"We regularly audit our portfolio of
  credentials to pinpoint gaps, overlaps, and consumption... the decision has been made to retire
  these exams on October 7, 2024"* and, on replacements: *"No. Exams are retired due to product
  coverage overlaps with other credentials, product leveling, or retirement. An updated exam will
  not be built in its place."* (article 002646692). Both statements are collective, covering the
  same-day batch of five English APs — the source gives no Headless-API-First-specific reason
  anywhere. The article's own "why it was likely retired" passage states this plainly and offers its
  further reasoning (narrow, transitional-moment accreditation; SCAPI not absorbed into the current
  Developer exam guide, confirmed in the sibling cert-prep refresh) explicitly as inference, not
  fact, per the task's explicit instruction not to dress up a guess as an official reason.
- **Credential validity for retired Headless API First holders**: the source article contains an
  internal inconsistency (one answer says credentials "remain valid until October 7, 2026," a
  separate correction notice says the expiration date was fixed to "Feb 01, 2027" after a processing
  error) — not resolved by the source itself, and not repeated in the blog post since it's a detail
  for existing credential-holders rather than readers of this article.
- **Commerce Cloud Einstein AP**: confirmed active by absence from both official retirement rosters
  (articles 002646692 and 005360289) plus community corroboration (Credly org badge page, Salesforce
  Partner Community "Accredited Professional Exams" article, both still describing it in the present
  tense). No single definitive "current AP catalog" page was found to positively confirm active
  status beyond this — flagged as the one item with slightly lower confidence than the others.

## Old vs new behavior

| Aspect | Old | New |
|---|---|---|
| Superbadges | Claim stated with no freshness context | Claim confirmed unchanged; one sentence added noting the 2025 program-wide restructure |
| Testing platform | "the ones you can achieve via Webassessor" | Corrected to Pearson VUE via Trailhead Academy (July 21, 2025), cited to the official FAQ; noted this also covers Accredited Professional exams |
| B2C Commerce Developer | No name-change context | Added `[!NOTE]` for the July 24, 2026 rename (name only, no content change) |
| B2C Commerce Architect | Presented as an open-ended, always-available credential | Added `[!WARNING]` with verbatim retirement dates and no-successor fact; exam guide link switched to its canonical URL |
| ARC-300 | "which I am teaching in EMEA - a bit of self-promotion" | Past tense, sunsetted April 2024, cross-linked to the site's own sunsetting post instead of the dead course link |
| Headless API First | Presented as a current, biddable accreditation | Archived in place: heading relabelled "Archived: ... (Retired 2024)", original description kept, added a plainly-labelled-as-inference "why retired" passage and a voice-accurate "why it's a shame" passage |
| Commerce Cloud Einstein AP | PLC link with no access context | Annotated "(requires a Salesforce Partner Community login)", matching the sibling article's precedent |
| Closing "gap" plea | Stood alone, unresolved by any later site content | Kept intact (historical record), followed by a short cross-link update acknowledging `non-technical-sfcc-certifications` documented several non-technical options that appeared 2021–2023 |
| Front matter | `lastmod` 2026-07-04T14:20:18.000Z | Bumped to 2026-07-09T15:21:07.000Z. `date`, `url`, `title`, `description`, `takeaways` untouched |

## Impact and verification

- Impacted: one published post only. `date`, `url`, `title`, `description`, and `takeaways`
  untouched.
- Verified with: `npm run validate:frontmatter` (197 files, pass), `npm run check:spelling` (pass, no
  new allow-list entries needed), `npx markdownlint-cli2` on the post (0 errors), `npm run
  build:local` (Hugo build).
- Manually confirmed both new internal cross-links resolve to the correct `url` front matter values:
  `/the-sunsetting-of-arc300-architect-b2c-commerce-solutions/` and
  `/non-technical-sfcc-certifications/`.

## Related files

- `src/content/posts/certifications-for-salesforce-b2c-commerce-cloud/index.md`
- Cross-linked posts: `non-technical-sfcc-certifications`,
  `the-sunsetting-of-arc300-architect-b2c-commerce-solutions`,
  `preparing-for-the-b2c-commerce-developer-certification`
- Precedent docs: `docs/content/ocapi-endpoints-article-refresh-2026-07.md` (archive-section
  pattern), `docs/content/preparing-for-the-b2c-commerce-developer-certification-refresh-2026-07.md`
  (PLC auth-wall precedent, exam-guide fact-check methodology)

## Correction (2026-07-09, same-day follow-up)

While auditing the companion `non-technical-sfcc-certifications` article, live verification turned up
stronger evidence than this refresh had: **Commerce Cloud Einstein Accredited Professional is not on
the current official catalog either**, and the "Active" verdict two sections above is wrong.

- **What changed**: a forced, fresh browser-render fetch of
  `https://trailhead.salesforce.com/credentials/accreditedprofessionaloverview` (not just the cached
  fetch used in the original audit) shows no "Commerce Cloud Einstein" entry, in the exact alphabetical
  slot it should occupy (between "B2B Commerce for Developers" and "Communications Cloud" — both of
  which are present, so this isn't a pagination artifact cutting off the C section). Re-fetching
  `help.salesforce.com` article 002646692 directly confirms neither the English nor Japanese October 7,
  2024 retirement lists name it.
- **Why the original verdict was wrong**: the original audit treated "absent from the named retirement
  batches" as equivalent to "still active." It isn't. Several credentials can be gone from the live
  catalog without ever appearing on an official retirement announcement — which is exactly what
  happened here and to `non-technical-sfcc-certifications`'s Indirect Sales Accredited Professional
  (same absence pattern, same lack of any public retirement notice). The Credly badge pages and
  LinkedIn posts cited as corroboration only show that people earned the credential in the past; they
  say nothing about whether it's still offered today.
- **Action taken**: `src/content/posts/certifications-for-salesforce-b2c-commerce-cloud/index.md` now
  archives this section (`### Archived: Commerce Cloud Einstein Accredited Professional (Retired
  ~2024)`), matching the Headless API First pattern, with the retirement date explicitly flagged as an
  approximate guess rather than a confirmed fact. The closing "What if I'm not a developer" section,
  which had recommended this exact accreditation as the one non-technical profiles could sit, now
  acknowledges that its own recommendation didn't survive either. `lastmod` bumped again to
  `2026-07-09T16:40:30.000Z`.
- **Confidence**: high on "not currently on the live catalog" (two independent live fetches, correct
  alphabetical placement, surrounding entries intact); low on the exact retirement date, which is not
  documented anywhere Salesforce publishes and is stated as such in the article.
