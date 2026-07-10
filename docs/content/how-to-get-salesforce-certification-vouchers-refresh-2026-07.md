# How to get Salesforce certification vouchers — July 2026 audit and refresh

## Change summary

`src/content/posts/how-to-get-salesforce-certification-vouchers/index.md` is a January 2023 survey of
channels for scoring Salesforce certification vouchers and discounts: partner-tier vouchers, community
events, Trailhead Community one-time drops, Partner Community groups, the annual Certification Days
webinars, Trailhead Quests, and Salesforce webinars. This is the most perishable article type in the
ongoing refresh campaign — it names specific dollar amounts, specific one-time community promotions,
and direct permalinks to individual 2022 Chatter posts, all of which are far more time-sensitive than
the certification blueprints and credential names covered in prior refreshes.

Two defects needed fixing on read alone, no research required: every section ended in a bare,
meaningless `- Certifications` / `- Accreditations` bullet pair — the same class of flattened
WordPress-migration artifact already fixed in the sibling `non-technical-sfcc-certifications` article
(there, a collapsed "Trailmix" heading) — and the closing summary image's `alt` text was the entire
article's section outline dumped into an attribute instead of a real description. Beyond that, a live
link audit (via WebFetch/curl, with bot-User-Agent cross-checks for the JavaScript-rendered Trailhead
Community pages) found one confirmed-dead third-party guide, one confirmed-dead official Trailhead
landing page, two 2022 email-notification Chatter permalinks that no longer resolve to their original
content, a Trailhead feed permalink that now resolves to an unrelated newer post, and a Trailhead Quests
programme whose structure has visibly drifted from the "new quest every month" description in the
original article.

## Link audit

| Link (original line) | Status | Action taken |
|---|---|---|
| RelayTo "Certifications vs Accreditations" guide (28) | **Dead — confirmed HTTP 404** via bot-UA fetch (RelayTo's own "Page Not Found" body) | Replaced with `https://www.salesforceben.com/salesforce-accredited-professional-pathways/` (confirmed alive) |
| SalesforceBen "Credentials Exclusively for Salesforce Partners" (30) | Alive | No change |
| Trailhead feed example `0D54S00000H3HLp` (60) | **Effectively dead** — permalink now resolves, via bot-UA, to an unrelated and much newer community post | Dropped the specific link; replaced with a sentence describing the channel's one-time, unpredictable nature |
| "400 free certification vouchers" Chatter permalink (71) | **Login-walled (HTTP 401)** — a one-time email-notification link from a 2022 promotion | Dropped; replaced with prose explaining why these links rot, plus a citation to Salesforce's own vouchers/discounts help article |
| "Free Slack vouchers" Chatter permalink (72) | **Login-walled (HTTP 401)**, same 2022 email-notification pattern | Dropped, same treatment |
| Salesforce vouchers/discounts help article (new) | Alive | Added as the standing reference: `https://help.salesforce.com/s/articleView?id=000391154&language=en_US&type=1` |
| SalesforceBen Cert Days article (79) | Alive, updated April 2025, still cites the $40 discount | Kept |
| Official Trailhead Cert Days page `/en/credentials/cert-days/` (79) | **Dead — confirmed HTTP 404**, and the shorter `/credentials/cert-days` variant is also 404 | Dropped the dead official link; the claim now rests solely on the still-alive SalesforceBen citation |
| Trailhead Quests page (88, 90) | Alive, but **content/structure has drifted**: dated sweepstakes with eligibility/legal text, not a simple monthly cadence with a fixed SWAG-to-voucher ladder | Softened the claim to describe periodic, dated campaigns rather than asserting an unverified fixed cadence |
| Trailhead Community groups listing (58) | Alive | Kept |
| Generic Partner Community Chatter entry link (67) | Login-walled (HTTP 401) | Left as-is — an expected login wall for a partner portal entry point, not a dead link, and distinct from the tokenized one-time permalinks above |

## Decisions made explicitly (per the task's instruction to document, not silently pick)

1. **Bullet-pair applicability calls.** Each flattened `- Certifications` / `- Accreditations` pair was
   restored to a bold-lead-in bullet (`- **Certifications:** ...` / `- **Accreditations:** ...`), matching
   this site's established fix for flattened WordPress artifacts (no table, no emoji — both are against
   this repo's style conventions per `src/content/posts/AGENTS.md`). Six of the seven were a direct read
   of what the surrounding prose already said. The seventh — **Partner Community Certification Events**
   — is a genuine judgment call: the prose never states whether Accredited Professional vouchers turn up
   in these partner-only groups, but the partner-only audience makes it plausible. That section's
   Accreditations line is worded as a hedge ("possible, given the partner-only audience, but not
   confirmed") rather than a flat yes/no, matching the article's own hedging voice elsewhere.
2. **Dropping the tokenized Chatter permalinks rather than searching for live replacements.** Both were
   one-time email-notification links tied to a specific 2022 promotion (`emtm=` timestamps from
   May and February 2022) and are structurally not the kind of link that gets a durable replacement —
   a new promotion doesn't reuse an old link. Rather than substitute a different specific promo (which
   would just be next year's dead link), the section's prose now explains the pattern and points to
   Salesforce's own standing vouchers/discounts help article as the citable, durable source.
3. **Certification Days official link.** No live 1:1 replacement exists for the dead official Trailhead
   landing page — both known URL variants 404. Rather than link to an unverified Trailblazer Community
   group page found only via search (its content couldn't be confirmed live, only its HTTP status), the
   article now cites only the still-alive, still-accurate SalesforceBen article for this claim.
4. **The structural framing question — raised here, not decided.** This entire article is a snapshot of
   "current deals," which is inherently a moving target: several links found in this audit were already
   dead within three years, and the Trailhead Quests programme has visibly changed shape since 2023. The
   task brief for this refresh explicitly asked that this be raised for the site owner rather than
   decided unilaterally: **should this article be reframed permanently as "channels to watch" (durable)
   rather than "today's specific deals" (perishable by design)?** A channels-first framing would age
   better structurally, at the cost of losing some of the concrete specificity (dollar figures, named
   promotions) that makes the current version useful right now. No changes were made to the article's
   core premise in this pass — only currency fixes.

## Fact-check notes

- **RelayTo guide**: a plain `curl` returns HTTP 200 with an empty JavaScript app shell; fetching with a
  bot User-Agent (which triggers RelayTo's server-side pre-render) surfaces the real page, a literal
  "404 - Page Not Found" body. Confirmed dead, not just slow to render.
- **Certification Days $40 discount**: still corroborated by the SalesforceBen article, which itself was
  updated in April 2025 and still cites the $40-off-any-$200-exam voucher as the incentive. The figure in
  the article is accurate as of this refresh; only the dead official Trailhead landing page needed
  removing.
- **Official Cert Days Trailhead page**: both `trailhead.salesforce.com/en/credentials/cert-days/` and
  the shorter `trailhead.salesforce.com/credentials/cert-days` return genuine HTTP 404s. Even
  SalesforceBen's own more recent article links to the shorter variant, which is also dead — third-party
  content hasn't caught up with Salesforce having removed or restructured this standalone landing page.
- **Trailhead Quests structure**: the live page is dominated by sweepstakes eligibility and legal text
  (age/geography restrictions, "no purchase necessary") for named, dated campaigns (e.g. an AI
  Foundations Quest, a Data 360 Trailhead Journey Quest, tiered "Agentblazer" quests), rather than a
  plain description of a monthly SWAG-to-voucher reward ladder. The article's claim was softened rather
  than pinned to a specific current example, since naming today's specific quest names would just create
  the same kind of perishable-link problem this refresh is fixing.
- **Trailhead feed example and both Chatter permalinks**: Trailhead Community group listings and the
  Partner Community are both JavaScript single-page apps; a plain fetch returns only the generic
  navigation shell. Where relevant, a bot User-Agent (which triggers server-side pre-rendering) was used
  to see the actual resolved title/OG tags — this is how the feed permalink was confirmed to now point at
  an unrelated, newer post rather than assumed dead from a shell response alone. The two Chatter group
  permalinks returned a consistent HTTP 401 on every attempt (both WebFetch and curl), confirming they
  require an authenticated Partner Community session and cannot be verified either way — but as one-time
  email-notification links tied to specific 2022 promotions, they were replaced regardless of what's
  behind the login wall.

## Old vs new behavior

| Aspect | Old | New |
|---|---|---|
| Section applicability bullets (7 sections) | Bare `- Certifications` / `- Accreditations` lines conveying no information | Bold-lead-in bullets stating actual applicability, drawn from each section's own prose |
| Certifications-vs-Accreditations guide link | Dead RelayTo interactive guide | Live SalesforceBen "Accredited Professional Pathways" article |
| Trailhead Certification Events example | A specific dead 2022 feed permalink | A sentence describing the channel's one-time, unpredictable nature |
| Partner Community "Some examples" | Two dead/login-walled 2022 Chatter promo permalinks under a `### Some examples` sub-heading | Sub-heading dropped; prose folded into the main paragraph, explaining why these links rot and citing Salesforce's own standing vouchers/discounts help article |
| Certification Days official link | Dead official Trailhead landing page linked alongside a live SalesforceBen article | Dead link removed; claim rests on the live SalesforceBen citation alone |
| Trailhead Quests description | "Unique (or sometimes repeating) rewards... new quests every month" | Described as dated sweepstakes-style campaigns with shifting reward tiers |
| Closing summary image alt text | The entire article's section outline dumped into the `alt` attribute | A concise, real description of the image |
| Front matter | `lastmod` 2026-07-04T17:47:13.000Z | Bumped to 2026-07-10T09:40:56.035Z. `date`, `url`, `title`, `description`, `takeaways` untouched |

## Impact and verification

- Impacted: one published post, `how-to-get-salesforce-certification-vouchers`. `date`, `url`, `title`,
  `description`, and `takeaways` untouched.
- Verified with: `npm run validate:frontmatter` (197 files, passed), `npm run check:spelling` (197 files,
  no issues), `npx markdownlint-cli2 "src/content/posts/how-to-get-salesforce-certification-vouchers/index.md"`
  (0 errors).
- `npm run build:local` could not be run to completion in this session: the sandbox has no `hugo` binary
  preinstalled, and downloading the CI-pinned Hugo Extended 0.163.3 release from GitHub is blocked by this
  environment's network egress policy. Installing the Ubuntu-packaged `hugo` (0.123.7+extended) as a
  fallback fails on an unrelated, pre-existing template incompatibility (`src/layouts/alias.html` uses a
  `Locale` field on `langs.Language` not present in that older Hugo version) — confirmed by reproducing
  the identical failure on a clean stash of this branch with none of this refresh's changes applied. This
  is an environment limitation, not a defect introduced by this refresh; the build gate should be run in
  CI or a session with the pinned Hugo version available.
- Manually confirmed all new/changed links resolve: the SalesforceBen Accredited Professional Pathways
  article, the Salesforce vouchers/discounts help article, and the still-alive SalesforceBen Cert Days
  and Trailhead Quests pages.

## Related files

- `src/content/posts/how-to-get-salesforce-certification-vouchers/index.md`
- Precedent docs: `docs/content/non-technical-sfcc-certifications-refresh-2026-07.md` (flattened-artifact
  fix pattern and companion-doc structure this refresh mirrors)
