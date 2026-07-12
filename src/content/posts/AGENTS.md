# Writing Style Guide for Posts

Scope: everything under `src/content/posts/**`. This file describes how Thomas Theunen writes, distilled from the 20 most recent published posts (2024–2026) plus the unassisted 2022 posts that define his human baseline. It complements the root `AGENTS.md` and the gates in `.github/instructions/` — it does not replace them.

Two reference points, use both:

- **Target register** — the 2025–2026 posts (`mastering-sitemaps-in-sfcc`, `field-guide-to-custom-caches-in-sfcc`, `a-survival-guide-to-sfcc-platform-limits`, `goodbye-wordpress-rebuilding-this-blog-with-ai`): structure, subject command, front matter discipline.
- **Human baseline** — the untouched 2022 posts (`how-to-setup-oauth-jwt-for-the-ocapi`, `delta-exports-in-salesforce-b2c-commerce-cloud`, `submit-multipart-form-data-to-a-third-party-service-in-sfcc`, `events-and-the-golden-hoodie`, `preparing-for-the-b2c-commerce-developer-certification`): texture, warmth, restraint. When a draft sounds impressive but synthetic, the fix is almost always in this column.

## Required skills

Before substantive prose work, load these repository skills in this order (per `.github/instructions/post-writing-skills.instructions.md`):

1. **`human-prose-editing`** — owns paragraph rhythm, section openings/endings, and voice. Apply its "Thomas Style Cues" and "Paragraph-Level Method" sections, and its Detection Reality warning: predictability (same sentence shape, same scaffold, safe wording) is what makes prose read as generated — never fix that with fake quirks, always with specificity and consequence.
2. **`anti-ai-writing`** — owns sentence-level cleanup once structure is sound. Apply its "Sentence-Level Signals To Remove", "Rewrite Method", and "Quick Pass Checklist" (can the sentence start later? is the verb doing real work? does it name the real thing?).

Both skills state the same rule this guide inherits: the goal is better writing, not disguise. Do not inject mistakes, slang, or fake eccentricity to seem human.

## Commands

Run from the repo root:

- `npm run validate:frontmatter` — front matter schema for all content files
- `npm run check:spelling` — en-GB dictionary gate (also runs as a pre-commit hook)
- `npx markdownlint-cli2 "src/content/posts/<slug>/index.md"` — markdown lint for one post
- `npm run preflight` — the fast gate suite (runs automatically on `git push`)
- `npm run gates:local` — the full deploy gate suite, for risky or structural changes

## The human baseline (2022, written without AI)

What the unassisted voice does — bring these into every draft:

- **Answer first.** A "TLDR; Solution" with full working code can open a how-to, self-aware framing included: "For the people who want a quick solution to their file upload problem without much reading work, here you go!"
- **Refuse scope, once per post.** "There are multiple ways to work around this limit, but we will not be digging into that in this post."
- **Hedge from experience, not from caution.** "In my experience, ISO-8859-1 encoding works best... However, if you encounter unreadable files, experimenting with the encoding settings could help." Real uncertainty is disclosed plainly: "There might be a list of prerequisites somewhere, but I do not know what the list is."
- **Question-driven transitions.** "But how do you configure it in the Business Manager? Let's have a look!" Questions do the work that declarative topic sentences do in generated prose.
- **Sentences start with But, And, So.** "So let's get cracking!" This connective tissue is authentic; do not polish it away.
- **Named humans, credited.** "A big thanks to Yuriy Boev and John Boxall for helping me get to a working example!" Sources get links because "It wouldn't be fair to the authors" otherwise.
- **Micro-confessions with timestamps.** "Only an hour later, I had a working prototype... A few hours later, I found 15 minutes to spare and created a working job step."
- **Reader-as-heckler awareness.** "And before you start commenting that I put everything in a controller, it is just an example."
- **Scare quotes on borrowed jargon.** "'hacky'", "'headless'", "the most 'challenging?' to set up".
- **Abrupt endings are legal.** A post may end on the last practical fact, a warning, or the credits — "In the Info Centre, there are more items to consider." Full stop, post over.
- **Exclamation marks as warmth**, several per post ("Not to worry!", "And click save!"), and at most one emoticon or emoji as a parenthetical wink.
- **Everyday idioms, one-shot and dry**: "peanuts", "a tad more manageable", "have a peek", "grain of salt" — never an epic sustained metaphor ("treacherous gauntlet", "gone supernova" are the AI-era tell).

A useful contrast pair: `salesforce-b2c-commerce-cloud-documentation` and `mail-attachments-in-b2c-commerce-cloud` were later rewritten in the polished register ("This article is not another list of stale links. It is a field manual", "the treacherous gauntlet of platform quotas"). Compare them against the baseline posts to feel the difference — then write closer to the baseline.

## Who is writing

A senior SFCC developer/architect writing for practitioners already on the platform. Never open by defining what Salesforce B2C Commerce Cloud is. Take positions and name the trade-off: "if anyone suggests you start a new project on SiteGenesis in this day and age, you should question their motives." Criticism of Salesforce is a wry observation, not a manifesto: "Even though the notification popup warns you that this is a BETA feature, it has already carried that mark for two years." Nuance arrives as a personal walk-back in parentheses — "(Ok...Ok, I might be a bit too optimistic here...)" — not as blanket hedging.

## Front matter contract

Follow `src/archetypes/posts.md` and this field order: `title`, `description`, `date`, `lastmod`, `url`, `draft`, `heroImage`, `categories`, `tags`, `author`, `takeaways`.

- `title`: Title Case, ≤ ~60 chars, often a `Metaphor: Literal` colon pair ("Field Guide to Custom Caches: Wielding a Double-Edged Sword"). Titles may be shorter than the slug — never change an existing `url` to match a title.
- `description`: folded scalar (`>-`), 120–155 chars, benefit-first ("Learn when custom caches help in SFCC, where they create risk, and how to use them safely...") — never "This post..." or a pasted opening sentence.
- `date`/`lastmod`: quoted ISO 8601 with milliseconds and `Z`.
- `categories`: Title Case, usually `[Salesforce Commerce Cloud, Technical]`. `tags`: lowercase, 2–5 from the existing vocabulary (`sfcc`, `sfra`, `headless`, `composable storefront`, `performance`, ...).
- `takeaways`: exactly 3 double-quoted strings, third-person verb first (Explains, Shows, Warns, Covers, Frames...), no trailing periods. Takeaways live here only — never add a "Key Takeaways" section to the body.

## Openings

Drop the reader into something concrete in sentence one. The register scales with the post:

- Plain second-person setup (the baseline default): "So, you decided to become a Certified B2C Commerce Developer. That is great!"
- Scenario with stakes: "At some point in your Salesforce B2C Commerce Cloud career, you've been handed _The Spreadsheet_. ... Your heart sinks."
- Blunt claim: "Your checkout flow isn't just a conversion funnel; it's a battleground."
- Direct question: "Have you ever found yourself in a deployment-day standoff?"

If the intro needs a roadmap, keep it to one plain sentence ("This guide will walk you through everything you need to know..."), never a triple-infinitive parade ("deconstruct... build... navigate the treacherous gauntlet..."). No "In today's fast-paced digital landscape", no table of contents.

## Voice and rhythm

- Address the reader as "you", often imperatively ("Heed these warnings."). Use "I" for real experience and opinion, "we" for developer solidarity ("Let us open that 'Test' configuration!").
- British English in prose (optimise, colour, licence, defence); code identifiers stay American (`color`).
- Contractions everywhere — but the occasional uncontracted "Let us have a look!" is his cadence; keep it when it appears.
- Paragraphs 1–4 sentences; a single-sentence paragraph marks a turn ("That comfort is now a liability.") or a beat ("But this comes at a price.").
- Long build-up, short verdict: "Wielded carelessly, they will cut you, your application, and your customer's experience to ribbons." → "Use it. Always."
- Metaphor budget: at most one governing metaphor per post, anchored to the technical point — and a dry one-shot idiom usually beats it. `human-prose-editing` says it directly: one rhetorical question or one metaphor can help; repeating them on every page sounds just as synthetic.
- Rhetorical questions as pivots, usually self-answered: "But why is that? Is it because people don't know it exists?"
- Constructions like "not X; it's Y" and named pitfalls in quotes (the "Accidental Override") are signatures — used once or twice per post. Three in a row is a scaffold; `human-prose-editing` flags repeated contrast formulas as a signal to break.
- Humor is dry and self-aware — a pun flagged as a pun, a joke inside a code comment, mock-surprise at his own screenshot ("But? Huh? I see more types listed here than there are Job Steps available!").
- Anchor every claim in something operational: a Business Manager path, a `dw.*` class, a limit with a number, a doc link. If a sentence could appear on any vendor blog, `anti-ai-writing`'s sentence audit applies: rewrite it to name the real thing.

## Body structure

- Headings start at `##` (H1 is the title). Title Case, sometimes `Metaphor: Literal` ("The Watchtower: Monitoring Your Cache's Health") — but plain conversational headings are equally his: "Can I wing it", "What if I fail the exam". Question headings usually omit the question mark.
- Typical flow: hook → concept → mechanics/how-to → use cases or caveats → conclusion. A warnings section with a dramatic name ("The Minefield") suits long deep-dives; short how-tos skip it. One-sentence sections are allowed.
- Length: minimum 800 words of body copy; recent posts land around 1,800–2,400. Reach the minimum with substance (another failure mode, a real example, a caveat from experience) — a padded 2,000 words is worse than a tight 900.
- Default list idiom: bullets or numbered items with a bold lead-in label and colon — `- **The Performance Tax:** The cartridge introduced...`. Repeating `1.` markers for numbered lists is fine.
- Bold for hard rules and stakes ("**non-negotiable**", "DO NOT DO THIS ON THE DAY OF THE GO-LIVE"); bold-italic reserved for the one or two gravest warnings in a post.
- Tables are rare; when used they earn their place and may carry personality (a "Vibe" column). No horizontal rules as separators. No FAQ sections.
- Callouts use GitHub alerts with a bold mini-title: `> [!NOTE]` / `> [!WARNING]` — never invented shortcodes. Short inline "**Note:**" / "**Pro tip:**" paragraphs are also his.
- Cross-link generously to earlier posts with relative paths (`/what-is-oci-omnichannel-inventory/`) and to official Salesforce docs as evidence.
- Never link a live article to a `draft: true` post directly — drafts are not built, so the internal-link gate fails the deploy. Wrap the block in the `when-published` shortcode instead; it stays hidden until the target publishes, then appears automatically: see `docs/publishing/when-published-shortcode.md`. Standard notation, and the target must be the planned post's exact `url` value.

  ```md
  {{< when-published target="/planned-article/" >}}
  > [!NOTE]
  > An update: see [the new post](/planned-article/) for the current answer.
  {{< /when-published >}}
  ```

## Code

Many posts teach mechanisms in prose with inline backticks (`dw.system.CacheMgr`, `Merchant Tools > SEO > Sitemaps`) and no fenced blocks at all — do not pad a post with code it does not need. When code earns its place:

- Fenced with a language tag (`js`, `json`, `xml`, `text`), 10–40 lines, introduced by one short clause ("Here's how you might implement this in a controller:") and explained right after ("In this example, ...").
- Comments teach and carry voice: `// 1. Retrieve the product object...`, `// DO NOT DO THIS`.
- Pair anti-pattern with correct pattern ("Anti-Pattern: Caching the Full API Object" → "Correct Pattern: Caching a Lightweight POJO").

## Images

`img-caption` is the only image shortcode. Alt text describes the image ("A cartoon rhino developer, dressed as a conductor..."); the caption carries the argument, not a description ("Naive real-time inventory checks can overload the very systems they depend on."). Never restate the caption in the paragraph after the figure, and never prefix captions with "Figure 1:" — see the `image-caption-writing` skill (RHI-094).

Name new image files with plain descriptive kebab-case (`migration-ticket-board.jpg`), stored in the post's own folder. The hash suffixes on older filenames (`self-inflicted-dos-f3485c24ab.png`) are WordPress-migration legacy — do not generate new ones.

## Endings

Two authentic shapes, choose by post weight:

- **Deep-dives** close with a flavored heading — `## Conclusion: From Quota-Fearing to Quota-Fluent` — a callback to the opening scenario ("So, the next time that dreaded SEO spreadsheet lands in your inbox... You're welcome."), or a forward imperative.
- **How-tos and shorter posts** may simply stop: on the last practical detail, a warning ("Just don't assume that it is going to be easy!"), or the credits. Do not force a conclusion onto a post that has said what it came to say.

Never a bare "Conclusion" heading, never "In conclusion,/In summary," as the opener, never a bullet recap of the section headings, and no CTAs: no newsletter, comments, socials, "Happy coding!", or author bio.

## Boundaries

**Always:**

- Bump `lastmod` when editing a published post; never touch `date`.
- Fix conversion artifacts in any section you edit (broken bold, flattened callout titles, duplicated captions) — see the legacy-artifacts list below.
- Run the commands above before marking `draft: false`.

**Ask first:**

- Changing a published post's `title` or `description` — both carry SEO weight.
- Adding a category or tag that no other post already uses.
- Rewriting a legacy post wholesale instead of fixing what the current edit touches.
- Anything involving `aliases` or redirects — that work goes through the `seo` skill and owner direction.

**Never:**

- Change `url` on any published post — the URL parity gates treat existing URLs as permanent.
- Anything in the list below.

## Things an imitation gets wrong

Each "never" comes with what to do instead:

- Never hedge with "It is important to note that..." — state the fact, then the consequence (`anti-ai-writing`, throat-clearing).
- Never write "robust/seamless/powerful/comprehensive" praise — name what the feature actually does to storefront, Business Manager, or workflow behaviour (`anti-ai-writing`, empty praise).
- Never inflate importance ("This isn't just an inconvenience; it's a drag on productivity") — say what breaks, or write "Watch out!" and move on.
- Never make every claim absolute ("This discipline is not optional") — the authentic voice hedges from experience ("In my experience... so far").
- Never sustain an epic metaphor across a whole post — one dry idiom or one anchored metaphor, then back to the subject.
- Never sprinkle 🚀✅💡 or normalize the voice into neutral both-sides-ism — put the energy into a verdict sentence and pick a side.
- Never Americanise the prose spelling — en-GB is enforced by the repo dictionary gate.
- Never add a TL;DR box, FAQ, "Key Takeaways" body section, or sign-off — front matter `takeaways` and the ending shapes above do those jobs. (A "TLDR; Solution" section with working code at the top of a how-to is different, and welcome.)
- Never imitate legacy artifacts in older posts: broken `****after****` bold, escaped `1\.` headings, flattened callout titles running into paragraphs, captions duplicated below figures, `[![...](...)](...)` self-linked images. Fix them on touch instead.

## Checks before `draft: false`

Run the `content-quality` gate checklist (alt text, relative links, fenced code languages, `##` start, LF/UTF-8) and keep the description within 120–155 chars. Then run the two skill checklists: `human-prose-editing`'s Editing Checklist on every paragraph (one idea each, varied rhythm, ends on insight) and `anti-ai-writing`'s Quick Pass on any sentence that sounds canned. Finally, read the post aloud once — if it sounds like it is performing rather than explaining, cut back toward the 2022 baseline.
