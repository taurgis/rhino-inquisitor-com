---
title: "Tokens Aren't Free: Picking Models and Keeping Agents Grounded"
description: >-
  Learn how Claude model tiers and grounded MCP/CLI tooling cut wasted tokens
  on SFCC and PWA Kit AI work, with Bonsai, the b2c CLI, and Headroom as
  examples.
date: '2026-07-11T09:00:00.000Z'
lastmod: '2026-07-11T09:00:00.000Z'
url: /tokens-arent-free-picking-models-and-keeping-agents-grounded/
draft: true
heroImage: the-ai-composer-48f0e91bb0.jpeg
categories:
  - AI
  - Salesforce Commerce Cloud
tags:
  - ai
  - sfcc
  - pwa kit
  - developer
author: Thomas Theunen
takeaways:
  - "Maps Claude's Haiku, Sonnet, and Opus tiers onto real SFCC and PWA Kit tasks by cost and judgement required"
  - "Shows how hallucinated SCAPI hooks and PWA Kit signatures cost more in rework tokens than any model upgrade"
  - "Walks through Bonsai, the b2c CLI, and Headroom as the grounding and compression layer that keeps agent spend honest"
---

You ask an agent to add a custom SCAPI endpoint and a matching PWA Kit hook to pull loyalty balance onto the account page. It writes something plausible in thirty seconds: a hook name that sounds right, a `useLoyaltyBalance` signature that sounds right, a response shape that sounds right. None of it exists. You spend the next twenty minutes feeding it error messages, and it apologises and tries again, and again, each round trip re-reading the same files and re-explaining the same context. By the time it lands on something that actually compiles, you have burned ten times the tokens the task should have cost — and the invoice does not care that the first nine attempts were wrong.

That is the part nobody puts in the pricing table. Model choice is one lever on your bill. Whether the agent is grounded in what is actually true about your platform is the other, and it usually matters more.

## The bill is two numbers, not one

Every request has an input cost and an output cost, and they are not the same price. On the current Claude line-up, Haiku 4.5 runs $1 per million input tokens and $5 per million output tokens; Sonnet 5 is $3 in and $15 out (discounted to $2/$10 through the end of August 2026); Opus 4.8 is $5 in and $25 out. Output is always the expensive half, and that's the part people forget: an agent that narrates its reasoning at length, or that emits a full file rewrite instead of a diff, pays the 5x-or-worse rate on every one of those tokens.

Context window compounds this cost, and quietly. Sonnet 5 and Opus 4.8 both carry a 1M-token window; Haiku 4.5 caps at 200K. A long-running SFCC job debugging session that keeps the full log tail in context on every turn does not just risk hitting that ceiling — it re-sends and re-bills the same log content on every single turn until something gets trimmed. Prompt caching is the fix for that repeated cost: a cache read costs roughly a tenth of a normal input token, against a write premium of 1.25x if the cache expires in five minutes, or 2x if it's kept alive for an hour. Cache the cartridge structure and the job log baseline once; pay full price only for what actually changed this turn.

> [!NOTE]
> None of this is Claude-specific in shape. GPT-5-class and Gemini models price input and output separately too, and OpenAI and Google both ship their own version of prompt caching. The tiers differ, the discipline doesn't.

## Not every task deserves your priciest model

The instinct to point every prompt at the strongest model available is expensive and, more often than people expect, worse. A model that reasons harder than a task needs tends to add scope: an abstraction nobody asked for in a scaffold, a refactor stapled onto a one-line fix that didn't need one. Match the tier to the judgement the task actually requires.

- **Haiku 4.5** for the mechanical stuff: scaffolding a new cartridge, renaming a variable across a controller, editing a job-step XML value you already know the shape of. Nothing here needs reasoning depth, and at $1/$5 per million tokens it is cheap enough to run constantly.
- **Sonnet 5** as the default workhorse: writing the actual body of a custom SCAPI endpoint, building the PWA Kit hook and component that consume it, wiring up a new job step's logic. This is where most day-to-day SFCC and storefront work should sit.
- **Opus 4.8** for the calls that are wrong in expensive ways if you get them wrong: should this live behind SFRA or a standalone SCAPI custom API, is a custom object the right shape for this data or should it be a system object extension, why is this job suddenly taking four times as long as last month. Architecture and diagnosis, not typing.

This is not a one-way ratchet, either. A task that turns out to need more judgement than you expected — Haiku producing a scaffold that doesn't match the rest of the cartridge, Sonnet guessing at an architecture question instead of asking — is a signal to move up a tier, not to keep re-prompting the cheaper one and hoping.

{{< img-caption src="the-ai-composer-48f0e91bb0.jpeg" alt="A cartoon rhino developer, dressed as a conductor, leads an orchestra of small robots that use laptops and data interfaces instead of instruments." caption="Model choice sets the tempo. Grounding is the rest of the orchestra, and it decides whether the piece is actually in tune." >}}

## Where the real waste hides

Model tier is the visible cost. The one that actually torches a token budget is an agent that doesn't know what it doesn't know, and SFCC gives it plenty of chances: a `dw.*` class method that sounds plausible but isn't there, a `dw.ocapi.shop.*` hook name invented on the spot (the same extension points power SCAPI and the [now-deprecated](/in-the-ring-ocapi-versus-scapi/) OCAPI), a PWA Kit SDK hook signature guessed from the shape of ten other hooks instead of read from the actual source. None of these fail loudly. They fail as a build error an hour later, or worse, as something that runs and does the wrong thing.

Two more patterns burn tokens without any hallucination at all. An agent that re-discovers the same Business Manager documentation page every session because nothing on disk remembers it was already read. And an agent debugging a backend job that pastes the full, raw log tail into context on every turn — thousands of tokens of timestamp noise, most of it irrelevant to the one `ERROR` line that actually matters.

{{< img-caption src="confident-wrong-answer.png" alt="A cartoon robot assistant smiles while presenting code with a hidden syntax error, next to a rising stack of coins representing climbing token cost." caption="Confidence isn't the same as correctness, and the gap between them is what actually costs tokens." >}}

The fix for all three is the same: ground the agent in the real platform before it writes anything, and stop feeding it more raw context than the task needs.

## Grounding tools, in the order you'd actually reach for them

**[Bonsai](https://bonsai.rhino-inquisitor.com/)** solves the first problem — an agent that answers from training data because the real docs are hard to reach. Salesforce Help and Developer docs are client-rendered, so a generic fetch often returns an empty shell instead of the article you meant to cite. Bonsai ships host-specific site modules for exactly that case, plus a cache: fetch once, get clean Markdown, and every later session reads the same cached page instead of re-scraping it.

Bonsai's own benchmark against a Salesforce B2C Commerce job-step prompt is the sharp version of this: one agent running native web search spent roughly 80,000 tokens and produced no usable answer, while the Bonsai-grounded run cost roughly 74,000 tokens and reached full, cited grounding. Same order of spend, opposite outcome. Mainstream framework docs often don't need this — native search matches Bonsai's depth there for less — but SPA-heavy vendor documentation, which is most of what SFCC and PWA Kit developers live in, is the case where it earns its keep.

**[sfcc-mcp-dev](https://sfcc-mcp-dev.rhino-inquisitor.com/)** was the first answer to the same problem, specifically for SFCC: an MCP (Model Context Protocol) server that puts SFCC and SFRA documentation, cartridge scaffolding, and log analysis straight into the agent's context, zero setup in its documentation-only mode. The manual alternative it replaced is well documented in the project's own numbers: developers losing two to four hours a day to tab-hunting method signatures, copy-pasting from forums, and manually correlating logs. It's mostly been superseded now: the b2c CLI below covers the same ground and more, in one tool instead of a separate read-only layer plus your deployment tooling.

**The [b2c CLI](https://salesforcecommercecloud.github.io/b2c-developer-tooling/cli/)** is that replacement, and it changes the shape of the problem rather than just adding another doc source. `b2c docs` searches and reads Script API references, Developer Center guides, job-step documentation, and XSD schemas directly. That's what lets the agent writing your custom SCAPI endpoint look the real hook signature up instead of guessing it. `b2c scaffold` generates cartridges, controllers, and hooks from templates instead of an agent free-handing boilerplate from memory. `b2c jobs` lets it trigger and monitor the very job it's building, and `b2c custom-apis` lets it check the live status of the endpoint alongside it. And because the same tool both grounds and acts, it ships **Safety Mode** for exactly the situation where you'd want that: `SFCC_SAFETY_LEVEL=NO_DELETE` or `READ_ONLY` env vars that block destructive operations at the HTTP layer, and no command-line flag the agent passes can override that. That's the difference between a docs-only MCP server and a CLI built with agents in mind from the start — you can hand it real authority without handing it an unguarded `DELETE`.

{{< img-caption src="grounding-checkpoint.png" alt="A cartoon robot assistant hands off finished code at a glowing checkpoint gate, with a discarded pile of rejected pages behind the one that failed." caption="Every one of these tools is doing the same job: catching the wrong answer before it turns into a rework loop, not after." >}}

**[Headroom](https://headroomlabs-ai.github.io/headroom/cli/)** sits underneath all of this, and it isn't SFCC-specific at all. It's a general, provider-agnostic context-compression layer that runs as a proxy in front of Claude Code, Codex, Cursor, and others. `headroom proxy` sits between the agent and the model via `ANTHROPIC_BASE_URL`; `headroom wrap claude` launches Claude Code through it directly. What it does with the traffic in between is the point: it compresses tool output, log tails, and file dumps before they reach the model's context, rather than shipping the full raw text on every turn. Point it at that backend job debugging session from earlier and the multi-thousand-token log tail becomes the handful of lines that actually matter: same signal, a fraction of the tokens, every turn instead of just the first one.

> [!WARNING]
> Headroom is a third-party project, not an Anthropic product, and it works by sitting in the request path — treat it the way you'd treat any proxy: know what it's rewriting and verify it against a real session before trusting it on anything sensitive.

## The verdict

Route by task, not by habit. Haiku for the mechanical work, Sonnet for the endpoint and hook code that makes up most of a sprint, Opus for the decisions that are expensive to get wrong. Then spend the engineering effort you'd otherwise put into chasing a cheaper model on the thing that actually moves the bill: grounding the agent in the real platform with Bonsai and the b2c CLI, and compressing what still reaches the model with something like Headroom. A hallucinated hook signature costs you a rework loop no matter which tier wrote it. The gate that stops that from happening is worth more than the tier you picked.

It's the same arrangement I described running [the migration that rebuilt this blog](/goodbye-wordpress-rebuilding-this-blog-with-ai/): the model does the typing, but the guardrails around it are what decide whether that typing was worth paying for.
