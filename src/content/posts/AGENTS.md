# Writing Style Guide for Posts

Scope: everything under `src/content/posts/**`. This file describes how Thomas Theunen writes, distilled from the 20 most recent published posts. It complements the root `AGENTS.md` and the gates in `.github/instructions/` — it does not replace them. Before substantive prose work, load `human-prose-editing` (paragraph flow, voice) and `anti-ai-writing` (sentence cleanup), per `post-writing-skills.instructions.md`.

The target voice is the 2025–2026 posts (`mastering-sitemaps-in-sfcc`, `field-guide-to-custom-caches-in-sfcc`, `a-survival-guide-to-sfcc-platform-limits`, `goodbye-wordpress-rebuilding-this-blog-with-ai`). Older posts contain WordPress-conversion artifacts and blander phrasing — do not imitate those parts.

## Who is writing

A senior SFCC developer/architect writing for practitioners already on the platform. Never open by defining what Salesforce B2C Commerce Cloud is. Take positions and name the trade-off instead of staying neutral: "if anyone suggests you start a new project on SiteGenesis in this day and age, you should question their motives." Nuance arrives as a personal walk-back in parentheses — "(Ok...Ok, I might be a bit too optimistic here...)" — not as blanket hedging.

## Front matter contract

Follow `src/archetypes/posts.md` and this field order: `title`, `description`, `date`, `lastmod`, `url`, `draft`, `heroImage`, `categories`, `tags`, `author`, `takeaways`.

- `title`: Title Case, ≤ ~60 chars, often a `Metaphor: Literal` colon pair ("Field Guide to Custom Caches: Wielding a Double-Edged Sword"). Titles may be shorter than the slug — never change an existing `url` to match a title.
- `description`: folded scalar (`>-`), 120–155 chars, benefit-first ("Learn when custom caches help in SFCC, where they create risk, and how to use them safely...") — never "This post..." or a pasted opening sentence.
- `date`/`lastmod`: quoted ISO 8601 with milliseconds and `Z`.
- `categories`: Title Case, usually `[Salesforce Commerce Cloud, Technical]`. `tags`: lowercase, 2–5 from the existing vocabulary (`sfcc`, `sfra`, `headless`, `composable storefront`, `performance`, ...).
- `takeaways`: exactly 3 double-quoted strings, third-person verb first (Explains, Shows, Warns, Covers, Frames...), no trailing periods. Takeaways live here only — never add a "Key Takeaways" section to the body.

## Openings

Drop the reader into a concrete situation, a blunt claim, or a direct question in sentence one:

- Scenario: "At some point in your Salesforce B2C Commerce Cloud career, you've been handed _The Spreadsheet_. ... Your heart sinks."
- Blunt claim: "Your checkout flow isn't just a conversion funnel; it's a battleground."
- Question: "Have you ever found yourself in a deployment-day standoff?"

Then name the stakes and end the intro with a specific roadmap sentence ("We'll begin by understanding the enemy... Finally, we'll survey the professional mercenaries."). No "In today's fast-paced digital landscape", no bare "Let's dive in!" as the whole roadmap, no table of contents.

## Voice and rhythm

- Address the reader as "you", often imperatively ("Heed these warnings."). Use "I" for real experience and opinion, "we" for developer solidarity ("for us, the architects and developers in the trenches").
- British English in prose (optimise, colour, licence, defence); code identifiers stay American (`color`).
- Contractions everywhere. Paragraphs 1–4 sentences; a single-sentence paragraph marks a turn ("That comfort is now a liability.").
- Long build-up, short verdict: "Wielded carelessly, they will cut you, your application, and your customer's experience to ribbons." → "Use it. Always." / "This number must be **zero**."
- One governing metaphor per post or section, sustained (fortress, expedition, kitchen, city zoning) — not scattered one-off similes.
- Rhetorical questions as pivots, usually self-answered: "Why? Because you're ignoring the most potent weapon in your performance arsenal."
- Signature constructions: "not X; it's Y" reframes; blunt-candor markers ("Let's be brutally honest"); named pitfalls in quotes (the "Accidental Override", the "30-Minute Wait of Despair"); "(The 'What')" parenthetical taxonomy labels.
- Humor is dry and self-aware — a pun flagged as a pun, a joke inside a code comment — never zany. At most one emoji per post as a parenthetical wink (😇), never decorative, never in headings or lists.
- Anchor every claim in something operational: a Business Manager path, a `dw.*` class, a limit with a number, a doc link. If a sentence could appear on any vendor blog, replace it with the concrete SFCC behavior.

## Body structure

- Headings start at `##` (H1 is the title), Title Case, frequently `Metaphor: Literal` ("The Watchtower: Monitoring Your Cache's Health"). Question headings usually omit the question mark.
- Typical flow: hook → concept ("what is X") → mechanics/how-to → use cases or benefits → a dramatically named warnings section ("The Minefield", "The Danger Zone") → conclusion.
- Default list idiom: bullets or numbered items with a bold lead-in label and colon — `- **The Performance Tax:** The cartridge introduced...`. Repeating `1.` markers for numbered lists is fine.
- Bold for hard rules and stakes ("**non-negotiable**", "**LAUNCH BLOCKER**"); bold-italic reserved for the one or two gravest warnings in a post.
- Recurring per-item scaffolds are welcome in list-driven posts (The Limit / The Danger Zone / The Fallout / The Pro Move).
- Tables are rare; when used they earn their place and may carry personality (a "Vibe" column). No horizontal rules as separators. No FAQ sections.
- Callouts use GitHub alerts with a bold mini-title: `> [!NOTE]` / `> [!WARNING]` — never invented shortcodes, never a flattened title running into a paragraph.
- Cross-link generously to earlier posts with relative paths (`/what-is-oci-omnichannel-inventory/`) and to official Salesforce docs as evidence.

## Code

Many posts teach mechanisms in prose with inline backticks (`dw.system.CacheMgr`, `Merchant Tools > SEO > Sitemaps`) and no fenced blocks at all — do not pad a post with code it does not need. When code earns its place:

- Fenced with a language tag (`js`, `json`, `xml`, `text`), 10–40 lines, introduced by one short clause ("Here's how you might implement this in a controller:") and explained right after ("In this example, ...").
- Comments teach and carry voice: `// 1. Retrieve the product object...`, `// DO NOT DO THIS`.
- Pair anti-pattern with correct pattern ("Anti-Pattern: Caching the Full API Object" → "Correct Pattern: Caching a Lightweight POJO").

## Images

`img-caption` is the only image shortcode. Alt text describes the image ("A cartoon rhino developer, dressed as a conductor..."); the caption carries the argument, not a description ("Naive real-time inventory checks can overload the very systems they depend on."). Never restate the caption in the paragraph after the figure, and never prefix captions with "Figure 1:" — see `image-caption-writing` skill (RHI-094).

## Endings

Close with a flavored heading — `## Conclusion: From Quota-Fearing to Quota-Fluent`, "Be the Rhino, Not the Dodo" — or a thematic one with no "Conclusion" at all. Never a bare "Conclusion" heading, never "In conclusion,/In summary," as the opener, never a bullet recap of the section headings. Good closers: a callback to the opening scenario ("So, the next time that dreaded SEO spreadsheet lands in your inbox... You're welcome."), a mindset shift, or a forward imperative ("Now go build something amazing."). No CTAs of any kind: no newsletter, comments, socials, "Happy coding!", or author bio.

## Things an imitation gets wrong

Each "never" comes with what to do instead:

- Never hedge with "It is important to note that..." — state the fact, then the consequence.
- Never write "robust/seamless/powerful/comprehensive" praise — name what the feature actually does to storefront, Business Manager, or workflow behavior.
- Never normalize the voice into neutral both-sides-ism — pick a side and name the trade-off.
- Never sprinkle 🚀✅💡 or exclamation pileups — put the energy into a verdict sentence instead.
- Never Americanise the prose spelling — en-GB is enforced by the repo dictionary gate.
- Never add a TL;DR, FAQ, "Key Takeaways" body section, or sign-off — front matter `takeaways` and a flavored conclusion already do those jobs.
- Never imitate legacy artifacts in older posts: broken `****after****` bold, escaped `1\.` headings, flattened callouts, captions duplicated below figures, `[![...](...)](...)` self-linked images. Fix them on touch instead.

## Checks before `draft: false`

Run the `content-quality` gate checklist (alt text, relative links, fenced code languages, `##` start, LF/UTF-8), keep the description within 120–155 chars, and read the post aloud once — if three neighbouring sentences share a scaffold or the cadence sounds canned, hand it back to `human-prose-editing`.
